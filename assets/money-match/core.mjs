// Values are whole cents. No account or student records are changed by practice.
export const MONEY = Object.freeze({
 penny:{name:'penny',plural:'pennies',cents:1,kind:'coin',image:'penny.webp',value:'1¢'},
 nickel:{name:'nickel',plural:'nickels',cents:5,kind:'coin',image:'nickel.webp',value:'5¢'},
 dime:{name:'dime',plural:'dimes',cents:10,kind:'coin',image:'dime.webp',value:'10¢'},
 quarter:{name:'quarter',plural:'quarters',cents:25,kind:'coin',image:'quarter.webp',value:'25¢'},
 one:{name:'one-dollar bill',plural:'one-dollar bills',cents:100,kind:'bill',image:'one.webp',value:'$1'},
 five:{name:'five-dollar bill',plural:'five-dollar bills',cents:500,kind:'bill',image:'five.webp',value:'$5'},
 ten:{name:'ten-dollar bill',plural:'ten-dollar bills',cents:1000,kind:'bill',image:'ten.webp',value:'$10'}
});
export const COINS=['penny','nickel','dime','quarter'];
export const total=items=>items.reduce((sum,id)=>sum+MONEY[id].cents,0);
export const dollars=cents=>'$'+(cents/100).toFixed(2);
export function spokenAmount(cents){const d=Math.floor(cents/100),c=cents%100;return [d?`${d} ${d===1?'dollar':'dollars'}`:'',c||!d?`${c} ${c===1?'cent':'cents'}`:''].filter(Boolean).join(' and ');}
export function describe(items){const counts=new Map();items.forEach(id=>counts.set(id,(counts.get(id)||0)+1));return [...counts].map(([id,n])=>`${n} ${n===1?MONEY[id].name:MONEY[id].plural}`).join(', ');}
export function shuffle(items,random=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function coinQuestions(choices=3,random=Math.random){return shuffle([...COINS,...COINS,'dime','quarter'],random).map((answer,i)=>({id:`coin-${i}`,answer,options:shuffle([answer,...shuffle(COINS.filter(x=>x!==answer),random).slice(0,choices-1)],random)}));}
const MATCH_SETS={
 coins:[[['nickel','penny'],['dime','nickel'],['quarter','penny']],[['dime','penny'],['quarter','nickel'],['quarter','dime','nickel']]],
 mixed:[
  [['one','quarter','penny'],['quarter','quarter','quarter','nickel','penny'],['dime','nickel','penny'],['five','quarter','quarter','quarter','nickel'],['quarter','penny']],
  [['one','quarter','quarter','dime','nickel','penny','penny'],['quarter','dime','dime','penny'],['ten','one','dime'],['one','one','quarter','quarter','penny'],['one','nickel']]
 ]
};
export function matchBoards(level='mixed',random=Math.random){return MATCH_SETS[level].map((sets,b)=>{const groups=sets.map((items,i)=>({id:`b${b}-g${i}`,items:[...items],cents:total(items)}));return {groups:shuffle(groups,random),targets:groups.map(g=>({id:'target-'+g.id,cents:g.cents}))};});}
export function countQuestions(level='mixed',choices=3,random=Math.random){const keys=level==='coins'?COINS:Object.keys(MONEY);return Array.from({length:10},(_,i)=>{const count=2+Math.floor(random()*(level==='coins'?3:5)),items=Array.from({length:count},()=>keys[Math.floor(random()*keys.length)]),answer=total(items),options=new Set([answer]);for(const delta of shuffle([-100,-25,-10,-5,-1,1,5,10,25,100],random)){if(answer+delta>0)options.add(answer+delta);if(options.size===choices)break;}return {id:`count-${i}`,items,answer,options:shuffle([...options],random)};});}
export class QuizProgress{
 constructor(size){this.attempts=Array(size).fill(0);this.solved=new Set();this.firstTry=0;}
 answer(index,correct){if(index<0||index>=this.attempts.length||this.solved.has(index))return false;this.attempts[index]++;if(correct){this.solved.add(index);if(this.attempts[index]===1)this.firstTry++;}return true;}
}
export function placeGroup(assignments,targetId,groupId,board,locked=new Set()){
 if(!board.targets.some(t=>t.id===targetId)||!board.groups.some(g=>g.id===groupId)||locked.has(targetId))return {...assignments};
 if(Object.entries(assignments).some(([t,g])=>g===groupId&&locked.has(t)))return {...assignments};
 const next={...assignments};for(const [t,g]of Object.entries(next))if(g===groupId)delete next[t];next[targetId]=groupId;return next;
}
export function checkMatches(assignments,board,locked=new Set()){
 const correct=[],incorrect=[],missing=[];
 for(const t of board.targets){if(locked.has(t.id))continue;const g=board.groups.find(g=>g.id===assignments[t.id]);if(!g)missing.push(t.id);else(g.cents===t.cents?correct:incorrect).push(t.id);}
 return {correct,incorrect,missing};
}
