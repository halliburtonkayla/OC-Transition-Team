import {walkRoad} from './helpers/life-quest-player.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {MISSIONS,DIFFICULTIES} from '../assets/life-quest/missions.mjs';
import {newAdventure,startMission,createLevel,step,interact,answerTask,answerQuestion,attemptFor,restoreAdventure,unlocked,hurt,reward,restartMission,resetPuzzle,settingsValid} from '../assets/life-quest/engine.mjs';
import {attemptReport,reportHTML,monitorDetails,monitorRows,centralRange} from '../assets/life-quest/report.mjs';
import {learningStore} from '../assets/learning/progress.mjs';
import {profileFor} from '../assets/life-quest/profile.mjs';
import {createSound} from '../assets/transition-mission/sound.mjs';
const require=createRequire(import.meta.url),C=require('../assets/classroom-monitor/core.js');
const fictional=(id=1)=>{const s=newAdventure('Fictional Explorer','qa',true);s.settings.difficulty='supported';assert.ok(startMission(s,id));return s;};
function position(s,x,y){Object.assign(s.active.level.p,{x,y,vx:0,vy:0,z:0,vz:0,grounded:true});}
function at(s,id){const st=s.active.level.stations.find(x=>x.id===id);assert.ok(st,id);position(s,st.x,st.y);return interact(s);}
function task(s,id,answer=0){const e=at(s,id).find(e=>e.type==='task');assert.ok(e,'task '+id);return answerTask(s,e,answer);}
function gate(s){for(let i=0;i<5&&attemptFor(s).status==='active';i++){const l=s.active.level;if(l.pending)assert.ok(answerQuestion(s,l.pending.index,0).correct);else{position(s,l.exit.x,l.exit.y);if(l.mode==='side'||l.mode==='roads'||l.mode==='grid')step(s,{},1/60);else interact(s);}}assert.equal(attemptFor(s).status,'completed','mission '+s.active.level.id);}
function run(s,stopWhen){for(let i=0;i<20000;i++){const l=s.active.level;if(stopWhen?.(l)||attemptFor(s).status==='completed')return;if(l.pending){answerQuestion(s,l.pending.index,0);continue;}step(s,{right:l.mode==='side',up:l.mode==='roads'},1/60);}assert.fail('route did not finish');}
export function solveMission(s,id){
 switch(id){
 case 1:case 9:run(s);break;
 case 2:walkRoad(s);gate(s);break;
 case 3:for(const c of s.active.level.items.filter(i=>['supply','key'].includes(i.type))){position(s,c.x,c.y+15);step(s,{},1/60);}gate(s);break;
 case 4:for(let i=0;i<3;i++)task(s,'s'+i,s.active.level.shopping?.[i]?.answer??1);gate(s);break;
 case 5:while(s.active.level.step<s.active.level.orders.length){const o=s.active.level.orders[s.active.level.step];at(s,o.source);at(s,o.target);}gate(s);break;
 case 6:for(const c of s.active.level.items.filter(i=>i.id==='resume'||i.id==='badge')){position(s,c.x,c.y+15);step(s,{},1/60);}at(s,'s2');gate(s);break;
 case 7:for(let i=0;i<4;i++)at(s,'s'+i);gate(s);break;
 case 8:for(let i=0;i<3;i++)task(s,'s'+i);gate(s);break;
 case 10:{run(s,l=>l.phase===1); // Prove the longer running course using actual physics.
   // Test road finish/phase transition separately from traffic collision tests.
   walkRoad(s);assert.equal(s.active.level.phase,2);at(s,'s0');at(s,'s1');gate(s);break;}
 case 11:for(let i=0;i<(s.active.level.budget?.total||600)/200;i++)at(s,'s1');at(s,'s3');at(s,'s4');gate(s);break;
 case 12:at(s,'training');for(let i=0;i<610;i++)step(s,{},1/60);interact(s);gate(s);break;
 case 13:for(let i=0;i<3;i++)task(s,'s'+i);gate(s);break;
 case 14:for(const id of s.active.level.route)at(s,id);gate(s);break;
 case 15:for(const [id,washer]of [['light-shirt','s0'],['dark-shirt','s1']]){const c=s.active.level.items.find(i=>i.id===id);position(s,c.x,c.y);interact(s);at(s,washer);}at(s,'s2');position(s,50,80);for(let i=0;i<365;i++)step(s,{},1/60);at(s,'s3');gate(s);break;
 case 16:for(let i=0;i<3;i++){const c=s.active.level.parcels[i];position(s,c.x,c.y);interact(s);at(s,'bay'+i);}gate(s);break;
 case 17:at(s,'button');position(s,180,365);for(let i=0;i<122;i++)step(s,{},1/60);position(s,480,200);step(s,{},1/60);at(s,'help');gate(s);break;
 case 18:for(let i=0;i<4;i++)at(s,'s'+i);gate(s);break;
 case 19:{const solution=solveGrid(s.active.level.grid);for(const move of solution){step(s,{[move]:true},.05);for(let i=0;i<4;i++)step(s,{},.05);}gate(s);break;}
 case 20:for(let i=0;i<3;i++)task(s,'s'+i);gate(s);break;
 }
 return s;
}
function solveGrid(g){
 const encode=(p,b)=>p.x+','+p.y+'|'+b.map(b=>b.x+','+b.y).sort().join(';'),start={p:g.player,b:g.boxes,path:[]},queue=[start],seen=new Set([encode(start.p,start.b)]);
 for(let n=0;n<queue.length;n++){const {p,b,path}=queue[n];if(g.goals.every(t=>b.some(b=>b.x===t.x&&b.y===t.y)))return path;
  for(const [move,dx,dy]of [['right',1,0],['left',-1,0],['up',0,-1],['down',0,1]]){const p2={x:p.x+dx,y:p.y+dy},wall=(x,y)=>x<0||x>=g.cols||y<0||y>=g.rows||g.walls.some(w=>w.x===x&&w.y===y);if(wall(p2.x,p2.y))continue;
   const b2=structuredClone(b),box=b2.find(b=>b.x===p2.x&&b.y===p2.y);if(box){if(wall(box.x+dx,box.y+dy)||b2.some(b=>b.x===box.x+dx&&b.y===box.y+dy))continue;box.x+=dx;box.y+=dy;}
   const key=encode(p2,b2);if(!seen.has(key)){seen.add(key);queue.push({p:p2,b:b2,path:[...path,move]});}
  }
 }assert.fail('box puzzle has no solution');
}
test('20 distinct mechanics, 40 teachable decisions, ordered unlocks',()=>{
 assert.equal(MISSIONS.length,20);assert.equal(new Set(MISSIONS.map(m=>m.kind)).size,20);
 for(const [i,m]of MISSIONS.entries()){assert.equal(m.id,i+1);assert.equal(m.questions.length,2);for(const q of m.questions){assert.ok(q.why.length>35);assert.ok(q.service);assert.equal(q.options.length,3);}}
 const s=newAdventure('QA Learner');assert.equal(unlocked(s),1);assert.equal(startMission(s,2),false);assert.equal(startMission(s,1),true);
});
for(const m of MISSIONS)test(`mission ${m.id}: ${m.title} has a functional objective and two recorded portal decisions`,()=>{
 const s=solveMission(fictional(m.id),m.id),a=attemptFor(s);assert.equal(a.status,'completed');assert.equal(s.completed[0].mission,m.id);assert.equal(a.questions.length,2);assert.equal(a.questions.filter(q=>q.correct).length,2);assert.ok(restoreAdventure(JSON.parse(JSON.stringify(s)),s.student));
});
test('sequential full adventure, saved resumes, completed-level replay and idempotent unlocks',()=>{
 let s=newAdventure('QA Sequential','qa-campaign');s.settings.difficulty='supported';for(let id=1;id<=20;id++){assert.ok(startMission(s,id));solveMission(s,id);assert.equal(s.completed.length,id);s=restoreAdventure(JSON.parse(JSON.stringify(s)),s.student);assert.ok(s,'restore after '+id);}
 assert.ok(startMission(s,4));solveMission(s,4);assert.equal(s.completed.length,20);assert.equal(s.attempts.length,21);
});
test('replaying a completed level retains unfinished work in a later mission',()=>{
 let s=newAdventure('QA Replay','qa-replay');s.settings.difficulty='supported';startMission(s,1);solveMission(s,1);startMission(s,2);step(s,{right:true},.05);const savedX=s.active.level.p.x,attempt=attemptFor(s).id;startMission(s,1);solveMission(s,1);assert.equal(s.completed.length,1);s=restoreAdventure(JSON.parse(JSON.stringify(s)),s.student);assert.ok(s);startMission(s,2);assert.equal(attemptFor(s).id,attempt);assert.equal(s.active.level.p.x,savedX);assert.equal(s.attempts.length,3);
});
test('all supported movement speeds traverse the hallway and moving-platform route',()=>{
 for(const speed of [120,180,240,300])for(const id of [1,9]){const s=fictional(id);s.settings.speed=speed;run(s);assert.equal(attemptFor(s).status,'completed');assert.equal(attemptFor(s).failures,0,`speed ${speed}, mission ${id}`);}
});
test('movement, jumping and collision detection exist in every mission',()=>{
 for(let id=1;id<=20;id++){const s=fictional(id),l=s.active.level,old={...l.p};step(s,{right:true,jump:true},1/30);assert.notEqual(l.p.x,old.x,'moves in '+id);if(l.mode==='side')assert.ok(l.p.y<old.y);else if(l.mode!=='grid')assert.ok(l.p.z>0);
  if(l.mode!=='grid'){const failures=attemptFor(s).failures;assert.equal(hurt(s,'fixture obstacle').some(e=>e.type==='hurt'),true);assert.equal(attemptFor(s).failures,failures+1);}
 }
 const s=fictional(3),l=s.active.level;position(s,170,250);step(s,{right:true},1/30);assert.ok(l.p.x<=171,'wall blocks side entry');
});
test('traffic collision resets only this mission; three-life loss retains earlier completions and evidence',()=>{
 const s=newAdventure('QA Prior','qa-prior');s.settings.difficulty='supported';startMission(s,1);solveMission(s,1);startMission(s,2);const before=structuredClone(s.completed);s.active.level.p.x=300;const a=attemptFor(s);a.questions.push({index:0,correct:false,skill:'Safety',response:'wait',prompt:'fixture',service:'Workplace Readiness Training',at:new Date().toISOString()});
 for(let i=0;i<3;i++){s.active.level.p.invulnerable=0;hurt(s,'traffic');assert.equal(s.active.level.p.x,480);assert.deepEqual(s.completed,before);}
 assert.equal(s.active.level.lives,3);assert.equal(a.failures,3);assert.equal(a.restarts,3);assert.equal(a.questions.length,1);
});
test('real moving traffic, faster difficulty and later hazards affect actual collision outcomes',()=>{
 const values=[];for(const difficulty of ['supported','standard','challenge']){const s=fictional(2);s.settings.difficulty=difficulty;step(s,{},.05);values.push(s.active.level.hazards[0].x);}assert.ok(values[0]>values[1]&&values[1]>values[2]);
 const s=fictional(2);step(s,{},1/60);const h=s.active.level.hazards.find(h=>h.x>50&&h.x<900);position(s,h.x,h.y+8);step(s,{},1/60);assert.equal(attemptFor(s).failures,1);
 assert.ok(createLevel(20).hazards[0].speed>createLevel(4).hazards[0].speed);
 assert.ok(createLevel(10).width>createLevel(1).width);
});
test('wrong answers, wrong station tasks and active time remain truthful',()=>{
 const s=fictional(4);const t=at(s,'s0').find(e=>e.type==='task');answerTask(s,t,0);assert.equal(s.active.level.done.length,0);assert.equal(attemptFor(s).actions[0].correct,false);answerTask(s,t,1);
 position(s,100,450);step(s,{right:true,active:false},.05);assert.equal(attemptFor(s).activeSeconds,0);step(s,{right:true,active:true},.05);assert.equal(attemptFor(s).activeSeconds,.05);
 task(s,'s1',1);task(s,'s2',1);at(s,'s3');assert.ok(s.active.level.pending);const r=answerQuestion(s,0,1);assert.equal(r.correct,false);assert.ok(r.message.length>20);assert.equal(s.active.level.answered.length,0);answerQuestion(s,0,0);gate(s);
 const report=attemptReport(attemptFor(s),'QA <script>','Fixture School');assert.equal(report.accuracy,67);assert.ok(report.needs.includes('Comparing prices'));assert.ok(reportHTML([report]).includes('&lt;script&gt;'));assert.equal(reportHTML([report]).includes('<script>'),false);
});
test('special mechanics cannot be skipped by visiting their exit',()=>{
 for(const id of [3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,20]){const s=fictional(id);if(id===10)s.active.level=createLevel(10,2);position(s,s.active.level.exit.x,s.active.level.exit.y);interact(s);assert.equal(s.completed.length,0);assert.equal(s.active.level.pending,null,'mission '+id+' cannot skip physical objectives');}
 const s=fictional(19);assert.ok(solveGrid(s.active.level.grid).length>=12);step(s,{right:true},.05);assert.ok(resetPuzzle(s));assert.deepEqual(s.active.level.grid.player,{x:1,y:4});assert.equal(attemptFor(s).actions.at(-1).correct,false);
});
test('every station and necessary item has a collision-free approach',()=>{
 for(const id of [3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,20]){const l=createLevel(id,id===10?2:0),walls=l.walls.filter(w=>!w.gate),blocked=(x,y)=>x<25||x>935||y<55||y>510||walls.some(w=>x+14>w.x&&x-14<w.x+w.w&&y>w.y&&y-26<w.y+w.h),queue=[[l.p.x,l.p.y]],seen=new Set();
  for(let n=0;n<queue.length;n++){const [x,y]=queue[n],key=Math.round(x/15)+','+Math.round(y/15);if(seen.has(key))continue;seen.add(key);for(const [dx,dy]of [[15,0],[-15,0],[0,15],[0,-15]])if(!blocked(x+dx,y+dy)&&!seen.has(Math.round((x+dx)/15)+','+Math.round((y+dy)/15)))queue.push([x+dx,y+dy]);}
  for(const target of [...l.stations,...l.items.filter(i=>['supply','key','clothes'].includes(i.type))])assert.ok(queue.some(([x,y])=>Math.hypot(x-target.x,y-target.y)<65),`mission ${id}, target ${target.id}`);
 }
});
test('saves isolate identities, original progress and the Town ledger; avatar reads are non-mutating',()=>{
 const local=new Map(),session=new Map([['ttCurrent','QA One']]),storage=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)}),host={localStorage:storage(local),sessionStorage:storage(session)};
 const avatar={skin:'#765432',hair:'#123456',shirt:'#654321',pants:'#234567',hairStyle:'Braids',outfit:'Everyday glasses'};
 host.localStorage.setItem('ttWorld',JSON.stringify({residents:{'QA One':{avatar,checking:4321},'QA Two':{checking:123}}}));host.localStorage.setItem('ttLearning:v1:QA%20One:transition-mission','original sentinel');const before=[...local.entries()];
 const p=profileFor('QA One',host);assert.deepEqual(p.avatar,{...avatar,gender:'female'});assert.deepEqual([...local.entries()],before);assert.equal(profileFor('QA Missing',host).source,'Adventure default');
 const one=learningStore('transition-mission-2',host);one.checkpoint(newAdventure('QA One'));session.set('ttCurrent','QA Two');assert.equal(one.checkpoint(newAdventure('QA Two')),false);const two=learningStore('transition-mission-2',host);assert.equal(two.read().checkpoint,null);assert.equal(restoreAdventure(one.read().checkpoint,'QA Two'),null);for(const [key,value]of before)assert.equal(local.get(key),value);
});
test('corrupt saves and invalid controls are rejected without trusting future unlocks',()=>{
 const s=fictional(3);for(const patch of [{student:'Other'},{completed:[{mission:20,at:'bad'}]},{settings:{...s.settings,speed:Infinity}},{active:{...s.active,level:{...s.active.level,lives:0}}},{active:{...s.active,level:{...s.active.level,p:{...s.active.level.p,x:NaN}}}}])assert.equal(restoreAdventure({...s,...patch},s.student),null);
 const invalid=structuredClone(s.settings);invalid.keys.left=invalid.keys.right;assert.equal(settingsValid(invalid),false);
});
test('restarting and resuming cannot farm the same collectible',()=>{
 let s=fictional(1);const c=s.active.level.items[0];reward(s,c);const stars=attemptFor(s).stars,points=attemptFor(s).points;reward(s,c);assert.equal(attemptFor(s).stars,stars);restartMission(s);reward(s,s.active.level.items[0]);assert.equal(attemptFor(s).stars,stars);assert.equal(attemptFor(s).points,points);s=restoreAdventure(JSON.parse(JSON.stringify(s)),s.student);assert.ok(s);assert.equal(attemptFor(s).stars,stars);
});
test('dashboard transport survives the existing service sanitizer and does not infer completions',()=>{
 const s=fictional(4);const a=attemptFor(s),at=new Date().toISOString(),base={id:crypto.randomUUID(),at,kind:'action',page:'transition-mission-2.html',summary:'Fixture mission snapshot',student:'QA One'};
 let details=monitorDetails(a);assert.equal(details.task,'');const clean=C.cleanEvent({...base,details});assert.equal(clean.details.step,4);assert.equal(clean.details.action,'transition-mission-2');let rows=monitorRows([{...clean,student:'QA One'}],{'QA One':'Fixture School'});assert.equal(rows[0].status,'in progress');assert.equal(rows[0].accuracy,null);assert.equal(rows[0].skills.length,0);
 solveMission(s,4);details=monitorDetails(a,'completed');const completed={...C.cleanEvent({...base,id:crypto.randomUUID(),kind:'completed',details}),student:'QA One'};rows=monitorRows([completed,{...clean,student:'QA One'}],{'QA One':'Fixture School'});assert.equal(rows.length,1);assert.equal(rows[0].status,'completed');assert.equal(rows[0].accuracy,100);assert.equal(rows[0].school,'Fixture School');assert.equal(rows[0].points,a.points);assert.equal(rows[0].settings.difficulty,'supported');
 const other={...completed,student:'QA Two'};assert.equal(monitorRows([completed,other]).length,2);
});
test('original synthesized sound honors mute, volume, music and cleanup',()=>{
 let notes=0,created=0;const timers=new Map(),param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});class AC{constructor(){created++;this.currentTime=0;this.destination={};}createGain(){return {gain:param(),connect(){},disconnect(){}};}createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){notes++;},stop(){}};}resume(){return Promise.resolve();}}
 const sound=createSound({AudioContext:AC,setInterval:fn=>{timers.set(1,fn);return 1;},clearInterval:id=>timers.delete(id)});sound.configure({music:false,effects:false,volume:0});sound.effect('star');assert.equal(created,0);sound.configure({music:true,effects:true,volume:.4});sound.effect('finish');sound.music(true);assert.ok(notes>=7);assert.equal(timers.size,1);sound.stop();assert.equal(timers.size,0);
});
test('teacher report ranges use Central time through both daylight saving changes',()=>{
 const fall=centralRange('2026-11-01','2026-11-01'),spring=centralRange('2026-03-08','2026-03-08'),regular=centralRange('2026-11-04','2026-11-04');assert.equal((Date.parse(fall.to)-Date.parse(fall.from)+1)/3600000,25);assert.equal((Date.parse(spring.to)-Date.parse(spring.from)+1)/3600000,23);assert.equal(regular.from,'2026-11-04T06:00:00.000Z');
});
test('integration keeps both launchers, original source dependencies and private teacher gating',()=>{
 const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');for(const p of ['game-zone.html','transition-town.html','assets/school-directory/catalogue.mjs']){assert.ok(read(p).includes('transition-mission-2.html'));assert.ok(read(p).includes('transition-mission.html'));}
 const teacher=read('assets/classroom-monitor/teacher.js');assert.ok(teacher.includes("['life-quest','Transition Mission 2.0']"));assert.ok(teacher.includes("view==='life-quest'&&!!user&&!!data"));assert.ok(read('assets/classroom-monitor/student.js').includes('transition-mission(?:-2)?'));
 for(const file of ['app.mjs','engine.mjs','profile.mjs','report.mjs'])assert.equal(/(?:setItem\(['"]ttWorld|localStorage\.ttWorld\s*=)/.test(read('assets/life-quest/'+file)),false);
});
