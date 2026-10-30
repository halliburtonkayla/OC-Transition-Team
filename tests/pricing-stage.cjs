const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module'),crypto=require('node:crypto').webcrypto;
for(const f of ['assets/student-businesses/catalog.js','assets/student-businesses/work-config.js','assets/main-attraction/studio-config.js','assets/student-businesses/work-core.js','assets/student-businesses/work-recipes.js','assets/student-businesses/work-ops-core.js','assets/main-attraction/service-core.js','assets/main-attraction/studio-core.js','assets/business-workday/core.js','assets/student-businesses/pricing-guard.js'])require('../'+f);
const C=global.TTBusinessCore,P=global.TTBusinessPricing;let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;},eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
for(const shop of ['3k-tire-shop','main-attraction']){
 const s=C.initial(shop),before=JSON.stringify(s);
 for(const type of ['prices','tire-prices','studio-prices','purchase','new-order','payment','tire-payment','tire-order','bank-transfer','pay-bill','payroll','owner-pay','staff','start-day','studio-start','studio-checkout','studio-tips','wd-start','complete-item','tire-complete','studio-step','open']){assert.throws(()=>C.reduce(s,{type,actor:'Miss Kayla',pricingApproval:{approved:true}},'pricing-check-'+type),/approve.*pricing stage/);checks++;}
 eq(JSON.stringify(s),before,'rejected commands cannot change balances, inventory or history');P.check(s,{type:'wd-read'});P.check(s,{type:'wd-step'});P.check({...s,pricingApproval:{approved:true}},{type:'prices'});
}
ok(!P.restricted(C.initial('cool-vibes')));ok(!P.restricted(C.initial('guardian-angel')));ok(!P.restricted(C.initial('the-zoo')));
let row={state:{...C.initial('3k-tire-shop'),cash:1234,log:[{message:'Historical record'}]},revision:7};let handler,writes=0,conflict=true;
async function transport(input,opts={}){
 const u=new URL(String(input)),method=opts.method||'GET',body=opts.body?JSON.parse(opts.body):null;
 if(u.pathname==='/auth/v1/user')return opts.headers.Authorization==='Bearer teacher-good'?Response.json({id:'qa-teacher',email:'qa@example.invalid',email_confirmed_at:'2026-01-01',is_anonymous:false}):Response.json({error:'Denied'},{status:401});
 if(u.pathname.endsWith('/functions/v1/town-room'))return Response.json({contacts:[]});
 if(u.pathname.endsWith('/tt_teacher_access'))return Response.json([{email:'qa@example.invalid'}]);
 if(u.pathname.endsWith('/tt_monitor_teacher_sessions'))return Response.json([]);
 if(u.pathname.endsWith('/tt_shop_workspaces')){
  if(method==='GET')return Response.json([structuredClone(row)]);
  if(method==='PATCH'){if(conflict){conflict=false;return Response.json([]);}row={...row,...body};writes++;return Response.json([row]);}
 }
 throw Error('Unexpected fixture request '+u.pathname);
}
const source=stripTypeScriptTypes(fs.readFileSync('supabase/functions/student-shop-work/index.ts','utf8').replace(/^import .*;\n/gm,''),{mode:'transform'});
const context=vm.createContext({console,crypto,TextEncoder,Response,Request,URL,AbortSignal,fetch:transport,TTBusinessCore:C,MAStudio:global.MAStudio,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://qa.invalid':'fixture-only'},serve:fn=>handler=fn}});vm.runInContext(source,context);
async function call(type,auth='',extra={}){const r=await handler(new Request('https://qa.invalid',{method:'POST',headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},body:JSON.stringify({shop:'3k-tire-shop',workspace:'classroom',action:{type,...extra}})}));return {status:r.status,...await r.json()};}
(async()=>{
 eq((await call('pricing-status')).status,403);eq((await call('teacher-approve-pricing','',{confirmed:true,actor:'Miss Kayla'})).status,403);eq(writes,0);eq((await call('teacher-approve-pricing','teacher-good')).status,400);eq((await call('teacher-approve-pricing','tt-pin-'+'a'.repeat(64),{confirmed:true})).status,403);eq((await call('pricing-status','teacher-good')).approved,false);
 const before=structuredClone(row);eq((await call('teacher-approve-pricing','teacher-good',{confirmed:true})).approved,true);eq(row.state.cash,before.state.cash);eq(row.state.log,before.state.log);eq(row.state.stock,before.state.stock);eq(row.revision,8);eq(writes,1,'approval retries use CAS and only one successful write');eq((await call('teacher-approve-pricing','teacher-good',{confirmed:true})).approved,true);eq(writes,1,'approval is idempotent');ok(P.restricted(before.state));ok(!P.restricted(row.state));
 console.log('PASS '+checks+' pricing-stage checks: both shops locked, forged actor rejected, teacher authentication, explicit confirmation, CAS retry, idempotency and exact balance/history preservation. No production records used.');
})().catch(e=>{console.error(e);process.exitCode=1;});
