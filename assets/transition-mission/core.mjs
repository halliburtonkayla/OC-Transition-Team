import {CAREERS,CHARACTER_BACKGROUNDS,DENOMINATIONS,PORTALS,WORLD_END} from './careers.mjs';
export const money=cents=>'$'+(cents/100).toFixed(2);
export function parseMoney(value){const s=String(value??'').trim().replace(/^\$/,'');if(!/^\d{1,5}(?:\.\d{1,2})?$/.test(s))return null;const [a,b='']=s.split('.');return Number(a)*100+Number(b.padEnd(2,'0'));}
export function shuffled(items,seed=1){const a=[...items];let s=(seed+1)>>>0;for(let i=a.length-1;i>0;i--){s=(s*1664525+1013904223)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const options=()=>({runSpeed:230,jumpPace:1,autoJump:false,voice:true,effects:true,music:true,volume:.45,reducedMotion:false});
export function newCampaign(id){return {version:1,id,startedAt:new Date().toISOString(),stage:0,gate:0,task:0,assigned:false,offered:false,lives:3,completed:[],events:[],helped:[],stats:{coins:0,stars:0,points:0,falls:0,rescues:0},settings:options(),character:null,position:80,checkpoint:80,collected:[],defeated:[],scanned:[],view:'run',lastSavedAt:null};}
export function safeAvatar(a){if(!a||typeof a!=='object')return null;const c={};for(const k of ['skin','hair','shirt','pants']){if(!/^#[0-9a-f]{6}$/i.test(a[k]||''))return null;c[k]=a[k];}c.hairStyle=['Classic','Short','Curls','Long','Braids'].includes(a.hairStyle)?a.hairStyle:'Classic';c.outfit=String(a.outfit||'Everyday').slice(0,24);c.gender=a.gender==='male'?'male':'female';return c;}
export function fallbackAvatar(background='black',gender='female'){const b=CHARACTER_BACKGROUNDS.find(b=>b.id===background)||CHARACTER_BACKGROUNDS[1];return {...b,background:b.id,gender:gender==='male'?'male':'female',shirt:gender==='male'?'#eab542':'#399e97',pants:'#24475c',hairStyle:gender==='male'?'Short':background==='black'?'Curls':'Long',outfit:'Everyday'};}
export function restoreCampaign(raw){
 try{const s=structuredClone(raw);if(s?.version!==1||typeof s.id!=='string'||s.id.length>100||!/^[-a-zA-Z0-9_:]+$/.test(s.id)||!Number.isInteger(s.stage)||s.stage<0||s.stage>=CAREERS.length||!Number.isInteger(s.gate)||s.gate<0||s.gate>4||!Number.isInteger(s.task)||s.task<0||s.task>CAREERS[s.stage].tasks.length||!Number.isInteger(s.lives)||s.lives<1||s.lives>3)return null;
  if(!Array.isArray(s.completed)||s.completed.length>30||s.completed.some((r,i)=>r.stage!==i||r.career!==CAREERS[i].id||typeof r.at!=='string'))return null;
  const justFinished=['celebration','map','complete'].includes(s.view);if(justFinished?s.completed.length!==s.stage+1:s.completed.length!==s.stage)return null;
  if(!Array.isArray(s.events)||s.events.length>2000||s.events.some(e=>!e||!Number.isInteger(e.stage)||e.stage<0||e.stage>s.stage||typeof e.correct!=='boolean'||typeof e.task!=='string'||e.task.length>80||typeof e.response!=='string'||e.response.length>300))return null;
  if(!s.stats||Object.keys(newCampaign('validate').stats).some(k=>!Number.isInteger(s.stats[k])||s.stats[k]<0||s.stats[k]>100000000))return null;
  if(s.character!==null){const a=safeAvatar(s.character);if(!a)return null;s.character={...a,background:CHARACTER_BACKGROUNDS.some(b=>b.id===s.character.background)?s.character.background:null};}
  if(!Array.isArray(s.helped)||s.helped.some(x=>typeof x!=='string'||x.length>100))return null;
  for(const k of ['collected','defeated','scanned'])if(!Array.isArray(s[k])||s[k].length>1000||s[k].some(x=>typeof x!=='string'||x.length>70))return null;
  if(!Number.isFinite(s.position)||s.position<0||s.position>WORLD_END+300||!Number.isFinite(s.checkpoint)||s.checkpoint<0||s.checkpoint>WORLD_END+100)return null;
  const max=s.gate<4?PORTALS[s.gate].x+100:WORLD_END+100;if(s.position>max||s.checkpoint>max)return null;
  if(typeof s.assigned!=='boolean'||typeof s.offered!=='boolean'||s.gate>0&&!s.assigned||s.gate>2&&!s.offered)return null;
  if(s.gate===4&&s.task!==CAREERS[s.stage].tasks.length)return null;
  const o=s.settings;if(!o||![140,180,230,280,320].includes(o.runSpeed)||![0,1,2].includes(o.jumpPace)||!Number.isFinite(o.volume)||o.volume<0||o.volume>1)return null;for(const k of ['autoJump','voice','effects','music','reducedMotion'])if(typeof o[k]!=='boolean')return null;
  if(!['run','tunnel','celebration','map','complete'].includes(s.view)||s.completed.length===30&&s.view!=='complete')return null;
  return s;
 }catch{return null;}
}
function event(s,task,correct,response,domain='Workplace Readiness'){s.events.push({stage:s.stage,task,correct,response:String(response??'').slice(0,300),domain,help:s.helped.includes(s.stage+':'+task),at:new Date().toISOString()});s.events=s.events.slice(-2000);}
export function loseLife(s,cause='obstacle'){
 s.lives--;s.stats.falls++;let rescued=false;if(s.lives<=0){s.lives=3;s.stats.rescues++;s.position=s.checkpoint;rescued=true;}
 return {rescued,message:rescued?'Checkpoint rescue! Three fresh lives. Your completed careers and tasks are kept.':'One life used. You can try again. '+s.lives+' '+(s.lives===1?'life remains.':'lives remain.')};
}
export function useHelp(s,task){const key=s.stage+':'+task;if(!s.helped.includes(key))s.helped.push(key);}
export function checkTask(task,response){
 if(task.type==='choice')return Number.isInteger(response)&&response===task.answer;
 if(task.type==='count')return Number.isInteger(response)&&response===task.amount;
 if(task.type==='amount')return parseMoney(response)===task.answer;
 if(task.type==='cash'){if(!response||typeof response!=='object'||Array.isArray(response))return false;let total=0;for(const d of DENOMINATIONS){const n=response[d.cents]??0;if(!Number.isInteger(n)||n<0||n>30)return false;total+=n*d.cents;}if(Object.keys(response).some(k=>!DENOMINATIONS.some(d=>String(d.cents)===k)))return false;return total===task.paid-task.total;}
 if(task.type==='scan')return Array.isArray(response)&&response.length===task.items.length&&new Set(response).size===task.items.length&&task.items.every(i=>response.includes(i.id));
 if(task.type==='order')return Array.isArray(response)&&response.length===task.items.length&&task.items.every((v,i)=>v===response[i]);
 if(task.type==='match')return response&&typeof response==='object'&&task.pairs.every(([a,b])=>response[a]===b)&&Object.keys(response).length===task.pairs.length;
 if(task.type==='build')return response&&typeof response==='object'&&task.ingredients.every(i=>response[i.id]===i.amount)&&Object.keys(response).length===task.ingredients.length;
 return false;
}
export function submit(s,action,payload){
 const career=CAREERS[s.stage];if(s.view==='complete'||s.view==='celebration'||s.view==='map')return {ok:false,message:'This stage is already finished.'};
 if(action==='accept'&&s.gate===0){s.assigned=true;return {ok:true,message:'Mission accepted. Let’s explore this job.'};}
 if(action==='scenario'&&s.gate===0&&s.assigned){const t=career.scenario,ok=checkTask(t,payload);event(s,t.id,ok,t.options[payload]||'No response',t.domain);if(!ok)return {ok:false,...loseLife(s,'task'),why:t.why};s.gate=1;s.scanned=[];s.stats.points+=150;return {ok:true,advanced:true,message:t.why};}
 if(action==='application'&&s.gate===1){if(!payload||typeof payload.name!=='string'||payload.name.trim().length<2||payload.name.length>50||!['morning','afternoon','weekend'].includes(payload.availability)||!career.strengths.includes(payload.strength))return {ok:false,validation:true,message:'Complete all three short application fields.'};event(s,'application',true,'Completed practice name, availability, and a job-related strength.','Workplace Readiness');s.gate=2;s.stats.points+=150;return {ok:true,advanced:true,message:'Application complete. Your practice name is not stored in the report.'};}
 if(action==='offer'&&s.gate===2){s.offered=true;return {ok:true,message:'Job offer accepted. Now practice clocking in.'};}
 if(action==='clock'&&s.gate===2&&s.offered){const ok=String(payload)===clockCode(s.stage);event(s,'clock-in',ok,ok?'Entered assigned practice number':'Practice number did not match','Workplace Readiness');if(!ok)return {ok:false,...loseLife(s,'task'),why:'Read your practice badge and enter those four digits.'};s.gate=3;s.stats.points+=150;return {ok:true,advanced:true,message:'You clocked in for your pretend shift.'};}
 if(action==='task'&&s.gate===3&&s.task<career.tasks.length){const t=career.tasks[s.task],ok=checkTask(t,payload);let response=typeof payload==='string'?payload:JSON.stringify(payload);if(t.type==='choice')response=t.options[payload]||'No response';if(t.type==='cash'&&payload&&typeof payload==='object')response=DENOMINATIONS.filter(d=>payload[d.cents]).map(d=>payload[d.cents]+' x '+d.name).join('; ')||'Empty money tray';if(t.type==='build'&&payload&&typeof payload==='object')response=t.ingredients.map(i=>(payload[i.id]||0)+' '+i.name).join('; ');if(t.type==='scan'&&Array.isArray(payload))response=payload.map(id=>t.items.find(i=>i.id===id)?.name||id).join(', ');event(s,t.id,ok,response,t.domain);if(!ok)return {ok:false,...loseLife(s,'task'),why:t.why};s.task++;s.stats.points+=200;s.scanned=[];if(s.task===career.tasks.length)s.gate=4;return {ok:true,advanced:true,message:t.why};}
 return {ok:false,message:'Finish your current mission first.'};
}
export const clockCode=stage=>String(4100+stage*37);
export function finishStage(s){if(s.gate!==4||s.position<WORLD_END-65||s.completed.some(c=>c.stage===s.stage))return false;const events=s.events.filter(e=>e.stage===s.stage);s.completed.push({stage:s.stage,career:CAREERS[s.stage].id,at:new Date().toISOString(),attempts:events.length,retries:events.filter(e=>!e.correct).length,helped:events.filter(e=>e.help&&e.correct).length});s.stats.points+=500;s.lives=3;s.view=s.stage===29?'complete':'celebration';return true;}
export function nextStage(s){if(!['celebration','map'].includes(s.view)||s.stage>=29||s.completed.length!==s.stage+1)return false;s.stage++;s.gate=0;s.task=0;s.assigned=false;s.offered=false;s.lives=3;s.position=80;s.checkpoint=80;s.collected=[];s.defeated=[];s.scanned=[];s.view='run';return true;}
export function createWorld(stage=0){
 const gaps=[],platforms=[],coins=[],stars=[],enemies=[],crates=[];const nearPortal=x=>PORTALS.some(p=>Math.abs(p.x-x)<650)||Math.abs(x-WORLD_END)<650;
 for(let base=900,i=0;base<WORLD_END-500;base+=680,i++){
  const x=base+((stage*29+i*17)%90);if(!nearPortal(x)){gaps.push({x:x+270,w:96});platforms.push({id:'p'+i,x:x+70,y:353,w:190,h:22});if(i%3===0)platforms.push({id:'upper'+i,x:x+195,y:255,w:150,h:22});
   if(i%2===0)enemies.push({id:'enemy'+i,x:x-80,y:438,home:x-80,range:75,w:42,h:32,dead:false});else crates.push({id:'crate'+i,x:x-60,y:419,w:44,h:51});
   if(i%3===0)stars.push({id:'star'+i,x:x+270,y:218,r:17});
  }
  for(let j=0;j<5;j++)coins.push({id:'coin'+i+'-'+j,x:x+j*44,y:354-Math.sin(j/4*Math.PI)*47,r:11});
 }
 let start=0;for(const g of gaps){platforms.push({id:'ground'+start,x:start,y:470,w:g.x-start,h:100,ground:true});start=g.x+g.w;}platforms.push({id:'groundEnd',x:start,y:470,w:WORLD_END+700-start,h:100,ground:true});
 return {gaps,platforms,coins,stars,enemies,crates};
}
export function newPlayer(x=80){return {x,y:470,vx:0,vy:0,w:32,h:98,grounded:true,facing:1,coyote:.12,jumpBuffer:0,invulnerable:0,runCycle:0};}
export function stepWorld(p,world,s,input,dt,time){
 const out=[];dt=Math.min(Math.max(dt,0),1/30);const speed=s.settings.runSpeed;const pace=[{g:1100,j:-600},{g:1500,j:-700},{g:1900,j:-790}][s.settings.jumpPace];p.invulnerable=Math.max(0,p.invulnerable-dt);
 const dir=(input.right?1:0)-(input.left?1:0);p.vx=dir*speed*(input.sprint?1.15:1);if(dir){p.facing=dir;p.runCycle+=dt*speed*.055;}
 p.coyote=p.grounded?.12:Math.max(0,p.coyote-dt);p.jumpBuffer=input.jump?.14:Math.max(0,p.jumpBuffer-dt);
 let auto=false;if(s.settings.autoJump&&dir&&p.grounded){const edge=p.x+dir*25,ahead=p.x+dir*Math.max(32,speed*.2);auto=world.gaps.some(g=>edge>g.x-3&&edge<g.x+g.w+10)||world.crates.some(c=>Math.abs(c.x+c.w/2-ahead)<30)||world.enemies.some(e=>!e.dead&&Math.abs(e.x-ahead)<35);}
 if((p.jumpBuffer>0||auto)&&p.coyote>0){p.vy=pace.j;p.grounded=false;p.coyote=0;p.jumpBuffer=0;out.push({type:'jump',auto});}
 const prevY=p.y;p.x=Math.max(18,Math.min(WORLD_END+100,p.x+p.vx*dt));if(s.gate<4)p.x=Math.min(p.x,PORTALS[s.gate].x+75);p.vy+=pace.g*dt;p.y+=p.vy*dt;p.grounded=false;
 if(p.vy>=0){for(const platform of world.platforms){if(p.x+p.w/2>platform.x&&p.x-p.w/2<platform.x+platform.w&&prevY<=platform.y+3&&p.y>=platform.y){p.y=platform.y;p.vy=0;p.grounded=true;break;}}}
 const hurt=cause=>{if(p.invulnerable>0){if(cause==='fall'){p.x=s.checkpoint;p.y=470;p.vy=0;p.grounded=true;}return;}const r=loseLife(s,cause);p.invulnerable=1.8;out.push({type:'hurt',...r});if(r.rescued||cause==='fall'){p.x=s.checkpoint;p.y=470;p.vy=0;p.grounded=true;}else{p.x=Math.max(20,p.x-p.facing*75);p.vy=-350;}};
 for(const e of world.enemies){if(s.defeated.includes(e.id)){e.dead=true;continue;}e.x=e.home+Math.sin(time*1.8+e.home)*e.range;if(Math.abs(p.x-e.x)<(p.w+e.w)/2&&p.y>e.y&&p.y-p.h<e.y+e.h){if(p.vy>0&&prevY<=e.y+13){e.dead=true;s.defeated.push(e.id);s.stats.points+=100;p.vy=-430;out.push({type:'stomp'});}else hurt('capture');}}
 for(const c of world.crates){if(Math.abs(p.x-(c.x+c.w/2))<(p.w+c.w)/2&&p.y>c.y&&p.y-p.h<c.y+c.h){if(p.vy>0&&prevY<=c.y+12){p.y=c.y;p.vy=0;p.grounded=true;}else{p.x=p.vx>0?c.x-p.w/2-1:c.x+c.w+p.w/2+1;p.vx=0;}}}
 if(p.y>720)hurt('fall');
 for(const [type,list]of [['coin',world.coins],['star',world.stars]])for(const c of list){if(s.collected.includes(c.id))continue;if(Math.abs(p.x-c.x)<c.r+22&&Math.abs(p.y-p.h*.58-c.y)<c.r+42){s.collected.push(c.id);s.stats[type==='coin'?'coins':'stars']++;s.stats.points+=type==='coin'?10:75;out.push({type,x:c.x,y:c.y});}}
 if(p.grounded&&p.y===470&&Math.abs(p.x-s.checkpoint)>650&&!world.gaps.some(g=>Math.abs(p.x-g.x)<180)&&!world.enemies.some(e=>!e.dead&&Math.abs(p.x-e.x)<150))s.checkpoint=Math.max(40,p.x-50);
 s.position=p.x;return out;
}
