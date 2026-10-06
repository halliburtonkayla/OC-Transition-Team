import {createGame,action,updateGame,clamp,direction} from './engine.js';
import {Renderer} from './render.js';
import {Room,roomCode,validCode,cleanInput} from './network.js';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let frame=0,teams=[],game=null,room=null,renderer=null,side=0,started=false,remoteReady=false,paused=false,hidden=false,helpPaused=false,last=0,acc=0,tick=0,uiTick=0,sound=false,audio=null,lastPhase='',lastPlay=-1;
const inputs=[cleanInput({}),cleanInput({})],keys=new Set();let stickVector={x:0,y:0},sprintHeld=false,stickPointer=null;
const mascot=t=>t.mascot.split('/')[0].trim();
const team=id=>teams.find(t=>t.id===id)||teams[0];
function short(t){return t.name.replace(/ High School| Comprehensive| School/g,'').replace('Co.','County');}
function option(t){return `<option value="${t.id}">${esc(short(t))} · ${esc(mascot(t))}</option>`;}
function status(s){$('connection').textContent=s;}
function teamPreview(){const t=team($('team').value);if(!t)return;const initials=short(t).split(/[ -]/).filter(Boolean).map(w=>w[0]).slice(0,3).join('');$('teamPreview').innerHTML=`<div class="crest" style="--team:${t.primary}">${esc(initials)}</div><div><h3>${esc(mascot(t))}</h3><p>${esc(t.name)}</p><p>${esc(t.county)} County · ${esc(t.colors)}</p></div>`;const g=createGame([t.id,$('opponent').value||'558']);new Renderer($('preview'),teams).draw(g,0,.016);try{localStorage.setItem('ttFootballTeam',t.id);}catch{}}
async function init(){
 try{const r=await fetch('./football/teams.json?v=1');if(!r.ok)throw Error('directory');const directory=await r.json();teams=directory.teams;let saved;try{saved=localStorage.getItem('ttFootballTeam');}catch{}
 $('team').innerHTML=teams.map(option).join('');$('opponent').innerHTML=teams.map(option).join('');$('team').value=teams.some(t=>t.id===saved)?saved:'462';$('opponent').value=teams.find(t=>t.name.startsWith('Westview'))?.id||teams[1].id;
 for(const name of ['South Fulton','Obion Co.','Westview','Dresden','Union City']){const t=teams.find(t=>t.name.startsWith(name));if(!t)continue;const b=document.createElement('button');b.textContent=short(t);b.onclick=()=>{$('search').value='';filterTeams();$('team').value=t.id;teamPreview();};$('favorites').appendChild(b);}
 $('teamCount').textContent=teams.length+' football programs · Public and private schools';$('directoryInfo').textContent=`${directory.scope} Checked October 6, 2026 for ${directory.season}.`;
 for(const id of ['team','opponent','solo','host','join'])$(id).disabled=false;$('lobbyStatus').textContent='Choose your school, then practice or invite a friend.';teamPreview();const code=new URLSearchParams(location.search).get('room');if(code&&validCode(code)){$('roomInput').value=code;$('lobbyStatus').textContent='You have an invite. Choose your school, then tap Join game.';}
 }catch(e){$('lobbyStatus').textContent='The school directory did not load. Refresh this page to try again.';console.error(e);}
}
function filterTeams(){const current=$('team').value,q=$('search').value.toLowerCase().trim(),found=teams.filter(t=>(t.name+' '+t.mascot+' '+t.county+' '+t.city).toLowerCase().includes(q));$('team').innerHTML=found.map(option).join('');if(found.some(t=>t.id===current))$('team').value=current;if(found.length)teamPreview();else $('teamPreview').textContent='No matching schools. Try a different name or county.';for(const id of ['solo','host','join'])$(id).disabled=!found.length;}
$('search').oninput=filterTeams;$('team').onchange=teamPreview;$('opponent').onchange=teamPreview;
function resetInput(){keys.clear();stickVector={x:0,y:0};sprintHeld=false;stickPointer=null;inputs[side]=cleanInput({});$('knob').style.transform='';$('sprint').classList.remove('active');if(room){room.input=cleanInput({});room.pending=[];room.sendInput();}}
function start(mode){
 const selected=$('team').value;if(!teams.some(t=>t.id===selected))return;
 const code=mode==='host'?roomCode():$('roomInput').value.trim().toUpperCase();if(mode==='join'&&!validCode(code)){$('lobbyStatus').textContent='Enter the 8-character room code. Codes do not use I, O, 0, or 1.';return;}
 closeRoom();side=mode==='join'?1:0;game=createGame(mode==='join'?[$('opponent').value,selected]:[selected,$('opponent').value],mode==='solo');started=mode==='solo';paused=false;hidden=document.hidden;remoteReady=false;helpPaused=false;last=0;acc=0;tick=0;lastPhase='';lastPlay=-1;resetInput();
 $('lobby').hidden=true;$('match').hidden=false;document.body.classList.add('playing');$('roomBanner').hidden=mode==='solo';$('share').hidden=mode==='solo';$('result').hidden=true;$('startMatch').hidden=mode!=='host';$('startMatch').disabled=true;$('pause').textContent='Pause';$('rematch').hidden=side===1;
 renderer=new Renderer($('field'),teams);renderer.camera=36;status(mode==='solo'?'Practice · You control '+short(team(selected)):'Connecting your room…');
 if(mode!=='solo'){
  $('roomCode').textContent=code;$('roomHelp').textContent=mode==='host'?'Waiting for your friend to choose a school and join.':'Waiting for the creator to start the match.';
  const own=new Room({host:mode==='host',code,team:selected,onStatus:s=>{if(room===own)status(s);},onPeer:peer=>{
   if(room!==own)return;if(!peer){$('startMatch').disabled=true;status(own.host?'Room open · Waiting for your friend.':'Waiting for the creator.');return;}
   if(!teams.some(t=>t.id===peer.team)){status('The other player needs to refresh their school directory.');return;}
   if(!started)game.teams[1-side]=peer.team;$('startMatch').disabled=false;$('roomHelp').textContent=short(team(game.teams[0]))+' vs '+short(team(game.teams[1]));status(own.host?'Both teams are here. Tap Start match.':'Connected. The creator can start the match.');
  },onState:p=>{if(room!==own)return;game=p.game;started=!!p.started;remoteReady=!!p.ready;},onAction:name=>{if(room===own&&ready())action(game,1,name);}});
  room=own;void room.connect();
 }
 window.scrollTo(0,0);cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);
 if(mode==='solo'){let seen=false;try{seen=localStorage.getItem('ttFootballHelp')==='yes';}catch{}if(!seen)showHelp();}
}
function closeRoom(){room?.close();room=null;}
function leave(){cancelAnimationFrame(frame);closeRoom();game=null;started=false;resetInput();$('match').hidden=true;$('lobby').hidden=false;document.body.classList.remove('playing','fullView');$('expand').textContent='Full view';if(document.fullscreenElement)document.exitFullscreen?.();if($('help').open)$('help').close();window.scrollTo(0,0);}
function ready(){return !!game&&started&&!paused&&!hidden&&!helpPaused&&(!room||(room.host?(room.healthy()&&!room.remotePaused):(room.healthy()&&remoteReady)));}
function isPaused(){return paused||hidden||helpPaused;}
function collectInput(){const x=(keys.has('right')?1:0)-(keys.has('left')?1:0),y=(keys.has('down')?1:0)-(keys.has('up')?1:0);inputs[side]=cleanInput({x:x||stickVector.x,y:y||stickVector.y,sprint:sprintHeld||keys.has('sprint')});if(room){room.input=inputs[side];room.paused=isPaused();}}
function sendAction(name){if(!ready())return;unlockAudio();if(room&&!room.host)room.sendAction(name);else action(game,side,name);}
function loop(now){
 if(!game)return;const dt=last?Math.min(.05,(now-last)/1000):.016;last=now;collectInput();
 if(room){tick+=dt;if(tick>=.1){tick=0;if(room.host)room.sendState(game,started,ready());else room.sendInput();}}
 if(ready()&&(!room||room.host)){inputs[1]=room?room.remoteInput:inputs[1];acc+=dt;while(acc>=1/60){updateGame(game,inputs,1/60);acc-=1/60;}}else acc=0;
 renderer.draw(game,side,dt,!!room&&!room.host);uiTick+=dt;if(uiTick>.08){uiTick=0;updateUI();}
 if(lastPhase!==game.phase||lastPlay!==game.playId){if(game.phase==='dead'||game.phase==='final')beep(game.message.includes('TOUCHDOWN')?600:400,.15);else if(game.phase==='live'&&lastPhase==='ready')beep(190,.09);lastPhase=game.phase;lastPlay=game.playId;}
 frame=requestAnimationFrame(loop);
}
function updateUI(){
 const on=ready(),offense=game.offense===side,live=['live','flight'].includes(game.phase),pre=game.phase==='ready';
 const home=team(game.teams[0]),away=team(game.teams[1]);$('homeName').textContent=short(home);$('awayName').textContent=short(away);$('homeBoard').style.setProperty('--team',home.primary);$('awayBoard').style.setProperty('--team',away.primary);$('homeScore').textContent=game.score[0];$('awayScore').textContent=game.score[1];
 const secs=Math.ceil(game.clock);$('clock').textContent=game.quarter>4?'OT':Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');$('quarter').textContent=game.quarter>4?'':`Q${game.quarter}`;$('down').textContent=game.phase==='final'?'FINAL':['','1st','2nd','3rd','4th'][game.down]+' & '+(game.target===0||game.target===100?'GOAL':Math.max(1,Math.ceil(Math.abs(game.target-game.line))));
 $('message').textContent=game.message;$('role').textContent=offense?'OFFENSE '+(direction(game)>0?'→':'←'):'DEFENSE';
 $('playbook').hidden=!pre||!offense;$('result').hidden=game.phase!=='final';
 const visible={snap:pre&&offense,a:live&&offense&&game.carrier===0&&!game.thrown,b:live&&offense&&game.carrier===0&&!game.thrown,c:live&&offense&&game.carrier===0&&!game.thrown,handoff:game.phase==='live'&&offense&&game.carrier===0&&!game.thrown,juke:game.phase==='live'&&offense,switch:(pre||live)&&!offense,tackle:live&&!offense,punt:pre&&offense,fieldgoal:pre&&offense,kick:game.phase==='kickmeter'&&offense};
 document.querySelectorAll('[data-action]').forEach(b=>{const a=b.dataset.action;if(a in visible)b.hidden=!visible[a];b.disabled=!on;b.classList.toggle('selected',a===game.formation);});
 $('sprint').disabled=!on||!live;
 $('hint').textContent=offense?(pre?'Choose a play. SNAP starts the action.':game.carrier===0&&!game.thrown?'1 / 2 / 3 pass · H handoff · J juke · Shift sprint':'You have the ball. Run toward the end zone. Hold SPRINT for a burst.'):'E switches to the nearest defender. Space tackles when close.';
 $('waiting').hidden=on||game.phase==='final';
 if(!on&&game.phase!=='final'){
  let title='Waiting for your opponent',text='Both players need to keep this game open.';
  if(!started){title=room?.peer?'Both teams are ready':'Your room is open';text=room?.host?(room.peer?'Tap START MATCH above the field.':'Share the room code. Your friend chooses a school and taps JOIN GAME.'):'Waiting for the creator to start the match.';}
  else if(isPaused()){title='Game paused';text=helpPaused?'Close the playbook when you’re ready.':hidden?'Return to this game to continue.':'Tap RESUME to continue.';}
  else if(room?.remotePaused){title='Opponent paused';text='The game clock is stopped until both players return.';}
  $('waitingTitle').textContent=title;$('waitingText').textContent=text;
 }
 if(room&&started&&on)status('LIVE · '+short(team(game.teams[side]))+' · You control the player marked YOU');
 if(started)$('startMatch').hidden=true;
 $('roomBanner').hidden=!room||started;
 if(game.phase==='final'){
  const winner=team(game.teams[game.score[0]>game.score[1]?0:1]);$('resultTitle').textContent=short(winner)+' wins · '+game.score.join(' – ');
  const stat=game.stats?.[side];$('resultStats').textContent=stat?`Your team: ${stat.yards} yards · ${stat.completions}/${stat.passes} passing · ${stat.tackles} tackles.`:'Final whistle. Great game.';
 }
}
$('solo').onclick=()=>start('solo');$('host').onclick=()=>start('host');$('join').onclick=()=>start('join');$('roomInput').onkeydown=e=>{if(e.key==='Enter')start('join');};
$('startMatch').onclick=()=>{if(room?.host&&room.peer&&room.healthy()){started=true;status('Match started. Home team: tap SNAP.');room.sendState(game,true,true);}else status('Waiting for the other device to finish connecting. Try Start match in a moment.');};
$('leave').onclick=leave;$('newTeams').onclick=leave;
$('rematch').onclick=()=>{if(room&&!room.host)return;game=createGame(game.teams,!room);resetInput();$('result').hidden=true;};
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Resume':'Pause';resetInput();};
$('expand').onclick=async()=>{document.body.classList.toggle('fullView');const full=document.body.classList.contains('fullView');$('expand').textContent=full?'Exit full view':'Full view';try{if(full&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else if(!full&&document.fullscreenElement)await document.exitFullscreen();}catch{};};
$('share').onclick=async()=>{if(!room)return;const url=new URL('./park-football.html',location.href);url.searchParams.set('room',room.code);try{await navigator.clipboard.writeText(url.href);status('Invite copied. Share it with your friend.');}catch{status('Share this room code: '+room.code);}};
function showHelp(){helpPaused=!!game;resetInput();$('help').showModal();}
function closeHelp(){if($('help').open)$('help').close();helpPaused=false;try{localStorage.setItem('ttFootballHelp','yes');}catch{}}
$('helpButton').onclick=showHelp;$('closeHelp').onclick=closeHelp;$('gotIt').onclick=closeHelp;$('help').addEventListener('close',()=>{helpPaused=false;});
// Actions execute on pointerdown, so a second finger can pass while the first drags the stick.
for(const b of document.querySelectorAll('[data-action]')){
 b.addEventListener('pointerdown',e=>{if(b.disabled)return;e.preventDefault();sendAction(b.dataset.action);});
 b.addEventListener('click',e=>{if(e.detail===0)sendAction(b.dataset.action);});
}
const stick=$('stick');function moveStick(e){if(e.pointerId!==stickPointer)return;const r=stick.getBoundingClientRect(),dx=(e.clientX-r.x-r.width/2)/(r.width*.38),dy=(e.clientY-r.y-r.height/2)/(r.height*.38),n=Math.max(1,Math.hypot(dx,dy));stickVector={x:dx/n,y:dy/n};$('knob').style.transform=`translate(${stickVector.x*r.width*.28}px,${stickVector.y*r.height*.28}px)`;}
stick.onpointerdown=e=>{if(stickPointer!==null)return;e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);unlockAudio();};stick.onpointermove=moveStick;
const releaseStick=e=>{if(e.pointerId!==stickPointer)return;stickPointer=null;stickVector={x:0,y:0};$('knob').style.transform='';};stick.onpointerup=releaseStick;stick.onpointercancel=releaseStick;stick.onlostpointercapture=releaseStick;
let sprintPointer=null;$('sprint').onpointerdown=e=>{if($('sprint').disabled)return;e.preventDefault();sprintPointer=e.pointerId;$('sprint').setPointerCapture(e.pointerId);sprintHeld=true;$('sprint').classList.add('active');};
const releaseSprint=e=>{if(e.pointerId!==sprintPointer)return;sprintPointer=null;sprintHeld=false;$('sprint').classList.remove('active');};$('sprint').onpointerup=releaseSprint;$('sprint').onpointercancel=releaseSprint;$('sprint').onlostpointercapture=releaseSprint;
const keymap={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',Shift:'sprint'};
document.addEventListener('keydown',e=>{if(!game||$('help').open||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const mapped=keymap[e.key]||keymap[e.key.toLowerCase()];if(mapped){e.preventDefault();keys.add(mapped);return;}if(e.repeat)return;const a={'1':'a','2':'b','3':'c',h:'handoff',j:'juke',e:'switch',k:'kick'}[e.key.toLowerCase()]||(e.key===' '?(game.offense===side?'snap':'tackle'):null);if(a){e.preventDefault();sendAction(a);}});
document.addEventListener('keyup',e=>{const mapped=keymap[e.key]||keymap[e.key.toLowerCase()];if(mapped)keys.delete(mapped);});
window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{hidden=document.hidden;resetInput();if(room){room.paused=isPaused();room.sendInput();}});window.addEventListener('pagehide',()=>{closeRoom();game=null;});
function unlockAudio(){if(!sound)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')void audio.resume();}catch{}}
function beep(hz,duration){if(!sound||!audio||audio.state!=='running')return;const o=audio.createOscillator(),v=audio.createGain();o.type='sine';o.frequency.value=hz;v.gain.setValueAtTime(.045,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));unlockAudio();};
// Read-only diagnostics used by browser integration checks.
window.TTFootball={snapshot:()=>JSON.parse(JSON.stringify({game,side,started,ready:ready(),paused,code:room?.code||null,peer:!!room?.peer,connected:!!room?.connected,received:room?.receivedSeq||0,input:inputs[side]}))};
void init();
