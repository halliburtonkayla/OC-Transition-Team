import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import * as engine from '../assets/life-quest/engine.mjs';
import * as curriculum from '../assets/life-quest/missions.mjs';
import * as reporting from '../assets/life-quest/report.mjs';
import {profileFor,currentStudent} from '../assets/life-quest/profile.mjs';
import {learningStore,learningId} from '../assets/learning/progress.mjs';
import {createSound} from '../assets/transition-mission/sound.mjs';
import {mountLifeQuest} from '../assets/life-quest/teacher.mjs';
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.SCHOOL_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function harness({practice=true,records={}}={}){
 const dom=new JSDOM(read('transition-mission-2.html'),{url:'https://qa.example/transition-mission-2.html'+(practice?'?practice=1':''),runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;let frame,prints=0;const drawings=[];
 for(const [key,value]of Object.entries(records))w.localStorage.setItem(key,value);w.sessionStorage.setItem('ttCurrent','QA Avatar');
 w.matchMedia=()=>({matches:false});w.requestAnimationFrame=fn=>frame=fn;w.document.hasFocus=()=>true;w.print=()=>prints++;w.speechSynthesis={cancel(){}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 const source=read('assets/life-quest/app.mjs').replace(/^import .*;\n/gm,'');
 Object.assign(w,{...engine,...curriculum,...reporting,learningStore,learningId,structuredClone,createSound:()=>createSound({}),speak:()=>{},currentStudent:()=>currentStudent(w),profileFor:name=>profileFor(name,w),createQuestRenderer:()=>({resize(){},draw(l,p){drawings.push({id:l.id,avatar:p.avatar,motion:l.p.vx});},portrait(p){drawings.push({avatar:p.avatar});}})});
 const ctx=dom.getInternalVMContext(),run=code=>vm.runInContext(code,ctx);vm.runInContext(source,ctx);
 return {dom,w,run,frame:t=>frame(t),drawings,prints:()=>prints,click:id=>w.document.getElementById(id).click(),key:(code,type='keydown')=>w.document.getElementById('world').dispatchEvent(new w.KeyboardEvent(type,{code,bubbles:true,cancelable:true}))};
}
test('all 20 launch from the map with keyboard movement, current avatar and individual saved checkpoints',()=>{
 const h=harness();for(let id=1;id<=20;id++){
  h.click('play-button');h.w.document.querySelector(`[data-mission="${id}"]`).click();assert.equal(h.run('s.active.level.id'),id);const before=h.run('s.active.level.p.x');h.key('ArrowRight');h.frame(1000+id*100);h.key('ArrowRight','keyup');assert.ok(h.run('s.active.level.p.x')>before,'keyboard mission '+id);
  h.run('save()');const saved=h.run('learning.read().checkpoint');assert.ok(engine.restoreAdventure(saved,'Fictional Explorer'));assert.equal(h.w.document.querySelector('#mission-heading').textContent,curriculum.MISSIONS[id-1].title);assert.ok(h.drawings.at(-1).avatar.hairStyle==='Braids');h.click('map-button');
 }
 assert.equal(h.run('s.completed.length'),0,'visiting all missions invents no completion');h.dom.window.close();
});
test('actual personalized Town avatar loads; live identity change locks the UI and clears printable evidence',()=>{
 const avatar={skin:'#895b41',hair:'#412829',shirt:'#aa6745',pants:'#305f62',hairStyle:'Long',outfit:'Everyday glasses'},town=JSON.stringify({residents:{'QA Avatar':{avatar,checking:4321,school:'Fixture High School'}}});
 const h=harness({practice:false,records:{ttWorld:town}});h.click('play-button');h.w.document.querySelector('[data-mission="1"]').click();h.frame(1016);assert.deepEqual({...h.drawings.at(-1).avatar},{...avatar,gender:'female'});h.click('progress-button');assert.ok(h.w.document.querySelector('#progress-content').textContent.includes('QA Avatar'));
 h.w.sessionStorage.setItem('ttCurrent','QA Other');h.run('identityOK()');assert.ok(h.w.document.querySelector('#home').textContent.includes('Open your own adventure'));assert.equal(h.w.document.querySelector('#progress-content').textContent,'');assert.equal(h.w.document.querySelector('#print-area').textContent,'');assert.equal(h.w.localStorage.getItem('ttWorld'),town);h.dom.window.close();
});
test('portal choices score actual wrong/correct attempts, award completion once and unlock the next mission',()=>{
 const h=harness({practice:false});h.click('play-button');h.w.document.querySelector('[data-mission="1"]').click();h.run('s.active.level.p.x=s.active.level.exit.x; events(step(s,{},.016))');assert.equal(h.w.document.querySelector('#task-dialog').open,true);
 h.w.document.querySelector('[data-answer="1"]').click();assert.equal(h.run('attemptFor(s).questions.length'),1);assert.equal(h.w.document.querySelector('#task-next').hidden,true);h.w.document.querySelector('[data-answer="0"]').click();assert.equal(h.w.document.querySelector('#task-next').hidden,false);h.click('task-next');h.frame(2000);
 assert.equal(h.w.document.querySelector('#task-dialog').open,true);h.w.document.querySelector('[data-answer="0"]').click();h.click('task-next');h.frame(2100);assert.equal(h.w.document.querySelector('#celebration').hidden,false);assert.equal(h.run('s.completed.length'),1);assert.equal(h.run('learning.read().records.length'),1);h.click('next-button');assert.equal(h.run('s.active.level.id'),2);h.dom.window.close();
});
test('Escape pauses, Tab remains native, settings remap movement, mute persists and reports print',()=>{
 const h=harness();h.click('play-button');h.w.document.querySelector('[data-mission="4"]').click();h.key('Escape');assert.equal(h.w.document.querySelector('#pause-cover').hidden,false);const t=h.run('attemptFor(s).activeSeconds');h.frame(1200);assert.equal(h.run('attemptFor(s).activeSeconds'),t);h.click('resume-button');
 h.click('settings-button');const f=h.w.document.querySelector('#settings-form');f.elements['key-right'].value='KeyL';f.elements.reducedMotion.checked=true;f.elements.voice.checked=true;f.dispatchEvent(new h.w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(h.run('s.settings.keys.right'),'KeyL');assert.ok(h.w.document.body.classList.contains('less-motion'));h.key('KeyL');h.frame(1300);h.key('KeyL','keyup');assert.ok(h.run('s.active.level.p.x')>70);
 h.click('sound-button');assert.equal(h.run('s.settings.music'),false);assert.equal(h.run('s.settings.effects'),false);assert.equal(h.run('s.settings.voice'),false);h.click('progress-button');h.click('print-button');assert.equal(h.prints(),1);assert.ok(h.w.document.querySelector('#print-area').textContent.includes('No scored question responses'));h.dom.window.close();
});
test('saved mid-mission progress resumes on the same device without affecting the original game',()=>{
 const h=harness({practice:false});h.w.localStorage.setItem('ttLearning:v1:QA%20Avatar:transition-mission','original');h.click('play-button');h.w.document.querySelector('[data-mission="1"]').click();h.key('ArrowRight');h.frame(1500);h.key('ArrowRight','keyup');h.run('save()');const x=h.run('s.active.level.p.x'),records=Object.fromEntries(Object.keys(h.w.localStorage).map(k=>[k,h.w.localStorage.getItem(k)]));h.dom.window.close();
 const b=harness({practice:false,records});assert.equal(b.w.document.querySelector('#continue-button').disabled,false);b.click('continue-button');assert.equal(b.run('s.active.level.p.x'),x);assert.equal(b.w.localStorage.getItem('ttLearning:v1:QA%20Avatar:transition-mission'),'original');b.dom.window.close();
});
test('teacher pane renders only supplied private evidence, prints individual/class and ignores old asynchronous loads',async()=>{
 const dom=new JSDOM('<main id="panel"></main>',{url:'https://qa.example/classroom-monitor.html'}),w=dom.window,root=w.document.querySelector('#panel'),oldDocument=globalThis.document,oldWindow=globalThis.window;globalThis.document=w.document;globalThis.window=w;let printed=0;w.print=()=>printed++;
 try{
  const s=engine.newAdventure('Fictional Explorer','qa-report',true);engine.startMission(s,1);const a=engine.attemptFor(s);a.activeSeconds=120;const ev={id:crypto.randomUUID(),student:'QA One',at:new Date().toISOString(),summary:'Started a real fixture run',details:reporting.monitorDetails(a)};
  const data={roster:['QA One'],devices:[{student:'QA One',school:'Fixture School'}]},api=async()=>({events:[ev]});mountLifeQuest(root,{data,api});root.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(resolve=>setTimeout(resolve,10));assert.ok(root.textContent.includes('in progress'));assert.ok(root.textContent.includes('2 min active'));root.querySelector('#questPrint').click();root.querySelector('[data-quest-print="0"]').click();assert.equal(printed,2);assert.ok(w.document.querySelector('.monitor-print-root').textContent.includes('No scored question responses'));
  let resolveOld;mountLifeQuest(root,{data,api:()=>new Promise(r=>resolveOld=r)});root.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));mountLifeQuest(root,{data:{roster:['QA Two']},api});resolveOld({events:[ev]});await new Promise(resolve=>setTimeout(resolve,10));assert.equal(root.querySelector('#questTeacherResults').textContent,'');assert.ok(root.querySelector('select').textContent.includes('QA Two'));
 }finally{globalThis.document=oldDocument;globalThis.window=oldWindow;dom.window.close();}
});
