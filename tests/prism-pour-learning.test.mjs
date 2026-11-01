import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS,QUESTIONS,questionById,questionsForRound,makeRound,answerQuestion,roundPassed,summarize} from '../assets/prism-pour/transition-data.mjs';
import {reportHTML} from '../assets/prism-pour/lesson-report.mjs';
const session=()=>({id:'test-record-123',student:'Test student',school:'Test school',teacher:'Test teacher',goal:3,focus:'mixed',startedAt:'2026-11-01T20:00:00Z',endedAt:null,status:'active',activeMs:65000,rounds:[],notes:''});

test('60 unique questions are complete and balanced across the five practice areas',()=>{
 assert.equal(QUESTIONS.length,60);assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,60);
 for(const a of AREAS)assert.equal(QUESTIONS.filter(q=>q.area===a.id).length,12);
 for(const q of QUESTIONS){assert.equal(q.options.length,3);assert.ok(q.prompt&&q.clue&&q.explanation);assert.ok(q.options[q.answer]);assert.equal(new Set(q.options.map(o=>o.text)).size,3);}
 assert.equal(new Set(QUESTIONS.map(q=>q.answer)).size,3);
});

test('a ten-level mixed lesson has 30 distinct questions and covers every area',()=>{
 const ids=Array.from({length:10},(_,i)=>questionsForRound(i)).flat();assert.equal(ids.length,30);assert.equal(new Set(ids).size,30);
 assert.equal(new Set(ids.map(id=>questionById(id).area)).size,5);
 for(const a of AREAS)assert.ok(questionsForRound(0,a.id).every(id=>questionById(id).area===a.id));
});

test('retries preserve the first response and a checkpoint requires all three correct answers',()=>{
 const r=makeRound(1,0,'mixed',{},'round1');assert.equal(roundPassed(r),false);
 const q=questionById(r.questions[0].id);r.questions[0]=answerQuestion(r.questions[0],(q.answer+1)%3);
 assert.equal(roundPassed(r),false);r.questions[0]=answerQuestion(r.questions[0],q.answer);
 assert.equal(r.questions[0].attempts[0].correct,false);assert.equal(r.questions[0].attempts[1].correct,true);
 assert.equal(roundPassed(r),false);
 for(let i=1;i<3;i++)r.questions[i]=answerQuestion(r.questions[i],questionById(r.questions[i].id).answer);
 assert.equal(roundPassed(r),true);
 assert.equal(answerQuestion(r.questions[0],(q.answer+2)%3).attempts.length,2,'A correct question cannot be answered again to alter its result');
});

test('reports separate first-try accuracy, eventual correctness, unattempted questions, and supports',()=>{
 const s=session(),r=makeRound(1,0,'mixed',{moves:7,pours:8},'r1');s.rounds.push(r);
 const q=questionById(r.questions[0].id);r.questions[0]=answerQuestion(r.questions[0],(q.answer+1)%3);r.questions[0]=answerQuestion(r.questions[0],q.answer);r.questions[0].helpRequests=1;
 r.questions[1]=answerQuestion(r.questions[1],questionById(r.questions[1].id).answer);r.questions[1].readAloud=2;
 const stats=summarize(s);assert.equal(stats.assigned,3);assert.equal(stats.answered,2);assert.equal(stats.firstCorrect,1);assert.equal(stats.firstPercent,50);assert.equal(stats.eventualCorrect,2);assert.equal(stats.passed,0);assert.equal(stats.helpRequests,1);assert.equal(stats.readAloud,2);
 const html=reportHTML(s);assert.ok(html.includes('Checkpoint unfinished'));assert.ok(html.includes('Not answered'));assert.ok(html.includes('Needs practice'));assert.ok(html.includes('50%'));assert.ok(html.includes('1m 05s'));
});

test('student names and teacher notes are escaped in printable reports',()=>{
 const s=session();s.student='<script>alert(1)</script>';s.notes='<img src=x onerror=alert(1)>';
 const html=reportHTML(s);assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img '));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;img'));
});

test('three completed rounds aggregate nine answers across all five areas',()=>{
 const s=session();
 for(let i=0;i<3;i++){const r=makeRound(i+1,i,'mixed',{pours:7,moves:7},`round-${i}`);r.questions=r.questions.map(record=>answerQuestion(record,questionById(record.id).answer));s.rounds.push(r);}
 const stats=summarize(s);assert.equal(stats.passed,3);assert.equal(stats.answered,9);assert.equal(stats.firstCorrect,9);assert.equal(stats.byArea.filter(a=>a.answered).length,5);
});

test('unattempted answer keys are withheld in a live report and available after the session',()=>{
 const s=session();s.rounds.push(makeRound(1,0,'mixed',{},'r1'));
 const before=reportHTML(s);assert.equal(before.includes('<strong>Answer key:</strong>'),false);
 s.status='ended_early';assert.equal(reportHTML(s).includes('<strong>Answer key:</strong>'),true);
});
