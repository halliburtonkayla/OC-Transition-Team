import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORDS,newDrive,chooseLetter} from '../assets/letter-lane/core.mjs';
import {ROAD,createRunner,spawnWave,steerRunner,advanceRunner,jumpRunner,jumpHeight,toggleBoost,nextLetter,speedOf,runnerSummary,runnerCheckpoint,restoreRunner} from '../assets/letter-lane/runner.mjs';
import {projectRoad} from '../assets/letter-lane/road-view.mjs';
import {DRIVING_CUES} from '../assets/letter-lane/driving-cues.mjs';
import {narrationPlayer} from '../assets/letter-lane/voice.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function until(race,condition,control=()=>{},limit=120){const events=[];for(let i=0;i<limit*60&&!condition(race);i++){control(race);events.push(...advanceRunner(race,1/60));}assert.ok(condition(race),'drive did not reach the expected state');return events;}
function guide(race){const target=nextLetter(race),power=race.entities.find(e=>e.kind==='jump'&&e.at>race.distance);if(target)steerRunner(race,target.at-race.distance>80&&power?power.lane:target.lane);}
test('the car advances continuously, steering changes the physical position, and letters wait for a collision',()=>{
 const r=createRunner();const target=nextLetter(r);assert.equal(target.lane,2);advanceRunner(r,1);assert.ok(r.distance>24);assert.equal(r.drive.index,0);assert.equal(r.drive.answers.length,0);
 steerRunner(r,2);assert.equal(r.x,1);advanceRunner(r,.3);assert.equal(r.x,2);assert.equal(r.drive.index,0);
});
test('only crossing a letter in the car lane collects it; spelling does not award uncollected road stars',()=>{
 const r=createRunner();r.entities=[{id:'j',kind:'letter',at:2,lane:1,letter:'j',slot:0,row:0}];const events=advanceRunner(r,.2);
 assert.equal(r.drive.index,1);assert.equal(r.drive.stars,3);assert.equal(r.stars,0);assert.equal(events.filter(e=>e.type==='letter').length,1);
 advanceRunner(r,.1);assert.equal(r.drive.answers.length,1);
});
test('a wrong letter and a missed row retain the target and all earned stars',()=>{
 const r=createRunner();r.stars=1;r.collected=[{id:'earned',kind:'star'}];r.entities=[{id:'wrong',kind:'letter',at:2,lane:1,letter:'m',slot:0,row:0}];
 const e=advanceRunner(r,.2);assert.equal(r.drive.index,0);assert.equal(r.stars,1);assert.equal(r.drive.answers[0].correct,false);assert.equal(nextLetter(r).letter,'j');assert.ok(e.some(e=>e.type==='letter'));
 r.entities=[{id:'miss',kind:'letter',at:r.distance+2,lane:0,letter:'j',slot:0,row:1}];advanceRunner(r,.2);assert.equal(r.drive.index,0);assert.equal(r.drive.answers.length,1);assert.equal(r.misses,1);assert.equal(r.stars,1);
});
test('jump coins grant charges and a well-timed jump physically clears a cone',()=>{
 const r=createRunner();r.entities=[{id:'power',kind:'jump',at:1,lane:1},{id:'cone',kind:'cone',at:ROAD.slow,lane:1}];
 advanceRunner(r,.05);assert.equal(r.jumpCharges,2);assert.equal(r.coins,1);advanceRunner(r,.35);assert.equal(jumpRunner(r),true);assert.equal(r.jumpCharges,1);assert.equal(jumpRunner(r),false);
 advanceRunner(r,.35);assert.ok(jumpHeight(r)>.7);const e=advanceRunner(r,.8);assert.ok(e.some(e=>e.type==='cone-cleared'));assert.equal(r.coneHits,0);assert.equal(r.jumps,1);
});
test('a cone slows the car briefly, never removes a letter or star, and cannot be hit twice',()=>{
 const r=createRunner();r.stars=1;r.collected=[{id:'saved',kind:'star'}];r.entities=[{id:'cone',kind:'cone',at:1,lane:1}];
 const events=advanceRunner(r,.1);assert.equal(r.coneHits,1);assert.ok(speedOf(r)<ROAD.slow);assert.equal(r.stars,1);assert.equal(r.drive.index,0);advanceRunner(r,2);assert.equal(speedOf(r),ROAD.slow);assert.equal(r.coneHits,1);assert.equal(events.filter(e=>e.type==='cone-hit').length,1);
});
test('lightning coins increase actual travel speed, fuel expires, and pause freezes abilities and collisions',()=>{
 const r=createRunner();r.entities=[{id:'boost',kind:'boost',at:1,lane:1}];advanceRunner(r,.1);assert.equal(r.boostOn,true);assert.ok(speedOf(r)>ROAD.slow);
 const before=r.distance;advanceRunner(r,1);assert.ok(r.distance-before>40);
 r.paused=true;const frozen=JSON.stringify(r);assert.deepEqual(advanceRunner(r,1),[]);assert.equal(JSON.stringify(r),frozen);assert.equal(jumpRunner(r),false);assert.equal(toggleBoost(r),false);
 r.paused=false;assert.equal(toggleBoost(r),true);const fuel=r.boostFuel;advanceRunner(r,1);assert.equal(r.boostFuel,fuel);assert.equal(speedOf(r),ROAD.slow);toggleBoost(r);
 for(let i=0;i<8;i++)advanceRunner(r,1);assert.equal(r.boostFuel,0);assert.equal(r.boostOn,false);
});
test('swept collision detection keeps stars and letter pickups at boost speed across frame rates',()=>{
 function run(dt){const r=createRunner();r.entities=[{id:'boost',kind:'boost',at:1,lane:1},{id:'star',kind:'star',at:8,lane:1},{id:'letter',kind:'letter',at:35,lane:1,letter:'j',slot:0,row:0}];for(let t=0;t<2-1e-7;t+=dt)advanceRunner(r,dt);return r;}
 const a=run(1/30),b=run(1/144),c=run(2);for(const r of [a,b,c]){assert.equal(r.stars,1);assert.equal(r.drive.index,1);assert.equal(r.drive.answers.length,1);assert.equal(r.coins,1);}assert.ok(Math.abs(a.distance-b.distance)<1);
});
test('every word is collectable by driving and the completed word cannot award duplicate credit',()=>{
 for(const w of WORDS){const r=createRunner({wordId:w.id,id:w.id,autoJump:true});const events=until(r,r=>r.drive.complete,guide);assert.equal(r.drive.answers.length,3);assert.equal(r.drive.answers.every(a=>a.correct),true);assert.equal(events.filter(e=>e.type==='word-complete').length,1);const frozen=JSON.stringify(r);assert.deepEqual(advanceRunner(r,1),[]);assert.equal(JSON.stringify(r),frozen);assert.equal(r.stars,r.collected.filter(e=>e.kind==='star').length);}
});
test('optional jump assistance is recorded separately from independent jump use',()=>{
 const r=createRunner({autoJump:true});r.entities=[{id:'power',kind:'jump',at:1,lane:1},{id:'cone',kind:'cone',at:ROAD.slow,lane:1}];const e=advanceRunner(r,2);assert.equal(r.autoJumps,1);assert.equal(r.jumps,1);assert.equal(r.coneHits,0);assert.ok(e.some(e=>e.type==='jump-used'&&e.automatic));assert.equal(runnerSummary(r).autoJumps,1);
});
test('resume keeps earned pickups and rejects duplicate credits, impossible power balances and corrupt progress',()=>{
 const r=createRunner();until(r,r=>r.distance>80);const snapshot=runnerCheckpoint(r),restored=restoreRunner(snapshot);assert.ok(restored);assert.equal(restored.stars,r.stars);assert.equal(restored.coins,r.coins);assert.equal(restored.jumpCharges,r.jumpCharges);assert.equal(restored.distance,r.distance);
 for(const bad of [{...snapshot,stars:snapshot.stars+1},{...snapshot,lane:3},{...snapshot,boostFuel:90},{...snapshot,jumpCharges:4},{...snapshot,collected:[...snapshot.collected,snapshot.collected[0]]},{...snapshot,drive:{...snapshot.drive,index:2}}])assert.equal(restoreRunner(bad),null);
 const old=chooseLetter(newDrive('jam','guided',false,'old'),'j').drive;const migrated=createRunner({drive:old});assert.equal(migrated.drive.index,1);assert.equal(migrated.stars,3);assert.ok(restoreRunner(runnerCheckpoint(migrated)));
 const air=createRunner();air.entities=[{id:'jump-power',kind:'jump',at:1,lane:1}];advanceRunner(air,.05);jumpRunner(air);advanceRunner(air,.35);const resumedAir=restoreRunner(runnerCheckpoint(air));assert.ok(resumedAir);assert.equal(jumpHeight(resumedAir),jumpHeight(air));assert.equal(resumedAir.jumpCharges,air.jumpCharges);
});
test('road rows offer distinct letters, both power coin choices, and a route around every cone',()=>{
 const r=createRunner();for(let i=0;i<100;i++){const entities=r.entities,letters=entities.filter(e=>e.kind==='letter');assert.equal(letters.length,3);assert.equal(new Set(letters.map(e=>e.letter)).size,3);assert.equal(letters.filter(e=>e.letter==='j').length,1);assert.equal(entities.filter(e=>e.kind==='cone').length,1);assert.notEqual(entities.find(e=>e.kind==='jump').lane,entities.find(e=>e.kind==='boost').lane);assert.ok(entities.every(e=>e.at>r.distance&&e.at<=r.distance+ROAD.far));r.entities=[];spawnWave(r);}
});
test('objects approach in perspective, and the live interface uses steering rather than letter buttons',()=>{
 const far=projectRoad(200,2,390,500),near=projectRoad(5,2,390,500);assert.ok(near.y>far.y);assert.ok(near.scale>far.scale);assert.ok(near.x>far.x);assert.equal(projectRoad(0,1,390,500).x,195);
 const html=read('letter-lane.html');assert.ok(html.includes('assets/letter-lane/drive-game.mjs'));assert.ok(html.includes('id="jump"'));assert.ok(html.includes('id="boost"'));assert.ok(!html.includes('id="pickups"'));assert.ok(!html.includes('Drive to the selected letter'));assert.ok(!read('assets/letter-lane/drive-game.mjs').includes('data-letter'));
 for(const key of ['drive-how','jump-ready','jump-now','boost-ready','steer-left','steer-middle','steer-right','jump-coin-first','boost-coin-first'])assert.ok(DRIVING_CUES[key],key);
 assert.ok(fs.statSync(new URL('../assets/letter-lane/driving-voice.mp3',import.meta.url)).size>10000);
});
test('bundled driving narration uses the ability cue from the driving audio sprite',async()=>{
 const played=[],audio={currentTime:0,pause(){},play(){played.push(this.currentTime);return Promise.resolve();}},host={setTimeout:()=>1,clearTimeout(){}};
 const player=narrationPlayer({audio,host,cues:DRIVING_CUES,onUnavailable:()=>assert.fail('Driving cue unavailable')});player.speak('Jump!',['jump-now']);await Promise.resolve();assert.deepEqual(played,[DRIVING_CUES['jump-now'].start]);player.cancel();
});
