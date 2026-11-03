// Original Transition Town instructional vocabulary. Each row links four levels
// of vocabulary to one practical concept; no student information belongs here.
const book = (id, title, color, icon, rows) => ({id,title,color,icon,rows:rows.trim().split('\n').map((row,i)=>{
 const [b,m,h,e,meaning]=row.split('|');
 return {id:i,words:[b,m,h,e],meaning};
})});
export const BOOKS = [
book('careers','Career Exploration','#a14dd2','✦',`
JOB|CAREER|OCCUPATION|CAREERPATHWAY|Explore a type of work you may want to do.
COOK|CHEF|CULINARY|FOODSERVICE|Prepare food safely for others.
NURSE|HEALTH|HEALTHCARE|HEALTHSERVICES|Help people with their health and care.
BUILD|BUILDER|CONSTRUCTION|SKILLEDTRADES|Build or repair useful structures.
TEACH|TEACHER|EDUCATION|EDUCATOR|Help other people learn.
FIX|REPAIR|TECHNICIAN|MAINTENANCE|Find problems and repair equipment.
SELL|RETAIL|SALESPERSON|MERCHANDISING|Help customers choose and buy products.
DRIVE|DRIVER|TRANSPORT|TRANSPORTATION|Move people or goods safely.
FARM|FARMER|AGRICULTURE|AGRIBUSINESS|Grow plants or care for farm animals.
ART|ARTIST|DESIGNER|GRAPHICDESIGN|Create visual work to communicate ideas.
CODE|CODING|SOFTWARE|PROGRAMMING|Write instructions for computers.
PET|ANIMALS|VETERINARY|ANIMALCARE|Support the health and care of animals.
HELP|HELPER|SOCIALWORK|HUMANSERVICES|Connect people with support and resources.
GOAL|JOBGOAL|CAREERGOAL|CAREERPLANNING|Choose a work goal and plan steps toward it.
LIKE|INTEREST|INTERESTS|INTERESTINVENTORY|Notice activities and subjects you enjoy.
SKILL|ABILITY|STRENGTHS|TRANSFERABLESKILL|Recognize something you can do well in different settings.
TRY|EXPLORE|JOBSHADOW|CAREEREXPLORATION|Observe a worker to learn about a job.
LEARN|TRAINING|APPRENTICE|APPRENTICESHIP|Learn job skills with instruction and practice.
TEAM|CREW|COLLEAGUE|COLLABORATION|Work with other people toward a shared goal.
PAY|WAGES|EARNINGS|COMPENSATION|Learn what a worker receives for their work.
`),
book('readiness','Workplace Readiness','#258d99','◈',`
TIME|ONTIME|PUNCTUAL|PUNCTUALITY|Arrive when your shift or meeting begins.
PLAN|SCHEDULE|SCHEDULING|TIMEMANAGEMENT|Organize tasks and the time needed for them.
LISTEN|LISTENING|ATTENTIVE|ACTIVELISTENING|Pay attention and check what a speaker means.
ASK|QUESTIONS|CLARIFY|CLARIFICATION|Ask for an explanation when directions are unclear.
SAFE|SAFETY|HAZARDS|HAZARDPREVENTION|Notice risks and follow safety procedures.
CLEAN|TIDY|SANITATION|WORKPLACESAFETY|Keep a shared work area clean and safe.
KIND|RESPECT|RESPECTFUL|PROFESSIONALISM|Treat people politely and considerately.
WORK|TASK|ASSIGNMENT|RESPONSIBILITY|Complete the work you agree to do.
HELP|SUPPORT|ASSISTANCE|SUPPORTNETWORK|Request help from an appropriate person.
TEAM|TEAMWORK|COOPERATE|COOPERATION|Share tasks and work toward a common goal.
BREAK|REST|BREAKTIME|RESTPERIOD|Use an approved break to rest and recharge.
DRESS|UNIFORM|DRESSCODE|WORKPLACEATTIRE|Choose clothing that meets stated work and safety rules.
TOOLS|EQUIPMENT|WORKTOOLS|EQUIPMENTCARE|Use and store job equipment as instructed.
CHECK|REVIEW|QUALITY|QUALITYCONTROL|Check that your work meets the task requirements.
CALM|PATIENT|PATIENCE|SELFREGULATION|Use a coping strategy before responding to frustration.
HONEST|TRUTH|INTEGRITY|ACCOUNTABILITY|Tell the truth and take responsibility for your actions.
CHANGE|ADAPT|FLEXIBLE|ADAPTABILITY|Adjust your plan when a task or situation changes.
SHARE|SPEAK|COMMUNICATE|COMMUNICATION|Give clear information and listen to others.
SOLVE|PROBLEM|SOLUTION|PROBLEMSOLVING|Identify a problem and try a safe solution.
FINISH|COMPLETE|FOLLOWUP|FOLLOWTHROUGH|Finish an agreed task or tell someone what is still needed.
`),
book('money','Money and Banking','#c08d27','$',`
COIN|COINS|CURRENCY|LEGALCURRENCY|Recognize money used to pay for goods and services.
PENNY|CENT|PENNIES|COINVALUE|Recognize the United States coin worth one cent.
NICKEL|NICKELS|FIVECENTS|COINCOUNTING|Recognize the United States coin worth five cents.
DIME|DIMES|TENCENTS|DECIMALVALUE|Recognize the United States coin worth ten cents.
QUARTER|QUARTERS|TWENTYFIVE|QUARTERDOLLAR|Recognize the United States coin worth twenty-five cents.
DOLLAR|DOLLARS|BANKNOTE|DENOMINATION|Identify the value printed on a bill.
BANK|BANKING|FINANCIAL|FINANCIALSERVICE|Use an authorized place to keep or manage money.
SAVE|SAVING|SAVINGS|SAVINGSACCOUNT|Set money aside for future needs or goals.
SPEND|SPENDING|PURCHASE|SPENDINGPLAN|Use money to buy something within a plan.
NEED|NEEDS|ESSENTIAL|ESSENTIALEXPENSE|Identify something necessary such as food or shelter.
WANT|WANTS|OPTIONAL|DISCRETIONARY|Identify something you would enjoy but can choose to delay.
PLAN|BUDGET|BUDGETING|FINANCIALPLANNING|Plan how income will cover expenses and savings.
COST|PRICE|UNITPRICE|PRICECOMPARISON|Compare costs before deciding what to buy.
CHANGE|CHANGE|CASHCHANGE|CHANGETOTAL|Check the money returned after paying more than the price.
CHECK|CHECKING|TRANSACTION|CHECKINGACCOUNT|Review money moving into and out of an account.
ADD|DEPOSIT|DEPOSITING|DIRECTDEPOSIT|Put money into an account.
TAKE|WITHDRAW|WITHDRAWAL|WITHDRAWFUNDS|Take available money out of an account.
EARN|INCOME|PAYCHECK|NETEARNINGS|Identify the money available after paycheck deductions.
BILL|BILLS|EXPENSES|RECURRINGEXPENSE|Plan for payments that come due regularly.
CARD|DEBIT|DEBITCARD|ACCOUNTPRIVACY|Keep your card and private account information secure.
`),
book('interviews','Job Interviews','#427ed2','↗',`
HELLO|GREETING|INTRODUCE|INTRODUCTION|Greet the interviewer and share your name.
NAME|CONTACT|CONTACTINFO|CONTACTDETAILS|Provide a safe way for an employer to reach you.
JOB|POSITION|VACANCY|JOBOPPORTUNITY|Find out which role the employer needs to fill.
FORM|APPLY|APPLICATION|JOBAPPLICATION|Complete requested information accurately.
SKILL|SKILLS|QUALIFIED|QUALIFICATIONS|Explain abilities related to the job.
WORK|PRACTICE|EXPERIENCE|WORKEXPERIENCE|Describe relevant work, school, or volunteer activities.
RESUME|RESUME|CREDENTIAL|QUALIFICATION|Summarize your preparation and achievements.
READY|PREPARE|PREPARATION|INTERVIEWPREP|Practice answers and learn about the employer.
TIME|ARRIVE|PUNCTUAL|ARRIVALPLANNING|Allow travel time so you can arrive on time.
DRESS|ATTIRE|PRESENTATION|PERSONALPRESENTATION|Follow the interview clothing expectations you were given.
ASK|QUESTION|INQUIRE|CLARIFYEXPECTATIONS|Ask a useful question about the role or workplace.
LISTEN|FOCUS|ATTENTION|ACTIVELISTENING|Listen to the full question before answering.
TELL|EXPLAIN|EXAMPLE|SPECIFICEXAMPLE|Use a real example to explain a skill.
HELP|SUPPORT|ADJUSTMENT|ACCOMMODATION|Ask for an adjustment that supports fair participation.
HONEST|HONESTY|INTEGRITY|TRUTHFULRESPONSE|Give accurate answers about your skills and experience.
CALM|BREATHE|CONFIDENCE|SELFCONFIDENCE|Use a calming strategy while preparing your response.
THANK|THANKS|APPRECIATE|APPRECIATION|Thank the interviewer for their time.
LATER|FOLLOWUP|FOLLOWTHROUGH|PROFESSIONALFOLLOWUP|Use the agreed method to check in after the interview.
PERSON|REFERENCE|REFERENCES|PROFESSIONALREFERENCE|Ask permission before listing someone who can describe your work.
OFFER|JOBOFFER|EMPLOYMENT|EMPLOYMENTTERMS|Review the job duties, pay, and schedule before accepting.
`),
book('kitchen','Kitchen and Food Safety','#df7370','♧',`
WASH|HANDWASH|HANDWASHING|HANDHYGIENE|Wash hands with soap and water before handling food.
CLEAN|CLEANING|SANITIZE|SANITATION|Clean and sanitize work surfaces as directed.
SOAP|SOAPY|DETERGENT|CLEANINGSUPPLIES|Use the correct cleaning product according to its label.
HOT|HEAT|TEMPERATURE|TEMPERATURECHECK|Check food temperature with a suitable thermometer.
COLD|CHILL|REFRIGERATE|REFRIGERATION|Keep perishable foods properly chilled.
RAW|UNCOOKED|SEPARATE|CROSSCONTAMINATION|Keep raw animal foods and their juices away from ready-to-eat food.
COOK|COOKING|COOKTHOROUGHLY|SAFEMINIMUMTEMP|Follow verified cooking time and temperature guidance.
TIMER|TIMING|TIMECONTROL|FOODHOLDINGTIME|Keep track of how long food is cooking or sitting out.
KNIFE|CUTTING|KNIFESAFETY|SAFECUTTING|Use a safe cutting method and ask for support when needed.
MITT|OVENMITT|HEATPROTECTION|BURNPREVENTION|Protect hands when handling hot cookware.
APRON|APRONS|PROTECTIVE|PROTECTIVECLOTHING|Use clean protective clothing suitable for the food task.
HAIR|HAIRTIE|HAIRNET|HAIRRESTRAINT|Keep hair secured away from food and equipment.
LABEL|LABELS|INGREDIENT|INGREDIENTLABEL|Read the ingredient label before using a product.
CHECK|ALLERGY|ALLERGEN|ALLERGENAWARENESS|Check allergy information before preparing or serving food.
DATE|DATED|EXPIRATION|DATECHECKING|Check storage instructions and relevant food dates.
RINSE|PRODUCE|WASHFRUIT|PRODUCEWASHING|Rinse produce under running water as appropriate.
STORE|STORAGE|FOODSTORAGE|SAFESTORAGE|Store food safely according to its instructions.
MEASURE|CUP|MEASUREMENT|RECIPEMEASUREMENT|Measure ingredients using the amount and unit in a recipe.
SPILL|SPILLS|SLIPHAZARD|SPILLRESPONSE|Clean a spill safely and alert others to a slippery area.
TRASH|WASTE|DISPOSAL|WASTEMANAGEMENT|Place waste in the proper container and wash hands afterward.
`),
book('service','Customer Service','#ad5f9b','✧',`
HELLO|WELCOME|GREETING|CUSTOMERWELCOME|Greet customers in a friendly, respectful way.
LISTEN|LISTENING|ATTENTIVE|ACTIVELISTENING|Let the customer explain what they need.
ASK|INQUIRE|CLARIFY|CLARIFICATION|Ask a clear question when a request is uncertain.
ORDER|ORDERS|ORDERFORM|ORDERACCURACY|Check the requested item and quantity before completing an order.
HELP|HELPFUL|ASSISTANCE|CUSTOMERSUPPORT|Offer relevant help or find someone who can help.
KIND|POLITE|COURTESY|PROFESSIONALCOURTESY|Use considerate language with customers and coworkers.
WAIT|PATIENT|PATIENCE|WAITMANAGEMENT|Explain a delay calmly and provide a realistic next step.
THANK|THANKYOU|APPRECIATE|APPRECIATION|Thank the customer for their visit or feedback.
PRICE|PRICING|COST|PRICETRANSPARENCY|Give accurate information about an item's stated price.
PAY|PAYMENT|TRANSACTION|PAYMENTPROCESS|Follow the approved steps for taking payment.
CHANGE|COUNT|CASHCHANGE|CHANGEACCURACY|Check the correct change before returning it.
CHECK|VERIFY|ACCURACY|QUALITYASSURANCE|Review the order before handing it to the customer.
SORRY|APOLOGIZE|APOLOGY|SERVICERECOVERY|Acknowledge a mistake and offer an appropriate correction.
SOLVE|SOLUTION|RESOLVE|PROBLEMRESOLUTION|Work toward a practical solution within your role.
MANAGER|SUPERVISOR|ESCALATE|SUPERVISORREFERRAL|Ask a supervisor for help when a request exceeds your authority.
RETURN|REFUND|POLICY|RETURNPOLICY|Follow the store's stated rules for returns or refunds.
PRIVATE|PRIVACY|CONFIDENTIAL|CONFIDENTIALITY|Protect a customer's personal or payment information.
CLEAR|EXPLAIN|COMMUNICATE|CLEARCOMMUNICATION|Explain the next step in language the customer understands.
FEEDBACK|COMMENT|SUGGESTION|CUSTOMERFEEDBACK|Listen to useful information about the service experience.
FAIR|EQUAL|INCLUSIVE|ACCESSIBLESERVICE|Offer respectful service and appropriate access to each customer.
`),
book('tools','Tools of the Trade','#d49445','⌁',`
HAMMER|HAMMERS|CARPENTRY|CARPENTRYTOOLS|Use the correct tool to drive or remove a nail safely.
WRENCH|WRENCHES|MECHANICAL|MECHANICALTOOLS|Choose a properly sized tool to turn a nut or bolt.
SAW|CUTTING|SAWGUARD|MACHINESAFETY|Use cutting equipment only with approved training and guards.
DRILL|DRILLING|DRILLBIT|POWEREQUIPMENT|Follow tool training before drilling a hole.
TAPE|RULER|MEASURING|PRECISIONMEASURE|Measure and check a length before cutting.
LEVEL|LEVELING|ALIGNMENT|ACCURATEALIGNMENT|Check whether a surface is level or aligned.
BRUSH|PAINTING|PAINTBRUSH|SURFACEFINISH|Choose a suitable brush and follow product instructions.
BROOM|SWEEP|JANITORIAL|CUSTODIALEQUIPMENT|Remove dry debris with the appropriate cleaning tool.
MOP|MOPPING|FLOORCARE|SLIPPREVENTION|Clean a floor and mark a wet area to prevent slips.
GLOVES|GLOVE|HANDSAFETY|HANDPROTECTION|Use the glove type specified for the task.
GOGGLES|EYEWEAR|EYEPROTECTION|SAFETYEYEWEAR|Protect eyes when a task has flying particles or splashes.
HELMET|HARDHAT|HEADSAFETY|HEADPROTECTION|Wear the required head protection in the work area.
BOOTS|WORKBOOT|FOOTSAFETY|SAFETYFOOTWEAR|Choose footwear that meets the job's protective requirements.
LADDER|LADDERS|STABILITY|LADDERSAFETY|Use a ladder according to training on a stable surface.
SCANNER|SCAN|BARCODE|INVENTORYSCANNER|Scan the correct product to read its item information.
TABLET|COMPUTER|KEYBOARD|DIGITALEQUIPMENT|Use the workplace's digital tools for assigned tasks.
SCALE|WEIGH|WEIGHING|WEIGHTMEASUREMENT|Check an item's weight using an appropriate scale.
HEAT|THERMOMETER|TEMPCHECK|TEMPERATURETOOL|Use a thermometer to check a required temperature.
CART|TROLLEY|TRANSPORT|MATERIALHANDLING|Move items with suitable equipment and a safe load.
MANUAL|GUIDE|INSTRUCTIONS|OPERATINGMANUAL|Read approved operating instructions before using equipment.
`),
book('living','Independent Living','#4b9b79','⌂',`
HOME|HOUSING|RESIDENCE|HOUSINGOPTIONS|Compare a living arrangement with your needs and resources.
RENT|RENTAL|LEASE|RENTALAGREEMENT|Review the terms and costs of renting a home.
BILL|BILLS|UTILITIES|UTILITYPAYMENTS|Plan for household services and their due dates.
FOOD|GROCERY|MEALPLAN|MEALPLANNING|Plan food choices and a shopping list for your needs.
WASH|LAUNDRY|WASHCYCLE|FABRICCARE|Follow clothing labels when washing and drying clothes.
CLEAN|CHORES|HOUSEKEEPING|HOUSEHOLDROUTINE|Keep a manageable schedule for cleaning shared spaces.
BUS|TRANSIT|TRANSPORT|TRANSPORTPLANNING|Plan a safe way to reach work, school, or appointments.
MAP|ROUTE|NAVIGATE|ROUTEPLANNING|Check directions and travel time before leaving.
PHONE|CONTACT|EMERGENCY|EMERGENCYCONTACT|Know how to reach appropriate help in an emergency.
SAFE|SAFETY|FIREEXIT|EMERGENCYPLAN|Plan how to leave safely and get help during an emergency.
MONEY|BUDGET|EXPENSES|HOUSEHOLDBUDGET|Compare available income with household expenses.
TIME|CALENDAR|APPOINTMENT|APPOINTMENTPLAN|Keep track of dates, times, and preparation for appointments.
REST|SLEEP|WELLBEING|PERSONALWELLBEING|Build a routine that allows rest and personal care.
CARE|HYGIENE|PERSONALCARE|DAILYCARESKILLS|Use a personal care routine that meets your needs.
ASK|SUPPORT|ASSISTANCE|COMMUNITYSUPPORT|Find a trusted person or service when you need assistance.
NEIGHBOR|COMMUNITY|NEIGHBORS|COMMUNITYLIVING|Communicate respectfully with people who share your area.
FIX|REPAIR|MAINTENANCE|REPAIRREQUEST|Report a housing repair need through the proper process.
KEY|LOCK|SECURITY|HOMESECURITY|Protect access to your home and keep private information secure.
CHOICE|CHOOSE|DECISION|INDEPENDENTCHOICE|Make an informed decision using your needs and preferences.
PLAN|GOAL|LIFEGOAL|INDEPENDENTLIVING|Set a practical living goal and choose a next step.
`),
book('advocacy','Self-Advocacy','#7169c6','✺',`
VOICE|SPEAK|SPEAKUP|SELFADVOCACY|Explain your needs, strengths, and preferences.
NEED|NEEDS|SUPPORTNEED|IDENTIFYNEEDS|Identify the support that helps you participate.
WANT|PREFER|PREFERENCE|PERSONALPREFERENCE|Share a choice about how you would like to do something.
ASK|REQUEST|REQUESTHELP|SUPPORTREQUEST|Ask an appropriate person for the help you need.
HELP|SUPPORT|ASSISTANCE|SUPPORTSERVICES|Learn which people or services can assist you.
RIGHT|RIGHTS|ACCESS|ACCESSRIGHTS|Learn about your rights and how to ask questions about them.
NO|DECLINE|BOUNDARY|PERSONALBOUNDARY|Clearly express a personal limit or decline an unsafe request.
YES|AGREE|CONSENT|INFORMEDCONSENT|Understand a choice before freely agreeing to it.
CHOICE|CHOOSE|DECISION|DECISIONMAKING|Compare options and choose an informed next step.
PLAN|GOAL|ACTIONPLAN|GOALSETTING|Choose a goal and plan achievable actions.
MEET|MEETING|PARTICIPATE|MEETINGPARTICIPATION|Prepare to share your ideas in a planning meeting.
LISTEN|HEAR|PERSPECTIVE|RESPECTFULDISCUSSION|Listen to another view while keeping your own voice.
CLEAR|EXPLAIN|CLARIFY|CLEARCOMMUNICATION|State your question or need in a way others can understand.
CHANGE|ADAPT|ADJUSTMENT|ACCOMMODATION|Discuss a change that helps you access a task or setting.
SAFE|SAFETY|REPORT|SAFETYREPORTING|Tell a trusted person about a safety concern.
PRIVATE|PRIVACY|DISCLOSE|PERSONALPRIVACY|Choose carefully whom to tell private information.
STRONG|STRENGTH|ABILITY|STRENGTHAWARENESS|Recognize and explain something you do well.
LEARN|PRACTICE|CONFIDENCE|SELFDETERMINATION|Practice making choices and acting toward your own goals.
FAIR|FAIRNESS|INCLUSION|EQUALPARTICIPATION|Ask for a fair opportunity to take part.
TRUST|ALLY|ADVOCATE|SUPPORTNETWORK|Identify trusted people who respect your choices.
`),
book('future','Life After High School','#d26f9d','☀',`
GOAL|FUTURE|TRANSITION|TRANSITIONPLANNING|Plan steps toward life after high school.
SCHOOL|COLLEGE|POSTSECONDARY|POSTSECONDARYPLAN|Explore education or training after high school.
TRADE|TRADES|TRADETRAINING|VOCATIONALTRAINING|Explore preparation for a skilled occupation.
LEARN|TRAINING|CERTIFICATE|CERTIFICATION|Learn about proof of completing a training program.
WORK|CAREER|EMPLOYMENT|EMPLOYMENTGOAL|Choose a work goal that matches your interests and support needs.
TRY|INTERN|INTERNSHIP|WORKEXPERIENCE|Learn workplace skills through a supported work opportunity.
HELP|SUPPORT|SERVICES|ADULTSERVICES|Identify support programs and ask about eligibility.
HOME|HOUSING|LIVINGPLAN|INDEPENDENTLIVING|Explore where and how you want to live.
BUDGET|MONEY|FINANCES|FINANCIALPLANNING|Plan for income, expenses, and savings after school.
BUS|TRANSIT|TRANSPORT|TRANSPORTATION|Plan how to reach work, training, and community activities.
FRIEND|FRIENDS|COMMUNITY|COMMUNITYCONNECTION|Build connections with people and activities you value.
VOTE|CIVIC|CITIZENSHIP|CIVICPARTICIPATION|Learn how to participate in community decisions.
HEALTH|CARE|WELLNESS|HEALTHCAREPLAN|Plan how to access ongoing health care and support.
FORM|APPLY|APPLICATION|APPLICATIONDEADLINE|Track needed forms and submit them by the required date.
DATE|DATES|DEADLINE|TIMELINEPLANNING|Break a long-term plan into dated steps.
SKILL|STRENGTH|QUALIFICATION|TRANSFERABLESKILLS|Connect your current abilities with future opportunities.
ASK|VISIT|RESEARCH|INFORMATIONGATHERING|Ask questions and compare information before choosing a program.
PLAN|PATHWAY|ALTERNATIVE|ALTERNATIVEPATHWAY|Identify another route if your first plan changes.
VOICE|CHOICE|ADVOCACY|SELFDETERMINATION|Keep your own goals and choices central in transition planning.
NEXT|ACTION|NEXTSTEP|ACTIONPLANNING|Choose one achievable action to move toward your goal.
`)
];
export const DIFFICULTIES = ['Beginner','Medium','Hard','Expert'];
export const DIRECTIONS = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
export function vocabulary(bookId,level=1){
 const b=BOOKS.find(x=>x.id===bookId);if(!b)throw Error('Unknown book');
 return b.rows.map(r=>({id:r.id,word:r.words[level-1],meaning:r.meaning}));
}
export function questions(bookId,level=1){
 const rows=vocabulary(bookId,level);
 return rows.map((r,i)=>({id:i,word:r.word,prompt:`Which action connects with ${r.word.toLowerCase()}?`,options:[r.meaning,rows[(i+7)%20].meaning,rows[(i+13)%20].meaning],answer:r.meaning,feedback:r.meaning}));
}
