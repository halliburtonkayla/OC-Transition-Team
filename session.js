(function(){
const KEY='tt_preets_session_v4',areas=['Job Exploration','Workplace Readiness','Self-Advocacy','Postsecondary Education'],$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function load(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}function save(s){sessionStorage.setItem(KEY,JSON.stringify(s))}
function activity(){return document.title||location.pathname.split('/').pop()||'Website activity'}function elapsed(s){return Math.max(0,Date.now()-s.startedAt)}function left(s){return Math.max(0,1800000-elapsed(s))}function fmt(ms){let n=Math.ceil(ms/1000);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function ui(){if($('ttSessionBar'))return;let b=document.createElement('div');b.id='ttSessionBar';b.innerHTML='<span id="ttWho">No active Pre-ETS session</span><span class="ttTime" id="ttTime">30:00</span><button id="ttStart">Start Session</button><button id="ttView">Session Summary</button>';document.body.insertBefore(b,document.body.firstChild);
let m=document.createElement('div');m.id='ttModal';m.innerHTML=`<div class="ttPanel"><h2>Start 30-Minute Pre-ETS Session</h2><p>Student information is temporary and clears when you end the session.</p><label>Student name or initials</label><input id="ttStudent" autocomplete="off" placeholder="Example: K.B."><label>Choose ONE Pre-ETS area</label><select id="ttArea">${areas.map(a=>`<option>${a}</option>`).join('')}</select><label>Session focus/activity (optional)</label><input id="ttFocus" placeholder="Example: Payday Life Story"><div class="ttBtns"><button class="ttGreen" id="ttBegin">Start 30 Minutes</button><button id="ttCancel">Cancel</button></div></div>`;document.body.appendChild(m);
let s=document.createElement('div');s.id='ttSummary';s.innerHTML=`<div class="ttPanel"><h2>Pre-ETS Session Summary</h2><div id="ttReport"></div><div class="ttNoPrint"><label>Participation / support</label><select id="ttSupport"><option>Independent</option><option>Minimal prompts</option><option>Moderate prompts</option><option>Maximum support</option></select><label>Progress / student response</label><textarea id="ttProgress" rows="3"></textarea><label>Next-session plan</label><textarea id="ttNext" rows="3"></textarea><div class="ttBtns"><button class="ttPrint" id="ttPrint">🖨 Print / Save as PDF</button><button class="ttPrimary" id="ttUpdate">Update Summary</button><button class="ttRed" id="ttEnd">End & Clear Session</button><button id="ttClose">Close</button></div></div></div>`;document.body.appendChild(s);
$('ttStart').onclick=openStart;$('ttView').onclick=openSummary;$('ttCancel').onclick=()=>m.style.display='none';$('ttClose').onclick=()=>s.style.display='none';$('ttBegin').onclick=start;$('ttPrint').onclick=()=>{notes();render();setTimeout(()=>window.print(),50)};$('ttUpdate').onclick=()=>{notes();render()};$('ttEnd').onclick=()=>{sessionStorage.removeItem(KEY);s.style.display='none';tick()}}
function openStart(){let s=load();if(s){openSummary();return}$('ttModal').style.display='flex'}function start(){let student=$('ttStudent').value.trim();if(!student){alert('Enter the student name or initials first.');return}save({student,area:$('ttArea').value,focus:$('ttFocus').value.trim(),startedAt:Date.now(),activities:[],choices:[],support:'Independent',progress:'',next:''});$('ttModal').style.display='none';recordActivity(activity());tick()}
function recordActivity(n){let s=load();if(!s)return;n=(n||activity()).trim();if(n&&!s.activities.includes(n))s.activities.push(n);save(s)}
function recordChoice(o){let s=load();if(!s)return;s.choices.push({activity:o.activity||activity(),scene:o.scene||'',choice:o.choice||'',quality:o.quality});if(!s.activities.includes(o.activity||activity()))s.activities.push(o.activity||activity());save(s)}
function notes(){let s=load();if(!s)return;s.support=$('ttSupport').value;s.progress=$('ttProgress').value.trim();s.next=$('ttNext').value.trim();save(s)}
function auto(s){if(s.progress)return s.progress;if(s.choices.length){let strong=s.choices.filter(x=>x.quality===0).length;return `Completed ${s.choices.length} decision points. Demonstrated decision-making and problem-solving; ${strong} choice(s) reflected the strongest planned response.`}return `Participated in ${s.activities.length||1} transition activity during the session.`}
function render(){let s=load();if(!s){$('ttReport').innerHTML='<p>No active session yet.</p>';return}$('ttSupport').value=s.support||'Independent';$('ttProgress').value=s.progress||'';$('ttNext').value=s.next||'';let d=new Date(s.startedAt),duration=Math.max(1,Math.round(elapsed(s)/60000)),rows=s.choices.slice(-20).map(x=>`<li><b>${esc(x.activity)}</b>${x.scene?' — Scene '+esc(x.scene):''}: ${esc(x.choice)}</li>`).join('');$('ttReport').innerHTML=`<div class="ttReport"><dl><dt>Student</dt><dd>${esc(s.student)}</dd><dt>Date</dt><dd>${d.toLocaleDateString()}</dd><dt>Start time</dt><dd>${d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</dd><dt>Minutes completed</dt><dd>${duration}</dd><dt>Pre-ETS area</dt><dd>${esc(s.area)}</dd><dt>Activity / focus</dt><dd>${esc(s.focus||s.activities.join(', ')||activity())}</dd><dt>Activities visited</dt><dd>${esc(s.activities.join(', ')||activity())}</dd><dt>Participation / support</dt><dd>${esc(s.support||'Independent')}</dd><dt>Progress / student response</dt><dd>${esc(auto(s))}</dd><dt>Next-session plan</dt><dd>${esc(s.next||'Continue skill practice and review student responses.')}</dd></dl>${rows?'<h3>Recorded activity choices</h3><ol>'+rows+'</ol>':''}</div>`}
function openSummary(){ui();render();$('ttSummary').style.display='flex'}function tick(){ui();let s=load();if(!s){$('ttWho').textContent='No active Pre-ETS session';$('ttTime').textContent='30:00';$('ttStart').textContent='Start Session';return}recordActivity(activity());s=load();$('ttWho').textContent=s.student+' • '+s.area;$('ttStart').textContent='Session Active';$('ttTime').textContent=left(s)?fmt(left(s)):'30:00 COMPLETE'}
window.TTSession={recordActivity,recordChoice,openSummary,openStart};document.addEventListener('DOMContentLoaded',()=>{ui();tick();setInterval(tick,1000);document.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>recordActivity(a.textContent.trim().slice(0,80))))})})();

/* === PRE-ETS DATA SHEET UPGRADE === */
(function(){
 const KEY='tt_active_session_v3';
 const AREAS=[
  'Job Exploration Counseling',
  'Workplace Readiness Training',
  'Self-Advocacy Instruction',
  'Counseling on Postsecondary Education Opportunities',
  'Work-Based Learning Experiences'
 ];
 function load(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
 function save(s){sessionStorage.setItem(KEY,JSON.stringify(s))}
 function fmt(t){if(!t)return '';return new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
 function mins(a,b){return Math.max(0,Math.round((b-a)/60000))}
 function setup(){
   let s=load();
   if(s) return s;
   const student=prompt('Student name or initials:')||'';
   let area=prompt('Pre-ETS Area:\n1 Job Exploration Counseling\n2 Workplace Readiness Training\n3 Self-Advocacy Instruction\n4 Postsecondary Education\n5 Work-Based Learning Experiences','1')||'1';
   area=AREAS[Math.max(0,Math.min(4,(parseInt(area)||1)-1))];
   s={student,area,start:Date.now(),stop:null,activity:document.title,choices:[],support:'Independent',notes:'',progress:'',next:''};
   save(s); return s;
 }
 function recordChoice(activity,choice,result){
   let s=load(); if(!s)return;
   s.activity=activity||s.activity;
   s.choices=s.choices||[];
   s.choices.push({activity:s.activity,choice:String(choice||''),result:String(result||'')});
   save(s);
 }
 function dataText(s){
   const stop=s.stop||Date.now(), total=mins(s.start,stop);
   const choiceSummary=(s.choices||[]).slice(-6).map(x=>x.choice).filter(Boolean).join('; ');
   const intervention=`Student participated in ${s.activity||'an interactive transition activity'} focused on ${s.area}.`;
   const response=`Student participated in the activity${choiceSummary?` and made the following documented choices: ${choiceSummary}`:''}. Student completed the session with ${s.support||'Independent'} support.`;
   const progress=s.progress||`Student demonstrated participation and increased awareness of skills related to ${s.area}.`;
   const next=s.next||`Continue ${s.area} with a follow-up activity that builds on today's skills and student responses.`;
   return `Student: ${s.student||''}\nDate: ${new Date(s.start).toLocaleDateString()}\nPre-ETS Area: ${s.area}\nStart Time: ${fmt(s.start)}\nStop Time: ${fmt(stop)}\nTotal Session Time: ${total} minutes\nActivity/Intervention: ${intervention}\nStudent Response/Performance: ${response}\nLevel of Support: ${s.support||'Independent'}\nProgress/Outcome: ${progress}\nNext Session Plan: ${next}${s.notes?`\nNotes: ${s.notes}`:''}`;
 }
 function summary(){
   let s=load(); if(!s){alert('Start a session first.');return}
   if(!s.stop){s.stop=Date.now();save(s)}
   let old=document.getElementById('ttPreetsSummary'); if(old)old.remove();
   let d=document.createElement('div'); d.id='ttPreetsSummary';
   d.style.cssText='position:fixed;inset:4%;z-index:100000;background:white;color:#111827;border-radius:18px;padding:22px;overflow:auto;box-shadow:0 10px 40px #0006;font-family:Arial,sans-serif';
   d.innerHTML=`<h2>Pre-ETS Session Summary</h2><pre style="white-space:pre-wrap;font:inherit;line-height:1.55;background:#f3f4f6;padding:16px;border-radius:12px">${dataText(s).replace(/</g,'&lt;')}</pre>
   <p><label><b>Level of Support:</b> <select id="ttSupport"><option>Independent</option><option>Minimal prompts</option><option>Moderate prompts</option><option>Maximum support</option></select></label></p>
   <p><label><b>Progress/Outcome:</b><br><textarea id="ttProgress" style="width:100%;min-height:65px">${s.progress||''}</textarea></label></p>
   <p><label><b>Next Session Plan:</b><br><textarea id="ttNext" style="width:100%;min-height:65px">${s.next||''}</textarea></label></p>
   <p><label><b>Notes:</b><br><textarea id="ttNotes" style="width:100%;min-height:65px">${s.notes||''}</textarea></label></p>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button id="ttCopyData">📋 Copy Pre-ETS Data Entry</button><button id="ttPrintData">🖨️ Print / Save PDF</button><button id="ttCloseData">Close</button></div>`;
   document.body.appendChild(d);
   document.getElementById('ttSupport').value=s.support||'Independent';
   function sync(){let x=load();x.support=document.getElementById('ttSupport').value;x.progress=document.getElementById('ttProgress').value;x.next=document.getElementById('ttNext').value;x.notes=document.getElementById('ttNotes').value;save(x);return x}
   d.querySelectorAll('select,textarea').forEach(x=>x.addEventListener('input',sync));
   document.getElementById('ttCopyData').onclick=async()=>{let x=sync();try{await navigator.clipboard.writeText(dataText(x));alert('Pre-ETS data entry copied.')}catch(e){prompt('Copy this data entry:',dataText(x))}};
   document.getElementById('ttPrintData').onclick=()=>{sync();window.print()};
   document.getElementById('ttCloseData').onclick=()=>d.remove();
 }
 function addBar(){
   if(document.getElementById('ttPreetsBar'))return;
   const bar=document.createElement('div');bar.id='ttPreetsBar';
   bar.style.cssText='position:fixed;left:10px;bottom:62px;z-index:99997;background:#fff;border:2px solid #1d4ed8;border-radius:14px;padding:8px;box-shadow:0 3px 12px #0002;font-family:Arial';
   bar.innerHTML='<button id="ttStartPreets">⏱ Start 30-Min Session</button> <button id="ttStopPreets">■ Stop + Data</button>';
   document.body.appendChild(bar);
   document.getElementById('ttStartPreets').onclick=()=>{sessionStorage.removeItem(KEY);let s=setup();alert(`Session started at ${fmt(s.start)} for ${s.student}.`)};
   document.getElementById('ttStopPreets').onclick=summary;
 }
 window.TTPreETS={start:setup,recordChoice,summary,load};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',addBar):addBar();
})();
