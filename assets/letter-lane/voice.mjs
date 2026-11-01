import {VOICE_CUES} from './voice-cues.mjs';

// Prefer the device's voice. Recorded prompts keep the same task available without TTS services.
export function narrationPlayer({audio,cues=VOICE_CUES,host=window,onUnavailable=()=>{},onSource=()=>{}}){
 let generation=0,cueTimer=null,startTimer=null,preferRecorded=false;
 function clearTimers(){host.clearTimeout(cueTimer);host.clearTimeout(startTimer);cueTimer=startTimer=null;}
 function cancel(){generation++;clearTimers();try{host.speechSynthesis?.cancel();}catch{}audio.pause();}
 function recorded(keys,token){
  if(token!==generation)return;clearTimers();try{host.speechSynthesis?.cancel();}catch{}
  const queue=keys.filter(key=>cues[key]);
  if(!queue.length){onUnavailable();return;}
  const next=()=>{
   if(token!==generation||!queue.length)return;
   const cue=cues[queue.shift()];
   try{audio.currentTime=cue.start;Promise.resolve(audio.play()).then(()=>{
    if(token!==generation)return;onSource('recorded');
    cueTimer=host.setTimeout(()=>{if(token!==generation)return;audio.pause();next();},(cue.end-cue.start)*1000);
   }).catch(()=>{if(token===generation)onUnavailable();});}catch{if(token===generation)onUnavailable();}
  };
  next();
 }
 function speak(text,clips=[]){
  cancel();const token=generation;
  const fallback=()=>{if(token!==generation)return;preferRecorded=true;recorded(clips,token);};
  if(preferRecorded||!host.speechSynthesis||!host.SpeechSynthesisUtterance){fallback();return;}
  try{
   const u=new host.SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.78;u.pitch=1.04;
   u.onstart=()=>{if(token===generation){host.clearTimeout(startTimer);startTimer=null;onSource('device');}};
   u.onend=()=>{if(token===generation){host.clearTimeout(startTimer);startTimer=null;}};
   u.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))fallback();};
   startTimer=host.setTimeout(fallback,2200);host.speechSynthesis.speak(u);
  }catch{fallback();}
 }
 return {speak,cancel};
}
