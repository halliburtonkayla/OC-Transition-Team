(function(g){'use strict';
function shuffle(items,random=Math.random){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function balancedPositions(length,count,random=Math.random){
 const offset=Math.floor(random()*count),base=Array.from({length},(_,i)=>(i+offset)%count);
 for(let attempt=0;attempt<64;attempt++){const order=shuffle(base,random);if(order.every((v,i)=>i<2||v!==order[i-1]||v!==order[i-2]))return order;}
 return base;
}
function create({bank,teams=['Player 1'],guided=false,seconds=45,random=Math.random}){
 if(!Array.isArray(teams)||teams.length<1||teams.length>4)throw Error('Choose one to four players or teams.');
 const cards=bank.categories.flatMap(c=>{const pool=bank.questions.filter(q=>q.category===c.id);const selected=pool.some(q=>q.level)?[1,2].map(level=>shuffle(pool.filter(q=>q.level===level),random)[0]):shuffle(pool,random).slice(0,2);return selected.map((q,i)=>{let options=q.options.map((text,index)=>({text,correct:index===q.answer}));if(guided)options=[options[q.answer],options.find(o=>!o.correct)];return {...q,options:shuffle(options,random),value:(i+1)*100,done:false}})});
 return {teams:teams.map((name,i)=>({name:String(name).trim().slice(0,32)||'Team '+(i+1),score:0})),cards,guided,seconds:[0,30,45,60].includes(Number(seconds))?Number(seconds):45,answerOrder:balancedPositions(cards.length,guided?2:3,random),phase:'board',current:null,turn:0,buzzed:null,attempts:[],history:[],message:'',correct:false,remaining:0,paused:false};
}
function choose(s,id){if(s.phase!=='board')return false;const q=s.cards.find(q=>q.id===id&&!q.done);if(!q)return false;const right=q.options.find(o=>o.correct),wrong=shuffle(q.options.filter(o=>!o.correct)),position=s.answerOrder[s.cards.filter(q=>q.done).length];wrong.splice(position,0,right);q.options=wrong;s.current=id;s.phase='question';s.buzzed=null;s.attempts=[];s.message='';s.remaining=s.seconds;s.paused=false;return true}
const question=s=>s.cards.find(q=>q.id===s.current);
function canBuzz(s,team){if(s.phase!=='question'||s.paused||!Number.isInteger(team)||!s.teams[team])return false;const n=s.attempts.filter(a=>a.teamIndex===team).length;return n<(s.teams.length===1?2:1)}
function buzz(s,team){if(!canBuzz(s,team))return false;s.buzzed=team;s.phase='answer';s.message=s.teams[team].name+' buzzed in!';return true}
function resolve(s,correct,message){const q=question(s);s.phase='feedback';s.correct=correct;s.message=message;q.done=true;s.paused=false;}
function answer(s,index){if(s.phase!=='answer'||s.paused)return null;const q=question(s),o=q.options[index];if(!o)return null;const team=s.buzzed,retry=s.attempts.some(a=>a.teamIndex===team),points=o.correct?Math.round(q.value*(retry?.5:1)):0;
 const event={question:q.id,category:q.category,prompt:q.prompt,team:s.teams[team].name,teamIndex:team,choice:o.text,correct:o.correct,points,retry};s.attempts.push(event);s.history.push(event);s.teams[team].score+=points;
 if(o.correct)resolve(s,true,points+' points! '+q.explanation);else{ s.phase='question';s.buzzed=null;s.message='Not quite. '+q.hint;if(!s.teams.some((_,i)=>canBuzz(s,i)))resolve(s,false,q.explanation);}
 return event;
}
function timeout(s){if(!['question','answer'].includes(s.phase))return false;s.history.push({question:s.current,prompt:question(s).prompt,category:question(s).category,team:'No answer in time',teamIndex:null,choice:'Timed out',correct:false,points:0,retry:false});s.remaining=0;resolve(s,false,'Time for a learning moment. '+question(s).explanation);return true}
function next(s){if(s.phase!=='feedback')return false;s.turn=(s.turn+1)%s.teams.length;s.current=null;s.phase=s.cards.every(q=>q.done)?'finished':'board';s.message='';s.buzzed=null;return true}
function winners(s){const high=Math.max(...s.teams.map(t=>t.score));return s.teams.filter(t=>t.score===high)}
g.TTShowCore={create,choose,buzz,answer,timeout,next,question,canBuzz,winners,shuffle,balancedPositions};if(typeof module!=='undefined')module.exports=g.TTShowCore;
})(typeof window!=='undefined'?window:globalThis);
