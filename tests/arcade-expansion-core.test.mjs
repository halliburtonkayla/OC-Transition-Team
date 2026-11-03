import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS,DIRECTIONS,vocabulary,questions} from '../assets/learning-arcade/expansion/word-data.mjs';
import {generatePuzzle,verifyPuzzle,pathBetween,selectedWord,wordPrint} from '../assets/learning-arcade/expansion/word-core.mjs';
import {GARMENTS,SCENARIOS,WEATHER,defaultOutfit,defaultAvatar,COLORS,PATTERNS} from '../assets/learning-arcade/expansion/dress-data.mjs';
import {makeScenario,evaluateOutfit,suggestedOutfit,wear,cleanOutfit,cleanAvatar,outfitCost} from '../assets/learning-arcade/expansion/dress-core.mjs';
import {cleanCheckpoint} from '../assets/learning-arcade/expansion/checkpoint.mjs';
import {GAMES} from '../assets/learning-arcade/curriculum.mjs';
import {reportHTML} from '../assets/learning-arcade/report.mjs';
const wordSave=(p)=>({version:1,seed:p.seed,bookId:p.bookId,level:p.level,page:p.page,found:[],progress:{},bookmarks:{}});
test('10 original books × four levels × 30 seeds: exactly 20 solvable words, valid directions, reproducible layouts',()=>{
 assert.equal(BOOKS.length,10);let total=0;
 for(const b of BOOKS)for(let l=1;l<=4;l++){
  assert.equal(vocabulary(b.id,l).length,20);assert.equal(new Set(vocabulary(b.id,l).map(x=>x.word)).size,20);
  const qs=questions(b.id,l);assert.equal(qs.length,20);assert.ok(qs.every(q=>q.options.includes(q.answer)&&new Set(q.options).size===3));
  for(let seed=0;seed<30;seed++){
   const p=generatePuzzle(b.id,l,seed%4,seed);assert.ok(verifyPuzzle(p),b.id+' '+l+' '+seed);total++;
   const dirs=new Set(p.placements.map(x=>[x.dr,x.dc].join(',')));assert.equal(dirs.size,[2,4,8,8][l-1]);
   for(const dir of DIRECTIONS.slice(0,[2,4,8,8][l-1]))assert.ok(dirs.has(dir.join(',')));
   assert.deepEqual(generatePuzzle(b.id,l,seed%4,seed).grid,p.grid);
   for(const f of p.placements){assert.equal(selectedWord(p,f.path),f.word);assert.equal(selectedWord(p,[...f.path].reverse()),f.word);}
   if(l>=3)assert.ok(p.placements.some(x=>x.overlap>0));
  }
 }
 assert.equal(total,1200);
});
test('Word selection rejects crooked, out-of-grid, skipped-letter and invalid paths',()=>{
 const p=generatePuzzle('careers',1);assert.deepEqual(pathBetween(-1,2,p.size),[]);assert.deepEqual(pathBetween(0,18,p.size),[]);assert.equal(selectedWord(p,[0,2]),null);assert.equal(selectedWord(p,[0,0]),null);
});
test('Every print variant uses the exact digital grid; answer key contains all 20 paths',()=>{
 const p=generatePuzzle('advocacy',4,7,567),letters=p.grid.flat().join('');
 for(const kind of ['blank','bank','completed','key']){const html=wordPrint(p,kind,[p.placements[0]],'<script>private</script>');const actual=[...html.matchAll(/<td[^>]*>([A-Z])/g)].map(m=>m[1]).join('');assert.equal(actual,letters);assert.ok(!html.includes('<script>'));if(kind==='blank')assert.ok(!html.includes('word-print-bank'));if(kind==='key')for(const f of p.placements)assert.ok(html.includes(f.word+': ('));}
 assert.equal((wordPrint(p,'questions').match(/class="print-question"/g)||[]).length,20);
});
test('Fitted wardrobe rules replace slots, remove dress conflicts, retain correctly layered accessories, and clamp avatar data',()=>{
 let o=defaultOutfit();o=wear(o,'polo',0,'stripe');assert.equal(o.top.id,'polo');assert.equal(o.top.color,0);assert.equal(Object.values(o).filter(x=>x?.id==='tee').length,0);
 o=wear(o,'formal');assert.equal(o.top,null);assert.equal(o.bottom,null);assert.equal(o.dress.id,'formal');o=wear(o,'coat');assert.equal(o.dress.id,'formal');assert.equal(o.outer.id,'coat');o=wear(o,'jeans');assert.equal(o.dress,null);assert.equal(o.bottom.id,'jeans');assert.equal(o.top.id,'tee');
 const hostile=cleanOutfit({...o,feet:{id:'formal'},extra:{id:'tee'},top:{id:'tee',color:-1,pattern:'<svg>'}});assert.equal(hostile.feet,null);assert.equal(hostile.top.color,8);assert.equal(hostile.top.pattern,'solid');assert.ok(!('extra' in hostile));
 const a=cleanAvatar({skin:999,body:-1,height:50,private:'unsafe'});assert.equal(a.skin,4);assert.equal(a.body,1);assert.equal(a.height,1.12);assert.ok(!('private' in a));
});
test('All four difficulties and 4,000 generated scenarios have at least one affordable available safe solution',()=>{
 const covered=new Set(),weather=new Set();
 for(let level=1;level<=4;level++)for(let index=0;index<1000;index++){
  const s=makeScenario(level,index,548921),o=suggestedOutfit(s),r=evaluateOutfit(s,o);assert.ok(r.success,JSON.stringify({level,index,s,r}));covered.add(s.id);weather.add(s.weather);if(s.budget){assert.ok(outfitCost(o)<=s.budget);assert.ok(Object.values(o).filter(Boolean).every(v=>s.allowed.includes(v.id)));}
 }
 assert.equal(covered.size,SCENARIOS.length);assert.equal(weather.size,Object.keys(WEATHER).length);
});
test('Scenarios avoid repetition within a deck and change weather according to level',()=>{
 for(let l=1;l<=4;l++){const a=Array.from({length:l===1?SCENARIOS.filter(s=>s.requirements.length<=1).length:20},(_,i)=>makeScenario(l,i,45));assert.equal(new Set(a.map(s=>s.id)).size,a.length);assert.ok(a.every(s=>l>1||['sunny','cloudy'].includes(s.weather)));if(l>=3)assert.ok(a.some(s=>s.change));}
});
test('Safety, weather, dress policies and budget matter; skin, body, colors and gender never change scoring',()=>{
 const base={...SCENARIOS.find(s=>s.id==='outdoor'),level:4,index:0,weather:'freezing',change:null,budget:165,allowed:GARMENTS.map(g=>g.id)};
 const good=suggestedOutfit(base);assert.ok(evaluateOutfit(base,good).success);const bad=wear(good,'sandals');assert.ok(!evaluateOutfit(base,bad).success);assert.ok(evaluateOutfit(base,bad).improvements.some(x=>/protective work boots/.test(x)));
 for(let color=0;color<COLORS.length;color++)for(const pattern of PATTERNS){const changed=Object.fromEntries(Object.entries(good).map(([k,v])=>[k,v?{...v,color,pattern}:null]));assert.deepEqual(evaluateOutfit(base,changed),evaluateOutfit(base,good));}
 const interview={...SCENARIOS.find(s=>s.id==='interview'),weather:'sunny',change:null};let a=wear(wear(defaultOutfit(),'polo'),'trousers'),b=wear(defaultOutfit(),'daydress');assert.ok(evaluateOutfit(interview,a).success);assert.ok(evaluateOutfit(interview,b).success);
 const memorial={...SCENARIOS.find(s=>s.id==='memorial'),weather:'sunny'};assert.ok(evaluateOutfit(memorial,wear(defaultOutfit(),'tee',0,'stripe')).success);
 const rain={...SCENARIOS.find(s=>s.id==='shopping'),weather:'rainy'};assert.ok(!evaluateOutfit(rain,defaultOutfit()).success);assert.ok(evaluateOutfit(rain,wear(defaultOutfit(),'umbrella')).success);
});
test('Private checkpoint sanitizer validates real paths, saves per-book bookmarks and recomputes outfit results',()=>{
 const p=generatePuzzle('careers',2,3,78),v=wordSave(p);v.found=[p.placements[0]];v.bookmarks={'careers:2':{page:3,found:[p.placements[0]]}};v.studentName='Must not store';const clean=cleanCheckpoint('wordquest',v);assert.equal(clean.found[0].word,p.words[0]);assert.ok(!('studentName' in clean));assert.equal(clean.bookmarks['careers:2'].found.length,1);assert.throws(()=>cleanCheckpoint('wordquest',{...v,found:[{word:p.words[0],path:[0,1]}]}));
 const d={version:1,seed:78,level:4,index:0,avatar:defaultAvatar(),outfit:defaultOutfit(),history:[{level:4,index:0,at:new Date().toISOString(),outfit:defaultOutfit(),evaluation:{success:true,score:100},attempt:1}],teacherNotes:'forged'};
 const actual=cleanCheckpoint('dresspart',d);assert.deepEqual(actual.history[0].evaluation,evaluateOutfit(makeScenario(4,0,78),defaultOutfit()));assert.ok(!('teacherNotes' in actual));
});
test('Shared reports show actual outfit, scenario, attempts and optional questions without turning ESP into official services',()=>{
 assert.equal(GAMES.length,8);const s=makeScenario(4,0,43),o=suggestedOutfit(s),r={id:'test',game:'dresspart',options:{mode:'esp'},rounds:[],assistance:[],activeMs:25000,startedAt:new Date().toISOString(),checkpoint:{seed:43,level:4,history:[{level:4,index:0,at:new Date().toISOString(),outfit:o,evaluation:evaluateOutfit(s,o),attempt:2}]},teacherNotes:'<img src=x onerror=unsafe>'};
 const html=reportHTML([r],{name:'Fictional QA'});assert.ok(html.includes('Attempt 2'));assert.ok(html.includes('Selected outfit'));assert.ok(html.includes('Dress requirements'));assert.ok(html.includes('enrichment'));assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('participation is not automatically an official Pre-ETS service'));
});
