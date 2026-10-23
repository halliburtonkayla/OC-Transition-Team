/* Original challenge scenarios. Workplace rules are stated within each fictional scenario. */
(function(g){const categories=[{"id": "ready", "name": "Work Ready", "icon": "✦", "color": "#7852d6"}, {"id": "grocery", "name": "Grocery Store", "icon": "▤", "color": "#148477"}, {"id": "childcare", "name": "Child Care", "icon": "♡", "color": "#b64f84"}, {"id": "fastfood", "name": "Fast Food", "icon": "◆", "color": "#cf633f"}, {"id": "military", "name": "Military", "icon": "★", "color": "#65853b"}, {"id": "education", "name": "Education", "icon": "✎", "color": "#3974be"}, {"id": "money", "name": "Money & Profit", "icon": "$", "color": "#9a711c"}];
const rows=[
 [
  "ready",
  "orientation-plan",
  "Orientation starts at 8:00. Travel takes 22 minutes, building check-in takes 8 minutes, and you want a 10-minute delay buffer. What is the latest planned departure time?",
  [
   "7:20",
   "7:30",
   "7:38"
  ],
  0,
  "Plan backward: 8:00 minus 22 minutes travel, 8 minutes check-in, and 10 minutes buffer is 7:20.",
  "Include travel, check-in, and the buffer, not just the drive.",
  1
 ],
 [
  "ready",
  "uniform-check",
  "Your clean uniform has a small tear near a machine area. Today’s dress checklist says clothing must have no loose fabric near equipment. What is the best first step?",
  [
   "Fold the torn area inward and begin, then mention it during break.",
   "Show the supervisor and arrange an approved change or repair before that assignment.",
   "Choose a different task yourself and explain the change at the end of the shift."
  ],
  1,
  "Cleanliness and safety both matter. Bring the problem to the supervisor so an approved solution can be arranged before equipment work.",
  "Check the dress standard and who can approve a different assignment.",
  1
 ],
 [
  "ready",
  "rush-priorities",
  "You have a restock task due in 10 minutes. A customer needs help, and you notice liquid spreading into the walkway. The shop procedure says to guard a spill and call for help. What is the best sequence?",
  [
   "Help the customer find the item, then guard the spill and finish restocking.",
   "Finish the restock task first, then ask a coworker to handle the customer and spill.",
   "Guard the spill and call for help, acknowledge the customer, then update the supervisor about restocking."
  ],
  2,
  "The immediate hazard comes first under the stated procedure. Communicate with the customer and supervisor instead of silently dropping other duties.",
  "Separate the immediate hazard from tasks with deadlines.",
  2
 ],
 [
  "ready",
  "shift-swap",
  "A coworker agrees to cover your shift. The posted policy says a swap is final only after manager approval. The coworker texts “all set,” but the schedule still lists you. What should you do?",
  [
   "Confirm approval with the manager and keep responsibility for your shift until it is approved.",
   "Treat the coworker’s text as approval and check the schedule after the shift.",
   "Ask the coworker to clock in using your employee code so the schedule matches."
  ],
  0,
  "A coworker’s agreement and manager approval are different steps. Follow the stated process and use each worker’s own identity.",
  "Look for the specific step that makes the swap final.",
  2
 ],
 [
  "ready",
  "repeated-feedback",
  "A supervisor says three orders were missing items. You followed the ticket from memory because it felt faster. What change best addresses the cause?",
  [
   "Work more slowly but keep using memory so you do not need to interrupt the supervisor.",
   "Use a ticket-by-ticket completion check and ask the supervisor to review a few orders with you.",
   "Ask someone else to check only when a customer reports a missing item."
  ],
  1,
  "Change the process that caused the errors. A consistent check and a brief review can show whether accuracy is improving.",
  "Choose a method that catches omissions before an order leaves.",
  2
 ],
 [
  "grocery",
  "zone-labels",
  "While zoning, you find 12-ounce and 18-ounce cereal boxes mixed together. The front looks neat, but only the 12-ounce shelf label is visible. What should you do?",
  [
   "Face all boxes forward and leave the sizes together because they are the same brand.",
   "Move both sizes behind the visible label and report the missing label after closing.",
   "Match each size to its assigned location and label, then face the products neatly."
  ],
  2,
  "Zoning includes correct placement, not just a tidy front. Size and product labels must match the assigned shelf location.",
  "A neat shelf can still have a product-location error.",
  1
 ],
 [
  "grocery",
  "price-authority",
  "A shopper says the shelf price is lower than the register price. You may pause a transaction but cannot approve price changes. What is the best response?",
  [
   "Acknowledge the concern and request an authorized price check before completing the sale.",
   "Use the shopper’s quoted price to keep the line moving, then tell a manager later.",
   "Complete the sale at the register price and direct the shopper to request a refund afterward."
  ],
  0,
  "Help the shopper while staying within your authority. The stated process requires an authorized check before a price change.",
  "Which action serves the customer without approving something outside your role?",
  1
 ],
 [
  "grocery",
  "restock-count",
  "A shelf holds 24 jars and currently has 7. You bring a case of 12 and a case of 6. How many jars go on the shelf, and how many stay in approved back stock?",
  [
   "18 on the shelf; 0 in back stock.",
   "17 on the shelf; 1 in back stock.",
   "12 on the shelf; 6 in back stock."
  ],
  1,
  "There are 24 − 7 = 17 open spaces. You brought 18 jars, so 17 fit and 1 remains.",
  "Calculate empty shelf spaces before using the case totals.",
  2
 ],
 [
  "grocery",
  "date-rotation",
  "Your store’s card says to place earlier sell-by dates in front and remove items past the sell-by date for supervisor review. Today is October 23. You have items dated October 22, October 25, and October 28. Which plan follows the card?",
  [
   "Place October 22 in front so it sells first; keep October 25 behind it.",
   "Put the newest items in front and ask about older items after the shelf is filled.",
   "Set October 22 items aside for review; put October 25 in front of October 28."
  ],
  2,
  "Apply both parts of the stated store card: separate the past-date item and rotate the remaining dates in the required order.",
  "The card gives separate instructions for past-date items and remaining stock.",
  2
 ],
 [
  "grocery",
  "cash-reconcile",
  "The opening cash float was $100. Recorded cash sales are $186, and approved cash refunds are $14. The drawer contains $267. What should you report?",
  [
   "Expected cash is $272; the drawer is $5 short.",
   "Expected cash is $286; the drawer is $19 short.",
   "Expected cash is $258; the drawer is $9 over."
  ],
  0,
  "Expected cash = $100 + $186 − $14 = $272. Actual $267 is $5 less. Report and reconcile the difference using the store procedure.",
  "Start with the float, add cash sales, and subtract cash refunds.",
  2
 ],
 [
  "childcare",
  "coverage-handoff",
  "You need supplies from another room. A trained coworker is nearby but has not agreed to cover your group. The center requires a clear adult handoff before leaving. What should you do?",
  [
   "Point toward your group while walking out because the coworker is already nearby.",
   "Get an explicit accepted handoff that meets the center’s coverage procedure before leaving.",
   "Wait until the children are quietly playing and make the trip as quickly as possible."
  ],
  1,
  "Proximity is not an accepted handoff. Confirm who is responsible and follow the center’s coverage procedure before leaving.",
  "A nearby adult and an adult who accepted responsibility are not the same thing.",
  1
 ],
 [
  "childcare",
  "pickup-check",
  "A familiar adult arrives for pickup. Their name is not on the current authorization list, and you cannot approve changes. They offer to show a text from the parent. What is the best next step?",
  [
   "Accept the text because the adult is familiar and note it in the pickup log.",
   "Ask the child whether they know the adult, then decide whether to release them.",
   "Keep the child supervised and ask the lead to follow the center’s authorization process."
  ],
  2,
  "Use the current authorization process and the responsible lead. Familiarity or a text does not give you authority to approve a change.",
  "Focus on who can verify and approve pickup authorization.",
  1
 ],
 [
  "childcare",
  "activity-transition",
  "The activity plan requires a headcount before leaving a room, at the door, and after arrival. The first count is correct. A coworker suggests skipping the door count because lunch is late. What should you do?",
  [
   "Complete the required counts and tell the lead the transition is taking longer.",
   "Count only after arrival because that checks the same children.",
   "Use the morning attendance total at the door and do a fresh count at lunch."
  ],
  0,
  "Follow each checkpoint in the stated plan. A correct earlier count does not replace a required later count.",
  "Ask what each checkpoint is meant to catch.",
  2
 ],
 [
  "childcare",
  "record-accuracy",
  "A form asks when a child’s snack was served. You remember serving it but not the exact time. Another worker suggests copying yesterday’s time to finish the form. What is the best response?",
  [
   "Use yesterday’s time because the schedule is usually the same.",
   "Tell the lead the exact time is uncertain and document it according to the center’s correction process.",
   "Leave the entire snack record blank so there is no chance of writing a wrong detail."
  ],
  1,
  "Do not turn an estimate into a claimed fact. Report uncertainty and follow the approved documentation process.",
  "Choose accurate communication about what you do and do not know.",
  2
 ],
 [
  "childcare",
  "hygiene-workflow",
  "The posted snack routine is: put away cleanup materials, wash hands, prepare the snack area, then serve. You have put away the materials but notice an unfinished cleanup note. Which plan best follows the routine?",
  [
   "Wash hands, finish the cleanup note and handling the cleaning kit, then serve.",
   "Serve the packaged snacks first and complete the hygiene routine before the next activity.",
   "Finish the note if needed, then wash hands and complete the snack setup before serving."
  ],
  2,
  "Keep cleanup work separate from the food routine and follow the stated handwashing and setup sequence before serving.",
  "Think about the task you do immediately before food preparation.",
  2
 ],
 [
  "fastfood",
  "order-clarify",
  "An order ticket says “no sauce,” but the customer now asks for sauce on the side. Your system allows order edits before preparation starts. What should you do?",
  [
   "Confirm the change, update the ticket, and communicate it to the kitchen before preparation.",
   "Tell the kitchen verbally but leave the ticket unchanged to avoid slowing the line.",
   "Prepare the original ticket and hand over sauce without checking whether preparation started."
  ],
  0,
  "Use one accurate updated order record and communicate the change before work begins. A verbal-only change can be missed by another worker.",
  "Make the customer request and the kitchen’s written instructions match.",
  1
 ],
 [
  "fastfood",
  "hygiene-switch",
  "You are assigned to switch from register work to food preparation. The task card requires handwashing and fresh gloves before food handling. The line is growing. What is the best choice?",
  [
   "Put fresh gloves over the gloves used at the register to save the handwashing time.",
   "Tell the team about the switch and complete the required hygiene steps before preparing food.",
   "Complete one food order, then wash and change gloves when the line becomes shorter."
  ],
  1,
  "A rush does not remove the hygiene steps on the task card. Communicate the delay and follow the required transition before food work.",
  "Which plan completes the required steps before the new task?",
  1
 ],
 [
  "fastfood",
  "batch-capacity",
  "You need 18 sandwiches. One tray holds 6, but only 2 trays fit at once. Each batch takes 4 minutes, and the task card requires complete batches. Ignoring loading time, what is the minimum total cooking time?",
  [
   "4 minutes: three trays cooked at the same time.",
   "12 minutes: one tray cooked during each batch.",
   "8 minutes: a batch of 12, then a batch of 6."
  ],
  2,
  "Two trays cook 12 at once. A second 4-minute batch cooks the remaining 6, for 8 minutes total.",
  "Use the equipment’s simultaneous capacity, not just the tray size.",
  2
 ],
 [
  "fastfood",
  "refund-limit",
  "A customer requests an $18 refund. Your role may approve refunds up to $10; larger amounts require a manager. The customer is upset and the manager is helping another worker. What should you do?",
  [
   "Acknowledge the issue, request manager approval, and explain that the refund needs that step.",
   "Process two $9 refunds because each is below your approval limit.",
   "Promise the $18 refund immediately and seek approval after the customer leaves."
  ],
  0,
  "Splitting a transaction does not change the approval requirement. Be helpful without promising or approving something outside your authority.",
  "The limit applies to the requested refund, not to how many entries you create.",
  2
 ],
 [
  "fastfood",
  "stock-count-service",
  "Four paid orders each require 2 rolls. You find only 6 usable rolls. The supervisor must approve substitutions or refunds. What is the best plan?",
  [
   "Use 1 roll on each of two orders so all four customers receive something.",
   "Report a shortage of 2 rolls, pause new promises for that item, and obtain an approved plan for the affected orders.",
   "Take two more orders first, then ask the supervisor to decide which customers wait."
  ],
  1,
  "The four orders need 8 rolls; 6 leaves a shortage of 2. Communicate early and get approval before changing a paid order.",
  "Calculate committed stock before deciding what you can promise.",
  2
 ],
 [
  "military",
  "reporting-checklist",
  "In a fictional military workplace exercise, instructions say report to Room B at 09:10 with identification and a completed equipment checklist. You are outside Room B at 09:05, but the checklist is unfinished. Are you fully ready?",
  [
   "Yes. Being early satisfies the reporting instruction even if paperwork is unfinished.",
   "Yes, if another participant has already completed the same type of checklist.",
   "No. Arrival is early, but the required checklist must also be completed or the issue reported."
  ],
  2,
  "Readiness includes the required place, time, and materials or task preparation. Being early alone does not satisfy every stated requirement.",
  "Check every part of the instruction, not just the reporting time.",
  1
 ],
 [
  "military",
  "unclear-instruction",
  "During a safe career-exploration exercise, you are told to sort supplies “by section,” but two lists show different section names. What is the best first move?",
  [
   "Show the instructor the mismatch and ask which list is current before sorting.",
   "Choose the list that lets you finish fastest and mention the difference afterward.",
   "Split the supplies between both systems so each list is partly followed."
  ],
  0,
  "Clarify conflicting information before it creates rework. Show the exact mismatch so the responsible instructor can resolve it.",
  "Find the person who can identify the current instruction.",
  1
 ],
 [
  "military",
  "equipment-accountability",
  "A practice inventory begins with 24 items. Your group issues 7 and receives 2 back. You count 18 remaining. What should the record show before the difference is resolved?",
  [
   "Expected 17, actual 18; report 1 extra item.",
   "Expected 19, actual 18; report 1 item unaccounted for.",
   "Expected 19, actual 18; record 19 because the issue log is the official record."
  ],
  1,
  "24 − 7 + 2 = 19 expected. A count of 18 creates a difference of 1. Record the actual count and report the mismatch.",
  "Returns add back to inventory; actual counts should not be silently replaced.",
  2
 ],
 [
  "military",
  "team-deadline",
  "Your exercise team has 15 minutes to prepare 3 supply stations. One person is delayed, and your assigned station is complete. Only the instructor may reassign duties. What is the best next step?",
  [
   "Take over another station without checking so the group finishes faster.",
   "Wait without reporting because your own station is complete.",
   "Report your completion and the team’s delay, then ask the instructor where you can assist."
  ],
  2,
  "Dependability includes communication and helping within the exercise’s assigned structure. Request a useful approved next task.",
  "Your own completion and the group’s remaining work both matter.",
  2
 ],
 [
  "military",
  "inspection-feedback",
  "An exercise checklist requires five labeled supply bins. You label four correctly and leave the fifth unreadable. The instructor says the station is not ready. Which response best demonstrates accountability?",
  [
   "Acknowledge the missing standard, correct the fifth label, and recheck all five against the checklist.",
   "Explain that four out of five is enough because the deadline has passed.",
   "Ask a teammate to confirm the unreadable label so the record can say five were checked."
  ],
  0,
  "Meeting most checklist items does not make an incomplete requirement complete. Correct the specific issue and verify the whole standard.",
  "Distinguish effort from meeting every stated requirement.",
  2
 ],
 [
  "education",
  "copy-clarify",
  "A teacher asks for 25 double-sided packets. The master has four single-sided pages, but the copier is set to one-sided printing. What should you clarify before starting?",
  [
   "Print all 100 sheets one-sided and staple them because the page content is correct.",
   "Confirm the packet order and duplex settings, then make a sample before the full run.",
   "Print 25 copies of the first two pages because double-sided means two pages total."
  ],
  1,
  "Confirm how four pages form each packet and check a sample. Verifying setup before a large batch prevents repeated errors.",
  "Separate the number of content pages from the number of physical sheets.",
  1
 ],
 [
  "education",
  "private-record",
  "A substitute asks you to send a student list to their personal email. Your role does not permit sharing records; the office handles access. What is the best response?",
  [
   "Send only names so the request can be handled quickly.",
   "Send the list after the substitute shows a school badge, without checking the access process.",
   "Refer the request to the office’s approved access process without sending the list yourself."
  ],
  2,
  "A work-related reason does not automatically give you sharing authority. Use the school’s stated access process.",
  "Check your role’s authority, not only who is making the request.",
  1
 ],
 [
  "education",
  "materials-count",
  "You must prepare kits for 8 groups of 4 students. Each student needs 2 cards. Cards come in packs of 15. What is the fewest full packs needed?",
  [
   "5 packs, providing 75 cards for a need of 64.",
   "4 packs, providing 60 cards because 64 is closer to 60 than 75.",
   "3 packs, because there are only 32 students."
  ],
  0,
  "8 × 4 = 32 students; 32 × 2 = 64 cards. Four packs provide only 60, so five full packs are needed.",
  "Find the total cards needed, then round the number of full packs up.",
  2
 ],
 [
  "education",
  "competing-deadlines",
  "A lesson starts in 12 minutes. The teacher needs a 5-minute room setup before students enter. Another staff member asks for an 8-minute copying task now. What is the best response?",
  [
   "Start both tasks because 5 minutes and 8 minutes are each shorter than 12 minutes.",
   "Explain the timing conflict to the teacher or assigned supervisor and confirm which task takes priority.",
   "Complete the copying task and begin setup when students enter without updating the teacher."
  ],
  1,
  "The tasks total 13 minutes, exceeding the available 12. Communicate before silently choosing which requirement will be missed.",
  "Add the task times and compare them with the actual deadline.",
  2
 ],
 [
  "education",
  "follow-up-plan",
  "Your training instructor says your work is accurate but often late. Which next-session plan most directly addresses that feedback?",
  [
   "Repeat the task without timing it so accuracy stays the only focus.",
   "Submit an unfinished task at the deadline to show you can be on time.",
   "Break the task into timed steps, check progress at agreed points, and review accuracy and completion time afterward."
  ],
  2,
  "Target the stated problem while keeping the existing standard. Use progress checks to improve timeliness without discarding accuracy.",
  "The goal is accuracy and timeliness together.",
  2
 ],
 [
  "money",
  "profit-expenses",
  "Today’s sales are $640. Ingredients cost $180, wages $220, and the day’s utilities allocation is $40. Ignoring other costs, what is today’s profit?",
  [
   "$200",
   "$240",
   "$460"
  ],
  0,
  "Expenses are $180 + $220 + $40 = $440. Profit is $640 − $440 = $200.",
  "Subtract all the listed expenses, not just the supplies.",
  1
 ],
 [
  "money",
  "revenue-cash",
  "Your café account starts with $300. Customer sales add $240, and supplies cost $90. There are no other transactions. Which statement is correct?",
  [
   "Ending cash and sales revenue for this period are both $450.",
   "Ending cash is $450; sales revenue for this period is $240.",
   "Ending cash is $150; sales revenue for this period is $240."
  ],
  1,
  "Cash balance includes the opening $300. Sales revenue counts the $240 earned from customers during the period, not the opening balance.",
  "Account balance and sales for a period are different measures.",
  1
 ],
 [
  "money",
  "pack-costs",
  "You need at least 45 cups. Supplier A sells 20 cups for $6 per pack. Supplier B sells 50 cups for $14 per pack. No delivery charges apply. Which purchase meets the need for the lowest total spend?",
  [
   "Two packs from A for $12.",
   "Three packs from A for $18.",
   "One pack from B for $14."
  ],
  2,
  "A requires three packs to cover 45 cups, costing $18. B covers the need with one $14 pack. Two A packs cost less but provide only 40 cups.",
  "The cheapest option must still provide enough cups.",
  2
 ],
 [
  "money",
  "bill-before-draw",
  "The business has $520 available. Wages of $180 and a $120 bill are due before new sales arrive. Essential supplies cost $140. How much remains for an owner payment after covering those listed commitments?",
  [
   "$80",
   "$220",
   "$260"
  ],
  0,
  "The listed commitments total $180 + $120 + $140 = $440. $520 − $440 leaves $80. This scenario ignores any other required reserves or costs.",
  "Subtract wages, the bill, and the essential supplies before the owner payment.",
  2
 ],
 [
  "money",
  "break-even",
  "A practice shop sells each service for $20. Supplies cost $8 per service, and the session has $60 in fixed expenses. How many services must be sold to exactly cover these listed costs?",
  [
   "3 services.",
   "5 services.",
   "8 services."
  ],
  1,
  "Each sale contributes $20 − $8 = $12 toward fixed expenses. $60 ÷ $12 = 5 services to break even on the listed costs.",
  "Subtract the per-service supply cost before using sales to cover fixed expenses.",
  2
 ]
];
g.TTShowQuestions={categories,questions:rows.map(([category,id,prompt,options,answer,explanation,hint,level])=>({category,id,prompt,options,answer,explanation,hint,level}))};if(typeof module!=="undefined")module.exports=g.TTShowQuestions;
})(typeof window!=="undefined"?window:globalThis);
