import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {LEVELS,MODES,word,questions,Round} from '../assets/count-quest/core.mjs';
const seeded=n=>()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
test('beginner entry starts at one and all original ranges remain',()=>{
 assert.deepEqual(LEVELS.map(l=>[l.min,l.max]),[[1,5],[1,10],[11,20],[21,30],[31,50],[51,75],[76,100]]);
 for(const l of LEVELS.slice(0,3))for(const mode of MODES){
  const qs=questions(l,mode.id);const first=mode.id==='next'&&l.min===1?2:l.min;
  assert.equal(qs[0].answer,first);assert.equal(qs.at(-1).answer,l.max);
  if(mode.id==='next')assert.ok(qs.every(q=>q.previous>=1));
 }
 const advanced=LEVELS.slice(3).flatMap(l=>questions(l,'next'));
 assert.deepEqual(advanced.map(q=>q.answer),Array.from({length:80},(_,i)=>i+21));
 assert.equal(advanced[0].previous,20);assert.equal(advanced.at(-1).previous,99);
});
test('all ranges and options are solvable, unique, and in range across 150 random seeds',()=>{
 const positions=new Set();
 for(let seed=0;seed<150;seed++)for(const l of LEVELS)for(const m of l.min>20?[MODES[3]]:MODES)for(const size of [2,3]){
  for(const q of questions(l,m.id,size,seeded(seed))){
   assert.equal(q.options.length,size);assert.equal(new Set(q.options).size,size);
   assert.equal(q.options.filter(n=>n===q.answer).length,1);
   assert.ok(q.options.every(n=>Number.isInteger(n)&&n>=l.min&&n<=l.max));
   positions.add(q.options.indexOf(q.answer));
  }
 }
 assert.deepEqual([...positions].sort(),[0,1,2]);
});
test('each object gets one count in any touch order, including repeated touches',()=>{
 for(const l of LEVELS.slice(0,3))for(const q of questions(l,'count')){
  const r=new Round(q);assert.equal(r.answer(q.answer),null);
  assert.equal(r.touch(-1),null);assert.equal(r.touch(q.answer),null);assert.equal(r.touch(0.5),null);
  for(let i=q.answer-1;i>=0;i--){const n=q.answer-i;assert.deepEqual(r.touch(i),{number:n,fresh:true});assert.deepEqual(r.touch(i),{number:n,fresh:false});assert.equal(r.touched.size,n);}
  assert.equal(r.ready,true);assert.equal(r.answer(q.answer),true);assert.equal(r.touch(0),null);assert.equal(r.answer(q.answer),null);
 }
});
test('substantial prompting and repeated mistakes never skip a question or award duplicate credit',()=>{
 for(const l of LEVELS)for(const m of l.min>20?[MODES[3]]:MODES)for(const q of questions(l,m.id)){
  const r=new Round(q);r.help();
  if(m.id==='count')for(let i=0;i<q.answer;i++)r.touch(i);
  const wrong=q.options.find(n=>n!==q.answer);
  for(let i=0;i<30;i++){assert.equal(r.answer(wrong),false);assert.equal(r.solved,false);assert.equal(r.ready,true);}
  assert.equal(r.attempts,30);assert.equal(r.helpUsed,true);assert.equal(r.answer(q.answer),true);assert.equal(r.attempts,31);
  assert.equal(r.answer(q.answer),null);assert.equal(r.answer(wrong),null);assert.equal(r.attempts,31);
 }
});
test('recounts and fresh rounds reset objects without erasing recorded support',()=>{
 const q=questions(LEVELS[0],'count').at(-1),r=new Round(q);
 r.touch(4);r.touch(3);r.help();assert.equal(r.recount(),true);assert.equal(r.touched.size,0);assert.equal(r.recounts,1);assert.equal(r.helpUsed,true);
 for(let i=0;i<5;i++)assert.equal(r.touch(i).number,i+1);
 r.answer(5);assert.equal(r.recount(),false);assert.equal(r.recounts,1);
 const fresh=new Round(q);assert.equal(fresh.helpUsed,false);assert.equal(fresh.attempts,0);assert.equal(fresh.touched.size,0);
});
test('invalid missions are rejected and numeral speech covers 1 through 100',()=>{
 assert.throws(()=>questions({min:0,max:0},'count'));assert.throws(()=>questions(LEVELS[0],'invalid'));assert.throws(()=>questions(LEVELS[3],'count'));
 assert.equal(word(1),'one');assert.equal(word(11),'eleven');assert.equal(word(20),'twenty');assert.equal(word(21),'twenty one');assert.equal(word(100),'one hundred');
 for(let n=1;n<=100;n++)assert.ok(word(n)&&!word(n).includes('undefined'));
});
test('existing school route, monitor contract and all local illustrations are retained',()=>{
 const page=read('count-to-100.html');assert.match(page,/href="transition-town\.html\?school=1"/);assert.match(page,/assets\/classroom-monitor\/student\.js/);
 for(const name of ['apple','ball','parcel','town'])assert.ok(existsSync(new URL(`assets/count-quest/${name}.svg`,root)));
 const game=read('assets/count-quest/game.mjs');assert.match(game,/TTMonitor\?\.record/);assert.match(game,/Teacher prompting not assessed/);assert.doesNotMatch(game,/setTimeout|setInterval/);assert.match(game,/pagehide/);assert.match(read('assets/count-quest/game.css'),/prefers-reduced-motion/);
});
test('monitor boots on Count to 100, keeps unrelated pages excluded, and never sends anonymous test activity',()=>{
 const source=read('assets/classroom-monitor/student.js');
 for(const [file,expected] of [['count-to-100.html',true],['transition-town.html',true],['school-career-lab.html',true],['unrelated.html',false]]){
  let network=0;
  const document={currentScript:{src:'https://school.invalid/assets/classroom-monitor/student.js'},head:{append(){}},createElement:()=>({}),addEventListener(){},getElementById:()=>({hidden:false})};
  const context={URL,URLSearchParams,document,location:{pathname:'/'+file,search:''},sessionStorage:{},localStorage:{},setInterval(){},setTimeout(){},crypto:{},fetch(){network++;throw Error('No network allowed in test');},addEventListener(){}};
  context.window=context;vm.runInNewContext(source,context);
  assert.equal(!!context.TTMonitor?.installed,expected,file);context.TTMonitor?.record('completed','anonymous fixture',{quantity:1});assert.equal(network,0);
 }
});
test('the playable review is self-contained and has no classroom connection',()=>{
 const html=read('docs/count-quest-review.html');
 assert.match(html,/PLAYABLE REVIEW COPY/);assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+stylesheet|src="assets\//);
 assert.doesNotMatch(html,/classroom-monitor\/student\.js/);assert.match(html,/href="#adventure-map"/);
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,1);assert.doesNotThrow(()=>new vm.Script(scripts[0][1]));
 assert.equal((html.match(/data:image\/svg\+xml;base64,/g)||[]).length,5);
});
