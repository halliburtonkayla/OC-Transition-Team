const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{JSDOM}=require(process.env.SCHOOL_JSDOM||'jsdom');
for(const file of ['student-businesses/catalog','student-businesses/work-config','main-attraction/studio-config','student-businesses/work-core','student-businesses/work-recipes','student-businesses/work-ops-core','main-attraction/service-core','main-attraction/studio-core','business-workday/core','business-workday/rehearsal-core','student-businesses/pricing-guard'])require('../assets/'+file+'.js');
const C=global.TTBusinessCore,R=global.TTBusinessRehearsal;let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const settle=async()=>{for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));};
const plain=x=>JSON.parse(JSON.stringify(x));
const original=s=>{s=plain(s);delete s.seen;delete s.rehearsal;return s;};
function harness(shop,{shared=false,oldBackend=false,saved=null}={}){
 const dom=new JSDOM(fs.readFileSync('business-workday.html','utf8'),{url:'https://fixture.invalid/business-workday.html?shop='+shop,runScripts:'outside-only'}),w=dom.window,events=[],spoken=[],requests=[],downloads=[],intervals=[];
 const seed=C.initial(shop);global.TTWorkday.init(seed);seed.cash=987.65;seed.bank.ledger.push({id:'historical-receipt',amount:7});seed.workday.reports.push({day:1,completed:2,simulatedMinutes:2,salesCents:700,evidence:'Prior practice',actors:[],incomplete:[],inspection:null});
 const key='ttShopWork_v1:'+shop+':Olivia';
 w.sessionStorage.setItem('ttCurrent','Olivia');w.localStorage.setItem('ttWorld','{"checking":4567,"students":{"Prior student":{"progress":9}}}');w.localStorage.setItem('prior-interviews','preserved transcript');w.localStorage.setItem(key,JSON.stringify(seed));
 if(saved)for(const[k,v]of Object.entries(saved))w.localStorage.setItem(k,v);
 if(shared){w.sessionStorage.setItem('ttShopClassCode','FIXTURE-ONLY');w.sessionStorage.setItem('ttMonitorDevice:Olivia','a'.repeat(64));}
 w.setInterval=fn=>(intervals.push(fn),intervals.length);w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.URL.createObjectURL=blob=>(downloads.push(blob),'blob:fixture');w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};w.print=()=>{};
 w.speechSynthesis={cancel(){},speak(u){spoken.push(u.text);}};w.SpeechSynthesisUtterance=function(text){this.text=text;};
 w.TTMonitor={record:(kind,summary,details)=>events.push({kind,summary,details})};w.TTSession={recordActivity(){}};
 let server=plain(seed),revision=0,loseResponse=false,offline=false;
 w.fetch=async(url,opts)=>{
  assert.ok(String(url).endsWith('/student-shop-work'));const body=JSON.parse(opts.body);requests.push(body);
  eq(body.deviceToken,'a'.repeat(64),'the existing approved-device token is reused');
  if(offline)throw Error('Fixture network interrupted');
  if(body.action.type!=='read'&&!server.seen.includes(body.requestId)){server=C.reduce(server,{...body.action,actor:'Olivia',device:'approved-device:fixture-a'},body.requestId);revision++;}
  if(loseResponse){loseResponse=false;throw Error('Fixture lost response after commit');}
  return {ok:true,json:async()=>({state:plain(server),revision,identity:{actor:'Olivia',device:'approved-device:fixture-a'},...(!oldBackend?{rehearsalVersion:1}:{})})};
 };
 for(const match of fs.readFileSync('business-workday.html','utf8').matchAll(/<script src="([^"?]+)[^"]*" defer><\/script>/g)){
  if(match[1]==='session.js')continue;vm.runInContext(fs.readFileSync(match[1],'utf8'),dom.getInternalVMContext(),{filename:match[1]});
 }
 return {dom,w,events,spoken,requests,downloads,intervals,key,seed,click:async selector=>{const b=w.document.querySelector(selector);assert.ok(b,selector);b.click();await settle();},loseNext(){loseResponse=true;},setOffline(v){offline=v;},get server(){return server;}};
}
(async()=>{
 for(const shop of Object.keys(global.TTWorkday.shops)){
  let h=harness(shop);const card=R.card(shop);await h.click('[data-rehearsal="start"]');
  eq(h.w.document.querySelectorAll('[data-rehearsal-answer]').length,2);eq(h.w.document.querySelector('#rehearsalPanel').open,true);
  const answer=async value=>{const b=[...h.w.document.querySelectorAll('[data-rehearsal-answer]')].find(b=>b.dataset.rehearsalAnswer===value);assert.ok(b);b.click();await settle();};
  await answer(card.checks[0].options[1]);eq(h.w.TTShopApp.state.rehearsal.runs[0].progress,0);
  await h.click('[data-rehearsal="hint"]');eq(h.spoken.length,1);eq(h.events.at(-1).kind,'action');
  for(let i=0;i<5;i++){
   if(i===2){const saved=Object.fromEntries(Object.entries(h.w.localStorage));h.dom.window.close();h=harness(shop,{saved});eq(h.w.TTShopApp.state.rehearsal.runs[0].progress,2,'reload resumes current service card');}
   await answer(card.checks[i].answer);
  }
  const state=plain(h.w.TTShopApp.state);eq(state.rehearsal.runs[0].events.length,7);eq(state.rehearsal.runs[0].progress,5);
  eq(h.w.document.querySelectorAll('#rehearsal tbody tr').length,7,'full individual response history survives reload');
  eq(original(state),original(h.seed),'DOM workflow preserves all prior business fields');
  eq(h.w.localStorage.getItem('ttWorld'),'{"checking":4567,"students":{"Prior student":{"progress":9}}}');eq(h.w.localStorage.getItem('prior-interviews'),'preserved transcript');
  await h.click('[data-rehearsal="csv"]');await h.click('[data-rehearsal="json"]');eq(h.downloads.length,2);
  eq(h.events.filter(e=>e.kind==='completed').length,3,'resumed device only emits newly completed steps');
  eq(h.events.at(-1).details.item,card.checks[4].answer);h.dom.window.close();
 }
 const h=harness('cool-vibes',{shared:true});await settle();eq(h.w.TTShopApp.shared,true);eq(h.w.document.querySelector('#worker').disabled,true);
 const opening=plain(h.w.TTShopApp.state.workday.tasks[0]),st=opening.steps[0];await h.click('[data-task="'+opening.id+'"]');
 eq(h.w.document.querySelectorAll('#workspace [data-tool]').length>0,true,'approved-device task claim renders the real workstation');
 await h.click('[data-tool="'+st.tool+'"]');await h.click('[data-choice="'+st.answer+'"]');await h.click('#finishStep');
 eq(h.w.TTShopApp.state.workday.tasks[0].progress,1,'existing opening work proceeds using server device identity');
 h.w.document.querySelector('#worker').value='Miss Kayla';h.w.document.querySelector('#worker').dispatchEvent(new h.w.Event('change',{bubbles:true}));eq(h.w.TTShopApp.actor,'Olivia','shared identity cannot be changed by the worker selector');
 h.loseNext();await h.click('[data-rehearsal="start"]');eq(h.w.TTShopApp.state.rehearsal,undefined);
 const failed=h.requests.at(-1);await h.click('[data-rehearsal="start"]');eq(h.requests.at(-1).requestId,failed.requestId,'lost response retries the original command');eq(h.server.rehearsal.runs.length,1);
 const card=R.card('cool-vibes'),button=[...h.w.document.querySelectorAll('[data-rehearsal-answer]')].find(b=>b.dataset.rehearsalAnswer===card.checks[0].answer);button.click();await settle();
 eq(h.events.at(-1).details.status,'correct');eq(h.events.at(-1).details.step,card.checks[0].prompt);eq(h.events.at(-1).details.scope,'shared classroom');
 h.setOffline(true);await h.intervals[1]();eq(h.w.TTShopApp.shared,true,'network loss never silently moves shared progress into solo');
 await h.click('[data-action="solo"]');eq(h.w.document.querySelector('#worker').disabled,false);eq(h.w.TTShopApp.state.rehearsal,undefined,'solo and shared records remain separate');h.dom.window.close();
 const review=harness('main-attraction');await review.click('[data-rehearsal="start"]');await review.click('[data-rehearsal="end"]');eq(review.w.TTShopApp.state.rehearsal.runs[0].completedAt,null);eq(review.w.document.querySelector('#rehearsalResult').textContent.includes('ended for review'),true);eq(review.events.at(-1).kind,'action');eq(review.events.at(-1).details.status,'review');review.dom.window.close();
 const old=harness('3k-tire-shop',{shared:true,oldBackend:true});await settle();eq(old.w.document.querySelector('[data-rehearsal="start"]').disabled,true);const count=old.requests.length;await old.click('[data-rehearsal="start"]');eq(old.requests.length,count,'no rehearsal commands are sent to the older service');eq(old.w.TTShopApp.shared,true);old.dom.window.close();
 console.log('PASS',checks,'DOM checks: all-five service cards, reload, audio/help, exports, individual events, personal-record preservation, approved task claims, offline replay and backend compatibility.');
})().catch(e=>{console.error(e);process.exitCode=1;});
