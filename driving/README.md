# Transition Town — Phase 1 playable driver training

Entry: `driving-simulator-game.html`. The existing Town Directory adds one Driver Training link and keeps its `need()` profile guard. Return carries the active resident back to `transition-town.html`. Existing pages, code/login systems, world balances, licensing fields, and games are preserved.

## Route and play

Training lot → Town Avenue → stop/crosswalk → right onto the cross street → Grocery Store parking bay. The passenger car begins stopped in Park with its engine off. Hold brake to start/shift. Use the wheel and pedals to reverse, steer and drive. The map shows the route and bay. Park within the green bay, facing the Grocery Store, stop and select P to complete. Pause offers an evaluation of a partial drive; a completed drive opens its evaluation automatically.

Touch: drag wheel horizontally; hold brake; accelerator position controls power (lower on pedal = more power). Hold mirrors or Look behind for at least 0.35 seconds for an observation. Keyboard: arrows steer/accelerate/brake; B belt; Enter engine; P/R/N/D gears; Q/E signals; hold 1/2/3 left/rear/right views, 4 rear shoulder; Space pause.

## Architecture

- `core.js`: DOM-independent fixed-step bicycle model in metres/seconds, acceleration/drag/braking, reverse, steering response, stopped/brake gear interlocks, footprint road boundaries, traffic/pedestrian contacts, route progression and event assessment.
- `render.js`: dependency-free Canvas perspective projection with near-plane clipping, road geometry/markings, textured building faces, traffic, pedestrian, signs, trees and separate cameras for mirrors. Capped rendering resolution; mirrors update at 10 Hz. Simulation does not run while paused/hidden and does not catch up background time.
- `game.js` and `game.css`: touch/keyboard input, cockpit, adaptive portrait/landscape layout, profile adapter, event log and report.

The `.webp` facades are small crops of the existing approved `transition-town-master.png`: Bank (48,70–337,240), Grocery (480,471–581,592), Pizza (389,471–477,592), City Hall (434,25–704,236), School (475,255–898,391). These derivatives do not replace originals. No stock or regenerated art is used. Future expansion needs full side/rear facade textures or building models if more detailed 3D buildings are desired; these crops support this route.

## Evaluation / future connections

Events have simulation time, ISO timestamp, kind and location. Report includes driver, route, duration, distance, completion, successes, practice areas, observations and contact/collision events. Completed reports are saved under `ttDrivingReports:v1`, grouped by the resident captured on entry (latest 10 per resident). Partial/completed logs can be downloaded as JSON and the report printed. Storage failure does not prevent play. No real or simulated license is awarded by this prototype.

`window.TTDriving.snapshot()`, `.report()` and `.subscribe(callback)` provide a read-only telemetry seam. A future transport should authenticate/pair the instructor/student, enforce instructor permissions server-side, validate commands, reconnect, and send timestamped snapshots/events. There is **no** remote instructor dashboard, command system or fake localStorage synchronization in Phase 1. No backend is required here. Future licensing tests must be researched against the current official Tennessee manual before implementation. Existing school-clearance text is not changed.

## Tests and limits

Run `node tests/driving-core.test.cjs`. Browser regression: Playwright installed, then `DRIVING_BROWSER=/path/to/chromium node tests/driving-browser.test.cjs` (the test serves this repository locally). Full-route tests move continuously with driving inputs; they never teleport the player's vehicle. Isolated rule unit tests explicitly set a starting situation for boundary/hazard checks.

Verified in Chromium using phone-sized 844×390 and 390×844 layouts: page/asset load, no runtime errors, keyboard start/gear/mirrors/arrows, touch accelerator and steering, full backing/stop/pedestrian/turn/parking route, evaluation save, active-profile return, pause and orientation. Simulation tests additionally cover braking distance, unsafe shifts, road edge, speeding, missed stop, pedestrian/vehicle contacts, invalid parking and pause freezing. Automated pointer tests exercise DOM handlers; they do not establish real-device Safari multitouch behavior.

Actual iPhone Safari/iPad and school computer performance remain device checks. Canvas scenery is lightweight perspective geometry with approved textured facades, not full 3D building models. Traffic/contact physics are deliberately simplified; the prototype is practice software. The stop-control threshold and observation windows are assessment heuristics, not legal licensing criteria. Phase 2 is intentionally not implemented.

## Restore

Original default-branch head: `1a00eab9cb0b3648945e9d7284eb26f31e6d7b9b`. Initial backup branch: `backup/before-driving-phase1-20261006`. Publication includes the newer Pizza Shop restoration at `0da2f07939aff7305b84aea4a46890c93c5ce236`; the backup immediately before publication is `backup/before-driving-publish-20261006`. Reverting the driving addition commit removes only the new feature and the single directory link. Avoid resetting main across later unrelated changes.

## Getting started and instruction support

The opening screen displays a phone/iPad quick-start guide. Practice with hints gives context-specific guidance for preparation, backing, the stop/crosswalk, turning and parking. Drive without hints preserves independent driving. How to drive is available before and during play and from Pause; it freezes the simulation and returns to the prior screen/state when closed. Hints can be hidden or enabled from Pause. Holding brake while tapping Start/R/D requires two fingers on touch devices; the guide explains this, light accelerator position, steering, gear meanings, keyboard controls, and parking alignment. Reports retain whether guided hints were used.

Instruction regression: `DRIVING_BROWSER=/path/to/chromium node tests/driving-help.test.cjs` checks the opening guide, contextual hints, pause/resume while reading, optional hints, and keeping portrait driving controls accessible.

## Two-finger touchscreen fix

Vehicle switches (Start, belt, signals and gears) handle touch pointer release directly, including non-primary fingers. Mobile browsers do not produce a normal compatibility click for the second finger while the first holds BRAKE. Pointer capture preserves the brake hold independently; canceled or dragged-away switch touches do not activate a switch, and a subsequent compatibility click is suppressed to avoid double activation. BRAKE HELD and ENGINE ON provide immediate feedback. Core gear/start safety interlocks remain in effect.

Regression: `DRIVING_BROWSER=/path/to/chromium node tests/driving-multitouch.test.cjs` uses browser-protocol touch events with real pointer capture (not mocked DOM events) to test brake + Start, Reverse and Drive with a second finger, no duplicate activation, actual reverse movement, gas + steering, braking and the visible state labels. This reproduces the missing secondary-finger click and verifies the repair in Chromium; an actual iPhone Safari retest remains necessary.
