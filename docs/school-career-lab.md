# Transition Town School · Career Lab

Enter the existing school, then **Job Exploration · 50 Careers**. The school’s lessons, games, college fair, town map, banking and businesses remain available.

- Day 1: Choose a career interest at the identity desk. The school generates a fictional Town identity and a printable background with education, two experiences, skills and references. Use the Town avatar or optionally take a camera portrait. Type and check the résumé.
- Day 2: Research the career and complete the practice application. The school assigns one of two roles. Students cannot choose departments or stations.
- Day 3: Clock in, walk the existing avatar to the highlighted station, and complete the assigned tasks. Return to the floor between stations. Finish with a reflection and printable activity report.

There are exactly 50 careers, 100 assigned roles and 304 task definitions. Every general role has three career-specific tasks using ordered procedures, item routing, source-document extraction or exact-message transcription. Retail roles each have four visual workstations: clothing tags/hangers/racks, scanning and stock location/rotation, grocery conveyor checkout/change/drawer reconciliation, and custodial cleanup.

The smooth walking overlay on the existing town map preserves the original destination buttons. With walking enabled, tapping a destination sends the avatar to its door before opening the existing destination. Walking can be switched off. The school career floor also supports keyboard, touch arrows and tap-to-walk movement.

## Records and photos

Career folders save under `ttWorld.residents[student].careerLab` on the current device. Existing balances, avatars and records are preserved. Earlier career projects are retained in folder history (up to 20). ID portraits save separately on the device; they are not included in classroom activity events. Camera permission is requested only after the learner selects **Turn on camera**. Streams stop on closing the photo station or leaving the page. File upload and avatar fallback are supported.

The existing connected classroom monitor receives actual completed actions and corrections for this page. It retains its existing access and school settings. No new database tables or permissions are required. Documents and full task state are not synchronized across devices by this addition.

The shift maps 10 active minutes to an 8-hour practice day without forcing completion when time expires. Activity reports distinguish simulation actions from teacher observations and provide space for one session service, support provided and the next-session plan.

All personal backgrounds, employers, qualifications, references, addresses and contact details are fictional. Official BLS Occupational Outlook Handbook links accompany each career’s general training pathway. Regulated-career tasks preview organization, communication and records; completing this game does not award a license or qualification.

## Validation

Run `node tests/career-lab.cjs` for the full catalogue, workflow gates, stable identities and assigned roles, invalid change rejection, exact-cent cash reconciliation, and script syntax including the original town inline scripts. The optional DOM harness (`node tests/career-lab-ui.cjs`, with `linkedom` on the Node module path) completes all eight real work engines and verifies that existing balances and history survive. Existing monitor checks remain available at `node tests/classroom-monitor.cjs`.
