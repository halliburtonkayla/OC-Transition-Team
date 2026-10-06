/* Illustrated reader for Transition Park. Uses ttStoryBooks, current, get() and put().
   No new login, world, balance, inventory, park, or storage key. */
(function () {
  'use strict';
  const meta = window.TTStoryCatalog;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const supportsSpeech = !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function';
  const state = {root:null, book:0, page:0, view:'shelf', sound:false, follow:true, source:'speech', speaking:false, paused:false, sentence:0, token:0, utterance:null, choices:{}, hidden:[], themeWasPlaying:false, direction:1};
  let audio = null, context = null, startTouch = null, opener = null, saveFailed = false;
  const book = () => ttStoryBooks[state.book];
  const info = () => meta[state.book];
  const asset = (m, name) => 'assets/storytime/' + m.id + '/' + name + '.webp';
  const button = (action, label, extra='') => '<button type="button" data-st-action="'+action+'" '+extra+'>'+label+'</button>';
  const image = (src, alt, cls='', lazy=false) => '<img class="'+cls+'" src="'+src+'" alt="'+escape(alt)+'" width="1200" height="800" decoding="async" '+(lazy?'loading="lazy"':'loading="eager"')+'>';
  function progress(id) {
    try { return get().residents[current]?.storytime?.books?.[id] || {}; } catch (_) { return {}; }
  }
  function save(patch) {
    if (!current) return;
    try {
      // Read the latest world each time. Never write a cached resident or world snapshot.
      const world = get(), resident = world.residents[current];
      if (!resident) return;
      resident.storytime = resident.storytime || {};
      resident.storytime.books = resident.storytime.books || {};
      const previous = resident.storytime.books[info().id] || {};
      resident.storytime.books[info().id] = Object.assign({}, previous, patch, {updatedAt:new Date().toISOString()});
      resident.storytime.settings = {sound:state.sound, follow:state.follow};
      put(world);
    } catch (_) { saveFailed = true; announce('You can keep reading. Your place could not be saved on this device.'); }
  }
  function announce(text) { const el = state.root?.querySelector('#stAnnounce'); if (el) el.textContent = text; }
  function focusHeading() {
    const heading = state.root?.querySelector('[data-st-heading]');
    if (heading) heading.focus({preventScroll:true});
  }
  function mount() {
    if (state.root?.isConnected) return;
    opener = document.activeElement;
    transitionStoryStop();
    const theme = document.getElementById('ttThemeAudio');
    state.themeWasPlaying = !!theme && !theme.paused;
    if (state.themeWasPlaying) theme.pause();
    state.root = document.createElement('section');
    state.root.id = 'transitionStory';
    state.root.setAttribute('role','dialog');
    state.root.setAttribute('aria-modal','true');
    state.root.setAttribute('aria-label','Transition Park Storytime');
    state.root.innerHTML = '<div class="stShell"><div class="stTop"><div class="stBrand">TRANSITION PARK <span>Storytime</span></div><div class="stTopActions">'+button('sound','Sounds off','id="stSound" aria-pressed="false"')+button('park','Return to Transition Park')+'</div></div><div id="stView"></div><p id="stAnnounce" class="stSr" role="status" aria-live="polite"></p><p class="stFoot">A little story. A real-life skill. Your own pace.</p></div>';
    for (const child of Array.from(document.body.children)) {
      if (!/^(SCRIPT|STYLE|LINK)$/.test(child.tagName)) {
        state.hidden.push({node:child, inert:child.inert, aria:child.getAttribute('aria-hidden')});
        child.inert = true;
        child.setAttribute('aria-hidden','true');
      }
    }
    document.body.appendChild(state.root);
    try {
      const settings = get().residents[current]?.storytime?.settings || {};
      state.sound = !!settings.sound;
      state.follow = settings.follow !== false;
    } catch (_) {}
    updateSound();
    state.root.addEventListener('click', handleClick);
    state.root.addEventListener('change', handleChange);
    state.root.addEventListener('keydown', handleKey);
    state.root.addEventListener('touchstart', touchStart, {passive:true});
    state.root.addEventListener('touchmove', touchMove, {passive:true});
    state.root.addEventListener('touchend', touchEnd, {passive:true});
    state.root.addEventListener('touchcancel', () => { startTouch=null; }, {passive:true});
    state.root.addEventListener('error', e => {
      if (e.target.tagName !== 'IMG') return;
      const img=e.target;
      img.hidden=true;
      const note=document.createElement('p');
      note.className='stImageNote'; note.textContent='The illustration could not load. You can still read the story below.';
      img.after(note);
    }, true);
  }
  function render(html, label) {
    const view = state.root.querySelector('#stView');
    view.innerHTML = html;
    state.root.scrollTop=0;
    updateSound();
    focusHeading();
    if (label) announce(label);
  }
  function openLibrary() {
    mount(); stopAll(); state.view='shelf';
    render('<div class="stShelfIntro"><p class="stEyebrow">THE PARK STORY LIBRARY</p><h1 tabindex="-1" data-st-heading>Find your next little adventure.</h1><p>Big feelings, first jobs, and everyday discoveries. Pick a cover and step inside.</p></div><div class="stShelf">'+ttStoryBooks.map((b,i)=>{
      const m=meta[i], p=progress(m.id), wordCount=b.pages.join(' ').split(/\s+/).length;
      const minutes=Math.max(3,Math.ceil(wordCount/80));
      return '<button type="button" class="stBook" data-st-action="book" data-index="'+i+'" aria-label="Open '+escape(b.t)+'"><div class="stCoverArt">'+image(asset(m,'cover-thumb'),m.coverAlt,'',i>3)+'<span class="stSpine"></span></div><div class="stBookInfo"><span class="stTopic">'+escape(m.skill)+'</span><h2>'+escape(b.t)+'</h2><p>'+escape(m.description)+'</p><span class="stBookMeta">10 pages · About '+minutes+' minutes</span><span class="stProgress">'+(p.finished?'Read again anytime':Number.isInteger(p.page)?'Continue from page '+(p.page+1):'Open this book →')+'</span></div></button>';
    }).join('')+'</div><div class="stShelfBottom">'+button('playground','← Back to Playground')+'</div>', '12 illustrated stories. Choose a book.');
  }
  function openBook(index) {
    if (!Number.isInteger(index) || !ttStoryBooks[index] || !meta[index]) return;
    mount(); stopAll(); state.book=index; ttStoryBookIndex=index; state.page=0; ttStoryPage=0; state.view='cover';
    state.source=book().audio?'recording':'speech';
    state.choices=Object.assign({},progress(info().id).choices || {});
    const saved=progress(info().id), b=book(), m=info();
    render('<div class="stBread">'+button('shelf','← Back to Storytime')+'</div><article class="stCoverOpen"><div class="stCoverPicture">'+image(asset(m,'cover'),m.coverAlt)+'</div><div class="stCoverCopy"><p class="stEyebrow">'+escape(m.skill)+'</p><h1 tabindex="-1" data-st-heading>'+escape(b.t)+'</h1><p>'+escape(m.description)+'</p><p class="stMuted">'+escape(b.sub)+' · 10 illustrated pages</p><div class="stStack">'+button('start','Start Reading','class="stPrimary"')+((Number.isInteger(saved.page)&&saved.page>0&&!saved.finished)?button('resume','Continue · Page '+(saved.page+1)):'')+button('read','🔊 Read to Me',!supportsSpeech&&!b.audio?'disabled':'')+'</div><p class="stHint">Turn pages with the buttons, a sideways swipe, or your keyboard arrows. Scroll up and down to read.</p>'+(!supportsSpeech&&!b.audio?'<p>Read-aloud is unavailable in this browser. All story text is here to read.</p>':'')+'</div></article>',b.t+' cover');
    preload(0);
  }
  function sentences() { return book().pages[state.page].match(/[^.!?]+[.!?]+[”’"']*\s*|[^.!?]+$/g) || [book().pages[state.page]]; }
  function choiceHTML() {
    const c=info().choice;
    if (!c || c.page!==state.page) return '';
    const selected=state.choices[String(state.page)], selectedOption=c.options[selected];
    return '<aside class="stChoice" aria-label="Optional story choice"><span class="stEyebrow">A MOMENT TO THINK · OPTIONAL</span><h3>'+escape(c.question)+'</h3><div class="stChoiceButtons">'+c.options.map((o,i)=>button('choice',String.fromCharCode(65+i)+'. '+escape(o.text),'data-index="'+i+'" aria-pressed="'+(selected===i)+'"')).join('')+'</div><p class="stConsequence" role="status">'+escape(selectedOption?selectedOption.response:selected==='skip'?'You can keep reading and think about the choice later.':'Try a choice to see what might happen. You can always keep reading.')+'</p>'+button('skip','Keep reading without choosing','class="stTextButton"')+'</aside>';
  }
  function controlsHTML() {
    const recorded=book().audio, available=supportsSpeech||recorded;
    return '<section class="stNarration" aria-label="Read-aloud controls"><div class="stNarrationRow"><strong>🔊 Read to Me</strong>'+(recorded?'<label class="stSourceLabel">Voice <select id="stSource"><option value="recording" '+(state.source==='recording'?'selected':'')+'>Original recording</option><option value="speech" '+(state.source==='speech'?'selected':'')+(!supportsSpeech?' disabled':'')+'>Read page text</option></select></label>':'')+'</div><div class="stAudioButtons">'+button('play','▶ Play',!available?'disabled':'')+button('pause','⏸ Pause',!available?'disabled':'')+button('restart','↻ Restart',!available?'disabled':'')+'</div><p id="stVoiceStatus" role="status">'+(!available?'Your browser does not support read-aloud. You can read and turn every page.':state.source==='recording'?'Original extended recording. Turn pages at your own pace, or select Read page text for matched narration.':'Press Play to hear this page. The current sentence lights up as it is read.')+'</p>'+(state.source==='speech'?'<label class="stFollow"><input id="stFollow" type="checkbox" '+(state.follow?'checked':'')+'> Turn pages as the voice reads</label>':'<div class="stRecordingSeek"><label for="stSeek">Recording position</label><input id="stSeek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Recording position"><span id="stTime">0:00</span></div><details class="stTranscript"><summary>Read the original recording’s full story</summary><div>'+escape(transitionGoodChoicesStory).split('\n\n').map(p=>'<p>'+p+'</p>').join('')+'</div></details>')+'</section>';
  }
  function showPage(index, resumeVoice=false) {
    if (!state.root) { mount(); }
    if (!Number.isInteger(index)) return;
    if (index<0) return openBook(state.book);
    if (index>=book().pages.length) return finish();
    const wasSpeaking=resumeVoice || (state.speaking && state.source==='speech');
    stopSpeech(); state.view='page'; state.page=index; ttStoryPage=index;
    state.sentence=0; state.paused=false;
    const m=info(), b=book();
    render('<div class="stBread">'+button('shelf','← Back to Storytime')+button('cover','Book cover')+'</div><div class="stBookHeading"><p class="stEyebrow">'+escape(m.skill)+'</p><h1 tabindex="-1" data-st-heading>'+escape(b.t)+'</h1></div><article class="stSpread '+(state.direction<0?'stTurnBack':'stTurnForward')+'" id="stSpread" aria-label="Story page"><figure class="stScene">'+image(asset(m,'page-'+String(index+1).padStart(2,'0')),m.pageAlt[index])+'</figure><div class="stPaper"><span class="stPageLabel">'+String(index+1).padStart(2,'0')+' / '+String(b.pages.length).padStart(2,'0')+'</span><p class="stStoryText" id="stStoryText">'+sentences().map((t,i)=>'<span data-sentence="'+i+'">'+escape(t)+'</span>').join('')+'</p></div></article><nav class="stPageNav" aria-label="Book pages">'+button('previous','← Previous',index===0?'disabled':'')+'<span id="stCount">Page '+(index+1)+' of '+b.pages.length+'</span>'+button('next',index===b.pages.length-1?'Finish Book →':'Next →','class="stPrimary"')+'</nav>'+choiceHTML()+controlsHTML()+(saveFailed?'<p class="stSaveNote">Your place could not be saved on this device. You can keep reading.</p>':''),'Page '+(index+1)+' of '+b.pages.length);
    save({page:index,choices:state.choices});
    preload(index+1);
    if (state.source==='recording') updateRecording();
    if (wasSpeaking) playSpeech();
  }
  function preload(index) {
    // A single upcoming page, never the whole collection. Covers are the bookshelf's only images.
    if (index>=0 && index<book().pages.length) { const img=new Image(); img.src=asset(info(),'page-'+String(index+1).padStart(2,'0')); }
  }
  function finish() {
    stopAll(); state.view='end'; save({page:book().pages.length-1,finished:true,choices:state.choices});
    render('<article class="stEnd"><p class="stEyebrow">'+escape(book().t)+'</p><h1 tabindex="-1" data-st-heading>The End</h1><p>You made it to the last page. Take a little of this story with you.</p><div class="stEndActions">'+button('again','Read Again','class="stPrimary"')+button('shelf','Choose Another Book')+button('park','Return to Transition Park')+'</div><div class="stReflections"><h2>What did we learn?</h2><p>Think about these, or talk them over with someone. No quiz to finish.</p><ul>'+info().reflection.map(q=>'<li>'+escape(q)+'</li>').join('')+'</ul></div></article>','The End. '+book().t);
  }
  function close(destination) {
    stopAll();
    if (context) context.suspend().catch(()=>{});
    state.root?.remove(); state.root=null;
    for (const item of state.hidden) { item.node.inert=item.inert; if (item.aria===null) item.node.removeAttribute('aria-hidden'); else item.node.setAttribute('aria-hidden',item.aria); }
    state.hidden=[];
    if (destination==='park') { document.getElementById('transitionPlaygroundScene')?.remove(); transitionPark(); document.querySelector('.parkback')?.focus(); }
    else if (destination==='playground') { transitionPlayground(); document.querySelector('[aria-label="Story Time"]')?.focus(); }
    else opener?.focus?.();
    if (state.themeWasPlaying) document.getElementById('ttThemeAudio')?.play().catch(()=>{});
  }
  function stopSpeech() {
    state.token++; state.speaking=false; state.utterance=null;
    if (supportsSpeech) window.speechSynthesis.cancel();
    state.root?.querySelectorAll('.stSpeaking').forEach(n=>n.classList.remove('stSpeaking'));
  }
  function stopAll() { stopSpeech(); state.paused=false; state.sentence=0; if (audio) {audio.pause();audio.currentTime=0;} }
  function voiceStatus(text) { const node=state.root?.querySelector('#stVoiceStatus'); if (node) node.textContent=text; }
  function playSpeech() {
    if (!supportsSpeech || state.view!=='page') return;
    if (audio) audio.pause();
    stopSpeech(); state.paused=false; state.speaking=true;
    const token=state.token, page=state.page;
    const parts=sentences();
    if (state.sentence>=parts.length) state.sentence=0;
    const speakNext=()=>{
      if (token!==state.token || state.view!=='page' || state.page!==page) return;
      if (state.sentence>=parts.length) {
        state.speaking=false; state.sentence=0;
        state.root.querySelectorAll('.stSpeaking').forEach(n=>n.classList.remove('stSpeaking'));
        const c=info().choice, waiting=c && c.page===page && state.choices[String(page)]===undefined;
        voiceStatus(waiting?'Take a moment for the optional choice, or tap Next to keep reading.':'Page finished.');
        if (state.follow && !waiting) { state.direction=1; showPage(page+1,true); }
        return;
      }
      const utterance=new SpeechSynthesisUtterance(parts[state.sentence]);
      state.utterance=utterance; // Keep a strong reference for Safari.
      utterance.lang='en-US'; utterance.rate=.92; utterance.pitch=1; utterance.volume=.9;
      const voices=speechSynthesis.getVoices(), local=voices.find(v=>v.lang==='en-US'&&v.localService);
      if (local) utterance.voice=local;
      utterance.onstart=()=>{
        if (token!==state.token) return;
        state.root.querySelectorAll('[data-sentence]').forEach(n=>n.classList.toggle('stSpeaking',Number(n.dataset.sentence)===state.sentence));
        voiceStatus('Reading page '+(page+1)+' of '+book().pages.length+'.');
      };
      utterance.onend=()=>{ if (token===state.token) {state.sentence++; speakNext();} };
      utterance.onerror=e=>{
        if (token!==state.token || e.error==='canceled' || e.error==='interrupted') return;
        state.speaking=false; voiceStatus('The voice could not start. Tap Play to try again, or keep reading the text.');
      };
      speechSynthesis.speak(utterance);
    };
    speakNext();
  }
  function getRecording() {
    if (audio) return audio;
    // Reuse the exact original recording and existing Audio object.
    audio=transitionStoryGetAudio(); audio.preload='metadata';
    audio.addEventListener('timeupdate',updateRecording);
    audio.addEventListener('loadedmetadata',updateRecording);
    audio.addEventListener('play',()=>{if(state.root&&state.source==='recording')voiceStatus('Playing the original extended recording. Turn pages at your own pace.');});
    audio.addEventListener('pause',()=>{if(state.root&&state.source==='recording')voiceStatus('Recording paused.');});
    audio.addEventListener('ended',()=>{if(state.root&&state.source==='recording')voiceStatus('Original recording finished. You can keep turning the pages.');});
    audio.addEventListener('error',()=>{if(state.root&&state.source==='recording')voiceStatus('The recording could not load. Select Read page text or keep reading.');});
    return audio;
  }
  function updateRecording() {
    if (!state.root || state.source!=='recording' || !audio) return;
    const seek=state.root.querySelector('#stSeek'), time=state.root.querySelector('#stTime');
    if (seek && Number.isFinite(audio.duration) && audio.duration>0) seek.value=String(audio.currentTime/audio.duration*100);
    if (time) time.textContent=formatTime(audio.currentTime)+(Number.isFinite(audio.duration)?' / '+formatTime(audio.duration):'');
  }
  function formatTime(n) { return Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'); }
  function play() {
    if (state.source==='recording' && book().audio) { stopSpeech(); getRecording().play().catch(()=>voiceStatus('Tap Play again to start the recording.')); }
    else playSpeech();
  }
  function pause() {
    if (state.source==='recording') { if (audio) audio.pause(); return; }
    // Safari can leave long speech queues paused permanently. Cancel, retain sentence, replay it on Play.
    stopSpeech(); state.paused=true; voiceStatus('Paused. Play resumes from the current sentence.');
  }
  function updateSound() {
    const b=state.root?.querySelector('#stSound');
    if (b) { b.textContent=state.sound?'Sounds on':'Sounds off'; b.setAttribute('aria-pressed',String(state.sound)); }
  }
  function sound(kind) {
    if (!state.sound || document.hidden) return;
    try {
      const AudioContext=window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { state.sound=false;updateSound();announce('Story sounds are unavailable in this browser.');return; }
      context=context || new AudioContext();
      context.resume().catch(()=>{});
      const notes=kind==='ding'?[784,1046]:kind==='message'?[587,784]:kind==='beep'?[660]:[523,659];
      const start=context.currentTime;
      notes.forEach((freq,i)=>{
        const oscillator=context.createOscillator(), gain=context.createGain(), t=start+i*.085;
        oscillator.type='sine';oscillator.frequency.value=freq;
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025,t+.014);gain.gain.exponentialRampToValueAtTime(.0001,t+.24);
        oscillator.connect(gain);gain.connect(context.destination);oscillator.start(t);oscillator.stop(t+.25);
      });
    } catch (_) { /* Text and page controls do not depend on audio. */ }
  }
  function turn(delta) {
    if (state.view!=='page') return;
    if (delta<0 && state.page===0) return;
    state.direction=delta; sound(info().sound); showPage(state.page+delta);
  }
  function handleClick(e) {
    const control=e.target.closest('[data-st-action]'); if (!control) return;
    const action=control.dataset.stAction;
    switch(action) {
      case 'shelf':openLibrary();break;
      case 'book':openBook(Number(control.dataset.index));break;
      case 'cover':openBook(state.book);break;
      case 'park':close('park');break;
      case 'playground':close('playground');break;
      case 'start':state.direction=1;showPage(0);break;
      case 'resume':showPage(Math.max(0,Math.min(book().pages.length-1,progress(info().id).page||0)));break;
      case 'read':state.direction=1;showPage(0);play();break;
      case 'next':turn(1);break;
      case 'previous':turn(-1);break;
      case 'play':play();break;
      case 'pause':pause();break;
      case 'restart':stopSpeech();state.sentence=0;if(audio)audio.currentTime=0;play();break;
      case 'again':state.choices={};save({choices:{}});state.direction=1;showPage(0);break;
      case 'sound':state.sound=!state.sound;updateSound();if(state.sound)sound(info().sound);else if(context)context.suspend().catch(()=>{});if(state.view!=='shelf')save({});break;
      case 'choice': {
        const c=info().choice, selected=Number(control.dataset.index);
        if (!c || !c.options[selected]) return;
        state.choices[String(state.page)]=selected;
        pause(); save({choices:state.choices});
        const response=state.root.querySelector('.stConsequence'); response.textContent=c.options[selected].response;
        state.root.querySelectorAll('[data-st-action="choice"]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.index)===selected)));
        break;
      }
      case 'skip':state.choices[String(state.page)]='skip';save({choices:state.choices});turn(1);break;
    }
  }
  function handleChange(e) {
    if (e.target.id==='stFollow') {state.follow=e.target.checked;save({});}
    if (e.target.id==='stSource') {stopAll();state.source=e.target.value;showPage(state.page);}
    if (e.target.id==='stSeek' && audio && Number.isFinite(audio.duration)) {audio.currentTime=audio.duration*Number(e.target.value)/100;updateRecording();}
  }
  function handleKey(e) {
    if (e.key==='Escape') {e.preventDefault();state.view==='shelf'?close('playground'):openLibrary();return;}
    if (e.key==='Tab') {
      const items=Array.from(state.root.querySelectorAll('button:not(:disabled),select,input,summary,[tabindex="0"]')).filter(n=>n.getClientRects().length);
      if (!items.length) return;
      const first=items[0],last=items[items.length-1];
      if (e.shiftKey && (document.activeElement===first || !items.includes(document.activeElement))) {e.preventDefault();last.focus();}
      else if (!e.shiftKey && document.activeElement===last) {e.preventDefault();first.focus();}
    }
    if (/^(INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(e.target.tagName)||e.altKey||e.ctrlKey||e.metaKey) return;
    if (state.view==='page' && (e.key==='ArrowLeft'||e.key==='ArrowRight')) {e.preventDefault();turn(e.key==='ArrowRight'?1:-1);}
  }
  function touchStart(e) {
    if (state.view!=='page' || e.touches.length!==1 || !e.target.closest('#stSpread') || e.target.closest('button,input,select,a')) {startTouch=null;return;}
    const t=e.touches[0];startTouch={x:t.clientX,y:t.clientY,vertical:false,scroll:state.root.scrollTop,time:Date.now()};
  }
  function touchMove(e) {
    if (!startTouch) return;
    if (e.touches.length!==1) {startTouch=null;return;}
    const dx=Math.abs(e.touches[0].clientX-startTouch.x),dy=Math.abs(e.touches[0].clientY-startTouch.y);
    if (dy>12 && dy>dx*.65) startTouch.vertical=true;
  }
  function touchEnd(e) {
    if (!startTouch) return;
    const start=startTouch;startTouch=null;
    const t=e.changedTouches[0];if(!t)return;
    const dx=t.clientX-start.x,dy=t.clientY-start.y;
    if (!start.vertical && Math.abs(state.root.scrollTop-start.scroll)<10 && Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*2.2 && Date.now()-start.time<900) turn(dx<0?1:-1);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.root){pause();if(context)context.suspend().catch(()=>{});}});
  window.addEventListener('pagehide',()=>{if(state.root)stopAll();});
  window.TTStorytime={openLibrary,openBook,showPage,close};
})();
