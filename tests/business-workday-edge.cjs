const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{stripTypeScriptTypes}=require('node:module');
const rows=[];let handler,checks=0,forceConflict=false;
function eq(a,b,msg){assert.deepEqual(a,b,msg);checks++;}
async function transport(url,opts={}){
 const u=new URL(url);if(u.pathname.endsWith('/town-room'))return Response.json(JSON.parse(opts.body).code==='TEST-CLASS'?{contacts:[]}:{error:'Invalid code'},{status:JSON.parse(opts.body).code==='TEST-CLASS'?200:403});
 if(!u.pathname.endsWith('/tt_shop_workspaces'))return Response.json([]);
 const found=rows.filter(r=>['scope','shop','revision'].every(k=>!u.searchParams.has(k)||String(r[k])===u.searchParams.get(k).slice(3)));
 if((opts.method||'GET')==='GET')return Response.json(found);
 const data=JSON.parse(opts.body);
 if(opts.method==='POST'){if(rows.some(r=>r.shop===data.shop&&r.scope===data.scope))return Response.json({}, {status:409});rows.push(structuredClone(data));return Response.json([data]);}
 if(opts.method==='PATCH'){if(forceConflict){forceConflict=false;return Response.json([]);}for(const r of found)Object.assign(r,structuredClone(data));return Response.json(found);}
 throw Error('Unexpected REST method');
}
const context=vm.createContext({console,crypto,TextEncoder,Response,Request,URL,AbortSignal,setTimeout,clearTimeout,fetch:transport,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://fixture.invalid':'fixture-service-key'},serve:fn=>handler=fn}});
const sourcePath=path.resolve('supabase/functions/student-shop-work/index.ts'),source=fs.readFileSync(sourcePath,'utf8');for(const match of source.matchAll(/^import '(.+)';$/gm))vm.runInContext(fs.readFileSync(path.resolve(path.dirname(sourcePath),match[1]),'utf8'),context);
vm.runInContext(stripTypeScriptTypes(source.replace(/^import .*;\n/gm,''),{mode:'transform'}),context);
async function call(shop,action,requestId=crypto.randomUUID(),extra={}){const r=await handler(new Request('https://fixture.invalid/functions/v1/student-shop-work',{method:'POST',body:JSON.stringify({shop,code:'TEST-CLASS',workspace:'qa-room',action,requestId,...extra})}));return {status:r.status,...await r.json()};}
(async()=>{
 eq((await call('cool-vibes',{type:'read'},undefined,{code:'WRONG'})).status,403);
 eq((await call('no-such-shop',{type:'read'})).status,400);
 eq((await call('cool-vibes',{type:'read'},undefined,{workspace:'../other'})).status,400);
 const initial=await call('cool-vibes',{type:'read'});eq(initial.status,200);eq(initial.revision,0);
 const claim=await call('cool-vibes',{type:'wd-claim',task:'open-safety',actor:'Olivia',device:'chromebook-a'});eq(claim.status,200);eq(claim.revision,1);
 eq((await call('cool-vibes',{type:'wd-claim',task:'open-safety',actor:'Kaylee',device:'chromebook-b'})).status,400);
 const st=claim.state.workday.tasks[0].steps[0],id=crypto.randomUUID(),action={type:'wd-step',task:'open-safety',step:st.id,actor:'Olivia',device:'chromebook-a',tool:st.tool,answer:st.answer};
 const correct=await call('cool-vibes',action,id);eq(correct.status,200);eq(correct.state.workday.tasks[0].progress,1);
 const retry=await call('cool-vibes',action,id);eq(retry.revision,correct.revision);eq(retry.state.workday.tasks[0].progress,1);
 eq((await call('cool-vibes',action)).status,400,'stale next-step action rejected');
 forceConflict=true;const recovery=await call('cool-vibes',{type:'wd-hint',task:'open-safety',actor:'Olivia',device:'chromebook-a'});eq(recovery.status,200);eq(recovery.state.workday.tasks[0].hints,1,'retry never applies same action twice');
 const other=await call('the-zoo',{type:'read'});eq(other.revision,0);eq(other.state.workday,undefined,'businesses have isolated shared state');
 const room=await call('cool-vibes',{type:'read'},undefined,{workspace:'another-room'});eq(room.revision,0,'workspaces isolated');
 eq((await call('cool-vibes',{type:'wd-start',actor:'Olivia',device:'chromebook-a'})).status,400,'opening checks enforced on server');
 console.log('PASS',checks,'shared Edge handler checks: authentication, isolation, leases, ordered steps, idempotency and conflict recovery.');
})().catch(e=>{console.error(e);process.exitCode=1});
