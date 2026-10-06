import assert from 'node:assert/strict';
import {createGame,setup,action,updateGame,endPlay,validState} from '../football/engine.js';
const tick=(g,n,inputs=[{},{}])=>{for(let i=0;i<n;i++)updateGame(g,inputs,1/60);};
let g=createGame(['462','558'],false);assert.equal(g.attack.length,11);assert.equal(g.defense.length,11);assert.ok(validState(g));
action(g,1,'snap');assert.equal(g.phase,'ready');action(g,0,'snap');tick(g,30,[{x:-1},{}]);assert.ok(g.attack[0].x<20,'Player really moves');
// Incompletions return to the original scrimmage line and consume one down.
g=createGame(['462','558'],false);action(g,0,'snap');g.attack[0].x=15;endPlay(g,'Miss',true);assert.equal(g.line,25);assert.equal(g.down,2);tick(g,140);assert.equal(g.phase,'ready');
// Ten yards earns a first down; turnover on fourth happens at the actual spot.
action(g,0,'snap');g.attack[0].x=38;endPlay(g);assert.equal(g.down,1);assert.equal(g.target,48);tick(g,140);g.down=4;action(g,0,'snap');g.attack[0].x=40;endPlay(g);assert.equal(g.offense,1);assert.equal(g.line,40);assert.equal(g.target,30);
// No forward passes beyond the line, and only one forward pass per play.
g=createGame(['462','558'],false);action(g,0,'snap');g.attack[0].x=26;action(g,0,'a');assert.equal(g.flight,null);g.attack[0].x=20;action(g,0,'a');assert.equal(g.phase,'flight');const target=g.flight.target;action(g,0,'c');assert.equal(g.flight.target,target);
// Controlled completion and interception use the ball landing position, not a random result.
g=createGame(['462','558'],false);action(g,0,'snap');g.defense.forEach(p=>{p.x=85;p.y=50;});action(g,0,'a');g.flight.duration=.01;g.flight.tx=g.attack[1].x;g.flight.ty=g.attack[1].y;tick(g,1);assert.equal(g.carrier,1);assert.equal(g.stats[0].completions,1);
g=createGame(['462','558'],false);action(g,0,'snap');action(g,0,'a');g.flight.duration=.01;g.flight.tx=50;g.flight.ty=20;g.defense[0].x=50;g.defense[0].y=20;tick(g,1);assert.equal(g.offense,1);assert.equal(g.returning,true);
// Touchdowns include the announced automatic PAT, then reset the opponent to its 25.
g=createGame(['462','558'],false);action(g,0,'snap');g.attack[0].x=100;tick(g,1);assert.deepEqual(g.score,[7,0]);assert.equal(g.line,75);assert.equal(g.offense,1);tick(g,140);assert.equal(g.phase,'ready');
g=createGame(['462','558'],false);action(g,0,'snap');g.attack[0].x=-1;endPlay(g);assert.deepEqual(g.score,[0,2]);
// Punt touchback; short accurate kick scores; long kick cannot score.
g=createGame(['462','558'],false);g.line=80;setup(g);action(g,0,'punt');tick(g,120);assert.equal(g.line,80);assert.equal(g.offense,1);
g=createGame(['462','558'],false);g.line=80;setup(g);action(g,0,'fieldgoal');action(g,0,'kick');tick(g,100);assert.deepEqual(g.score,[3,0]);
g=createGame(['462','558'],false);action(g,0,'fieldgoal');action(g,0,'kick');tick(g,100);assert.deepEqual(g.score,[0,0]);assert.equal(g.offense,1);
// End of the fourth allows the live play to finish, then ends or enters overtime.
g=createGame(['462','558'],false);g.quarter=4;g.clock=.001;g.score=[7,0];action(g,0,'snap');tick(g,2);assert.equal(g.phase,'live');endPlay(g);assert.equal(g.phase,'final');
g=createGame(['462','558'],false);g.quarter=4;g.clock=0;action(g,0,'snap');endPlay(g);assert.equal(g.quarter,5);tick(g,140);action(g,g.offense,'snap');g.attack[0].x=100;tick(g,1);assert.equal(g.phase,'final');
// Validated packets reject malformed/nonnumeric positions and invalid phases.
g=createGame();assert.ok(validState(g));g.attack[0].x=NaN;assert.equal(validState(g),false);g.attack[0].x=20;g.phase='bogus';assert.equal(validState(g),false);
// CPU plays and every generated snapshot stays finite through a whole match.
g=createGame();for(let i=0;i<180000&&g.phase!=='final';i++){if(g.phase==='ready'&&g.offense===0)action(g,0,'snap');updateGame(g,[{x:1,y:Math.sin(i/160)*.3,sprint:true},{}],1/60);if(i%100===0)assert.ok(validState(g),'valid snapshot '+i+' '+g.phase);}assert.equal(g.phase,'final');
console.log('PASS football movement, possession, passes, scoring, kicking, clocks, packet validation and full CPU match.');
