// Separate learning history; never writes ttWorld, financial data, or teacher observations.
export const learningId=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function learningStore(activity,host=window){
 const identity=()=>{try{return host.sessionStorage.getItem('ttCurrent')||host.localStorage.getItem('ttCurrent')||'Guest';}catch{return 'Guest';}};
 const student=identity(),guest=/guest|kayla/i.test(student);let storage,persistent=true;
 try{storage=guest?host.sessionStorage:host.localStorage;storage.getItem('ttLearning:storage-check');}catch{persistent=false;const memory=new Map();storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};}
 const key='ttLearning:v1:'+encodeURIComponent(student)+':'+activity;
 let available=persistent,corrupt=false;
 function read(){try{const d=JSON.parse(storage.getItem(key)||'null');if(d&&(d.version!==1||!Array.isArray(d.records)||d.records.some(r=>!r||typeof r.id!=='string'))){corrupt=true;available=false;return {version:1,records:[],checkpoint:null};}return d||{version:1,records:[],checkpoint:null};}catch{corrupt=true;available=false;return {version:1,records:[],checkpoint:null};}}
 function write(change){if(identity()!==student){available=false;return false;}try{const d=read();if(corrupt)return false;change(d);storage.setItem(key,JSON.stringify(d));available=persistent;return true;}catch{available=false;return false;}}
 return {student,guest,read,available:()=>available,
  checkpoint:value=>write(d=>{d.checkpoint=value;}),
  append:record=>write(d=>{if(!d.records.some(r=>r.id===record.id))d.records.push({...record,at:record.at||new Date().toISOString()});}),
  event:(kind,summary,details={})=>{if(identity()!==student)return;host.TTMonitor?.record(kind,summary,{action:activity,...details});},
  notice:()=>!available?'Saving is unavailable. Print your results before leaving.':guest?'Guest practice stays in this browser tab.':'Saved for your profile on this device. Connected classroom events go to Miss Kayla after device approval.'
 };
}
export function speak(text,onDone=()=>{}){
 try{if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){onDone();return false;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.85;u.onend=onDone;u.onerror=onDone;window.speechSynthesis.speak(u);return true;}catch{onDone();return false;}
}
