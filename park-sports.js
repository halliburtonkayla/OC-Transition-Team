import {createClient} from './assets/vendor/supabase-2.117.2.js';
import {SPORTS_URL,SPORTS_KEY} from './park-sports-config.js';
import {SPORTS,createGame,updateGame,action} from './park-sports-engine.js';

const $=s=>document.querySelector(s);
const titles={basketball:'Park Basketball',football:'Park Football',softball:'Park Softball'};
const explanations={basketball:'Move around the court, shoot at the opposite hoop, and steal or rebound. First to 10 wins.',football:'Run, pass to receivers, and tackle on defense. Four downs to reach the yellow first-down line. First to 14 wins.',softball:'Pitch, time your swing, field the ball, and run the bases. Three outs per half-inning; play three innings, with extras for a tie.'};
const client=createClient(SPORTS_URL,SPORTS_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});
const id=crypto.randomUUID();
let session=null,frame=null,networkTimer=null,joinTimeout=null;
const styles=`
.ttSport{max-width:1050px;margin:auto;color:#20314e;font-family:Arial,sans-serif}.ttSport h2{margin:4px 0 8px;color:#4b347f}.ttSport p{line-height:1.45}.ttSport button{border:0;border-radius:13px;padding:13px 16px;font-weight:800;background:#ece8ff;color:#392b65;cursor:pointer;min-height:48px}.ttSport button:disabled{opacity:.45;cursor:default}.ttSport .sportPrimary{background:#6c3acb;color:#fff}.ttSport .sportOnline{background:#087b79;color:white}.ttSportModes{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}.ttSportJoin{display:flex;flex-wrap:wrap;gap:10px;align-items:end;padding:16px;background:#f0f4fa;border-radius:16px}.ttSportJoin label{display:grid;gap:6px;font-weight:700}.ttSport input{font:inherit;max-width:100%;width:220px;padding:12px;border:2px solid #afbdd3;border-radius:10px;text-transform:uppercase;letter-spacing:2px}.ttSportScore{display:flex;justify-content:space-between;gap:12px;background:#152a4b;color:white;border-radius:16px;padding:14px;font-weight:800;font-size:18px;flex-wrap:wrap}.ttSportScore small{font-size:14px;font-weight:500}.ttSport canvas{display:block;width:100%;height:auto;aspect-ratio:16/9;border-radius:16px;margin:12px 0;background:#346a40}.ttSportMessage{min-height:48px;border-radius:12px;background:#fff0ce;padding:12px;font-weight:700}.ttSportControls{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin:12px 0}.ttSportPad{display:grid;grid-template-columns:58px 58px 58px;gap:5px}.ttSportPad button{height:55px;padding:0;font-size:27px;touch-action:none;user-select:none;-webkit-user-select:none}.ttSportActions{display:flex;flex-wrap:wrap;gap:8px;flex:1;justify-content:center}.ttSportActions button{font-size:17px;touch-action:manipulation;min-width:100px}.ttSportHelp{font-size:14px;color:#4d5f7a}.ttSportFoot{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.ttSportRoom{background:#e4f5f1;padding:12px;border-radius:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.ttSportRoom strong{font-size:22px;letter-spacing:3px}.ttSportStatus{min-height:24px;font-weight:700;color:#226c61}.ttSportResult{font-size:20px;color:#6338aa}.ttSport [hidden]{display:none!important}@media(max-width:600px){.ttSportScore{font-size:15px;padding:10px}.ttSportControls{justify-content:center}.ttSportActions{width:100%;flex:auto}.ttSportJoin{padding:10px}.ttSportJoin input{width:175px}}`;
function shell(html){const c=$('#rzContent');if(c)c.innerHTML=`<div class="rzPanel"><style>${styles}</style><div class="ttSport">${html}</div></div>`}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function stop(){cancelAnimationFrame(frame);clearInterval(networkTimer);clearTimeout(joinTimeout);frame=null;networkTimer=null;joinTimeout=null;
 const old=session;session=null;if(old?.channel){old.channel.untrack();client.removeChannel(old.channel)}
}
function open(sport){stop();if(!SPORTS.includes(sport))return;
 shell(`<h2>${titles[sport]}</h2><p>${explanations[sport]}</p><p>Big touch controls work on a phone, tablet, or computer.</p><div class="ttSportModes"><button class="sportPrimary" data-mode="solo">Play against Computer</button><button class="sportOnline" data-mode="host">Create Online Game</button></div><div class="ttSportJoin"><label>Room code<input id="ttSportJoinCode" placeholder="8-letter code" maxlength="8" autocomplete="off" autocapitalize="characters"></label><button class="sportOnline" data-mode="join">Join Online Game</button></div><p class="ttSportHelp">For online play, one student creates a room and shares its code. A second student joins from another device. Keep the creator’s game open.</p><p class="ttSportStatus" id="ttSportStatus" role="status"></p><div class="ttSportFoot"><button data-menu>Sports Menu</button></div>`);
 $('[data-mode="solo"]').onclick=()=>startSolo(sport);$('[data-mode="host"]').onclick=()=>connect(sport,true);$('[data-mode="join"]').onclick=()=>connect(sport,false);$('[data-menu]').onclick=()=>window.recreationSports();
 $('#ttSportJoinCode').onkeydown=e=>{if(e.key==='Enter')connect(sport,false)};
}
function startSolo(sport){stop();session={sport,host:true,online:false,side:0,game:createGame(sport),inputs:[{},{}],ready:true,last:0,seq:0};gameUI();frame=requestAnimationFrame(loop)}
function roomCode(){const bytes=crypto.getRandomValues(new Uint8Array(8));return [...bytes].map(n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join('')}
function status(text){const el=$('#ttSportStatus');if(el)el.textContent=text}
async function connect(sport,host){
 const code=host?roomCode():($('#ttSportJoinCode')?.value||'').trim().toUpperCase();
 if(!/^[A-Z2-9]{8}$/.test(code)){status('Enter the 8-character room code from the other student.');return}
 stop();session={sport,host,online:true,code,side:host?0:1,game:createGame(sport),inputs:[{},{}],ready:false,last:0,seq:0,hostId:host?id:null,guestId:null,connected:false,receivedAt:0};session.game.cpu=false;
 gameUI();status(host?'Connecting your room…':'Joining the room…');const own=session;
 const channel=client.channel('tt-park-v1:'+code,{config:{broadcast:{self:false,ack:false},presence:{key:id}}});own.channel=channel;
 channel.on('broadcast',{event:'state'},({payload:p})=>{
  if(session!==own||own.host||!p||p.host!==own.hostId||p.guest!==id||p.seq<=own.seq||!validState(p.game))return;
  own.seq=p.seq;own.game=p.game;own.sport=p.game.sport;own.ready=Boolean(p.ready);own.guestId=id;own.receivedAt=performance.now();
  if($('#ttSportTitle')?.textContent!==titles[own.sport])gameUI();status(own.ready?'Connected • You are Player 2':'Waiting for Player 1…');
 });
 channel.on('broadcast',{event:'input'},({payload:p})=>{
  if(session!==own||!own.host||p?.id!==own.guestId||!p||typeof p.keys!=='object')return;
  own.inputs[1]=cleanKeys(p.keys);own.lastGuestInput=performance.now();
  if(Array.isArray(p.actions))for(const a of p.actions.slice(0,4))if(validAction(a))own.game=action(own.game,1,a);
 });
 channel.on('presence',{event:'sync'},()=>presence(own));
 channel.subscribe(async state=>{
  if(session!==own)return;
  if(state==='SUBSCRIBED'){own.connected=true;await channel.track({role:host?'host':'guest',joined:Date.now()});if(session!==own)return;presence(own);networkTimer=setInterval(()=>networkTick(own),150);}
  else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT'||state==='CLOSED'){own.connected=false;own.ready=false;own.inputs=[{},{}];status('Connection interrupted. Return to Sports Menu and create or join a room again.');}
 });
 joinTimeout=setTimeout(()=>{if(session!==own||own.ready)return;status(host?'Your room is open. Waiting for the second student…':'No active host found. Check the room code and keep the creator’s game open.');},12000);
 frame=requestAnimationFrame(loop);
}
function cleanKeys(k){return {up:!!k.up,down:!!k.down,left:!!k.left,right:!!k.right}}
function validAction(a){return ['primary','secondary','pass-left','pass-center','pass-right','pitch-fast','pitch-change','pitch-curve','aim-left','aim-right'].includes(a)}
function validState(g){return g&&SPORTS.includes(g.sport)&&Array.isArray(g.scores)&&g.scores.length===2&&g.scores.every(Number.isFinite)&&Number.isFinite(g.time)&&typeof g.message==='string'&&g.message.length<400&&(g.sport==='basketball'?g.basket?.players?.length===2:g.sport==='football'?g.football?.attack?.length===4&&g.football?.defense?.length===4:g.softball?.fielders?.length===9)}
function presence(own){
 if(session!==own)return;const peers=Object.entries(own.channel.presenceState()).flatMap(([key,items])=>items.map(p=>({...p,id:key})));
 if(own.host){const guests=peers.filter(p=>p.role==='guest').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));
  const active=guests.find(p=>p.id===own.guestId)||guests[0];own.guestId=active?.id||null;own.ready=!!active&&own.connected;if(!own.ready)own.inputs[1]={};
  status(active?'Connected • You are Player 1':'Room open • Waiting for Player 2…');networkTick(own);
 }else{const host=peers.find(p=>p.role==='host');own.hostId=host?.id||null;if(!host){own.ready=false;status('Waiting for Player 1. Keep the host’s game open.')}else{const guests=peers.filter(p=>p.role==='guest').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));if(guests[0]?.id!==id){own.ready=false;status('This room already has two players. Create another room.')}else status('Host found • Connecting game…');}}
}
function networkTick(own){
 if(session!==own||!own.connected)return;
 if(own.host){own.channel.send({type:'broadcast',event:'state',payload:{host:id,guest:own.guestId,seq:++own.seq,ready:own.ready,game:own.game}});if(performance.now()-(own.lastGuestInput||0)>1200)own.inputs[1]={};}
 else{const actions=own.pendingActions||[];own.pendingActions=[];own.channel.send({type:'broadcast',event:'input',payload:{id,keys:own.inputs[1],actions}});}
}
function gameUI(){const s=session;if(!s)return;
 shell(`<h2 id="ttSportTitle">${titles[s.sport]}</h2>${s.online?`<div class="ttSportRoom"><span>Room code</span><strong id="ttSportRoomCode">${escape(s.code)}</strong><span>You are Player ${s.side+1}</span></div>`:''}<p class="ttSportStatus" id="ttSportStatus" role="status">${s.online?'Connecting…':'Solo • You are Player 1'}</p><div class="ttSportScore"><span>Player 1 <strong id="ttScore1">0</strong></span><small id="ttSportDetail"></small><span>${s.online?'Player 2':'Computer'} <strong id="ttScore2">0</strong></span></div><canvas id="ttSportCanvas" width="960" height="540" aria-label="${titles[s.sport]} playing field"></canvas><p id="ttSportMessage" class="ttSportMessage" role="status"></p><div class="ttSportControls"><div class="ttSportPad" aria-label="Movement controls"><span></span><button data-direction="up" aria-label="Move up">▲</button><span></span><button data-direction="left" aria-label="Move left">◀</button><button data-direction="down" aria-label="Move down">▼</button><button data-direction="right" aria-label="Move right">▶</button></div><div id="ttSportActions" class="ttSportActions"></div></div><p id="ttSportHelp" class="ttSportHelp"></p><div class="ttSportFoot"><button id="ttSportRestart" ${s.online&&!s.host?'hidden':''}>Restart Game</button><button data-menu>Sports Menu</button></div>`);
 const actions=s.sport==='basketball'?[['primary','SHOOT'],['secondary','STEAL']]:s.sport==='football'?[['pass-left','PASS LEFT'],['pass-center','PASS CENTER'],['pass-right','PASS RIGHT'],['secondary','TACKLE']]:[['primary','SWING'],['pitch-fast','FAST PITCH'],['pitch-change','CHANGEUP'],['pitch-curve','CURVEBALL'],['secondary','THROW TO FIRST']];
 for(const [name,label]of actions){const b=document.createElement('button');b.dataset.action=name;b.textContent=label;b.className='sportPrimary';b.onclick=()=>sendAction(name);$('#ttSportActions').appendChild(b)}
 document.querySelectorAll('[data-direction]').forEach(b=>{
  b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input(b.dataset.direction,true)};
  const release=()=>input(b.dataset.direction,false);b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
 });
 $('[data-menu]').onclick=()=>window.recreationSports();$('#ttSportRestart').onclick=()=>{if(session?.host){session.game=createGame(session.sport);session.game.cpu=!session.online;session.inputs=[{},{}];networkTick(session)}};
}
function input(key,down){if(!session)return;session.inputs[session.side][key]=down}
function sendAction(name){const s=session;if(s?.sport==='football'&&name==='primary'&&s.game.football.offense===s.side)name='pass-center';if(!s||!s.ready||s.game.finished)return;if(s.host)s.game=action(s.game,s.side,name);else{(s.pendingActions||=[]).push(name);networkTick(s)}}
function loop(now){const s=session;if(!s||!$('#ttSportCanvas'))return stop();const dt=Math.min(.04,(now-(s.last||now))/1000);s.last=now;
 if(s.host&&s.ready)updateGame(s.game,s.inputs,dt);
 if(!s.host&&s.ready&&now-s.receivedAt>5000){s.ready=false;status('Waiting for the host’s connection. Keep both games open.');}
 draw(s);frame=requestAnimationFrame(loop);
}
function draw(s){const g=s.game,cv=$('#ttSportCanvas'),c=cv.getContext('2d');c.clearRect(0,0,960,540);
 if(g.sport==='basketball')drawBasket(c,g);if(g.sport==='football')drawFootball(c,g);if(g.sport==='softball')drawSoftball(c,g);
 $('#ttScore1').textContent=g.scores[0];$('#ttScore2').textContent=g.scores[1];$('#ttSportMessage').textContent=!s.ready?'Waiting for both players to connect…':g.message;
 const detail=$('#ttSportDetail'),help=$('#ttSportHelp');let offense;
 if(g.sport==='basketball'){detail.textContent='First to 10';help.textContent=`Player ${s.side+1}: attack the ${s.side===0?'RIGHT':'LEFT'} hoop. Arrows or WASD to move; Space to shoot; E to steal.`}
 if(g.sport==='football'){const f=g.football;offense=f.offense;detail.textContent=`Down ${Math.min(4,f.down)} / 4 • ${Math.max(0,Math.round(Math.abs(f.target-f.line)/7))} yards to first down`;help.textContent=offense===s.side?'OFFENSE: move the ball carrier, or choose a receiver and pass. Attack the '+(s.side===0?'RIGHT':'LEFT')+' end zone.':'DEFENSE: move your highlighted defender toward the ball carrier. Tap TACKLE when close.'}
 if(g.sport==='softball'){const b=g.softball;offense=b.batting;detail.textContent=`${b.batting===0?'Top':'Bottom'} ${b.inning} • ${b.outs} outs • ${b.balls} balls / ${b.strikes} strikes`;help.textContent=offense===s.side?'BATTING: swing as the pitched ball reaches home plate. Left/right controls aim your hit. Space swings.':'FIELDING: choose a pitch. On a hit, move the highlighted fielder to the ball, then throw to first.'}
 document.querySelectorAll('[data-action]').forEach(b=>{const a=b.dataset.action;let available=true;if(g.sport==='basketball')available=a==='primary'?g.basket.owner===s.side&&!g.basket.shot:g.basket.owner===1-s.side;if(g.sport==='football')available=a.startsWith('pass')?offense===s.side:offense!==s.side;if(g.sport==='softball')available=a==='primary'?offense===s.side:offense!==s.side;b.hidden=!available;b.disabled=!s.ready||g.finished||(g.sport==='basketball'&&(g.basket.cool>0||g.basket.reset>0));});
 if(g.finished){$('#ttSportMessage').textContent=g.message+' Use Restart Game for another match.';c.fillStyle='#142441dd';c.fillRect(230,190,500,135);c.fillStyle='white';c.textAlign='center';c.font='bold 38px Arial';c.fillText(g.message,480,250);c.font='20px Arial';c.fillText('Great game!',480,292)}
}
function label(c,text,x,y,size=20,color='#fff'){c.fillStyle=color;c.font=`bold ${size}px Arial`;c.textAlign='center';c.fillText(text,x,y)}
function line(c,x1,y1,x2,y2,color='#fff',width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function person(c,p,team,n,selected=false,helmet=false){
 c.save();c.translate(p.x,p.y);if(selected){c.strokeStyle='#ffe66b';c.lineWidth=4;c.beginPath();c.ellipse(0,16,24,12,0,0,Math.PI*2);c.stroke()}
 c.fillStyle='#0004';c.beginPath();c.ellipse(0,17,18,7,0,0,Math.PI*2);c.fill();
 line(c,-6,9,-8,23,'#172331',7);line(c,6,9,8,23,'#172331',7);line(c,-11,-3,-19,6,'#a46b45',7);line(c,11,-3,19,6,'#a46b45',7);
 c.fillStyle=team===0?'#6c52d5':'#ed7839';c.beginPath();c.roundRect(-13,-14,26,27,7);c.fill();circle(c,0,-22,10,'#bb845f');if(helmet){circle(c,0,-24,11,team===0?'#dcd9fa':'#fff2df');line(c,-8,-18,8,-18,'#24324a',3)}else{c.fillStyle='#263248';c.fillRect(-9,-31,18,6)}
 label(c,String(n),0,5,12);c.restore();
}
function ball(c,x,y,kind='basketball',height=0){c.fillStyle='#0003';c.beginPath();c.ellipse(x,y+8,11+height*.02,5,0,0,Math.PI*2);c.fill();y-=height;
 if(kind==='football'){c.save();c.translate(x,y);c.rotate(-.5);c.fillStyle='#98592d';c.beginPath();c.ellipse(0,0,16,9,0,0,Math.PI*2);c.fill();line(c,-7,0,7,0,'#fff',2);for(let n=-5;n<=5;n+=5)line(c,n,-3,n,3,'#fff',2);c.restore();return}
 circle(c,x,y,kind==='basketball'?12:7,kind==='basketball'?'#f58c31':'#faf1a3');if(kind==='basketball'){line(c,x-11,y,x+11,y,'#7c411a',1.5);line(c,x,y-11,x,y+11,'#7c411a',1.5)}else{line(c,x-3,y-5,x-3,y+4,'#ce3d46',1.2);line(c,x+3,y-5,x+3,y+4,'#ce3d46',1.2)}
}
function parkBackdrop(c){c.fillStyle='#286d42';c.fillRect(0,0,960,540);for(let x=20;x<960;x+=100){circle(c,x,25,28,'#235e36');circle(c,x,510,25,'#194c30')}c.fillStyle='#788e7a';c.fillRect(45,52,870,436)}
function drawBasket(c,g){parkBackdrop(c);c.fillStyle='#cf925a';c.fillRect(80,80,800,380);for(let x=85;x<875;x+=32)line(c,x,83,x,457,'#c38853',1);c.strokeStyle='#fff7e6';c.lineWidth=4;c.strokeRect(90,90,780,360);line(c,480,90,480,450);c.beginPath();c.arc(480,270,57,0,Math.PI*2);c.stroke();c.strokeRect(90,190,145,160);c.strokeRect(725,190,145,160);c.beginPath();c.arc(235,270,76,-Math.PI/2,Math.PI/2);c.stroke();c.beginPath();c.arc(725,270,76,Math.PI/2,Math.PI*1.5);c.stroke();
 for(const x of[75,885]){line(c,x,221,x,319,'#e4ecf6',11);c.strokeStyle='#f1b4a4';c.lineWidth=2;for(let n=-15;n<=15;n+=7)line(c,x+n,257,x+n,284,'#fff',2);c.strokeStyle='#e03b2b';c.lineWidth=5;c.beginPath();c.ellipse(x,270,21,14,0,0,Math.PI*2);c.stroke()}
 label(c,'PLAYER 2 HOOP',150,68,16);label(c,'PLAYER 1 HOOP',795,68,16);const b=g.basket;b.players.forEach((p,i)=>person(c,p,i,i+1,session.side===i));
 if(b.shot){const q=b.shot,t=Math.min(1,q.t/q.duration);ball(c,q.from.x+(q.to.x-q.from.x)*t,q.from.y+(q.to.y-q.from.y)*t,'basketball',Math.sin(t*Math.PI)*130)}else if(b.owner!==null){const p=b.players[b.owner];ball(c,p.x+22,p.y+Math.abs(Math.sin(g.time*9))*10,'basketball')}else if(b.loose)ball(c,b.loose.x,b.loose.y,'basketball');
}
function drawFootball(c,g){parkBackdrop(c);for(let n=0;n<10;n++){c.fillStyle=n%2?'#42824a':'#4a9052';c.fillRect(90+n*78,85,78,370)}c.fillStyle='#6550b3';c.fillRect(65,85,60,370);c.fillStyle='#a64e2e';c.fillRect(835,85,60,370);c.strokeStyle='white';c.lineWidth=4;c.strokeRect(65,85,830,370);
 for(let n=1;n<=9;n++){const x=125+n*71;line(c,x,87,x,453,'#ebf4e5',2);label(c,String(n<=5?n*10:(10-n)*10),x,115,17);label(c,String(n<=5?n*10:(10-n)*10),x,440,17)}for(let x=132;x<831;x+=14){line(c,x,205,x,214,'#fff',1.5);line(c,x,326,x,335,'#fff',1.5)}
 const f=g.football;line(c,f.line,85,f.line,455,'#86dfff',4);line(c,Math.max(125,Math.min(835,f.target)),85,Math.max(125,Math.min(835,f.target)),455,'#ffdf62',4);label(c,'LINE OF SCRIMMAGE',f.line,70,13,'#bceeff');
 f.attack.forEach((p,n)=>person(c,p,f.offense,n===0?'QB':n,f.offense===session.side&&n===f.carrier,true));f.defense.forEach((p,n)=>person(c,p,1-f.offense,n+1,session.side!==f.offense&&n===0,true));
 if(f.flight){const q=f.flight,t=Math.min(1,q.t/q.duration);ball(c,q.from.x+(q.to.x-q.from.x)*t,q.from.y+(q.to.y-q.from.y)*t,'football',Math.sin(t*Math.PI)*65)}else{const p=f.attack[f.carrier];ball(c,p.x+16,p.y-4,'football')}
}
const bases=[{x:685,y:265},{x:480,y:80},{x:275,y:265}];
function drawSoftball(c,g){parkBackdrop(c);c.fillStyle='#4c944b';c.fillRect(60,50,840,430);c.fillStyle='#e6bc7b';c.beginPath();c.moveTo(480,455);c.lineTo(720,270);c.lineTo(480,75);c.lineTo(240,270);c.closePath();c.fill();c.fillStyle='#568a43';c.beginPath();c.moveTo(480,408);c.lineTo(660,270);c.lineTo(480,125);c.lineTo(300,270);c.closePath();c.fill();circle(c,480,285,38,'#d9ad72');
 line(c,480,455,115,80,'#fff',3);line(c,480,455,845,80,'#fff',3);c.strokeStyle='#e4eef5';c.lineWidth=4;c.beginPath();c.arc(480,455,395,Math.PI*1.2,Math.PI*1.8);c.stroke();label(c,'OUTFIELD',480,40,19);label(c,'HOME',480,505,17);label(c,'1ST',724,275,15);label(c,'2ND',480,65,15);label(c,'3RD',233,275,15);
 bases.forEach(p=>{c.save();c.translate(p.x,p.y);c.rotate(Math.PI/4);c.fillStyle='white';c.fillRect(-10,-10,20,20);c.restore()});c.fillStyle='white';c.beginPath();c.moveTo(470,449);c.lineTo(490,449);c.lineTo(490,460);c.lineTo(480,469);c.lineTo(470,460);c.closePath();c.fill();
 const s=g.softball,def=1-s.batting;let selected=0;if(s.hit){let best=1e9;s.fielders.forEach((p,i)=>{const d=Math.hypot(p.x-s.hit.to.x,p.y-s.hit.to.y);if(d<best){best=d;selected=i}})}
 s.fielders.forEach((p,i)=>person(c,p,def,i+1,session.side===def&&i===selected));s.bases.forEach((on,i)=>{if(on)person(c,{x:bases[i].x-15,y:bases[i].y+20},s.batting,'R')});
 const batter={x:450,y:450};person(c,batter,s.batting,'B',session.side===s.batting);const angle=s.swing>0?-1.2:.3;line(c,462,445,462+Math.cos(angle)*45,445+Math.sin(angle)*45,'#85582d',7);
 if(s.phase==='pitch'){const t=Math.min(1.12,s.pitch.t/s.pitch.duration),bend=s.pitch.kind==='curve'?Math.sin(t*Math.PI)*30:0;ball(c,480+bend,285+(455-285)*t,'softball')}
 if(s.phase==='hit'){const h=s.hit,t=Math.min(1,h.t/h.duration);ball(c,h.from.x+(h.to.x-h.from.x)*t,h.from.y+(h.to.y-h.from.y)*t,'softball',Math.sin(t*Math.PI)*(h.quality>.6?90:30));s.runners.forEach(r=>person(c,{x:r.from.x+(r.to.x-r.from.x)*r.t,y:r.from.y+(r.to.y-r.from.y)*r.t},s.batting,'R'));}
 else if(s.phase==='ready')ball(c,480,275,'softball');
 const aim=480+s.aim*80;line(c,480,450,aim,390,'#ffe06a',3);
}
const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
document.addEventListener('keydown',e=>{if(!session||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(k){e.preventDefault();input(k,true)}else if(!e.repeat&&(e.key===' '||e.key.toLowerCase()==='e')){e.preventDefault();sendAction(e.key===' '?'primary':'secondary')}});
document.addEventListener('keyup',e=>{const k=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(k)input(k,false)});
window.addEventListener('blur',()=>{if(session)session.inputs[session.side]={}});window.addEventListener('pagehide',stop);
window.TownSports={open,stop};
window.rzBasketball=()=>open('basketball');window.rzFootball=()=>open('football');window.rzSoftball=()=>open('softball');
