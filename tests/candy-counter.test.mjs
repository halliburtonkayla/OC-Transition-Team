import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../assets/candy-counter/core.mjs';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
const ready=(level='beginner')=>{const s=C.freshState();C.addWorker(s,'Worker A');s.config.level=level;return s;};
function finish(s){const r=s.round;C.chooseOrder(s,r.qty);for(let n=0;n<r.qty;n++)C.pack(s,1);assert.equal(C.checkPacked(s),true);C.identifyCoin(s,C.targetCoin(r));C.moneyBag(r.tender).forEach((_,i)=>C.touchPayment(s,i));C.checkPayment(s,r.tender);C.moneyBag(r.tender-r.qty*r.unitPrice).forEach(id=>C.changeCoin(s,id));C.checkChange(s);return C.completeSale(s);}
test('every supported price, order quantity, payment and change balances in whole cents',()=>{
 for(let price=1;price<=500;price++)for(let qty=1;qty<=5;qty++){
  const total=price*qty,tender=(Math.floor(total/100)+1)*100,change=tender-total;
  assert.equal(C.moneyTotal(C.moneyBag(total)),total);assert.equal(C.moneyTotal(C.moneyBag(tender)),tender);assert.equal(C.moneyTotal(C.moneyBag(change)),change);assert.ok(change>=1&&change<=100);
 }
});
test('teacher input rejects decimals, negative, blank, nonfinite and excessive values atomically',()=>{
 const store=C.createStore(memory());for(const value of ['',-1,0,501,1.5,'1.0',NaN,Infinity])assert.throws(()=>store.update(s=>C.configure(s,{...s.config,unitPrice:value})),/whole number/);
 assert.equal(store.read().config.unitPrice,5);assert.equal(store.read().revision,0);
 for(const key of ['practiceStock','physicalStock'])for(const val of [-1,1000,1.2,''])assert.throws(()=>store.update(s=>C.configure(s,{...s.config,[key]:val})),/whole number/);
});
test('students require identity; no overselling; beginner range adapts to stock',()=>{
 assert.throws(()=>C.startRound(C.freshState()),/worker/);
 for(const stock of [0,1,2,3,4,999]){const s=ready();s.config.practiceStock=stock;if(!stock)assert.throws(()=>C.startRound(s),/empty/);else {C.startRound(s,()=>1);assert.equal(s.round.qty,Math.min(3,stock));}}
 const s=ready('change');C.startRound(s,()=>1);assert.equal(s.round.qty,5);assert.throws(()=>C.startRound(s),/Finish/);assert.throws(()=>C.configure(s,s.config),/Finish/);
});
test('wrong orders, packing, coins, totals and change remain retryable with accurate evidence',()=>{
 const s=ready('change');C.startRound(s,()=>0);
 assert.equal(C.chooseOrder(s,2),false);assert.equal(s.round.step,'order');C.chooseOrder(s,1);
 assert.equal(C.checkPacked(s),false);C.pack(s,1);C.pack(s,1);assert.equal(C.checkPacked(s),false);C.pack(s,-1);assert.equal(C.checkPacked(s),true);
 const target=C.targetCoin(s.round);assert.equal(C.identifyCoin(s,C.DENOMS.find(id=>id!==target)),false);C.identifyCoin(s,target);
 assert.throws(()=>C.checkPayment(s,s.round.tender),/Touch every/);assert.throws(()=>C.touchPayment(s,1));
 C.touchPayment(s,0);const count=s.events.length;assert.equal(C.touchPayment(s,0),null);assert.equal(s.events.length,count);
 assert.equal(C.checkPayment(s,1),false);assert.equal(C.checkPayment(s,s.round.tender),true);
 C.changeCoin(s,'one');assert.equal(C.checkChange(s),false);C.undoChange(s);C.moneyBag(95).forEach(id=>C.changeCoin(s,id));assert.equal(C.checkChange(s),true);
 assert.equal(s.events.filter(e=>e.correct===false).length,6);assert.ok(s.events.every(e=>e.worker==='Worker A'));
});
test('a complete sale is idempotent and changes only practice stock, even with real tracking on',()=>{
 for(const tracking of [false,true]){const s=ready('change');s.config.realTracking=tracking;s.config.physicalStock=20;C.startRound(s,()=>.6);const originalStock=s.config.practiceStock,qty=s.round.qty,t=finish(s);assert.equal(s.config.practiceStock,originalStock-qty);assert.equal(s.config.physicalStock,20);assert.equal(t.total,t.tender-t.change);C.completeSale(s);assert.equal(s.transactions.length,1);assert.equal(s.config.practiceStock,originalStock-qty);}
});
test('physical handoffs require enabled tracking, teacher, confirmation, enough stock, and are single-use',()=>{
 const s=ready();C.startRound(s,()=>.7);const t=finish(s);assert.throws(()=>C.applyPhysicalSale(s,t.id,'Teacher',true),/off/);s.config.realTracking=true;
 assert.throws(()=>C.applyPhysicalSale(s,t.id,'',true),/teacher/);assert.throws(()=>C.applyPhysicalSale(s,t.id,'Teacher',false),/teacher/);assert.throws(()=>C.applyPhysicalSale(s,t.id,'Teacher',true),/too low/);
 s.config.physicalStock=10;C.applyPhysicalSale(s,t.id,'Teacher',true);assert.equal(s.config.physicalStock,10-t.qty);assert.equal(s.stockMoves.length,1);assert.throws(()=>C.applyPhysicalSale(s,t.id,'Teacher',true),/already/);assert.equal(s.config.physicalStock,10-t.qty);
});
test('canceling an order preserves evidence but never counts a sale or stock deduction',()=>{
 const s=ready();C.startRound(s);C.chooseOrder(s,0);C.askHelp(s);C.cancelRound(s);assert.equal(s.round,null);assert.equal(s.transactions.length,0);assert.equal(s.config.practiceStock,30);assert.equal(s.events.at(-1).action,'cancel');assert.ok(s.events.some(e=>e.action==='help'&&e.helpUsed));
});
test('role rotation and active-worker changes preserve individual evidence instead of crediting the team',()=>{
 const s=ready(),a=s.workers[0].id,b=C.addWorker(s,'Worker B'),c=C.addWorker(s,'Worker C');C.setActive(s,a);C.startRound(s,()=>0);C.chooseOrder(s,2);C.setActive(s,b);finish(s);assert.equal(s.transactions[0].actors.includes(c),false);assert.ok(s.transactions[0].actors.includes(a));assert.ok(s.transactions[0].actors.includes(b));const actions=s.events.map(e=>[e.workerId,e.role]);C.rotateRoles(s);assert.deepEqual(s.events.slice(0,actions.length).map(e=>[e.workerId,e.role]),actions);assert.equal(s.workers[0].role,'Inventory worker');
 const individual=C.reportData(s,{workerId:c});assert.equal(individual.events.length,0);assert.equal(individual.transactions.length,0);assert.equal(C.reportData(s,{workerId:a}).transactions.length,1);
});
test('teacher observation requires student, support, reviewer, note and observed confirmation',()=>{
 const s=ready(),input={workerId:s.activeWorkerId,support:'Picture/model',reviewer:'Teacher',note:'Counted two with picture cues.',next:'Repeat with one less cue.',confirmed:true};
 for(const field of ['workerId','support','reviewer','note','confirmed'])assert.throws(()=>C.observe(s,{...input,[field]:''}));
 C.observe(s,input);assert.equal(s.observations[0].source,'teacher-reviewed');assert.equal(s.events.length,0);assert.equal(s.observations[0].note,input.note);
});
test('refresh restores round, workers, saved transactions, physical tracking and reviews',()=>{
 const storage=memory(),a=C.createStore(storage);a.update(s=>{C.addWorker(s,'Worker A');C.startRound(s,()=>0);C.chooseOrder(s,1);C.pack(s,1);});const b=C.createStore(storage);assert.equal(b.read().round.step,'pack');assert.equal(b.read().round.packed,1);assert.equal(b.read().workers[0].label,'Worker A');
 b.update(s=>{C.checkPacked(s);C.identifyCoin(s,C.targetCoin(s.round));C.moneyBag(s.round.tender).forEach((_,i)=>C.touchPayment(s,i));C.checkPayment(s,s.round.tender);C.checkChange(s);C.completeSale(s);});assert.equal(C.createStore(storage).read().transactions.length,1);
});
test('conflicting tabs and corrupt saves cannot overwrite existing data',()=>{
 const storage=memory(),a=C.createStore(storage),b=C.createStore(storage);a.update(s=>C.addWorker(s,'Worker A'));assert.throws(()=>b.update(s=>C.addWorker(s,'Worker B')),/Another tab/);assert.equal(C.createStore(storage).read().workers[0].label,'Worker A');
 storage.setItem('ttCandyCounter:v1','{bad');const broken=C.createStore(storage);assert.equal(broken.blocked(),true);assert.throws(()=>broken.update(s=>C.addWorker(s,'Worker C')),/preserved/);assert.equal(storage.getItem('ttCandyCounter:v1'),'{bad');
});
test('storage failures retain activity in memory and disclose the saving limitation',()=>{
 const denied=C.createStore({getItem(){throw Error('denied')},setItem(){throw Error('denied')}});denied.update(s=>C.addWorker(s,'Worker A'));assert.equal(denied.read().workers.length,1);assert.match(denied.notice(),/unavailable/);
 const quota=C.createStore({getItem:()=>null,setItem(){throw Error('quota')}});quota.update(s=>C.addWorker(s,'Worker B'));quota.update(s=>C.startRound(s));assert.equal(quota.read().events.length,1);assert.match(quota.notice(),/Saving failed/);
});
test('report dates use Central Time and preserve complete integer reconciliations',()=>{
 const s=ready('change');C.startRound(s,()=>.9);const sale=finish(s);sale.at='2026-11-01T01:00:00Z';assert.equal(C.centralDay(sale.at),'2026-10-31');const report=C.reportData(s,{day:'2026-10-31'});assert.equal(report.totals.sales,1);assert.equal(report.totals.tender-report.totals.change,report.totals.total);assert.equal(C.reportData(s,{day:'2026-11-02'}).transactions.length,0);
});
test('standalone integration reuses coin art and preserves old games and business routes',()=>{
 const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),page=read('candy-counter.html');assert.match(page,/school-directory.html\?room=jobs/);assert.match(page,/money-counting-game.html/);assert.doesNotMatch(page,/session\.js|town-visit\.js|classroom-monitor\/student\.js|work-pay/);
 for(const file of ['cdc-center.html','student-businesses.html','assets/school-directory/catalogue.mjs'])assert.match(read(file),/candy-counter\.html/);
 assert.equal(JSON.parse(read('docs/school-inventory.json')).pages.find(p=>p.path==='candy-counter.html').room,'jobs');
 for(const id of C.DENOMS)assert.ok(fs.existsSync(new URL('../assets/money-match/'+C.MONEY[id].image,import.meta.url)));
});
