# Transition Town School activity and navigation audit

Audited 2026-10-28. Existing files, Town records, business pages and game URLs are preserved.

198 existing HTML pages inspected. 4 literal local references still point to absent repository files. The remaining references are listed below. External URLs, dynamic destinations, playback and game behavior require separate checks.

## Navigation decisions

- School entry now presents six room signs. All original hallway actions remain under Original hallway.
- The two Ready, Set, Work! activities are labeled Connected classroom game show and Solo / shared-keyboard game show to distinguish their different modes.
- Career exploration and résumé/interview tools are under Career & Interview Studio; practical simulators are under Job Missions; arcade, math and life games are under The Wow Zone.
- Kindness & Creativity links group projects, storytelling and coloring.
- Teacher Resource Center uses the existing authenticated teacher dashboard. No authentication or student records are migrated.
- Backup index files, house models and book chapters are retained but omitted from the main directory. Their library/parent pages remain accessible.
- Fixed active pages that requested session.css, game-ui.css or session.js from the wrong directory; existing root implementations are reused.
- Fixed book Library and end-of-book Home links that escaped the project path.

## Existing activities and current local links

| Existing URL | Page title | Room | Local links | Missing references |
| --- | --- | --- | ---: | ---: |
| 3k-tire-shop.html | 3K Tire Shop • Owner Interviews | town | 9 | 0 |
| ADD-THIS-BUTTON.html | Untitled | compatibility | 1 | 0 |
| INDEX_CHANGES.html | Untitled | compatibility | 2 | 0 |
| after-party-book.html | The After-Party \| Transition Team | wow | 2 | 0 |
| anger-conflict-simulator.html | Anger, Conflict & Self-Control Lab \| Transition Team | jobs | 5 | 0 |
| animated-stories.html | Animated Life Stories | kindness | 2 | 0 |
| apartment-simulator(3) (2).html | My First Apartment Simulator | compatibility | 5 | 0 |
| apartment-simulator(5).html | Apartment Living Simulator | compatibility | 5 | 0 |
| apartment-simulator.html | Apartment Living Simulator | jobs | 5 | 0 |
| ask-for-help-self-advocacy.html | Ask for Help &amp; Self-Advocacy \| Transition Team | watch | 3 | 0 |
| attendance-reliability.html | Attendance &amp; Reliability \| Transition Team | watch | 3 | 0 |
| automotive_mechanic_career_presentation.html | Automotive &amp; Mechanic | studio | 3 | 0 |
| automotive_mechanic_presentation.html | Automotive &amp; Mechanic Careers \| Transition Team | studio | 2 | 0 |
| bank.html | Transition Town Bank | town | 4 | 0 |
| between-two-worlds-book.html | Between Two Worlds \| Transition Team | wow | 2 | 0 |
| book-01.html | Alyssa&#x27;s First Day at the Bakery | compatibility | 1 | 0 |
| book-02.html | Jasmine &amp; Gia&#x27;s Daycare Disaster | compatibility | 1 | 0 |
| book-03.html | Haley&#x27;s Very Busy Vet Clinic | compatibility | 1 | 0 |
| book-04.html | Chevi Becomes an Art Teacher | compatibility | 1 | 0 |
| book-05.html | Nick Has NO Idea What He Wants to Be | compatibility | 1 | 0 |
| book-06.html | I Can&#x27;t Wait Till I&#x27;m Grown! | compatibility | 1 | 0 |
| book-07.html | The Text That Almost Ruined Friday | compatibility | 1 | 0 |
| book-08.html | Dalton&#x27;s First Coding Job | compatibility | 1 | 0 |
| book-09.html | Olivia&#x27;s First Day in Sonography | compatibility | 1 | 0 |
| book-10.html | Kaylee Takes Charge | compatibility | 1 | 0 |
| book-11.html | Jayden &amp; Clark Get a Job | compatibility | 1 | 0 |
| book-12.html | The Group Project Nobody Wanted | compatibility | 1 | 0 |
| build-your-own-story.html | Build Your Own Story | kindness | 2 | 0 |
| business-startup-marketplace.html | Business Startup Marketplace | studio | 2 | 0 |
| career-adventures.html | Career Adventures | studio | 8 | 0 |
| career-challenge.html | High School Career Challenge | studio | 5 | 0 |
| career-explorer.html | Career A–Z | studio | 6 | 0 |
| career-feud.html | Ready, Set, Work! — Career Feud | wow | 6 | 0 |
| career-interest-snapshot.html | Career Interest Snapshot \| Transition Team | studio | 3 | 0 |
| career-research-sheet.html | Career Research Sheet \| Transition Team | studio | 3 | 0 |
| career-scroll.html | Career Scroll \| OC Transition Team | studio | 3 | 0 |
| career-specific-interview.html | Career-Specific Interview Builder \| Transition Team | studio | 3 | 0 |
| career_presentations.html | Career Presentations | studio | 11 | 0 |
| cdc-center.html | CDC Center \| OC Transition Team | watch | 10 | 0 |
| cdc-cleaning.html | CDC Cleaning & Home Skills | jobs | 2 | 0 |
| cdc-cooking-match.html | CDC Make It! Cooking Match | jobs | 2 | 0 |
| cdc-hands-on.html | CDC Hands-On Life & Work Skills | jobs | 1 | 0 |
| cdc-hygiene.html | CDC Hygiene & Daily Routine | watch | 2 | 0 |
| cdc-job-match.html | CDC Job Tool Match | jobs | 2 | 0 |
| cdc-sort-it.html | CDC Sort It! · Transition Town School | wow | 2 | 0 |
| cdl_truck_driving_presentation.html | CDL &amp; Truck Driving Careers \| Transition Team | studio | 2 | 0 |
| childcare-career-center.html | Childcare Career Center | wow | 2 | 0 |
| childcare-simulator.html | Childcare Challenge \| Transition Team | jobs | 3 | 0 |
| childcare_worker_presentation.html | Childcare Worker \| Transition Team | studio | 2 | 0 |
| classroom-monitor.html | Live Classroom & Pre-ETS · Miss Kayla | teacher | 7 | 0 |
| cleanup-life-skills-game.html | What Do I Need? \| Life Skills Challenge | wow | 4 | 0 |
| cna_nursing_presentation.html | CNA &amp; Nursing Careers \| Transition Team | studio | 2 | 0 |
| coffee-employee.html | Coffee Shop Employee Center | jobs | 6 | 0 |
| coffee-shop.html | Transition Town Coffee Shop | town | 9 | 0 |
| college-story.html | College &amp; Training Story | studio | 5 | 0 |
| college-training-compare.html | College / Training Program Comparison \| Transition Team | studio | 3 | 0 |
| construction_career_presentation.html | Construction Careers | studio | 3 | 0 |
| construction_careers_presentation.html | Construction Careers \| Transition Team | studio | 2 | 0 |
| content_creator_presentation.html | Content Creator \| Transition Team | studio | 2 | 0 |
| cooking-game.html | Cooking Simulator | wow | 7 | 0 |
| cool-vibes.html | Cool Vibes Café • Owner Interviews | town | 9 | 0 |
| cosmetology_barbering_presentation.html | Cosmetology &amp; Barbering | studio | 2 | 0 |
| cosmetology_career_presentation.html | Cosmetology &amp; Beauty Careers | studio | 3 | 0 |
| count-to-100.html | Count to 100 · Transition Town School | wow | 2 | 0 |
| culinary_restaurant_career_presentation.html | Culinary &amp; Restaurant Careers | studio | 3 | 0 |
| culinary_restaurant_presentation.html | Culinary &amp; Restaurant Careers \| Transition Team | studio | 2 | 0 |
| customer-service.html | Customer Service Scenarios \| Transition Team | watch | 3 | 0 |
| day-in-the-life.html | Day in the Life \| OC Transition Team | wow | 4 | 0 |
| dental_careers_presentation.html | Dental Careers | studio | 2 | 0 |
| developer-lab.html | Developer Lab \| Transition Town School | studio | 1 | 0 |
| double-digit-multiplication.html | Double-Digit Multiplication | wow | 2 | 0 |
| downloads.html | Downloads \| Transition Team | teacher | 8 | 0 |
| driving-simulator-game.html | Transition Town · Behind the Wheel | jobs | 5 | 0 |
| driving-simulator.html | Behind the Wheel Simulator \| Transition Team | jobs | 3 | 0 |
| electrician_career_presentation.html | Electrician | studio | 3 | 0 |
| electrician_presentation.html | Electrician Careers \| Transition Team | studio | 2 | 0 |
| entrepreneurship_small_business_presentation.html | Entrepreneurship &amp; Small Business | studio | 2 | 0 |
| entry_level_jobs_presentation.html | Entry-Level Jobs \| Transition Team | studio | 2 | 0 |
| expanded-resource-library.html | Expanded Resource Library | teacher | 2 | 0 |
| farming_careers_presentation.html | Farming &amp; Agriculture \| Transition Team | studio | 2 | 0 |
| fire-department.html | Transition Town Fire Department | town | 7 | 0 |
| firefighter_emt_presentation.html | Firefighter &amp; EMT Careers \| Transition Team | studio | 2 | 0 |
| first-day-work-checklist.html | First Day at Work Checklist \| Transition Team | watch | 3 | 0 |
| first-paycheck-budget.html | First Paycheck Budget \| Transition Team | watch | 3 | 0 |
| game-zone.html | Digital Game Zone | wow | 17 | 0 |
| gaming_careers_presentation.html | Gaming Careers \| Transition Team | studio | 2 | 0 |
| grocery-budget-meal-plan.html | Grocery Budget &amp; Meal Plan \| Transition Team | watch | 3 | 0 |
| grocery-employee.html | Transition Town Grocery Employee Center | jobs | 7 | 0 |
| grocery-store.html | Transition Town Grocery | town | 11 | 0 |
| grocery-trip.html | My Grocery Trip | wow | 5 | 0 |
| group-projects.html | Group Projects \| Transition Team | kindness | 4 | 0 |
| group-readings.html | Group Reading Room \| Transition Team | kindness | 2 | 0 |
| guardian-angel-daycare-simulator.html | Guardian Angel • Daycare Shift | jobs | 1 | 0 |
| guardian-angel.html | Guardian Angel Childcare • Owner Interviews | town | 10 | 0 |
| healthcare-simulator.html | Healthcare Career Simulator \| Transition Team | jobs | 4 | 0 |
| home-beyond.html | Home & Beyond • Transition Town | town | 10 | 0 |
| house-01.html | House 1 — Maple Street Starter Home | compatibility | 6 | 0 |
| house-02.html | House 2 — Cedar Lane Cottage | compatibility | 6 | 0 |
| house-03.html | House 3 — Dogwood Drive Family Home | compatibility | 6 | 0 |
| house-04.html | House 4 — Willow Creek Ranch | compatibility | 6 | 0 |
| house-05.html | House 5 — Pine Ridge Two-Story | compatibility | 6 | 0 |
| house-06.html | House 6 — Maple Grove Estates | compatibility | 6 | 0 |
| house-07.html | House 7 — Meadow Brook Estates | compatibility | 6 | 0 |
| house-08.html | House 8 — Riverstone Ridge | compatibility | 6 | 0 |
| house-09.html | House 9 — Country Acres Single-Wide | compatibility | 6 | 0 |
| house-10.html | House 10 — Willow Creek Ranch | compatibility | 6 | 0 |
| housekeeping_janitorial_presentation.html | Housekeeping &amp; Janitorial | studio | 2 | 0 |
| housing-comparison.html | Top 3 Housing Comparison \| Transition Town | watch | 2 | 0 |
| housing-office.html | Transition Town Housing Office | town | 34 | 0 |
| hvac_career_presentation.html | HVAC | studio | 3 | 0 |
| hvac_presentation.html | HVAC Careers \| Transition Team | studio | 2 | 0 |
| independent-living.html | Independent Living \| OC Transition Team | wow | 15 | 0 |
| index(20260922-155132).html | Transition Team \| Obion County Schools | compatibility | 104 | 1 |
| index-original-backup.html | Transition Team \| Obion County Schools | compatibility | 103 | 1 |
| index.html | Transition Team \| Obion County Schools | compatibility | 15 | 0 |
| index_dropdowns_in_exact_spot.html | Transition Team \| Obion County Schools | compatibility | 104 | 1 |
| index_fixed_presentations.html | Transition Team \| Obion County Schools | compatibility | 106 | 1 |
| interactive-stories.html | What Would YOU Do? \| Transition Team | kindness | 4 | 0 |
| job-application-practice.html | Practice Job Application \| Transition Team | studio | 3 | 0 |
| job-exploration.html | Job Exploration \| OC Transition Team | studio | 12 | 0 |
| jordans-first-day.html | Jordan's First Day at Work \| Transition Team | wow | 2 | 0 |
| just-a-joke-book.html | It Was Just a Joke… \| Transition Team | wow | 2 | 0 |
| landscaping_presentation.html | Landscaping Careers | studio | 2 | 0 |
| laundry-weather-game.html | Laundry Weather Match | wow | 2 | 0 |
| law_enforcement_presentation.html | Police &amp; Law Enforcement \| Transition Team | studio | 2 | 0 |
| life-stories.html | Real-Life Decision Stories | wow | 5 | 0 |
| life-story-library.html | 30 Life Story Adventures \| Transition Team | wow | 4 | 0 |
| main-attraction-appointments.html | Main Attraction \| Appointment Practice | wow | 4 | 0 |
| main-attraction-employee-training.html | The Main Attraction \| Student Training | jobs | 2 | 0 |
| main-attraction-service.html | The Main Attraction \| Shared Service Desk | jobs | 15 | 0 |
| main-attraction-studio.html | The Main Attraction · Beauty Studio | wow | 14 | 0 |
| main-attraction-training.html | The Main Attraction • Owner Interviews | wow | 1 | 0 |
| main-attraction-workstations.html | Main Attraction \| Salon Training | jobs | 5 | 0 |
| main-attraction.html | The Main Attraction • Owner Interviews | town | 12 | 0 |
| mansion-01.html | Mansion 1 — Maple Ridge Estate | compatibility | 6 | 0 |
| mansion-02.html | Mansion 2 — Oak Valley Manor | compatibility | 6 | 0 |
| mansion-03.html | Mansion 3 — Silver Creek Estate | compatibility | 6 | 0 |
| mansion-04.html | Mansion 4 — Riverstone Manor | compatibility | 6 | 0 |
| medical_assistant_presentation.html | Medical Assistant | studio | 2 | 0 |
| memory-match.html | Memory Match · Transition Town School | wow | 2 | 0 |
| miss-kayla-inbox.html | Miss Kayla Central Hub | teacher | 9 | 0 |
| mock-interview-interviewer.html | Mock Interview — Interviewer Guide \| Transition Team | studio | 3 | 0 |
| mock-interview-student.html | Mock Interview — Student Practice \| Transition Team | studio | 3 | 0 |
| money-counting-game.html | Money Counting Game | wow | 2 | 0 |
| move-out-simulator.html | Move Out Simulator \| Transition Team | jobs | 5 | 0 |
| multiplication-wall.html | Multiplication Wall · Transition Town School | wow | 2 | 0 |
| nursing_cna_career_presentation.html | Nursing &amp; CNA | studio | 3 | 0 |
| offer.html | Make an Offer | studio | 7 | 0 |
| office_administrative_presentation.html | Office &amp; Administrative Careers | studio | 2 | 0 |
| parenting-story.html | Childcare Simulator | wow | 5 | 0 |
| park-fishing.html | Fishing at Transition Park | wow | 7 | 0 |
| park-football.html | Friday Night Football · Transition Park | wow | 7 | 0 |
| payday-story.html | Payday Story | wow | 5 | 0 |
| pdf-viewer.html | Opening Printable… | teacher | 5 | 0 |
| pizza-employee.html | Pizza Shop Employee Center | jobs | 7 | 0 |
| pizza-shop.html | Transition Town Pizza Shop | town | 8 | 0 |
| plumbing_career_presentation.html | Plumbing | studio | 3 | 0 |
| plumbing_presentation.html | Plumbing Careers | studio | 2 | 0 |
| police_law_enforcement_career_presentation.html | Police &amp; Law Enforcement | studio | 3 | 0 |
| postsecondary.html | Postsecondary Education \| OC Transition Team | studio | 5 | 0 |
| pre-ets-session-reports.html | Transition Town \| Pre-ETS Session Reports | teacher | 4 | 0 |
| presentations.html | Career Presentations | studio | 16 | 0 |
| read-work-schedule.html | Read a Work Schedule \| Transition Team | watch | 3 | 0 |
| real-life-simulator.html | Real Life Simulator \| Transition Team | jobs | 4 | 0 |
| relax-color.html | Relax & Tap Color \| Transition Team | kindness | 2 | 0 |
| resource-viewer.html | Printable Student Worksheet | teacher | 5 | 0 |
| resume-builder.html | Simple Resume Builder \| Transition Team | studio | 2 | 0 |
| retail_employee_presentation.html | Retail Employee \| Transition Team | studio | 2 | 0 |
| salon-simulator.html | Salon Studio Simulator \| Transition Team | jobs | 6 | 0 |
| school-career-lab.html | Job Exploration · Transition Town School | studio | 8 | 0 |
| self-advocacy.html | Self-Advocacy \| OC Transition Team | watch | 6 | 0 |
| shop-floor.html | Student Shop Workday • Transition Town | wow | 14 | 0 |
| simple-recipes.html | Simple Recipes \| Transition Team | wow | 7 | 0 |
| simulators.html | Game Zone &amp; Simulators | jobs | 11 | 0 |
| smart-transition-goal.html | SMART Transition Goal \| Transition Team | watch | 3 | 0 |
| softball-game.html | Softball at Transition Park | wow | 7 | 0 |
| stories.html | What Would You Do? \| Transition Team | wow | 7 | 0 |
| student-businesses.html | Student Shops & Interviews • Transition Town | town | 18 | 0 |
| teacher_teacher_assistant_presentation.html | Teacher &amp; Teacher Assistant | studio | 2 | 0 |
| teamwork-reflection.html | Teamwork &amp; Group Project Reflection \| Transition Team | watch | 3 | 0 |
| the-drama-book.html | The Drama \| Transition Team | wow | 2 | 0 |
| the-zoo.html | The Zoo Pet Sitting • Owner Interviews | town | 9 | 0 |
| transition-game-show.html | Ready, Set, Work! · Transition Town | wow | 6 | 0 |
| transition-life.html | My Home • Transition Life | wow | 12 | 0 |
| transition-town.html | Transition Town | town | 47 | 0 |
| transportation-to-work.html | Transportation to Work Plan \| Transition Team | watch | 3 | 0 |
| truck_driving_cdl_career_presentation.html | Truck Driving &amp; CDL | studio | 3 | 0 |
| veterinary_animal_care_presentation.html | Veterinary &amp; Animal Care \| Transition Team | studio | 1 | 0 |
| veterinary_career_presentation.html | Veterinary Careers | studio | 3 | 0 |
| warehouse_manufacturing_career_presentation.html | Warehouse &amp; Manufacturing | studio | 3 | 0 |
| warehouse_manufacturing_presentation.html | Warehouse &amp; Manufacturing | studio | 2 | 0 |
| welding_pipe_welding_presentation.html | Welding &amp; Pipe Welding \| Transition Team | studio | 2 | 0 |
| work-crew-lab.html | Work Crew Lab \| Transition Town School | jobs | 1 | 0 |
| workplace-communication.html | Workplace Communication Practice \| Transition Team | watch | 3 | 0 |
| workplace-problem-solving.html | Workplace Problem-Solving \| Transition Team | watch | 3 | 0 |
| workplace-readiness.html | Workplace Readiness \| OC Transition Team | watch | 15 | 0 |
| workplace-simulator.html | Virtual Workplace Simulator \| Transition Team | jobs | 8 | 0 |
| worksheets.html | Worksheet Library \| Transition Team | teacher | 25 | 0 |

## Pre-existing missing local references

- index(20260922-155132).html → Transition_Team_Resource_Library_Guide.docx
- index-original-backup.html → Transition_Team_Resource_Library_Guide.docx
- index_dropdowns_in_exact_spot.html → Transition_Team_Resource_Library_Guide.docx
- index_fixed_presentations.html → Transition_Team_Resource_Library_Guide.docx

## Duplicate, confusing and unfinished navigation

- The old hallway exposed Career Lab, classroom, educational-game and training links both as doors and in a long footer. The six-room directory groups those destinations, with at most eight catalogue items per page.
- Both game shows used Ready, Set, Work! labels. The directory now distinguishes connected classroom play from solo/shared-keyboard play.
- Four old simulator landing pages had #demo buttons without an activity target. Their buttons now link to existing working Town activities: workplace retail → Job Missions, restaurant → Pizza Employee, auto → 3K Tire Shop, veterinary → The Zoo; salon → Main Attraction Studio; move-out → Transition Life; conflict → Workplace Problem Solving. The original landing pages and URLs remain intact.
- index_fixed_presentations.html has a pre-existing #quickChoice fragment needing review in that archived index. It is not part of the active school directory.
- shop-floor.html generates its #work-content target at runtime; its static fragment warning is not treated as broken.
- Four archived index snapshots still reference the absent Transition_Team_Resource_Library_Guide.docx. No substitute was invented.

## Content needing manual review

No literal coming-soon or under-construction markers found.

## Verification limits

The inventory is a static audit, not a claim that every legacy game has been manually played. New room links are validated against the repository tree. New mission rules, narrated lessons, worksheet alignment and quiz progression have separate automated tests. No outside video is embedded in the new learning center; it uses original timed narrated animated lessons.
