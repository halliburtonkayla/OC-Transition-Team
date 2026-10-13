# Student Business Studio — Miss Kayla’s guide

Status: development branch only. The existing live town has not been changed. The isolated `student-business` backend and new `tt_biz_*` tables are staged in the existing Supabase project. No existing tables, functions, profiles, bank balances, housing, or saved personal town data were altered.

## What is built

Cool Vibes has four functional stations: manager, cashier, preparation and inventory. A paid order moves from accurate order entry and change calculation to supply reservation, ingredient measurement, ordered preparation steps, a labeled finished product, and pickup. Restocking and fictional payroll change only the business balance. Receipts and fictional offer letters print or save as PDF.

The same catalog and operations engine serves The Zoo, Guardian Angel, 3K Tire Shop and The Main Attraction. Those four currently use explicitly labeled, editable practice service templates. They still need the groups’ approved detailed service plans. Existing owners’ meeting activities remain available.

The original Cool Vibes item names and ingredient lists are preserved: Coffee, Donuts, Cupcakes, Muffins, Chicken Sandwiches, Milkshakes, Soda, Slushies, Fruit, Cake Pops, Cake Filled Items and Croissants. Supply costs come from the repository’s Cool Vibes ingredient shopping list. Original selling prices and quantities were blank. Miss Kayla must enter prices and review practice supply units and preparation steps before the shared café opens. These steps are simulation instructions, not real food preparation instructions.

Four large illustrated teen co-owner portraits use the requested modest owner uniforms and final hairstyle direction. Only existing first-name profiles are used in the shared workspace.

## Start a classroom session (after the development changes pass browser QA)

1. Open Transition Town, enter a business through its existing map or directory entrance, and choose **Enter Shared Business Studio**. The original meeting activity is still beneath this link.
2. In the teacher panel, enter the same private teacher code used by the Town Central Hub. Selecting the Miss Kayla town profile alone does not authorize the shared business controls.
3. Choose one Pre-ETS service, 30 minutes or a longer session, and the active businesses.
4. Choose **Practice copy** for a resettable activity, or leave it unchecked to continue saved business operations.
5. Select **Start new classroom session**. Show students the temporary eight-character classroom code. Sessions expire automatically.
6. Approve each physical student device after comparing its four-character pairing code and confirming who is using it. Never approve based on a name alone.
7. Confirm the default roles: Olivia—Manager; Kaylee—Cashier; Alyssa—Preparation; Jocquan—Inventory. Use the role selector to rotate jobs. Enable **Individual mode** for an approved student who needs to operate all stations when classmates are absent.
8. For a new business, review opening supply quantities and pack costs first. Then enter each selling price, review the steps and practice quantities, and approve the menu. The manager can now open the business.
9. Watch business finances, tasks, presence and hiring progress. End the session when class ends. Saved-business progress survives the next classroom session; practice copies are separate per session.

Keep the teacher code private. It is sent only to server-side verification and is retained only in the teacher browser’s session storage. Use **Leave / Lock** before a student uses that computer.

## Join from separate Chromebooks

1. Each student opens the same Business Studio page and chooses the correct business.
2. Each selects their existing town profile and enters the classroom code.
3. Each chooses **Request to join**, then shows Miss Kayla their pairing code.
4. After approval, the assigned station becomes usable. Teammates can see shared customer orders, inventory, finances, decisions and recent activity.
5. Students can clock themselves in and out from the business interior. These are attendance records, not personal bank payments.
6. Leave the page open during the activity. Confirmed work is stored on the server. If disconnected, reconnect to refresh. If an action’s confirmation is uncertain, use **Retry same activity**; do not create a second payment.

One approved device per profile per session prevents another student from claiming an already-approved identity. Revoke an old device before approving a replacement. The session code alone never grants business access.

## Direct a virtual interview

1. Miss Kayla opens **Interviews** on her own authenticated device.
2. In **Private Interview Director**, choose Excellent, Poorly Prepared, Nervous but Qualified, Mixed or Surprise, or randomize. This setting is removed from student responses. It applies to the next interview.
3. The student manager reviews a fictional application and begins an interview. No real applicant or second student is required.
4. The manager chooses from 20 questions or writes a job-related question. The free, topic-matched response system answers the relevant topic; an unrecognized question asks for clarification. It is not a paid generative chatbot.
5. After at least three questions, each approved team member may record strengths, concerns, evidence and ratings.
6. The manager hires, declines or requests another interview, with a written job-related reason. Hiring requires a fictional position, wage and schedule. Evaluations, dialogue and decisions remain saved after another applicant is opened.
7. **Employees** contains offer letters, position/wage/schedule changes, fictional clock-in/out, completed shifts and simulated payroll.

Nervousness, disability, race, gender, hairstyle or appearance alone is not evidence of poor job fit. The poorly prepared scenario demonstrates job-related behaviors such as missed attendance notice, interruption, phone distraction and failure to follow sanitation procedures.

## Reports for 30-minute Pre-ETS sessions

Choose **Review / print student reports** in the teacher dashboard. Enter your personally observed skills and a suggested next activity for each student, then prepare individual reports and print/save as PDF. Reports contain the first-name town profile, date, business, role, clock times, recorded tasks and one selected Pre-ETS service. Recorded skills practiced and teacher-observed skills are explicitly separated. Confirm actual attendance, support needs and the service before filing; do not infer service units from the software.

A useful session sequence is 5 minutes to open/assign roles, 15 minutes of operations or interviews, 5 minutes of team decisions, and 5 minutes to review and plan.

## Demonstration

The downloadable `Cool_Vibes_Practice_Demo.html` is a self-contained local practice demonstration. Switch the **Demonstration role** on the business interior to try Olivia’s management, Kaylee’s register, Alyssa’s preparation, Jocquan’s inventory, and Miss Kayla’s director. The demo has labeled sample prices, does not connect classmates, and never writes personal town balances.

For actual multiplayer after browser QA: open four separate browser profiles, one for each owner, approve all four through a fifth teacher window, then have Kaylee enter/pay an order while Alyssa prepares it and Jocquan restocks. Watch the same task feed and finances in Olivia’s view. The scripted four-client API test verifies the backend flow but does not replace this required browser demonstration.

## What was verified

- Seven engine tests: complete order/payment/preparation/pickup, five-business reuse, stock setup, role/business isolation, all 20 questions for five behaviors, custom question classification/clarification, hidden scenarios, evidence-based evaluation, hiring, offer data, schedules, payroll, prior interview retention, and failed-command immutability.
- Node DOM test: all eight station views, working demo forms, order/payment/preparation controls, four portrait cards, 20 questions, draft/focus retention on updates, and no writes to existing personal town storage. This is not browser or visual testing.
- Four independent live API clients against an isolated temporary practice fixture: concurrent updates, exactly-once payment retries, reconnecting, saved stock/order state, permissions, teacher access rejection, claimed-identity isolation, interview/evaluation/hiring and exact business finances.
- Revoking a device prevented it from reading shared state. Ending the test session prevented subsequent student access.
- Database permissions: anonymous clients cannot select business state or execute the commit RPC; RLS is enabled on every new table. The service-only functions use SECURITY INVOKER. Scenario data is stripped server-side.
- Existing core regression tests for Transition Life, driving, basketball, football and softball passed.
- Existing town source changes are limited to two added entry links, plus the Central Hub link. Existing assets and other features remain unchanged.

## Required before publishing

Browser-control capability is unavailable in this environment. Consequently, these required checks are still pending: four actual browser sessions; teacher start/approve/end and private director from the real teacher code; profile selection; clickable map/buildings; personal bank; housing/neighborhoods; Career & Job Center; police/fire; Training & College; park/Storytime; audio; portrait/landscape scrolling and navigation; and student progress on actual devices. Do not merge this development branch into `main` or publish until these checks pass. Existing core tests and unchanged source are evidence of preservation, not a claim that browser regressions have been tested.

## Free-tier and operational limits

The connected organization is on the Free plan. No paid student accounts, new paid project/branch, or paid AI interview service were added. Supabase currently includes 500,000 Edge Function invocations/month, a 500 MB database, and 5 GB uncached egress on Free. These quotas are shared with other existing project features; see [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase) and [Edge Function usage](https://supabase.com/docs/guides/platform/manage-your-usage/edge-function-invocations).

Live updates use authenticated short polling every three seconds, not WebSocket subscriptions. Four students make about 4,800 status/snapshot calls in a 30-minute session, plus actions and teacher calls. Hidden tabs stop polling. Keep active business tabs limited to classroom use and monitor actual project usage. Larger classes may need a longer refresh interval. Long-running businesses will eventually need archival/export of old receipts and audit events; no saved progress is silently deleted.

The new backend reuses the existing private teacher-code verification service. Its strength depends on keeping that code secret and choosing a strong private code. Only hashes of random 256-bit student device tokens are stored in the database. Browser session storage allows reconnecting in the same browser session; a closed/replacement browser must be approved again. No service-role credentials exist in public files.

Old on-device owner meeting histories and balances remain unchanged. The new shared ledger is distinct and begins with $5,000 simulation capital; it does not silently import or overwrite old device-specific business balances.

## Illustration assets

The built-in image-generation tool created and edited the bitmap assets. The selected project files are `student-business/assets/team.png` and `student-business/assets/cafe.png`; the app uses the four quadrants of the portrait atlas without shrinking them to walking sprites. These are fictional illustrations based on general descriptions, not photo replicas.

Final portrait prompt: Refine the 2×2 Cool Vibes owner atlas to feel like high-school teens aged 16–17. Preserve identities, skin tones, glasses, quadrant placement and red branded café aprons. Use natural youthful faces, minimal makeup, friendly expressions, relaxed modest black long-sleeved crewneck shirts, and Jocquan’s charcoal hoodie under his apron. Add subtle coffee/star apron pins. Olivia has shoulder-length blonde hair; Kaylee has straight brown hair just below her shoulders and glasses; Alyssa has neat long half-up brown hair, refined rectangular glasses and a clipboard; Jocquan has big dark curls. Keep covered waists, loose fits, readable Cool Vibes and first-name Co-Owner badges, cinematic 3D illustration, pastel backgrounds and consistent lighting.

Café background prompt: A polished colorful cinematic 3D café interior inspired by the student concept, with red/blush booths, pale-blue accents, mint plants, warm wood, a pastry display with the student menu foods, register/service counter, kitchen doorway, drink station and supply shelves. Front-entrance eye-height view, cheerful teen hangout, no people, labels or watermarks; clear areas for clickable station controls.
