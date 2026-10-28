import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS,ITEMS,DIFFICULTIES,WorkSession,RewardSession,REWARDS,createLevel,matchesRequest,cleanState,freshState} from '../assets/job-missions/model.mjs';
for(const m of MISSIONS)for(const level of [1,2,3,4])for(const difficulty of Object.keys(DIFFICULTIES))test(`${m.id} level ${level} / ${difficulty}: retries, completion and first-try accuracy`,()=>{
 const run=new WorkSession(m.id,level,difficulty);const expected=run.tasks.length;
 assert.ok(expected>=2);assert.equal(run.next(),false);
 while(!run.done){const t=run.task;assert.ok(t.prompt&&t.options.length>=2);assert.ok(t.options.every(o=>ITEMS[o.picture]));
  if(t.kind==='pack'){assert.ok(t.request.every(id=>t.options.some(o=>o.id===id)));assert.equal(run.answer([]).correct,false);assert.equal(run.next(),false);assert.equal(run.answer(t.request).correct,true);}
  else{assert.ok(t.options.some(o=>o.id===t.target));const wrong=t.options.find(o=>o.id!==t.target);assert.equal(run.answer(wrong.id).correct,false);assert.equal(run.next(),false);assert.equal(run.answer(t.target).correct,true);}
  assert.equal(run.answer(t.target).ignored,true);assert.equal(run.next(),true);
 }
 const summary=run.summary();assert.equal(summary.completed,true);assert.equal(summary.accuracy,0);assert.equal(summary.retries,expected);assert.equal(summary.attempts,expected*2);assert.equal(run.answer('anything').ignored,true);
});
test('A clean run gets first-try credit without racing or penalties',()=>{const run=new WorkSession('helper',4);while(!run.done){run.answer(run.task.kind==='pack'?run.task.request:run.task.target);run.next();}assert.equal(run.summary().accuracy,100);assert.equal(run.summary().retries,0);});
test('Counting checks quantities, including duplicate items',()=>{assert.equal(matchesRequest(['pencil','pencil','folder'],['folder','pencil','pencil']),true);assert.equal(matchesRequest(['pencil','folder','folder'],['folder','pencil','pencil']),false);assert.equal(matchesRequest([],['pencil']),false);});
test('School helper performs three real job tasks in every complete shift',()=>{for(let level=1;level<=4;level++){const t=createLevel('helper',level);assert.equal(t[0].target,'clockIn');assert.equal(t.at(-1).target,'clockOut');assert.ok(t.filter(t=>t.prompt.startsWith('Task ')).length>=3);assert.ok(t.some(t=>t.target==='help'));}});
for(const type of ['memory','socks'])test(`${type}: mismatch retries, matches remain visible, fresh reward after every level`,()=>{
 for(let level=1;level<=4;level++){const r=new RewardSession(type);assert.equal(r.done,false);const a=r.cards[0],b=r.cards.find(c=>c.value!==a.value);assert.equal(r.flip(a.id),'first');assert.equal(r.flip(b.id),'retry');assert.equal(r.flip(r.cards[2].id),'ignored');r.retry();for(const value of new Set(r.cards.map(c=>c.value))){const pair=r.cards.filter(c=>c.value===value);r.flip(pair[0].id);assert.equal(r.flip(pair[1].id),'match');assert.equal(r.flip(pair[0].id),'ignored');}assert.equal(r.done,true);assert.equal(r.matched.length,6);}
});
test('Sorting, puzzle and surprise rewards are completable and start fresh',()=>{const sort=new RewardSession('sort');assert.equal(sort.sort('dairy'),false);for(const id of ['produce','dairy','produce','dairy'])assert.equal(sort.sort(id),true);assert.equal(sort.done,true);const puzzle=new RewardSession('puzzle');assert.equal(puzzle.place(2,0),false);for(let i=0;i<4;i++)assert.equal(puzzle.place(i,i),true);assert.equal(puzzle.done,true);const stars=new RewardSession('surprise');for(let i=0;i<5;i++)stars.reveal();assert.equal(stars.done,true);assert.equal(new RewardSession('surprise').done,false);assert.equal(REWARDS.length,5);});
test('Saved state rejects malformed records and unsafe assignments',()=>{assert.deepEqual(cleanState(null),freshState());assert.equal(cleanState({version:1,code:'<script>',records:[{}],assignment:{mission:'bad',level:90}}).records.length,0);assert.equal(cleanState({version:1,code:'<script>',records:[]}).code,'GUEST');assert.throws(()=>createLevel('bad',1));assert.throws(()=>createLevel('store',5));});
