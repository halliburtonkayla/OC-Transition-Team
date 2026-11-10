import {DRIVING_CUES} from '../letter-lane/driving-cues.mjs';
const legacy=new URL('../letter-lane/driving-voice.mp3',import.meta.url).href;
const added='fox box van bat rat bag net web log mop pot pan fan rug lid duck fish frog milk cake kite boat sock leaf'.split(' ');
export const SPELLING_CUES=Object.freeze({
 ...Object.fromEntries(Object.entries(DRIVING_CUES).map(([key,cue])=>[key,{...cue,src:legacy}])),
 ...Object.fromEntries(added.map(word=>['word-'+word,{src:new URL('./audio/'+word+'.mp3',import.meta.url).href,text:word}]))
});
