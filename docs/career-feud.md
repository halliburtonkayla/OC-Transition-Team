# Ready, Set, Work! — Career Feud

Connected classroom game added to the existing Transition Town school.

## Use

1. Enter the school hallway and select **Ready, Set, Work!** (also in Educational Games).
2. On the teacher computer select **Host Game**, choose one service focus and 1–14 questions, edit the two three-person teams, and use the existing Transition Town teacher passcode.
3. Copy the student join link or share the six-character room code. Each of the two student laptops selects a different team. There are no student accounts.
4. Teams review their discussion leader, typist, and spokesperson roles and click READY. The host starts the round.
5. Teams discuss, type one shared answer, and LOCK IN. Only the host and the submitting team can see an unrevealed answer.
6. Reveal, hear both spokespeople, and set each team's round points. Next opens a role-rotation break. Both teams confirm readiness before the next round.
7. End opens results and teacher print controls. Save individual observations and the next-session plan before printing.

Default rosters: Olivia, Bradley (Max), Alyssa / Jocquan, Kaylee, Nick. Olivia and Jocquan cannot be placed on the same team. Rosters can be changed in the lobby; they are fixed once play starts to preserve accurate role history.

## Content

78 open-ended scenarios: 36 Workplace Readiness, 14 Job Exploration, 14 Self-Advocacy, and 14 Postsecondary Education. One service per session, 14 questions by default without repeats. No preset phrase matching, multiple-choice scoring, fabricated surveys, or automatic judging. All points are awarded by the teacher.

## Connection and access

- Existing Supabase project: `tyzpophjoptciihaszqj`.
- New Edge Function: `career-feud`. Deployed with `verify_jwt=false` because it validates the existing teacher authentication for creation and scoped room/team capabilities for subsequent requests.
- Private table: `tt_career_feud_rooms`, RLS enabled, no anon/authenticated table grants. No client direct reads.
- Host creation uses the existing classroom-monitor passcode endpoint or approved teacher session. Room codes never authorize teacher actions.
- Host capability stays in tab sessionStorage. Each team capability stays in localStorage keyed by room. These are reconnect credentials only; shared game state is stored on the server.
- Hashes only are stored server-side. Team claims and state writes use optimistic version comparison; retries re-read state. Mutation request IDs prevent duplicate advances.
- Client polls the authenticated endpoint every 900 ms while visible, with heartbeats about every 7 seconds. Connection indicators expire after 20 seconds. Updates normally arrive within about one second plus network latency.
- Answers, scores, notes, timers, and role history persist server-side across refreshes. Releasing a team seat invalidates its old capability while retaining its answers and scores.
- The server returns no opposing answer text until explicit reveal, no teacher notes to students, and no judging rubric to students. Skip/end do not implicitly reveal hidden answers.
- Records are accessible for 30 days. Expired game records are purged when a new game is created. Print reports for records needed longer.
- Browser capability tokens are never included in student join links.

## Controls and records

Pause/resume, set timer to 0–900 seconds, add 30 seconds, untimed, unlock before reveal, reveal, skip, next, early end, absolute round points, score correction and undo, editable pre-game teams, per-student observations, next-session plan. Timers never reveal answers automatically.

Printable reports contain Central Time date/time, elapsed duration (including pauses), selected service, rosters, each round's role assignments, question, saved answer with draft/locked status, points, explanations, observations, and next plan. Individual summaries explicitly label team work and do not infer individual skills from team success. Reports use print CSS and escaped user-entered text.

## Preservation

The existing school building, avatars, businesses, classrooms, and old game-show route remain. The school hallway gains a direct game link; the Educational Games menu gains a connected-game card. The former keyboard game remains under Practice Game Show. The existing business-avatar map is reused.

## Verification

- 40 executed logic, authorization-view, timer, role, content, and report checks in the coding tool's JavaScript runtime.
- 23 executed checks against the deployed Supabase endpoint using an authenticated temporary teacher session, two independent team credentials, and a third duplicate-seat attempt. Included real room creation, concurrent joins, question/score synchronization, lock, filtered opposing answers, teacher-control rejection, rejoin, unlock, reveal, pause/resume, untimed, score undo, role rotation, skip, early end, and reports built from the live room.
- Existing town inline scripts and updated school entrance parsed successfully.
- `node tests/career-feud.cjs` reproduces the logic/report checks.
- `node tests/career-feud-browser.cjs` uses four isolated Chromium contexts and an isolated shared in-memory API fixture. It checks the actual frontend and school entry. It does **not** claim to be a production-browser network test. Passed in GitHub Actions run https://github.com/halliburtonkayla/OC-Transition-Team/actions/runs/40359711332. Verified school entry, isolated host/team browser sessions, duplicate seats, typed answers, hidden answers, locking/unlocking, reveal, scores, refresh reconnection, role rotation, pause/resume, untimed, observations, printable HTML/PDF, and layouts at 1366×768, 1280×720, and 390 px wide.
- Existing Career Lab, practice game-show, and classroom-monitor regression suites passed in that run.
- Production browser testing remains separate from backend API checks. School Wi-Fi and actual classroom Chromebooks were not available for validation.

Backend schema source is in `docs/career-feud-schema.sql`. Edge function and question source are in `supabase/functions/career-feud/`.
