import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import * as C from '../assets/candy-counter/core.mjs';
import {candy,pictures,tableArt} from '../assets/candy-counter/art.mjs';
import {escapeHTML as esc} from '../assets/learning/progress.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.SCHOOL_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function harness(saved){
 const dom=new JSDOM(read('candy-counter.html'),{url:'https://classroom.example/candy-counter.html',runScripts:'outside-only'}),w=dom.window;
 Object.assign(w,{C,candy,pictures,tableArt,esc});w.CSS={escape:s=>s};w.print=()=>{w.dispatchEvent(new w.Event('beforeprint'));};w.URL.createObjectURL=()=> 'blob:qa';w.URL.revokeObjectURL=()=>{};
 w.localStorage.setItem('ttWorld','{"residents":{"Worker A":{"checking":9876}},"businesses":{"cafe":{"balance":123}}}');w.localStorage.setItem('ttShop:test','untouched');w.sessionStorage.setItem('ttCurrent','Worker A');if(saved)w.localStorage.setItem('ttCandyCounter:v1',saved);
 const context=dom.getInternalVMContext();vm.runInContext(read('assets/candy-counter/app.mjs').replace(/^import .*;\n/gm,''),context);
 const run=source=>vm.runInContext(source,context),el=selector=>{const el=w.document.querySelector(selector);assert.ok(el,selector);return el;};
 const click=(action,attrs='')=>{const b=el(`[data-action="${action}"]${attrs}`);assert.equal(b.disabled,false,`${action} enabled`);b.focus();b.click();};
 const submit=(id,data)=>{const f=el('#'+id);for(const [k,v]of Object.entries(data)){const input=f.elements.namedItem(k);assert.ok(input,k);if(input.type==='checkbox')input.checked=v;else input.value=v;}f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
 const change=(id,value)=>{const input=el('#'+id);input.value=value;input.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const state=()=>run('store.read()');return {dom,w,run,el,click,submit,change,state};
}
function worker(h,name='Worker A'){h.submit('worker-form',{worker:name});}
function steps(h,{retry=false}={}){
 const qty=h.state().round.qty;if(retry)h.click('order',`[data-quantity="${qty===1?2:1}"]`);h.click('order',`[data-quantity="${qty}"]`);
 if(retry)h.click('check-pack');for(let i=0;i<qty;i++)h.click('pack','[data-delta="1"]');h.click('check-pack');
 const target=C.targetCoin(h.state().round);if(retry)h.click('coin',`:not([data-coin="${target}"])`);h.click('coin',`[data-coin="${target}"]`);
 const tender=h.state().round.tender;C.moneyBag(tender).forEach((_,i)=>h.click('touch',`[data-index="${i}"]`));assert.equal(h.w.document.activeElement.dataset.action,'payment');
 if(retry)h.click('payment',`[data-amount="${tender+5}"]`);h.click('payment',`[data-amount="${tender}"]`);
 const due=tender-h.state().round.qty*h.state().round.unitPrice;if(due){if(retry){h.click('change',`[data-coin="${due===100?'penny':'one'}"]`);h.click('check-change');h.click('undo');}C.moneyBag(due).forEach(id=>h.click('change',`[data-coin="${id}"]`));}
 h.click('check-change');h.click('complete');
}
test('student controls finish a supported sale, record retries, preserve banks, and resume after refresh',()=>{
 const h=harness();assert.equal(h.el('[data-action="start"]').disabled,true);worker(h);h.click('start');h.click('help');steps(h,{retry:true});const s=h.state();assert.equal(s.transactions.length,1);assert.equal(s.config.physicalStock,0);assert.ok(s.events.some(e=>e.correct===false));assert.equal(h.w.localStorage.getItem('ttShop:test'),'untouched');assert.equal(JSON.parse(h.w.localStorage.getItem('ttWorld')).residents['Worker A'].checking,9876);assert.equal(h.w.sessionStorage.getItem('ttCurrent'),'Worker A');
 h.click('start');h.click('order',`[data-quantity="${h.state().round.qty}"]`);h.click('pack','[data-delta="1"]');assert.equal(h.w.document.activeElement.dataset.action,'pack');const saved=h.w.localStorage.getItem('ttCandyCounter:v1');h.dom.window.close();const resume=harness(saved);assert.equal(resume.state().round.step,'pack');assert.equal(resume.state().round.packed,1);assert.equal(resume.state().transactions.length,1);resume.dom.window.close();
});
test('change checkout, settings, worker switching, observations, physical handoff and printable report use actual controls',()=>{
 const h=harness();worker(h);worker(h,'Worker B');const ids=h.state().workers.map(w=>w.id);h.w.document.querySelector('#teacher-toggle').click();h.submit('config-form',{unitPrice:'25',practiceStock:'8',level:'change',school:'Obion County Central',label:'Library group',realTracking:true,physicalStock:'9'});h.click('counter');h.change('active-worker',ids[0]);h.click('start');h.change('active-worker',ids[1]);steps(h,{retry:true});let s=h.state();const qty=s.transactions[0].qty;assert.equal(s.config.practiceStock,8-qty);assert.equal(s.config.physicalStock,9);h.click('rotate');assert.equal(h.state().workers[0].role,'Inventory worker');
 h.w.document.querySelector('#teacher-toggle').click();h.submit('observation-form',{workerId:ids[1],support:'Picture/model',note:'Counted payment with a picture cue.',next:'Try exact payment next.',reviewer:'Teacher K',confirmed:true});assert.equal(h.state().observations.length,1);const transactionId=h.state().transactions[0].id;h.submit('physical-form',{transactionId,reviewer:'Teacher K',confirmed:true});assert.equal(h.state().config.physicalStock,9-qty);assert.equal(h.el('[name="transactionId"]').options.length,1);
 h.change('report-day','');h.click('print');const report=h.el('#print-report');assert.match(report.textContent,/Counted payment with a picture cue/);assert.match(report.textContent,/Teacher K/);assert.match(report.textContent,/Obion County Central/);assert.match(report.textContent,/simulated sales/);assert.match(report.textContent,/physically handed out/);assert.doesNotMatch(report.innerHTML,/<script/);assert.equal(JSON.parse(h.w.localStorage.getItem('ttWorld')).businesses.cafe.balance,123);h.dom.window.close();
});
test('spoken instructions are optional and missing speech does not block a customer',()=>{
 const h=harness();worker(h);h.click('start');h.click('read');assert.match(h.el('#message').textContent,/Audio is unavailable/);const spoken=[];h.w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};h.w.speechSynthesis={cancel(){},speak(u){spoken.push(u.text)}};const checkbox=h.el('#audio');checkbox.checked=true;checkbox.dispatchEvent(new h.w.Event('change',{bubbles:true}));h.click('order',`[data-quantity="${h.state().round.qty}"]`);h.click('pack','[data-delta="1"]');assert.ok(spoken.some(t=>t==='1'));h.dom.window.close();
});
test('malicious labels and observations print as text; student report excludes another worker’s actions',()=>{
 const h=harness();worker(h,'<img src=x onerror=alert(1)>');const one=h.state().activeWorkerId;worker(h,'Other');const two=h.state().activeWorkerId;h.change('active-worker',one);h.click('start');steps(h);h.w.document.querySelector('#teacher-toggle').click();h.submit('observation-form',{workerId:one,support:'Verbal cue',note:'<script>alert(1)</script>',next:'Repeat',reviewer:'Teacher',confirmed:true});h.change('report-day','');h.change('report-worker',one);h.click('print');assert.equal(h.el('#print-report').querySelector('script'),null);assert.equal(h.el('#print-report').querySelector('img'),null);assert.match(h.el('#print-report').textContent,/<script>alert/);h.change('report-worker',two);h.click('print');assert.match(h.el('#print-report').textContent,/0 practice sales/);h.dom.window.close();
});
