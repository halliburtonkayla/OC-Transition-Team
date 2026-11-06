import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as E from '../assets/life-quest/engine.mjs';
import {DEFAULT_SETTINGS} from '../assets/life-quest/missions.mjs';
import {trafficPlan,seedFor} from '../assets/life-quest/road-routes.mjs';
import {walkRoad} from './helpers/life-quest-player.mjs';
import {atlasCells} from '../assets/life-quest/atlas-grid.mjs';
const start=(id,difficulty='standard',uid='polish-route')=>{const s=E.newAdventure('Fictional Explorer','polish',true);s.settings.difficulty=difficulty;E.startMission(s,id,uid);return s;};
function finish(s){for(let n=0;n<10&&E.attemptFor(s).status!=='completed';n++){if(s.active.level.pending)E.answerQuestion(s,s.active.level.pending.index,0);else{E.step(s,{},1/60);if(!s.active.level.pending)E.interact(s);}}assert.equal(E.attemptFor(s).status,'completed');}
test('new adventures default to Adventure; saved Supported settings and legacy routes are preserved',()=>{
 assert.equal(DEFAULT_SETTINGS.difficulty,'standard');const s=start(2,'supported');s.active.level=E.createLevel(2);E.step(s,{right:true},.05);const raw=structuredClone(s),restored=E.restoreAdventure(raw,s.student);assert.deepEqual(restored,raw);assert.equal(restored.settings.difficulty,'supported');assert.equal(restored.active.level.road,undefined);
});
for(const difficulty of ['supported','standard','challenge'])for(const speed of [120,180,240,300])for(let variant=0;variant<4;variant++)test(`${difficulty} speed ${speed} commute ${variant}: real movement, safe gaps, objective gates, save/resume and two scored decisions`,()=>{
 let s=start(2,difficulty,'commute-'+variant),l=s.active.level;s.settings.speed=speed;const density={supported:8,standard:12,challenge:16}[difficulty];assert.equal(l.hazards.length,density);
 E.step(s,{right:true},.05);const saved=structuredClone(s);s=E.restoreAdventure(saved,s.student);assert.deepEqual(s,saved);
 walkRoad(s);assert.equal(E.attemptFor(s).failures,0);assert.equal(s.active.level.inventory.length,s.active.level.road.required);finish(s);assert.equal(s.completed.length,1);assert.equal(E.attemptFor(s).questions.length,2);assert.ok(E.restoreAdventure(s,s.student));
});
test('traffic cannot be skipped; retries preserve the same route and replays change it without deleting evidence',()=>{
 const s=start(2);s.active.level.p={...s.active.level.p,x:s.active.level.exit.x,y:60};E.step(s,{},.016);assert.equal(s.active.level.pending,null);assert.equal(s.completed.length,0);const road=structuredClone(s.active.level.road),course=structuredClone(s.active.level.course);
 E.restartMission(s);assert.deepEqual(s.active.level.road,road);E.hurt(s,'traffic');assert.deepEqual(s.active.level.course,course);assert.equal(E.attemptFor(s).failures,1);
 walkRoad(s);finish(s);const evidence=structuredClone(s.attempts[0]),old=s.active.level.road.variant;E.startMission(s,2,'replay');assert.equal(s.active.level.road.variant,(old+1)%4);assert.deepEqual(s.attempts[0],evidence);assert.equal(s.completed.length,1);
});
test('traffic escalation is capped and all four variants supply different workplace planning decisions',()=>{
 const low=trafficPlan(17,'standard',0),high=trafficPlan(17,'standard',4),capped=trafficPlan(17,'standard',50);assert.ok(Math.abs(high.lanes[0].speed)>Math.abs(low.lanes[0].speed));assert.deepEqual(high.lanes,capped.lanes);
 const prompts=new Set();for(let i=0;i<4;i++){const s=start(2);s.active.level.road.variant=i;for(const q of E.questionsFor(s.active.level))prompts.add(q.prompt);}assert.equal(prompts.size,8);assert.equal(seedFor('saved'),seedFor('saved'));
});
test('malformed traffic/course metadata is rejected without changing valid legacy checkpoints',()=>{
 const good=start(2);for(const change of [s=>s.active.level.road.variant=99,s=>s.active.level.course.seed=-1,s=>s.attempts[0].routeVariant=8]){const bad=structuredClone(good);change(bad);assert.equal(E.restoreAdventure(bad,bad.student),null);}assert.ok(E.restoreAdventure(good,good.student));
});
for(const difficulty of ['standard','challenge'])test(`${difficulty}: delivery, radio, grocery and budget objectives require their complete variable workload`,()=>{
 for(const id of [4,5,11,14]){
  const s=start(id,difficulty),l=s.active.level,at=id=>{const st=l.stations.find(st=>st.id===id);Object.assign(l.p,{x:st.x,y:st.y});return E.interact(s);};
  if(id===4)for(let i=0;i<3;i++){const task=at('s'+i).find(e=>e.type==='task');assert.ok(task);E.answerTask(s,task,(l.shopping[i].answer+1)%2);assert.equal(l.done.length,i);E.answerTask(s,task,l.shopping[i].answer);}
  if(id===5){assert.equal(l.orders.length,difficulty==='challenge'?5:4);while(l.step<l.orders.length){const o=l.orders[l.step];at(o.source);at(o.target);}}
  if(id===11){assert.ok(l.budget.total>600);for(let n=0;n<l.budget.total/200;n++)at('s1');at('s3');assert.equal(l.wallet,l.budget.savings);at('s4');}
  if(id===14){assert.equal(l.route.length,difficulty==='challenge'?5:4);for(const target of l.route)at(target);}
  Object.assign(l.p,{x:l.exit.x,y:l.exit.y});E.interact(s);finish(s);assert.equal(s.completed.length,1);assert.ok(E.restoreAdventure(s,s.student));
 }
});
test('later patrols demand tighter timing while movement speed remains independently adjustable',()=>{
 const early=start(4),late=start(18);assert.ok(late.active.level.hazards[0].speed>early.active.level.hazards[0].speed);const s=start(3);s.settings.speed=120;const x=s.active.level.p.x;E.step(s,{right:true},.05);assert.equal(s.active.level.p.x-x,6);
});
test('saved advanced course retries and puzzle resets preserve their exact layout',()=>{
 for(const id of [1,3,4,5,9,10,11,14,19,20]){
  const s=start(id,'challenge'),before=structuredClone(s.active.level);E.step(s,{right:true},.05);assert.ok(E.restoreAdventure(s,s.student));E.restartMission(s);assert.deepEqual(s.active.level,before);if(id===19){E.resetPuzzle(s);assert.deepEqual(s.active.level.grid,before.grid);}
 }
});
test('every advanced box puzzle is solvable through actual push moves',()=>{
 for(const difficulty of ['standard','challenge']){
  const s=start(19,difficulty),g=s.active.level.grid,key=(p,b)=>`${p.x},${p.y}|${b.map(b=>b.x+','+b.y).sort().join(';')}`,queue=[{p:g.player,b:g.boxes,m:[]}],seen=new Set();let moves;
  for(let n=0;n<queue.length;n++){
   const {p,b,m}=queue[n];if(g.goals.every(t=>b.some(b=>b.x===t.x&&b.y===t.y))){moves=m;break;}
   for(const [input,dx,dy]of [['right',1,0],['left',-1,0],['up',0,-1],['down',0,1]]){
    const blocked=(x,y)=>x<0||y<0||x>=g.cols||y>=g.rows||g.walls.some(w=>w.x===x&&w.y===y),next={x:p.x+dx,y:p.y+dy};if(blocked(next.x,next.y))continue;const boxes=structuredClone(b),box=boxes.find(b=>b.x===next.x&&b.y===next.y);if(box){if(blocked(box.x+dx,box.y+dy)||boxes.some(b=>b.x===box.x+dx&&b.y===box.y+dy))continue;box.x+=dx;box.y+=dy;}const k=key(next,boxes);if(seen.has(k))continue;seen.add(k);queue.push({p:next,b:boxes,m:[...m,input]});
   }
  }
  assert.ok(moves,'Advanced puzzle has a valid push-only solution');for(const move of moves){E.step(s,{[move]:true},.05);for(let n=0;n<4;n++)E.step(s,{},.05);}finish(s);
 }
});
test('character renderer uses saved palette, hairstyle and outfit; every walk frame renders without the original face renderer',()=>{
 const source=fs.readFileSync(new URL('../assets/life-quest/characters.mjs',import.meta.url),'utf8');
 const noop=()=>{},context={fillStyle:'',strokeStyle:'',lineWidth:1,drawImage:noop,getImageData:()=>({data:new Uint8ClampedArray(160*320*4)}),putImageData:noop,createLinearGradient:()=>({addColorStop:noop})};for(const method of ['save','restore','beginPath','ellipse','fill','arc','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','closePath','stroke','roundRect','fillText'])context[method]=noop;
 class Image {set src(v){this.complete=true;this.naturalWidth=640;this.naturalHeight=1280;this.onload?.();}}
 const sandbox={Image,document:{createElement:()=>({getContext:()=>context})},URL,atlasCells};vm.createContext(sandbox);vm.runInContext(source.replace(/^import .*;\n/gm,'').replace(/export /g,'').replaceAll('import.meta.url',JSON.stringify('https://test.invalid/')),sandbox);
 const style={skin:'#975c43',hair:'#36262d',shirt:'#a95476',pants:'#274e69',hairStyle:'Braids',outfit:'Interview glasses',gender:'female'};sandbox.style=style;sandbox.ctx=context;
 assert.equal(vm.runInContext('JSON.stringify(characterStyle(style))',sandbox),JSON.stringify(style));for(const direction of ['front','right','back','left'])for(let frame=0;frame<4;frame++)vm.runInContext(`drawAvatar(ctx,100,300,style,${frame*1.4},true,false,1,1,null,${JSON.stringify(direction)})`,sandbox);
 assert.ok(!source.includes('../transition-mission/render.mjs'));assert.ok(!source.includes('owner.image'));
});
test('actual 1254-pixel character sheets and 1774-pixel vehicle sheets have whole-pixel, complete frame coverage',()=>{
 for(const [width,height,columns,rows]of [[1254,1254,4,4],[1774,887,3,2]]){
  const cells=atlasCells(width,height,columns,rows);assert.equal(cells.reduce((sum,c)=>sum+c.w*c.h,0),width*height);
  for(const cell of cells){assert.ok(Object.values(cell).every(Number.isInteger));assert.ok(cell.w>0&&cell.h>0);assert.ok(cell.x+cell.w<=width&&cell.y+cell.h<=height);}
  assert.equal(cells.at(-1).x+cells.at(-1).w,width);assert.equal(cells.at(-1).y+cells.at(-1).h,height);
 }
});
