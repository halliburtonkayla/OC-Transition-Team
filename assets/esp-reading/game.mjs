import {CHAPTERS, STEPS, makeRun, choose, nextTurn, helpTogether, restoreRun} from './core.mjs';
const $ = id => document.getElementById(id);
const SAVE_KEY = 'ttESP:lantern-trail:v1';
let state = null, settings = {two:false, large:false, quiet:false}, storageWorks = true;
let screen = 'home', modalOpener = null;
try {
 const saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null');
 state = restoreRun(saved?.run);
 if (saved?.settings && ['two','large','quiet'].every(k => typeof saved.settings[k] === 'boolean')) settings = {...saved.settings};
} catch { storageWorks = false; }
function save() {
 try { sessionStorage.setItem(SAVE_KEY, JSON.stringify({run:state, settings})); }
 catch { storageWorks = false; }
 $('save-note').hidden = storageWorks;
 $('save-note').textContent = 'This browser cannot save your place. You can still play; refreshing will start over.';
}
function stopVoice() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
function showScreen(name) {
 stopVoice(); screen = name;
 for (const id of ['home','play','finish']) $(id).hidden = id !== name;
 document.body.dataset.screen = name;
 $('resume').hidden = !state || state.phase === 'complete';
 $('new-from-home').hidden = !state || state.phase === 'complete';
 $('start').hidden = !!state && state.phase !== 'complete';
 if (name === 'play') render();
 if (name === 'finish') $('finish-title').focus({preventScroll:true});
 if (name === 'home') document.querySelector(`input[name="level"][value="${state?.level || 'short'}"]`).checked = true;
}
function applySettings() { document.body.classList.toggle('large-text', settings.large); document.body.classList.toggle('quiet-motion', settings.quiet); }
function selectedLevel() { return document.querySelector('input[name="level"]:checked').value; }
function start() {
 state = makeRun(selectedLevel(), settings.two ? 2 : 3); save(); showScreen('play'); $('passage').focus({preventScroll:true});
}
function render() {
 if (!state) return;
 if (state.phase === 'complete') { showScreen('finish'); return; }
 const step = STEPS[state.index], done = state.phase === 'handoff';
 $('chapter-label').textContent = `CHAPTER ${Math.floor(state.index / 3) + 1}`;
 $('chapter-name').textContent = CHAPTERS[Math.floor(state.index / 3)];
 $('turn-label').textContent = `TURN ${state.index + 1} OF ${STEPS.length}`;
 $('trail-progress').replaceChildren(...STEPS.map((_, i) => { const li = document.createElement('li'); li.textContent = String(i + 1); li.classList.toggle('passed', i < state.index || (i === state.index && done)); if (i === state.index) { li.setAttribute('aria-current','step'); li.classList.add('current'); } li.setAttribute('aria-label', `Story step ${i + 1}${i < state.index || (i === state.index && done) ? ', complete' : i === state.index ? ', current' : ''}`); return li; }));
 $('place').textContent = step.place;
 $('scene').style.backgroundPosition = 'center ' + [60, 40, 5][Math.floor(state.index / 3)] + '%';
 const position = done ? step : STEPS[Math.max(state.index - 1, 0)];
 $('pip').style.left = position.x + '%'; $('pip').style.top = position.y + '%';
 document.querySelectorAll('.trail-track i').forEach((node,i) => node.classList.toggle('lit', i < state.index || (i === state.index && done)));
 $('scene-message').hidden = !done; $('scene-message').textContent = step.win;
 $('glow').hidden = !(state.index === STEPS.length - 1 && done);
 const pack = STEPS.slice(0, state.index + (done ? 1 : 0)).map(s => s.reward).filter(r => r !== 'Trail step');
 $('inventory').textContent = pack.length ? pack.join(' · ') : 'A brave little start';
 $('passage').textContent = step[state.level];
 $('question').textContent = step.question;
 $('reading-label').textContent = done ? 'YOUR WORDS MOVED THE STORY' : 'YOUR TURN TO READ';
 $('choices').hidden = done; $('handoff').hidden = !done; $('together').hidden = done;
 $('directions').disabled = done;
 $('choices').replaceChildren(...state.choices[state.index].map((text,i) => {
  const button = document.createElement('button'); button.className = 'choice'; button.type = 'button'; button.dataset.choice = text;
  const number = document.createElement('span'); number.className = 'choice-number'; number.setAttribute('aria-hidden','true'); number.textContent = String(i + 1);
  const label = document.createElement('span'); label.textContent = text; button.append(number,label);
  button.disabled = state.tried.includes(text);
  if (button.disabled) { const hint = document.createElement('small'); hint.textContent = 'Try another action'; button.append(hint); }
  button.addEventListener('click', () => answer(text)); return button;
 }));
 $('feedback').textContent = done ? 'Pass the turn when your group is ready.' : state.tried.length ? 'Look back at the story. Try a different action, or read together.' : 'Read, then choose an action.';
 $('success-title').textContent = state.helped ? 'You read it together!' : 'You moved the story!';
 $('success-copy').textContent = step.win;
 $('next').textContent = state.index === STEPS.length - 1 ? 'See our story ending →' : 'Next reader →';
}
function answer(text) {
 const next = choose(state, text); if (next === state) return;
 stopVoice(); state = next; save(); render();
 if (state.phase === 'handoff') $('next').focus({preventScroll:true});
 else $('choices').querySelector('button:not(:disabled)')?.focus({preventScroll:true});
}
function openDialog(id, opener) { stopVoice(); modalOpener = opener; $(id).showModal(); }
function closeDialog(id) { $(id).close(); }
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('close', () => { modalOpener?.focus({preventScroll:true}); });
function openSupports(opener) {
 $('two-choices').checked = settings.two; $('large-text').checked = settings.large; $('quiet').checked = settings.quiet;
 openDialog('support-dialog', opener);
}
$('start').addEventListener('click', start);
$('resume').addEventListener('click', () => { showScreen('play'); (state.phase === 'handoff' ? $('next') : $('passage')).focus({preventScroll:true}); });
$('new-from-home').addEventListener('click', () => openDialog('new-dialog', $('new-from-home')));
$('confirm-new').addEventListener('click', () => { closeDialog('new-dialog'); start(); });
$('cancel-new').addEventListener('click', () => closeDialog('new-dialog'));
$('next').addEventListener('click', () => { const next = nextTurn(state); if (next === state) return; state = next; save(); render(); if (state.phase !== 'complete') $('passage').focus({preventScroll:true}); });
$('options-home').addEventListener('click', () => openSupports($('options-home')));
$('options').addEventListener('click', () => openSupports($('options')));
$('support-form').addEventListener('submit', e => { e.preventDefault(); settings = {two:$('two-choices').checked, large:$('large-text').checked, quiet:$('quiet').checked}; applySettings(); save(); closeDialog('support-dialog'); });
$('cancel-support').addEventListener('click', () => closeDialog('support-dialog'));
$('pause').addEventListener('click', () => openDialog('pause-dialog', $('pause')));
$('keep-playing').addEventListener('click', () => closeDialog('pause-dialog'));
$('pause-home').addEventListener('click', () => { closeDialog('pause-dialog'); showScreen('home'); $('resume').focus({preventScroll:true}); });
$('together').addEventListener('click', () => {
 if (state.phase !== 'read') return;
 $('together-story').textContent = STEPS[state.index][state.level]; $('together-answer').hidden = true;
 $('complete-together').hidden = true; $('show-answer').hidden = false; openDialog('together-dialog', $('together'));
});
$('show-answer').addEventListener('click', () => {
 $('together-answer').textContent = `The action that fits: ${STEPS[state.index].choices[0]}`;
 $('together-answer').hidden = false; $('complete-together').hidden = false; $('show-answer').hidden = true; $('complete-together').focus();
});
$('complete-together').addEventListener('click', () => { if ($('together-answer').hidden) return; state = helpTogether(state); save(); closeDialog('together-dialog'); render(); $('next').focus({preventScroll:true}); });
$('cancel-together').addEventListener('click', () => closeDialog('together-dialog'));
$('replay').addEventListener('click', start);
$('finish-home').addEventListener('click', () => { showScreen('home'); $('start').focus({preventScroll:true}); });
$('directions').addEventListener('click', () => {
 const directions = 'Read the story. Think about what happened. Choose the action that fits. Take your time. You can read with a helper.';
 if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { $('feedback').textContent = 'Audio is not available here. Read the story, then choose the action that fits.'; return; }
 stopVoice();
 const utterance = new SpeechSynthesisUtterance(directions); utterance.lang = 'en-US'; utterance.rate = .85;
 const localVoice = window.speechSynthesis.getVoices().find(v => v.localService && /^en\b/i.test(v.lang));
 if (localVoice) utterance.voice = localVoice;
 utterance.onerror = () => { $('feedback').textContent = 'Audio could not play. Read the story, then choose the action that fits.'; };
 window.speechSynthesis.speak(utterance);
});
function fullState() { const active = !!document.fullscreenElement; $('fullscreen').setAttribute('aria-pressed', String(active)); $('fullscreen').setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen'); $('fullscreen').innerHTML = `⛶ <span>${active ? 'Exit full screen' : 'Full screen'}</span>`; }
$('fullscreen').addEventListener('click', async () => {
 try {
  if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
  else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  else throw new Error('unsupported');
  $('display-note').hidden = true;
 } catch {
  $('display-note').textContent = 'Full screen is not available here. The game still fits your screen. On iPhone, Safari’s Share → Add to Home Screen may give you more room; browser bars may remain.';
  $('display-note').hidden = false;
 }
 fullState();
});
document.addEventListener('fullscreenchange', fullState);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopVoice(); });
window.addEventListener('pagehide', stopVoice);
if (new URLSearchParams(location.search).get('from') === 'esp') { $('back').href = 'extended-school-program.html'; $('back').querySelector('span').textContent = 'ESP games'; }
applySettings(); save(); showScreen('home');
