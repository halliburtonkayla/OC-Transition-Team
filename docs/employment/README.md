# Student mailbox and job interviews — review branch

This is a proposed connected extension to the existing Town mailbox and classroom service. **Do not merge, deploy, run the SQL, or enable it in production without Kayla's approval.** The live website and database have not been modified by this PR.

## Why the current interview request does not arrive

The existing Central Hub's `town-room` service writes `tt_job_decisions`. The original Town mailbox only displays `ttWorld.residents[name].notifications` in that browser. Those are different data stores. The local Town Control Center's interview button only changes a local application status. Neither creates a private interview invitation. Local storage cannot deliver updates between school computers.

## Proposed shared data design (approval required)

Extend the already-used `classroom-monitor` Edge Function with a bounded employment handler. Reuse existing student names/canonical aliases, teacher PIN/email authorization, the Central Hub's private-code verification, and the existing approved-device registry/approval screen. Add four service-only tables: application ownership links, interview rounds, student mail, and retry command receipts. Extend `tt_monitor_devices` with a private-mail flag. This is an additive proposal, not a replacement account system or a migration of balances.

Only the service role can read/write the new tables or execute the command RPC. The Edge handler binds student reads and writes to a verified device identity; it does not trust a selected profile name or requested recipient. A normal saved classroom token cannot open private mail. A mailbox session is newly paired through the existing teacher device controls, stays in sessionStorage (not localStorage), expires after eight hours, and is revoked when the student logs out. Changing profiles clears displayed private data and cancels pending UI responses. A new browser/login needs approval again; the student's server messages and answers remain available.

**Why extra pairing is necessary:** current Town sign-in is a name selector, and classroom tokens may be restored from localStorage. Neither alone proves who is using a shared computer. Private mail must not become accessible merely by choosing another name. Existing locally stored Town records are retained, not converted into a security boundary. This PR does not claim to secure copies of legacy data already stored on classroom devices.

Teacher decisions, invitation rounds, legacy status updates, mailbox delivery, and command receipts commit in one PostgreSQL transaction. Unique event keys prevent duplicate mail; command IDs recover a lost-response retry; revisions reject stale writes. Reading and acknowledging the celebration are separate operations. READ LATER acknowledges the celebration but leaves the message unread. A small local retry queue stores only opaque message IDs/read flags (no names, bodies, or answers), so Read Later can close even when the acknowledgement connection fails; the acknowledgement syncs when that device reconnects.

## Included experience

- The existing Mailbox button opens connected student mail. A My Mail button follows students across supported Town/classroom pages. Messages remain server-side; their bodies/answers are not cached in localStorage.
- Full-screen neon envelope celebration, finite confetti/stars/balloons, six-second color transitions (no rapid strobe), recorded crowd cheer, mute, optional still mode, system reduced-motion handling, native modal keyboard focus, Escape as Read Later, and actual mailbox navigation. Browser autoplay restrictions may require Play cheer.
- Existing notification producers are collected without deleting/replacing their records: resident notices, targeted Town notices/messages, housing status, business-owner alerts, account/payment history, household bills and work schedules. Connected students upload their own events; authenticated teachers can deliver existing per-student events from their local Town records. Existing shared phone messages, broadcasts and groups also create mailbox messages transactionally.
- Application receipts and linked invitations. New connected applications use the existing source IDs and teacher notification records. Legacy applications require one explicit teacher identity check before binding; this avoids guessing an account from a typed applicant name.
- **21 job question sets, ten questions each**, including all requested roles and additional Town/ Home & Beyond jobs. Teachers choose a question set when a position does not match. Each interview saves its own question snapshot. No scored answer key or automatic hiring.
- One question at a time, typed answers or supportive choices, optional question/choice read-aloud, progress, explicit save/next, save/resume, failed-save preservation, and completion acknowledgement. Previous completed rounds are retained when a second interview is requested.
- Dedicated JOB INTERVIEWS section in the existing Central Hub; student/job/business/application date, invitation delivery/open status, completion/date, all responses and response modes, feedback, and teacher decisions. Hiring also updates the existing decision table and the student's local employment entry without changing money or wiping shift history.
- Individual print / Save PDF reports identify Workplace Readiness plus Job Exploration and Self-Advocacy skills, actual completion evidence and teacher feedback. They do **not** award minutes, bank money, independence ratings, or official verified service documentation.
- The original six-question `mockInterview()` Practice Interview and the existing student-business hiring simulation remain separate and unchanged.

## Review and rollout order

1. Approve the shared-data design and private-mail pairing requirement. Review the SQL proposal and retention policy with the school. No real student data belongs in this public repository or test fixtures.
2. Back up the existing database and classroom browser records. Rehearse `proposed-schema.sql` on an isolated copy containing synthetic identities first. It is a review script, deliberately outside an automatic migration folder. Generate the approved migration with the Supabase CLI at release time.
3. Apply the additive schema and deploy the coordinated classroom-service update only after explicit approval. It needs the existing service environment; no service credentials belong in the frontend. The existing `town-room` deployment is not replaced.
4. Release the matching frontend only after backend checks pass. Refresh older open teacher/student tabs. Old cached teacher controls do not use this connected workflow.
5. Use a dedicated approved test identity on two physical school browsers. Verify invitation, cheer/audio policy, keyboard access, save/resume, teacher review, print, hiring, logout, and re-pairing. Check all original bank/business/game activities and retain rollback backups.
6. Do not auto-import an entire browser's data into a student account. New connected uploads use the approved current identity. Review uncertain historical applications manually. Existing old shared-phone messages are not backfilled automatically; the trigger applies to newly sent messages.

## Limits and operation

- Backend proposal is not deployed. This branch cannot make cross-computer mail live until the approved schema/service rollout occurs. When unavailable, the UI reports that setup is required rather than pretending delivery succeeded.
- Device-local events can only be uploaded when that device is online and a verified student/teacher session is available. They cannot be recovered remotely from a computer that has never connected. The source Town records remain intact for retry. Local counters/arrays are still browser data; broader balance/game synchronization is outside this change.
- The approved identity scheme still uses existing unique Town names and aliases. Changing aliases or handling duplicate future names requires reviewed account mapping, not automatic guesses.
- Teacher review reads application pages in batches of 100. Interview rounds and command snapshots remain available indefinitely in this proposal; no destructive cleanup is enabled. Agree a school retention/export policy before production. Command snapshots contain private answers and need the same access/retention treatment as reports.
- Responses are saved only after the server confirms a save. Offline typing stays in the open page; leaving before a successful save warns the student. No plaintext draft cache is added to shared devices.
- Local employment applies only a teacher's explicit hire and preserves existing shifts/training/balances. Declining an application does not fire a student from an existing job.
- Audio and installed read-aloud voices depend on the browser/device. The crowd recording is the existing `esp-neon/assets/crowd-cheer.mp3`, CC0 "Cheers and Yays" by qubodup; attribution remains in `esp-neon/credits.html`.

## Reproduce validation

Use Node 24. Install isolated tools:

```sh
npm install --prefix /tmp/tt-employment-qa --no-save @electric-sql/pglite@0.3.14 playwright@1.51.1 jsdom@26.1.0
TT_PGLITE=/tmp/tt-employment-qa/node_modules/@electric-sql/pglite node tests/employment/flow.cjs
node /tmp/tt-employment-qa/node_modules/playwright/cli.js install --with-deps chromium-headless-shell
NODE_PATH=/tmp/tt-employment-qa/node_modules TT_PGLITE=/tmp/tt-employment-qa/node_modules/@electric-sql/pglite node tests/employment/browser.cjs
```

The fixture runs the actual Edge handler and proposed SQL in in-memory PostgreSQL (PGlite). Only fictional QA Student / QA Other accounts are used. Browser requests to production hosts are intercepted and served by the local fixture or blocked. The workflow has read-only repository permissions and no deploy steps or production credentials.
