// One anonymous turn at a time. No profiles, persistence, analytics, or network state.
export const TURN_SECONDS = 30;
export const TIERS = Object.freeze([
  {id:'first', label:'First words', description:'Familiar words · 2 letter choices', choices:2},
  {id:'growing', label:'Growing spellers', description:'More short words · 3 letter choices', choices:3},
  {id:'challenge', label:'Ready for more', description:'Mixed short words · closer letter choices', choices:3}
]);
export const WORDS = Object.freeze([
  {id:'cat', tier:'first', tile:0}, {id:'sun', tier:'first', tile:1},
  {id:'dog', tier:'first', tile:2}, {id:'hat', tier:'first', tile:3},
  {id:'cup', tier:'growing', tile:4}, {id:'pig', tier:'growing', tile:5},
  {id:'bed', tier:'growing', tile:6}, {id:'pen', tier:'growing', tile:7},
  {id:'bus', tier:'challenge', tile:8}, {id:'map', tier:'challenge', tile:9},
  {id:'hen', tier:'challenge', tile:10}, {id:'jam', tier:'challenge', tile:11},
  {id:'fox', tier:'first', tile:0, atlas:'expanded'},
  {id:'box', tier:'first', tile:1, atlas:'expanded'},
  {id:'van', tier:'first', tile:2, atlas:'expanded'},
  {id:'bat', tier:'first', tile:3, atlas:'expanded'},
  {id:'rat', tier:'first', tile:4, atlas:'expanded'},
  {id:'bag', tier:'first', tile:5, atlas:'expanded'},
  {id:'net', tier:'first', tile:6, atlas:'expanded'},
  {id:'web', tier:'first', tile:7, atlas:'expanded'},
  {id:'log', tier:'growing', tile:8, atlas:'expanded'},
  {id:'mop', tier:'growing', tile:9, atlas:'expanded'},
  {id:'pot', tier:'growing', tile:10, atlas:'expanded'},
  {id:'pan', tier:'growing', tile:11, atlas:'expanded'},
  {id:'fan', tier:'growing', tile:12, atlas:'expanded'},
  {id:'rug', tier:'growing', tile:13, atlas:'expanded'},
  {id:'lid', tier:'growing', tile:14, atlas:'expanded'},
  {id:'duck', tier:'growing', tile:15, atlas:'expanded'},
  {id:'fish', tier:'challenge', tile:16, atlas:'expanded'},
  {id:'frog', tier:'challenge', tile:17, atlas:'expanded'},
  {id:'milk', tier:'challenge', tile:18, atlas:'expanded'},
  {id:'cake', tier:'challenge', tile:19, atlas:'expanded'},
  {id:'kite', tier:'challenge', tile:20, atlas:'expanded'},
  {id:'boat', tier:'challenge', tile:21, atlas:'expanded'},
  {id:'sock', tier:'challenge', tile:22, atlas:'expanded'},
  {id:'leaf', tier:'challenge', tile:23, atlas:'expanded'}
]);
const LETTERS='abcdefghijklmnopqrstuvwxyz';
const NEAR={a:'eo',b:'dp',c:'kg',d:'bp',e:'ia',g:'cj',h:'nm',i:'eu',j:'gy',m:'nw',n:'mh',o:'ua',p:'bd',s:'zc',t:'fd',u:'oa'};
export function shuffled(list, random=Math.random){
  const result=[...list]; for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[result[i],result[j]]=[result[j],result[i]];} return result;
}
export function chooseWord(tier, previous, random=Math.random){
  const pool=WORDS.filter(w=>w.tier===tier&&w.id!==previous);return shuffled(pool.length?pool:WORDS,random)[0];
}
// Each level cycles through all twelve words before repeating any.
export function createWordPicker(random=Math.random){
  const decks=new Map(),last=new Map();
  return tier=>{
    let deck=decks.get(tier);
    if(!deck?.length){
      deck=shuffled(WORDS.filter(w=>w.tier===tier),random);
      if(!deck.length)throw new Error('Unknown level');
      if(deck.length>1&&deck[deck.length-1].id===last.get(tier))[deck[0],deck[deck.length-1]]=[deck[deck.length-1],deck[0]];
      decks.set(tier,deck);
    }
    const word=deck.pop();last.set(tier,word.id);return word;
  };
}
export function choicesFor(word,index,tier,random=Math.random){
  const target=word[index],count=TIERS.find(t=>t.id===tier)?.choices||2;
  if(!target)return [];
  const candidates=tier==='challenge'?shuffled([...new Set((NEAR[target]||'aeiou')+LETTERS)],random):shuffled([...LETTERS],random);
  // Closer alternatives in the highest tier are deliberate, but position is never a cue.
  const distractors=(tier==='challenge'?[...(NEAR[target]||''),...candidates]:candidates).filter(c=>c!==target);
  return shuffled([target,...[...new Set(distractors)].slice(0,count-1)],random);
}
export const WAVE_SECONDS=4.2;
export function roadChoices(word,index,tier,random=Math.random){
  const letters=choicesFor(word,index,tier,random);
  return shuffled([...letters,...Array(3-letters.length).fill(null)],random);
}
export function createTurn(word,tier='first',random=Math.random){
  if(!WORDS.some(w=>w.id===word))throw new Error('Unknown word');
  return {word,tier,phase:'run',previousPhase:null,attempt:'',remaining:TURN_SECONDS,elapsed:0,index:0,choices:roadChoices(word,0,tier,random),selected:1,movement:0,wave:0,mistakes:0,feedback:'',outcome:null};
}
export function selectLane(turn,lane){
  if(turn.phase!=='run'||!Number.isFinite(lane))return false;
  turn.selected=Math.max(0,Math.min(2,Math.round(lane)));return true;
}
function finish(turn,reason){turn.phase='result';turn.outcome=turn.attempt===turn.word?'correct':reason;return turn;}
export function advance(turn,seconds,random=Math.random){
  if(turn.phase!=='run'||!Number.isFinite(seconds)||seconds<=0)return turn;
  let delta=Math.min(seconds,turn.remaining);
  while(delta>1e-9&&turn.phase==='run'){
    const step=Math.min(delta,WAVE_SECONDS-turn.movement);
    turn.elapsed+=step;turn.remaining=Math.max(0,turn.remaining-step);turn.movement+=step;delta-=step;
    if(turn.movement>=WAVE_SECONDS-1e-9){
      const letter=turn.choices[turn.selected];
      if(letter===turn.word[turn.index]){turn.attempt+=letter;turn.index++;turn.feedback='collected';}
      else if(letter){turn.mistakes++;turn.feedback='retry';}
      else turn.feedback='missed';
      turn.wave++;turn.movement=0;
      if(turn.index===turn.word.length)return finish(turn,'correct');
      const previousTargetLane=turn.choices.indexOf(turn.word[Math.max(0,turn.index-(turn.feedback==='collected'?1:0))]);
      turn.choices=roadChoices(turn.word,turn.index,turn.tier,random);
      const nextTargetLane=turn.choices.indexOf(turn.word[turn.index]);
      if(nextTargetLane===previousTargetLane){const swap=(nextTargetLane+1+Math.floor(random()*2))%3;[turn.choices[swap],turn.choices[nextTargetLane]]=[turn.choices[nextTargetLane],turn.choices[swap]];}
    }
    if(turn.remaining<1e-8){turn.remaining=0;finish(turn,'time');}
  }
  return turn;
}
export function pause(turn){if(turn.phase!=='run')return false;turn.previousPhase='run';turn.phase='paused';return true;}
export function resume(turn){if(turn.phase!=='paused')return false;turn.phase='run';turn.previousPhase=null;return true;}
export function resultFor(turn){
  if(turn.phase!=='result')return null;
  return {correct:turn.outcome==='correct',word:turn.word,attempt:turn.attempt,complete:turn.attempt.length===turn.word.length,reason:turn.outcome};
}
