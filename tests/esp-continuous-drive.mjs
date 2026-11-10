import assert from 'node:assert/strict';
import {WORDS,createTurn,selectLane,advance,pause,resume,WAVE_SECONDS} from '../assets/esp-spelling/core.mjs';
let n=0;
for(const word of WORDS)for(let seed=1;seed<20;seed++){
 let r=seed;const rand=()=>((r=(r*1664525+1013904223)>>>0)/2**32);
 const t=createTurn(word.id,word.tier,rand);
 for(let i=0;i<word.id.length;i++){
  const lane=t.choices.indexOf(word.id[i]);assert(lane>=0);selectLane(t,lane);
  advance(t,WAVE_SECONDS-.1,rand);assert.equal(t.index,i);assert(t.movement>0);
  advance(t,.1,rand);assert.equal(t.index,i+1);
  if(t.phase==='run')assert.notEqual(t.choices.indexOf(word.id[i+1]),lane);
 }
 assert.equal(t.outcome,'correct');assert.equal(t.attempt,word.id);n++;
}
let t=createTurn('hat');selectLane(t,t.choices.findIndex(c=>c&&c!=='h'));advance(t,WAVE_SECONDS);assert.equal(t.index,0);assert.equal(t.mistakes,1);assert.equal(t.feedback,'retry');
t=createTurn('hat');advance(t,1);pause(t);const before=structuredClone(t);advance(t,100);assert.deepEqual(t,before);resume(t);assert.equal(t.phase,'run');advance(t,.1);assert(t.movement>1);
t=createTurn('hat');selectLane(t,t.choices.indexOf(null));advance(t,WAVE_SECONDS);assert.equal(t.index,0);assert.equal(t.feedback,'missed');
t=createTurn('hat');advance(t,NaN);assert.equal(t.elapsed,0);while(t.phase==='run'){selectLane(t,t.choices.findIndex(c=>c!==t.word[t.index]));advance(t,Math.min(WAVE_SECONDS,t.remaining));}assert.equal(t.phase,'result');assert.equal(t.remaining,0);
t=createTurn('hat');selectLane(t,-8);assert.equal(t.selected,0);selectLane(t,8);assert.equal(t.selected,2);pause(t);assert.equal(selectLane(t,1),false);
console.log(`${n} complete-word simulations plus wrong-letter, miss, pause/resume, timeout and input checks passed.`);
