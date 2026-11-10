import {WORDS,TIERS,TURN_SECONDS,chooseWord,createWordPicker,createTurn,selectLane,WAVE_SECONDS,advance,pause,resume,resultFor} from './core.mjs?v=36-words-1';
import {narrationPlayer} from './voice.mjs?v=36-words-1';
import {SPELLING_CUES} from './audio-cues.mjs?v=36-words-1';
const $=id=>document.getElementById(id),app=$('app');
let turn=null,tier='first',previous=null,voice=true,lastTime=0,frame=0,lastIndex=-1,lastWave=-1,announcedResult=false,drawnPhase='home',drag=null;
const narrator=narrationPlayer({audio:$('voice'),cues:SPELLING_CUES,onUnavailable:()=>status('Sound could not play. Tap Hear word, check device volume, or ask an adult to say the picture word.'),onSource:source=>{app.dataset.audio=source;}});
const nextWord=createWordPicker();
const phase=()=>turn?.phase||'home';
function status(text){$('status').textContent=text;}
function picture(el,word){
  const entry=WORDS.find(w=>w.id===word),expanded=entry.atlas==='expanded',columns=expanded?6:4,rows=expanded?4:3;
  el.classList.toggle('expanded-picture',expanded);
  el.style.setProperty('--picture-x',`${(entry.tile%columns)/(columns-1)*100}%`);
  el.style.setProperty('--picture-y',`${Math.floor(entry.tile/columns)/(rows-1)*100}%`);
}
function sayWord(manual=false){if(!turn||(!voice&&!manual))return;narrator.speak(turn.word,[`word-${turn.word}`]);}
function sayAnswer(){if(!turn||turn.phase!=='result')return;narrator.speak(`${turn.word}. ${turn.word.split('').join(', ')}. ${turn.word}.`,[`word-${turn.word}`,...turn.word.split('').map(c=>'letter-'+c),`word-${turn.word}`]);}
function slotNodes(){
  $('slots').replaceChildren(...Array.from({length:turn.word.length},(_,i)=>{const el=document.createElement('span');el.className='slot'+(i<turn.attempt.length?' filled':i===turn.index?' current':'');el.textContent=turn.attempt[i]||'·';el.setAttribute('aria-label',`Letter ${i+1}: ${turn.attempt[i]||'not chosen'}`);return el;}));
}
function gates(){
  $('letter-gates').replaceChildren(...turn.choices.map((letter,i)=>{const b=document.createElement('span');b.className='letter-gate'+(!letter?' empty':'');b.textContent=letter?.toUpperCase()||'';b.dataset.lane=String(i);b.setAttribute('aria-label',letter?`Lane ${i+1}: ${letter.toUpperCase()}`:`Lane ${i+1}: clear`);return b;}));
}
function carPosition(){
  $('car').style.left=`${20+turn.selected*30}%`;
  const progress=turn.movement/WAVE_SECONDS;
  const gateHeight=$('letter-gates').offsetHeight;
  const endY=$('road').clientHeight-$('car').offsetHeight*.5-gateHeight*.5;
  $('letter-gates').style.top=`${8+Math.max(0,endY-8)*progress}px`;
  $('letter-gates').style.transform=`scale(${.8+progress*.2})`;
  $('lane-lines')?.style.setProperty('--travel',`${turn.elapsed*170}px`);
  $('road').style.setProperty('--travel',`${turn.elapsed*170}px`);
}
function render(){
  if(!turn)return;
  const current=phase(),changed=current!==drawnPhase;
  app.dataset.phase=current;$('play').hidden=current==='result';$('home').hidden=true;$('result').hidden=current!=='result';$('pause').hidden=current==='result';
  $('pause').textContent=current==='paused'?'Resume':'Pause';$('pause-cover').hidden=current!=='paused';
  if((turn.wave!==lastWave||turn.index!==lastIndex)&&current!=='result'){lastIndex=turn.index;lastWave=turn.wave;slotNodes();gates();$('step-label').textContent=`LETTER ${turn.index+1} OF ${turn.word.length}`;$('instruction').textContent=turn.feedback==='retry'?'Not that letter. Keep driving!':turn.feedback==='missed'?'Another chance is coming.':'Steer into the next letter.';status(turn.feedback==='retry'?'Try a different letter on the next approach.':turn.feedback==='missed'?'Keep steering. Another set of letters is coming.':`Drive to letter ${turn.index+1} of your word.`);}
  for(const [i,b] of [...$('letter-gates').children].entries()){b.classList.toggle('selected',i===turn.selected);}
  for(const id of ['left','right'])$(id).disabled=current!=='run';
  $('left').disabled||=turn.selected===0;$('right').disabled||=turn.selected===2;
  $('seconds').textContent=String(Math.ceil(turn.remaining));$('timer-ring').style.strokeDashoffset=String(226.2*(1-turn.remaining/TURN_SECONDS));
  carPosition();
  if(current==='moving'&&changed){status('Driving to your letter.');$('instruction').textContent='Here we go…';}
  if(current==='paused'&&changed){narrator.cancel();status('Turn paused.');$('resume').focus({preventScroll:true});}
  if(current==='result'&&!announcedResult){announcedResult=true;showResult();}
  drawnPhase=current;
}
function start(sameWord=null){
  narrator.cancel();cancelAnimationFrame(frame);tier=document.querySelector('input[name="tier"]:checked')?.value||tier;
  const chosen=sameWord||nextWord(tier).id;previous=chosen;turn=createTurn(chosen,tier);lastIndex=-1;lastWave=-1;announcedResult=false;drawnPhase='home';lastTime=0;
  $('home').hidden=true;$('play').hidden=false;$('result').hidden=true;picture($('word-picture'),chosen);$('result-picture').setAttribute('aria-label','Word picture');$('answer').replaceChildren();$('answer').setAttribute('aria-label','Correct spelling');$('attempt').textContent='';$('result-copy').textContent='';
  status('Listen to the word. Keep steering left or right to collect its letters in order.');render();sayWord();$('road').focus({preventScroll:true});frame=requestAnimationFrame(tick);
}
function tick(time){
  if(!turn)return;
  const delta=lastTime?Math.min(.1,Math.max(0,(time-lastTime)/1000)):0;lastTime=time;
  if(['run','moving'].includes(turn.phase)){advance(turn,delta);render();}
  if(turn.phase!=='result')frame=requestAnimationFrame(tick);
}
function showResult(){
  narrator.cancel();const result=resultFor(turn);picture($('result-picture'),turn.word);$('result-picture').setAttribute('aria-label',turn.word);
  $('result-label').textContent=result.correct?'WORD COMPLETE':'NICE TRY, DRIVER';$('result-title').textContent=result.correct?'You spelled it!':result.reason==='time'?'Time for a word check.':'Let’s look at the word.';
  $('result-copy').textContent=result.correct?'You listened, chose, and drove all the way.':'Here is the spelling. Listen, look, and have another go.';
  $('answer').replaceChildren(...[...turn.word].map(c=>{const s=document.createElement('span');s.textContent=c;return s;}));$('answer').setAttribute('aria-label',`Correct spelling: ${turn.word.split('').join(', ')}`);
  $('attempt').textContent=result.correct?'A wonderful little drive.':result.attempt?`You chose: ${result.attempt.split('').join(' · ')}${!result.complete?' · …':''}`:'You have not chosen a letter yet. It’s okay to try again.';
  status(result.correct?'Word complete. Ready for the next driver.':'The turn is finished. The spelling is now shown.');$('result-title').focus({preventScroll:true});if(voice)sayAnswer();
}
function home(){narrator.cancel();cancelAnimationFrame(frame);turn=null;app.dataset.phase='home';$('home').hidden=false;$('play').hidden=true;$('result').hidden=true;$('pause').hidden=true;status('Choose a level for a new, anonymous turn.');$('start').focus({preventScroll:true});}
function togglePause(){if(!turn)return;if(turn.phase==='paused'){resume(turn);lastTime=0;render();sayWord();$('road').focus({preventScroll:true});}else if(pause(turn))render();}
$('road').tabIndex=0;
$('start').addEventListener('click',()=>start());$('next').addEventListener('click',()=>start());$('retry').addEventListener('click',()=>start(turn.word));$('home-button').addEventListener('click',home);$('restart').addEventListener('click',home);
$('pause').addEventListener('click',togglePause);$('resume').addEventListener('click',togglePause);
$('hear').addEventListener('click',()=>sayWord(true));$('hear-answer').addEventListener('click',sayAnswer);
$('left').addEventListener('click',()=>{if(turn&&selectLane(turn,turn.selected-1))render();});$('right').addEventListener('click',()=>{if(turn&&selectLane(turn,turn.selected+1))render();});
$('sound').addEventListener('click',()=>{voice=!voice;$('sound').setAttribute('aria-pressed',String(voice));$('sound').setAttribute('aria-label',voice?'Sound on':'Sound off');$('sound').textContent=voice?'Sound on':'Sound off';if(!voice)narrator.cancel();else if(turn?.phase==='result')sayAnswer();else if(turn)sayWord();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&turn&&['run','moving','paused'].includes(turn.phase)){e.preventDefault();togglePause();return;}
  if(!turn||turn.phase!=='run'||e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.target.closest('header,.word-prompt'))return;
  if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)){
    e.preventDefault();if(['ArrowLeft','a','A'].includes(e.key))selectLane(turn,turn.selected-1);else selectLane(turn,turn.selected+1);render();
  }
});
// Dragging anywhere on the road steers only. Releasing never accidentally submits a letter.
$('road').addEventListener('pointerdown',e=>{if(!turn||turn.phase!=='run'||e.target.closest('button'))return;drag=e.pointerId;try{$('road').setPointerCapture(e.pointerId);}catch{}steerPointer(e);});
function steerPointer(e){if(e.pointerId!==drag||!turn||turn.phase!=='run')return;const r=$('road').getBoundingClientRect();selectLane(turn,Math.round(((e.clientX-r.left)/r.width-.2)/.3));render();}
$('road').addEventListener('pointermove',steerPointer);for(const name of ['pointerup','pointercancel','lostpointercapture'])$('road').addEventListener(name,e=>{if(e.pointerId===drag)drag=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&turn&&pause(turn))render();});window.addEventListener('blur',()=>{if(turn&&pause(turn))render();});window.addEventListener('pagehide',()=>{narrator.cancel();cancelAnimationFrame(frame);});window.addEventListener('resize',()=>{if(turn&&turn.phase!=='result')carPosition();});
function fullscreenLabel(){const active=!!document.fullscreenElement||app.classList.contains('immersive');$('fullscreen').innerHTML=active?'↙ <span>Exit full screen</span>':'⛶ <span>Full screen</span>';$('fullscreen').setAttribute('aria-label',active?'Exit full screen':'Enter full screen');}
$('fullscreen').addEventListener('click',async()=>{
  if(document.fullscreenElement){await document.exitFullscreen?.();fullscreenLabel();return;}
  if(app.classList.contains('immersive')){app.classList.remove('immersive');$('display-note').hidden=true;fullscreenLabel();return;}
  try{if(!app.requestFullscreen)throw new Error('unsupported');await app.requestFullscreen();$('display-note').hidden=true;}
  catch{app.classList.add('immersive');$('display-note').hidden=false;$('display-note').textContent='Expanded view is on. On iPhone, use Safari → Share → Add to Home Screen for a screen without browser bars, or turn your phone sideways.';window.scrollTo(0,0);}
  fullscreenLabel();
});document.addEventListener('fullscreenchange',fullscreenLabel);
// The standalone page works before the optional ESP entrance branch is integrated.
if(new URLSearchParams(location.search).get('from')==='esp')document.querySelector('.back-link').href='extended-school-program.html';
status('One child at a time. Everyone can have a turn.');
