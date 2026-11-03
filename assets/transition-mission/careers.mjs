// Fictional, introductory job exploration. Tasks never certify occupational competence.
const pick=(id,prompt,options,answer,why)=>({id,type:'choice',prompt,options,answer,why});
const count=(id,prompt,icon,amount,why)=>({id,type:'count',prompt,icon,amount,why});
const order=(id,prompt,items,why)=>({id,type:'order',prompt,items,why});
const match=(id,prompt,pairs,why)=>({id,type:'match',prompt,pairs,why});
const build=(id,prompt,ingredients,why)=>({id,type:'build',prompt,ingredients,why});
const job=(id,title,icon,group,color,brief,strengths,tasks,source)=>({id,title,icon,group,color,brief,strengths,tasks,source:'https://www.bls.gov/ooh/'+source});
export const CAREERS=[
 job('cashier','Cashier','basket','Market Street','#ec9c48','Cashiers scan purchases, handle payments, and help customers.',['Being accurate','Greeting customers','Staying organized'],[
  {id:'scan',type:'scan',prompt:'Scan both items on the conveyor.',items:[{id:'apple',name:'Apple',icon:'apple',cents:125},{id:'milk',name:'Milk',icon:'milk',cents:75}],why:'Scan every item once. The apple is $1.25 and the milk is $0.75.'},
  {id:'change',type:'cash',prompt:'The groceries cost $2.00. The customer gives you $3.00. Count out the change.',total:200,paid:300,why:'Count up from $2.00 to $3.00. Give back $1.00. You can use different combinations of bills and coins.'},
  pick('customer','A price does not match the shelf label. What should you do?',['Guess a price','Ask your supervisor to check','Argue with the customer'],1,'Stay polite and ask a supervisor to check the price.')
 ],'sales/cashiers.htm'),
 job('pizza-maker','Pizza Maker','pizza','Market Street','#e47759','Pizza workers read orders, prepare ingredients, and keep their work area clean.',['Following a recipe','Checking orders','Keeping things clean'],[
  pick('clean','Before preparing a customer’s pizza, what comes first?',['Wash your hands','Touch every topping','Skip to packing'],0,'Wash your hands before preparing food.'),
  build('order','Read the order. Add exactly the toppings requested.',[{id:'cheese',name:'Cheese scoops',icon:'cheese',amount:2},{id:'pepper',name:'Pepper pieces',icon:'pepper',amount:3}],'Match the order: 2 cheese scoops and 3 pepper pieces. This is pretend food preparation.'),
  order('pack','Put these order steps in a sensible order.',['Check the finished pizza against the ticket','Close the correct box','Give the order to the customer'],'Check the order before boxing and handing it over.')
 ],'food-preparation-and-serving/cooks.htm'),
 job('pet-care','Pet Care Assistant','paw','Market Street','#a58bc4','Animal-care workers follow care instructions, provide supplies, and notice when an animal needs help.',['Being gentle','Following a care card','Noticing changes'],[
  match('care','Match each pet to the supplies on its care card.',[['Dog: water bowl','Fresh water'],['Cat: meal card','Measured cat food'],['Rabbit: clean pen','Clean bedding']],'Follow each animal’s own care instructions.'),
  count('portions','The care card says 3 scoops. Put 3 scoops in the pretend bowl.','bowl',3,'Count each scoop once and stop at 3.'),
  pick('unwell','A pet seems unwell. What should you do?',['Give it your medicine','Tell the responsible adult or supervisor','Ignore the change'],1,'Report the change to the responsible adult or supervisor; do not give medication yourself.')
 ],'personal-care-and-service/animal-care-and-service-workers.htm'),
 job('daycare','Childcare Assistant','blocks','Market Street','#df8fb0','Childcare workers support safe play, routines, and communication with children and families.',['Being patient','Following routines','Helping others'],[
  match('bins','Put the play materials in the labeled bins.',[['Large blocks','Building bin'],['Board books','Reading bin'],['Crayons','Art bin']],'Keep materials organized so staff and children can find them.'),
  count('places','Four children need one place mat each. Set out the place mats.','mat',4,'Use one place mat for each of the 4 children.'),
  pick('supervision','A child needs help while your group is playing. What do you do?',['Leave the group alone','Ask the supervising staff member for help','Send a child away alone'],1,'Ask the supervising staff member for help while maintaining supervision.')
 ],'personal-care-and-service/childcare-workers.htm'),
 job('tire-shop','Tire Shop Assistant','tire','Market Street','#6a8e9d','Tire-shop assistants read work orders, organize supplies, and follow the shop’s safety procedures.',['Reading labels','Working carefully','Asking for help'],[
  match('tickets','Match each practice work order to the correct labeled station.',[['Order A: tire inspection','Inspection station'],['Order B: customer pickup','Front desk'],['Order C: parts delivery','Parts shelf']],'Read the whole work order before moving to a station.'),
  count('tires','This display needs 4 tires. Count 4 tires into the display.','tire',4,'Stop when the display has exactly 4 tires.'),
  pick('equipment','You have not been trained to use a machine. What should you do?',['Try it alone','Ask for training and permission','Let a customer use it'],1,'Ask a qualified supervisor for training and permission before using shop equipment.')
 ],'installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm'),
 job('bank-teller','Bank Teller','bank','Community Square','#d9ac4b','Tellers help customers with routine bank transactions and check amounts carefully.',['Counting accurately','Protecting privacy','Being courteous'],[
  {id:'deposit',type:'amount',prompt:'Count this pretend deposit. How many dollars are here?',cash:[500,500,100,100,100],answer:1300,why:'Two $5 bills make $10. Three $1 bills make $3. Together they make $13.00.'},
  {id:'change',type:'cash',prompt:'A practice transaction needs exactly $2.50. Count it out.',total:0,paid:250,why:'Make $2.50. For example, two $1 bills and two quarters.'},
  pick('privacy','A friend asks to see another customer’s balance. What should you do?',['Show the screen','Keep the information private','Announce it aloud'],1,'Customer account information is private. Follow the bank’s procedures.')
 ],'office-and-administrative-support/tellers.htm'),
 job('nurse','Nurse','medical','Community Square','#58a5ae','Nurses care for people and work with a healthcare team. This station explores organization and communication.',['Listening carefully','Being organized','Reporting concerns'],[
  match('supplies','Match each supply request to its labeled storage bin.',[['Gloves request','Gloves bin'],['Blanket request','Linen shelf'],['Paper forms request','Forms drawer']],'Read the label and get the requested supply. This activity does not practice medical treatment.'),
  count('kits','Prepare 5 labeled welcome folders for the team.','folder',5,'Count 5 folders; do not include private patient information.'),
  pick('concern','Someone says they suddenly feel unwell. What should you do?',['Give medicine without permission','Notify the responsible nurse or supervisor promptly','Tell them to ignore it'],1,'Promptly notify the responsible nurse or supervisor and follow the workplace’s emergency procedures.')
 ],'healthcare/registered-nurses.htm'),
 job('teacher','Teacher','book','Community Square','#ca8e4f','Teachers plan learning, organize materials, and support students.',['Explaining clearly','Being patient','Planning ahead'],[
  order('schedule','Put the practice morning schedule in time order.',['8:00 · Welcome','8:30 · Reading','9:00 · Math'],'Read the times from earliest to latest.'),
  build('kits','Make the classroom supply order.',[{id:'pencils',name:'Pencils',icon:'pencil',amount:4},{id:'books',name:'Books',icon:'book',amount:2}],'The order needs 4 pencils and 2 books.'),
  pick('help','A student says they do not understand. What is a helpful response?',['Tell them to stop asking','Explain another way and offer support','Ignore the question'],1,'Listen, explain another way, and offer support.')
 ],'education-training-and-library/high-school-teachers.htm'),
 job('grocery-stocker','Grocery Stocker','crate','Community Square','#6ba57d','Stockers organize merchandise and check product labels.',['Sorting items','Reading labels','Keeping aisles clear'],[
  match('shelves','Match the products to their labeled shelves.',[['Canned beans','Canned goods'],['Dry pasta','Pasta shelf'],['Paper towels','Paper products']],'Use the product and shelf labels to stock the correct place.'),
  order('dates','Put the pretend date labels in earliest-to-latest order.',['May 2','May 6','May 12'],'Compare the dates in the same month: 2, 6, then 12.'),
  pick('aisle','A delivery box blocks the aisle. What should you do?',['Leave it there','Follow the store’s safe procedure to keep the aisle clear','Tell customers to climb over it'],1,'Keep walkways clear and follow your store’s safe lifting and moving procedures.')
 ],'transportation-and-material-moving/hand-laborers-and-material-movers.htm'),
 job('barista','Café Barista','cup','Community Square','#b88764','Baristas read drink tickets, prepare orders, and serve customers.',['Checking details','Remembering orders','Being welcoming'],[
  match('cups','Match each order label to its cup size.',[['Order A: small','Small cup'],['Order B: medium','Medium cup'],['Order C: large','Large cup']],'Read the size on every order instead of guessing.'),
  build('tray','Pack the pretend pickup tray.',[{id:'cups',name:'Cups',icon:'cup',amount:2},{id:'napkins',name:'Napkins',icon:'mat',amount:3}],'The pickup ticket requests 2 cups and 3 napkins.'),
  pick('wrong','The drink label has the wrong name. What should you do?',['Check the order before handing it over','Give it to anyone','Peel the label off and guess'],0,'Check the ticket and follow the café’s correction procedure.')
 ],'food-preparation-and-serving/food-and-beverage-serving-and-related-workers.htm'),
 job('restaurant-server','Restaurant Server','plate','Service Avenue','#d79472','Servers take orders, bring food, and help customers during a meal.',['Listening','Being courteous','Checking details'],[
  match('tables','Match the food tickets to the correct table.',[['Ticket A: table 2','Table 2'],['Ticket B: table 4','Table 4'],['Ticket C: table 6','Table 6']],'Check the table number on each ticket.'),
  count('settings','A table has 6 guests. Set out one napkin per guest.','mat',6,'Six guests need 6 napkins.'),
  pick('allergy','A customer mentions a food allergy. What should you do?',['Promise it is safe without checking','Follow the restaurant’s allergy procedure and tell the responsible staff','Ignore the request'],1,'Use the restaurant’s allergy procedure and communicate with the responsible staff. Do not guess.')
 ],'food-preparation-and-serving/waiters-and-waitresses.htm'),
 job('bakery-assistant','Bakery Assistant','bread','Service Avenue','#d6a562','Bakery assistants measure supplies, label orders, and keep their work areas clean.',['Measuring carefully','Following a ticket','Being organized'],[
  build('box','Pack this pretend bakery order.',[{id:'rolls',name:'Bread rolls',icon:'bread',amount:4},{id:'muffins',name:'Muffins',icon:'cake',amount:2}],'The ticket asks for 4 bread rolls and 2 muffins.'),
  order('labels','Put these pickup tickets in time order.',['10:00 · Order A','10:30 · Order B','11:00 · Order C'],'Read the pickup times from earliest to latest.'),
  pick('hands','You touched your phone while packing food. What comes next?',['Continue touching the food','Wash your hands before returning to food work','Wipe your hands on your clothes'],1,'Wash your hands before returning to food preparation or packing.')
 ],'production/bakers.htm'),
 job('custodian','Custodian','clean','Service Avenue','#77a8a0','Custodians help keep buildings clean, supplied, and safe to use.',['Noticing hazards','Following directions','Working carefully'],[
  order('spill','Put the spill-response steps in order.',['Warn others and keep people away','Notify the responsible staff and follow the cleanup procedure','Remove the warning only when the area is safe'],'Protect people first. Follow the approved cleanup procedure.'),
  match('tools','Match each supply to its labeled storage place.',[['Paper towels','Paper shelf'],['Mop','Mop rack'],['Trash bags','Bag bin']],'Put supplies back in their labeled places.'),
  pick('chemical','You find an unlabeled cleaning bottle. What should you do?',['Mix it with another cleaner','Leave it alone and tell your supervisor','Smell it to identify it'],1,'Do not use or mix unknown chemicals. Tell your supervisor.')
 ],'building-and-grounds-cleaning/janitors-and-building-cleaners.htm'),
 job('office-assistant','Office Assistant','folder','Service Avenue','#8e9ec3','Office assistants organize records, prepare supplies, and communicate with others.',['Filing','Writing clearly','Answering politely'],[
  order('files','File these fictional folders alphabetically.',['Adams','Baker','Carter'],'Compare the first letters: A, B, C.'),
  match('desk','Sort these requests into the correct tray.',[['Outgoing letter','Mail tray'],['Copy request','Copy tray'],['Appointment note','Calendar tray']],'Read the request and use the matching tray.'),
  pick('phone','Which phone greeting is professional?',['What do you want?','Good morning, Town Office. How may I help you?','Wrong number!'],1,'Use a clear, courteous greeting and offer help.')
 ],'office-and-administrative-support/general-office-clerks.htm'),
 job('mail-carrier','Mail Carrier','mail','Service Avenue','#729cbf','Mail carriers organize mail and deliver it to the correct addresses.',['Reading addresses','Following a route','Being dependable'],[
  match('addresses','Match each letter to its address.',[['Letter: 12 Oak Lane','12 Oak Lane'],['Letter: 24 Pine Road','24 Pine Road'],['Letter: 36 Maple Way','36 Maple Way']],'Compare the house number and the full street name.'),
  order('route','Sort the house numbers from smallest to largest.',['14','18','22'],'Read every digit: 14, 18, 22.'),
  pick('unknown','An address label is unreadable. What should you do?',['Guess which house','Follow the mail service’s procedure and ask for guidance','Throw the mail away'],1,'Follow the service’s procedure for unreadable mail and ask for guidance.')
 ],'office-and-administrative-support/postal-service-workers.htm'),
 job('warehouse-associate','Warehouse Associate','crate','Makers’ District','#bc965d','Warehouse workers read labels, prepare orders, and organize goods.',['Checking codes','Counting','Working safely'],[
  match('codes','Match each pick ticket to its shelf label.',[['Ticket: B12','Shelf B12'],['Ticket: C24','Shelf C24'],['Ticket: D36','Shelf D36']],'Match both the letters and the numbers.'),
  build('pack','Fill this pretend shipping order.',[{id:'small',name:'Small boxes',icon:'crate',amount:3},{id:'large',name:'Large boxes',icon:'crate',amount:2}],'The order needs 3 small boxes and 2 large boxes.'),
  pick('lift','A box is too heavy for you to lift safely. What should you do?',['Lift it anyway','Ask for help and follow the approved moving procedure','Kick it down the aisle'],1,'Ask for help and use the workplace’s approved moving procedure.')
 ],'transportation-and-material-moving/hand-laborers-and-material-movers.htm'),
 job('delivery-driver','Delivery Driver','van','Makers’ District','#c47f62','Delivery drivers check packages, plan stops, and deliver items to customers.',['Planning a route','Checking packages','Being punctual'],[
  match('packages','Match each package label to the delivery stop.',[['Package A: Oak Stop','Oak Stop'],['Package B: Pine Stop','Pine Stop'],['Package C: Lake Stop','Lake Stop']],'Read the destination before loading a delivery.'),
  order('stops','Follow the numbered delivery route.',['Stop 1 · Oak','Stop 2 · Pine','Stop 3 · Lake'],'Use the route numbers to keep the deliveries organized.'),
  pick('phone','You need to read a new delivery message. What should you do?',['Read it while driving','Wait until safely parked','Ask a passing driver'],1,'Read the message only when safely parked.')
 ],'transportation-and-material-moving/delivery-truck-drivers-and-driver-sales-workers.htm'),
 job('construction-helper','Construction Helper','helmet','Makers’ District','#cfaa49','Construction helpers organize materials and work under direction at a job site.',['Following instructions','Organizing supplies','Speaking up about hazards'],[
  match('gear','Match the requested protective equipment to its label.',[['Head protection request','Hard hat'],['Eye protection request','Safety glasses'],['Hand protection request','Work gloves']],'Use the protective equipment specified for the task by your supervisor.'),
  count('markers','Set out 5 pretend site markers for the demonstration.','cone',5,'Count out 5 site markers.'),
  pick('work','You do not understand the next task. What should you do?',['Ask the supervisor to explain or demonstrate','Guess and begin','Use any tool you find'],0,'Ask for clear instructions before beginning unfamiliar work.')
 ],'construction-and-extraction/construction-laborers-and-helpers.htm'),
 job('electrician-helper','Electrician Helper','bolt','Makers’ District','#d6ac45','Electrician helpers organize labeled materials and assist qualified workers.',['Checking labels','Following safety directions','Being careful'],[
  match('parts','Sort the unopened supplies by their labels.',[['Cable clips package','Clips bin'],['Outlet covers package','Covers bin'],['Labels package','Labels drawer']],'This is supply organization, not electrical repair.'),
  count('packs','The supply ticket requests 4 sealed packs. Count them out.','crate',4,'Read the ticket and count 4 sealed packs.'),
  pick('cord','You notice a damaged electrical cord. What should you do?',['Touch the exposed wire','Keep away and tell a qualified supervisor','Cover it with paper'],1,'Keep away and report the damaged cord to a qualified supervisor.')
 ],'construction-and-extraction/electricians.htm'),
 job('plumber-helper','Plumber Helper','drop','Makers’ District','#62a8b6','Plumber helpers read work requests and organize supplies for trained workers.',['Matching parts','Reading requests','Reporting problems'],[
  match('orders','Match each work request to its labeled folder.',[['Request: faucet leak','Faucet folder'],['Request: blocked drain','Drain folder'],['Request: delivery of supplies','Supplies folder']],'Match the request to the correct folder; do not attempt an unfamiliar repair.'),
  build('kits','Pack the pretend supply order.',[{id:'washers',name:'Sealed washer packs',icon:'ring',amount:3},{id:'labels',name:'Labels',icon:'folder',amount:2}],'The order needs 3 sealed packs and 2 labels.'),
  pick('leak','You notice water spreading across a walkway. What should you do?',['Ignore it','Warn others and notify the supervisor','Run through it'],1,'Warn others about the slippery area and notify the supervisor.')
 ],'construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm'),
 job('hvac-helper','HVAC Helper','fan','Discovery Heights','#71a8b2','HVAC teams work on heating, ventilation, and cooling systems. Helpers organize supplies and records.',['Matching sizes','Reading labels','Following directions'],[
  match('sizes','Match sealed filter boxes to the same size labels.',[['Box: 16 × 20','Shelf: 16 × 20'],['Box: 20 × 20','Shelf: 20 × 20'],['Box: 20 × 25','Shelf: 20 × 25']],'Compare both numbers on each label. This task only sorts unopened supplies.'),
  order('visits','Sort the service appointments by time.',['9:00 · Town Office','10:00 · Library','11:00 · Café'],'Put the earliest appointment first.'),
  pick('machine','You have not been trained on a system. What should you do?',['Open it and experiment','Ask the qualified supervisor for instructions','Ask a customer to fix it'],1,'Ask a qualified supervisor. Do not work on unfamiliar equipment.')
 ],'installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm'),
 job('graphic-designer','Graphic Designer','art','Discovery Heights','#b98ac2','Graphic designers use visual ideas to communicate a message for a client.',['Being creative','Checking details','Listening to feedback'],[
  match('brief','Match each client request to the correct design element.',[['Request: blue background','Blue sample'],['Request: large title','Large title sample'],['Request: round badge','Circle sample']],'Follow the client’s written brief.'),
  pick('proof','The client’s name is Town Café. Which title matches the brief?',['Town Café','Town Garage','Town Clinic'],0,'Compare the title to the client’s requested name.'),
  order('workflow','Put the design workflow in order.',['Read the client brief','Create a draft','Check the draft and request feedback'],'Understand the request before making and reviewing a draft.')
 ],'arts-and-design/graphic-designers.htm'),
 job('it-support','IT Support Assistant','computer','Discovery Heights','#729cbe','IT support staff listen to computer users, investigate problems, and document help requests.',['Problem solving','Listening','Writing clear notes'],[
  match('tickets','Match each support ticket to its category.',[['Cannot print','Printer'],['Mouse not responding','Mouse'],['Cannot hear sound','Audio']],'Read the user’s description before choosing a category.'),
  order('help','Put the first support steps in order.',['Ask what the user was trying to do','Record the problem clearly','Follow the approved troubleshooting procedure'],'Gather information and follow the organization’s procedure.'),
  pick('password','A user offers to tell you their password. What should you do?',['Write it down','Use the approved support process without collecting their password','Post it in the ticket'],1,'Use the approved support process. Do not collect or share the user’s password.')
 ],'computer-and-information-technology/computer-support-specialists.htm'),
 job('library-assistant','Library Assistant','book','Discovery Heights','#a293bd','Library assistants help organize materials and assist library users.',['Sorting','Helping people','Reading labels'],[
  order('titles','Arrange these pretend book titles alphabetically.',['Animals','Gardens','Space'],'Use A, G, S to order these titles.'),
  match('returns','Put the returned materials in the labeled carts.',[['Storybook','Fiction cart'],['Science facts book','Nonfiction cart'],['Picture book','Picture-book cart']],'Use the library’s labels for each type of material.'),
  pick('find','A visitor cannot find a book. What should you do?',['Offer to check the catalogue or ask library staff','Tell them to leave','Guess a random shelf'],0,'Help check the catalogue or ask the responsible library staff member.')
 ],'education-training-and-library/library-technicians-and-assistants.htm'),
 job('salon-assistant','Salon Assistant','comb','Discovery Heights','#d996ba','Salon assistants organize appointments, prepare approved supplies, and welcome clients.',['Being welcoming','Staying organized','Following hygiene routines'],[
  order('appointments','Put the practice appointment cards in time order.',['1:00 · Haircut','1:30 · Style','2:00 · Consultation'],'Use the appointment times to organize the schedule.'),
  match('stations','Match the labeled supplies to their stations.',[['Clean towels','Towel shelf'],['Appointment cards','Front desk'],['Unused combs','Clean supplies tray']],'Keep clean supplies in their designated places.'),
  pick('used','A tool has just been used. What should you do?',['Put it with clean tools','Follow the salon’s cleaning procedure and ask the supervisor if unsure','Hand it to the next client'],1,'Keep used and clean tools separate and follow the salon’s cleaning procedure.')
 ],'personal-care-and-service/barbers-hairstylists-and-cosmetologists.htm'),
 job('florist','Florist Assistant','flower','Future Valley','#cb8aab','Floral workers read orders, arrange flowers, and prepare them for customers.',['Creativity','Counting','Checking a request'],[
  build('bouquet','Build the bouquet on this practice order.',[{id:'yellow',name:'Yellow flowers',icon:'flower',amount:3},{id:'pink',name:'Pink flowers',icon:'flower',amount:2}],'The bouquet order requests 3 yellow flowers and 2 pink flowers.'),
  match('cards','Match each gift card to its order number.',[['Card: order 10','Bouquet 10'],['Card: order 20','Bouquet 20'],['Card: order 30','Bouquet 30']],'Read the order number before attaching the card.'),
  pick('missing','The order requests a flower that is unavailable. What should you do?',['Substitute without asking','Check with the supervisor before changing the order','Cancel every order'],1,'Ask the supervisor how to handle the unavailable flower.')
 ],'arts-and-design/floral-designers.htm'),
 job('hotel-assistant','Hotel Assistant','bed','Future Valley','#8a9fc4','Hotel teams organize guest requests, prepare supplies, and respect guest privacy.',['Being courteous','Protecting privacy','Checking a list'],[
  match('requests','Match each guest request to the correct department.',[['Fresh towels','Housekeeping'],['Check-in question','Front desk'],['Broken room lamp','Maintenance']],'Send each request to the department responsible for it.'),
  build('linen','Fill the pretend linen order.',[{id:'towels',name:'Towels',icon:'mat',amount:4},{id:'pillowcases',name:'Pillowcases',icon:'mat',amount:2}],'The order needs 4 towels and 2 pillowcases.'),
  pick('guest','Someone asks for another guest’s room number. What should you do?',['Announce the number','Follow the hotel’s privacy procedure','Write it on a public sign'],1,'Protect guest privacy and follow the hotel’s procedure.')
 ],'building-and-grounds-cleaning/home.htm'),
 job('landscape-assistant','Landscape Assistant','leaf','Future Valley','#75a467','Landscaping teams care for outdoor spaces and organize materials for assigned work.',['Working outdoors','Following directions','Noticing hazards'],[
  match('areas','Match the work cards to the labeled garden areas.',[['Watering card','Flower bed'],['Litter pickup card','Pathway'],['Supply delivery card','Tool shed']],'Use the assigned work card to find the correct area.'),
  count('plants','The display plan needs 6 small plants. Set out 6.','leaf',6,'Count 6 plants and compare your count to the display plan.'),
  pick('tool','A powered tool is running nearby. What should you do?',['Walk into its work area','Stay clear and follow the supervisor’s directions','Try to grab it'],1,'Stay clear of the work area and follow the supervisor’s safety directions.')
 ],'building-and-grounds-cleaning/grounds-maintenance-workers.htm'),
 job('recreation-leader','Recreation Assistant','ball','Future Valley','#da9b58','Recreation workers help organize activities, prepare supplies, and welcome participants.',['Encouraging people','Counting equipment','Explaining activities'],[
  order('events','Put the activity schedule in time order.',['3:00 · Welcome','3:15 · Team activity','3:45 · Cleanup'],'Use the times to organize the activity session.'),
  build('equipment','Pack the pretend activity kit.',[{id:'balls',name:'Balls',icon:'ball',amount:3},{id:'cones',name:'Cones',icon:'cone',amount:4}],'The activity kit needs 3 balls and 4 cones.'),
  pick('included','A participant says the activity is too difficult. What should you do?',['Offer an appropriate supported option with the leader','Tell them they cannot join','Make fun of them'],0,'Help the leader offer an appropriate way to participate.')
 ],'personal-care-and-service/recreation-workers.htm'),
 job('business-owner','Small Business Owner','shop','Future Valley','#c8a34d','Business owners plan services, track costs, and communicate with customers.',['Planning','Keeping records','Solving problems'],[
  match('budget','Sort the pretend business records.',[['Money paid for supplies','Expense'],['Money received from a customer','Sales'],['List of orders to prepare','Order record']],'Keep sales, expenses, and orders organized.'),
  {id:'earnings',type:'amount',prompt:'Your pretend shop makes $8.00 in sales and spends $3.00 on supplies. How much is left?',cash:[],answer:500,why:'Subtract the $3.00 expense from $8.00 in sales. There is $5.00 left in this simplified example.'},
  pick('review','A customer says the order is wrong. What should you do?',['Listen and check the order record','Ignore the customer','Delete every record'],0,'Listen, compare the order to your records, and work on a fair correction.')
 ],'management/top-executives.htm')
];
export const REGIONS=[{title:'Market Street',color:'#65a486'},{title:'Community Square',color:'#6c9db9'},{title:'Service Avenue',color:'#b78b93'},{title:'Makers’ District',color:'#b39667'},{title:'Discovery Heights',color:'#9690bd'},{title:'Future Valley',color:'#6d9f85'}];
export const DENOMINATIONS=[{cents:500,name:'$5 bill'},{cents:100,name:'$1 bill'},{cents:25,name:'Quarter · 25¢'},{cents:10,name:'Dime · 10¢'},{cents:5,name:'Nickel · 5¢'},{cents:1,name:'Penny · 1¢'}];
export const CHARACTER_BACKGROUNDS=[{id:'white',label:'White',skin:'#efc3a1',hair:'#70482c'},{id:'black',label:'Black',skin:'#955b3d',hair:'#231b1b'},{id:'hispanic',label:'Hispanic',skin:'#c78d61',hair:'#302322'},{id:'asian',label:'Asian',skin:'#dfb58b',hair:'#211e25'}];
export const PORTALS=[{x:1650,title:'Your mission'},{x:5850,title:'Quick application'},{x:10050,title:'Job offer & clock in'},{x:14250,title:'Try the job'}];
export const WORLD_END=17200;
const scenarios=[
 ['Self-Advocacy','You do not understand the cashier directions. What could you say?',['I understand, even though I do not','Could you show me one example, please?','I will leave without telling anyone'],1,'Ask for a demonstration when you need one.'],
 ['Job Exploration','You want to learn what pizza workers do. What would help?',['Observe the work and ask about the tasks','Guess from the uniform alone','Assume every food job is the same'],0,'Observe the tasks and ask questions about the job.'],
 ['Character & Choices','You accidentally spill the pet’s water. What should you do?',['Blame someone else','Tell the supervisor and help follow the cleanup routine','Hide the bowl'],1,'Be honest about mistakes and help make the area safe.'],
 ['Workplace Readiness','Your shift starts soon. What is a useful plan?',['Arrive ready for your assigned start time','Wait until the shift ends','Let a friend do your clock-in'],0,'Plan to arrive ready and complete your own clock-in.'],
 ['Self-Advocacy','The work area is too noisy for you to follow directions. What could you do?',['Ask the supervisor to repeat the directions in a quieter spot','Pretend you heard','Yell at everyone'],0,'Explain what is making the task difficult and ask for a helpful way to receive directions.'],
 ['Character & Choices','Your count does not match the bank practice ticket. What should you do?',['Change the ticket to hide the problem','Recount and tell your supervisor if it still does not match','Keep extra money'],1,'Check your work and be honest about a mismatch.'],
 ['Job Exploration','You are curious about nursing. Which question helps you explore the career?',['What preparation and daily tasks does this role involve?','Can I skip all training?','Does every healthcare worker do the same thing?'],0,'Ask about preparation, responsibilities, and the work environment.'],
 ['Self-Advocacy','You can do the task better with a written checklist. What could you say?',['Never mind, I cannot work','Could I use a written checklist for these steps?','I will make someone else do it'],1,'Name a specific support that helps you complete the work.'],
 ['Workplace Readiness','You finish stocking your assigned shelf. What comes next?',['Ask your supervisor what to do next','Hide until the shift ends','Move products at random'],0,'Check in with your supervisor when your assigned work is finished.'],
 ['Character & Choices','A coworker makes a small mistake on an order. What is a respectful response?',['Laugh at them','Point out the issue kindly and help follow the correction process','Tell every customer'],1,'Be respectful and focus on correcting the order.'],
 ['Self-Advocacy','You are unsure which table an order belongs to. What should you do?',['Guess quickly','Ask someone authorized to clarify the ticket','Give it to the first table you see'],1,'Ask for clarification before making a preventable mistake.'],
 ['Job Exploration','You enjoy measuring and following recipes. What should you explore about bakery work?',['Whether its tasks and work setting fit your interests','Only the color of the uniform','Whether you can avoid every responsibility'],0,'Compare the tasks and work setting with your interests and support needs.'],
 ['Workplace Readiness','You notice a safety sign you do not understand. What should you do?',['Ignore it','Stop and ask your supervisor to explain it','Take it down'],1,'Ask what an unfamiliar safety sign means before continuing.'],
 ['Character & Choices','You notice you filed a folder in the wrong place. What should you do?',['Move it to the correct place and tell the supervisor if needed','Pretend another person did it','Hide it in a drawer'],0,'Take responsibility and correct the mistake.'],
 ['Self-Advocacy','You need more time to read an address accurately. What could you say?',['I need a moment to check the full address','I do not care where this goes','Someone else has to do all my work'],0,'Communicate your need for enough time to work accurately.'],
 ['Workplace Readiness','A supervisor gives you three instructions and you forget the last one. What should you do?',['Make up a last step','Repeat what you heard and ask for the last step again','Do nothing and say nothing'],1,'Check your understanding and ask for the information you missed.'],
 ['Character & Choices','You may be late because your ride is delayed. What should you do?',['Tell the workplace using its contact procedure as soon as you can','Let them guess where you are','Clock in before you arrive'],0,'Communicate the delay promptly through the workplace’s procedure.'],
 ['Self-Advocacy','You are asked to lift something you cannot move safely. What could you say?',['I need help moving this safely','I will lift it even if I get hurt','Safety does not matter'],0,'Speak up about a task you cannot complete safely and ask for help.'],
 ['Job Exploration','What helps you decide whether a skilled-trades career interests you?',['Learning about its training, daily tasks, and work setting','Assuming there is no training','Choosing only because a friend chose it'],0,'Explore the training and work before deciding how it fits you.'],
 ['Workplace Readiness','You receive a work order with an unfamiliar word. What should you do?',['Ask what the word means before beginning','Guess and use any part','Throw the order away'],0,'Clarify unfamiliar words so you can follow the work order.'],
 ['Self-Advocacy','You learn best when you can see the steps. What could you request?',['A demonstration or picture checklist','No instructions at all','For everyone else to stop working'],0,'Ask for a demonstration or picture checklist that supports your learning.'],
 ['Character & Choices','A client suggests a change to your design. How can you respond professionally?',['Listen and ask questions about the requested change','Insult the client','Delete their project without asking'],0,'Listen respectfully and clarify what the client wants changed.'],
 ['Job Exploration','You like solving computer problems. What is a useful next step?',['Learn about support roles and try a supervised practice task','Assume every technology job is identical','Use another person’s account without permission'],0,'Explore different roles and try an appropriate supervised task.'],
 ['Character & Choices','A visitor asks a question you cannot answer. What should you do?',['Make up an answer','Say you will check and ask the right staff member','Make fun of the question'],1,'It is professional to check when you do not know the answer.'],
 ['Workplace Readiness','You have two appointment requests at the same time. What should you do?',['Check the schedule with the supervisor before confirming','Promise both without checking','Delete both names'],0,'Check availability and resolve the conflict before confirming appointments.'],
 ['Self-Advocacy','The written flower order is hard for you to read. What could help?',['Ask for the order in a clearer format or have it read with you','Guess every item','Pretend the order is complete'],0,'Ask for a clearer format or reading support.'],
 ['Character & Choices','You find a guest’s forgotten item. What should you do?',['Keep it','Use the hotel’s lost-property procedure','Post private details online'],1,'Follow the lost-property procedure and respect the guest’s privacy.'],
 ['Workplace Readiness','The weather changes while your team works outdoors. What should you do?',['Check the supervisor’s instructions for changing conditions','Ignore all directions','Leave without telling anyone'],0,'Follow the supervisor’s instructions when conditions change.'],
 ['Self-Advocacy','You want to join an activity but need a different way to participate. What could you do?',['Ask the leader about an appropriate adapted option','Assume you are not welcome','Push someone out of the activity'],0,'Explain what you need and ask about an appropriate way to participate.'],
 ['Job Exploration','You have explored 30 careers. What is a useful next step?',['Choose a few interests to discuss and explore further with Miss Kayla','Assume this game qualifies you for every job','Pick a career without learning anything else'],0,'Use what you noticed to plan more exploration with Miss Kayla.']
];
CAREERS.forEach((career,index)=>{const [domain,prompt,options,answer,why]=scenarios[index];career.scenario={id:'career-scenario',type:'choice',domain,prompt,options,answer,why};career.tasks.forEach(t=>{t.domain??=t.type==='choice'?'Workplace Readiness':'Job Exploration';});});
