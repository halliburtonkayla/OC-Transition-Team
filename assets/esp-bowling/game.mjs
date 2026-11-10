import { TEAM_NAMES, TEAM_COLORS, newGame, turnInfo, answerQuestion, setAim, setPower, beginPower, cancelPower, powerAt, roll, settleRoll, nextTurn, isComplete, leaders, practiceReport } from './core.mjs';
import { alley, picture } from './art.mjs';
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = selector => document.querySelector(selector);
const setup = $('#setup'), form = $('#setup-form'), play = $('#play'), lanes = $('#lanes'), finish = $('#celebration');
let game = null, timers = new Map(), spoken = 0, meterFrame = 0;
const charging = new Map();
const motionReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#preview-alley').innerHTML = alley('preview', '#8fcfff', { aim: -35 });
function stopVoice() { spoken++; window.speechSynthesis?.cancel(); }
function stopPower() { for (const id of charging.keys()) if (game) cancelPower(game, id); charging.clear(); if (meterFrame) cancelAnimationFrame(meterFrame); meterFrame = 0; }
function stopRolls() { stopPower(); for (const [id, timer] of timers) { clearTimeout(timer); if (game) settleRoll(game, id); } timers.clear(); }
function syncMode() { const transition = form.elements.track.value === 'transition'; form.elements.subject.disabled = transition; $('#track-note').textContent = transition ? '45 new real-life and job-skills scenarios. No repeats until the bank is exhausted during this open session, including replays.' : 'ESP: first-grade math and illustrated spelling.'; const split = form.elements.mode.value === 'split'; form.elements.teams.disabled = split; if (split) form.elements.teams.value = '2'; $('#mode-note').textContent = split ? 'Two teams have their own lanes. Take turns at one screen, or tap each lane independently. Phones stack the lanes.' : 'Teams rotate after every roll. Use player numbers instead of names.'; }
form.addEventListener('change', syncMode);
form.addEventListener('submit', event => { event.preventDefault(); start(Object.fromEntries(new FormData(form))); });
function start(settings) { stopRolls(); stopVoice(); game = newGame(settings, game?.questionDeck); $('#report-tools').hidden = false; if (motionReduced()) game.settings.powerMode = 'steady'; document.body.classList.add('playing'); setup.hidden = true; finish.hidden = true; play.hidden = false; renderGame(); play.scrollIntoView({ block: 'start' }); focusLane(game.activeTeam); }
function renderScores() { $('#scoreboard').innerHTML = game.teams.map(t => `<div class="score ${(game.settings.mode === 'split' && t.phase !== 'done') || game.activeTeam === t.id ? 'active' : ''}" style="--team:${TEAM_COLORS[t.id]}"><span class="score-name">${TEAM_NAMES[t.id]}</span><strong class="score-number">${t.score}<span class="sr-only"> points</span></strong><small>${t.turns}/${turnInfo(game, t).total} rolls complete</small></div>`).join(''); }
function renderGame() {
  renderScores(); lanes.className = `lanes ${game.settings.mode === 'split' ? 'split' : ''}`;
  $('#play-note').textContent = game.settings.mode === 'split' ? 'Two independent lanes. You can take turns tapping. No simultaneous touch needed. On phones, scroll to the other team.' : 'One lane, one player at a time. Cheer for the other teams while you wait.';
  lanes.replaceChildren(); const ids = game.settings.mode === 'split' ? [0, 1] : [game.activeTeam];
  for (const id of ids) { const holder = document.createElement('article'); holder.id = `lane-${id}`; holder.className = 'lane'; holder.style.setProperty('--team', TEAM_COLORS[id]); lanes.append(holder); renderLane(id); }
}
function focusLane(id) { const target = $(`#lane-${id} .answer, #lane-${id} .aim-range:not(:disabled), #lane-${id} .release-button, #lane-${id} .next-button`); target?.focus({ preventScroll: true }); if (target) $(`#lane-${id}`).scrollIntoView({block:'start',behavior:'auto'}); }
function renderLane(id) {
  const t = game.teams[id], info = turnInfo(game, t), holder = $(`#lane-${id}`); if (!holder) return;
  const displayedTurn = t.phase === 'result' ? Math.max(0, t.turns - 1) : t.turns;
  holder.dataset.phase = t.phase; holder.dataset.questionType = t.question.type; holder.setAttribute('aria-label', `${TEAM_NAMES[id]} bowling lane`);
  holder.innerHTML = `<header class="lane-header"><div><h2>${TEAM_NAMES[id]}</h2><p>${t.phase === 'done' ? 'All turns complete' : `Round ${Math.floor(displayedTurn / game.settings.players) + 1} of ${game.settings.rounds} · ${game.settings.players} player${game.settings.players === 1 ? '' : 's'}`}</p></div><div class="player-chip">${t.phase === 'done' ? `${t.score} points` : `Player ${displayedTurn % game.settings.players + 1}`}</div></header><div class="lane-content">${t.phase === 'done' ? `<div class="completed-lane"><p class="eyebrow">NICE TEAMWORK</p><h3>All ${info.total} ${info.total === 1 ? 'roll' : 'rolls'} complete!</h3><p>Cheer for the other team.</p></div>` : `<div class="stage ${t.phase === 'result' ? 'rolled' : ''}"><span class="visual-label">LANE <b>${id + 1}</b> · ESP BOWL</span>${alley(`lane${id}`, TEAM_COLORS[id], { aim: t.aim, fallen: t.phase === 'result' ? t.pins : [], aiming: t.phase === 'aim' || t.phase === 'power', pocket: t.challenge.pocket, large: true })}</div><div class="panel">${panel(t, info)}</div>`}</div>`;
  if (t.phase === 'rolling') animateBall(id);
}
function panel(t, info) {
  const id = t.id;
  if (t.phase === 'question' && t.question.type === 'scenario') { const q = t.question; return `<div class="scenario-copy"><p class="step-label">REAL-LIFE SKILLS · ${esc(q.category)}</p><h3 class="scenario-prompt">${esc(q.prompt)}</h3><p class="feedback" role="status">${esc(t.feedback || 'Talk it through. Choose the best next step.')}</p><button type="button" class="read-question" data-action="read" data-team="${id}">♪ Read question aloud</button></div><div class="answer-options scenario-answers" aria-label="Scenario answer choices">${q.options.map((option,index)=>`<button class="answer" type="button" data-action="answer" data-team="${id}" data-answer-index="${index}">${esc(option)}</button>`).join('')}</div>`; }
  if (t.phase === 'question') { const q = t.question; return `<p class="step-label">STEP 1 · EARN YOUR ROLL</p><h3 class="question-heading">${q.type === 'math' ? 'Solve it to bowl!' : 'Find the missing letter.'}</h3>${q.type === 'math' ? `<div class="problem" aria-label="${q.a} ${q.subtract ? 'minus' : 'plus'} ${q.b} equals what">${q.prompt}</div>` : `<div class="spelling-problem">${picture(q.picture)}<div class="problem" aria-label="${q.prompt.replace('_', 'blank')}">${q.prompt}</div></div><p class="clue">${q.clue}</p>`}<div class="answer-options" aria-label="Answer choices">${q.options.map(option => `<button class="answer" type="button" data-action="answer" data-team="${id}" data-choice="${option}" aria-label="Answer ${option}">${option}</button>`).join('')}</div><p class="feedback" role="status" aria-live="polite">${t.feedback || 'Take your time. Your team can help.'}</p><button type="button" class="read-question" data-action="read" data-team="${id}">♪ Read question aloud</button>`; }
  if (t.phase === 'aim' || t.phase === 'power') {
    const moving = t.phase === 'power', steady = game.settings.powerMode === 'steady';
    return `<div class="aim-controls"><p class="step-label">${moving ? 'AIM IS SET' : 'STEP 2 · PICK YOUR LINE'}</p><h3 class="question-heading">Aim for the glowing pocket.</h3><label class="aim-label" for="aim-${id}"><span>← Left</span><span>Ball direction</span><span>Right →</span></label><input class="aim-range" type="range" id="aim-${id}" min="-100" max="100" step="2" value="${t.aim}" data-team="${id}" aria-label="${TEAM_NAMES[id]} ball direction" aria-valuetext="${aimText(t.aim)}" ${moving ? 'disabled' : ''}><div class="aim-buttons"><button type="button" data-action="left" data-team="${id}" ${moving ? 'disabled' : ''}>← Aim left</button><button type="button" data-action="right" data-team="${id}" ${moving ? 'disabled' : ''}>Aim right →</button></div></div><div class="power-controls"><p class="step-label">STEP 3 · ${steady ? 'CHOOSE YOUR POWER' : 'TIME YOUR RELEASE'}</p><div class="power-label"><strong>${moving ? 'Release in the green zone!' : steady ? 'Slide into the green zone.' : 'Start the meter, then release in green.'}</strong><output id="power-value-${id}">${t.power}%</output></div><div class="power-track" aria-hidden="true"><div class="power-fill" id="power-fill-${id}" style="width:${t.power}%"></div><div class="power-zone" style="left:${t.challenge.power - 7}%;width:14%"></div><div class="power-needle" id="power-needle-${id}" style="left:${t.power}%"></div></div>${steady ? `<input type="range" class="power-range" min="10" max="100" step="1" value="${t.power}" data-team="${id}" aria-label="${TEAM_NAMES[id]} bowling power">` : ''}<button type="button" class="primary roll-button ${moving ? 'release-button' : ''}" data-action="${moving ? 'release' : 'start-power'}" data-team="${id}">${moving ? 'Release the ball!' : steady ? 'Roll with this power!' : 'Start power meter'} <span aria-hidden="true">● →</span></button>${moving ? `<button type="button" class="quiet retry-power" data-action="cancel-power" data-team="${id}">Reset aim and power</button>` : `<p class="aim-help">${steady ? 'Direction and power both change your roll.' : 'Two taps, no holding. Watch the meter, not a countdown.'}</p>`}</div>`;
  }
  if (t.phase === 'rolling') return `<p class="step-label">STEP 3 · LET IT ROLL</p><p class="rolling-copy" role="status">Here it goes…</p><p class="clue">Watch the pins!</p>`;
  return `<p class="step-label">THAT’S TEAMWORK</p><h3 class="result-title" role="status">${t.pins.length === 10 ? 'Strike!' : 'Nice roll!'}</h3><div class="result-number">+${t.pins.length}<small>points for ${TEAM_NAMES[id]}</small></div><p class="shot-tip">${t.shot?.note || ''}</p><button type="button" class="primary next-button" data-action="next" data-team="${id}">${t.turns >= info.total ? 'Finish this team' : game.settings.mode === 'split' ? 'Next player' : 'Next team'} →</button>`;
}
function aimText(value) { return value === 0 ? 'Center' : `${Math.abs(value)} percent ${value < 0 ? 'left' : 'right'}`; }
function updateAim(id, value) {
  if (!setAim(game, id, value)) return;
  const holder = $(`#lane-${id}`), input = holder.querySelector('.aim-range'), t = game.teams[id];
  input.value = t.aim; input.setAttribute('aria-valuetext', aimText(t.aim)); holder.querySelector('.stage svg').outerHTML = alley(`lane${id}`, TEAM_COLORS[id], { aim: t.aim, aiming: true, pocket: t.challenge.pocket, large: true });
}
lanes.addEventListener('input', event => { if (event.target.matches('.aim-range')) updateAim(Number(event.target.dataset.team), Number(event.target.value)); if (event.target.matches('.power-range')) { const id = Number(event.target.dataset.team); if (setPower(game,id,Number(event.target.value))) paintMeter(id); } });
lanes.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) { const stage = event.target.closest('.stage'); if (stage) { const id = Number(stage.closest('.lane').id.replace('lane-', '')), rect = stage.querySelector('svg').getBoundingClientRect(); updateAim(id, Math.round(((event.clientX - rect.left) / rect.width - .5) * 320 / 5) * 5); } return; }
  const id = Number(button.dataset.team), action = button.dataset.action; if (!game?.teams[id]) return;
  if (action === 'answer') { const correct = answerQuestion(game, id, button.dataset.answerIndex !== undefined ? game.teams[id].question.options[Number(button.dataset.answerIndex)] : button.dataset.choice); stopVoice(); renderLane(id); if (correct) focusLane(id); else (button.dataset.answerIndex !== undefined ? $(`#lane-${id} [data-answer-index="${button.dataset.answerIndex}"]`) : $(`#lane-${id} [data-choice="${button.dataset.choice}"]`))?.focus({ preventScroll: true }); }
  if (['left', 'right'].includes(action)) updateAim(id, game.teams[id].aim + (action === 'left' ? -8 : 8));
  if (action === 'start-power' && beginPower(game, id)) {
    stopVoice();
    if (game.settings.powerMode === 'steady') releaseBall(id, game.teams[id].power);
    else { charging.set(id, performance.now()); game.teams[id].power = 10; renderLane(id); focusLane(id); if (!meterFrame) meterFrame = requestAnimationFrame(tickMeters); }
  }
  if (action === 'release' && charging.has(id)) { const power = powerAt(performance.now() - charging.get(id)); charging.delete(id); releaseBall(id, power); }
  if (action === 'cancel-power' && cancelPower(game, id)) { charging.delete(id); renderLane(id); focusLane(id); }
  if (action === 'next' && nextTurn(game, id)) { if (isComplete(game)) showFinish(); else if (game.settings.mode === 'split') { renderLane(id); renderScores(); focusLane(id); } else { renderGame(); focusLane(game.activeTeam); } }
  if (action === 'read') readQuestion(id);
});
function paintMeter(id) {
  const power = game.teams[id].power;
  const fill = $(`#power-fill-${id}`), needle = $(`#power-needle-${id}`), label = $(`#power-value-${id}`);
  if (fill) fill.style.width = power + '%'; if (needle) needle.style.left = power + '%'; if (label) label.textContent = power + '%';
}
function tickMeters(now) {
  meterFrame = 0;
  for (const [id, started] of charging) { if (game.teams[id].phase !== 'power') { charging.delete(id); continue; } game.teams[id].power = powerAt(now - started); paintMeter(id); }
  if (charging.size) meterFrame = requestAnimationFrame(tickMeters);
}
function releaseBall(id, power) {
  if (!roll(game, id, power)) return;
  stopVoice(); renderLane(id); $(`#lane-${id}`)?.scrollIntoView({block:'start',behavior:'auto'}); const identity = game;
  timers.set(id, setTimeout(() => { timers.delete(id); if (game !== identity) return; settleRoll(game, id); renderLane(id); renderScores(); const focused = document.activeElement; if (game.settings.mode === 'shared' || focused === document.body || focused.closest(`#lane-${id}`)) focusLane(id); }, motionReduced() ? 250 : 1500));
}
function animateBall(id) {
  if (motionReduced()) return;
  const t = game.teams[id], ball = $(`#lane-${id} .ball`);
  ball?.animate?.([{ transform: `translate(${300+t.aim*1.6}px,315px) scale(1)` }, { transform: `translate(${300+t.aim*.9}px,145px) scale(.43)` }], { duration: 1250, easing: 'cubic-bezier(.2,.1,.7,.9)', fill: 'forwards' });
}
function readQuestion(id) {
  const q = game.teams[id].question;
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { game.teams[id].feedback = 'Voice is unavailable on this device. A teacher can read the question aloud.'; renderLane(id); return; }
  stopVoice(); const version = spoken, identity = game; const words = q.type === 'scenario' ? q.prompt + ' ' + q.options.map((option,index)=>`Choice ${index+1}. ${option}`).join(' ') : q.type === 'math' ? `What is ${q.a} ${q.subtract ? 'minus' : 'plus'} ${q.b}?` : `${q.word}. ${q.clue} Which letter is missing in ${q.word}?`;
  const utterance = new SpeechSynthesisUtterance(words); utterance.lang = 'en-US'; utterance.rate = .8;
  utterance.onerror = () => { if (spoken !== version || game !== identity || game.teams[id].phase !== 'question') return; game.teams[id].feedback = 'Voice is unavailable. A teacher can read the question aloud.'; renderLane(id); };
  window.speechSynthesis.speak(utterance);
}
function showFinish() { stopVoice(); document.body.classList.remove('playing'); play.hidden = true; finish.hidden = false; const winners = leaders(game); $('#winner').textContent = game.teams.length === 1 ? `${TEAM_NAMES[0]} scored ${game.teams[0].score} points. Every player helped!` : winners.length === game.teams.length ? 'A team tie! Everyone has something to celebrate.' : `${winners.map(t => TEAM_NAMES[t.id]).join(' and ')} ${winners.length > 1 ? 'share the lead' : 'takes the lead'}! Cheer for every team.`; $('#final-scores').innerHTML = game.teams.map(t => `<div class="final-row" style="--team:${TEAM_COLORS[t.id]}"><span>${TEAM_NAMES[t.id]}</span><span>${t.score} points</span></div>`).join(''); $('#finish-title').focus(); }
function openSettings() { stopRolls(); document.body.classList.remove('playing'); stopVoice(); play.hidden = true; finish.hidden = true; setup.hidden = false; $('#cancel-setup').hidden = !game; form.querySelector('input').focus({ preventScroll: true }); setup.scrollIntoView({ block: 'start', behavior: motionReduced() ? 'auto' : 'smooth' }); }
$('#settings').addEventListener('click', openSettings); $('#new-setup').addEventListener('click', openSettings);
$('#cancel-setup').addEventListener('click', () => { setup.hidden = true; if (isComplete(game)) showFinish(); else { document.body.classList.add('playing'); play.hidden = false; renderGame(); focusLane(game.activeTeam); } });
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

function reportText() {
  const report = practiceReport(game);
  const lines = [report.title, report.attribution, report.delivery, `Started: ${report.startedAt}`, `Track: ${report.track === 'transition' ? 'Transition Town real-life skills' : 'ESP math/spelling'}`, `Game: ${report.complete ? 'complete' : 'in progress'}`, '', 'TEAM SCORES', ...report.scores.map(t=>`${t.name}: ${t.score} pins from ${t.rolls} ${t.rolls === 1 ? 'roll' : 'rolls'}`), '', 'QUESTION RESPONSES'];
  for (const a of report.attempts) lines.push('', `${a.teamName} | Player ${a.player} | Round ${a.round} | Turn ${a.turn} | Attempt ${a.attempt}`, `Question: ${a.question}${a.clue ? ' ('+a.clue+')' : ''}`, `Choices: ${a.options.join(' | ')}`, `Response: ${a.response}`, `Correct answer: ${a.correctAnswer}`, `Result: ${a.correct ? 'Correct' : 'Incorrect; retry allowed'}`, `Recorded: ${a.at}`);
  lines.push('', 'BOWLING OUTCOMES');for (const o of report.outcomes) lines.push(`${o.teamName} | Player ${o.player} | Round ${o.round} | ${o.pins} pins | Aim ${o.aim} | Power ${o.power}%`,o.feedback);
  if (!report.attempts.length) lines.push('No question responses recorded yet.');return lines.join('\n');
}
$('#view-report').addEventListener('click',()=>{stopRolls(); if (!play.hidden) renderGame(); $('#report-text').value=reportText();$('#report-status').textContent='';$('#report-dialog').showModal();});
$('#close-report').addEventListener('click',()=>$('#report-dialog').close());
$('#download-report').addEventListener('click',()=>{const blob=new Blob([reportText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='team-bowling-practice-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#report-status').textContent='Report file prepared for download. It has not been sent to a teacher.';});
