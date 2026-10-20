/* Shared, deterministic classroom shop rules. Used by the browser and service. */
(function(g){
'use strict';
const MENU=[
 ['coffee','Coffee','☕',3],['donut','Donut','🍩',2],['cupcake','Cupcake','🧁',3],
 ['muffin','Muffin','🫐',3],['sandwich','Chicken sandwich','🥪',6],['milkshake','Milkshake','🥤',4],
 ['soda','Soda','🥤',2],['slushie','Slushie','🧊',3],['fruit','Fruit cup','🍓',3],
 ['cake-pop','Cake pop','🍭',2],['filled-cake','Filled cake','🍰',4],['croissant','Croissant','🥐',3]
].map(([id,name,icon,price])=>({id,name,icon,price}));
const SPECIES={dog:'🐕',cat:'🐈',rabbit:'🐇',bird:'🦜'};
const copy=v=>JSON.parse(JSON.stringify(v));
const cents=v=>Math.round(Number(v)*100)/100;
function fail(message){throw Error(message);}
function text(v,max=240){return String(v??'').trim().slice(0,max);}
function num(v,min=0,max=12){const n=Number(v);if(!Number.isInteger(n)||n<min||n>max)fail('Choose a whole number from '+min+' to '+max+'.');return n;}
function amount(v){const n=Number(v);if(!Number.isFinite(n)||n<0||n>100000)fail('Enter a valid amount.');return cents(n);}
function config(shop){const c=g.TTShopCatalog[shop];if(!c)fail('Choose a student business.');return c;}
function initial(shop){const c=config(shop);return {version:1,shop,open:true,cash:c.cash,sales:0,spent:0,stock:Object.fromEntries(Object.entries(c.stock).map(([k,v])=>[k,v.start])),prices:Object.fromEntries(MENU.map(m=>[m.id,m.price])),petPrice:40,orders:[],receipts:[],log:[],duties:{},assignments:{},training:{},shifts:{},ad:'',seen:[]};}
function normalizeLine(raw){const item=MENU.find(m=>m.id===raw.item);if(!item)fail('Choose something from the original Cool Vibes menu.');const mods={};
 const allowed={sandwich:['chicken','lettuce','tomatoes','mayonnaise'],donut:['donut-glaze','sprinkles','frosting-filling'],coffee:['milk','flavor-syrup','whipped-cream'],milkshake:['flavor-syrup','whipped-cream'],slushie:['flavor-syrup'],fruit:['strawberries','grapes','pineapple'],cupcake:['frosting','sprinkles'],muffin:['blueberries'], 'cake-pop':['sprinkles'],'filled-cake':['frosting-filling'],croissant:['butter']};
 for(const k of allowed[item.id]||[])mods[k]=num(raw.mods?.[k]??1,0,k==='chicken'?3:3);
 if(item.id==='sandwich'&&mods.chicken<1)fail('A chicken sandwich needs at least one chicken portion.');
 if(item.id==='fruit'&&!Object.values(mods).some(Boolean))fail('Choose at least one fruit.');
 return {item:item.id,qty:num(raw.qty,1,12),mods,size:['Small','Regular','Large'].includes(raw.size)?raw.size:'Regular',temp:raw.temp==='Iced'?'Iced':'Hot',bread:raw.bread==='Croissant'?'Croissant':'Bun',notes:text(raw.notes,300)};
}
function total(s,lines){return cents(lines.reduce((n,l)=>n+(s.prices[l.item]+(l.size==='Large'?1:0))*l.qty,0));}
function recipe(line){
 const l=normalizeLine(line),m=l.mods,ingredients={},steps=[];
 const step=(id,label,icon='✋')=>steps.push({id,label,icon});
 const use=(key,n=1)=>{if(n>0)ingredients[key]=(ingredients[key]||0)+n;};
 step('wash','Wash hands & sanitize the worktop','🧼');
 if(l.item==='sandwich'){
  use(l.bread==='Croissant'?'croissant-dough':'sandwich-buns');use('chicken',m.chicken);use('lettuce',m.lettuce);use('tomatoes',m.tomatoes);use('mayonnaise',m.mayonnaise);
  if(l.bread==='Croissant'){step('bread-roll','Roll the croissant dough','🥐');step('bread-bake','Bake the croissant','🔥');}
  step('bread-bottom','Place the bottom '+l.bread.toLowerCase(),'🍞');step('cook-chicken','Cook chicken at the grill','🍳');
  for(const [k,n]of Object.entries(m))if(n)step(k,'Add '+n+' × '+k.replaceAll('-',' '),k==='chicken'?'🍗':k==='lettuce'?'🥬':k==='tomatoes'?'🍅':'🥄');
  step('bread-top','Place the top '+l.bread.toLowerCase(),'🍞');step('wrap','Wrap, label & check the ticket','📦');
 }else if(['donut','cupcake','muffin','filled-cake'].includes(l.item)){
  for(const k of ['flour','sugar','eggs','milk']){use(k);step('measure-'+k,(k==='eggs'?'Crack the egg':'Measure '+k),{flour:'🌾',sugar:'🥄',eggs:'🥚',milk:'🥛'}[k]);}
  step('mix','Stir the ingredients into '+(l.item==='donut'?'dough':'batter'),'🥣');
  if(l.item==='donut'){
   use('cooking-oil');step('knead','Knead the dough','🤲');step('roll','Roll out the dough','🪵');step('cut','Cut out the donut & center','⭕');step('fry','Lower into the virtual fryer with tongs','🍳');step('flip','Turn the donut to cook both sides','🔄');step('drain','Lift out & drain on the cooling rack','🕸️');
   for(const k of ['donut-glaze','frosting-filling','sprinkles'])if(m[k]){use(k,m[k]);step(k,'Add '+m[k]+' × '+k.replaceAll('-',' '),k==='sprinkles'?'🌈':'🍯');}
  }else{
   if(l.item==='muffin'&&m.blueberries){use('blueberries',m.blueberries);step('blueberries','Fold in '+m.blueberries+' × blueberries','🫐');}
   step('portion','Portion into the baking pan','🧁');step('bake','Bake in the oven','🔥');step('cool','Move to the cooling rack','🕸️');
   for(const k of ['frosting','sprinkles','frosting-filling'])if(m[k]){use(k,m[k]);step(k,'Add '+m[k]+' × '+k.replaceAll('-',' '),'🎨');}
  }
  step('box','Box, label & compare with the ticket','📦');
 }else if(l.item==='croissant'){
  use('croissant-dough');use('butter',m.butter);step('roll','Roll out the croissant dough','🪵');if(m.butter)step('butter','Spread '+m.butter+' × butter','🧈');step('fold','Fold & roll into a crescent','🥐');step('bake','Bake until golden','🔥');step('box','Bag, label & check the ticket','📦');
 }else if(l.item==='cake-pop'){
  use('cake-cake-base');use('frosting');use('candy-melts');use('cake-pop-sticks');use('sprinkles',m.sprinkles);
  [['crumble','Crumble the cake','🍰'],['bind','Mix with frosting','🥣'],['roll','Roll into a cake ball','🟤'],['stick','Insert the cake-pop stick','🍭'],['dip','Dip in melted candy coating','🍫']].forEach(x=>step(...x));if(m.sprinkles)step('sprinkles','Add '+m.sprinkles+' × sprinkles','🌈');step('set','Let the coating set & package','📦');
 }else if(l.item==='fruit'){
  use('cups');for(const k of ['strawberries','grapes','pineapple'])if(m[k]){use(k,m[k]);step('wash-'+k,'Wash the '+k,'🚿');step(k,'Add '+m[k]+' × '+k,k==='strawberries'?'🍓':k==='grapes'?'🍇':'🍍');}step('lid','Add a lid & label the cup','🥡');
 }else{
  use('cups');use('straws');step('cup','Choose a '+l.size.toLowerCase()+' cup','🥤');
  if(l.item==='coffee'){use('coffee');step('coffee','Measure the coffee','☕');step('brew','Brew the coffee','♨️');if(l.temp==='Iced'){use('ice');step('ice','Fill with ice','🧊');}step('pour','Pour the coffee','🫗');}
  if(l.item==='milkshake'){use('ice-cream');use('milk');step('ice-cream','Scoop the ice cream','🍨');step('milk','Measure & pour milk','🥛');}
  if(l.item==='slushie'){use('ice');step('ice','Load crushed ice','🧊');}
  if(l.item==='soda'){use('soda');use('ice');step('ice','Add ice','🧊');step('soda','Dispense the soda','🥤');}
  for(const k of ['milk','flavor-syrup'])if(m[k]){use(k,m[k]);step(k,'Add '+m[k]+' × '+k.replaceAll('-',' '),k==='milk'?'🥛':'🍓');}
  if(['slushie','milkshake'].includes(l.item))step('blend','Blend until smooth','🌪️');
  if(m['whipped-cream']){use('whipped-cream',m['whipped-cream']);step('whipped-cream','Top with '+m['whipped-cream']+' × whipped cream','☁️');}
  step('lid','Add lid, straw & order label','🥤');
 }
 return {steps,ingredients};
}
function petTasks(p){const t=['check-in','water','feed'];if(p.species==='dog')t.push('walk');t.push('play','clean');if(p.bath)t.push('bath');if(p.brush)t.push('brush');t.push('owner-update');return t;}
function log(s,a,message,now){s.log.unshift({at:now,by:text(a.actor,50)||'Team',message});s.log=s.log.slice(0,250);}
function needStock(s,items){for(const[k,n]of Object.entries(items))if((s.stock[k]||0)<n)fail('Not enough '+(config(s.shop).stock[k]?.name||k)+'. Open Inventory & order more.');}
function consume(s,items){needStock(s,items);for(const[k,n]of Object.entries(items))s.stock[k]-=n;}
function reduce(previous,action,requestId,now=Date.now()){
 const s=copy(previous),a=action||{},c=config(s.shop);if(s.seen.includes(requestId))return s;if(!text(requestId,100))fail('Request needs an ID.');
 const order=()=>{const o=s.orders.find(o=>o.id===a.orderId);if(!o)fail('Order not found.');return o;};
 switch(a.type){
 case'purchase':{const item=c.stock[a.item];if(!item)fail('Choose an item from your supply list.');const packs=num(a.packs,1,20),cost=cents(item.cost*packs);if(cost>s.cash)fail('Your business needs '+(cost-s.cash).toFixed(2)+' more classroom dollars for that purchase.');s.cash=cents(s.cash-cost);s.spent=cents(s.spent+cost);s.stock[a.item]=(s.stock[a.item]||0)+item.pack*packs;const receipt={id:requestId,at:now,item:a.item,name:item.name,packs,units:item.pack*packs,total:cost,by:text(a.actor,50)};s.receipts.unshift(receipt);s.receipts=s.receipts.slice(0,100);log(s,a,'Purchased '+packs+' pack(s) of '+item.name+' for $'+cost.toFixed(2),now);break;}
 case'new-order':{
  if(!s.open)fail('The shop is closed. Ask the manager to open it.');if(s.orders.filter(o=>!['done','cancelled'].includes(o.status)).length>=60)fail('Finish some waiting orders before adding more.');
  const base={id:requestId,at:now,customer:text(a.customer,50)||'Practice customer',status:'waiting',paid:false,notes:text(a.notes,300),total:0};
  if(c.kind==='cafe'){
   if(!Array.isArray(a.lines)||!a.lines.length||a.lines.length>24)fail('Add between 1 and 24 menu items.');base.lines=a.lines.map(normalizeLine);base.total=total(s,base.lines);base.work=base.lines.map(()=>0);
  }else if(c.kind==='pets'){
   if(!Array.isArray(a.pets)||!a.pets.length||a.pets.length>8)fail('Register between 1 and 8 pets.');base.pets=a.pets.map(p=>{const species=p.species;if(!SPECIES[species])fail('Choose a dog, cat, rabbit or bird.');const name=text(p.name,40);if(!name)fail('Give each pet a name.');return {name,species,food:text(p.food,50)||species+' food',portions:num(p.portions,1,3),walkMinutes:num(p.walkMinutes??15,5,60),feedingTime:text(p.feedingTime,40)||'At the next meal',contact:text(p.contact,60),special:text(p.special,180),bath:!!p.bath,brush:!!p.brush,done:[],space:null};});base.total=cents(s.petPrice*base.pets.length);
  }else fail('Use the supply counter for this business.');s.orders=s.orders.filter(o=>!['done','cancelled'].includes(o.status)).concat(s.orders.filter(o=>['done','cancelled'].includes(o.status)).slice(-150));s.orders.push(base);log(s,a,'New order from '+base.customer,now);break;
 }
 case'cancel-order':{const o=order();if(o.paid||o.status!=='waiting')fail('Only unpaid waiting orders can be cancelled.');o.status='cancelled';log(s,a,'Cancelled unpaid order for '+o.customer,now);break;}
 case'payment':{
  const o=order();if(o.paid||o.status!=='waiting')fail('That ticket has already been handled.');if(!a.confirmed)fail('Repeat the order and confirm the special instructions first.');
  if(c.kind==='cafe'){
   const ring=a.ring||{};const expected={};for(const l of o.lines)expected[l.item]=(expected[l.item]||0)+l.qty;
   if(Object.keys(ring).some(k=>Number(ring[k])&&!expected[k])||Object.entries(expected).some(([k,v])=>Number(ring[k])!==v))fail('The register does not match the ticket. Check each item and quantity.');
  }else if(num(a.petCount,1,8)!==o.pets.length)fail('Count every pet on the registration form.');
  if(a.method!=='Card'&&a.method!=='Cash')fail('Choose cash or card.');if(a.method==='Cash'){const tender=amount(a.tender),change=amount(a.change);if(tender<o.total)fail('The cash given is less than the amount due.');if(cents(tender-o.total)!==change)fail('Check the change: cash given minus total due.');}
  o.paid=true;o.status='working';o.method=a.method;o.cashier=text(a.actor,50);o.paidAt=now;s.cash=cents(s.cash+o.total);s.sales=cents(s.sales+o.total);log(s,a,'Paid ticket for '+o.customer+' · $'+o.total.toFixed(2),now);break;
 }
 case'complete-item':{
  const o=order();if(!o.paid||o.status!=='working')fail('The cashier must take payment before preparation.');const i=num(a.line,0,o.lines.length-1),l=o.lines[i];if(o.work[i]>=l.qty)fail('This item is already complete.');if(num(a.unit,0,12)!==o.work[i])fail('A teammate has already completed this portion. Open the next portion.');const r=g.TTBusinessCore.recipe(l);if(JSON.stringify(a.steps)!==JSON.stringify(r.steps.map(s=>s.id)))fail('Finish each preparation step in order.');consume(s,r.ingredients);o.work[i]++;if(o.work.every((n,i)=>n===o.lines[i].qty))o.status='ready';log(s,a,'Prepared '+MENU.find(m=>m.id===l.item).name+' for '+o.customer,now);break;
 }
 case'pet-task':{
  const o=order();if(!o.paid||!['working','ready'].includes(o.status))fail('Check the pet-care payment at the register first.');const p=o.pets[num(a.pet,0,o.pets.length-1)],task=a.task;
  if(!petTasks(p).includes(task)||p.done.includes(task))fail('Choose a care task that is still waiting.');if(task!=='check-in'&&!p.done.includes('check-in'))fail('Complete check-in before animal care.');
  if(task==='check-in'){
   if(!a.verified)fail('Read the owner instructions and confirm the emergency contact.');if(p.special&&!a.managerChecked)fail('Ask the manager to review the special care instructions.');const used=s.orders.filter(x=>!['done','cancelled'].includes(x.status)).flatMap(x=>x.pets||[]).filter(x=>x.done.includes('check-in')).length;
   if(used>=(s.stock['pet-crates-2']||0)+(s.stock['portable-playpen']||0))fail('All pet spaces are occupied. Order another crate or playpen, or finish a pickup.');p.space=used+1;
  }
  if(task==='feed'){if(a.food!==p.food||num(a.portions,1,3)!==p.portions)fail('Match this pet’s food label and portion amount to the owner instructions.');consume(s,{'starter-pet-food':p.portions});}
  if(task==='water'&&!a.bowlClean)fail('Wash the bowl before filling fresh water.');
  if(task==='walk'){needStock(s,{'leashes-4':1,'collars-4':1});if(!a.leashed||JSON.stringify(a.route)!==JSON.stringify(['gate','path','potty','home']))fail('Attach the leash, use the safe route, clean up and return through the gate.');consume(s,{'waste-bags':1});}
  if(task==='play'){needStock(s,{'pet-toys':1});if(!a.safePlay)fail('Choose supervised indoor exercise with an appropriate toy.');}
  if(task==='clean'){consume(s,{'waste-bags':1});if(!a.cleaned)fail('Remove waste, wash the bowl and reset clean bedding.');}
  if(task==='bath'){needStock(s,{'grooming-kit':1});if(!a.gentle)fail('Check water, use pet shampoo, rinse and dry gently.');consume(s,{'pet-shampoo':1});}
  if(task==='brush'){needStock(s,{'brushes-combs':1});if(!a.gentle)fail('Use gentle brushing and stop if the animal shows discomfort.');}
  if(task==='owner-update'&&text(a.update,160).length<5)fail('Write a short update about this pet’s care.');if(task==='owner-update')p.update=text(a.update,160);
  p.done.push(task);if(o.pets.every(p=>petTasks(p).every(t=>p.done.includes(t))))o.status='ready';log(s,a,p.name+': '+task.replaceAll('-',' '),now);break;
 }
 case'handoff':{const o=order();if(o.status!=='ready')fail('Finish every item or care task before pickup.');if(text(a.customer).toLowerCase()!==o.customer.toLowerCase())fail('Check the customer name against the ticket.');o.status='done';o.completedAt=now;log(s,a,'Completed pickup for '+o.customer,now);break;}
 case'open':s.open=!!a.open;log(s,a,s.open?'Opened the shop':'Closed new orders; finish the current queue',now);break;
 case'prices':{if(c.kind==='cafe'){for(const m of MENU)if(a.prices?.[m.id]!==undefined)s.prices[m.id]=amount(a.prices[m.id]);}else s.petPrice=amount(a.price);log(s,a,'Updated classroom menu prices',now);break;}
 case'assign':{const station=text(a.station,50),person=text(a.person,50);if(!station||!person)fail('Choose a worker and station.');s.assignments[station]=person;log(s,a,person+' assigned to '+station,now);break;}
 case'duty':{const key=text(a.key,100),note=text(a.note,300);if(!key||note.length<3)fail('Add a short note about what you did.');s.duties[key]={at:now,by:text(a.actor,50),note};log(s,a,'Manager task: '+note,now);break;}
 case'ad':{s.ad=text(a.message,180);if(!s.ad)fail('Write a customer message.');log(s,a,'Published the shop’s classroom advertisement',now);break;}
 case'training':{const actor=text(a.actor,50),role=text(a.role,50);if(!actor||!role)fail('Choose a worker and role.');s.training[actor+':'+role]={at:now};log(s,a,'Completed '+role+' training',now);break;}
 case'shift-start':{const actor=text(a.actor,50),role=text(a.role,50);if(!s.training[actor+':'+role])fail('Complete the short training for this role first.');if(s.shifts[actor]?.active)fail('You are already clocked in.');s.shifts[actor]={active:true,role,startedAt:now,startSales:s.sales,startSpent:s.spent};log(s,a,'Clocked in as '+role,now);break;}
 case'shift-end':{const shift=s.shifts[text(a.actor,50)];if(!shift?.active)fail('Clock in before ending a shift.');shift.active=false;shift.endedAt=now;shift.sales=cents(s.sales-shift.startSales);shift.supplies=cents(s.spent-shift.startSpent);log(s,a,'Clocked out; shift report saved',now);break;}
 default:fail('That work task is unavailable.');
 }
 s.seen.push(requestId);s.seen=s.seen.slice(-150);return s;
}
g.TTBusinessCore={MENU,SPECIES,initial,reduce,recipe,petTasks,normalizeLine,total,config,cents};
if(typeof module!=='undefined')module.exports=g.TTBusinessCore;
})(globalThis);
