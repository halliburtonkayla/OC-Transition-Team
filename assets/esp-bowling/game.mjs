import { TEAM_NAMES, TEAM_COLORS, newGame, turnInfo, answerQuestion, setAim, roll, settleRoll, nextTurn, isComplete, leaders } from './core.mjs';
import { alley, picture } from './art.mjs';
const $ = selector => document.querySelector(selector);
const setup = $('#setup'), form = $('#setup-form'), play = $('#play'), lanes = $('#lanes'), finish = $('#celebration');
let game = null, timers = new Map(), spoken = 0;
const motionReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#preview-alley').innerHTML = alley('preview', '#8fcfff', { aim: -35 });
function stopVoice() { spoken++; window.speechSynthesis?.cancel(); }
function stopRolls() { for (const [id, timer] of timers) { clearTimeout(timer); if (game) settleRoll(game, id); } timers.clear(); }
function syncMode() { const split = form.elements.mode.value === 'split'; form.elements.teams.disabled = split; if (split) form.elements.teams.value = '2'; $('#mode-note').textContent = split ? 'Two teams have their own lanes. Take turns at one screen, or tap each lane independently. Phones stack the lanes.' : 'Teams rotate after every roll. Use player numbers instead of names.'; }
form.addEventListener('change', syncMode);
form.addEventListener('submit', event => { event.preventDefault(); start(Object.fromEntries(new FormData(form))); });
function start(settings) { stopRolls(); stopVoice(); game = newGame(settings); setup.hidden = true; finish.hidden = true; play.hidden = false; renderGame(); play.scrollIntoView({ block: 'start' }); focusLane(game.activeTeam); }
function renderScores() { $('#scoreboard').innerHTML = game.teams.map(t => `<div class="score ${(game.settings.mode === 'split' && t.phase !== 'done') || game.activeTeam === t.id ? 'active' : ''}" style="--team:${TEAM_COLORS[t.id]}"><span class="score-name">${TEAM_NAMES[t.id]}</span><strong class="score-number">${t.score}<span class="sr-only"> points</span></strong><small>${t.turns}/${turnInfo(game, t).total} rolls complete</small></div>`).join(''); }
function renderGame() {
  renderScores(); lanes.className = `lanes ${game.settings.mode === 'split' ? 'split' : ''}`;
  $('#play-note').textContent = game.settings.mode === 'split' ? 'Two independent lanes. You can take turns tapping. No simultaneous touch needed. On phones, scroll to the other team.' : 'One lane, one player at a time. Cheer for the other teams while you wait.';
  lanes.replaceChildren(); const ids = game.settings.mode === 'split' ? [0, 1] : [game.activeTeam];
  for (const id of ids) { const holder = document.createElement('article'); holder.id = `lane-${id}`; holder.className = 'lane'; holder.style.setProperty('--team', TEAM_COLORS[id]); lanes.append(holder); renderLane(id); }
}
function focusLane(id) { const target = $(`#lane-${id} .answer, #lane-${id} .aim-range, #lane-${id} .next-button`); target?.focus({ preventScroll: true }); }
function renderLane(id) {
  const t = game.teams[id], info = turnInfo(game, t), holder = $(`#lane-${id}`); if (!holder) return;
  const displayedTurn = t.phase === 'result' ? Math.max(0, t.turns - 1) : t.turns;
  holder.setAttribute('aria-label', `${TEAM_NAMES[id]} bowling lane`);
  holder.innerHTML = `<header class="lane-header"><div><h2>${TEAM_NAMES[id]}</h2><p>${t.phase === 'done' ? 'All turns complete' : `Round ${Math.floor(displayedTurn / game.settings.players) + 1} of ${game.settings.rounds} · ${game.settings.players} player${game.settings.players === 1 ? '' : 's'}`}</p></div><div class="player-chip">${t.phase === 'done' ? `${t.score} points` : `Player ${displayedTurn % game.settings.players + 1}`}</div></header><div class="lane-content">${t.phase === 'done' ? `<div class="completed-lane"><p class="eyebrow">NICE TEAMWORK</p><h3>All ${info.total} rolls complete!</h3><p>Cheer for the other team.</p></div>` : `<div class="stage ${t.phase === 'result' ? 'rolled' : ''}"><span class="visual-label">LANE <b>${id + 1}</b> · ESP BOWL</span>${alley(`lane${id}`, TEAM_COLORS[id], { aim: t.aim, fallen: t.phase === 'result' ? t.pins : [], aiming: t.phase === 'aim' })}</div><div class="panel">${panel(t, info)}</div>`}</div>`;
  if (t.phase === 'rolling') animateBall(id);
}
function panel(t, info) {
  const id = t.id;
  if (t.phase === 'question') { const q = t.question; return `<p class="step-label">STEP 1 · EARN YOUR ROLL</p><h3 class="question-heading">${q.type === 'math' ? 'Solve it to bowl!' : 'Find the missing letter.'}</h3>${q.type === 'math' ? `<div class="problem" aria-label="${q.a} ${q.subtract ? 'minus' : 'plus'} ${q.b} equals what">${q.prompt}</div>` : `<div class="spelling-problem">${picture(q.picture)}<div class="problem" aria-label="${q.prompt.replace('_', 'blank')}">${q.prompt}</div></div><p class="clue">${q.clue}</p>`}<div class="answer-options" aria-label="Answer choices">${q.options.map(option => `<button class="answer" type="button" data-action="answer" data-team="${id}" data-choice="${option}" aria-label="Answer ${option}">${option}</button>`).join('')}</div><p class="feedback" role="status" aria-live="polite">${t.feedback || 'Take your time. Your team can help.'}</p><button type="button" class="read-question" data-action="read" data-team="${id}">♪ Read question aloud</button>`; }
  if (t.phase === 'aim') return `<p class="step-label">STEP 2 · AIM YOUR BALL</p><h3 class="question-heading">You earned your roll!</h3><p class="clue">Try lining up with the middle pin.</p><label class="aim-label" for="aim-${id}"><span>Left</span><span>Ball position</span><span>Right</span></label><input class="aim-range" type="range" id="aim-${id}" min="-100" max="100" step="5" value="${t.aim}" data-team="${id}" aria-label="${TEAM_NAMES[id]} ball position" aria-valuetext="${aimText(t.aim)}"><div class="aim-buttons"><button type="button" data-action="left" data-team="${id}" aria-label="Move ball left">← Left</button><button type="button" data-action="center" data-team="${id}">Center</button><button type="button" data-action="right" data-team="${id}" aria-label="Move ball right">Right →</button></div><button type="button" class="primary roll-button" data-action="roll" data-team="${id}">Bowl! <span aria-hidden="true">● →</span></button><p class="aim-help">Slide, use the arrows, or tap the lane to aim. Then press Bowl.</p>`;
  if (t.phase === 'rolling') return `<p class="step-label">STEP 3 · LET IT ROLL</p><p class="rolling-copy" role="status">Here it goes…</p><p class="clue">Watch the pins!</p>`;
  return `<p class="step-label">THAT’S TEAMWORK</p><h3 class="result-title" role="status">${t.pins.length === 10 ? 'Strike!' : 'Nice roll!'}</h3><div class="result-number">+${t.pins.length}<small>points for ${TEAM_NAMES[id]}</small></div><button type="button" class="primary next-button" data-action="next" data-team="${id}">${t.turns >= info.total ? 'Finish this team' : game.settings.mode === 'split' ? 'Next player' : 'Next team'} →</button>`;
}
function aimText(value) { return value === 0 ? 'Center' : `${Math.abs(value)} percent ${value < 0 ? 'left' : 'right'}`; }
function updateAim(id, value) {
  if (!setAim(game, id, value)) return;
  const holder = $(`#lane-${id}`), input = holder.querySelector('.aim-range'), t = game.teams[id];
  input.value = t.aim; input.setAttribute('aria-valuetext', aimText(t.aim)); holder.querySelector('.stage svg').outerHTML = alley(`lane${id}`, TEAM_COLORS[id], { aim: t.aim, aiming: true });
}
lanes.addEventListener('input', event => { if (event.target.matches('.aim-range')) updateAim(Number(event.target.dataset.team), Number(event.target.value)); });
lanes.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) { const stage = event.target.closest('.stage'); if (stage) { const id = Number(stage.closest('.lane').id.replace('lane-', '')), rect = stage.querySelector('svg').getBoundingClientRect(); updateAim(id, Math.round(((event.clientX - rect.left) / rect.width - .5) * 320 / 5) * 5); } return; }
  const id = Number(button.dataset.team), action = button.dataset.action; if (!game?.teams[id]) return;
  if (action === 'answer') { const correct = answerQuestion(game, id, button.dataset.choice); stopVoice(); renderLane(id); if (correct) focusLane(id); else $(`#lane-${id} [data-choice="${button.dataset.choice}"]`)?.focus({ preventScroll: true }); }
  if (['left', 'center', 'right'].includes(action)) updateAim(id, action === 'center' ? 0 : game.teams[id].aim + (action === 'left' ? -15 : 15));
  if (action === 'roll' && roll(game, id)) { stopVoice(); renderLane(id); const identity = game; timers.set(id, setTimeout(() => { timers.delete(id); if (game !== identity) return; settleRoll(game, id); renderLane(id); renderScores(); const focused = document.activeElement; if (game.settings.mode === 'shared' || focused === document.body || focused.closest(`#lane-${id}`)) focusLane(id); }, motionReduced() ? 250 : 1300)); }
  if (action === 'next' && nextTurn(game, id)) { if (isComplete(game)) showFinish(); else if (game.settings.mode === 'split') { renderLane(id); renderScores(); focusLane(id); } else { renderGame(); focusLane(game.activeTeam); } }
  if (action === 'read') readQuestion(id);
});
function animateBall(id) {
  if (motionReduced()) return;
  const t = game.teams[id], ball = $(`#lane-${id} .ball`);
  ball?.animate?.([{ transform: `translate(${300+t.aim*1.6}px,315px) scale(1)` }, { transform: `translate(${300+t.aim*.9}px,145px) scale(.43)` }], { duration: 1050, easing: 'cubic-bezier(.2,.1,.7,.9)', fill: 'forwards' });
}
function readQuestion(id) {
  const q = game.teams[id].question;
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { game.teams[id].feedback = 'Voice is unavailable on this device. A teacher can read the question aloud.'; renderLane(id); return; }
  stopVoice(); const version = spoken, identity = game; const words = q.type === 'math' ? `What is ${q.a} ${q.subtract ? 'minus' : 'plus'} ${q.b}?` : `${q.word}. ${q.clue} Which letter is missing in ${q.word}?`;
  const utterance = new SpeechSynthesisUtterance(words); utterance.lang = 'en-US'; utterance.rate = .8;
  utterance.onerror = () => { if (spoken !== version || game !== identity || game.teams[id].phase !== 'question') return; game.teams[id].feedback = 'Voice is unavailable. A teacher can read the question aloud.'; renderLane(id); };
  window.speechSynthesis.speak(utterance);
}
function showFinish() { stopVoice(); play.hidden = true; finish.hidden = false; const winners = leaders(game); $('#winner').textContent = game.teams.length === 1 ? `${TEAM_NAMES[0]} scored ${game.teams[0].score} points. Every player helped!` : winners.length === game.teams.length ? 'A team tie! Everyone has something to celebrate.' : `${winners.map(t => TEAM_NAMES[t.id]).join(' and ')} ${winners.length > 1 ? 'share the lead' : 'takes the lead'}! Cheer for every team.`; $('#final-scores').innerHTML = game.teams.map(t => `<div class="final-row" style="--team:${TEAM_COLORS[t.id]}"><span>${TEAM_NAMES[t.id]}</span><span>${t.score} points</span></div>`).join(''); $('#finish-title').focus(); }
function openSettings() { stopRolls(); stopVoice(); play.hidden = true; finish.hidden = true; setup.hidden = false; $('#cancel-setup').hidden = !game; form.querySelector('input').focus({ preventScroll: true }); setup.scrollIntoView({ block: 'start', behavior: motionReduced() ? 'auto' : 'smooth' }); }
$('#settings').addEventListener('click', openSettings); $('#new-setup').addEventListener('click', openSettings);
$('#cancel-setup').addEventListener('click', () => { setup.hidden = true; if (isComplete(game)) showFinish(); else { play.hidden = false; renderGame(); focusLane(game.activeTeam); } });
$('#play-again').addEventListener('click', () => start(game.settings));
const full = $('#fullscreen');
function syncFullscreen() { const active = !!document.fullscreenElement || document.body.classList.contains('immersive'); full.textContent = active ? 'Exit full screen' : 'Full screen'; full.setAttribute('aria-pressed', String(active)); }
full.setAttribute('aria-pressed', 'false');
full.addEventListener('click', async () => {
  if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch { $('#display-note').textContent = 'Use your browser’s full-screen control to exit.'; } }
  else if (document.body.classList.contains('immersive')) { document.body.classList.remove('immersive'); $('#display-note').textContent = ''; }
  else { try { if (!document.documentElement.requestFullscreen) throw Error('unsupported'); await document.documentElement.requestFullscreen(); $('#display-note').textContent = ''; } catch { document.body.classList.add('immersive'); $('#display-note').textContent = 'Expanded view is on. On iPhone, use Safari’s Share → Add to Home Screen, then open it there for a larger view. Browser controls may still appear.'; } }
  syncFullscreen();
});
document.addEventListener('fullscreenchange', syncFullscreen);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.body.classList.contains('immersive')) { document.body.classList.remove('immersive'); $('#display-note').textContent = ''; syncFullscreen(); } });
window.addEventListener('pagehide', () => { stopRolls(); stopVoice(); });
window.addEventListener('pageshow', event => { if (event.persisted && game && !play.hidden) renderGame(); });
syncMode();
