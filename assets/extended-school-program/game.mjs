import {PAIR_COUNTS, newBoard, flipCard, nextPlayer, nextBoard, restoreBoard} from './core.mjs';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'ttESP:shared-number-match:v1';
let state = newBoard(), storageAvailable = true, advanceTimer = null, turnTimer = null, partyTimer = null, focusBoardOnClose = false;
try { state = restoreBoard(JSON.parse(sessionStorage.getItem(STORAGE_KEY))) || state; }
catch { storageAvailable = false; }

function save() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('save-note').textContent = storageAvailable ? '' : 'This board can still be played. Refreshing may start a new puzzle.';
}
function face(card) {
  if (card.kind === 'number') return `<span class="number-face" aria-hidden="true">${card.value}</span>`;
  return `<span class="gem-set" aria-hidden="true">${'<span class="gem"></span>'.repeat(card.value)}</span>`;
}
function cardLabel(card, index, revealed, matched) {
  if (!revealed) return `Card ${index + 1}, face down`;
  return `Card ${index + 1}, ${card.kind === 'number' ? 'number ' + card.value : card.value + ' counting gems'}${matched ? ', matched' : ''}`;
}
function buildBoard() {
  $('board').replaceChildren();
  $('board').dataset.pairs = PAIR_COUNTS[state.level];
  state.cards.forEach((card, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'memory-card'; button.dataset.card = card.id;
    button.addEventListener('click', () => choose(card.id));
    button.dataset.position = index;
    $('board').append(button);
  });
}
function render() {
  const total = PAIR_COUNTS[state.level];
  $('board-label').textContent = `BOARD ${state.round}`;
  $('pair-count').textContent = state.matched.length;
  $('pair-total').textContent = total;
  for (const button of $('board').querySelectorAll('[data-card]')) {
    const card = state.cards.find(c => c.id === button.dataset.card), index = Number(button.dataset.position);
    const matched = state.matched.includes(card.value), revealed = matched || state.flipped.includes(card.id);
    button.classList.toggle('revealed', revealed); button.classList.toggle('matched', matched);
    button.setAttribute('aria-label', cardLabel(card, index, revealed, matched));
    button.setAttribute('aria-disabled', String(state.phase !== 'choose' || revealed));
    button.tabIndex = state.phase === 'choose' && !matched ? 0 : -1;
    button.innerHTML = revealed ? face(card) : `<span class="card-back" aria-hidden="true">✦</span><span class="card-position" aria-hidden="true">${index + 1}</span>`;
  }
  const message = $('turn-message');
  if (state.phase === 'complete') message.innerHTML = '<strong>You found every pair!</strong><span>Everyone helped finish the board.</span>';
  else if (state.phase === 'handoff') {
    const pair = state.flipped.map(id => state.cards.find(c => c.id === id));
    const match = pair[0].value === pair[1].value;
    message.innerHTML = `<strong>${match ? 'A match! Nice teamwork.' : 'Not a match. Remember those cards!'}</strong><span>The next player can go in a moment.</span>`;
  } else message.innerHTML = state.flipped.length ? '<strong>Now flip one more card.</strong><span>Can you find its number or amount?</span>' : '<strong>Flip two cards.</strong><span>Then let the next player try.</span>';
  save();
}
function focusFirstCard() { $('board').querySelector('[aria-disabled="false"]')?.focus({preventScroll: true}); }
function choose(id) {
  const next = flipCard(state, id);
  if (next === state) return;
  state = next; render();
  if (state.flipped.length === 2 && state.cards.find(c => c.id === state.flipped[0]).value === state.cards.find(c => c.id === state.flipped[1]).value) party();
  scheduleTurn();
  if (state.phase === 'complete') celebrate();
}
// Automatic handoff keeps the classroom line moving without extra buttons.
function clearTurn() { clearTimeout(turnTimer); turnTimer = null; }
function scheduleTurn() {
  clearTurn();
  if (state.phase !== 'handoff' || document.hidden || $('teacher-dialog').open) return;
  turnTimer = setTimeout(() => {
    state = nextPlayer(state); render(); focusFirstCard(); turnTimer = null;
  }, 1300);
}
function clearParty() { clearTimeout(partyTimer); $('match-party').replaceChildren(); }
function party() {
  clearParty();
  const colors = ['#ff4386', '#ffc928', '#2bdac3', '#6261ff', '#ff8537', '#3bbcff'];
  for (let i = 0; i < 150; i++) {
    const piece = document.createElement('i');
    piece.className = i % 9 === 0 ? 'party-balloon' : 'party-confetti';
    piece.style.cssText = `--x:${Math.random()*100}%;--delay:${Math.random()*.35}s;--drift:${Math.random()*180-90}px;--spin:${Math.random()*1080-540}deg;--color:${colors[i%colors.length]};--duration:${1.5+Math.random()*.8}s`;
    $('match-party').append(piece);
  }
  partyTimer = setTimeout(clearParty, 2800);
}
function clearAdvance() { if (advanceTimer !== null) clearTimeout(advanceTimer); advanceTimer = null; }
function scheduleAdvance() {
  clearAdvance();
  if (state.phase !== 'complete' || state.advancePaused || document.hidden || $('teacher-dialog').open) return;
  advanceTimer = setTimeout(advance, 5000);
}
function celebrate() {
  const count = PAIR_COUNTS[state.level], nextCount = PAIR_COUNTS[Math.min(state.level + 1, PAIR_COUNTS.length - 1)];
  $('celebration-copy').textContent = `All ${count} pairs found. ${nextCount > count ? 'Next up: ' + nextCount * 2 + ' cards!' : 'Another 24-card challenge is next.'}`;
  $('next-board-note').textContent = state.advancePaused ? 'Paused for your group. Choose Next board when everyone is ready.' : 'The next board starts automatically in a moment.';
  $('pause-next').textContent = state.advancePaused ? 'Resume automatic start' : 'Pause here';
  $('celebration').hidden = false;
  $('pause-next').focus({preventScroll: true});
  scheduleAdvance();
}
function advance() {
  if (state.phase !== 'complete') return;
  clearAdvance();
  state = nextBoard(state);
  $('celebration').hidden = true; buildBoard(); render(); focusFirstCard();
}
$('pause-next').addEventListener('click', () => {
  state.advancePaused = !state.advancePaused;
  save();
  $('pause-next').textContent = state.advancePaused ? 'Resume automatic start' : 'Pause here';
  $('next-board-note').textContent = state.advancePaused ? 'Paused for your group. Choose Next board when everyone is ready.' : 'The next board starts automatically in a moment.';
  scheduleAdvance();
});
$('continue-next').addEventListener('click', advance);
$('celebration').addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  event.preventDefault(); state.advancePaused = true; save(); clearAdvance();
  $('pause-next').textContent = 'Resume automatic start';
  $('next-board-note').textContent = 'Paused for your group. Choose Next board when everyone is ready.';
});
$('teacher').addEventListener('click', () => {
  clearAdvance(); clearTurn(); clearParty(); $('starting-level').value = state.level;
  if (!$('teacher-dialog').open) $('teacher-dialog').showModal();
});
$('keep-board').addEventListener('click', () => $('teacher-dialog').close());
$('teacher-dialog').addEventListener('close', () => {
  if (focusBoardOnClose) { focusBoardOnClose = false; focusFirstCard(); }
  else $('teacher').focus({preventScroll: true});
  scheduleAdvance(); scheduleTurn();
});
$('teacher-form').addEventListener('submit', event => {
  event.preventDefault(); clearAdvance(); clearTurn(); clearParty();
  state = newBoard(Number($('starting-level').value));
  $('celebration').hidden = true;
  buildBoard(); render(); focusBoardOnClose = true; $('teacher-dialog').close();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearAdvance(); clearTurn(); clearParty(); } else { scheduleAdvance(); scheduleTurn(); } });
window.addEventListener('pagehide', () => { clearAdvance(); clearTurn(); clearParty(); });
window.addEventListener('pageshow', () => { scheduleAdvance(); scheduleTurn(); });
buildBoard(); render(); scheduleTurn();
if (state.phase === 'complete') celebrate();

$('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else throw new Error('Fullscreen unavailable');
    $('display-note').textContent = '';
  } catch {
    $('display-note').textContent = 'Full screen is not available in this browser. The game still fits your screen; on iPhone, Add to Home Screen can give you more room.';
  }
});
document.addEventListener('fullscreenchange', () => {
  $('fullscreen').textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  $('fullscreen').setAttribute('aria-pressed', String(!!document.fullscreenElement));
});
