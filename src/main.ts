import './styles.css';
import { activeValues, createGame, DEFAULT_SETTINGS, endTurn, formatTime, initialSetup, makePlayer, pause, PLAYER_COLORS, startOrResume, toggleOut } from './engine';
import { decodePreset, encodePreset } from './presets';
import { readLocal, writeLocal } from './storage';
import { RoomSync } from './sync';
import type { ClockMode, GameState, SavedSetup } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const sync = new RoomSync();
let setup: SavedSetup = initialSetup();
let game: GameState | null = null;
let frame = 0;
let lastPaint = 0;
let nudgedTurn = 0;
let audio: AudioContext | null = null;
let wakeLock: WakeLockSentinel | null = null;
let deferredInstall: Event | null = null;
let toastTimer = 0;

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);

function modeLabel(mode: ClockMode): string {
  return ({ countup: 'Count up', bank: 'Time bank', fischer: 'Bank + increment', fixed: 'Each turn' })[mode];
}

function legalPage(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Tableclock`;
  app.innerHTML = `
    <header class="site-header"><a class="wordmark" href="/" data-nav><span aria-hidden="true">↻</span> Tableclock</a></header>
    <main id="main" class="legal-page">
      <p class="eyebrow">The short version</p>
      <h1>${privacy ? 'Your table stays yours.' : 'Fair play, plain terms.'}</h1>
      ${privacy ? `
        <p>Tableclock has no accounts, advertising, analytics, or tracking. Your player names, preferences, and unfinished clock are stored only in your browser using IndexedDB.</p>
        <h2>Room sync</h2><p>If you choose room sync on a deployment where it is enabled, the current clock state and player names pass ephemerally through the room relay. Rooms are not archived. Use nicknames if you prefer.</p>
        <h2>Your controls</h2><p>You can export a setup as JSON, clear a game from the menu, or remove all Tableclock data by clearing this site's storage in your browser.</p>` : `
        <p>Tableclock is provided free of charge for personal and group use. The software is supplied “as is,” without a promise that a device will keep a background timer awake.</p>
        <h2>Timing responsibly</h2><p>Browser and operating-system limits can delay sound, vibration, or display updates. Do not use Tableclock for safety-critical, legal, sporting, or financial timing.</p>
        <h2>Shared rooms</h2><p>Everyone in a room can control its clock. Share room codes only with people at your table.</p>`}
      <p><a class="text-link" href="/" data-nav>Back to the clock</a></p>
    </main>
    <footer class="site-footer">© 2026 Tableclock · <a href="/privacy" data-nav>Privacy</a> · <a href="/terms" data-nav>Terms</a></footer>`;
}

function renderSetup(message = ''): void {
  stopTicker();
  document.title = 'Tableclock — take turns, not forever';
  const timed = setup.settings.mode !== 'countup';
  app.innerHTML = `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Tableclock home"><span aria-hidden="true">↻</span> Tableclock</a>
      <div class="header-actions"><span class="network-state" data-network>${navigator.onLine ? 'Online' : 'Offline-ready'}</span><button class="quiet-button" data-action="install" hidden>Install app</button></div>
    </header>
    <main id="main" class="setup-page">
      <section class="intro" aria-labelledby="main-title">
        <div class="intro-copy">
          <p class="eyebrow">A turn timer for the whole table</p>
          <h1 id="main-title">Take turns.<br> <em>Not forever.</em></h1>
          <p class="lede">Two to eight players, one clear clock. No account, no scorekeeping, and no signal required.</p>
        </div>
        <figure class="table-print"><picture><source srcset="/assets/table-gathering.avif" type="image/avif"><img src="/assets/table-gathering.webp" width="720" height="480" alt="Five abstract phones arranged around a printed board-game table" fetchpriority="high"></picture><figcaption>One phone or a whole table.</figcaption></figure>
      </section>

      <section class="setup-sheet" aria-labelledby="setup-title">
        <div class="section-heading"><div><p class="step-mark">01</p><h2 id="setup-title">Who’s playing?</h2></div><span>${setup.players.length} / 8</span></div>
        <div class="player-list" data-player-list>${setup.players.map((player, index) => `
          <div class="player-row" data-player-id="${player.id}">
            <span class="player-token" style="--player:${player.color}" aria-hidden="true">${index + 1}</span>
            <label class="sr-only" for="player-${player.id}">Player ${index + 1} name</label>
            <input id="player-${player.id}" maxlength="24" value="${escapeHtml(player.name)}" data-player-name="${player.id}" autocomplete="off">
            <div class="row-actions">
              <button class="icon-button" data-move="up" data-id="${player.id}" aria-label="Move ${escapeHtml(player.name)} earlier" ${index === 0 ? 'disabled' : ''}>↑</button>
              <button class="icon-button" data-move="down" data-id="${player.id}" aria-label="Move ${escapeHtml(player.name)} later" ${index === setup.players.length - 1 ? 'disabled' : ''}>↓</button>
              <button class="icon-button remove" data-remove="${player.id}" aria-label="Remove ${escapeHtml(player.name)}" ${setup.players.length <= 2 ? 'disabled' : ''}>×</button>
            </div>
          </div>`).join('')}</div>
        <button class="paper-button add-player" data-action="add-player" ${setup.players.length >= 8 ? 'disabled' : ''}><span aria-hidden="true">＋</span> Add player</button>

        <div class="rule"></div>
        <div class="section-heading"><div><p class="step-mark">02</p><h2>How should time work?</h2></div></div>
        <fieldset class="mode-grid"><legend class="sr-only">Clock mode</legend>
          ${(['countup', 'bank', 'fischer', 'fixed'] as ClockMode[]).map((mode) => `<label class="mode-card"><input type="radio" name="mode" value="${mode}" ${setup.settings.mode === mode ? 'checked' : ''}><span><strong>${modeLabel(mode)}</strong><small>${({ countup: 'Track time used', bank: 'One budget each', fischer: 'Budget + time back', fixed: 'Fresh limit every turn' })[mode]}</small></span></label>`).join('')}
        </fieldset>
        <div class="time-fields">
          ${timed ? `<label><span>${setup.settings.mode === 'fixed' ? 'Per turn' : 'Starting bank'}</span><span class="field-unit"><input type="number" min="5" max="86400" step="5" value="${setup.settings.durationSec}" data-setting="durationSec" inputmode="numeric"><small>seconds</small></span></label>` : ''}
          ${setup.settings.mode === 'fischer' ? `<label><span>Increment</span><span class="field-unit"><input type="number" min="0" max="3600" value="${setup.settings.incrementSec}" data-setting="incrementSec" inputmode="numeric"><small>seconds</small></span></label>` : ''}
          <label><span>Gentle nudge after</span><span class="field-unit"><input type="number" min="0" max="3600" step="5" value="${setup.settings.nudgeSec}" data-setting="nudgeSec" inputmode="numeric"><small>seconds · 0 off</small></span></label>
        </div>
        <p class="form-message" role="status">${escapeHtml(message)}</p>
        <div class="launch-row">
          <button class="primary-button" data-action="start">Start the clock <span aria-hidden="true">→</span></button>
          <button class="text-button" data-action="share-preset">Share this setup</button>
        </div>
      </section>
      <aside class="offline-note"><span aria-hidden="true">✦</span><p><strong>Made to outlast app stores.</strong><br>Install it once and the clock keeps working without a connection.</p></aside>
      <div class="data-tools"><button class="text-button" data-action="import">Import a setup</button><input class="sr-only" type="file" accept="application/json" data-import-file aria-label="Choose a Tableclock setup file"></div>
    </main>
    ${footer()}
    ${dialogs()}`;
  updateInstallButton();
}

function footer(): string {
  return `<footer class="site-footer"><span>Free, private, and made for the table.</span><span><a href="/privacy" data-nav>Privacy</a> · <a href="/terms" data-nav>Terms</a> · <span>Original AI-assisted print</span></span></footer><div class="toast" role="status" aria-live="polite" data-toast hidden></div>`;
}

function dialogs(): string {
  return `<dialog id="share-dialog"><form method="dialog" class="dialog-sheet"><div class="dialog-head"><div><p class="eyebrow">Preset link</p><h2>Bring this setup back</h2></div><button class="close-button" value="cancel" aria-label="Close">×</button></div><p>Player names and clock rules are encoded in the link. No data is uploaded.</p><label>Share link<input id="share-url" readonly></label><div class="dialog-actions"><button class="primary-button" type="button" data-action="copy-preset">Copy link</button><button class="paper-button" value="cancel">Done</button></div></form></dialog>`;
}

function renderGame(): void {
  if (!game) return;
  document.title = `${game.players[game.activeIndex]?.name ?? 'Clock'}’s turn — Tableclock`;
  const active = game.players[game.activeIndex]!;
  const values = activeValues(game);
  const shown = game.settings.mode === 'countup' ? values.elapsedMs : values.remainingMs;
  app.innerHTML = `
    <header class="game-header">
      <button class="wordmark game-wordmark" data-action="game-menu" aria-haspopup="dialog"><span aria-hidden="true">↻</span> Tableclock <span class="menu-cue">Menu</span></button>
      <p class="turn-meta">Turn ${game.turnNumber} · ${modeLabel(game.settings.mode)}</p>
      <button class="room-pill" data-action="sync-room"><span class="status-dot ${sync.status}"></span>${sync.room || 'Link phones'}</button>
    </header>
    <main id="main" class="game-board" style="--active-color:${active.color}">
      <h1 class="sr-only">Game clock</h1>
      <button class="active-clock" data-action="end-turn" ${game.running ? '' : 'aria-disabled="true"'} aria-label="${game.running ? `End ${escapeHtml(active.name)}’s turn` : `Start ${escapeHtml(active.name)}’s turn`}">
        <span class="turn-label">${game.running ? 'Now playing' : 'Ready for'}</span>
        <strong class="active-name" aria-live="polite">${escapeHtml(active.name)}</strong>
        <span class="clock-time" data-clock>${formatTime(shown, true)}</span>
        <span class="tap-instruction">${game.running ? 'Tap anywhere here to end turn' : 'Press start below'}</span>
      </button>
      <ol class="player-strip" aria-label="Players in turn order">${game.players.map((player, index) => {
        const isActive = index === game!.activeIndex;
        const value = isActive ? shown : game!.settings.mode === 'countup' ? player.elapsedMs : player.remainingMs;
        return `<li class="mini-player ${isActive ? 'is-active' : ''} ${player.out ? 'is-out' : ''}" style="--player:${player.color}" ${isActive ? 'aria-current="true"' : ''}><span class="mini-order">${index + 1}</span><strong>${escapeHtml(player.name)}</strong><span class="mini-time" data-mini="${index}">${formatTime(value)}</span>${player.out ? '<span class="out-label">Out</span>' : ''}</li>`;
      }).join('')}</ol>
    </main>
    <nav class="control-dock" aria-label="Clock controls">
      <button class="dock-button" data-action="reverse"><span aria-hidden="true">⇄</span><span>Reverse</span></button>
      <button class="pause-button" data-action="toggle-run"><span aria-hidden="true">${game.running ? 'Ⅱ' : '▶'}</span><span>${game.running ? 'Pause' : 'Start'}</span></button>
      <button class="dock-button" data-action="game-menu"><span aria-hidden="true">•••</span><span>Options</span></button>
    </nav>
    <div class="toast" role="status" aria-live="polite" data-toast hidden></div>
    ${gameDialogs()}`;
  if (game.running) startTicker();
}

function gameDialogs(): string {
  if (!game) return '';
  const currentGame = game;
  return `<dialog id="game-menu"><div class="dialog-sheet"><div class="dialog-head"><div><p class="eyebrow">Clock options</p><h2>Keep the table moving</h2></div><button class="close-button" data-close aria-label="Close">×</button></div>
    <div class="toggle-list"><label><span><strong>Sound cues</strong><small>Short local tones only</small></span><input type="checkbox" data-game-setting="sound" ${currentGame.settings.sound ? 'checked' : ''}></label><label><span><strong>Vibration</strong><small>If this device allows it</small></span><input type="checkbox" data-game-setting="vibration" ${currentGame.settings.vibration ? 'checked' : ''}></label></div>
    <h3>Player status</h3><div class="out-grid">${currentGame.players.map((p, i) => `<button class="paper-button ${p.out ? 'selected' : ''}" data-out="${i}" ${currentGame.players.filter((x) => !x.out).length <= 2 && !p.out ? 'disabled' : ''}>${escapeHtml(p.name)} · ${p.out ? 'Bring back' : 'Mark out'}</button>`).join('')}</div>
    <div class="dialog-actions stacked"><button class="paper-button" data-action="export">Export setup</button><button class="danger-button" data-action="leave-game">End game and return to setup</button></div>
  </div></dialog>
  <dialog id="sync-dialog"><div class="dialog-sheet"><div class="dialog-head"><div><p class="eyebrow">Optional room</p><h2>Put the clock on every phone</h2></div><button class="close-button" data-close aria-label="Close">×</button></div><p>Enter the same four-letter code on each device. Anyone in the room can end the current turn.</p><label>Room code<input id="room-code" maxlength="4" pattern="[A-Za-z]{4}" autocomplete="off" autocapitalize="characters" value="${sync.room}"></label><p class="sync-message" role="status" data-sync-status>${sync.status === 'error' ? 'Room sync is unavailable here; the local clock is unaffected.' : 'Clock data is ephemeral and is not archived.'}</p><div class="dialog-actions"><button class="primary-button" data-action="join-room">${sync.room ? 'Reconnect' : 'Join room'}</button>${sync.room ? '<button class="paper-button" data-action="leave-room">Leave room</button>' : ''}</div></div></dialog>`;
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4500);
}

function persistSetup(): void { void writeLocal('setup', setup); }
function persistGame(broadcast = true): void {
  if (!game) return;
  void writeLocal('game', game);
  if (broadcast) sync.broadcast(game);
}

function startTicker(): void {
  cancelAnimationFrame(frame);
  const tick = (now: number) => {
    if (!game?.running) return;
    if (now - lastPaint > 90) {
      lastPaint = now;
      const values = activeValues(game);
      const display = game.settings.mode === 'countup' ? values.elapsedMs : values.remainingMs;
      const clock = document.querySelector<HTMLElement>('[data-clock]');
      if (clock) clock.textContent = formatTime(display, true);
      const mini = document.querySelector<HTMLElement>(`[data-mini="${game.activeIndex}"]`);
      if (mini) mini.textContent = formatTime(display);

      const turnElapsed = game.turnStartedAt === null ? 0 : Date.now() - game.turnStartedAt;
      if (game.settings.nudgeSec > 0 && turnElapsed >= game.settings.nudgeSec * 1000 && nudgedTurn !== game.turnNumber) {
        nudgedTurn = game.turnNumber;
        cue('nudge');
        document.querySelector('.active-clock')?.classList.add('nudged');
        showToast(`A gentle nudge for ${game.players[game.activeIndex]?.name}.`);
      }
      if (game.settings.mode !== 'countup' && values.remainingMs <= 0) {
        game = pause(game);
        cue('expired');
        persistGame();
        renderGame();
        showToast(`${game.players[game.activeIndex]?.name} is out of time. Pause and decide together.`);
        return;
      }
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
}

function stopTicker(): void { cancelAnimationFrame(frame); }

function cue(kind: 'turn' | 'nudge' | 'expired'): void {
  if (!game) return;
  if (game.settings.vibration && 'vibrate' in navigator) navigator.vibrate(kind === 'expired' ? [100, 80, 180] : kind === 'nudge' ? [35, 50, 35] : 35);
  if (!game.settings.sound) return;
  try {
    audio ??= new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = kind === 'expired' ? 180 : kind === 'nudge' ? 330 : 520;
    gain.gain.setValueAtTime(0.04, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (kind === 'expired' ? 0.35 : 0.12));
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + (kind === 'expired' ? 0.35 : 0.12));
  } catch { /* Haptics still provide feedback. */ }
}

async function requestWakeLock(): Promise<void> {
  try { wakeLock = await navigator.wakeLock?.request('screen') ?? null; } catch { showToast('Your browser may dim the screen; keep this tab visible.'); }
}

function releaseWakeLock(): void { void wakeLock?.release(); wakeLock = null; }

function updateSetupFromForm(target: HTMLInputElement): void {
  if (target.dataset.playerName) {
    const player = setup.players.find((p) => p.id === target.dataset.playerName);
    if (player) player.name = target.value.slice(0, 24);
  } else if (target.name === 'mode') {
    setup.settings.mode = target.value as ClockMode;
    renderSetup();
  } else if (target.dataset.setting) {
    const key = target.dataset.setting as 'durationSec' | 'incrementSec' | 'nudgeSec';
    setup.settings[key] = Math.max(0, Number(target.value) || 0);
  }
  persistSetup();
}

function validateSetup(): string | null {
  if (setup.players.some((p) => !p.name.trim())) return 'Give every player a name before starting.';
  if (setup.settings.mode !== 'countup' && (setup.settings.durationSec < 5 || setup.settings.durationSec > 86_400)) return 'Choose a starting time between 5 and 86,400 seconds.';
  return null;
}

function handleAction(action: string, button: HTMLElement): void {
  if (action === 'add-player') {
    if (setup.players.length < 8) setup.players.push(makePlayer(`Player ${setup.players.length + 1}`, setup.players.length));
    persistSetup(); renderSetup();
  } else if (action === 'start') {
    const error = validateSetup();
    if (error) { renderSetup(error); return; }
    setup.players.forEach((p, index) => { p.name = p.name.trim(); p.color = PLAYER_COLORS[index]!; });
    game = createGame(setup);
    persistSetup(); persistGame(); renderGame();
  } else if (action === 'toggle-run') {
    if (!game) return;
    game = game.running ? pause(game) : startOrResume(game);
    if (game.running) { void requestWakeLock(); cue('turn'); } else releaseWakeLock();
    persistGame(); renderGame();
  } else if (action === 'end-turn') {
    if (!game?.running) return;
    game = endTurn(game); nudgedTurn = 0; cue('turn'); persistGame(); renderGame();
  } else if (action === 'reverse') {
    if (!game) return;
    game = { ...game, settings: { ...game.settings, direction: game.settings.direction === 1 ? -1 : 1 }, updatedAt: Date.now() };
    persistGame(); renderGame(); showToast(`Turn order is now ${game.settings.direction === 1 ? 'clockwise' : 'reversed'}.`);
  } else if (action === 'game-menu') {
    (document.querySelector('#game-menu') as HTMLDialogElement)?.showModal();
  } else if (action === 'sync-room') {
    (document.querySelector('#sync-dialog') as HTMLDialogElement)?.showModal();
  } else if (action === 'join-room') {
    const input = document.querySelector<HTMLInputElement>('#room-code');
    const room = input?.value.trim().toUpperCase() ?? '';
    if (!/^[A-Z]{4}$/.test(room) || !game) { input?.setCustomValidity('Use exactly four letters.'); input?.reportValidity(); return; }
    input?.setCustomValidity(''); sync.connect(room, game);
  } else if (action === 'leave-room') {
    sync.disconnect(); (document.querySelector('#sync-dialog') as HTMLDialogElement)?.close(); renderGame();
  } else if (action === 'share-preset') {
    const dialog = document.querySelector<HTMLDialogElement>('#share-dialog')!;
    const url = new URL(location.href); url.pathname = '/'; url.search = ''; url.searchParams.set('preset', encodePreset(setup));
    document.querySelector<HTMLInputElement>('#share-url')!.value = url.toString(); dialog.showModal();
  } else if (action === 'copy-preset') {
    const input = document.querySelector<HTMLInputElement>('#share-url')!; input.select();
    void navigator.clipboard.writeText(input.value).then(() => showToast('Preset link copied.')).catch(() => document.execCommand('copy'));
  } else if (action === 'export') {
    const blob = new Blob([JSON.stringify({ product: 'tableclock', exportedAt: new Date().toISOString(), setup }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'tableclock-setup.json'; link.click(); URL.revokeObjectURL(link.href);
  } else if (action === 'import') {
    document.querySelector<HTMLInputElement>('[data-import-file]')?.click();
  } else if (action === 'leave-game') {
    if (confirm('End this clock? The current times will be cleared, but your setup will remain.')) {
      releaseWakeLock(); sync.disconnect(); game = null; void writeLocal('game', null); (document.querySelector('#game-menu') as HTMLDialogElement)?.close(); renderSetup('Clock cleared. Your players and rules are ready for another round.');
    }
  } else if (action === 'install') {
    const prompt = deferredInstall as Event & { prompt?: () => Promise<void> }; void prompt.prompt?.();
  }
}

app.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && (target.dataset.playerName || target.dataset.setting)) updateSetupFromForm(target);
});
app.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.matches('[data-import-file]') && target.files?.[0]) {
    void target.files[0].text().then((text) => {
      try {
        const parsed = JSON.parse(text) as { setup?: unknown } & Partial<SavedSetup>;
        const incoming = (parsed.setup ?? parsed) as Partial<SavedSetup>;
        if (!incoming || incoming.version !== 1 || !Array.isArray(incoming.players) || incoming.players.length < 2 || incoming.players.length > 8 || !incoming.settings) throw new Error('invalid');
        setup = { version: 1, players: incoming.players.map((player, index) => ({ ...makePlayer(String(player.name || `Player ${index + 1}`), index), color: PLAYER_COLORS[index]! })), settings: { ...DEFAULT_SETTINGS, ...incoming.settings } };
        persistSetup(); renderSetup('Setup imported. Review it, then start when everyone is ready.');
      } catch { renderSetup('That file is not a valid Tableclock setup. Choose a JSON file exported by Tableclock.'); }
    });
    return;
  }
  if (target instanceof HTMLInputElement && (target.name === 'mode' || target.dataset.gameSetting)) {
    if (target.dataset.gameSetting && game) { const key = target.dataset.gameSetting as 'sound' | 'vibration'; game.settings[key] = target.checked; game.updatedAt = Date.now(); persistGame(); }
    else updateSetupFromForm(target);
  }
});
app.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const nav = target.closest<HTMLAnchorElement>('[data-nav]');
  if (nav) { event.preventDefault(); history.pushState({}, '', nav.href); route(); return; }
  const actionElement = target.closest<HTMLElement>('[data-action]');
  if (actionElement) { event.preventDefault(); handleAction(actionElement.dataset.action!, actionElement); return; }
  const remove = target.closest<HTMLElement>('[data-remove]');
  if (remove && setup.players.length > 2) { setup.players = setup.players.filter((p) => p.id !== remove.dataset.remove); persistSetup(); renderSetup(); return; }
  const move = target.closest<HTMLElement>('[data-move]');
  if (move) {
    const index = setup.players.findIndex((p) => p.id === move.dataset.id);
    const other = move.dataset.move === 'up' ? index - 1 : index + 1;
    if (index >= 0 && other >= 0 && other < setup.players.length) [setup.players[index], setup.players[other]] = [setup.players[other]!, setup.players[index]!];
    persistSetup(); renderSetup(); document.querySelector<HTMLInputElement>(`[data-player-name="${move.dataset.id}"]`)?.focus(); return;
  }
  const out = target.closest<HTMLElement>('[data-out]');
  if (out && game) { game = toggleOut(game, Number(out.dataset.out)); persistGame(); (document.querySelector('#game-menu') as HTMLDialogElement)?.close(); renderGame(); return; }
  if (target.closest('[data-close]')) (target.closest('dialog') as HTMLDialogElement)?.close();
});

document.addEventListener('keydown', (event) => {
  if (!game || document.querySelector('dialog[open]') || event.target instanceof HTMLInputElement) return;
  if (event.target instanceof HTMLElement && event.target.closest('button, a, select, textarea')) return;
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); handleAction('end-turn', document.body); }
  if (event.key.toLowerCase() === 'p') { event.preventDefault(); handleAction('toggle-run', document.body); }
});

window.addEventListener('popstate', route);
window.addEventListener('online', () => updateNetwork(true));
window.addEventListener('offline', () => updateNetwork(false));
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstall = event; updateInstallButton(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && game?.running) void requestWakeLock(); });

function updateNetwork(online: boolean): void {
  const badge = document.querySelector<HTMLElement>('[data-network]');
  if (badge) badge.textContent = online ? 'Online' : 'Offline-ready';
  if (!online) showToast('You’re offline. The clock and saved setup still work.');
}
function updateInstallButton(): void { const button = document.querySelector<HTMLButtonElement>('[data-action="install"]'); if (button) button.hidden = !deferredInstall; }

sync.onStatus = (status, message) => {
  const statusNode = document.querySelector<HTMLElement>('[data-sync-status]');
  if (statusNode) statusNode.textContent = status === 'connected' ? `Connected to ${sync.room}. Keep this page open.` : message ?? 'Connecting…';
  if (status === 'connected') { window.setTimeout(() => { (document.querySelector('#sync-dialog') as HTMLDialogElement)?.close(); renderGame(); showToast(`Room ${sync.room} connected.`); }, 500); }
};
sync.onState = (incoming) => {
  if (!game || incoming.updatedAt > game.updatedAt) { game = incoming; persistGame(false); renderGame(); showToast('Clock updated by someone in the room.'); }
};

function route(): void {
  if (location.pathname === '/privacy') legalPage('privacy');
  else if (location.pathname === '/terms') legalPage('terms');
  else if (game) renderGame();
  else renderSetup();
}

async function boot(): Promise<void> {
  const savedSetup = await readLocal<SavedSetup>('setup');
  const savedGame = await readLocal<GameState>('game');
  if (savedSetup?.version === 1 && savedSetup.players.length >= 2) setup = savedSetup;
  const presetParam = new URLSearchParams(location.search).get('preset');
  if (presetParam) {
    const preset = decodePreset(presetParam);
    if (preset) {
      setup = { version: 1, players: preset.n.map((name, i) => ({ ...makePlayer(String(name), i), remainingMs: preset.d * 1000 })), settings: { ...DEFAULT_SETTINGS, mode: preset.m, durationSec: preset.d, incrementSec: preset.i, nudgeSec: preset.a } };
      persistSetup(); history.replaceState({}, '', '/');
    }
  } else if (new URLSearchParams(location.search).has('new')) {
    await writeLocal('game', null);
    history.replaceState({}, '', '/');
  } else if (savedGame?.started && savedGame.players.length >= 2) game = savedGame;
  route();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('A fresh version is ready. Reload when this turn is done.'); });
      });
    }).catch(() => undefined);
  }
}

void boot();
