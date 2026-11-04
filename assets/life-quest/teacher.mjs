import {monitorRows,reportHTML,esc,duration,stamp,centralRange} from './report.mjs';
let mountSerial=0;
// Mounted only inside the existing authenticated teacher shell. Never enumerate local student saves.
export function mountLifeQuest(root,{data,api,isCurrent=()=>true}){
 const mountId=String(++mountSerial);root.dataset.questMount=mountId;const current=()=>isCurrent()&&root.dataset.questMount===mountId;
 let rows=[],generation=0;
 const names=data.roster||[],schools=Object.fromEntries([...(data.devices||[]),...(data.sessions||[])].filter(x=>x.school).map(x=>[x.student,x.school]));
 root.innerHTML=`<p class="eyebrow">SEPARATE ADVENTURE RECORDS</p><h2>Transition Mission 2.0</h2><p>Mission results from approved classroom connections. Active seconds, stars, and question accuracy are application-reported evidence. Missing events are not evidence of completion.</p><form id="questTeacherForm" class="monitor-card"><div class="monitor-grid"><label>Student or class<select name="student"><option value="">Class summary · all students</option>${names.map(n=>`<option>${esc(n)}</option>`).join('')}</select></label><label>From<input name="from" type="date" required></label><label>Through<input name="to" type="date" required></label></div><button>Load Life Quest results</button><button type="button" id="questPrint" class="secondary">Print loaded summary</button><p id="questTeacherStatus" role="status">Choose a date range and load recorded activity.</p></form><div id="questTeacherResults"></div>`;
 const form=root.querySelector('form'),localDate=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'});form.elements.from.value=localDate;form.elements.to.value=localDate;
 const setStatus=t=>{if(current())root.querySelector('#questTeacherStatus').textContent=t;};
 const print=(subset,details)=>{if(!current())return;let area=document.querySelector('.monitor-print-root');if(!area){area=document.createElement('div');area.className='monitor-print-root';document.body.append(area);}area.innerHTML=reportHTML(subset,{heading:'Transition Mission 2.0 · '+(details?'Individual Report':'Class Summary'),details});window.print();};
 root.querySelector('#questPrint').onclick=()=>rows.length?print(rows,false):setStatus('Load recorded results first.');
 form.onsubmit=async e=>{
  e.preventDefault();const submitButton=e.submitter||form.querySelector('button');const gen=++generation,student=form.elements.student.value,{from,to}=centralRange(form.elements.from.value,form.elements.to.value);
  if(Date.parse(to)<Date.parse(from))return setStatus('Choose an end date on or after the start date.');
  const chosen=student?[student]:names;rows=[];root.querySelector('#questTeacherResults').replaceChildren();submitButton.disabled=true;setStatus('Loading approved classroom evidence…');
  let index=0,loaded=0;const failures=[];
  const worker=async()=>{while(index<chosen.length){const name=chosen[index++];try{const result=await api('history',{student:name,from,to});if(!current()||gen!==generation)return;rows.push(...monitorRows(result.events||[],schools));loaded++;}catch(error){failures.push(name);}}};
  await Promise.all(Array.from({length:Math.min(4,chosen.length)},worker));if(!current()||gen!==generation)return;submitButton.disabled=false;
  setStatus(`${rows.length} recorded mission attempt(s) · ${loaded} student histories loaded.${failures.length?' Some histories could not load: '+failures.join(', ')+'.':''}`);
  root.querySelector('#questTeacherResults').innerHTML=rows.length?`<div class="monitor-scroll"><table class="monitor-table"><thead><tr><th>Student / school</th><th>Mission / date</th><th>Actual activity</th><th>Instruction</th><th>Report</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${esc(r.student)}<br><small>${esc(r.school)}</small></td><td>${r.mission}. ${esc(r.title)}<br>${stamp(r.finishedAt||r.evidenceAt)}<br>${esc(r.status)}</td><td>${duration(r.seconds)} active<br>${r.stars} stars · ${r.questions?r.correct+'/'+r.questions+' ('+r.accuracy+'%)':'No question responses'}</td><td>${esc(r.services.join('; '))}<br><small>Practiced: ${esc(r.skills.join(', ')||'No successful instructional actions recorded')}</small><br><small>Practice next: ${esc(r.needs.join(', ')||'Review recorded actions with student')}</small></td><td><button data-quest-print="${i}">Print individual</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="monitor-empty">No Life Quest evidence in this date range. Check that the student used an approved classroom connection. Browser-only progress can be printed from My Progress on the student’s device.</div>';
 };
 root.addEventListener('click',e=>{const b=e.target.closest('[data-quest-print]');if(b&&rows[Number(b.dataset.questPrint)])print([rows[Number(b.dataset.questPrint)]],true);});
}
