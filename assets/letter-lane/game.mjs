import {WORDS,MODES,LETTER_NAMES,letterChoices,newDrive,chooseLetter,withHelp,driveSummary,restoreDrive} from './core.mjs';
import {picture} from './pictures.mjs';
import {narrationPlayer} from './voice.mjs';
import {learningStore,learningId,escapeHTML as esc} from '../learning/progress.mjs';

const $=id=>document.getElementById(id),stage=$('adventure'),canvas=$('world'),ctx=canvas.getContext('2d');
const narrator=narrationPlayer({audio:$('recorded-voice'),onSource:source=>{stage.dataset.voiceSource=source;},onUnavailable:()=>{$('save-notice').textContent='Tap the speaker to try voice again, or ask an adult to read the word. Picture and letter clues still work.';}});
const motionQuery=window.matchMedia?.('(prefers-reduced-motion: reduce)');
let store=learningStore('letter-lane'),drive=null,phase='home',lane=1,choices=[],voice=true,calm=!!motionQuery?.matches,motion=0,frame=0,lastFrame=0,pending=null,optionsWerePaused=false,forcedHelp=false;
let preferences={mode:'guided',uppercase:false};
let landscapeReady=false;
const landscape=new Image();landscape.onload=()=>{landscapeReady=true;drawWorld();};landscape.onerror=()=>{drawWorld();};landscape.src='assets/letter-lane/landscape.webp';
const actor=()=>{try{return sessionStorage.getItem('ttCurrent')||localStorage.getItem('ttCurrent')||'Guest';}catch{return 'Guest';}};
function ensurePlayer(){
 if(actor()===store.student)return true;
 clearTimeout(pending);pending=null;narrator.cancel();drive=null;phase='home';store=learningStore('letter-lane');
 stage.classList.remove('playing');$('home').hidden=false;for(const id of ['hud','pickups','target-sign','dashboard','finish','pause-overlay'])$(id).hidden=true;
 $('car').style.left='67%';$('car').classList.remove('driving');$('start').querySelector('small').innerHTML='Start with <b>jam</b>';
 $('save-notice').textContent='Player changed. Start a new drive for this player.';return false;
}
function say(text,manual=false,clips=promptClips()){if(!manual&&!voice)return;narrator.speak(text,clips);}
function tone(success=true){
 if(!voice)return;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;tone.ctx??=new Audio();const a=tone.ctx;if(a.state==='suspended')a.resume().catch(()=>{});
  [0,.1,.2].slice(0,success?3:1).forEach((offset,i)=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=(success?[523.25,659.25,783.99]:[330])[i];g.gain.setValueAtTime(0,a.currentTime+offset);g.gain.linearRampToValueAtTime(.035,a.currentTime+offset+.01);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+offset+.18);o.connect(g);g.connect(a.destination);o.start(a.currentTime+offset);o.stop(a.currentTime+offset+.19);});
 }catch{}
}
function currentWord(){return WORDS.find(w=>w.id===drive?.wordId)||WORDS[0];}
function displayLetter(letter){return drive?.uppercase?letter.toUpperCase():letter;}
function persist(){if(!drive||!ensurePlayer())return false;const ok=store.checkpoint(drive);$('save-notice').textContent=store.notice();return ok;}
function promptText(help=false){
 const w=currentWord(),letter=w.word[drive.index],name=LETTER_NAMES[letter];
 if(drive.complete)return `${w.word}. You built ${w.word}! ${w.word.split('').map(c=>LETTER_NAMES[c]).join(', ')}. ${w.word}.`;
 if(drive.mode==='spell'&&!help)return `${w.word}. ${drive.index?'Which letter comes next?':'Which letter comes first?'} Tap a letter, or steer and press Drive. Use Show me if you want a clue.`;
 return `${w.word}. Find the letter ${name}. ${drive.index===0?'Tap the letter to drive to it.':''}`;
}
function promptClips(help=false){
 if(!drive)return ['how'];
 const word=currentWord();
 if(drive.complete)return [...word.word.split('').map(c=>'letter-'+c),'word-'+word.id,'complete'];
 if(drive.mode==='spell'&&!help)return ['word-'+word.id,drive.index?'which-next':'which-first',...(drive.index===0?['help-tip']:[])];
 return ['word-'+word.id,'find-letter','letter-'+word.word[drive.index],...(drive.index===0?['tap-letter']:[])];
}
function renderHUD(){
 const w=currentWord();$('word-picture').innerHTML=picture(w.id);$('word-picture').setAttribute('aria-label',`Hear ${w.word}`);
 $('mission-label').textContent=drive.complete?'YOU BUILT IT!':'LET’S SPELL';
 $('word-slots').innerHTML=w.word.split('').map((c,i)=>{
  const hidden=drive.mode==='spell'&&i>=drive.index;
  const state=i<drive.index?'collected':i===drive.index?'current':'';
  return `<span class="letter-slot ${state}" aria-label="Letter ${i+1}: ${hidden?'not collected yet':displayLetter(c)}${i<drive.index?', collected':''}">${hidden?'•':displayLetter(c)}</span>`;
 }).join('');$('word-slots').setAttribute('aria-label',`${drive.index} of ${w.word.length} letters collected for ${w.word}`);
 $('stars').textContent=String(drive.stars);$('stars').parentElement.setAttribute('aria-label',`${drive.stars} stars collected`);
 const reveal=drive.mode!=='spell'||forcedHelp;
 $('target-prompt').textContent=reveal?'Find':'Spell';$('target-letter').textContent=reveal?displayLetter(w.word[drive.index]||''):'?';
}
function renderRow(){
 if(!drive||drive.complete)return;
 const target=currentWord().word[drive.index];forcedHelp=drive.helped.includes(drive.index);
 choices=letterChoices(currentWord().word,drive.index);
 $('pickups').innerHTML=choices.map((c,i)=>`<button class="pickup${i===lane?' selected':''}${(drive.mode==='guided'||forcedHelp)&&c===target?' guided':''}" data-lane="${i}" data-letter="${c}" style="--lane:${22+i*28}%" aria-label="Collect letter ${c}" aria-pressed="${i===lane}">${(drive.mode==='guided'||forcedHelp)&&c===target?'<span class="guide-arrow" aria-hidden="true">↓</span>':''}<span>${displayLetter(c)}</span><span class="star-trail" aria-hidden="true"><span>★</span><span>★</span><span>★</span></span></button>`).join('');
 renderHUD();enableControls();$('feedback').textContent=drive.mode==='spell'&&!forcedHelp?'Listen to the word. Collect its next letter.':`Find ${displayLetter(target)}. Tap it to drive.`;
}
function enableControls(){const disabled=phase!=='choose';for(const id of ['left','right','go','help'])$(id).disabled=disabled;$('pickups').querySelectorAll('button').forEach(b=>b.disabled=disabled);$('pause').disabled=phase==='complete'||phase==='home';}
function steer(next){
 if(phase!=='choose'||!ensurePlayer())return;const previous=lane;lane=Math.max(0,Math.min(2,next));
 $('car').classList.toggle('turn-left',lane<previous&&!calm);$('car').classList.toggle('turn-right',lane>previous&&!calm);$('car').style.left=(22+lane*28)+'%';
 $('pickups').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('selected',i===lane);b.setAttribute('aria-pressed',String(i===lane));});
}
function startDrive(wordId='jam',restored=null){
 if(!ensurePlayer())return;clearTimeout(pending);pending=null;
 drive=restored||newDrive(wordId,preferences.mode,preferences.uppercase,learningId());preferences={mode:drive.mode,uppercase:drive.uppercase};
 $('mode').value=drive.mode;$('uppercase').checked=drive.uppercase;
 phase=drive.complete?'complete':'choose';lane=1;forcedHelp=false;
 stage.classList.add('playing');$('home').hidden=true;$('finish').hidden=true;$('pause-overlay').hidden=true;
 for(const id of ['hud','target-sign','pickups','dashboard'])$(id).hidden=false;
 $('car').style.left='50%';$('car').classList.remove('driving','turn-left','turn-right');
 $('pause').innerHTML='<span aria-hidden="true">Ⅱ</span><small>Break</small>';
 if(!restored)store.event('visit',`Started Letter Lane: ${drive.wordId}`,{task:drive.wordId,mode:drive.mode,support:drive.mode==='guided'?'glowing letter clue':'available on request'});
 persist();if(drive.complete){showFinish(false);}else{renderRow();say(promptText());$('hear').focus({preventScroll:true});}
 requestFrame();
}
function collect(selectedLane=lane){
 if(phase!=='choose'||!ensurePlayer()||!drive)return;
 steer(selectedLane);const letter=choices[lane],result=chooseLetter(drive,letter);if(!result.accepted)return;
 phase='driving';enableControls();$('car').classList.add('driving');
 const selected=$('pickups').querySelector(`[data-lane="${lane}"]`);selected?.classList.add('approaching');
 pending=setTimeout(()=>settle(result),calm?80:900);requestFrame();
}
function settle(result){
 pending=null;if(phase!=='driving'||!ensurePlayer())return;
 $('car').classList.remove('driving','turn-left','turn-right');drive=result.drive;
 const a=result.answer,answerId=drive.id+':'+drive.answers.length;
 store.append({id:answerId,type:'letter',runId:drive.id,word:drive.wordId,mode:drive.mode,uppercase:drive.uppercase,...a});
 store.event(a.correct?'choice':'correction',`Letter Lane: ${drive.wordId} · chose ${a.letter} · ${a.correct?'letter collected':'try again'}`,{task:drive.wordId,item:a.letter,expected:a.expected,step:a.index+1,success:a.correct,mode:drive.mode,support:a.help?'letter clue shown':'no letter clue shown',attempt:drive.answers.filter(x=>x.index===a.index).length});
 persist();
 if(a.correct){tone();burst(lane);renderHUD();
  if(drive.complete){phase='complete';store.append({id:drive.id+':complete',type:'word-complete',runId:drive.id,...driveSummary(drive),uppercase:drive.uppercase});store.event('completed',`Letter Lane word complete: ${drive.wordId} · ${drive.stars} stars`,{task:drive.wordId,quantity:drive.stars,...driveSummary(drive),status:'practice completed; independent spelling not assessed'});persist();showFinish();}
  else{phase='choose';renderRow();say(`${LETTER_NAMES[a.letter]}. ${promptText()}`);}
 }else{
  phase='choose';const selected=$('pickups').querySelector(`[data-lane="${lane}"]`);selected?.classList.remove('approaching');selected?.classList.add('miss');enableControls();
  $('feedback').textContent=`That was ${displayLetter(a.letter)}. Try again. Your stars are safe.`;
  say(`That is ${LETTER_NAMES[a.letter]}. Let's try again. ${drive.mode==='spell'&&!forcedHelp?currentWord().word:promptText()}`,false,['try-again',...promptClips(forcedHelp)]);
 }
}
function showFinish(speakIt=true){
 $('pickups').hidden=true;$('target-sign').hidden=true;$('finish').hidden=false;enableControls();
 const w=currentWord();$('finish-picture').innerHTML=picture(w.id);$('finish-title').textContent=drive.uppercase?w.word.toUpperCase():w.word;
 $('finish-letters').innerHTML=w.word.split('').map(c=>`<span>${displayLetter(c)}</span>`).join('');
 $('finish-caption').textContent=`All ${w.word.length} letters. ${drive.stars} stars. You did it!`;
 $('finish-title').focus({preventScroll:true});if(speakIt)say(promptText());renderHistory();
}
function giveHelp(){
 if(phase!=='choose'||!ensurePlayer())return;drive=withHelp(drive);forcedHelp=true;persist();
 const target=currentWord().word[drive.index];$('pickups').querySelectorAll('button').forEach(b=>{if(b.dataset.letter===target){b.classList.add('guided');if(!b.querySelector('.guide-arrow'))b.insertAdjacentHTML('afterbegin','<span class="guide-arrow" aria-hidden="true">↓</span>');}});
 renderHUD();$('feedback').textContent=`Follow the arrow to ${displayLetter(target)}.`;say(promptText(true),true,promptClips(true));
 store.event('help','Asked for a letter clue in Letter Lane',{task:drive.wordId,step:drive.index+1,mode:drive.mode});
}
function pauseGame(){
 if(!drive||phase==='home'||phase==='complete'||phase==='paused')return;
 clearTimeout(pending);pending=null;
 // A drive is committed only when the pickup arrives. Pausing before arrival leaves it unrecorded.
 phase='paused';$('car').classList.remove('driving');$('pickups').querySelectorAll('.approaching').forEach(b=>b.classList.remove('approaching'));
 $('pause-overlay').hidden=false;enableControls();narrator.cancel();$('feedback').textContent='Take a break. Your letters and stars are here.';$('resume').focus({preventScroll:true});drawWorld();
}
function resumeGame(){if(!ensurePlayer()||phase!=='paused')return;phase='choose';$('pause-overlay').hidden=true;enableControls();$('feedback').textContent='Ready when you are. Choose a letter.';say(promptText());$('hear').focus({preventScroll:true});requestFrame();}
function openOptions(){
 if(!ensurePlayer())return;optionsWerePaused=phase==='paused';if(phase==='choose'||phase==='driving')pauseGame();
 $('word-library').innerHTML=WORDS.map(w=>`<button class="word-choice${drive?.wordId===w.id?' active':''}" data-word="${w.id}" aria-label="Drive and spell ${w.word}">${picture(w.id)}<b>${preferences.uppercase?w.word.toUpperCase():w.word}</b></button>`).join('');
 renderHistory();$('options').showModal();
}
function closeOptions(){if($('options').open)$('options').close();}
function renderHistory(){
 const records=store.read().records.filter(r=>r.type==='word-complete').slice(-12).reverse();
 $('history').innerHTML=records.length?`<table><caption>Most recent completed practice words</caption><thead><tr><th>Word</th><th>Support</th><th>Tries</th><th>Clued letters</th></tr></thead><tbody>${records.map(r=>`<tr><td>${esc(r.word)}</td><td>${esc(MODES[r.mode]||r.mode)}</td><td>${Number(r.attempts)||0}</td><td>${Number(r.supportedLetters)||0} / 3</td></tr>`).join('')}</tbody></table>`:'<p>Completed practice words will appear here. Unfinished drives can be resumed on this device.</p>';
}
function burst(which){
 if(calm)return;const box=$('sparkles');box.replaceChildren();for(let i=0;i<13;i++){const s=document.createElement('span');s.className='spark';s.textContent=i%3?'★':'✦';s.style.cssText=`--x:${22+which*28}%;--y:75%;--size:${12+Math.random()*19}px;--color:${i%3?'#ffdc66':'#fff7d5'};--dx:${(Math.random()-.5)*180}px;--dy:${-60-Math.random()*140}px;animation-delay:${i*.014}s`;box.append(s);}setTimeout(()=>box.replaceChildren(),1300);
}
function requestFrame(){if(!frame&&!document.hidden)frame=requestAnimationFrame(animate);}
function animate(now){frame=0;const dt=lastFrame?Math.min(40,now-lastFrame):16;lastFrame=now;if(!calm&&phase!=='paused'&&!$('options').open)motion+=dt*(phase==='driving'?.0007:.00007);drawWorld();if(!document.hidden&&!calm&&phase!=='paused')requestFrame();}
function roadX(t,laneFraction,w){const width=(.025+.92*t*t)*w;return w/2+(laneFraction-.5)*width;}
function drawWorld(){
 if(!ctx)return;const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
 const dpr=Math.min(window.devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(landscapeReady){
  // Keep the complete village visible on small screens; extend the road texture below it.
  if(w/h<1.1){const artH=Math.min(h*.72,w*.83);ctx.drawImage(landscape,0,0,landscape.naturalWidth,landscape.naturalHeight,0,0,w,artH);ctx.drawImage(landscape,0,landscape.naturalHeight*.71,landscape.naturalWidth,landscape.naturalHeight*.29,0,artH,w,h-artH);}
  else ctx.drawImage(landscape,0,0,w,h);
 }else{
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#64cadf');sky.addColorStop(.44,'#c2e7bd');sky.addColorStop(.45,'#8dbd61');sky.addColorStop(1,'#537a45');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#f0f6e8';[[.2,.14,60],[.7,.18,90],[.92,.1,45]].forEach(([x,y,r])=>{ctx.beginPath();ctx.ellipse(w*x,h*y,r,r*.26,0,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#577c48';ctx.beginPath();ctx.moveTo(0,h*.54);ctx.quadraticCurveTo(w*.23,h*.16,w*.48,h*.52);ctx.quadraticCurveTo(w*.75,h*.18,w,h*.5);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  ctx.fillStyle='#65767a';ctx.beginPath();ctx.moveTo(w*.48,h*.44);ctx.lineTo(w*.52,h*.44);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
 }
 // Moving lane dashes stay behind the letter controls. They are scenery, not a deadline.
 const horizon=(w/h<1.1?.315:.455)*h,roadHeight=h-horizon;
 ctx.fillStyle='#fff8d584';
 for(const f of [1/3,2/3])for(let n=0;n<13;n++){
  const t=((n/13+motion)%1),t2=Math.min(1,t+.024+.026*t);if(t<.13)continue;
  const x1=roadX(t,f,w),x2=roadX(t2,f,w),y1=horizon+roadHeight*t*t,y2=horizon+roadHeight*t2*t2,wide=1+3*t;
  ctx.beginPath();ctx.moveTo(x1-wide,y1);ctx.lineTo(x1+wide,y1);ctx.lineTo(x2+wide*1.1,y2);ctx.lineTo(x2-wide*1.1,y2);ctx.fill();
 }
 if(phase==='choose'&&drive&&!calm){const y=h*.88,x=w*(.22+.28*lane);const g=ctx.createRadialGradient(x,y,1,x,y,w*.1);g.addColorStop(0,'#ffda6a28');g.addColorStop(1,'#ffda6a00');ctx.fillStyle=g;ctx.fillRect(x-w*.12,y-h*.2,w*.24,h*.27);}
}

$('start').addEventListener('click',()=>{const saved=restoreDrive(store.read().checkpoint);startDrive(saved?.wordId||'jam',saved&&!saved.complete?saved:null);});
$('how').addEventListener('click',()=>say('Welcome to Letter Lane. We will build the word jam. Look at the picture. Listen to the word. Tap the glowing letter to drive your car to it and collect stars. Take your time. Tap Let’s drive to begin.',true,['how']));
$('voice').addEventListener('click',()=>{voice=!voice;$('voice').setAttribute('aria-pressed',String(voice));$('voice').setAttribute('aria-label',voice?'Voice on. Turn automatic voice off':'Voice off. Turn automatic voice on');if(!voice)narrator.cancel();else say('Voice on.',true,['voice-on']);});
$('pickups').addEventListener('click',e=>{const b=e.target.closest('[data-lane]');if(b&&!b.disabled)collect(Number(b.dataset.lane));});
$('left').addEventListener('click',()=>steer(lane-1));$('right').addEventListener('click',()=>steer(lane+1));$('go').addEventListener('click',()=>collect());
$('help').addEventListener('click',giveHelp);$('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',resumeGame);
$('hear').addEventListener('click',()=>say(promptText(forcedHelp),true,promptClips(forcedHelp)));$('word-picture').addEventListener('click',()=>say(currentWord().word,true,['word-'+currentWord().id]));
$('settings').addEventListener('click',openOptions);$('choose').addEventListener('click',openOptions);$('options-done').addEventListener('click',closeOptions);
$('options').addEventListener('close',()=>{if(phase==='paused'&&!optionsWerePaused)resumeGame();requestFrame();});
$('word-library').addEventListener('click',e=>{const b=e.target.closest('[data-word]');if(!b)return;closeOptions();startDrive(b.dataset.word);});
function changePractice(){preferences={mode:$('mode').value,uppercase:$('uppercase').checked};if(drive){const fresh=newDrive(drive.wordId,preferences.mode,preferences.uppercase,learningId());startDrive(fresh.wordId,fresh);pauseGame();}else{$('start').querySelector('small').innerHTML='Start with <b>jam</b>';}$('word-library').querySelectorAll('b').forEach((b,i)=>b.textContent=preferences.uppercase?WORDS[i].word.toUpperCase():WORDS[i].word);}
$('mode').addEventListener('change',changePractice);$('uppercase').addEventListener('change',changePractice);
$('calm').checked=calm;stage.classList.toggle('calm',calm);$('calm').addEventListener('change',()=>{calm=$('calm').checked;stage.classList.toggle('calm',calm);drawWorld();requestFrame();});
$('again').addEventListener('click',()=>startDrive(drive.wordId));$('next-word').addEventListener('click',()=>{const i=WORDS.findIndex(w=>w.id===drive.wordId);startDrive(WORDS[(i+1)%WORDS.length].id);});$('say-word').addEventListener('click',()=>say(promptText(),true));
document.addEventListener('keydown',e=>{
 if($('options').open||e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
 if(e.key==='Escape'){if(phase==='paused')resumeGame();else pauseGame();return;}
 if(phase!=='choose')return;
 if(e.key==='ArrowLeft'){e.preventDefault();steer(lane-1);$('go').focus({preventScroll:true});}else if(e.key==='ArrowRight'){e.preventDefault();steer(lane+1);$('go').focus({preventScroll:true});}else if(/^[123]$/.test(e.key)){e.preventDefault();collect(Number(e.key)-1);}else if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();collect();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();else requestFrame();});
window.addEventListener('pagehide',()=>{clearTimeout(pending);narrator.cancel();if(drive)persist();});
window.addEventListener('resize',()=>{drawWorld();requestFrame();});
if(window.ResizeObserver)new ResizeObserver(()=>{drawWorld();requestFrame();}).observe(stage);
$('car-art').addEventListener('error',()=>{$('car-art').hidden=true;$('car-fallback').hidden=false;});
setInterval(ensurePlayer,1500);
const saved=restoreDrive(store.read().checkpoint);if(saved&&!saved.complete){preferences={mode:saved.mode,uppercase:saved.uppercase};$('start').querySelector('span:nth-child(2)').childNodes[0].textContent='Keep driving';$('start').querySelector('small').innerHTML=`Resume <b>${esc(saved.wordId)}</b>`;}
$('save-notice').textContent=store.notice();drawWorld();requestFrame();
