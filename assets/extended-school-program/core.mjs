// A shared, anonymous puzzle. No names, classroom records, or individual scores.
export const PAIR_COUNTS = Object.freeze([6, 8, 10, 12]);
export function newBoard(level = 0, round = 1, random = Math.random) {
  level = Math.max(0, Math.min(PAIR_COUNTS.length - 1, Math.trunc(level) || 0));
  const cards = Array.from({length: PAIR_COUNTS[level]}, (_, i) =>
    ['number', 'quantity'].map(kind => ({id: `${kind}-${i + 1}`, value: i + 1, kind}))).flat();
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return {version: 1, level, round, cards, flipped: [], matched: [], turns: 0, phase: 'choose', advancePaused: false};
}
export function flipCard(state, id) {
  const card = state.cards.find(c => c.id === id);
  if (state.phase !== 'choose' || !card || state.flipped.includes(id) || state.matched.includes(card.value)) return state;
  const next = {...state, flipped: [...state.flipped, id], matched: [...state.matched]};
  if (next.flipped.length === 2) {
    next.turns++;
    const first = state.cards.find(c => c.id === next.flipped[0]);
    if (first.value === card.value) next.matched.push(card.value);
    next.phase = next.matched.length === PAIR_COUNTS[next.level] ? 'complete' : 'handoff';
  }
  return next;
}
export function nextPlayer(state) {
  return state.phase === 'handoff' ? {...state, flipped: [], phase: 'choose'} : state;
}
export function nextBoard(state, random = Math.random) {
  return state.phase === 'complete' ? newBoard(state.level + 1, state.round + 1, random) : state;
}
export function restoreBoard(raw) {
  if (!raw || typeof raw.advancePaused !== 'boolean' || raw.version !== 1 || !Number.isInteger(raw.level) || raw.level < 0 || raw.level >= PAIR_COUNTS.length ||
      !Number.isSafeInteger(raw.round) || raw.round < 1 || !Number.isSafeInteger(raw.turns) || raw.turns < 0) return null;
  const count = PAIR_COUNTS[raw.level];
  if (!Array.isArray(raw.cards) || raw.cards.length !== count * 2 || !Array.isArray(raw.matched) || !Array.isArray(raw.flipped)) return null;
  if (raw.cards.some(c => !c || !Number.isInteger(c.value) || c.value < 1 || c.value > count ||
      !['number', 'quantity'].includes(c.kind) || c.id !== `${c.kind}-${c.value}`) || new Set(raw.cards.map(c => c.id)).size !== count * 2) return null;
  if (new Set(raw.matched).size !== raw.matched.length || raw.matched.some(v => !Number.isInteger(v) || v < 1 || v > count) || raw.turns < raw.matched.length) return null;
  if (raw.flipped.length > 2 || new Set(raw.flipped).size !== raw.flipped.length || raw.flipped.some(id => !raw.cards.some(c => c.id === id))) return null;
  const revealed = raw.flipped.map(id => raw.cards.find(c => c.id === id));
  if (raw.phase === 'choose') {
    if (revealed.length > 1 || raw.matched.length === count || revealed.some(c => raw.matched.includes(c.value))) return null;
  } else if (['handoff', 'complete'].includes(raw.phase)) {
    if (revealed.length !== 2 || raw.turns < 1 || (raw.phase === 'complete') !== (raw.matched.length === count)) return null;
    const match = revealed[0].value === revealed[1].value;
    if (match !== revealed.every(c => raw.matched.includes(c.value)) || (!match && revealed.some(c => raw.matched.includes(c.value)))) return null;
    if (raw.phase === 'complete' && !match) return null;
  } else return null;
  return structuredClone(raw);
}
