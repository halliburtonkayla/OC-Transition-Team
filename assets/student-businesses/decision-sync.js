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
  if($('retry-decisions')){$('retry-decisions').hidden=!pending.length;$('retry-decisions').disabled=working;}
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
 window.TTInterviewSync={mount,capture,flush};
 save();
})();
