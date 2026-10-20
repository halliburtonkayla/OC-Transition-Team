/* Classroom operations: banking, timed shifts, staffing and room upkeep.
   Shares the same reducer in solo practice and the classroom service. */
(function(g){
'use strict';
const C=g.TTBusinessCore,baseReduce=C.reduce,baseInitial=C.initial,round=C.cents,clone=x=>JSON.parse(JSON.stringify(x));
const fail=m=>{throw Error(m);};
const cash=v=>{const n=Number(v);if(!Number.isFinite(n)||n<0||n>100000)fail('Enter a valid classroom dollar amount.');return round(n);};
const cleanText=(v,n=240)=>String(v??'').trim().slice(0,n);
const cleaning={lobby:['wet-sign','pickup-trash','wipe-tables','sweep','mop','reset'],restroom:['gloves','wet-sign','remove-trash','clean-surfaces','refill-soap','mop','wash-hands'],supply:['sort','label','shelve','sweep','audit'],pantry:['check-dates','rotate-stock','shelve','wipe-shelves','audit'],garage:['secure-bay','return-tools','remove-waste','sweep','audit'],pens:['secure-animal','remove-waste','clean-surfaces','replace-bedding','wash-bowls','audit']};
const cleanLabels={'wet-sign':'Put out the wet-floor sign','pickup-trash':'Pick up lobby litter','wipe-tables':'Wipe and sanitize tables',sweep:'Sweep the floor',mop:'Mop the floor',reset:'Reset chairs and tables',gloves:'Put on cleaning gloves','remove-trash':'Bag and remove waste','clean-surfaces':'Clean and sanitize surfaces','refill-soap':'Refill soap and paper supplies','wash-hands':'Wash hands after cleaning',sort:'Sort supplies into their groups',label:'Check shelf labels',shelve:'Put each item on its shelf',audit:'Inspect the finished room','check-dates':'Check dates and package condition','rotate-stock':'Move older usable stock to the front','wipe-shelves':'Wipe the shelves','secure-bay':'Make sure the bay is safely clear','return-tools':'Return tools to the rack','remove-waste':'Remove and dispose of waste','secure-animal':'Move the animal safely to a secure pen','replace-bedding':'Put in clean bedding','wash-bowls':'Wash food and water bowls'};
function ensure(s){
 s.bank=s.bank||{savings:0,ownerPay:{},ledger:[],bills:[]};
 s.finance=s.finance||{revenue:0,cogs:0,wages:0,overhead:0,waste:0,ownerDraw:0,training:0};
 s.staff=s.staff||{};s.deliveries=s.deliveries||[];s.pantry=s.pantry||{};s.rooms=s.rooms||{};s.audit=s.audit||[];s.issues=s.issues||[];
 if(!s.day)s.day={active:false,minute:0,duration:300,startedAt:0,lastEvent:0,lastMess:0,cleanInterval:60,number:0};
 for(const room of ['lobby','restroom','supply','pantry','garage','pens'])if(!s.rooms[room])s.rooms[room]={mess:0,lastClean:0,inspectedAt:0};
 if(!s.tirePrices)s.tirePrices=Object.fromEntries((g.TTTireServices||[]).map(x=>[x.id,x.price]));
 return s;
}
function note(s,a,msg,now,details={}){const row={at:now,minute:s.day?.minute||0,day:s.day?.number||0,by:cleanText(a.actor,50)||'Team',message:msg,...details};s.audit.push(row);s.audit=s.audit.slice(-5000);s.log.unshift(row);s.log=s.log.slice(0,250);}
function ledger(s,type,amount,memo,by,now,extra={}){s.bank.ledger.push({id:extra.id||String(now)+'-'+s.bank.ledger.length,at:now,type,amount:round(amount),memo,by,checking:s.cash,savings:s.bank.savings,...extra});s.bank.ledger=s.bank.ledger.slice(-5000);}
function earn(s,o,a,method,now){s.cash=round(s.cash+o.total);s.sales=round(s.sales+o.total);s.finance.revenue=round(s.finance.revenue+o.total);ledger(s,'sale',o.total,'Customer payment · '+o.customer,a.actor,now,{orderId:o.id});o.paid=true;o.method=method;o.cashier=a.actor;o.paidAt=now;}
function available(s,key){return (s.stock[key]||0)-(s.pantry[key]?.expired||0)-s.deliveries.filter(d=>!d.received&&d.item===key).reduce((n,d)=>n+d.units,0);}
function cost(s,key,n){const item=C.config(s.shop).stock[key];return item?item.cost/item.pack*n:0;}
function needs(s,items){for(const[k,n]of Object.entries(items))if(available(s,k)<n)fail('Not enough usable '+(C.config(s.shop).stock[k]?.name||k)+'. Check deliveries, dates and inventory.');}
function use(s,items){needs(s,items);for(const[k,n]of Object.entries(items))s.stock[k]-=n;}
function profit(s){ensure(s);return round(s.finance.revenue-s.finance.cogs-s.finance.wages-s.finance.overhead-s.finance.waste-s.finance.training);}
function unpaid(s){return round(s.bank.bills.filter(b=>!b.paid).reduce((n,b)=>n+b.amount,0)+Object.values(s.staff).reduce((n,e)=>n+Math.max(0,(e.earned||0)-(e.paid||0)),0));}
function expectedStorage(s,key){if(s.shop!=='cool-vibes')return /tire|oil|pad|filter|weight|kit/.test(key)?'Parts rack':'Supply room';return /milk|eggs|cream|chicken|lettuce|tomatoes|berries|grapes|pineapple|mayonnaise/.test(key)?'Refrigerated pantry':/flour|sugar|yeast|coffee|glaze|frosting|cake|syrup|oil|dough|butter|sprinkles|soda/.test(key)?'Dry pantry':'Supply room';}
function tireRecipe(job){
 const service=job.service,steps=[{id:'read-work-order',label:'Read the approved work order and vehicle card',tool:'work-card'},{id:'ppe',label:'Put on required shop PPE',tool:'ppe'},{id:'secure-vehicle',label:'Park securely, switch engine off and chock wheels',tool:'wheel-chocks'}];
 if(service==='new-tire'||service==='install')steps.push({id:'match-tire',label:'Match size, load and speed rating to the vehicle card',tool:job.tire});
 if(['new-tire','install','rotation','balance','repair','brake-check','brake-replace'].includes(service))steps.push({id:'lift-points',label:'Check the vehicle-specific lifting points and approved support plan',tool:'vehicle-manual'},{id:'loosen',label:'Loosen wheel fasteners before raising the vehicle',tool:'lug-wrench'},{id:'support',label:'Raise and support the vehicle using the approved shop procedure',tool:'jack-stands'},{id:'remove-wheel',label:'Remove the wheel at the supervised work bay',tool:'lug-wrench'});
 const operations={
  'new-tire':[['inspect-rim','Inspect the wheel and report damage','inspection-light'],['mount','Use the supervised tire machine to mount the matched tire','tire-machine'],['balance','Balance the assembly before fitting','wheel-balancer']],
  install:[['inspect-rim','Inspect tire and wheel condition','inspection-light'],['mount','Use the supervised tire machine','tire-machine'],['balance','Balance the assembly','wheel-balancer']],
  rotation:[['rotation-plan','Read the vehicle-specific rotation pattern','vehicle-manual'],['rotate','Move wheels to the positions shown on the vehicle card','wheel-cart']],
  balance:[['balance','Use the wheel balancer and match its weight instructions','wheel-balancer'],['weights','Apply the specified balancing weights','wheel-weights']],
  repair:[['inspect-repair','Have the supervisor check repair eligibility; do not repair unsafe damage','inspection-light'],['repair','Follow the approved inside inspection and repair procedure','patch-kits'],['leak-test','Complete the leak check','leak-test']],
  oil:[['oil-spec','Match oil and filter specifications to the vehicle manual','vehicle-manual'],['drain','Use the supervised bay and collect used oil in the drain pan','drain-pan'],['filter','Replace the specified filter and refill to the vehicle specification','oil-filters'],['oil-check','Verify oil level and check for leaks','dipstick']],
  'brake-check':[['brake-inspect','Inspect and measure brakes with a qualified supervisor','inspection-light'],['brake-report','Record findings; ask before authorizing extra work','work-card']],
  'brake-replace':[['brake-authorize','Confirm the qualified supervisor approved the correct parts and repair','work-card'],['brake-replace','Complete the supervised replacement procedure for this vehicle','brake-pads'],['brake-verify','Have the supervisor complete the brake-function check','inspection-light']]
 };
 for(const[id,label,tool]of operations[service]||[])steps.push({id,label,tool});
 if(service!=='oil')steps.push({id:'hand-thread',label:'Refit and hand-thread fasteners to prevent cross-threading',tool:'lug-wrench'},{id:'torque',label:'Use the vehicle’s torque specification and tightening pattern',tool:'torque-wrench'},{id:'pressure',label:'Check cold tire pressure against the door placard',tool:'tire-gauge'});
 steps.push({id:'final-check',label:'Qualified supervisor checks the completed work and clears the bay',tool:'work-card'});return steps;
}
function tyreOrder(s,a,rid,now){
 const service=g.TTTireServices.find(x=>x.id===a.service);if(!service)fail('Choose a service from the 3K menu.');
 const tires=['tire-205-55-r16-91v','tire-215-60-r16-95h','tire-225-65-r17-102h'],tire=tires.includes(a.tire)?a.tire:tires[0],qty=Number(a.qty||1);if(!Number.isInteger(qty)||qty<1||qty>4)fail('Choose one to four tires.');
 if(!s.open&&!a.training)fail('The shop is in preparation mode. Start a practice shift for customer work.');
 if(s.orders.filter(o=>!['done','cancelled'].includes(o.status)).length>=60)fail('Finish some waiting work orders first.');
 return {id:rid,at:now,customer:cleanText(a.customer,50)||'Practice driver',vehicle:cleanText(a.vehicle,80)||'Classroom training vehicle',service:service.id,serviceName:service.name,tire,qty,placard:'Match the vehicle card: '+C.config(s.shop).stock[tire].name,pressure:32,total:round(s.tirePrices[service.id]*(service.id==='new-tire'?qty:1)),status:'waiting',authorized:false,paid:false,training:!!a.training,notes:cleanText(a.notes,300),steps:[]};
}
function handoffIfReady(s,o,actor,now){if(o.status==='ready'&&o.paid){o.status='done';o.completedAt=now;note(s,{actor},'Employee completed customer pickup for '+o.customer,now,{automated:true});}}
function simulate(s,now,rid){
 if(!s.day.active)return s;
 const previous=s.day.minute,minute=Math.min(480,Math.max(previous,Math.floor((now-s.day.startedAt)/(s.day.duration*1000)*480)));s.day.minute=minute;
 for(const e of Object.values(s.staff))if(e.active){const owed=round((e.dayBase||0)+Math.max(0,minute-e.startedMinute)/60*e.hourly);s.finance.wages=round(s.finance.wages+Math.max(0,owed-e.earned));e.earned=owed;}
 for(let m=(Math.floor(s.day.lastEvent/20)+1)*20;m<=minute;m+=20){s.day.minute=m;
  if(s.orders.filter(o=>!['done','cancelled'].includes(o.status)).length<16&&m<480&&s.open){const n=s.orders.filter(o=>o.simulatedDay===s.day.number).length+1,request=rid+'-arrival-'+m;let a;
   if(s.shop==='cool-vibes')a={type:'new-order',actor:'Practice customer',customer:'Café guest '+n,lines:[C.normalizeLine({item:n%3===0?'sandwich':n%3===1?'donut':'coffee',qty:n%4===0?2:1,mods:n%3===0?{lettuce:2,tomatoes:0,mayonnaise:1,chicken:1}:{}})],notes:n%4===0?'Please check my extra portions.':''};
   else if(s.shop==='the-zoo')a={type:'new-order',actor:'Practice customer',customer:'Pet owner '+n,pets:[{name:['Buddy','Luna','Clover','Sunny'][n%4]+' '+n,species:['dog','cat','rabbit','bird'][n%4],portions:1,food:['dog food','cat food','rabbit food','bird food'][n%4],walkMinutes:15,contact:'Practice front desk',special:n%5===0?'Quiet space; review with manager.':''}]};
   else if(s.shop==='3k-tire-shop'){const o=tyreOrder(s,{service:g.TTTireServices[(n-1)%g.TTTireServices.length].id,customer:'Driver '+n,tire:'tire-205-55-r16-91v',qty:1},request,now);o.simulatedDay=s.day.number;s.orders.push(o);note(s,{actor:'Practice customer'},'New tire-shop work order from '+o.customer,now,{automated:true});}
   if(a){try{s=reduce(s,a,request,now);s.orders[s.orders.length-1].simulatedDay=s.day.number;}catch{}}
  }
  for(const employeeId of Object.keys(s.staff)){
   const e=s.staff[employeeId];if(!e.active||e.paused)continue;
   e.turns=(e.turns||0)+1;const good=((e.turns*37+e.name.charCodeAt(0)*13)%100)/100<e.reliability;
   const addIssue=msg=>{if(!s.issues.some(i=>i.employee===e.id&&!i.resolved)){s.issues.push({id:rid+'-'+e.id+'-'+m,employee:e.id,name:e.name,station:e.station,message:msg,at:now,resolved:false});e.paused=true;note(s,{actor:e.name},msg+' · supervisor needed',now,{automated:true,quality:'needs-correction'});}};
   let action=null;
   if(e.station==='Cashier'||e.station==='Check-in'){
    const o=s.orders.find(o=>o.status==='waiting');if(o){if(!good){addIssue('Missed an order detail at the register');continue;}
     if(s.shop==='3k-tire-shop')action={type:'tire-check-in',orderId:o.id,verified:true};else{const ring={};for(const l of o.lines||[])ring[l.item]=(ring[l.item]||0)+l.qty;action={type:'payment',orderId:o.id,ring,confirmed:true,method:'Card',petCount:o.pets?.length};}}
    else{const ready=s.orders.find(o=>o.status==='ready');if(ready){if(!good){addIssue('Left a finished customer waiting at pickup');continue;}if(s.shop==='3k-tire-shop'&&!ready.paid)action={type:'tire-payment',orderId:ready.id,confirmed:true,method:'Card',service:ready.service,qty:ready.qty};else handoffIfReady(s,ready,e.name,now);}}
   }else if(e.station==='Food Preparation'){
    const o=s.orders.find(o=>o.status==='working'&&o.lines);if(o){if(!good){addIssue('Preparation did not match the ticket; needs a supervisor check');continue;}const i=o.lines.findIndex((l,i)=>o.work[i]<l.qty);if(i>=0)action={type:'complete-item',orderId:o.id,line:i,unit:o.work[i],steps:C.recipe(o.lines[i]).steps.map(x=>x.id)};}
   }else if(e.station==='Technician'){
    const o=s.orders.find(o=>o.status==='working'&&o.authorized&&o.service);if(o){if(!good){addIssue('Skipped a vehicle-card or final-check step');continue;}action={type:'tire-complete',orderId:o.id,steps:tireRecipe(o).map(x=>x.id),tire:o.tire,pressure:o.pressure,supervisor:true};}
   }else if(e.station==='Animal Care'){
    const o=s.orders.find(o=>o.status==='working'&&o.pets);if(o){const i=o.pets.findIndex(p=>C.petTasks(p).some(t=>!p.done.includes(t)));if(i>=0){const p=o.pets[i],task=C.petTasks(p).find(t=>!p.done.includes(t));if(!good){addIssue('Missed a pet care instruction or cleaning routine');continue;}action={type:'pet-task',orderId:o.id,pet:i,task,verified:true,managerChecked:!p.special,bowlClean:true,food:p.food,portions:p.portions,leashed:true,route:['gate','path','potty','home'],safePlay:true,cleaned:true,gentle:true,update:p.name+' received the care recorded on the care card.'};}}
   }else if(e.station==='Cleanup'){
    const room=Object.keys(s.rooms).filter(k=>s.rooms[k].mess>0).sort((a,b)=>(a==='restroom'?-1:1))[0];if(room){if(!good){addIssue('Left a dirty room or missed a scheduled cleaning check');continue;}action={type:'clean-room',room,steps:cleaning[room]};}
   }else if(e.station==='Inventory'){
    const delivery=s.deliveries.find(d=>!d.received);if(delivery){if(!good){addIssue('Put a delivery on the wrong shelf without checking it');continue;}action={type:'receive',deliveryId:delivery.id,quantity:delivery.units,storage:expectedStorage(s,delivery.item)};}
    else{const low=Object.keys(C.config(s.shop).stock).find(k=>C.config(s.shop).stock[k].consumable&&available(s,k)<=2);if(low){if(!good){addIssue('Missed a low-stock item');continue;}action={type:'purchase',item:low,packs:1};}}
   }
   if(action){try{s=reduce(s,{...action,actor:e.name,automated:true},rid+'-'+e.id+'-'+m,now);}catch(err){addIssue((err&&err.message)||'Could not complete assigned work');}}
  }
  s.day.lastEvent=m;
 }
 for(let m=(Math.floor(s.day.lastMess/30)+1)*30;m<=minute;m+=30){s.day.minute=m;
  s.rooms.lobby.mess=Math.min(6,s.rooms.lobby.mess+1);if(m%s.day.cleanInterval===0)s.rooms.restroom.mess=Math.min(6,s.rooms.restroom.mess+2);
  if(m%60===0){s.rooms.supply.mess=Math.min(5,s.rooms.supply.mess+1);if(s.shop==='3k-tire-shop')s.rooms.garage.mess=Math.min(5,s.rooms.garage.mess+1);if(s.shop==='the-zoo')s.rooms.pens.mess=Math.min(5,s.rooms.pens.mess+1);}
  if(s.shop==='the-zoo')for(const o of s.orders.filter(o=>o.pets&&!['done','cancelled','waiting'].includes(o.status)))for(const p of o.pets){if(!p.done.includes('check-in'))continue;for(const [task,interval]of [['clean',30],['water',60],['feed',240]]){const last=p.careTimes?.[task]??p.checkedInMinute??0;if(m-last>=interval&&p.done.includes(task)){p.done=p.done.filter(t=>t!==task);if(o.status==='ready')o.status='working';note(s,{actor:'Animal-care reminder'},p.name+' needs a repeat '+task+' check',now,{automated:true});}}}
  note(s,{actor:'Workday event'},'Upkeep check due · lobby'+(m%s.day.cleanInterval===0?' and restroom':''),now,{automated:true});
  if(m%120===0&&s.shop==='cool-vibes'){const eligible=Object.keys(s.stock).filter(k=>/milk|flour|lettuce|berries|chicken|eggs/.test(k)&&available(s,k)>1);const key=eligible[(m/120-1)%Math.max(1,eligible.length)];if(key){s.pantry[key]={...(s.pantry[key]||{}),expired:Math.min(2,s.stock[key]),checked:false};note(s,{actor:'Pantry check'},C.config(s.shop).stock[key].name+' has a damaged or expired practice batch to check',now,{automated:true});}}
  s.day.lastMess=m;
 }
 s.day.minute=minute;
 if(minute>=480){s.day.active=false;s.open=false;s.day.endedAt=now;note(s,{actor:'Shift clock'},'Eight-hour practice shift finished. Review work, pay bills and payroll, and export the data.',now,{automated:true});}
 return s;
}
function reduce(previous,a,rid,now=Date.now()){
 let s=ensure(clone(previous));if(s.seen.includes(rid))return s;
 const before=clone(s),logsBefore=s.log.length,actor=cleanText(a.actor,50)||'Team';
 const order=()=>{const o=s.orders.find(o=>o.id===a.orderId);if(!o)fail('Choose a work order.');return o;};
 let handled=true;
 switch(a.type){
 case'attempt':note(s,a,cleanText(a.activity,80)+': '+cleanText(a.choice,300),now,{quality:['correct','retry','support'].includes(a.quality)?a.quality:'practice',expected:cleanText(a.expected,180),station:cleanText(a.station,50),support:cleanText(a.support,80)});break;
 case'training-ticket':{
  if(s.orders.filter(o=>o.training&&!['done','cancelled'].includes(o.status)).length>=10)fail('Finish an existing training ticket first.');
  if(s.shop==='3k-tire-shop')s.orders.push(tyreOrder(s,{...a,training:true,service:a.service||'new-tire'},rid,now));
  else{const wasOpen=s.open;s.open=true;s=baseReduce(s,{type:'new-order',actor,customer:'Training desk · '+actor,lines:[C.normalizeLine({item:a.item||'donut',qty:1})],pets:[{name:'Buddy',species:'dog',food:'dog food',portions:1,walkMinutes:15,contact:'Training desk'}]},rid+'-ticket',now);s.open=wasOpen;s.orders[s.orders.length-1].training=true;}
  note(s,a,'Created a training ticket; no customer sales are added for this ticket',now,{training:true});break;
 }
 case'receive':{const d=s.deliveries.find(d=>d.id===a.deliveryId);if(!d||d.received)fail('This delivery is already put away.');if(Number(a.quantity)!==d.units)fail('Count the units on the delivery receipt again.');if(a.storage!==expectedStorage(s,d.item))fail('Choose the correct storage area for this delivery.');d.received=true;d.receivedBy=actor;d.receivedAt=now;note(s,a,'Counted and put away '+d.units+' '+C.config(s.shop).stock[d.item].name+' · '+a.storage,now);break;}
 case'pantry':{const key=a.item;if(!C.config(s.shop).stock[key])fail('Choose a pantry item.');s.pantry[key]=s.pantry[key]||{expired:0};const p=s.pantry[key];if(a.operation==='check'){p.checked=true;p.checkedAt=now;note(s,a,'Checked date and condition: '+C.config(s.shop).stock[key].name+(p.expired?' · expired / damaged units found':' · usable'),now);}else if(a.operation==='rotate'){if(p.expired)fail('Remove the expired or damaged units before rotating usable stock.');p.rotatedAt=now;note(s,a,'Rotated older usable stock to the front: '+C.config(s.shop).stock[key].name,now);}else if(a.operation==='discard'){const n=p.expired||0;if(!n)fail('This item has no expired practice units to discard.');s.stock[key]-=n;s.finance.waste=round(s.finance.waste+cost(s,key,n));p.expired=0;note(s,a,'Discarded '+n+' expired / damaged units of '+C.config(s.shop).stock[key].name,now);}else fail('Choose check, rotate or discard.');break;}
 case'clean-room':{const steps=cleaning[a.room];if(!steps||JSON.stringify(a.steps)!==JSON.stringify(steps))fail('Complete the cleaning routine in order.');use(s,{'cleaning-supplies':1});if(a.room==='restroom')use(s,{'paper-soap-refills':1});s.rooms[a.room].mess=0;s.rooms[a.room].lastClean=s.day.minute;s.rooms[a.room].cleanedAt=now;s.rooms[a.room].cleanedBy=actor;note(s,a,'Cleaned and inspected the '+a.room,now,{station:a.room,automated:!!a.automated});break;}
 case'inspect-room':{if(!s.rooms[a.room])fail('Choose a room.');s.rooms[a.room].inspectedAt=now;note(s,a,'Inspected '+a.room+': '+(s.rooms[a.room].mess?'cleaning needed':'clean and organized'),now,{station:a.room});break;}
 case'practice-mess':{if(!s.rooms[a.room])fail('Choose a room.');s.rooms[a.room].mess=Math.min(6,s.rooms[a.room].mess+2);note(s,a,'Started a '+a.room+' cleaning training task',now,{training:true});break;}
 case'bank-transfer':{const n=cash(a.amount);if(!n)fail('Enter an amount greater than zero.');if(a.direction==='to-savings'){if(n>s.cash)fail('Checking does not have enough money.');s.cash=round(s.cash-n);s.bank.savings=round(s.bank.savings+n);}else if(a.direction==='to-checking'){if(n>s.bank.savings)fail('Savings does not have enough money.');s.bank.savings=round(s.bank.savings-n);s.cash=round(s.cash+n);}else fail('Choose a transfer direction.');ledger(s,'transfer',a.direction==='to-savings'?-n:n,a.direction==='to-savings'?'Checking → savings':'Savings → checking',actor,now,{id:rid});note(s,a,'Transferred '+n.toFixed(2)+' between this business’s bank accounts',now);break;}
 case'pay-bill':{const b=s.bank.bills.find(b=>b.id===a.billId);if(!b||b.paid)fail('Choose an unpaid business bill.');if(s.cash<b.amount)fail('Checking does not have enough money to pay this bill.');s.cash=round(s.cash-b.amount);b.paid=true;b.paidAt=now;ledger(s,'bill',-b.amount,b.name,actor,now,{id:rid});note(s,a,'Paid '+b.name+' · $'+b.amount.toFixed(2),now);break;}
 case'payroll':{const e=s.staff[a.employee];if(!e)fail('Choose an employee.');const owed=round(e.earned-e.paid);if(owed<=0)fail('No unpaid wages for this employee yet.');if(s.cash<owed)fail('Checking does not have enough money for this payroll payment.');s.cash=round(s.cash-owed);e.paid=round(e.paid+owed);ledger(s,'payroll',-owed,'Wages · '+e.name,actor,now,{id:rid});note(s,a,'Paid employee wages to '+e.name+' · $'+owed.toFixed(2),now);break;}
 case'owner-pay':{const owner=cleanText(a.owner,50),n=cash(a.amount);if(!Object.keys(C.config(s.shop).owners).includes(owner))fail('Choose an owner of this business.');if(!n||n>Math.max(0,s.cash-unpaid(s)))fail('Set aside money for unpaid bills and wages before choosing owner pay.');s.cash=round(s.cash-n);s.bank.ownerPay[owner]=round((s.bank.ownerPay[owner]||0)+n);s.finance.ownerDraw=round(s.finance.ownerDraw+n);ledger(s,'owner-draw',-n,'Owner pay set aside · '+owner,actor,now,{id:rid});note(s,a,'Transferred '+n.toFixed(2)+' to '+owner+'’s owner-pay account; owner withdrawals do not change profit',now);break;}
 case'staff':{const p=g.TTShopStaff[s.shop+':'+a.employee];if(!p||a.decision!=='Hired')fail('Choose an applicant you hired after an interview.');const station=cleanText(a.station,40);if(!['Cashier','Food Preparation','Inventory','Cleanup','Animal Care','Check-in','Technician'].includes(station))fail('Choose a work station.');const old=s.staff[p.id];s.staff[p.id]={...p,active:true,station,hourly:10,earned:old?.earned||0,paid:old?.paid||0,startedMinute:old?.startedMinute??s.day.minute,dayBase:old?.dayBase??old?.earned??0,turns:old?.turns||0,paused:false};note(s,a,'Assigned hired employee '+p.name+' to '+station,now);break;}
 case'coach':{const issue=s.issues.find(i=>i.id===a.issueId&&!i.resolved);if(!issue)fail('Choose an unresolved employee issue.');if(cleanText(a.note,300).length<5)fail('Explain the instruction, correction or help you gave.');const e=s.staff[issue.employee];issue.resolved=true;issue.resolution=a.mode==='takeover'?'Manager took over':'Employee coached';issue.note=cleanText(a.note,300);if(e){e.paused=a.mode==='takeover';if(a.mode!=='takeover')e.reliability=Math.min(.98,e.reliability+.08);}note(s,a,issue.resolution+': '+issue.name+' · '+issue.note,now,{station:issue.station,supervision:true});break;}
 case'resume-employee':{const e=s.staff[a.employee];if(!e)fail('Choose an employee.');e.paused=false;note(s,a,'Returned '+e.name+' to '+e.station,now,{supervision:true});break;}
 case'start-day':{
  if(s.day.active)fail('A practice shift is already running.');const duration=Number(a.duration);if(![300,600].includes(duration))fail('Choose a five- or ten-minute practice shift.');
  s.day={active:true,minute:0,duration,startedAt:now,lastEvent:0,lastMess:0,cleanInterval:Number(a.cleanInterval)===30?30:60,number:s.day.number+1};s.open=true;
  for(const e of Object.values(s.staff)){e.startedMinute=0;e.dayBase=e.earned;e.paused=false;}
  for(const[id,name,amount]of [['lights','Lights / electricity',8],['phone','Business phone / internet',4],['water','Water service',3],['rent','Daily share of rent',20],['insurance','Daily share of insurance',5]]){s.bank.bills.push({id:s.day.number+'-'+id,name,amount,paid:false,day:s.day.number});s.finance.overhead=round(s.finance.overhead+amount);}
  note(s,a,'Started a '+duration/60+'-minute practice shift representing eight hours. Fictional daily bill allocations were recorded.',now);break;
 }
 case'tick':s=simulate(s,now,rid);break;
 case'end-day':{if(!s.day.active)fail('There is no active practice shift.');s=simulate(s,now,rid+'-final');s.day.active=false;s.open=false;s.day.endedAt=now;note(s,a,'Ended the practice shift early at '+s.day.minute+' simulated minutes',now);break;}
 case'tire-order':s.orders.push(tyreOrder(s,a,rid,now));note(s,a,'Created '+g.TTTireServices.find(x=>x.id===a.service).name+' work order',now);break;
 case'tire-check-in':{const o=order();if(o.status!=='waiting'||!a.verified)fail('Read the vehicle card and confirm the customer authorized this work.');o.authorized=true;o.status='working';note(s,a,'Checked in '+o.customer+' and confirmed the authorized work order',now);break;}
 case'tire-complete':{const o=order();if(o.status!=='working'||!o.authorized)fail('The service desk must authorize this work first.');if(JSON.stringify(a.steps)!==JSON.stringify(tireRecipe(o).map(x=>x.id)))fail('Follow every vehicle-service and final-check step.');if(['new-tire','install'].includes(o.service)&&a.tire!==o.tire)fail('The tire does not match the vehicle card.');if(o.service!=='oil'&&Number(a.pressure)!==o.pressure)fail('Match the practice door-placard pressure, not the tire sidewall maximum.');if(!a.supervisor)fail('A qualified supervisor must verify the completed vehicle work.');const used=o.service==='new-tire'?{[o.tire]:o.qty}:o.service==='repair'?{'patch-kits':1}:o.service==='balance'?{'wheel-weights':1}:o.service==='oil'?{'engine-oil':1,'oil-filters':1}:o.service==='brake-replace'?{'brake-pads':1}:{};use(s,used);o.steps=clone(a.steps);o.status='ready';note(s,a,'Completed '+o.serviceName+' and the supervised final check for '+o.customer,now,{automated:!!a.automated});break;}
 case'tire-payment':{const o=order();if(o.status!=='ready'||o.paid||!a.confirmed)fail('Complete service and verify the invoice before payment.');if(a.service!==o.service||Number(a.qty)!==o.qty)fail('Match the service and tire quantity on the invoice.');if(!['Cash','Card'].includes(a.method))fail('Choose cash or card.');if(a.method==='Cash'&&(cash(a.tender)<o.total||round(cash(a.tender)-o.total)!==cash(a.change)))fail('Check cash received and the correct change.');if(!o.training)earn(s,o,a,a.method,now);else{o.paid=true;o.method='Training';}note(s,a,(o.training?'Training invoice checked':'Invoice paid')+' for '+o.customer,now,{training:!!o.training});break;}
 case'tire-prices':{for(const service of g.TTTireServices)if(a.prices?.[service.id]!==undefined)s.tirePrices[service.id]=cash(a.prices[service.id]);note(s,a,'Updated the editable classroom service prices',now);break;}
 default:handled=false;
 }
 if(!handled){
  if(a.type==='open'&&a.open&&!s.day.active)fail('Start a practice shift before opening for customers. Interviews, training and preparation are ready now.');
  if(a.type==='complete-item'){const o=order(),l=o.lines[a.line];if(l)needs(s,C.recipe(l).ingredients);}
  if(a.type==='pet-task'&&a.task==='feed'){const o=order(),p=o.pets[a.pet];if(p)needs(s,{'starter-pet-food':p.portions});}
  if(a.type==='handoff'&&s.shop==='3k-tire-shop'&&!order().paid)fail('Collect payment before returning the vehicle.');
  s=baseReduce(s,a,rid,now);ensure(s);
  if(a.type==='payment'){
   const o=s.orders.find(o=>o.id===a.orderId);if(o.training){s.cash=before.cash;s.sales=before.sales;o.method='Training';note(s,a,'Training payment checked; no customer sale added',now,{training:true});}else{s.finance.revenue=round(s.finance.revenue+o.total);ledger(s,'sale',o.total,'Customer payment · '+o.customer,actor,now,{id:rid,orderId:o.id});}
  }
  if(a.type==='purchase'){const item=C.config(s.shop).stock[a.item],units=item.pack*Number(a.packs);s.deliveries.push({id:rid,item:a.item,units,packs:Number(a.packs),at:now,received:false});ledger(s,'inventory',-round(item.cost*Number(a.packs)),'Supply order · '+item.name,actor,now,{id:rid});}
  if(a.type==='pet-task'){const o=s.orders.find(o=>o.id===a.orderId),p=o?.pets?.[a.pet];if(p){p.careTimes=p.careTimes||{};p.careTimes[a.task]=s.day.minute;if(a.task==='check-in')p.checkedInMinute=s.day.minute;}}
  const fresh=s.log.filter(l=>!before.log.some(x=>x.at===l.at&&x.message===l.message&&x.by===l.by));
  for(const l of fresh.reverse())s.audit.push({...l,day:s.day.number,minute:s.day.minute,automated:!!a.automated});
 }
 if(!['pantry','tick','end-day'].includes(a.type))for(const[k,old]of Object.entries(before.stock)){const n=old-(s.stock[k]||0);if(n>0){const o=a.orderId?s.orders.find(o=>o.id===a.orderId):null;const category=o?.training?'training':a.type==='clean-room'?'overhead':'cogs';s.finance[category]=round(s.finance[category]+cost(s,k,n));}}
 s.audit=s.audit.slice(-5000);if(!s.seen.includes(rid))s.seen.push(rid);s.seen=s.seen.slice(-150);return s;
}
C.initial=shop=>{const s=baseInitial(shop);s.open=false;return ensure(s);};
C.reduce=reduce;C.ensure=ensure;C.profit=profit;C.unpaid=unpaid;C.available=available;C.expectedStorage=expectedStorage;C.cleaning=cleaning;C.cleanLabels=cleanLabels;C.tireRecipe=tireRecipe;
})(globalThis);
