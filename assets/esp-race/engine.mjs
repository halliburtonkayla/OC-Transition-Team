/** Pure, deterministic race model. No DOM, storage, network, or student records. */
export const RACERS = [
  {name: 'Coral', color: '#f0644f', light: '#ffb5a0', dark: '#9e303c', shape: '●'},
  {name: 'Blue', color: '#3d9ee3', light: '#a4defd', dark: '#215f97', shape: '◆'},
  {name: 'Gold', color: '#ffc044', light: '#ffe8a1', dark: '#a36116', shape: '★'},
  {name: 'Violet', color: '#a48af1', light: '#dfd2ff', dark: '#62469e', shape: '▲'},
];
export const TRACK_LENGTH = 1200;
export const EMPTY_INPUT = Object.freeze({up: false, down: false, left: false, right: false});
export const course = Array.from({length: 16}, (_, i) => ({
  z: 110 + i * 65,
  lane: [-0.55, 0, 0.55, 0, -0.55, 0.55][i % 6],
  type: i % 3 === 2 ? 'cone' : 'star',
}));
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function createRace({players = 2, turns = false, cruise = true} = {}) {
  const count = [1, 2, 4].includes(players) ? players : 2;
  return {
    phase: 'ready', previousPhase: 'ready', countdown: 3, turns: Boolean(turns), cruise: Boolean(cruise),
    active: 0, racers: RACERS.slice(0, count).map((style, id) => ({
      ...style, id, z: 0, x: 0, speed: 0, time: 0, finishTime: null, stars: 0,
      bumps: 0, bumpTime: 0, found: [],
    })),
  };
}
export function begin(state) {
  if (state.phase !== 'ready') return;
  state.phase = 'countdown'; state.countdown = 3;
}
export function nextTurn(state) {
  if (state.phase !== 'turn-complete') return;
  state.active += 1; state.phase = 'countdown'; state.countdown = 3;
}
export function pause(state) {
  if (!['racing', 'countdown'].includes(state.phase)) return;
  state.previousPhase = state.phase; state.phase = 'paused';
}
export function resume(state) {
  if (state.phase === 'paused') state.phase = state.previousPhase;
}
export function activeRacers(state) {
  return state.turns ? [state.racers[state.active]] : state.racers;
}
export function step(state, inputs, seconds) {
  const dt = clamp(Number.isFinite(seconds) ? seconds : 0, 0, 0.05);
  if (state.phase === 'countdown') {
    state.countdown = Math.max(0, state.countdown - dt);
    if (state.countdown <= 0) state.phase = 'racing';
    return;
  }
  if (state.phase !== 'racing') return;
  for (const car of activeRacers(state)) {
    if (car.finishTime !== null) continue;
    const input = inputs[car.id] || EMPTY_INPUT;
    car.time += dt;
    car.bumpTime = Math.max(0, car.bumpTime - dt);
    const target = input.down ? 8 : input.up ? 43 : state.cruise ? 31 : 0;
    const traction = Math.abs(car.x) > 0.88 ? 0.57 : 1;
    const desired = target * traction * (car.bumpTime > 0 ? 0.46 : 1);
    car.speed += (desired - car.speed) * Math.min(1, dt * 3);
    // World-space steering remains consistent in every viewport. No collision with other children.
    car.x = clamp(car.x + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * dt * 0.88, -1.08, 1.08);
    const before = car.z;
    car.z = Math.min(TRACK_LENGTH, car.z + car.speed * dt);
    course.forEach((item, index) => {
      if (item.z > before && item.z <= car.z && !car.found.includes(index) && Math.abs(car.x - item.lane) < 0.24) {
        car.found.push(index);
        if (item.type === 'star') car.stars += 1;
        else { car.bumps += 1; car.bumpTime = 0.8; }
      }
    });
    if (car.z >= TRACK_LENGTH) {
      // Sub-frame interpolation keeps finishing order independent of array order.
      car.finishTime = car.time - (car.speed > 0 ? Math.max(0, before + car.speed * dt - TRACK_LENGTH) / car.speed : 0);
      car.speed = 0;
    }
  }
  if (activeRacers(state).every(car => car.finishTime !== null)) {
    state.phase = state.turns && state.active < state.racers.length - 1 ? 'turn-complete' : 'finished';
  }
}
export function ranking(state) {
  return [...state.racers].sort((a, b) => {
    if (a.finishTime !== null && b.finishTime !== null) return a.finishTime - b.finishTime || a.id - b.id;
    if (a.finishTime !== null) return -1;
    if (b.finishTime !== null) return 1;
    return b.z - a.z || a.id - b.id;
  });
}

/** Multiple fingers may hold the same action. Releasing one never releases another. */
export class HeldInputs {
  constructor() { this.sources = new Map(); }
  press(source, player, action) {
    if (Number.isInteger(player) && player >= 0 && player < 4 && Object.hasOwn(EMPTY_INPUT, action)) this.sources.set(source, {player, action});
  }
  release(source) { this.sources.delete(source); }
  clear() { this.sources.clear(); }
  read() {
    const inputs = Array.from({length: 4}, () => ({...EMPTY_INPUT}));
    for (const {player, action} of this.sources.values()) inputs[player][action] = true;
    return inputs;
  }
}
