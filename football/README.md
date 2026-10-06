# Transition Park — Friday Night Football

Open `park-football.html`, or use Transition Town → Park → Recreation → Sports → Football. The return link opens the existing park sports menu. This feature uses its own modules and changes only the football entry in the existing sports launcher.

## Playing

Choose a school, then practice against the computer or create/join an online room. Both people choose their own school before entering. Share the eight-character room code or use **Copy invite**. The creator starts the match when both players arrive. Two people can play simultaneously on separate devices; each controls one team with ten computer teammates. Additional devices receive a room-full notice. Keep the creator's page open. A missing connection, hidden page, or either player's pause stops the simulation; a lost opponent is never replaced by a computer.

Touch: drag MOVE and hold SPRINT with another finger. SNAP starts a play. A/B/C passes to the labeled receiver; control transfers after the catch. HAND OFF transfers to the running back. SWITCH selects the nearest defender; TACKLE lunges at a nearby carrier. Desktop: arrows/WASD, Shift, Space, 1/2/3, H, E, J, K. The How to play dialog and first-practice guide explain these controls. Sound starts off and needs a user gesture.

The field has 11 players per team, pursuit/blocking, passing trajectories and catches, interceptions with returns, tackles, rushing, first downs, turnovers, touchdowns, safeties, punts and timing-based field goals. Rules are intentionally quick-play: four 90-second live-play quarters, automatic extra points, drives at the 25 after scores, no playable kickoffs, and sudden-death overtime. This is an illustrated browser football game, not a complete high-school officiating simulator. Player numbers are fictional; all schools have the same ability.

## Schools

`teams.json` contains 94 active football programs for 2026–2027, found by intersecting TSSAA's football classification with athletic districts 7/8/9. It covers public and private schools, including Shelby County and Northpoint Christian in Southaven, Mississippi (a TSSAA West-region member). Each entry carries its individual source URL, school name, county, mascot, listed colors and directory primary color. The UI shortens combined boys/girls mascot labels to the first nickname. Uniforms are illustrations rather than copies of official logos or exact uniform designs.

Rebuild with `python tools/football/update-teams.py`. The script retrieves current records for the explicitly configured school year; change that year and the checked date for future seasons. No names or contact information for students or staff are collected.

## Online implementation

Reuses the repository's pinned Supabase client and browser publishable key from `park-sports-config.js`. No schema, database data, policies, subscriptions, or town account settings are changed. Public ephemeral channels use `tt-football-v1:<code>`. Random player identifiers, selected school IDs, game state and inputs are the only room data. The host runs fixed 60 Hz physics; state and inputs broadcast at about 10 Hz, with interpolated guest rendering. Sequenced actions are resent until acknowledged and applied once. Snapshots and movement inputs are validated. Heartbeat loss pauses play. A public room code is an invitation, not a protected student identity or anti-cheat system.

## Verification

- `node tests/football-core.test.mjs`: movement, complete/incomplete passes, interceptions, legal forward passes, first downs, turnover spots, touchdown/PAT, safety, punts, field goals, fourth-quarter and overtime rules, malformed packets, and a whole computer match.
- `node tests/football-browser.test.cjs`: two independent browser contexts using the actual Supabase service; school selection, real guest movement, state/clock synchronization, pause/resume, possession change, third-client rejection, phone portrait/landscape widths, native two-finger touch input, disconnect pause and town integration.
- Browser runner accepts `FOOTBALL_BROWSER`; it uses the environment's configured HTTP proxy when present. Screenshot output goes to `/tmp/football-landscape.png` and `/tmp/football-portrait.png`.

Verified with Chromium desktop and touch emulation. A physical iPhone was not available. WebKit's system dependencies could not be installed in the test environment; native iOS Safari remains an on-device check.
