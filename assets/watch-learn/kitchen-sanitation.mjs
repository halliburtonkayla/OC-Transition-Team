import {KITCHEN_VIDEOS as VIDEOS,KITCHEN_QUESTIONS as QUESTIONS,KITCHEN_STUDENT_PDF,checkKitchenAnswers} from './kitchen-sanitation-data.mjs';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source=v=>'https://www.youtube.com/watch?v='+v.id;

export function kitchenLessonCard(){return `<article class="lesson-card kitchen-card" style="--lesson:#287e65"><div class="lesson-picture"><span class="kitchen-card-mark" aria-hidden="true">▶</span><b>NEW LESSON</b><span>9:03 · CDC + USDA VIDEOS</span></div><div><p class="eyebrow">WORKPLACE READINESS · FOOD PREPARATION</p><h2>Kitchen Sanitation</h2><p>Get ready to prepare food for others. Read along and fill 10 exact listening blanks. No word bank.</p><div class="lesson-card-actions"><button class="primary" data-learning="lesson" data-id="kitchen-sanitation">▶ Watch &amp; fill the blanks</button></div></div></article>`;}

export function kitchenStudentPrintHTML(answers=[]){
 let number=0;
 return `<article class="kitchen-print-sheet"><p>TRANSITION TOWN SCHOOL · WATCH &amp; LEARN</p><h1>Kitchen Sanitation</h1><p>Name: __________________________ Date: ______________</p><p>Read along. Write the exact missing word or number. Three clips, 9:03 total.</p>${VIDEOS.map((v,part)=>`<section><h2>Part ${part+1}: ${escape(v.heading)}</h2><ol start="${number+1}">${QUESTIONS.filter(q=>q.part===part).map(q=>{const value=answers[number++];return `<li>${escape(q.before)}<span class="kitchen-print-blank">${value?escape(value):'____________________'}</span>${escape(q.after)}</li>`;}).join('')}</ol></section>`).join('')}<p class="kitchen-print-sources">Video links, in order:<br>${VIDEOS.map(v=>`<a href="${source(v)}">${source(v)}</a>`).join('<br>')}</p></article>`;
}

export function mountKitchenSanitation(root,{onBack,autoplay=false}={}){
 const abort=new AbortController(),{signal}=abort;
 let part=0,disposed=false,printingBlank=false;
 root.innerHTML=`<div class="page kitchen-lesson"><div class="breadcrumbs"><button class="text-button" id="kitchenBack">← All lessons</button><span>WATCH &amp; LEARN · WORKPLACE READINESS</span></div><header class="kitchen-heading"><div><p class="eyebrow">PREPARING FOOD FOR YOURSELF AND OTHERS</p><h1>Kitchen Sanitation</h1><p>Watch. Read along. Listen for the missing word.</p></div><span class="kitchen-duration">9:03<small>3 SHORT VIDEOS</small></span></header><div class="kitchen-learning-layout"><section class="kitchen-player-pane" aria-labelledby="kitchenVideoTitle"><h2 id="kitchenVideoTitle"></h2><p id="kitchenVideoSource" class="kitchen-source"></p><div id="kitchenPlayer" class="kitchen-player"></div><nav class="kitchen-parts" aria-label="Choose video part">${VIDEOS.map((v,i)=>`<button class="secondary" data-kitchen-part="${i}" aria-pressed="${i===0}">Part ${i+1}<small>${escape(v.heading)} · ${v.duration}</small></button>`).join('')}</nav><p class="kitchen-player-help">Press Play inside the video. Use its pause, replay, captions and fullscreen controls. Play parts 1, 2 and 3 in order.</p><a id="kitchenOriginal" class="secondary" target="_blank" rel="noopener noreferrer">Open this video on YouTube ↗</a><p class="kitchen-source-note">Videos stay with CDC and USDA on YouTube. If a school filter blocks the player, use the original link or ask your teacher.</p></section><section class="kitchen-work-pane" aria-labelledby="kitchenWorksheetTitle"><p class="eyebrow">10 LISTENING BLANKS · NO WORD BANK</p><h2 id="kitchenWorksheetTitle">Read along &amp; fill the blanks</h2><p id="kitchenDirections">The sentences follow the spoken video order. Type one word or number in each blank. Pause or replay whenever you need.</p><form id="kitchenForm" autocomplete="off"><div class="kitchen-questions">${VIDEOS.map((v,p)=>`<section class="kitchen-question-group" aria-labelledby="kitchenPart${p}"><h3 id="kitchenPart${p}">Part ${p+1}: ${escape(v.heading)}</h3>${QUESTIONS.map((q,i)=>q.part===p?`<div class="kitchen-question"><label for="kitchenBlank${i}" class="kitchen-sentence"><b>${i+1}.</b> ${escape(q.before)}<input id="kitchenBlank${i}" name="blank${i+1}" type="text" maxlength="50" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="Sentence ${i+1}: missing word or number" aria-describedby="kitchenDirections kitchenItemFeedback${i}" data-monitor-private>${escape(q.after)}</label><small id="kitchenItemFeedback${i}"></small></div>`:'').join('')}</section>`).join('')}</div><div class="kitchen-actions"><button class="primary" type="submit">Check my answers</button><button class="secondary" type="button" id="kitchenClear">Clear my answers</button></div><p id="kitchenFeedback" role="status" aria-live="polite">Take your time. Check your answers when you are ready.</p></form><div class="kitchen-actions"><button class="secondary" id="kitchenPrintWork">Print my work</button><button class="secondary" id="kitchenPrintBlank">Print blank worksheet</button><a class="secondary" href="${KITCHEN_STUDENT_PDF}" download>Download student PDF</a></div><p class="kitchen-save-note">Your answers stay on this page. Print your work before leaving.</p></section></div><section class="kitchen-practice"><h2>Next: get ready to make your treats</h2><p>Wash your hands. Use a clean, sanitized work area and clean utensils. Keep finished food protected. Ask your teacher before handling hot bowls or cleaning products.</p></section><footer class="kitchen-footer"><a class="text-button" href="transition-town.html?school=1">← Back to School</a><a class="text-button" href="classroom-monitor.html#resources">Teacher Resource Center →</a></footer></div>`;
 const $=id=>root.querySelector('#'+id);
 const printRoot=document.createElement('section');printRoot.id='kitchenPrint';document.body.append(printRoot);
 const values=()=>QUESTIONS.map((_,i)=>$('kitchenBlank'+i).value.trim());
 const resetFeedback=()=>QUESTIONS.forEach((_,i)=>{$('kitchenBlank'+i).removeAttribute('aria-invalid');$('kitchenItemFeedback'+i).textContent='';});
 function showPart(index,start=false){
  if(!Number.isInteger(index)||index<0||index>=VIDEOS.length)return;
  part=index;const v=VIDEOS[part];
  $('kitchenVideoTitle').textContent='Part '+(part+1)+': '+v.title;
  $('kitchenVideoSource').textContent=v.publisher+' · '+v.duration;
  $('kitchenPlayer').innerHTML=`<iframe title="${escape(v.publisher+': '+v.title)}" src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0${start?'&autoplay=1':''}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  $('kitchenOriginal').href=source(v);
  root.querySelectorAll('[data-kitchen-part]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.kitchenPart)===part)));
 }
 function printWork(blank=false){printingBlank=blank;printRoot.innerHTML=kitchenStudentPrintHTML(blank?[]:values());window.print();}
 root.addEventListener('click',e=>{const b=e.target.closest('[data-kitchen-part]');if(b)showPart(Number(b.dataset.kitchenPart),true);},{signal});
 $('kitchenForm').addEventListener('submit',e=>{
  e.preventDefault();const answers=values(),correct=checkKitchenAnswers(answers),filled=answers.filter(Boolean).length;
  correct.forEach((ok,i)=>{$('kitchenBlank'+i).setAttribute('aria-invalid',String(!ok));$('kitchenItemFeedback'+i).textContent=ok?'Matches the narration.':answers[i]?'Listen again and check this word.':'Listen for the missing word.';});
  $('kitchenFeedback').textContent=filled===QUESTIONS.length?`${correct.filter(Boolean).length} of 10 answers match the narration. You can replay and try again.`:`${filled} of 10 blanks filled. Keep listening, then check again.`;
 },{signal});
 $('kitchenForm').addEventListener('input',e=>{if(!e.target.matches('input'))return;e.target.removeAttribute('aria-invalid');const i=Number(e.target.name.slice(5))-1;$('kitchenItemFeedback'+i).textContent='';$('kitchenFeedback').textContent='Answer updated. Check your answers when you are ready.';},{signal});
 $('kitchenClear').onclick=()=>{$('kitchenForm').reset();resetFeedback();$('kitchenFeedback').textContent='All answers cleared. You can start again.';$('kitchenBlank0').focus();};
 $('kitchenPrintWork').onclick=()=>printWork(false);$('kitchenPrintBlank').onclick=()=>printWork(true);
 window.addEventListener('beforeprint',()=>{printRoot.innerHTML=kitchenStudentPrintHTML(printingBlank?[]:values());},{signal});
 window.addEventListener('afterprint',()=>{printingBlank=false;},{signal});
 function cleanup(){if(disposed)return;disposed=true;abort.abort();printRoot.remove();}
 $('kitchenBack').onclick=()=>{cleanup();onBack?.();};
 window.addEventListener('pagehide',cleanup,{signal,once:true});
 showPart(0,autoplay);return cleanup;
}
