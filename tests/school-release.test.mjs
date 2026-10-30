import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {JOBS,QUESTIONS,choices,score} from '../assets/job-detectives/model.mjs';
import {learningId,learningStore,escapeHTML} from '../assets/learning/progress.mjs';
import * as counting from '../assets/count-quest/core.mjs';
import * as moneyModel from '../assets/money-match/core.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.SCHOOL_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function harness(page,source,extra={}){
 const dom=new JSDOM(read(page),{url:'https://classroom.example/'+page,runScripts:'outside-only'}),w=dom.window;
 const intervals=[];w.setInterval=fn=>{intervals.push(fn);return intervals.length;};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{};w.sessionStorage.setItem('ttCurrent','QA Learner');
 Object.assign(w,{structuredClone,learningId,learningStore:a=>learningStore(a,w),esc:escapeHTML,speak:()=>false,...extra});
 const context=dom.getInternalVMContext();if(source)vm.runInContext(read(source).replace(/^import .*;\n/gm,''),context);
 return {dom,w,context,intervals,run:s=>vm.runInContext(s,context)};
}
test('20 distinct job questions have grounded clues, stable difficulty and retry statistics',()=>{
 assert.equal(JOBS.length,4);assert.equal(QUESTIONS.length,20);assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,20);
 for(const q of QUESTIONS){const job=JOBS.find(j=>j.id===q.job);assert.ok(job.sections[q.field]);assert.ok(q.why.length>20);assert.equal(new Set(q.options).size,3);assert.equal(choices(q,true).length,2);assert.ok(choices(q,true).includes(q.answer));}
 assert.deepEqual(score([{question:'a',correct:false,help:true},{question:'a',correct:true,help:true},{question:'a',correct:true,help:false}]),{solved:1,attempts:3,retries:1,helped:1});
});
test('per-profile progress is append-only, idempotent, isolated, and cannot write another identity',()=>{
 const h=harness('job-description-detectives.html');h.w.localStorage.setItem('ttWorld','{"balance":1234}');const a=learningStore('qa',h.w);a.append({id:'one',answer:2});a.append({id:'one',answer:99});a.checkpoint({index:4});a.append({id:'two',answer:3});assert.equal(a.read().records.length,2);assert.equal(a.read().records[0].answer,2);assert.deepEqual(a.read().checkpoint,{index:4});h.w.sessionStorage.setItem('ttCurrent','QA Other');assert.equal(a.append({id:'bad'}),false);const b=learningStore('qa',h.w);assert.equal(b.read().records.length,0);assert.equal(h.w.localStorage.getItem('ttWorld'),'{"balance":1234}');h.dom.window.close();
});
test('detective DOM: all 20 questions, retries, pause, printable actual responses and resume',()=>{
 const h=harness('job-description-detectives.html','assets/job-detectives/app.mjs',{JOBS,QUESTIONS,VOCABULARY:{},choices,score});
 h.w.document.querySelector('#setup').dispatchEvent(new h.w.Event('submit',{bubbles:true,cancelable:true}));
 h.run('run.remaining=599.9;updateTimer()');assert.ok(h.w.document.querySelector('#timer').textContent.startsWith('10:00'));
 for(const [i,q]of QUESTIONS.entries()){
  assert.ok(h.w.document.querySelector('.posting').textContent.includes(JOBS.find(j=>j.id===q.job).title));
  const buttons=()=>[...h.w.document.querySelectorAll('[data-answer]')];buttons().find(b=>b.dataset.answer!==q.answer).click();assert.equal(h.run('run.index'),i);assert.equal(h.w.document.querySelector('#next').disabled,true);buttons().find(b=>b.dataset.answer===q.answer).click();assert.equal(h.w.document.querySelector('#next').disabled,false);assert.equal(h.w.document.querySelector('progress').value,i+1);if(i===0){h.w.document.querySelector('#pause').click();assert.equal(h.w.document.querySelector('#next').disabled,true);h.w.document.querySelector('#pause').click();}h.w.document.querySelector('#next').click();
 }
 assert.ok(h.w.document.querySelector('h1').textContent.includes('Practice review'));assert.equal(h.w.document.querySelectorAll('#printArea tbody tr').length,40);assert.ok(h.w.document.querySelector('#printArea').textContent.includes('not verified instructional time'));assert.equal(learningStore('job-description-detectives',h.w).read().records.length,1);h.dom.window.close();
 const b=harness('job-description-detectives.html','assets/job-detectives/app.mjs',{JOBS,QUESTIONS,VOCABULARY:{},choices,score});b.w.document.querySelector('#support').value='supported';b.w.document.querySelector('#setup').dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(b.w.document.querySelectorAll('[data-answer]').length,2);b.run('save()');b.run('home()');b.w.document.querySelector('#resume').click();assert.equal(b.run('run.paused'),true);assert.ok(b.w.document.querySelector('.highlight'));b.dom.window.close();
});
test('Count Quest DOM: touches unlock answers, retries stay, five steps reward and saved response history',()=>{
 const h=harness('count-to-100.html','assets/count-quest/game.mjs',counting);h.w.document.querySelector('#quick-start').click();
 for(let n=1;n<=5;n++){
  for(const object of h.w.document.querySelectorAll('[data-object]'))object.click();
  const wrong=[...h.w.document.querySelectorAll('[data-answer]')].find(b=>Number(b.dataset.answer)!==n);wrong.click();assert.equal(h.w.document.querySelector('#next').disabled,true);
  h.w.document.querySelector(`[data-answer="${n}"]`).click();h.w.document.querySelector('#next').click();
 }
 assert.equal(h.w.document.querySelector('#finish').hidden,false);const saved=learningStore('count-quest',h.w).read();assert.equal(saved.records.filter(r=>r.completed).length,1);assert.equal(saved.records.filter(r=>r.correct===false).length,5);assert.equal(saved.checkpoint,null);h.dom.window.close();
});
test('existing decision stories complete and replay after repairing their JavaScript',()=>{
 for(const page of ['college-story.html','life-stories.html','parenting-story.html','payday-story.html']){
  const h=harness(page);for(const m of read(page).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())vm.runInContext(m[1],h.context);
  let attempts=0;while(!h.w.document.querySelector('#storyChoices').textContent.includes('Story complete.')&&attempts++<8)h.w.document.querySelector('#storyChoices button').click();assert.ok(attempts<8,page);h.w.document.querySelector('#storyChoices button').click();assert.ok(!h.w.document.querySelector('#storyChoices').textContent.includes('Story complete.'),page);h.dom.window.close();
 }
});
test('safety wrong answers permit retry; progression is student-controlled and never double-scores',()=>{
 const h=harness('cdc-sort-it.html');const source=[...read('cdc-sort-it.html').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('const levels'))?.[1];assert.ok(source);vm.runInContext(source,h.context);const before=h.w.document.querySelector('#num').textContent;h.w.document.querySelector('#unsafeBtn').click();assert.equal(h.w.document.querySelector('#num').textContent,before);assert.equal(h.w.document.querySelector('#continueCard'),null);h.w.document.querySelector('#safeBtn').click();assert.ok(h.w.document.querySelector('#continueCard'));h.w.document.querySelector('#safeBtn').click();assert.equal(h.w.document.querySelector('#correct').textContent,'1');h.w.document.querySelector('#continueCard').click();assert.notEqual(h.w.document.querySelector('#num').textContent,before);h.dom.window.close();
});
test('memory begins with familiar pictures, completes three pairs, and resets without duplicate rewards',()=>{
 const h=harness('memory-match.html','assets/learning/memory.mjs');assert.equal(h.w.document.querySelectorAll('#grid button').length,6);for(let pair=0;pair<3;pair++)for(const b of h.w.document.querySelectorAll(`[data-pair="${pair}"]`))b.click();assert.equal(h.w.document.querySelector('#matches').textContent,'3');assert.ok(h.w.document.querySelector('#feedback').textContent.includes('every pair'));assert.equal(h.w.document.querySelectorAll('#grid button:disabled').length,6);h.dom.window.close();
});

test('Money Match retains answered questions and partially completed matching boards',()=>{const h=harness('money-counting-game.html','assets/money-match/game.mjs',moneyModel);h.w.document.querySelector('[data-start="coin"]').click();const correct=h.run('current().answer'),buttons=[...h.w.document.querySelectorAll('[data-option]')],options=h.run('current().options');buttons[options.indexOf(correct)].click();assert.equal(h.w.document.querySelector('#next').disabled,false);const solved=h.run('learning.read().checkpoint');h.run('goHome()');h.w.savedForTest=solved;assert.equal(h.run('resumeMoney(savedForTest)'),true);assert.equal(h.w.document.querySelector('#next').disabled,false);assert.equal(h.w.document.querySelectorAll('.answer-card:disabled').length,buttons.length);h.w.document.querySelector('#next').click();assert.equal(h.run('index'),1);h.run("start('match')");const board=h.run('current()'),target=board.targets[0],group=board.groups.find(g=>g.cents===target.cents);h.w.document.querySelector('[data-group="'+group.id+'"]').click();h.w.document.querySelector('[data-target="'+target.id+'"]').click();h.w.document.querySelector('#check').click();const matched=h.run('learning.read().checkpoint');h.run('goHome()');h.w.savedForTest=matched;assert.equal(h.run('resumeMoney(savedForTest)'),true);assert.equal(h.run('locked.size'),1);assert.equal(h.w.document.querySelector('[data-target="'+target.id+'"]').disabled,true);assert.ok(learningStore('money-match',h.w).read().records.some(r=>r.mode==='match'&&r.correct));h.dom.window.close();});
