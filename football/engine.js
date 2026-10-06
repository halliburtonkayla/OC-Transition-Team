// Football simulation in yards. Host advances a fixed 60 Hz clock; guests send inputs.
export const WIDTH=53.333, QUARTER=90;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const direction=g=>g.offense===0?1:-1;
const player=(x,y,n,role)=>({x,y,vx:0,vy:0,n,role,stamina:1,cool:0});
export function createGame(teams=['462','558'],cpu=true){
 const g={version:1,teams:[...teams],cpu,score:[0,0],quarter:1,clock:QUARTER,time:0,offense:0,line:25,target:35,down:1,phase:'ready',playClock:25,playTime:0,delay:0,carrier:0,defender:0,flight:null,thrown:false,returning:false,formation:'slants',message:'Your offense starts at the 25. Tap SNAP to start the play.',playId:0,stats:[{yards:0,passes:0,completions:0,tackles:0},{yards:0,passes:0,completions:0,tackles:0}],kick:0};
 setup(g);return g;
}
export function setup(g){
 const d=direction(g),x=g.line;
 const off=[[-5,26.7,7,'QB'],[-1,5,11,'A'],[-1,15,18,'B'],[-1,48,81,'C'],[-1,38,88,'TE'],[-8,29,22,'RB'],[-.5,21.5,72,'OL'],[-.5,24,66,'OL'],[-.5,26.7,55,'OL'],[-.5,29.3,64,'OL'],[-.5,32,75,'OL']];
 const def=[[7,27,54,'LB'],[4,6,21,'CB'],[5,16,24,'CB'],[4,47,23,'CB'],[17,36,31,'S'],[9,40,45,'LB'],[1.5,21.5,91,'DL'],[1.5,24,93,'DL'],[1.5,26.7,99,'DL'],[1.5,29.3,94,'DL'],[1.5,32,90,'DL']];
 g.attack=off.map(([dx,y,n,r])=>player(clamp(x+dx*d,-8,108),y,n,r));g.defense=def.map(([dx,y,n,r])=>player(clamp(x+dx*d,-8,108),y,n,r));g.carrier=0;g.defender=0;g.flight=null;g.thrown=false;g.returning=false;g.playTime=0;g.playClock=25;g.phase='ready';g.playId++;
}
function possession(g,side,spot){g.offense=side;g.line=clamp(spot,1,99);g.target=clamp(g.line+direction(g)*10,0,100);g.down=1;}
function clockBoundary(g){
 if(g.clock>0||g.quarter>4)return;
 if(g.quarter<4){g.quarter++;g.clock=QUARTER;g.message+=' Quarter '+g.quarter+'.';}
 else if(g.score[0]===g.score[1]){g.quarter=5;g.clock=0;g.message+=' Sudden-death overtime: next score wins.';}
 else{g.phase='final';g.message='FINAL — '+(g.score[0]>g.score[1]?'Home':'Away')+' wins!';}
}
function dead(g,msg){g.message=msg;g.phase='dead';g.delay=2.2;g.flight=null;clockBoundary(g);}
function score(g,side,points,msg){g.score[side]+=points;if(g.quarter>4){g.phase='final';g.message=msg+' Overtime winner!';return;}possession(g,1-side,side===0?75:25);dead(g,msg+' Opponent starts at its 25.');}
export function endPlay(g,reason='Tackled',incomplete=false){
 if(!['live','flight'].includes(g.phase))return;
 const d=direction(g),old=g.line,p=g.attack[g.carrier],spot=incomplete?old:clamp(p.x,0,100),yards=(spot-old)*d;
 if(!incomplete&&!g.returning)g.stats[g.offense].yards+=Math.round(yards);
 if(!incomplete&&(d===1?p.x<=0:p.x>=100)){score(g,1-g.offense,2,'SAFETY! Two points.');return;}
 if(g.returning){g.line=spot;g.target=clamp(spot+d*10,0,100);g.down=1;}
 else if((spot-g.target)*d>=-.001&&!incomplete){g.line=spot;g.down=1;g.target=clamp(spot+d*10,0,100);reason+=' · FIRST DOWN';}
 else{g.line=spot;g.down++;if(g.down>4){possession(g,1-g.offense,spot);reason='TURNOVER ON DOWNS';}}
 dead(g,reason+(incomplete?' · Incomplete pass.':` · ${Math.round(yards)} yards.`));
}
function snap(g){g.phase='live';g.playTime=0;g.message='Ball is live. Run, hand off, or pass to A, B, or C.';}
export const ACTIONS=['snap','a','b','c','handoff','juke','tackle','switch','slants','deep','run','punt','fieldgoal','kick'];
export function action(g,side,a){
 if(!ACTIONS.includes(a)||g.phase==='final')return;
 const offense=side===g.offense,d=direction(g);
 if(g.phase==='ready'){
  if(!offense){if(a==='switch')g.defender=(g.defender+1)%11;return;}
  if(['slants','deep','run'].includes(a)){g.formation=a;g.message={slants:'Slants: receivers cut toward the middle.',deep:'Deep: receivers run downfield.',run:'Run: hand off and follow your blockers.'}[a];return;}
  if(a==='snap'){snap(g);return;}
  if(a==='punt'){g.phase='kickflight';g.flight={kind:'punt',x:g.line,y:27,tx:clamp(g.line+42*d,-2,102),ty:27,t:0,duration:1.8};g.message='Punt in the air…';return;}
  if(a==='fieldgoal'){g.phase='kickmeter';g.kick=0;g.message='Tap KICK when the marker reaches the gold center.';return;}
 }
 if(g.phase==='kickmeter'&&offense&&a==='kick'){
  const range=(d===1?100-g.line:g.line)+17,good=Math.abs(Math.sin(g.kick*2.5))<.24&&range<=55;
  g.phase='kickflight';g.flight={kind:'fieldgoal',good,x:g.line,y:27,tx:d===1?107:-7,ty:27,t:0,duration:1.6};g.message='Field goal attempt…';return;
 }
 if(!['live','flight'].includes(g.phase))return;
 if(!offense){
  if(a==='switch'){const ball=g.flight?{x:g.flight.tx,y:g.flight.ty}:g.attack[g.carrier];g.defender=g.defense.reduce((best,p,i)=>distance(p,ball)<distance(g.defense[best],ball)?i:best,0);}
  if(a==='tackle'){const p=g.defense[g.defender];if(p.cool>0)return;p.cool=.9;const target=g.attack[g.carrier];if(!g.flight&&distance(p,target)<3.4&&g.playTime>.5){g.stats[side].tackles++;endPlay(g,'TACKLE');}else{p.x=clamp(p.x+p.vx*.16,-9,109);p.y=clamp(p.y+p.vy*.16,-.5,WIDTH+.5);}}
  return;
 }
 if(g.phase!=='live'||g.flight)return;
 const p=g.attack[g.carrier];
 if(a==='juke'&&p.cool<=0&&p.stamina>.2){p.cool=.9;p.stamina-=.2;p.y=clamp(p.y+(p.vy>=0?-2.5:2.5),.2,WIDTH-.2);g.message='Juke! Find open grass.';}
 if(a==='handoff'&&g.carrier===0&&!g.thrown&&distance(p,g.attack[5])<8){g.carrier=5;g.message='Handoff! You control the running back.';}
 if(['a','b','c'].includes(a)&&g.carrier===0&&!g.thrown){
  if((p.x-g.line)*d>0){g.message='Past the blue line — run the ball!';return;}
  const target={a:1,b:2,c:3}[a],r=g.attack[target],duration=clamp(distance(p,r)/38,.4,1.2);
  g.flight={kind:'pass',x:p.x,y:p.y,tx:clamp(r.x+r.vx*duration,-4,104),ty:clamp(r.y+r.vy*duration,1,WIDTH-1),t:0,duration,target};g.phase='flight';g.thrown=true;g.stats[side].passes++;g.message='Pass to '+a.toUpperCase()+'!';
 }
}
function move(p,x,y,speed,dt){const n=Math.max(1,Math.hypot(x,y));const tx=x/n*speed,ty=y/n*speed,k=Math.min(1,dt*12);p.vx+=(tx-p.vx)*k;p.vy+=(ty-p.vy)*k;p.x=clamp(p.x+p.vx*dt,-9,109);p.y=clamp(p.y+p.vy*dt,-1,WIDTH+1);}
function chase(p,t,speed,dt){const dx=t.x-p.x,dy=t.y-p.y,n=Math.hypot(dx,dy);move(p,n>.3?dx/n:0,n>.3?dy/n:0,speed,dt);}
function control(p,input={},speed,dt){const x=Number.isFinite(input.x)?clamp(input.x,-1,1):0,y=Number.isFinite(input.y)?clamp(input.y,-1,1):0,sprint=!!input.sprint&&p.stamina>.03;move(p,x,y,speed*(sprint?1.25:1),dt);p.stamina=clamp(p.stamina+(sprint?-.2:.14)*dt,0,1);}
function resolvePass(g){
 const q=g.flight,t={x:q.tx,y:q.ty},r=g.attack[q.target];let closest=-1,best=2.3;
 g.defense.forEach((p,i)=>{const n=distance(p,t);if(n<best){best=n;closest=i;}});
 if(closest>=0&&best<distance(r,t)+.45){
  const previous=g.attack;g.attack=g.defense;g.defense=previous;g.offense=1-g.offense;g.carrier=closest;g.defender=0;g.returning=true;g.thrown=true;g.line=clamp(t.x,1,99);g.target=clamp(g.line+direction(g)*10,0,100);g.down=1;g.phase='live';g.flight=null;
  if(t.x<=0||t.x>=100){possession(g,g.offense,g.offense===0?20:80);dead(g,'INTERCEPTION · Touchback.');}else g.message='INTERCEPTED! Return the ball toward your end zone!';return;
 }
 if(distance(r,t)<3.6){g.carrier=q.target;g.stats[g.offense].completions++;g.phase='live';g.flight=null;g.message='CAUGHT! You control the receiver. Run!';}
 else endPlay(g,'Pass hits the turf',true);
}
export function updateGame(g,inputs,dt){
 dt=clamp(dt,0,.05);if(g.phase==='final')return;g.time+=dt;
 if(g.phase==='dead'){g.delay-=dt;if(g.delay<=0)setup(g);return;}
 if(g.phase==='ready'){g.playClock-=dt;if(g.cpu&&g.offense===1&&g.playClock<23){g.formation='slants';snap(g);}else if(g.playClock<=0){g.line=clamp(g.line-direction(g)*5,1,99);dead(g,'Delay of game · Five-yard penalty.');}return;}
 if(g.phase==='kickmeter'){g.kick+=dt;if(g.kick>8){g.phase='ready';g.message='Kick canceled. Choose a play.';}return;}
 if(g.phase==='kickflight'){
  const q=g.flight;q.t+=dt;if(q.t<q.duration)return;
  if(q.kind==='fieldgoal'&&q.good){score(g,g.offense,3,'FIELD GOAL! Three points.');return;}
  const side=1-g.offense,spot=q.kind==='punt'?q.tx:g.line;
  possession(g,side,spot<=0||spot>=100?(side===0?20:80):spot);dead(g,q.kind==='punt'?'Punt · Possession changes.':'Field goal missed · Possession changes.');return;
 }
 if(g.quarter<=4)g.clock=Math.max(0,g.clock-dt);g.playTime+=dt;
 for(const p of [...g.attack,...g.defense])p.cool=Math.max(0,p.cool-dt);
 const d=direction(g),carrier=g.attack[g.carrier],cpuOff=g.cpu&&g.offense===1;
 if(cpuOff){
  const danger=g.defense.reduce((a,p)=>distance(p,carrier)<distance(a,carrier)?p:a,g.defense[0]);
  const avoid=distance(danger,carrier)<7?(carrier.y<danger.y?-1:1)*.65:Math.sin(g.playTime*.8)*.2;
  if(g.carrier===0&&!g.thrown&&g.playTime>2.2){const best=[1,2,3].sort((a,b)=>Math.min(...g.defense.map(p=>distance(p,g.attack[b])))-Math.min(...g.defense.map(p=>distance(p,g.attack[a]))))[0];action(g,1,['','a','b','c'][best]);}
  control(carrier,{x:g.carrier===0&&g.playTime<2.4?0:d,y:avoid},6.4,dt);
 }else control(carrier,inputs[g.offense],7.7,dt);
 for(let i=0;i<11;i++){
  const p=g.attack[i];if(i===g.carrier)continue;
  if(g.returning){const target=g.defense[i];chase(p,target,4.7,dt);continue;}
  if(i>=6||i===4||(i===5&&g.carrier!==0)){
   const threat=g.defense.reduce((best,q)=>distance(p,q)<distance(p,best)?q:best,g.defense[0]);chase(p,threat,4.2,dt);
  }else if(i===5)chase(p,{x:g.line-4*d,y:31},5,dt);
  else if(i>0){let dy=0;if(g.formation==='slants'&&g.playTime>1)dy=i===3?-1:.65;else if(g.formation==='run')dy=i===3?-.2:.2;move(p,d,dy,6.3,dt);p.y=clamp(p.y,2,WIDTH-2);p.x=clamp(p.x,-4,104);}
 }
 const cpuDef=g.cpu&&g.offense===0;
 for(let i=0;i<11;i++){
  const p=g.defense[i];if(i===g.defender&&!cpuDef){control(p,inputs[1-g.offense],8.1,dt);continue;}
  let target=carrier,speed=5.6;
  if(!g.returning&&g.carrier===0&&!g.thrown&&i>=1&&i<=4){target=g.attack[i];speed=5.2;}
  if(g.flight){target=i>=1&&i<=4?{x:g.flight.tx,y:g.flight.ty}:carrier;}
  const blocker=g.attack.some((b,n)=>n!==g.carrier&&n>=4&&distance(p,b)<2.1);
  if(blocker)speed*=.23;
  chase(p,target,speed,dt);
 }
 if(g.flight){g.flight.t+=dt;if(g.flight.t>=g.flight.duration)resolvePass(g);return;}
 const p=g.attack[g.carrier];
 if(d===1?p.x>=100:p.x<=0){score(g,g.offense,7,'TOUCHDOWN! Six points + automatic extra point.');return;}
 if(p.y<=0||p.y>=WIDTH){endPlay(g,'Out of bounds');return;}
 if(g.playTime>.65&&p.cool<.45&&g.defense.some(q=>distance(p,q)<1.4)){g.stats[1-g.offense].tackles++;endPlay(g,'Tackled');return;}
 if(g.playTime>25)endPlay(g,'Whistle');
}
export function validState(g){
 const finite=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
 const players=a=>Array.isArray(a)&&a.length===11&&a.every(p=>p&&finite(p.x,-12,112)&&finite(p.y,-2,56)&&finite(p.vx,-30,30)&&finite(p.vy,-30,30)&&finite(p.n,0,99)&&finite(p.stamina,0,1)&&finite(p.cool,0,2)&&typeof p.role==='string'&&p.role.length<5);
 const stats=a=>Array.isArray(a)&&a.length===2&&a.every(s=>s&&finite(s.yards,-100000,100000)&&['passes','completions','tackles'].every(k=>Number.isInteger(s[k])&&finite(s[k],0,100000)));
 return !!(g&&g.version===1&&stats(g.stats)&&typeof g.cpu==='boolean'&&typeof g.thrown==='boolean'&&typeof g.returning==='boolean'&&['slants','deep','run'].includes(g.formation)&&Array.isArray(g.teams)&&g.teams.length===2&&g.teams.every(t=>typeof t==='string'&&/^\d{1,5}$/.test(t))&&Array.isArray(g.score)&&g.score.length===2&&g.score.every(n=>Number.isInteger(n)&&n>=0&&n<=999)&&[0,1].includes(g.offense)&&Number.isInteger(g.carrier)&&finite(g.carrier,0,10)&&Number.isInteger(g.defender)&&finite(g.defender,0,10)&&finite(g.time,0,1e7)&&finite(g.line,0,100)&&finite(g.target,0,100)&&finite(g.down,1,4)&&finite(g.quarter,1,5)&&finite(g.clock,0,90)&&finite(g.playClock,-1,25)&&finite(g.playTime,0,26)&&finite(g.kick,0,9)&&Number.isInteger(g.playId)&&['ready','live','flight','dead','final','kickmeter','kickflight'].includes(g.phase)&&typeof g.message==='string'&&g.message.length<250&&players(g.attack)&&players(g.defense)&&(!g.flight||(['pass','punt','fieldgoal'].includes(g.flight.kind)&&finite(g.flight.x,-12,112)&&finite(g.flight.y,-2,56)&&finite(g.flight.tx,-12,112)&&finite(g.flight.ty,-2,56)&&finite(g.flight.t,0,3)&&finite(g.flight.duration,.1,2)&& (g.flight.kind!=='pass'||[1,2,3].includes(g.flight.target)))));
}
