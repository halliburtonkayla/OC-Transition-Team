import assert from 'node:assert/strict';
import {createGame,action,updateGame} from '../park-sports-engine.js';
const step=(g,n=60)=>{for(let i=0;i<n;i++)updateGame(g,[{},{}],1/60);};
let g=createGame('basketball');g.cpu=false;let x=g.basket.players[1].x;updateGame(g,[{}, {left:true}],.04);assert(g.basket.players[1].x<x,'second player moves independently');
g.basket.players=[{x:710,y:270},{x:300,y:270}];const random=Math.random;Math.random=()=>0;action(g,0,'primary');assert.equal(g.basket.shot.points,2);step(g,100);assert.equal(g.scores[0],2);assert.equal(g.basket.owner,1);
g=createGame('basketball');g.cpu=false;g.basket.players=[{x:450,y:270},{x:170,y:180}];action(g,0,'primary');assert.equal(g.basket.shot.points,3);step(g,100);assert.equal(g.scores[0],3);
g=createGame('basketball');g.cpu=false;g.basket.players=[{x:650,y:270},{x:680,y:270}];action(g,1,'primary');action(g,0,'primary');assert(g.basket.shot.blocked);step(g,90);assert.equal(g.scores[0],0);
g=createGame('basketball');g.cpu=false;g.basket.players=[{x:500,y:270},{x:535,y:270}];action(g,1,'secondary');assert.equal(g.basket.owner,1);action(g,0,'secondary');assert.equal(g.basket.owner,1,'no instant steal back');
g=createGame('basketball');g.cpu=false;g.basket.clock=.01;updateGame(g,[{},{}],.02);assert.equal(g.basket.owner,1);
g=createGame('basketball');g.cpu=false;g.scores[0]=10;g.basket.players=[{x:710,y:270},{x:300,y:270}];action(g,0,'primary');step(g,100);assert(g.finished);
Math.random=random;
for(const sport of ['football','softball']){g=createGame(sport);step(g,600);assert(Number.isFinite(g.time));}
console.log('PASS: player two control, two/three points, blocks, steal cooldown, shot clock, winning score and other sports smoke tests');
