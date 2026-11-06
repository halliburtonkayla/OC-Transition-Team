// Seeded variety is stored in the level so retries and resumes are fair.
export function tuneCourse(l,config){
 if(!config)return l;l.course={...config};
 const supported=config.difficulty==='supported',hard=config.difficulty==='challenge';
 const stage=Math.min(5,Math.floor((l.id-1)/4)+Math.min(config.replay||0,2));
 l.course.stage=stage;
 if(supported)return l;
 let n=(config.seed+l.id*7919)>>>0;const rand=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
 // Later workplaces require more precise timing, without changing player speed.
 for(const h of l.hazards)if(h.axis!=='loop'){h.speed*=1+stage*.10;h.range*=1+Math.min(stage,3)*.04;}
 if(l.mode==='side'){
  for(const [i,w]of l.walls.entries()){w.x+=Math.round((rand()-.5)*100);w.w+=hard?8:4;}
  for(const [i,h]of l.hazards.entries()){h.homeX+=Math.round((rand()-.5)*70);h.range+=hard?32:14;h.speed*=1+Math.min(i,4)*.09;}
 }
 if(l.id===5){
  const count=hard?5:4,meals=['soup','salad','sandwich'];let previous=-1;
  l.orders=Array.from({length:count},(_,i)=>{let k=Math.floor(rand()*3);if(k===previous)k=(k+1)%3;previous=k;return {meal:meals[k],source:'s'+k,target:'s'+(3+(i+config.seed)%3)};});
 }
 if(l.id===14){let previous='';l.route=Array.from({length:hard?5:4},()=>{let id='s'+(1+Math.floor(rand()*3));if(id===previous)id='s'+(1+Number(id[1])%3);previous=id;return id;});}
 if(l.id===4){
  l.shopping=Array.from({length:3},(_,i)=>{
   const low=150+Math.floor(rand()*8)*25,high=low+75+i*25;
   if(hard){const bulk=low*2-50,small=i===1?'500 mL':'500 g',large=i===1?'1 L (1000 mL)':'1 kg (1000 g)';return {options:[`$${(low/100).toFixed(2)} · ${small}`,`$${(bulk/100).toFixed(2)} · ${large}`],answer:1,hint:'Compare equal quantities: two smaller packs cost more than this larger pack.'};}
   const flip=(config.seed+i)%2===0;return {options:[low,high].map((v,j)=>`$${((flip?([high,low][j]):v)/100).toFixed(2)} · same size`),answer:flip?1:0,hint:'Compare the same quantity and choose the lower price.'};
  });
  l.stations.slice(0,3).forEach((s,i)=>{s.label=['Apples','Milk','Oats'][i]+(hard?' · compare unit cost':' · compare prices');});
 }
 if(l.id===11){l.budget=hard?{total:1800,fare:1100,savings:700}:{total:1200,fare:700,savings:500};l.stations[3].label='Transit pass $'+l.budget.fare/100;l.stations[4].label='Savings $'+l.budget.savings/100;}
 if(l.id===19){l.grid.goals=[{x:6,y:1},{x:6,y:3}];if(hard)l.grid.walls.push({x:3,y:2});}
 l.limit=Math.max(l.limit,160+stage*20);
 return l;
}
