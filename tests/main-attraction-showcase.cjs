const assert = require("node:assert/strict");
const G = require("../assets/main-attraction/showcase-core.js");

function assertFloorRoute(room, start, end) {
  const route = G.route(room, start, end);
  assert.deepEqual(route.at(-1), end, room.name + " destination should be reachable");
  let from = start;
  for (const to of route) {
    const distance = G.distance(room, from, to);
    for (let amount = 0; amount < distance; amount += 0.45) {
      assert(G.canWalk(room, G.approach(room, from, to, amount)));
    }
    from = to;
  }
}

for (const room of Object.values(G.ROOMS)) {
  const points = [room.spawn, ...Object.values(room.stops).map(stop => stop.point)];
  for (const from of points) {
    for (const to of points) assertFloorRoute(room, from, to);
  }
}
const floor = G.ROOMS.salon;
assertFloorRoute(floor, G.RETURN_FROM_SUPPLY, floor.stops.nails.point);
assert.equal(G.canWalk(floor, [38, 67]), false, "the sofa is not walkable");
assert.deepEqual(G.route(floor, floor.spawn, [38, 67]), []);
assert.deepEqual(G.step(floor, [52, 49.6], 0, -6), [52, 49.6], "the desk blocks forward movement");
assert(G.step(floor, floor.spawn, 0, -3)[1] < floor.spawn[1], "keyboard motion follows the floor");

function makeItem(state, chain, rank, count = 1) {
  const desired = chain + rank;
  let moves = 0;
  while (state.board.filter(id => id === desired).length < count) {
    assert(++moves < 20, "merge board can make " + desired);
    if (rank === 1) {
      if (!state.energy) state.energy = G.energyLimit(state);
      assert(G.dispense(state, chain).length);
    } else {
      makeItem(state, chain, rank - 1, 2);
      const lower = chain + (rank - 1);
      const from = state.board.indexOf(lower);
      const to = state.board.indexOf(lower, from + 1);
      assert.equal(G.combine(state.board, from, to)?.id, desired);
    }
  }
}

function resolveChallenge(state) {
  if (!G.pendingReply(state)) return;
  const client = G.APPOINTMENTS[state.chapter];
  if (state.chapter === 0) {
    assert.equal(G.advance(state), false);
    assert.equal(G.reply(state, 0)?.correct, false);
    assert.equal(G.reply(state, 0), null, "a retry is recorded once");
  }
  assert.equal(G.reply(state, client.correct)?.correct, true);
  assert.equal(G.reply(state, client.correct), null);
}

let state = G.initialState();
const expected = ["desk", "color", "nails", "desk"];
for (const [index, client] of G.APPOINTMENTS.entries()) {
  assert.equal(state.chapter, index);
  assert.equal(G.workStation(state), expected[0]);
  resolveChallenge(state);
  assert(G.advance(state));
  assert.equal(G.workStation(state), expected[1]);
  resolveChallenge(state);
  assert.equal(G.advance(state), false, "the color bar requires supplies");
  for (const id of client.needs) {
    const item = G.ITEMS[id];
    makeItem(state, item.chain, item.rank);
  }
  assert(G.advance(state));
  assert.equal(G.workStation(state), expected[2]);
  resolveChallenge(state);
  assert(G.chooseLook(state, 2));
  assert.equal(G.advance(state), false, "all nails must be painted");
  for (let nail = 0; nail < G.NAILS; nail += 1) {
    assert(G.paint(state, nail));
    assert.equal(G.paint(state, nail), false);
    if (index === 0 && nail === 1) {
      state = G.restore(JSON.stringify(state));
      assert.deepEqual(state.painted, [0, 1], "the set resumes mid-appointment");
      assert.equal(state.look, 2);
    }
  }
  resolveChallenge(state);
  assert(G.advance(state));
  assert.equal(G.workStation(state), expected[3]);
  resolveChallenge(state);
  assert(G.advance(state));
  assert.equal(state.results.length, index + 1);
  assert.equal(state.results[index].reward, client.reward);
  assert.equal(state.results[index].look, client.looks[2]);
  assert.equal(state.results[index].attempts, index === 0 ? 2 : 1);
  state = G.restore(JSON.stringify(state));
  assert.equal(state.phase, "result", "reopening after checkout resumes the receipt");
  assert(G.advance(state));
}

assert.equal(state.phase, "complete");
assert.equal(state.cash, G.APPOINTMENTS.reduce((total, client) => total + client.reward, 0));
assert.equal(G.workStation(state), undefined);
assert.equal(G.advance(state), false);
assert(G.buyUpgrade(state, "cart"));
assert.equal(G.energyLimit(state), 18);
assert.equal(G.buyUpgrade(state, "cart"), false);
assert(G.buyUpgrade(state, "wall"));
assert(G.buyUpgrade(state, "booth"));
assert.deepEqual(G.restore(JSON.stringify(state)).upgrades, ["cart", "wall", "booth"]);
console.log("Salon floor routes, all six showcase appointments, save/resume and repeat-safe checkout passed.");
