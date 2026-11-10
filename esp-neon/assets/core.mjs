export function rng(seed) { let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const A='CAKE MAKE BAKE LAKE TAKE RAKE WAKE NAME GAME SAME CAME LATE GATE DATE MATE WAVE CAVE SAVE SAFE TAPE CAPE CANE LANE FACE RACE'.split(' ');
const I='BIKE LIKE HIKE KITE BITE RIDE SIDE WIDE HIDE FIVE DIVE NINE MINE FINE LINE TIME LIME DIME PINE PIPE RIPE WIPE'.split(' ');
const O='HOME BONE CONE ROPE HOPE NOSE ROSE NOTE VOTE TONE CODE RODE POLE HOLE MOLE'.split(' ');
const U='CUBE TUBE CUTE MUTE MULE TUNE DUNE FUSE'.split(' ');
export const TITLES=['Magic Begins','Cake at the Lake','Ride a Bike','Home Sweet Home','Neon Names','Kite Night','Glow and Grow','Super Silent E','The Magic Mix','Arcade All-Stars'];
export function wordsFor(puzzle){const random=rng(81471+puzzle*973);return shuffle([...shuffle(A,random).slice(0,7),...shuffle(I,random).slice(0,7),...shuffle(O,random).slice(0,4),...shuffle(U,random).slice(0,2)],random);}
export function makePuzzle(puzzle=0,mode='easy',variant=0){
 const words=wordsFor(puzzle),n=12,dirs=mode==='easy'?[[0,1],[1,0]]:[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
 for(let attempt=0;attempt<80;attempt++){
  const random=rng(94019+puzzle*7301+variant*17053+attempt*3571+(mode==='easy'?0:1000000));const grid=Array.from({length:n},()=>Array(n).fill('')),placements=[];
  for(const word of [...words].sort((a,b)=>b.length-a.length)){
   const fits=[];for(const [dr,dc] of dirs)for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const endr=r+dr*(word.length-1),endc=c+dc*(word.length-1);if(endr<0||endr>=n||endc<0||endc>=n)continue;
    let overlap=0,ok=true;for(let k=0;k<word.length;k++){const v=grid[r+dr*k][c+dc*k];if(v&&v!==word[k]){ok=false;break;}if(v)overlap++;}
    if(ok&&overlap<word.length)fits.push({r,c,dr,dc,rank:overlap+random()*2});
   }
   if(!fits.length)break;fits.sort((a,b)=>b.rank-a.rank);const p=fits[0],cells=[];
   for(let k=0;k<word.length;k++){const r=p.r+p.dr*k,c=p.c+p.dc*k;grid[r][c]=word[k];cells.push(r*n+c);}placements.push({word,cells});
  }
  if(placements.length===20){for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!grid[r][c])grid[r][c]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(random()*26)];return {n,grid,words,placements};}
 }
 throw Error('This puzzle could not be prepared. Choose another puzzle.');
}
export function lineBetween(start,end,n=12){const sr=Math.floor(start/n),sc=start%n,er=Math.floor(end/n),ec=end%n,rd=er-sr,cd=ec-sc;if(rd&&cd&&Math.abs(rd)!==Math.abs(cd))return [];const steps=Math.max(Math.abs(rd),Math.abs(cd));return Array.from({length:steps+1},(_,k)=>(sr+Math.sign(rd)*k)*n+sc+Math.sign(cd)*k);}
export function matchSelection(puzzle,cells,found=[]){if(!cells.length)return null;const text=cells.map(i=>puzzle.grid[Math.floor(i/puzzle.n)][i%puzzle.n]).join('');const rev=[...text].reverse().join('');return puzzle.words.find(w=>!found.includes(w)&&(w===text||w===rev))||null;}
export function numberChoices(value,random=Math.random){const candidates=[value-1,value+1,value-10,value+10,value-2,value+2,value-11,value+11].filter(n=>n>=1&&n<=100&&n!==value);const wrong=shuffle([...new Set(candidates)],random).slice(0,2);return shuffle([value,...wrong],random);}
export function makeNumberRound(seed,count=4,previous=[]){const random=rng(seed),missing=[];count=[2,4,6].includes(count)?count:4;for(let row=0;row<10;row++)missing.push(...shuffle(Array.from({length:10},(_,c)=>row*10+c+1),random).slice(0,count));missing.sort((a,b)=>a-b);if(previous.length&&missing.join()===previous.join())return makeNumberRound(seed+7919,count,previous);return {seed,count,missing};}
export function completedRows(round,solved){const done=new Set(solved);return Array.from({length:10},(_,r)=>r).filter(r=>round.missing.filter(n=>Math.floor((n-1)/10)===r).every(n=>done.has(n)));}
