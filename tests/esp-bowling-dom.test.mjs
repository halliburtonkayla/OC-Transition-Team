import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import * as core from '../assets/esp-bowling/core.mjs';
import * as art from '../assets/esp-bowling/art.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.SCHOOL_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function harness(){
 const dom=new JSDOM(read('esp-bowling.html'),{url:'https://qa.example/esp-bowling.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,timers=new Map();let timerId=0;
 Object.assign(w,core,art);w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=()=>{};w.setTimeout=fn=>{timers.set(++timerId,fn);return timerId};w.clearTimeout=id=>timers.delete(id);
 w.localStorage.setItem('ttWorld','unchanged');w.sessionStorage.setItem('ttCurrent','private identity');
 const context=dom.getInternalVMContext();vm.runInContext(read('assets/esp-bowling/game.mjs').replace(/^import .*;\n/gm,''),context);
 const run=s=>vm.runInContext(s,context),q=s=>w.document.querySelector(s),click=s=>{assert.ok(q(s),s);q(s).click()},tick=()=>{const item=timers.entries().next().value;assert.ok(item);timers.delete(item[0]);item[1]();};
 const start=(settings={})=>{for(const [key,value] of Object.entries(settings)){if(key==='mode')q(`input[value="${value}"]`).checked=true;else q(`[name="${key}"]`).value=String(value);}q('#setup-form').dispatchEvent(new w.Event('change',{bubbles:true}));q('#setup-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
 const solve=id=>click(`#lane-${id} [data-choice="${run(`game.teams[${id}].question.answer`)}"]`);
 return {dom,w,run,q,click,tick,timers,start,solve};
}
test('shared UI rejects a wrong answer, supports keyboard-compatible aim, and completes a game',()=>{
 const h=harness();h.start({teams:2,players:2,rounds:1});
 const answer=h.run('game.teams[0].question.answer');const wrong=[...h.w.document.querySelectorAll('#lane-0 .answer')].find(b=>b.dataset.choice!==answer);wrong.click();assert.match(h.q('.feedback').textContent,/Try again/);assert.equal(h.q('.roll-button'),null);
 for(let i=0;i<4;i++){const id=i%2;assert.equal(h.q('.player-chip').textContent,`Player ${Math.floor(i/2)+1}`);h.solve(id);const input=h.q('.aim-range');input.value='35';input.dispatchEvent(new h.w.Event('input',{bubbles:true}));assert.equal(h.run(`game.teams[${id}].aim`),35);h.click('[data-action="center"]');h.click('[data-action="roll"]');h.tick();assert.equal(h.q('.result-number').textContent.includes('+10'),true);h.click('[data-action="next"]');}
 assert.equal(h.q('#celebration').hidden,false);assert.match(h.q('#winner').textContent,/tie/);assert.equal(h.run('game.teams[0].score'),20);h.click('#play-again');assert.equal(h.run('game.teams[0].score'),0);assert.equal(h.q('#play').hidden,false);assert.equal(h.w.localStorage.getItem('ttWorld'),'unchanged');assert.equal(h.w.sessionStorage.getItem('ttCurrent'),'private identity');h.dom.window.close();
});
test('split UI keeps the other lane stable and allows sequential independent completion',()=>{
 const h=harness();h.start({mode:'split',players:1,rounds:1,subject:'spelling'});assert.equal(h.w.document.querySelectorAll('.lane').length,2);assert.equal(h.q('[name="teams"]').disabled,true);
 const original=h.q('#lane-1 .answer');h.solve(0);h.click('#lane-0 [data-action="roll"]');assert.equal(h.q('#lane-1 .answer'),original);h.solve(1);assert.equal(h.q('#lane-0 .rolling-copy').textContent,'Here it goes…');h.tick();h.click('#lane-0 [data-action="next"]');assert.match(h.q('#lane-0').textContent,/Cheer for the other team/);assert.equal(h.q('#celebration').hidden,true);h.click('#lane-1 [data-action="roll"]');h.tick();h.click('#lane-1 [data-action="next"]');assert.equal(h.q('#celebration').hidden,false);h.dom.window.close();
});
test('teacher options settle an in-flight roll once; cancel preserves scores; new game clears old timers',()=>{
 const h=harness();h.start({teams:1,players:2,rounds:1});h.solve(0);h.click('[data-action="roll"]');h.click('#settings');assert.equal(h.timers.size,0);assert.equal(h.run('game.teams[0].score'),10);h.click('#cancel-setup');assert.equal(h.q('.result-number').textContent.includes('+10'),true);h.click('[data-action="next"]');h.solve(0);h.click('[data-action="roll"]');h.click('#settings');h.start({players:1});assert.equal(h.timers.size,0);assert.equal(h.run('game.teams[0].score'),0);assert.equal(h.run('game.teams[0].phase'),'question');h.dom.window.close();
});
test('unsupported fullscreen gives an honest expanded-view fallback and Escape exits it',async()=>{
 const h=harness();h.click('#fullscreen');await Promise.resolve();assert.ok(h.w.document.body.classList.contains('immersive'));assert.match(h.q('#display-note').textContent,/On iPhone/);assert.equal(h.q('#fullscreen').getAttribute('aria-pressed'),'true');h.w.document.dispatchEvent(new h.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(h.w.document.body.classList.contains('immersive'),false);h.dom.window.close();
});
test('unavailable speech leaves the question and answer buttons usable',()=>{
 const h=harness();h.start({subject:'spelling'});h.click('[data-action="read"]');assert.match(h.q('.feedback').textContent,/teacher can read/);assert.equal(h.w.document.querySelectorAll('.answer').length,3);h.solve(0);assert.ok(h.q('.roll-button'));h.dom.window.close();
});
