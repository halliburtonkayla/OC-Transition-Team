import {MISSIONS,DEFAULT_SETTINGS,GAME} from './missions.mjs';
import {newAdventure,restoreAdventure,settingsValid,unlocked,startMission,attemptFor,step,interact,answerQuestion,answerTask,objective,restartMission,resetPuzzle,createLevel} from './engine.mjs';
import {currentStudent,profileFor} from './profile.mjs';
import {createQuestRenderer} from './render.mjs';
import {attemptReport,reportHTML,monitorDetails,esc} from './report.mjs';
import {learningStore,learningId,speak} from '../learning/progress.mjs';
import {createSound} from '../transition-mission/sound.mjs';
const $=id=>document.getElementById(id),practice=new URLSearchParams(location.search).get('practice')==='1';
// Practice never reads real profiles and never loads the classroom recorder.
const practiceBackend={getItem:k=>sessionStorage.getItem('ttLifeQuestPractice:'+k),setItem:(k,v)=>sessionStorage.setItem('ttLifeQuestPractice:'+k,v)};
const practiceHost={sessionStorage:{...practiceBackend,getItem:k=>k==='ttCurrent'?'Fictional Explorer':practiceBackend.getItem(k)},localStorage:practiceBackend};
const host=practice?practiceHost:window,learning=learningStore(GAME,host),actor=learning.student,raw=learning.read().checkpoint;
let s=restoreAdventure(raw,actor)||newAdventure(actor,learningId(),practice),profile=practice?{student:actor,school:'Fictional Practice School',source:'Fictional practice character',reference:'practice:explorer',avatar:{skin:'#b47b58',hair:'#302623',shirt:'#328c7d',pants:'#344e62',hairStyle:'Braids',outfit:'Everyday glasses'},owner:null}:profileFor(actor);
let locked=false,saveAllowed=!raw||!!restoreAdventure(raw,actor),screen='home',paused=false,held={},last=0,lastActive=0,lastSave=0,lastReport=0,lastIdentity=0,task=null,taskCorrect=false,returnFocus=null;
const sound=createSound(),renderer=createQuestRenderer($('world')),portrait=createQuestRenderer($('portrait'));
s.avatarReference=profile.reference;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)s.settings.reducedMotion=true;
if(!practice){const script=document.createElement('script');script.src='assets/classroom-monitor/student.js?v=20261104-lifequest';document.body.append(script);}
const dialogs=()=>[...document.querySelectorAll('dialog')].some(d=>d.open);
const reportRows=()=>s.attempts.map(a=>attemptReport(a,actor,profile.school));
const status=message=>{$('status').textContent=message;};
function identityOK(){
 if(locked)return false;if(practice||currentStudent()===actor)return true;
 locked=true;paused=true;held={};sound.stop();speechSynthesis?.cancel();for(const d of document.querySelectorAll('dialog'))d.close();
 $('progress-content').replaceChildren();$('print-area').replaceChildren();$('map-nodes').replaceChildren();$('game-screen').hidden=true;$('map-screen').hidden=true;$('home').hidden=false;
 $('home').innerHTML='<div class="home-copy"><p class="eyebrow">A DIFFERENT STUDENT IS SIGNED IN</p><h1>Open your own adventure.</h1><p>Reload to load the current student’s character and progress.</p><a class="primary" href="transition-mission-2.html">Open my adventure →</a></div>';
 for(const id of ['map-button','sound-button','settings-button','pause-button'])$(id).disabled=true;return false;
}
function notice(){
 const storage=practice?'Fictional practice · all 20 missions available for review. Saves stay in this tab.':learning.notice();
 return !saveAllowed?'The existing adventure could not be read. It has been kept unchanged; this session cannot save.':storage;
}
function save(){if(!identityOK()||!saveAllowed)return false;s.lastSavedAt=new Date().toISOString();const ok=learning.checkpoint(s);$('save-status').textContent=notice();$('game-save-status').textContent=notice();return ok;}
function evidence(stage='snapshot'){
 if(!identityOK()||practice)return;const a=attemptFor(s);if(!a)return;
 learning.event(stage==='completed'?'completed':'action',`Transition Mission 2.0 · ${MISSIONS[a.mission-1].title} · ${stage} · ${Math.round(a.activeSeconds)} active seconds`,monitorDetails(a,stage));
}
function actionEvidence(label,correct,skill,status='activity'){
 if(practice||!identityOK())return;const a=attemptFor(s);learning.event(correct?'choice':'correction',label,{action:GAME,item:a.id,step:a.mission,status,task:String(label).slice(0,120),role:skill,success:correct});
}
function configureAudio(){sound.configure(s.settings);document.body.classList.toggle('less-motion',s.settings.reducedMotion);const on=s.settings.effects||s.settings.music||s.settings.voice;$('sound-button').textContent=on?'Sound on':'Sound off';$('sound-button').setAttribute('aria-pressed',String(on));}
function audio(){configureAudio();if(screen==='game'&&!paused&&!dialogs()&&attemptFor(s)?.status==='active')sound.music(true);else sound.stop();}
function controls(){const k=s.settings.keys,key=v=>v.startsWith('Shift')?'Shift':v.replace('Arrow','').replace('Key','');$('controls-text').innerHTML=`<span><kbd>${key(k.left)}</kbd><kbd>${key(k.right)}</kbd><kbd>${key(k.up)}</kbd><kbd>${key(k.down)}</kbd> / WASD move</span><span><kbd>${key(k.jump)}</kbd> jump</span><span><kbd>${key(k.interact)}</kbd> interact</span><span><kbd>${key(k.sprint)}</kbd> run</span><span><kbd>Esc</kbd> pause</span>${s.active?.level.id===19?'<span><kbd>R</kbd> reset puzzle</span>':''}`;}
let hudSignature='';
function hud(){
 if(!s.active)return;const l=s.active.level,a=attemptFor(s),mission=MISSIONS[l.id-1],goal=objective(l),timer=s.settings.timed?Math.max(0,Math.ceil(l.limit-l.time))+'s':'';
 const signature=[l.id,l.phase,s.settings.difficulty,l.lives,a.stars,a.coins,a.points,timer,goal].join('|');if(signature===hudSignature)return;hudSignature=signature;
 const put=(id,text)=>{if($(id).textContent!==String(text))$(id).textContent=text;};
 put('mission-number',`MISSION ${String(l.id).padStart(2,'0')} / 20 · ${s.settings.difficulty.toUpperCase()}${l.id===10?' · RELAY '+(l.phase+1)+'/3':''}`);put('mission-heading',mission.title);put('lives','♥ '.repeat(l.lives)+'♡ '.repeat(3-l.lives));$('lives').setAttribute('aria-label',l.lives+' lives');put('stars',a.stars);put('coins',a.coins);put('points',a.points||0);put('timer',timer);put('objective',goal);
}
function show(which){if(!identityOK())return;screen=which;document.body.classList.toggle('playing',which==='game');for(const id of ['home','map-screen','game-screen'])$(id).hidden=id!==({home:'home',map:'map-screen',game:'game-screen'})[which];$('pause-button').disabled=which!=='game';held={};speechSynthesis?.cancel();configureAudio();}
function home(){save();show('home');sound.stop();const resume=attemptFor(s)?.status==='active'?s.active.level.id:Math.max(0,...Object.keys(s.suspended||{}).map(Number));$('continue-button').disabled=!resume;$('continue-button').textContent=resume?'Continue Mission '+resume:'Continue Adventure';$('levels-button').disabled=!s.completed.length&&!practice;$('play-button').focus({preventScroll:true});}
function map(completedOnly=false){save();evidence('paused');show('map');sound.stop();$('map-copy').textContent=practice?'Fictional review: choose any mission. Completions are recorded only when you finish.':completedOnly?'Choose a completed mission to play it again. Your progress is kept.':`${s.completed.length} / 20 missions completed. Complete a mission to open the next portal.`;
 $('map-nodes').innerHTML=MISSIONS.map((m,i)=>{const done=s.completed.some(c=>c.mission===m.id),available=m.id<=unlocked(s)&&(!completedOnly||done||practice),row=Math.floor(i/5)+1,col=row%2?i%5+1:5-i%5;return `<button class="map-node ${done?'completed':''}" data-mission="${m.id}" style="grid-row:${row};grid-column:${col}" ${available?'':'disabled'} aria-label="Mission ${m.id}: ${esc(m.title)}. ${done?'Completed, replay available':available?'Ready to play':'Locked'}"><span class="node-number">${done?'✓':available?m.id:'▣'}</span><b>${esc(m.title)}</b><small>${done?'✓ Replay · ':''}${available?esc(m.place):'LOCKED'}</small></button>`;}).join('');$('map-heading').focus({preventScroll:true});}
function launch(id,resume=false){
 if(!identityOK())return;sound.unlock();if(!resume&&!startMission(s,id,learningId()))return;if(!s.active)return;
 paused=false;show('game');$('pause-cover').hidden=true;$('celebration').hidden=true;$('pause-button').textContent='Pause · Esc';renderer.resize();renderer.draw(s.active.level,profile,s.settings);controls();hud();status('Your character is ready. '+objective(s.active.level));lastActive=performance.now();save();evidence();audio();$('world').focus({preventScroll:true});if(s.settings.voice)speak(objective(s.active.level));
 if(s.active.level.pending)openQuestion(s.active.level.pending.index);
}
function togglePause(value=!paused){if(!identityOK()||screen!=='game'||attemptFor(s)?.status!=='active')return;paused=value;held={};$('pause-cover').hidden=!paused;$('pause-button').textContent=paused?'Resume · Esc':'Pause · Esc';save();if(paused)evidence('paused');audio();if(paused)$('resume-button').focus();else{$('world').focus({preventScroll:true});lastActive=performance.now();}}
function openDialog(id){if(!identityOK())return;held={};returnFocus=document.activeElement;sound.stop();save();$(id).showModal();}
function closeDialog(id){
 if(id==='task-dialog'&&task?.type==='question'&&!taskCorrect&&s.active){const l=s.active.level;l.pending=null;if(l.mode==='side')l.p.x=Math.min(l.p.x,l.exit.x-115);if(l.mode==='roads')l.p.y=Math.max(l.p.y,130);}
 $(id).close();speechSynthesis?.cancel();task=null;held={};lastActive=performance.now();audio();if(screen==='game'&&!paused)$('world').focus({preventScroll:true});else returnFocus?.focus?.({preventScroll:true});
}
function renderTask(title,options,domain,context){
 $('task-title').textContent=title;$('task-domain').textContent=domain;$('task-context').textContent=context;$('task-feedback').textContent='';taskCorrect=false;$('task-next').hidden=true;
 // Shuffle positions independently of correctness, without shuffling saved response identities.
 const offset=(s.attempts.length+s.active.level.id+s.active.level.step)%options.length;
 $('task-choices').innerHTML=options.map((label,i)=>({label,i})).sort((a,b)=>(a.i+offset)%options.length-(b.i+offset)%options.length).map(({label,i})=>`<button data-answer="${i}">${esc(label)}</button>`).join('');
 if(!$('task-dialog').open)openDialog('task-dialog');$('task-title').focus();if(s.settings.voice)speak(title+' '+options.join('. '));
}
function openQuestion(index){const m=MISSIONS[s.active.level.id-1],q=m.questions[index];task={type:'question',index};renderTask(q.prompt,q.options,q.service,`At ${m.place}: a real-life decision before your next portal.`);}
function openStation(event){task=event;renderTask(event.label,event.options,event.skill,'Choose your next action. Your character will carry out the task in this mission.');}
function complete(){
 const a=attemptFor(s);learning.append({...attemptReport(a,actor,profile.school),id:a.id,at:a.finishedAt,category:'Transition Mission 2.0'});evidence('completed');save();held={};sound.stop();sound.effect('finish');$('celebration-copy').textContent=`${MISSIONS[a.mission-1].title} complete · ${a.stars} stars · ${s.completed.length} / 20 missions finished.`;$('next-button').hidden=!practice&&s.completed.length===20;$('next-button').textContent=a.mission===20?'Explore the map →':'Next mission →';$('celebration').hidden=false;$('next-button').focus();
}
function events(list){
 for(const e of list){if(e.type==='question'){openQuestion(e.index);return;}if(e.type==='task'){openStation(e);return;}
  if(['coin','star','jump','hurt'].includes(e.type))sound.effect(e.type);
  if(e.type==='action'){status(e.label);const a=attemptFor(s),r=a.actions.at(-1);actionEvidence(e.label,e.correct,r?.skill||'');if(e.correct)sound.effect('correct');}
  if(e.type==='notice'||e.type==='phase'||e.type==='restart'||e.type==='task-complete')status(e.message);
  if(e.type==='checkpoint'){status('Checkpoint saved! Keep going.');sound.effect('star');}
  if(e.type==='hurt')status('One life used. Move carefully and try again.');
  if(e.type==='complete'){complete();return;}
 }
 if(list.length){save();hud();}
}
function progress(){if(!identityOK())return;save();$('progress-content').innerHTML=reportHTML(reportRows());openDialog('progress-dialog');}
const keyOptions=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','ShiftLeft','ShiftRight',...'ABCDEFGHIJKLMNOPQSTUVWXYZ'.split('').map(c=>'Key'+c)];
function settings(){
 const form=$('settings-form'),o=s.settings;for(const k of ['difficulty','speed'])form.elements[k].value=o[k];for(const k of ['timed','reducedMotion','voice','effects','music'])form.elements[k].checked=o[k];form.elements.volume.value=o.volume*100;
 $('key-settings').innerHTML=Object.entries(o.keys).map(([action,value])=>`<label>${action[0].toUpperCase()+action.slice(1)}<select name="key-${action}">${keyOptions.map(k=>`<option ${value===k?'selected':''}>${k}</option>`).join('')}</select></label>`).join('');$('settings-feedback').textContent='';openDialog('settings-dialog');
}
$('settings-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,o={...s.settings,keys:{...s.settings.keys}};for(const k of ['difficulty'])o[k]=f.elements[k].value;o.speed=Number(f.elements.speed.value);o.volume=Number(f.elements.volume.value)/100;for(const k of ['timed','reducedMotion','voice','effects','music'])o[k]=f.elements[k].checked;for(const k of Object.keys(o.keys))o.keys[k]=f.elements['key-'+k].value;
 if(!settingsValid(o)){$('settings-feedback').textContent='Choose a different key for every action. Each action needs its own key.';return;}s.settings=o;if(attemptFor(s)?.status==='active')attemptFor(s).settings=structuredClone(o);configureAudio();controls();save();closeDialog('settings-dialog');});
$('task-choices').addEventListener('click',e=>{
 const b=e.target.closest('[data-answer]');if(!b||!task||taskCorrect||!identityOK())return;lastActive=performance.now();
 const choice=Number(b.dataset.answer);let correct,message;
 if(task.type==='question'){const r=answerQuestion(s,task.index,choice);if(!r.ok)return;correct=r.correct;message=r.message;const q=MISSIONS[s.active.level.id-1].questions[task.index];actionEvidence(q.prompt+' Response: '+q.options[choice],correct,q.skill,'question');}
 else{const list=answerTask(s,task,choice);correct=list.some(e=>e.type==='task-complete');message=list.find(e=>e.message)?.message;actionEvidence(task.label+' Response: '+task.options[choice],correct,task.skill);}
 b.classList.add(correct?'correct':'incorrect');$('task-feedback').textContent=message;taskCorrect=correct;sound.effect(correct?'correct':'hurt');
 if(correct){for(const c of $('task-choices').querySelectorAll('button'))c.disabled=true;$('task-next').hidden=false;$('task-next').focus();}save();evidence();
});
const handlers={
 'play-button':()=>map(),'continue-button':()=>attemptFor(s)?.status==='active'?launch(s.active.level.id,true):launch(Math.max(...Object.keys(s.suspended||{}).map(Number))),'levels-button':()=>map(true),'progress-button':progress,'pause-report-button':progress,
 'map-button':()=>map(),'home-button':home,'pause-map-button':()=>map(),'celebration-map-button':()=>map(),
 'pause-button':()=>togglePause(),'resume-button':()=>togglePause(false),'restart-button':()=>{restartMission(s);togglePause(false);hud();},
 'next-button':()=>{const id=s.active.level.id;if(id===20)map();else launch(id+1);},'replay-button':()=>launch(s.active.level.id),
 'settings-button':settings,'home-settings-button':settings,
 'character-button':()=>{$('character-description').textContent=`${profile.source} · ${actor}. Your avatar appears throughout all 20 missions.`;openDialog('character-dialog');},
 'sound-button':()=>{const on=s.settings.effects||s.settings.music||s.settings.voice;s.settings.effects=!on;s.settings.music=!on;s.settings.voice=false;speechSynthesis?.cancel();sound.unlock();configureAudio();save();audio();},
 'read-button':()=>{if(s.active)speak(MISSIONS[s.active.level.id-1].brief+' '+objective(s.active.level));},
 'task-read':()=>speak($('task-title').textContent+' '+$('task-choices').textContent+' '+$('task-feedback').textContent),
 'task-close':()=>closeDialog('task-dialog'),'task-next':()=>closeDialog('task-dialog'),
 'settings-close':()=>closeDialog('settings-dialog'),'progress-close':()=>closeDialog('progress-dialog'),'character-close':()=>closeDialog('character-dialog'),
 'print-button':()=>{if(!identityOK())return;$('print-area').innerHTML=reportHTML(reportRows());window.print();}
};
for(const [id,fn]of Object.entries(handlers))$(id).addEventListener('click',()=>{if(identityOK()){lastActive=performance.now();fn();}});
$('map-nodes').addEventListener('click',e=>{const b=e.target.closest('[data-mission]');if(b&&!b.disabled)launch(Number(b.dataset.mission),s.active?.level.id===Number(b.dataset.mission)&&attemptFor(s)?.status==='active');});
for(const d of document.querySelectorAll('dialog')){d.addEventListener('cancel',e=>{e.preventDefault();closeDialog(d.id);});}
window.addEventListener('keydown',e=>{
 if(!identityOK()||dialogs()||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
 if(screen!=='game')return;if(e.code==='Escape'){e.preventDefault();togglePause();return;}if(paused||attemptFor(s)?.status!=='active')return;
 // Tab stays native. Gameplay keys only take over while the playfield has focus.
 if(e.target!==$('world')&&e.target!==document.body)return;
 const aliases={KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right',ShiftRight:'sprint'},mapped=Object.entries(s.settings.keys).find(([,key])=>key===e.code)?.[0],action=mapped||aliases[e.code];
 if(e.code==='KeyR'&&s.active.level.id===19){e.preventDefault();if(!e.repeat){resetPuzzle(s);save();hud();}return;}
 if(!action)return;e.preventDefault();lastActive=performance.now();sound.unlock();
 if(action==='interact'){if(!e.repeat)events(interact(s));return;}
 held[action]=true;
});
window.addEventListener('keyup',e=>{const aliases={KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right',ShiftRight:'sprint'},action=Object.entries(s.settings.keys).find(([,key])=>key===e.code)?.[0]||aliases[e.code];if(action)held[action]=false;});
window.addEventListener('blur',()=>{held={};if(screen==='game'&&!dialogs())togglePause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){held={};if(screen==='game')togglePause(true);sound.stop();save();}});
window.addEventListener('pagehide',()=>{save();evidence('paused');sound.dispose();});
window.addEventListener('storage',()=>identityOK());
window.addEventListener('resize',()=>{renderer.resize();portrait.resize();});
function frame(t){
 const dt=Math.min(.25,(t-last)/1000||0);last=t;if(t-lastIdentity>500){lastIdentity=t;if(!identityOK())return;}
 if(screen==='game'&&s.active){if(!paused&&!dialogs()&&!document.hidden&&document.hasFocus()&&attemptFor(s)?.status==='active'){
   if(Object.values(held).some(Boolean))lastActive=t;
   // Reshow an unfinished portal decision after Escape, without awarding anything.
   if(s.active.level.pending)openQuestion(s.active.level.pending.index);else{let remaining=dt;while(remaining>0&&!dialogs()&&attemptFor(s)?.status==='active'){const slice=Math.min(1/60,remaining);events(step(s,{...held,active:t-lastActive<30000},slice));remaining-=slice;held.jump=false;}}
   held.jump=false;
  }
  if(!paused&&$('task-dialog').open&&!document.hidden&&document.hasFocus()&&attemptFor(s)?.status==='active'&&t-lastActive<30000)attemptFor(s).activeSeconds+=dt;
  renderer.draw(s.active.level,profile,s.settings,attemptFor(s)?.status==='completed');hud();
  if(t-lastSave>3000){lastSave=t;save();}if(t-lastReport>15000){lastReport=t;evidence(paused?'paused':'snapshot');}
 }else if(screen==='home'&&!locked)portrait.portrait(profile,s.settings.reducedMotion);
 requestAnimationFrame(frame);
}
$('avatar-source').textContent=profile.source;$('save-status').textContent=notice();configureAudio();controls();home();requestAnimationFrame(frame);
