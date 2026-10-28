const assert=require('node:assert/strict');
for(const file of ['../assets/student-businesses/catalog.js','../assets/student-businesses/work-config.js','../assets/main-attraction/studio-config.js','../assets/student-businesses/work-core.js','../assets/student-businesses/work-recipes.js','../assets/student-businesses/work-ops-core.js','../assets/main-attraction/service-core.js','../assets/main-attraction/studio-core.js','../assets/business-workday/core.js','../assets/business-workday/payday-core.js'])require(file);
const C=global.TTBusinessCore,W=global.TTWorkday;let seq=0,checks=0;
const now=1800000000000;
function act(s,a,t=now){return C.reduce(s,{actor:'Practice worker',device:'device-a',...a},'wd-test-'+(++seq),t);}
function expectThrow(s,a,re,t=now){assert.throws(()=>act(s,a,t),re);checks++;}
function proof(st,bookings=[]){const a={tool:st.tool};if(['verify','choice','measure'].includes(st.mode))a.answer=st.answer;
 if(['place','paint','sequence','route','sweep'].includes(st.mode))a.targets=st.mode==='sweep'?W.ALLCELLS:st.targets;
 if(st.mode==='hold')a.elapsed=st.milliseconds;if(st.mode==='rotate')a.rotation=Math.PI*2;
 if(st.mode==='book')a.answer=st.slots.find(slot=>!bookings.some(b=>b.slot===slot));
 if(st.mode==='cash'){a.pieces=[];a.counts=[];let change=st.tender-st.total,total=st.total;for(const n of W.DENOMS)while(change>=n){a.pieces.push(n);change-=n;total+=n;a.counts.push((total/100).toFixed(2));}}
 return a;
}
function complete(s,id,t=now){let w=W.init(s),task=w.tasks.find(x=>x.id===id);s=act(s,{type:'wd-claim',task:id},t);for(let p=task.progress;p<task.steps.length;p++){w=W.init(s);task=w.tasks.find(x=>x.id===id);const st=task.steps[task.progress];s=act(s,{type:'wd-step',task:id,step:st.id,...proof(st,w.bookings)},t);}return s;}
function opened(shop){let s=C.initial(shop);W.init(s);expectThrow(s,{type:'wd-start',children:5},/opening/);for(const task of [...s.workday.tasks])s=complete(s,task.id);assert.ok(s.workday.certificate);checks++;return s;}
for(const shop of Object.keys(W.shops)){
 let s=opened(shop);s=act(s,{type:'wd-start',children:10});assert.equal(s.workday.active,true);assert.equal(s.workday.tasks.some(t=>t.station==='Cash register'),true);checks+=2;
 if(shop==='guardian-angel'){assert.equal(s.workday.roster.length,10);assert.equal(s.workday.tasks.filter(t=>t.checkIn).length,10);assert.equal(s.workday.tasks.filter(t=>t.checkOut).length,10);checks+=3;}
 let watchdog=0;
 while(s.workday.tasks.some(t=>t.status!=='done')&&watchdog++<150){const w=s.workday,t=w.tasks.find(t=>t.status!=='done'&&(t.depends||[]).every(id=>w.tasks.find(x=>x.id===id)?.status==='done'));assert.ok(t,'Task dependency graph is completable');const at=now+Math.ceil(t.due/720*600000)+10;s=complete(s,t.id,at);}
 assert.ok(watchdog<150);assert.ok(s.workday.tasks.every(t=>t.status==='done'));checks+=2;
 s=act(s,{type:'wd-tick'},now+600001);assert.equal(s.workday.minute,720);assert.equal(s.workday.active,false);assert.equal(s.workday.reports.length,1);assert.equal(s.workday.inspection.simulation,true);assert.ok(s.workday.reports[0].actors[0].cashTransactions>0);checks+=5;
 if(shop==='guardian-angel'){assert.ok(s.workday.roster.every(c=>c.status==='picked up'));assert.ok(s.workday.tasks.filter(t=>t.weekly).every(t=>t.paid));checks+=2;}
 const sale=s.sales;s=act(s,{type:'wd-tick'},now+600005);assert.equal(s.sales,sale);assert.equal(s.workday.reports.length,1);checks+=2;
}
let s=opened('3k-tire-shop');s=act(s,{type:'wd-start'});s=act(s,{type:'wd-claim',task:'vehicle-1'});expectThrow(s,{type:'wd-claim',task:'vehicle-1',device:'device-b'},/working/);expectThrow(s,{type:'wd-step',task:'vehicle-1',step:'ppe',tool:'Protective equipment',targets:['work']},/teammate/);expectThrow(s,{type:'wd-step',task:'vehicle-1',step:'authorize',tool:'Work card',answer:'Unauthorized work'},/Compare/);expectThrow(s,{type:'wd-step',task:'vehicle-1',step:'authorize',tool:'Work card',answer:'One tire replacement',device:'device-b'},/Claim/);
s=act(s,{type:'wd-pause'},now+100000);s=act(s,{type:'wd-tick'},now+400000);assert.equal(s.workday.minute,120);s=act(s,{type:'wd-pause'},now+400000);s=act(s,{type:'wd-tick'},now+500000);assert.equal(s.workday.minute,240);checks+=2;
let cafe=opened('cool-vibes');cafe=act(cafe,{type:'wd-start'});cafe=complete(cafe,'cafe-order-1');cafe=act(cafe,{type:'wd-claim',task:'cafe-1'});cafe=act(cafe,{type:'wd-step',task:'cafe-1',step:'invoice',tool:'Work card',answer:'CAFE-1'});
const cash=cafe.workday.tasks.find(t=>t.id==='cafe-1').steps[1],a={type:'wd-step',task:'cafe-1',step:'cash',...proof(cash)};expectThrow(cafe,{...a,counts:a.counts.map(()=>0)},/Count back/);expectThrow(cafe,{...a,pieces:[100]},/change due/);cafe=C.reduce(cafe,{actor:'Practice worker',device:'device-a',...a},'same-payment-request',now);const balance=cafe.cash;cafe=C.reduce(cafe,{actor:'Practice worker',device:'device-a',...a},'same-payment-request',now);assert.equal(cafe.cash,balance);checks++;
let early=opened('guardian-angel');early=act(early,{type:'wd-start',children:5});early=act(early,{type:'wd-end'},now+10000);assert.equal(early.workday.reports.length,1);assert.ok(early.workday.inspection.issues.length);expectThrow(early,{type:'wd-start',children:5},/correction/);for(const t of early.workday.tasks.filter(t=>t.afterShift))early=complete(early,t.id,now+10001);early=act(early,{type:'wd-start',children:5},now+11000);assert.equal(early.workday.day,2);early=act(early,{type:'wd-tick'},now+300000);assert.equal(early.workday.inspection.mid,true);checks+=4;
const P=global.TTPaydayCore;let world={residents:{Olivia:{checking:350,savings:60},'Miss Kayla':{checking:0},Guest:{checking:2000}}};world=P.award(world,['Olivia','Miss Kayla','Guest']);assert.equal(world.residents.Olivia.checking,2350);assert.equal(world.residents['Miss Kayla'].checking,2000);assert.equal(world.residents.Guest.checking,4000);assert.equal(world.residents.Olivia.savings,60);const copy=JSON.stringify(world);world=P.award(world,['Olivia','Miss Kayla','Guest']);assert.equal(JSON.stringify(world),copy);world.residents.Olivia.checking-=50;world=P.award(world,['Olivia']);assert.equal(world.residents.Olivia.checking,2300);assert.equal(world.residents.Guest.paydayEvents[P.campaign.id].amount,2000);checks+=7;
console.log('PASS',checks,'workday, teamwork, attendance, cash, inspections, clock and one-time payday checks; all five complete shifts.');
