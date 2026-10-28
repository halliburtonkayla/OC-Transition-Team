import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {MONEY,COINS,total,dollars,spokenAmount,coinQuestions,countQuestions,matchBoards,QuizProgress,placeGroup,checkMatches} from '../assets/money-match/core.mjs';
const seeded=n=>()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
test('money values and the photographed matching amounts are exact',()=>{
 assert.deepEqual(COINS.map(id=>MONEY[id].cents),[1,5,10,25]);
 assert.deepEqual(matchBoards('mixed')[0].targets.map(t=>t.cents),[126,81,16,580,26]);
 assert.equal(dollars(126),'$1.26');assert.equal(spokenAmount(101),'1 dollar and 1 cent');assert.equal(spokenAmount(10),'10 cents');
});
test('every generated coin round has one correct choice and covers all four coins',()=>{
 for(let seed=0;seed<100;seed++)for(const choices of [2,3]){
  const questions=coinQuestions(choices,seeded(seed));assert.equal(questions.length,10);
  assert.equal(new Set(questions.map(q=>q.answer)).size,4);
  for(const q of questions){assert.equal(q.options.length,choices);assert.equal(new Set(q.options).size,choices);assert.equal(q.options.filter(o=>o===q.answer).length,1);}
 }
});
test('counting rounds have exact integer totals and unique positive answers',()=>{
 for(let seed=0;seed<100;seed++)for(const level of ['coins','mixed'])for(const choices of [2,3]){
  const questions=countQuestions(level,choices,seeded(seed));assert.equal(questions.length,10);
  for(const q of questions){assert.equal(total(q.items),q.answer);assert.ok(Number.isInteger(q.answer));assert.equal(q.options.length,choices);assert.equal(new Set(q.options).size,choices);assert.ok(q.options.every(x=>Number.isInteger(x)&&x>0));assert.equal(q.options.filter(x=>x===q.answer).length,1);if(level==='coins')assert.ok(q.items.every(x=>MONEY[x].kind==='coin'));}
 }
});
test('matching boards always provide one group per unique amount and can be completed',()=>{
 for(const level of ['coins','mixed'])for(let seed=0;seed<30;seed++)for(const b of matchBoards(level,seeded(seed))){
  assert.equal(new Set(b.targets.map(t=>t.cents)).size,b.targets.length);
  assert.equal(b.groups.length,b.targets.length);let a={};
  for(const t of b.targets){const g=b.groups.find(g=>total(g.items)===t.cents);assert.ok(g);a=placeGroup(a,t.id,g.id,b);}
  assert.deepEqual(checkMatches(a,b),{correct:b.targets.map(t=>t.id),incorrect:[],missing:[]});
 }
});
test('retries do not multiply scores; a new quiz resets progress',()=>{
 const p=new QuizProgress(2);p.answer(0,false);p.answer(0,true);p.answer(0,true);p.answer(1,true);p.answer(1,true);
 assert.equal(p.solved.size,2);assert.equal(p.firstTry,1);assert.deepEqual(p.attempts,[2,1]);
 assert.equal(p.answer(-1,true),false);assert.equal(p.answer(3,true),false);
 assert.equal(new QuizProgress(2).solved.size,0);
});
test('placing, replacing, locking and invalid drops preserve one-to-one matches',()=>{
 const b=matchBoards('mixed',seeded(9))[0],[t1,t2]=b.targets,[g1,g2]=b.groups;
 let a=placeGroup({},t1.id,g1.id,b);a=placeGroup(a,t2.id,g1.id,b);
 assert.equal(a[t1.id],undefined);assert.equal(a[t2.id],g1.id);
 a=placeGroup(a,t2.id,g2.id,b);assert.equal(Object.values(a).includes(g1.id),false);
 const locked=new Set([t2.id]);assert.deepEqual(placeGroup(a,t2.id,g1.id,b,locked),a);assert.deepEqual(placeGroup(a,t1.id,g2.id,b,locked),a);
 assert.deepEqual(placeGroup(a,'unknown',g1.id,b),a);assert.deepEqual(placeGroup(a,t1.id,'external-text',b),a);
});
test('incomplete and incorrect matches are distinguished from correct matches',()=>{
 const b=matchBoards('coins',seeded(1))[0],[t1,t2]=b.targets;
 const wrong=b.groups.find(g=>g.cents!==t1.cents),right=b.groups.find(g=>g.cents===t2.cents);
 const r=checkMatches({[t1.id]:wrong.id},b);assert.deepEqual(r.incorrect,[t1.id]);assert.equal(r.missing.length,2);
 assert.deepEqual(checkMatches({[t2.id]:right.id},b,new Set([t2.id])).correct,[]);
});
test('school integration preserves routes and every money picture exists locally',()=>{
 const root=new URL('../',import.meta.url),page=readFileSync(new URL('money-counting-game.html',root),'utf8');
 assert.match(page,/transition-town\.html\?school=1/);assert.match(page,/assets\/classroom-monitor\/student\.js/);
 assert.match(readFileSync(new URL('cdc-center.html',root),'utf8'),/href="money-counting-game.html"/);
 assert.match(readFileSync(new URL('assets/school-directory/catalogue.mjs',root),'utf8'),/money-counting-game\.html','Money Match/);
 for(const m of Object.values(MONEY))assert.ok(existsSync(new URL('assets/money-match/'+m.image,root)),m.image);
});
