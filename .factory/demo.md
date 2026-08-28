# Tableclock demo

Open `/demo` or `/?demo=1` for a one-click sandbox. It starts a running four-player Bank with increment game: Maya, Lionel, Priya, and Sora have 15 minutes each and gain 30 seconds after a turn.

Demo state uses the `tableclock-demo` IndexedDB database. Real games use `tableclock-local`; the demo never reads or writes that database. The persistent banner provides **Reset demo** to reseed the sample and **Start for real** to leave it.

The service worker caches the app shell on the first visit, so the demo can be reloaded and used offline. Claim tests enter through `/demo` from a fresh browser context.
