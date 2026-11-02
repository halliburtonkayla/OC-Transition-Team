import {profileStorage,schoolProfile} from './town-profile.mjs';
import {initLearning} from './learning.mjs?v=20261102-levels';
import {COLORS,makeLevel,clone,pourInfo,applyPour,isWon,isComplete,solve} from './engine.mjs';
import {TOTAL_LEVELS,LEVEL_TITLES,nextLevel,sortingOnlyStudent} from './levels.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='prism-pour:v1',sortOnlyRequired=sortingOnlyStudent(schoolProfile.student)||new URLSearchParams(location.search).get('mode')==='sort-only';
let uid=0,selected=null,busy=false,hinted=null,audioContext=null,worker=null,hintRequest=0;
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
let state={level:1,board:makeLevel(1).board,moves:0,history:[],completed:[],settings:{sound:true,symbols:false,motion:reducedQuery.matches,sortingOnly:sortOnlyRequired}};
let solutionCache=new Map(), learning=null;
function validBoard(b,level){const expected=makeLevel(level).board.flat().sort().join(',');return Array.isArray(b)&&b.length===9&&b.every(t=>Array.isArray(t)&&t.length<=4&&t.every(c=>Number.isInteger(c)&&c>=0&&c<COLORS.length))&&b.flat().sort().join(',')===expected;}
try{const saved=JSON.parse(profileStorage.getItem(KEY));if(saved&&Number.isInteger(saved.level)&&saved.level>=1&&saved.level<=TOTAL_LEVELS&&validBoard(saved.board,saved.level)){state={...state,...saved,settings:{...state.settings,...saved.settings},history:(saved.history||[]).filter(h=>validBoard(h.board,saved.level)).slice(-200),completed:(saved.completed||[]).filter(l=>Number.isInteger(l)&&l>=1&&l<=TOTAL_LEVELS)};}}catch{}
state.settings.sortingOnly=sortOnlyRequired||state.settings.sortingOnly===true;
function save(){try{profileStorage.setItem(KEY,JSON.stringify(state));$('#saveIndicator').textContent='Progress saved';}catch{$('#saveIndicator').textContent='Playing without saving';}}
function sound(kind){if(!state.settings.sound)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const ctx=audioContext,t=ctx.currentTime;if(kind==='pour'){const dur=.43,buffer=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+Math.random()*.06-.03)*.98;data[i]=last*3;}const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(620,t);filter.frequency.exponentialRampToValueAtTime(310,t+dur);filter.Q.value=1.4;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.3,t+.06);gain.gain.exponentialRampToValueAtTime(.001,t+dur);source.connect(filter).connect(gain).connect(ctx.destination);source.start(t);}else{const notes=kind==='win'?[523.25,659.25,783.99,1046.5]:kind==='complete'?[659.25,987.77]:[440];notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),start=t+i*.085;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(.055,start+.015);g.gain.exponentialRampToValueAtTime(.001,start+.38);o.connect(g).connect(ctx.destination);o.start(start);o.stop(start+.4);});}}catch{}}
function icon(id){return `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;}
function bottleSVG(tube,tall=false,opts={}){
 const n=`g${++uid}`,H=tall?510:226,bottom=H-13,unit=(H-72)/4;
 const path=`M34 19 Q34 16 39 16 H61 Q66 16 66 19 V33 C66 45 90 43 90 71 V${H-26} Q90 ${H-7} 72 ${H-6} H28 Q10 ${H-7} 10 ${H-26} V71 C10 43 34 45 34 33Z`;
 let remaining=Math.max(0,tube.length-(opts.drain||0));
 let layers=tube.map(color=>{const volume=Math.min(1,remaining);remaining=Math.max(0,remaining-1);return {color,volume};}).filter(l=>l.volume>0);
 if(opts.fill>0)layers.push({color:opts.fillColor,volume:opts.fill});
 layers=layers.reduce((result,layer)=>{if(result.at(-1)?.color===layer.color)result.at(-1).volume+=layer.volume;else result.push({...layer});return result;},[]);
 let y=bottom;
 const liquid=layers.map(({color,volume})=>{const c=COLORS[color],height=unit*volume,top=y-height;y=top;const sym=state.settings.symbols?`<use href="#s-${c.symbol}" x="42" y="${top+height/2-8}" width="16" height="16" fill="none" stroke="${c.dark}" stroke-width="2" opacity=".78"/>`:'';return `<g><rect x="11" y="${top}" width="78" height="${height+.2}" fill="url(#${n}c${color})"/><path d="M12 ${top+2} Q50 ${top+6} 88 ${top+2}" fill="none" stroke="${c.dark}" stroke-width="1" opacity=".35"/>${sym}</g>`;}).join('');
 const top=bottom-layers.reduce((a,l)=>a+l.volume,0)*unit;
 return `<svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
 <linearGradient id="${n}glass"><stop stop-color="#f4ddff" stop-opacity=".24"/><stop offset=".12" stop-color="#c19be9" stop-opacity=".07"/><stop offset=".48" stop-color="#9780e6" stop-opacity=".03"/><stop offset=".82" stop-color="#d9a6ee" stop-opacity=".08"/><stop offset="1" stop-color="#fbe2ff" stop-opacity=".29"/></linearGradient>
 <linearGradient id="${n}edge"><stop stop-color="#e6caee" stop-opacity=".75"/><stop offset=".16" stop-color="#b8a1d7" stop-opacity=".25"/><stop offset=".5" stop-color="#fff0fb" stop-opacity=".58"/><stop offset=".87" stop-color="#bba0db" stop-opacity=".22"/><stop offset="1" stop-color="#e8bde9" stop-opacity=".75"/></linearGradient>
 <linearGradient id="${n}sheen"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".14" stop-color="#fff" stop-opacity=".36"/><stop offset=".3" stop-color="#fff" stop-opacity=".09"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#fff" stop-opacity=".27"/></linearGradient>
 <linearGradient id="${n}neck" x2="0" y2="1"><stop stop-color="#e2c6f0" stop-opacity=".32"/><stop offset=".5" stop-color="#311858" stop-opacity=".08"/><stop offset="1" stop-color="#ba9bd5" stop-opacity=".25"/></linearGradient>
 ${COLORS.map((c,i)=>`<linearGradient id="${n}c${i}"><stop stop-color="${c.dark}"/><stop offset=".13" stop-color="${c.hex}"/><stop offset=".36" stop-color="${c.light}"/><stop offset=".48" stop-color="${c.hex}"/><stop offset=".82" stop-color="${c.hex}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>`).join('')}
 <clipPath id="${n}clip"><path d="${path}"/></clipPath></defs>
 <path d="${path}" fill="url(#${n}glass)"/>
 <g clip-path="url(#${n}clip)">${liquid}${layers.length?`<ellipse cx="50" cy="${top+1}" rx="38" ry="3.3" fill="${COLORS[layers.at(-1).color].light}" opacity=".65"/>`:''}<rect x="10" y="47" width="80" height="${H-53}" fill="url(#${n}sheen)"/>
 <path d="M18 78V${H-38}" stroke="white" stroke-width="4" stroke-linecap="round" opacity=".3"/><path d="M24 75V${H-30}" stroke="white" stroke-width="1" opacity=".2"/>
 <path d="M82 79V${H-31}" stroke="#e7d4fb" stroke-width="1.5" stroke-linecap="round" opacity=".24"/></g>
 <path d="${path}" fill="none" stroke="url(#${n}edge)" stroke-width="1.9"/>
 <path d="M38 21V33C38 40 31 43 26 47" stroke="#e8d3fa" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".45"/>
 <path d="M17 ${H-18} Q50 ${H-8} 83 ${H-18}" fill="none" stroke="#e2c0eb" stroke-width="1.2" opacity=".45"/>
 <path d="M31 14v9q19 6 38 0v-9" fill="url(#${n}neck)" stroke="#d2b7e4" stroke-opacity=".36" stroke-width="1.4"/>
 <ellipse cx="50" cy="14" rx="20" ry="5" fill="#201442" fill-opacity=".6" stroke="url(#${n}edge)" stroke-width="1.7"/>
 <ellipse cx="50" cy="14" rx="14.5" ry="2.5" fill="none" stroke="#9979bb" stroke-opacity=".36"/>
 <path d="M33 13q7-4 19-3" fill="none" stroke="#fff0ff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
 </svg>`;
}
function bottleInner(i,tube=state.board[i],opts={}){return bottleSVG(tube,i===8,opts)+(i===8?'':`<span class="bottle-number">${i+1}</span>`)+(isComplete(tube)?`<span class="bottle-complete">${icon('check')}</span>`:'');}
function bottleLabel(i){const t=state.board[i];return `${i===8?'Center bottle':'Bottle '+(i+1)}, ${t.length?`${t.length} of 4 layers. Bottom to top: ${t.map(c=>COLORS[c].name).join(', ')}${isComplete(t)?'. Complete.':'. Top color '+COLORS[t.at(-1)].name+'.'}`:'empty.'}${selected===i?' Selected.':''}`;}
function bottleHTML(i){return `<button class="bottle ${i===8?'reserve ':''}${isComplete(state.board[i])?'complete ':''}" data-bottle="${i}" aria-label="${bottleLabel(i)}" aria-pressed="false">${bottleInner(i)}</button>`;}
function render(){
 const focus=document.activeElement?.dataset?.bottle;
 $('#board').innerHTML=`<div class="wing"><div class="shelf-row">${bottleHTML(0)}${bottleHTML(1)}</div><div class="shelf-row">${bottleHTML(4)}${bottleHTML(5)}</div></div><div class="reserve-wrap">${bottleHTML(8)}<span class="reserve-label">9 · RESERVE</span></div><div class="wing"><div class="shelf-row">${bottleHTML(2)}${bottleHTML(3)}</div><div class="shelf-row">${bottleHTML(6)}${bottleHTML(7)}</div></div>`;
 if(focus!==undefined)$(`[data-bottle="${focus}"]`)?.focus({preventScroll:true});
 updateUI();updateSelection();
}
function updateUI(){
 const count=state.board.filter(isComplete).length,goal=new Set(state.board.flat()).size;
 $('#levelNumber').textContent=String(state.level).padStart(2,'0');$('#levelTitle').textContent=LEVEL_TITLES[state.level-1];
 $('#levelSubtitle').textContent=state.level===1?'A little space. A splash of possibility.':state.level>20?'Seven colors. A new kind of flow.':'Take your time. Every color has a home.';
 $('#moveCount').textContent=state.moves;$('#sortedText').textContent=`${count} of ${goal} colors sorted`;$('#progressFill').style.width=`${count/goal*100}%`;$('#progress').setAttribute('aria-valuemax',goal);$('#progress').setAttribute('aria-valuenow',count);$('#totalWins').textContent=new Set(state.completed).size;
 const lessonBlocked=learning&&!learning.canPlay(),lessonWon=learning?.isActive()&&isWon(state.board);
 $('#undoButton').disabled=busy||!state.history.length||lessonBlocked||lessonWon;$('#restartButton').disabled=busy||lessonBlocked||lessonWon;$('#hintButton').disabled=busy||isWon(state.board)||lessonBlocked;$('#levelsButton').disabled=busy||!!learning?.isActive();
 learning?.refresh();
 $$('.bottle').forEach(b=>b.disabled=busy||!!lessonBlocked||!!lessonWon);
 $('#soundButton').innerHTML=icon(state.settings.sound?'sound':'mute');$('#soundButton').setAttribute('aria-label',state.settings.sound?'Turn sound off':'Turn sound on');
 $('#soundToggle').checked=state.settings.sound;$('#symbolsToggle').checked=state.settings.symbols;$('#motionToggle').checked=state.settings.motion;document.body.classList.toggle('no-motion',state.settings.motion);
 $('#sortingOnlyToggle').checked=state.settings.sortingOnly;$('#sortingOnlyToggle').disabled=sortOnlyRequired;
}
function updateSelection(){
 $$('.bottle').forEach(b=>{const i=+b.dataset.bottle;b.classList.toggle('selected',i===selected);b.classList.toggle('target',selected!==null&&i!==selected&&!!pourInfo(state.board,selected,i));b.classList.toggle('hint-from',hinted?.[0]===i);b.classList.toggle('hint-to',hinted?.[1]===i);b.setAttribute('aria-pressed',String(i===selected));b.setAttribute('aria-label',bottleLabel(i));});
}
function message(text,type=''){const el=$('#message');el.textContent=text;el.className='board-message '+type;}
function clearHint(){hinted=null;hintRequest++;$('#hintButton span').textContent='Hint';}
function newLevel(level){clearHint();selected=null;state.level=level;const puzzle=makeLevel(level);state.board=clone(puzzle.board);solutionCache.clear();solutionCache.set(JSON.stringify(state.board),puzzle.solution);state.moves=0;state.history=[];save();render();message('Tap a bottle to pick it up. Tap another to pour.');}
function tapBottle(i){
 if(busy||isWon(state.board)||learning&&!learning.canPlay())return;
 if(selected===null){if(!state.board[i].length){message('This bottle is empty — pour a color into it.');return;}selected=i;clearHint();updateSelection();message(`${COLORS[state.board[i].at(-1)].name} on top. Choose a matching color or an empty bottle.`);sound('tap');return;}
 if(selected===i){selected=null;updateSelection();message('Tap a bottle to pick it up. Tap another to pour.');return;}
 const from=selected,move=pourInfo(state.board,from,i);
 if(!move){learning?.recordGame('invalid');const bottle=$(`[data-bottle="${i}"]`);bottle.classList.remove('shake');void bottle.offsetWidth;bottle.classList.add('shake');setTimeout(()=>bottle.classList.remove('shake'),350);message(state.board[i].length===4?'That bottle is full. Choose one with a little room.':'Match the top color, or use an empty bottle.','notice');return;}
 doPour(move);
}
$('#board').addEventListener('click',e=>{const b=e.target.closest('[data-bottle]');if(b)tapBottle(+b.dataset.bottle);});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function doPour(info){
 busy=true;clearHint();const {from,to,count,color}=info,old=clone(state.board),oldKey=JSON.stringify(old),known=solutionCache.get(oldKey);selected=null;updateSelection();updateUI();message('A little splash of progress…');
 const next=applyPour(old,from,to).board;
 state.history.push({board:old,moves:state.moves});if(state.history.length>200)state.history.shift();
 try{await animatePour(info,old);}catch{$('#pourOverlay').innerHTML='';}
 state.board=next;state.moves++;learning?.recordGame('pours');if(known?.length&&known[0][0]===from&&known[0][1]===to)solutionCache.set(JSON.stringify(next),known.slice(1));
 busy=false;save();render();
 if(isComplete(next[to])&&!isComplete(old[to])){$(`[data-bottle="${to}"]`).classList.add('complete-pop');sound('complete');message(`${COLORS[color].name}, perfectly in place.`,'good');}else message('Nicely poured. Pick your next bottle.');
 if(isWon(next)){if(!state.completed.includes(state.level))state.completed.push(state.level);save();updateUI();message('Beautifully sorted. Every color found its place.','good');await delay(state.settings.motion?100:500);showWin();}
}
async function animatePour({from,to,count,color},board){
 if(state.settings.motion){sound('pour');await delay(90);return;}
 const source=$(`[data-bottle="${from}"]`),target=$(`[data-bottle="${to}"]`),s=source.getBoundingClientRect(),d=target.getBoundingClientRect(),overlay=$('#pourOverlay');
 const H=from===8?510:226,anchorY=14/H*s.height,dx=d.left+d.width/2-(s.left+s.width/2),dy=d.top-23-(s.top+anchorY),angle=from===8?(dx>=0?43:-43):(dx>=0?67:-67);
 const cloneEl=document.createElement('div');cloneEl.className='pour-clone';Object.assign(cloneEl.style,{left:`${s.left}px`,top:`${s.top}px`,width:`${s.width}px`,height:`${s.height}px`,transformOrigin:`50% ${14/H*100}%`});cloneEl.innerHTML=bottleSVG(board[from],from===8);overlay.appendChild(cloneEl);source.style.visibility='hidden';
 await cloneEl.animate([{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${dx}px,${dy}px) rotate(${angle}deg)`}],{duration:240,easing:'cubic-bezier(.25,.8,.4,1)',fill:'forwards'}).finished;
 const stream=document.createElementNS('http://www.w3.org/2000/svg','svg');stream.classList.add('stream-svg');const x=d.left+d.width/2,sy=d.top-23;overlay.prepend(stream);sound('pour');
 await new Promise(resolve=>{let start;function frame(time){start??=time;const p=Math.min(1,(time-start)/440),ease=p*p*(3-2*p),th=to===8?510:226,fillY=d.top+(th-13-(board[to].length+count*ease)*(th-72)/4)/th*d.height;
 cloneEl.innerHTML=bottleSVG(board[from],from===8,{drain:count*ease});target.innerHTML=bottleInner(to,board[to],{fillColor:color,fill:count*ease});
 stream.innerHTML=`<defs><linearGradient id="streamG"><stop stop-color="${COLORS[color].light}"/><stop offset=".5" stop-color="${COLORS[color].hex}"/><stop offset="1" stop-color="${COLORS[color].dark}"/></linearGradient></defs><path d="M${x} ${sy} Q${x+Math.sin(p*14)*1.6} ${(sy+fillY)/2} ${x} ${fillY}" fill="none" stroke="url(#streamG)" stroke-width="${Math.min(7,d.width*.1)}" stroke-linecap="round"/><path d="M${x-1} ${sy}V${fillY}" fill="none" stroke="white" stroke-opacity=".28" stroke-width="1.2"/><ellipse cx="${x}" cy="${fillY}" rx="${6+Math.sin(p*30)*2}" ry="2.5" fill="${COLORS[color].light}" opacity=".55"/>`;
 if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
 stream.remove();await cloneEl.animate([{transform:`translate(${dx}px,${dy}px) rotate(${angle}deg)`},{transform:'translate(0,0) rotate(0deg)'}],{duration:200,easing:'ease-in-out',fill:'forwards'}).finished;source.style.visibility='';overlay.innerHTML='';
}
$('#undoButton').addEventListener('click',()=>{if(busy||!state.history.length||learning&&!learning.canPlay()||learning?.isActive()&&isWon(state.board))return;learning?.recordGame('undos');clearHint();const previous=state.history.pop();state.board=clone(previous.board);state.moves=previous.moves;selected=null;save();render();message('One pour back. A fresh possibility.');sound('tap');});
$('#restartButton').addEventListener('click',()=>{if(busy||learning&&!learning.canPlay()||learning?.isActive()&&isWon(state.board))return;if(state.moves===0){learning?.recordGame('restarts');newLevel(state.level);return;}$('#restartDialog').showModal();});
$('#confirmRestart').addEventListener('click',()=>{$('#restartDialog').close();learning?.recordGame('restarts');newLevel(state.level);});
function openDialog(id){if(busy)return;$(id).showModal();}
$('#helpButton').addEventListener('click',()=>openDialog('#helpDialog'));$('#settingsButton').addEventListener('click',()=>openDialog('#settingsDialog'));
$$('dialog').forEach(d=>{d.querySelectorAll('[data-close],.dialog-close').forEach(b=>b.addEventListener('click',()=>d.close()));d.addEventListener('click',e=>{if(e.target===d&&!['winDialog','checkpointDialog'].includes(d.id)){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$('#soundButton').addEventListener('click',()=>{state.settings.sound=!state.settings.sound;save();updateUI();if(state.settings.sound)sound('tap');});
for(const [id,key] of [['soundToggle','sound'],['symbolsToggle','symbols'],['motionToggle','motion']])$("#"+id).addEventListener('change',e=>{state.settings[key]=e.target.checked;save();render();});
function setSortingOnly(enabled){state.settings.sortingOnly=sortOnlyRequired||enabled;if(state.settings.sortingOnly)learning.enableSortingOnly();save();render();}
$('#sortingOnlyToggle').addEventListener('change',e=>setSortingOnly(e.target.checked));
$('#sortOnlyButton').addEventListener('click',()=>setSortingOnly(true));
$('#levelsButton').addEventListener('click',()=>{if(busy||learning?.isActive())return;$('#levelGrid').innerHTML=Array.from({length:TOTAL_LEVELS},(_,i)=>`<button class="level-cell ${state.level===i+1?'current ':''}${state.completed.includes(i+1)?'done':''}" data-level="${i+1}" aria-label="Level ${i+1}${state.completed.includes(i+1)?', completed':''}" ${state.level===i+1?'aria-current="true"':''}>${String(i+1).padStart(2,'0')}</button>`).join('');$('#levelsDialog').showModal();});
$('#levelGrid').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(!b||learning?.isActive())return;$('#levelsDialog').close();newLevel(+b.dataset.level);});
function finishHint(solution,id,key){if(id!==hintRequest||key!==JSON.stringify(state.board)||busy)return;$('#hintButton span').textContent='Hint';if(!solution?.length){message('Try Undo to revisit your last choice, or Restart for a fresh path.','notice');return;}solutionCache.set(key,solution);hinted=solution[0];selected=null;updateSelection();message(`Try bottle ${hinted[0]+1} → bottle ${hinted[1]+1}. Tap them to pour.`,'notice');}
$('#hintButton').addEventListener('click',()=>{
 if(busy||isWon(state.board)||learning&&!learning.canPlay())return;learning?.recordGame('hints');const id=++hintRequest,key=JSON.stringify(state.board);$('#hintButton span').textContent='Thinking…';message('Finding a lovely way forward…');
 const known=solutionCache.get(key);if(known){finishHint(known,id,key);return;}
 try{if(!worker){worker=new Worker(new URL('./solver.mjs',import.meta.url),{type:'module'});worker.onmessage=({data})=>finishHint(data.solution,data.id,data.key??worker._key);worker.onerror=()=>{worker?.terminate();worker=null;$('#hintButton span').textContent='Hint';message('Try Undo to revisit your last choice, or Restart for a fresh path.','notice');};}worker._key=key;worker.postMessage({board:clone(state.board),id,key});}catch{setTimeout(()=>finishHint(solve(state.board,50000),id,key),30);}
});
function showWin(){const inLesson=learning?.onPuzzleWon();updateUI();sound('win');$('#winLevel').textContent=String(state.level).padStart(2,'0');$('#winMoves').textContent=state.moves;$('#nextButton').innerHTML=state.settings.sortingOnly?'Next level <span>→</span>':'Transition checkpoint <span>→</span>';$('#replayButton').textContent=inLesson?'View session report':'Enjoy this one again';if(!$('#winDialog').open&&!$('#checkpointDialog').open&&!$('#reportDialog').open)$('#winDialog').showModal();confetti();}
$('#winDialog').addEventListener('cancel',e=>e.preventDefault());
$('#nextButton').addEventListener('click',()=>{$('#winDialog').close();if(state.settings.sortingOnly)newLevel(nextLevel(state.level));else if(learning.isActive())learning.checkpoint();else learning.startSetup(true);});$('#replayButton').addEventListener('click',()=>{$('#winDialog').close();if(learning.isActive())learning.showReport();else newLevel(state.level);});
function confetti(){if(state.settings.motion)return;const canvas=$('#confetti'),ctx=canvas.getContext('2d'),ratio=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*ratio;canvas.height=innerHeight*ratio;ctx.scale(ratio,ratio);const particles=Array.from({length:95},()=>({x:innerWidth/2,y:innerHeight*.33,vx:(Math.random()-.5)*13,vy:-Math.random()*12-3,size:Math.random()*4+2,angle:Math.random()*6,color:COLORS[Math.floor(Math.random()*6)].hex}));let start,last;function frame(time){start??=time;const delta=Math.min(2,(time-(last||time))/16.67||1);last=time;ctx.clearRect(0,0,innerWidth,innerHeight);const age=time-start;for(const p of particles){p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=.12*delta;p.angle+=.07*delta;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.max(0,1-age/2600);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.6);ctx.restore();}if(age<2600)requestAnimationFrame(frame);else ctx.clearRect(0,0,innerWidth,innerHeight);}requestAnimationFrame(frame);}
learning=initLearning({getGame:()=>state,isBusy:()=>busy,isSortingOnly:()=>state.settings.sortingOnly,startGame:level=>newLevel(level),restoreGame:backup=>{Object.assign(state,backup);selected=null;clearHint();save();render();},onChanged:()=>updateUI(),onResume:()=>{if(isWon(state.board))showWin();},sound});
const startPuzzle=makeLevel(state.level);solutionCache.set(JSON.stringify(startPuzzle.board),startPuzzle.solution);render();if(!learning.resumeCheckpoint()&&isWon(state.board)){setTimeout(showWin,350);}save();
