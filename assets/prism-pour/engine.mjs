export const CAPACITY = 4;
export const COLORS = [
  {name:'Lime', hex:'#94ed18', dark:'#4c9d08', light:'#d0ff66', symbol:'leaf'},
  {name:'Pink', hex:'#ff4d99', dark:'#ce1f67', light:'#ff9bc6', symbol:'heart'},
  {name:'Sky blue', hex:'#28c5f9', dark:'#008abd', light:'#99eaff', symbol:'drop'},
  {name:'Violet', hex:'#ae36ff', dark:'#6f08c0', light:'#e4a4ff', symbol:'star'},
  {name:'Gold', hex:'#ffdf20', dark:'#d4a300', light:'#fff78a', symbol:'sun'},
  {name:'Orange', hex:'#ff9c19', dark:'#db6200', light:'#ffd276', symbol:'diamond'},
  {name:'Mint', hex:'#30e6bb', dark:'#079f85', light:'#a1ffe4', symbol:'moon'}
];
export function clone(board) {return board.map(b=>b.slice());}
export function topRun(b) {if(!b.length)return 0; let n=1; while(n<b.length && b[b.length-1-n]===b.at(-1))n++; return n;}
export function pourInfo(board,from,to) {
 if(from===to || !board[from]?.length || !board[to] || board[to].length>=CAPACITY)return null;
 const source=board[from], target=board[to], color=source.at(-1);
 if(target.length && target.at(-1)!==color)return null;
 return {from,to,color,count:Math.min(topRun(source),CAPACITY-target.length)};
}
export function applyPour(board,from,to) {
 const info=pourInfo(board,from,to); if(!info)return null;
 const next=clone(board); next[to].push(...next[from].splice(-info.count)); return {board:next,...info};
}
export function isComplete(b){return b.length===CAPACITY && b.every(c=>c===b[0]);}
export function isWon(board){return board.every(b=>!b.length || isComplete(b));}
export function canonical(board){return board.map(b=>b.join('')).sort().join('|');}
function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// Every scramble step is the inverse of a legal pour, retaining a verified route home.
export function makeLevel(level) {
 const count=level>20?7:6, random=rng(level*7309+41);
 if(level===1) {
  return {board:Array.from({length:8},(_,i)=>i<6?[i,i,(i+1)%6,(i+1)%6]:[]).concat([[]]),solution:[[0,6],[5,0],[4,5],[3,4],[2,3],[1,2],[6,1]]};
 }
 let board=Array.from({length:9},(_,i)=>i<count?Array(4).fill(i):[]);
 const path=[],seen=new Map([[canonical(board),0]]);
 let last=null;
 const steps=18+Math.min(level*4,110);
 for(let s=0;s<steps;s++) {
  const options=[];
  for(let a=0;a<board.length;a++) {
   if(!board[a].length)continue;
   const run=topRun(board[a]);
   for(let b=0;b<board.length;b++) {
    if(a===b || board[b].length===4 || (last && last[0]===b && last[1]===a))continue;
    for(let n=1;n<=Math.min(run,4-board[b].length);n++) {
     const next=clone(board),c=next[a].at(-1); next[b].push(...next[a].splice(-n));
     const inv=applyPour(next,b,a);
     if(!inv || JSON.stringify(inv.board)!==JSON.stringify(board))continue;
     const mixed=next[b].length>n && next[b][next[b].length-n-1]!==c;
     const score=(mixed?8:1)+(n<run?2:0)+(seen.has(canonical(next))?-15:2)+random()*5;
     options.push({a,b,n,next,score});
    }
   }
  }
  if(!options.length)break;
  options.sort((a,b)=>b.score-a.score);
  const pick=options[Math.floor(random()*Math.min(4,options.length))];
  path.push([pick.b,pick.a]); board=pick.next; last=[pick.a,pick.b];seen.set(canonical(board),s);
 }
 // Keep the tall center bottle empty at the start, just like the reference board.
 const empty=board.findIndex(b=>!b.length);
 if(empty>=0 && empty!==8) {
  [board[empty],board[8]]=[board[8],board[empty]];
  for(const move of path) for(let k=0;k<2;k++){if(move[k]===empty)move[k]=8;else if(move[k]===8)move[k]=empty;}
 }
 return {board,solution:path.reverse()};
}
export function solve(board,limit=220000) {
 if(isWon(board))return [];
 const seen=new Map(), colorCount=new Set(board.flat()).size;
 let nodes=0;
 const heuristic=b=>b.reduce((sum,t)=>sum+t.reduce((r,c,i)=>r+(!i||c!==t[i-1]?1:0),0),0)-colorCount;
 function dfs(b,depth,maxDepth,path,last) {
  if(++nodes>limit)return null;
  if(isWon(b))return path;
  if(depth+heuristic(b)>maxDepth)return null;
  const key=canonical(b); if((seen.get(key)??Infinity)<=depth)return null; seen.set(key,depth);
  const options=[]; let usedEmpty=false;
  for(let to=0;to<b.length;to++) {
   if(b[to].length===4)continue;
   if(!b[to].length){if(usedEmpty)continue;usedEmpty=true;}
   for(let from=0;from<b.length;from++) {
    if(!b[from].length || isComplete(b[from]) || (last && last[0]===to && last[1]===from))continue;
    if(!b[to].length && topRun(b[from])===b[from].length)continue;
    const p=applyPour(b,from,to); if(!p)continue;
    const score=(b[to].length?10:0)+(isComplete(p.board[to])?20:0)+(!p.board[from].length?5:0)-heuristic(p.board);
    options.push({from,to,next:p.board,score});
   }
  }
  options.sort((a,b)=>b.score-a.score);
  for(const p of options){const found=dfs(p.next,depth+1,maxDepth,[...path,[p.from,p.to]],[p.from,p.to]);if(found)return found;if(nodes>limit)return null;}
  return null;
 }
 for(let depth=Math.max(8,heuristic(board));depth<=80;depth+=5) {
  seen.clear();const result=dfs(board,0,depth,[],null);if(result)return result;if(nodes>limit)break;
 }
 return null;
}
