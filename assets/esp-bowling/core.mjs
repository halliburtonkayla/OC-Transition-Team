import { TRANSITION_QUESTIONS } from './transition-questions.mjs';
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
  return { mode, teams: mode === 'split' ? 2 : int(input.teams, 1, 6, 2), players: int(input.players, 1, 12, 4), rounds: int(input.rounds, 1, 3, 2), subject: ['math', 'spelling', 'mix'].includes(input.subject) ? input.subject : 'mix', powerMode: input.powerMode === 'steady' ? 'steady' : 'timed', track: input.track === 'transition' ? 'transition' : 'esp' };
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
export function newDeck() {
  const order = TRANSITION_QUESTIONS.map(q => q.id);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { order, cursor: 0, cycle: 1 };
}
function nextQuestion(game, team) {
  if (game.settings.track !== 'transition') return makeQuestion(game.settings.subject, team.turns, team.id);
  if (game.questionDeck.cursor >= game.questionDeck.order.length) { const cycle = game.questionDeck.cycle + 1; game.questionDeck = newDeck(); game.questionDeck.cycle = cycle; }
  const id = game.questionDeck.order[game.questionDeck.cursor++];
  return { ...TRANSITION_QUESTIONS.find(q => q.id === id), type: 'scenario', cycle: game.questionDeck.cycle };
}
export function newGame(input, previousDeck = null) {
  const settings = normalizeSettings(input);
  const game = { settings, activeTeam: 0, startedAt: new Date().toISOString(), attempts: [], outcomes: [], questionDeck: previousDeck ? { ...previousDeck, order: [...previousDeck.order] } : newDeck(), teams: Array.from({ length: settings.teams }, (_, id) => ({ id, turns: 0, score: 0, rolls: [], phase: 'question', question: null, aim: 0, power: 35, challenge: challengeForTurn(0), feedback: '', attempts: 0, pins: [] })) };
  for (const team of game.teams) team.question = nextQuestion(game, team);
  return game;
}
export function turnInfo(game, team) {
  return { player: team.turns % game.settings.players + 1, round: Math.floor(team.turns / game.settings.players) + 1, total: game.settings.players * game.settings.rounds };
}
export function canPlay(game, id) { return !!game.teams[id] && (game.settings.mode === 'split' || game.activeTeam === id); }
export function answerQuestion(game, id, choice) {
  const team = game.teams[id];
  if (!canPlay(game, id) || team.phase !== 'question') return false;
  team.attempts++;
  const q = team.question, info = turnInfo(game, team);
  game.attempts.push({ team: team.id + 1, teamName: TEAM_NAMES[team.id], player: info.player, round: info.round, turn: team.turns + 1, questionId: q.id || `esp-${q.type}-${team.id}-${team.turns}`, category: q.category || q.type, question: q.prompt, clue: q.clue || '', options: [...q.options], response: String(choice), correctAnswer: q.answer, correct: String(choice) === q.answer, attempt: team.attempts, at: new Date().toISOString() });
  if (String(choice) !== team.question.answer) { team.feedback = `Try again. ${team.question.hint}`; return false; }
  team.phase = 'aim'; team.feedback = 'You earned your roll! Aim, then time your power.'; return true;
}
export function setAim(game, id, value) {
  if (!canPlay(game, id) || game.teams[id].phase !== 'aim' || !Number.isFinite(Number(value))) return false;
  game.teams[id].aim = Math.max(-100, Math.min(100, Number(value))); return true;
}
// Both teams face the same challenge on their corresponding numbered turn.
export function challengeForTurn(turn) {
  const pockets = [-38, 30, -24, 42, 24, -32];
  return { pocket: pockets[turn % pockets.length], power: [70, 82, 62, 76, 66, 86][turn % 6] };
}
export function powerAt(elapsed) {
  const cycle = Math.max(0, elapsed) % 4800;
  return Math.round(10 + 90 * (cycle <= 2400 ? cycle / 2400 : (4800 - cycle) / 2400));
}
export function beginPower(game, id) {
  if (!canPlay(game, id) || game.teams[id].phase !== 'aim') return false;
  game.teams[id].phase = 'power'; return true;
}
export function cancelPower(game, id) {
  if (!canPlay(game, id) || game.teams[id].phase !== 'power') return false;
  game.teams[id].phase = 'aim'; return true;
}
export function setPower(game, id, value) {
  if (!canPlay(game, id) || game.teams[id].phase !== 'aim' || !Number.isFinite(Number(value))) return false;
  game.teams[id].power = Math.max(10, Math.min(100, Number(value))); return true;
}
// A visible pocket and green power zone make this a learnable skill challenge.
// Off-center pockets and different power goals prevent a universal center-button strike.
export function shotResult(aim, power, challenge) {
  const aimError = Math.abs(aim - challenge.pocket), powerError = Math.abs(power - challenge.power);
  const accurate = aimError <= 7, strong = powerError <= 7;
  let count = Math.max(0, 10 - Math.ceil(Math.max(0, aimError - 7) / 11) - Math.ceil(Math.max(0, powerError - 7) / 9));
  if (Math.abs(aim) >= 95 || power < 17) count = 0;
  const pins = [-45, -15, 15, 45, -30, 0, 30, -15, 15, 0];
  const fallen = pins.map((x, index) => ({ index, distance: Math.abs(x - (aim - challenge.pocket) * .6) })).sort((a,b) => a.distance - b.distance || a.index - b.index).slice(0,count).map(p=>p.index);
  return { pins: fallen, aimError, powerError, note: accurate && strong ? 'Perfect pocket and power!' : !accurate && !strong ? 'Next time, line up the pocket and release in green.' : !accurate ? 'Good power! Aim closer to the glowing pocket next time.' : power < challenge.power ? 'Great aim! Give it a little more power next time.' : 'Great aim! Try a little less power next time.' };
}
export function roll(game, id, power) {
  const team = game.teams[id];
  if (!canPlay(game, id) || team.phase !== 'power' || !Number.isFinite(power) || power < 10 || power > 100) return false;
  team.power = power; team.shot = shotResult(team.aim, power, team.challenge);
  team.phase = 'rolling'; team.pins = team.shot.pins; return true;
}
export function settleRoll(game, id) {
  const team = game.teams[id];
  if (!team || team.phase !== 'rolling') return false;
  const info = turnInfo(game, team); game.outcomes.push({ team: team.id + 1, teamName: TEAM_NAMES[team.id], player: info.player, round: info.round, turn: team.turns + 1, pins: team.pins.length, aim: team.aim, power: team.power, targetPocket: team.challenge.pocket, targetPower: team.challenge.power, feedback: team.shot.note });
  team.score += team.pins.length; team.rolls.push(team.pins.length); team.turns++;
  team.phase = 'result'; team.feedback = team.pins.length === 10 ? 'Strike! All 10 pins!' : `${team.pins.length} pins! Great effort.`; return true;
}
export function nextTurn(game, id) {
  const team = game.teams[id];
  if (!canPlay(game, id) || team.phase !== 'result') return false;
  if (team.turns >= turnInfo(game, team).total) team.phase = 'done';
  else { team.phase = 'question'; team.question = nextQuestion(game, team); team.aim = 0; team.power = 35; team.challenge = challengeForTurn(team.turns); team.feedback = ''; team.attempts = 0; team.pins = []; }
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

export function practiceReport(game) {
  return { version: 1, title: 'Team Bowling practice report', attribution: 'Anonymous group practice. Team/player numbers do not verify individual student identity. This is shared practice, not a verified individual assessment.', delivery: 'Not sent to a teacher. Exported locally for manual sharing.', startedAt: game.startedAt, exportedAt: new Date().toISOString(), track: game.settings.track, complete: isComplete(game), settings: { ...game.settings }, scores: game.teams.map(t=>({team:t.id+1,name:TEAM_NAMES[t.id],score:t.score,rolls:t.turns})), attempts: game.attempts.map(a=>({...a,options:[...a.options]})), outcomes: game.outcomes.map(o=>({...o})) };
}
