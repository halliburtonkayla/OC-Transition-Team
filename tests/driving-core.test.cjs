const assert=require('node:assert/strict');const {Lesson,angle}=require('../driving/core.js');
const step=(l,t,input={})=>{for(let i=0;i<t*60;i++)l.tick(1/60,input)};
const until=(l,fn,input,max=60)=>{let n=0;while(!fn(l.state)&&n++<max*60)l.tick(1/60,typeof input==='function'?input(l.state):input);assert.ok(fn(l.state),'maneuver timed out: '+JSON.stringify(l.state));};
function prepared(){let l=new Lesson('Olivia');l.state.paused=false;assert.ok(l.start());l.state.brake=1;l.belt();assert.equal(l.start(),'');for(const view of ['rear','shoulder','left','right']){l.observe(view);step(l,.4,{brake:1});l.endObserve();}l.state.brake=1;assert.equal(l.gear('R'),'');return l;}
let l=prepared();step(l,1);assert.equal(l.state.v,0);assert.equal(l.state.x,-12); // remains parked with no pedal
until(l,s=>s.x>-2.1,{throttle:.13});until(l,s=>s.yaw>-.03,{throttle:.13,steer:-1});step(l,.6,{brake:1});assert.ok(l.reverseDistance>7);assert.ok(l.state.x>0);assert.equal(l.state.v,0);assert.ok(l.gear('D')===undefined||l.state.gear==='D');
let north=(s)=>({throttle:s.z<62?.33:.10,steer:Math.max(-.4,Math.min(.4,(3-s.x)*.4-s.yaw*2))});until(l,s=>s.z>67,north);step(l,.7,{brake:1});assert.ok(l.state.z<70.5);step(l,1,{brake:1});assert.ok(l.stopOK);until(l,()=>l.ped.done,{brake:1},25);
for(const view of ['left','right']){l.observe(view);step(l,.4,{brake:1});l.endObserve();}l.signal('right');until(l,s=>s.z>71,{throttle:.12,steer:-l.state.yaw});
until(l,s=>s.yaw>Math.PI/2-.02,{throttle:.12,steer:.79});step(l,.5,{throttle:.12,steer:0}); // steering settles
until(l,s=>s.x>77,s=>({throttle:s.x<71?.3:.12,steer:Math.max(-.5,Math.min(.5,-(77-s.z)*.35+(Math.PI/2-s.yaw)*2))}));

l.signal("right");until(l,s=>s.yaw>Math.PI-.03,{throttle:.12,steer:.72});step(l,.5,{brake:1});until(l,s=>s.z<62.4,s=>({throttle:.13,steer:Math.max(-.4,Math.min(.4,(s.x-85)*.35-angle(s.yaw-Math.PI)*2))}));step(l,.6,{brake:1});l.gear("P");assert.ok(l.state.finished);assert.equal(l.report().collisions.length,0);assert.ok(l.report().successes.some(e=>e.text.includes("Pedestrian")));console.log("PASS continuous complete route");
// Targeted safety boundaries: real braking distance, unsafe shifts, road edge, hazard contact,
// missed controls and pause behavior. State setup here isolates each rule; full-route test above never teleports.
let a=prepared();a.gear('D');step(a,2,{throttle:1});let before=a.state.x;assert.ok(a.gear('R'));step(a,.1,{brake:1});assert.ok(a.state.x!==before,'braking takes distance');step(a,1,{brake:1});assert.equal(a.state.v,0);
let paused=a.snapshot();a.state.paused=true;step(a,20,{throttle:1,steer:1});assert.equal(a.state.x,paused.state.x);assert.equal(a.state.t,paused.state.t);
let edge=prepared();step(edge,20,{throttle:1});assert.ok(edge.events.some(e=>e.text.includes('road edge')));assert.ok(edge.state.x<=5);
let speeding=prepared();Object.assign(speeding.state,{x:3,z:30,yaw:0,v:9,gear:'D',stage:'approach'});step(speeding,.1);assert.ok(speeding.report().practice.some(e=>e.text.includes('Speed limit')));
let stop=prepared();Object.assign(stop.state,{x:3,z:68,yaw:0,v:4,gear:'D',stage:'approach'});step(stop,.5,{throttle:1});assert.ok(stop.report().practice.some(e=>e.text.includes('without a complete stop')));
let pedestrian=prepared();Object.assign(pedestrian.state,{x:3,z:70,yaw:0,v:3,gear:'D',stage:'intersection'});Object.assign(pedestrian.ped,{x:3,z:74,active:true});step(pedestrian,2,{throttle:1});assert.ok(pedestrian.report().collisions.length>0);assert.ok(pedestrian.state.z<74);
let traffic=prepared();Object.assign(traffic.state,{x:3,z:79,yaw:0,v:3,gear:'D',stage:'intersection'});Object.assign(traffic.traffic,{x:3,z:82,v:0});step(traffic,1,{throttle:1});assert.ok(traffic.report().collisions.length>0);
let parking=prepared();parking.state.stage='parking-destination';parking.state.gear='D';parking.state.brake=1;parking.gear('P');assert.equal(parking.state.finished,false);
console.log('PASS braking/interlocks, pause, boundaries, speeding, missed stop, pedestrian/vehicle contact, invalid parking.');
