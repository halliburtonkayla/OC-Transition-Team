(function(root){'use strict';
const canonical=n=>({Max:'Bradley','Bradley (Max) Dane':'Bradley',Nick:'Nicholas',Aubry:'Aubrey',Jayden:'Jaden'})[n]||n;
const hash=s=>{let a=2166136261,b=5381;for(const c of String(s)){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return (a>>>0).toString(16)+(b>>>0).toString(16)};
const text=x=>typeof x==='string'?x:String(x?.text||x?.message||x?.body||'');
function events(w,name){
 const out=[],counts=new Map(),r=w.residents?.[name]||{};
 const add=(kind,title,body,key)=>{if(!body)return;const h=hash(kind+body),n=counts.get(h)||0;counts.set(h,n+1);out.push({event_key:key||`local:${h}:${n}`,kind,title,body:String(body).slice(0,16000)});};
 (r.notifications||[]).forEach(x=>{const body=text(x),utility=/electric bill/i.test(body)?'electric':/water bill/i.test(body)?'water':null;add('town',x.title||'Town notification',body,x.id?'local-notice:'+x.id:utility?'utility:'+utility+':'+(r.utilities?.[utility==='electric'?'lastElectricPaid':'lastWaterPaid']||0)+':due':null);});
 (w.notifications||[]).filter(x=>x.to&&[canonical(name),'Everyone'].includes(canonical(x.to))).forEach(x=>add('town',x.title||'Town notification',text(x),x.id?'town-notice:'+x.id:null));
 (w.messages||[]).filter(x=>canonical(x.to)===canonical(name)||x.to==='Everyone').forEach(x=>{const body=text(x);if(/Career.*Job Center/i.test(x.from||'')&&/^Mock application completed for /i.test(body))return;if(out.some(e=>e.body===body||e.body.endsWith(': '+body)))return;add('message','Message from '+(x.from||'Town'),body,'message:'+(x.id||hash(JSON.stringify(x))));});
 (w.housingApplications||[]).filter(x=>canonical(x.student||x.resident||x.name)===canonical(name)).forEach(x=>add('housing','Housing application update',`${x.property||'Housing Office'}: ${x.unit||'Application'} — ${x.status||'Submitted'}.`,'housing:'+hash(JSON.stringify([x.id||x.submitted,x.property,x.unit,x.status]))));
 Object.entries(w.businesses||{}).filter(([,b])=>(b.owners||[]).some(n=>canonical(n)===canonical(name))).forEach(([business,b])=>(b.alerts||[]).forEach(x=>add('business',business+' update',text(x),'business:'+hash(business+JSON.stringify(x)))));
 // Changes are evidence already written by existing activities, never financial mutations.
 (r.history||[]).filter(x=>/bill|paid|payment|deposit|withdraw|transfer|bank|balance|rent|hous|schedul|employ|hired|declin|purchase|bought|refund|fee|loan|paycheck|insurance/i.test(text(x))).forEach(x=>{const body=text(x);if(!out.some(e=>e.body===body))add('account','Account / employment update',body);});
 (r.life?.bills||[]).forEach(b=>{const state=b.paid?'paid':r.life.date>b.due?'overdue':'due';add('bill',b.paid?'Payment recorded':'Bill reminder',`${b.kind} bill: $${b.totalPaid||b.amount}. ${state==='paid'?'Paid '+(b.paidOn||''):state+' '+b.due+' (Town simulation date)'}.`,'bill:'+b.id+':'+state);});
 Object.entries(r.employment||{}).forEach(([key,e])=>{if(e.schedule)add('schedule','Work schedule',`${e.employer||key}: ${e.position||''}. ${e.schedule}`,'schedule:'+hash(key+e.position+e.schedule));});
 return out;
}
function validateResponses(questions,responses,complete=false){
 if(!Array.isArray(responses)||responses.length>10)throw Error('Invalid interview responses.');
 const seen=new Set();const result=responses.map(r=>{const q=questions.find(q=>q.id===r.question_id);if(!q||seen.has(q.id)||!['typed','choice'].includes(r.mode)||typeof r.answer!=='string'||r.answer.length>4000)throw Error('Invalid interview response.');seen.add(q.id);if(r.mode==='choice'&&!q.choices.includes(r.answer))throw Error('Choose one of the available answers.');return {question_id:q.id,answer:r.answer.trim(),mode:r.mode};});
 if(complete&&(result.length!==10||result.some(r=>!r.answer)))throw Error('Answer all 10 questions before submitting.');return result;
}
const api={canonical,hash,events,validateResponses};root.TTEmploymentCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
