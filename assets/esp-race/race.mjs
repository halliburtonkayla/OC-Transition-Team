import {RACERS, TRACK_LENGTH, course, createRace, begin, step, pause, resume, nextTurn, ranking, activeRacers, HeldInputs, clamp} from './engine.mjs';

const $ = selector => document.querySelector(selector);
const els = Object.fromEntries(['race-app','viewports','controls','welcome','setup','race-bar','race-status','layout-note','countdown','finish','finish-title','finish-note','results','pause-screen','pause','restart','next','start','play-style','cruise','help-dialog','fullscreen'].map(id => [id.replace(/-([a-z])/g, (_, x) => x.toUpperCase()), $(`#${id}`)]));
const compactQuery = matchMedia('(max-width: 759px), (max-height: 499px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const held = new HeldInputs();
let playerCount = compactQuery.matches ? 1 : 2;
let state, views = [], lastTime = 0, lastPhase = '', lastHud = 0, helpPaused = false;
const keyboard = {
  ArrowUp: [0, 'up'], ArrowLeft: [0, 'left'], ArrowDown: [0, 'down'], ArrowRight: [0, 'right'],
  KeyW: [1, 'up'], KeyA: [1, 'left'], KeyS: [1, 'down'], KeyD: [1, 'right'],
  KeyI: [2, 'up'], KeyJ: [2, 'left'], KeyK: [2, 'down'], KeyL: [2, 'right'],
  Numpad8: [3, 'up'], Numpad4: [3, 'left'], Numpad5: [3, 'down'], Numpad6: [3, 'right'],
};
const keyNames = ['↑ ← ↓ →', 'W A S D', 'I J K L', '8 4 5 6'];
const arrows = [['up', '↑', 'Faster'], ['left', '←', 'Left'], ['down', '↓', 'Slower'], ['right', '→', 'Right']];
const formatTime = seconds => `${seconds.toFixed(1)}s`;
const useTurns = () => compactQuery.matches || els.playStyle.value === 'turns';
const racerStyle = car => `--racer:${car.color};--light:${car.light};--dark:${car.dark}`;

function clearInputs() { held.clear(); updatePressed(); }
function updatePressed() {
  const inputs = held.read();
  for (const button of els.controls.querySelectorAll('.arrow')) button.setAttribute('aria-pressed', String(inputs[Number(button.dataset.player)][button.dataset.action]));
}
function layoutNote() {
  if (playerCount === 1) return 'One racer. Touch, mouse, or arrow keys. Cruise assist keeps you moving.';
  if (compactQuery.matches) return playerCount > 1 ? 'Phone-friendly: one clear view. Racers take turns on the same course.' : 'One clear view. Touch, mouse, or arrow keys. Cruise assist keeps you moving.';
  if (state.turns) return 'Take turns on the same course. Arrow keys follow the current racer.';
  return `${playerCount === 4 ? 'Four views, all four control sets at the bottom.' : 'All racer controls stay at the bottom.'} Simultaneous play needs a multi-touch board or enough keyboard keys.`;
}
function buildViews() {
  const visible = activeRacers(state);
  els.viewports.dataset.views = String(visible.length);
  els.viewports.innerHTML = visible.map(car => `<section class="viewport" style="${racerStyle(car)}" aria-label="${car.name} racer view"><canvas aria-label="${car.name} car on the Grove Grand Prix racetrack" role="img"></canvas><div class="view-hud"><div class="driver-tag"><span class="shape" aria-hidden="true">${car.shape}</span> ${car.name}<span class="sr-only"> racer</span></div><div class="view-stats"><span class="star-icon" aria-hidden="true">★</span><span class="stars">0</span><span class="timer">0.0s</span></div></div><div class="lap-progress" role="progressbar" aria-label="${car.name} lap progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><div class="view-finished" hidden>Nice driving!<small>Cheer on your friends.</small></div></section>`).join('');
  views = [...els.viewports.children].map((element, i) => ({element, car: visible[i], canvas: element.querySelector('canvas'), ctx: element.querySelector('canvas').getContext('2d'), stars: element.querySelector('.stars'), timer: element.querySelector('.timer'), progress: element.querySelector('.lap-progress'), finish: element.querySelector('.view-finished')}));
  els.controls.style.setProperty('--count', visible.length);
  els.controls.innerHTML = visible.map(car => `<section class="control-cluster" style="${racerStyle(car)}" aria-label="${car.name} racer controls"><div class="cluster-label"><span aria-hidden="true">${car.shape}</span>${car.name}<small>${state.turns ? '↑ ← ↓ →' : keyNames[car.id]}<br>Steer. Collect. Go!</small></div><div class="arrows">${arrows.map(([action, symbol, label]) => `<button type="button" class="arrow" data-player="${car.id}" data-action="${action}" aria-label="${car.name}: ${label}" aria-pressed="false"><span aria-hidden="true">${symbol}</span><small>${label}</small></button>`).join('')}</div></section>`).join('');
  els.layoutNote.textContent = layoutNote();
  sizeCanvases();
}
function reset() {
  clearInputs(); state = createRace({players: playerCount, turns: useTurns(), cruise: els.cruise.checked});
  lastPhase = ''; buildViews(); syncUI();
  document.querySelectorAll('[data-count]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.count) === playerCount)));
}
function sizeCanvases() {
  for (const view of views) {
    const rect = view.element.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    view.width = Math.max(1, rect.width); view.height = Math.max(1, rect.height);
    view.canvas.width = Math.round(view.width * ratio); view.canvas.height = Math.round(view.height * ratio);
    view.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    view.needsDraw = true;
  }
}
function syncUI() {
  const phase = state.phase;
  if (phase === lastPhase) return;
  lastPhase = phase;
  const ready = phase === 'ready', done = ['finished', 'turn-complete'].includes(phase);
  els.welcome.hidden = !ready; els.setup.hidden = !ready; els.raceBar.hidden = ready;
  els.countdown.hidden = phase !== 'countdown'; els.finish.hidden = !done; els.pauseScreen.hidden = phase !== 'paused';
  els.pause.hidden = done; els.next.hidden = phase !== 'turn-complete';
  els.pause.innerHTML = phase === 'paused' ? '▶ <span>Keep racing</span>' : 'Ⅱ <span>Pause</span>';
  els.controls.dataset.disabled = String(!['racing','countdown'].includes(phase));
  els.controls.querySelectorAll('button').forEach(button => { button.disabled = !['racing','countdown'].includes(phase); });
  if (done) {
    clearInputs();
    const completed = ranking(state).filter(car => car.finishTime !== null);
    els.results.innerHTML = completed.map((car, index) => `<div class="result-row"><span aria-hidden="true" style="color:${car.dark}">${car.shape}</span><span class="name">${index + 1}. ${car.name}</span><span class="stars">★ ${car.stars}</span><span class="time">${formatTime(car.finishTime)}</span></div>`).join('');
    els.finishTitle.textContent = phase === 'turn-complete' ? `High five, ${state.racers[state.active].name}!` : 'Everyone made it!';
    els.finishNote.textContent = phase === 'turn-complete' ? `${state.racers[state.active + 1].name}, it’s your turn. Same course. Fresh start.` : 'Give your racing crew a cheer. Ready for another lap?';
    els.next.textContent = phase === 'turn-complete' ? `${state.racers[state.active + 1].name}’s turn →` : 'Next racer →';
    els.raceStatus.textContent = phase === 'turn-complete' ? 'Pass the controls to the next racer.' : 'Great driving, team!';
    (phase === 'turn-complete' ? els.next : els.restart).focus({preventScroll: true});
  } else if (phase === 'paused') els.raceStatus.textContent = 'Pit stop. The race is paused.';
  else if (phase === 'countdown') els.raceStatus.textContent = state.turns && playerCount > 1 ? `${state.racers[state.active].name} is up. Ready, set…` : 'Ready, set…';
  else if (phase === 'racing') els.raceStatus.textContent = 'Collect stars. Steer around cones. Finish your lap!';
  requestAnimationFrame(sizeCanvases);
}
function setPaused() { clearInputs(); pause(state); syncUI(); }
function togglePause() {
  clearInputs(); state.phase === 'paused' ? resume(state) : pause(state); syncUI();
}
function showHelp() {
  helpPaused = ['racing', 'countdown'].includes(state.phase);
  if (helpPaused) setPaused();
  clearInputs(); els.helpDialog.showModal();
}
function closeHelp() { els.helpDialog.close(); }
$('#help').addEventListener('click', showHelp);
$('#close-help').addEventListener('click', closeHelp);
$('#help-done').addEventListener('click', closeHelp);
els.helpDialog.addEventListener('close', () => { if (helpPaused && state.phase === 'paused') { clearInputs(); resume(state); syncUI(); } helpPaused = false; });
els.start.addEventListener('click', () => { clearInputs(); begin(state); syncUI(); });
els.pause.addEventListener('click', togglePause);
els.restart.addEventListener('click', () => { reset(); els.start.focus({preventScroll: true}); });
els.next.addEventListener('click', () => { clearInputs(); nextTurn(state); buildViews(); syncUI(); });
document.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => { playerCount = Number(button.dataset.count); reset(); }));
els.playStyle.addEventListener('change', reset); els.cruise.addEventListener('change', reset);

els.controls.addEventListener('pointerdown', event => {
  const button = event.target.closest('.arrow');
  if (!button || button.disabled || !['racing','countdown'].includes(state.phase)) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  held.press(`pointer:${event.pointerId}`, Number(button.dataset.player), button.dataset.action);
  try { button.setPointerCapture(event.pointerId); } catch { /* Window-level release remains available. */ }
  updatePressed();
});
for (const type of ['pointerup','pointercancel','lostpointercapture']) window.addEventListener(type, event => {
  held.release(`pointer:${event.pointerId}`); updatePressed();
});
els.controls.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('keydown', event => {
  if (els.helpDialog.open) return;
  if (event.code === 'Escape') { if (['racing','countdown','paused'].includes(state.phase)) { event.preventDefault(); if (!event.repeat) togglePause(); } return; }
  if (['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable) return;
  const mapped = keyboard[event.code];
  if (!mapped || !['racing','countdown'].includes(state.phase)) return;
  const [player, action] = mapped;
  const id = state.turns ? state.active : player;
  if (id >= playerCount) return;
  event.preventDefault(); held.press(`key:${event.code}`, id, action); updatePressed();
});
window.addEventListener('keyup', event => { held.release(`key:${event.code}`); updatePressed(); });
function pauseForInterruption() {
  // A later app switch/focus loss must not be undone by closing an older help dialog.
  helpPaused = false; setPaused();
}
window.addEventListener('blur', pauseForInterruption);
window.addEventListener('pagehide', pauseForInterruption);
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseForInterruption(); });
compactQuery.addEventListener('change', () => {
  clearInputs();
  if (state.phase === 'ready') reset();
  else if (compactQuery.matches && !state.turns && playerCount > 1) {
    // A running simultaneous race cannot fairly become sequential halfway through.
    reset(); els.layoutNote.textContent = 'Screen changed. Start a fresh race with one clear view and turn-taking.';
  } else { sizeCanvases(); els.layoutNote.textContent = layoutNote(); }
});
window.addEventListener('resize', sizeCanvases);
new ResizeObserver(sizeCanvases).observe(els.viewports);
els.fullscreen.addEventListener('click', async () => {
  clearInputs();
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (els.raceApp.requestFullscreen && document.fullscreenEnabled) await els.raceApp.requestFullscreen();
    else { showHelp(); els.helpDialog.querySelector('.prototype-note').scrollIntoView({block: 'nearest'}); }
  } catch { showHelp(); }
});
document.addEventListener('fullscreenchange', () => {
  els.fullscreen.innerHTML = document.fullscreenElement ? '⛶ <span>Exit full screen</span>' : '⛶ <span>Full screen</span>';
  sizeCanvases();
});

// Original code-drawn 2.5D art: layered landscape, banked road, shaded karts and trees.
function polygon(ctx, points, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fill();
}
function oval(ctx,x,y,rx,ry,color) { ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fill(); }
function round(ctx,x,y,w,h,r,fill) {ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function curve(z) { return Math.sin(z / 175) * .6 + Math.sin(z / 83) * .12; }
function project(distance, car, width, height) {
  const scale = 1 / (1 + distance * .027), horizon = height * .32;
  return {x: width * .5 + (curve(car.z + distance) - curve(car.z)) * width * .34 * (1-scale), y:horizon+(height-horizon)*scale, half:width*.61*scale, scale};
}
function tree(ctx,x,y,size,seed) {
  oval(ctx,x+size*.12,y+size*.02,size*.43,size*.1,'#163a3922');
  round(ctx,x-size*.055,y-size*.72,size*.11,size*.72,size*.035,'#786146');
  polygon(ctx,[[x,y-size*.65],[x+size*.27,y-size*.98],[x+size*.05,y-size*.57]],'#716340');
  oval(ctx,x,y-size*.93,size*.45,size*.48,seed%2?'#3b8264':'#458c69');
  oval(ctx,x-size*.17,y-size*1.06,size*.28,size*.29,'#7eae72');
  oval(ctx,x+size*.22,y-size*.82,size*.28,size*.32,'#316e59');
  oval(ctx,x-size*.21,y-size*1.14,size*.13,size*.11,'#b3c77d88');
  if(seed%3===0){oval(ctx,x-size*.19,y-size*.9,size*.045,size*.05,'#f8b66b');oval(ctx,x+size*.13,y-size*1.1,size*.045,size*.05,'#f6a660');}
}
function star(ctx,x,y,size,rotation=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
  const points=Array.from({length:10},(_,i)=>{const angle=-Math.PI/2+i*Math.PI/5,r=i%2?size*.44:size;return [Math.cos(angle)*r,Math.sin(angle)*r];});
  polygon(ctx,points.map(([a,b])=>[a+size*.08,b+size*.14]),'#bc7d2a');
  const gradient=ctx.createLinearGradient(-size,-size,size,size);gradient.addColorStop(0,'#fff4b1');gradient.addColorStop(.45,'#ffd76b');gradient.addColorStop(1,'#e8a837');polygon(ctx,points,gradient);
  polygon(ctx,[[0,-size*.67],[-size*.22,-size*.13],[0,0],[size*.18,-size*.13]],'#fff8d7cc');ctx.restore();
}
function cone(ctx,x,y,size) {
  oval(ctx,x+size*.1,y+size*.06,size*.6,size*.16,'#152e3630');
  polygon(ctx,[[x-size*.55,y],[x+size*.55,y],[x+size*.44,y-size*.18],[x-size*.44,y-size*.18]],'#bb6544');
  const g=ctx.createLinearGradient(x-size*.3,y,x+size*.4,y);g.addColorStop(0,'#f9b374');g.addColorStop(.45,'#ec8551');g.addColorStop(1,'#b75738');
  polygon(ctx,[[x-size*.35,y-size*.16],[x+size*.35,y-size*.16],[x+size*.08,y-size*1.13],[x-size*.08,y-size*1.13]],g);
  polygon(ctx,[[x-size*.24,y-size*.55],[x+size*.24,y-size*.55],[x+size*.18,y-size*.77],[x-size*.18,y-size*.77]],'#fff3d3');
}
function kart(ctx,x,y,size,car,steer=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(steer*.055);
  oval(ctx,0,size*.34,size*.66,size*.2,'#17344044');
  for(const direction of [-1,1]){
    round(ctx,direction*size*.5-size*.12,-size*.28,size*.24,size*.65,size*.09,'#20313a');
    round(ctx,direction*size*.5-size*.08,-size*.23,size*.13,size*.54,size*.05,'#44505a');
    round(ctx,direction*size*.5-size*.1,-size*.12,size*.2,size*.07,size*.025,'#182c34');
  }
  const body=ctx.createLinearGradient(-size*.5,-size*.5,size*.5,size*.3);body.addColorStop(0,car.light);body.addColorStop(.35,car.color);body.addColorStop(1,car.dark);
  ctx.beginPath();ctx.moveTo(-size*.48,size*.25);ctx.quadraticCurveTo(-size*.61,-size*.1,-size*.38,-size*.49);ctx.quadraticCurveTo(-size*.34,-size*.86,0,-size*.9);ctx.quadraticCurveTo(size*.34,-size*.86,size*.38,-size*.49);ctx.quadraticCurveTo(size*.61,-size*.1,size*.48,size*.25);ctx.quadraticCurveTo(0,size*.52,-size*.48,size*.25);ctx.fillStyle=body;ctx.fill();
  ctx.beginPath();ctx.moveTo(-size*.3,-size*.56);ctx.quadraticCurveTo(0,-size*.8,size*.3,-size*.56);ctx.lineTo(size*.36,-size*.17);ctx.quadraticCurveTo(0,-size*.04,-size*.36,-size*.17);ctx.closePath();const glass=ctx.createLinearGradient(0,-size*.7,0,-size*.1);glass.addColorStop(0,'#b2e6e7');glass.addColorStop(.5,'#4a8d9b');glass.addColorStop(1,'#214d60');ctx.fillStyle=glass;ctx.fill();
  polygon(ctx,[[-size*.25,-size*.57],[size*.18,-size*.66],[-size*.29,-size*.29]],'#e4fbeb77');
  round(ctx,-size*.095,-size*.03,size*.19,size*.35,size*.025,'#fff2d2dd');
  round(ctx,-size*.49,size*.17,size*.24,size*.09,size*.04,'#ffdeaf');round(ctx,size*.25,size*.17,size*.24,size*.09,size*.04,'#ffdeaf');
  round(ctx,-size*.39,size*.33,size*.78,size*.08,size*.035,car.dark);
  round(ctx,-size*.16,size*.35,size*.32,size*.065,size*.025,'#fff2d8');
  ctx.strokeStyle=car.light;ctx.lineWidth=size*.025;ctx.beginPath();ctx.moveTo(-size*.45,size*.02);ctx.quadraticCurveTo(-size*.48,-size*.25,-size*.36,-size*.43);ctx.stroke();
  ctx.restore();
}
function scenery(view,time,inputs) {
  const {ctx,width:w,height:h,car}=view;
  if(!ctx||!w||!h)return;
  const horizon=h*.32;
  const sky=ctx.createLinearGradient(0,0,0,horizon+h*.13);sky.addColorStop(0,'#96d2d6');sky.addColorStop(1,'#e4efcf');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  oval(ctx,w*.79,h*.17,h*.075,h*.075,'#fff4cdcc');
  for(let c=0;c<3;c++){const x=w*(.15+c*.35),y=h*(.11+(c%2)*.045);oval(ctx,x,y,w*.07,h*.024,'#f7f5df90');oval(ctx,x+w*.035,y-h*.014,w*.035,h*.028,'#f7f5df90');}
  polygon(ctx,[[0,horizon],[0,h*.28],[w*.13,h*.14],[w*.26,h*.29],[w*.39,h*.17],[w*.57,h*.29],[w*.72,h*.13],[w*.86,h*.25],[w,h*.19],[w,horizon]],'#85b6a1');
  polygon(ctx,[[0,horizon+h*.1],[0,h*.31],[w*.19,h*.23],[w*.37,h*.33],[w*.55,h*.24],[w*.72,h*.3],[w*.88,h*.24],[w,h*.3],[w,horizon+h*.1]],'#649d80');
  const grass=ctx.createLinearGradient(0,horizon,0,h);grass.addColorStop(0,'#a8c884');grass.addColorStop(1,'#85ac6d');ctx.fillStyle=grass;ctx.fillRect(0,horizon,w,h-horizon);
  // Draw far-to-near ribbons. No external sprites, WebGL, fonts, or downloads are required.
  const maxDistance=370, segments=90;
  for(let i=segments;i>0;i--){
    const farD=i/segments*maxDistance,nearD=(i-1)/segments*maxDistance;
    const a=project(farD,car,w,h),b=project(nearD,car,w,h),stripe=Math.floor((car.z+nearD)/13)%2;
    a.y-=.5;b.y+=.5; // Subpixel overlap prevents seams between projected road strips.
    polygon(ctx,[[0,a.y],[w,a.y],[w,b.y],[0,b.y]],stripe?'#a1bf7a':'#a7c47e');
    polygon(ctx,[[a.x-a.half*1.14,a.y],[a.x+a.half*1.14,a.y],[b.x+b.half*1.14,b.y],[b.x-b.half*1.14,b.y]],'#ced1a4');
    polygon(ctx,[[a.x-a.half*1.04,a.y],[a.x+a.half*1.04,a.y],[b.x+b.half*1.04,b.y],[b.x-b.half*1.04,b.y]],stripe?'#f7eacf':'#d77860');
    polygon(ctx,[[a.x-a.half,a.y],[a.x+a.half,a.y],[b.x+b.half,b.y],[b.x-b.half,b.y]],stripe?'#657577':'#68787a');
    for(const lane of [-.98,.98])polygon(ctx,[[a.x+a.half*(lane-.008),a.y],[a.x+a.half*(lane+.008),a.y],[b.x+b.half*(lane+.008),b.y],[b.x+b.half*(lane-.008),b.y]],'#fff0c9');
    if(stripe)for(const lane of [-.333,.333])polygon(ctx,[[a.x+a.half*(lane-.012),a.y],[a.x+a.half*(lane+.012),a.y],[b.x+b.half*(lane+.012),b.y],[b.x+b.half*(lane-.012),b.y]],'#d0d3bc');
  }
  const objects=[];
  for(let z=Math.floor(car.z/32)*32+32;z<car.z+330;z+=32){const seed=Math.round(z/32);objects.push({z,type:'tree',side:seed%2?1:-1,seed});if(seed%3===0)objects.push({z:z+5,type:'tree',side:seed%2?-1:1,seed:seed+1});}
  course.forEach((item,index)=>{if(item.z>car.z+2&&item.z<car.z+330&&!car.found.includes(index))objects.push({...item,index});});
  if(!state.turns)for(const other of state.racers){if(other.id!==car.id&&other.z>car.z+5&&other.z<car.z+270)objects.push({type:'racer',z:other.z,other});}
  objects.sort((a,b)=>b.z-a.z);
  for(const object of objects){const p=project(object.z-car.z,car,w,h),size=Math.min(w*.11,h*.27)*p.scale;
    if(object.type==='tree')tree(ctx,p.x+p.half*(1.45+(object.seed%3)*.14)*object.side,p.y,Math.min(w*.36,h*.9)*p.scale,object.seed);
    else if(object.type==='racer')kart(ctx,p.x+p.half*object.other.x*.78,p.y,size*1.7,object.other);
    else {const x=p.x+p.half*object.lane*.78; if(object.type==='star'){oval(ctx,x,p.y,size*.55,size*.11,'#17344022');star(ctx,x,p.y-size*.7,size*.66,reducedMotion.matches?0:Math.sin(time*.001+object.index)*.12);}else cone(ctx,x,p.y,size*.9);}
  }
  const finishDistance=TRACK_LENGTH-car.z;
  if(finishDistance>0&&finishDistance<330){const p=project(finishDistance,car,w,h),depth=12*p.scale;for(let i=0;i<16;i++)for(let row=0;row<2;row++)polygon(ctx,[[p.x-p.half+i*p.half/8,p.y+row*depth],[p.x-p.half+(i+1)*p.half/8,p.y+row*depth],[p.x-p.half+(i+1)*p.half/8,p.y+(row+1)*depth],[p.x-p.half+i*p.half/8,p.y+(row+1)*depth]],(i+row)%2?'#fff6d6':'#243941');}
  const steer=(inputs[car.id]?.right?1:0)-(inputs[car.id]?.left?1:0);
  const carSize=Math.min(w*.16,h*.31),carX=w*.5+car.x*w*.39,carY=h*.83;
  if(car.bumpTime>0){ctx.fillStyle='#f7ba6844';ctx.fillRect(0,0,w,h);}
  if(car.speed>36&&!reducedMotion.matches){ctx.strokeStyle='#ffefc244';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(carX+(i-1.5)*carSize*.3,carY+carSize*.45);ctx.lineTo(carX+(i-1.5)*carSize*.42,h);ctx.stroke();}}
  kart(ctx,carX,carY+(reducedMotion.matches?0:Math.sin(time*.013)*Math.min(1,car.speed/30)),carSize,car,steer);
  // Soft bottom vignette adds contrast without obscuring the track.
  const shade=ctx.createLinearGradient(0,h*.82,0,h);shade.addColorStop(0,'#183a4000');shade.addColorStop(1,'#183a4030');ctx.fillStyle=shade;ctx.fillRect(0,h*.82,w,h*.18);
}
function frame(time) {
  let dt=lastTime?Math.min((time-lastTime)/1000,.25):0;lastTime=time;
  const inputs=held.read();
  // Preserve elapsed time on slower classroom displays without giant collision steps.
  while(dt>0){const slice=Math.min(.05,dt);step(state,inputs,slice);dt-=slice;}
  syncUI();
  if(state.phase==='countdown') { const value=String(Math.max(1,Math.ceil(state.countdown)));if(els.countdown.textContent!==value)els.countdown.textContent=value; }
  views.forEach(view=>{
    if(state.phase==='racing'||view.needsDraw||view.drawnPhase!==state.phase){scenery(view,time,inputs);view.needsDraw=false;view.drawnPhase=state.phase;}
  });
  if(time-lastHud>100){
    lastHud=time;
    for(const view of views){const {car}=view;view.stars.textContent=car.stars;view.timer.textContent=formatTime(car.finishTime??car.time);const progress=Math.round(car.z/TRACK_LENGTH*100);view.progress.setAttribute('aria-valuenow',progress);view.progress.firstElementChild.style.width=`${progress}%`;view.finish.hidden=car.finishTime===null||['finished','turn-complete'].includes(state.phase);}
  }
  requestAnimationFrame(frame);
}
// Read-only diagnostics make browser/board QA observable without a production test shortcut.
window.ESPRace = Object.freeze({snapshot:()=>structuredClone({state, inputs:held.read(), compact:compactQuery.matches, viewCount:views.length})});
reset(); requestAnimationFrame(frame);
