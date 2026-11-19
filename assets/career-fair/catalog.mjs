// CareerOneStop video links are matched to the profiles and English caption tracks at My Next Move.
// Questions and workplace scenarios are original Transition Town material.
export const CATALOG = [
  {
    id: "healthcare",
    title: "Healthcare",
    icon: "🩺",
    color: "#e688ff",
    art: true,
    scenario: {"prompt": "Two patients have similar names. You are unsure which patient the chart on your clipboard belongs to.", "options": ["Assume it belongs to the nearest patient.", "Pause and ask your supervisor to help verify the patient and chart.", "Ask someone in the waiting room to read the chart."], "correct": 1, "feedback": "Verify the chart with the care team before proceeding. This protects patient safety and privacy."},
    careers: [
      {
        id: "31-1131.00",
        title: "Nursing Assistants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/31-1131.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/31-1131.00",
        questions: [
          {"prompt": "Blood pressure and temperature are examples of the _____ a nursing assistant checks.", "accept": ["vital signs"]},
          {"prompt": "Nursing assistants help patients with getting out of bed, walking, and _____.", "accept": ["bathing", "using the bathroom"]},
          {"prompt": "A nursing assistant shares changes in a patient's condition with the supervising _____.", "accept": ["nurse", "nurses"]},
        ]
      },
      {
        id: "29-1141.00",
        title: "Registered Nurses",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-1141.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-1141.00",
        questions: [
          {"prompt": "Before a patient heads home, an RN explains how to manage their illness or _____.", "accept": ["injury"]},
          {"prompt": "Nurses may help with _____ tests to plan care.", "accept": ["diagnostic"]},
          {"prompt": "Nursing homes, doctors' offices, and _____ are examples of RN workplaces.", "accept": ["hospitals", "schools"]},
        ]
      },
      {
        id: "31-9092.00",
        title: "Medical Assistants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/31-9092.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/31-9092.00",
        questions: [
          {"prompt": "Before the doctor sees a patient, a medical assistant may check the patient's _____.", "accept": ["vital signs"]},
          {"prompt": "Patient information goes into the medical _____.", "accept": ["records", "record"]},
          {"prompt": "At the end of a visit, a medical assistant may get instruments ready to reuse by _____ them.", "accept": ["sterilizing"]},
        ]
      },
      {
        id: "29-2032.00",
        title: "Diagnostic Medical Sonographers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-2032.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-2032.00",
        questions: [
          {"prompt": "Sonography uses high-frequency _____ waves to see inside the body.", "accept": ["sound"]},
          {"prompt": "The pictures made in sonography are also called _____.", "accept": ["sonograms", "ultrasounds"]},
          {"prompt": "A _____ uses the selected images to make a diagnosis or monitor a patient.", "accept": ["physician", "doctor"]},
        ]
      },
      {
        id: "29-2052.00",
        title: "Pharmacy Technicians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-2052.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-2052.00",
        questions: [
          {"prompt": "A pharmacy technician helps a _____ provide prescription medicine.", "accept": ["pharmacist"]},
          {"prompt": "After medicine is measured and packaged, a technician may _____ the prescription.", "accept": ["label"]},
          {"prompt": "Some pharmacy technicians process forms for medical _____.", "accept": ["insurance"]},
        ]
      },
      {
        id: "31-9091.00",
        title: "Dental Assistants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/31-9091.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/31-9091.00",
        questions: [
          {"prompt": "During an appointment, a dental assistant may take _____ to help the dentist see inside a patient's teeth.", "accept": ["x-rays", "x rays"]},
          {"prompt": "A dental assistant can show patients how to practice good oral _____.", "accept": ["hygiene"]},
          {"prompt": "Billing, keeping records, and _____ appointments are examples of office duties.", "accept": ["scheduling"]},
        ]
      },
      {
        id: "29-2042.00",
        title: "Emergency Medical Technicians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-2042.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-2042.00",
        questions: [
          {"prompt": "People who provide emergency care in an ambulance include paramedics and _____.", "accept": ["emergency medical technicians", "EMTs"]},
          {"prompt": "In addition to ambulances, some rescue crews work from airplanes or _____.", "accept": ["helicopters"]},
          {"prompt": "Some paid EMTs work shifts lasting 12 or _____ hours.", "accept": ["24", "twenty-four"]},
        ]
      },
      {
        id: "29-1123.00",
        title: "Physical Therapists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-1123.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-1123.00",
        questions: [
          {"prompt": "Before choosing treatment, the therapist checks the patient's medical _____.", "accept": ["history"]},
          {"prompt": "A therapist may show a patient how to use a cane or a _____.", "accept": ["prosthetic", "prosthesis"]},
          {"prompt": "After making a plan, a physical therapist tracks the patient's _____.", "accept": ["progress"]},
        ]
      },
      {
        id: "29-2061.00",
        title: "Licensed Practical Nurses",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-2061.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-2061.00",
        questions: [
          {"prompt": "LPNs provide basic care under doctors and registered _____.", "accept": ["nurses"]},
          {"prompt": "LPNs may change _____ and check vital signs.", "accept": ["dressings", "bandages"]},
          {"prompt": "The state-approved training program often takes about one _____.", "accept": ["year"]},
        ]
      },
      {
        id: "29-2034.00",
        title: "Radiologic Technologists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-2034.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-2034.00",
        questions: [
          {"prompt": "X-rays and CAT scans are examples of _____ examinations.", "accept": ["imaging"]},
          {"prompt": "Before starting equipment, technicians _____ the patient to get a clear image.", "accept": ["position"]},
          {"prompt": "A radiologic technologist can evaluate the _____ of an image.", "accept": ["quality"]},
        ]
      },
    ]
  },
  {
    id: "skilled-trades",
    title: "Skilled Trades",
    icon: "🛠",
    color: "#ffd66a",
    art: true,
    scenario: {"prompt": "You are about to use a tool, but you notice a crack in its handle.", "options": ["Set it aside and tell the crew lead before using it.", "Finish the quick job with the tool first.", "Put it back without telling anyone."], "correct": 0, "feedback": "Stop and report damaged equipment so it can be taken out of use."},
    careers: [
      {
        id: "47-2111.00",
        title: "Electricians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2111.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2111.00",
        questions: [
          {"prompt": "During new construction, electricians read _____ showing where circuits and outlets should go.", "accept": ["diagrams", "plans", "blueprints"]},
          {"prompt": "Electricians use tools to run _____ through walls.", "accept": ["wiring", "wire"]},
          {"prompt": "Electricians test equipment so they can find _____ and make repairs.", "accept": ["problems", "issues"]},
        ]
      },
      {
        id: "47-2031.00",
        title: "Carpenters",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2031.00",
        questions: [
          {"prompt": "Carpenters frequently use a _____ to find how long a piece needs to be.", "accept": ["tape measure", "measuring tape"]},
          {"prompt": "_____ skills help carpenters calculate what sizes to cut.", "accept": ["math", "mathematics"]},
          {"prompt": "Many carpenters train through a paid _____.", "accept": ["apprenticeship", "apprenticeship program"]},
        ]
      },
      {
        id: "47-2152.00",
        title: "Plumbers and Pipefitters",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2152.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2152.00",
        questions: [
          {"prompt": "A _____ helps plumbers cut a pipe to the right length.", "accept": ["pipe cutter", "pipe cutters"]},
          {"prompt": "A pipefitter may install fire _____ systems.", "accept": ["sprinkler", "sprinklers"]},
          {"prompt": "Steamfitters maintain systems that carry _____ at high pressure.", "accept": ["steam"]},
        ]
      },
      {
        id: "49-9021.00",
        title: "HVAC Mechanics",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/49-9021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/49-9021.00",
        questions: [
          {"prompt": "Climate control equipment connects to air _____ to move air through a building.", "accept": ["ducts", "duct"]},
          {"prompt": "HVAC controls let users adjust temperature and _____.", "accept": ["humidity"]},
          {"prompt": "Some HVAC technicians specialize in solar panels or commercial _____.", "accept": ["refrigeration"]},
        ]
      },
      {
        id: "51-4121.00",
        title: "Welders",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/51-4121.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/51-4121.00",
        questions: [
          {"prompt": "Before beginning, welders learn about the job by looking at _____ and specifications.", "accept": ["sketches", "drawings"]},
          {"prompt": "Welding joins pieces of _____.", "accept": ["metal"]},
          {"prompt": "Some workers operate _____ that weld parts automatically.", "accept": ["robots", "machines"]},
        ]
      },
      {
        id: "47-2061.00",
        title: "Construction Laborers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2061.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2061.00",
        questions: [
          {"prompt": "Construction laborers may dig narrow channels called _____.", "accept": ["trenches"]},
          {"prompt": "Laborers might direct _____ near a worksite to keep coworkers safe.", "accept": ["traffic"]},
          {"prompt": "One example of head protection mentioned in the video is a _____.", "accept": ["hard hat", "hard hats"]},
        ]
      },
      {
        id: "47-2021.00",
        title: "Brickmasons and Blockmasons",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2021.00",
        questions: [
          {"prompt": "Brickmasons and blockmasons work on structures like walls and _____.", "accept": ["chimneys"]},
          {"prompt": "Industrial brickwork may have to tolerate very high _____.", "accept": ["temperatures", "heat"]},
          {"prompt": "Masons may lift heavy materials and work from raised platforms called _____.", "accept": ["scaffolds", "scaffolding"]},
        ]
      },
      {
        id: "47-2181.00",
        title: "Roofers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2181.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2181.00",
        questions: [
          {"prompt": "Roofers first take _____ to work out how much material the job needs.", "accept": ["measurements"]},
          {"prompt": "The video names a vapor _____ as one layer used in roofing.", "accept": ["barrier"]},
          {"prompt": "Crews seal around vents and _____ to keep rain out.", "accept": ["chimneys"]},
        ]
      },
      {
        id: "47-2141.00",
        title: "Construction and Maintenance Painters",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2141.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2141.00",
        questions: [
          {"prompt": "Painters level out flaws before using sealant or _____.", "accept": ["primer"]},
          {"prompt": "To shield a nearby surface, painters may cover it with _____.", "accept": ["tarps", "a tarp", "tarp", "tape"]},
          {"prompt": "A painter may use a sprayer, roller, or hand _____.", "accept": ["brush", "brushes"]},
        ]
      },
      {
        id: "47-2051.00",
        title: "Cement Masons and Concrete Finishers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-2021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/47-2051.00",
        questions: [
          {"prompt": "Concrete finishers form sections used in buildings and _____.", "accept": ["roads"]},
          {"prompt": "A concrete finisher may lay walls and _____.", "accept": ["sidewalks"]},
          {"prompt": "In addition to strength, masonry work requires _____ to keep up with the physical demands.", "accept": ["stamina"]},
        ]
      },
    ]
  },
  {
    id: "food-service",
    title: "Food Service",
    icon: "👨‍🍳",
    color: "#ff6578",
    art: true,
    scenario: {"prompt": "A customer asks whether a dish contains an ingredient they are allergic to. You are unsure.", "options": ["Say it is probably fine.", "Suggest picking the ingredient out.", "Check the ingredient information and ask the manager before answering."], "correct": 2, "feedback": "Verify allergy information and follow your workplace procedure before promising a dish is safe."},
    careers: [
      {
        id: "35-1011.00",
        title: "Chefs and Head Cooks",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-1011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-1011.00",
        questions: [
          {"prompt": "The head cook supervises the kitchen _____.", "accept": ["staff", "team"]},
          {"prompt": "A chef creates and may set prices for items on the _____.", "accept": ["menu"]},
          {"prompt": "A missed detail in a busy kitchen can waste time and _____.", "accept": ["food"]},
        ]
      },
      {
        id: "51-3011.00",
        title: "Bakers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/51-3011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/51-3011.00",
        questions: [
          {"prompt": "Bakers check the quality of their _____ before combining them.", "accept": ["ingredients"]},
          {"prompt": "Large commercial bakeries use equipment such as ovens, conveyors, and commercial _____.", "accept": ["mixers"]},
          {"prompt": "Retail bakers often work in specialty shops and _____ stores.", "accept": ["grocery"]},
        ]
      },
      {
        id: "35-2014.00",
        title: "Restaurant Cooks",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-2011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-2014.00",
        questions: [
          {"prompt": "To make a restaurant-sized portion, cooks follow _____.", "accept": ["recipes", "recipe instructions"]},
          {"prompt": "A cook may _____ a finished item before serving it.", "accept": ["garnish", "decorate"]},
          {"prompt": "Cooks keep equipment clean and follow safe food _____ procedures.", "accept": ["handling"]},
        ]
      },
      {
        id: "35-3031.00",
        title: "Waiters and Waitresses",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-3031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-3031.00",
        questions: [
          {"prompt": "Restaurant servers take _____ and deliver food to customers.", "accept": ["orders"]},
          {"prompt": "In fine dining, servers have more time to offer personal, _____ service.", "accept": ["attentive"]},
          {"prompt": "Servers may carry hot plates and heavy _____.", "accept": ["trays"]},
        ]
      },
      {
        id: "35-9021.00",
        title: "Dishwashers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-9021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-9021.00",
        questions: [
          {"prompt": "Equipment that washes dishes automatically is called a _____.", "accept": ["dishwasher", "dishwashing machine"]},
          {"prompt": "Beyond the dishes, a dishwasher may have to remove the _____ from the kitchen.", "accept": ["trash", "garbage"]},
          {"prompt": "Dishwashers often wear _____ to protect their hands.", "accept": ["gloves"]},
        ]
      },
      {
        id: "35-2021.00",
        title: "Food Preparation Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-2021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-2021.00",
        questions: [
          {"prompt": "Food prep workers may brew coffee or _____.", "accept": ["tea"]},
          {"prompt": "They may use equipment such as slicers and _____.", "accept": ["blenders", "grinders", "dishwashers"]},
          {"prompt": "Shoes with _____ soles can reduce the risk of slipping at work.", "accept": ["nonslip", "non slip", "slip resistant"]},
        ]
      },
      {
        id: "35-3011.00",
        title: "Bartenders",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-3011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-3011.00",
        questions: [
          {"prompt": "Bartenders prepare drink decorations called _____.", "accept": ["garnishes"]},
          {"prompt": "Besides serving drinks, a bartender may process customers' _____.", "accept": ["payments", "payment"]},
          {"prompt": "Many bartenders learn their duties on the _____.", "accept": ["job"]},
        ]
      },
      {
        id: "35-3023.00",
        title: "Fast Food and Counter Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/35-3023.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/35-3023.00",
        questions: [
          {"prompt": "Counter attendants take orders and process _____.", "accept": ["payments", "payment"]},
          {"prompt": "Counter attendants may prepare sandwiches or assemble _____.", "accept": ["salads"]},
          {"prompt": "Workers called bussers take away dirty dishes and reset _____.", "accept": ["tables"]},
        ]
      },
      {
        id: "11-9081.00",
        title: "Lodging Managers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/11-9081.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/11-9081.00",
        questions: [
          {"prompt": "Lodging managers may inspect public areas and guest _____.", "accept": ["rooms"]},
          {"prompt": "Managers who coordinate the front desk also help organize room _____.", "accept": ["reservations"]},
          {"prompt": "A convention services manager may arrange screens and _____ for a meeting.", "accept": ["projectors"]},
        ]
      },
      {
        id: "11-9051.00",
        title: "Food Service Managers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/11-9051.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/11-9051.00",
        questions: [
          {"prompt": "Food service managers organize staff and schedule their _____.", "accept": ["hours", "shifts"]},
          {"prompt": "Managers oversee production and are responsible for health and _____ standards.", "accept": ["safety"]},
          {"prompt": "In addition to ordering supplies, food service managers need to maintain a balanced _____.", "accept": ["budget"]},
        ]
      },
    ]
  },
  {
    id: "technology",
    title: "Technology",
    icon: "💻",
    color: "#74daff",
    art: true,
    scenario: {"prompt": "A coworker needs help logging in and offers to tell you their password.", "options": ["Write it down so you can test it later.", "Keep the password private and guide them through the approved reset steps.", "Ask them to send it in the team chat."], "correct": 1, "feedback": "Guide people using the approved support process and protect their login information."},
    careers: [
      {
        id: "15-1232.00",
        title: "Computer User Support Specialists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/15-1232.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/15-1232.00",
        questions: [
          {"prompt": "Computer user support specialists are also called _____ technicians.", "accept": ["help desk", "helpdesk"]},
          {"prompt": "To make instructions easier to understand, technicians avoid technical _____.", "accept": ["jargon"]},
          {"prompt": "They may train workers on new hardware and _____.", "accept": ["software"]},
        ]
      },
      {
        id: "15-1252.00",
        title: "Software Developers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/15-1252.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/15-1252.00",
        questions: [
          {"prompt": "Developers begin by finding out what _____ need.", "accept": ["users", "customers"]},
          {"prompt": "Programmers refer to developers' diagrams and _____ when they write the code.", "accept": ["models"]},
          {"prompt": "If testing finds a design is too hard to use, developers _____ it.", "accept": ["redesign", "revise", "change"]},
        ]
      },
      {
        id: "15-1254.00",
        title: "Web Developers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/15-1254.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/15-1254.00",
        questions: [
          {"prompt": "Developers can clarify a website's purpose and the _____ it should serve.", "accept": ["audience", "users"]},
          {"prompt": "The website is built using _____ languages.", "accept": ["programming", "coding"]},
          {"prompt": "A webmaster keeps sites working and makes sure they stay _____.", "accept": ["updated", "up to date", "current"]},
        ]
      },
      {
        id: "15-1212.00",
        title: "Information Security Analysts",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/15-1212.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/15-1212.00",
        questions: [
          {"prompt": "Security analysts protect computer networks and _____.", "accept": ["systems"]},
          {"prompt": "A _____ is one tool mentioned for protecting a computer network.", "accept": ["firewall", "firewalls", "data encryption program"]},
          {"prompt": "Analysts look for security _____ so the organization can respond.", "accept": ["breaches"]},
        ]
      },
      {
        id: "15-1244.00",
        title: "Network and Computer Systems Administrators",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/15-1244.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/15-1244.00",
        questions: [
          {"prompt": "Network administrators are responsible for the _____ operation of computer networks.", "accept": ["day-to-day", "daily", "day to day"]},
          {"prompt": "Administrators install software and _____.", "accept": ["hardware"]},
          {"prompt": "These administrators use _____ skills to explain problems to people outside IT.", "accept": ["communication"]},
        ]
      },
      {
        id: "15-1231.00",
        title: "Computer Network Support Specialists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/15-1232.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/15-1231.00",
        questions: [
          {"prompt": "Network support specialists usually work within the _____ department.", "accept": ["IT", "information technology"]},
          {"prompt": "They troubleshoot wide area networks and _____ area networks.", "accept": ["local"]},
          {"prompt": "The people they typically assist are other _____ professionals.", "accept": ["IT", "information technology"]},
        ]
      },
      {
        id: "17-2051.00",
        title: "Civil Engineers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/17-2051.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/17-2051.00",
        questions: [
          {"prompt": "Besides bridges and roads, civil engineers design systems for moving waste and _____.", "accept": ["water"]},
          {"prompt": "Geotechnical engineers make sure large projects have a solid _____.", "accept": ["foundation"]},
          {"prompt": "Engineers who plan airports, subways, and roads specialize in _____.", "accept": ["transportation"]},
        ]
      },
      {
        id: "17-2141.00",
        title: "Mechanical Engineers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/17-2141.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/17-2141.00",
        questions: [
          {"prompt": "Mechanical engineers build _____ so they can test and improve early versions of designs.", "accept": ["prototypes", "prototype"]},
          {"prompt": "Air conditioning systems and _____ that move people between floors are examples of what these engineers can design.", "accept": ["elevators"]},
          {"prompt": "Automotive engineers may improve features like temperature controls and _____.", "accept": ["suspension"]},
        ]
      },
      {
        id: "17-2071.00",
        title: "Electrical Engineers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/17-2071.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/17-2071.00",
        questions: [
          {"prompt": "The nationwide systems that distribute electricity are power _____.", "accept": ["grids"]},
          {"prompt": "An electrical engineer may design electrical equipment such as _____ that turn electrical energy into motion.", "accept": ["motors", "motor"]},
          {"prompt": "When checking how equipment should work, engineers may interpret technical _____.", "accept": ["manuals"]},
        ]
      },
      {
        id: "17-2061.00",
        title: "Computer Hardware Engineers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/17-2061.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/17-2061.00",
        questions: [
          {"prompt": "Hardware engineers design and test physical parts such as processors, memory, and circuit _____.", "accept": ["boards"]},
          {"prompt": "One goal is to make computers more powerful and _____.", "accept": ["faster", "quicker"]},
          {"prompt": "Hardware engineers may work with software _____ to design devices such as tablets.", "accept": ["developers"]},
        ]
      },
    ]
  },
  {
    id: "agriculture",
    title: "Agriculture",
    icon: "🌱",
    color: "#9bee83",
    art: false,
    scenario: {"prompt": "A label has fallen off a container of supplies at an outdoor worksite.", "options": ["Use it based on what the container looks like.", "Put it next to the labeled supplies and move on.", "Leave it unused and ask your supervisor to identify it."], "correct": 2, "feedback": "An unlabeled container should be identified by the supervisor before anyone uses it."},
    careers: [
      {
        id: "29-2056.00",
        title: "Veterinary Technicians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-2056.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-2056.00",
        questions: [
          {"prompt": "Vet techs take samples and run tests in a _____.", "accept": ["lab", "laboratory"]},
          {"prompt": "During surgery, vet techs may monitor an animal's _____ signs.", "accept": ["vital"]},
          {"prompt": "Many vet techs work in private clinics or animal _____.", "accept": ["hospitals"]},
        ]
      },
      {
        id: "29-1131.00",
        title: "Veterinarians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/29-1131.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/29-1131.00",
        questions: [
          {"prompt": "A veterinarian who specializes in horses works in _____ medicine.", "accept": ["equine"]},
          {"prompt": "Companion animal vets often treat dogs and _____.", "accept": ["cats"]},
          {"prompt": "Food animal veterinarians often work at farms and _____.", "accept": ["ranches"]},
        ]
      },
      {
        id: "39-2021.00",
        title: "Animal Caretakers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-2021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-2021.00",
        questions: [
          {"prompt": "A pet _____ may care for an animal in the owner's home.", "accept": ["sitter"]},
          {"prompt": "At an animal shelter, caretakers talk with the public about pet health and _____.", "accept": ["adoption", "adoptions"]},
          {"prompt": "Workers who care for animals in zoos are called _____.", "accept": ["zookeepers"]},
        ]
      },
      {
        id: "39-2011.00",
        title: "Animal Trainers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-2011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-2011.00",
        questions: [
          {"prompt": "Trainers may reward a correct action with food or _____.", "accept": ["praise"]},
          {"prompt": "Search and _____ work is an example the video gives of a job trained animals can do.", "accept": ["rescue"]},
          {"prompt": "Patience and good _____ help trainers work with animals and people.", "accept": ["communication"]},
        ]
      },
      {
        id: "37-3011.00",
        title: "Landscaping Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/37-3011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/37-3011.00",
        questions: [
          {"prompt": "Landscaping workers plant and trim trees and _____.", "accept": ["flowers", "plants"]},
          {"prompt": "When caring for outdoor spaces in winter, groundskeepers may clear _____.", "accept": ["snow"]},
          {"prompt": "Athletic field groundskeepers maintain natural or artificial _____.", "accept": ["turf", "grass"]},
        ]
      },
      {
        id: "37-3012.00",
        title: "Pesticide Applicators",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/37-3012.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/37-3012.00",
        questions: [
          {"prompt": "These workers help protect landscapes and crops from insects and _____.", "accept": ["fungi", "predatory plants"]},
          {"prompt": "These workers often spend much of the day _____.", "accept": ["outdoors", "outside"]},
          {"prompt": "To reduce exposure, they use safety gear and protective _____.", "accept": ["clothing"]},
        ]
      },
      {
        id: "11-9013.00",
        title: "Farmers, Ranchers and Agricultural Managers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/11-9013.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/11-9013.00",
        questions: [
          {"prompt": "Farmers may grow crops or raise _____.", "accept": ["livestock", "animals"]},
          {"prompt": "During harvest, some farmers may work from sunrise to _____.", "accept": ["sunset"]},
          {"prompt": "An agricultural manager may hire and supervise staff and manage the farm's _____.", "accept": ["budget", "budgeting"]},
        ]
      },
      {
        id: "45-2092.00",
        title: "Crop and Nursery Farmworkers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/45-2091.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/45-2092.00",
        questions: [
          {"prompt": "Crop and nursery workers care for plants by planting and _____.", "accept": ["pruning"]},
          {"prompt": "The video lists fruits, nuts, and _____ as examples of nursery or crop products.", "accept": ["flowers", "trees"]},
          {"prompt": "After harvesting, workers may help load crops for _____.", "accept": ["shipment", "shipping"]},
        ]
      },
      {
        id: "19-1031.00",
        title: "Conservation Scientists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/19-1031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/19-1031.00",
        questions: [
          {"prompt": "A conservation scientist may study soil _____, which is the loss of soil from a site.", "accept": ["erosion"]},
          {"prompt": "Scientists read lab results from _____ samples.", "accept": ["soil"]},
          {"prompt": "They consider costs, time and _____ when they decide what plan can work.", "accept": ["laws", "regulations"]},
        ]
      },
      {
        id: "19-1023.00",
        title: "Zoologists and Wildlife Biologists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/19-1023.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/19-1023.00",
        questions: [
          {"prompt": "Wildlife biologists may study a particular ecosystem or an endangered _____.", "accept": ["species"]},
          {"prompt": "Researchers share results through publications and _____.", "accept": ["presentations"]},
          {"prompt": "Work done outside the lab in places like deserts and mountains is called _____.", "accept": ["fieldwork", "field work"]},
        ]
      },
    ]
  },
  {
    id: "human-services",
    title: "Human Services",
    icon: "🤝",
    color: "#e3a2ff",
    art: false,
    scenario: {"prompt": "Someone you support needs an instruction explained in a different way.", "options": ["Ask how they prefer to learn, then show the steps in that format.", "Repeat the same instruction more loudly.", "Ask someone else to do the task for them."], "correct": 0, "feedback": "Ask what support works for the person, and let them take the lead when they can."},
    careers: [
      {
        id: "39-9011.00",
        title: "Childcare Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-9011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-9011.00",
        questions: [
          {"prompt": "Workers can help preschoolers get ready for kindergarten through hands-on activities and _____.", "accept": ["storytelling", "telling stories"]},
          {"prompt": "A childcare worker might help older children with _____.", "accept": ["homework"]},
          {"prompt": "A caregiver employed full time by one family may be called a _____.", "accept": ["nanny"]},
        ]
      },
      {
        id: "25-2021.00",
        title: "Elementary School Teachers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/25-2021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/25-2021.00",
        questions: [
          {"prompt": "Besides math, reading, and science, the video lists _____ studies as a basic subject.", "accept": ["social"]},
          {"prompt": "Teachers meet with _____ to talk about a child's progress and challenges.", "accept": ["parents", "families"]},
          {"prompt": "Teachers may spend time outside class preparing lessons and _____ schoolwork.", "accept": ["grading", "marking"]},
        ]
      },
      {
        id: "25-2011.00",
        title: "Preschool Teachers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/25-2011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/25-2011.00",
        questions: [
          {"prompt": "Preschool teachers provide education and care to children from age two to age _____.", "accept": ["four", "4"]},
          {"prompt": "To balance the day, teachers schedule play, movement, and _____.", "accept": ["rest", "rest time"]},
          {"prompt": "Teachers monitor a child's _____ to share with their parents.", "accept": ["progress", "development"]},
        ]
      },
      {
        id: "25-9031.00",
        title: "Instructional Coordinators",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/25-9031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/25-9031.00",
        questions: [
          {"prompt": "The school _____ is the plan for what students will learn.", "accept": ["curriculum"]},
          {"prompt": "Coordinators visit schools and _____ teachers at work.", "accept": ["observe", "watch"]},
          {"prompt": "A coordinator may train teachers to use _____ in lesson planning.", "accept": ["technology"]},
        ]
      },
      {
        id: "21-1093.00",
        title: "Social and Human Service Assistants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/21-1093.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/21-1093.00",
        questions: [
          {"prompt": "Human service assistants connect clients with benefits and services in the _____.", "accept": ["community"]},
          {"prompt": "They _____ up to check that the services are in place.", "accept": ["follow"]},
          {"prompt": "In one example, families may get connected to childcare or _____ assistance.", "accept": ["food"]},
        ]
      },
      {
        id: "25-4022.00",
        title: "Librarians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/25-4022.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/25-4022.00",
        questions: [
          {"prompt": "Librarians help patrons find information and conduct _____.", "accept": ["research"]},
          {"prompt": "One program a librarian might plan for young children is _____.", "accept": ["storytelling", "story time"]},
          {"prompt": "Librarians choose materials to add to the library's _____.", "accept": ["collection"]},
        ]
      },
      {
        id: "21-1021.00",
        title: "Child, Family and School Social Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/21-1021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/21-1021.00",
        questions: [
          {"prompt": "Social workers can teach clients to _____ for themselves.", "accept": ["advocate", "speak up"]},
          {"prompt": "Child and family workers may connect families to childcare and _____.", "accept": ["housing", "welfare assistance"]},
          {"prompt": "To keep track of conversations and activity, social workers need good record _____.", "accept": ["keeping"]},
        ]
      },
      {
        id: "21-1012.00",
        title: "Educational and Career Counselors",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/21-1012.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/21-1012.00",
        questions: [
          {"prompt": "School counselors may help students with disabilities arrange _____.", "accept": ["accommodations"]},
          {"prompt": "Career counselors help clients search for a _____.", "accept": ["job"]},
          {"prompt": "During job preparation, a counselor might teach someone to write a _____.", "accept": ["résumé", "resume"]},
        ]
      },
      {
        id: "39-9032.00",
        title: "Recreation Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-9032.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-9032.00",
        questions: [
          {"prompt": "Recreation workers design activities around people's interests, needs, and physical _____.", "accept": ["abilities"]},
          {"prompt": "These workers receive _____ training so they can help when someone gets hurt.", "accept": ["first aid"]},
          {"prompt": "Some workers help run outdoor activities at parks and summer _____.", "accept": ["camps"]},
        ]
      },
      {
        id: "25-2031.00",
        title: "High School Teachers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/25-2031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/25-2031.00",
        questions: [
          {"prompt": "High school teachers typically specialize in one _____.", "accept": ["subject"]},
          {"prompt": "Outside class, they may plan lessons and _____ assignments.", "accept": ["grade", "mark"]},
          {"prompt": "Some also coach sports or advise _____.", "accept": ["clubs", "student clubs"]},
        ]
      },
    ]
  },
  {
    id: "business",
    title: "Business",
    icon: "📊",
    color: "#93efba",
    art: false,
    scenario: {"prompt": "A customer spots a mismatch between a receipt and the price they were told.", "options": ["Argue that the receipt is always right.", "Listen, check the record, and follow the workplace process to resolve it.", "Change the paperwork without telling the supervisor."], "correct": 1, "feedback": "Verify the facts before making changes and explain the next step clearly to the customer."},
    careers: [
      {
        id: "41-2011.00",
        title: "Cashiers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/41-2031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/41-2011.00",
        questions: [
          {"prompt": "Cashiers greet shoppers and ring up their _____.", "accept": ["purchases", "items"]},
          {"prompt": "When a shopper brings a product back, a cashier may handle the _____.", "accept": ["return", "returns"]},
          {"prompt": "A cashier might sign customers up for the store's _____ program.", "accept": ["rewards", "reward"]},
        ]
      },
      {
        id: "41-2031.00",
        title: "Retail Salespersons",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/41-2031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/41-2031.00",
        questions: [
          {"prompt": "Retail salespeople help shoppers find and _____ products.", "accept": ["choose", "select", "buy"]},
          {"prompt": "Appliance salespeople may explain specifications and _____ options.", "accept": ["financing", "finance"]},
          {"prompt": "Parts salespeople may advise customers, take orders, and _____ supplies.", "accept": ["inventory"]},
        ]
      },
      {
        id: "43-4051.00",
        title: "Customer Service Representatives",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-4051.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-4051.00",
        questions: [
          {"prompt": "Customer service representatives use patience and strong _____ to understand what customers are saying.", "accept": ["listening", "listening skills"]},
          {"prompt": "The video says the usual way representatives work with customers is by _____.", "accept": ["phone", "telephone"]},
          {"prompt": "In a store, a representative might handle returns and _____.", "accept": ["refunds"]},
        ]
      },
      {
        id: "43-4171.00",
        title: "Receptionists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-4071.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-4171.00",
        questions: [
          {"prompt": "A front desk clerk may collect fees and _____.", "accept": ["payments", "payment"]},
          {"prompt": "Clerks may enter and retrieve _____ from office systems.", "accept": ["data", "information"]},
          {"prompt": "Integrity matters because information clerks may handle _____ information.", "accept": ["private", "confidential", "sensitive"]},
        ]
      },
      {
        id: "43-9061.00",
        title: "General Office Clerks",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-9061.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-9061.00",
        questions: [
          {"prompt": "Besides answering telephones, general office clerks may type documents and file _____.", "accept": ["records"]},
          {"prompt": "Office clerks may use a photocopier, fax machine, or _____ to digitize a document.", "accept": ["scanner"]},
          {"prompt": "A general office clerk at a college might process college _____.", "accept": ["applications"]},
        ]
      },
      {
        id: "43-3031.00",
        title: "Bookkeeping Clerks",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-3031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-3031.00",
        questions: [
          {"prompt": "Bookkeeping clerks use computer _____ designed for accounting.", "accept": ["software", "programs"]},
          {"prompt": "Clerks may enter data from receipts and _____.", "accept": ["bills", "invoices"]},
          {"prompt": "Tracking wages means some bookkeepers handle _____.", "accept": ["payroll"]},
        ]
      },
      {
        id: "43-3071.00",
        title: "Tellers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-3071.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-3071.00",
        questions: [
          {"prompt": "A customer who brings money to put into an account is making a _____.", "accept": ["deposit"]},
          {"prompt": "A head teller goes to the _____ to get larger amounts of cash.", "accept": ["vault"]},
          {"prompt": "The video says that most tellers work in bank _____.", "accept": ["branches"]},
        ]
      },
      {
        id: "13-2011.00",
        title: "Accountants and Auditors",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/13-2011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/13-2011.00",
        questions: [
          {"prompt": "An _____ checks the financial work done by accountants.", "accept": ["auditor"]},
          {"prompt": "Accountants are involved in budgeting, controlling costs, and calculating _____.", "accept": ["taxes"]},
          {"prompt": "The narrator mentions a bachelor's degree in _____.", "accept": ["accounting"]},
        ]
      },
      {
        id: "43-6014.00",
        title: "Administrative Assistants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-6014.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-6014.00",
        questions: [
          {"prompt": "Administrative assistants may organize files and schedule _____.", "accept": ["appointments"]},
          {"prompt": "They work with documents and _____ to organize information in rows and columns.", "accept": ["spreadsheets"]},
          {"prompt": "A school secretary may communicate with students, administrators, and _____.", "accept": ["parents"]},
        ]
      },
      {
        id: "41-1011.00",
        title: "Retail Sales Supervisors",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/41-1011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/41-1011.00",
        questions: [
          {"prompt": "Sales supervisors may hire, train, and _____ employees.", "accept": ["evaluate", "review", "assess"]},
          {"prompt": "Retail supervisors _____ when sales workers work each week.", "accept": ["schedule", "plan"]},
          {"prompt": "One customer-facing duty involves resolving _____.", "accept": ["complaints", "customer complaints"]},
        ]
      },
    ]
  },
  {
    id: "arts-media",
    title: "Arts & Media",
    icon: "🎨",
    color: "#ffab82",
    art: false,
    scenario: {"prompt": "A client gives you feedback about your work, but you are unsure what change they want.", "options": ["Guess and finish quickly.", "Ignore the feedback because the work is almost done.", "Ask for a specific example and confirm the change before revising."], "correct": 2, "feedback": "Clarifying feedback early helps you make the change the client actually requested."},
    careers: [
      {
        id: "39-5012.00",
        title: "Hairstylists and Cosmetologists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-5012.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-5012.00",
        questions: [
          {"prompt": "Hairstylists may offer coloring and styling in addition to cuts and _____.", "accept": ["shampoos", "shampooing"]},
          {"prompt": "Cosmetologists may offer _____ treatments, which involve the skin on the head.", "accept": ["scalp"]},
          {"prompt": "A worker may lease _____ space instead of owning a salon.", "accept": ["chair"]},
        ]
      },
      {
        id: "39-5011.00",
        title: "Barbers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-5012.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-5011.00",
        questions: [
          {"prompt": "The video mentions shampoos, haircuts, and _____ as services barbers commonly provide.", "accept": ["shaves", "shaving"]},
          {"prompt": "Some barbers also fit _____ for clients.", "accept": ["hairpieces", "hair pieces"]},
          {"prompt": "Barbers must understand a client's preferences and stay on time for the next _____.", "accept": ["appointment", "customer", "client"]},
        ]
      },
      {
        id: "39-5092.00",
        title: "Manicurists and Pedicurists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-5092.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-5092.00",
        questions: [
          {"prompt": "Before trimming nails, a technician may begin by _____ the client's hands or feet.", "accept": ["soaking"]},
          {"prompt": "After trimming and filing, the technician might apply nail _____.", "accept": ["polish"]},
          {"prompt": "A nail salon owner may manage employees, keep track of inventory, and order _____.", "accept": ["supplies"]},
        ]
      },
      {
        id: "39-5094.00",
        title: "Skincare Specialists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/39-5094.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/39-5094.00",
        questions: [
          {"prompt": "Treatment options that the narrator lists include masks, peels, and _____.", "accept": ["scrubs"]},
          {"prompt": "At the end of a service, skin care workers clean and _____ equipment.", "accept": ["disinfect", "sanitize"]},
          {"prompt": "Many work in salons or health _____.", "accept": ["spas"]},
        ]
      },
      {
        id: "27-1024.00",
        title: "Graphic Designers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/27-1024.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/27-1024.00",
        questions: [
          {"prompt": "Graphic designers use both images and _____ to communicate ideas.", "accept": ["text", "words"]},
          {"prompt": "The video says that designers work closely with _____ when placing copy in a layout.", "accept": ["writers"]},
          {"prompt": "A designer can turn statistical data into _____ to make it easier to understand.", "accept": ["visuals", "graphics", "images"]},
        ]
      },
      {
        id: "27-4021.00",
        title: "Photographers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/27-4021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/27-4021.00",
        questions: [
          {"prompt": "Photographers use digital cameras and photo-editing _____.", "accept": ["software"]},
          {"prompt": "A collection of work a photographer can share online is a _____.", "accept": ["portfolio"]},
          {"prompt": "Besides scientific and industrial work, photographers may specialize in _____ photography, taken from above.", "accept": ["aerial"]},
        ]
      },
      {
        id: "27-1013.00",
        title: "Fine Artists",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/27-1013.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/27-1013.00",
        questions: [
          {"prompt": "Painting and _____ are two examples of art forms an artist might specialize in.", "accept": ["sculpture", "sculpting"]},
          {"prompt": "Artists who make artwork for publications or products may work as _____.", "accept": ["illustrators"]},
          {"prompt": "A museum, craft fair, or _____ are places artists can show their work.", "accept": ["the Internet", "Internet", "online", "studio", "studios"]},
        ]
      },
      {
        id: "27-4032.00",
        title: "Film and Video Editors",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/27-4032.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/27-4032.00",
        questions: [
          {"prompt": "Editors turn raw _____ into a sequence that tells a story.", "accept": ["footage"]},
          {"prompt": "Editors may review shots frame by _____ to check the effect of a cut.", "accept": ["frame"]},
          {"prompt": "Most editing today is done digitally using specialized _____.", "accept": ["software"]},
        ]
      },
      {
        id: "27-3043.00",
        title: "Writers and Authors",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/27-3042.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/27-3043.00",
        questions: [
          {"prompt": "The video lists books, web content, articles, and movie _____ as products writers create.", "accept": ["screenplays", "scripts"]},
          {"prompt": "_____ writers create instructions and how-to guides.", "accept": ["technical"]},
          {"prompt": "Copywriters may write for an advertising _____.", "accept": ["campaign", "campaigns"]},
        ]
      },
      {
        id: "27-1025.00",
        title: "Interior Designers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/27-1025.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/27-1025.00",
        questions: [
          {"prompt": "Interior designers choose furniture, colors, floor coverings, and _____.", "accept": ["lighting", "lights"]},
          {"prompt": "They estimate _____ and create a timeline before placing orders.", "accept": ["costs", "costs for the project"]},
          {"prompt": "Interior designers should understand building codes and _____ standards so spaces can serve more people.", "accept": ["accessibility", "universal accessibility"]},
        ]
      },
    ]
  },
  {
    id: "public-service",
    title: "Public Service",
    icon: "🛡️",
    color: "#95baff",
    art: false,
    scenario: {"prompt": "You find a hazard in an area the public uses. People are still walking nearby.", "options": ["Follow the site procedure to warn people and report the hazard promptly.", "Assume the next shift will handle it.", "Wait until your shift is over to mention it."], "correct": 0, "feedback": "Give a prompt warning and use the workplace reporting procedure to protect others."},
    careers: [
      {
        id: "33-2011.00",
        title: "Firefighters",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/33-2011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/33-2011.00",
        questions: [
          {"prompt": "The video says many calls to firefighters are _____ emergencies.", "accept": ["medical"]},
          {"prompt": "Some firefighters get extra training to fight _____ fires.", "accept": ["forest", "wildland"]},
          {"prompt": "Government agencies are a major employer, especially _____ governments.", "accept": ["local"]},
        ]
      },
      {
        id: "33-3051.00",
        title: "Police Patrol Officers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/33-3021.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/33-3051.00",
        questions: [
          {"prompt": "Patrol officers wear recognizable _____.", "accept": ["uniforms"]},
          {"prompt": "Police and railroad officers may help protect lives and _____.", "accept": ["property"]},
          {"prompt": "The video says officers document every _____ in detail.", "accept": ["incident"]},
        ]
      },
      {
        id: "33-9032.00",
        title: "Security Guards",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/33-9032.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/33-9032.00",
        questions: [
          {"prompt": "Security staff may monitor cameras and _____ to check whether a property is secure.", "accept": ["alarms", "alarm systems"]},
          {"prompt": "Guards at sporting events may direct traffic and control _____.", "accept": ["crowds"]},
          {"prompt": "One duty at an office or school is checking a visitor's _____.", "accept": ["ID", "identification"]},
        ]
      },
      {
        id: "43-5031.00",
        title: "Public Safety Telecommunicators",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-5031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-5031.00",
        questions: [
          {"prompt": "After learning the type of emergency, a dispatcher finds out its _____.", "accept": ["location"]},
          {"prompt": "Dispatchers send the details to the appropriate emergency _____.", "accept": ["responders"]},
          {"prompt": "Dispatchers keep detailed _____ of calls.", "accept": ["records", "logs"]},
        ]
      },
      {
        id: "37-2011.00",
        title: "Janitors and Cleaners",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/37-2011.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/37-2011.00",
        questions: [
          {"prompt": "During winter, a janitor's outside duties may include removing _____.", "accept": ["snow"]},
          {"prompt": "Some keep track of a building's heating and _____ systems.", "accept": ["cooling"]},
          {"prompt": "A worker who maintains a public school or hospital can be called a _____.", "accept": ["custodian"]},
        ]
      },
      {
        id: "37-2012.00",
        title: "Maids and Housekeeping Cleaners",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/37-2012.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/37-2012.00",
        questions: [
          {"prompt": "A housekeeper may make beds and replace _____.", "accept": ["linens", "bedding"]},
          {"prompt": "A deeper cleaning job the video mentions is _____ carpets.", "accept": ["shampooing", "shampooing the"]},
          {"prompt": "In hotels, a housekeeper may be responsible for a specific _____ of the building.", "accept": ["section", "part", "area"]},
        ]
      },
      {
        id: "49-9071.00",
        title: "General Maintenance and Repair Workers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/49-9071.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/49-9071.00",
        questions: [
          {"prompt": "Maintenance workers may fix machines and parts of buildings such as roofs and _____.", "accept": ["floors"]},
          {"prompt": "If a problem is beyond their duties, they may call a plumber or an _____.", "accept": ["electrician"]},
          {"prompt": "New workers may learn by _____ experienced workers as they do the job.", "accept": ["observing", "watching"]},
        ]
      },
      {
        id: "51-8031.00",
        title: "Water and Wastewater Treatment Operators",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/51-8031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/51-8031.00",
        questions: [
          {"prompt": "Fresh water can come from rivers, reservoirs, or _____.", "accept": ["wells"]},
          {"prompt": "Water operators monitor _____ to make sure the plant keeps running.", "accept": ["equipment", "machinery"]},
          {"prompt": "Wastewater systems remove _____ before releasing or reusing the water.", "accept": ["pollutants", "contaminants"]},
        ]
      },
      {
        id: "43-5052.00",
        title: "Postal Service Mail Carriers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/43-5052.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/43-5052.00",
        questions: [
          {"prompt": "Mail carriers organize the mail in the order of their delivery _____.", "accept": ["route", "routes"]},
          {"prompt": "They can deliver by car or on _____.", "accept": ["foot"]},
          {"prompt": "Carriers collect mail and bring it to the post _____.", "accept": ["office"]},
        ]
      },
      {
        id: "53-7081.00",
        title: "Refuse and Recycling Collectors",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-7062.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-7081.00",
        questions: [
          {"prompt": "Recycling collectors pick up recyclables and _____ from homes and businesses.", "accept": ["garbage", "trash", "refuse"]},
          {"prompt": "The video identifies coordination and _____ as two qualities many hand-labor jobs require.", "accept": ["stamina", "endurance"]},
          {"prompt": "Collectors pick up materials from businesses and _____.", "accept": ["homes", "houses", "residences"]},
        ]
      },
    ]
  },
  {
    id: "transportation",
    title: "Transportation",
    icon: "🚚",
    color: "#ffe081",
    art: false,
    scenario: {"prompt": "Your schedule is tight and a required equipment check shows a possible problem.", "options": ["Skip the check to stay on schedule.", "Stop, report the issue, and wait for clearance before leaving.", "Ask a coworker to mark it as checked."], "correct": 1, "feedback": "Report the problem and follow the safety process before moving people or goods."},
    careers: [
      {
        id: "49-3023.00",
        title: "Automotive Service Technicians",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/49-3023.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/49-3023.00",
        questions: [
          {"prompt": "Mechanics can use _____ to help diagnose some vehicle problems.", "accept": ["computers", "a computer", "computer"]},
          {"prompt": "A mechanic explains technical car terms to the car _____.", "accept": ["owner", "owners"]},
          {"prompt": "Two common workplaces are car dealerships and _____ shops.", "accept": ["auto repair", "repair"]},
        ]
      },
      {
        id: "53-3032.00",
        title: "Heavy Truck Drivers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-3032.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-3032.00",
        questions: [
          {"prompt": "A _____ assigns routes to heavy truck drivers.", "accept": ["dispatcher"]},
          {"prompt": "Drivers may use a _____ to help plan the drive.", "accept": ["GPS"]},
          {"prompt": "Long-haul routes can run through several _____.", "accept": ["states"]},
        ]
      },
      {
        id: "49-3031.00",
        title: "Diesel Mechanics",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/49-3031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/49-3031.00",
        questions: [
          {"prompt": "Diesel technicians work on vehicles such as buses and _____.", "accept": ["trucks"]},
          {"prompt": "The video mentions _____ companies as one employer for diesel mechanics.", "accept": ["trucking"]},
          {"prompt": "Diesel technicians repair engines that run on _____ fuel.", "accept": ["diesel"]},
        ]
      },
      {
        id: "53-3033.00",
        title: "Light Truck Drivers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-3033.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-3033.00",
        questions: [
          {"prompt": "Light truck drivers make deliveries using small trucks or _____.", "accept": ["vans"]},
          {"prompt": "Drivers need to know which local _____ allow trucks.", "accept": ["roads", "streets"]},
          {"prompt": "They travel from distribution centers or stores to homes and _____.", "accept": ["businesses"]},
        ]
      },
      {
        id: "53-7062.00",
        title: "Hand Laborers and Material Movers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-7062.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-7062.00",
        questions: [
          {"prompt": "Warehouse workers who retrieve items for shipment are called _____.", "accept": ["pickers"]},
          {"prompt": "Before a shipment, workers may _____ items so they stay together and protected.", "accept": ["wrap", "pack"]},
          {"prompt": "Hand laborers may load and unload items from a _____.", "accept": ["truck", "trucks"]},
        ]
      },
      {
        id: "53-7051.00",
        title: "Industrial Truck Operators",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/47-5022.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-7051.00",
        questions: [
          {"prompt": "_____ are used to lift and move goods around warehouses or storage yards.", "accept": ["forklifts", "forklift"]},
          {"prompt": "A conveyor _____ can move merchandise through a warehouse.", "accept": ["belt", "belts"]},
          {"prompt": "The video places industrial truck equipment in warehouses, worksites, and storage _____.", "accept": ["yards"]},
        ]
      },
      {
        id: "53-3052.00",
        title: "Transit and Intercity Bus Drivers",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-3052.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-3052.00",
        questions: [
          {"prompt": "Local transit drivers may collect fares and give riders _____.", "accept": ["transfers"]},
          {"prompt": "An _____ bus driver carries people from one town or city to another.", "accept": ["intercity"]},
          {"prompt": "City bus drivers use regular _____ and a daily schedule.", "accept": ["routes"]},
        ]
      },
      {
        id: "53-6031.00",
        title: "Automotive and Watercraft Service Attendants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-6031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-6031.00",
        questions: [
          {"prompt": "A service attendant might change motor _____ in a vehicle.", "accept": ["oil"]},
          {"prompt": "In addition to replacing lights, an attendant might replace _____ blades.", "accept": ["wiper", "windshield wiper"]},
          {"prompt": "Attendants may call customers to remind them when their vehicle is due for _____.", "accept": ["service", "maintenance"]},
        ]
      },
      {
        id: "53-2031.00",
        title: "Flight Attendants",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/53-2031.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/53-2031.00",
        questions: [
          {"prompt": "Flight attendants help travelers find their seats and stow their _____.", "accept": ["bags", "luggage"]},
          {"prompt": "Flight attendants demonstrate seat belts and _____ masks.", "accept": ["oxygen"]},
          {"prompt": "On an emergency landing, attendants are prepared to help passengers _____.", "accept": ["evacuate"]},
        ]
      },
      {
        id: "49-3011.00",
        title: "Aircraft Mechanics",
        media: "https://cdn.careeronestop.org/OccVids/OccupationVideos/49-2091.00.mp4",
        source: "https://www.mynextmove.org/profile/summary/49-3011.00",
        questions: [
          {"prompt": "Aircraft mechanics service engines, brakes, and landing _____.", "accept": ["gear"]},
          {"prompt": "Mechanics inspect plane exteriors for corrosion and _____.", "accept": ["cracks"]},
          {"prompt": "One place an aircraft mechanic might work is in a _____ where airplanes are housed.", "accept": ["hangar", "hangars"]},
        ]
      },
    ]
  },
];
