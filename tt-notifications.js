/* All teacher hub notifications share one private cross-device inbox. */
(function(){'use strict';
const URL='https://tyzpophjoptciihaszqj.supabase.co',KEY="sb_publishable_0AOXFP5xxMIrY1PzP-mhBg_FrrnWbfU",SENT='ttNotificationSentV1';
let pending=null,rerun=false;
function world(){try{return JSON.parse(localStorage.ttWorld||'{}')||{}}catch(e){return {}}}
function fingerprint(s){let a=2166136261,b=0;for(let i=0;i<s.length;i++){a=Math.imul(a^s.charCodeAt(i),16777619);b=Math.imul(b+s.charCodeAt(i),31)}return (a>>>0).toString(16)+(b>>>0).toString(16)}
function clean(value){return JSON.parse(JSON.stringify(value||{},(k,v)=>/pin|password|token|secret/i.test(k)?undefined:v))}
function isKayla(name){return /kayla|mayor|teacher|transition specialist/i.test(String(name||''))}
function items(w){
 const out=[];
 function add(source,kind,from,employer,title,body,details,to){
 const safe=clean(details),json=JSON.stringify(safe);
 out.push({source_id:String(source).slice(0,200),kind,applicant:String(from||'Guest').slice(0,120),employer:String(employer||'Transition Town').slice(0,200),title:String(title||'Notification').slice(0,200),body:String(body||'').slice(0,16000),recipient:String(to||'Miss Kayla').slice(0,200),details:new TextEncoder().encode(json).length<=60000?safe:{summary:'See notification text for details.'}});
 }
 function app(a,employer,resident,kind='application'){const name=String(a.resident||a.student||a.name||resident||'Guest'),position=String(a.position||a.job||'Job Application'),source=employer+':'+(a.id||fingerprint(JSON.stringify([name,position,a.submitted||a.date||''])));
 add(source,kind,name,employer,position,name+' submitted '+position+'. Status: '+String(a.status||'Pending Miss Kayla Review'),a);}
 (w.fireApplications||[]).forEach(a=>app(a,'Transition Town Fire Department'));
 (w.groceryApplications||[]).forEach(a=>app(a,'Transition Town Grocery'));
 (w.pizzaApplications||[]).forEach(a=>app(a,'Transition Town Pizza Shop'));
 (w.coffeeApplications||[]).forEach(a=>app(a,'Transition Town Coffee Shop'));
 Object.entries(w.residents||{}).forEach(([n,r])=>{
 (r.applications||[]).forEach(a=>app(a,String(a.employer||a.business||a.company||'Career & Job Center').slice(0,200),n));
 (r.mockApplications||[]).forEach(a=>app(a,'Career & Job Center',n));
 if(isKayla(n))(r.notifications||[]).forEach(a=>{const text=typeof a==='string'?a:(a.text||a.message||JSON.stringify(a));add('resident-alert:'+fingerprint(n+JSON.stringify(a)),'alert',a.from||n,'Town Alerts','Notification to Miss Kayla',text,typeof a==='object'?a:{text});});
 });
 (w.messages||[]).forEach(m=>add('message:'+(m.id||fingerprint(JSON.stringify(m))),'message',m.from,m.from,isKayla(m.to)?'Message to Miss Kayla':'Town Message: '+(m.from||'Guest')+' → '+(m.to||'Everyone'),m.text,m,m.to||'Everyone'));
 (w.mayorInbox||[]).forEach(m=>{const kind=/compliment/i.test(m.type||'')?'compliment':/complaint/i.test(m.type||'')?'complaint':'city';add('mayor:'+(m.id||fingerprint(JSON.stringify(m))),kind,m.from,'Mayor Kayla’s Office',m.type||'Mayor Request',m.text,m);});
 (w.cityHallInbox||[]).forEach(m=>{const kind=/compliment/i.test(m.type||'')?'compliment':/complaint/i.test(m.type||'')?'complaint':'city';add('city:'+(m.id||fingerprint(JSON.stringify(m))),kind,m.from,m.department||'City Hall',m.type||'City Hall Request',m.text,m);});
 (w.housingApplications||[]).forEach(a=>app({...a,resident:a.student||a.resident||a.name,position:'Housing: '+(a.unit||a.property||a.home||a.address||'Application')},String(a.property||'Housing Office').slice(0,200),null,'housing'));
 (w.employeeShiftReports||[]).forEach(r=>add('shift:'+(r.id||fingerprint(JSON.stringify(r))),'shift_report',r.employee,r.employer||r.business||'Employee Center',String(r.position||'Employee')+' Shift Report','Completed shift: '+String(r.hours||8)+' hours. Gross pay: $'+String(r.grossPay??r.gross??0)+'. Performance: '+String(r.overallPerformance??r.score??'Recorded')+'.',r));
 (w.notifications||[]).filter(n=>!n.to||isKayla(n.to)).forEach(n=>add('town-alert:'+(n.id||fingerprint(JSON.stringify(n))),'alert',n.from,'Town Alerts',n.title||'Town Alert',typeof n==='string'?n:n.text||n.message,typeof n==='string'?{text:n}:n));
 Object.entries(w.businesses||{}).forEach(([name,b])=>(b.alerts||[]).forEach(a=>add('business-alert:'+fingerprint(name+JSON.stringify(a)),'alert',typeof a==='object'?a.from:name,name,'Business Alert',typeof a==='string'?a:a.text||a.message||JSON.stringify(a),typeof a==='object'?a:{text:a})));
 return out;
}
function sync(){
 if(pending){rerun=true;return pending}
 pending=(async()=>{let ok=true;do{rerun=false;let sent;try{sent=JSON.parse(localStorage.getItem(SENT)||'{}')}catch(e){sent={}}
 for(const row of items(world())){if(sent[row.source_id])continue;try{const response=await fetch(URL+'/rest/v1/tt_notifications',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});
 if(response.ok||response.status===409){sent[row.source_id]=true;localStorage.setItem(SENT,JSON.stringify(sent));}else ok=false;}catch(e){ok=false}}
 }while(rerun);return ok})().finally(()=>{pending=null});return pending;
}
window.TTNotifications={sync,items,url:URL,key:KEY};
function addLink(){if(document.getElementById('ttSharedInbox')||location.pathname.endsWith('miss-kayla-inbox.html'))return;const header=document.querySelector('header');if(!header)return;const a=document.createElement('a');a.id='ttSharedInbox';a.href='miss-kayla-inbox.html';a.textContent='Miss Kayla Central Hub';a.style.cssText='display:inline-block;padding:9px 12px;border-radius:12px;background:#5b439d;color:white;text-decoration:none;font:bold 13px Arial;white-space:nowrap;margin:4px';header.appendChild(a);}
addLink();sync();setInterval(()=>{if(!document.hidden)sync()},5000);window.addEventListener('online',sync);window.addEventListener('pagehide',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
})();