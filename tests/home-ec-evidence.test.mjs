import test from 'node:test';
import assert from 'node:assert/strict';
import {activeClock,ensureEvidence,newEvidence,questionsFor,answerQuestion,practiceReport} from '../assets/home-ec/evidence.mjs';
import {reportHTML} from '../assets/home-ec/report.mjs';
import {initialState,restoreState} from '../assets/home-ec/core.mjs';

test('active participation excludes idle, paused, background and saved wall-clock gaps',()=>{
  let now=0,total=0;const clock=activeClock({now:()=>now,credit:ms=>total+=ms});
  now=10000;clock.flush();assert.equal(total,0,'opening a page records no participation');
  clock.touch();now=20000;clock.flush();assert.equal(total,10000);
  now=100000;clock.flush();assert.equal(total,60000,'input expires after 60 seconds');
  clock.setEnabled(false);now=200000;clock.flush();assert.equal(total,60000);
  clock.setEnabled(true);now=250000;clock.flush();assert.equal(total,60000,'focus alone adds no time');
  clock.touch();now=255000;clock.setEnabled(false);assert.equal(total,65000);
  const restored=activeClock({now:()=>now,credit:ms=>total+=ms});now=999999;restored.flush();assert.equal(total,65000,'no reconstruction on reload');
});

test('old checkpoints gain only new measurements, while recipe, receipt and history remain intact',()=>{
 const raw=initialState();raw.step=4;raw.help=3;raw.completedSteps=['safety','hands'];raw.shopping.receipt={id:'existing'};
 const state=restoreState(raw);const before=JSON.stringify(state.shopping);ensureEvidence(state,'run','2026-11-02T16:00:00Z');
 assert.equal(state.practice.activeMs,0);assert.equal(state.step,4);assert.equal(state.help,3);assert.equal(JSON.stringify(state.shopping),before);
 const bytes=JSON.stringify(state.practice);ensureEvidence(state,'different');assert.equal(JSON.stringify(state.practice),bytes);
});

test('leveled work questions record retries, hints and actual difficulty without inferring observation',()=>{
 const s=initialState();s.practice=newEvidence('r');assert.equal(questionsFor('beginning').length,8);assert.equal(questionsFor('independent').length,11);
 assert.equal(answerQuestion(s,'budget','eight').ok,false,'advanced questions are not assigned at beginning');
 answerQuestion(s,'help','guess','2026-11-02T16:00:00Z');s.questionHints={help:true};answerQuestion(s,'help','ask','2026-11-02T16:01:00Z');
 assert.deepEqual(s.practice.answers.map(a=>a.correct),[false,true]);assert.equal(s.practice.answers[1].hintUsed,true);
 assert.equal(s.practice.answers[0].support,'beginning');s.paused=true;assert.equal(answerQuestion(s,'help','ask').ok,false);
 const r=practiceReport(s,'Student A');assert.equal(r.answers.length,2);assert.equal(r.status,'In progress');assert.equal(r.activeMs,0);assert.equal(r.realWorldComplete,undefined);
 const snapshot=JSON.stringify(r);s.practice.answers.push({id:'cleanup'});assert.equal(JSON.stringify(r),snapshot,'completion snapshots cannot be changed by later work');
});

test('printable individual evidence has name, date, level, status, time, responses and assistance, with escaped text',()=>{
 const s=initialState();s.practice=newEvidence('r','2026-11-02T16:00:00Z');s.practice.activeMs=61500;s.help=1;s.completedSteps=['hands'];s.practice.assistance.push({kind:'Hint',context:'Wash hands',support:'beginning',at:'2026-11-02T16:01:00Z'});answerQuestion(s,'help','ask');
 const report=practiceReport(s,'<script>student</script>','2026-11-02T16:02:00Z'),html=reportHTML(report);
 for(const phrase of ['Student','Report created','Difficulty','Completion status','1 min 1 sec','Questions answered','Ask my teacher for help','Hint','Workplace readiness','Teacher verification'])assert.ok(html.includes(phrase),phrase);
 assert.equal(html.includes('<script>student</script>'),false);assert.ok(html.includes('&lt;script&gt;student'));
 assert.ok(html.includes('not verified attendance'));assert.ok(html.includes('Central'));
});

test('opening a fresh lesson does not invent skills, assistance or completed activities',()=>{const s=initialState();ensureEvidence(s,'fresh');const r=practiceReport(s,'Student');assert.deepEqual(r.skills,[]);assert.equal(r.activeMs,0);assert.equal(r.helpRequests,0);assert.equal(r.cookingSteps.length,0);});
