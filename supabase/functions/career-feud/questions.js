// Teacher guidance is served only to the authenticated host during play.
export const BANK = [
  {
    "id": "WO-1",
    "focus": "Workplace Readiness",
    "category": "Customer service",
    "prompt": "A customer says your café made the wrong drink, but the order ticket matches what you served. What would you say, what would you check, and when would you involve a supervisor?",
    "lookFor": [
      "Listen without blaming",
      "Clarify the requested drink and check the ticket",
      "Follow remake or refund policy and ask for authorization"
    ],
    "alternatives": "Accept a calm apology for the experience without admitting an unverified error; involving a supervisor early is reasonable.",
    "points": 10,
    "teaching": "A matching ticket does not end the conversation. Listening and checking policy can resolve a complaint respectfully."
  },
  {
    "id": "WO-2",
    "focus": "Workplace Readiness",
    "category": "Priorities",
    "prompt": "You are zoning a grocery aisle when a customer asks for help. You notice a spill, and your supervisor expects the aisle finished soon. Explain what you would do first, what you would communicate, and how you would handle the remaining tasks.",
    "lookFor": [
      "Protect people from the spill",
      "Get trained cleanup support and acknowledge the customer",
      "Update the supervisor and return to zoning"
    ],
    "alternatives": "A teammate may help the customer while another guards the spill. Accept different safe sequences with a clear reason.",
    "points": 10,
    "teaching": "Immediate hazards take priority. Communicate delays instead of silently abandoning assigned tasks."
  },
  {
    "id": "WO-3",
    "focus": "Workplace Readiness",
    "category": "Zoning",
    "prompt": "While zoning cereal, you find a frozen meal on a warm shelf, an open package, and cereal behind the wrong price label. Identify the different problems and explain your next steps.",
    "lookFor": [
      "Separate food-safety concerns from shelf presentation",
      "Report or handle damaged and temperature-abused products by policy",
      "Match cereal to its correct product and shelf label"
    ],
    "alternatives": "Accept asking a trained employee to handle the food rather than guessing whether it can be sold.",
    "points": 10,
    "teaching": "Zoning includes correct placement and noticing problems, not just making the front row look neat."
  },
  {
    "id": "WO-4",
    "focus": "Workplace Readiness",
    "category": "Stocking",
    "prompt": "New yogurt arrives while older yogurt is already on the shelf. A coworker says to put the new stock in front because it is faster. Explain your response and your stocking plan.",
    "lookFor": [
      "Check dates and condition",
      "Rotate eligible older stock forward following policy",
      "Keep items at safe storage conditions and explain the reason"
    ],
    "alternatives": "Accept asking a supervisor about the store's rotation method; do not require technical terminology.",
    "points": 10,
    "teaching": "Rotation reduces waste, but expired or damaged items should not be pushed forward for sale."
  },
  {
    "id": "WO-5",
    "focus": "Workplace Readiness",
    "category": "Stocking",
    "prompt": "A shelf label matches the brand but not the size of the item you are holding. Your cart is blocking the aisle. What would you do first, and how would you confirm the correct location?",
    "lookFor": [
      "Move the cart to a safe permitted location",
      "Compare item size and product code to the shelf label",
      "Ask for help if the correct location is unclear"
    ],
    "alternatives": "A scanner or inventory lookup is a reasonable alternative to a product-code comparison by eye.",
    "points": 10,
    "teaching": "Brand alone is not enough to identify a shelf location. Keep customer access clear."
  },
  {
    "id": "WO-6",
    "focus": "Workplace Readiness",
    "category": "Cash accountability",
    "prompt": "Your drawer is $12 short at the end of a shift. A coworker suggests adding your own money so no one notices. Explain what you would do and say.",
    "lookFor": [
      "Do not hide the difference or add personal funds",
      "Recount using the approved procedure",
      "Report facts and review transactions with authorized support"
    ],
    "alternatives": "Accept asking a supervisor to witness the recount; do not require deciding who caused the shortage.",
    "points": 10,
    "teaching": "Accurate reporting protects accountability. A shortage is investigated, not concealed."
  },
  {
    "id": "WO-7",
    "focus": "Workplace Readiness",
    "category": "Cashier",
    "prompt": "A customer gives you $20 for an $8.65 purchase, then asks to swap bills while you count the change. How would you keep the transaction accurate and professional?",
    "lookFor": [
      "Complete one exchange at a time",
      "Keep the original payment clear and verify $11.35 change",
      "Ask a supervisor if confused"
    ],
    "alternatives": "Accept using the register display and counting back, or pausing and restarting the count with support.",
    "points": 10,
    "teaching": "Slowing down is appropriate when money exchanges become confusing."
  },
  {
    "id": "WO-8",
    "focus": "Workplace Readiness",
    "category": "Cashier",
    "prompt": "An item scans at $7.99, but a customer says the shelf says $5.99. A line is forming. What would you say, verify, and do next?",
    "lookFor": [
      "Acknowledge the concern calmly",
      "Verify the exact item and shelf price",
      "Use authorized price-correction procedures and communicate the wait"
    ],
    "alternatives": "Accept calling an authorized checker while remaining at the register.",
    "points": 10,
    "teaching": "Do not guess a price or promise a discount beyond your authority."
  },
  {
    "id": "WO-9",
    "focus": "Workplace Readiness",
    "category": "Cashier",
    "prompt": "Your friend asks you to use your employee discount on their purchase and says nobody will know. Explain how you would respond and check what is allowed.",
    "lookFor": [
      "Set a respectful boundary",
      "Check the discount policy",
      "Seek clarification rather than secretly applying the discount"
    ],
    "alternatives": "Accept a brief refusal pending policy confirmation without accusing the friend of wrongdoing.",
    "points": 10,
    "teaching": "Friendly relationships do not replace transaction rules."
  },
  {
    "id": "WO-10",
    "focus": "Workplace Readiness",
    "category": "Order accuracy",
    "prompt": "A café ticket says no dairy, but the cup beside it is unmarked and another employee says it is probably oat milk. What would you do before serving it, and what would you tell the customer?",
    "lookFor": [
      "Do not guess ingredients",
      "Verify or remake using trained procedures and prevent mix-ups",
      "Explain the delay without promising allergy safety you cannot verify"
    ],
    "alternatives": "Accept asking the trained supervisor to take over the order.",
    "points": 10,
    "teaching": "Ingredient uncertainty needs verification. Speed does not justify guessing about food restrictions."
  },
  {
    "id": "WO-11",
    "focus": "Workplace Readiness",
    "category": "Fast food",
    "prompt": "Two bags are ready: one for pickup and one for delivery. Both contain similar sandwiches, but different sides. Explain your final check before handing them off.",
    "lookFor": [
      "Match order number and items",
      "Check modifications and sides",
      "Confirm the recipient and secure the order as required"
    ],
    "alternatives": "Accept a second employee checking the receipt while the team member checks contents.",
    "points": 10,
    "teaching": "A final check prevents an accurate kitchen order from becoming an incorrect handoff."
  },
  {
    "id": "WO-12",
    "focus": "Workplace Readiness",
    "category": "Cleaning",
    "prompt": "You are told to clean tables, restock lids, and refill sanitizer. You have never mixed that sanitizer before. How would you organize the work and ask for help?",
    "lookFor": [
      "Ask a trained person before handling an unfamiliar chemical",
      "Follow label and workplace procedure without guessing",
      "Prioritize safe usable tables and supplies with supervisor direction"
    ],
    "alternatives": "Accept doing a known safe task while waiting for training.",
    "points": 10,
    "teaching": "Following directions includes recognizing when a task needs training."
  },
  {
    "id": "WO-13",
    "focus": "Workplace Readiness",
    "category": "Restocking",
    "prompt": "The lunch rush is approaching, cups are nearly empty, and a coworker wants you to keep taking orders. What information would you communicate and what workable plan would you propose?",
    "lookFor": [
      "Explain the shortage and likely impact",
      "Coordinate coverage or obtain permission",
      "Restock correctly and confirm coverage before leaving"
    ],
    "alternatives": "Accept requesting another available worker to restock.",
    "points": 10,
    "teaching": "Anticipating a shortage helps the whole team, but duties need coordination."
  },
  {
    "id": "WO-14",
    "focus": "Workplace Readiness",
    "category": "Teamwork",
    "prompt": "One teammate keeps taking over every task while another has stopped contributing. What would you say and how would you redistribute work without embarrassing either person?",
    "lookFor": [
      "Describe the workload calmly",
      "Invite both people to contribute",
      "Agree on clear duties and check progress"
    ],
    "alternatives": "Accept involving a supervisor if a respectful attempt does not help.",
    "points": 10,
    "teaching": "Useful teamwork makes responsibilities visible and allows everyone to participate."
  },
  {
    "id": "WO-15",
    "focus": "Workplace Readiness",
    "category": "Communication",
    "prompt": "A supervisor gives three instructions quickly while you are helping someone else. You remember only two. What would you say and how would you prevent another mix-up?",
    "lookFor": [
      "Admit which part is unclear",
      "Repeat back what is understood and request the missing step",
      "Use a permitted note or checklist"
    ],
    "alternatives": "Accept asking the supervisor to pause until the customer interaction is covered.",
    "points": 10,
    "teaching": "Clarifying early is more reliable than guessing to appear confident."
  },
  {
    "id": "WO-16",
    "focus": "Workplace Readiness",
    "category": "Mistakes",
    "prompt": "You stocked an entire case in the wrong section and discover it just before your shift ends. Explain your next steps and what you would tell the next shift.",
    "lookFor": [
      "Report the error promptly",
      "Correct what can be done safely with permission",
      "Leave a specific handoff about any unfinished correction"
    ],
    "alternatives": "Accept asking for help or authorization to stay; do not require unpaid extra work.",
    "points": 10,
    "teaching": "Ownership means making the problem visible and arranging a reliable correction."
  },
  {
    "id": "WO-17",
    "focus": "Workplace Readiness",
    "category": "Attendance",
    "prompt": "Your ride cancels 30 minutes before your shift. You cannot guarantee another ride. What would you communicate now, and what is your backup plan?",
    "lookFor": [
      "Contact the workplace through its required channel promptly",
      "Give an honest estimate and update uncertainty",
      "Explore safe transportation options and later plan a backup"
    ],
    "alternatives": "Accept saying no safe alternative exists instead of inventing a guaranteed ride.",
    "points": 10,
    "teaching": "An honest early update gives the workplace time to plan coverage."
  },
  {
    "id": "WO-18",
    "focus": "Workplace Readiness",
    "category": "Punctuality",
    "prompt": "You arrive in the parking lot at your start time, but still need to store belongings and prepare your station. Identify the problem and propose a practical change for tomorrow.",
    "lookFor": [
      "Distinguish arriving from being ready",
      "Review clock-in and preparation procedures",
      "Plan travel and preparation time realistically"
    ],
    "alternatives": "Accept asking how paid preparation is handled instead of assuming work must occur before clock-in.",
    "points": 10,
    "teaching": "Clarify expectations and build a schedule that makes readiness possible."
  },
  {
    "id": "WO-19",
    "focus": "Workplace Readiness",
    "category": "Professional appearance",
    "prompt": "You notice your work shirt is stained and your closed-toe shoes are wet right before a food-service shift. What would you do and what would you tell the supervisor?",
    "lookFor": [
      "Identify cleanliness and slip risks",
      "Seek an approved clean safe option",
      "Notify the supervisor rather than hiding the issue"
    ],
    "alternatives": "Accept requesting a temporary safe assignment while approved clothing is arranged.",
    "points": 10,
    "teaching": "Appearance requirements can serve hygiene and safety purposes as well as presentation."
  },
  {
    "id": "WO-20",
    "focus": "Workplace Readiness",
    "category": "Communication",
    "prompt": "A coworker gives you an instruction that conflicts with your supervisor's directions. What would you say to both people before proceeding?",
    "lookFor": [
      "Explain the conflicting instructions neutrally",
      "Ask the responsible supervisor to clarify priority",
      "Repeat back the agreed plan"
    ],
    "alternatives": "Accept pausing only the disputed task while continuing other safe assigned work.",
    "points": 10,
    "teaching": "Clarifying responsibility prevents well-intended employees from working against each other."
  },
  {
    "id": "WO-21",
    "focus": "Workplace Readiness",
    "category": "Childcare",
    "prompt": "During cleanup, one child wants help with a toy while another is moving toward an exit. Explain your immediate response and how you would coordinate with the lead teacher.",
    "lookFor": [
      "Maintain supervision and respond to the exit risk first",
      "Alert the lead teacher or assigned staff",
      "Arrange safe help for the other child without leaving children unattended"
    ],
    "alternatives": "Accept different safe actions consistent with training and staff coverage.",
    "points": 10,
    "teaching": "In childcare, supervision and immediate safety guide task priority."
  },
  {
    "id": "WO-22",
    "focus": "Workplace Readiness",
    "category": "Childcare",
    "prompt": "Someone you do not recognize comes to pick up a child and says the parent sent them. What would you say and do before any handoff?",
    "lookFor": [
      "Keep the child with authorized staff",
      "Follow identity and pickup authorization procedures",
      "Contact the lead teacher or supervisor without sharing private details unnecessarily"
    ],
    "alternatives": "Accept a polite request to wait while authorized staff verify the pickup.",
    "points": 10,
    "teaching": "Familiarity or confidence is not proof of authorization."
  },
  {
    "id": "WO-23",
    "focus": "Workplace Readiness",
    "category": "Childcare",
    "prompt": "A child spills paint, becomes upset, and refuses to join cleanup. How would you respond while keeping the other children supervised?",
    "lookFor": [
      "Use calm age-appropriate reassurance",
      "Maintain supervision and make the spill area safe",
      "Offer manageable participation and follow staff guidance"
    ],
    "alternatives": "Accept a short calm-down option with supervision; do not require punishment.",
    "points": 10,
    "teaching": "Supportive communication and safe cleanup can happen together."
  },
  {
    "id": "WO-24",
    "focus": "Workplace Readiness",
    "category": "Childcare",
    "prompt": "A parent asks you about another child's behavior after hearing a rumor. What would you say, and who should handle any broader concern?",
    "lookFor": [
      "Avoid discussing another child's private information",
      "Respond respectfully without confirming the rumor",
      "Direct concerns to the lead teacher or supervisor"
    ],
    "alternatives": "Accept a short boundary statement followed by an offer to connect with the lead teacher.",
    "points": 10,
    "teaching": "Professional communication protects privacy even during a friendly conversation."
  },
  {
    "id": "WO-25",
    "focus": "Workplace Readiness",
    "category": "Priorities",
    "prompt": "Your supervisor assigns three jobs due before closing, but the remaining time is enough for only two. How would you decide what to do and explain the situation?",
    "lookFor": [
      "Estimate time honestly",
      "Ask the supervisor to confirm priorities",
      "Complete agreed tasks and document unfinished work"
    ],
    "alternatives": "Accept proposing a prioritized plan rather than only asking what to do.",
    "points": 10,
    "teaching": "Raise a timing conflict before the deadline, with useful options."
  },
  {
    "id": "WO-26",
    "focus": "Workplace Readiness",
    "category": "Customer service",
    "prompt": "A customer becomes loud after waiting for a refund. Other customers are watching. What would you say and when would you seek support?",
    "lookFor": [
      "Stay calm and acknowledge the wait",
      "Explain the next available step without arguing",
      "Get authorized support and follow safety procedures if behavior escalates"
    ],
    "alternatives": "Accept moving the conversation to an appropriate staffed service area if safe.",
    "points": 10,
    "teaching": "Good service does not require accepting threats or exceeding your authority."
  },
  {
    "id": "WO-27",
    "focus": "Workplace Readiness",
    "category": "Directions",
    "prompt": "A task checklist says to unplug equipment before cleaning, but a coworker says they always leave it running. Explain your response and next steps.",
    "lookFor": [
      "Do not clean operating equipment contrary to procedure",
      "Follow training and written safety directions",
      "Ask the supervisor to resolve the conflict"
    ],
    "alternatives": "Accept stopping the task until a trained employee assists.",
    "points": 10,
    "teaching": "Repeated unsafe practice does not make a shortcut acceptable."
  },
  {
    "id": "WO-28",
    "focus": "Workplace Readiness",
    "category": "Mistakes",
    "prompt": "You send a customer to the wrong aisle and realize it after they walk away. What would you do now, and how would you give better directions next time?",
    "lookFor": [
      "Correct the misinformation respectfully if possible",
      "Verify the location using store tools or help",
      "Offer clear directions or assistance consistent with duties"
    ],
    "alternatives": "Accept alerting a nearby coworker to help if leaving the station is not permitted.",
    "points": 10,
    "teaching": "Correcting a mistake promptly builds trust."
  },
  {
    "id": "WO-29",
    "focus": "Workplace Readiness",
    "category": "Teamwork",
    "prompt": "A coworker criticizes you in front of customers. You disagree with what they said. What would you say now, and how would you address it after the customers leave?",
    "lookFor": [
      "Keep the immediate response professional",
      "Move the disagreement to a suitable private time",
      "Discuss specifics and seek supervisor help if needed"
    ],
    "alternatives": "Accept a calm request to talk later or immediate supervisor support for serious behavior.",
    "points": 10,
    "teaching": "Timing and setting affect how well a disagreement can be resolved."
  },
  {
    "id": "WO-30",
    "focus": "Workplace Readiness",
    "category": "Hygiene",
    "prompt": "You handled trash and return to the café register. A coworker asks you to help prepare sandwiches immediately. Explain your next steps before changing tasks.",
    "lookFor": [
      "Follow required handwashing and task-change procedures",
      "Use clean approved protective items as trained",
      "Communicate the brief preparation delay"
    ],
    "alternatives": "Accept asking the food-service lead to confirm the required steps.",
    "points": 10,
    "teaching": "Changing tasks can transfer contamination unless hygiene steps are repeated."
  },
  {
    "id": "WO-31",
    "focus": "Workplace Readiness",
    "category": "Grocery",
    "prompt": "You find broken glass near a busy grocery aisle. A customer wants to walk through because they are in a hurry. What would you say and do?",
    "lookFor": [
      "Keep people away without handling glass untrained",
      "Get trained cleanup help and approved barriers",
      "Offer a safe route and alert the supervisor"
    ],
    "alternatives": "Accept guarding the area while a coworker retrieves help.",
    "points": 10,
    "teaching": "Protecting the area is part of responding to a hazard."
  },
  {
    "id": "WO-32",
    "focus": "Workplace Readiness",
    "category": "Money accountability",
    "prompt": "A customer says you gave back $5 too little, but your drawer is open and another payment is waiting. How would you respond without mixing the two transactions?",
    "lookFor": [
      "Secure the drawer and keep transactions separate",
      "Acknowledge the concern without guessing",
      "Use the approved receipt or supervisor verification process"
    ],
    "alternatives": "Accept pausing the line and requesting authorized help.",
    "points": 10,
    "teaching": "Keep the evidence clear; do not guess by taking money from the drawer."
  },
  {
    "id": "WO-33",
    "focus": "Workplace Readiness",
    "category": "Reliability",
    "prompt": "You realize you clocked out but forgot to tell the next shift that a key ingredient ran out. What should you communicate, and how could the handoff improve next time?",
    "lookFor": [
      "Promptly notify the appropriate person",
      "Describe the specific shortage and affected orders",
      "Use a consistent handoff checklist"
    ],
    "alternatives": "Accept a workplace-approved call or message; do not require off-clock work.",
    "points": 10,
    "teaching": "A useful handoff includes information the next worker needs to avoid mistakes."
  },
  {
    "id": "WO-34",
    "focus": "Workplace Readiness",
    "category": "Problem solving",
    "prompt": "A customer requests a menu item that is unavailable, and suggests substituting an ingredient you have not used before. What would you say and verify?",
    "lookFor": [
      "Explain availability honestly",
      "Check approved substitutions and ingredient information",
      "Confirm the customer's choice and any authorized price change"
    ],
    "alternatives": "Accept offering a different available menu item.",
    "points": 10,
    "teaching": "A helpful alternative still needs to follow preparation and ordering procedures."
  },
  {
    "id": "WO-35",
    "focus": "Workplace Readiness",
    "category": "Accountability",
    "prompt": "Your coworker asks you to clock them in because they will arrive in ten minutes. What would you say, and what could you help with instead?",
    "lookFor": [
      "Decline to record inaccurate time",
      "Explain that they should contact the supervisor",
      "Offer appropriate help with coverage rather than falsifying attendance"
    ],
    "alternatives": "Accept a short respectful refusal without a lengthy lecture.",
    "points": 10,
    "teaching": "Time records are work records. Helpful teamwork must keep them accurate."
  },
  {
    "id": "WO-36",
    "focus": "Workplace Readiness",
    "category": "Handoff",
    "prompt": "You finish a stocking task but are unsure whether all products were checked for damage. Your supervisor asks, 'Is it done?' Give an honest response and a plan to finish the check.",
    "lookFor": [
      "Distinguish completed work from unverified work",
      "State exactly what still needs checking",
      "Ask about priority or support and report completion afterward"
    ],
    "alternatives": "Accept saying the stocking is complete but inspection remains.",
    "points": 10,
    "teaching": "Clear status reports are more useful than an overly confident yes."
  },
  {
    "id": "JO-1",
    "focus": "Job Exploration",
    "category": "Interests",
    "prompt": "Your team enjoys animals, but pet-store work also includes cleaning, records, and difficult customer conversations. What would you investigate before choosing this job?",
    "lookFor": [
      "Look beyond favorite activities",
      "Identify actual daily duties",
      "Use job shadowing or reliable job information"
    ],
    "alternatives": "Accept an interview with a worker or supervised visit.",
    "points": 10,
    "teaching": "An interest is a starting point for exploring the whole job."
  },
  {
    "id": "JO-2",
    "focus": "Job Exploration",
    "category": "Work environment",
    "prompt": "Compare a busy café and a quiet stockroom for someone who likes organizing but tires during constant conversation. What questions would help them explore both fairly?",
    "lookFor": [
      "Identify conditions rather than stereotypes",
      "Ask about pace communication and physical tasks",
      "Consider supports and personal preferences"
    ],
    "alternatives": "Accept trying both environments before deciding.",
    "points": 10,
    "teaching": "A job title alone does not describe the working environment."
  },
  {
    "id": "JO-3",
    "focus": "Job Exploration",
    "category": "Career research",
    "prompt": "Two websites list different training requirements for the same career. How would you decide what information to trust and what to verify?",
    "lookFor": [
      "Check source date and location",
      "Distinguish employer preference from required credentials",
      "Consult an official program employer or licensing source"
    ],
    "alternatives": "Accept contacting a training adviser.",
    "points": 10,
    "teaching": "Training requirements can vary by role and location."
  },
  {
    "id": "JO-4",
    "focus": "Job Exploration",
    "category": "Pathways",
    "prompt": "A student wants a healthcare career but is unsure about a long college program. Explain how to research at least two different roles without assuming all healthcare jobs require the same training.",
    "lookFor": [
      "Identify two distinct roles",
      "Compare actual duties and entry pathways",
      "Check reliable local training information"
    ],
    "alternatives": "Accept support roles and further-training pathways.",
    "points": 10,
    "teaching": "Fields contain many jobs with different requirements."
  },
  {
    "id": "JO-5",
    "focus": "Job Exploration",
    "category": "Job shadow",
    "prompt": "You have fifteen minutes with a grocery supervisor during a job shadow. What three questions would reveal whether the work fits your interests and needs, and why?",
    "lookFor": [
      "Ask about real duties",
      "Explore schedule pace or conditions",
      "Ask about training and advancement"
    ],
    "alternatives": "Accept questions about supports or essential tasks.",
    "points": 10,
    "teaching": "Specific questions produce useful evidence about job fit."
  },
  {
    "id": "JO-6",
    "focus": "Job Exploration",
    "category": "Strengths",
    "prompt": "A person is patient with children but finds noisy group settings exhausting. How could they investigate childcare roles and related careers without ignoring either fact?",
    "lookFor": [
      "Recognize strength and environment needs",
      "Explore different duties and settings",
      "Ask about realistic conditions and supports"
    ],
    "alternatives": "Accept considering another helping profession after research.",
    "points": 10,
    "teaching": "Career exploration weighs strengths and conditions together."
  },
  {
    "id": "JO-7",
    "focus": "Job Exploration",
    "category": "Job posting",
    "prompt": "A posting says 'flexible schedule,' 'must lift boxes,' and 'other duties as assigned.' What would you clarify before deciding whether to apply?",
    "lookFor": [
      "Clarify hours and notice",
      "Ask about physical tasks and training",
      "Ask what other duties usually mean"
    ],
    "alternatives": "Accept questions about available supports.",
    "points": 10,
    "teaching": "Vague posting language needs concrete examples."
  },
  {
    "id": "JO-8",
    "focus": "Job Exploration",
    "category": "Transferable skills",
    "prompt": "Your team planned a school event. Explain two skills from that experience that could matter in retail and what evidence supports each claim.",
    "lookFor": [
      "Name specific relevant skills",
      "Describe actual actions",
      "Connect actions to retail duties"
    ],
    "alternatives": "Accept organizing communicating or solving a documented problem.",
    "points": 10,
    "teaching": "Examples support skill claims better than labels alone."
  },
  {
    "id": "JO-9",
    "focus": "Job Exploration",
    "category": "Choices",
    "prompt": "One job has higher pay but a difficult commute; another offers training and predictable hours. What information would your team compare before choosing?",
    "lookFor": [
      "Compare total costs and time",
      "Consider training and schedule",
      "Explain how personal priorities affect the decision"
    ],
    "alternatives": "Accept different choices with evidence.",
    "points": 10,
    "teaching": "Job fit includes practical conditions beyond hourly pay."
  },
  {
    "id": "JO-10",
    "focus": "Job Exploration",
    "category": "Reality check",
    "prompt": "A social-media video makes salon ownership look easy. How would you find out what owners actually spend time and money doing?",
    "lookFor": [
      "Use more than promotional content",
      "Investigate licensing operations and expenses",
      "Speak with owners or credible program staff"
    ],
    "alternatives": "Accept observing daily operations with permission.",
    "points": 10,
    "teaching": "Visible creative work is only part of running a business."
  },
  {
    "id": "JO-11",
    "focus": "Job Exploration",
    "category": "Advancement",
    "prompt": "A student wants to become a store manager. Explain how they could research a realistic starting role and steps toward management.",
    "lookFor": [
      "Research actual employer pathways",
      "Identify skills training and experience",
      "Ask about advancement rather than assume a guarantee"
    ],
    "alternatives": "Accept comparing employers with different pathways.",
    "points": 10,
    "teaching": "Career paths are possibilities to investigate, not promises."
  },
  {
    "id": "JO-12",
    "focus": "Job Exploration",
    "category": "Work preferences",
    "prompt": "Two friends want to choose the same career so they can work together. What would you ask each person separately before encouraging that plan?",
    "lookFor": [
      "Explore each person's interests",
      "Compare duties environment and training needs",
      "Respect different choices"
    ],
    "alternatives": "Accept shared exploration followed by individual decisions.",
    "points": 10,
    "teaching": "Friendship can support exploration without determining career fit."
  },
  {
    "id": "JO-13",
    "focus": "Job Exploration",
    "category": "Information interview",
    "prompt": "You hear that warehouse work is 'just moving boxes.' What questions would reveal the range of tasks and skills involved?",
    "lookFor": [
      "Ask about inventory equipment and records",
      "Explore training safety and communication",
      "Check differences among roles"
    ],
    "alternatives": "Accept asking about a typical shift.",
    "points": 10,
    "teaching": "Broad labels often hide different roles and skills."
  },
  {
    "id": "JO-14",
    "focus": "Job Exploration",
    "category": "Next step",
    "prompt": "After exploring three careers, your team is still undecided. Propose one next action for each career and explain what evidence each action could provide.",
    "lookFor": [
      "Choose practical research actions",
      "Identify what remains unknown",
      "Explain how new evidence informs comparison"
    ],
    "alternatives": "Accept visits interviews course samples or further research.",
    "points": 10,
    "teaching": "An undecided choice can become a focused investigation."
  },
  {
    "id": "SE-1",
    "focus": "Self-Advocacy",
    "category": "Clarification",
    "prompt": "Instructions are easier for you when written down, but a supervisor usually explains them aloud. What could you say to request support and check that you understood?",
    "lookFor": [
      "Describe the useful support",
      "Make a specific respectful request",
      "Confirm key steps"
    ],
    "alternatives": "Accept a checklist demonstration or repeat-back approach.",
    "points": 10,
    "teaching": "A specific request helps another person understand what works for you."
  },
  {
    "id": "SE-2",
    "focus": "Self-Advocacy",
    "category": "Needs",
    "prompt": "A new task is overwhelming, and you are unsure whether the problem is pace, noise, or unclear directions. How could you identify the issue and ask for help?",
    "lookFor": [
      "Describe what happens without self-blame",
      "Identify patterns or specific barriers",
      "Request a practical next step"
    ],
    "alternatives": "Accept testing one support at a time.",
    "points": 10,
    "teaching": "Understanding the barrier helps make a useful request."
  },
  {
    "id": "SE-3",
    "focus": "Self-Advocacy",
    "category": "Boundaries",
    "prompt": "A coworker repeatedly asks personal questions you do not want to answer. What would you say and what would you do if the questions continue?",
    "lookFor": [
      "State a clear respectful boundary",
      "Avoid unnecessary disclosure",
      "Seek appropriate supervisor support if needed"
    ],
    "alternatives": "Accept a brief topic change followed by a firmer boundary.",
    "points": 10,
    "teaching": "You can be professional without sharing private information."
  },
  {
    "id": "SE-4",
    "focus": "Self-Advocacy",
    "category": "Speaking up",
    "prompt": "You notice a task feels unsafe, but you worry that asking a question will make you look inexperienced. Explain what you would say and do.",
    "lookFor": [
      "Pause the unsafe part",
      "Explain the specific concern",
      "Ask for training or clarification"
    ],
    "alternatives": "Accept getting a trained supervisor immediately.",
    "points": 10,
    "teaching": "Speaking up about uncertainty is a responsible work behavior."
  },
  {
    "id": "SE-5",
    "focus": "Self-Advocacy",
    "category": "Feedback",
    "prompt": "Your supervisor says your work needs improvement but gives no example. What questions could you ask to understand the feedback and plan your next attempt?",
    "lookFor": [
      "Request a specific example",
      "Clarify the expected standard",
      "Agree on practice and a follow-up"
    ],
    "alternatives": "Accept asking for a demonstration.",
    "points": 10,
    "teaching": "Useful feedback describes an action you can improve."
  },
  {
    "id": "SE-6",
    "focus": "Self-Advocacy",
    "category": "Choice",
    "prompt": "An adult chooses a training program for you without asking what you want. How would you explain your preferences and request a role in the decision?",
    "lookFor": [
      "State your goals",
      "Explain reasons and questions",
      "Request shared planning and options"
    ],
    "alternatives": "Accept preparing notes or bringing a trusted supporter.",
    "points": 10,
    "teaching": "Your preferences are relevant evidence in planning your future."
  },
  {
    "id": "SE-7",
    "focus": "Self-Advocacy",
    "category": "Support",
    "prompt": "You want help during an interview but also want to speak for yourself. What could you plan with a support person beforehand?",
    "lookFor": [
      "Define the support person's role",
      "Identify when you want help",
      "Practice your own responses and signal for assistance"
    ],
    "alternatives": "Accept agreed prompts or preparation beforehand.",
    "points": 10,
    "teaching": "Support can strengthen your voice while keeping you central."
  },
  {
    "id": "SE-8",
    "focus": "Self-Advocacy",
    "category": "Disclosure",
    "prompt": "A classmate says you must share your whole personal history when requesting help at work. What would you consider before deciding what to share and with whom?",
    "lookFor": [
      "Identify the specific work need",
      "Seek reliable guidance about appropriate processes",
      "Limit disclosure to what is useful and necessary"
    ],
    "alternatives": "Accept asking a trusted adviser about formal accommodation procedures; avoid legal conclusions.",
    "points": 10,
    "teaching": "Requests for support do not require casual disclosure to everyone."
  },
  {
    "id": "SE-9",
    "focus": "Self-Advocacy",
    "category": "Self-awareness",
    "prompt": "You did well on a task with a checklist but struggled without it. How would you describe both your strength and the support that helped?",
    "lookFor": [
      "Name the task and successful actions",
      "Identify the checklist's contribution",
      "Avoid claiming success without support or dismissing the success"
    ],
    "alternatives": "Accept describing what can now be done more independently.",
    "points": 10,
    "teaching": "Accurate self-awareness includes effective supports."
  },
  {
    "id": "SE-10",
    "focus": "Self-Advocacy",
    "category": "Conflict",
    "prompt": "A teammate keeps speaking for you during group discussions. What would you say to get a turn and establish a fairer process?",
    "lookFor": [
      "Request a turn clearly",
      "Explain that you want to contribute",
      "Suggest turn-taking or agreed roles"
    ],
    "alternatives": "Accept asking the group leader for support.",
    "points": 10,
    "teaching": "Advocacy can include changing the discussion process."
  },
  {
    "id": "SE-11",
    "focus": "Self-Advocacy",
    "category": "Mistake",
    "prompt": "You are blamed for a mistake you did not make. How would you explain what you know without attacking someone else?",
    "lookFor": [
      "Present facts and limits of knowledge",
      "Ask for a review",
      "Stay respectful and seek appropriate support"
    ],
    "alternatives": "Accept written notes or a private supervisor conversation.",
    "points": 10,
    "teaching": "Facts are more useful than accusations."
  },
  {
    "id": "SE-12",
    "focus": "Self-Advocacy",
    "category": "Goal setting",
    "prompt": "You want to answer more often in class, but speaking without preparation is difficult. Propose a goal and supports you could request.",
    "lookFor": [
      "Make a realistic measurable goal",
      "Choose preparation or communication supports",
      "Plan to review progress"
    ],
    "alternatives": "Accept written contributions or a planned speaking turn.",
    "points": 10,
    "teaching": "Participation can grow through accessible achievable steps."
  },
  {
    "id": "SE-13",
    "focus": "Self-Advocacy",
    "category": "Checking support",
    "prompt": "You requested a quieter workspace, but the new location makes it difficult to get instructions. How would you explain the tradeoff and propose an adjustment?",
    "lookFor": [
      "Describe what improved and what became harder",
      "Suggest a specific adjustment",
      "Arrange a follow-up to see if it helps"
    ],
    "alternatives": "Accept scheduled check-ins or another location.",
    "points": 10,
    "teaching": "Supports may need adjustment after trying them."
  },
  {
    "id": "SE-14",
    "focus": "Self-Advocacy",
    "category": "Planning meeting",
    "prompt": "At a transition planning meeting, everyone uses terms you do not understand. What would you say, and how could you leave with a plan you can explain yourself?",
    "lookFor": [
      "Ask for plain-language explanations",
      "Repeat back decisions and ask questions",
      "Request a written accessible next-step plan"
    ],
    "alternatives": "Accept pausing the meeting or using a trusted support person.",
    "points": 10,
    "teaching": "Understanding the plan is part of meaningful participation."
  },
  {
    "id": "PO-1",
    "focus": "Postsecondary Education",
    "category": "Programs",
    "prompt": "Two training programs have similar names but different length and cost. What would you compare before deciding which meets your goal?",
    "lookFor": [
      "Compare credential and curriculum",
      "Check total cost and schedule",
      "Verify outcomes and requirements with reliable sources"
    ],
    "alternatives": "Accept asking advisers and graduates specific questions.",
    "points": 10,
    "teaching": "Similar names do not guarantee equivalent programs."
  },
  {
    "id": "PO-2",
    "focus": "Postsecondary Education",
    "category": "Costs",
    "prompt": "A program lists tuition but says tools, supplies, and transportation cost extra. How would you build a realistic budget?",
    "lookFor": [
      "Identify all required costs",
      "Separate one-time and recurring expenses",
      "Research assistance and remaining gaps"
    ],
    "alternatives": "Accept estimating ranges while marking unknown costs.",
    "points": 10,
    "teaching": "A useful budget includes the full cost of attending."
  },
  {
    "id": "PO-3",
    "focus": "Postsecondary Education",
    "category": "Applications",
    "prompt": "You find an application deadline, but transcripts and references may take time. Explain your plan for submitting a complete application.",
    "lookFor": [
      "List required items",
      "Work backward from deadlines",
      "Confirm receipt and follow up early"
    ],
    "alternatives": "Accept a calendar or checklist.",
    "points": 10,
    "teaching": "External documents need time as well as the application form."
  },
  {
    "id": "PO-4",
    "focus": "Postsecondary Education",
    "category": "Support",
    "prompt": "A student used support in high school and wants similar help in college. What should they find out before classes begin?",
    "lookFor": [
      "Identify the college support office",
      "Ask about its request process",
      "Clarify documentation and course needs"
    ],
    "alternatives": "Accept visiting or contacting the office with questions.",
    "points": 10,
    "teaching": "Support processes can change after high school; ask early."
  },
  {
    "id": "PO-5",
    "focus": "Postsecondary Education",
    "category": "Schedule",
    "prompt": "A student plans to work evenings and take daytime classes. What should they check to see whether the weekly plan is realistic?",
    "lookFor": [
      "Include travel study and rest",
      "Check actual class and work times",
      "Plan for conflicts and seek advice"
    ],
    "alternatives": "Accept starting with a smaller course load after adviser discussion.",
    "points": 10,
    "teaching": "Class hours are only part of the time required for study."
  },
  {
    "id": "PO-6",
    "focus": "Postsecondary Education",
    "category": "Credentials",
    "prompt": "An advertisement promises a quick certificate and a guaranteed job. What would you verify before enrolling?",
    "lookFor": [
      "Check the credential and provider",
      "Investigate employer recognition and conditions",
      "Read costs refund terms and outcome evidence"
    ],
    "alternatives": "Accept asking an independent adviser.",
    "points": 10,
    "teaching": "Promotional claims deserve verification before committing."
  },
  {
    "id": "PO-7",
    "focus": "Postsecondary Education",
    "category": "Campus visit",
    "prompt": "During a campus visit, what questions could help you understand hands-on training, support, and daily life?",
    "lookFor": [
      "Ask about actual coursework",
      "Explore support and facilities",
      "Check transportation schedule and costs"
    ],
    "alternatives": "Accept questions about placement experiences or equipment.",
    "points": 10,
    "teaching": "A visit can test whether a program fits practical needs."
  },
  {
    "id": "PO-8",
    "focus": "Postsecondary Education",
    "category": "Financial planning",
    "prompt": "A student receives an aid offer and assumes the full amount is free money. What distinctions should they understand and who could help explain them?",
    "lookFor": [
      "Distinguish grants scholarships loans and work arrangements",
      "Review conditions and amounts",
      "Ask the financial aid office for clarification"
    ],
    "alternatives": "Accept a trusted adviser helping compare offers.",
    "points": 10,
    "teaching": "Understand repayment and conditions before accepting aid."
  },
  {
    "id": "PO-9",
    "focus": "Postsecondary Education",
    "category": "Study habits",
    "prompt": "A class requires weekly reading and projects, but there is no daily reminder. Propose a plan to manage the work and recognize when help is needed.",
    "lookFor": [
      "Track deadlines",
      "Break work into scheduled steps",
      "Use office hours tutoring or other supports early"
    ],
    "alternatives": "Accept digital or paper planning.",
    "points": 10,
    "teaching": "Independent study still includes asking for support."
  },
  {
    "id": "PO-10",
    "focus": "Postsecondary Education",
    "category": "Alternatives",
    "prompt": "A student is deciding among an apprenticeship, technical college, and a four-year program. What comparisons would help them make an informed choice?",
    "lookFor": [
      "Compare goals and training format",
      "Check entry requirements time and costs",
      "Investigate recognized outcomes"
    ],
    "alternatives": "Accept different choices for different career goals.",
    "points": 10,
    "teaching": "There are multiple education and training routes."
  },
  {
    "id": "PO-11",
    "focus": "Postsecondary Education",
    "category": "Setback",
    "prompt": "A student misses a required application item and learns the deadline has passed. What should they do next without assuming all options are gone?",
    "lookFor": [
      "Contact the program honestly",
      "Ask about permitted next steps or later entry",
      "Update the plan to prevent a repeat"
    ],
    "alternatives": "Accept exploring another verified program or intake.",
    "points": 10,
    "teaching": "A setback calls for accurate information and a revised plan."
  },
  {
    "id": "PO-12",
    "focus": "Postsecondary Education",
    "category": "Transportation",
    "prompt": "A promising program is far away, and the student has no reliable ride. What questions and options should they explore before enrolling?",
    "lookFor": [
      "Check attendance and location requirements",
      "Investigate reliable transport or housing",
      "Compare cost and backup plans"
    ],
    "alternatives": "Accept verified remote or nearby alternatives.",
    "points": 10,
    "teaching": "Access to training includes getting there consistently."
  },
  {
    "id": "PO-13",
    "focus": "Postsecondary Education",
    "category": "Learning fit",
    "prompt": "One program is mostly online and another uses in-person labs. What should a student consider about their learning needs and equipment access?",
    "lookFor": [
      "Compare task types and learning preferences",
      "Check technology and practical requirements",
      "Ask about support and trial experiences"
    ],
    "alternatives": "Accept a mix of formats if available.",
    "points": 10,
    "teaching": "Convenience and learning fit both matter."
  },
  {
    "id": "PO-14",
    "focus": "Postsecondary Education",
    "category": "Next steps",
    "prompt": "You chose a possible training program but have not committed. Create a three-step action plan with a question each step should answer.",
    "lookFor": [
      "Use specific achievable actions",
      "Assign a timeline or responsible person",
      "Connect steps to unresolved questions"
    ],
    "alternatives": "Accept adviser meetings cost checks and program visits.",
    "points": 10,
    "teaching": "A concrete plan turns interest into informed action."
  }
];
