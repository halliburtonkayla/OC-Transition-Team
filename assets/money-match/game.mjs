import {MONEY,COINS,total,dollars,spokenAmount,describe,coinQuestions,countQuestions,matchBoards,QuizProgress,placeGroup,checkMatches} from './core.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const scales={penny:.79,nickel:.88,dime:.74,quarter:1};
let mode='',config={},rounds=[],index=0,progress=null,assignments={},locked=new Set(),selected='',attempts={},matched=0,firstTry=0,helpUsed=false,speech=null;
function stopSpeech(){if('speechSynthesis'in window)window.speechSynthesis.cancel();speech=null;}
function say(text){
 stopSpeech();
 if(!('speechSynthesis'in window)){feedback('Read-aloud is unavailable on this device. You can still use the pictures.');return;}
 speech=new SpeechSynthesisUtterance(text);speech.lang='en-US';speech.rate=.86;
 const voice=window.speechSynthesis.getVoices().find(v=>v.lang==='en-US');if(voice)speech.voice=voice;
 window.speechSynthesis.speak(speech);
}
function autoSay(text){if($('#auto-read').checked)say(text);}
function feedback(text,kind=''){const el=$('#feedback');el.textContent=text;el.className='feedback '+kind;}
function show(view){for(const id of ['home','play','finish'])$('#'+id).hidden=id!==view;stopSpeech();}
function image(id){const m=MONEY[id];return `<img src="assets/money-match/${m.image}" alt="${m.name}" draggable="false">`;}
function pile(items,values=false){return `<span class="money-pile" role="img" aria-label="${describe(items)}">${items.map(id=>`<span class="money-piece ${MONEY[id].kind}" style="--scale:${scales[id]||1}" aria-hidden="true">${image(id)}${values?`<span class="coin-value">${MONEY[id].value}</span>`:''}</span>`).join('')}</span>`;}
function current(){return rounds[index];}
function questionSpeech(){
 if(mode==='coin')return `Which coin is worth ${spokenAmount(MONEY[current().answer].cents)}? Choose ${current().options.map(id=>MONEY[id].name).join(', or ')}.`;
 if(mode==='count')return `How much money is here? ${describe(current().items)}. Choose ${current().options.map(spokenAmount).join(', or ')}.`;
 return 'Match each group of money to its amount. Choose a money group, then choose an amount. You can also drag a group. Select Check my matches when you are ready.';
}
function start(nextMode){
 mode=nextMode;config={choices:Number($('#choices').value),level:$('#level').value};
 rounds=mode==='coin'?coinQuestions(config.choices):mode==='count'?countQuestions(config.level,config.choices):matchBoards(config.level);
 index=0;progress=new QuizProgress(rounds.length);matched=0;firstTry=0;helpUsed=false;
 show('play');render();
}
function render(){
 stopSpeech();$('#mode-name').textContent={coin:'KNOW THE COIN',match:'MATCH THE MONEY',count:'COUNT THE MONEY'}[mode];
 $('#progress-label').textContent=(mode==='match'?'Board ':'Question ')+(index+1)+' of '+rounds.length;
 $('#next').disabled=true;$('#next').textContent=index===rounds.length-1?'Finish ✓':mode==='match'?'Next board →':'Next →';
 $('.progress-track').setAttribute('aria-valuemax',String(rounds.length));$('.progress-track').setAttribute('aria-valuenow',String(index));$('#progress-fill').style.width=(index/rounds.length*100)+'%';
 if(mode==='match'){
  assignments={};locked=new Set();selected='';attempts={};
  $('#question').textContent='Match the money.';$('#instruction').textContent='1. Choose a money group.  2. Choose its amount.';renderMatch();feedback('Tap a group, then tap an empty box. You can also drag.');
 }else renderQuiz();
 $('#question').focus();autoSay(questionSpeech());
}
function renderQuiz(){
 const q=current(),isCoin=mode==='coin';
 $('#question').textContent=isCoin?`Which coin is worth ${MONEY[q.answer].cents} ${MONEY[q.answer].cents===1?'cent':'cents'}?`:'How much money is here?';
 $('#instruction').textContent=isCoin?'Look at the pictures. Choose the coin.':'Count each bill and coin. Choose the total.';
 $('#board').innerHTML=(!isCoin?`<div class="count-tray">${pile(q.items)}</div>`:'')+`<div class="answer-grid ${q.options.length===2?'two':''} ${!isCoin?'count-grid':''}">${q.options.map((option,i)=>isCoin?`<button class="answer-card" data-option="${i}" aria-label="${MONEY[option].name}" style="--coin-size:${Math.round(190*scales[option])}px">${image(option)}<span class="coin-name">${MONEY[option].name}</span></button>`:`<button class="answer-card" data-option="${i}" aria-label="${spokenAmount(option)}">${dollars(option)}</button>`).join('')}</div>`+(!isCoin?'<div class="count-support"><button class="text-button" id="values" aria-pressed="false">Show each value</button></div>':'');
 feedback(isCoin?'Take your time. You can ask for help.':'Count the money and choose the total.');
 $$('.answer-card').forEach(b=>b.addEventListener('click',()=>{
  const option=q.options[Number(b.dataset.option)],correct=option===q.answer;
  if(!progress.answer(index,correct))return;
  $$('.answer-card').forEach(x=>x.classList.remove('retry'));
  if(correct){
   b.classList.add('correct');$$('.answer-card').forEach(x=>x.disabled=true);$('#next').disabled=false;
   const text=isCoin?`✓ Yes! A ${MONEY[q.answer].name} is worth ${spokenAmount(MONEY[q.answer].cents)}.`:`✓ Yes! The total is ${dollars(q.answer)}.`;
   feedback(text,'success');autoSay(text.replace('✓',''));$('#next').focus({preventScroll:true});
  }else{b.classList.add('retry');feedback(isCoin?'Try again. Look at the coin pictures.':'Try again. Count each bill and coin.','retry');autoSay($('#feedback').textContent);}
 }));
 $('#values')?.addEventListener('click',e=>{const shown=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(shown));e.currentTarget.textContent=shown?'Hide each value':'Show each value';$('.count-tray').innerHTML=pile(q.items,shown);if(shown)helpUsed=true;});
}
function renderMatch(focusKey){
 const board=current();
 $('#board').innerHTML=`<div class="matching-layout"><section class="match-column"><h2>CHOOSE AN AMOUNT</h2><div class="targets">${board.targets.map(t=>{
  const group=board.groups.find(g=>g.id===assignments[t.id]),done=locked.has(t.id);
  return `<div class="target-row"><span class="amount-label" aria-hidden="true">${dollars(t.cents)}</span><button class="drop-slot ${group?'filled':''} ${done?'locked':''}" data-target="${t.id}" ${done?'disabled':''} aria-label="${spokenAmount(t.cents)}, ${done?'correct match':group?describe(group.items)+', choose to remove or replace':'empty box'}">${group?pile(group.items)+`<span class="placed-note">${done?'✓ Correct match':'Tap to remove'}</span>`:'Place money here'}</button></div>`;
 }).join('')}</div></section><section class="match-column"><h2>CHOOSE A MONEY GROUP</h2><div class="group-bank">${board.groups.map((g,i)=>{
  const placed=Object.values(assignments).includes(g.id);
  return `<button class="group-card ${selected===g.id?'selected':''} ${placed?'placed':''}" data-group="${g.id}" draggable="${!placed}" aria-pressed="${selected===g.id}" aria-label="Group ${i+1}: ${describe(g.items)}${placed?', placed':''}" ${placed?'disabled':''}><span class="group-name">GROUP ${i+1}</span>${pile(g.items)}${placed?'<span class="placed-badge">✓ Placed</span>':''}</button>`;
 }).join('')}</div></section></div><div class="match-actions"><button class="primary" id="check" ${locked.size===board.targets.length?'disabled':''}>Check my matches ✓</button><button class="outline" id="clear" ${locked.size===board.targets.length?'disabled':''}>Clear my choices ↻</button></div>`;
 $$('.group-card:not(:disabled)').forEach(b=>{
  b.addEventListener('click',()=>{selected=selected===b.dataset.group?'':b.dataset.group;renderMatch('group:'+b.dataset.group);feedback(selected?'Now choose the amount for this money.':'Choose a money group.');autoSay($('#feedback').textContent);});
  b.addEventListener('dragstart',e=>{selected=b.dataset.group;e.dataTransfer.setData('text/plain',selected);e.dataTransfer.effectAllowed='move';});
 });
 $$('.drop-slot:not(:disabled)').forEach(b=>{
  b.addEventListener('click',()=>{
   if(selected)place(b.dataset.target,selected);
   else if(assignments[b.dataset.target]){delete assignments[b.dataset.target];renderMatch('target:'+b.dataset.target);feedback('Money returned. Choose a group to try again.');}
   else feedback('First, choose a money group. Then choose its amount.');
  });
  b.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';b.classList.add('over');});
  b.addEventListener('dragleave',()=>b.classList.remove('over'));
  b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('over');place(b.dataset.target,e.dataTransfer.getData('text/plain'));});
 });
 $('#check').addEventListener('click',check);
 $('#clear').addEventListener('click',()=>{assignments=Object.fromEntries(Object.entries(assignments).filter(([t])=>locked.has(t)));selected='';renderMatch('first-group');feedback('Your correct matches stay. Choose the remaining groups.');});
 if(focusKey){const [kind,id]=focusKey.split(':');const el=kind==='group'?$(`[data-group="${id}"]`):kind==='target'?$(`[data-target="${id}"]`):$('.group-card:not(:disabled)');el?.focus({preventScroll:true});}
}
function place(target,group){
 const next=placeGroup(assignments,target,group,current(),locked);
 if(next[target]!==group)return;
 assignments=next;selected='';renderMatch('target:'+target);feedback('Money placed. Match the other groups, then check.');autoSay('Money placed.');
}
function check(){
 const result=checkMatches(assignments,current(),locked);
 if(!result.correct.length&&!result.incorrect.length){feedback('Choose a money group and an amount first.');return;}
 for(const target of [...result.correct,...result.incorrect]){const group=assignments[target];attempts[group]=(attempts[group]||0)+1;}
 for(const target of result.correct){locked.add(target);matched++;if(attempts[assignments[target]]===1)firstTry++;}
 for(const target of result.incorrect)delete assignments[target];selected='';renderMatch();
 if(locked.size===current().targets.length){$('#next').disabled=false;feedback('✓ All matched! You counted every group.','success');$('#next').focus({preventScroll:true});}
 else {feedback(result.incorrect.length?'Some need another look. Correct matches stay. Try the remaining money.':'✓ Good matches! Finish the empty boxes.',result.incorrect.length?'retry':'success');$('.group-card:not(:disabled)')?.focus({preventScroll:true});}
 autoSay($('#feedback').textContent.replace('✓',''));
}
function finish(){
 show('finish');const count=mode==='match'?matched:progress.solved.size,first=mode==='match'?firstTry:progress.firstTry;
 $('#finish-summary').textContent=mode==='match'?`You matched ${count} money groups!`:`You completed ${count} questions!`;
 $('#finish-detail').textContent=`${first} correct on the first try. ${helpUsed?'You used a help tool. ':''}Every try is practice.`;
 $('#finish-title').focus();autoSay('Nice work! '+$('#finish-summary').textContent);
}
$$('[data-start]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.start)));
$('#next').addEventListener('click',()=>{if($('#next').disabled)return;if(index===rounds.length-1)finish();else{index++;render();}});
function goHome(){show('home');$('[data-start]')?.focus();}
$('#activities').addEventListener('click',goHome);$('#choose').addEventListener('click',goHome);
$('#restart').addEventListener('click',()=>start(mode));$('#again').addEventListener('click',()=>start(mode));
$('#read').addEventListener('click',()=>say(questionSpeech()));$('#auto-read').addEventListener('change',()=>{if($('#auto-read').checked)say(questionSpeech());else stopSpeech();});
$('#coin-guide').innerHTML=COINS.map(id=>`<div class="guide-card">${image(id)}<strong>${MONEY[id].name}</strong><span>${MONEY[id].value}</span><button class="outline" data-say="${id}">Hear it ◖))</button></div>`).join('');
$$('[data-help]').forEach(b=>b.addEventListener('click',()=>{helpUsed=true;stopSpeech();$('#help').showModal();}));
$$('[data-say]').forEach(b=>b.addEventListener('click',()=>{const m=MONEY[b.dataset.say];say(`A ${m.name} is worth ${spokenAmount(m.cents)}.`);}));
$('#close-help').addEventListener('click',()=>$('#help').close());$('#help').addEventListener('close',stopSpeech);
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else $('#fullscreen').textContent='Use your device’s display controls';}catch{$('#fullscreen').textContent='Full screen unavailable';}});
document.addEventListener('fullscreenchange',()=>{$('#fullscreen').innerHTML=document.fullscreenElement?'⛶ <span>Exit full screen</span>':'⛶ <span>Full screen</span>';$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen');});
window.addEventListener('pagehide',stopSpeech);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
