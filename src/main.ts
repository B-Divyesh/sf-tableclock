import './styles.css';
import { activeValues, createGame, DEFAULT_SETTINGS, endTurn, formatTime, initialSetup, makePlayer, pause, PLAYER_COLORS, startOrResume, toggleOut } from './engine';
import { vibrationPattern, type CueKind } from './haptics';
import { decodePreset, encodePreset } from './presets';
import { OUT_LABEL_COLOR, RUNNING_STRIP_COLOR } from './running-colors';
import { movePlayer } from './setup';
import { clearLocal, readLocal, setStorageNamespace, writeLocal } from './storage';
import type { ClockMode, GameState, SavedSetup } from './types';
import { isValidGameState, parseImportedSetup, setupValidationError } from './validation';

const app = document.querySelector<HTMLDivElement>('#app')!;
let setup: SavedSetup = initialSetup();
let game: GameState | null = null;
let frame = 0;
let lastPaint = 0;
let nudgedTurn = 0;
let audio: AudioContext | null = null;
let wakeLock: WakeLockSentinel | null = null;
let deferredInstall: Event | null = null;
let toastTimer = 0;
let isDemo = false;
const focusIntentKey = 'tableclock:focus-on-next-load';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);

function modeLabel(mode: ClockMode): string {
  return ({ countup: 'Count up', bank: 'Time bank', fischer: 'Bank with increment', fixed: 'Per-turn limit' })[mode];
}

function setMeta(name: string, value: string, property = false): void {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) { node = document.createElement('meta'); property ? node.setAttribute('property', name) : node.name = name; document.head.append(node); }
  node.content = value;
}

function setMetadata(title: string, description: string, path = location.pathname): void {
  document.title = title;
  setMeta('description', description);
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical' }));
  canonical.href = new URL(path, location.origin).toString();
  setMeta('og:title', title, true); setMeta('og:description', description, true); setMeta('og:type', 'website', true); setMeta('og:url', canonical.href, true); setMeta('og:image', new URL('/assets/tableclock-social.png', location.origin).toString(), true);
  setMeta('twitter:card', 'summary_large_image'); setMeta('twitter:title', title); setMeta('twitter:description', description); setMeta('twitter:image', new URL('/assets/tableclock-social.png', location.origin).toString());
}

function siteHeader(): string {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-nav aria-label="Tableclock home"><span aria-hidden="true">↻</span> Tableclock</a>
    <nav class="site-nav" aria-label="Main navigation"><a href="/demo" data-nav>Demo</a><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a></nav>
    <div class="header-actions"><span class="network-state" data-network>${navigator.onLine ? 'Online' : 'Offline-ready'}</span><button class="quiet-button" data-action="install" hidden>Install app</button></div>
  </header>`;
}

function gameHeader(): string {
  return `<header class="game-header">
    <a class="wordmark game-wordmark" href="/" data-nav aria-label="Tableclock home"><span aria-hidden="true">↻</span> Tableclock</a>
    <p class="turn-meta">Turn ${game?.turnNumber ?? 1} · ${game ? modeLabel(game.settings.mode) : ''}</p>
    <nav class="game-nav" aria-label="Clock navigation"><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a></nav>
    <p class="sync-unavailable" aria-label="Cross-phone sync is not included in this release"><span aria-hidden="true">↔</span> Sync not included</p>
  </header>`;
}

function demoBanner(): string {
  return isDemo ? `<aside class="demo-banner" aria-label="Demo controls"><span><strong>Demo</strong> — sample data, nothing is saved</span><span><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : '';
}

function legalPage(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  setMetadata(`${privacy ? 'Privacy' : 'Terms'} — Tableclock`, privacy ? 'Learn what Tableclock stores on your device and what it never sends away.' : 'Read the plain terms for using Tableclock at your board-game table.');
  app.innerHTML = `
    ${siteHeader()}
    <main id="main" class="legal-page">
      <p class="eyebrow">The short version</p>
      <h1 tabindex="-1">${privacy ? 'Privacy and local data' : 'Terms for Tableclock'}</h1>
      ${privacy ? `
        <p>Player names, preferences, and unfinished clocks stay in this browser.</p>
        <h2>What leaves this device</h2><p>The app sends no player names, clock settings, or activity to a server.</p>
        <h2>Accounts and tracking</h2><p>Tableclock does not use accounts. It does not use analytics.</p>
        <h2>Cross-phone sync</h2><p>Cross-phone sync is not included in this release.</p>` : `
        <p>The software is supplied “as is,” without a promise that a device will keep a background timer awake.</p>
        <h2>Timing responsibly</h2><p>Browser and operating-system limits can delay sound, vibration, or display updates. Do not use Tableclock for safety-critical, legal, sporting, or financial timing.</p>
        <h2>One shared device</h2><p>Tableclock is designed for one shared device at the table. Cross-phone sync is not included in this release.</p>`}
      <p><a class="text-link" href="/" data-nav>Back to the clock</a></p>
    </main>
    ${footer()}`;
}

function renderSetup(message = ''): void {
  stopTicker();
  setMetadata(isDemo ? 'Demo — Tableclock' : 'Tableclock — turn timer for board-game groups', isDemo ? 'Try a running four-player board-game turn timer with sample data that stays separate from your games.' : 'Time every player’s turn on one shared phone for board-game groups of two to eight players.', isDemo ? '/demo' : '/');
  const timed = setup.settings.mode !== 'countup';
  // The print is deliberately a desktop/tablet detail. Omitting it from the
  // mobile DOM avoids an off-screen image decode on the timer's critical path.
  const showTablePrint = !window.matchMedia('(max-width: 720px)').matches;
  app.innerHTML = `
    ${siteHeader()}
    ${demoBanner()}
    <main id="main" class="setup-page">
      <section class="intro" aria-labelledby="main-title">
        <div class="intro-copy">
          <p class="eyebrow">A turn timer for the whole table</p>
          <h1 id="main-title" tabindex="-1">Time every player’s turn</h1>
          <p class="lede">For board-game groups of two to eight players who want turns to keep moving.</p>
          <div class="hero-actions"><button class="primary-button" data-action="try-demo">Try it with sample data <span aria-hidden="true">→</span></button><a class="text-link setup-link" href="#setup-title">Set up your own clock</a></div>
          <p class="action-note">Loads a four-player game with a running clock.</p>
          <ul class="plain-facts"><li>Free. Works offline after the first visit.</li><li>Player names stay in this browser.</li><li>Runs on one shared phone. Cross-phone sync is not included.</li></ul>
        </div>
        ${showTablePrint ? '<figure class="single-phone-print" aria-label="One shared phone and cardboard turn markers on a board-game table"><span class="print-phone">↻</span><span class="print-marker marker-one">1</span><span class="print-marker marker-two">2</span><span class="print-marker marker-three">3</span><figcaption>Pass one shared phone around the table.</figcaption></figure>' : ''}
      </section>

      <section class="setup-sheet" aria-labelledby="setup-title">
        <div class="section-heading"><div><p class="step-mark">01</p><h2 id="setup-title">Who’s playing?</h2></div><span>${setup.players.length} / 8</span></div>
        <p class="setup-help" id="player-order-help">Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order. Tab moves to the next setup control.</p>
        <div class="player-list" data-player-list>${setup.players.map((player, index) => `
          <div class="player-row" data-player-id="${player.id}">
            <span class="player-token" style="--player:${player.color}" aria-hidden="true">${index + 1}</span>
            <label class="sr-only" for="player-${player.id}">Player ${index + 1} name</label>
            <input id="player-${player.id}" maxlength="24" value="${escapeHtml(player.name)}" data-player-name="${player.id}" aria-describedby="player-order-help" aria-keyshortcuts="ArrowUp ArrowDown" autocomplete="off">
            <div class="row-actions">
              <button class="icon-button" data-move="up" data-id="${player.id}" aria-label="Move ${escapeHtml(player.name)} earlier" ${index === 0 ? 'disabled' : ''}>↑</button>
              <button class="icon-button" data-move="down" data-id="${player.id}" aria-label="Move ${escapeHtml(player.name)} later" ${index === setup.players.length - 1 ? 'disabled' : ''}>↓</button>
              <button class="icon-button remove" data-remove="${player.id}" aria-label="Remove ${escapeHtml(player.name)}" ${setup.players.length <= 2 ? 'disabled' : ''}>×</button>
            </div>
          </div>`).join('')}</div>
        <p class="sr-only" role="status" aria-live="polite" data-reorder-status></p>
        <button class="paper-button add-player" data-action="add-player" ${setup.players.length >= 8 ? 'disabled' : ''}><span aria-hidden="true">＋</span> Add player</button>

        <div class="rule"></div>
        <div class="section-heading"><div><p class="step-mark">02</p><h2>How should time work?</h2></div></div>
        <fieldset class="mode-grid"><legend class="sr-only">Clock mode</legend>
          ${(['countup', 'bank', 'fischer', 'fixed'] as ClockMode[]).map((mode) => `<label class="mode-card"><input type="radio" name="mode" value="${mode}" ${setup.settings.mode === mode ? 'checked' : ''}><span><strong>${modeLabel(mode)}</strong><small>${({ countup: 'Track time used', bank: 'One budget each', fischer: 'Budget with time back', fixed: 'Fresh limit every turn' })[mode]}</small></span></label>`).join('')}
        </fieldset>
        <div class="time-fields">
          ${timed ? `<label><span>${setup.settings.mode === 'fixed' ? 'Per turn' : 'Starting bank'}</span><span class="field-unit"><input type="number" min="5" max="86400" step="5" value="${setup.settings.durationSec}" data-setting="durationSec" inputmode="numeric"><small>seconds</small></span></label>` : ''}
          ${setup.settings.mode === 'fischer' ? `<label><span>Increment</span><span class="field-unit"><input type="number" min="0" max="3600" value="${setup.settings.incrementSec}" data-setting="incrementSec" inputmode="numeric"><small>seconds</small></span></label>` : ''}
          <label><span>Gentle nudge after</span><span class="field-unit"><input type="number" min="0" max="3600" step="5" value="${setup.settings.nudgeSec}" data-setting="nudgeSec" inputmode="numeric"><small>seconds · 0 off</small></span></label>
        </div>
        <p class="form-message" role="status">${escapeHtml(message)}</p>
        <div class="launch-row">
          <button class="primary-button" data-action="start">Start the clock <span aria-hidden="true">→</span></button>
          <button class="text-button" data-action="share-preset">Create a setup link</button>
        </div>
      </section>
      <section class="how-it-works" aria-labelledby="how-title"><p class="step-mark">03</p><h2 id="how-title">Keep turns moving in three steps</h2><ol><li><strong>Name the players.</strong> Put them in turn order.</li><li><strong>Choose a clock.</strong> Pick the timing rule your table uses.</li><li><strong>Tap the active field.</strong> The next player starts.</li></ol></section>
      <section class="limits-note" aria-labelledby="limits-title"><p class="step-mark">Scope</p><h2 id="limits-title">What this timer does not do</h2><p>It does not track scores. It does not connect phones. Everyone uses the same device at the table.</p></section>
      <aside class="offline-note"><span aria-hidden="true">✦</span><p><strong>Install it from this site.</strong><br>The demo keeps working without a connection after your first visit.</p></aside>
      <div class="data-tools"><button class="text-button" data-action="import">Import a setup</button><input class="sr-only" type="file" accept="application/json" data-import-file aria-label="Choose a Tableclock setup file"></div>
    </main>
    ${footer()}
    ${dialogs()}`;
  updateInstallButton();
}

function footer(): string {
  return `<footer class="site-footer"><span>One shared-device turn timer for board-game tables.</span><span><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a><span>Built by Param Factory</span><span>build ${__BUILD_ID__}</span></span></footer><div class="route-announcer sr-only" role="status" aria-live="polite"></div><div class="toast" role="status" aria-live="polite" data-toast hidden></div>`;
}

function dialogs(): string {
  return `<dialog id="share-dialog"><form method="dialog" class="dialog-sheet"><div class="dialog-head"><div><p class="eyebrow">Setup link</p><h2>Reuse this setup</h2></div><button class="close-button" value="cancel" aria-label="Close">×</button></div><p>The link includes player names and clock rules. It is not uploaded.</p><label>Share link<input id="share-url" readonly></label><div class="dialog-actions"><button class="primary-button" type="button" data-action="copy-preset">Copy link</button><button class="paper-button" value="cancel">Close</button></div></form></dialog>`;
}

function renderGame(): void {
  if (!game) return;
  setMetadata(isDemo ? 'Demo — Tableclock' : `${game.players[game.activeIndex]?.name ?? 'Clock'}’s turn — Tableclock`, isDemo ? 'Try a running four-player board-game turn timer with isolated sample data.' : 'A running Tableclock turn timer for one shared board-game table.', isDemo ? '/demo' : '/');
  const active = game.players[game.activeIndex]!;
  const values = activeValues(game);
  const shown = game.settings.mode === 'countup' ? values.elapsedMs : values.remainingMs;
  app.innerHTML = `
    ${gameHeader()}
    ${demoBanner()}
    <main id="main" class="game-board" style="--active-color:${active.color};--running-strip:${RUNNING_STRIP_COLOR};--out-label:${OUT_LABEL_COLOR}">
      <h1 class="sr-only" tabindex="-1">Game clock</h1>
      <button class="active-clock" data-action="end-turn" ${game.running ? '' : 'aria-disabled="true"'} aria-label="${game.running ? `End ${escapeHtml(active.name)}’s turn` : `Start ${escapeHtml(active.name)}’s turn`}">
        <span class="turn-label">${game.running ? 'Now playing' : 'Ready for'}</span>
        <strong class="active-name" aria-live="polite">${escapeHtml(active.name)}</strong>
        <span class="clock-time" data-clock>${formatTime(shown, true)}</span>
        <span class="tap-instruction">${game.running ? 'Tap anywhere here to end turn' : 'Press start below'}</span>
      </button>
      <p class="sr-only" id="player-strip-help">Player order. Use Left and Right Arrow keys to review players that extend beyond the screen.</p>
      <ol class="player-strip" tabindex="0" aria-label="Players in turn order" aria-describedby="player-strip-help">${game.players.map((player, index) => {
        const isActive = index === game!.activeIndex;
        const value = isActive ? shown : game!.settings.mode === 'countup' ? player.elapsedMs : player.remainingMs;
        return `<li class="mini-player ${isActive ? 'is-active' : ''} ${player.out ? 'is-out' : ''}" style="--player:${player.color}" ${isActive ? 'aria-current="true"' : ''}><span class="mini-order">${index + 1}</span><strong>${escapeHtml(player.name)}</strong><span class="mini-time" data-mini="${index}">${formatTime(value)}</span>${player.out ? '<span class="out-label">Out</span>' : ''}</li>`;
      }).join('')}</ol>
    </main>
    <nav class="control-dock" aria-label="Clock controls">
      <button class="dock-button" data-action="reverse"><span aria-hidden="true">⇄</span><span>Reverse</span></button>
      <button class="pause-button" data-action="toggle-run"><span aria-hidden="true">${game.running ? 'Ⅱ' : '▶'}</span><span>${game.running ? 'Pause' : 'Start'}</span></button>
      <button class="dock-button" data-action="game-menu"><span aria-hidden="true">•••</span><span>Open clock options</span></button>
    </nav>
    ${footer()}
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
  `;
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
function persistGame(): void {
  if (!game) return;
  void writeLocal('game', game);
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

function cue(kind: CueKind, pointerActivated = false): void {
  if (!game) return;
  const pattern = vibrationPattern(kind, game.settings.vibration, pointerActivated);
  if (pattern !== null && 'vibrate' in navigator) navigator.vibrate(pattern);
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
    const value = Number(target.value);
    setup.settings[key] = Number.isFinite(value) ? Math.max(0, value) : 0;
  }
  persistSetup();
}

function reorderSetupPlayer(id: string, direction: 'up' | 'down'): boolean {
  const player = setup.players.find((item) => item.id === id);
  if (!player || !movePlayer(setup.players, id, direction)) return false;
  persistSetup();
  renderSetup();
  document.querySelector<HTMLInputElement>(`[data-player-name="${id}"]`)?.focus();
  document.querySelector<HTMLElement>('[data-reorder-status]')!.textContent = `${player.name || 'Player'} moved ${direction === 'up' ? 'earlier' : 'later'} in the turn order.`;
  return true;
}

function validateSetup(): string | null {
  return setupValidationError(setup);
}

function handleAction(action: string, button: HTMLElement, pointerActivated = false): void {
  if (action === 'add-player') {
    if (setup.players.length < 8) setup.players.push(makePlayer(`Player ${setup.players.length + 1}`, setup.players.length));
    persistSetup(); renderSetup();
  } else if (action === 'start') {
    const error = validateSetup();
    if (error) { renderSetup(error); return; }
    setup.players.forEach((p, index) => { p.name = p.name.trim(); p.color = PLAYER_COLORS[index]!; });
    game = createGame(setup);
    persistSetup(); persistGame(); renderGame();
  } else if (action === 'try-demo') {
    navigateWithFocus('/demo');
  } else if (action === 'reset-demo') {
    void resetDemo();
  } else if (action === 'start-real') {
    void leaveDemo();
  } else if (action === 'toggle-run') {
    if (!game) return;
    game = game.running ? pause(game) : startOrResume(game);
    if (game.running) { void requestWakeLock(); cue('turn', pointerActivated); } else releaseWakeLock();
    persistGame(); renderGame();
  } else if (action === 'end-turn') {
    if (!game?.running) return;
    game = endTurn(game); nudgedTurn = 0; cue('turn', pointerActivated); persistGame(); renderGame();
  } else if (action === 'reverse') {
    if (!game) return;
    game = { ...game, settings: { ...game.settings, direction: game.settings.direction === 1 ? -1 : 1 }, updatedAt: Date.now() };
    persistGame(); renderGame(); showToast(`Turn order is now ${game.settings.direction === 1 ? 'clockwise' : 'reversed'}.`);
  } else if (action === 'game-menu') {
    (document.querySelector('#game-menu') as HTMLDialogElement)?.showModal();
  } else if (action === 'share-preset') {
    const dialog = document.querySelector<HTMLDialogElement>('#share-dialog')!;
    const url = new URL(location.href); url.pathname = isDemo ? '/demo' : '/'; url.search = ''; url.hash = new URLSearchParams({ preset: encodePreset(setup) }).toString();
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
      releaseWakeLock(); game = null; void writeLocal('game', null); (document.querySelector('#game-menu') as HTMLDialogElement)?.close(); renderSetup('Clock cleared. Your players and rules are ready for another round.');
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
        const incoming = parseImportedSetup(parsed.setup ?? parsed);
        if (!incoming) throw new Error('invalid');
        setup = incoming;
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
  if (nav) {
    event.preventDefault();
    const targetPath = new URL(nav.href).pathname.replace(/\/$/, '') || '/';
    if ((targetPath === '/demo') !== isDemo && (targetPath === '/' || targetPath === '/demo')) { location.assign(nav.href); return; }
    history.replaceState({ scrollY: window.scrollY }, ''); history.pushState({ scrollY: 0 }, '', nav.href); route(true); return;
  }
  const actionElement = target.closest<HTMLElement>('[data-action]');
  if (actionElement) { event.preventDefault(); handleAction(actionElement.dataset.action!, actionElement, event.detail > 0); return; }
  const remove = target.closest<HTMLElement>('[data-remove]');
  if (remove && setup.players.length > 2) { setup.players = setup.players.filter((p) => p.id !== remove.dataset.remove); persistSetup(); renderSetup(); return; }
  const move = target.closest<HTMLElement>('[data-move]');
  if (move) {
    if (move.dataset.id && (move.dataset.move === 'up' || move.dataset.move === 'down')) reorderSetupPlayer(move.dataset.id, move.dataset.move);
    return;
  }
  const out = target.closest<HTMLElement>('[data-out]');
  if (out && game) { game = toggleOut(game, Number(out.dataset.out)); persistGame(); (document.querySelector('#game-menu') as HTMLDialogElement)?.close(); renderGame(); return; }
  if (target.closest('[data-close]')) (target.closest('dialog') as HTMLDialogElement)?.close();
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.matches('.player-strip') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    target.scrollBy({ left: event.key === 'ArrowLeft' ? -120 : 120, behavior: 'auto' });
    event.preventDefault();
    return;
  }
  if (target instanceof HTMLInputElement && target.dataset.playerName && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    const direction = event.key === 'ArrowUp' ? 'up' : 'down';
    if (reorderSetupPlayer(target.dataset.playerName, direction)) event.preventDefault();
    return;
  }
  if (!game || document.querySelector('dialog[open]') || event.target instanceof HTMLInputElement) return;
  if (event.target instanceof HTMLElement && event.target.closest('button, a, select, textarea')) return;
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); handleAction('end-turn', document.body); }
  if (event.key.toLowerCase() === 'p') { event.preventDefault(); handleAction('toggle-run', document.body); }
});

window.addEventListener('popstate', () => route(true));
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

function renderNotFound(): void {
  setMetadata('Page not found — Tableclock', 'This Tableclock page does not exist. Return to the turn timer.');
  app.innerHTML = `${siteHeader()}<main id="main" class="legal-page not-found"><p class="eyebrow">404</p><h1 tabindex="-1">This table has no page</h1><p>The link may be old or misspelled. Return to your turn timer.</p><p><a class="primary-link" href="/" data-nav>Return to Tableclock</a></p></main>${footer()}`;
}

function navigateWithFocus(url: string): void {
  try { sessionStorage.setItem(focusIntentKey, 'true'); } catch { /* Focus restoration is progressive enhancement. */ }
  location.assign(url);
}

function consumeFocusIntent(): boolean {
  try {
    const requested = sessionStorage.getItem(focusIntentKey) === 'true';
    sessionStorage.removeItem(focusIntentKey);
    return requested;
  } catch { return false; }
}

function route(announce = false): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/privacy') legalPage('privacy');
  else if (path === '/terms') legalPage('terms');
  else if (path === '/' || path === '/demo') {
    if (game) renderGame(); else renderSetup();
  } else renderNotFound();
  if (announce) {
    window.scrollTo({ top: history.state?.scrollY ?? 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      heading?.focus({ preventScroll: true });
      const announcer = document.querySelector<HTMLElement>('.route-announcer');
      if (announcer && heading) announcer.textContent = heading.textContent ?? '';
    });
  }
}

function demoSetup(): SavedSetup {
  const names = ['Maya', 'Lionel', 'Priya', 'Sora'];
  return { version: 1, players: names.map((name, index) => makePlayer(name, index)), settings: { ...DEFAULT_SETTINGS, mode: 'fischer', durationSec: 900, incrementSec: 30, nudgeSec: 75 } };
}

function demoGame(sample: SavedSetup, now = Date.now()): GameState {
  // Two completed turns make the sample feel like a game already in progress.
  let seeded = startOrResume(createGame(sample, now - 80_000), now - 80_000);
  seeded = endTurn(seeded, now - 49_000);
  seeded = endTurn(seeded, now - 21_000);
  return seeded;
}

async function resetDemo(): Promise<void> {
  if (!isDemo) return;
  await clearLocal();
  setup = demoSetup();
  game = demoGame(setup);
  await Promise.all([writeLocal('setup', setup), writeLocal('game', game)]);
  renderGame(); showToast('Fresh sample game loaded.');
}

async function leaveDemo(): Promise<void> {
  if (isDemo) await clearLocal();
  navigateWithFocus('/');
}

async function boot(): Promise<void> {
  isDemo = location.pathname.replace(/\/$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
  setStorageNamespace(isDemo ? 'demo' : 'real');
  const savedSetup = await readLocal<SavedSetup>('setup');
  const savedGame = await readLocal<GameState>('game');
  const validSavedSetup = parseImportedSetup(savedSetup);
  if (validSavedSetup) setup = validSavedSetup;
  const presetParam = new URLSearchParams(location.hash.slice(1)).get('preset') ?? new URLSearchParams(location.search).get('preset');
  let presetApplied = false;
  if (presetParam) {
    const preset = decodePreset(presetParam);
    if (preset) {
      presetApplied = true;
      setup = { version: 1, players: preset.n.map((name, i) => ({ ...makePlayer(String(name), i), remainingMs: preset.d * 1000 })), settings: { ...DEFAULT_SETTINGS, mode: preset.m, durationSec: preset.d, incrementSec: preset.i, nudgeSec: preset.a } };
      game = null;
      await writeLocal('setup', setup);
      await writeLocal('game', null);
      history.replaceState({}, '', isDemo ? '/demo' : '/');
    }
  } else if (new URLSearchParams(location.search).has('new')) {
    await writeLocal('game', null);
    history.replaceState({}, '', '/');
  } else if (isValidGameState(savedGame)) game = savedGame;
  if (isDemo && !presetApplied && (!validSavedSetup || !isValidGameState(savedGame))) {
    setup = demoSetup();
    game = demoGame(setup);
    await Promise.all([writeLocal('setup', setup), writeLocal('game', game)]);
  }
  route(consumeFocusIntent());
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
