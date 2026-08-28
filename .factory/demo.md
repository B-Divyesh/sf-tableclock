# Tableclock demo

Open `/demo` or `/?demo=1` for a one-click sandbox. It starts a running four-player Bank with increment game. Maya and Lionel have finished turns, and Priya's turn is running. Each player started with 15 minutes and gains 30 seconds after a turn.

Demo state uses the `tableclock-demo` IndexedDB database. Real games use `tableclock-local`; the demo never reads or writes that database. **Reset demo** reseeds the sample. **Start for real** clears demo storage before returning to the real clock.

Setup links put names and rules after `#preset=`. URL fragments stay in the browser and are not sent in HTTP requests.

The service worker caches the app shell on the first visit, so the demo can be reloaded and used offline. Claim tests enter through `/demo` from a fresh browser context.
