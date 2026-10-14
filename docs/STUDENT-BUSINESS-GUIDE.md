# Five student businesses — classroom guide

Status: development branch only. No merge or publication to the live town. The existing map, bank, housing, profiles, games, navigation, audio and saved personal progress remain intact. Two new business entry links and the requested business-roster corrections are the only existing town source changes.

## Current activities and stages

| Business | Activities available | Pricing status |
| --- | --- | --- |
| Cool Vibes | Shared orders, change, recipes, measuring, pickup, supplies, interviews and staffing | Student menu/ingredients retained; missing selling prices require teacher review |
| The Zoo | Pet-care instructions, supply counts, supervised activity, concern reporting and verified pickup | Recovered student pet-care price retained; other prices require review |
| Guardian Angel | Care cards, child counting, allergy-aware activity choices, logs and authorized pickup | Recovered weekly-plan price retained; teacher review required |
| 3K Tire Shop | Work orders, parts/specification matching, supervised safety decisions and final checks | PLANNING ONLY: no prices, checkout, purchases, wages or sales |
| The Main Attraction | Consultations, appointment matching, sensitivity/sanitation decisions, customer preference and cleanup | PLANNING ONLY: no prices, checkout, purchases, wages or sales |

The tire shop and salon have not held their pricing meetings. Their planning lock is enforced on the server, not just by hiding buttons. Free service practice records completed work without charging customers or consuming saved business stock. Interview questions and evaluations remain available; paid hiring and payroll remain locked in those two businesses.

Recovered student work sets the service names, branding, and any established prices. Extra decision exercises and virtual supply units are explicitly classroom simulations. They are not real cooking, childcare, pet-medication, chemical-treatment or mechanical-repair instructions.

Reusable equipment is counted but not used up when a paid service begins. Consumable supplies are reserved once. Practice activities never affect personal town balances. Saved business capital is distinct from the original $1,000 project shopping exercise; the original shopping totals are retained as project reference information.

## Start and join

1. Open the existing business entrance in Transition Town and choose **Enter Shared Business Studio**. The original owner meeting stays available.
2. Miss Kayla enters her private Town Central Hub code. Selecting a teacher profile does not authorize the shared controls.
3. Choose active businesses, one Pre-ETS service, duration, and either a saved-business session or separate practice copy. Start the session and show its temporary code.
4. Students select their existing town profile and business, enter the code, and show their pairing code on their physical device. Verify identity before approving.
5. Approve devices, rotate roles, change a device’s assigned active business, or enable individual mode. One approved device per profile per session prevents duplicate identity claims.
6. Use the teacher roster for current default groups and unassigned profiles. The requested departed member has been removed from the pet-care project; personal town history is preserved. The corrected daycare group comes from the current handwritten packet.
7. The teacher overview shows all active businesses. Planning businesses show no monetary figures. Current selected-business updates refresh every three seconds; the overview refreshes every fifteen seconds.
8. Students clock themselves in and out. End the session when class ends. Saved inventory, orders, interviews, employees, decisions and finances remain available in the next saved-business session.

If an earlier practice copy contains a one-item generic template, Miss Kayla can choose **Load recovered service planning catalog** or **Load the recovered student service catalog**. This is explicit, preserves finances and matching stock, and requires open tasks to be completed first. It does not silently overwrite existing progress.

## Stations

Manager: plan duties, open/close eligible businesses, review fictional applications, interview and make evidence-based decisions.

Customer service: listen to a request, enter accurate items/quantities, calculate change, issue a simulated receipt and release completed work. These paid functions are disabled in planning-stage businesses.

Service worker: follow the recipe or service card, count supplies and complete the correct job-specific decision before advancing. Pet care, childcare, tire work and salon work have distinct safety and accuracy checks.

Inventory: count supplies and place affordable orders in operating businesses. Planning groups identify equipment and consumable supplies without setting costs or buying them.

## Interviews and reports

Miss Kayla chooses or randomizes the next applicant behavior in the private Interview Director. Students do not receive the selected scenario field. The manager asks from twenty topic-matched questions or writes a question. Unrecognized questions ask for clarification. There is no paid AI chatbot or real applicant.

After at least three questions, each team member can evaluate strengths, concerns, evidence and four job-related ratings. The manager can request another interview or decline with evidence. Businesses ready for operations also support fictional hiring, offer letters, positions, wages, schedules, clock-in/out and reviewed payroll.

Prior interview dialogue, evaluations and hiring decisions stay saved after another applicant begins. Nervousness, disability, race, gender, hairstyle or appearance alone must not be treated as poor job fit.

Print individual activity reports from the authenticated teacher area. Enter personally observed skills and a suggested next task. Reports distinguish automatically recorded practice tasks from teacher observation, include the selected single Pre-ETS service, and do not infer service units or verified attendance.

A 30-minute session can use five minutes for roles/opening, fifteen for practice, five for a team decision and five for reviewing progress.

## Unnamed character review and privacy

The private downloadable five-business review has large illustrated teen characters with no personal name tags. Its avatar cards show role labels, and it includes an unnamed gallery for the supplied character designs. Student names are still needed for approved classroom identity, teacher rosters and reports; removing visual labels is not full anonymization.

Personalized portrait rasters are excluded from the latest public source. The public workspace uses generic role cards pending district-approved private artwork delivery. The four new business interiors contain no people or personal names and are suitable for the staged source.

Earlier named cafe portraits were placed in the public development commit before this concern was raised. Removing a file from the latest branch does not erase earlier GitHub commits or copies. Do not treat the current removal as proof of deletion or legal compliance; review the earlier exposure and approved AI-service use with the district privacy lead.

A fictional avatar is not automatically a FERPA breach, but recognizable features plus names or school/group context can identify a student indirectly. First names and removal of a badge do not guarantee anonymity. Do not put disciplinary placement, disability, behavior notes, student IDs or service records in public artwork. See [Department of Education guidance on identifiable information](https://studentprivacy.ed.gov/content/personally-identifiable-information-education-records) and [online educational services](https://studentprivacy.ed.gov/resources/protecting-student-privacy-while-using-online-educational-services-requirements-and-best).

The downloaded review is for private teacher review, not authorization to publish personalized characters. It runs locally and does not contact the shared service. Switching its business selector preserves that business’s temporary local practice state. It does not constitute a four-Chromebook multiplayer demonstration.

## Validation and release limits

Passed: ten core business tests; Node DOM checks for all five interiors, station views, unnamed role cards, four distinct service decision workflows and printable service reports; exact planning-stage money restrictions; reusable equipment; interview/evaluation/decision retention; and no writes to personal town storage. Existing core regression tests for Transition Life, driving, basketball, football and softball also pass. Static preservation checks account for only the new links and requested roster changes.

Live API tests use four independent approved clients for each of five isolated practice sessions. They verify concurrent activity, shared service progress, reports, saved interview decisions, hidden scenarios, no practice charges and the tire/salon pricing locks. The earlier cafe test verifies exactly-once payment retries and reconnecting. These are API clients, not real browsers.

Required before release: four actual browser sessions, real private teacher start/approve/assignment/director/end flows, Chromebook/tablet/phone layout, scrolling, audio and all requested town browser regressions. Browser-control capability is unavailable here. The draft must not be merged or published until those checks pass.

The existing Supabase organization is Free. No new paid project, paid student accounts or paid interview service were added. Current Free allowances include 500,000 Edge Function invocations/month, a 500 MB database and 5 GB uncached egress, shared with the existing project. [Current Supabase billing documentation](https://supabase.com/docs/guides/platform/billing-on-supabase).

Authenticated short polling, rather than WebSocket subscriptions, drives classroom updates. Hidden tabs stop polling. Large classes may need a longer refresh interval; monitor real usage and archive old receipts/audit records deliberately rather than silently deleting progress.
