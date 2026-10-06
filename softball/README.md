# Transition Park Softball

Entry: `softball-game.html`, linked by the existing park Softball button. Returning uses `transition-town.html#park` and retains the site's device profile. Basketball, football, town data and balances are not changed.

The field is rendered in Three.js 0.180.0, bundled locally with its MIT license. Players use articulated rounded meshes; the camera shifts from batting to fielding. No external image/model downloads are needed. WebGL2 is required. Touch, pointer and keyboard controls are supported, with scrollable portrait/landscape layouts.

`core.js` owns the simulation and is independent of the browser. A 60 Hz host simulates pitches, timed contact, gravity, ground bounce, ball/fielder collisions, base running and throw arrivals. Exhibition rules: 1, 3 or 7 innings with extras, three outs, four-ball walks, two-strike foul protection, fly catches, forces, tags at the ball holder, home runs and walk-offs. Runners automatically advance one base on contact; players choose extra bases. No steals, bunts, tag-ups or infield-fly rule. The 22-second dead-ball fallback ends an unattended play with runners at their reached bases.

Two-device games use the existing browser-safe Supabase publishable configuration and ephemeral `tt-softball-v2:<random code>` Realtime broadcast/presence rooms. Only transient game state and controls are shared. No database, identity, money, resident or messaging data is sent or changed. Host is authoritative; guest actions are sequenced, retried until acknowledged and deduplicated. Guest swings can use up to 300 ms of visible pitch history. Backgrounding pauses play; peer disconnects stop the simulation. This is casual classroom play, not an anti-cheat competitive service.

Run:

- `node tests/softball-core.test.mjs`
- `NODE_PATH=<playwright node_modules> node tests/softball-browser.test.cjs`

The browser test uses actual Realtime rooms, so it needs connectivity to the configured service. `SOFTBALL_BROWSER` can point to a Chromium executable. Core tests cover role permissions, swing timing, foul protection, walk forces, movement, catches, throws versus runners, fence clearance, walk-offs and extras. Browser checks cover the WebGL field, phone controls, pause, portrait overflow, two-client room connection, remote pitch, fielding controls, shared score and disconnect.
