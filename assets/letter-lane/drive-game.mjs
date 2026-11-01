import {WORDS,MODES,LETTER_NAMES,restoreDrive,withHelp} from './core.mjs';
import {createRunner,advanceRunner,steerRunner,jumpRunner,toggleBoost,nextLetter,speedOf,jumpHeight,runnerCheckpoint,restoreRunner,runnerSummary} from './runner.mjs?v=speed3';
import {createRoadView} from './road-view.mjs?v=drive2';
import {picture} from './pictures.mjs';
import {narrationPlayer} from './voice.mjs?v=drive2';
import {DRIVING_CUES} from './driving-cues.mjs';
import {learningStore,learningId,escapeHTML as esc} from '../learning/progress.mjs';

const $=id=>document.getElementById(id),stage=$('adventure'),canvas=$('world');
let store=learningStore('letter-lane'),race=null,phase='home',voice=true,calm=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let preferences={mode:'guided',uppercase:false,speed:'slow',autoJump:false},frame=0,lastFrame=0,lastHUD=0,lastSave=0,optionsWerePaused=false,lastJumpWarning='',lastBurst=0;
const view=createRoadView(canvas,()=>requestFrame());
const narrator=narrationPlayer({audio:$('recorded-voice'),cues:DRIVING_CUES,onSource:source=>{stage.dataset.voiceSource=source;},onUnavailable:()=>{$('save-notice').textContent='Tap the speaker to try voice again, or ask an adult to read the word.';}});
const actor=()=>{try{return sessionStorage.getItem('ttCurrent')||localStorage.getItem('ttCurrent')||'Guest';}catch{return 'Guest';}};
const word=()=>WORDS.find(w=>w.id===race?.drive.wordId)||WORDS[0];
const shown=c=>race?.drive.uppercase?c?.toUpperCase():c;
const laneName=n=>['left','middle','right'][n];
const guided=()=>race&&(race.drive.mode==='guided'||race.drive.helped.includes(race.drive.index));
function say(text,manual=false,clips=promptClips()){if(!voice&&!manual)return;narrator.speak(text,clips);}
function ensurePlayer(){
 if(actor()===store.student)return true;
 narrator.cancel();race=null;phase='home';store=learningStore('letter-lane');stage.classList.remove('playing','boosting','bumped');
 $('home').hidden=false;for(const id of ['hud','target-sign','dashboard','finish','pause-overlay','race-readouts'])$(id).hidden=true;
 $('car').style.left='67%';$('car').style.setProperty('--jump','0px');$('save-notice').textContent='Player changed. Start a fresh drive for this player.';return false;
}
function save(){if(!race||!ensurePlayer())return;store.checkpoint(runnerCheckpoint(race));$('save-notice').textContent=store.notice();lastSave=race.elapsed;}
function savedRace(){const data=store.read().checkpoint,current=restoreRunner(data);if(current)return current;const legacy=restoreDrive(data);return legacy?createRunner({drive:legacy,id:legacy.id}):null;}
function promptText(){
 if(!race)return 'Welcome to Letter Lane. Steer left and right. Drive into letters, stars, and power coins. Jump over cones.';
 const w=word(),d=race.drive,t=nextLetter(race);
 if(d.complete)return `${w.word}. ${w.word.split('').map(c=>LETTER_NAMES[c]).join(', ')}. You built ${w.word}!`;
 if(d.mode==='spell'&&!guided())return `${w.word}. Which letter comes ${d.index?'next':'first'}? Steer your car into it.`;
 return `${w.word}. Find the letter ${LETTER_NAMES[w.word[d.index]]}.${guided()&&t?' Steer '+laneName(t.lane)+'.':''}`;
}
function promptClips(){
 if(!race)return ['drive-how'];const w=word(),d=race.drive,t=nextLetter(race);
 if(d.complete)return [...w.word.split('').map(c=>'letter-'+c),'word-'+w.id,'complete'];
 if(d.mode==='spell'&&!guided())return ['word-'+w.id,d.index?'which-next':'which-first'];
 return ['word-'+w.id,'find-letter','letter-'+w.word[d.index],...(guided()&&t?['steer-'+laneName(t.lane)]:[])];
}
function tone(kind='star'){
 if(!voice)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;tone.ctx??=new Audio();const a=tone.ctx;if(a.state==='suspended')a.resume().catch(()=>{});
  const pitches=kind==='letter'?[523,659,784]:kind==='power'?[392,587,880]:kind==='bump'?[160]:[880];
  pitches.forEach((hz,i)=>{const o=a.createOscillator(),g=a.createGain(),at=a.currentTime+i*.09;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(.025,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+.15);o.connect(g);g.connect(a.destination);o.start(at);o.stop(at+.16);});
 }catch{}
}
function feedback(text){$('feedback').textContent=text;}
function updateWord(){
 if(!race)return;const w=word(),d=race.drive;
 $('word-picture').innerHTML=picture(w.id);$('word-picture').setAttribute('aria-label','Hear '+w.word);
 $('mission-label').textContent=d.complete?'YOU BUILT IT!':'DRIVE + SPELL';
 $('word-slots').innerHTML=w.word.split('').map((c,i)=>{const hidden=d.mode==='spell'&&i>=d.index;return `<span class="letter-slot ${i<d.index?'collected':i===d.index?'current':''}" aria-label="Letter ${i+1}: ${hidden?'not collected':shown(c)}${i<d.index?', collected':''}">${hidden?'•':shown(c)}</span>`;}).join('');
 $('word-slots').setAttribute('aria-label',`${d.index} of 3 letters collected for ${w.word}`);
 const reveal=d.mode!=='spell'||guided();$('target-prompt').textContent=reveal?'Find':'Spell';$('target-letter').textContent=reveal?shown(w.word[d.index]||''):'?';
 $('target-direction').textContent=guided()&&nextLetter(race)?['←','↑','→'][nextLetter(race).lane]:'';updateHUD();
}
function updateHUD(){
 if(!race)return;const target=nextLetter(race),speed=speedOf(race),nearCone=race.entities.find(e=>e.kind==='cone'&&Math.abs(e.lane-race.x)<.45&&e.at>race.distance&&e.at-race.distance<speed*.85);
 $('stars').textContent=race.stars;$('coins').textContent=race.coins;$('stars').parentElement.setAttribute('aria-label',race.stars+' stars collected');
 $('speed-number').textContent=Math.round(speed);$('distance').textContent=Math.floor(race.distance);$('jump-count').textContent=race.jumpCharges;
 $('jump').setAttribute('aria-disabled',String(!race.jumpCharges||race.jumpRemaining>0));$('jump').setAttribute('aria-label',`Jump. ${race.jumpCharges} jumps ready. Space or up arrow.`);
 $('jump').classList.toggle('ready',race.jumpCharges>0);$('jump').classList.toggle('jump-warning',!!nearCone&&race.jumpCharges>0);
 $('boost').setAttribute('aria-label',race.boostFuel>0?`Speed boost ${race.boostOn?'on':'ready'}. ${Math.ceil(race.boostFuel)} seconds of power left.`:'Speed boost. Collect a lightning coin first.');$('boost').setAttribute('aria-disabled',String(race.boostFuel<=0));$('boost').setAttribute('aria-pressed',String(race.boostOn));$('boost').classList.toggle('ready',race.boostFuel>0);
 $('boost-fill').style.width=(race.boostFuel/8*100)+'%';$('boost-meter').setAttribute('aria-valuenow',String(Math.round(race.boostFuel)));
 $('lane-info').textContent=`${laneName(race.lane)} lane`;
 $('road-ahead').textContent=target&&guided()?`Next letter ${shown(target.letter)}: ${laneName(target.lane)} lane.`:'Steer into the next letter.';
 $('road-ahead').dataset.remaining=target?Math.max(0,target.at-race.distance).toFixed(1):'0';$('road-ahead').dataset.lane=target?.lane??'';
 stage.dataset.distance=race.distance.toFixed(1);stage.dataset.phase=phase;stage.dataset.lane=race.lane;
 stage.classList.toggle('boosting',race.boostOn&&race.boostFuel>0);stage.classList.toggle('bumped',race.bumpRemaining>0);
 if(phase==='run'&&nearCone&&race.jumpCharges>0&&nearCone.id!==lastJumpWarning){lastJumpWarning=nearCone.id;feedback('Cone ahead — jump!');say('Cone ahead. Jump!',false,['jump-now']);}
}
function setControls(){const off=phase!=='run';for(const id of ['left','right','jump','boost','help'])$(id).disabled=off;$('pause').disabled=phase==='home'||phase==='complete';}
function start(wordId='jam',resumed=null){
 if(!ensurePlayer())return;narrator.cancel();
 race=resumed||createRunner({wordId,id:learningId(),mode:preferences.mode,uppercase:preferences.uppercase,speed:preferences.speed,autoJump:preferences.autoJump});
 race.paused=false;preferences={mode:race.drive.mode,uppercase:race.drive.uppercase,speed:race.speedMode,autoJump:race.autoJump};syncOptions();
 phase=race.drive.complete?'complete':'run';lastFrame=0;lastHUD=0;lastSave=race.elapsed;lastJumpWarning='';
 stage.classList.add('playing');$('home').hidden=true;$('finish').hidden=true;$('pause-overlay').hidden=true;
 for(const id of ['hud','target-sign','dashboard','race-readouts'])$(id).hidden=false;
 if(!resumed)store.event('visit','Started Letter Lane driving: '+race.drive.wordId,{task:race.drive.wordId,mode:race.drive.mode,engineVersion:2,speed:race.speedMode});
 updateWord();setControls();save();if(race.drive.complete)finish(false);else{feedback('You’re driving! Steer into letters, stars, and power coins.');say(promptText());canvas.focus({preventScroll:true});}requestFrame();
}
function steer(to){if(phase!=='run'||!race||!ensurePlayer())return;if(steerRunner(race,to)){feedback(`${laneName(race.lane)} lane`);updateHUD();}}
function jump(){
 if(phase!=='run'||!race||!ensurePlayer())return;
 if(jumpRunner(race)){feedback('Jump!');tone('power');store.event('action','Used a jump in Letter Lane',{task:race.drive.wordId,action:'letter-lane-jump',automatic:false});save();}
 else if(!race.jumpCharges){feedback('Drive into an ↑ coin to get jumps.');say('Drive into an up-arrow coin to get jumps.',false,['jump-coin-first']);}
}
function boost(){
 if(phase!=='run'||!race||!ensurePlayer())return;if(toggleBoost(race)){feedback(race.boostOn?'Speed boost!':'Cruising');updateHUD();save();}
 else if(race.boostFuel<=0){feedback('Drive into a lightning coin for a speed boost.');say('Drive into a lightning coin to go faster.',false,['boost-coin-first']);}
}
function processEvents(events){
 if(!ensurePlayer()||!race)return;let changedWord=false;
 for(const e of events){
  if(['star','coin','jump','boost'].includes(e.type)){
   store.append({id:e.id+':pickup',type:'road-pickup',engineVersion:2,runId:race.drive.id,word:race.drive.wordId,kind:e.type,lane:e.lane});tone(e.type==='jump'||e.type==='boost'?'power':'star');burst(e.lane);
   if(e.type==='jump'){feedback(`Jump power! ${race.jumpCharges} jumps ready.`);say('Jump power! Press jump to leap over cones.',false,['jump-ready']);}
   if(e.type==='boost'){feedback('Lightning power! You’re going faster!');say('Speed power! You are going faster!',false,['boost-ready']);}
  }else if(e.type==='letter'){
   const a=e.answer,d=race.drive;store.append({id:d.id+':'+d.answers.length,type:'letter',engineVersion:2,runId:d.id,word:d.wordId,mode:d.mode,uppercase:d.uppercase,...a});
   store.event(a.correct?'choice':'correction',`Letter Lane driving: ${d.wordId} · collected ${a.letter} · ${a.correct?'correct':'try again'}`,{task:d.wordId,item:a.letter,expected:a.expected,step:a.index+1,success:a.correct,mode:d.mode,support:a.help?'letter clue shown':'no letter clue shown',engineVersion:2});
   changedWord=true;if(a.correct){tone('letter');burst(e.lane);feedback(`${shown(a.letter)} collected! Keep driving.`);}else feedback(`That was ${shown(a.letter)}. The letter you need will come around again.`);
  }else if(e.type==='letter-missed'){changedWord=true;feedback('Another chance is coming. Keep driving!');}
  else if(e.type==='cone-hit'){tone('bump');feedback('Bump! Keep going — your letters and stars are safe.');store.event('action','Cone bumped in Letter Lane',{task:race.drive.wordId,action:'letter-lane-cone',status:'brief slowdown; no lost progress'});}
  else if(e.type==='cone-cleared'){feedback('You jumped over the cone!');tone('power');}
  else if(e.type==='jump-used')store.event('help','Jump assistance used in Letter Lane',{task:race.drive.wordId,action:'letter-lane-jump',automatic:true});
  else if(e.type==='boost-ended')feedback('Back to cruising. Find another lightning coin!');
  else if(e.type==='word-complete'){const summary=runnerSummary(race);store.append({id:race.drive.id+':complete',type:'word-complete',runId:race.drive.id,...summary,uppercase:race.drive.uppercase});store.event('completed',`Letter Lane driving: ${summary.word} complete · ${summary.stars} stars`,{...summary,task:summary.word,status:'practice completed; independent spelling not assessed'});finish();}
 }
 if(changedWord){updateWord();if(phase==='run')say(promptText());}if(events.length){updateHUD();save();}
}
function finish(announce=true){
 phase='complete';race.paused=true;stage.classList.remove('boosting','bumped');$('target-sign').hidden=true;$('finish').hidden=false;setControls();
 $('finish-picture').innerHTML=picture(word().id);$('finish-title').textContent=shown(word().word);$('finish-letters').innerHTML=word().word.split('').map(c=>`<span>${shown(c)}</span>`).join('');
 $('finish-caption').textContent=`You built the word! ${race.stars} stars · ${race.coins} coins`;$('finish-title').focus({preventScroll:true});feedback('Word complete! Choose your next drive.');if(announce)say(promptText());updateWord();renderHistory();save();
}
function pause(){if(phase!=='run'||!race)return;phase='paused';race.paused=true;narrator.cancel();$('pause-overlay').hidden=false;setControls();save();feedback('Take a break. Your car and power-ups are waiting.');$('resume').focus({preventScroll:true});updateHUD();view.draw(race,{calm,uppercase:race.drive.uppercase,guided:guided()});}
function resume(){if(phase!=='paused'||!race||!ensurePlayer())return;phase='run';race.paused=false;lastFrame=0;$('pause-overlay').hidden=true;setControls();feedback('Keep driving!');say(promptText());canvas.focus({preventScroll:true});requestFrame();}
function help(){if(phase!=='run'||!race||!ensurePlayer())return;race.drive=withHelp(race.drive);updateWord();feedback('Follow the glowing letter and lane arrow.');say(promptText(),true);store.event('help','Requested a driving letter clue',{task:race.drive.wordId,step:race.drive.index+1,engineVersion:2});save();}
function syncOptions(){$('mode').value=preferences.mode;$('uppercase').checked=preferences.uppercase;$('pace').value=preferences.speed;$('auto-jump').checked=preferences.autoJump;$('calm').checked=calm;}
function openOptions(){if(!ensurePlayer())return;optionsWerePaused=phase==='paused';pause();narrator.cancel();syncOptions();$('word-library').innerHTML=WORDS.map(w=>`<button class="word-choice${w.id===race?.drive.wordId?' active':''}" data-word="${w.id}" aria-label="Drive and spell ${w.word}">${picture(w.id)}<b>${preferences.uppercase?w.word.toUpperCase():w.word}</b></button>`).join('');renderHistory();$('options').showModal();}
function changePractice(){
 preferences={mode:$('mode').value,uppercase:$('uppercase').checked,speed:$('pace').value,autoJump:$('auto-jump').checked};
 if(race&&(race.drive.mode!==preferences.mode||race.drive.uppercase!==preferences.uppercase)){const id=race.drive.wordId;start(id);pause();}
 if(race){race.speedMode=preferences.speed;race.autoJump=preferences.autoJump;save();}$('word-library').querySelectorAll('b').forEach((b,i)=>b.textContent=preferences.uppercase?WORDS[i].word.toUpperCase():WORDS[i].word);
}
function renderHistory(){const records=store.read().records.filter(r=>r.type==='word-complete').slice(-12).reverse();$('history').innerHTML=records.length?`<table><caption>Most recent completed practice words</caption><thead><tr><th>Word</th><th>Support</th><th>Tries</th><th>Stars</th></tr></thead><tbody>${records.map(r=>`<tr><td>${esc(r.word)}</td><td>${esc(MODES[r.mode]||r.mode)}<small> · ${Number(r.supportedLetters)||0} letter clues</small></td><td>${Number(r.attempts)||0}</td><td>${Number(r.stars)||0}</td></tr>`).join('')}</tbody></table>`:'<p>Your completed practice words will appear here. Earlier Letter Lane records stay saved.</p>';}
function burst(lane){if(calm||performance.now()-lastBurst<90)return;lastBurst=performance.now();const box=$('sparkles');box.replaceChildren();for(let i=0;i<9;i++){const s=document.createElement('span');s.className='spark';s.textContent=i%3?'★':'✦';s.style.cssText=`--x:${22+lane*28}%;--y:80%;--size:${10+Math.random()*17}px;--color:#ffe598;--dx:${(Math.random()-.5)*130}px;--dy:${-40-Math.random()*90}px`;box.append(s);}setTimeout(()=>box.replaceChildren(),1100);}
function renderCar(){if(!race||phase==='home')return;const h=canvas.getBoundingClientRect().height,up=jumpHeight(race),car=$('car');car.classList.toggle('airborne',up>.3);car.style.left=(22+race.x*28)+'%';car.style.setProperty('--jump',(up*Math.min(94,h*.18))+'px');car.style.setProperty('--tilt',(race.lane-race.x)*-12+'deg');car.style.setProperty('--shadow-scale',String(1-up*.35));}
function requestFrame(){if(!frame&&!document.hidden)frame=requestAnimationFrame(animate);}
function animate(now){
 frame=0;const dt=lastFrame?Math.min(.06,(now-lastFrame)/1000):0;lastFrame=now;
 if(phase==='run'&&race&&ensurePlayer()){processEvents(advanceRunner(race,dt));if(race&&now-lastHUD>110){updateHUD();lastHUD=now;}if(race&&race.elapsed-lastSave>4)save();}
 view.draw(phase==='home'?null:race,{calm,uppercase:race?.drive.uppercase,guided:guided()});renderCar();if(phase==='run'&&!document.hidden)requestFrame();
}

$('start').addEventListener('click',()=>{const r=savedRace();start(r?.drive.wordId||'jam',r&&!r.drive.complete?r:null);});
$('how').addEventListener('click',()=>say(promptText(),true,['drive-how']));
$('left').addEventListener('click',()=>steer(race.lane-1));$('right').addEventListener('click',()=>steer(race.lane+1));$('jump').addEventListener('click',jump);$('boost').addEventListener('click',boost);
$('help').addEventListener('click',help);$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);
$('hear').addEventListener('click',()=>say(promptText(),true));$('word-picture').addEventListener('click',()=>say(word().word,true,['word-'+word().id]));
$('voice').addEventListener('click',()=>{voice=!voice;$('voice').setAttribute('aria-pressed',String(voice));$('voice').setAttribute('aria-label',voice?'Voice on. Turn automatic voice off':'Voice off. Turn automatic voice on');if(!voice)narrator.cancel();else say('Voice on.',true,['voice-on']);});
$('settings').addEventListener('click',openOptions);$('choose').addEventListener('click',openOptions);$('options-done').addEventListener('click',()=>$('options').close());
$('options').addEventListener('close',()=>{if(phase==='paused'&&!optionsWerePaused)resume();requestFrame();});
$('word-library').addEventListener('click',e=>{const b=e.target.closest('[data-word]');if(!b)return;$('options').close();start(b.dataset.word);});
for(const id of ['mode','uppercase','pace','auto-jump'])$(id).addEventListener('change',changePractice);
$('calm').addEventListener('change',()=>{calm=$('calm').checked;stage.classList.toggle('calm',calm);requestFrame();});
$('again').addEventListener('click',()=>start(race.drive.wordId));$('next-word').addEventListener('click',()=>{const i=WORDS.findIndex(w=>w.id===race.drive.wordId);start(WORDS[(i+1)%WORDS.length].id);});$('say-word').addEventListener('click',()=>say(promptText(),true));
document.addEventListener('keydown',e=>{
 if($('options').open||e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
 if(e.key==='Escape'||e.key.toLowerCase()==='p'){if(phase==='paused')resume();else pause();e.preventDefault();return;}if(phase!=='run')return;
 if(e.key==='ArrowLeft'){e.preventDefault();steer(race.lane-1);}else if(e.key==='ArrowRight'){e.preventDefault();steer(race.lane+1);}else if(/^[123]$/.test(e.key)){e.preventDefault();steer(Number(e.key)-1);}
 else if(e.key==='ArrowUp'||e.code==='Space'&&(e.target.tagName!=='BUTTON'||e.target.id==='jump')){e.preventDefault();if(!e.repeat)jump();}
 else if(e.key==='ArrowDown'||e.key.toLowerCase()==='b'){e.preventDefault();if(!e.repeat)boost();}
});
let touch=null;
stage.addEventListener('pointerdown',e=>{if(phase!=='run'||e.target.closest('button,a,dialog'))return;touch={id:e.pointerId,x:e.clientX,y:e.clientY,lane:race.lane,moved:false,jumped:false};stage.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});});
stage.addEventListener('pointermove',e=>{if(!touch||e.pointerId!==touch.id||phase!=='run')return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y,w=stage.getBoundingClientRect().width;if(dy<-42&&Math.abs(dy)>Math.abs(dx)&&!touch.jumped){jump();touch.jumped=true;touch.moved=true;}else if(Math.abs(dx)>24){steer(touch.lane+Math.round(dx/(w*.22)));touch.moved=true;}});
stage.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;if(!touch.moved&&phase==='run'){const r=stage.getBoundingClientRect();steer(Math.max(0,Math.min(2,Math.floor((e.clientX-r.left)/r.width*3))));}touch=null;});stage.addEventListener('pointercancel',()=>{touch=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else requestFrame();});window.addEventListener('pagehide',()=>{narrator.cancel();save();});window.addEventListener('resize',()=>requestFrame());
if(window.ResizeObserver)new ResizeObserver(()=>requestFrame()).observe(stage);$('car-art').addEventListener('error',()=>{$('car-art').hidden=true;$('car-fallback').hidden=false;});setInterval(ensurePlayer,1000);
const prior=savedRace();if(prior){preferences={mode:prior.drive.mode,uppercase:prior.drive.uppercase,speed:prior.speedMode,autoJump:prior.autoJump};if(!prior.drive.complete){$('start').querySelector('span:nth-child(2)').childNodes[0].textContent='Keep driving';$('start').querySelector('small').innerHTML=`Resume <b>${esc(prior.drive.wordId)}</b>`;}}
stage.classList.toggle('calm',calm);syncOptions();$('save-notice').textContent=store.notice();requestFrame();
