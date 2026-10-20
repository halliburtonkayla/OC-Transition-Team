(function(g){
'use strict';
const C=g.TTBusinessCore,original=C.recipe;
const tools={wash:'soap',mix:'whisk',knead:'hands',roll:'rolling-pin',cut:'donut-cutter',fry:'tongs',flip:'tongs',drain:'cooling-rack',bake:'oven',cool:'cooling-rack',box:'box',wrap:'box',portion:'scoop','bread-roll':'rolling-pin','bread-bake':'oven','bread-bottom':'hands','cook-chicken':'grill',chicken:'tongs',lettuce:'tongs',tomatoes:'tongs',mayonnaise:'spoon','bread-top':'hands',fold:'hands',crumble:'hands',bind:'whisk',stick:'hands',dip:'tongs',set:'cooling-rack',cup:'hands',coffee:'scoop',brew:'coffee-maker',pour:'liquid-cup',ice:'scoop',soda:'dispenser',blend:'blender',lid:'hands',proof:'proofing-tray'};
const portions={flour:{amount:'1',unit:'cup',tool:'dry-cup'},sugar:{amount:'1/4',unit:'cup',tool:'dry-cup'},eggs:{amount:'1',unit:'egg',tool:'hands'},milk:{amount:'1/2',unit:'cup',tool:'liquid-cup'},water:{amount:'1/4',unit:'cup',tool:'liquid-cup'},yeast:{amount:'1',unit:'teaspoon',tool:'measuring-spoon'}};
C.recipe=line=>{
 const r=original(line);
 if(line.item==='donut'){
  const index=r.steps.findIndex(x=>x.id==='mix');r.steps.splice(index,0,{id:'measure-water',label:'Measure 1/4 cup water',icon:'💧'},{id:'measure-yeast',label:'Measure 1 teaspoon yeast',icon:'🥄'});
  r.ingredients.water=1;r.ingredients.yeast=1;
  const roll=r.steps.findIndex(x=>x.id==='roll');r.steps.splice(roll,0,{id:'proof',label:'Rest the dough in the proofing tray',icon:'🥣'});
 }
 for(const step of r.steps){
  const k=step.id.startsWith('measure-')?step.id.slice(8):null;
  if(k&&portions[k]){Object.assign(step,{ingredient:k,...portions[k]});step.label=(k==='eggs'?'Crack ':'Measure ')+step.amount+' '+step.unit+' '+(k==='eggs'?'':k);}
  else if(line.mods&&Object.hasOwn(line.mods,step.id)){step.ingredient=step.id;step.amount=String(line.mods[step.id]);step.unit='portion';step.tool=['frosting','frosting-filling','whipped-cream'].includes(step.id)?'piping-bag':['chicken','lettuce','tomatoes'].includes(step.id)?'tongs':['milk'].includes(step.id)?'liquid-cup':'spoon';}
  else step.tool=tools[step.id]||(step.id.startsWith('wash-')?'sink':'hands');
 }
 r.recipeNote='Classroom practice recipe and quantities for this virtual work station.';
 return r;
};
})(globalThis);
