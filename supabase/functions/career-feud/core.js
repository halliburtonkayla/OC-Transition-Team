export const FOCI=['Workplace Readiness','Job Exploration','Self-Advocacy','Postsecondary Education'];
export const DEFAULT_TEAMS=[{name:'Team 1',members:['Olivia','Bradley (Max)','Alyssa']},{name:'Team 2',members:['Jocquan','Kaylee','Nick']}];
const copy=x=>JSON.parse(JSON.stringify(x));
const requireThat=(yes,message)=>{if(!yes)throw Error(message)};
const text=(s,max)=>String(s??'').trim().slice(0,max);
export function teams(input){
 requireThat(Array.isArray(input)&&input.length===2,'Use exactly two teams.');
 const out=input.map((t,i)=>({name:text(t.name,50)||'Team '+(i+1),members:(Array.isArray(t.members)?t.members:[]).map(x=>text(x,60))}));
 requireThat(out.every(t=>t.members.length===3&&t.members.every(Boolean)),'Each team needs exactly three student names.');
 const names=out.flatMap(t=>t.members.map(n=>n.toLowerCase()));
 requireThat(new Set(names).size===6,'Use each student once.');
 requireThat(!out.some(t=>t.members.some(n=>/\bolivia\b/i.test(n))&&t.members.some(n=>/\bjocquan\b/i.test(n))),'Keep Olivia and Jocquan on opposite teams.');
 return out;
}
export function roles(team,round){
 const labels=['Discussion leader','Typist','Spokesperson'];
 return labels.map((role,i)=>({role,student:team.members[(i+round)%3]}));
}
export function createState(b,bank,now,random=Math.random){
 const focus=b.focus||FOCI[0],count=Number(b.length??14),seconds=Number(b.seconds??90);
 requireThat(FOCI.includes(focus),'Choose one service focus.');
 const deck=bank.filter(q=>q.focus===focus).map(copy);
 requireThat(Number.isInteger(count)&&count>=1&&count<=Math.min(14,deck.length),'Choose 1–14 questions.');
 requireThat(Number.isInteger(seconds)&&seconds>=0&&seconds<=900,'Use 0–900 seconds; zero means untimed.');
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 return {focus,deck:deck.slice(0,count),seconds,teams:teams(b.teams||DEFAULT_TEAMS),phase:'lobby',paused:false,createdAt:now,startedAt:null,endedAt:null,rounds:[],ready:[false,false],seen:[0,0],notes:{},nextPlan:'',scoring:[],requests:[],revision:0};
}
export function remaining(s,now){
 if(!s.rounds.length)return s.seconds;
 if(s.deadline===null)return null;
 return s.paused?s.remaining:Math.max(0,Math.ceil((s.deadline-now)/1000));
}
export function mutate(state,role,b,now){
 const s=copy(state),host=role==='host',n=host?-1:Number(role),a=b.action;
 requireThat(b.requestId===undefined||(typeof b.requestId==='string'&&/^[A-Za-z0-9:_-]{1,100}$/.test(b.requestId)),'Invalid action identifier.');
 requireThat(host||n===0||n===1,'Invalid role.');
 if(b.requestId&&s.requests.includes(b.requestId))return s;
 const r=s.rounds.at(-1);
 if(!host){
  requireThat(['heartbeat','ready','draft','lock'].includes(a),'Only the host can use that control.');
  s.seen[n]=now;
  if(a==='ready'){requireThat(['lobby','between'].includes(s.phase),'Ready is used between rounds.');s.ready[n]=!!b.ready;}
  if(a==='draft'||a==='lock'){
   requireThat(s.phase==='discuss'&&!s.paused,'Wait for the host to open discussion.');
   requireThat(Number(b.round)===s.rounds.length,'This answer belongs to an earlier round. Check the current question.');
   requireThat(remaining(s,now)===null||remaining(s,now)>0,'Time is up. The teacher can add discussion time.');
   requireThat(!r.answers[n].locked,'Your answer is locked. Ask the teacher to unlock it.');
   const answer=text(b.answer,2400);requireThat(a!=='lock'||answer.length>0,'Type a team answer before locking in.');
   r.answers[n]={text:answer,locked:a==='lock',submittedAt:a==='lock'?now:null};
  }
 }else{
  requireThat(['configure','start','pause','resume','reveal','next','skip','end','timer','unlock','score','undo','notes','release'].includes(a),'Unknown teacher control.');
  if(a==='configure'){requireThat(s.phase==='lobby','Team setup is saved before the session starts.');s.teams=teams(b.teams);}
  if(a==='start'){
   requireThat(['lobby','between'].includes(s.phase),'A round is already open.');
   requireThat(s.ready.every(Boolean)&&s.seen.every(t=>now-t<20000),'Both team laptops must be connected and ready.');
   requireThat(s.rounds.length<s.deck.length,'All selected questions have been used.');
   if(!s.startedAt)s.startedAt=now;
   s.rounds.push({number:s.rounds.length+1,question:s.deck[s.rounds.length],startedAt:now,endedAt:null,roles:s.teams.map(t=>roles(t,s.rounds.length)),answers:[{text:'',locked:false,submittedAt:null},{text:'',locked:false,submittedAt:null}],points:[0,0],revealed:false,skipped:false});
   s.phase='discuss';s.paused=false;s.deadline=s.seconds?now+s.seconds*1000:null;s.remaining=s.seconds||null;
  }
  if(a==='pause'){requireThat(s.phase==='discuss'&&!s.paused,'Discussion is not running.');s.remaining=remaining(s,now);s.paused=true;}
  if(a==='resume'){requireThat(s.phase==='discuss'&&s.paused,'Discussion is not paused.');s.deadline=s.remaining===null?null:now+s.remaining*1000;s.paused=false;}
  if(a==='timer'){
   requireThat(s.phase==='discuss','Open a round to change its timer.');
   const seconds=Number(b.seconds);requireThat(Number.isInteger(seconds)&&seconds>=0&&seconds<=900,'Choose 0–900 seconds.');
   s.remaining=seconds||null;s.deadline=seconds?now+seconds*1000:null;
  }
  if(a==='reveal'){requireThat(s.phase==='discuss','There are no hidden round answers to reveal.');r.revealed=true;s.phase='reveal';s.paused=false;}
  if(a==='unlock'){
   const i=Number(b.team);requireThat(i===0||i===1,'Choose a team.');
   requireThat(s.phase==='discuss','Answers can be corrected before reveal.');r.answers[i].locked=false;r.answers[i].submittedAt=null;
  }
  if(a==='score'){
   const i=Number(b.team),p=Number(b.points),idx=Number(b.round)-1,target=s.rounds[idx];
   requireThat((i===0||i===1)&&target&&target.revealed,'Reveal the selected round before scoring.');
   requireThat(Number.isInteger(p)&&p>=-100&&p<=100,'Enter whole-number points between -100 and 100.');
   s.scoring.push({round:idx,team:i,before:target.points[i],after:p,at:now});target.points[i]=p;
  }
  if(a==='undo'){const last=s.scoring.pop();requireThat(last,'There is no score change to undo.');s.rounds[last.round].points[last.team]=last.before;}
  if(a==='next'||a==='skip'){
   requireThat(['discuss','reveal'].includes(s.phase),'There is no current round to advance.');
   requireThat(a==='skip'||r.revealed,'Reveal answers or skip this question first.');
   r.skipped=a==='skip';r.endedAt=now;s.paused=false;s.ready=[false,false];
   if(s.rounds.length>=s.deck.length){s.phase='ended';s.endedAt=now}else s.phase='between';
  }
  if(a==='end'){requireThat(s.phase!=='ended','This session has ended.');s.phase='ended';s.endedAt=now;s.paused=false;if(r&&!r.endedAt)r.endedAt=now;}
  if(a==='notes'){
   requireThat(b.notes&&typeof b.notes==='object'&&!Array.isArray(b.notes),'Provide participation notes.');
   s.notes={};for(let i=0;i<2;i++)for(let j=0;j<3;j++)s.notes[i+':'+j]=text(b.notes[i+':'+j],3000);
   s.nextPlan=text(b.nextPlan,3000);
  }
  if(a==='release'){const i=Number(b.team);requireThat(i===0||i===1,'Choose a team.');s.ready[i]=false;s.seen[i]=0;}
 }
 if(b.requestId)s.requests=[...s.requests.slice(-199),b.requestId];
 s.revision++;
 return s;
}
export function view(s,role,now,claimed=[false,false]){
 const host=role==='host',n=host?-1:Number(role),cur=s.rounds.at(-1),scores=[0,1].map(i=>s.rounds.reduce((v,r)=>v+r.points[i],0));
 const shownRound=r=>({number:r.number,prompt:r.question.prompt,category:r.question.category,startedAt:r.startedAt,endedAt:r.endedAt,roles:r.roles,points:r.points,revealed:r.revealed,skipped:r.skipped,answers:r.answers.map((a,i)=>({locked:a.locked,submittedAt:a.submittedAt,text:host||r.revealed||i===n?a.text:null})),...(host?{guidance:{lookFor:r.question.lookFor,alternatives:r.question.alternatives,points:r.question.points,teaching:r.question.teaching}}:s.phase==='ended'&&r.revealed?{teaching:r.question.teaching}:{})});
 return {role,focus:s.focus,teams:s.teams,phase:s.phase,paused:s.paused,createdAt:s.createdAt,startedAt:s.startedAt,endedAt:s.endedAt,total:s.deck.length,roundNumber:s.rounds.length,remaining:remaining(s,now),serverNow:now,scores,ready:s.ready,connected:s.seen.map(t=>now-t<20000),claimed,round:cur?shownRound(cur):null,upcomingRoles:s.teams.map(t=>roles(t,s.rounds.length)),revision:s.revision,...(host?{notes:s.notes,nextPlan:s.nextPlan,history:s.rounds.map(shownRound),canUndo:!!s.scoring.length}:s.phase==='ended'?{history:s.rounds.map(shownRound)}:{})};
}
