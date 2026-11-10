import {Classroom, CLASS_TURNS, hopPath} from './core.mjs';
const $ = id => document.getElementById(id);
const KEY = 'esp-little-leap-class-v2';
let saved = null;
try { saved = JSON.parse(sessionStorage.getItem(KEY)); } catch { /* Storage is optional. */ }
let classroom = new Classroom(Math.random, saved?.classroom);
let prefs = {autoRead: false, sound: false, shortcuts: true, motion: matchMedia('(prefers-reduced-motion: reduce)').matches};
if (saved?.prefs) for (const key of Object.keys(prefs)) if (typeof saved.prefs[key] === 'boolean') prefs[key] = saved.prefs[key];
let hopIndex = 0, animating = false, token = 0, audioContext, flying;
function save() { try { sessionStorage.setItem(KEY, JSON.stringify({classroom: classroom.snapshot(), prefs})); } catch { /* Private/blocked storage: keep playing in memory. */ } }
function stopSpeech() { try { window.speechSynthesis?.cancel(); } catch { /* Voice unavailable. */ } }
function say(text) {
  stopSpeech();
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return false;
  try {
    const utterance = new SpeechSynthesisUtterance(text); utterance.rate = .83; utterance.pitch = 1;
    utterance.lang = 'en-US';
    // Prefer an on-device voice when the browser exposes one. Never request a microphone.
    const voice = speechSynthesis.getVoices().find(v => v.localService && /^en\b/.test(v.lang));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance); return true;
  } catch { return false; }
}
function readQuestion() {
  const p = classroom.problem;
  const text = classroom.solved
    ? `${p.a} ${p.op === '+' ? 'plus' : 'minus'} ${p.b} equals ${p.answer}. ${p.b} hops ${p.op === '+' ? 'forward' : 'backward'}. Next friend when you are ready.`
    : `${p.a} ${p.op === '+' ? 'plus' : 'minus'} ${p.b} equals what? Start at ${p.a}. Hop ${p.op === '+' ? 'forward' : 'backward'} ${p.b} ${p.b === 1 ? 'time' : 'times'}. ${classroom.options.map((n, i) => `${'ABC'[i]}, ${n}`).join('. ')}.`;
  if (!say(text)) feedback('A reading voice is not available on this device. The directions stay on screen.');
}
function chime() {
  if (!prefs.sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext ||= new Audio(); audioContext.resume().catch(() => {});
    [523.25, 659.25].forEach((frequency, i) => {
      const osc = audioContext.createOscillator(), gain = audioContext.createGain(), time = audioContext.currentTime + i * .11;
      osc.type = 'sine'; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.055, time + .025); gain.gain.exponentialRampToValueAtTime(.001, time + .27);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(time); osc.stop(time + .3);
    });
  } catch { /* Sound is decorative, never required. */ }
}
function feedback(text, success = false) { $('feedback').textContent = text; $('feedback').classList.toggle('success', success); }
function halt() { token++; animating = false; flying?.remove(); flying = null; $('frog').classList.remove('hopping'); stopSpeech(); }
function position(index, jump = false) {
  hopIndex = index;
  const p = classroom.problem, path = hopPath(p), max = classroom.config.max, current = path[index];
  $('frog').style.left = `${(current - 1) / (max - 1) * 100}%`;
  $('frog').classList.remove('hopping');
  if (jump && !prefs.motion) { void $('frog').offsetWidth; $('frog').classList.add('hopping'); }
  $('arcs').replaceChildren();
  for (let i = 1; i <= index; i++) {
    const x1 = (path[i - 1] - 1) / (max - 1) * 1000, x2 = (path[i] - 1) / (max - 1) * 1000;
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('class', 'hop-arc'); arc.setAttribute('d', `M ${x1} 170 Q ${(x1 + x2) / 2} ${max === 20 ? 70 : 20} ${x2} 170`);
    $('arcs').append(arc);
  }
  document.querySelectorAll('.stone').forEach(stone => {
    const n = Number(stone.dataset.number); stone.classList.toggle('current', n === current);
    stone.classList.toggle('traveled', path.slice(0, index + 1).includes(n));
  });
  $('hop-count').textContent = `${index ? `${index} of ${p.b}` : `Ready for ${p.b}`} ${p.b === 1 ? 'hop' : 'hops'} · ${p.op === '+' ? 'forward →' : '← backward'}`;
  $('pond-instruction').textContent = index === 0 ? `Start at ${p.a}. Hop ${p.op === '+' ? 'forward' : 'backward'} ${p.b}.` : `Hop ${index}: now on ${current}.`;
  $('hop').disabled = animating || index >= p.b || classroom.solved;
  $('restart-hops').disabled = animating;
}
function ready() {
  animating = false;
  position(classroom.problem.b);
  $('next').hidden = false; $('next').disabled = false; $('answer-row').classList.add('complete');
  $('next').innerHTML = `${classroom.completed === CLASS_TURNS ? 'Keep playing' : 'Next friend'} <span aria-hidden="true">→</span>`;
  const p = classroom.problem;
  feedback(classroom.completed === CLASS_TURNS ? '32 turns together! Everyone can have two turns. Keep playing if you like.' : `${p.a} ${p.op} ${p.b} = ${p.answer}. You found the landing spot!`, true);
  $('quiet-note').textContent = classroom.completed === CLASS_TURNS ? 'Class session complete. A teacher can start a new session in Teacher controls.' : 'Pass the turn when your friend is ready.';
}
function render() {
  halt();
  const p = classroom.problem, config = classroom.config;
  document.body.classList.toggle('wide-line', config.max === 20);
  document.body.classList.toggle('reduce-motion', prefs.motion);
  $('level-select').value = String(classroom.level);
  $('level-label').textContent = `${config.name} · ${config.label}`;
  $('turn-label').textContent = `Turn ${classroom.turn}${classroom.turn <= CLASS_TURNS ? ` of ${CLASS_TURNS}` : ''}`;
  $('progress').style.width = `${Math.min(100, classroom.completed / CLASS_TURNS * 100)}%`;
  $('operation').textContent = p.op === '+' ? 'LET’S ADD' : 'LET’S SUBTRACT';
  $('direction').textContent = `Start at ${p.a}. Take ${p.b} ${p.b === 1 ? 'hop' : 'hops'} ${p.op === '+' ? 'forward' : 'backward'}.`;
  $('first').textContent = p.a; $('operator').textContent = p.op; $('second').textContent = p.b;
  $('blank').textContent = classroom.solved ? p.answer : '?';
  $('blank').className = classroom.solved ? 'blank filled' : 'blank';
  $('equation').setAttribute('aria-label', `${p.a} ${p.op === '+' ? 'plus' : 'minus'} ${p.b} equals ${classroom.solved ? p.answer : 'what?'}`);
  document.querySelector('.pond').setAttribute('aria-label', `Number line from 1 to ${config.max}. Start at ${p.a}.`);
  $('stones').replaceChildren();
  for (let n = 1; n <= config.max; n++) {
    const stone = document.createElement('span'); stone.className = `stone${n === p.a ? ' start' : ''}`;
    stone.dataset.number = n; stone.style.setProperty('--x', `${(n - 1) / (config.max - 1) * 100}%`); stone.textContent = n; $('stones').append(stone);
  }
  $('choices').replaceChildren();
  classroom.options.forEach((n, i) => {
    const button = document.createElement('button'); button.className = 'choice'; button.dataset.answer = n;
    button.setAttribute('aria-label', `Answer ${'ABC'[i]}: ${n}`);
    button.innerHTML = `<span class="letter" aria-hidden="true">${'ABC'[i]}</span><span class="number" aria-hidden="true">${n}</span>`;
    button.addEventListener('click', () => choose(n, button));
    if (classroom.solved) { button.disabled = true; button.classList.add(n === p.answer ? 'correct' : 'dim'); }
    $('choices').append(button);
  });
  $('next').hidden = true; $('answer-row').classList.remove('complete');
  $('hop-text').textContent = 'Try 1 hop';
  feedback('Tap an answer. You can try the hops first.');
  $('quiet-note').textContent = 'Take your time. We learn together.';
  position(classroom.solved ? p.b : 0);
  if (classroom.solved) ready();
  save();
}
function flyAnswer(button) {
  if (prefs.motion || !button.animate) return;
  const source = button.querySelector('.number').getBoundingClientRect(), target = $('blank').getBoundingClientRect();
  flying = document.createElement('span'); flying.textContent = classroom.problem.answer; flying.setAttribute('aria-hidden', 'true');
  Object.assign(flying.style, {position: 'fixed', left: `${source.left}px`, top: `${source.top}px`, zIndex: '100', fontSize: '42px', fontWeight: '900', color: '#286b42', pointerEvents: 'none'});
  document.body.append(flying);
  const node = flying;
  node.animate([{transform: 'translate(0,0) scale(1)', opacity: 1}, {transform: `translate(${target.left + target.width / 2 - source.left - source.width / 2}px,${target.top + target.height / 2 - source.top - source.height / 2}px) scale(1.1)`, opacity: .2}], {duration: 440, easing: 'ease-in-out'}).finished.then(() => node.remove()).catch(() => node.remove());
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function replay() {
  animating = true; const run = ++token;
  $('next').hidden = true; $('answer-row').classList.remove('complete'); position(0);
  if (prefs.motion) { ready(); return; }
  await delay(450);
  for (let i = 1; i <= classroom.problem.b; i++) {
    if (run !== token) return;
    position(i, true); await delay(470);
  }
  if (run !== token) return;
  ready();
  // No automatic turn advance; a child or teacher explicitly passes the turn.
}
async function choose(value, button) {
  if (animating) return;
  const result = classroom.choose(value);
  if (result === null) return;
  if (!result) {
    button.classList.add('retry'); button.setAttribute('aria-label', `Answer ${'ABC'[classroom.options.indexOf(value)]}: ${value}. Try again.`);
    feedback('Not quite yet. Try the hops, then choose again.');
    if (prefs.autoRead) say('Not quite yet. Try the hops, then choose again.');
    return;
  }
  save(); chime(); flyAnswer(button);
  document.querySelectorAll('.choice').forEach(choice => { choice.disabled = true; choice.classList.add(choice === button ? 'correct' : 'dim'); });
  $('blank').textContent = classroom.problem.answer; $('blank').classList.add('filled', 'arrived');
  $('equation').setAttribute('aria-label', `${classroom.problem.a} ${classroom.problem.op === '+' ? 'plus' : 'minus'} ${classroom.problem.b} equals ${classroom.problem.answer}`);
  $('progress').style.width = `${Math.min(100, classroom.completed / CLASS_TURNS * 100)}%`;
  feedback('You found it! Let’s see the hops.', true);
  if (prefs.autoRead) say(`You found it! ${classroom.problem.a} ${classroom.problem.op === '+' ? 'plus' : 'minus'} ${classroom.problem.b} equals ${classroom.problem.answer}.`);
  await replay();
}
$('hop').addEventListener('click', () => {
  if (animating || classroom.solved || hopIndex >= classroom.problem.b) return;
  position(hopIndex + 1, true);
  feedback(`Hop ${hopIndex}. Now on ${hopPath(classroom.problem)[hopIndex]}. ${hopIndex === classroom.problem.b ? 'Choose your answer below.' : 'Try another hop.'}`);
});
$('restart-hops').addEventListener('click', () => {
  if (animating) return;
  if (classroom.solved) { replay(); return; }
  position(0); feedback('Start again. Take one small hop at a time.');
});
$('next').addEventListener('click', () => {
  if (animating || !classroom.next()) return;
  render(); if (prefs.autoRead) readQuestion();
  $('choices').querySelector('button')?.focus({preventScroll: true});
});
$('listen').addEventListener('click', readQuestion);
$('settings').addEventListener('click', () => { stopSpeech(); $('teacher-dialog').showModal(); });
$('close-settings').addEventListener('click', () => $('teacher-dialog').close());
$('level-select').addEventListener('change', () => { classroom.setLevel(Number($('level-select').value)); render(); });
for (const [id, key] of [['auto-read', 'autoRead'], ['sound', 'sound'], ['motion', 'motion'], ['shortcuts', 'shortcuts']]) {
  $(id).checked = prefs[key];
  $(id).addEventListener('change', () => {
    prefs[key] = $(id).checked; save();
    document.body.classList.toggle('reduce-motion', prefs.motion);
    if (key === 'autoRead' && !prefs.autoRead) stopSpeech();
    if (key === 'motion' && prefs.motion && animating) { halt(); ready(); }
  });
}
$('new-class').addEventListener('click', () => $('reset-dialog').showModal());
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
$('confirm-reset').addEventListener('click', () => {
  const level = classroom.level; classroom = new Classroom(); classroom.setLevel(level);
  $('reset-dialog').close(); $('teacher-dialog').close(); render();
});
const focusButton = document.createElement('button'); focusButton.id = 'focus-exit'; focusButton.className = 'focus-exit'; focusButton.textContent = 'Teacher / exit focus'; focusButton.hidden = true;
focusButton.addEventListener('click', () => $('teacher-dialog').showModal()); document.body.append(focusButton);
function focusView(active) {
  document.body.classList.toggle('focus-view', active); focusButton.hidden = !active;
  $('fullscreen').textContent = active ? 'Exit focus view' : '⛶ Full screen';
}
$('fullscreen').addEventListener('click', async () => {
  if (document.body.classList.contains('focus-view')) { focusView(false); return; }
  if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch { /* Keep controls usable. */ } return; }
  if (document.documentElement.requestFullscreen && document.fullscreenEnabled) {
    try { await document.documentElement.requestFullscreen(); $('teacher-dialog').close(); return; } catch { /* iPhone, embedded pages, and denied full screen use focus view. */ }
  }
  focusView(true); $('teacher-dialog').close();
  feedback('Focus view is on. Browser bars may remain. Use Teacher / exit focus to leave.');
});
document.addEventListener('fullscreenchange', () => { $('fullscreen').textContent = document.fullscreenElement ? 'Exit full screen' : '⛶ Full screen'; });
document.addEventListener('keydown', event => {
  if (!prefs.shortcuts || event.ctrlKey || event.altKey || event.metaKey || event.repeat || document.querySelector('dialog[open]') || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  const key = event.key.toLowerCase();
  if ('abc'.includes(key) && key.length === 1) { event.preventDefault(); $('choices').children['abc'.indexOf(key)]?.click(); }
  else if (key === 'h') { event.preventDefault(); $('hop').click(); }
  else if (key === 'r') { event.preventDefault(); readQuestion(); }
  else if (key === 'n') { event.preventDefault(); if (!$('next').hidden) $('next').click(); }
});
addEventListener('pagehide', () => { save(); halt(); audioContext?.suspend().catch(() => {}); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); if (animating) { halt(); ready(); } } });
// The standalone branch does not require the separate ESP entryway branch.
if (new URLSearchParams(location.search).get('from') === 'esp') { const back = document.querySelector('.back'); back.href = 'extended-school-program.html'; back.setAttribute('aria-label', 'Back to Extended School Program'); back.querySelector('span').textContent = 'ESP'; }
render();
if (!('speechSynthesis' in window)) { $('listen').disabled = true; $('listen').title = 'Reading voice unavailable on this browser'; $('auto-read').disabled = true; }
