# Transition Town classroom monitor — teacher operating guide

Open **Miss Kayla Central Hub → Live Classroom Monitor**, or `classroom-monitor.html`. The existing `pre-ets-session-reports.html` now opens the same private report tools and retains its separate manual worksheet.

## First use

1. Use the teacher email already authorized in `tt_teacher_access`. Sign in by your existing password or a sign-in email. The public town PIN is deliberately insufficient for student records. A complete sign-in email link can be pasted into the sign-in panel if it opened on another device. No new teacher account or email message is created by deployment.
2. Under **Recording Settings**, turn on activity recording and choose how many days to keep records (1–365). The form suggests 30 days; save your preferred setting.
3. If direct peer viewing is blocked by the school network, you can enable **secure HTTPS snapshot fallback**. It uses the existing Supabase project; no paid relay, subscription, plan upgrade, or recording service is enabled. Existing project quotas still apply. Encoded uploaded viewing data is capped at 20 MB per teacher per UTC day and frames are limited to one per three seconds.
4. Students log in to their existing town profile. A connection notice appears automatically on town activity pages. The first device request appears in the private monitor. Match the student's name and four-digit pairing code in person, confirm their school, then approve. Per-device access expires after eight hours. Choosing another student's public profile does not authorize their records.
5. Students appear automatically after verification, including when they navigate among town pages. A student can pause or end their session. The active student identity—not a shop's shared owner selector—owns their events.

## During the group

- Start a **30-minute group** with one selected Pre-ETS service, school, focus, and the students present. Overlapping active group membership is rejected.
- Click an online student's name for their individual view. The student must choose **Allow live town view** in their notice. Switch students using the session selector or overview.
- Direct viewing uses encrypted WebRTC data channels and no outside STUN/TURN service. It may be blocked by network policy. **Use secure snapshot view** if it is enabled in Recording Settings; it also activates automatically after a failed direct connection attempt.
- This displays the rendered Transition Town game, including changing pages, animations, and accessible canvas snapshots. It is not remote control or a Chromebook desktop/video recording. It excludes other tabs, passwords, form values, typed notes, audio/video players, and inaccessible canvases. Same-site styles are embedded to preserve the actual game illustration/layout inside the read-only sandbox.
- In the individual view, enter participation and assistance **only when you actually observed or provided it**. These teacher observations are distinguished from application events.
- **Activity History & Replay** is a timestamped event timeline. Its replay does not show historical screens or rerun business actions.

## Finish and print

1. Choose **End Group Session & Generate Reports**. It freezes the group's sessions and drafts one report per member using only their own time-windowed evidence. A member without activity gets an explicit lack-of-evidence statement, not copied group achievements.
2. Review each student's draft. Choose/confirm one service, actual school/time, completed activities, relevant skill areas, verified participation/assistance, results, and next-session plan.
3. **Save draft** or **Approve & save reviewed report**. Approval requires verified participation/assistance and a selected service. Editing an approved report returns it to draft. Revision checks prevent one teacher device overwriting a newer edit from another.
4. Print one report from its row/editor, or open **Print & Export** and select a group to print all of its reports. Drafts remain conspicuously labeled. Reports export as JSON; individual event histories export as spreadsheet-safe CSV.
5. Lock the monitor when finished. Student access never includes teacher reports or other students' histories.

A session also ends on explicit student logout/end, at its 30-minute deadline, or after a lost heartbeat. Disconnected sessions close at their last server contact, not an invented later finish time. Expiry and report generation are processed on subsequent student heartbeats/teacher refreshes; no background timer is claimed while all browsers are closed. Report duration describes the elapsed recorded session window; service minutes, attendance, and assistance remain subject to specialist review.

## Evidence and limitations

- The simulation records purchases, payments, inventory, preparation, care/service operations, shifts, employee decisions, and interview questions/decisions through application-specific result hooks. Generic clicks remain **attempts**, not completions. Browser-reported application results are not tamper-proof assessment or teacher observations.
- Automatic shared-shop ticks/staff work are not claimed as the student's independent completions. Financial snapshots on confirmed student commands are shared business figures, not individual earnings.
- Events stay separate across verified student devices even when they share shop inventory. Older session summaries no longer default to assumed independence or claim completion solely from page visits.
- If a connection fails, up to 250 recent unsent events remain in that open tab for retry; closing the tab can lose unsent events. A report cannot claim activities that never reached the server.
- Records are protected by service-only RLS tables. Every teacher read/write validates an Auth user and the existing teacher allowlist; a classroom code, publishable key, or student token cannot read records. Every student write derives its identity from its approved device token.
- Direct frames stay peer to peer. HTTPS fallback holds only a current compressed frame per viewing channel. A frame expires after 20 seconds; expired frames are never returned and are physically purged on monitor access. Stop/pause/end clears current fallback frames immediately. There is no historical screen/video replay. If the school requires physical deletion without subsequent site access, its IT administrator should approve a scheduled database cleanup; no scheduler or new paid service was enabled automatically.
- School-selected retention applies to new monitor events, sessions, groups and reports; cleanup occurs on monitor access. Downloaded/printed copies are governed by school procedures. Existing business, interview, bank and manual report records are untouched.

## Verification

- `node tests/classroom-monitor.cjs` (Node 24+) exercises the actual Edge handler against isolated Auth/REST fixtures: per-student ownership, teacher allowlisting, rejected unapproved access, idempotent events/group ending, pause/revoke, group differences, evidence-only drafting, approval requirements, editing revisions, viewer authorization, frame expiry/rate limits and pause clearing.
- `node tests/student-shop-core.cjs` preserves the existing shop/bank/training regression checks.
- Browser QA uses a separate scratch preview and fictional teacher authentication/test records. It exercised pairing, actual shop actions/corrections, explicit observations, separate group reports, approval and a real changing game mirror via secure snapshots. No test purchases or observations were written to the real classroom workspace.
- Live endpoint checks verify default recording-off, unauthenticated teacher rejection and no student joins before school approval. Real teacher sign-in, school authorization, a physical Chromebook/iPhone session and the school's network remain setup/verification steps for the school. The cloud browser supplied no usable direct-peer connection; the HTTPS fallback covers that case without falsely labeling an activity log as a screen.


## Recording settings update
The dashboard now uses teacher-controlled Recording Settings. There is no school-approval attestation or policy-reference field. Teachers turn activity recording on or off and choose a 1–365 day record lifetime (the form suggests 30 days). Saving requires teacher authentication; student verification, notices, pause/end controls and private storage remain in place. This replaces the former school-authorization setup described above.
