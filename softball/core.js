// Host-authoritative softball simulation. Coordinates are meters, +z toward center field.
export const BASES = [{x:0,z:0},{x:12.93,z:12.93},{x:0,z:25.86},{x:-12.93,z:12.93},{x:0,z:0}];
export const FENCE = 64;
export const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const homes=[[0,13.1],[0,-1.4],[14.1,14.1],[8,25],[-8,25],[-14,14],[-28,41],[0,49],[28,41]];
const fielders=()=>homes.map(([x,z])=>({x,z,y:0,heading:Math.PI,moving:false}));
const number=v=>typeof v==='number'&&Number.isFinite(v);
export function createGame({innings=3,cpu=true}={}) {
 return {version:2,time:0,innings:[1,3,7].includes(innings)?innings:3,cpu,inning:1,batting:0,
  scores:[0,0],outs:0,balls:0,strikes:0,bases:[false,false,false],phase:'ready',clock:0,
  aim:0,pitchAim:{x:0,y:1},pitchKind:'fast',pitchId:0,pitch:null,ball:{x:0,y:.9,z:13.1},
  fielders:fielders(),selected:0,holder:0,throw:null,runners:[],swing:0,batStyle:'contact',
  pendingRuns:0,playOuts:0,forceThird:false,bounced:false,liveTime:0,settle:0,finished:false,
  message:'Player 1 bats. Player 2 pitches. Watch the yellow ball approach home plate.',event:0};
}
function say(g,message){g.message=message;g.event++;}
function result(g,message){g.phase='result';g.clock=0;say(g,message);}
function resetCount(g){g.balls=0;g.strikes=0;}
function strike(g,message,foul=false){
 if(!foul||g.strikes<2)g.strikes++;
 if(g.strikes===3){g.outs++;resetCount(g);result(g,'Strikeout! '+g.outs+' out'+(g.outs===1?'':'s')+'.');}
 else result(g,message+' '+g.balls+' balls, '+g.strikes+' strikes.');
}
function walk(g){
 if(g.bases[0]) {if(g.bases[1]) {if(g.bases[2])g.scores[g.batting]++;g.bases[2]=true;}g.bases[1]=true;}
 g.bases[0]=true;resetCount(g);result(g,'Ball four. Walk — batter takes first.');checkWalkoff(g);
}
function checkWalkoff(g){if(g.batting===1&&g.inning>=g.innings&&g.scores[1]>g.scores[0])finish(g);}
function finish(g){g.finished=true;g.phase='finished';say(g,'Player '+(g.scores[0]>g.scores[1]?1:2)+' wins!');}
function nextPitch(g){
 if(g.outs>=3){
  g.bases=[false,false,false];g.outs=0;resetCount(g);
  if(g.batting===0){if(g.inning>=g.innings&&g.scores[1]>g.scores[0])return finish(g);g.batting=1;}
  else {if(g.inning>=g.innings&&g.scores[0]!==g.scores[1])return finish(g);g.batting=0;g.inning++;}
  say(g,(g.batting?'Bottom':'Top')+' of inning '+g.inning+'. Player '+(g.batting+1)+' bats.');
 } else say(g,'Ready. Player '+(g.batting+1)+' bats; Player '+(2-g.batting)+' pitches.');
 g.phase='ready';g.clock=0;g.pitch=null;g.ball={x:0,y:.9,z:13.1};g.holder=0;g.selected=0;
 g.fielders=fielders();g.runners=[];g.throw=null;g.pendingRuns=0;g.playOuts=0;g.forceThird=false;g.settle=0;
}
function nearest(g,target){let best=Infinity,index=0;g.fielders.forEach((p,i)=>{const d=distance(p,target);if(d<best){best=d;index=i;}});return index;}
function pitch(g){
 const durations={fast:1.02,change:1.52,drop:1.22};
 g.pitch={id:++g.pitchId,t:0,windup:.85,duration:durations[g.pitchKind],kind:g.pitchKind,x:g.pitchAim.x,y:g.pitchAim.y,swung:false};
 g.phase='pitch';g.clock=0;g.holder=null;say(g,'Pitch coming — watch it reach the plate!');
}
function contact(g,timing,power){
 const p=g.pitch,quality=clamp(1-Math.abs(timing)/.2,0,1);
 const angle=g.aim*.67+timing*2.6;
 if(Math.abs(angle)>Math.PI/4){g.ball={x:0,z:0,y:1,vx:Math.sin(angle)*18,vz:Math.cos(angle)*18,vy:8};g.phase='foul';g.clock=0;return say(g,'Foul ball!');}
 const speed=(power?24:18)+quality*(power?12:9),elevation=power?.58:.16+quality*.10;
 g.ball={x:0,z:0,y:p.y,vx:Math.sin(angle)*speed*Math.cos(elevation),vz:Math.cos(angle)*speed*Math.cos(elevation),vy:speed*Math.sin(elevation)};
 g.phase='live';g.clock=0;g.liveTime=0;g.bounced=false;g.holder=null;g.pendingRuns=0;g.playOuts=0;g.forceThird=false;g.settle=0;
 const flight=(g.ball.vy+Math.sqrt(g.ball.vy**2+19.62*g.ball.y))/9.81;
 g.landing={x:clamp(g.ball.vx*flight,-52,52),z:clamp(g.ball.vz*flight,0,61)};
 g.selected=nearest(g,g.landing);
 let force=true;g.runners=[{start:0,progress:0,target:1,forced:true,out:false,scored:false}];
 for(let i=0;i<3;i++){force=force&&g.bases[i];if(g.bases[i])g.runners.push({start:i+1,progress:i+1,target:i+2,forced:force,out:false,scored:false});}
 say(g,quality>.8?'Solid contact! Defense: chase the landing ring.':'Ball in play! Run to first.');resetCount(g);
}
export function act(g,side,name,meta={}){
 if(g.finished||![0,1].includes(side))return;
 const batting=side===g.batting;
 if(name==='style'&&batting&&g.phase==='ready')g.batStyle=g.batStyle==='power'?'contact':'power';
 if(name.startsWith('kind-')&&!batting&&g.phase==='ready'&&['fast','change','drop'].includes(name.slice(5)))g.pitchKind=name.slice(5);
 if(name==='pitch'&&!batting&&g.phase==='ready')pitch(g);
 if(name==='swing'&&batting&&g.phase==='pitch'&&!g.pitch.swung){
  g.pitch.swung=true;g.swing=.38;const p=g.pitch;
  // A guest's visible pitch clock may trail the host. Accept at most 300 ms of history.
  const seen=meta.pitchId===p.id&&number(meta.pitchT)?clamp(meta.pitchT,p.t-.3,p.t):p.t;
  const timing=seen-p.windup-p.duration;
  if(Math.abs(timing)>.2||Math.abs(p.x)>.66||p.y<.3||p.y>1.85){strike(g,timing<0?'Swung too early.':'Swing and miss.');return;}
  contact(g,timing,g.batStyle==='power');
 }
 if(name==='advance'&&batting&&['live','throw'].includes(g.phase)){
  for(const r of g.runners)if(!r.out&&!r.scored)r.target=Math.min(4,r.target+1);g.settle=0;say(g,'Runners advancing! Defense: throw to a base.');
 }
 if(name==='hold'&&batting&&['live','throw'].includes(g.phase)){
  for(const r of g.runners)if(!r.out&&!r.scored)r.target=Math.max(r.start+1,Math.ceil(r.progress-1e-6));say(g,'Hold at the next base.');
 }
 if(name==='switch'&&!batting&&g.phase==='live'&&g.holder===null)g.selected=nearest(g,g.ball.y>2?g.landing:g.ball);
 if(name.startsWith('throw-')&&!batting&&g.phase==='live'&&g.holder!==null){
  const base=Number(name.slice(6));if(![1,2,3,4].includes(base))return;
  const f=g.fielders[g.holder],to=BASES[base];g.throw={base,from:{x:f.x,y:1.5,z:f.z},to:{...to,y:1.1},t:0,duration:.22+distance(f,to)/24,by:g.holder};
  g.holder=null;g.phase='throw';g.settle=0;say(g,'Throw to '+(base===4?'home!':base+'!'));
 }
}
export function runnerPosition(r){const i=Math.min(3,Math.floor(r.progress)),t=r.progress-i;return {x:BASES[i].x+(BASES[i+1].x-BASES[i].x)*t,z:BASES[i].z+(BASES[i+1].z-BASES[i].z)*t};}
function move(p,x,z,speed,dt){const d=Math.hypot(x,z);p.moving=d>.05;if(d){p.x=clamp(p.x+x/d*speed*dt,-68,68);p.z=clamp(p.z+z/d*speed*dt,-4,70);p.heading=Math.atan2(x,z);}}
function chase(p,to,speed,dt){const d=distance(p,to);if(d<.15){p.moving=false;return;}move(p,to.x-p.x,to.z-p.z,Math.min(speed,d/dt),dt);}
function runnersTick(g,dt,speed=5.4){
 for(const r of g.runners){if(r.out||r.scored)continue;r.progress=Math.min(r.target,r.progress+speed*dt/18.286);if(r.progress>=4){r.scored=true;g.pendingRuns++;}}
}
function completePlay(g,message){
 const runs=g.forceThird?0:g.pendingRuns;g.scores[g.batting]+=runs;g.pendingRuns=0;g.bases=[false,false,false];
 for(const r of g.runners)if(!r.out&&!r.scored){const base=Math.min(3,Math.max(1,Math.floor(r.progress+.001)));g.bases[base-1]=true;}
 result(g,message+(runs?' '+runs+' run'+(runs===1?'':'s')+' scored.':''));checkWalkoff(g);
}
function throwArrives(g){
 const t=g.throw,base=t.base;g.ball={...t.to};
 const receiving=base===1?2:base===2?3:base===3?5:1;
 g.holder=receiving;g.selected=receiving;g.fielders[receiving].x=t.to.x;g.fielders[receiving].z=t.to.z;g.phase='live';g.throw=null;
 const r=g.runners.find(r=>!r.out&&!r.scored&&r.target>=base&&r.progress<base-.008&&(r.forced&&r.start===base-1&&g.runners.filter(other=>other.start<r.start).every(other=>!other.out)));
 if(r){r.out=true;g.outs++;g.playOuts++;if(g.outs>=3){g.forceThird=true;completePlay(g,'Force out! Three outs — switch sides.');return;}say(g,'Out at '+(base===4?'home':base)+'! '+g.outs+' out'+(g.outs===1?'':'s')+'.');}
 else say(g,'Ball at '+(base===4?'home':base)+'. Watch the runners!');
}
function liveTick(g,inputs,dt){
 g.liveTime+=dt;runnersTick(g,dt);
 const def=1-g.batting,keys=inputs[def]||{},cpu=g.cpu&&def===1;
 for(const p of g.fielders)p.moving=false;
 if(g.holder===null&&g.phase==='live'){
  const target=g.ball.y>2&&!g.bounced?g.landing:g.ball;
  if(cpu){g.selected=nearest(g,target);chase(g.fielders[g.selected],target,6.1,dt);}
  else move(g.fielders[g.selected],(keys.right?1:0)-(keys.left?1:0),(keys.up?1:0)-(keys.down?1:0),6.8,dt);
 }
 // Teammates cover the bases; the highlighted fielder remains under player control.
 for(const [i,b] of [[2,1],[3,2],[5,3],[1,4]])if(i!==g.selected&&i!==g.holder)chase(g.fielders[i],BASES[b],5,dt);
 if(g.phase==='throw'){
  const t=g.throw;t.t+=dt;const u=clamp(t.t/t.duration,0,1);g.ball={x:t.from.x+(t.to.x-t.from.x)*u,z:t.from.z+(t.to.z-t.from.z)*u,y:t.from.y+(t.to.y-t.from.y)*u+Math.sin(u*Math.PI)*1.5};
  if(u===1)throwArrives(g);if(g.phase==='result')return;
 } else if(g.holder===null){
  const b=g.ball,oldR=Math.hypot(b.x,b.z);b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;b.vy-=9.81*dt;
  if(b.y<=.12){b.y=.12;g.bounced=true;b.vy=Math.abs(b.vy)>.8?-b.vy*.38:0;const drag=Math.max(0,1-2.0*dt);b.vx*=drag;b.vz*=drag;}
  const radius=Math.hypot(b.x,b.z);
  if(radius>=FENCE&&oldR<FENCE){
   if(b.y>2.4&&!g.bounced){g.phase='homer';g.clock=0;for(const r of g.runners)r.target=4;return say(g,'HOME RUN! Round the bases!');}
   const k=(FENCE-.3)/radius;b.x*=k;b.z*=k;b.vx*=-.25;b.vz*=-.25;g.bounced=true;say(g,'Off the fence!');
  }
  // Catch or pickup requires a real collision with the ball, not a distance-based result.
  for(let i=0;i<g.fielders.length;i++){const f=g.fielders[i];if(g.liveTime>.32&&b.y<2.5&&distance(f,b)<1.3){
   if(!g.bounced&&b.vy<0){g.outs++;g.runners=[];result(g,'Fly ball caught! '+g.outs+' out'+(g.outs===1?'':'s')+'. Runners return.');return;}
   if(g.bounced&&b.y<1.2){g.holder=i;g.selected=i;g.pickupTime=g.time;g.settle=0;say(g,'Ball secured! Choose a base to throw.');break;}
  }}
 } else {
  const f=g.fielders[g.holder];g.ball={x:f.x,y:1.2,z:f.z};
  // A runner attempting an extra base must be tagged at that base (no invented force out).
  for(const r of g.runners)if(!r.out&&!r.scored&&r.progress<r.target&&distance(f,runnerPosition(r))<.85){
   r.out=true;g.outs++;g.playOuts++;say(g,'Tagged out! '+g.outs+' outs.');if(g.outs>=3){completePlay(g,'Tagged out — three outs.');return;}
  }
  if(cpu&&g.time-(g.pickupTime||0)>.35){
   const runner=g.runners.filter(r=>!r.out&&!r.scored&&r.progress<r.target).sort((a,b)=>b.progress-a.progress)[0];
   if(runner)act(g,def,'throw-'+Math.min(4,Math.ceil(runner.progress+.05)));
  }
 }
 if(g.cpu&&g.batting===1&&g.liveTime>1.4&&g.holder===null&&g.phase==='live'&&Math.hypot(g.ball.x,g.ball.z)>38)for(const r of g.runners)r.target=Math.min(4,r.start+2);
 const stopped=g.runners.every(r=>r.out||r.scored||r.progress>=r.target);
 g.settle=stopped&&g.holder!==null&&g.phase==='live'?g.settle+dt:0;
 if(g.settle>1.25||g.liveTime>22)completePlay(g,g.playOuts?'Play complete. '+g.outs+' outs.':'Safe! Runners hold their bases.');
}
export function tick(g,inputs,dt){
 if(g.finished)return;dt=clamp(dt,0,.04);g.time+=dt;g.clock+=dt;g.swing=Math.max(0,g.swing-dt);
 if(g.phase==='ready'){
  const attack=inputs[g.batting]||{},def=inputs[1-g.batting]||{};
  g.aim=clamp(g.aim+((attack.right?1:0)-(attack.left?1:0))*dt,-1,1);
  g.pitchAim.x=clamp(g.pitchAim.x+((def.right?1:0)-(def.left?1:0))*dt,-.9,.9);
  g.pitchAim.y=clamp(g.pitchAim.y+((def.up?1:0)-(def.down?1:0))*dt,.2,1.9);
  if(g.cpu&&g.batting===0&&g.clock>2.4){g.pitchKind=['fast','change','drop'][g.pitchId%3];g.pitchAim={x:Math.sin(g.pitchId*2.7)*.48,y:.9+Math.sin(g.pitchId)*.4};pitch(g);}
 } else if(g.phase==='pitch'){
  const p=g.pitch;p.t+=dt;const u=clamp((p.t-p.windup)/p.duration,0,1.3);
  const curve=p.kind==='drop'?Math.sin(Math.min(1,u)*Math.PI)*.5:0;
  g.ball={x:p.x*u,y:Math.max(.1,.7+(p.y-.7)*u+Math.sin(Math.min(1,u)*Math.PI)*.45+curve),z:13.1*(1-u)};
  if(g.cpu&&g.batting===1&&!p.swung&&p.t>=p.windup+p.duration-.07+Math.sin(g.pitchId*1.8)*.1){g.aim=Math.sin(g.pitchId*1.7)*.9;g.batStyle=g.pitchId%3===0?'power':'contact';act(g,1,'swing');}
  if(g.phase==='pitch'&&p.t>p.windup+p.duration+.32){
   if(Math.abs(p.x)<=.3&&p.y>=.5&&p.y<=1.5)strike(g,'Called strike.');
   else {g.balls++;if(g.balls===4)walk(g);else result(g,'Ball '+g.balls+'. Outside the strike zone.');}
  }
 } else if(['live','throw'].includes(g.phase))liveTick(g,inputs,dt);
 else if(g.phase==='foul'){
  g.ball.x+=g.ball.vx*dt;g.ball.z+=g.ball.vz*dt;g.ball.y=Math.max(.1,g.ball.y+g.ball.vy*dt);g.ball.vy-=9.81*dt;
  if(g.clock>1.4)strike(g,'Foul ball.',true);
 } else if(g.phase==='homer'){runnersTick(g,dt,11);if(g.runners.every(r=>r.scored||r.out))completePlay(g,'Home run!');}
 else if(g.phase==='result'&&g.clock>2.3)nextPitch(g);
}
export function validState(g){
 if(!g||g.version!==2||!number(g.time)||!['ready','pitch','live','throw','foul','homer','result','finished'].includes(g.phase)||![0,1].includes(g.batting))return false;
 if(!Array.isArray(g.scores)||g.scores.length!==2||!g.scores.every(v=>number(v)&&v>=0)||!Array.isArray(g.fielders)||g.fielders.length!==9||!g.fielders.every(p=>number(p.x)&&number(p.z)))return false;
 return typeof g.message==='string'&&g.message.length<300&&g.ball&&['x','y','z'].every(k=>number(g.ball[k]))&&Array.isArray(g.runners)&&g.runners.length<=4&&g.runners.every(r=>number(r.progress)&&r.progress>=0&&r.progress<=4)&&Array.isArray(g.bases)&&g.bases.length===3;
}
