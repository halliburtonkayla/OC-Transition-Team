export const FOCI=['Workplace Readiness','Job Exploration','Self-Advocacy','Postsecondary Education'];
// Roster identities are entered for each session, never seeded from a classroom list.
export const DEFAULT_TEAMS=[{name:'Team 1',members:['','','']},{name:'Team 2',members:['','','']}];
const copy=x=>JSON.parse(JSON.stringify(x));
const requireThat=(yes,message)=>{if(!yes)throw Error(message)};
const text=(s,max)=>String(s??'').trim().slice(0,max);
const nameKey=s=>String(s).trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
const indices=s=>s.teams.map((_,i)=>i);
const mode=s=>s.gameMode||'teams';
const active=s=>s.active||indices(s);
const validSeat=(s,i)=>Number.isInteger(i)&&i>=0&&i<s.teams.length;
const scores=s=>indices(s).map(i=>s.rounds.reduce((v,r)=>v+(r.points[i]||0),0));
const leaders=s=>{const totals=scores(s),high=Math.max(...totals);return indices(s).filter(i=>totals[i]===high)};
export function teams(input){
 requireThat(Array.isArray(input)&&input.length===2,'Use exactly two teams.');
 const out=input.map((t,i)=>({name:text(t?.name,50)||'Team '+(i+1),members:(Array.isArray(t?.members)?t.members:[]).map(x=>text(x,60))}));
 requireThat(out.every(t=>t.members.length>=1&&t.members.length<=3&&t.members.every(Boolean)),'Each team needs 1–3 typed student names.');
 const names=out.flatMap(t=>t.members.map(nameKey));
 requireThat(new Set(names).size===names.length,'Use each student once.');
 return out;
}
export function roles(team,round){
 const labels=['Discussion leader','Typist','Spokesperson'];
 if(team.members.length===1)return [{role:'Player',student:team.members[0]}];
 return labels.map((role,i)=>({role,student:team.members[(i+round)%team.members.length]}));
}
export function createState(b,bank,now,random=Math.random){
 const focus=b.focus||FOCI[0],count=Number(b.length??14),seconds=Number(b.seconds??90),gameMode=b.gameMode||(b.teams?'teams':'individual');
 requireThat(['individual','teams'].includes(gameMode),'Choose individual players or two teams.');
 requireThat(FOCI.includes(focus),'Choose one service focus.');
 const deck=bank.filter(q=>q.focus===focus).map(copy);
 requireThat(Number.isInteger(count)&&count>=1&&count<=Math.min(14,deck.length),'Choose 1–14 questions.');
 requireThat(Number.isInteger(seconds)&&seconds>=0&&seconds<=900,'Use 0–900 seconds; zero means untimed.');
 const playerCount=Number(b.playerCount??(gameMode==='teams'?b.teams?.reduce((n,t)=>n+(Array.isArray(t.members)?t.members.length:0),0):3));
 requireThat(Number.isInteger(playerCount)&&playerCount>=2&&playerCount<=6,'Choose 2–6 actual players.');
 const roster=gameMode==='individual'?Array.from({length:playerCount},(_,i)=>({name:'Player '+(i+1),members:['']})):teams(b.teams);
 requireThat(roster.reduce((n,t)=>n+t.members.length,0)===playerCount,'The typed roster must match the actual player count.');
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 return {gameMode,playerCount,focus,deck:deck.slice(0,count),tieDeck:[...deck.slice(count),...deck.slice(0,count)],seconds,teams:roster,active:roster.map((_,i)=>i),tiebreaker:0,winner:null,regularFinished:false,phase:'lobby',paused:false,createdAt:now,startedAt:null,endedAt:null,rounds:[],ready:roster.map(()=>false),seen:roster.map(()=>0),notes:{},nextPlan:'',scoring:[],requests:[],revision:0};
}
// The endpoint calls this only after verifying the room capability and seat claim.
export function claimName(state,seat,input,alreadyClaimed=false){
 const s=copy(state);requireThat(validSeat(s,seat),'Choose an available player seat.');
 if(mode(s)!=='individual')return s;
 const old=s.teams[seat].members[0],name=text(input,60);
 if(alreadyClaimed){requireThat(!name||nameKey(name)===nameKey(old),'Reconnect using your existing player name.');return s;}
 requireThat(name,'Type your name before joining.');
 requireThat(!s.teams.some((t,i)=>i!==seat&&t.members.some(n=>nameKey(n)===nameKey(name))),'That name is already in this game. Add a last initial to distinguish players.');
 requireThat(s.phase==='lobby'||(old&&nameKey(old)===nameKey(name)),'This seat belongs to '+old+'. Reconnect using the same name.');
 s.teams[seat]={name,members:[name]};return s;
}
export function remaining(s,now){
 if(!s.rounds.length)return s.seconds;
 if(s.deadline===null)return null;
 return s.paused?s.remaining:Math.max(0,Math.ceil((s.deadline-now)/1000));
}
function finishOrTiebreak(s,now){
 s.regularFinished=true;s.paused=false;s.ready=s.teams.map(()=>false);
 if(!s.rounds.length){s.phase='ended';s.endedAt=now;s.winner=null;return;}
 const top=leaders(s);
 if(top.length===1){s.phase='ended';s.endedAt=now;s.winner=top[0];return;}
 s.phase='between';s.endedAt=null;s.winner=null;s.active=top;
 s.tiebreaker=s.rounds.filter(r=>r.tiebreaker).length+1;
}
export function mutate(state,role,b,now){
 const s=copy(state),host=role==='host',n=host?-1:Number(role),a=b.action;
 requireThat(b.requestId===undefined||(typeof b.requestId==='string'&&/^[A-Za-z0-9:_-]{1,100}$/.test(b.requestId)),'Invalid action identifier.');
 requireThat(host||validSeat(s,n),'Invalid role.');
 if(b.requestId&&s.requests.includes(b.requestId))return s;
 if(b.expectedRound!==undefined)requireThat(Number(b.expectedRound)===s.rounds.length,'The round changed. Check the current question before trying again.');
 if(b.expectedPhase!==undefined)requireThat(b.expectedPhase===s.phase,'The game moved on. Check the current screen before trying again.');
 const r=s.rounds.at(-1);
 if(!host){
  requireThat(['heartbeat','ready','draft','lock'].includes(a),'Only the host can use that control.');
  s.seen[n]=now;
  if(a==='ready'){requireThat(['lobby','between'].includes(s.phase),'Ready is used between rounds.');requireThat(active(s).includes(n),'Only the tied leaders play this tiebreaker.');requireThat(s.teams[n].members.every(Boolean),'Type your name before getting ready.');s.ready[n]=!!b.ready;}
  if(a==='draft'||a==='lock'){
   requireThat(s.phase==='discuss'&&!s.paused,'Wait for the host to open discussion.');
   requireThat((r.active||indices(s)).includes(n),'Only the tied leaders answer this tiebreaker.');
   requireThat(Number(b.round)===s.rounds.length,'This answer belongs to an earlier round. Check the current question.');
   requireThat(remaining(s,now)===null||remaining(s,now)>0,'Time is up. The teacher can add discussion time.');
   requireThat(!r.answers[n].locked,'Your answer is locked. Ask the teacher to unlock it.');
   const answer=text(b.answer,2400);requireThat(a!=='lock'||answer.length>0,'Type an answer before locking in.');
   r.answers[n]={text:answer,locked:a==='lock',submittedAt:a==='lock'?now:null};
  }
 }else{
  requireThat(['configure','start','pause','resume','reveal','next','skip','end','timer','unlock','score','undo','notes','release'].includes(a),'Unknown teacher control.');
  if(a==='configure'){
   requireThat(s.phase==='lobby','Team setup is saved before the session starts.');requireThat(mode(s)==='teams','Players type their own names when joining.');
   s.teams=teams(b.teams);s.playerCount=s.teams.reduce((n,t)=>n+t.members.length,0);s.ready=s.teams.map(()=>false);
  }
  if(a==='start'){
   requireThat(['lobby','between'].includes(s.phase),'A round is already open.');
   requireThat(active(s).every(i=>s.ready[i]&&s.seen[i]>0&&now-s.seen[i]<20000&&s.teams[i].members.every(Boolean)),'All active player or team laptops must be connected, named, and ready.');
   const tie=Number(s.tiebreaker)||0,tieDeck=s.tieDeck?.length?s.tieDeck:s.deck;
   requireThat(tie||s.rounds.length<s.deck.length,'All selected questions have been used.');
   if(!s.startedAt)s.startedAt=now;
   s.rounds.push({number:s.rounds.length+1,question:tie?tieDeck[(tie-1)%tieDeck.length]:s.deck[s.rounds.length],startedAt:now,endedAt:null,roles:s.teams.map(t=>roles(t,s.rounds.length)),active:[...active(s)],tiebreaker:tie,answers:s.teams.map(()=>({text:'',locked:false,submittedAt:null})),points:s.teams.map(()=>0),revealed:false,skipped:false});
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
   const i=Number(b.team);requireThat(validSeat(s,i),'Choose a player or team.');
   requireThat(s.phase==='discuss','Answers can be corrected before reveal.');requireThat((r.active||indices(s)).includes(i),'That player or team is not in this tiebreaker.');r.answers[i].locked=false;r.answers[i].submittedAt=null;
  }
  if(a==='score'){
   const i=Number(b.team),p=Number(b.points),idx=Number(b.round)-1,target=s.rounds[idx];
   requireThat(validSeat(s,i)&&target&&target.revealed,'Reveal the selected round before scoring.');
   requireThat((target.active||indices(s)).includes(i),'Only participants in this round can receive points.');
   requireThat(Number.isInteger(p)&&p>=(target.tiebreaker?0:-100)&&p<=100,target.tiebreaker?'Enter whole-number tiebreaker points between 0 and 100.':'Enter whole-number points between -100 and 100.');
   s.scoring.push({round:idx,team:i,before:target.points[i],after:p,at:now});target.points[i]=p;
   if(s.phase==='ended'||(s.phase==='between'&&s.regularFinished))finishOrTiebreak(s,now);
  }
  if(a==='undo'){
   const last=s.scoring.pop();requireThat(last,'There is no score change to undo.');s.rounds[last.round].points[last.team]=last.before;
   if(s.phase==='ended'||(s.phase==='between'&&s.regularFinished))finishOrTiebreak(s,now);
  }
  if(a==='next'||a==='skip'){
   requireThat(['discuss','reveal'].includes(s.phase),'There is no current round to advance.');
   requireThat(a==='skip'||r.revealed,'Reveal answers or skip this question first.');
   r.skipped=a==='skip';r.endedAt=now;s.paused=false;s.ready=s.teams.map(()=>false);
   if(s.regularFinished||s.rounds.length>=s.deck.length)finishOrTiebreak(s,now);else s.phase='between';
  }
  if(a==='end'){
   requireThat(s.phase!=='ended','This session has ended.');
   if(r&&!r.endedAt)r.endedAt=now;
   finishOrTiebreak(s,now);
  }
  if(a==='notes'){
   requireThat(b.notes&&typeof b.notes==='object'&&!Array.isArray(b.notes),'Provide participation notes.');
   s.notes={};s.teams.forEach((t,i)=>t.members.forEach((_,j)=>{s.notes[i+':'+j]=text(b.notes[i+':'+j],3000)}));
   s.nextPlan=text(b.nextPlan,3000);
  }
  if(a==='release'){
   const i=Number(b.team);requireThat(validSeat(s,i),'Choose a player or team.');s.ready[i]=false;s.seen[i]=0;
   if(mode(s)==='individual'&&s.phase==='lobby')s.teams[i]={name:'Player '+(i+1),members:['']};
  }
 }
 if(b.requestId)s.requests=[...s.requests.slice(-199),b.requestId];
 s.revision++;
 return s;
}
export function view(s,role,now,claimed=[]){
 const host=role==='host',n=host?-1:Number(role),cur=s.rounds.at(-1),totals=scores(s),gameMode=mode(s);
 const shownRound=r=>({number:r.number,prompt:r.question.prompt,category:r.question.category,startedAt:r.startedAt,endedAt:r.endedAt,roles:r.roles,points:r.points,active:r.active||indices(s),tiebreaker:r.tiebreaker||0,revealed:r.revealed,skipped:r.skipped,answers:r.answers.map((a,i)=>({locked:a.locked,submittedAt:a.submittedAt,text:host||r.revealed||i===n?a.text:null})),...(host?{guidance:{lookFor:r.question.lookFor,alternatives:r.question.alternatives,points:r.question.points,teaching:r.question.teaching}}:s.phase==='ended'&&r.revealed?{teaching:r.question.teaching}:{})});
 const top=leaders(s),winner=s.phase==='ended'&&s.rounds.length&&top.length===1?top[0]:null;
 return {role,gameMode,playerCount:s.playerCount||s.teams.reduce((n,t)=>n+t.members.length,0),focus:s.focus,teams:s.teams,active:[...active(s)],tiebreaker:s.tiebreaker||0,winner,tally:s.teams.map((t,i)=>({index:i,name:t.name,roundPoints:s.rounds.map(r=>r.points[i]||0),total:totals[i]})),phase:s.phase,paused:s.paused,createdAt:s.createdAt,startedAt:s.startedAt,endedAt:s.endedAt,total:s.deck.length,roundNumber:s.rounds.length,remaining:remaining(s,now),serverNow:now,scores:totals,ready:s.ready,connected:s.seen.map(t=>t>0&&now-t<20000),claimed:s.teams.map((_,i)=>!!claimed[i]),round:cur?shownRound(cur):null,upcomingRoles:s.teams.map(t=>roles(t,s.rounds.length)),revision:s.revision,...(host?{notes:s.notes,nextPlan:s.nextPlan,history:s.rounds.map(shownRound),canUndo:!!s.scoring.length}:s.phase==='ended'?{history:s.rounds.map(shownRound)}:{})};
}
