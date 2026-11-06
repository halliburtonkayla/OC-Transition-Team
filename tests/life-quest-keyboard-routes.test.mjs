import {createTouchControls} from '../assets/life-quest/touch-controls.mjs';
import {roadGap,roadInput} from './helpers/life-quest-player.mjs';
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
const require=createRequire(import.meta.url),{JSDOM}=require(process.env.SCHOOL_JSDOM||'jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

// Exercise the shipped keyboard handlers and animation loop, never assign positions,
// objective flags, inventory, lives, unlocked missions, or completed records.
class KeyboardPlayer {
 constructor(id,{practice=true,difficulty='supported',local={},session={}}={}){this.practice=practice;this.requestedDifficulty=difficulty;this.frames=0;this.roundTrips=0;this.open(id,local,session);}
 open(id,local={},session={},resume=false){
  this.dom=new JSDOM(read('transition-mission-2.html'),{url:'https://qa.example/transition-mission-2.html'+(this.practice?'?practice=1':''),runScripts:'outside-only',pretendToBeVisual:true});
  const w=this.w=this.dom.window;this.t=0;this.pressed={};
  for(const [key,value]of Object.entries(local))w.localStorage.setItem(key,value);for(const [key,value]of Object.entries(session))w.sessionStorage.setItem(key,value);
  if(!this.practice)w.sessionStorage.setItem('ttCurrent','QA Career Explorer');
  w.matchMedia=()=>({matches:false});w.requestAnimationFrame=fn=>this.frame=fn;w.document.hasFocus=()=>true;w.print=()=>{};w.speechSynthesis={cancel(){}};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  Object.assign(w,{createTouchControls,...engine,...curriculum,...reporting,learningStore,learningId,structuredClone,createSound:()=>createSound({}),speak:()=>{},currentStudent:()=>currentStudent(w),profileFor:name=>profileFor(name,w),createQuestRenderer:()=>({resize(){},draw:(_level,profile)=>{this.drawnAvatar=profile.avatar;},portrait(){}})});
  this.context=this.dom.getInternalVMContext();vm.runInContext(read('assets/life-quest/app.mjs').replace(/^import .*;\n/gm,''),this.context);
  if(resume)this.click('continue-button');else{w.document.querySelector(`[data-difficulty="${this.requestedDifficulty}"]`).click();this.click('play-button');w.document.querySelector(`[data-district="${Math.floor((id-1)/5)}"]`).click();w.document.querySelector(`[data-mission="${id}"]`).click();}
  if(!resume)this.input({});
 }
 get state(){return vm.runInContext('s',this.context);}
 get level(){return this.state.active.level;}
 get attempt(){return engine.attemptFor(this.state);}
 get complete(){return this.attempt.status==='completed';}
 click(id){this.w.document.getElementById(id).click();}
 key(code,type){this.w.document.getElementById('world').dispatchEvent(new this.w.KeyboardEvent(type,{code,bubbles:true,cancelable:true}));}
 input(next={},seconds=.05){
  const codes={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jump:'Space',sprint:'ShiftLeft'};
  for(const [action,code]of Object.entries(codes)){if(this.pressed[action]&&!next[action])this.key(code,'keyup');if(next[action]&&!this.pressed[action])this.key(code,'keydown');}
  this.pressed={...next};this.t+=seconds*1000;this.frame(this.t);this.frames++;
  assert.ok(this.frames<26000,`Mission ${this.level.id} did not complete: ${engine.objective(this.level)} at ${Math.round(this.level.p.x)},${Math.round(this.level.p.y)}`);
  if(this.frames>=20&&!this.roundTrips&&!this.complete&&!this.w.document.querySelector('dialog[open]'))this.reopen();
 }
 reopen(){
  const id=this.level.id,before=JSON.stringify(this.level),attempt=this.attempt.id;
  this.w.dispatchEvent(new this.w.Event('pagehide'));
  const snapshot=storage=>Object.fromEntries(Object.keys(storage).map(key=>[key,storage.getItem(key)])),local=snapshot(this.w.localStorage),session=snapshot(this.w.sessionStorage);
  this.roundTrips++;this.dom.window.close();this.open(id,local,session,true);
  assert.equal(this.attempt.id,attempt);assert.equal(JSON.stringify(this.level),before,'Reload must restore the actual in-progress mission, not a fresh level');
 }
 resolve(){
  if(!this.w.document.querySelector('#task-dialog').open)return false;
  const task=vm.runInContext('task',this.context),answer=task.type==='question'?engine.questionsFor(this.level)[task.index].answer:task.answers[0];
  this.w.document.querySelector(`[data-answer="${answer}"]`).click();assert.equal(this.w.document.querySelector('#task-next').hidden,false);this.click('task-next');this.pressed={};this.input({});return true;
 }
 enter(){this.input({});this.key('Enter','keydown');this.key('Enter','keyup');this.resolve();}
 wait(seconds){for(let i=0;i<Math.ceil(seconds/.05)&&!this.complete;i++){if(!this.resolve())this.input({});}}
 go(target,{radius=30,timeout=100}={}){
  let route=[],planned=-100;const phase=this.level.phase,mode=this.level.mode;
  for(let i=0;i<timeout/.05&&!this.complete;i++){
   if(this.resolve())continue;if(this.level.phase!==phase||this.level.mode!==mode)return false;
   const p=this.level.p,destination=typeof target==='function'?target():target;if(!destination)return false;
   if(Math.hypot(p.x-destination.x,p.y-destination.y)<=radius){this.input({});return true;}
   if(i-planned>=4||!route.length){route=path(this.level,destination,this.state.settings.difficulty);planned=i;}
   while(route.length&&Math.hypot(p.x-route[0].x,p.y-route[0].y)<9)route.shift();
   const goal=route[0];if(!goal){this.input({});continue;}
   const dx=goal.x-p.x,dy=goal.y-p.y;this.input({right:dx>4,left:dx< -4,down:dy>4,up:dy< -4});
  }
  if(this.complete)return true;
  assert.fail(`Mission ${this.level.id} cannot reach target: ${JSON.stringify(typeof target==='function'?target():target)} from ${Math.round(this.level.p.x)},${Math.round(this.level.p.y)}. ${engine.objective(this.level)}`);
 }
 station(id){assert.ok(this.go(()=>this.level.stations.find(s=>s.id===id),{radius:45}));this.enter();}
 exit(){this.go(()=>this.level.exit,{radius:40});for(let i=0;i<8&&!this.complete;i++){this.resolve();this.enter();}assert.ok(this.complete,`Mission ${this.level.id} exit: ${engine.objective(this.level)}`);}
 runSide(){const phase=this.level.phase;while(!this.complete&&this.level.mode==='side'&&this.level.phase===phase){if(!this.resolve())this.input({right:true});}}
 crossRoads(){const phase=this.level.phase;const travel=target=>{if(this.complete||this.level.phase!==phase)return;let found=false;for(let n=0;n<900;n++){if(roadGap(this.state,target)){found=true;break;}this.wait(.1);}assert.ok(found,'No safe keyboard crossing gap to '+JSON.stringify(target)+' from '+JSON.stringify(this.level.p)+' with '+JSON.stringify(this.level.walls));for(let n=0;n<1800&&!this.complete&&this.level.phase===phase;n++){if(this.resolve())continue;const input=roadInput(this.state,target);if(!input)return;const p=this.level.p,d=input.right||input.left?Math.abs(target.x-p.x):Math.abs(target.y-p.y);this.input(input,Math.min(.05,d/this.state.settings.speed));} };travel({x:this.level.p.x,y:360});if(this.level.walls.length)travel({x:this.level.walls[0].x+this.level.walls[0].w+55,y:this.level.p.y});travel({x:this.level.p.x,y:270});if(this.level.road)travel({x:this.level.road.passX,y:270});travel({x:this.level.p.x,y:180});if(this.level.road?.required===2)travel({x:960-this.level.road.passX,y:180});travel({x:this.level.p.x,y:75});travel({x:this.level.exit.x,y:60});for(let i=0;i<8&&!this.complete&&this.level.phase===phase;i++){if(!this.resolve())this.input({});}}
 collect(){
  while(this.level.items.some(i=>['supply','key'].includes(i.type)&&!i.taken)){
   const id=this.level.items.find(i=>['supply','key'].includes(i.type)&&!i.taken).id;
   this.go(()=>{const c=this.level.items.find(c=>c.id===id);return {x:c.x,y:c.y+15};},{radius:12});
   assert.ok(this.level.items.find(c=>c.id===id).taken,'Walking to the actual item must collect it');
  }
 }
 close(){this.dom.window.close();}
}

function path(l,target,difficulty){
 const spacing=20,cols=46,rows=23,point=i=>({x:30+(i%cols)*spacing,y:60+Math.floor(i/cols)*spacing});
 const index=(x,y)=>Math.max(0,Math.min(cols-1,Math.round((x-30)/spacing)))+cols*Math.max(0,Math.min(rows-1,Math.round((y-60)/spacing)));
 const factor=curriculum.DIFFICULTIES[difficulty].hazard;
 const blocks=l.walls.filter(w=>!(w.gate&&l.flags.gateOpen)).map(w=>({...w}));
 for(const h of l.hazards){
  const future=l.time+.22;let x=h.x,y=h.y;
  if(h.axis==='loop')x=((h.homeX+70+future*h.speed*factor)%1100+1100)%1100-70;
  else if(h.axis==='x')x=h.homeX+Math.sin(future*(Math.abs(h.speed)/90)*factor)*h.range;
  else y=h.homeY+Math.sin(future*(Math.abs(h.speed)/90)*factor)*h.range;
  if(Math.abs(x-h.x)>150)x=h.x;
  blocks.push({x:Math.min(x,h.x)-h.w/2-6,y:Math.min(y,h.y)-h.h/2-6,w:h.w+Math.abs(x-h.x)+12,h:h.h+Math.abs(y-h.y)+12});
 }
 const blocked=p=>blocks.some(b=>p.x+16>b.x&&p.x-16<b.x+b.w&&p.y>b.y&&p.y-27<b.y+b.h);
 const start=index(l.p.x,l.p.y),end=index(target.x,target.y),cost=new Map([[start,0]]),prev=new Map(),open=[start],closed=new Set();
 const heuristic=i=>{const p=point(i);return Math.abs(p.x-target.x)+Math.abs(p.y-target.y);};
 let reached=null;
 while(open.length){
  open.sort((a,b)=>cost.get(a)+heuristic(a)-cost.get(b)-heuristic(b));const n=open.shift();if(closed.has(n))continue;closed.add(n);const p=point(n);
  if(n===end||Math.hypot(p.x-target.x,p.y-target.y)<15){reached=n;break;}
  for(const d of [-cols,cols,-1,1]){const next=n+d;if(next<0||next>=cols*rows||Math.abs(d)===1&&Math.floor(next/cols)!==Math.floor(n/cols)||closed.has(next))continue;const np=point(next);if(blocked(np))continue;
   const value=cost.get(n)+spacing;if(value<(cost.get(next)??Infinity)){cost.set(next,value);prev.set(next,n);open.push(next);}
  }
 }
 if(reached===null)return [];
 const out=[];for(let n=reached;n!==start;n=prev.get(n)){if(n===undefined)return [];out.push(point(n));}out.reverse();
 if(!blocked(target))out.push({...target});return out;
}

function gridSolution(g){
 const key=(p,b)=>`${p.x},${p.y}|`+b.map(v=>v.x+','+v.y).sort().join(';'),queue=[{p:g.player,b:structuredClone(g.boxes),moves:[]}],seen=new Set([key(g.player,g.boxes)]);
 for(let n=0;n<queue.length;n++){
  const {p,b,moves}=queue[n];if(g.goals.every(t=>b.some(v=>v.x===t.x&&v.y===t.y)))return moves;
  for(const [action,dx,dy]of [['right',1,0],['left',-1,0],['up',0,-1],['down',0,1]]){
   const at={x:p.x+dx,y:p.y+dy},wall=(x,y)=>x<0||x>=g.cols||y<0||y>=g.rows||g.walls.some(v=>v.x===x&&v.y===y);if(wall(at.x,at.y))continue;const boxes=structuredClone(b),box=boxes.find(v=>v.x===at.x&&v.y===at.y);
   if(box){if(wall(box.x+dx,box.y+dy)||boxes.some(v=>v.x===box.x+dx&&v.y===box.y+dy))continue;box.x+=dx;box.y+=dy;}
   const encoded=key(at,boxes);if(seen.has(encoded))continue;seen.add(encoded);queue.push({p:at,b:boxes,moves:[...moves,action]});
  }
 }
 assert.fail('No keyboard solution for the move-in puzzle');
}

function play(player){
 const id=player.level.id;
 if([1,9].includes(id)){player.runSide();return;}
 if(id===2){player.crossRoads();return;}
 if(id===3){player.collect();player.exit();return;}
 if(id===4){for(const s of ['s0','s1','s2'])player.station(s);player.exit();return;}
 if(id===5){while(player.level.step<player.level.orders.length){const l=player.level,o=l.orders[l.step];player.station(l.carry?o.target:o.source);}player.exit();return;}
 if(id===6){player.collect();player.exit();return;}
 if(id===7){while(player.level.step<4)player.station('s'+player.level.step);player.exit();return;}
 if(id===8||id===20){for(const s of ['s0','s1','s2'])player.station(s);player.exit();return;}
 if(id===10){while(player.level.phase<2){if(player.level.phase===0)player.runSide();else player.crossRoads();}while(player.level.step<2)player.station('s'+player.level.step);player.exit();return;}
 if(id===11){for(let i=0;i<(player.level.budget?.total||600)/200;i++)player.station('s1');player.station('s3');player.station('s4');player.exit();return;}
 if(id===12){player.go(()=>player.level.stations[0],{radius:40});while(!player.level.flags.riding){if(engine.busStopped(player.level))player.enter();else player.wait(.1);}while(engine.busStop(player.level)!=='Training')player.wait(.1);player.enter();player.exit();return;}
 if(id===13){for(const s of ['s0','s1','s2'])player.station(s);player.exit();return;}
 if(id===14){while(player.level.step<player.level.route.length)player.station(player.level.route[player.level.step]);player.exit();return;}
 if(id===15){while(player.level.done.length<2){const l=player.level;if(l.carry){const shirt=l.items.find(i=>i.id===l.carry);player.station(shirt.group==='light'?'s0':'s1');}else{const shirt=l.items.find(i=>i.type==='clothes'&&!i.taken);player.go(shirt,{radius:40});player.enter();}}player.station('s2');while(!player.level.flags.clean)player.wait(.1);player.station('s3');player.exit();return;}
 if(id===16){while(player.level.step<3){if(player.level.carry===null){player.go(()=>player.level.parcels[player.level.step],{radius:55});player.enter();}else player.station('bay'+player.level.carry);}player.exit();return;}
 if(id===17){player.station('button');player.wait(2.1);player.go({x:480,y:185},{radius:10});player.station('help');player.exit();return;}
 if(id===18){while(player.level.step<4)player.station('s'+player.level.step);player.exit();return;}
 if(id===19){for(const action of gridSolution(player.level.grid)){player.input({[action]:true});player.wait(.25);}while(!player.complete){if(!player.resolve())player.input({});}return;}
}

for(const m of curriculum.MISSIONS)test(`complete Supported keyboard route ${m.id}: ${m.title}`,()=>{
 const player=new KeyboardPlayer(m.id);
 try{
  play(player);assert.ok(player.complete);assert.equal(player.state.completed.length,1);assert.equal(player.attempt.questions.filter(q=>q.correct).length,2);
  const saved=vm.runInContext('learning.read().checkpoint',player.context);assert.ok(engine.restoreAdventure(saved,'Fictional Explorer'));assert.ok(player.attempt.activeSeconds>1);assert.equal(player.w.localStorage.getItem('ttWorld'),null);assert.equal(player.roundTrips,1);
 }finally{player.close();}
});

test('one signed-in fictional student completes the entire map with the same saved Town avatar',()=>{
 const avatar={skin:'#975c43',hair:'#36262d',shirt:'#a95476',pants:'#274e69',hairStyle:'Braids',outfit:'Everyday glasses'},world=JSON.stringify({residents:{'QA Career Explorer':{avatar,checking:4321,school:'Fictional Practice School'}}}),original='original-game-record-sentinel',key='ttLearning:v1:QA%20Career%20Explorer:transition-mission';
 const player=new KeyboardPlayer(1,{practice:false,local:{ttWorld:world,[key]:original}});
 try{
  for(let id=1;id<=20;id++){
   assert.equal(player.level.id,id);play(player);assert.ok(player.complete);assert.equal(player.state.completed.length,id);assert.deepEqual(player.drawnAvatar,{...avatar,gender:'female'});
   const saved=vm.runInContext('learning.read()',player.context);assert.equal(saved.records.length,id);assert.ok(engine.restoreAdventure(saved.checkpoint,'QA Career Explorer'));
   if(id<20){player.click('next-button');player.frames=0;player.roundTrips=0;player.input({});}
  }
  assert.equal(player.w.localStorage.getItem('ttWorld'),world);assert.equal(player.w.localStorage.getItem(key),original);assert.equal(player.state.attempts.reduce((sum,a)=>sum+a.questions.filter(q=>q.correct).length,0),40);
 }finally{player.close();}
});

for(const difficulty of ['standard','challenge'])test(`complete ${difficulty} commute with shipped keyboard controls and mid-route save/resume`,()=>{
 const player=new KeyboardPlayer(2,{difficulty});try{player.crossRoads();assert.ok(player.complete);assert.equal(player.attempt.failures,0);assert.equal(player.attempt.questions.length,2);assert.equal(player.roundTrips,1);assert.equal(player.state.completed.length,1);}finally{player.close();}
});
