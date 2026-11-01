import {recipeById,COOK_STEPS,LAUNDRY_STEPS,HOUSE_TASKS} from './recipes.mjs';
export const ACTIVITY='home-economics';
export const money=cents=>'$'+(Number(cents||0)/100).toFixed(2);
export const totalCents=cart=>cart.reduce((n,p)=>n+Math.round(p.price*100)*p.qty,0);
export function initialState(){return {schema:1,recipeId:'rice-treat',phase:'plan',station:'classroom',support:'beginning',mode:'tap',paused:false,sessionMinutes:30,startedAt:Date.now(),help:0,planning:{recipePrinted:[],listPrinted:[],writingReported:false},shopping:{tripId:null,budgetCents:2000,receipt:null,returnStep:0},step:0,completedSteps:[],work:{},laundry:{step:0,work:{},completed:false,runs:0},household:{},reflection:null,completed:0,attempts:0};}
export function restoreState(raw){
 const s=initialState();if(!raw||raw.schema!==1)return s;
 if(!recipeById(raw.recipeId)||!Number.isInteger(raw.step)||raw.step<0||raw.step>=COOK_STEPS.length)return s;
 const d={...s,...raw,planning:{...s.planning,...raw.planning},shopping:{...s.shopping,...raw.shopping},laundry:{...s.laundry,...raw.laundry}};
 d.work=d.work&&typeof d.work==='object'?d.work:{};d.household=d.household&&typeof d.household==='object'?d.household:{};
 d.completedSteps=Array.isArray(d.completedSteps)?d.completedSteps.filter(x=>COOK_STEPS.some(t=>t.id===x)):[];
 if(!Number.isInteger(raw.attempts)||raw.attempts<0)d.attempts=raw.phase==='plan'?0:1;
 d.mode=['tap','walk'].includes(d.mode)?d.mode:'tap';d.support=['beginning','developing','independent'].includes(d.support)?d.support:'beginning';
 if(!['plan','shop','cook','reflection','complete'].includes(d.phase))d.phase='plan';return d;
}
const clone=s=>JSON.parse(JSON.stringify(s));
export function beginTrip(s,id){const d=clone(s);d.shopping={...d.shopping,tripId:id,returnStep:d.step,receipt:null};d.attempts=(d.attempts||0)+1;d.phase='shop';return d;}
export function validateCheckout(cart,catalog,recipe,budgetCents){
 if(!Array.isArray(cart)||!cart.length)return {ok:false,message:'Your cart is empty.'};
 const lines=[];
 for(const item of cart){const [aisle,index]=String(item.key).split('-'),p=catalog[aisle]?.[Number(index)];if(!p||!Number.isInteger(item.qty)||item.qty<1||item.qty>99||item.name!==p[0]||item.price!==p[2]||item.size!==p[1])return {ok:false,message:'A cart item changed. Put it back and select it from the shelf again.'};lines.push({...item});}
 if(!recipe.ingredients.every(i=>lines.some(x=>x.name===i.product)))return {ok:false,message:'Find every ingredient on your recipe list before checking out.'};
 const total=totalCents(lines);if(!Number.isSafeInteger(budgetCents)||budgetCents<=0||total>budgetCents)return {ok:false,message:'This cart is over your practice budget. Put items back or compare package prices.'};
 return {ok:true,lines,totalCents:total,remainingCents:budgetCents-total};
}
export function acceptReceipt(s,receipt){
 if(!s.shopping.tripId||receipt?.tripId!==s.shopping.tripId||typeof receipt.id!=='string'||!Array.isArray(receipt.lines)||receipt.lines.some(x=>!x||!Number.isInteger(x.qty)||x.qty<1||!Number.isFinite(x.price)||x.price<0)||!Number.isSafeInteger(receipt.totalCents)||receipt.totalCents!==totalCents(receipt.lines)||receipt.totalCents>s.shopping.budgetCents||receipt.remainingCents!==s.shopping.budgetCents-receipt.totalCents||!recipeById(s.recipeId).ingredients.every(i=>receipt.lines.some(x=>x.name===i.product)))return {state:s,ok:false};
 if(s.shopping.receipt?.id===receipt.id)return {state:s,ok:true,duplicate:true};
 const d=clone(s);d.shopping.receipt=receipt;d.phase='cook';d.step=d.shopping.returnStep;d.station=COOK_STEPS[d.step].station;return {state:d,ok:true};
}
export function cookReady(s,now=Date.now()){
 const w=s.work,id=COOK_STEPS[s.step].id;
 return ({safety:()=>['allergies','adult','hot'].every(x=>w.safety?.includes(x)),hands:()=>w.hands?.dried&&w.hands?.rinsed,tools:()=>['bowl','cups','spoons','spoon','container'].every(x=>w.tools?.includes(x)),butter:()=>w.butter===3,marshmallows:()=>w.marshmallows===4,combine:()=>w.combine>=3,supervision:()=>w.adultRequested&&w.mitts,microwave:()=>w.microwave?.intervals>=2&&w.microwave?.stirred&&!w.microwave?.in,cereal:()=>w.cereal===6,stir:()=>w.stir>=8,transfer:()=>w.transferred,cool:()=>w.coolUntil&&now>=w.coolUntil,dishes:()=>['bowl','cups','spoons','spoon'].every(x=>w.dishes?.includes(x)),wipe:()=>w.wipes>=5&&w.stored})[id]?.()||false;
}
export function cookAction(s,a,now=Date.now()){
 const d=clone(s),w=d.work,id=COOK_STEPS[d.step].id;let message='Keep going. You can repeat or ask for a hint.';let ok=false;
 if(d.paused||d.phase!=='cook')return {state:s,ok:false,message:d.paused?'Resume when you are ready.':'Complete your shopping trip first.'};
 const yes=(text)=>{ok=true;message=text;};const list=(key,value)=>{w[key]=[...new Set([...(w[key]||[]),value])];};
 if(id==='safety'&&a.type==='safety'&&['allergies','adult','hot'].includes(a.value)){list('safety',a.value);yes('Safety reminder reviewed. Ask your teacher before real cooking.');}
 if(id==='hands'){
  const h=w.hands||(w.hands={});
  if(a.type==='tap'){h.water=true;yes('Water on. Add soap.');}
  if(a.type==='soap'&&h.water){h.soap=true;yes('Soap ready. Rub for 20 seconds.');}
  if(a.type==='rub'&&h.soap){h.rubStarted??=now;h.rubbing=true;yes('20-second handwashing practice started. Rub all hand surfaces.');}
  if(a.type==='rinse'){if(h.rubbing&&now-h.rubStarted>=20000){h.rinsed=true;yes('Hands rinsed. Use the clean towel.');}else message='Keep rubbing until the full 20 seconds finishes.';}
  if(a.type==='dry'&&h.rinsed){h.dried=true;yes('Hands clean and dry.');}
 }
 if(id==='tools'){
  if(a.type==='cabinet'){w.cabinetOpen=!w.cabinetOpen;yes(w.cabinetOpen?'Cabinet open. Collect five tools.':'Cabinet closed.');}
  if(a.type==='tool'&&w.cabinetOpen&&['bowl','cups','spoons','spoon','container'].includes(a.value)){list('tools',a.value);yes('Tool placed on your counter.');}
 }
 if(['butter','marshmallows','cereal'].includes(id)){
  const allowed=id==='butter'?[1,2,4]:[3,4,6,12],target=id==='butter'?3:id==='marshmallows'?4:6;
  if(a.type==='measure-select'&&allowed.includes(a.value)){w.selected=a.value;w.scooped=false;yes('Measuring tool selected. Scoop the ingredient.');}
  if(a.type==='scoop'&&allowed.includes(w.selected)){w.scooped=true;yes('Scoop filled and leveled. Pour it into the bowl.');}
  if(a.type==='pour'&&w.scooped){const amount=(w[id]||0)+w.selected;if(amount>target){message='That would be too much. Empty the measure and choose a smaller one. Your bowl has not changed.';w.scooped=false;}else{w[id]=amount;w.scooped=false;yes(amount===target?'Exactly right. Your ingredient is measured.':'Added. Measure a little more to reach the recipe amount.');}}
  if(a.type==='empty'){w.scooped=false;w[id]=0;yes('Measure emptied. Try again with no penalty.');}
 }
 if((id==='combine'||id==='stir')&&a.type==='stir'){w[id]=(w[id]||0)+1;yes('Gentle stir '+w[id]+'.');}
 if(id==='supervision'){
  if(a.type==='adult'){w.adultRequested=true;d.help++;yes('Practiced requesting adult help. Real microwave use still needs an adult.');}
  if(a.type==='mitts'){w.mitts=true;yes('Dry oven mitts selected.');}
 }
 if(id==='microwave'){
  const m=w.microwave||(w.microwave={open:false,in:false,intervals:0,stirred:true,until:0});
  if(a.type==='door'){
   if(m.until>now)message='Wait for the short practice interval to finish.';
   else{m.open=!m.open;yes(m.open?'Door open. Use dry mitts if the bowl is hot.':'Door closed.');}
  }
  if(a.type==='bowl'&&m.open&&m.until<=now){if(m.in&&m.intervals&&!w.mitts)message='Choose dry oven mitts first.';else{m.in=!m.in;yes(m.in?'Microwave-safe bowl inside. Metal spoon stays outside.':'Bowl on the heat-safe mat. Stir carefully.');}}
  if(a.type==='heat'){
   if(!m.in||m.open||!m.stirred||m.until>now||m.intervals>=2)message='Put in the bowl, close the door, and stir after each interval.';
   else{m.until=now+5000;m.intervals++;m.stirred=false;yes('Short practice interval started. Game seconds are not real microwave instructions.');}
  }
  if(a.type==='stir'&&!m.in&&m.until<=now&&m.intervals){m.stirred=true;yes('Mixture stirred carefully. '+(m.intervals<2?'Repeat one short practice interval.':'Practice mixture melted.'));}
 }
 if(id==='transfer'&&a.type==='transfer'){w.transferred=true;yes('Mixture transferred into the serving container.');}
 if(id==='cool'&&a.type==='cool'){w.coolUntil??=now+15000;yes('Cooling practice started. In real cooking, ask an adult to check the temperature.');}
 if(id==='dishes'&&a.type==='wash'&&['bowl','cups','spoons','spoon'].includes(a.value)){list('dishes',a.value);yes('Tool washed, rinsed, and placed to dry.');}
 if(id==='wipe'){
  if(a.type==='cloth'){w.cloth=true;yes('Clean cloth selected.');}
  if(a.type==='wipe'&&w.cloth){w.wipes=Math.min(5,(w.wipes||0)+1);yes('Counter section '+w.wipes+' of 5 cleaned.');}
  if(a.type==='store'&&w.wipes>=5){w.stored=true;yes('Supplies stored safely. Your workstation is ready.');}
 }
 if(!ok&&message.startsWith('Keep'))message='Try the next object in the directions, or use a hint. There is no penalty.';
 return {state:d,ok,message,ready:cookReady(d,now)};
}
export function advanceCook(s,now=Date.now()){
 if(!cookReady(s,now)||s.paused)return {state:s,ok:false,message:'Finish this hands-on step first.'};
 const d=clone(s),id=COOK_STEPS[d.step].id;d.completedSteps=[...new Set([...d.completedSteps,id])];
 if(d.step===COOK_STEPS.length-1){d.phase='reflection';d.station='progress';}else{d.step++;d.station=COOK_STEPS[d.step].station;delete d.work.selected;delete d.work.scooped;}
 return {state:d,ok:true,completed:id};
}
export function laundryReady(s,now=Date.now()){
 const w=s.laundry.work,id=LAUNDRY_STEPS[s.laundry.step].id;
 return ({sort:()=>['shirt','jeans','towel'].every(x=>w.sorted?.includes(x)),labels:()=>['shirt','jeans','towel'].every(x=>w.labels?.includes(x)),load:()=>w.loaded===3,settings:()=>w.temp==='cold'&&w.cycle==='normal',detergent:()=>w.detergent, wash:()=>w.washUntil&&now>=w.washUntil,dryer:()=>w.moved&&w.lint&&w.heat==='low',dry:()=>w.dryUntil&&now>=w.dryUntil,fold:()=>w.folds>=3,away:()=>['shirt','jeans','towel'].every(x=>w.away?.includes(x))})[id]?.()||false;
}
export function laundryAction(s,a,now=Date.now()){
 const d=clone(s),l=d.laundry,w=l.work,id=LAUNDRY_STEPS[l.step].id;let ok=false,message='Follow the next care step. You can try again.';
 if(d.paused)return {state:s,ok:false,message:'Resume first.'};
 const add=(key,v)=>{w[key]=[...new Set([...(w[key]||[]),v])];ok=true;};
 if(id==='sort'&&a.type==='sort'){if(({shirt:'lights',jeans:'darks',towel:'colors'})[a.item]===a.value)add('sorted',a.item);else message='Look at the clothing color and choose the matching basket.';}
 if(id==='labels'&&a.type==='label'&&['shirt','jeans','towel'].includes(a.value))add('labels',a.value);
 if(id==='load'&&a.type==='load'){w.loaded=Math.min(3,(w.loaded||0)+1);ok=true;}
 if(id==='settings'&&a.type==='temp'){w.temp=a.value;ok=['cold','warm','hot'].includes(a.value);}
 if(id==='settings'&&a.type==='cycle'){w.cycle=a.value;ok=['normal','delicate','heavy'].includes(a.value);}
 if(id==='detergent'){
  if(a.type==='cap'){w.cap=Math.min(3,(w.cap||0)+1);ok=true;}
  if(a.type==='empty'){w.cap=0;ok=true;}
  if(a.type==='detergent'){if(w.cap===1){w.detergent=true;ok=true;}else message='This label calls for line 1. Empty the cap and fill to line 1.';}
 }
 if(id==='wash'&&a.type==='wash'){w.washUntil??=now+8000;ok=true;}
 if(id==='dryer'){
  if(a.type==='move'){w.moved=true;ok=true;}
  if(a.type==='lint'){w.lint=true;ok=true;}
  if(a.type==='heat'){w.heat=a.value;ok=['low','high'].includes(a.value);}
 }
 if(id==='dry'&&a.type==='dry'){w.dryUntil??=now+8000;ok=true;}
 if(id==='fold'&&a.type==='fold'){w.folds=Math.min(3,(w.folds||0)+1);ok=true;}
 if(id==='away'&&a.type==='away'&&['shirt','jeans','towel'].includes(a.value))add('away',a.value);
 return {state:d,ok,message:ok?'Laundry action saved. '+(laundryReady(d,now)?'This step is ready.':'Continue following the care label.'):message,ready:laundryReady(d,now)};
}
export function advanceLaundry(s,now=Date.now()){
 if(s.paused||!laundryReady(s,now))return {state:s,ok:false};const d=clone(s);if(d.laundry.step<LAUNDRY_STEPS.length-1)d.laundry.step++;else{d.laundry.completed=true;d.laundry.runs++;}return {state:d,ok:true};
}
export function householdAction(s,task,action){const config=HOUSE_TASKS[task];if(!config||s.paused)return {state:s,ok:false};const d=clone(s),w=d.household[task]||(d.household[task]={step:0,completed:false});if(config.actions[w.step]!==action)return {state:s,ok:false};w.step++;w.completed=w.step===config.actions.length;return {state:d,ok:true,completed:w.completed};}
