// Deliberately small, familiar CVC words. Matching with a clue is separate from spelling practice.
export const WORDS=Object.freeze([
 {id:'jam',word:'jam',clue:'A jar of jam'}, {id:'cat',word:'cat',clue:'A cat'},
 {id:'sun',word:'sun',clue:'The sun'}, {id:'bus',word:'bus',clue:'A bus'},
 {id:'cup',word:'cup',clue:'A cup'}, {id:'dog',word:'dog',clue:'A dog'},
 {id:'hat',word:'hat',clue:'A hat'}, {id:'map',word:'map',clue:'A map'},
 {id:'pig',word:'pig',clue:'A pig'}, {id:'bed',word:'bed',clue:'A bed'},
 {id:'pen',word:'pen',clue:'A pen'}, {id:'hen',word:'hen',clue:'A hen'}
]);
export const MODES=Object.freeze({guided:'Follow me',match:'Find the letter',spell:'Spell it'});
export const LETTER_NAMES=Object.freeze({a:'ay',b:'bee',c:'see',d:'dee',e:'ee',f:'eff',g:'jee',h:'aitch',i:'eye',j:'jay',k:'kay',l:'ell',m:'em',n:'en',o:'oh',p:'pee',q:'cue',r:'ar',s:'ess',t:'tee',u:'you',v:'vee',w:'double you',x:'ex',y:'why',z:'zee'});
export function shuffle(list,rng=Math.random){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function letterChoices(word,index,rng=Math.random){
 const target=word[index];if(!target)return [];
 const bank='abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>c!==target);
 return shuffle([target,...shuffle(bank,rng).slice(0,2)],rng);
}
export function newDrive(wordId='jam',mode='guided',uppercase=false,id='practice'){
 const word=WORDS.find(w=>w.id===wordId)||WORDS[0];
 return {version:1,id,wordId:word.id,mode:MODES[mode]?mode:'guided',uppercase:!!uppercase,index:0,stars:0,answers:[],helped:[],complete:false};
}
export function chooseLetter(drive,letter){
 if(drive.complete||!WORDS.some(w=>w.id===drive.wordId)||! /^[a-z]$/.test(letter))return {drive,accepted:false};
 const word=WORDS.find(w=>w.id===drive.wordId).word,correct=letter===word[drive.index];
 const answer={index:drive.index,expected:word[drive.index],letter,correct,help:drive.mode==='guided'||drive.helped.includes(drive.index)};
 const next={...drive,answers:[...drive.answers,answer]};
 if(correct){next.index++;next.stars+=3;next.complete=next.index===word.length;}
 return {drive:next,accepted:true,answer};
}
export function withHelp(drive){return {...drive,helped:[...new Set([...drive.helped,drive.index])]};}
export function driveSummary(drive){return {word:drive.wordId,mode:drive.mode,letters:drive.index,stars:drive.stars,attempts:drive.answers.length,retries:drive.answers.filter(a=>!a.correct).length,supportedLetters:new Set(drive.answers.filter(a=>a.correct&&a.help).map(a=>a.index)).size,complete:drive.complete};}
export function restoreDrive(raw){
 if(!raw||raw.version!==1||typeof raw.id!=='string'||raw.id.length>120||!WORDS.some(w=>w.id===raw.wordId)||!MODES[raw.mode]||!Array.isArray(raw.answers)||raw.answers.length>500||!Array.isArray(raw.helped)||raw.helped.some(n=>!Number.isInteger(n)||n<0||n>2))return null;
 let d=newDrive(raw.wordId,raw.mode,raw.uppercase,raw.id);d.helped=[...new Set(raw.helped)];
 for(const a of raw.answers){if(!a||a.index!==d.index||a.expected!==WORDS.find(w=>w.id===d.wordId).word[d.index]||typeof a.help!=='boolean')return null;const result=chooseLetter(d,a.letter);if(!result.accepted||result.answer.correct!==a.correct)return null;d=result.drive;d.answers[d.answers.length-1].help=a.help;}
 if(d.index!==raw.index||d.stars!==raw.stars||d.complete!==raw.complete)return null;
 return d;
}
