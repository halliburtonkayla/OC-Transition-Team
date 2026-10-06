// Shared host simulation. Guests send controls; only the host advances a game.
export const SPORTS = ['basketball', 'football', 'softball'];
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const dist = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const point=(x,y)=>({x,y});
function move(p,input,speed,dt,bounds=[100,860,90,450]){
 const x=(input?.right?1:0)-(input?.left?1:0),y=(input?.down?1:0)-(input?.up?1:0),n=Math.hypot(x,y)||1;
 p.x=clamp(p.x+x/n*speed*dt,bounds[0],bounds[1]);p.y=clamp(p.y+y/n*speed*dt,bounds[2],bounds[3]);
}
function chase(p,target,speed,dt){const d=dist(p,target);if(d>1){p.x+=(target.x-p.x)/d*Math.min(d,speed*dt);p.y+=(target.y-p.y)/d*Math.min(d,speed*dt)}}
export function createGame(sport){
 if(!SPORTS.includes(sport))throw Error('Unknown sport');
 const g={sport,time:0,scores:[0,0],message:'',finished:false,cpu:true};
 if(sport==='basketball')g.basket={players:[point(300,300),point(610,280)],owner:0,shot:null,loose:null,cool:0,reset:0,ai:2.5,clock:24,jumps:[0,0],stealCooldown:[0,0],motion:[0,0]};
 if(sport==='football'){g.football={offense:0,down:1,line:210,target:350,carrier:0,playTime:0,delay:0,drives:0,flight:null};footballSetup(g)}
 if(sport==='softball')g.softball={inning:1,batting:0,outs:0,strikes:0,balls:0,bases:[false,false,false],phase:'ready',clock:0,pitch:null,hit:null,aim:0,fielders:fielders(),runners:[],swing:0};
 g.message=sport==='basketball'?'Player 1 has the ball. Shoot at the RIGHT hoop.':sport==='football'?'Player 1 has possession. Run or pass toward the RIGHT end zone.':'Top of inning 1. Player 1 bats; Player 2 pitches.';
 return g;
}
function fielders(){return [point(480,285),point(480,445),point(660,270),point(610,160),point(350,160),point(295,270),point(300,105),point(480,70),point(680,105)]}
export function action(g,side,name){
 if(g.finished){if(name==='restart')return createGame(g.sport);return g}
 if(name==='restart')return createGame(g.sport);
 if(g.sport==='basketball'){
  const b=g.basket,p=b.players[side];
  if(b.reset>0)return g;
  if(name==='primary'&&b.owner===side&&!b.shot&&b.cool<=0){
   const hoop=point(side===0?840:120,270),d=dist(p,hoop),def=b.players[1-side];
   const contested=dist(p,def)<85, blocked=dist(p,def)<65&&b.jumps[1-side]>0;
   const quality=clamp(1-d/850-(contested?.25:0),.12,.95);
   const made=!blocked&&Math.random()<quality;
   b.jumps[side]=.48;
   b.shot={from:{...p},to:{x:hoop.x,y:hoop.y+(made?0:(Math.random()<.5?-1:1)*(38+Math.random()*35))},t:0,duration:clamp(d/430,.55,1.35),side,points:d>245?3:2,made,blocked};
   b.owner=null;b.cool=.4;g.message=blocked?'Blocked! Chase the loose ball.':contested?'Contested shot!':'Shot in the air!';
  }else if(name==='primary'&&b.owner!==side&&b.jumps[side]<=0){
   b.jumps[side]=.65;
   if(b.shot&&b.shot.side!==side&&b.shot.t<.3&&dist(p,b.shot.from)<75){b.shot.made=false;b.shot.blocked=true;b.shot.to={x:p.x,y:p.y+55};g.message='Blocked! Chase the rebound.';}
  }
  if(name==='secondary'&&b.owner===1-side&&b.stealCooldown[side]<=0){
   b.stealCooldown[side]=.85;
   if(dist(p,b.players[1-side])<65&&b.cool<=0){b.owner=side;b.cool=.7;b.clock=24;g.message=`Player ${side+1} steals the ball!`;}
   else g.message='Move closer before trying to steal.';
  }
 }
 if(g.sport==='football'){
  const f=g.football;if(f.delay>0)return g;
  if(side===f.offense&&name.startsWith('pass')&&!f.flight){
   const receiver=name==='pass-left'?1:name==='pass-right'?3:2;
   if(f.carrier!==0){g.message='You caught it—run to the end zone!';return g}
   f.flight={from:{...f.attack[0]},to:{...f.attack[receiver]},receiver,t:0,duration:.5};g.message='Pass thrown!';
  }
  if(side!==f.offense&&(name==='primary'||name==='secondary')&&dist(f.defense[0],f.attack[f.carrier])<55)footballEndPlay(g,'Tackle!');
 }
 if(g.sport==='softball'){
  const s=g.softball;
  if(side!==s.batting&&name.startsWith('pitch')&&s.phase==='ready'){
   const kind=name==='pitch-change'?'changeup':name==='pitch-curve'?'curve':'fast';
   s.pitch={t:0,duration:kind==='changeup'?1.8:kind==='curve'?1.45:1.25,kind,swung:false};s.phase='pitch';s.clock=0;g.message=`${kind==='fast'?'Fast pitch':kind==='curve'?'Curveball':'Changeup'}! Watch the ball reach home plate.`;
  }
  if(side===s.batting&&name==='aim-left')s.aim=clamp(s.aim-.35,-1,1);
  if(side===s.batting&&name==='aim-right')s.aim=clamp(s.aim+.35,-1,1);
  if(side===s.batting&&name==='primary'){
   s.swing=.22;
   if(s.phase!=='pitch'||s.pitch.swung)return g;
   s.pitch.swung=true;const progress=s.pitch.t/s.pitch.duration,quality=1-Math.abs(progress-.9)/.19;
   if(quality<=0){softballStrike(g,'Swing and miss!');return g}
   const angle=-Math.PI/2+s.aim*.62,distance=110+quality*270;
   s.hit={from:point(480,455),to:point(480+Math.cos(angle)*distance,455+Math.sin(angle)*distance),t:0,duration:1.7,quality,distance,throw:false};s.phase='hit';s.clock=0;
   s.runners=[{from:point(480,450),to:point(685,265),t:0}];g.message=quality>.88?'Big hit! Watch it fly!':'Contact! Run to first!';
  }
  if(side!==s.batting&&name==='secondary'&&s.phase==='hit'){const h=s.hit,nearest=s.fielders.reduce((a,p)=>dist(p,h.to)<dist(a,h.to)?p:a);if(h.t>=h.duration&&dist(nearest,h.to)<45){h.throw=true;g.message='Throw to first!'}else g.message='Get to the ball, then THROW TO FIRST.'}
 }
 return g;
}
export function updateGame(g,inputs,dt){
 if(g.finished)return;dt=clamp(dt,0,.04);g.time+=dt;
 if(g.sport==='basketball')updateBasket(g,inputs,dt);
 if(g.sport==='football')updateFootball(g,inputs,dt);
 if(g.sport==='softball')updateSoftball(g,inputs,dt);
}
function updateBasket(g,inputs,dt){
 const b=g.basket;b.cool=Math.max(0,b.cool-dt);
 b.jumps=b.jumps.map(v=>Math.max(0,v-dt));b.stealCooldown=b.stealCooldown.map(v=>Math.max(0,v-dt));
 if(b.reset>0){b.reset-=dt;return}
 const previous=b.players.map(p=>({...p}));
 move(b.players[0],inputs[0],215,dt,[110,850,110,430]);
 if(g.cpu){
  const target=b.owner===1?point(290,270):b.owner===0?point(b.players[0].x+35,b.players[0].y):b.loose||point(520,300);
  chase(b.players[1],target,b.owner===1?150:165,dt);b.ai-=dt;
  if(b.owner===1&&b.ai<=0){action(g,1,'primary');b.ai=2.7;}
  if(b.owner===0&&dist(b.players[0],b.players[1])<55&&b.ai<=0){action(g,1,'secondary');b.ai=1.4;}
  if(b.shot?.side===0&&b.shot.t<.15&&dist(b.players[1],b.shot.from)<65)action(g,1,'primary');
 }else move(b.players[1],inputs[1],215,dt,[110,850,110,430]);
 const d=dist(...b.players);if(d<31){const dx=(b.players[1].x-b.players[0].x)/(d||1),dy=(b.players[1].y-b.players[0].y)/(d||1);b.players[0].x-=dx*(31-d)/2;b.players[0].y-=dy*(31-d)/2;b.players[1].x+=dx*(31-d)/2;b.players[1].y+=dy*(31-d)/2;}
 b.players.forEach((p,i)=>{p.x=clamp(p.x,110,850);p.y=clamp(p.y,110,430);b.motion[i]=dist(p,previous[i])>0.1?1:0;});
 if(b.owner!==null){b.clock-=dt;if(b.clock<=0){b.owner=1-b.owner;b.clock=24;b.cool=1;g.message='Shot clock! Possession changes.';}}
 if(b.shot){b.shot.t+=dt;const shot=b.shot;if(shot.t>=shot.duration){
  if(shot.made){g.scores[shot.side]+=shot.points;g.message=`Basket! Player ${shot.side+1} +${shot.points}`;
   if(g.scores[shot.side]>=11){g.finished=true;g.message=`Player ${shot.side+1} wins!`;}
   b.owner=1-shot.side;b.players=[point(300,300),point(610,280)];b.reset=1.2;b.cool=.8;b.ai=2.7;b.clock=24;
  }else{b.loose={x:clamp(shot.to.x+(shot.side===0?-65:65),130,830),y:clamp(shot.to.y,125,420)};g.message=shot.blocked?'Blocked! Grab the ball.':'Off the rim! Chase the rebound.';}
  b.shot=null;
 }}
 if(b.loose&&!b.shot){for(let side=0;side<2;side++){if(dist(b.players[side],b.loose)<42){b.owner=side;b.loose=null;b.cool=.4;b.clock=24;g.message=`Player ${side+1} rebounds!`;break;}}}
}
function footballSetup(g){
 const f=g.football,d=f.offense===0?1:-1;
 f.attack=[point(f.line,270),point(f.line+50*d,155),point(f.line+40*d,275),point(f.line+50*d,390)];
 f.defense=[point(f.line+180*d,270),point(f.line+155*d,140),point(f.line+215*d,260),point(f.line+155*d,405)];f.carrier=0;f.playTime=0;f.flight=null;
}
function footballTurn(g,message){const f=g.football;f.drives++;f.offense=1-f.offense;f.down=1;f.line=f.offense===0?210:750;f.target=f.line+(f.offense===0?140:-140);footballSetup(g);g.message=message+` Player ${f.offense+1} takes possession.`}
function footballEndPlay(g,message){
 const f=g.football;if(f.delay>0)return;const d=f.offense===0?1:-1,p=f.attack[f.carrier],gain=(p.x-f.line)*d;
 if((p.x-f.target)*d>=0){f.line=clamp(p.x,130,830);f.down=1;f.target=f.line+d*140;g.message=message+' FIRST DOWN!'}
 else{f.line=clamp(p.x,130,830);f.down++;g.message=message+` Gain: ${Math.round(gain/7)} yards. Down ${f.down} of 4.`;if(f.down>4)footballTurn(g,'Turnover on downs!')}
 f.delay=1.3;
}
function updateFootball(g,inputs,dt){
 const f=g.football;if(f.delay>0){f.delay-=dt;if(f.delay<=0)footballSetup(g);return}
 const off=f.offense,def=1-off,d=off===0?1:-1;f.playTime+=dt;
 if(g.cpu&&off===1){chase(f.attack[f.carrier],point(95,265),155,dt);if(f.carrier===0&&!f.flight&&f.playTime>1.2&&f.playTime<1.3)action(g,1,'pass-center')}
 else move(f.attack[f.carrier],inputs[off],205,dt,[85,875,95,445]);
 for(let n=1;n<4;n++)if(n!==f.carrier){const p=f.attack[n];p.x=clamp(p.x+d*90*dt,115,845);p.y=clamp(p.y+Math.sin(g.time+n)*24*dt,110,430)}
 const carrier=f.attack[f.carrier];if(g.cpu&&def===1)chase(f.defense[0],carrier,132,dt);else move(f.defense[0],inputs[def],218,dt,[85,875,95,445]);
 for(let n=1;n<4;n++){const receiver=f.attack[n],p=f.defense[n];chase(p,f.carrier===0&&f.playTime<2?receiver:carrier,n===2?92:80,dt)}
 if(f.flight){f.flight.t+=dt;if(f.flight.t>=f.flight.duration){const pass=f.flight;let interceptor=f.defense.find(p=>dist(p,pass.to)<30);if(interceptor){footballTurn(g,'Intercepted!');f.delay=1.3;return}if(dist(f.attack[pass.receiver],pass.to)<95){f.carrier=pass.receiver;g.message='Caught! Run toward the end zone.'}else footballEndPlay(g,'Incomplete pass.');f.flight=null;}}
 if(!f.flight){if((d===1&&carrier.x>=865)||(d===-1&&carrier.x<=95)){g.scores[off]+=7;g.message=`TOUCHDOWN! Player ${off+1} +7 (extra point included)`;if(g.scores[off]>=14){g.finished=true;g.message=`Player ${off+1} wins!`}else{footballTurn(g,g.message);f.delay=1.8}return}
 if(f.defense.some(p=>dist(p,carrier)<25))footballEndPlay(g,'Tackle!');}
 if(f.playTime>18)footballEndPlay(g,'Play clock expired.');
}
function softballStrike(g,message){const s=g.softball;s.strikes++;s.phase='result';s.clock=0;g.message=message+` Strike ${s.strikes}.`;if(s.strikes>=3){softballOut(g,'Strikeout!')}}
function softballOut(g,message){const s=g.softball;s.outs++;s.strikes=0;s.balls=0;s.phase='result';s.clock=0;s.runners=[];g.message=message+` ${s.outs} out${s.outs===1?'':'s'}.`}
function advanceBases(g,n){const s=g.softball;let runs=0;for(let i=2;i>=0;i--){if(s.bases[i]){s.bases[i]=false;if(i+n>=3)runs++;else s.bases[i+n]=true}}if(n>=4)runs++;else s.bases[n-1]=true;g.scores[s.batting]+=runs;s.strikes=0;s.balls=0;return runs}
function updateSoftball(g,inputs,dt){
 const s=g.softball;s.clock+=dt;s.swing=Math.max(0,s.swing-dt);const aimInput=inputs[s.batting]||{};s.aim=clamp(s.aim+((aimInput.right?1:0)-(aimInput.left?1:0))*.7*dt,-1,1);
 if(s.phase==='ready'){
  if((g.cpu&&s.batting===0&&s.clock>.95)||s.clock>9)action(g,1-s.batting,'pitch-fast');
  return;
 }
 if(s.phase==='pitch'){
  s.pitch.t+=dt;const progress=s.pitch.t/s.pitch.duration;
  if(g.cpu&&s.batting===1&&!s.pitch.swung&&progress>=.84+Math.sin(g.time)*.04){s.aim=Math.sin(g.time*2)*.8;action(g,1,'primary')}
  if(s.phase==='pitch'&&progress>1.13){if(s.pitch.kind==='curve'&&Math.random()<.2){s.balls++;s.phase='result';s.clock=0;g.message=`Ball ${s.balls}.`;if(s.balls>=4){advanceBases(g,1);g.message='Walk! Batter takes first.'}}else softballStrike(g,'Called strike!')}
 }
 if(s.phase==='hit'){
  const h=s.hit;h.t+=dt;const target=h.to;let nearest=0,best=1e9;s.fielders.forEach((p,i)=>{const d=dist(p,target);if(d<best){nearest=i;best=d}});
  if(!g.cpu||s.batting===1)move(s.fielders[nearest],inputs[1-s.batting],235,dt,[120,840,65,440]);
  s.fielders.forEach((p,i)=>{if(i!==nearest||(g.cpu&&s.batting===0))chase(p,target,125,dt)});
  s.runners.forEach(r=>r.t=Math.min(1,r.t+dt/.9));
  if(h.t>=h.duration&&h.distance>335){const runs=advanceBases(g,4);g.message=`HOME RUN! ${runs} run${runs===1?'':'s'} score!`;s.phase='result';s.clock=0;}
  else if(h.t>=h.duration&&h.t<h.duration+.08&&s.fielders.some(p=>dist(p,target)<24)&&h.distance>175)softballOut(g,'Fly ball caught!');
  else if(h.t>h.duration+.75){if(h.throw)softballOut(g,'Throw beats the runner to first!');else{const bases=h.distance>270?3:h.distance>195?2:1,runs=advanceBases(g,bases);g.message=(bases===3?'Triple!':bases===2?'Double!':'Single!')+(runs?` ${runs} run${runs===1?'':'s'} score!`:' Batter reaches base.');s.phase='result';s.clock=0;}}
 }
 if(s.phase==='result'&&s.clock>1.6){
  if(s.outs>=3){s.bases=[false,false,false];s.outs=0;if(s.batting===0){if(s.inning>=3&&g.scores[1]>g.scores[0]){g.finished=true;g.message='Player 2 wins!';return}s.batting=1;}else{if(s.inning>=3&&g.scores[0]!==g.scores[1]){g.finished=true;g.message=`Player ${g.scores[0]>g.scores[1]?1:2} wins!`;return}s.batting=0;s.inning++}g.message=`${s.batting===0?'Top':'Bottom'} of inning ${s.inning}. Player ${s.batting+1} bats.`;}
  s.phase='ready';s.clock=0;s.pitch=null;s.hit=null;s.runners=[];s.fielders=fielders();
 }
}

