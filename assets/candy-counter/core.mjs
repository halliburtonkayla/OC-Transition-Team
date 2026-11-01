// Candy Counter owns only classroom practice data. All arithmetic uses whole cents.
import {MONEY,dollars,spokenAmount} from '../money-match/core.mjs';
export {MONEY,dollars,spokenAmount};
export const ROLES=['Customer service','Inventory worker','Cashier'];
export const LEVELS={beginner:'Count together',exact:'Exact payment',change:'Make change'};
export const STEPS=['order','pack','coin','payment','change','review','done'];
export const DENOMS=['one','quarter','dime','nickel','penny'];
export const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const now=()=>new Date().toISOString();
const copy=x=>JSON.parse(JSON.stringify(x));
export function integer(value,min,max,label='Number'){
 if(!/^(0|[1-9]\d*)$/.test(String(value))||!Number.isSafeInteger(Number(value))||Number(value)<min||Number(value)>max)throw Error(`${label} must be a whole number from ${min} to ${max}.`);
 return Number(value);
}
const text=(value,max=60)=>String(value??'').trim().slice(0,max);
export const ART=['dum-dum','rice-treat','cocoa'];
const defaultShop=()=>({week:'',quantityLimit:5,activeProductId:'dum-dum',products:[
 {id:'dum-dum',name:'Dum-Dums',unit:'sucker',plural:'suckers',art:'dum-dum',enabled:true},
 {id:'rice-treat',name:'Rice Krispie treats',unit:'treat',plural:'treats',art:'rice-treat',enabled:true,unitPrice:25,practiceStock:24,physicalStock:0},
 {id:'cocoa',name:'Hot cocoa',unit:'cup',plural:'cups',art:'cocoa',enabled:true,unitPrice:50,practiceStock:20,physicalStock:0}
]});
export function freshState(){return {version:2,revision:0,createdAt:now(),config:{unitPrice:5,practiceStock:30,realTracking:false,physicalStock:0,level:'beginner',school:'South Fulton',label:'Library table'},shop:defaultShop(),workers:[],activeWorkerId:'',round:null,transactions:[],events:[],observations:[],stockMoves:[]};}
// v1 quantities belong to Dum-Dums. Keep every original record and identifier intact.
// Upgrade only in memory on read; the original stored bytes survive until the next successful action.
export function upgradeState(input){const s=copy(input);if(s?.version===1){s.version=2;s.shop=defaultShop();}return validateState(s);}
export function product(s,id=s.shop.activeProductId){const p=s.shop.products.find(p=>p.id===id);if(!p)throw Error('Choose a listed product.');return {...p,...(id==='dum-dum'?{unitPrice:s.config.unitPrice,practiceStock:s.config.practiceStock,physicalStock:s.config.physicalStock}:{})};}
const stockFor=(s,id=s.shop.activeProductId)=>id==='dum-dum'?s.config:s.shop.products.find(p=>p.id===id);
export const orderProduct=r=>({id:r?.productId||'dum-dum',name:r?.productName||'Dum-Dums',unit:r?.productUnit||'sucker',plural:r?.productPlural||'suckers',art:r?.productArt||'dum-dum'});
const snapshot=(s,p=product(s))=>({productId:p.id,productName:p.name,productUnit:p.unit,productPlural:p.plural,productArt:p.art,week:s.shop.week});
const unlocked=s=>{if(s.round&&s.round.step!=='done')throw Error('Finish or cancel the current customer before changing settings.');};
export function selectProduct(s,id){unlocked(s);product(s,id);s.shop.activeProductId=id;}
export const orderLimit=(s,p=product(s))=>Math.min(s.shop.quantityLimit,s.config.level==='beginner'?3:5,p.practiceStock);
export function configureShop(s,input){unlocked(s);const week=text(input.week,60),quantityLimit=integer(input.quantityLimit,1,5,'Order limit');s.shop.week=week;s.shop.quantityLimit=quantityLimit;}
export function saveProduct(s,input){
 unlocked(s);let p=input.id?s.shop.products.find(p=>p.id===input.id):null;if(input.id&&!p)throw Error('Choose a listed product.');
 if(!p&&s.shop.products.length>=8)throw Error('Use one of the eight saved menu slots. Products can be renamed or hidden.');
 const fields={name:text(input.name,60),unit:text(input.unit,30),plural:text(input.plural,30),art:input.art,enabled:!!input.enabled};
 if(!fields.name||!fields.unit||!fields.plural||!ART.includes(fields.art))throw Error('Enter a product name, unit words and a listed picture.');
 const counts={unitPrice:integer(input.unitPrice,1,500,'Price in cents'),practiceStock:integer(input.practiceStock,0,999,'Practice quantity'),physicalStock:integer(input.physicalStock,0,999,'Physical quantity')};
 if(!p){p={id:'snack-'+uid(),...fields,...counts};s.shop.products.push(p);if(counts.physicalStock)s.stockMoves.push({id:uid(),at:now(),kind:'teacher-count',...snapshot(s,p),before:0,after:counts.physicalStock,detail:'Teacher entered a physical stock count.'});}
 else{const stock=stockFor(s,p.id);if(stock.physicalStock!==counts.physicalStock)s.stockMoves.push({id:uid(),at:now(),kind:'teacher-count',...snapshot(s,{...p,...fields}),before:stock.physicalStock,after:counts.physicalStock,detail:'Teacher entered a physical stock count.'});Object.assign(p,fields);Object.assign(stock,counts);}
 return p.id;
}
export function ricePilot(s){unlocked(s);s.shop.week=s.shop.week||'Rice Krispie pilot';s.shop.quantityLimit=1;s.shop.activeProductId='rice-treat';s.config.level='beginner';for(const p of s.shop.products)p.enabled=p.id==='rice-treat';stockFor(s).unitPrice=25;}
export function validateState(s){
 if(!s||s.version!==2||!Number.isInteger(s.revision)||s.revision<0)throw Error('Unrecognized Candy Counter data.');
 for(const k of ['workers','transactions','events','observations','stockMoves'])if(!Array.isArray(s[k]))throw Error('Incomplete Candy Counter data.');
 const c=s.config;if(!c||typeof c.realTracking!=='boolean'||!LEVELS[c.level]||typeof c.school!=='string'||typeof c.label!=='string')throw Error('Invalid Candy Counter settings.');
 integer(c.unitPrice,1,500,'Price');integer(c.practiceStock,0,999,'Practice stock');integer(c.physicalStock,0,999,'Physical stock');
 const shop=s.shop;if(!shop||typeof shop.week!=='string'||shop.week.length>60||!Array.isArray(shop.products)||shop.products.length<3||shop.products.length>8)throw Error('Invalid snack shop menu.');integer(shop.quantityLimit,1,5,'Order limit');
 const products=new Set();for(const p of shop.products){if(!p||typeof p.id!=='string'||!/^[-a-zA-Z0-9]+$/.test(p.id)||products.has(p.id)||typeof p.name!=='string'||!p.name||p.name.length>60||typeof p.unit!=='string'||!p.unit||p.unit.length>30||typeof p.plural!=='string'||!p.plural||p.plural.length>30||!ART.includes(p.art)||typeof p.enabled!=='boolean')throw Error('Invalid snack product.');products.add(p.id);if(p.id!=='dum-dum'){integer(p.unitPrice,1,500,'Price');integer(p.practiceStock,0,999,'Practice stock');integer(p.physicalStock,0,999,'Physical stock');}}
 if(!['dum-dum','rice-treat','cocoa',shop.activeProductId].every(id=>products.has(id)))throw Error('Missing saved product.');
 const ids=new Set();for(const w of s.workers){if(!w||typeof w.id!=='string'||!w.id||typeof w.label!=='string'||!w.label||!ROLES.includes(w.role)||ids.has(w.id))throw Error('Invalid worker record.');ids.add(w.id);}
 if(s.activeWorkerId&&!ids.has(s.activeWorkerId))throw Error('Unknown active worker.');
 for(const list of [s.events,s.observations,s.stockMoves,s.transactions])for(const r of list)if(!r||typeof r.id!=='string'||!r.id||!Number.isFinite(Date.parse(r.at)))throw Error('Invalid activity record.');
 for(const r of [...s.events,...s.observations,...s.stockMoves,...s.transactions,...(s.round?[s.round]:[])]){
  if(r.productId!==undefined&&(!products.has(r.productId)||typeof r.productName!=='string'||!r.productName||r.productName.length>60||typeof r.productUnit!=='string'||!r.productUnit||r.productUnit.length>30||typeof r.productPlural!=='string'||!r.productPlural||r.productPlural.length>30||!ART.includes(r.productArt)))throw Error('Invalid saved product snapshot.');
  if(r.week!==undefined&&(typeof r.week!=='string'||r.week.length>60))throw Error('Invalid saved week.');
 }
 for(const t of s.transactions){integer(t.qty,1,5);integer(t.unitPrice,1,500);integer(t.total,1,2500);integer(t.tender,t.total,2600);integer(t.change,0,100);if(t.total!==t.qty*t.unitPrice||t.change!==t.tender-t.total)throw Error('Invalid sale totals.');}
 if(s.round){const r=s.round;if(!STEPS.includes(r.step)||!LEVELS[r.level]||typeof r.id!=='string'||!Array.isArray(r.paymentTouched)||!Array.isArray(r.changeBag)||!Array.isArray(r.helpSteps))throw Error('Invalid saved customer order.');integer(r.qty,1,5);integer(r.unitPrice,1,500);integer(r.packed,0,5);integer(r.tender,r.qty*r.unitPrice,2600);if(r.changeBag.some(id=>!DENOMS.includes(id)))throw Error('Invalid saved coins.');}
 return s;
}
export function createStore(storage,key='ttCandyCounter:v1'){
 let s=freshState(),baseline=null,durable=true,blocked=false,notice='Saved on this device. Use student codes on shared devices; export a backup before clearing browser data.';
 try{baseline=storage.getItem(key);if(baseline!==null)s=upgradeState(JSON.parse(baseline));}catch(e){if(baseline!==null){blocked=true;notice='Saved Candy Counter data could not be read. It has been preserved. Export the saved data before asking for help.';}else{durable=false;notice='Device saving is unavailable. Keep this tab open and export or print before leaving.';}}
 return {
  read:()=>copy(s),notice:()=>notice,blocked:()=>blocked,
  raw:()=>baseline,
  update(fn){
   if(blocked)throw Error(notice);
   if(durable){let current;try{current=storage.getItem(key);}catch{durable=false;}if(durable&&current!==baseline)throw Error('Another tab changed Candy Counter. Reload this page before continuing so records are not overwritten.');}
   const next=copy(s),result=fn(next);next.revision++;validateState(next);
   if(durable){try{const raw=JSON.stringify(next);storage.setItem(key,raw);baseline=raw;}catch{durable=false;notice='Saving failed. This tab still holds your records. Export or print before leaving.';}}
   s=next;return result;
  }
 };
}
export const worker=s=>s.workers.find(w=>w.id===s.activeWorkerId);
function actor(s){const w=worker(s);if(!w)throw Error('Choose a worker first.');return {workerId:w.id,worker:w.label,role:w.role};}
function event(s,action,detail,correct=null){const r=s.round?.step==='done'&&['rotation','role','support-request'].includes(action)?null:s.round;const e={id:uid(),at:now(),...actor(s),...snapshot(s),...(r?{...snapshot(s,orderProduct(r)),week:r.week||''}:{}),school:r?.school||s.config.school,location:r?.location||s.config.label,roundId:r?.id||'',step:r?.step||'team',level:r?.level||s.config.level,action,detail,correct,helpUsed:!!r?.helpSteps.includes(r.step)};s.events.push(e);return e;}
function step(s,name){if(!s.round||s.round.step!==name)throw Error('Finish the current step first.');actor(s);return s.round;}
export function addWorker(s,label){label=text(label,40);if(!label)throw Error('Enter a student code or first name.');if(s.workers.some(w=>w.label.toLocaleLowerCase()===label.toLocaleLowerCase()))throw Error('That worker is already here. Choose them from the list.');if(s.workers.length>=24)throw Error('This counter supports 24 workers per device.');const w={id:uid(),label,role:ROLES[s.workers.length%3]};s.workers.push(w);s.activeWorkerId=w.id;return w.id;}
export function setActive(s,id){if(!s.workers.some(w=>w.id===id))throw Error('Choose a listed worker.');s.activeWorkerId=id;}
export function setRole(s,role){if(!ROLES.includes(role))throw Error('Choose a listed responsibility.');worker(s).role=role;event(s,'role','Changed responsibility to '+role);}
export function rotateRoles(s){if(s.round&&s.round.step!=='done')throw Error('Finish or cancel this customer before rotating.');actor(s);for(const w of s.workers)w.role=ROLES[(ROLES.indexOf(w.role)+1)%3];event(s,'rotation','Team responsibilities rotated. Only recorded actions count as individual participation.');}
export function configure(s,input){
 unlocked(s);
 const next={unitPrice:integer(input.unitPrice,1,500,'Price in cents'),practiceStock:integer(input.practiceStock,0,999,'Practice quantity'),physicalStock:integer(input.physicalStock,0,999,'Physical quantity'),realTracking:!!input.realTracking,level:input.level,school:text(input.school),label:text(input.label)};
 if(!LEVELS[next.level])throw Error('Choose a support level.');if(!next.school||!next.label)throw Error('Enter a school and table label.');
 const stock=stockFor(s);if(next.physicalStock!==stock.physicalStock)s.stockMoves.push({id:uid(),at:now(),kind:'teacher-count',...snapshot(s),before:stock.physicalStock,after:next.physicalStock,detail:'Teacher entered a physical stock count.'});Object.assign(stock,{unitPrice:next.unitPrice,practiceStock:next.practiceStock,physicalStock:next.physicalStock});Object.assign(s.config,{realTracking:next.realTracking,level:next.level,school:next.school,label:next.label});
}
export function moneyTotal(bag){if(!Array.isArray(bag)||bag.some(id=>!DENOMS.includes(id)))throw Error('Choose a pictured coin or bill.');return bag.reduce((a,id)=>a+MONEY[id].cents,0);}
export function moneyBag(cents){integer(cents,0,2600,'Money');const bag=[];for(const id of DENOMS)while(cents>=MONEY[id].cents){bag.push(id);cents-=MONEY[id].cents;}return bag;}
export function startRound(s,random=Math.random){
 const p=product(s),max=orderLimit(s,p),n=Math.max(0,Math.min(.999999,Number(random())||0));return openOrder(s,p,1+Math.floor(n*max),'practice','');
}
export function startCustomerOrder(s,input){const p=product(s,input.productId),qty=integer(input.qty,1,Math.max(1,orderLimit(s,p)),'Order quantity'),ticket=text(input.ticket,8);if(ticket&&!/^\d{1,8}$/.test(ticket))throw Error('Use a customer number, not a name.');return openOrder(s,p,qty,'classmate',ticket);}
function openOrder(s,p,qty,source,customerTicket){
 actor(s);if(s.round&&s.round.step!=='done')throw Error('Finish or cancel this customer first.');if(!p.enabled)throw Error('That product is not on this week’s menu.');if(p.practiceStock<1)throw Error('Practice stock is empty. Ask your teacher to refill it.');if(qty>orderLimit(s,p))throw Error('Choose a quantity within this order limit.');s.shop.activeProductId=p.id;
 const total=qty*p.unitPrice;
 const tender=s.config.level==='change'?(Math.floor(total/100)+1)*100:total;
 s.round={id:uid(),startedAt:now(),...snapshot(s,p),source,customerTicket,maxQty:orderLimit(s,p),step:'order',qty,unitPrice:p.unitPrice,tender,level:s.config.level,school:s.config.school,location:s.config.label,packed:0,paymentTouched:[],changeBag:[],helpSteps:[]};event(s,'start',source==='classmate'?'Received a classmate customer ticket.':'Opened a practice customer order.');return s.round;
}
export function requestSupport(s,kind){const requests={show:'Please show me.',break:'I need a break.',job:'I would like a different job.'};if(!requests[kind])throw Error('Choose a listed support request.');event(s,'support-request',requests[kind]);return requests[kind];}
export function askHelp(s){if(!s.round||['done','review'].includes(s.round.step))return;if(!s.round.helpSteps.includes(s.round.step))s.round.helpSteps.push(s.round.step);event(s,'help','Requested picture/model help. Assistance actually provided requires a teacher observation.');}
export function chooseOrder(s,n){const r=step(s,'order'),correct=n===r.qty;event(s,'order',`Selected ${n} ${orderProduct(r).plural}; customer requested ${r.qty}.`,correct);if(correct)r.step='pack';return correct;}
export function pack(s,delta){const r=step(s,'pack');if(![1,-1].includes(delta))throw Error('Use add or return.');if(r.packed+delta<0||r.packed+delta>5)throw Error('The tray holds up to five practice items.');r.packed+=delta;event(s,'pack',`Order tray now holds ${r.packed} ${orderProduct(r).plural}.`);return r.packed;}
export function checkPacked(s){const r=step(s,'pack'),correct=r.packed===r.qty;event(s,'inventory',`Packed ${r.packed}; order needs ${r.qty}.`,correct);if(correct)r.step='coin';return correct;}
export const targetCoin=r=>moneyBag(r.qty*r.unitPrice).find(id=>MONEY[id].kind==='coin')||'quarter';
export function identifyCoin(s,id){const r=step(s,'coin'),correct=id===targetCoin(r);event(s,'identify-coin',`Selected ${MONEY[id]?.name||'unknown'}; target ${MONEY[targetCoin(r)].name}.`,correct);if(correct)r.step='payment';return correct;}
export function touchPayment(s,index){const r=step(s,'payment'),bag=moneyBag(r.tender);integer(index,0,bag.length-1);if(r.paymentTouched.includes(index))return null;if(index!==r.paymentTouched.length)throw Error('Touch the next money picture from left to right.');r.paymentTouched.push(index);const amount=moneyTotal(bag.slice(0,index+1));event(s,'count-payment',`Touched ${MONEY[bag[index]].name}; running total ${dollars(amount)}.`);return amount;}
export function checkPayment(s,amount){const r=step(s,'payment');if(r.paymentTouched.length!==moneyBag(r.tender).length)throw Error('Touch every money picture before choosing the payment total.');const correct=amount===r.tender;event(s,'payment-total',`Selected ${dollars(amount)}; payment is ${dollars(r.tender)}.`,correct);if(correct)r.step='change';return correct;}
export function changeCoin(s,id){const r=step(s,'change');if(!DENOMS.includes(id))throw Error('Choose a pictured coin or bill.');if(r.changeBag.length>=120)throw Error('The tray is full. Return some money and try a larger coin.');r.changeBag.push(id);event(s,'change-coin',`Added ${MONEY[id].name} to change tray.`);}
export function undoChange(s){const r=step(s,'change');if(r.changeBag.length){r.changeBag.pop();event(s,'return-change','Returned the last change picture.');}}
export function checkChange(s){const r=step(s,'change'),amount=moneyTotal(r.changeBag),due=r.tender-r.qty*r.unitPrice,correct=amount===due;event(s,'make-change',`Selected ${dollars(amount)} change; ${dollars(due)} due.`,correct);if(correct)r.step='review';return correct;}
export function completeSale(s){
 if(s.round?.step==='done')return s.transactions.find(t=>t.id===s.round.id);
 const r=step(s,'review'),stock=stockFor(s,r.productId||'dum-dum');if(!stock||stock.practiceStock<r.qty)throw Error('Not enough practice stock. Ask the teacher to check the stock.');
 event(s,'complete','Completed a simulated snack transaction.',true);
 const t={id:r.id,at:now(),...snapshot(s,orderProduct(r)),week:r.week||'',source:r.source||'practice',customerTicket:r.customerTicket||'',school:r.school,location:r.location,qty:r.qty,unitPrice:r.unitPrice,total:r.qty*r.unitPrice,tender:r.tender,change:r.tender-r.qty*r.unitPrice,level:r.level,physicalApplied:null,actors:[...new Set(s.events.filter(e=>e.roundId===r.id).map(e=>e.workerId))]};
 s.transactions.push(t);stock.practiceStock-=r.qty;r.step='done';return t;
}
export function cancelRound(s){if(s.round&&s.round.step!=='done')event(s,'cancel','Customer canceled. No sale or stock deduction.');s.round=null;}
export function observe(s,input){
 if(!s.workers.some(w=>w.id===input.workerId))throw Error('Choose a worker to observe.');
 const note=text(input.note,2000),reviewer=text(input.reviewer,80),next=text(input.next,1000),supports=['Independent','Verbal cue','Picture/model','Hands-on help','Not assessed'];
 if(!note||!reviewer||!supports.includes(input.support)||!input.confirmed)throw Error('Enter an observation, support level, and reviewer; confirm that you observed this student.');
 const o={id:uid(),at:now(),...snapshot(s),workerId:input.workerId,note,next,reviewer,support:input.support,school:s.config.school,location:s.config.label,source:'teacher-reviewed'};s.observations.push(o);return o;
}
export function applyPhysicalSale(s,id,reviewer,confirmed){
 if(!s.config.realTracking)throw Error('Physical stock tracking is off.');reviewer=text(reviewer,80);if(!reviewer||!confirmed)throw Error('Enter the teacher name and confirm an actual physical handoff.');
 const t=s.transactions.find(t=>t.id===id);if(!t)throw Error('Choose a completed practice transaction.');if(t.physicalApplied)throw Error('Physical stock was already recorded for this sale.');const stock=stockFor(s,t.productId||'dum-dum');if(!stock||stock.physicalStock<t.qty)throw Error('Physical stock is too low. Check the actual product before recording a handoff.');
 const before=stock.physicalStock;stock.physicalStock-=t.qty;t.physicalApplied={at:now(),reviewer};s.stockMoves.push({id:uid(),at:t.physicalApplied.at,kind:'confirmed-handoff',...snapshot(s,orderProduct(t)),week:t.week||'',transactionId:id,qty:t.qty,before,after:stock.physicalStock,reviewer});
}
export const centralDay=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
export function reportData(s,{day='',workerId='',week=''}={}){
 const inDay=x=>(!day||centralDay(x.at)===day)&&(!week||x.week===week),own=x=>!workerId||x.workerId===workerId;
 const transactions=s.transactions.filter(t=>inDay(t)&&(!workerId||t.actors.includes(workerId))),events=s.events.filter(e=>inDay(e)&&own(e)),observations=s.observations.filter(o=>inDay(o)&&own(o));
 return {transactions,events,observations,stockMoves:s.stockMoves.filter(inDay),totals:transactions.reduce((a,t)=>({sales:a.sales+1,qty:a.qty+t.qty,total:a.total+t.total,tender:a.tender+t.tender,change:a.change+t.change}),{sales:0,qty:0,total:0,tender:0,change:0})};
}
