// Device voice first; every word also has a local recorded fallback.
export function narrationPlayer({audio,cues,host=window,onUnavailable=()=>{},onSource=()=>{}}){
 let generation=0,cueTimer=null,startTimer=null,preferRecorded=false;
 function clearTimers(){host.clearTimeout(cueTimer);host.clearTimeout(startTimer);cueTimer=startTimer=null;}
 function cancel(){generation++;clearTimers();audio.onended=null;audio.onloadedmetadata=null;audio.onerror=null;try{host.speechSynthesis?.cancel();}catch{}audio.pause();}
 function recorded(keys,token){
  if(token!==generation)return;clearTimers();try{host.speechSynthesis?.cancel();}catch{}
  if(keys.some(key=>!cues[key])){onUnavailable();return;}
  const queue=[...keys];
  const next=()=>{
   if(token!==generation||!queue.length)return;
   const cue=cues[queue.shift()];
   const play=()=>{
    if(token!==generation)return;
    audio.onloadedmetadata=null;
    try{audio.currentTime=cue.start||0;Promise.resolve(audio.play()).then(()=>{
      if(token!==generation){audio.pause();return;}onSource('recorded');
      if(Number.isFinite(cue.end)){audio.onended=null;cueTimer=host.setTimeout(()=>{if(token!==generation)return;audio.pause();next();},(cue.end-(cue.start||0))*1000);}
      else audio.onended=next;
    }).catch(()=>{if(token===generation)onUnavailable();});}catch{if(token===generation)onUnavailable();}
   };
   audio.onerror=()=>{if(token===generation)onUnavailable();};
   if(audio.src!==cue.src){audio.onloadedmetadata=play;audio.src=cue.src;audio.load();}
   else if(audio.readyState>=1)play();else audio.onloadedmetadata=play;
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
