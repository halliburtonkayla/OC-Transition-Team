import {WORDS,newDrive,chooseLetter,restoreDrive,driveSummary,letterChoices} from './core.mjs';

export const ROAD={far:300,jumpDuration:1.2,slow:40,cruise:60,boost:1.7,collisionWidth:.43};
const KINDS=new Set(['star','coin','jump','boost','cone','letter']);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
export function createRunner({wordId='jam',mode='guided',uppercase=false,id='drive',speed='slow',autoJump=false,drive=null}={}){
 const progress=drive||newDrive(wordId,mode,uppercase,id);
 const race={version:2,drive:progress,lane:1,x:1,distance:0,elapsed:0,speedMode:speed==='cruise'?'cruise':'slow',autoJump:!!autoJump,paused:false,
  stars:drive?.stars||0,legacyStars:drive?.stars||0,coins:0,collected:[],entities:[],sequence:0,wave:0,
  jumpCharges:0,jumpRemaining:0,jumps:0,autoJumps:0,boostFuel:0,boostOn:false,bumpRemaining:0,coneHits:0,misses:0};
 if(!progress.complete)spawnWave(race,true);
 return race;
}
function add(race,kind,lane,offset,extra={}){const e={id:race.drive.id+':road:'+ ++race.sequence,kind,lane,at:race.distance+offset,...extra};race.entities.push(e);return e;}
export function spawnWave(race,first=false){
 if(race.drive.complete||race.entities.some(e=>e.kind==='letter'))return;
 const slot=race.drive.index,w=WORDS.find(w=>w.id===race.drive.wordId).word;
 const targetLane=[2,0,1][(race.wave+WORDS.findIndex(w=>w.id===race.drive.wordId))%3];
 const letters=letterChoices(w,slot,()=>((race.sequence*17+race.wave*13+7)%97)/97);
 const targetIndex=letters.indexOf(w[slot]);[letters[targetLane],letters[targetIndex]]=[letters[targetIndex],letters[targetLane]];
 const powerLane=first?1:(race.wave+1)%3,coneLane=powerLane;
 // Power first, then one avoidable cone; letter rows always have a safe approach.
 add(race,'star',powerLane,38);add(race,'coin',powerLane,54);
 add(race,'jump',powerLane,75);add(race,'boost',(powerLane+1)%3,75);add(race,'cone',coneLane,112);
 add(race,'coin',(powerLane+2)%3,131);
 for(const offset of [144,160,176])add(race,'star',targetLane,offset);
 const row=race.wave++;
 for(let lane=0;lane<3;lane++)add(race,'letter',lane,202,{letter:letters[lane],slot,row});
}
export function steerRunner(race,lane){if(race.paused||race.drive.complete)return false;const next=clamp(Math.round(lane),0,2);const changed=next!==race.lane;race.lane=next;return changed;}
export function speedOf(race){const base=ROAD[race.speedMode];return base*(race.boostOn&&race.boostFuel>0?ROAD.boost:1)*(race.bumpRemaining>0?.42:1);}
export function jumpHeight(race){return race.jumpRemaining>0?Math.sin(Math.PI*(1-race.jumpRemaining/ROAD.jumpDuration)):0;}
export function jumpRunner(race,automatic=false){
 if(race.paused||race.drive.complete||race.jumpCharges<1||race.jumpRemaining>0)return false;
 race.jumpCharges--;race.jumpRemaining=ROAD.jumpDuration;race.jumps++;if(automatic)race.autoJumps++;return true;
}
export function toggleBoost(race){if(race.paused||race.drive.complete||race.boostFuel<=0)return false;race.boostOn=!race.boostOn;return true;}
export function nextLetter(race){const wanted=WORDS.find(w=>w.id===race.drive.wordId).word[race.drive.index];return race.entities.find(e=>e.kind==='letter'&&e.letter===wanted&&e.slot===race.drive.index)||null;}
function pickup(race,e,events){
 if(race.collected.some(c=>c.id===e.id))return;
 race.collected.push({id:e.id,kind:e.kind});
 if(e.kind==='star')race.stars++;else race.coins++;
 if(e.kind==='jump')race.jumpCharges=Math.min(4,race.jumpCharges+2);
 if(e.kind==='boost'){race.boostFuel=Math.min(8,race.boostFuel+6);race.boostOn=true;}
 events.push({type:e.kind,id:e.id,lane:e.lane,stars:race.stars,coins:race.coins});
}
export function advanceRunner(race,seconds){
 const events=[];
 if(race.paused||race.drive.complete||!finite(seconds,0,2))return events;
 // Small simulation steps and swept crossings make collisions independent of the frame rate.
 let remaining=seconds;
 while(remaining>1e-8&&!race.drive.complete){
  const dt=Math.min(.02,remaining);remaining-=dt;
  if(race.autoJump&&race.jumpCharges&&race.jumpRemaining<=0){
   const cone=race.entities.find(e=>e.kind==='cone'&&Math.abs(e.lane-race.x)<ROAD.collisionWidth&&e.at>race.distance&&e.at-race.distance<speedOf(race)*.43);
   if(cone&&jumpRunner(race,true))events.push({type:'jump-used',automatic:true});
  }
  const before=race.distance,priorX=race.x,priorJump=race.jumpRemaining,speed=speedOf(race);
  race.elapsed+=dt;race.distance+=speed*dt;
  race.x+=clamp(race.lane-race.x,-dt*3.9,dt*3.9);
  race.jumpRemaining=Math.max(0,race.jumpRemaining-dt);race.bumpRemaining=Math.max(0,race.bumpRemaining-dt);
  if(race.boostOn){race.boostFuel=Math.max(0,race.boostFuel-dt);if(!race.boostFuel){race.boostOn=false;events.push({type:'boost-ended'});}}
  const crossed=race.entities.filter(e=>e.at>=before&&e.at<race.distance).sort((a,b)=>a.at-b.at);
  const rows=new Set();
  for(const e of crossed){
   if(e.kind==='letter'){rows.add(e.row);continue;}
   const f=(e.at-before)/(race.distance-before||1),x=priorX+(race.x-priorX)*f;
   if(Math.abs(e.lane-x)>=ROAD.collisionWidth)continue;
   if(e.kind==='cone'){
    const left=Math.max(0,priorJump-dt*f),height=left>0?Math.sin(Math.PI*(1-left/ROAD.jumpDuration)):0;
    if(height>.38)events.push({type:'cone-cleared',id:e.id,lane:e.lane});
    else{race.bumpRemaining=1.15;race.coneHits++;events.push({type:'cone-hit',id:e.id,lane:e.lane});}
   }else pickup(race,e,events);
  }
  for(const row of rows){
   const letters=crossed.filter(e=>e.kind==='letter'&&e.row===row&&e.slot===race.drive.index);
   if(!letters.length)continue;
   const f=(letters[0].at-before)/(race.distance-before||1),x=priorX+(race.x-priorX)*f;
   const hit=letters.find(e=>Math.abs(e.lane-x)<ROAD.collisionWidth);
   if(hit){const result=chooseLetter(race.drive,hit.letter);if(result.accepted){race.drive=result.drive;events.push({type:'letter',id:hit.id,lane:hit.lane,answer:result.answer});}}
   else{race.misses++;events.push({type:'letter-missed',slot:race.drive.index});}
  }
  race.entities=race.entities.filter(e=>e.at>=race.distance);
  if(race.drive.complete){events.push({type:'word-complete',summary:runnerSummary(race)});break;}
  if(rows.size)spawnWave(race);
 }
 return events;
}
export function runnerSummary(race){return {...driveSummary(race.drive),engineVersion:2,stars:race.stars,coins:race.coins,coneHits:race.coneHits,jumps:race.jumps,autoJumps:race.autoJumps,missedRows:race.misses,distance:Math.round(race.distance),speed:race.speedMode};}
export function runnerCheckpoint(race){return JSON.parse(JSON.stringify({...race,paused:false}));}
export function restoreRunner(raw){
 if(raw?.version!==2||!raw.drive)return null;
 const drive=restoreDrive(raw.drive);
 if(!drive||!finite(raw.distance,0,1e7)||!finite(raw.elapsed,0,1e6)||!['slow','cruise'].includes(raw.speedMode)||!Number.isInteger(raw.lane)||!finite(raw.lane,0,2)||!finite(raw.x,0,2))return null;
 for(const key of ['stars','legacyStars','coins','sequence','wave','jumps','autoJumps','coneHits','misses','jumpCharges'])if(!Number.isSafeInteger(raw[key])||raw[key]<0||raw[key]>100000)return null;
 if(raw.jumpCharges>4||raw.legacyStars>drive.index*3||raw.legacyStars%3||raw.autoJumps>raw.jumps||!finite(raw.jumpRemaining,0,ROAD.jumpDuration)||!finite(raw.boostFuel,0,8)||!finite(raw.bumpRemaining,0,1.15))return null;
 if(!Array.isArray(raw.collected)||raw.collected.length>3000||new Set(raw.collected.map(e=>e?.id)).size!==raw.collected.length)return null;
 if(raw.collected.some(e=>typeof e?.id!=='string'||!['star','coin','jump','boost'].includes(e.kind)))return null;
 if(raw.stars!==raw.legacyStars+raw.collected.filter(e=>e.kind==='star').length||raw.coins!==raw.collected.filter(e=>e.kind!=='star').length)return null;
 if(raw.jumpCharges>raw.collected.filter(e=>e.kind==='jump').length*2-raw.jumps)return null;
 if(!Array.isArray(raw.entities)||raw.entities.length>50||new Set(raw.entities.map(e=>e?.id)).size!==raw.entities.length)return null;
 if(raw.entities.some(e=>typeof e?.id!=='string'||!KINDS.has(e.kind)||!Number.isInteger(e.lane)||!finite(e.lane,0,2)||!finite(e.at,raw.distance,raw.distance+ROAD.far)||raw.collected.some(c=>c.id===e.id)||e.kind==='letter'&&(!/^[a-z]$/.test(e.letter)||e.slot!==drive.index||!Number.isSafeInteger(e.row))))return null;
 const restored=JSON.parse(JSON.stringify({...raw,drive,paused:false,autoJump:!!raw.autoJump,boostOn:!!raw.boostOn}));
 if(!drive.complete&&!restored.entities.some(e=>e.kind==='letter'))spawnWave(restored);
 return restored;
}
