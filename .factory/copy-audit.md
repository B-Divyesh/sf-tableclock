# Copy audit — polish round 1

Counts treat hyphenated terms and contractions as one word. No sentence exceeds 22 words. The landing page, its timer state, dialogs, errors, and README contain none of the banned marketing words.

## Landing and setup copy

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to timer | 3 | clear action |
| Tableclock | 1 | product name |
| Demo / Privacy / Terms | 1 each | clear navigation |
| Online / Offline-ready | 1 each | clear state |
| Install app | 2 | clear action |
| A turn timer for the whole table | 7 | names the job |
| Time every player’s turn | 4 | verb-first headline |
| For board-game groups of two to eight players who want turns to keep moving. | 14 | pass |
| Try it with sample data | 5 | clear action |
| Set up your own clock | 5 | clear action |
| Loads a four-player game with a running clock. | 8 | `demo-seed` claim |
| Free. | 1 | `free-use` claim |
| Works offline after the first visit. | 6 | `offline-reload` claim |
| Player names stay in this browser. | 6 | `local-storage` claim |
| Runs on one shared phone. | 5 | `one-shared-device` claim |
| Cross-phone sync is not included. | 5 | `no-cross-phone` claim |
| Pass one shared phone around the table. | 7 | pass |
| Who’s playing? | 2 | clear heading |
| Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order. | 19 | pass |
| Tab still moves through every control. | 6 | `keyboard-reorder` claim |
| Player [number] name | 3 | bound label |
| Move [player] earlier / Move [player] later | 3 each | result-naming actions |
| Remove [player] / Add player | 2 each | result-naming actions |
| How should time work? | 4 | clear heading |
| Clock mode | 2 | clear group label |
| Count up — Track time used | 6 | `mode-count-up` claim |
| Time bank — One budget each | 6 | `mode-time-bank` claim |
| Bank with increment — Budget with time back | 8 | `mode-increment` claim |
| Per-turn limit — Fresh limit every turn | 7 | `mode-per-turn` claim |
| Starting bank / Per turn / Increment / Gentle nudge after | 1–3 | clear labels |
| seconds / seconds · 0 off | 1–3 | units and off state |
| Start the clock | 3 | clear action |
| Create a setup link | 4 | clear result |
| Keep turns moving in three steps | 6 | clear heading |
| Name the players. | 3 | pass |
| Put them in turn order. | 5 | pass |
| Choose a clock. | 3 | pass |
| Pick the timing rule your table uses. | 7 | pass |
| Tap the active field. | 4 | pass |
| The next player starts. | 4 | `turn-flow` claim |
| What this timer does not do | 6 | clear scope heading |
| It does not track scores. | 5 | `no-scorekeeping` claim |
| It does not connect phones. | 5 | `no-cross-phone` claim |
| Everyone uses the same device at the table. | 8 | `one-shared-device` claim |
| Install it from this site. | 5 | `pwa-install` claim |
| The demo keeps working without a connection after your first visit. | 11 | `offline-reload` claim |
| Import a setup | 3 | clear action |
| One shared-device turn timer for board-game tables. | 7 | precise footer line |
| Built by Param Factory | 4 | attribution |
| build [identifier] | 2 | version label |

## Demo, timer, dialog, and error copy

| Copy | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | `demo-isolation` and `demo-exit` evidence |
| Reset demo / Start for real | 2 / 3 | clear actions |
| Game clock | 2 | accessible page heading |
| Now playing / Ready for | 2 each | clear state |
| Tap anywhere here to end turn / Press start below | 6 / 3 | clear next step |
| Player order. | 2 | pass |
| Use Left and Right Arrow keys to review players that extend beyond the screen. | 14 | pass |
| Reverse / Pause / Start / Options | 1 each | clear clock actions |
| Sync not included | 3 | `no-cross-phone` claim |
| Sound cues — Short local tones only | 6 | `local-sound` claim |
| Vibration — If this device allows it | 6 | `turn-vibration` claim |
| Player status | 2 | clear heading |
| [Player] · Mark out / [Player] · Bring back | 3 each | `player-status` claim |
| Export setup | 2 | `setup-export` claim |
| End game and return to setup | 6 | clear destructive action |
| End this clock? | 3 | specific confirmation |
| The current times will be cleared, but your setup will remain. | 11 | explains effect |
| Reuse this setup | 3 | clear heading |
| The link includes player names and clock rules. | 8 | `setup-link-roundtrip` claim |
| It is not uploaded. | 4 | `setup-link-local` claim |
| Share link / Copy link / Close | 1–2 | clear labels and actions |
| Use two to eight player names, each up to 24 characters. | 11 | actionable error |
| Choose a valid clock mode. | 5 | actionable error |
| Choose a whole-number starting time between 5 and 86,400 seconds. | 10 | actionable error |
| Choose a whole-number increment between 0 and 3,600 seconds. | 10 | actionable error |
| Choose a whole-number nudge between 0 and 3,600 seconds. | 10 | actionable error |
| Setup imported. | 2 | immediate feedback |
| Review it, then start when everyone is ready. | 8 | next step |
| That file is not a valid Tableclock setup. | 8 | specific error |
| Choose a JSON file exported by Tableclock. | 7 | recovery step |
| Clock cleared. | 2 | immediate feedback |
| Your players and rules are ready for another round. | 9 | next step |
| Fresh sample game loaded. | 4 | immediate feedback |
| Turn order is now clockwise / reversed. | 7 | immediate feedback |
| [Player] is out of time. | 5 | specific state |
| Pause and decide together. | 4 | recovery step |
| You’re offline. | 2 | specific state |
| The clock and saved setup still work. | 7 | `offline-reload` claim |
| Your browser may dim the screen; keep this tab visible. | 10 | recovery step |
| A fresh version is ready. | 5 | update state |
| Reload when this turn is done. | 6 | next step |

## Legal and 404 copy

All legal and error-page sentences are 21 words or fewer. They use the same terms as the product: player, turn timer, setup, and shared device. The longest sentence is the 20-word safety warning under “Timing responsibly.” The 404 headline is “This table has no page,” followed by the action “Return to Tableclock.”

## README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Tableclock is a turn timer for two to eight players around a board-game table. | 14 | pass |
| Everyone uses one shared phone. | 5 | `one-shared-device` claim |
| Try it with sample data. | 5 | clear action |
| The isolated demo starts a running four-player game. | 8 | `demo-seed` claim |
| It cannot read or change real games. | 7 | `demo-isolation` claim |
| Choose Count up, Time bank, Bank with increment, or Per-turn limit. | 11 | four mode claims |
| Tap the active field to start the next player’s turn. | 10 | `turn-flow` claim |
| Tableclock does not track scores. | 5 | `no-scorekeeping` claim |
| It does not connect phones. | 5 | `no-cross-phone` claim |
| Development requires Node.js 20 or newer. | 6 | repository support fact |
| The development server prints a local URL. | 7 | repository instruction |
| The static output is `dist/`, with `dist/index.html` at its root. | 11 | build output verified by `npm run build` |
| Run each visitor-facing claim from a clean browser context with the commands in `.factory/claims.json`. | 14 | verification instruction |
| The browser suite includes keyboard, mobile, route, accessibility, privacy, and offline checks. | 11 | suite contents |
| In setup, focus a player’s name. | 6 | pass |
| Press Arrow Up or Arrow Down to move that player. | 10 | `keyboard-reorder` claim |
| Focus stays on the moved field. | 6 | `keyboard-reorder` claim |
| The adjacent buttons perform the same moves. | 7 | `keyboard-reorder` claim |
| Player names, preferences, and unfinished clocks stay in this browser. | 9 | `local-storage` claim |
| The app sends no game data to another origin. | 9 | `same-origin` claim |
| Export a setup file, import it later, or create a setup link. | 11 | export, import, and link claims |
| Setup links keep names and rules in the URL fragment, which browsers do not send to the server. | 17 | link round-trip and privacy claims |
| Publish `dist/` to the static work-order target. | 7 | deployment instruction |
| The included host configuration sets cache, route, 404, MIME, and security-header policies. | 11 | static configuration test |
| Licensed under the MIT License. | 5 | backed by `LICENSE` |

## Terminology

| Concept | One term used |
| --- | --- |
| Participant | player |
| Product | turn timer |
| Saved configuration | setup |
| Mode 1 | Count up |
| Mode 2 | Time bank |
| Mode 3 | Bank with increment |
| Mode 4 | Per-turn limit |
| Leaving a turn | end turn |
| Temporarily excluded player | out |
