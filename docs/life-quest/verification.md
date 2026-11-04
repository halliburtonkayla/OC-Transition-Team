# Life Quest verification — November 4, 2026

## Automated verification

The new suite has 43 passing tests: 37 engine/integration tests and 6 DOM workflow tests. Combined verification has 149 passing tests across Life Quest, the original Transition Mission, existing school activities, Job Missions, and Prism Pour school integration.

```sh
npm install --prefix /tmp/life-quest-qa --no-save jsdom@26.1.0
SCHOOL_JSDOM=/tmp/life-quest-qa/node_modules/jsdom node --test \
  tests/life-quest.test.mjs tests/life-quest-dom.test.mjs \
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
- Actual physics routes for hallway, platform trail, street crossing, and the running leg of the career relay. Station/task tests place fictional actors at interaction points to isolate objective logic; these are not claimed as 20 full manual playthroughs.
- Movement/jump state in all 20; all supported movement speeds across hallway/platform routes; wall and traffic collisions; hazard speeds; three-life recovery; points and reward idempotency.
- Bus boarding/stop timing, recipe order, budget arithmetic, dispatch sequencing, laundry cycle, moving parcels, WALK signal, shift order, and a solver-confirmed box-puzzle route.
- Keyboard events and menu launch for all 20 in DOM tests; remapping, pause, reduced-motion setting, mute, report printing, and same-device resume.
- Fictional personalized avatar colors/hairstyle/outfit; no Town ledger/profile writes; live identity-switch locking and clearing of printable content.
- Honest wrong/correct accuracy, unscored empty records, report escaping, existing service sanitization, duplicate snapshot handling, private teacher mounting, stale asynchronous load rejection, and class/individual printing.
- Central-time date boundaries on 23-hour and 25-hour daylight-saving days.

## Browser verification

The actual Chromium preview was operated through its UI using fictional practice data. Every mission was launched and rendered. The first mission was played through its classroom portal, a wrong choice and explanation, both correct decisions, and the completion celebration. Keyboard movement, reward collection, saved reopening, the map, and the grocery environment were visually inspected. The separate reporting category loaded two fictional histories with 100% and 67% question accuracy and exposed class and individual print controls. Screenshots are in this folder.

The browser review found and corrected an HTTP-preview compatibility problem in the teacher pane's mount identifier; no insecure-context `crypto.randomUUID` dependency remains there. It also prompted an immediate draw on mission selection, reduced redundant HUD DOM updates, and a compact gameplay layout with visible keyboard directions.

No live student profiles were edited, no classroom service was authorized from the review pages, and no deployment occurred. Automated DOM/engine tests cover all 20; only the first mission received a full manual browser playthrough. Other browser families, physical school laptops, and approved-device live reporting are not claimed as verified. Those are appropriate classroom-pilot checks after review.
