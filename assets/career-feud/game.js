(function(){
'use strict';
const BASE='https://tyzpophjoptciihaszqj.supabase.co/functions/v1/',API=BASE+'career-feud';
const FOCI=['Workplace Readiness','Job Exploration','Self-Advocacy','Postsecondary Education'];
const DEFAULT=[{name:'Team 1',members:['Olivia','Bradley (Max)','Alyssa']},{name:'Team 2',members:['Jocquan','Kaylee','Nick']}];
const app=document.getElementById('app'),$=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(label,action,extra='',cls='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
const read=(storage,key,fallback=null)=>{try{return JSON.parse(storage.getItem(key)||'null')??fallback}catch{return fallback}};
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
let s=null,session=null,mode='welcome',selection=null,busy=false,polling=false,lastHeartbeat=0,queue=Promise.resolve(),draftTimer=null,pendingCreate=null,clockAt=0,lastRender='',sound=false,audioContext=null,setupTeams=DEFAULT,notesDraft=null,notesDirty=false;
const drafts=new Map();
function notice(msg){$('notice').textContent=msg;$('notice').classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('notice').classList.remove('show'),6500)}
function connection(msg,bad=false){$('connection').textContent=msg;$('connection').classList.toggle('bad',bad)}
function beep(kind){if(!sound)return;try{audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.connect(g);g.connect(audioContext.destination);o.frequency.value=kind==='reveal'?740:440;g.gain.setValueAtTime(.06,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.3);o.start();o.stop(audioContext.currentTime+.31)}catch{}}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));if(sound)beep('ready')};
async function request(body,authorization){
 const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),12000);
 try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',...(authorization?{Authorization:'Bearer '+authorization}:{})},body:JSON.stringify(body),signal:ctl.signal});let d;try{d=await r.json()}catch{throw Error('The game connection did not respond. Your saved answer is safe; try again.')}if(!r.ok)throw Object.assign(Error(d.error||'Unable to connect.'),{status:r.status});return d;}finally{clearTimeout(timeout)}
}
function accept(d){
 if(s&&d.code===s.code&&d.revision<s.revision)return;
 if(s&&s.phase!==d.phase&&(d.phase==='reveal'||d.phase==='between'))beep(d.phase);
 s=d;clockAt=Date.now();connection('Connected · room '+s.code);
 if(s.role==='host'&&!notesDirty)notesDraft={notes:{...s.notes},nextPlan:s.nextPlan};
 renderGame();tick();
}
function act(action,extra={}){
 const id=token();queue=queue.catch(()=>{}).then(async()=>{
  if(!session)throw Error('Join a room first.');
  busy=true;app.classList.add('busy');
  try{const d=await request({...session,...extra,action,requestId:id});accept(d);return d}
  catch(e){connection('Connection or action needs attention',true);notice(e.name==='AbortError'?'Connection timed out. Reconnect and check the saved state before retrying.':e.message);throw e}
  finally{busy=false;app.classList.remove('busy')}
 });return queue;
}
function saveSession(v,host){
 session={code:v.code,token:v.token};
 if(host)sessionStorage.setItem('ttCareerFeudHost',JSON.stringify(session));
 else localStorage.setItem('ttCareerFeudTeam:'+v.code,JSON.stringify(session));
 history.replaceState(null,'',location.pathname+'?room='+v.code);
}
function avatar(n){
 const key=n==='Bradley (Max)'?'Max':n,a=window.TTBusinessAvatars?.[key];
 return a?.image?'<span class="avatar" role="img" aria-label="'+esc(n)+'" style="background-image:url(\''+esc(a.image)+'\');background-position:'+a.position+';background-size:'+a.size+'"></span>':'<span class="avatar fallback" aria-label="'+esc(n)+'">'+esc(n.charAt(0))+'</span>';
}
function welcome(){
 mode='welcome';s=null;session=null;lastRender='';
 const code=new URLSearchParams(location.search).get('room')||'';
 app.innerHTML='<section class="welcome"><div class="welcome-hero"><span class="pill">The school game-show stage</span><h1>Ready, Set,<br><em>Work!</em></h1><p>Two teams. Real workplace decisions. Talk it through, lock in your answer, and make your case.</p></div><div class="split"><section class="card host-card"><p class="eyebrow">TEACHER COMPUTER</p><h2>Run the show.</h2><p>You choose the questions, reveal the answers, and award the points.</p>'+btn('Host Game','setup','','primary')+'</section><section class="card team-card"><p class="eyebrow">ONE LAPTOP PER TEAM</p><h2>Take your podium.</h2><form id="joinForm" class="stack"><label>Room code<input id="roomCode" class="code-input" maxlength="6" minlength="6" pattern="[A-Za-z2-9]{6}" value="'+esc(code)+'" required autocomplete="off"></label><button class="cyan">Join Game</button></form></section></div><p class="footer-note">Three people at each team laptop · No student accounts · Typed team answers · Teacher-awarded points</p></section>';
}
function teamFields(list=setupTeams){return list.map((t,i)=>'<div class="card"><label>Team '+(i+1)+' name<input name="team'+i+'" value="'+esc(t.name)+'" maxlength="50" required></label><div class="team-fields" style="margin-top:14px">'+t.members.map((n,j)=>'<label>Student '+(j+1)+'<input name="student'+i+j+'" value="'+esc(n)+'" maxlength="60" required></label>').join('')+'</div></div>').join('')}
function readTeams(form){return [0,1].map(i=>({name:form.elements['team'+i].value.trim(),members:[0,1,2].map(j=>form.elements['student'+i+j].value.trim())}))}
function teacherToken(){const p=read(sessionStorage,'ttMonitorPinAuth');if(p?.token&&Date.parse(p.expires_at)>Date.now())return p.token;const a=read(sessionStorage,'tt-monitor-auth-v1');return a?.access_token||''}
function setup(){
 mode='setup';app.innerHTML='<section class="setup"><p class="eyebrow">HOST DESK</p><h1>Set up your classroom show.</h1><p class="muted">One service focus. Two team laptops. Three voices at each podium.</p><form id="hostForm" class="stack"><div class="card fieldgrid"><label>Pre-ETS service focus<select name="focus">'+FOCI.map(f=>'<option>'+f+'</option>').join('')+'</select></label><label>Questions this session<select name="length">'+Array.from({length:14},(_,i)=>'<option '+(i===13?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label><label>Discussion time per round<select name="seconds"><option value="90">90 seconds</option><option value="60">60 seconds</option><option value="120">2 minutes</option><option value="180">3 minutes</option><option value="0">Untimed</option></select></label></div><div class="split">'+teamFields()+'</div><div class="card"><div class="host-id"><img src="miss-kayla-info-center.png" alt="Existing Miss Kayla artwork"><div><h2>Miss Kayla’s host controls</h2><p class="muted">Use your existing Transition Town teacher passcode.</p></div></div><label>Teacher passcode '+(teacherToken()?'(already signed in; leave blank)':'')+'<input name="pin" id="teacherPin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" '+(teacherToken()?'':'required')+'></label><p class="muted">Olivia and Jocquan stay on opposite teams. Roles rotate after every question.</p><div class="row"><button class="primary">Create live room</button>'+btn('Back','home','','quiet')+'</div></div></form></section>';
}
async function inspect(code){
 const d=await request({action:'inspect',code});selection=d;mode='select';
 app.innerHTML='<section class="setup"><p class="eyebrow">ROOM '+esc(d.code)+'</p><h1>Choose your assigned team.</h1><p>Use one laptop for all three teammates. The other team uses its own laptop.</p><div class="split">'+d.teams.map((t,i)=>'<div class="card">'+btn(esc(t.name)+'<small>'+t.members.map(esc).join(' · ')+'</small>','claim','data-team="'+i+'" '+(!t.available?'disabled':''),'select-team '+(i?'':'cyan'))+'<p class="muted" style="margin-top:14px">'+(t.available?'This podium is available.':'Already assigned to another laptop. Ask the host to release it if needed.')+'</p></div>').join('')+'</div><p>'+btn('Check seats again','inspect')+' '+btn('Change room','home','','quiet')+'</p></section>';
}
function podium(i){
 const t=s.teams[i],own=s.role===i,submitted=s.round?.answers[i]?.locked;
 return '<aside class="podium '+(i?'two ':'')+(own?'mine':'')+'"><div class="faces">'+t.members.map(avatar).join('')+'</div><span class="presence '+(s.connected[i]?'on':'')+'">'+(s.connected[i]?'Connected':s.claimed[i]?'Reconnecting':'Waiting for laptop')+'</span><h2>'+esc(t.name)+(own?' · You':'')+'</h2><div class="members">'+t.members.map(esc).join('<br>')+'</div><div class="score">'+s.scores[i]+'</div><small>POINTS</small><div class="locked-state">'+(['lobby','between'].includes(s.phase)?s.ready[i]?'Ready to play':'Confirm roles, then ready':submitted?'Answer locked in':'Answer not locked')+'</div></aside>';
}
function roleRibbon(r){return '<div class="role-ribbon">'+r.map(x=>'<div><small>'+esc(x.role)+'</small><b>'+esc(x.student)+'</b></div>').join('')+'</div>'}
function responses(round=s.round){return '<div class="response-grid">'+round.answers.map((a,i)=>'<section class="response '+(a.text===null?'hidden-answer':'')+'"><h3>'+esc(s.teams[i].name)+' · '+(a.locked?'LOCKED':'NOT LOCKED')+'</h3><p>'+esc(a.text===null?'Answer hidden until the teacher reveals.':a.text||'No answer submitted.')+'</p></section>').join('')+'</div>'}
function center(){
 const host=s.role==='host',waiting=['lobby','between'].includes(s.phase);
 if(waiting){
  const between=s.phase==='between';
  return '<div class="board"><div class="board-top"><span class="round-label">'+(between?'BEFORE ROUND '+(s.roundNumber+1):'WELCOME TO YOUR LIVE ROOM')+'</span><span class="pill">'+s.total+' questions</span></div><div class="lobby-center"><h2>'+(between?'Rotate. Discuss. Go again.':'Your podiums are waiting.')+'</h2><p>'+(between?'Pass the keyboard to the next typist. Give each teammate a turn before deciding on your shared answer.':'Each team uses one laptop. Choose a discussion leader, typist, and spokesperson.')+'</p>'+(host?'<div class="ready-list">'+s.teams.map((t,i)=>'<div class="ready-line">'+esc(t.name)+': <strong>'+(s.connected[i]&&s.ready[i]?'Connected and ready':s.connected[i]?'Connected; checking roles':'Waiting for connection')+'</strong></div>').join('')+'</div>':roleRibbon(s.upcomingRoles[s.role])+btn(s.ready[s.role]?'Team ready — waiting for host':'We have our roles — READY','ready','','cyan'))+'</div></div>';
 }
 if(s.phase==='ended'){
  const tied=s.scores[0]===s.scores[1],winner=s.teams[s.scores[0]>s.scores[1]?0:1].name;
  return '<div class="board"><p class="eyebrow">SESSION COMPLETE</p><h2 class="results-heading">'+(tied?'A shared finish.':esc(winner)+' takes the round of applause.')+'</h2><p style="text-align:center">Final score: <b>'+s.scores[0]+' – '+s.scores[1]+'</b><br>'+s.roundNumber+' of '+s.total+' questions presented.</p><p class="footer-note">Keep the reasoning going: what would you take into a real workplace?</p></div>';
 }
 const r=s.round,key=s.code+':'+r.number,answer=drafts.has(key)?drafts.get(key):r.answers[s.role]?.text||'';
 return '<div class="board"><div class="board-top"><span class="round-label">ROUND '+r.number+' / '+s.total+' · '+esc(r.category)+'</span><span id="clock" class="clock"></span></div><h2 class="question">'+esc(r.prompt)+'</h2><div class="board-footer">'+(s.paused?'Discussion paused. Wait for the host.':s.phase==='reveal'?'Spokespeople: explain your team’s reasoning.':'Discuss together. Give a reason, not just a word.')+'</div></div>'+(host?'':roleRibbon(r.roles[s.role]))+(s.phase==='discuss'&&!host?'<form id="answerForm" class="answer-entry"><label for="teamAnswer">Your shared team answer</label><textarea id="teamAnswer" name="answer" rows="3" maxlength="2400" '+(s.paused||r.answers[s.role].locked?'disabled':'')+' placeholder="We would first… because… Then we would…">'+esc(answer)+'</textarea><div class="row spread"><small id="answerStatus">'+(r.answers[s.role].locked?'Saved and locked. Ask your teacher to unlock a correction.':'One answer represents your team’s discussion.')+'</small><button id="lockButton" class="primary lock" '+(s.paused||r.answers[s.role].locked?'disabled':'')+'>'+(r.answers[s.role].locked?'LOCKED IN':'LOCK IN')+'</button></div></form>':'')+(s.phase==='reveal'?responses():host?responses():'');
}
function scoresForm(r){return '<div class="scoring">'+s.teams.map((t,i)=>'<form class="scoreForm" data-team="'+i+'" data-round="'+r.number+'"><label>'+esc(t.name)+' · points for this question</label><div class="row" style="margin-top:8px"><input aria-label="'+esc(t.name)+' round points" type="number" name="points" min="-100" max="100" step="1" value="'+r.points[i]+'" required><button class="cyan">Set points</button></div></form>').join('')+'</div>'}
function hostPanel(){
 const waiting=['lobby','between'].includes(s.phase),r=s.round;
 let controls='';
 if(waiting)controls+=btn(s.phase==='lobby'?'Start first round':'Start next round','start',s.ready.every(Boolean)&&s.connected.every(Boolean)?'':'disabled','primary');
 if(s.phase==='discuss')controls+=btn(s.paused?'Resume':'Pause',s.paused?'resume':'pause')+btn('REVEAL ANSWERS','reveal','','primary');
 if(s.phase==='reveal')controls+=btn(s.roundNumber===s.total?'Finish game':'Next · rotate roles','next','','primary');
 if(['discuss','reveal'].includes(s.phase))controls+=btn('Skip question','skip','','quiet');
 if(s.phase!=='ended')controls+=btn('End session','end','','danger');
 controls+=btn('Undo last score','undo',s.canUndo?'':'disabled','quiet');
 const timer=s.phase==='discuss'?'<div class="row"><label for="timerSeconds">Discussion seconds</label><input id="timerSeconds" class="inline-input" type="number" min="0" max="900" value="90">'+btn('Set timer','timer')+btn('+30 seconds','addTime')+btn('Untimed','untimed','','quiet')+'<small>Timer ending never reveals answers.</small></div><div class="row">'+s.teams.map((t,i)=>btn('Unlock '+esc(t.name),'unlock','data-team="'+i+'" '+(r.answers[i].locked?'':'disabled'),'quiet')).join('')+'</div>':'';
 const guide=r?.guidance?'<details class="card judging" open><summary>Teacher judging desk · Suggested '+r.guidance.points+' points</summary><p class="muted">These are teaching prompts, not survey results. Award points for sound reasoning, including reasonable alternatives.</p><h3>Listen for</h3><ul>'+r.guidance.lookFor.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul><h3>Acceptable alternatives</h3><p>'+esc(r.guidance.alternatives)+'</p><h3>Teaching explanation</h3><p>'+esc(r.guidance.teaching)+'</p>'+(r.revealed?scoresForm(r):'<p class="muted">Reveal answers before awarding points.</p>')+'</details>':'';
 return '<section class="host-panel"><div class="host-controls"><div class="row">'+controls+'</div>'+timer+'</div>'+guide+'<details class="card notes" '+(notesDirty?'open':'')+'><summary>Participation notes & next-session plan</summary><p class="muted">Record what you actually observed from each student. Team answers alone are not individual evidence.</p><form id="notesForm"><div class="note-fields">'+s.teams.map((t,i)=>t.members.map((n,j)=>'<label>'+esc(n)+'<textarea data-note="'+i+':'+j+'" rows="3" maxlength="3000" placeholder="Observed contribution, support provided, or not observed.">'+esc(notesDraft?.notes[i+':'+j]||'')+'</textarea></label>').join('')).join('')+'</div><label class="next-plan">Next-session plan<textarea id="nextPlan" rows="3" maxlength="3000">'+esc(notesDraft?.nextPlan||'')+'</textarea></label><div class="row"><button class="cyan">Save notes</button><span class="saved" id="notesSaved">'+(notesDirty?'Unsaved changes':'Notes saved on the room')+'</span></div></form></details><details class="card notes"><summary>Team setup & connection help</summary><p>Release a seat only to move that team to another laptop. Answers and scores stay saved.</p><div class="row">'+s.teams.map((t,i)=>btn('Release '+esc(t.name)+' seat','release','data-team="'+i+'"','quiet')).join('')+'</div>'+(s.phase==='lobby'?'<form id="rosterForm"><div class="split" style="margin-top:18px">'+teamFields(s.teams)+'</div><button style="margin-top:12px">Save team names and rosters</button></form>':'<p class="muted">Rosters are fixed once play begins so the role history stays accurate.</p>')+'</details></section>';
}
function results(){
 const host=s.role==='host';
 const tools=host?'<div class="print-tools">'+btn('Print session report','print','','primary')+'<select id="studentReport" aria-label="Student for individual summary">'+s.teams.map((t,i)=>t.members.map((n,j)=>'<option value="'+i+':'+j+'">'+esc(n)+'</option>').join('')).join('')+'</select>'+btn('Print individual summary','printStudent')+'</div>':'';
 return tools+'<section class="card history"><h2>Review the decisions</h2>'+s.history.map(r=>'<article><p class="eyebrow">QUESTION '+r.number+(r.skipped?' · SKIPPED':'')+'</p><h3>'+esc(r.prompt)+'</h3>'+responses(r)+'<p><b>Points:</b> '+esc(s.teams[0].name)+' '+r.points[0]+' · '+esc(s.teams[1].name)+' '+r.points[1]+'</p><p><b>Teaching explanation:</b> '+esc(r.guidance?.teaching||r.teaching||'This round was not revealed. Discuss it with your teacher.')+'</p>'+(host&&r.revealed?'<details><summary>Correct this round’s points</summary>'+scoresForm(r)+'</details>':'')+'</article>').join('')+'</section>';
}
function renderGame(){
 if(!s)return;mode='game';
 const host=s.role==='host',signature=JSON.stringify({...s,serverNow:0,remaining:0,revision:0});
 if(signature===lastRender)return;lastRender=signature;
 const focused=document.activeElement,focusId=focused?.id,start=focused?.selectionStart,end=focused?.selectionEnd;
 const detailStates=[...app.querySelectorAll('details')].map(d=>d.open);
 const sameRound=app.dataset.round===String(s.roundNumber);
 const fields=sameRound?[...app.querySelectorAll('input,select')].filter(el=>el===focused).map(el=>({id:el.id,name:el.name,value:el.value,form:el.form?.id})):[];
 const joinURL=location.origin+location.pathname+'?room='+s.code;
 app.innerHTML='<div class="room-strip"><div><p class="eyebrow">'+esc(s.focus)+' · '+(host?'HOST DESK':esc(s.teams[s.role].name))+'</p><h1>Ready, Set, Work!</h1></div><div class="row"><span class="room-code">'+s.code+'</span>'+(host?'<input id="joinLink" class="join-link" aria-label="Student join link" value="'+esc(joinURL)+'" readonly>'+btn('Copy join link','copy'):'')+btn('Leave screen','leave','','quiet')+'</div></div><div class="stage">'+podium(0)+'<section class="stage-center">'+center()+'</section>'+podium(1)+'</div>'+(host?hostPanel():'')+(s.phase==='ended'?results():'')+'<p class="footer-note">Two teams · Discuss together · Type one shared answer · Give everyone a voice</p>';
 app.dataset.round=String(s.roundNumber);
 if(sameRound){[...app.querySelectorAll('details')].forEach((d,i)=>{if(detailStates[i]!==undefined)d.open=detailStates[i]});for(const f of fields){const el=f.id?$(f.id):f.form?document.getElementById(f.form)?.elements[f.name]:null;if(el)el.value=f.value}}
 if(focusId&&$(focusId)){const el=$(focusId);el.focus({preventScroll:true});if(typeof start==='number'&&el.setSelectionRange)try{el.setSelectionRange(start,end)}catch{}}
 tick();
}
function tick(){
 if(!s)return;
 const left=s.remaining===null?null:Math.max(0,s.remaining-(!s.paused&&s.phase==='discuss'?Math.floor((Date.now()-clockAt)/1000):0));
 const clock=$('clock');if(clock){clock.textContent=s.phase==='reveal'?'REVEAL':s.paused?'PAUSED':left===null?'UNTIMED':Math.floor(left/60)+':'+String(left%60).padStart(2,'0');clock.classList.toggle('urgent',left!==null&&left<=10)}
 if($('lockButton'))$('lockButton').disabled=s.phase!=='discuss'||s.paused||s.round.answers[s.role].locked||left===0;
 if($('answerStatus')&&left===0&&!s.round.answers[s.role].locked)$('answerStatus').textContent='Time is up. Your draft stays here; the teacher can add time.';
}
async function refresh(){
 if(!session||polling||busy)return;polling=true;
 try{
  const heartbeat=s?.role!=='host'&&Date.now()-lastHeartbeat>7000;
  const d=await request({...session,action:heartbeat?'heartbeat':'state'});
  if(heartbeat)lastHeartbeat=Date.now();accept(d);
 }catch(e){connection(e.status===401?'Seat released — rejoin your team':'Reconnecting… saved answers are safe',true)}
 finally{polling=false}
}
async function restore(){
 const code=(new URLSearchParams(location.search).get('room')||'').toUpperCase(),h=read(sessionStorage,'ttCareerFeudHost');
 const saved=h&&(!code||h.code===code)?h:code?read(localStorage,'ttCareerFeudTeam:'+code):null;
 if(saved){session=saved;app.innerHTML='<div class="loading">Reconnecting to your podium…</div>';try{accept(await request({...session,action:'state'}));return}catch(e){notice(e.message);session=null}}
 welcome();if(code)try{await inspect(code)}catch(e){notice(e.message)}
}
document.addEventListener('input',e=>{
 if(e.target.id==='teamAnswer'&&s){const key=s.code+':'+s.roundNumber;drafts.set(key,e.target.value);clearTimeout(draftTimer);const answer=e.target.value,round=s.roundNumber;draftTimer=setTimeout(()=>{if(session&&s.phase==='discuss'&&!s.paused&&!s.round.answers[s.role].locked)act('draft',{answer,round}).catch(()=>{})},700)}
 if(e.target.matches('[data-note],#nextPlan')){notesDraft=notesDraft||{notes:{},nextPlan:''};if(e.target.dataset.note)notesDraft.notes[e.target.dataset.note]=e.target.value;else notesDraft.nextPlan=e.target.value;notesDirty=true;if($('notesSaved'))$('notesSaved').textContent='Unsaved changes';}
});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!['hostForm','joinForm','answerForm','notesForm','rosterForm'].includes(form.id)&&!form.classList.contains('scoreForm'))return;
 e.preventDefault();const submit=e.submitter;if(submit)submit.disabled=true;
 try{
  if(form.id==='hostForm'){
   let auth=teacherToken();const pin=form.elements.pin.value;
   if(pin){const r=await fetch(BASE+'classroom-monitor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'teacher_pin',pin})});const d=await r.json();form.elements.pin.value='';if(!r.ok)throw Error(d.error||'Teacher sign-in failed.');sessionStorage.setItem('ttMonitorPinAuth',JSON.stringify(d));auth=d.token}
   if(!auth)throw Error('Enter your existing teacher passcode.');
   pendingCreate=pendingCreate||token();setupTeams=readTeams(form);
   const d=await request({action:'create',token:pendingCreate,focus:form.elements.focus.value,length:Number(form.elements.length.value),seconds:Number(form.elements.seconds.value),teams:setupTeams},auth);
   saveSession({code:d.code,token:pendingCreate},true);pendingCreate=null;accept(d);
  }else if(form.id==='joinForm'){
   const code=$('roomCode').value.trim().toUpperCase(),saved=read(localStorage,'ttCareerFeudTeam:'+code);
   if(saved){try{const d=await request({...saved,action:'state'});saveSession(saved,false);accept(d);return}catch{}}
   await inspect(code);
  }else if(form.id==='answerForm'){clearTimeout(draftTimer);await act('lock',{answer:$('teamAnswer').value,round:s.roundNumber});beep('lock')}
  else if(form.id==='notesForm'){await act('notes',notesDraft);notesDirty=false;notesDraft={notes:{...s.notes},nextPlan:s.nextPlan};if($('notesSaved'))$('notesSaved').textContent='Saved';notice('Participation notes saved.')}
  else if(form.id==='rosterForm'){await act('configure',{teams:readTeams(form)});notice('Team setup saved.')}
  else if(form.classList.contains('scoreForm')){await act('score',{team:Number(form.dataset.team),round:Number(form.dataset.round),points:Number(form.elements.points.value)});}
 }catch(e){notice(e.name==='AbortError'?'Connection timed out. Please retry.':e.message)}
 finally{if(submit?.isConnected)submit.disabled=false;tick()}
});
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;
 try{
  if(action==='home'){welcome();return}
  if(action==='setup'){setup();return}
  if(action==='inspect'){await inspect(selection.code);return}
  if(action==='claim'){
   b.disabled=true;const code=selection.code;let saved=read(localStorage,'ttCareerFeudTeam:'+code)||{code,token:token()};
   localStorage.setItem('ttCareerFeudTeam:'+code,JSON.stringify(saved));
   const d=await request({...saved,action:'join',team:Number(b.dataset.team)});saveSession(saved,false);accept(d);return;
  }
  if(action==='leave'){if(notesDirty&&!confirm('Your participation notes have not been saved. Leave this screen?'))return;welcome();return}
  if(action==='copy'){try{await navigator.clipboard.writeText($('joinLink').value);notice('Student join link copied.')}catch{$('joinLink').select();notice('Press Ctrl+C to copy the selected student link.')}return}
  if(action==='print'||action==='printStudent'){const studentKey=action==='printStudent'?$('studentReport').value:undefined;if(notesDirty){await act('notes',notesDraft);notesDirty=false}const html=window.CareerFeudReport.html(s,studentKey);$('printArea').innerHTML=html;window.print();return}
  if(action==='ready'){await act('ready',{ready:true});return}
  if(action==='timer'){await act('timer',{seconds:Number($('timerSeconds').value)});return}
  if(action==='untimed'){await act('timer',{seconds:0});return}
  if(action==='addTime'){const left=s.remaining===null?0:Math.max(0,s.remaining-(!s.paused?Math.floor((Date.now()-clockAt)/1000):0));await act('timer',{seconds:Math.min(900,left+30)});return}
  if(action==='release'){if(!confirm('Release this team’s laptop seat? Its saved answers and points will remain.'))return;await act('release',{team:Number(b.dataset.team)});return}
  if(action==='unlock'){await act('unlock',{team:Number(b.dataset.team)});return}
  if(action==='skip'&&!confirm('Skip this question? It will be recorded as skipped, and hidden answers will stay hidden.'))return;
  if(action==='end'&&!confirm('End this classroom session and open the results? Hidden answers will stay hidden.'))return;
  if(action==='reveal'&&!s.round.answers.every(a=>a.locked)&&!confirm('A team has not locked an answer. Reveal the answers saved so far?'))return;
  if(['start','pause','resume','reveal','next','skip','end','undo'].includes(action))await act(action);
 }catch(e){notice(e.message);if(b.isConnected)b.disabled=false}
});
window.addEventListener('beforeunload',e=>{if(notesDirty){e.preventDefault();e.returnValue=''}});
window.addEventListener('online',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
setInterval(()=>{if(!document.hidden)refresh()},900);setInterval(tick,250);
restore();
})();
