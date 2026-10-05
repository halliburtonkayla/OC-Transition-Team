/* Shared teacher notifications. Local simulation state remains on each device. */
(function(){'use strict';
const URL='https://tyzpophjoptciihaszqj.supabase.co',KEY="sb_publishable_0AOXFP5xxMIrY1PzP-mhBg_FrrnWbfU",SENT='ttNotificationSentV1';
let running=false,again=false;
function world(){try{return JSON.parse(localStorage.ttWorld||'{}')||{}}catch(e){return {}}}
function fingerprint(s){let a=2166136261,b=0;for(let i=0;i<s.length;i++){a=Math.imul(a^s.charCodeAt(i),16777619);b=Math.imul(b+ s.charCodeAt(i),31)}return (a>>>0).toString(16)+(b>>>0).toString(16)}
function items(w){
 const out=[];
 function app(a,employer,resident){const name=String(a.resident||a.name||resident||'Guest').slice(0,120),position=String(a.position||a.job||'Job Application').slice(0,200),source=employer+':'+(a.id||fingerprint(JSON.stringify([name,position,a.submitted||a.date||''])));
 out.push({source_id:source.slice(0,200),kind:'application',employer,applicant:name,title:position,body:name+' submitted an application for '+position+'. Status: '+String(a.status||'Pending Miss Kayla Review')});}
 (w.fireApplications||[]).forEach(a=>app(a,'Transition Town Fire Department'));
 (w.groceryApplications||[]).forEach(a=>app(a,'Transition Town Grocery'));
 (w.pizzaApplications||[]).forEach(a=>app(a,'Transition Town Pizza Shop'));
 (w.coffeeApplications||[]).forEach(a=>app(a,'Transition Town Coffee Shop'));
 Object.entries(w.residents||{}).forEach(([n,r])=>(r.applications||[]).forEach(a=>app(a,String(a.employer||a.business||a.company||'Career & Job Center').slice(0,200),n)));
 (w.messages||[]).filter(m=>/^(miss|ms\.?)[ ]+kayla$/i.test(m.to||'')).forEach(m=>out.push({source_id:'message:'+(m.id||fingerprint(JSON.stringify(m))),kind:'message',employer:String(m.from||'Transition Town').slice(0,200),applicant:String(m.from||'Guest').slice(0,120),title:'Message to Miss Kayla',body:String(m.text||'').slice(0,3000)}));
 (w.housingApplications||[]).forEach(a=>app({resident:a.student,position:'Housing: '+(a.unit||a.property||'Application'),status:a.status,submitted:a.submitted,id:a.id},String(a.property||'Housing Office').slice(0,200)));
 return out;
}
async function sync(){
 if(running){again=true;return false}running=true;let ok=true;let sent;try{sent=JSON.parse(localStorage.getItem(SENT)||'{}')}catch(e){sent={}}
 try{for(const row of items(world())){
 if(sent[row.source_id])continue;
 try{const response=await fetch(URL+'/rest/v1/tt_notifications',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});
 if(response.ok||response.status===409){sent[row.source_id]=true;localStorage.setItem(SENT,JSON.stringify(sent));}else{ok=false}
 }catch(e){ok=false}
 }}finally{running=false;if(again){again=false;setTimeout(sync,200)}}
 return ok;
}
window.TTNotifications={sync,items,url:URL,key:KEY};
function addLink(){if(document.getElementById('ttSharedInbox'))return;
 const header=document.querySelector('header');if(!header)return;
 const a=document.createElement('a');a.id='ttSharedInbox';a.href='miss-kayla-inbox.html';a.textContent='Miss Kayla Shared Inbox';a.style.cssText='display:inline-block;padding:9px 12px;border-radius:12px;background:#5b439d;color:white;text-decoration:none;font:bold 13px Arial;white-space:nowrap;margin:4px';
 header.appendChild(a);
}
addLink();sync();setInterval(()=>{if(!document.hidden)sync()},5000);window.addEventListener('online',sync);
})();