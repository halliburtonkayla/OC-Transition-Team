import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORDS, normalizeSettings, newGame, makeQuestion, answerQuestion, setAim, roll, settleRoll, nextTurn, turnInfo, isComplete, leaders, pinsForAim } from '../assets/esp-bowling/core.mjs';
const solve = (g,id=0) => answerQuestion(g,id,g.teams[id].question.answer);
function bowl(g,id=0) { solve(g,id); assert.equal(roll(g,id),true); settleRoll(g,id); nextTurn(g,id); }
test('settings bound classroom sizes and force exactly two split teams',()=>{
 assert.deepEqual(normalizeSettings({mode:'split',teams:5,players:3,rounds:1,subject:'math'}),{mode:'split',teams:2,players:3,rounds:1,subject:'math'});
 assert.deepEqual(normalizeSettings({mode:'other',teams:99,players:-1,rounds:.1,subject:'invalid'}),{mode:'shared',teams:2,players:4,rounds:2,subject:'mix'});
 for(const teams of [1,6])for(const players of [1,12])for(const rounds of [1,3])assert.equal(newGame({teams,players,rounds}).teams.length,teams);
});
test('every question has exactly one correct choice and first-grade math stays in 0–10',()=>{
 for(const subject of ['math','spelling','mix'])for(let t=0;t<36;t++)for(let team=0;team<6;team++){
  const q=makeQuestion(subject,t,team);assert.equal(new Set(q.options).size,3);assert.equal(q.options.filter(a=>a===q.answer).length,1);
  if(q.type==='math'){assert.ok(+q.answer>=0&&+q.answer<=10);assert.equal(+q.answer,q.subtract?q.a-q.b:q.a+q.b);}
  else{assert.ok(WORDS.some(w=>w.word===q.word));assert.equal(q.prompt.split('_').length,2);assert.ok(q.clue);}
 }
});
test('wrong answers cannot earn rolls; double taps cannot award extra points',()=>{
 const g=newGame({teams:2,players:1,rounds:1});const t=g.teams[0];assert.equal(roll(g,0),false);assert.equal(setAim(g,0,50),false);
 assert.equal(answerQuestion(g,0,'wrong'),false);assert.equal(t.phase,'question');assert.equal(t.score,0);assert.equal(t.turns,0);
 assert.equal(answerQuestion(g,1,g.teams[1].question.answer),false);assert.equal(solve(g),true);assert.equal(solve(g),false);
 assert.equal(roll(g,0),true);assert.equal(roll(g,0),false);assert.equal(nextTurn(g,0),false);assert.equal(settleRoll(g,0),true);assert.equal(settleRoll(g,0),false);assert.equal(t.score,10);assert.equal(t.turns,1);assert.equal(nextTurn(g,0),true);assert.equal(nextTurn(g,0),false);
});
test('shared mode rotates every team fairly and gives every numbered player equal turns',()=>{
 for(const teams of [1,2,6])for(const players of [1,4,12])for(const rounds of [1,3]){
  const g=newGame({teams,players,rounds});const seen=Array.from({length:teams},()=>[]);
  for(let i=0;i<teams*players*rounds;i++){const id=g.activeTeam;assert.equal(id,i%teams);seen[id].push(turnInfo(g,g.teams[id]).player);bowl(g,id);}
  assert.equal(isComplete(g),true);for(let id=0;id<teams;id++){assert.equal(g.teams[id].score,players*rounds*10);for(let p=1;p<=players;p++)assert.equal(seen[id].filter(x=>x===p).length,rounds);}
 }
});
test('split lanes are independent, each team must finish, and no multitouch is required',()=>{
 const g=newGame({mode:'split',players:3,rounds:2,subject:'spelling'});
 for(let i=0;i<6;i++)bowl(g,1);assert.equal(g.teams[1].phase,'done');assert.equal(g.teams[0].turns,0);assert.equal(isComplete(g),false);
 for(let i=0;i<6;i++)bowl(g,0);assert.equal(isComplete(g),true);assert.equal(leaders(g).length,2);
});
test('aim is clamped, pin IDs are unique, and score matches visible fallen pins',()=>{
 for(let aim=-100;aim<=100;aim+=5){const pins=pinsForAim(aim);assert.ok(pins.length>=1&&pins.length<=10);assert.equal(new Set(pins).size,pins.length);assert.ok(pins.every(p=>p>=0&&p<10));}
 const g=newGame({teams:1,players:1,rounds:1});solve(g);setAim(g,0,500);assert.equal(g.teams[0].aim,100);assert.equal(setAim(g,0,NaN),false);roll(g,0);const count=g.teams[0].pins.length;settleRoll(g,0);assert.equal(g.teams[0].score,count);nextTurn(g,0);assert.equal(leaders(g)[0].id,0);
});
test('the isolated game does not load identity, monitoring, analytics, or storage',()=>{
 const html=fs.readFileSync(new URL('../esp-bowling.html',import.meta.url),'utf8');const js=fs.readFileSync(new URL('../assets/esp-bowling/game.mjs',import.meta.url),'utf8');
 assert.ok(html.includes('extended-school-program.html'));assert.ok(html.includes('assets/esp-bowling/game.mjs'));assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(|TTMonitor|ttWorld/);assert.doesNotMatch(html,/student\.js|session\.js|tt-room\.js/);
});
