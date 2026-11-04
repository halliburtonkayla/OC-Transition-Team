# Life Quest verification — November 4, 2026

## Automated verification

The new suite has 64 passing tests: 37 engine/integration tests, 6 focused DOM workflow tests, and 21 complete keyboard-route/campaign tests. Combined verification has 170 passing tests across Life Quest, the original Transition Mission, existing school activities, Job Missions, and Prism Pour school integration.

```sh
npm install --prefix /tmp/life-quest-qa --no-save jsdom@26.1.0
SCHOOL_JSDOM=/tmp/life-quest-qa/node_modules/jsdom node --test \
  tests/life-quest.test.mjs tests/life-quest-dom.test.mjs tests/life-quest-keyboard-routes.test.mjs \
  tests/transition-mission.test.mjs tests/school-release.test.mjs \
  tests/job-missions.test.mjs tests/prism-pour-school.test.mjs
node tests/classroom-monitor.cjs
node tests/student-shop-core.cjs
node tools/release-audit.mjs
git diff --check
```

The existing classroom suite also passes its 101 access, evidence, identity, session, and concurrency assertions. The existing business suite passes its 59 shop/banking/training assertions. Release audit: 397 active source files, 2,341 local references, zero syntax errors and zero missing references. The original Mission HTML and assets have no diff from the base commit.

Coverage includes:

- Every mission's distinct objective, exit gating, both real-life decisions, and saved restoration.
- Sequential completion of all 20, completed-level replay, and suspension/restoration of unfinished later missions.
- Complete keyboard routes from the real starting point through every objective and exit in all 20 missions. The new suite drives the shipped keyboard event handlers and animation loop in a DOM simulation; it does not assign player positions, inventory, objective flags, lives, unlocks, or completion records. A path planner chooses directional keys around the actual walls and moving hazards.
- An exact save/close/reopen/resume check during each mission, followed by completing the mission. A separate full campaign verifies sequential unlocks, all 40 correct decisions, 20 saved mission reports, and the same personalized Town avatar across the whole map; the original Town and game records remain unchanged.
- Focused station/task unit tests still place fictional actors at interaction points to isolate scoring and objective rules. These complement the complete routes; none of these automated DOM simulations are claimed as 20 full manual browser playthroughs.
- Movement/jump state in all 20; all supported movement speeds across hallway/platform routes; wall and traffic collisions; hazard speeds; three-life recovery; points and reward idempotency.
- Bus boarding/stop timing, recipe order, budget arithmetic, dispatch sequencing, laundry cycle, moving parcels, WALK signal, shift order, and a solver-confirmed box-puzzle route.
- Keyboard events and menu launch for all 20 in DOM tests; remapping, pause, reduced-motion setting, mute, report printing, and same-device resume.
- Fictional personalized avatar colors/hairstyle/outfit; no Town ledger/profile writes; live identity-switch locking and clearing of printable content.
- Honest wrong/correct accuracy, unscored empty records, report escaping, existing service sanitization, duplicate snapshot handling, private teacher mounting, stale asynchronous load rejection, and class/individual printing.
- Central-time date boundaries on 23-hour and 25-hour daylight-saving days.

## Browser verification

The actual Chromium preview was operated through its UI using fictional practice data. Every mission was launched and rendered. The first mission was played through its classroom portal, a wrong choice and explanation, both correct decisions, and the completion celebration. Keyboard movement, reward collection, saved reopening, the map, and the grocery environment were visually inspected. The separate reporting category loaded two fictional histories with 100% and 67% question accuracy and exposed class and individual print controls. Screenshots are in this folder.

The browser review found and corrected an HTTP-preview compatibility problem in the teacher pane's mount identifier; no insecure-context `crypto.randomUUID` dependency remains there. It also prompted an immediate draw on mission selection, reduced redundant HUD DOM updates, and a compact gameplay layout with visible keyboard directions.

No live student profiles were edited, no classroom service was authorized from the review pages, and no deployment occurred. Automated complete keyboard routes, save/reopen checks, and a full sequential campaign cover all 20; only the first mission received a full manual browser playthrough. Other browser families, physical school laptops, and approved-device live reporting are not claimed as verified. Those are appropriate classroom-pilot checks after review.
