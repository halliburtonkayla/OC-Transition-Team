import '../../../assets/classroom-monitor/core.js';
const C=(globalThis as any).TTMonitorCore;
const BASE=Deno.env.get('SUPABASE_URL')!,KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN='https://halliburtonkayla.github.io';
const enc=encodeURIComponent,iso=()=>new Date().toISOString();
class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
const fail=(status:number,msg:string):never=>{throw new HttpError(status,msg)};
async function hash(s:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function api(path:string,method='GET',body?:unknown,prefer='return=representation'){
 const r=await fetch(BASE+'/rest/v1/'+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:prefer},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){console.error('Monitor database',method,path.split('?')[0],r.status);fail(r.status===409?409:503,r.status===409?'This record changed. Refresh and retry.':'Classroom records are temporarily unavailable.');}
 return r.status===204?[]:await r.json();
}
const get=(t:string,q='')=>api('tt_monitor_'+t+'?'+q);
const patch=(t:string,q:string,b:unknown)=>api('tt_monitor_'+t+'?'+q,'PATCH',b);
const add=(t:string,b:unknown)=>api('tt_monitor_'+t,'POST',b);
async function settings(){return (await get('settings','id=eq.true'))[0]}
async function teacher(req:Request){
 const bearer=req.headers.get('authorization')||'';
 if(!/^Bearer .+/.test(bearer))fail(401,'Sign in with your approved teacher email.');
 const r=await fetch(BASE+'/auth/v1/user',{headers:{apikey:KEY,Authorization:bearer}});
 if(!r.ok)fail(401,'Teacher sign-in expired. Sign in again.');const u=await r.json();
 if(!u.id||!u.email_confirmed_at||u.is_anonymous)fail(403,'Verified teacher sign-in required.');
 const rows=await api('tt_teacher_access?email=eq.'+enc(String(u.email).toLowerCase())+'&select=email');
 if(!rows.length)fail(403,'This verified account is not approved for teacher records.');return u;
}
async function student(token:unknown){
 if(typeof token!=='string'||token.length<32||token.length>100)fail(401,'Connect your student device first.');
 const d=(await get('devices','token_hash=eq.'+await hash('tt-monitor-v1:'+token)+'&limit=1'))[0];
 if(!d||d.revoked_at||Date.parse(d.expires_at)<=Date.now())fail(401,'Device access expired. Ask Miss Kayla to approve this device again.');return d;
}
async function roster(){return (await api('tt_phone_contacts?select=name&name=neq.Miss%20Kayla&order=extension.asc')).map((x:any)=>x.name)}
async function eventsFor(studentName:string,start:string,end:string){
 const events=[];for(let offset=0;offset<20000;offset+=1000){const rows=await get('events','student=eq.'+enc(studentName)+'&at=gte.'+enc(start)+'&at=lte.'+enc(end)+'&order=at.asc&limit=1000&offset='+offset);events.push(...rows);if(rows.length<1000)break;}return events;
}
async function createReport(key:string,name:string,school:string,service:string,start:string,end:string,extra:any){
 const existing=await get('reports','report_key=eq.'+enc(key)+'&limit=1');if(existing.length)return existing[0];
 const events=await eventsFor(name,start,end);const draft=C.draft({student:name,school,service,start,end,events});
 const rows=await api('tt_monitor_reports?on_conflict=report_key','POST',{report_key:key,student:name,school,draft,...extra},'resolution=ignore-duplicates,return=representation');
 return rows[0]||(await get('reports','report_key=eq.'+enc(key)+'&limit=1'))[0];
}
async function endSession(s:any,end:string){
 const stop=s.ended_at||end;
 await patch('sessions','id=eq.'+s.id+'&ended_at=is.null',{ended_at:stop,status:'ended',mirror_allowed:false});
 await api('tt_monitor_frames?session_id=eq.'+s.id,'DELETE');
 if(!s.group_id)await createReport('session:'+s.id,s.student,s.school,'',s.started_at,stop,{session_id:s.id});
}
async function endGroup(g:any,end:string){
 const stop=g.ended_at||end;
 await patch('groups','id=eq.'+g.id+'&ended_at=is.null',{ended_at:stop});
 const sessions=await get('sessions','group_id=eq.'+g.id);for(const s of sessions)await api('tt_monitor_frames?session_id=eq.'+s.id,'DELETE');
 await patch('sessions','group_id=eq.'+g.id+'&ended_at=is.null',{ended_at:stop,status:'ended',mirror_allowed:false});
 // Keep a member who had no recorded session separate and explicitly unobserved.
 const reports=[];
 for(const name of g.members){const own=sessions.filter((s:any)=>s.student===name);const start=own.length?new Date(Math.max(Date.parse(g.started_at),Math.min(...own.map((s:any)=>Date.parse(s.started_at))))).toISOString():g.started_at;
  const last=own.length?new Date(Math.min(Date.parse(stop),Math.max(...own.map((s:any)=>s.ended_at?Date.parse(s.ended_at):Date.parse(stop))))).toISOString():stop;
  reports.push(await createReport('group:'+g.id+':'+name,name,g.school,g.service,start,last,{group_id:g.id}));
 }
 await patch('sessions','group_id=eq.'+g.id+'&ended_at=is.null',{ended_at:stop,status:'ended',mirror_allowed:false});return reports;
}
async function finalize(){
 const now=iso(),groups=await get('groups','ended_at=is.null&ends_at=lte.'+enc(now));
 for(const g of groups)await endGroup(g,g.ends_at);
 const old=await get('sessions','ended_at=is.null&last_seen=lt.'+enc(new Date(Date.now()-120e3).toISOString()));
 for(const s of old)await endSession(s,s.last_seen);
 const expired=await get('sessions','ended_at=is.null&started_at=lt.'+enc(new Date(Date.now()-30*60e3).toISOString()));
 for(const s of expired){const g=s.group_id&&(await get('groups','id=eq.'+s.group_id))[0];if(!g)await endSession(s,new Date(Date.parse(s.started_at)+30*60e3).toISOString());}
}
async function purge(cfg:any){
 await api('tt_monitor_signals?expires_at=lt.'+enc(iso()),'DELETE');
 await api('tt_monitor_frames?expires_at=lt.'+enc(iso()),'DELETE');
 await api('tt_monitor_live_usage?day=lt.'+enc(new Date(Date.now()-2*864e5).toISOString().slice(0,10)),'DELETE');
 await api('tt_monitor_devices?approved_at=is.null&created_at=lt.'+enc(new Date(Date.now()-60*60e3).toISOString()),'DELETE');
 if(!cfg.retention_days)return;
 const cutoff=new Date(Date.now()-cfg.retention_days*864e5).toISOString();
 await api('tt_monitor_events?at=lt.'+enc(cutoff),'DELETE');
 await api('tt_monitor_reports?created_at=lt.'+enc(cutoff),'DELETE');
 await api('tt_monitor_sessions?started_at=lt.'+enc(cutoff),'DELETE');
 await api('tt_monitor_groups?started_at=lt.'+enc(cutoff),'DELETE');
 await api('tt_monitor_devices?expires_at=lt.'+enc(cutoff),'DELETE');
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin');const allowed=!origin||[ORIGIN,'http://terminal.local:4173','http://localhost:4173'].includes(origin);
 const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':allowed?(origin||ORIGIN):ORIGIN,'Access-Control-Allow-Headers':'content-type, authorization, apikey','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
 const out=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(!allowed)return out({error:'Origin not allowed.'},403);if(req.method==='OPTIONS')return new Response('',{headers});if(req.method!=='POST')return out({error:'Use POST.'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>100000)fail(413,'Request too large.');const raw=await req.text();if(raw.length>100000)fail(413,'Request too large.');const b=JSON.parse(raw),action=String(b.action||'');
  const cfg=await settings();
  if(action==='public_config')return out({enabled:cfg.enabled,retention_days:cfg.retention_days});
  if(action==='join'){
   if(!cfg.enabled||!cfg.retention_days)fail(403,'Miss Kayla has not turned on classroom activity recording yet.');
   const name=C.canonical(b.student);if(!(await roster()).includes(name))fail(400,'Choose your own town student profile.');
   // Reuse the existing teacher-approved phone device, without accepting a classroom code as identity.
   let legacy:any=null;if(typeof b.phone_token==='string'&&b.phone_token.length<=100){legacy=(await api('tt_phone_sessions?token_hash=eq.'+await hash('transition-town-session-v1:'+b.phone_token)+'&approved_at=not.is.null&expires_at=gt.'+enc(iso())+'&limit=1'))[0];if(legacy?.name!==name)legacy=null;}
   const recent=await get('devices','student=eq.'+enc(name)+'&created_at=gt.'+enc(new Date(Date.now()-3600e3).toISOString())+'&select=id');if(recent.length>=8)fail(429,'Several device requests are pending. Ask Miss Kayla for help.');
   const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
   const pair=String(crypto.getRandomValues(new Uint32Array(1))[0]%10000).padStart(4,'0');
   // School is always confirmed by a teacher before records can begin.
   const row=(await add('devices',{student:name,token_hash:await hash('tt-monitor-v1:'+token),pair_code:pair}))[0];
   return out({token,device_id:row.id,pair_code:pair,approved:false,phone_verified:!!legacy,expires_at:row.expires_at});
  }
  const teacherAction=['overview','configure','approve_device','revoke_device','start_group','end_group','history','reports','save_report','signal_teacher','signals_teacher','revoke_view','report_session','add_observation','view_snapshot'].includes(action);
  let u:any=null,d:any=null;
  if(teacherAction)u=await teacher(req);else d=await student(b.token);
  if(u){
   if(action==='configure'){
    const days=Number(b.retention_days);if(!Number.isInteger(days)||days<1||days>365)fail(400,'Choose how many days to keep activity records (1–365).');
    const rows=await patch('settings','id=eq.true',{enabled:!!b.enabled,retention_days:days||cfg.retention_days,allow_snapshot_fallback:!!b.allow_snapshot_fallback,updated_by:u.id,updated_at:iso()});
    if(!b.enabled){await patch('sessions','ended_at=is.null',{mirror_allowed:false,status:'paused'});await api('tt_monitor_frames?channel=not.is.null','DELETE');}else if(!b.allow_snapshot_fallback)await api('tt_monitor_frames?channel=not.is.null','DELETE');return out({settings:rows[0]});
   }
   if(action==='overview'){
    await finalize();await purge(cfg);const cutoff=new Date(Date.now()-(cfg.retention_days||1)*864e5).toISOString();
    const [devices,sessions,groups,reports]=await Promise.all([get('devices','revoked_at=is.null&expires_at=gt.'+enc(iso())+'&select=id,student,school,pair_code,approved_at,last_seen,created_at'),get('sessions','started_at=gte.'+enc(cutoff)+'&order=started_at.desc&limit=300'),get('groups','started_at=gte.'+enc(cutoff)+'&order=started_at.desc&limit=100'),get('reports','created_at=gte.'+enc(cutoff)+'&select=id,student,school,group_id,status,revision,created_at,updated_at&order=created_at.desc&limit=300')]);
    return out({settings:cfg,devices,sessions,groups,reports,roster:await roster(),services:C.SERVICES,now:iso()});
   }
   if(action==='approve_device'){
    if(!C.uid(b.id)||!['South Fulton High School','Obion County Central High School'].includes(b.school))fail(400,'Choose the student’s verified school.');
    const row=(await get('devices','id=eq.'+b.id+'&approved_at=is.null&revoked_at=is.null&expires_at=gt.'+enc(iso())))[0];
    if(!row||String(b.pair_code)!==row.pair_code||!b.identity_checked)fail(400,'Match the name and pairing code with the student first.');
    return out({devices:await patch('devices','id=eq.'+b.id,{approved_at:iso(),approved_by:u.id,school:b.school})});
   }
   if(action==='revoke_device'){
    if(!C.uid(b.id))fail(400,'Invalid device.');await patch('devices','id=eq.'+b.id,{revoked_at:iso()});const sessions=await get('sessions','device_id=eq.'+b.id+'&ended_at=is.null');for(const s of sessions)await endSession(s,iso());return out({ok:true});
   }
   if(action==='start_group'){
    if(!cfg.enabled)fail(403,'Turn on activity recording in Recording Settings first.');if(!C.SERVICES.includes(b.service)||!['South Fulton High School','Obion County Central High School'].includes(b.school))fail(400,'Select one Pre-ETS service and school.');
    const names=[...new Set((Array.isArray(b.members)?b.members:[]).map(C.canonical))];const namesAllowed=await roster();if(!names.length||names.some(n=>!namesAllowed.includes(n)))fail(400,'Select students from the existing roster.');
    const active=await get('groups','ended_at=is.null');if(active.some((g:any)=>g.members.some((n:string)=>names.includes(n))))fail(409,'A selected student is already in an active group. End that group first.');
    const group=(await add('groups',{title:C.text(b.title,100)||'30-minute work session',school:b.school,service:b.service,members:names,teacher_id:u.id}))[0];
    for(const name of names)await patch('sessions','student=eq.'+enc(String(name))+'&ended_at=is.null',{group_id:group.id,school:b.school});return out({group});
   }
   if(action==='end_group'){
    if(!C.uid(b.id))fail(400,'Invalid group.');const g=(await get('groups','id=eq.'+b.id))[0];if(!g)fail(404,'Group not found.');return out({reports:await endGroup(g,iso())});
   }
   if(action==='report_session'){
    if(!C.uid(b.session_id))fail(400,'Invalid session.');const s=(await get('sessions','id=eq.'+b.session_id))[0];if(!s)fail(404,'Session not found.');await endSession(s,iso());return out({ok:true});
   }
   if(action==='history'){
    const name=C.canonical(b.student);const from=new Date(Math.max(Date.now()-(cfg.retention_days||1)*864e5,Number.isFinite(Date.parse(b.from))?Date.parse(b.from):Date.now()-864e5)).toISOString();
    const to=Number.isFinite(Date.parse(b.to))?new Date(b.to).toISOString():iso();const events=await eventsFor(name,from,to);return out({events});
   }
   if(action==='reports'){
    let q='order=created_at.desc&created_at=gte.'+enc(new Date(Date.now()-(cfg.retention_days||1)*864e5).toISOString())+'&limit=300';
    if(b.id){if(!C.uid(b.id))fail(400,'Invalid report.');q+='&id=eq.'+b.id;}if(b.group_id){if(!C.uid(b.group_id))fail(400,'Invalid group.');q+='&group_id=eq.'+b.group_id;}
    return out({reports:await get('reports',q)});
   }
   if(action==='add_observation'){
    if(!C.uid(b.session_id))fail(400,'Choose a student session.');const target=(await get('sessions','id=eq.'+b.session_id))[0];if(!target)fail(404,'Session not found.');
    const summary=C.text(b.summary,1500);if(!summary)fail(400,'Enter the observation you actually made.');
    return out({event:(await add('events',{id:crypto.randomUUID(),session_id:target.id,student:target.student,at:iso(),kind:'observation',source:'teacher_observed',summary,details:{teacher_id:u.id}}))[0]});
   }
   if(action==='save_report'){
    if(!C.uid(b.id)||!Number.isInteger(b.revision))fail(400,'Invalid report.');const old=(await get('reports','id=eq.'+b.id))[0];if(!old)fail(404,'Report not found.');
    let validated;try{validated=C.validateReport({...b.draft,student:old.student,school:b.draft?.school||old.school},!!b.approve)}catch(e){fail(400,(e as Error).message)}const draft={...old.draft,...validated};
    const rows=await patch('reports','id=eq.'+b.id+'&revision=eq.'+b.revision,{draft,school:draft.school,status:b.approve?'approved':'draft',revision:b.revision+1,approved_at:b.approve?iso():null,approved_by:b.approve?u.id:null,updated_at:iso()});if(!rows.length)fail(409,'Another device updated this report. Reload it before editing.');return out({report:rows[0]});
   }
  }
  // Direct signaling contains descriptions only. Optional HTTPS mirroring keeps one expiring frame per viewing channel.
  if(action==='view_snapshot'||action==='publish_snapshot'){
   if(!cfg.enabled||!cfg.allow_snapshot_fallback)fail(403,'The school has not enabled the secure snapshot fallback.');
   if(!C.uid(b.session_id)||!C.uid(b.channel))fail(400,'Invalid live view.');
   const s=(await get('sessions','id=eq.'+b.session_id))[0];if(!s||s.ended_at||s.status!=='active'||!s.mirror_allowed||Date.now()-Date.parse(s.last_seen)>50000||(!u&&s.device_id!==d.id))fail(403,'Live town view is not allowed for this session.');
   const request=(await get('signals','session_id=eq.'+s.id+'&channel=eq.'+b.channel+'&sender=eq.teacher&kind=eq.request&expires_at=gt.'+enc(iso())+(u?'&teacher_id=eq.'+u.id:'')+'&order=created_at.desc&limit=1'))[0];
   if(!request||request.payload?.transport!=='snapshot')fail(403,'No approved snapshot viewer requested.');
   await api('tt_monitor_frames?expires_at=lt.'+enc(iso()),'DELETE');
   if(u)return out({frame:(await get('frames','channel=eq.'+b.channel+'&teacher_id=eq.'+u.id+'&expires_at=gt.'+enc(iso())+'&limit=1'))[0]||null});
   if(typeof b.payload!=='string'||b.payload.length>40000||!b.payload.length||!/^[A-Za-z0-9+/=]+$/.test(b.payload))fail(400,'Invalid live frame.');
   const previous=(await get('frames','channel=eq.'+b.channel+'&limit=1'))[0];if(previous&&Date.now()-Date.parse(previous.at)<2500)fail(429,'Live frames update at most every three seconds.');
   const reserved=await api('rpc/tt_monitor_reserve_live_bytes','POST',{p_teacher:request.teacher_id,p_bytes:b.payload.length});if(!reserved)fail(429,'Today’s secure snapshot budget is used. Direct peer viewing and activity recording remain available.');
   await api('tt_monitor_frames?on_conflict=channel','POST',{channel:b.channel,session_id:s.id,teacher_id:request.teacher_id,payload:b.payload,encoding:'gzip',at:iso(),expires_at:new Date(Date.now()+20000).toISOString()},'resolution=merge-duplicates,return=minimal');return out({ok:true});
  }
  if(['signal_teacher','signals_teacher','signal_student','signals_student','revoke_view'].includes(action)){
   if(!C.uid(b.session_id))fail(400,'Invalid session.');const s=(await get('sessions','id=eq.'+b.session_id))[0];
   if(action==='revoke_view'&&u&&s){if(!C.uid(b.channel))fail(400,'Invalid channel.');await api('tt_monitor_frames?channel=eq.'+b.channel+'&teacher_id=eq.'+u.id,'DELETE');}
   if(!s||s.ended_at||Date.now()-Date.parse(s.last_seen)>120e3||(!u&&s.device_id!==d.id))fail(403,'Live session unavailable.');
   if(action==='revoke_view'){await add('signals',{session_id:s.id,teacher_id:u.id,channel:C.uid(b.channel)?b.channel:crypto.randomUUID(),sender:'teacher',kind:'stop'});return out({ok:true});}
   if(!cfg.enabled||s.status!=='active'||!s.mirror_allowed)fail(403,'Student has not enabled the live town mirror.');
   if(action.startsWith('signals_')){
    const since=Number.isFinite(Date.parse(b.since))?new Date(Date.parse(b.since)-1000).toISOString():new Date(Date.now()-90000).toISOString();
    return out({signals:await get('signals','session_id=eq.'+s.id+'&sender=eq.'+(u?'student':'teacher')+'&created_at=gte.'+enc(since)+'&expires_at=gt.'+enc(iso())+(u?'&teacher_id=eq.'+u.id:'')+'&order=created_at.asc&limit=100')});
   }
   const kind=String(b.kind),payload=b.payload||{};if(payload.transport==='snapshot'&&!cfg.allow_snapshot_fallback)fail(403,'Snapshot fallback is not enabled by the school.');if(!C.uid(b.channel)||!(u?['request','offer','ice','stop']:['answer','ice','stop']).includes(kind)||JSON.stringify(payload).length>30000)fail(400,'Invalid connection signal.');
   let teacherId=u?.id;
   if(!u){const request=(await get('signals','session_id=eq.'+s.id+'&channel=eq.'+b.channel+'&sender=eq.teacher&kind=eq.request&expires_at=gt.'+enc(iso())+'&limit=1'))[0];if(!request)fail(403,'No approved teacher connection requested.');teacherId=request.teacher_id;}
   if(kind==='stop')await api('tt_monitor_frames?channel=eq.'+b.channel,'DELETE');
   return out({signal:(await add('signals',{session_id:s.id,teacher_id:teacherId,channel:b.channel,sender:u?'teacher':'student',kind,payload}))[0]});
  }
  if(!d)fail(403,'Action unavailable.');
  await patch('devices','id=eq.'+d.id,{last_seen:iso()});
  if(action==='device_status')return out({approved:!!d.approved_at,student:d.student,school:d.school,enabled:cfg.enabled});
  if(action==='logout'){await patch('devices','id=eq.'+d.id,{revoked_at:iso()});for(const active of await get('sessions','device_id=eq.'+d.id+'&ended_at=is.null'))await endSession(active,iso());return out({ok:true});}
  if(!cfg.enabled)fail(403,'Classroom recording is currently off.');if(!d.approved_at||!d.school)fail(403,'Waiting for Miss Kayla to verify this student device and school.');
  if(action==='begin'){
   await finalize();let s=(await get('sessions','device_id=eq.'+d.id+'&ended_at=is.null'))[0];
   if(!s){const groups=await get('groups','ended_at=is.null');const g=groups.find((g:any)=>g.members.includes(d.student));s=(await add('sessions',{device_id:d.id,student:d.student,school:g?.school||d.school,group_id:g?.id||null}))[0];}
   return out({session:s});
  }
  if(!C.uid(b.session_id))fail(400,'Invalid session.');const s=(await get('sessions','id=eq.'+b.session_id+'&device_id=eq.'+d.id))[0];if(!s)fail(403,'This is not your student session.');
  if(s.ended_at)return out({ended:true,session:s});
  if(action==='heartbeat'){
   if(!b.mirror_allowed)await api('tt_monitor_frames?session_id=eq.'+s.id,'DELETE');
   await finalize();const rows=await patch('sessions','id=eq.'+s.id+'&ended_at=is.null',{last_seen:iso(),page:C.text(b.page,100),business:C.text(b.business,80),activity:C.text(b.activity,160),mirror_allowed:s.status==='active'&&!!b.mirror_allowed});return out({session:rows[0]||null,ended:!rows.length});
  }
  if(action==='events'){
   if(s.status!=='active')fail(403,'Activity recording is paused.');if(!Array.isArray(b.events)||b.events.length>50)fail(400,'Send up to 50 events.');
   let rows:any[];try{rows=b.events.map((e:any)=>({...C.cleanEvent(e),session_id:s.id,student:d.student}))}catch(e){fail(400,(e as Error).message)}
   if(rows.some((e:any)=>Date.parse(e.at)<Date.parse(s.started_at)))fail(400,'Event is outside this session.');
   if(rows.length)await api('tt_monitor_events?on_conflict=id','POST',rows,'resolution=ignore-duplicates,return=minimal');
   await patch('sessions','id=eq.'+s.id+'&ended_at=is.null',{last_seen:iso()});return out({accepted:rows.length});
  }
  if(action==='pause'||action==='resume'){
   await add('events',{id:crypto.randomUUID(),session_id:s.id,student:d.student,at:iso(),kind:'session',source:'session_control',summary:action==='pause'?'Student paused activity recording and live view':'Student resumed activity recording',details:{action}});
   await patch('sessions','id=eq.'+s.id+'&ended_at=is.null',{status:action==='pause'?'paused':'active',mirror_allowed:false,last_seen:iso()});await api('tt_monitor_frames?session_id=eq.'+s.id,'DELETE');return out({ok:true});
  }
  if(action==='end'){await endSession(s,iso());return out({ok:true,ended:true});}
  fail(403,'Action unavailable.');
 }catch(e){const err=e as Error;return out({error:e instanceof HttpError?err.message:'Classroom request could not be completed.'},e instanceof HttpError?e.status:500);}
});
