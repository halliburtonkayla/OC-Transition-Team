// One recipe schema drives the lesson, grocery mapping and handwriting packet.
export const RECIPES = [{
 id:'rice-treat', title:'Microwave Rice Krispie Treat', servings:1, servingLabel:'1 individual treat',
 image:'assets/candy-counter/rice-treat.webp', budgetCents:2000,
 ingredients:[
  {id:'cereal',name:'Rice Krispies cereal',amount:'½ cup',fraction:[1,2],unit:'cup',product:'Rice Krispies Cereal',aisle:'05',package:'12 oz box',priceCents:429},
  {id:'marshmallows',name:'Mini marshmallows',amount:'⅓ cup',fraction:[1,3],unit:'cup',product:'Mini Marshmallows',aisle:'08',package:'10 oz bag',priceCents:249},
  {id:'butter',name:'Butter',amount:'¾ teaspoon',fraction:[3,4],unit:'teaspoon',product:'Butter',aisle:'04',package:'1 lb',priceCents:449}
 ],
 equipment:[{id:'bowl',name:'Microwave-safe bowl'},{id:'cups',name:'Measuring cups'},{id:'spoons',name:'Measuring spoons'},{id:'spoon',name:'Stirring spoon'},{id:'container',name:'Serving container'}],
 safety:[
  'Check ingredient labels and food allergies with your teacher before real cooking. Butter contains milk; cereal and marshmallow ingredients vary.',
  'An adult must supervise real microwave use. Use a microwave-safe bowl and no metal utensils in the microwave.',
  'Heat in short intervals, following your teacher and appliance instructions. Bowls and melted marshmallows can burn. Use dry oven mitts and adult help.',
  'Let the treat cool before touching or eating. Virtual practice does not show that you can use a real microwave independently.'
 ],
 directions:['Wash hands with soap and water for 20 seconds.','Gather the tools and ingredients.','Measure ¾ teaspoon butter.','Measure ⅓ cup mini marshmallows.','Combine butter and marshmallows in a microwave-safe bowl.','With adult supervision, microwave in short intervals and stir carefully until melted.','Measure ½ cup cereal.','Add cereal to the melted mixture.','Stir gently.','Transfer to a suitable container.','Allow to cool.','Clean up.']
}];
export const UPCOMING=['Hot cocoa','Pudding','Fruit parfait','Sandwiches','Trail mix','Simple breakfast'];
export const recipeById=id=>RECIPES.find(r=>r.id===id);
export const COOK_STEPS=[
 {id:'safety',title:'Plan for safe cooking',station:'kitchen',prompt:'Review the ingredient labels with an adult. Tap each safety reminder, then check your plan.',hint:'Real cooking always needs your teacher’s allergy check and supervision.'},
 {id:'hands',title:'Wash your hands',station:'sink',prompt:'Turn on the tap, add soap, rub for 20 seconds, rinse, and dry.',hint:'Start the tap and soap. Keep rubbing until the 20-second timer finishes.'},
 {id:'tools',title:'Open the cabinet and gather tools',station:'kitchen',prompt:'Open the cabinet. Pick up a microwave-safe bowl, measuring cups, measuring spoons, stirring spoon, and serving container.',hint:'Tap the cabinet door, then collect each tool.'},
 {id:'butter',title:'Measure ¾ teaspoon butter',station:'kitchen',prompt:'Choose a measuring spoon, scoop butter, then add it to the bowl. Try ¼ teaspoon three times.',hint:'¼ + ¼ + ¼ = ¾ teaspoon. You can also use ½ + ¼.'},
 {id:'marshmallows',title:'Measure ⅓ cup mini marshmallows',station:'kitchen',prompt:'Pick the ⅓ cup. Scoop mini marshmallows, then pour them into the bowl.',hint:'The ⅓ cup is smaller than the ½ cup. Level the cup before pouring.'},
 {id:'combine',title:'Combine butter and marshmallows',station:'kitchen',prompt:'Bring the ingredients together in the microwave-safe bowl. Stir gently three times.',hint:'Drag around the bowl or use the large Stir once control.'},
 {id:'supervision',title:'Ask an adult for microwave help',station:'microwave',prompt:'Practice asking: “Can you help me use the microwave safely?” Choose dry oven mitts.',hint:'This request is a practice action. Your teacher must supervise the real appliance.'},
 {id:'microwave',title:'Heat a little, then stir carefully',station:'microwave',prompt:'Open the microwave, put in the bowl with NO metal spoon, close the door, and run a short practice interval. Use mitts, remove, and stir. Repeat once.',hint:'Use the door and bowl controls. Each short interval must be followed by stirring. The game timer is not a real cooking time.'},
 {id:'cereal',title:'Measure ½ cup cereal',station:'kitchen',prompt:'Pick the ½ cup. Scoop cereal and pour it into the bowl.',hint:'½ cup is one half of a full cup. Use the ½ cup once.'},
 {id:'stir',title:'Stir gently',station:'kitchen',prompt:'Move the spoon around the bowl eight times until the cereal is coated.',hint:'Drag around the bowl or press Stir once eight times. Take your time.'},
 {id:'transfer',title:'Transfer to your container',station:'kitchen',prompt:'Pick up the bowl and tip the mixture into the serving container.',hint:'Use the container on the counter. Ask for help with hot or sticky food.'},
 {id:'cool',title:'Allow the treat to cool',station:'kitchen',prompt:'Set the container on the cooling mat and wait for the practice timer.',hint:'The game uses a short practice wait. In real life, an adult checks that food is safe to touch and eat.'},
 {id:'dishes',title:'Wash and put away your dishes',station:'sink',prompt:'Wash the bowl, measuring cup, measuring spoon, and stirring spoon in the sink.',hint:'Use dish soap and water. Wash each tool, then place it in the drying area.'},
 {id:'wipe',title:'Clean your workstation',station:'cleaning',prompt:'Choose a clean cloth. Wipe all five counter sections and put the supplies away.',hint:'Drag across the marked counter or use Wipe next section. Never mix cleaning products.'}
];
export const LAUNDRY_STEPS=[
 {id:'sort',title:'Sort by color',prompt:'Put the white shirt in Lights, the blue jeans in Darks, and the pink towel in Colors.'},
 {id:'labels',title:'Read the care labels',prompt:'Open each care label. These practice items allow a cold wash; use low heat for the dryer.'},
 {id:'load',title:'Load the washer',prompt:'Move the three sorted items into the washer. Leave space for clothes to move.'},
 {id:'settings',title:'Choose the wash settings',prompt:'Set COLD water and NORMAL wash to match these care labels.'},
 {id:'detergent',title:'Measure detergent',prompt:'Read the bottle label: this practice load uses line 1. Fill the cap to line 1 and pour into the dispenser. Detergent is not food.'},
 {id:'wash',title:'Run the washing machine',prompt:'Close the washer door and start the practice cycle.'},
 {id:'dryer',title:'Move to the dryer',prompt:'Move the clothes, clean the lint filter, and select LOW heat.'},
 {id:'dry',title:'Run the dryer',prompt:'Close the dryer door and start the practice cycle.'},
 {id:'fold',title:'Fold the clean clothes',prompt:'Bring each side in, fold the bottom up, then finish the fold.'},
 {id:'away',title:'Put clothes away',prompt:'Put the folded shirt, jeans, and towel in their labeled spaces.'}
];
export const HOUSE_TASKS={
 dishes:{title:'Wash dishes',object:'sink',steps:['Choose dish soap and a sponge','Wash the bowl','Rinse with clean water','Place on the drying rack'],actions:['soap','scrub','rinse','rack']},
 counters:{title:'Clean counters',object:'cloth',steps:['Choose a clean cloth','Use the teacher-approved cleaner as labeled','Wipe the surface','Store the cleaner safely'],actions:['cloth','label','wipe','store']},
 cabinets:{title:'Organize cabinets',object:'cabinet',steps:['Open the cabinet','Group measuring tools together','Stack bowls safely','Close the cabinet'],actions:['open','tools','bowls','close']},
 groceries:{title:'Put groceries away',object:'fridge',steps:['Check the butter label','Put butter in the refrigerator','Put cereal in a dry cabinet','Close the packages'],actions:['label','chill','dry','close']},
 bed:{title:'Make a bed',object:'bed',steps:['Smooth the fitted sheet','Pull the cover up','Fold the top edge','Place the pillow'],actions:['sheet','cover','fold','pillow']},
 supplies:{title:'Sort household supplies',object:'cleaning',steps:['Separate food from cleaning products','Read the cleaning label','Keep chemicals in their labeled containers','Store out of children’s reach'],actions:['separate','label','container','store']},
 safety:{title:'Spot and fix hazards',object:'cleaning',steps:['Keep people away from the floor spill','Ask an adult for help','Choose a cloth for water only','Never mix bleach and other cleaners'],actions:['guard','help','cloth','separate']}
};
export const OBSERVATIONS=['Washed hands','Gathered tools','Identified ingredients','Measured ingredients','Followed directions','Requested help appropriately','Followed safety procedures','Completed cleanup'];
