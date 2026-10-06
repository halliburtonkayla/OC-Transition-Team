/* Transition Town driving: metres, seconds, radians. No DOM or networking dependency. */
(function(root){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const route={id:'school-grocery-01',name:'Training lot → Grocery Store',limit:15,start:{x:-12,z:8,yaw:-Math.PI/2},destination:{x:85,z:62,yaw:Math.PI},paved:[[-25,-8,0,20],[-6,-25,6,110],[-40,74,110,86],[65,50,101,80]],buildings:[{name:'City Hall',x:-22,z:59,w:18,d:12,h:12,asset:'driving/cityhall.webp'},{name:'Transition Town Bank',x:-25,z:38,w:18,d:12,h:9,asset:'driving/bank.webp'},{name:'Transition Town Pizza Co.',x:22,z:39,w:18,d:12,h:7,asset:'driving/pizza.webp'},{name:'Transition Town Grocery',x:86,z:43,w:26,d:10,h:10,asset:'driving/grocery.webp'}]};
class Lesson{
 constructor(student='Guest'){this.student=student;this.route=route;this.state={...route.start,v:0,steer:0,gear:'P',engine:false,belt:false,signal:'off',brake:0,throttle:0,t:0,paused:true,finished:false,limit:15,stage:'parking'};this.events=[];this.once=new Set();this.last={};this.mirrors={};this.look=null;this.lookTime=0;this.distance=0;this.reverseDistance=0;this.stopDwell=0;this.stopOK=false;this.ped={x:-9,z:74,active:false,done:false};this.traffic={x:-32,z:82,yaw:Math.PI/2,v:4};this.bumper=null;this.emit('Entered passenger vehicle');}
 emit(text,kind='observation',key=null){if(key&&this.once.has(key))return;if(key)this.once.add(key);const e={time:Math.round(this.state.t*10)/10,at:new Date().toISOString(),text,kind,location:{x:+this.state.x.toFixed(2),z:+this.state.z.toFixed(2)}};this.events.push(e);return e;}
 violation(text,key){if((this.last[key]??-100)+6>this.state.t)return;this.last[key]=this.state.t;this.emit(text,'practice');}
 belt(){this.state.belt=!this.state.belt;this.emit('Seatbelt '+(this.state.belt?'fastened':'unfastened'),this.state.belt?'success':'observation');}
 start(){const s=this.state;if(s.engine){if(Math.abs(s.v)>.1)return 'Stop before switching off the engine.';s.engine=false;this.emit('Engine switched off');return '';}if(s.brake<.5||s.gear!=='P')return 'Hold the brake with the transmission in Park to start.';s.engine=true;this.emit('Engine started with brake held','success');return '';}
 gear(g){const s=this.state;if(!['P','R','N','D'].includes(g))return;if(Math.abs(s.v)>.15||s.brake<.5)return 'Stop and hold the brake before changing gear.';if(!s.engine&&g!=='P')return 'The engine is off.';if(s.gear===g)return '';if(g==='D'&&this.reverseDistance>7&&s.stage==='parking'){s.stage='road';this.emit('Backing maneuver completed',this.once.has('unsafe-reverse')?'observation':'success','backed');}s.gear=g;this.emit(({P:'Park',R:'Reverse',N:'Neutral',D:'Drive'})[g]+' selected');if(g==='P')this.tryFinish();return '';}
 signal(side){this.state.signal=this.state.signal===side?'off':side;this.emit('Turn signal: '+this.state.signal);}
 observe(view){this.look=view;this.lookTime=0;}
 endObserve(){this.look=null;this.lookTime=0;}
 observed(view,age=12){return this.mirrors[view]!==undefined&&this.state.t-this.mirrors[view]<age;}
 corners(x=this.state.x,z=this.state.z,yaw=this.state.yaw){return [[-0.86,-2.1],[.86,-2.1],[.86,2.1],[-.86,2.1]].map(([a,b])=>({x:x+a*Math.cos(yaw)+b*Math.sin(yaw),z:z-a*Math.sin(yaw)+b*Math.cos(yaw)}));}
 paved(x,z){return route.paved.some(([a,b,c,d])=>x>=a&&x<=c&&z>=b&&z<=d);}
 tick(dt,input={}){const s=this.state;if(s.paused||s.finished)return;dt=clamp(dt,0,.05);s.t+=dt;s.brake=clamp(input.brake||0,0,1);s.throttle=clamp(input.throttle||0,0,1);let target=clamp(input.steer||0,-1,1);s.steer+=(target-s.steer)*Math.min(1,dt*7);
 if(this.look){this.lookTime+=dt;if(this.lookTime>=.35&&(!this.observed(this.look,3))){this.mirrors[this.look]=s.t;this.emit(({rear:'Rearview mirror',left:'Left mirror',right:'Right mirror',shoulder:'Over-the-shoulder view'})[this.look]+' checked');}}
 this.traffic.x+=this.traffic.v*dt;if(this.traffic.x>45)this.traffic.x=-40;
 if(s.z>48&&s.z<76&&!this.ped.done)this.ped.active=true;if(this.ped.active){this.ped.x+=1.3*dt;if(this.ped.x>9){this.ped.active=false;this.ped.done=true;}}
 if(s.gear==='P'){s.v=0;}else{const direction=s.gear==='R'?-1:s.gear==='D'?1:0;let a=s.engine?direction*s.throttle*2.6:0;if(s.v!==0)a-=Math.sign(s.v)*(.22+.025*s.v*s.v+s.brake*7);let v=s.v+a*dt;if(s.v!==0&&Math.sign(v)!==Math.sign(s.v)&&s.brake>0)v=0;s.v=clamp(v,-3.5,13);}
 const old={x:s.x,z:s.z,yaw:s.yaw};let yaw=s.yaw+s.v/2.7*Math.tan(s.steer*.56)*dt;let x=s.x+Math.sin((s.yaw+yaw)/2)*s.v*dt,z=s.z+Math.cos((s.yaw+yaw)/2)*s.v*dt;this.bumper=null;
 if(Math.abs(s.v)>.02){const corners=this.corners(x,z,yaw);if(!corners.every(p=>this.paved(p.x,p.z))){this.bumper='Road edge';this.violation('Reached the road edge — practice lane and steering control.','edge');s.v=0;}else if(this.hitsVehicle(x,z)||this.hitsPedestrian(x,z)){this.bumper=this.hitsPedestrian(x,z)?'Pedestrian':'Traffic vehicle';this.violation(this.bumper==='Pedestrian'?'Pedestrian contact — practice stopping before the crosswalk.':'Traffic collision — practice yielding and space.','collision');s.v=0;}else{s.x=x;s.z=z;s.yaw=angle(yaw);}}
 const moved=Math.hypot(s.x-old.x,s.z-old.z);this.distance+=moved;if(s.gear==='R')this.reverseDistance+=moved;
 if(moved>.001&&!s.belt)this.emit('Moved without fastening seatbelt','practice','no-belt');
 if(s.gear==='R'&&moved>.001){if(!this.once.has('reverse-assessed')){this.once.add('reverse-assessed');if(!(this.observed('rear')&&this.observed('shoulder')))this.emit('Backing began without recent rearview and surroundings checks','practice','unsafe-reverse');else this.emit('Recent rearview and surroundings checks before backing','success','safe-reverse');}if(Math.abs(s.v)*2.237>5)this.emit('Backing speed above 5 MPH — practice a slower maneuver','practice','fast-reverse');}
 if(s.gear==='D'&&s.stage==='road'&&s.z>22){s.stage='approach';this.emit('Entered the Transition Town roadway','success','road');if(!this.observed('left')||!this.observed('right'))this.emit('Road entry: practice checking both side mirrors','practice','merge-check');}
 const mph=Math.abs(s.v)*2.237;if(mph>route.limit+1)this.violation('Speed limit exceeded by '+Math.round(mph-route.limit)+' MPH','speed');
 if(s.z>24&&s.z<65&&s.gear==='D'&&Math.cos(s.yaw)>.7&&s.x<.9&&moved>.01)this.violation('Lane position: keep to the right-hand lane','lane');
 if(s.z>=63&&s.z<=68.8&&Math.abs(s.v)<.12&&s.gear==='D'){this.stopDwell+=dt;if(this.stopDwell>.7){this.stopOK=true;this.emit('Stop sign: complete stop before the line','success','stop');}}else if(!this.stopOK)this.stopDwell=0;
 if(old.z+2.1*Math.cos(old.yaw)<71&&s.z+2.1*Math.cos(s.yaw)>=71&&s.stage==='approach'){s.stage='intersection';if(!this.stopOK)this.emit('Stop sign: crossed the stop line without a complete stop','practice','missed-stop');if(!this.observed('left',10)||!this.observed('right',10))this.emit('Intersection: practice observing both directions before entering','practice','intersection-check');}
 if(this.ped.active&&Math.abs(this.ped.x)<7&&s.z>61&&s.z<71&&Math.abs(s.v)<.15)this.emit('Pedestrian: yielded before the crosswalk','success','yield');
 if(old.z+2.1*Math.cos(old.yaw)<72&&s.z+2.1*Math.cos(s.yaw)>=72&&this.ped.active&&Math.abs(this.ped.x)<7)this.emit('Crosswalk entered while pedestrian was crossing','practice','crosswalk');
 if(this.ped.active&&Math.hypot(s.x-this.ped.x,s.z-74)<5&&mph>3)this.emit('Pedestrian near miss — practice earlier braking','practice','near-miss');
 if(s.stage==='intersection'&&s.yaw>.23&&!this.once.has('turn-start')){this.once.add('turn-start');this.turnSignal=s.signal;}
 if(s.stage==='intersection'&&s.x>13){s.stage='destination';this.emit(this.turnSignal==='right'?'Right turn completed with signal':'Right turn completed without signal',this.turnSignal==='right'?'success':'practice','turn');s.signal='off';}
 if(Math.hypot(s.x-this.traffic.x,s.z-this.traffic.z)<8&&mph>5)this.violation('Traffic: leave more stopping space','following');
 if(s.stage==='destination'&&s.x>65&&s.z<72){s.stage='parking-destination';this.emit(s.signal==='right'?'Destination entrance signaled':'Destination entrance: practice using your turn signal',s.signal==='right'?'success':'practice','destination-turn');s.signal='off';}
 }
 hitsVehicle(x,z){return Math.hypot(x-this.traffic.x,z-this.traffic.z)<3.5;}
 hitsPedestrian(x,z){return this.ped.active&&Math.hypot(x-this.ped.x,z-this.ped.z)<2.7;}
 tryFinish(){const s=this.state,d=route.destination;if(s.stage!=='parking-destination')return false;if(Math.abs(s.x-d.x)>.7||Math.abs(s.z-d.z)>1.1||Math.abs(angle(s.yaw-d.yaw))>.3){this.emit('Park selected outside the destination bay — adjust position and try again.');return false;}s.finished=true;s.paused=true;this.emit('Destination parking completed, vehicle stopped and secured in Park','success','park');return true;}
 snapshot(){return {version:1,student:this.student,route:route.id,vehicle:'Passenger sedan',state:{...this.state},mirrors:{...this.mirrors},events:this.events.slice()};}
 report(){return {version:1,student:this.student,route:route.name,duration:Math.round(this.state.t),completed:this.state.finished,distance:Math.round(this.distance),successes:this.events.filter(e=>e.kind==='success'),practice:this.events.filter(e=>e.kind==='practice'),observations:this.events.filter(e=>e.kind==='observation'),collisions:this.events.filter(e=>/contact|collision/i.test(e.text)),events:this.events.slice()};}
}
const api={Lesson,route,clamp,angle};if(typeof module!=='undefined')module.exports=api;root.TTDrivingCore=api;
})(typeof window!=='undefined'?window:globalThis);
