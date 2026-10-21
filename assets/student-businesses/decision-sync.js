/* Private, append-only delivery to Miss Kayla. Interview progress stays local. */
(() => {
 'use strict';
 const STORAGE='ttInterviewDelivery_v1';
 const URL='https://tyzpophjoptciihaszqj.supabase.co/rest/v1/tt_interview_decisions';
 const API_KEY='sb_publishable_0AOXFP5xxMIrY1PzP-mhBg_FrrnWbfU';
 let cache,storageOK=true,working=false,activeShop='',retryTimer,error='';
 try { cache=JSON.parse(localStorage.getItem(STORAGE)||'null'); } catch {}
 if(!cache||cache.version!==1||!cache.entries||!cache.device)cache={version:1,device:crypto.randomUUID(),entries:{}};
 const $=id=>document.getElementById(id);
 function save(){try{localStorage.setItem(STORAGE,JSON.stringify(cache));storageOK=true;return true;}catch{storageOK=false;return false;}}
 function entries(){return Object.values(cache.entries).filter(e=>e.row.shop_id===activeShop);}
 function paint(){
  const el=$('decision-delivery');if(!el)return;
  const all=entries(),pending=all.filter(e=>!e.sent);
  el.textContent=!storageOK?'Keep this page open: delivery cannot be saved on this browser.':pending.length?(working?'Sending decisions to Miss Kayla…':error||'Saved here · waiting to send to Miss Kayla.'):all.length?'✓ Decisions sent to Miss Kayla.':'Your hire, hold, or decline decisions will be sent to Miss Kayla.';
  if($('retry-decisions')){$('retry-decisions').hidden=!pending.length;$('retry-decisions').style.display=pending.length?'':'none';$('retry-decisions').disabled=working;}
 }
 function mount(shop){activeShop=shop;paint();}
 function capture(meta,record){
  if(!record?.decision||!['Hired','On hold','Declined'].includes(record.decision))return;
  const source=cache.device+':'+meta.shopId+':'+meta.applicantId;
  const details={position:record.position||meta.job,reason:record.reason||'',notes:record.notes||'',support:record.support||'',ratings:record.ratings||{},asked:record.asked||[],followed:record.followed||[],transcript:record.transcript||[]};
  const body={shop_id:meta.shopId,shop_name:meta.shopName,applicant_id:meta.applicantId,applicant_name:meta.applicantName,owner_name:record.decidedBy||'Owner team',decision:record.decision,decided_at:record.endedAt||record.updatedAt||record.startedAt||new Date().toISOString(),details};
  const signature=JSON.stringify(body),old=cache.entries[source];
  if(old?.signature===signature){paint();schedule();return;}
  cache.entries[source]={signature,sent:false,row:{id:crypto.randomUUID(),source_id:source,revision:(old?.row.revision||0)+1,...body}};
  save();error='';paint();schedule();
 }
 function schedule(){clearTimeout(retryTimer);retryTimer=setTimeout(flush,250);}
 async function flush(){
  clearTimeout(retryTimer);if(working)return;
  working=true;error='';paint();
  try{
   for(const [source,entry] of Object.entries(cache.entries)){
    if(entry.sent)continue;
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
    let response;
    try{
     response=await fetch(URL,{method:'POST',headers:{apikey:API_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(entry.row),signal:controller.signal});
    }finally{clearTimeout(timeout);}
    let duplicate=false;
    if(response.status===409){const problem=await response.json().catch(()=>({}));duplicate=problem.code==='23505';}
    if(!response.ok&&!duplicate){error=response.status===400||response.status===413?'Saved here; this decision could not be sent. Keep your notes and retry.':'Saved here · connection unavailable. We will retry.';break;}
    if(cache.entries[source]?.row.id===entry.row.id){entry.sent=true;entry.sentAt=new Date().toISOString();save();}
   }
  }catch{error='Saved here · connection unavailable. We will retry.';}
  finally{working=false;paint();if(Object.values(cache.entries).some(e=>!e.sent))retryTimer=setTimeout(flush,error?15000:500);}
 }
 document.addEventListener('click',e=>{if(e.target.closest('#retry-decisions'))flush();});
 window.addEventListener('online',flush);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush();});
 let hiringConnection='loading',ownProgress={};
 function connectionPanel(message){let el=$('hiringConnection');if(!el){el=document.createElement('section');el.id='hiringConnection';el.style.cssText='max-width:1220px;margin:12px auto;padding:14px 22px;border:1px solid #ecd1de;border-radius:12px;background:#fff8fc;color:#79455f;font:14px/1.5 Arial';const anchor=$('app')||document.querySelector('main');anchor?.before(el);el.innerHTML='<p id="hiringConnectionMessage" role="status"></p><details id="hiringUnlock"><summary>Miss Kayla: load saved classroom hiring</summary><form id="hiringUnlockForm" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><label>Teacher passcode <input id="hiringTeacherPin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required style="width:95px;padding:10px"></label><button type="submit">Load saved hiring</button></form></details>';el.querySelector('form').onsubmit=async e=>{e.preventDefault();const button=el.querySelector('button');button.disabled=true;try{const r=await fetch('https://tyzpophjoptciihaszqj.supabase.co/functions/v1/classroom-monitor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'teacher_pin',pin:$('hiringTeacherPin').value}),signal:AbortSignal.timeout(12000)});const d=await r.json();$('hiringTeacherPin').value='';if(!r.ok)throw Error(d.error||'Sign-in failed.');sessionStorage.setItem('ttMonitorPinAuth',JSON.stringify(d));window.dispatchEvent(new Event('tt-hiring-auth'));connectionPanel('Loading saved hiring decisions…');}catch(error){connectionPanel(error.message)}finally{button.disabled=false;}};}if($('hiringConnectionMessage'))$('hiringConnectionMessage').textContent=message;if($('hiringUnlock'))$('hiringUnlock').hidden=hiringConnection==='connected';}
 async function loadLatest(shop){
  const raw=sessionStorage.ttCurrent||localStorage.ttCurrent||'',name=({Max:'Bradley',Nick:'Nicholas',Aubry:'Aubrey',Jayden:'Jaden'})[raw]||raw;
  const token=sessionStorage.getItem('ttMonitorDevice:'+name)||localStorage.getItem('ttMonitorDevice:'+name)||'';
  let teacher;try{teacher=JSON.parse(sessionStorage.getItem('ttMonitorPinAuth')||'null')}catch{}
  let jwt;try{const saved=JSON.parse(localStorage.getItem('sb-tyzpophjoptciihaszqj-auth-token')||'null');jwt=saved?.access_token}catch{}
  const classCode=sessionStorage.getItem('ttShopClassCode')||localStorage.getItem('ttTownRoomCode')||sessionStorage.getItem('ttTownTeacherCode')||'';
  const headers={'Content-Type':'application/json'};if(teacher?.token&&Date.parse(teacher.expires_at)>Date.now())headers.Authorization='Bearer '+teacher.token;else if(jwt)headers.Authorization='Bearer '+jwt;
  let decisions=null;
  try{if(token||headers.Authorization){const r=await fetch('https://tyzpophjoptciihaszqj.supabase.co/functions/v1/classroom-monitor',{method:'POST',headers,body:JSON.stringify({action:'interview_status',shop,token}),signal:AbortSignal.timeout(10000)});if(r.ok)decisions=(await r.json()).decisions||[];}
   if(decisions===null&&classCode){const shops=shop==='all'?['main-attraction','cool-vibes','the-zoo','guardian-angel','3k-tire-shop']:[shop];decisions=(await Promise.all(shops.map(async id=>{const r=await fetch('https://tyzpophjoptciihaszqj.supabase.co/functions/v1/student-shop-work',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:classCode,shop:id,action:{type:'interview-status'}}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Classroom connection unavailable.');return(await r.json()).decisions||[]}))).flat();}
  }catch{}
  if(decisions===null){hiringConnection='local';connectionPanel((name&&!/kayla|guest/i.test(name)?name+': ask Miss Kayla to choose your school and press Connect student in Live Classroom Monitor. ':'')+'Saved classroom hiring is not connected on this device. Any counts shown below are this device’s records only. Miss Kayla can unlock saved hiring here with her existing passcode.');return [];}
  if(token&&shop!=='all'){try{const r=await fetch('https://tyzpophjoptciihaszqj.supabase.co/functions/v1/classroom-monitor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'interview_progress',shop,token}),signal:AbortSignal.timeout(10000)});if(r.ok)ownProgress[shop]=(await r.json()).progress||[];}catch{}}hiringConnection='connected';connectionPanel('✓ Saved classroom hiring connected. Hired employees are separate from applicants still awaiting a decision.');return decisions;
 }
 window.TTInterviewSync={mount,capture,flush,loadLatest,connection:()=>hiringConnection,progress:shop=>ownProgress[shop]||[]};
 save();
})();
