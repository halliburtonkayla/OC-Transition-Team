# The Learning Arcade — implementation and review

This branch adds a classroom inside the existing Transition Town school. It is not a replacement town or a separate hosted service. **Nothing in this PR deploys the site, installs database changes, imports a roster or modifies live student records.**

## Open the experience

- `learning-arcade.html`: real modeled classroom, six raycastable stations, game board, walk controls, tap navigation, progress and game launch settings.
- Existing school hallway → **THE LEARNING ARCADE**. The original artwork and doors are retained.
- School Directory → **THE LEARNING ARCADE**. All original rooms and game links remain.
- Existing teacher dashboard → **Students & Scheduling**. The existing teacher passcode / verified-email authorization is reused. The dashboard shows an actionable unavailable state until its reviewed backend extension is installed.
- `tests/learning-arcade-teacher-fixture.html`: isolated UI QA with clearly fictional learners. No real backend is contacted. This is test evidence, not a new school or production login.

## Implemented phases

| Phase | Result |
| --- | --- |
| Classroom | Real Three.js meshes, physically shaded cabinetry, terrazzo floor, windows, plants, lighting, stations, preview animation, game board, achievement area and touch/keyboard camera controls. The same geometry has a depth-buffered CPU renderer for WebGL-blocked devices. |
| MATCH IT! | 15 categories; six progressive levels per category, 2→4→6 choices, randomized placement, advanced label matching, two-pass matching, drag/drop and tap/keyboard alternatives; optional spoken multiple-choice checkpoints. |
| Five additional games | Coin Collector Speedway (12 levels), Sound Pop Phonics (9), Feed the Number Monsters (9), Word Delivery Express (7), Superstore Money Dash (9). All are playable, not launch placeholders. |
| Roster | Private import preview, stable account IDs, key/name/legacy-alias reconciliation, atomic apply, archive/on-hold/review states, preserved old data and an audit backup of touched rows. No identifiable roster is checked in. |
| Teacher tools | School views; flexible learner preferences; photos viewed locally beside manual schedule entry; verified elective windows, tested/restricted flags, overlaps, cross-student conflicts and school travel gaps; weekly plan; editable teacher email drafts; actual teacher observations. |
| Evidence | Own-device secure saving, optional practice recording, actual attempts/rounds/questions, active minutes excluding idle/background/paused time, assistance requests, teacher-observed assistance, separate learning modes, individual/teacher print and JSON exports. |

### Game progression

MATCH IT! levels 1–2 practice two associations; level 3 uses four pictured choices; level 4 pairs pictures with labels; level 5 uses up to six pictured choices; level 6 completes a picture pass and a label pass. Teachers can change the category and level at any time. CDC mode stays at the selected level for repeated practice. Outside CDC, three completed rounds advance a level; students can return to an earlier level using Change level. Question checkpoints reinforce the completed task and allow unlimited retries. Accuracy uses actual response attempts; completion and question records are not counted as extra game answers.

Coin Collector Speedway progresses from coin pictures/names/values to identical/mixed coins, amounts through $1, purchases and change. Driving supports lane buttons, arrows, Enter, jump and an earned-star boost. Advanced cones require a jump before collecting in their lane; they have no time penalty or lost lives. Picture choices provide an equivalent direct input. Sound Pop moves from upper/lowercase recognition to sounds, beginning-picture associations, CVC blending and sight words. Monsters use one-at-a-time object feeding, quantity frames, 1–5/1–10/11–20 counting, addition/subtraction, missing numbers and larger counts. Word Delivery collects letters in order for letters, CVC, sight and workplace words. Superstore practices scanning/counting, prices, coin identification, exact payment, change, greetings, asking for help and transaction decisions.

The original **Prism Pour remains unchanged**, including its 100 levels, artwork, question-free option, local storage keys and reports. It is linked prominently in the arcade. Its existing question system is retained; MATCH IT! adds reusable related category activities beside it.

### Three modes

- **CDC Beginner:** no required questions, timers or reading; pictured/touch input, spoken directions and large controls. Difficulty can change at any time.
- **Pre-ETS Learning:** records the actual instructional objective and activity. The existing specialist-reviewed service reports remain the official service workflow. Opening or completing an arcade game never approves service delivery.
- **ESP Enrichment:** optional 5/10/15-minute practice periods, separate report section and a learner program independent of Pre-ETS caseload enrollment. Time goals are encouraging milestones; they do not end or fail a student's activity.

## Student records and release prerequisites

The live architecture was inspected read-only: GitHub Pages serves the public application; the existing Supabase project protects teacher/device access and monitor records. Its `student_accounts` and `student_state` tables exist and currently have no rows; 21 named legacy Town phone/profile aliases plus the teacher remain in use. Browser Town names are not secure authentication.

The new work **extends those same account/state tables**. It does not introduce another database, ledger or reward store. New private account IDs are UUIDs. Private import keys and school are unique; approved legacy aliases link old name-based records without rewriting historical events, phone contacts, local Town records or business memberships. New students use privately provisioned, expiring teacher-approved device keys. Student requests derive identity from the approved device, never from a submitted student ID or the public Town selector.

The reviewed private roster package is delivered separately to Kayla. It contains the two school rosters, archive/hold/review decisions, three flexible learner plans and five **unverified** OC schedule draft rows from the earlier planning photo. It contains no raw workforce numbers. The additional thirteen OC learners require schedules. Uncertain grade/status or scheduling data is never invented. Unlisted legacy profiles stay unchanged. After a reviewed import exists, the existing monitor's future active roster excludes archived, on-hold and ESP-only enrollments; historical reports remain queryable.

### Apply only after owner approval

1. Back up the existing Supabase schema and private account/state/alias rows through an approved school process. Record source commit and backup timestamp. Existing local-device Town data should also be exported before release; it is not readable from this development checkout.
2. Review and test `schema.sql` in an approved staging environment. It is an additive transaction. Real PostgreSQL tests in this PR exercise import rollback, duplicate rejection, stale-write handling, row preservation, private-role denial and scheduling constraints. No production migration is run by CI.
3. After approval, apply that transaction and deploy the updated existing `classroom-monitor` function including `arcade.ts` and its imported shared modules. No new Supabase project, subscription, OCR service, email service or secret is required. Do not ship the public frontend's private controls as working until the schema and function are installed together.
4. Sign into the existing teacher dashboard. Use **Review roster import**, load the separately supplied private JSON, inspect every proposed action/alias/grade/status and approve the exact preview. Conflicting or uncertain identity matches cannot be applied. The import stores before/after account snapshots and never deletes `student_state`, balances, businesses, historical activity or reports.
5. Review the five earlier schedule drafts, then collect the remaining schedules. Photographs stay in the open teacher page; only reviewed field values are saved privately. Class type must be explicitly verified. Missing/unverified/tested periods cannot become pull-out windows.
6. Provision each learner's eight-hour device key privately from the teacher profile, or reuse a linked existing approved Town device. Do not put these keys in a repository, screenshot, email or report.
7. Validate on the school's actual devices and network, then approve site release. This PR does not perform any of those deployment steps.

The existing verified teacher allowlist and passcode session validation gate every teacher route. RLS is enabled and direct `anon`/ordinary `authenticated` grants are revoked for private account/state/alias/audit records and RPCs; only the existing service role can touch them. Student reads return their own minimal learning profile and own game results. Teacher communication notes and observations are never submitted as student-authored evidence. Revision checks prevent stale schedules, preferences and plans from silently replacing newer records. Plans are serialized across schools and preserve at least 20 minutes for school travel.

Practice does not invoke the existing time clock, monitor work-pay action or bank. The arcade never awards deposits merely for loading a game. Existing rewards, businesses, banking and classrooms are preserved.

## Integration boundaries

PR #8's Candy Counter and the flat PR #11 Home Economics pilot remain separate, unmerged work. The newer PR #13 contains the real 3D Home Economics center. This PR is based on current released main and does not duplicate or cherry-pick those systems. Superstore's clearly simulated beginner prices are instructional practice; it does not create a second grocery inventory, commit a real Town cart or debit balances. The existing grocery/kitchen systems remain available through the school. A shared grocery-catalog extraction and a resumed kitchen shopping journey should be reconciled with PR #13 after its review; this branch does not claim those unmerged journeys are integrated.

## Verification and remaining limits

See `QA.md` for exact commands, current outcomes and browser evidence. Physical Chromebook/iPhone/tablet touch, local speech voices, school printers and the school's real authorized device setup still require a school trial. Automated responsive widths are not physical-device certification. Browser-reported practice accuracy is not a tamper-proof assessment or a teacher observation.

Guest practice stays in memory in the open page and can be printed; it does not create identifiable local storage. Connected practice saves to existing private account state. In-flight saves are serialized; stale server snapshots cannot replace newer completed evidence. Unfinished connected activities can resume at the first unfinished round while keeping prior attempts. When saving fails, the activity is clearly labeled unsaved and can be printed. No private record is cached in public source code or a public file.

## Add another approved game later

Add the approved game's instructional data to `curriculum.mjs`, implement its task/controller, and register it in `GAMES`. The card board and 3D station layout derive from that registry, with room spacing computed from the station count. The same modes, device identity, active clock, evidence, reporting and teacher workflows are reused. No additional game has been invented for this release.
