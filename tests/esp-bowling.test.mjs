import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WORDS, normalizeSettings, newGame, makeQuestion, answerQuestion, setAim, roll, settleRoll, nextTurn, turnInfo, isComplete, leaders, shotResult, challengeForTurn, beginPower, cancelPower, powerAt, practiceReport } from '../assets/esp-bowling/core.mjs';
const solve = (g,id=0) => answerQuestion(g,id,g.teams[id].question.answer);
function bowl(g,id=0) { solve(g,id); setAim(g,id,g.teams[id].challenge.pocket); beginPower(g,id); assert.equal(roll(g,id,g.teams[id].challenge.power),true); settleRoll(g,id); nextTurn(g,id); }
test('settings bound classroom sizes and force exactly two split teams',()=>{
 assert.deepEqual(normalizeSettings({mode:'split',teams:5,players:3,rounds:1,subject:'math'}),{mode:'split',teams:2,players:3,rounds:1,subject:'math',powerMode:'timed',track:'esp'});
 assert.deepEqual(normalizeSettings({mode:'other',teams:99,players:-1,rounds:.1,subject:'invalid'}),{mode:'shared',teams:2,players:4,rounds:2,subject:'mix',powerMode:'timed',track:'esp'});
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
 setAim(g,0,t.challenge.pocket);assert.equal(beginPower(g,0),true);assert.equal(roll(g,0,t.challenge.power),true);assert.equal(roll(g,0),false);assert.equal(nextTurn(g,0),false);assert.equal(settleRoll(g,0),true);assert.equal(settleRoll(g,0),false);assert.equal(t.score,10);assert.equal(t.turns,1);assert.equal(nextTurn(g,0),true);assert.equal(nextTurn(g,0),false);
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
test('aim and power both matter; no universal center strike; goals vary fairly',()=>{
 for(let turn=0;turn<24;turn++){
  const goal=challengeForTurn(turn);assert.equal(shotResult(goal.pocket,goal.power,goal).pins.length,10);
  assert.ok(shotResult(0,goal.power,goal).pins.length<10);assert.ok(shotResult(goal.pocket,10,goal).pins.length<10);
  assert.ok(shotResult(goal.pocket,100,goal).pins.length<10);
  for(let aim=-100;aim<=100;aim+=5)for(let power=10;power<=100;power+=5){const shot=shotResult(aim,power,goal);assert.ok(shot.pins.length>=0&&shot.pins.length<=10);assert.equal(new Set(shot.pins).size,shot.pins.length);}
 }
 assert.ok(new Set(Array.from({length:6},(_,t)=>challengeForTurn(t).pocket)).size>3);
 const g=newGame({mode:'split'});assert.deepEqual(g.teams[0].challenge,g.teams[1].challenge);
});
test('power needs an earned turn; sweep is bounded and cancellation is safe',()=>{
 const g=newGame({teams:1});assert.equal(beginPower(g,0),false);solve(g);assert.equal(roll(g,0,70),false);beginPower(g,0);assert.equal(setAim(g,0,50),false);assert.equal(roll(g,0,NaN),false);assert.equal(cancelPower(g,0),true);assert.equal(g.teams[0].phase,'aim');
 for(let ms=0;ms<15000;ms+=23)assert.ok(powerAt(ms)>=10&&powerAt(ms)<=100);
 assert.equal(powerAt(0),10);assert.equal(powerAt(2400),100);assert.equal(powerAt(4800),10);
});
test('the isolated game does not load identity, monitoring, analytics, or storage',()=>{
 const html=fs.readFileSync(new URL('../esp-bowling.html',import.meta.url),'utf8');const js=fs.readFileSync(new URL('../assets/esp-bowling/game.mjs',import.meta.url),'utf8');
 assert.ok(html.includes('href="extended-school-program.html"'));assert.ok(html.includes('assets/esp-bowling/game.mjs'));assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(|TTMonitor|ttWorld/);assert.doesNotMatch(html,/student\.js|session\.js|tt-room\.js/);
});

test('transition scenarios do not repeat until all 45 are assigned, including a replay',()=>{
 let g=newGame({teams:1,players:12,rounds:3,track:'transition'});const ids=[];
 for(let i=0;i<90;i++){if(isComplete(g))g=newGame(g.settings,g.questionDeck);const q=g.teams[0].question;assert.equal(q.type,'scenario');ids.push(q.id);bowl(g,0);}
 assert.equal(new Set(ids.slice(0,45)).size,45);assert.equal(new Set(ids.slice(45,90)).size,45);
});
test('practice reports preserve every actual response and roll without claiming student identity or delivery',()=>{
 const g=newGame({teams:1,players:1,rounds:1,track:'transition'});const q=g.teams[0].question;answerQuestion(g,0,q.options.find(o=>o!==q.answer));bowl(g,0);const report=practiceReport(g);
 assert.equal(report.attempts.length,2);assert.equal(report.attempts[0].correct,false);assert.equal(report.attempts[1].correct,true);assert.equal(report.attempts[1].attempt,2);assert.equal(report.attempts[0].question,q.prompt);assert.equal(report.outcomes.length,1);assert.equal(report.outcomes[0].pins,10);assert.match(report.attribution,/do not verify/);assert.match(report.delivery,/Not sent/);
 report.attempts[0].options.length=0;assert.equal(g.attempts[0].options.length,3);
});
