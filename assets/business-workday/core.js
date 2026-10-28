/* Shared classroom workday rules. Browser actions are practice evidence, not a license or observed independence. */
(function (g) {
'use strict';
const C = g.TTBusinessCore, base = C.reduce, clone = x => JSON.parse(JSON.stringify(x));
const DENOMS = [10000,5000,2000,1000,500,100,25,10,5,1];
const shops = {
 '3k-tire-shop': {name:'3K Tire Shop',agency:'Automotive workplace safety inspector',image:'assets/student-businesses/3k-tire-shop-interior.webp',color:'#cb6a30'},
 'cool-vibes': {name:'Cool Vibes Café',agency:'Food safety inspector',image:'assets/student-businesses/rooms/cool-vibes-kitchen.webp',color:'#387c6b'},
 'the-zoo': {name:'The Zoo Pet Sitting',agency:'Animal care inspector',image:'assets/student-businesses/rooms/the-zoo-pens.webp',color:'#55754a'},
 'guardian-angel': {name:'Guardian Angel Childcare',agency:'Childcare safety inspector',image:'assets/student-businesses/guardian-angel-interior.webp',color:'#8a63b2'},
 'main-attraction': {name:'The Main Attraction',agency:'Salon sanitation inspector',image:'assets/main-attraction/salon.webp',color:'#ad527d'}
};
const fail = m => {throw Error(m);};
const text = (v,n=100) => String(v??'').trim().slice(0,n);
const matches = (a,b) => JSON.stringify(a)===JSON.stringify(b);
const step=(id,label,tool,mode='place',extra={})=>({id,label,tool,mode,targets:['work'],...extra});
const wipe=(label='Clean the whole work surface')=>step('sanitize',label,'Sanitizer','sweep');
const verify=(id,label,answer)=>step(id,label,'Work card','verify',{answer});
const choice=(id,label,answer,options)=>step(id,label,'Safety card','choice',{answer,options});
const hold=(id,label,tool)=>step(id,label,tool,'hold',{milliseconds:1800});
const place=(id,label,tool,targets=['work'])=>step(id,label,tool,'place',{targets});
const measure=(id,label,answer,unit)=>step(id,label,'Measuring tool','measure',{answer,unit});
const route=label=>step('route',label,'Leash / group route','route',{targets:['0','1','2','3','4']});
const ALLCELLS=Array.from({length:12},(_,i)=>String(i));
function init(s) {
 if(!s.workday)s.workday={version:1,day:0,phase:'opening',tasks:[],minute:0,active:false,certificate:null,roster:[],reports:[],events:[],bookings:[],clean:{},inspection:null,weekPaid:{},revision:0};
 const w=s.workday;if(!w.tasks.length&&w.phase==='opening')w.tasks=opening(s.shop);
 return w;
}
function task(id,title,station,visual,steps,extra={}) {
 return {id,title,station,visual,steps,progress:0,status:'waiting',due:0,deadline:720,by:[],mistakes:0,hints:0,...extra};
}
function opening(shop) {
 return [task('open-safety','Inspect exits, emergency plan & safe work area','Opening','safety',[
  choice('exit','The emergency exit is blocked. What do you do?','Clear the exit and tell the supervisor',['Clear the exit and tell the supervisor','Leave it until closing','Hide the obstruction']),
  place('ppe','Move the appropriate protective equipment onto the worker','Protective equipment'),
  verify('plan','Read the emergency plan. Who do you contact?','Supervisor')],{card:'Exit: keep clear. Wear the PPE for your station. Emergency contact: Supervisor.'}),
 task('open-waiting','Prepare reception and waiting area','Cleaning','clean',[place('sign','Place the wet-floor sign before cleaning','Wet-floor sign'),wipe(),place('reset','Return clean supplies and reset the area','Clean supplies')],{cleanRoom:'waiting'}),
 task('open-restroom','Clean bathroom & refill soap','Cleaning','clean',[place('gloves','Put on cleaning gloves','Gloves'),wipe('Clean every bathroom surface'),place('soap','Restock soap and paper supplies','Soap and paper'),hold('hands','Wash hands after removing gloves','Handwashing')],{cleanRoom:'bathroom'}),
 task('open-stock','Count supplies and inspect the shelf','Stockroom','stock',[measure('count','Count the delivery on the work card',6,'packages'),place('shelf','Move the dated packages to the labeled shelf','Dated supplies'),choice('dates','Which supplies belong at the front?','Older usable stock',['Older usable stock','Expired stock','Newest stock only'])],{card:'Opening delivery: 6 sealed, usable packages. Store older usable stock at the front.'})];
}
function cashStep(total,tender) {return step('cash','Count the change back to the customer','Cash drawer','cash',{total,tender});}
function invoice(id,title,total,tender,depends,due=0,extra={}) {
 return task(id,title,'Cash register','cash',[verify('invoice','Match the invoice number on the work card',id.toUpperCase()),cashStep(total,tender)],{total,tender,depends,due,card:'Invoice '+id.toUpperCase()+'. Cash payment only for this change-counting exercise.',...extra});
}
function cleaningTask(id,room,due=0) {return task(id,'Clean '+room,'Cleaning','clean',[place('sign','Place the wet-floor sign','Wet-floor sign'),place('trash','Move litter to the waste bin','Waste bag'),wipe('Wipe the complete '+room+' area'),hold('hands','Wash hands and check the finished area','Handwashing')],{due,deadline:Math.min(720,due+120),cleanRoom:room});}
function stockTask(s,id,due=0) {
 const key=Object.keys(C.config(s.shop).stock).find(k=>C.config(s.shop).stock[k].consumable)||Object.keys(s.stock)[0];
 const item=C.config(s.shop).stock[key];
 return task(id,'Receive & stock '+item.name,'Stockroom','stock',[verify('label','Match the item on the purchase order',item.name),measure('count','Count the units in the delivered pack',item.pack,'units'),place('shelve','Move the delivery to its labeled storage shelf','Labeled delivery'),choice('rotate','How should usable stock be rotated?','Oldest usable first',['Oldest usable first','Newest first','Mix with damaged stock'])],{due,itemKey:key,units:item.pack,cost:item.cost,card:item.name+' · '+item.pack+' units · classroom purchase cost $'+item.cost.toFixed(2)+'.'});
}
function buildDay(s,w,count) {
 const tasks=[];const add=t=>(tasks.push(t),t.id);
 if(s.shop==='3k-tire-shop') {
  for(const [n,oil] of [[1,false],[2,true]]) {
   const id='vehicle-'+n,due=(n-1)*100;
   add(task(id,oil?'Oil change · blue sedan':'Replace tire · blue sedan','Service bay',oil?'oil':'tire',[
    verify('authorize','Read the authorized service on the work order',oil?'Oil and filter change':'One tire replacement'),
    place('ppe','Fit eye protection and gloves','Protective equipment'),
    place('chock','Secure the engine-off vehicle and chock the wheels','Wheel chocks'),
    verify('manual','Match the vehicle-specific service card',oil?'5W-30 / F-21':'205/55 R16 91V'),
    choice('support','Before working under a vehicle, what is required?','Qualified supervisor and approved lifting/support plan',['Qualified supervisor and approved lifting/support plan','A jack by itself','A running engine']),
    ...(oil?[
     hold('cool','Wait for the simulated safe-temperature checkpoint','Temperature check'),
     place('pan','Position the drain pan under the drain point','Drain pan'),
     hold('drain','Collect used oil in the drain pan','Drain tool'),
     place('filter','Move the matching F-21 filter onto its mounting point','F-21 filter'),
     measure('fill','Measure the fictional vehicle-card refill quantity',4.5,'liters'),
     measure('level','Read the practice dipstick level (target 75%)',75,'%'),
     choice('waste','Where does used oil go?','Labeled used-oil container',['Labeled used-oil container','Storm drain','Regular sink'])
    ]:[
     step('loosen','Turn the lug wrench through a full circle','Lug wrench','rotate'),
     place('lift','Place approved support at the marked lifting points','Approved supports',['left','right']),
     place('remove','Move the removed wheel onto the wheel cart','Wheel cart'),
     place('match','Fit the matched 205/55 R16 91V tire','205/55 R16 91V tire'),
     hold('balance','Complete the supervised balancing checkpoint','Wheel balancer'),
     step('torque','Tighten the five fasteners in the shown star sequence','Torque wrench','sequence',{targets:['1','3','5','2','4']}),
     measure('pressure','Set cold tire pressure from the practice door placard',32,'PSI')
    ]),
    choice('final','Who clears completed vehicle work?','Qualified supervisor',['Qualified supervisor','Waiting customer','Any passerby'])
   ],{due,card:oil?'Authorized: Oil and filter change. Fictional training vehicle only. Oil/filter: 5W-30 / F-21. Refill: 4.5 liters. Dipstick target: 75%.':'Authorized: One tire replacement. Tire: 205/55 R16 91V. Cold pressure: 32 PSI. Star order: 1, 3, 5, 2, 4. Vehicle-specific supervision required.'}));
   const paid=add(invoice('3k-'+n,'Invoice & take payment · driver '+n,oil?4875:7625,oil?5000:10000,[id],due));
   add(task('release-'+n,'Return vehicle to the correct driver','Reception','tire',[verify('owner','Match the driver’s collection card','Driver '+n),place('keys','Hand over the keys and service record','Keys and service record')],{due,depends:[paid],card:'Authorized collection: Driver '+n+'.'}));
  }
 } else if(s.shop==='cool-vibes') {
  for(let n=1;n<=4;n++) {
   const due=(n-1)*100,id='cafe-order-'+n,drink=n%2===0;
   add(task(id,'Take order · café guest '+n,'Reception','food',[verify('repeat','Repeat the customer request',drink?'Coffee with milk':'Chicken sandwich, no tomatoes'),choice('allergy','The customer mentions an allergy. What should you do?','Stop and ask the supervisor; check ingredients',['Stop and ask the supervisor; check ingredients','Guess that it is safe','Remove a visible topping only'])],{due,card:drink?'Guest '+n+': Coffee with milk. Ask about allergies.':'Guest '+n+': Chicken sandwich, no tomatoes. Ask about allergies.'}));
   const paid=add(invoice('cafe-'+n,'Take payment · café guest '+n,drink?375:625,1000,[id],due));
   const prep=add(task('prep-'+n,drink?'Prepare coffee with milk':'Prepare the custom sandwich','Kitchen','food',[
    wipe('Wash hands and sanitize the prep surface'),
    ...(drink?[place('cup','Move a clean cup under the dispenser','Clean cup'),measure('milk','Measure milk using the practice recipe',50,'mL'),hold('brew','Brew the virtual coffee','Coffee maker'),place('lid','Fit the lid and attach the order label','Lid and label')]:[place('bun','Place the bottom bun on the clean board','Bottom bun'),hold('cook','Cook virtual chicken at the supervised grill','Grill'),measure('temp','Match the classroom recipe’s chicken temperature checkpoint',165,'°F'),place('fill','Add chicken and lettuce; leave off tomatoes','Chicken and lettuce'),place('top','Add the top bun and wrap the sandwich','Top bun and wrapper')]),
    verify('ticket','Match the finished order to the guest','Guest '+n)
   ],{due,depends:[paid],card:drink?'Coffee with milk. Practice recipe: 50 mL milk. Deliver to Guest '+n+'.':'Chicken sandwich with lettuce, no tomatoes. Fictional temperature checkpoint: 165°F. Deliver to Guest '+n+'.'}));
   add(task('handoff-'+n,'Serve café guest '+n,'Reception','food',[verify('guest','Match the collection name','Guest '+n),place('serve','Move the labeled order to the serving counter','Labeled order')],{depends:[prep],due,card:'Collection name: Guest '+n+'.'}));
  }
 } else if(s.shop==='the-zoo') {
  const pets=[['Buddy','playful','Morgan'],['Luna','fearful / growling','Jordan'],['Clover','calm','Casey']];
  pets.forEach(([name,mood,owner],n)=>{
   const due=n*60,id='pet-checkin-'+n;
   add(task(id,'Check in '+name+' with '+owner,'Reception','pet',[
    verify('identity','Match the owner and animal names',owner+' / '+name),
    choice('behavior','Read the behavior card before approaching',mood==='fearful / growling'?'Give space, secure the area, call supervisor':'Use calm handling and supervised play',mood==='fearful / growling'?['Give space, secure the area, call supervisor','Reach into the kennel','Chase the animal']:['Use calm handling and supervised play','Overexcite the animal','Skip the behavior check']),
    place('space','Move the animal card to its separate secure kennel','Secure kennel')
   ],{due,pet:name,petMood:mood,card:owner+' / '+name+'. Behavior: '+mood+'. Contact: Practice front desk. Keep animals separated. Never handle a fearful or aggressive animal alone.'}));
   const care=add(task('pet-care-'+n,'Feed, water & care for '+name,'Animal care','pet',[
    place('bowl','Place a clean water bowl in the kennel','Clean water bowl'),
    measure('food','Measure the owner-approved food portion',1,'scoop'),
    ...(n===0?[
     verify('med-order','Match the written simulated medication order','Buddy / Demo-M / 1 tablet / 8 AM'),
     choice('authorization','Who can approve and supervise medicine?','Trained supervisor with written owner / vet instructions',['Trained supervisor with written owner / vet instructions','Any child without checking','Another pet owner']),
     measure('dose','Match the fictional training order dose',1,'demo tablet'),
     place('med-log','Record the simulated dose on the care chart','Medication log')
    ]:[]),
    ...(n===1?[choice('stress','Luna growls and backs away. Choose the safe response','Stop, give space, secure barrier, call supervisor',['Stop, give space, secure barrier, call supervisor','Punish the animal','Grab the collar'])]:[place('play','Move the appropriate toy into the supervised play area','Pet-safe toy'),hold('playtime','Give the animal a calm, supervised play turn','Supervised play')]),
    verify('update','Record the animal’s care chart name',name)
   ],{due,depends:[id],pet:name,petMood:mood,card:name+': 1 scoop owner-approved food and clean water.'+(n===0?' Simulated written order: Buddy / Demo-M / 1 tablet / 8 AM. Fictional medication only.':'')+' Record care and report changes.'}));
   if(n===0)add(task('walk-buddy','Walk Buddy to Transition Park and back','Park','walk',[place('leash','Attach the leash to the checked harness','Leash and harness'),route('Guide Buddy along the sidewalk route to the park, waste station, and home'),place('waste','Bag waste and put it in the park bin','Waste bag'),verify('return','Check the animal back into its secure kennel','Buddy')],{due:120,depends:[care],pet:name,petMood:mood,card:'Buddy: checked harness and leash. Follow the tan sidewalk. Never enter the road. Return to the secure kennel.'}));
   const cleaned=add(task('kennel-'+n,'Clean '+name+'’s kennel','Cleaning','pet',[place('secure','Move the pet to a separate safe pen before cleaning','Secure pen'),place('waste','Remove waste and used bedding','Waste bag'),wipe('Clean the kennel surfaces with the pet safely separated'),hold('contact','Follow the fictional product-card contact-time checkpoint','Cleaning timer'),place('bedding','Place fresh bedding and clean bowls','Fresh bedding'),hold('hands','Wash hands after kennel care','Handwashing')],{due:180,depends:[care],cleanRoom:'kennel '+name,pet:name,card:'Secure the animal away from cleaning products. Training contact time: hold until the timer finishes. Follow the real product label with a trained adult outside this simulation.'}));
   const deps=[care,cleaned].concat(n===0?['walk-buddy']:[]);
   const pay=add(invoice('pet-'+n,'Collect boarding payment · '+owner,4025,5000,deps,420));
   add(task('pet-out-'+n,'Check '+name+' out to '+owner,'Reception','pet',[verify('owner','Match the authorized owner’s collection card',owner),place('record','Hand over the care report with the correct animal','Pet and care record')],{due:420,depends:[pay],pet:name,card:'Authorized owner: '+owner+'. Animal: '+name+'.'}));
  });
 } else if(s.shop==='guardian-angel') {
  const names=['Alex','Sam','Riley','Taylor','Jamie','Avery','Skyler','Quinn','Charlie','Reese'];
  w.roster=names.slice(0,count).map((name,i)=>({id:'child-'+i,name,parent:'Parent '+(i+1),allergy:i===1?'peanuts':'none listed',status:'arriving',inAt:null,outAt:null}));
  for(const child of w.roster) add(task('in-'+child.id,'Daily check-in · '+child.name,'Reception','children',[verify('parent','Match the authorized parent at arrival',child.parent),verify('allergy','Read the allergy card',child.allergy),place('sign','Move the signed arrival card onto the daily attendance sheet','Signed arrival card')],{child:child.id,checkIn:true,card:child.name+' · '+child.parent+'. Allergy: '+child.allergy+'. Record arrival before care.'}));
  const ids=w.roster.map(c=>c.id),checkins=ids.map(id=>'in-'+id);
  for(const [id,title,due] of [['breakfast','Serve breakfast',60],['snack-am','Serve morning snack',180],['lunch','Serve lunch',360],['snack-pm','Serve afternoon snack',540]]) add(task(id,title+' to every child','Classroom','children',[wipe('Wash hands and sanitize the meal area'),choice('allergy','One child has a peanut allergy. Choose the safe meal process','Check each child’s plan and use the approved peanut-free meal',['Check each child’s plan and use the approved peanut-free meal','Share the same unchecked snack','Ignore the allergy card']),place('plates','Move one approved meal or snack to every child','Approved meal',ids),measure('count','Count children served',count,'children'),wipe('Clean and sanitize after the meal')],{due,deadline:Math.min(720,due+90),depends:checkins,card:'Group size: '+count+'. Sam has a peanut allergy. Follow each written care plan. Use approved food and clean hands.'}));
  add(task('activities','Supervise learning and play','Classroom','children',[place('activities','Place one age-appropriate activity with each child','Learning activity',ids),hold('supervise','Scan the whole group and supervise play','Supervision'),measure('headcount','Count every child in your care',count,'children')],{due:120,depends:checkins,card:'Never leave the group unsupervised. Every child needs an activity. Headcount: '+count+'.'}));
  add(task('nap','Rest-time supervision and wellbeing checks','Classroom','children',[place('rest','Place an individual clean rest mat for each child','Clean rest mat',ids),hold('observe','Complete the simulated quiet wellbeing scan','Supervision'),measure('headcount','Count children at rest',count,'children')],{due:420,depends:checkins,card:'Supervise and check wellbeing continuously. Fictional classroom routine; follow approved care plans. Headcount: '+count+'.'}));
  add(task('park','Optional trip to the daycare area in Transition Park','Park','park',[choice('permission','Before leaving, what must you confirm?','Permission, safe staffing, emergency contacts and headcount',['Permission, safe staffing, emergency contacts and headcount','Only the weather','Nothing']),measure('leave-count','Count children before leaving',count,'children'),route('Guide the whole group along the safe path to the daycare park area and back'),place('play','Give each child a supervised playground turn','Supervised playground turn',ids),measure('return-count','Count children on return',count,'children')],{due:240,depends:checkins,optional:true,card:'Daycare park area · take the complete group together. Count '+count+' children before departure, at the park and on return. Stay on the path.'}));
  for(const child of w.roster) {
   const week=Math.floor((w.day-1)/5)+1,isFriday=(w.day-1)%5===0;w.billingDue=w.billingDue||{};if(isFriday)w.billingDue[week+':'+child.id]=true;
   let deps=['breakfast','snack-am','lunch','snack-pm','nap','activities'];
   for(const key of Object.keys(w.billingDue).filter(k=>k.endsWith(':'+child.id)&&!w.weekPaid[k])){const dueWeek=Number(key.split(':')[0]);deps.push(add(invoice('weekly-'+dueWeek+'-'+child.id,'Weekly childcare payment · '+child.parent+' (week '+dueWeek+')',12525,14000,[],600,{weekly:dueWeek,child:child.id})));}
   add(task('out-'+child.id,'Authorized pickup · '+child.name,'Reception','children',[verify('pickup','Match the authorized pickup adult',child.parent),place('sign-out','Move the signed pickup card to the attendance sheet','Signed pickup card'),place('daily','Hand the parent the child’s daily care report','Daily care report')],{due:660,depends:deps,child:child.id,checkOut:true,card:child.name+' may leave with '+child.parent+' after any weekly payment due is collected.'}));
  }
 } else if(s.shop==='main-attraction') {
  const svcs=[['Nail art','nails',2525,3000],['Shampoo & style','hair',3275,4000],['Pedicure','nails',3525,4000]];
  svcs.forEach(([name,visual,total,tender],n)=>{
   const due=n*120,book='booking-'+n;
   add(task(book,'Book '+name+' · client '+(n+1),'Reception','calendar',[verify('service','Match the requested salon service',name),step('book','Drag the client card into an available appointment slot','Appointment card','book',{slots:['8:00','9:00','10:00','11:00','13:00','14:00']}),verify('client','Confirm the client name','Client '+(n+1))],{due,card:'Client '+(n+1)+' requests '+name+'. Choose an open slot; double bookings are blocked.'}));
   const service=add(task('salon-'+n,'Perform '+name+' · client '+(n+1),'Service station',visual,[verify('consult','Confirm the service before starting',name),wipe('Sanitize hands, tools and the service station'),...(visual==='nails'?[place('towel','Place a clean towel under the hand or foot','Clean towel'),step('shape','Shape all five practice nails','Nail file','place',{targets:['1','2','3','4','5']}),step('paint','Paint all five nails in the requested rose color','Rose polish brush','paint',{targets:['1','2','3','4','5']}),hold('dry','Allow virtual polish to set','Drying timer')]:[step('wash','Shampoo every illustrated section','Shampoo','sweep'),place('comb','Comb all three hair sections','Comb',['1','2','3']),step('style','Guide the dryer through all three sections','Dryer','paint',{targets:['1','2','3']})]),place('mirror','Offer the client the mirror for a final check','Client mirror')],{due,depends:[book],card:name+'. Client '+(n+1)+'. Nail color: rose. Use clean tools and request supervision for anything unfamiliar.'}));
   const paid=add(invoice('salon-pay-'+n,'Cashier · client '+(n+1),total,tender,[service],due));
   add(cleaningTask('salon-reset-'+n,'service station '+(n+1),due));tasks.at(-1).depends=[paid];
  });
 }
 add(stockTask(s,'stock-1',90));add(stockTask(s,'stock-2',360));
 add(cleaningTask('mid-waiting','waiting area',210));add(cleaningTask('mid-bathroom','bathroom',300));
 add(cleaningTask('close-work','work area',570));add(cleaningTask('close-waiting','waiting area',600));add(cleaningTask('close-bathroom','bathroom',630));
 return tasks;
}
function minute(w,now) {return !w.active?w.minute:Math.min(720,Math.max(w.minute,Math.floor(((w.pausedAt||now)-w.startedAt-w.pauseMs)/600000*720)));}
function report(s,w,now) {
 const rows=w.events.filter(e=>e.day===w.day),actors=[...new Set(rows.map(e=>e.actor))];
 return {id:s.shop+'-'+w.day,shop:s.shop,business:shops[s.shop].name,day:w.day,startedAt:w.startedAt,endedAt:now,simulatedMinutes:w.minute,elapsedSeconds:Math.min(600,Math.round((now-w.startedAt-w.pauseMs)/1000)),completed:w.tasks.filter(t=>t.status==='done'&&!t.optional&&!t.afterShift).length,total:w.tasks.filter(t=>!t.optional&&!t.afterShift).length,incomplete:w.tasks.filter(t=>t.status!=='done'&&!t.optional&&!t.afterShift).map(t=>t.title),salesCents:w.tasks.filter(t=>t.paid).reduce((n,t)=>n+t.total,0),attendance:clone(w.roster),inspection:clone(w.inspection),actors:actors.map(actor=>{const es=rows.filter(e=>e.actor===actor);return {actor,steps:es.filter(e=>e.result==='correct').length,corrections:es.filter(e=>e.result==='retry').length,hints:es.filter(e=>e.result==='hint').length,cashTransactions:es.filter(e=>e.mode==='cash'&&e.result==='correct').length,activities:es.map(e=>({at:e.at,task:e.task,step:e.step,result:e.result,mode:e.mode,support:e.support||''}))};}),evidence:'Browser-recorded simulation practice. Teacher must verify identity, assistance, independence and real-world performance.'};
}
function inspect(s,w,now,mid=false) {
 const issues=[];
 const rooms=mid?['waiting','bathroom']:['work','waiting','bathroom'];
 for(const room of rooms){const done=w.tasks.some(t=>t.cleanRoom?.includes(room)&&t.status==='done'&&(!mid?t.id.startsWith('close'):true));if(!done)issues.push({id:'clean-'+room,title:'Complete and inspect the '+room+' cleaning routine',fix:'clean',room,done:false});}
 const safety=w.events.filter(e=>e.day===w.day&&e.result==='retry'&&['choice','verify'].includes(e.mode));if(safety.length)issues.push({id:'safe',title:'Review a safety decision that needed correction',fix:'safety',done:false});
 const missed=w.tasks.filter(t=>!t.optional&&t.status!=='done'&&t.due<=w.minute&&!t.id.startsWith('fix-')).length;
 if(missed)issues.push({id:'unfinished',title:missed+' work tasks still need attention. Plan the next shift.',fix:'plan',done:false});
 const r={id:'inspection-'+w.day+'-'+(mid?'mid':'close'),agency:shops[s.shop].agency,at:now,mid,issues,acknowledged:false,simulation:true};
 w.inspection=r;
 for(const issue of issues){let t;if(issue.fix==='clean')t=cleaningTask('fix-'+r.id+'-'+issue.id,issue.room,0);else t=task('fix-'+r.id+'-'+issue.id,issue.title,'Inspection','safety',[choice('safe','A task is unfinished or unsafe. What is the correct action?','Stop, secure the area, ask for support and correct it',['Stop, secure the area, ask for support and correct it','Hide the issue','Sign it complete without doing it']),verify('plan','Read the improvement plan. What do we do first?','Review the work card')],{card:'Improvement plan: Review the work card. Complete the correct steps. Ask for support and verify the result.'});t.station='Inspection';t.inspectionIssue=issue.id;t.inspectionId=r.id;t.afterShift=!mid;w.tasks.push(t);}
}
function end(s,w,now,early=false) {w.minute=minute(w,now);w.active=false;w.pausedAt=0;w.phase='review';w.endedAt=now;w.endedEarly=early;inspect(s,w,now);w.reports.unshift(report(s,w,now));w.reports=w.reports.slice(0,20);}
function event(w,a,t,st,result,now) {w.events.push({at:now,day:w.day,actor:text(a.actor,50)||'Practice worker',task:t?.title||'Workday',step:st?.label||'',mode:st?.mode||'',result,support:text(a.support,180)});w.events=w.events.slice(-2400);}
function validate(st,a) {
 if(a.tool!==st.tool)fail('Choose '+st.tool+' for this step.');
 if(st.mode==='verify'&&text(a.answer).toLowerCase()!==String(st.answer).toLowerCase())fail('Compare your entry with the work card and try again.');
 if(st.mode==='choice'&&a.answer!==st.answer)fail('That choice needs correction. Read the safety card or ask for help.');
 if(st.mode==='measure'&&(a.answer===''||a.answer==null||!Number.isFinite(Number(a.answer))||Number(a.answer)!==Number(st.answer)))fail('Check the work-card amount and unit, then measure again.');
 if(['place','paint','sequence','route','sweep'].includes(st.mode)){
  const expected=st.mode==='sweep'?ALLCELLS:st.targets,got=Array.isArray(a.targets)?a.targets.map(String):[];
  if(st.mode==='sequence'||st.mode==='route'){if(!matches(got,expected))fail('Follow the marked sequence in order.');}
  else if(!matches([...new Set(got)].sort(),[...expected].sort()))fail('Complete every marked area with the correct tool.');
 }
 if(st.mode==='hold'&&(!Number.isFinite(a.elapsed)||a.elapsed<st.milliseconds))fail('Keep holding until the timer finishes.');
 if(st.mode==='rotate'&&(!Number.isFinite(a.rotation)||a.rotation<Math.PI*2))fail('Turn the wrench through a complete circle.');
 if(st.mode==='book'&&!st.slots.includes(a.answer))fail('Move the appointment to a valid time slot.');
 if(st.mode==='cash'){
  if(!Array.isArray(a.pieces)||!a.pieces.length||a.pieces.length>100||a.pieces.some(p=>!DENOMS.includes(p)))fail('Choose valid bills and coins from the cash drawer.');
  if(a.pieces.reduce((n,v)=>n+v,0)!==st.tender-st.total)fail('The bills and coins do not equal the change due. Recount them.');
  if(!Array.isArray(a.counts)||a.counts.length!==a.pieces.length)fail('Enter the running total after each bill or coin.');
  let sum=st.total;for(let i=0;i<a.pieces.length;i++){sum+=a.pieces[i];if(a.counts[i]===''||a.counts[i]==null||Math.round(Number(a.counts[i])*100)!==sum)fail('Count back from the sale total, adding each bill or coin until you reach the amount received.');}
 }
}
function reduce(previous,a,rid,now=Date.now()) {
 if(!String(a?.type||'').startsWith('wd-'))return base(previous,a,rid,now);
 if(!rid||typeof rid!=='string')fail('A work action needs an ID.');
 const s=clone(previous),w=init(s);if(s.seen.includes(rid))return s;
 w.minute=minute(w,now);
 if(w.active&&w.minute>=720)end(s,w,now);
 const actor=text(a.actor,50)||'Practice worker',device=text(a.device,80);
 switch(a.type) {
 case 'wd-read':break;
 case 'wd-start':{
  if(!w.certificate)fail('Complete the opening checks to earn the classroom certificate first.');
  if(w.active)fail('A shift is already running. Join the existing shift.');
  if(w.inspection?.issues.some(i=>!i.done))fail('Finish the inspector’s correction tasks before the next shift.');
  if(s.day?.active)fail('End the older practice shift in the business bank before starting this workday.');
  const count=Number(a.children??5);if(!Number.isInteger(count)||count<5||count>10)fail('Choose between five and ten children.');
  w.day++;w.minute=0;w.startedAt=now;w.pauseMs=0;w.pausedAt=0;w.active=true;w.phase='shift';w.inspection=null;w.bookings=[];w.tasks=buildDay(s,w,count);w.roster=s.shop==='guardian-angel'?w.roster:[];w.midInspectionDone=false;break;
 }
 case 'wd-tick':if(w.active&&!w.pausedAt&&w.day>1&&w.minute>=300&&!w.midInspectionDone){inspect(s,w,now,true);w.midInspectionDone=true;}break;
 case 'wd-pause':if(w.active){if(w.pausedAt){w.pauseMs+=now-w.pausedAt;w.pausedAt=0;}else w.pausedAt=now;}break;
 case 'wd-end':if(!w.active&&w.phase==='review'&&w.minute===720)break;if(!w.active)fail('There is no active shift.');end(s,w,now,true);break;
 case 'wd-inspection-ack':if(w.inspection)w.inspection.acknowledged=true;break;
 case 'wd-claim':{
  const t=w.tasks.find(t=>t.id===a.task);if(!t||t.status==='done')fail('Choose an unfinished task.');
  if(!device)fail('Reconnect this worker device.');
  if(t.claim?.device!==device&&t.claim?.until>now)fail(t.claim.actor+' is working on this task. Choose another station.');
  t.claim={device,actor,until:now+120000};break;
 }
 case 'wd-release':{const t=w.tasks.find(t=>t.id===a.task);if(t?.claim?.device===device)delete t.claim;break;}
 case 'wd-hint':case 'wd-error':{
  const t=w.tasks.find(t=>t.id===a.task);if(!t)break;const st=t.steps[t.progress];if(!st)break;
  if(a.type==='wd-hint')t.hints++;else t.mistakes++;event(w,a,t,st,a.type==='wd-hint'?'hint':'retry',now);break;
 }
 case 'wd-step':{
  const t=w.tasks.find(t=>t.id===a.task);if(!t||t.status==='done')fail('This task is already complete. Refresh the station.');
  const st=t.steps[t.progress];if(a.step!==st.id)fail('A teammate updated the task. Refresh before continuing.');
  if(w.pausedAt)fail('Resume the shift clock before working.');
  if(w.phase!=='opening'&&!w.active&&!t.afterShift)fail('The shift ended. Complete the inspector’s correction tasks or start the next shift.');
  if(t.due>w.minute)fail('This task is scheduled for later in the day.');
  if((t.depends||[]).some(id=>w.tasks.find(x=>x.id===id)?.status!=='done'))fail('Complete the earlier work on this ticket first.');
  if(t.claim?.device!==device||t.claim.until<=now)fail('Claim this task on your device before working.');
  validate(st,a);
  if(st.mode==='book'){if(w.bookings.some(b=>b.slot===a.answer))fail('That appointment slot was just booked. Choose another open slot.');w.bookings.push({task:t.id,slot:a.answer,actor});}
  t.progress++;t.claim.until=now+120000;t.by=[...new Set([...t.by,actor])];event(w,a,t,st,'correct',now);
  if(t.progress===t.steps.length){
   t.status='done';t.completedAt=now;delete t.claim;
   if(t.total&&!t.paid){t.paid=true;s.cash=C.cents(s.cash+t.total/100);s.sales=C.cents(s.sales+t.total/100);s.finance.revenue=C.cents(s.finance.revenue+t.total/100);s.bank.ledger.push({id:rid,type:'sale',at:now,amount:t.total/100,memo:'Workday · '+t.title,by:actor,checking:s.cash,savings:s.bank.savings});if(t.weekly)w.weekPaid[t.weekly+':'+t.child]=true;}
   if(t.itemKey){if(s.cash<t.cost)fail('The business needs more classroom money before receiving this order. Complete customer payments first.');s.cash=C.cents(s.cash-t.cost);s.spent=C.cents((s.spent||0)+t.cost);s.stock[t.itemKey]=(s.stock[t.itemKey]||0)+t.units;s.bank.ledger.push({id:rid,type:'inventory',at:now,amount:-t.cost,memo:t.title,by:actor,checking:s.cash,savings:s.bank.savings});}
   if(t.cleanRoom)w.clean[t.cleanRoom]={minute:w.minute,at:now,by:actor};
   if(t.child){const child=w.roster.find(c=>c.id===t.child);if(child&&t.checkIn){child.status='in care';child.inAt=w.minute;}if(child&&t.checkOut){child.status='picked up';child.outAt=w.minute;}}
   if(t.inspectionIssue&&w.inspection?.id===t.inspectionId){const issue=w.inspection.issues.find(i=>i.id===t.inspectionIssue);if(issue)issue.done=true;}
  }
  if(w.phase==='opening'&&w.tasks.every(t=>t.status==='done'))w.certificate={number:'TT-PRACTICE-'+s.shop.toUpperCase(),issuedAt:now,owners:Object.keys(C.config(s.shop).owners),simulation:true};
  if(w.phase==='review'&&w.reports[0]?.day===w.day){w.reports[0].inspection=clone(w.inspection);w.reports[0].correctionsAfterShift=w.events.filter(e=>e.day===w.day&&e.at>w.endedAt&&e.result==='correct').length;}
  break;
 }
 default:fail('Unknown workday action.');
 }
 w.revision++;s.seen.push(rid);s.seen=s.seen.slice(-500);s.bank.ledger=s.bank.ledger.slice(-5000);return s;
}
C.reduce=reduce;g.TTWorkday={shops,init,minute,validate,report,DENOMS,ALLCELLS,buildDay};
})(globalThis);
