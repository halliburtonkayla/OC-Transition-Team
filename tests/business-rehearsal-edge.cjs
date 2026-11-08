const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module'),{createHash,webcrypto}=require('node:crypto');
const tokens={approved:'a'.repeat(64),other:'b'.repeat(64),pending:'c'.repeat(64),expired:'d'.repeat(64),revoked:'e'.repeat(64),unknown:'f'.repeat(64)};
const hash=t=>createHash('sha256').update('tt-monitor-v1:'+t).digest('hex');
const rows=[];let handler,writes=0,conflicts=0,forceConflict=false,checks=0,deviceQueries=0,readBarrier=null;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
function armReadBarrier(shop){let release;const promise=new Promise(resolve=>release=resolve);readBarrier={shop,reads:0,promise,release};}
async function transport(input,opts={}){
 const u=new URL(String(input)),method=opts.method||'GET',body=opts.body?JSON.parse(opts.body):null;
 if(u.pathname.endsWith('/town-room'))return Response.json(body.code==='TEST-CLASS'?{contacts:[]}:{error:'Denied'},{status:body.code==='TEST-CLASS'?200:403});
 if(u.pathname.endsWith('/tt_monitor_devices')){
  deviceQueries++;const kind=Object.keys(tokens).find(k=>'eq.'+hash(tokens[k])===u.searchParams.get('token_hash'));
  return Response.json(!kind||kind==='unknown'?[]:[{id:kind==='other'?'device-b':'device-a',student:kind==='other'?'Kaylee':'Olivia',approved_at:kind==='pending'?null:'2026-10-01',school:'Fixture school',expires_at:kind==='expired'?'2020-01-01':new Date(Date.now()+3600000).toISOString(),revoked_at:kind==='revoked'?'2026-10-31':null}]);
 }
 assert.ok(u.pathname.endsWith('/tt_shop_workspaces'),'rehearsals must use the one existing workspace table, never legacy ledgers or personal records');
 const found=rows.filter(r=>['scope','shop','revision'].every(k=>!u.searchParams.has(k)||String(r[k])===u.searchParams.get(k).slice(3)));
 if(method==='GET'){
  const snapshot=structuredClone(found),barrier=readBarrier;
  if(barrier?.shop===u.searchParams.get('shop')?.slice(3)){
   barrier.reads++;if(barrier.reads===2){readBarrier=null;barrier.release();}await barrier.promise;
  }
  return Response.json(snapshot);
 }
 if(method==='POST'){if(rows.some(r=>r.shop===body.shop&&r.scope===body.scope)){conflicts++;return Response.json({}, {status:409});}rows.push(structuredClone(body));writes++;return Response.json([body]);}
 if(method==='PATCH'){if(forceConflict){forceConflict=false;conflicts++;return Response.json([]);}if(!found.length)conflicts++;for(const r of found)Object.assign(r,structuredClone(body));writes+=found.length;return Response.json(found);}
 throw Error('Unexpected request '+method+' '+u.pathname);
}
const context=vm.createContext({console,crypto:webcrypto,TextEncoder,Response,Request,URL,AbortSignal,fetch:transport,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://fixture.invalid':'fixture-only-key'},serve:fn=>handler=fn}});
const sourcePath=path.resolve('supabase/functions/student-shop-work/index.ts'),source=fs.readFileSync(sourcePath,'utf8');
for(const match of source.matchAll(/^import '(.+)';$/gm))vm.runInContext(fs.readFileSync(path.resolve(path.dirname(sourcePath),match[1]),'utf8'),context);
vm.runInContext(stripTypeScriptTypes(source.replace(/^import .*;\n/gm,''),{mode:'transform'}),context);
async function call(shop,action,requestId=webcrypto.randomUUID(),extra={}){
 const r=await handler(new Request('https://fixture.invalid/functions/v1/student-shop-work',{method:'POST',body:JSON.stringify({shop,code:'TEST-CLASS',workspace:'qa-room',action:{actor:'FORGED',device:'FORGED',...action},requestId,deviceToken:tokens.approved,...extra})}));
 return {status:r.status,...await r.json()};
}
const original=s=>{s=structuredClone(s);delete s.rehearsal;delete s.seen;return s;};
(async()=>{
 for(const deviceToken of ['',tokens.pending,tokens.expired,tokens.revoked,tokens.unknown]){
  eq((await call('cool-vibes',{type:'rehearsal-start'},undefined,{deviceToken})).status,403);
  eq(writes,0,'unapproved devices cannot create rehearsal records');
 }
 eq((await call('cool-vibes',{type:'rehearsal-start'},undefined,{code:'WRONG'})).status,403);
 const C=context.TTBusinessCore,R=context.TTBusinessRehearsal;
 for(const shop of Object.keys(context.TTWorkday.shops)){
  const seed=JSON.parse(JSON.stringify(C.initial(shop)));seed.cash=1234.56;seed.bank.savings=432.10;seed.bank.ledger.push({id:'existing-receipt',amount:14});seed.stock['preserved-old-stock']=2;
  seed.workday={version:1,phase:'opening',tasks:[{id:'unfinished-old-task',status:'waiting'}],reports:[{day:1,actors:[{actor:'Prior student',steps:7}]}]};
  if(shop==='main-attraction'){delete seed.studio;delete seed.salon;delete seed.stock.polish;}
  rows.push({scope:'student-shop-work-v1:qa-room',shop,state:seed,revision:3});
  const before=structuredClone(seed),id=webcrypto.randomUUID(),priorWrites=writes;
  armReadBarrier(shop);const copies=await Promise.all([call(shop,{type:'rehearsal-start'},id),call(shop,{type:'rehearsal-start'},id)]);
  eq(copies.map(r=>r.status),[200,200]);eq(writes,priorWrites+1,'concurrent identical retries commit exactly once');
  let d=copies[0];eq(d.identity,{actor:'Olivia',device:'approved-device:device-a'});eq(d.rehearsalVersion,1);eq(d.state.rehearsal.runs[0].startedBy,'Olivia');
  eq(JSON.stringify(d.state).includes('FORGED'),false);
  const run=d.state.rehearsal.runs[0],card=JSON.parse(JSON.stringify(R.card(shop)));
  forceConflict=true;d=await call(shop,{type:'rehearsal-answer',run:run.id,step:card.checks[0].id,answer:card.checks[0].options[1]});
  eq(d.status,200);eq(d.state.rehearsal.runs[0].events.length,1,'CAS retry retains one correction');
  armReadBarrier(shop);const pair=await Promise.all([call(shop,{type:'rehearsal-answer',run:run.id,step:card.checks[0].id,answer:card.checks[0].answer}),call(shop,{type:'rehearsal-answer',run:run.id,step:card.checks[0].id,answer:card.checks[0].answer},undefined,{deviceToken:tokens.other})]);
  eq(pair.map(r=>r.status).sort(),[200,400],'concurrent teammates cannot advance the same step twice');
  d=pair.find(r=>r.status===200);
  for(const st of card.checks.slice(1)){
   const id=webcrypto.randomUUID();d=await call(shop,{type:'rehearsal-answer',run:run.id,step:st.id,answer:st.answer},id,{deviceToken:tokens.other});eq(d.status,200);
   const dup=await call(shop,{type:'rehearsal-answer',run:run.id,step:st.id,answer:st.answer},id,{deviceToken:tokens.other});eq(dup.revision,d.revision);
  }
  eq(d.state.rehearsal.runs[0].progress,5);eq(d.state.rehearsal.runs[0].events.at(-1).actor,'Kaylee');
  eq(original(d.state),original(before),'server preserves exact stock, finances, legacy salon record and unfinished shift history');
  if(['3k-tire-shop','main-attraction'].includes(shop))for(const type of ['wd-start','purchase','payroll'])eq((await call(shop,{type})).status,400,'financial commands stay locked after rehearsal');
  const next=await call(shop,{type:'rehearsal-start'},undefined,{workspace:'other-room'});eq(next.status,200);eq(next.state.rehearsal.runs.length,1,'another classroom workspace is isolated');
 }
 const read=await call('cool-vibes',{type:'read'});eq(read.identity.device,'approved-device:device-a');
 const claim=await call('cool-vibes',{type:'wd-claim',task:'unfinished-old-task'});eq(claim.status,200);eq(claim.state.workday.tasks[0].claim.device,claim.identity.device,'browser gets the same device identifier used by existing task leases');
 eq(deviceQueries>50,true,'approval is checked on every request, including retries');eq(conflicts>5,true,'real compare-and-swap conflicts were exercised');
 console.log('PASS',checks,'isolated Edge checks: approval/revocation/expiry, identity binding, five-shop preservation, concurrency, retries, one table and one ledger. No production records used.');
})().catch(e=>{console.error(e);process.exitCode=1;});
