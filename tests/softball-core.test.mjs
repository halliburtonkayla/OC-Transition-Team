import assert from 'node:assert/strict';
import {createGame,act,tick,BASES,validState} from '../softball/core.js';
const step=(g,n)=>{for(let i=0;i<Math.ceil(n*60);i++)tick(g,[{},{}],1/60);};
const pitchTo=(g,t)=>{act(g,1-g.batting,'pitch');step(g,g.pitch.windup+g.pitch.duration+t);};
// Only the pitcher can pitch and only the batter can swing. Human games never auto-pitch.
let g=createGame({cpu:false});step(g,12);assert.equal(g.phase,'ready');act(g,0,'pitch');assert.equal(g.phase,'ready');act(g,1,'pitch');assert.equal(g.phase,'pitch');act(g,1,'swing');assert.equal(g.pitch.swung,false);
// Three called strikes, not a timed score award, make an out.
g=createGame({cpu:false});for(let i=0;i<3;i++){pitchTo(g,.4);assert.equal(g.phase,'result');step(g,2.4);}assert.equal(g.outs,1);assert.equal(g.strikes,0);
// Walk advances only forced runners; a runner on second does not automatically take third.
g=createGame({cpu:false});g.bases=[false,true,false];for(let i=0;i<4;i++){g.pitchAim.x=.85;pitchTo(g,.4);step(g,2.4);}assert.deepEqual(g.bases,[true,true,false]);
// A bases-loaded walk scores exactly one run.
g=createGame({cpu:false});g.bases=[true,true,true];g.balls=3;g.pitchAim.x=.85;pitchTo(g,.4);assert.deepEqual(g.scores,[1,0]);
// Swing timing changes flight. Only one swing is possible for each pitch.
g=createGame({cpu:false});pitchTo(g,-.35);act(g,0,'swing');assert.equal(g.phase,'result');assert.equal(g.strikes,1);
g=createGame({cpu:false});pitchTo(g,-.04);act(g,0,'swing');assert.equal(g.phase,'live');assert.ok(g.ball.vz>0);const ball={...g.ball};act(g,0,'swing');assert.deepEqual(g.ball,ball);step(g,.3);assert.ok(g.ball.z>ball.z);
// Fouls at two strikes do not cause a strikeout.
g=createGame({cpu:false});g.strikes=2;g.aim=1;pitchTo(g,.17);act(g,0,'swing');assert.equal(g.phase,'foul');step(g,1.5);assert.equal(g.strikes,2);assert.equal(g.outs,0);
// Setup a live fielding play: first base must be won by actual throw arrival time.
function play(progress){const s=createGame({cpu:false});s.phase='live';s.holder=0;s.fielders[0]={x:0,z:13.1};s.ball={x:0,y:1,z:13.1};s.runners=[{start:0,progress,target:1,forced:true,out:false,scored:false}];return s;}
g=play(.1);act(g,1,'throw-1');assert.equal(g.phase,'throw');step(g,1);assert.equal(g.outs,1);
g=play(.95);act(g,1,'throw-1');step(g,1);assert.equal(g.outs,0);step(g,2);assert.equal(g.bases[0],true);
// Manual movement really moves the selected defender toward a live ball.
g=createGame({cpu:false});pitchTo(g,0);act(g,0,'swing');const x=g.fielders[g.selected].x;tick(g,[{},{right:true}],.04);assert.ok(g.fielders[g.selected].x>x);
// A fly catch returns runners to their original bags and produces an out.
g=createGame({cpu:false});g.bases=[true,false,false];g.phase='live';g.holder=null;g.liveTime=1;g.ball={x:20,y:2,z:25,vx:0,vz:0,vy:-1};g.landing={x:20,z:25};g.fielders[6]={x:20,z:25};g.selected=6;g.runners=[{start:1,progress:1.3,target:2,forced:false}];tick(g,[{},{}],1/60);assert.equal(g.phase,'result');assert.equal(g.outs,1);assert.deepEqual(g.bases,[true,false,false]);
// Home run requires clearing the actual fence in the air.
g=createGame({cpu:false});g.phase='live';g.holder=null;g.ball={x:0,z:63.8,y:5,vx:0,vz:20,vy:-1};g.landing={x:0,z:70};g.runners=[{start:0,progress:0,target:1,forced:true}];tick(g,[{},{}],.04);assert.equal(g.phase,'homer');step(g,8);assert.equal(g.scores[0],1);
// Bottom of final inning can walk off. A tie continues into extras.
g=createGame({cpu:false,innings:1});g.batting=1;g.bases=[true,true,true];g.balls=3;g.pitchAim.x=.85;pitchTo(g,.4);assert.equal(g.finished,true);assert.match(g.message,/Player 2/);
g=createGame({cpu:false,innings:1});g.batting=1;g.outs=3;g.phase='result';step(g,2.4);assert.equal(g.inning,2);assert.equal(g.finished,false);
assert.equal(validState(createGame()),true);assert.equal(validState({version:2}),false);
// Sustained CPU match with an unattended human finishes innings without NaN or deadlocks.
g=createGame({cpu:true,innings:1});for(let i=0;i<60*400&&!g.finished;i++){if(g.batting===1&&g.phase==='ready')act(g,0,'pitch');if(g.batting===1&&g.phase==='live'&&g.holder!==null)act(g,0,'throw-1');tick(g,[{},{}],1/60);assert.ok(validState(g));}assert.ok(g.inning>=1);assert.ok(g.scores.every(Number.isFinite));
console.log('Softball core: timing, walks, fouls, movement, catches, force outs, safe arrivals, homers and innings passed.');
