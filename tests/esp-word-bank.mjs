import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {WORDS,TIERS,createWordPicker} from '../assets/esp-spelling/core.mjs';
import {SPELLING_CUES} from '../assets/esp-spelling/audio-cues.mjs';
import {narrationPlayer} from '../assets/esp-spelling/voice.mjs';
assert.equal(WORDS.length,36);assert.equal(new Set(WORDS.map(w=>w.id)).size,36);
const added='fox box van bat rat bag net web log mop pot pan fan rug lid duck fish frog milk cake kite boat sock leaf'.split(' ');
for(const tier of TIERS){
 assert.equal(WORDS.filter(w=>w.tier===tier.id).length,12);
 const pick=createWordPicker();let last='';
 for(let cycle=0;cycle<5;cycle++){const words=Array.from({length:12},()=>pick(tier.id).id);assert.equal(new Set(words).size,12);assert.notEqual(words[0],last);last=words.at(-1);}
}
for(const [i,word] of added.entries()){const entry=WORDS.find(w=>w.id===word);assert.equal(entry.tile,i);assert.equal(entry.atlas,'expanded');assert.equal(SPELLING_CUES['word-'+word].text,word);}
let clipChecks=0;
for(const word of WORDS){
 const cue=SPELLING_CUES['word-'+word.id];assert(cue);assert(fs.existsSync(fileURLToPath(cue.src)));
 for(const letter of word.id)assert(SPELLING_CUES['letter-'+letter]);
 const events=[];let timer;
 const host={setTimeout:fn=>(timer=fn,1),clearTimeout:()=>{}};
 const audio={src:'',readyState:1,currentTime:0,pause(){},load(){this.onloadedmetadata?.();},play(){events.push(this.src);return Promise.resolve();}};
 const player=narrationPlayer({audio,cues:SPELLING_CUES,host,onUnavailable:()=>{throw new Error('Missing audio '+word.id);}});
 player.speak(word.id,['word-'+word.id]);await Promise.resolve();assert.equal(events[0],cue.src);player.cancel();assert.equal(audio.onended,null);clipChecks++;
}
console.log('36 distinct words; 12 per level; five no-repeat cycles per level; all 24 atlas mappings; all 36 word audio routes and answer letter cues verified.');
