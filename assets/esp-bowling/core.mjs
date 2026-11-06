// Standalone ESP game. No student identity, network calls, storage or Town ledger.
export const TEAM_NAMES = ['Blue Comets', 'Coral Rockets', 'Golden Stars', 'Mint Meteors', 'Purple Planets', 'Pink Novas'];
export const TEAM_COLORS = ['#66c9ff', '#ff8976', '#ffcf66', '#6de3c1', '#bca1ff', '#ffa1da'];
export const WORDS = [
  { word: 'cat', blank: 1, clue: 'A pet that says meow.', picture: 'cat' },
  { word: 'sun', blank: 1, clue: 'It shines in the sky.', picture: 'sun' },
  { word: 'dog', blank: 1, clue: 'A pet that says woof.', picture: 'dog' },
  { word: 'hat', blank: 0, clue: 'You wear it on your head.', picture: 'hat' },
  { word: 'cup', blank: 1, clue: 'You drink from it.', picture: 'cup' },
  { word: 'pig', blank: 0, clue: 'A farm animal that says oink.', picture: 'pig' },
  { word: 'bed', blank: 1, clue: 'You sleep in it.', picture: 'bed' },
  { word: 'hen', blank: 2, clue: 'A bird that lays eggs.', picture: 'hen' }
];
const int = (v, min, max, fallback) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max ? Number(v) : fallback;
export function normalizeSettings(input = {}) {
  const mode = input.mode === 'split' ? 'split' : 'shared';
  return { mode, teams: mode === 'split' ? 2 : int(input.teams, 1, 6, 2), players: int(input.players, 1, 12, 4), rounds: int(input.rounds, 1, 3, 2), subject: ['math', 'spelling', 'mix'].includes(input.subject) ? input.subject : 'mix' };
}
export function makeQuestion(subject, turn, team = 0) {
  const type = subject === 'mix' ? (turn % 2 ? 'spelling' : 'math') : subject;
  const seed = turn * 7 + team * 3;
  if (type === 'spelling') {
    const item = WORDS[(Math.floor(turn / (subject === 'mix' ? 2 : 1)) + team) % WORDS.length];
    const answer = item.word[item.blank];
    const alternatives = [...'aeioustnmpbrcdh'].filter(c => c !== answer);
    const options = [answer, alternatives[seed % alternatives.length], alternatives[(seed + 5) % alternatives.length]];
    return { type, prompt: item.word.split('').map((c, i) => i === item.blank ? '_' : c).join(' '), answer, options: rotate(options, seed % 3), clue: item.clue, picture: item.picture, word: item.word, hint: 'Say the word slowly. Which sound is missing?' };
  }
  const a = 2 + (seed % 7), b = 1 + ((seed * 3) % Math.min(a, 4)), subtract = Math.floor(turn / 2) % 2 === 1;
  const left = subtract ? a : Math.min(a, 10 - b), answer = subtract ? left - b : left + b;
  const choices = [answer, answer === 10 ? answer - 2 : answer + 1, answer === 0 ? 2 : answer - 1];
  return { type: 'math', prompt: `${left} ${subtract ? '−' : '+'} ${b} = ?`, answer: String(answer), options: rotate(choices.map(String), seed % 3), a: left, b, subtract, hint: subtract ? `Start at ${left}. Count back ${b}.` : `Start at ${left}. Count on ${b}.` };
}
function rotate(items, count) { return [...items.slice(count), ...items.slice(0, count)]; }
export function newGame(input) {
  const settings = normalizeSettings(input);
  return { settings, activeTeam: 0, teams: Array.from({ length: settings.teams }, (_, id) => ({ id, turns: 0, score: 0, rolls: [], phase: 'question', question: makeQuestion(settings.subject, 0, id), aim: 0, feedback: '', attempts: 0, pins: [] })) };
}
export function turnInfo(game, team) {
  return { player: team.turns % game.settings.players + 1, round: Math.floor(team.turns / game.settings.players) + 1, total: game.settings.players * game.settings.rounds };
}
export function canPlay(game, id) { return !!game.teams[id] && (game.settings.mode === 'split' || game.activeTeam === id); }
export function answerQuestion(game, id, choice) {
  const team = game.teams[id];
  if (!canPlay(game, id) || team.phase !== 'question') return false;
  team.attempts++;
  if (String(choice) !== team.question.answer) { team.feedback = `Try again. ${team.question.hint}`; return false; }
  team.phase = 'aim'; team.feedback = 'You earned your roll! Aim, then bowl.'; return true;
}
export function setAim(game, id, value) {
  if (!canPlay(game, id) || game.teams[id].phase !== 'aim' || !Number.isFinite(Number(value))) return false;
  game.teams[id].aim = Math.max(-100, Math.min(100, Number(value))); return true;
}
// A forgiving, predictable classroom model, not regulation bowling physics.
// Ball position changes which pins fall. A center shot clears all ten pins.
export function pinsForAim(aim) {
  const target = Math.max(-100, Math.min(100, Number.isFinite(aim) ? aim : 0));
  const count = Math.max(1, 10 - Math.floor(Math.abs(target) / 12));
  const pins = [-45, -15, 15, 45, -30, 0, 30, -15, 15, 0];
  return pins.map((x, index) => ({ index, distance: Math.abs(x - target * .6) })).sort((a, b) => a.distance - b.distance || a.index - b.index).slice(0, count).map(p => p.index);
}
export function roll(game, id) {
  const team = game.teams[id];
  if (!canPlay(game, id) || team.phase !== 'aim') return false;
  team.phase = 'rolling'; team.pins = pinsForAim(team.aim); return true;
}
export function settleRoll(game, id) {
  const team = game.teams[id];
  if (!team || team.phase !== 'rolling') return false;
  team.score += team.pins.length; team.rolls.push(team.pins.length); team.turns++;
  team.phase = 'result'; team.feedback = team.pins.length === 10 ? 'Strike! All 10 pins!' : `${team.pins.length} pins! Great effort.`; return true;
}
export function nextTurn(game, id) {
  const team = game.teams[id];
  if (!canPlay(game, id) || team.phase !== 'result') return false;
  if (team.turns >= turnInfo(game, team).total) team.phase = 'done';
  else { team.phase = 'question'; team.question = makeQuestion(game.settings.subject, team.turns, id); team.aim = 0; team.feedback = ''; team.attempts = 0; team.pins = []; }
  if (game.settings.mode === 'shared') {
    for (let offset = 1; offset <= game.teams.length; offset++) {
      const candidate = (id + offset) % game.teams.length;
      if (game.teams[candidate].phase !== 'done') { game.activeTeam = candidate; break; }
    }
  }
  return true;
}
export const isComplete = game => game.teams.every(team => team.phase === 'done');
export function leaders(game) { const best = Math.max(...game.teams.map(t => t.score)); return game.teams.filter(t => t.score === best); }
