const assert=require('node:assert/strict');
for(const f of ['student-businesses/catalog','student-businesses/work-config','main-attraction/studio-config','student-businesses/work-core','student-businesses/work-recipes','student-businesses/work-ops-core','main-attraction/service-core','main-attraction/studio-core','business-workday/core','business-workday/rehearsal-core','student-businesses/pricing-guard','business-workday/rehearsal-ui'])require('../assets/'+f+'.js');
const C=global.TTBusinessCore,R=global.TTBusinessRehearsal,P=global.TTBusinessPricing;
let checks=0,next=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const act=(s,a,id='rehearsal-test-'+(++next))=>C.reduce(s,a,id,1793460000000+next);
const original=s=>{s=structuredClone(s);delete s.rehearsal;delete s.seen;return s;};
for(const shop of Object.keys(global.TTWorkday.shops)){
 let s=C.initial(shop);s.cash=123.45;s.bank.savings=54.32;s.bank.ownerPay={'Existing owner':67.89};
 s.bank.ledger.push({id:'historical-transaction',amount:12.34});s.audit.push({by:'Existing worker',message:'Prior activity'});s.orders.push({id:'existing-order',status:'waiting'});
 global.TTWorkday.init(s);s.workday.reports.push({day:2,actors:[{actor:'Existing worker',steps:4}]});
 s.workday.tasks[0].progress=1;s.workday.tasks[0].claim={device:'previous-approved-device',actor:'Prior worker',until:1793470000000};
 const before=structuredClone(s),serialized=JSON.stringify(s),id='rehearsal-start-'+shop;
 s=act(s,{type:'rehearsal-start',actor:'Worker A',cash:99999,stock:{}},id);
 eq(JSON.stringify(before),serialized,'input is never mutated');eq(original(s),original(before),'start preserves every existing field');
 eq(act(s,{type:'rehearsal-start'},id),s,'start retry is idempotent');
 assert.throws(()=>act(s,{type:'rehearsal-start'}),/already in progress/);checks++;
 const run=R.current(s),card=R.card(shop),st=card.checks[0];
 s=act(s,{type:'rehearsal-answer',run:run.id,step:st.id,answer:st.options[1],actor:'Worker A'});
 eq(R.current(s).progress,0,'wrong choice records a retry without advancing');eq(R.rows(s).at(-1).result,'retry');
 s=act(s,{type:'rehearsal-hint',run:run.id,step:st.id,actor:'Worker B'});
 eq(R.rows(s).at(-1).actor,'Worker B');eq(R.rows(s).at(-1).result,'hint');
 const retryBefore=structuredClone(s);
 assert.throws(()=>act(s,{type:'rehearsal-answer',run:run.id,step:st.id,answer:'forged',actor:'Worker A'}),/Choose one/);checks++;
 eq(s,retryBefore,'invalid answer preserves all records');
 for(const [i,step] of card.checks.entries()){
  const id='rehearsal-answer-'+shop+'-'+i,a={type:'rehearsal-answer',run:run.id,step:step.id,answer:step.answer,actor:i%2?'Worker B':'Worker A'};
  s=act(s,a,id);eq(act(s,a,id),s,'repeated response is recorded once');
  assert.throws(()=>act(s,a),/teammate updated|changed or finished/);checks++;
 }
 eq(R.current(s),undefined);eq(s.rehearsal.runs[0].progress,5);eq(R.rows(s).length,7);
 eq(original(s),original(before),'full service rehearsal changes no prior money, inventory, orders, tasks, pricing or reports');
 eq(P.restricted(s),P.restricted(before),'pricing approval is unchanged');
 if(P.restricted(s)){for(const type of ['wd-start','purchase','payroll','owner-pay']){assert.throws(()=>act(s,{type}),/approve.*pricing stage/);checks++;}}
 if(shop==='cool-vibes'){
  const records=structuredClone(s.rehearsal);s=act(s,{type:'bank-transfer',actor:'Olivia',amount:1,direction:'to-savings'});
  eq(s.rehearsal,records,'existing financial operations retain new individual rehearsal history');
 }
 const resumed=JSON.parse(JSON.stringify(s));s=act(resumed,{type:'rehearsal-start',actor:'Worker B'});eq(s.rehearsal.runs[0],resumed.rehearsal.runs[0],'next rehearsal preserves the prior individual record');
 eq(R.rows(s).filter(e=>e.actor==='Worker A').length,4);
 const ui=global.TTBusinessRehearsalUI.html(s);assert.ok(ui.includes('data-rehearsal-answer'));assert.ok(ui.includes('not teacher observations'));checks+=2;
 const escaped=structuredClone(s);escaped.rehearsal.runs[0].events[0].actor='<img src=x onerror=alert(1)>';
 assert.ok(!global.TTBusinessRehearsalUI.html(escaped).includes('<img src=x'));checks++;
 eq(global.TTBusinessRehearsalUI.html(s,{shared:true,available:false}).includes('data-rehearsal="hint" disabled'),true,'old shared backend is gated without changing mode');
 const earlyBefore=original(s);s=act(s,{type:'rehearsal-end',run:R.current(s).id,actor:'Worker B'});
 eq(R.current(s),undefined);eq(s.rehearsal.runs.at(-1).endedEarly,true);eq(s.rehearsal.runs.at(-1).completedAt,null,'early review is not a completed service card');
 eq(original(s),earlyBefore);eq(R.rows(s).at(-1).result,'review');
}
let attempts=C.initial('the-zoo');attempts=act(attempts,{type:'rehearsal-start',actor:'Learner'});
const attemptRun=R.current(attempts),first=R.card('the-zoo').checks[0];
for(let i=0;i<100;i++)attempts=act(attempts,{type:'rehearsal-hint',run:attemptRun.id,step:first.id,actor:'Learner'});
assert.throws(()=>act(attempts,{type:'rehearsal-hint',run:attemptRun.id,step:first.id}),/Finish and review/);checks++;
attempts=act(attempts,{type:'rehearsal-end',run:attemptRun.id,actor:'Learner'});attempts=act(attempts,{type:'rehearsal-start',actor:'Learner'});
eq(attempts.rehearsal.runs[0].events.length,101,'review retains all attempts at the limit');eq(attempts.rehearsal.runs.length,2,'attempt limit has a usable continuation path');
let capped=C.initial('the-zoo');capped.rehearsal={version:1,runs:Array.from({length:100},(_,i)=>({id:'prior-'+i,completedAt:1,events:[]}))};
assert.throws(()=>act(capped,{type:'rehearsal-start'}),/Saved records have not been removed/);checks++;
eq(capped.rehearsal.runs.length,100,'history limit never drops records');
console.log('PASS',checks,'free-rehearsal checks: all shops, retry/help evidence, resumption, replay, staged pricing, exact existing-state preservation and escaped reports.');
