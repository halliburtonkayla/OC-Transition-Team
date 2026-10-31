# Student Business Studio reconciliation — October 31, 2026

This development change recovers free service-card rehearsal from the older Studio without publishing its separate business system. The released workday, bank, interviews, classroom monitor and original artwork remain the foundation. No deployment, database migration, production-data write, merge or change to PR #1 was performed.

## Compared sources and history

- [PR #1](https://github.com/halliburtonkayla/OC-Transition-Team/pull/1): open draft, head `ba68b4e138fce1b0a5756e9e132bcf5bb99c2137`, branch `dev/student-business-multiplayer`. GitHub comparison against the audited main found 2 unique commits ahead and 119 behind. Its 27-file change introduces `student-business.html`, `student-business/*`, the `student-business` Edge Function and `20261013_student_business.sql`.
- [PR #6](https://github.com/halliburtonkayla/OC-Transition-Team/pull/6): merged October 30, merge commit `8c55046d2db8e927b893472c23369fbae812ae00`. Its release notes identify the duplicate ledger and require reconciliation.
- Audited main: `068111d3b93b25a26cd5305d94e15b1c5255ab83`, including the later detective-progress fix from PR #7. This branch starts from that main, with selected functionality reimplemented against its current contracts. PR #1 and its two original commits are retained unchanged; there is no merge, rebase, force-push or cherry-pick of the old backend.

## Feature comparison

| Feature in the older Studio | Current released implementation | Reconciliation outcome |
| --- | --- | --- |
| Five branded business rooms and service catalogs | Five Opening Day businesses, detailed shop floors, salon studio and existing artwork | Already available; preserve current pages, links, catalogs and images. |
| Café orders, recipes, measurement and change | Workday and shop-floor flows, cash drawer/count-back, recipes and preparation | Already available; do not add another order queue or cash register ledger. |
| Pet care, supervised activities and authorized pickup | Check-in, care cards, feeding, simulated medication checks, kennel care, park route and collection | Already available; existing detailed activities remain. |
| Childcare instructions, headcounts, allergy checks and pickup | Attendance sheet, meals, learning/rest/park tasks, headcounts and authorized adults | Already available; do not replace attendance or weekly billing. |
| Tire work orders and supervisor checks | Service bay, specification matching, virtual tool sequence and final checks | Already available in operational workdays; pricing-stage restriction remains authoritative. |
| Salon consultations, preferences and sanitation | Opening Day plus the detailed ten-service salon studio | Already available in operational workdays; keep its records and pricing gate. |
| Free service practice without stock or money changes | Opening safety/cleaning/counting works before pricing approval; older shop-floor training can consume supplies and record training costs | **Added here:** five service-card rehearsals, available before pricing approval. Rehearsal changes only its own evidence and command receipts. Paid workdays and supply-consuming training keep their existing behavior. |
| Persistent interviews, evaluations and decisions | Existing applicant interviews, ratings, full/short pathways, transcripts, Hire/Hold/Decline, teacher delivery and hired-worker checks | Largely available; retain those applicant IDs, records and hired-worker rules. |
| Private teacher-selected interview behavior and custom questions | Released interviews use their existing applicant/question models | Useful missing feature; deferred. A future director must extend the current interview records and authenticated teacher controls. |
| Purchasing, inventory, wages and business balances | Released checking/savings, owner-pay subaccounts, stock receipts, accrual costs, bills, payroll, profit and ledger | Already available, with incompatible older accounting; no import or reseeding. |
| Shared work and retry-safe commands | Existing shop workspace, revision/CAS retries, approved-device identity and task leases | Reused. Also fixes the workday page comparing its random local device ID with the server's approved-device ID. |
| Teacher-approved pairing, assigned business/role rotation, individual mode | Current monitor approves devices; shared claims coordinate work; solo practice is isolated by profile/browser | Approval and solo practice already exist. Session-specific business/role restrictions and teacher role rotation are still missing. They need a policy decision and current monitor integration, not a second enrollment flow. |
| Teacher overview of all active Studio businesses | Existing all-business banking entry, live student grid, group sessions and private reports | Partial overlap. A session-specific aggregate of active businesses, roles and practice progress remains a possible follow-up. |
| Isolated teacher-started practice-session copies | Current backend has workspace isolation; current workday UI uses its established classroom workspace and local solo mode | A teacher-controlled shared practice-copy lifecycle is not implemented here. Do not equate browser solo mode with a teacher-managed shared practice copy. |
| Shared team notes and generated fictional offer letters | Current task evidence, interview reasons, staff assignments and reports cover parts of this work | Optional additions remain. Keep them as nonfinancial evidence within current records if selected later. |
| Individual activity and teacher observation reports | Current classroom monitor and Pre-ETS review/approval flow; workday CSV/JSON/print | Reused. Rehearsals add actual individual responses, retries, help and early review without claiming observation, independence, attendance or billable time. |

## Conflicts that prevent merging the old system as-is

| Area | Older Studio | Released authority / decision |
| --- | --- | --- |
| State and ledger | `tt_biz_state`, with independent `balance`, `sales`, `expenses`, orders and employees; initial balance is $5,000 | `tt_shop_workspaces`, scope `student-shop-work-v1:<workspace>`, existing shop state, `cash`, `bank`, `finance`, stock and ledger. Opening balances and saved transactions stay intact. |
| Accounting | Its own payment, stock-reservation and immediate payroll rules | Current inventory assets/consumption, accrued wages and bills, checking/savings and owner withdrawals. Adding totals would duplicate cash and expenses. |
| Business IDs and catalogs | `3k-tire`, display-name supply keys, older quantities/prices | `3k-tire-shop`, current slug supply keys, receipt history and teacher-approved price stage. Only instructional case text is adapted; no catalog overwrite. |
| Authentication | Separate temporary Studio codes, member tokens, pairing approvals and private-code teacher authority | Existing Town code plus current monitor's approved, unexpired, unrevoked device token; teacher pricing uses authenticated teacher access. No extra token store or bypass. |
| Rosters and roles | Older default owner assignments and generic manager/cashier/prep/inventory permissions | Existing profiles, owner aliases, approvals and records. This branch does not change any roster or assign a new owner. |
| Reporting | Separate session observations and command history | Existing monitor individual evidence and teacher observations. Shared business totals must not become each student's accomplishments or verified minutes. |
| Migration/history | Additive Studio SQL would still create a competing authority | No Studio SQL or Edge Function is copied. Any live old records must first be inventoried read-only and reconciled by provenance, never summed into current money. |
| Artwork/navigation | Separate interiors, entry links and older town edits | Original main map, hallway, existing interiors, profile art and activity navigation are unchanged. No old image bundle is imported. |

## Implemented behavior and data contract

Open an existing business workday and expand **Free service rehearsal**. Read the fictional service card, answer each choice, request read-aloud help, or finish early for review. Teammates share the current card; ordered step IDs prevent two devices advancing the same step twice. Wrong choices stay recorded and allow another attempt. Completed cards and early reviews remain distinguishable. CSV, JSON and printable individual response tables are available.

`rehearsal-core.js` extends `TTBusinessCore.reduce` with four nonfinancial commands: `rehearsal-start`, `rehearsal-answer`, `rehearsal-hint`, `rehearsal-end`. It adds `state.rehearsal` in the existing shop record and reuses the existing `seen` command receipts. Every previous state field is preserved. No new database table, ledger, authentication service, wallet, business or student profile is introduced. Older financial commands also retain the new rehearsal history.

Shared commands go through the same `student-shop-work` handler, approved-device validation, per-business workspace and revision comparison. The server sets the actor/device from the approved record, including on retries. Workday responses now return that caller identity, so existing task claims can be used and renewed by the browser under the same ID. The shared worker selector is locked to that identity; solo selection remains available. No raw token is returned or written into rehearsal evidence.

The response advertises `rehearsalVersion: 1`. A frontend connected to the older backend disables shared rehearsal controls and explains the required update; it does not switch a team into solo practice. For rehearsal writes, the salon's unrelated legacy import/stock normalization is skipped, so free rehearsal cannot trigger a financial/catalog migration. Existing salon operations keep their previous import path.

Existing monitor events receive each responding worker's question, chosen answer, result and help request through supported event fields. The full responses also remain in the existing workspace. Report labels explicitly identify application-reported practice. Teacher verification and observation still occur in the current monitor; no observation or service-unit record is fabricated.

There is no automatic rehearsal-history deletion. At 100 attempts, a card can be ended for review and another started, retaining all attempts. At 100 rehearsal records in one workspace, new starts stop with an explicit export/review message. Choose a supported archival/workspace policy before using this beyond the initial classroom pilot; this branch does not erase history to stay under a limit.

## Verification

All tests use synthetic identities/records and isolated transports. They make no production purchases, balance changes or student-record writes.

- `node tests/business-rehearsal.cjs`: five businesses; exact preservation of all previous state fields; wrong responses/help; retries and stale steps; resume and early review; history limits; pricing gates; escaped output; older financial operations retaining rehearsal history.
- `node tests/business-rehearsal-edge.cjs`: the actual Edge handler with REST fixtures; missing/pending/expired/revoked/unknown tokens; forged identity rejection; deterministic concurrent-read/CAS collisions; duplicate delivery and stale teammate responses; business/workspace separation; exact prior balance, stock, unfinished tasks, reports and legacy salon preservation; no calls to a second ledger.
- `node tests/business-rehearsal-dom.cjs`: actual workday scripts; all five cards, reload/resume, audio/help, CSV/JSON, report events, personal-wallet/interview preservation, current task-claim identity, shared selector lock, lost-response replay, interrupted connection and older-backend gating.
- Existing shop/bank, ten-service salon, workday, Edge, pricing approval, classroom monitoring and multiview regressions pass. Broader activity/game regression results are recorded in the PR checks.
- Current-checkout script/link audit: no missing local references or syntax errors. Protected source comparison confirms the original map, hallway, catalogs/avatars, wallet/session code, original activity pages and teacher reporting source are unchanged.
- Cloud-browser isolated preview: all five complete service cards; café correction/retry; tire/salon pre-pricing practice; unchanged displayed balances; salon reload retains responses; existing artwork/layout reviewed. Preview fetch is blocked from contacting production. [Review screenshot](review/business-rehearsal-final-20261031.jpg).
- The classroom CI now includes these suites. Its existing browser workflow additionally checks all five rehearsals, response history/reload, unchanged checking and 390/768/1366px overflow/screenshots.

Local DOM testing uses `jsdom@26.1.0` installed outside the repository (`SCHOOL_JSDOM` can point to it). No application dependency is added. Current Supabase auth documentation and changelog were checked; this change retains the custom approved-device authorization and introduces no SDK/configuration change. The announced TLS cipher removal does not alter this contract; physical school-device/network validation remains required.

## Remaining release decisions

1. Review the CI/browser artifacts and run a teacher-approved classroom pilot on physical Chromebooks plus the intended Safari/touch devices. Verify real approval, revoke/expire, teammate retry, audio and the existing teacher report views. Fixture/desktop checks do not prove school-network behavior.
2. Coordinate a reviewed `student-shop-work` update and frontend release. The capability check protects a frontend arriving before its backend. No function or frontend deployment is authorized by this draft; no migration is required.
3. Decide whether teacher-controlled business assignments, role rotation, a consolidated business overview, interview scenarios/custom questions, shared notes or offer letters should be the next port. Define roles against the existing monitor identity and current records before adding permission rules.
4. Inspect any old `tt_biz_*` live records read-only before deciding whether to retain, archive or selectively import nonfinancial evidence. This task compared source; it did not assert that those deployed tables are empty or delete them. An import needs explicit ID mapping, provenance, duplicate handling and a reviewed rollback plan; it must never add old balances to current balances.
5. Set the rehearsal export/archival and shared practice-workspace policy before extended use. Existing monitor retention and existing shop/workday history limits continue; exporting one report does not automatically archive or delete records.
6. Keep PR #1 as the historical source until the remaining decisions are resolved. A later decision to close it as superseded or retire its old service is separate from this development change. Do not merge it into main to obtain this feature.
