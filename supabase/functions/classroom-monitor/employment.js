/* Runs inside the EXISTING classroom service after its normal authorization. */
(function(root){'use strict';
async function handle({b,req,api,student,teacher,roster,fail,hash}){
 const action=b.action.replace(/^employment_/,''),C=root.TTEmploymentCore,Q=root.TTInterviewQuestions,enc=encodeURIComponent;
 if(action==='config'){await api('tt_student_mail?select=id&limit=0');return {version:1};}
 if(action==='pair'){
  const name=C.canonical(String(b.student||''));if(!(await roster()).map(C.canonical).includes(name))fail(400,'Choose an existing student profile.');
  const recent=await api('tt_monitor_devices?student=eq.'+enc(name)+'&created_at=gt.'+enc(new Date(Date.now()-3600000).toISOString())+'&select=id');if(recent.length>=8)fail(429,'Several device requests are pending. Ask Miss Kayla for help.');
  const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join(''),pair=String(crypto.getRandomValues(new Uint32Array(1))[0]%10000).padStart(4,'0');
  const rows=await api('tt_monitor_devices','POST',{student:name,token_hash:await hash('tt-monitor-v1:'+token),pair_code:pair,private_mail:true,expires_at:new Date(Date.now()+8*3600000).toISOString()});
  return {token,pair_code:pair,device_id:rows[0].id};
 }
 const teacherActions=['teacher_list','application','decide','bind','notify'];
 let user=null,device=null;
 if(teacherActions.includes(action)){
  if(req.headers.get('authorization'))user=await teacher(req);
  else if(b.teacher_code){
   // Verify the existing Central Hub teacher code with its own service. Never store it.
   const r=await fetch(Deno.env.get('SUPABASE_URL')+'/functions/v1/town-room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'application_decisions',code:b.teacher_code})});
   if(!r.ok)fail(403,'Unlock the private teacher dashboard.');user={id:'town-teacher'};
  }else fail(401,'Unlock the private teacher dashboard.');
 }else{
  device=await student(b.token);
  if(!device.private_mail)fail(403,'Connect a private mailbox session. A saved classroom profile is not mailbox authorization.');
  if(!device.approved_at||!device.school)fail(403,'Ask Miss Kayla to approve your private mailbox device.');
  if(C.canonical(String(b.expected_student||''))!==device.student)fail(403,'This private mailbox belongs to a different student. Sign in again.');
 }
 const actor=user?'teacher:'+user.id:'student:'+device.student;
 const q=async(table,query)=>api(table+'?'+query);
 const command=async(type,payload)=>{
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(b.command_id||'')))fail(400,'A request identifier is required.');
  return api('rpc/tt_employment_command','POST',{p_action:type,p_actor:actor,p_command:b.command_id,p_payload:payload});
 };
 const bounded=(s,max)=>{if(typeof s!=='string'||!s.trim()||s.length>max)fail(400,'Missing or invalid text.');return s.trim()};
 if(action==='lock'){await api('tt_monitor_devices?id=eq.'+device.id,'PATCH',{revoked_at:new Date().toISOString()});return {ok:true};}
 if(action==='list'){
  const after=String(b.after||'');if(after.length>36)fail(400,'Invalid page.');
  const rows=await q('tt_student_mail','student=eq.'+enc(device.student)+'&order=id.asc&limit=101'+(after?'&id=gt.'+enc(after):''));
  return {student:device.student,applications:await q('tt_employment_applications','student=eq.'+enc(device.student)+'&order=source_id.asc'),mail:rows.slice(0,100),next:rows.length>100?rows[99].id:null};
 }
 if(action==='ack'||action==='read'){
  if(!Array.isArray(b.ids)||b.ids.length>100||b.ids.some(id=>!/^[0-9a-f-]{36}$/i.test(id)))fail(400,'Choose messages in your mailbox.');
  if(!b.ids.length)return {ok:true};
  const now=new Date().toISOString(),body=action==='read'?{read_at:now,acknowledged_at:now}:{acknowledged_at:now};
  await api('tt_student_mail?student=eq.'+enc(device.student)+'&id=in.('+b.ids.join(',')+')','PATCH',body);return {ok:true};
 }
 if(action==='interview'){
  const rows=await q('tt_job_interviews','id=eq.'+enc(b.id||'')+'&student=eq.'+enc(device.student)+'&limit=1');
  if(!rows.length)fail(404,'This interview is unavailable.');return {interview:rows[0]};
 }
 if(action==='save'){
  const old=(await q('tt_job_interviews','id=eq.'+enc(b.id||'')+'&student=eq.'+enc(device.student)+'&limit=1'))[0];
  if(!old)fail(404,'This interview is unavailable.');
  let responses;try{responses=C.validateResponses(old.questions,b.responses,!!b.complete);}catch(e){fail(400,e.message);}
  if(!Number.isInteger(b.revision)||b.revision<1)fail(400,'Reload this interview.');
  return command('save',{id:old.id,student:device.student,revision:b.revision,responses,complete:!!b.complete});
 }
 if(action==='events'||action==='notify'){
  const name=user?C.canonical(b.student):device.student;
  if(user&&!(await roster()).map(C.canonical).includes(name))fail(400,'Select an existing student.');
  if(!Array.isArray(b.events)||!b.events.length||b.events.length>50)fail(400,'Send 1–50 events.');
  const events=b.events.map(e=>({event_key:bounded(e.event_key,300),kind:bounded(e.kind,40),title:bounded(e.title,250),body:bounded(e.body,16000)}));
  return command('events',{student:name,events});
 }
 if(action==='register'||action==='bind'){
  const source=bounded(b.source_id,200),name=user?C.canonical(b.student):device.student;
  if(user&&!(await roster()).map(C.canonical).includes(name))fail(400,'Select and verify an existing student.');
  const old=(await q('tt_notifications','source_id=eq.'+enc(source)+'&limit=1'))[0];
  if(old&&old.kind!=='application')fail(400,'Choose a job application.');
  if(!user&&old&&C.canonical(old.details?.resident||old.details?.town_owner||old.applicant)!==name)fail(403,'Teacher verification is needed to connect this older application.');
  const owned=(await q('tt_employment_applications','source_id=eq.'+enc(source)+'&limit=1'))[0];
  if(owned&&owned.student!==name)fail(403,'This application already belongs to another student.');
  if(user&&!b.identity_checked)fail(400,'Confirm the applicant identity first.');
  const date=Date.parse(b.applied_at||(user?old?.created_at:'')||'');
  return command('register',{source_id:source,student:name,position:bounded(b.position||old?.title,200),business:bounded(b.business||old?.employer,200),applied_at:Number.isFinite(date)?new Date(date).toISOString():null,details:user?old?.details||{}:b.details||{}});
 }
 if(action==='application'){
  const source=bounded(b.source_id,200);
  const original=(await q('tt_notifications','source_id=eq.'+enc(source)+'&kind=eq.application&limit=1'))[0];
  if(!original)fail(404,'Application is not yet uploaded. Refresh after the student connects.');
  const application=(await q('tt_employment_applications','source_id=eq.'+enc(source)+'&limit=1'))[0]||null;
  return {original,application,students:await roster()};
 }
 if(action==='teacher_list'){
  const offset=Number(b.offset||0);if(!Number.isInteger(offset)||offset<0||offset>100000)fail(400,'Invalid page.');
  const applications=await q('tt_employment_applications','order=source_id.asc&limit=101&offset='+offset);
  const selected=applications.slice(0,100),interviews=[],invitations=[];
  for(const a of selected){invitations.push(...await q('tt_student_mail','source_id=eq.'+enc(a.source_id)+'&interview_id=not.is.null&select=interview_id,read_at,acknowledged_at'));interviews.push(...await q('tt_job_interviews','source_id=eq.'+enc(a.source_id)+'&order=round.asc'));}
  return {applications:selected,interviews,invitations,students:await roster(),next:applications.length>100?offset+100:null};
 }
 if(action==='decide'){
  const source=bounded(b.source_id,200),a=(await q('tt_employment_applications','source_id=eq.'+enc(source)+'&limit=1'))[0];
  if(!a)fail(409,'Verify and connect the applicant first.');
  if(!Number.isInteger(b.revision)||b.revision<1)fail(400,'Reload the application.');
  if(typeof b.feedback!=='string'||b.feedback.length>8000)fail(400,'Feedback must be at most 8,000 characters.');
  const invite=['Interview Requested','Second Interview Requested'].includes(b.decision),set=b.question_set||Q.match(a.position,a.business);
  if(invite&&!Q.profiles[set])fail(400,'Choose the matching job question set.');
  return command('decide',{source_id:source,revision:b.revision,decision:b.decision,feedback:b.feedback,question_set:invite?set:null,questions:invite?Q.questions(set):null});
 }
 fail(400,'Unknown employment action.');
}
root.TTEmploymentServer={handle};
})(globalThis);
