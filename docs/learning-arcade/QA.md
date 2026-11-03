# Learning Arcade QA and review evidence

## Local verification

- New curriculum/core: 8 tests, including all six games, every level, all 15 matching categories, three modes and 30 deterministic rounds per combination; every task/checkpoint has a reachable correct answer.
- Actual teacher workspace DOM: school isolation, duplicate enrollment rejection, schedule classification, planning, editable unsent email and event-handler cleanup.
- Actual application DOM: six playable games, beginner question-free progression, optional question checkpoint, counting/scanning, spelling, exact payment, progress and printable output; the original Town financial record is byte-for-byte unchanged.
- Authorization/Edge module: 7 tests covering teacher rejection before reads, own-device identity, cross-school denial, pending devices, valid response/timing bounds, roster preview, stale notes and hashed device provisioning.
- Real PostgreSQL 17 (PGlite): 5 tests applying the actual SQL, including rerun safety, atomic rollback, duplicate protection, preserving unrelated history/balances/business JSON, private-role denial, idempotent/stale result merges, schedule revisions, verified elective planning and conflicts, and preserving existing schedules during reimport.
- Original Prism Pour: 17 tests passed, original 100 levels and question-free behavior unchanged.
- Original school DOM: 9 tests passed covering existing jobs, stories, money matching, counting, memory, pause/retry, printable evidence and profile isolation.
- Original monitor: 85 authorization/evidence/session assertions passed.
- Original shared shops: 59 banking/shop/training assertions passed.
- Original workday: 97 teamwork/attendance/cash/clock/one-time-payday assertions passed.
- Source/reference audit: no missing active references or JavaScript syntax errors. The final exact count is in the CI logs.

Commands:

```sh
node --test tests/learning-arcade-*.test.mjs
SCHOOL_JSDOM=/tmp/learning-arcade-qa/node_modules/jsdom node --test tests/school-release.test.mjs
node --test tests/prism-pour-*.test.mjs
node tests/classroom-monitor.cjs
node tests/student-shop-core.cjs
node tests/business-workday.cjs
node tools/release-audit.mjs
```

The new tests use isolated `jsdom@26.1.0` and `@electric-sql/pglite@0.3.14`. Existing tests were run with their required jsdom path; an initial invocation without that dependency was corrected. No failing result is hidden or counted as passing.

## Browser review

The cloud review browser blocks WebGL. The new depth-buffered lower graphics renderer was therefore exercised manually using the same scene geometry and camera. The room loads, the six station board works, and a CDC beginner round was completed with direct next-round progression and no questions. The teacher UI was inspected using only clearly fictional fixture learners; marking a class tested removed it from suggested windows. No private production record was used for UI tests.

`Learning Arcade checks` runs an isolated Chromium/SwiftShader browser suite in GitHub Actions. It asserts actual WebGL rendering and camera displacement, plays the six games, checks beginner/question modes, captures a PDF, checks 390/768/1366-width layouts and touch, and exercises teacher schedule/planning/email-draft/school separation with fictional records. It also forces WebGL off to test the fallback. Supabase production endpoints are blocked. Review the PR's latest checks for the actual run status; a configured workflow alone is not a passed test.

The `learning-arcade-review-evidence` Actions artifact contains screenshots, a printable guest report PDF and machine-readable browser results. Checked-in review screenshots contain guest practice or fictional fixture data only.

## Material limits

- No schema change, backend deployment, roster apply, merge, Pages publish or production deployment was performed.
- Private teacher/device integration requires the reviewed SQL and updated existing Edge Function to be installed after approval. Production records and authorization configuration have not been changed to demonstrate it.
- OCR is not configured. Schedule photographs are previewed locally and manually transcribed/reviewed. Images are not uploaded or stored; HEIC needs browser decoding support or conversion to JPEG.
- Real student login, school network restrictions, physical-device performance/touch and the actual speech voice/volume and printer need a school trial. The cloud browser's speech API can be invoked, but audible classroom playback is not certified.
- The old monolithic grocery catalog and PR #13 kitchen journey have not been duplicated or merged. Superstore is a pretend-money teaching checkout with its own small instructional product list, not a second inventory or bank.
- Guest progress is deliberately open-page-only. Connected practice is private server state, with a printable fallback on failed saves. Device keys expire after eight hours.
- Backups, grade/source review and account matching require the concrete teacher preview before applying; uncertain students are not silently archived.
