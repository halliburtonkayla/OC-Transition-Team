import {createGame,tick,act} from './core.js?v=3';
import {SoftballScene} from './scene.js';
import {SoftballRoom,roomCode} from './network.js';
const $=id=>document.getElementById(id);
const controlRow=document.querySelector('.controlRow');
let game=createGame(),scene,room=null,side=0,active=false,ready=true,paused=false,keys=[{},{}],last=0,accumulator=0,received=0,visiblePitchT=0,endShown=false,audio=null,heard=0;
try{scene=new SoftballScene($('scene'));}catch(e){$('rendererError').hidden=false;$('rendererError').textContent='The 3D field could not start. Open this game in Safari or Chrome with WebGL enabled, then reload.';for(const id of ['solo','host','join'])$(id).disabled=true;console.error(e);}
const setText=(id,text)=>{if($(id).textContent!==text)$(id).textContent=text;};
function cue(){try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();}catch{}}
function sound(){if(!audio||heard===game.event)return;heard=game.event;if(!/contact|caught|out!|HOME RUN/i.test(game.message))return;const o=audio.createOscillator(),a=audio.createGain();o.type='triangle';o.frequency.value=/HOME RUN/.test(game.message)?660:220;a.gain.setValueAtTime(.035,audio.currentTime);a.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.connect(a);a.connect(audio.destination);o.start();o.stop(audio.currentTime+.14);}
function start(cpu,host=false,code=''){
 room?.close();room=null;game=createGame({innings:Number($('innings').value),cpu});side=cpu||host?0:1;active=true;ready=cpu;paused=false;keys=[{},{}];endShown=false;heard=0;
 $('lobby').hidden=true;$('gameControls').hidden=false;document.body.classList.add('playing');$('field').appendChild(controlRow);controlRow.hidden=false;$('roomInfo').hidden=cpu;$('roomCode').textContent=code;$('homeName').textContent=cpu?'COMPUTER · HOME':'PLAYER 2 · HOME';
 $('connection').textContent=cpu?'Practice · You are Player 1':'Connecting…';$('restart').hidden=!cpu&&!host;$('scene').scrollIntoView({block:'center',behavior:'smooth'});cue();
 if(!cpu){
  room=new SoftballRoom({host,code,
   onState:(state,isPaused)=>{game=state;paused=isPaused;received=performance.now();},
   onInput:k=>{keys[1]=k;},onAction:(name,meta)=>{if(name==='pause')paused=!paused;else if(!paused)act(game,1,name,meta);},
   onReady:r=>{ready=r;if(!r)keys=[{},{}];},onStatus:text=>setText('connection',text)
  });room.publish(game,paused);room.connect();
 }
}
function leave(){room?.close();room=null;active=false;ready=true;paused=false;keys=[{},{}];game=createGame();$('lobby').hidden=false;$('gameControls').hidden=true;$('gameControls').appendChild(controlRow);$('end').close();$('help').close();document.body.classList.remove('playing');$('homeName').textContent='PLAYER 2 · HOME';$('lobby').scrollIntoView({block:'center',behavior:'smooth'});}
function command(name){
 if(!active||!ready||game.finished)return;cue();
 if(name==='pause'){if(room&&!room.host)room.action('pause');else paused=!paused;keys=[{},{}];return;}
 if(paused)return;
 const meta={pitchId:game.pitch?.id,pitchT:visiblePitchT};
 if(room&&!room.host)room.action(name,meta);else act(game,side,name,meta);
}
$('solo').onclick=()=>start(true);$('host').onclick=()=>start(false,true,roomCode());
$('join').onclick=()=>{const code=$('code').value.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{8}$/.test(code)){setText('lobbyStatus','Enter the 8-character room code shown on your friend’s screen.');return;}setText('lobbyStatus','');start(false,false,code);};
$('code').onkeydown=e=>{if(e.key==='Enter')$('join').click();};
$('leave').onclick=leave;$('endLeave').onclick=leave;$('pause').onclick=()=>command('pause');
$('restart').onclick=()=>{if(room&&!room.host)return;game=createGame({innings:game.innings,cpu:!room});paused=false;keys=[{},{}];endShown=false;$('end').close();};
$('camera').onclick=()=>{scene.view=scene.view==='auto'?'field':'auto';setText('camera',scene.view==='auto'?'Field view':'Batting view');};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('roomCode').textContent);setText('copy','Copied');}catch{setText('connection','Share this code with your friend: '+$('roomCode').textContent);}};
$('helpButton').onclick=()=>{if(active&&ready&&!paused)command('pause');$('help').showModal();};
$('closeHelp').onclick=()=>$('help').close();
for(const b of document.querySelectorAll('[data-action]')){
 b.onpointerdown=e=>{if(e.button!==0||b.disabled)return;e.preventDefault();command(b.dataset.action);};
 b.onclick=e=>{if(e.detail===0)command(b.dataset.action);};
}
let stickPointer=null;
const clearStick=()=>{stickPointer=null;keys[side]={};$('knob').style.transform='';if(room)room.keys=keys[side];};
function stick(e){const b=$('stick').getBoundingClientRect(),x=(e.clientX-b.x-b.width/2)/(b.width*.34),y=(e.clientY-b.y-b.height/2)/(b.height*.34),n=Math.max(1,Math.hypot(x,y));keys[side]={left:x<-.22,right:x>.22,up:y<-.22,down:y>.22};$('knob').style.transform=`translate(${x/n*28}px,${y/n*28}px)`;if(room){room.keys=keys[side];if(!room.host)room.sendInput();}}
$('stick').onpointerdown=e=>{if(stickPointer!==null)return;e.preventDefault();stickPointer=e.pointerId;$('stick').setPointerCapture(e.pointerId);stick(e);};
$('stick').onpointermove=e=>{if(stickPointer===e.pointerId){e.preventDefault();stick(e);}};
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('stick').addEventListener(type,e=>{if(e.pointerId===stickPointer)clearStick();});
const moveKeys={w:'up',a:'left',s:'down',d:'right',arrowup:'up',arrowleft:'left',arrowdown:'down',arrowright:'right'};
document.addEventListener('keydown',e=>{
 if(!active||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||$('help').open||$('end').open)return;
 const key=e.key.toLowerCase();if(moveKeys[key]){e.preventDefault();keys[side][moveKeys[key]]=true;}
 else if(!e.repeat){const name=key===' '?side===game.batting?'swing':game.phase==='ready'?'pitch':'switch':key==='q'?'switch':key==='e'?'advance':key==='h'?'hold':/^[1-4]$/.test(key)?'throw-'+key:key==='p'?'pause':null;if(name){e.preventDefault();command(name);}}
});
document.addEventListener('keyup',e=>{const key=moveKeys[e.key.toLowerCase()];if(key)keys[side][key]=false;});
window.addEventListener('blur',clearStick);
document.addEventListener('visibilitychange',()=>{clearStick();if(document.hidden&&active&&ready&&!paused)command('pause');});
window.addEventListener('pagehide',()=>{room?.close();scene?.dispose();});
window.addEventListener('resize',()=>scene?.resize());
function ui(){
 setText('score0',String(game.scores[0]));setText('score1',String(game.scores[1]));
 setText('inning',active?(game.batting?'BOTTOM ':'TOP ')+game.inning+(game.inning>game.innings?' · EXTRAS':' / '+game.innings):'EXHIBITION GAME');
 setText('count',active?game.balls+' BALLS · '+game.strikes+' STRIKES · '+game.outs+' OUTS':'Live pitching · batting · fielding');
 const occupied=game.bases.map((on,i)=>on?['1st','2nd','3rd'][i]:'').filter(Boolean);setText('baseStatus',occupied.length?'On base: '+occupied.join(', '):'Bases empty');
 $('banner').hidden=!(active&&(!ready||paused));setText('banner',!ready?'Waiting for Player '+(side===0?2:1):'Paused · tap Resume');setText('pause',paused?'Resume':'Pause');
 const batting=side===game.batting,live=['live','throw','homer'].includes(game.phase);
 setText('role',!active?'WELCOME TO THE DIAMOND':(batting?'YOU ARE BATTING':'YOU ARE FIELDING')+' · PLAYER '+(side+1));
 setText('message',game.message);setText('style',game.batStyle==='power'?'Power swing':'Contact swing');
 $('batActions').hidden=!batting||live;$('pitchActions').hidden=batting||live;$('fieldActions').hidden=batting||!live;$('runActions').hidden=!batting||!live;
 setText('stickLabel',batting?'AIM YOUR HIT':live?'MOVE BLUE-RING FIELDER':'AIM YOUR PITCH');
 const hint=!ready?'Share the room code. The game starts when both players connect.':paused?'The game is paused. Tap Resume when both players are ready.':batting?live?'Runners advance one base. Try for an extra base, or hold at the next bag.':'Aim left/right before the pitch. Watch the yellow ball reach home plate, then SWING.':live?game.holder!==null?'Ball secured. Tap 1st, 2nd, 3rd, or Home to throw.':'Drag the pad toward the gold ring. Catch or pick up the ball, then throw.':'Aim with the pad. Choose a pitch type, then tap PITCH. The white box is the strike zone.';
 setText('instruction',hint);
 for(const b of document.querySelectorAll('[data-action]')){const a=b.dataset.action;let enabled=true;
  if(a==='swing')enabled=game.phase==='pitch'&&!game.pitch?.swung&&visiblePitchT<=game.pitch.windup+game.pitch.duration+.2;
  if(a==='pitch'||a==='style'||a.startsWith('kind'))enabled=game.phase==='ready';
  if(a.startsWith('throw'))enabled=game.phase==='live'&&game.holder!==null;
  if(a==='switch')enabled=game.phase==='live'&&game.holder===null;
  if(a==='advance'||a==='hold')enabled=['live','throw'].includes(game.phase);
  b.disabled=!active||!ready||paused||game.finished||!enabled;b.classList.toggle('selected',a==='kind-'+game.pitchKind);
 }
 $('pitchCue').hidden=!active||!batting||game.phase!=='pitch'||visiblePitchT>game.pitch.windup+game.pitch.duration+.2;
 if(game.pitch){const p=game.pitch,u=Math.max(0,Math.min(1,(visiblePitchT-p.windup)/p.duration));$('pitchProgress').style.left=`calc(${u*100}% - ${u*4}px)`;}
 if(game.finished&&!endShown){endShown=true;setText('winner',game.message);setText('finalScore','Player 1 '+game.scores[0]+' — '+game.scores[1]+' '+(game.cpu?'Computer':'Player 2'));$('end').showModal();}
 if(!game.finished&&endShown){endShown=false;$('end').close();}
}
function frame(now){
 const dt=Math.min(.04,(now-(last||now))/1000);last=now;
 if(active&&ready&&!paused&&(!room||room.host)){accumulator+=dt;while(accumulator>=1/60){tick(game,keys,1/60);accumulator-=1/60;}}
 else accumulator=0;
 if(room){room.keys=keys[side];if(room.host)room.publish(game,paused);}
 let visual=game;visiblePitchT=game.pitch?.t||0;
 // Extrapolate only the visible pitch, never remote scores or collision decisions.
 if(room&&!room.host&&!paused&&ready&&game.phase==='pitch'){
  const p=game.pitch,t=p.t+Math.min(.15,(now-received)/1000),u=Math.max(0,Math.min(1,(t-p.windup)/p.duration));visiblePitchT=t;
  visual={...game,pitch:{...p,t},ball:t>p.windup+p.duration?{x:p.x,y:Math.max(.5,p.y),z:-.45}:{x:p.x*u,y:Math.max(.1,.7+(p.y-.7)*u+Math.sin(u*Math.PI)*(.45+(p.kind==='drop'?.5:0))),z:13.1*(1-u)}};
 }
 scene?.draw(visual,side,dt||1/60);ui();sound();requestAnimationFrame(frame);
}
window.TTSoftball={snapshot:()=>JSON.parse(JSON.stringify({game,side,active,ready,paused,room:room?.code,visiblePitchT})),leave};
requestAnimationFrame(frame);
