import {LEVELS,MODES,word,questions,Round,optionsFor} from './core.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const PICTURES={apple:{one:'apple',many:'apples'},ball:{one:'basketball',many:'basketballs'},parcel:{one:'package',many:'packages'}};
let level=LEVELS[0],mode='count',rounds=[],index=0,round=null,results=[],voice=true,activeView='home',utterances=new Set();
const modeInfo=()=>MODES.find(m=>m.id===mode);
const guided=()=>$('#guided').checked;
function stopSpeech(){if('speechSynthesis'in window)window.speechSynthesis.cancel();utterances.clear();}
function say(text,queue=false){
  if(!voice)return;
  if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){audioUnavailable();return;}
  if(!queue)stopSpeech();
  const speech=new SpeechSynthesisUtterance(text);speech.lang='en-US';speech.rate=.8;
  const v=window.speechSynthesis.getVoices().find(v=>v.lang==='en-US');if(v)speech.voice=v;
  utterances.add(speech);speech.onend=()=>utterances.delete(speech);speech.onerror=e=>{utterances.delete(speech);if(!['interrupted','canceled'].includes(e.error))audioUnavailable();};
  window.speechSynthesis.speak(speech);
}
function audioUnavailable(){if($('#audio-unavailable'))return;const p=document.createElement('p');p.id='audio-unavailable';p.className='audio-unavailable';p.setAttribute('role','status');p.textContent='Voice is unavailable here. The pictures, numbers, and help still work.';$('.topbar').after(p);}
function autoSay(text){if($('#auto-read').checked)say(text);}
function show(view){stopSpeech();activeView=view;for(const id of ['home','setup','play','finish'])$('#'+id).hidden=id!==view;window.scrollTo({top:0,behavior:'instant'});}
function feedback(text,kind=''){const f=$('#feedback');f.textContent=text;f.className='feedback '+kind;}
function record(kind,summary,details={}){window.TTMonitor?.record(kind,'Count Quest: '+summary,{action:'count-quest-'+mode,task:level.label,step:index+1,...details});}
function image(){return `<img src="assets/count-quest/${level.picture}.svg" alt="" draggable="false">`;}
function pictureGroup(count,interactive=false){
  const groups=[];for(let offset=0;offset<count;offset+=10){
    const n=Math.min(10,count-offset),items=Array.from({length:n},(_,j)=>{
      const i=offset+j;
      return interactive?`<button class="object" data-object="${i}" aria-label="${PICTURES[level.picture].one}, picture ${i+1}, not counted">${image()}</button>`:`<span class="object" aria-hidden="true">${image()}</span>`;
    }).join('');
    groups.push(`${count>10?`<div class="ten-group"><p class="ten-label">${offset===0?'FIRST TEN':'KEEP COUNTING'}</p>`:''}<div style="--columns:${Math.min(5,n)}" class="picture-grid${interactive?'':' small'}">${items}</div>${count>10?'</div>':''}`);
  }
  return `<div class="picture-group"${interactive?'':` role="img" aria-label="${count} ${count===1?PICTURES[level.picture].one:PICTURES[level.picture].many}"`}>${groups.join('')}</div>`;
}
function drawMap(){
  $('#mini-map').innerHTML=rounds.map((q,i)=>`<span class="map-node ${i<results.length?'lit':i===index?'current':''}">${i<results.length?'✦':i+1}</span>`).join('');
  $('#progress').setAttribute('aria-valuemax',rounds.length);$('#progress').setAttribute('aria-valuenow',results.length);$('#progress-fill').style.width=(results.length/rounds.length*100)+'%';$('#energy-count').textContent=results.length;
}
function openLevel(id){
  level=LEVELS.find(l=>l.id===id)||LEVELS[0];show('setup');$('#setup-title').textContent=`Numbers ${level.label}`;$('#setup-place').textContent=level.place;
  const modes=level.min>20?MODES.filter(m=>m.id==='next'):MODES;
  $('#activities').innerHTML=modes.map((m,i)=>`<button class="activity-card" data-mode="${m.id}"><span class="activity-icon" aria-hidden="true">${m.icon}</span><strong>${m.name}</strong><small>${m.description}</small><span class="activity-go">${i===0&&level.min===1?'Start here':'Play mission'} →</span></button>`).join('');
  $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.mode)));$('#setup-title').focus();
  autoSay(`Numbers ${level.min} to ${level.max}. ${level.min===1?'Start with touch and count. ':''}Choose a mission.`);
}
function start(nextMode){
  mode=nextMode;rounds=questions(level,mode,guided()?2:3);index=0;results=[];show('play');
  $('#place-name').textContent=level.place;$('#mission-name').textContent=modeInfo().name;$('#range-badge').textContent=level.label;$('#play-guided').checked=guided();
  record('visit',`started ${modeInfo().name}, numbers ${level.label}.`);render();
}
function instructions(){
  const q=round.q,noun=PICTURES[level.picture];
  if(mode==='count')return round.ready?`${q.answer} ${q.answer===1?noun.one:noun.many}. Choose ${word(q.answer)}.`:`Touch each ${noun.one} once. Listen as you count. Then choose how many.`;
  if(mode==='match')return `Find the group with ${word(q.answer)} ${q.answer===1?noun.one:noun.many}. Choose the matching group.`;
  if(mode==='numeral')return `Find the number ${word(q.answer)}. Choose its numeral.`;
  return `What number comes after ${word(q.previous)}? Choose the next number.`;
}
function render(){
  stopSpeech();round=new Round(rounds[index]);$('#step-label').textContent=`Step ${index+1} of ${rounds.length}`;$('#activity-label').textContent=modeInfo().name.toUpperCase();$('#objective-icon').textContent=modeInfo().icon;
  $('#next').disabled=true;$('#next').textContent=index===rounds.length-1?'Finish mission ✦':'Next →';$('#recount').hidden=mode!=='count';$('#recount').disabled=false;$('#help').disabled=false;
  $('#question').textContent={count:'How many are here?',match:'Match the number.',numeral:'Find the number.',next:'What comes next?'}[mode];
  $('#instruction').textContent={count:'Touch each picture. Then choose how many.',match:'Choose the group that matches this number.',numeral:`Listen, then find ${word(round.q.answer)}.`,next:`What number comes after ${round.q.previous}?`}[mode];
  const scene=$('#scene');scene.innerHTML='';
  if(mode==='count'){
    scene.innerHTML=`<div class="count-meter"><b id="count-total">0</b><span id="count-caption">Touch a picture to begin</span></div>${pictureGroup(round.q.answer,true)}`;
    $$('[data-object]').forEach(b=>b.addEventListener('click',()=>touch(Number(b.dataset.object),b)));updateObjects();
  }else if(mode==='match')scene.innerHTML=`<span class="target-caption">FIND THIS MANY</span><div class="target-number">${round.q.answer}</div><button id="hear-target" class="quiet" style="color:#594581">◖)) Hear ${round.q.answer}</button>`;
  else if(mode==='numeral')scene.innerHTML=`<button id="hear-target" class="listen-number" aria-label="Hear the number to find">◖))</button><span class="listen-caption">${word(round.q.answer)}</span>`;
  else{
    const first=Math.max(level.min===1?1:level.min-1,round.q.previous-2);
    scene.innerHTML=`<div class="sequence">${Array.from({length:round.q.previous-first+1},(_,i)=>`<button class="sequence-number" data-hear="${first+i}" aria-label="Hear ${first+i}">${first+i}</button>`).join('')}<span class="sequence-number blank" aria-label="Missing next number">?</span></div>`;
    if(level.min>20){scene.innerHTML+=`<div class="number-line" aria-label="Number line ${level.label}">${Array.from({length:level.max-level.min+1},(_,i)=>`<button class="number-tile" data-hear="${level.min+i}" aria-label="Hear ${level.min+i}">${level.min+i}</button>`).join('')}</div>`;}
    $$('[data-hear]').forEach(b=>b.addEventListener('click',()=>{round.help();say(word(Number(b.dataset.hear)));$$('[data-hear]').forEach(x=>x.classList.toggle('focus',x===b));record('action','used the spoken number path.',{item:b.dataset.hear,status:'game help used'});}));
  }
  $('#hear-target')?.addEventListener('click',()=>say(mode==='numeral'?`Find ${word(round.q.answer)}.`:word(round.q.answer)));
  renderChoices();drawMap();$('#side-message').textContent='Take your time. You can do this.';feedback(mode==='count'?'Touch each picture once. Each touch gets one number.':'Take your time. You can hear the instructions again.');$('#question').focus();autoSay(instructions());
}
function renderChoices(){
  const group=mode==='match';$('#answer-label').textContent=group?'Choose the matching group':mode==='count'&&!round.ready?'Count the pictures first':'Choose a number';
  $('#choices').className='choices'+(round.q.options.length===3?' three':'')+(group?' group-choices':'');
  $('#choices').innerHTML=round.q.options.map((n,i)=>`<button class="choice" data-answer="${n}" ${!round.ready?'disabled':''} aria-label="${group?`Group ${i+1}: ${n} ${n===1?PICTURES[level.picture].one:PICTURES[level.picture].many}`:String(n)}">${group?`<span class="group-choice-label">GROUP ${i+1}</span>${pictureGroup(n)}`:n}</button>`).join('');
  $$('[data-answer]').forEach(b=>b.addEventListener('click',()=>pick(Number(b.dataset.answer),b)));
}
function updateObjects(forceHint=false){
  const next=$$('[data-object]').find(b=>!round.touched.has(Number(b.dataset.object)));
  $$('[data-object]').forEach(b=>{const order=round.touched.get(Number(b.dataset.object));b.classList.toggle('counted',!!order);b.classList.toggle('hint',(guided()||forceHint)&&b===next);if(order)b.dataset.order=order;else delete b.dataset.order;b.setAttribute('aria-label',`${PICTURES[level.picture].one}, picture ${Number(b.dataset.object)+1}, ${order?'counted as '+order:'not counted'}`);});
}
function touch(i,b){
  const result=round.touch(i);if(!result)return;
  if(!result.fresh){say(word(result.number),true);return;}
  if(result.number===1)stopSpeech();
  // Queue spoken counts so rapid touches cannot cut off preceding numbers.
  say(word(result.number),true);$('#count-total').textContent=result.number;$('#count-caption').textContent=round.ready?`${round.q.answer} ${round.q.answer===1?PICTURES[level.picture].one:PICTURES[level.picture].many} altogether`:'Keep going. Touch another picture.';updateObjects();
  if(round.ready){$$('[data-answer]').forEach(x=>x.disabled=false);$('#answer-label').textContent='Choose how many';feedback(`${round.q.answer} altogether. Now choose ${round.q.answer}.`);say(`${round.q.answer} altogether. Choose ${word(round.q.answer)}.`,true);}
}
function pick(n,b){
  const result=round.answer(n);if(result===null)return;
  $$('[data-answer]').forEach(x=>x.classList.remove('retry'));
  if(result){
    b.classList.add('correct');$$('[data-answer]').forEach(x=>x.disabled=true);$$('[data-object]').forEach(x=>x.disabled=true);$('#next').disabled=false;$('#help').disabled=true;$('#recount').disabled=true;
    const detail={answer:round.q.answer,attempts:round.attempts,help:round.helpUsed,guided:guided(),recounts:round.recounts};results.push(detail);drawMap();
    const text=mode==='next'?`Yes! ${round.q.answer} comes after ${round.q.previous}.`:mode==='match'?`You found ${round.q.answer}! Good matching.`:mode==='numeral'?`Yes! This is ${word(round.q.answer)}.`:`Yes! You counted ${round.q.answer}!`;
    feedback('✓ '+text,'success');if($('#auto-read').checked)say(text+' Choose Next when you are ready.',mode==='count');$('#side-message').textContent='Another light for your town. Nice work!';
    record('completed',`${modeInfo().name}, answer ${round.q.answer}, ${round.attempts} attempt${round.attempts===1?'':'s'}; ${guided()?'extra guidance on; ':''}${round.helpUsed?'game help used':'no game-help button used'}. Teacher prompting not assessed.`,{quantity:round.q.answer,attempt:round.attempts,success:true,status:(guided()?'extra guidance on; ':'')+(round.helpUsed?'game help used; teacher prompting not assessed':'teacher prompting not assessed')});
    $('#next').focus({preventScroll:true});
  }else{
    b.classList.add('retry');feedback('↻ Keep going. Your pictures and progress stay here.','retry');record('correction',`retry on ${modeInfo().name}, target ${round.q.answer}.`,{quantity:round.q.answer,attempt:round.attempts,success:false});
    if(round.attempts>=2)help(true);else autoSay(mode==='count'?`Count again, or choose ${word(round.q.answer)}.`:'Let’s try again. Use Show me for help.');
  }
}
function help(automatic=false){
  if(!round||round.solved)return;round.help();record('action',`${automatic?'offered':'requested'} game help for ${modeInfo().name}.`,{quantity:round.q.answer,status:'game help used'});
  if(mode==='count'&&!round.ready){
    updateObjects(true);feedback('Touch the glowing picture. One picture, one number.');say('Touch the glowing picture. One picture, one number.');$$('[data-object]').find(b=>!round.touched.has(Number(b.dataset.object)))?.focus({preventScroll:true});return;
  }
  const correct=$(`[data-answer="${round.q.answer}"]`);correct?.classList.add('hint');
  if(mode==='numeral'&&!$('.visual-help')){const support=document.createElement('div');support.className='visual-help';support.innerHTML=`<p class="target-caption">${round.q.answer} ${round.q.answer===1?PICTURES[level.picture].one:PICTURES[level.picture].many}</p>${pictureGroup(round.q.answer)}`;$('#scene').append(support);}
  const text=mode==='next'?`${round.q.previous}, then ${round.q.answer}. Choose ${round.q.answer}.`:mode==='match'?`This group has ${round.q.answer}. Choose the outlined group.`:`This is ${round.q.answer}. Choose the outlined number.`;
  feedback(text);say(text);correct?.focus({preventScroll:true});
}
function finish(){
  show('finish');$('#finish-summary').textContent=`${results.length} steps. ${results.length} lights. Look what you did!`;
  const helped=results.filter(r=>r.help).length;
  $('#finish-detail').textContent=`${level.place} · ${modeInfo().name} · Numbers ${level.label}. ${helped?`${helped} ${helped===1?'step':'steps'} used game help. `:''}Every try is practice.`;
  $('#finish-lights').innerHTML=results.map(()=>'<span>✦</span>').join('');
  const modeIndex=MODES.findIndex(m=>m.id===mode),lastLevel=LEVELS.indexOf(level)===LEVELS.length-1;
  $('#next-mission').hidden=level.min>20&&lastLevel;$('#next-mission').textContent=level.min<=20&&modeIndex<3?'Next mission →':'Next number range →';
  $('#finish-title').focus();autoSay('You lit up the town! Mission complete. Practice again or choose your next mission.');
}
$('#beginner-levels').innerHTML=LEVELS.slice(0,3).map(l=>`<button class="level-card ${l.color}" data-level="${l.id}" aria-label="Numbers ${l.label}, ${l.place}${l.id==='first'?', start here':''}"><div class="level-art"><span class="range-number">${l.label}</span><img src="assets/count-quest/${l.picture}.svg" alt="" draggable="false"></div><div class="level-copy"><p class="eyebrow">${l.tag}</p><h3>${l.place}</h3><p>${l.subtitle}</p><span class="level-play"><span>EXPLORE ${l.label}</span><span aria-hidden="true">↗</span></span></div></button>`).join('');
$('#advanced-levels').innerHTML=LEVELS.slice(3).map(l=>`<button class="advanced-level" data-level="${l.id}" aria-label="Original level ${l.label}"><b>${l.label}</b><span>${l.place} →</span></button>`).join('');
$$('[data-level]').forEach(b=>b.addEventListener('click',()=>openLevel(b.dataset.level)));
$('#quick-start').addEventListener('click',()=>{level=LEVELS[0];start('count');});
$('#setup-back').addEventListener('click',goHome);$('#choose-level').addEventListener('click',goHome);
function goHome(){show('home');$('#quick-start').focus();}
$('#missions').addEventListener('click',()=>openLevel(level.id));$('#read').addEventListener('click',()=>say(instructions()));
$('#home-read').addEventListener('click',()=>say('Welcome to Count Quest. Start with numbers one to five. Touch each picture and hear its number. Choose how many. There is no timer. Use Show me whenever you need help. You can also choose numbers one to ten, eleven to twenty, or the original levels up to one hundred.'));
$('#next').addEventListener('click',()=>{if(!round?.solved)return;stopSpeech();if(index===rounds.length-1)finish();else{index++;render();}});
$('#help').addEventListener('click',()=>help());
$('#recount').addEventListener('click',()=>{if(!round?.recount())return;stopSpeech();$('#count-total').textContent='0';$('#count-caption').textContent='Touch a picture to begin';updateObjects();renderChoices();feedback('Let’s count again. Touch each picture once.');say('Let’s count again. Touch each picture once.');record('action','started a supported recount.',{quantity:round.q.answer,status:'game help used'});$$('[data-object]')[0]?.focus({preventScroll:true});});
$('#restart').addEventListener('click',()=>start(mode));$('#again').addEventListener('click',()=>start(mode));
$('#next-mission').addEventListener('click',()=>{const mi=MODES.findIndex(m=>m.id===mode);if(level.min<=20&&mi<3)start(MODES[mi+1].id);else openLevel(LEVELS[Math.min(LEVELS.indexOf(level)+1,LEVELS.length-1)].id);});
$('#play-guided').addEventListener('change',()=>{
  $('#guided').checked=$('#play-guided').checked;if(!round||round.solved)return;round.help();
  round.q.options=optionsFor(round.q.answer,level.min,level.max,guided()?2:3);renderChoices();if(mode==='count')updateObjects();feedback(guided()?'Extra guidance on. Look for the glowing picture.':'Three choices. You can use Show me at any time.');
});
$('#voice').addEventListener('click',()=>{voice=!voice;stopSpeech();$('#voice').setAttribute('aria-pressed',String(voice));$('#voice').setAttribute('aria-label',voice?'Voice on. Turn voice off':'Voice off. Turn voice on');$('#voice').innerHTML=(voice?'◖))':'◖×')+` <span>Voice ${voice?'on':'off'}</span>`;if(voice)say(activeView==='play'?instructions():'Voice on.');});
$('#auto-read').addEventListener('change',()=>{if(!$('#auto-read').checked)stopSpeech();});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else $('#fullscreen').setAttribute('aria-label','Full screen unavailable on this device');}catch{$('#fullscreen').setAttribute('aria-label','Full screen unavailable on this device');}});
document.addEventListener('fullscreenchange',()=>{const full=!!document.fullscreenElement;$('#fullscreen').setAttribute('aria-label',full?'Exit full screen':'Enter full screen');$('#fullscreen').innerHTML=`⛶ <span>${full?'Exit full screen':'Full screen'}</span>`;});
window.addEventListener('pagehide',stopSpeech);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
