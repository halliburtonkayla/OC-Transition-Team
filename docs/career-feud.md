# Ready, Set, Work! — Career Feud

Connected classroom game added to the existing Transition Town school.

## Use

1. Open the existing **Ready, Set, Work!** / `career-feud.html` game from the school directory.
2. On the teacher computer select **Host Game**. Choose **Individual players** (default) or **Two teams**, then the **actual player count, 2–6**, service focus, 1–14 questions, and discussion time. Use the existing teacher passcode.
3. Individual mode creates exactly the selected number of blank seats. Each student opens the join link on their laptop, types their name, and claims a seat. There are no preset student identities or student accounts. Duplicate names require a distinguishing initial.
4. Two-team mode keeps one laptop per team and the original six-person arrangement. Smaller actual counts split across two teams (one to three people per team). Each participant types a name into the blank roster before creation. Roles rotate using the actual roster size.
5. Only the selected players/teams must connect and confirm READY. Each individual submits an answer; team mode submits one shared answer per team. Answers stay hidden from opponents until the host reveals them.
6. The teacher awards round points using the existing question guidance. The game automatically sums every round. Individual mode determines the overall player winner; team mode determines the overall team winner. There is no AI or subjective single “best answer” award.
7. If the overall lead is tied when regular play finishes (or the host ends early), only tied leaders play an extra question. Other students watch and do not block readiness. Ties repeat until one leader remains. Tiebreaker points (0–100) count in the final tally. Unused questions from the same focus are used first; after the focus bank is exhausted, questions cycle rather than leaving the game stuck.
8. Results show the overall tally sheet, including each regular question and tiebreaker. Print the session or individual report, teacher observations, and next-session plan. Score corrections and undo recalculate the winner; a corrected tie reopens a tiebreaker.

New sessions always start with blank student names and zero points. Refreshing an existing room restores its own names, answers and totals. Releasing a seat during play keeps its recorded identity and scores; the replacement laptop must enter the same name. Existing saved two-team rooms remain compatible. Rosters are fixed once play starts to preserve accurate role history.

## Content

78 open-ended scenarios: 36 Workplace Readiness, 14 Job Exploration, 14 Self-Advocacy, and 14 Postsecondary Education. One service per session, 14 questions by default without repeats. No preset phrase matching, multiple-choice scoring, fabricated surveys, or automatic answer judging. Round points are awarded by the teacher; totals, winners, and tiebreaker eligibility are calculated automatically.

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

The existing school building, avatars, businesses, classrooms, and old game-show route remain. The school hallway gains a direct game link; the Educational Games menu gains a connected-game card. The former keyboard game remains under Practice Game Show. The game uses typed-name initials, not preset student portraits; the Town’s other avatars are unchanged.

## Verification

### Player-count and tally update (prepared; not deployed)

- 40 existing logic/report checks and 49 new player/count/tiebreaker checks pass locally.
- 39 checks execute the actual production `index.ts` handler with an isolated in-memory PostgREST transport, including concurrent seat claims and optimistic-version retry. No production credentials, database writes, or network calls are used.
- Existing regression suites pass: Career Lab (1,537), practice game show (3,769), and classroom monitor (85).
- Browser suites cover the preserved two-team flow plus actual three/six-player sessions, typed names, reconnect, cumulative scoring, repeated ties, reports, and narrow layout. Browser execution in this cloud shell is blocked by its process/socket sandbox; draft-PR CI is the verification path. Do not treat source parsing as a browser pass.
- Deployment requires the updated `career-feud` Edge Function **before** publishing the v2 frontend. No schema migration, authentication change, new service, or separate game route is required. Repository changes alone do not deploy the Edge Function.

### Original release verification (historical)

- 40 executed logic, authorization-view, timer, role, content, and report checks in the coding tool's JavaScript runtime.
- 23 executed checks against the deployed Supabase endpoint using an authenticated temporary teacher session, two independent team credentials, and a third duplicate-seat attempt. Included real room creation, concurrent joins, question/score synchronization, lock, filtered opposing answers, teacher-control rejection, rejoin, unlock, reveal, pause/resume, untimed, score undo, role rotation, skip, early end, and reports built from the live room.
- Existing town inline scripts and updated school entrance parsed successfully.
- `node tests/career-feud.cjs` reproduces the logic/report checks.
- `node tests/career-feud-browser.cjs` uses four isolated Chromium contexts and an isolated shared in-memory API fixture. It checks the actual frontend and school entry. It does **not** claim to be a production-browser network test. Passed in GitHub Actions run https://github.com/halliburtonkayla/OC-Transition-Team/actions/runs/40359711332. Verified school entry, isolated host/team browser sessions, duplicate seats, typed answers, hidden answers, locking/unlocking, reveal, scores, refresh reconnection, role rotation, pause/resume, untimed, observations, printable HTML/PDF, and layouts at 1366×768, 1280×720, and 390 px wide.
- Existing Career Lab, practice game-show, and classroom-monitor regression suites passed in that run.
- Production browser testing remains separate from backend API checks. School Wi-Fi and actual classroom Chromebooks were not available for validation.

Backend schema source is in `docs/career-feud-schema.sql`. Edge function and question source are in `supabase/functions/career-feud/`.

