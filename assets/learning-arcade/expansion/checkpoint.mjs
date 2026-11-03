import {BOOKS} from './word-data.mjs';
import {generatePuzzle,selectedWord} from './word-core.mjs';
import {cleanAvatar,cleanOutfit,makeScenario,evaluateOutfit} from './dress-core.mjs';
export function cleanCheckpoint(game,v){
 if(!v||v.version!==1)throw Error('Unsupported game save.');
 if(JSON.stringify(v).length>180000)throw Error('Game save is too large. Print and start a new practice.');
 const int=(n,max=100000)=>Number.isInteger(n)&&n>=0&&n<=max?n:0;
 const level=Math.max(1,Math.min(4,Number(v.level)||1)),seed=int(v.seed,4294967295);
 const preferences={sound:!!v.preferences?.sound,reduced:!!v.preferences?.reduced,low:!!v.preferences?.low,text:Math.max(1,Math.min(1.4,Number(v.preferences?.text)||1)),simple:v.preferences?.simple!==false,hints:v.preferences?.hints!==false};
 if(game==='wordquest'){
  const bookId=BOOKS.some(b=>b.id===v.bookId)?v.bookId:'careers',page=int(v.page,9999),p=generatePuzzle(bookId,level,page,seed),used=new Set();
  const found=(Array.isArray(v.found)?v.found:[]).slice(0,20).map(f=>{
   if(!f||used.has(f.word)||selectedWord(p,f.path)!==f.word)throw Error('Invalid saved word selection.');used.add(f.word);return {word:f.word,path:[...f.path]};
  });
  const progress={};for(const [key,val] of Object.entries(v.progress||{}).slice(0,80))if(/^[a-z]+:[1-4]$/.test(key)&&BOOKS.some(b=>key.startsWith(b.id+':')))progress[key]=int(val,9999);
  const bookmarks={};
  for(const [key,b] of Object.entries(v.bookmarks||{}).slice(0,40)){
   const [bid,l]=key.split(':');if(!BOOKS.some(b=>b.id===bid)||!['1','2','3','4'].includes(l)||!b)continue;
   const bp=generatePuzzle(bid,Number(l),int(b.page,9999),seed),seen=new Set();
   bookmarks[key]={page:int(b.page,9999),found:(Array.isArray(b.found)?b.found:[]).slice(0,20).map(f=>{if(!f||seen.has(f.word)||selectedWord(bp,f.path)!==f.word)throw Error('Invalid book bookmark.');seen.add(f.word);return {word:f.word,path:[...f.path]};})};
  }
  return {version:1,seed,level,page,bookId,found,progress,bookmarks,questionIndex:int(v.questionIndex,19),questionAnswers:(Array.isArray(v.questionAnswers)?v.questionAnswers:[]).slice(-100).map(a=>({id:int(a.id,19),correct:!!a.correct,choice:String(a.choice||'').slice(0,250)})),preferences};
 }
 if(game==='dresspart'){
  const index=int(v.index,9999),s=makeScenario(level,index,seed),stage=['bedroom','closet','mirror','destination','feedback'].includes(v.stage)?v.stage:'bedroom';
  return {version:1,seed,level,index,stage,avatar:cleanAvatar(v.avatar),outfit:cleanOutfit(v.outfit),created:!!v.created,preferences,achievements:[...new Set((Array.isArray(v.achievements)?v.achievements:[]).filter(x=>typeof x==='string'&&/^\d+-[1-4]-\d+$/.test(x)))].slice(-500),history:(Array.isArray(v.history)?v.history:[]).slice(-120).map(h=>{
   const hi=int(h.index,9999),hl=Math.max(1,Math.min(4,Number(h.level)||1)),hs=makeScenario(hl,hi,seed),outfit=cleanOutfit(h.outfit),evaluation=evaluateOutfit(hs,outfit);
   const at=Number.isFinite(Date.parse(h.at))?h.at:new Date(0).toISOString();
   return {index:hi,level:hl,instance:hs.instance,at,outfit,evaluation,attempt:Math.max(1,int(h.attempt,999)),reflection:String(h.reflection||'').slice(0,500)};
  }),questionIndex:int(v.questionIndex,2)};
 }
 throw Error('Unknown expansion game');
}
