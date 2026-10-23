(function(g){g.TTSchoolData={
 "rooms": [
  {
   "id": "work",
   "title": "Workplace Expectations",
   "intro": "What employers expect before, during, and after a shift.",
   "color": "#7052aa",
   "game": "workplace-simulator.html",
   "gameTitle": "Workplace Simulator"
  },
  {
   "id": "money",
   "title": "Money & Business",
   "intro": "Understand revenue, expenses, profit, inventory, and planning.",
   "color": "#24816a",
   "game": "grocery-trip.html",
   "gameTitle": "Grocery Budget Practice"
  },
  {
   "id": "career",
   "title": "Careers & Training",
   "intro": "Compare jobs and training, prepare applications, and ask useful questions.",
   "color": "#356daf",
   "game": "career-explorer.html",
   "gameTitle": "Career Explorer"
  },
  {
   "id": "life",
   "title": "Everyday Independence",
   "intro": "Plan transportation, organize tasks, and communicate when plans change.",
   "color": "#b36545",
   "game": "cooking-game.html",
   "gameTitle": "Kitchen Challenge"
  }
 ],
 "lessons": [
  {
   "room": "work",
   "id": "ready-for-shift",
   "title": "1. Being ready for a shift",
   "lead": "Being on time means knowing when and where you are expected and arriving prepared for the assigned work. A plan includes travel, check-in, and required materials—not only the time on the schedule.",
   "points": [
    "Read the schedule and the employer’s clock-in rules. Use your own employee identity.",
    "Prepare clean, suitable clothing and required work items. Follow the job’s hygiene and safety rules.",
    "Plan travel and a backup. Report a possible delay to the responsible supervisor early. Do not assume a coworker can approve a change."
   ],
   "example": "Orientation begins at 8:30. Travel takes 20 minutes, check-in takes 5, and you allow a 10-minute delay buffer. Plan to leave at 7:55. The full plan takes 35 minutes.",
   "takeaway": "Readiness = time + place + preparation. Follow the employer’s policy for paid preparation and clock-in.",
   "check": {
    "prompt": "A shift swap requires manager approval. Your coworker agrees, but the schedule still lists you. What is your responsibility?",
    "options": [
     "Confirm manager approval and remain responsible until the swap is approved.",
     "Assume the coworker’s text replaces approval.",
     "Wait until after the shift to ask who was responsible."
    ],
    "answer": 0,
    "why": "Agreement between coworkers is not the manager approval required in this scenario."
   },
   "reflection": "What would you prepare the night before a Town shift?",
   "source": [
    "CareerOneStop · After you land a job",
    "https://www.careeronestop.org/JusticeImpacted/FindAJob/AfterYouLandAJob/after-you-land-a-job.aspx"
   ]
  },
  {
   "room": "work",
   "id": "clear-communication",
   "title": "2. Instructions, feedback & asking for help",
   "lead": "Professional communication is accurate, respectful, and useful. Asking a specific question can prevent errors; reporting a problem early gives the team time to respond.",
   "points": [
    "Repeat the task’s goal, deadline, and key steps in your own words. Ask about unclear details before guessing.",
    "When work is delayed, state what is complete, what is blocked, and what help you need.",
    "Listen to feedback, identify the specific standard, and change the process that caused the problem."
   ],
   "example": "Instead of “I can’t do it,” try: “I finished six of ten kits. The materials list and labels do not match. Which list should I use before I continue?”",
   "takeaway": "Describe the problem and the next step you need. You can ask for a demonstration, written steps, or a checklist.",
   "check": {
    "prompt": "Two instruction sheets disagree about where an item belongs. What is the strongest question?",
    "options": [
     "“Can I use whichever list is faster?”",
     "“These two lists use different shelf locations. Which version is current?”",
     "“Can someone finish all my work instead?”"
    ],
    "answer": 1,
    "why": "Pointing out the exact conflict makes it easier for the responsible person to give a useful answer."
   },
   "reflection": "Write one specific sentence you could use when a work instruction is unclear.",
   "source": [
    "CareerOneStop · After you land a job",
    "https://www.careeronestop.org/JusticeImpacted/FindAJob/AfterYouLandAJob/after-you-land-a-job.aspx"
   ]
  },
  {
   "room": "work",
   "id": "service-and-priorities",
   "title": "3. Customer service & priorities",
   "lead": "Good service includes listening, accurate information, safe work, and staying within your authority. The fastest answer is not always the best answer.",
   "points": [
    "Follow the workplace’s procedure for an immediate hazard before routine tasks. Communicate about any delayed assignment.",
    "Confirm the customer’s request and check the written order or record. Do not promise something you cannot provide.",
    "Know which decisions need a supervisor, such as certain refunds, substitutions, or schedule changes."
   ],
   "example": "A customer requests an $18 refund. Your practice role may approve up to $10. Explain that the refund needs manager approval and request it; do not split it into two $9 refunds.",
   "takeaway": "Be helpful and honest while following the approval process.",
   "check": {
    "prompt": "The task card says guard a spill and call for help. A customer also needs an item located. Which comes first?",
    "options": [
     "Locate the customer’s item, then return to the spill.",
     "Finish restocking before deciding.",
     "Guard the spill and call for help, while acknowledging the waiting customer."
    ],
    "answer": 2,
    "why": "The scenario gives a specific immediate-hazard procedure. Acknowledge the customer and update the team about the delay."
   },
   "reflection": "How could you explain a short wait to a customer respectfully?",
   "source": [
    "CareerOneStop · After you land a job",
    "https://www.careeronestop.org/JusticeImpacted/FindAJob/AfterYouLandAJob/after-you-land-a-job.aspx"
   ]
  },
  {
   "room": "money",
   "id": "revenue-profit",
   "title": "1. Revenue, expenses & profit",
   "lead": "Revenue is money earned from sales during a period. Expenses are the costs for that period. Profit is revenue minus expenses. Money entering the register is not automatically all profit.",
   "points": [
    "Choose the same period for both sales and costs, such as one simulated shift.",
    "Include every listed cost: supplies, wages, and any bills allocated to that shift.",
    "Keep an opening bank balance separate from the period’s sales. A balance and a profit measure different things."
   ],
   "example": "A café earns $600 in sales. Listed costs are $170 supplies + $230 wages + $40 utilities = $440. Profit is $600 − $440 = $160.",
   "takeaway": "Revenue − expenses = profit. A negative result means a loss on the listed figures.",
   "check": {
    "prompt": "Sales are $500. Supplies cost $140, wages $180, and utilities $30. What is profit on these listed figures?",
    "options": [
     "$150",
     "$180",
     "$360"
    ],
    "answer": 0,
    "why": "Total expenses are $350. $500 − $350 = $150."
   },
   "reflection": "Name a cost a Town business must plan for before paying its owner.",
   "source": null
  },
  {
   "room": "money",
   "id": "cash-and-commitments",
   "title": "2. Cash, bills & spending plans",
   "lead": "An account balance tells you how much cash is present. A spending plan also considers money already committed to bills, wages, or supplies.",
   "points": [
    "List money available and upcoming commitments before deciding on extra spending.",
    "Use records and receipts to check what came in and went out. Report a difference rather than changing a number to hide it.",
    "A transfer into an account is not necessarily a sale. Read what the transaction represents."
   ],
   "example": "The business starts with $300, receives $240 in sales, and buys $90 in supplies. Ending cash is $450. Sales revenue for this period is $240, not $450.",
   "takeaway": "Ask both: “What is the balance?” and “What still needs to be paid?”",
   "check": {
    "prompt": "There is $400 available, with $180 wages and an $80 bill due before more sales. What remains after those two commitments?",
    "options": [
     "$220",
     "$140",
     "$400"
    ],
    "answer": 1,
    "why": "The commitments total $260. $400 − $260 leaves $140 before any other costs."
   },
   "reflection": "What is one reason a business with money in its account may need to delay an extra purchase?",
   "source": [
    "CFPB · Creating a budget",
    "https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/"
   ]
  },
  {
   "room": "money",
   "id": "inventory-and-cost",
   "title": "3. Inventory & purchasing decisions",
   "lead": "Inventory is the stock a business has available. Compare stock to customer commitments and check the total purchase cost, not just the price printed on one package.",
   "points": [
    "Count usable stock and subtract what is already promised to orders.",
    "Check package quantity, number of packs needed, and any delivery costs stated in the offer.",
    "Reorder through the business’s approval process early enough to avoid promising unavailable items."
   ],
   "example": "You need 45 cups. Packs of 20 cost $6, so three packs cost $18. A 50-cup pack costs $14. With no other costs, the $14 pack meets the need for less total spending.",
   "takeaway": "A cheaper package is not always the cheapest complete order.",
   "check": {
    "prompt": "Four paid orders need 2 rolls each. Six rolls are usable. What should you report?",
    "options": [
     "There are enough rolls if each order gets fewer.",
     "Six orders can be accepted because there are six rolls.",
     "The committed orders need 8 rolls, so there is a shortage of 2."
    ],
    "answer": 2,
    "why": "Four times two is eight. There are six, leaving two missing before any new orders."
   },
   "reflection": "What would you check before ordering more supplies?",
   "source": null
  },
  {
   "room": "career",
   "id": "understand-the-job",
   "title": "1. Investigate the real work",
   "lead": "A job title is only a starting point. Learn the daily tasks, setting, schedule, training, and expectations before deciding whether a role interests you.",
   "points": [
    "Compare tasks you enjoy with tasks you would need to practice. A simulated activity can help you notice preferences.",
    "Investigate requirements using the employer or training provider. Do not assume requirements are identical everywhere.",
    "Ask about working conditions, schedules, supports, and the skills used each day."
   ],
   "example": "An interest in animals may connect to several jobs with different daily tasks. Compare feeding and cleaning, customer communication, recordkeeping, and the training each role requires.",
   "takeaway": "Choose based on evidence about the work and your goals, not just a title or picture.",
   "check": {
    "prompt": "Which question provides the most useful information about a job?",
    "options": [
     "“What does a typical shift include, and what training is required?”",
     "“Does the job title sound impressive?”",
     "“Would a friend choose the same job?”"
    ],
    "answer": 0,
    "why": "Daily duties and training help you compare the actual work with your interests and goals."
   },
   "reflection": "Which daily task in a career interests you, and which task would you want to learn more about?",
   "source": [
    "CareerOneStop · Explore careers",
    "https://www.careeronestop.org/"
   ]
  },
  {
   "room": "career",
   "id": "compare-training",
   "title": "2. Compare education & training",
   "lead": "Education and training pathways can include career programs, certificates, apprenticeships, and degrees. Compare the specific program rather than assuming one type is best for everyone.",
   "points": [
    "Check program content, entry requirements, schedule, duration, total costs, and available support.",
    "Include materials and travel costs in a comparison when they apply. Confirm current details directly with the provider.",
    "Connect the program to a goal, then identify one next action such as asking about entry steps or arranging a visit."
   ],
   "example": "Two fictional programs cost $1,200 and $1,100 in tuition. Their required materials cost $200 and $400. Totals before travel are $1,400 and $1,500. Lower tuition alone does not identify the lower total.",
   "takeaway": "Fit includes the goal, schedule, requirements, support, and complete costs.",
   "check": {
    "prompt": "A program’s weekly schedule requires 25 hours, but you can attend 15. What should you check before applying?",
    "options": [
     "Only whether the logo looks professional.",
     "Whether an approved schedule or another program can meet your availability and goal.",
     "Whether you can simply skip the extra ten hours."
    ],
    "answer": 1,
    "why": "Confirm a workable schedule and program fit instead of assuming required hours can be skipped."
   },
   "reflection": "List two details you would compare between training programs.",
   "source": [
    "Federal Student Aid · Choosing schools",
    "https://studentaid.gov/resources/prepare-for-college/students/choosing-schools"
   ]
  },
  {
   "room": "career",
   "id": "applications-interviews",
   "title": "3. Applications & interviews",
   "lead": "A strong application uses accurate information and real examples. An interview helps an employer understand what you have done and how you respond to work situations.",
   "points": [
    "Use real school, volunteer, or practice experiences. Describe your part without claiming someone else’s work.",
    "Prepare examples: what was the task, what did you do, and what result did you actually observe?",
    "Check the contact information you provide and watch for messages. Practice a clear, professional response."
   ],
   "example": "“Our café group needed an inventory list. I counted the pantry items and compared the list with the menu. We found two missing ingredients before practicing orders.” This describes a specific contribution without inventing a job.",
   "takeaway": "Specific, honest examples are more useful than unsupported claims.",
   "check": {
    "prompt": "Which interview answer gives the clearest evidence of teamwork?",
    "options": [
     "“I am good at everything.”",
     "“My group finished, so I must have done the most.”",
     "“I checked our order list while my partner assembled the items, and we caught a missing item.”"
    ],
    "answer": 2,
    "why": "The answer identifies the student’s contribution and an observed result."
   },
   "reflection": "Describe one real contribution you made to a school or Town project.",
   "source": [
    "CareerOneStop · Explore careers",
    "https://www.careeronestop.org/"
   ]
  },
  {
   "room": "life",
   "id": "plan-the-trip",
   "title": "1. Transportation & time planning",
   "lead": "A complete trip plan includes arriving ready, getting home, paying for the trip, and responding safely to a change.",
   "points": [
    "Work backward from the required arrival time. Add travel, check-in, and a realistic delay buffer.",
    "Confirm the pickup location, destination, fare, and return plan. Use the arranged service’s safety checks.",
    "If the plan changes, stay somewhere safe, check an appropriate backup, and update anyone who is waiting."
   ],
   "example": "An appointment begins at 10:00. Travel is 35 minutes, check-in is 10, and the delay buffer is 10. Leave at 9:05. A 35-minute trip alone would not include the other steps.",
   "takeaway": "Plan both directions and the time before the activity begins.",
   "check": {
    "prompt": "An activity begins at 9:00. Travel takes 25 minutes and check-in 10 minutes. With no extra buffer in this example, when is the latest planned departure?",
    "options": [
     "8:25",
     "8:35",
     "8:50"
    ],
    "answer": 0,
    "why": "Count backward 35 minutes from 9:00: 8:25. A real plan may need an additional delay buffer."
   },
   "reflection": "What would you include in a backup transportation plan?",
   "source": null
  },
  {
   "room": "life",
   "id": "organize-the-day",
   "title": "2. Schedules, checklists & priorities",
   "lead": "A checklist can make a large task manageable. A schedule adds deadlines and available time. Good planning also notices when tasks cannot all fit.",
   "points": [
    "Identify required steps and deadlines before starting. Mark completed steps accurately.",
    "Add the time needed for tasks and transitions. If the total exceeds the available time, ask about priorities early.",
    "Use reminders, written steps, or a demonstration when they help. Update the plan when circumstances change."
   ],
   "example": "Room setup takes 5 minutes and copying takes 8. If the lesson starts in 12 minutes, both tasks do not fit: they total 13. Tell the responsible teacher and confirm the priority.",
   "takeaway": "A useful plan includes when to ask for a decision, not just a list of tasks.",
   "check": {
    "prompt": "A task takes 18 minutes and cleanup takes 7. You have 20 minutes. What should you recognize?",
    "options": [
     "The plan fits because each part is under 20 minutes.",
     "The total is 25 minutes, so the plan needs an adjustment or an approved priority.",
     "Cleanup does not need to be counted."
    ],
    "answer": 1,
    "why": "The total is 18 + 7 = 25, which is five minutes more than available."
   },
   "reflection": "What reminder or checklist would help you manage a busy day?",
   "source": null
  },
  {
   "room": "life",
   "id": "needs-and-decisions",
   "title": "3. Everyday spending & asking for support",
   "lead": "Everyday choices often compete for the same time or money. A plan makes the tradeoffs visible and helps you ask for the right information or support.",
   "points": [
    "List necessary commitments before deciding how much is available for extras.",
    "Check the complete cost, including a return trip or required materials, when comparing choices.",
    "When a plan does not work, explain the specific problem and ask a trusted, appropriate person about available options."
   ],
   "example": "You have $60. The trip costs $12 each way and a planned meal costs $8. The complete plan costs $32, leaving $28. Counting only the outbound fare would overstate what remains.",
   "takeaway": "A complete plan is more useful than a guess based on only the first cost.",
   "check": {
    "prompt": "You cannot understand an appointment instruction. Which request is most useful?",
    "options": [
     "“I will guess what the instruction means.”",
     "“Someone else should make every decision.”",
     "“Could you explain this step in plain language or show me what I need to do?”"
    ],
    "answer": 2,
    "why": "A specific request helps another person provide the support you need while keeping you involved in the decision."
   },
   "reflection": "Name one situation where you could ask for written steps or a clearer explanation.",
   "source": [
    "CFPB · Creating a budget",
    "https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/"
   ]
  }
 ],
 "tests": {
  "work": [
   {
    "prompt": "Orientation is at 9:00. Travel is 25 minutes, check-in 10, and your chosen buffer 5. When should you plan to leave?",
    "options": [
     "8:20",
     "8:35",
     "8:25"
    ],
    "answer": 0,
    "why": "25 + 10 + 5 = 40 minutes. 9:00 minus 40 minutes is 8:20."
   },
   {
    "prompt": "A task’s two instruction sheets conflict. What should you do before using either?",
    "options": [
     "Use the shorter sheet.",
     "Show the conflict and ask the responsible person which version is current.",
     "Follow half of each sheet."
    ],
    "answer": 1,
    "why": "Clarify conflicting requirements before creating avoidable errors."
   },
   {
    "prompt": "Your role approves refunds up to $10. A customer requests $18. Which action follows that limit?",
    "options": [
     "Split the refund into two $9 entries.",
     "Promise approval because the customer is upset.",
     "Request the manager approval needed for the full refund."
    ],
    "answer": 2,
    "why": "Splitting entries does not remove the approval requirement for the requested amount."
   }
  ],
  "money": [
   {
    "prompt": "Sales are $720. Supplies cost $190, wages $240, and listed utilities $50. What is profit on these figures?",
    "options": [
     "$240",
     "$290",
     "$530"
    ],
    "answer": 0,
    "why": "Costs total $480. $720 − $480 = $240."
   },
   {
    "prompt": "You start with $200, receive $180 in sales, and spend $70 on supplies. Which pair is correct?",
    "options": [
     "Ending cash $310; period sales $310.",
     "Ending cash $310; period sales $180.",
     "Ending cash $110; period sales $180."
    ],
    "answer": 1,
    "why": "Ending cash is $200 + $180 − $70 = $310. The opening balance is not sales revenue."
   },
   {
    "prompt": "You need 45 cups. Twenty-cup packs cost $6; a 50-cup pack costs $14. There are no other costs. What meets the need for the lowest total spend?",
    "options": [
     "Two 20-cup packs for $12.",
     "Three 20-cup packs for $18.",
     "One 50-cup pack for $14."
    ],
    "answer": 2,
    "why": "Two smaller packs are not enough. Three cost $18, while one 50-cup pack covers the need for $14."
   }
  ],
  "career": [
   {
    "prompt": "Which information best helps you compare a career with your interests?",
    "options": [
     "Daily tasks, setting, schedule, and training requirements.",
     "Only the title.",
     "Only whether a friend likes it."
    ],
    "answer": 0,
    "why": "Compare the actual work and requirements with your interests and goals."
   },
   {
    "prompt": "Program A has $1,200 tuition and $200 materials. Program B has $1,100 tuition and $400 materials. Ignoring other costs, which total is correct?",
    "options": [
     "A costs $1,200 and B costs $1,100.",
     "A costs $1,400 and B costs $1,500.",
     "A costs $1,500 and B costs $1,400."
    ],
    "answer": 1,
    "why": "Include tuition and required materials for each program."
   },
   {
    "prompt": "Which interview example most accurately describes your experience?",
    "options": [
     "Claim a teammate’s work because you shared a project.",
     "Invent a supervisor role so the example sounds stronger.",
     "Describe your actual task, your action, and a result you observed."
    ],
    "answer": 2,
    "why": "Use evidence of your own contribution and avoid inventing experience."
   }
  ],
  "life": [
   {
    "prompt": "An activity starts at 11:00. Travel takes 30 minutes, check-in 10, and the planned buffer 5. When should you leave?",
    "options": [
     "10:15",
     "10:30",
     "10:45"
    ],
    "answer": 0,
    "why": "The complete plan takes 45 minutes, so leave at 10:15."
   },
   {
    "prompt": "You have 22 minutes. Setup takes 8 minutes, the task takes 12, and cleanup takes 5. What should you notice?",
    "options": [
     "The plan fits because the main task is 12 minutes.",
     "The full plan takes 25 minutes, so it exceeds the available time by 3.",
     "Only setup and the main task count."
    ],
    "answer": 1,
    "why": "Count every required part: 8 + 12 + 5 = 25."
   },
   {
    "prompt": "You have $60. Travel costs $12 each way and a planned meal costs $8. What remains after the complete plan?",
    "options": [
     "$40",
     "$36",
     "$28"
    ],
    "answer": 2,
    "why": "Total cost is $12 + $12 + $8 = $32. $60 − $32 = $28."
   }
  ]
 },
 "challenges": {
  "work": {
   "title": "Plan a ready-to-work arrival",
   "scenario": "Orientation starts at 9:00. Travel takes 28 minutes, check-in takes 10 minutes, and you allow a 5-minute delay buffer.",
   "fields": [
    {
     "label": "Total time to allow, in minutes",
     "type": "number",
     "answer": "43"
    },
    {
     "label": "Latest planned departure time (24-hour HH:MM)",
     "type": "time",
     "answer": "08:17"
    }
   ],
   "prompt": "Your clean required shirt is unavailable. Which next step fits a readiness plan?",
   "options": [
    "Tell the supervisor before the assignment and arrange an approved solution.",
    "Assume the dress requirement is optional today.",
    "Start the task and explain the problem afterward."
   ],
   "answer": 0,
   "why": "28 + 10 + 5 = 43 minutes. Leave at 8:17. Communicate a preparation problem early and follow the workplace’s dress requirements."
  },
  "money": {
   "title": "Plan the café’s listed costs",
   "scenario": "A fictional café shift earns $540. Supplies cost $160, wages $210, and listed utilities $40. Ignore other costs for this exercise.",
   "fields": [
    {
     "label": "Total listed expenses, in dollars",
     "type": "number",
     "answer": "410"
    },
    {
     "label": "Profit on the listed figures, in dollars",
     "type": "number",
     "answer": "130"
    }
   ],
   "prompt": "The account also had $300 before this shift. Does that make the shift’s sales revenue $840?",
   "options": [
    "Yes, all cash in the account is today’s revenue.",
    "No, sales revenue is $540; the opening balance is a different figure.",
    "No, sales revenue is the $130 profit."
   ],
   "answer": 1,
   "why": "Expenses are $160 + $210 + $40 = $410. Profit is $130. Opening cash does not become new sales."
  },
  "career": {
   "title": "Compare two fictional training plans",
   "scenario": "You can attend up to 15 hours a week. Program A requires 12 hours weekly, $1,200 tuition, $200 materials, and $80 travel. Program B requires 25 hours weekly, $1,100 tuition, $400 materials, and $180 travel.",
   "fields": [
    {
     "label": "Program A’s listed total cost, in dollars",
     "type": "number",
     "answer": "1480"
    },
    {
     "label": "Program B’s listed total cost, in dollars",
     "type": "number",
     "answer": "1680"
    }
   ],
   "prompt": "What is the strongest next step based on the information given?",
   "options": [
    "Choose B because its tuition is lower.",
    "Apply to both without checking the weekly hours.",
    "Explore A’s fit and confirm current requirements and support with the provider."
   ],
   "answer": 2,
   "why": "A totals $1,480 and B totals $1,680. Only A’s listed weekly hours fit the given availability; confirm details and fit before deciding."
  },
  "life": {
   "title": "Build a complete appointment plan",
   "scenario": "An appointment starts at 10:00. Travel takes 35 minutes, check-in 10, and your planned delay buffer 10. You have $60; travel costs $12 each way and the planned meal $8.",
   "fields": [
    {
     "label": "Latest planned departure time (24-hour HH:MM)",
     "type": "time",
     "answer": "09:05"
    },
    {
     "label": "Money remaining after the complete trip and meal, in dollars",
     "type": "number",
     "answer": "28"
    }
   ],
   "prompt": "Your planned ride cancels. What should your updated plan include?",
   "options": [
    "A safe backup, an updated arrival estimate, and contact with anyone waiting.",
    "Only a new outbound ride; the return trip can be decided later.",
    "Keeping the same arrival promise without checking the backup’s timing."
   ],
   "answer": 0,
   "why": "The time plan takes 55 minutes, so leave at 9:05. Round-trip travel and the meal cost $32, leaving $28. A changed plan needs safe transport and clear communication."
  }
 }
};})(window);
