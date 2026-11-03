import {BOOKS,DIRECTIONS,vocabulary,questions} from './word-data.mjs';
import {escapeHTML as e} from '../../learning/progress.mjs';
export function random(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function permute(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function pathBetween(start,end,size){
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<0||start>=size*size||end>=size*size)return [];
 const a=[Math.floor(start/size),start%size],b=[Math.floor(end/size),end%size],dr=b[0]-a[0],dc=b[1]-a[1];
 if(dr&&dc&&Math.abs(dr)!==Math.abs(dc))return [];
 return Array.from({length:Math.max(Math.abs(dr),Math.abs(dc))+1},(_,i)=>(a[0]+Math.sign(dr)*i)*size+a[1]+Math.sign(dc)*i);
}
export function generatePuzzle(bookId,level=1,page=0,seed=71237){
 if(!Number.isInteger(level)||level<1||level>4)throw Error('Choose a difficulty from 1 to 4.');
 const rows=vocabulary(bookId,level), words=rows.map(x=>x.word);
 if(words.length!==20||new Set(words).size!==20)throw Error('A page must have 20 distinct words.');
 const baseSize=Math.max([16,18,22,26][level-1],Math.max(...words.map(w=>w.length))+1),dirs=DIRECTIONS.slice(0,[2,4,8,8][level-1]);
 for(let attempt=0;attempt<50;attempt++){
  const size=baseSize+Math.floor(attempt/10)*2;
  const rng=random((seed+page*9301+level*7919+attempt*65537)>>>0),grid=Array.from({length:size},()=>Array(size).fill('')),placements=[];
  const sorted=permute(rows,rng).sort((a,b)=>b.word.length-a.word.length);
  let failed=false;
  for(let wi=0;wi<sorted.length;wi++){
   const word=sorted[wi].word,mandatory=dirs[wi%dirs.length];let candidates=[];
   for(const [dr,dc] of [mandatory])for(let r=0;r<size;r++)for(let c=0;c<size;c++){
    const er=r+dr*(word.length-1),ec=c+dc*(word.length-1);if(er<0||ec<0||er>=size||ec>=size)continue;
    let overlap=0,valid=true;const path=[];
    for(let i=0;i<word.length;i++){const rr=r+dr*i,cc=c+dc*i,v=grid[rr][cc];if(v&&v!==word[i]){valid=false;break;}if(v)overlap++;path.push(rr*size+cc);}
    if(valid&&overlap<word.length)candidates.push({word,path,dr,dc,overlap,score:rng()+(level>=3?overlap*5:0)});
   }
   candidates.sort((a,b)=>b.score-a.score);const p=candidates[0];if(!p){failed=true;break;}
   p.path.forEach((v,i)=>grid[Math.floor(v/size)][v%size]=word[i]);placements.push(p);
  }
  if(failed)continue;
  for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(!grid[r][c])grid[r][c]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rng()*26)];
  return {version:1,bookId,level,page,seed,size,grid,words,placements:words.map(w=>{const {score,...p}=placements.find(p=>p.word===w);return p;})};
 }
 throw Error('This page could not be generated. Choose another page.');
}
export function selectedWord(puzzle,path){
 if(!Array.isArray(path)||path.length<2)return null;
 const valid=pathBetween(path[0],path.at(-1),puzzle.size);if(valid.join(',')!==path.join(','))return null;
 const word=path.map(i=>puzzle.grid[Math.floor(i/puzzle.size)][i%puzzle.size]).join('');
 return puzzle.words.find(w=>w===word||w===[...word].reverse().join(''))||null;
}
export function verifyPuzzle(p){
 return p.words.length===20&&new Set(p.words).size===20&&p.placements.length===20&&p.placements.every(x=>x.path.length===x.word.length&&x.path.map(i=>p.grid[Math.floor(i/p.size)][i%p.size]).join('')===x.word);
}
export function wordPrint(p,kind='bank',found=[],identity='Guest practice'){
 const book=BOOKS.find(b=>b.id===p.bookId),key=kind==='key',completed=kind==='completed';
 const shown=key?p.placements:completed?found:[];
 const marks=new Set(shown.flatMap(x=>x.path)),indices=new Map(shown.map((x,i)=>[x.path[0],i+1]));
 const title=key?'Teacher answer key':completed?'Completed / current puzzle':kind==='blank'?'Student puzzle — without word bank':'Student puzzle';
 if(kind==='questions')return `<section class="word-print"><h1>${e(book.title)} · Vocabulary</h1><p>Optional practice · ${e(identity)}</p>${questions(p.bookId,p.level).map((q,i)=>`<div class="print-question"><b>${i+1}. ${e(q.prompt)}</b><ol type="A">${permute(q.options,random(p.seed+i)).map(o=>`<li>${e(o)}</li>`).join('')}</ol></div>`).join('')}</section>`;
 return `<section class="word-print"><h1>Word Quest · ${e(book.title)}</h1><p>${e(title)} · ${['Beginner','Medium','Hard','Expert'][p.level-1]} · Page ${p.page+1}<br>${e(identity)} · Puzzle ID ${p.seed}-${p.bookId}-${p.level}-${p.page}</p><table class="word-print-grid" style="--print-size:${p.size}" aria-label="Exact digital puzzle"><tbody>${p.grid.map((row,r)=>`<tr>${row.map((letter,c)=>{const i=r*p.size+c;return `<td${marks.has(i)?' class="key-letter"':''}>${letter}${key&&indices.has(i)?`<sup>${indices.get(i)}</sup>`:''}</td>`;}).join('')}</tr>`).join('')}</tbody></table>${kind!=='blank'?`<div class="word-print-bank">${p.words.map(w=>`<span>${completed&&found.some(f=>f.word===w)?'✓ ':''}${e(w)}</span>`).join('')}</div>`:''}${key?`<p class="key-positions">${p.placements.map((x,i)=>{const a=x.path[0],b=x.path.at(-1);return `${i+1}. ${e(x.word)}: (${Math.floor(a/p.size)+1},${a%p.size+1}) → (${Math.floor(b/p.size)+1},${b%p.size+1})`;}).join(' · ')}</p>`:'<p class="small">Find all 20 words. Directions follow the selected difficulty. Take your time.</p>'}</section>`;
}
