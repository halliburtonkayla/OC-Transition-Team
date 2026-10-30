import '../../../assets/student-businesses/catalog.js';
import '../../../assets/student-businesses/work-config.js';
import '../../../assets/main-attraction/studio-config.js';
import '../../../assets/student-businesses/work-core.js';
import '../../../assets/student-businesses/work-recipes.js';
import '../../../assets/student-businesses/work-ops-core.js';
import '../../../assets/main-attraction/service-core.js';
import '../../../assets/main-attraction/studio-core.js';
import '../../../assets/business-workday/core.js';
import '../../../assets/student-businesses/pricing-guard.js';

// Reuse the current classroom/teacher code validation without copying any codes.
const Core=(globalThis as any).TTBusinessCore;
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type, authorization, apikey','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const verifiedCodes=new Map<string,number>();
async function authorize(code:string,base:string){
 if(!code||code.length>40)return false;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
 const digest=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
 if((verifiedCodes.get(digest)||0)>Date.now())return true;
 const r=await fetch(base+'/functions/v1/town-room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'directory',code}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)return false;
 const d=await r.json();if(!Array.isArray(d.contacts))return false;
 if(verifiedCodes.size>100)verifiedCodes.clear();verifiedCodes.set(digest,Date.now()+300000);return true;
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method!=='POST')return out({error:'Use POST.'},405);
 try{
  const raw=await req.text();if(raw.length>180000)return out({error:'Keep this order below 180,000 characters.'},413);
  let data;try{data=JSON.parse(raw);}catch{return out({error:'Send a valid shop request.'},400);}
  const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)return out({error:'The classroom service is temporarily unavailable.'},503);
  const pricingAction=['pricing-status','teacher-approve-pricing'].includes(data.action?.type);
  const code=String(data.code||'').trim().toUpperCase();if(!pricingAction&&!await authorize(code,base))return out({error:'That classroom town code did not work. Ask Miss Kayla for the current town code.'},403);
  const shop=String(data.shop||'');try{Core.config(shop);}catch{return out({error:'Choose a student business.'},400);}
  const workspace=String(data.workspace||'classroom');if(!/^[a-z0-9-]{1,50}$/.test(workspace))return out({error:'Invalid classroom work session.'},400);
  const scope='student-shop-work-v1:'+workspace;
  const query='tt_shop_workspaces?scope=eq.'+encodeURIComponent(scope)+'&shop=eq.'+encodeURIComponent(shop);
  const db=async(path:string,method='GET',body?:unknown)=>{
   const r=await fetch(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
   if(!r.ok){if(r.status===409)return {conflict:true,rows:[]};throw Error('STORAGE_UNAVAILABLE');}return {conflict:false,rows:r.status===204?[]:await r.json()};
  };
  if(pricingAction){
   if(!['3k-tire-shop','main-attraction'].includes(shop))return out({error:'This business does not use the staged pricing approval.'},400);
   const bearer=req.headers.get('authorization')||'';let teacherId='';
   if(/^Bearer tt-pin-[a-f0-9]{64}$/.test(bearer)){
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(bearer.slice(7))),digest=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
    const rows=(await db('tt_monitor_teacher_sessions?token_hash=eq.'+digest+'&revoked_at=is.null&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&limit=1')).rows;
    if(rows[0]&&(await db('tt_monitor_pin_settings?id=eq.true&teacher_id=eq.'+rows[0].teacher_id+'&select=teacher_id')).rows.length)teacherId=rows[0].teacher_id;
   }else if(bearer.startsWith('Bearer ')){
    const r=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:bearer},signal:AbortSignal.timeout(12000)});
    if(r.ok){const u=await r.json();if(u.id&&u.email_confirmed_at&&!u.is_anonymous&&(await db('tt_teacher_access?email=eq.'+encodeURIComponent(String(u.email).toLowerCase())+'&select=email')).rows.length)teacherId=u.id;}
   }
   if(!teacherId)return out({error:'Verified teacher sign-in is required to review or approve pricing.'},403);
   for(let attempt=0;attempt<5;attempt++){
    const row=(await db(query+'&select=state,revision')).rows[0],state=row?.state||Core.initial(shop);
    if(data.action.type==='pricing-status')return out({approved:state.pricingApproval?.approved===true,approvedAt:state.pricingApproval?.at||null});
    if(data.action.confirmed!==true)return out({error:'Confirm that you reviewed this group’s pricing stage before approving.'},400);
    if(state.pricingApproval?.approved===true)return out({approved:true,approvedAt:state.pricingApproval.at});
    state.pricingApproval={approved:true,by:teacherId,at:new Date().toISOString()};
    const result=row?await db(query+'&revision=eq.'+row.revision,'PATCH',{state,revision:row.revision+1,updated_at:new Date().toISOString()}):await db('tt_shop_workspaces','POST',{scope,shop,state,revision:1});
    if(result.rows.length)return out({approved:true,approvedAt:state.pricingApproval.at});
   }
   return out({error:'The business changed. Refresh and review again.'},409);
  }
  const hiredRows=async(employee?:string)=>{
   const filter='tt_interview_decisions_latest?select=applicant_id,applicant_name&shop_id=eq.'+encodeURIComponent(shop)+'&decision=eq.Hired&limit=200'+(employee?'&applicant_id=eq.'+encodeURIComponent(employee):'');
   return (await db(filter)).rows.filter((r:any)=>!!(globalThis as any).TTShopStaff[shop+':'+String(r.applicant_id).replace(/-short$/,'')]&&(!employee||String(r.applicant_id).replace(/-short$/,'')===employee)).map((r:any)=>({applicant_id:String(r.applicant_id).replace(/-short$/,''),applicant_name:r.applicant_name}));
  };
  if(data.action?.type==='interview-status'){const rows=(await db('tt_interview_decisions_latest?select=shop_id,applicant_id,applicant_name,decision,decided_at,details&shop_id=eq.'+encodeURIComponent(shop)+'&limit=250')).rows;return out({decisions:rows.map((r:any)=>({shop_id:r.shop_id,applicant_id:r.applicant_id,applicant_name:r.applicant_name,decision:r.decision,decided_at:r.decided_at,questions_heard:[...new Set((Array.isArray(r.details?.asked)?r.details.asked:[]).filter((x:any)=>Number.isInteger(x)&&x>=0&&x<30))]}))});}
  if(data.action?.type==='hires')return out({hires:await hiredRows()});
  if(data.action?.type==='staff'&&!(await hiredRows(String(data.action.employee||''))).length)return out({error:'Hire this applicant in the interview room and send the decision before assigning classroom work.'},400);
  if(data.action?.type==='read'){
   const {rows}=await db(query+'&select=state,revision');return out({state:shop==='main-attraction'?(globalThis as any).MAStudio.ensure(rows[0]?.state||Core.initial(shop)):rows[0]?.state||Core.initial(shop),revision:rows[0]?.revision||0});
  }
  const requestId=String(data.requestId||'');if(!/^[a-zA-Z0-9-]{8,100}$/.test(requestId))return out({error:'This task needs a valid request ID. Reload the shop.'},400);
  // Optimistic compare-and-swap prevents two Chromebooks from spending the same
  // balance or completing the same food portion. Request IDs make retries safe.
  for(let attempt=0;attempt<5;attempt++){
   const {rows}=await db(query+'&select=state,revision');const row=rows[0];
   let current=row?.state||Core.initial(shop);if(shop==='main-attraction'){(globalThis as any).MAStudio.ensure(current);if(!current.studio.importedLegacy?.length){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));const digest=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');for(const oldWorkspace of [...new Set([workspace,...(workspace==='classroom'?['salon']:[])])]){const legacyScope='main-attraction-service-v1:'+digest.slice(0,32)+':'+oldWorkspace;const oldRows=(await db('tt_shop_workspaces?shop=eq.main-attraction&scope=eq.'+encodeURIComponent(legacyScope)+'&select=state')).rows;if(oldRows[0])current=(globalThis as any).MAStudio.importLegacy(current,oldRows[0].state,legacyScope);}}}
   if(current.seen.includes(requestId))return out({state:current,revision:row?.revision||0});
   if(shop==='main-attraction'&&data.action?.type==='salon-service'){const rows=(await db('tt_interview_decisions_latest?select=applicant_id,applicant_name&shop_id=eq.main-attraction&decision=eq.Hired&limit=100')).rows;data.action.hires=rows.filter((r:any)=>['morgan','avery'].includes(r.applicant_id));}let next;try{next=Core.reduce(current,data.action,requestId);}catch(e){return out({error:(e as Error).message},400);}
   const result=row?await db(query+'&revision=eq.'+row.revision,'PATCH',{state:next,revision:row.revision+1,updated_at:new Date().toISOString()}):await db('tt_shop_workspaces','POST',{scope,shop,state:next,revision:1});
   if(result.rows.length)return out({state:result.rows[0].state,revision:result.rows[0].revision});
  }
  return out({error:'A teammate updated this station. Refresh and try the task again.'},409);
 }catch(e){
  const storage=(e as Error).message==='STORAGE_UNAVAILABLE';
  return out({error:storage?'The classroom save service is unavailable. Retry this task when connected.':'The classroom connection was interrupted. Retry the same task; it will not be duplicated.'},503);
 }
});
