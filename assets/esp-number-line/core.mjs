// Anonymous, shared-classroom state. No names, profiles, scores, or network requests.
export const CLASS_TURNS = 32;
export const LEVELS = Object.freeze([
  {id: 1, name: 'Level 1', label: 'Addition · 1–10', max: 10, operation: '+'},
  {id: 2, name: 'Level 2', label: 'Subtraction · 1–10', max: 10, operation: '−'},
  {id: 3, name: 'Level 3', label: 'Mixed · 1–10', max: 10, operation: 'mixed'},
  {id: 4, name: 'Level 4', label: 'Mixed · 1–20', max: 20, operation: 'mixed'}
].map(Object.freeze));
export function bankFor(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) throw new RangeError('Unknown level');
  const out = [];
  for (let a = 1; a < level.max; a++) for (let b = 1; b <= Math.min(level.max - a, level.max === 20 ? 8 : 9); b++) {
    if (level.operation !== '−') out.push(Object.freeze({id: `${a}+${b}`, a, b, op: '+', answer: a + b}));
    if (level.operation !== '+') out.push(Object.freeze({id: `${a + b}-${b}`, a: a + b, b, op: '−', answer: a}));
  }
  return Object.freeze(out);
}
export const BANKS = Object.freeze(Object.fromEntries(LEVELS.map(l => [l.id, bankFor(l.id)])));
export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function makeDeck(levelId, random = Math.random, previous = null) {
  const bank = BANKS[levelId];
  const add = shuffle(bank.filter(p => p.op === '+'), random), subtract = shuffle(bank.filter(p => p.op === '−'), random);
  let cards;
  if (!add.length || !subtract.length) cards = add.length ? add : subtract;
  else { const first = random() < .5 ? add : subtract, second = first === add ? subtract : add; cards = first.flatMap((p, i) => [p, second[i]]); }
  if (cards[0].id === previous) { const swap = cards.length > 2 ? 2 : 1; [cards[0], cards[swap]] = [cards[swap], cards[0]]; }
  return cards.map(p => p.id);
}
export function choicesFor(problem, max, random = Math.random) {
  const near = [problem.answer - 1, problem.answer + 1, problem.answer - 2, problem.answer + 2].filter(n => n >= 1 && n <= max);
  return shuffle([problem.answer, ...shuffle(near, random).slice(0, 2)], random);
}
export function hopPath(problem) { return Array.from({length: problem.b + 1}, (_, i) => problem.a + i * (problem.op === '+' ? 1 : -1)); }
export class Classroom {
  constructor(random = Math.random, saved = null) {
    this.random = random; this.level = 1; this.pools = {};
    if (Classroom.valid(saved)) { this.level = saved.level; this.pools = structuredClone(saved.pools); }
    else this.setLevel(1);
  }
  get config() { return LEVELS[this.level - 1]; }
  get state() { return this.pools[this.level]; }
  get problem() { return BANKS[this.level].find(p => p.id === this.state.deck[this.state.cursor]); }
  get options() { return this.state.options; }
  get solved() { return this.state.solved; }
  get completed() { return Object.values(this.pools).reduce((n, s) => n + s.completed, 0); }
  get turn() { return this.completed + (this.solved ? 0 : 1); }
  setLevel(level) {
    if (!LEVELS.some(l => l.id === level)) return false;
    this.level = level;
    if (!this.pools[level]) {
      this.pools[level] = {deck: makeDeck(level, this.random), cursor: 0, cycle: 1, completed: 0, solved: false, options: []};
      this.state.options = choicesFor(this.problem, this.config.max, this.random);
    }
    return true;
  }
  choose(value) {
    if (this.solved || !this.options.includes(value)) return null;
    if (value !== this.problem.answer) return false;
    this.state.solved = true; this.state.completed++; return true;
  }
  next() {
    if (!this.solved) return false;
    const previous = this.problem.id, s = this.state; s.cursor++;
    if (s.cursor === s.deck.length) { s.deck = makeDeck(this.level, this.random, previous); s.cursor = 0; s.cycle++; }
    s.solved = false; s.options = choicesFor(this.problem, this.config.max, this.random); return true;
  }
  snapshot() { return structuredClone({v: 2, level: this.level, pools: this.pools}); }
  static valid(saved) {
    if (!saved || saved.v !== 2 || !LEVELS.some(l => l.id === saved.level) || !saved.pools || !saved.pools[saved.level] || Object.keys(saved.pools).length > 4) return false;
    return Object.entries(saved.pools).every(([id, s]) => {
      const bank = BANKS[id], level = LEVELS.find(l => l.id === Number(id));
      if (!bank || !s || !Array.isArray(s.deck) || s.deck.length !== bank.length || new Set(s.deck).size !== bank.length || !s.deck.every(key => bank.some(p => p.id === key)) ||
        !Number.isInteger(s.cursor) || s.cursor < 0 || s.cursor >= bank.length || !Number.isInteger(s.cycle) || s.cycle < 1 || !Number.isSafeInteger(s.completed) || typeof s.solved !== 'boolean' ||
        !Array.isArray(s.options) || s.options.length !== 3 || new Set(s.options).size !== 3 || !s.options.every(n => Number.isInteger(n) && n >= 1 && n <= level.max)) return false;
      return s.completed === (s.cycle - 1) * bank.length + s.cursor + Number(s.solved) && s.options.includes(bank.find(p => p.id === s.deck[s.cursor]).answer);
    });
  }
}
