(function (global) {
  "use strict";

  const COLUMNS = 5;
  const SLOTS = 20;
  const NAILS = 5;
  const CHAINS = {
    tool: { label: "Tools", emoji: "🧰", items: ["Nail file", "File pack", "Prep kit", "Manicure kit"] },
    color: { label: "Polish", emoji: "💅", items: ["Pink polish", "Color duo", "Polish set", "Custom colors"] },
    art: { label: "Nail art", emoji: "✨", items: ["Nail decals", "Art kit", "Gem tray", "Signature set"] }
  };
  const ITEMS = Object.fromEntries(Object.entries(CHAINS).flatMap(([chain, group]) =>
    group.items.map((name, index) => [
      chain + (index + 1),
      { name, chain, rank: index + 1, emoji: group.emoji }
    ])
  ));
  const LOOKS = {
    rose: ["Rose Gloss", "#e380ac", "#ffcfeb", "#a84c82", "gloss"],
    french: ["Soft French", "#d39a93", "#fff8e7", "#b37278", "french"],
    lilac: ["Lilac Shine", "#a47bd4", "#ecd5ff", "#7448ad", "stars"],
    mint: ["Mint Tips", "#94c5b7", "#def7e9", "#438e7e", "french"],
    pearl: ["Pearl Nude", "#ce9d89", "#fbecdd", "#a56b5d", "gloss"],
    sand: ["Warm Ombre", "#d8a587", "#ffe8ca", "#9b603f", "ombre"],
    berry: ["Berry Glaze", "#9c3863", "#e1a6cc", "#591c48", "dot"],
    cream: ["Cream & Gold", "#d3ac88", "#ffedd0", "#8d5d51", "stripe"],
    red: ["Cherry Gloss", "#c73257", "#fca0b1", "#7e1a36", "gloss"],
    plum: ["Plum Velvet", "#814d91", "#e0b7eb", "#4b285e", "ombre"],
    lush: ["Emerald Cut", "#328b70", "#b6e9c9", "#174d43", "stripe"],
    disco: ["Midnight Sparkle", "#3e5085", "#a9bce9", "#263056", "stars"],
    velvet: ["Cherry Cola Chrome", "#a82d59", "#ffbacd", "#4b0e29", "chrome"],
    ice: ["Icy Blue Chrome", "#6b9fc1", "#edfbff", "#294369", "chrome"],
    mocha: ["Mocha French", "#a97464", "#5f3023", "#bc8a7e", "french"],
    aura: ["Blackberry Aura", "#884d9e", "#e8bef1", "#3c1645", "ombre"],
    champagne: ["Champagne Chrome", "#bd9166", "#fff3d2", "#655053", "chrome"],
    cat: ["After Dark Cat Eye", "#784177", "#fbc0e8", "#211729", "cat-eye"]
  };
  const APPOINTMENTS = [
    {
      name: "Nia", challenge: "checkin", title: "Double Booked", occasion: "Homecoming week", bg: "#f7dce7", reward: 32,
      story: "The Main Attraction has one week to land a spot at the school style showcase. Two clients just pulled up with screenshots of the same 3:30 booking.",
      message: "The photo group leaves at four. Please tell me my slot is still good.", reply: "The later slot works. Text me if anything changes.",
      needs: ["tool2", "color2"], looks: ["rose", "french", "velvet"], skill: "Scheduling and communication",
      situation: "Nia and another customer both have a 3:30 appointment. The second nail tech is running 15 minutes late. What do you say first?",
      options: [
        "I can squeeze you both in. Give me five minutes.",
        "We had a booking mix-up. I can give you the actual wait and two options.",
        "Can one of you trade with the other? I’ll let you two sort it out."
      ],
      correct: 1,
      coaching: [
        "A realistic wait time helps both customers make a plan.",
        "",
        "Give both customers a choice based on the time you actually have."
      ],
      success: "Nia picks a time that works. You update the schedule and the salon gets back on track."
    },
    {
      name: "Riley", challenge: "style", title: "Behind the Camera", occasion: "Showcase promo shoot", bg: "#ecdef5", reward: 44,
      story: "The media club is filming the salon’s promo. The camera is rolling, but the last client’s disposable file is still on your station.",
      message: "The camera crew only has ten minutes. Should we start filming the close-up?", reply: "Good call pausing. We can film the color reveal first.",
      needs: ["tool3", "art2"], looks: ["lilac", "mint", "ice"], skill: "Sanitation and safety",
      situation: "The file on the station belongs to the last appointment. What will you do before you start Riley’s service?",
      options: [
        "Discard the file, follow the salon’s cleaning steps, and get a fresh file.",
        "Brush the dust off the old file and use it on Riley.",
        "Turn the file over and use the side that looks clean."
      ],
      correct: 0,
      coaching: [
        "",
        "A disposable file is for one customer. Start with a clean station and a fresh file.",
        "Both sides can be contaminated. Put the used file in the trash and get a fresh one."
      ],
      success: "Your station is ready for Riley, and her photo look is finished with a fresh set of supplies."
    },
    {
      name: "Imani", challenge: "style", title: "The Glitter Mix-Up", occasion: "First job interview", bg: "#d9f0e8", reward: 55,
      story: "The media club posts a poll about Imani’s nails for the showcase feed. Glitter wins, but Imani has her first job interview tomorrow.",
      message: "My friends keep voting for glitter. I kind of wanted neutral. Can I still pick?", reply: "Yeah, that’s what I meant. Let’s go with my pick.",
      needs: ["color3", "art3"], looks: ["pearl", "sand", "mocha"], skill: "Active listening and self-advocacy",
      situation: "Imani asked for a simple look. Her friend says to use glitter. Who should confirm the design?",
      options: [
        "Let the friend choose because she came along.",
        "Choose the trendiest look and surprise them.",
        "Ask Imani what she wants and repeat it back to confirm."
      ],
      correct: 2,
      coaching: [
        "Imani is the customer. Give her the chance to choose the design.",
        "Checking with Imani gives her a say before you start."
      ],
      success: "Imani sees the sample, confirms her choice, and leaves with the look she wanted."
    },
    {
      name: "Samira", challenge: "merge", title: "One Kit Left", occasion: "Backstage call", bg: "#f5dfcf", reward: 63,
      story: "Your salon has been shortlisted. The stylist next to you grabs the last kit as Samira comes in for her stage look.",
      message: "They moved our rehearsal up. I can stay until 4:15.", reply: "Perfect. I can still make my backstage call.",
      needs: ["tool3", "color3", "art2"], looks: ["berry", "cream", "aura"], skill: "Teamwork and problem-solving",
      situation: "You and a coworker both need the last prep kit. How can you keep both appointments moving?",
      options: [
        "Take the kit now and let the coworker figure it out.",
        "Tell your coworker what you need and check backup supplies together.",
        "Tell Samira the salon is out of supplies and send her home."
      ],
      correct: 1,
      coaching: [
        "Sharing the supply problem gives both coworkers a chance to find a solution.",
        "",
        "Check the backup supplies and speak with the team before changing the appointment."
      ],
      success: "You find backup supplies with your coworker. Both stations can serve their customers."
    },
    {
      name: "Zoé", challenge: "checkout", title: "Checkout Under Pressure", occasion: "Showcase rehearsal", bg: "#e7def7", reward: 74,
      story: "The salon is running a $32 special before rehearsal. The card reader freezes, and a line forms behind Zoé.",
      message: "I have two twenties. My ride is outside, so cash is cool if that’s faster.", reply: "Thanks for counting it back. I’ll see you at the showcase.",
      needs: ["color4", "art3", "tool2"], looks: ["red", "plum", "champagne"], skill: "Counting change",
      situation: "The service costs $32. Zoé pays $40 in cash. How much change should you count back?",
      options: ["$6", "$12", "$8"],
      correct: 2,
      coaching: [
        "Count up from $32 to $40. Add $3 to reach $35, then $5 more.",
        "Count up from $32 to $40. Add $3 to reach $35, then $5 more."
      ],
      success: "You count back $8 and hand Zoé her receipt."
    },
    {
      name: "Avery", challenge: "reveal", title: "Spotlight Night", occasion: "Style showcase finale", bg: "#dcecf5", reward: 95,
      story: "You got the showcase spot. Avery steps under the stage lights, and the salon’s signature color reads completely different on camera.",
      message: "The color looked good inside. Onstage it’s reading way brighter. Can we fix it before the reveal?", reply: "That reads so much better under the lights. I’m ready.",
      needs: ["tool4", "color3", "art4"], looks: ["lush", "disco", "cat"], skill: "Resolving a customer concern",
      situation: "Avery says the shade looks different under the lights. What is the best way to handle the concern?",
      options: [
        "Listen, confirm the color Avery wants, and explain the fix you can offer.",
        "Tell Avery the shade looks right to you and move on to checkout.",
        "Promise a completely new design immediately, even if there isn’t time."
      ],
      correct: 0,
      coaching: [
        "",
        "Ask what Avery wants changed so you can offer a specific solution.",
        "A realistic option helps Avery choose something that fits the time available."
      ],
      success: "Avery approves the new sample. The Main Attraction is ready for its showcase debut."
    }
  ];
  const UPGRADES = {
    wall: { name: "Polish wall", cost: 45, icon: "color4", effect: "The polish drawer adds two bottles when two spaces are open." },
    cart: { name: "Rolling supply cart", cost: 70, icon: "tool4", effect: "Hold 18 energy instead of 12. The extra energy is ready as soon as you buy it." },
    booth: { name: "Style photo booth", cost: 100, icon: "art4", effect: "Earn an extra $15 on every appointment you finish after buying it." }
  };

  // The floors and station positions are measured against the original salon artwork.
  const ROOMS = {
    salon: {
      name: "Salon floor", art: "salon.webp", aspect: 1.5, spawn: [52, 90],
      floor: [
        [[17, 80], [74, 77], [77, 96], [17, 96]],
        [[46, 48], [65.5, 48], [75, 81], [44.5, 81]],
        [[61.8, 36.8], [64.7, 36.8], [66.5, 52], [60.1, 52]],
        [[64.1, 47.7], [71.5, 47.7], [72.4, 58], [64.1, 58]]
      ],
      turns: [[56, 80], [55, 63], [53, 50], [63, 48], [65, 53], [69, 55]],
      stops: {
        desk: { name: "Front desk", point: [52, 49.6], label: [40, 34] },
        supplyDoor: { name: "Color room", point: [63.2, 39.8], label: [65, 22] },
        nails: { name: "Nail table", point: [68.7, 52.5], label: [82, 38] },
        lounge: { name: "Lounge", point: [40.5, 83.5], label: [23, 59] }
      }
    },
    supply: {
      name: "Supply & Color Room", art: "supply.webp", aspect: 16 / 9, spawn: [58, 93],
      floor: [[[37, 77], [64, 77], [72, 96], [29, 96]]],
      turns: [],
      stops: {
        color: { name: "Color bar", point: [44, 80.5], label: [32, 62] },
        exit: { name: "Salon floor", point: [60.8, 94], label: [80, 86] }
      }
    }
  };
  const RETURN_FROM_SUPPLY = [63.2, 44.7];
  const PHASES = ["checkin", "merge", "style", "checkout", "result", "complete"];
  const STARTING_ITEMS = {0: "tool1", 1: "tool1", 3: "color1", 4: "color1", 6: "art1", 8: "tool1", 10: "color1", 12: "art1"};

  function initialState() {
    const board = Array(SLOTS).fill(null);
    Object.assign(board, STARTING_ITEMS);
    return {
      version: 1, chapter: 0, phase: "checkin", board, energy: 12, cash: 0,
      look: 0, painted: [], tried: [], workplaceReady: false, results: [], upgrades: [], sound: false
    };
  }

  function restore(raw) {
    const fresh = initialState();
    let saved;
    try { saved = JSON.parse(raw); } catch { return fresh; }
    if (!saved || saved.version !== fresh.version || !Number.isInteger(saved.chapter) ||
        !APPOINTMENTS[saved.chapter] || !PHASES.includes(saved.phase) ||
        !Array.isArray(saved.board) || saved.board.length !== SLOTS ||
        !saved.board.every(id => id === null || Object.hasOwn(ITEMS, id))) return fresh;

    const results = Array.isArray(saved.results)
      ? saved.results.filter((entry, index) => entry && entry.chapter === index &&
          APPOINTMENTS[index]?.looks.includes(entry.look) && Number.isInteger(entry.attempts) &&
          entry.attempts >= 1 && entry.attempts <= 3 && Number.isInteger(entry.reward) && entry.reward >= 0)
      : [];
    const isPaid = saved.phase === "result" || saved.phase === "complete";
    if (results.length !== saved.chapter + Number(isPaid) ||
        (saved.phase === "complete" && results.length !== APPOINTMENTS.length)) return fresh;

    const integers = (list, limit) => Array.isArray(list)
      ? [...new Set(list.filter(i => Number.isInteger(i) && i >= 0 && i < limit))] : [];
    const appointment = APPOINTMENTS[saved.chapter];
    const upgrades = Array.isArray(saved.upgrades)
      ? [...new Set(saved.upgrades.filter(id => typeof id === "string" && Object.hasOwn(UPGRADES, id)))] : [];
    const energyLimit = upgrades.includes("cart") ? 18 : 12;
    return {
      ...fresh, chapter: saved.chapter, phase: saved.phase, board: saved.board, results, upgrades,
      look: Number.isInteger(saved.look) && appointment.looks[saved.look] ? saved.look : 0,
      painted: integers(saved.painted, NAILS),
      tried: integers(saved.tried, 3).filter(index => index !== appointment.correct),
      workplaceReady: saved.workplaceReady === true,
      energy: Number.isInteger(saved.energy) ? Math.max(0, Math.min(energyLimit, saved.energy)) : energyLimit,
      cash: Number.isInteger(saved.cash) ? Math.max(0, saved.cash) : 0,
      sound: saved.sound === true
    };
  }

  function workStation(state) {
    return {checkin: "desk", merge: "color", style: "nails", checkout: "desk", result: "desk"}[state.phase];
  }

  function pendingReply(state) {
    if (state.workplaceReady) return false;
    const current = APPOINTMENTS[state.chapter].challenge;
    return current === state.phase || (current === "reveal" && state.phase === "style" && state.painted.length === NAILS);
  }

  function reply(state, index) {
    if (!pendingReply(state) || ![0, 1, 2].includes(index) || state.tried.includes(index)) return null;
    const client = APPOINTMENTS[state.chapter];
    if (index === client.correct) {
      state.workplaceReady = true;
      return { correct: true };
    }
    state.tried.push(index);
    return { correct: false, feedback: client.coaching[index] };
  }

  function missingItems(state) {
    return APPOINTMENTS[state.chapter].needs.filter(id => !state.board.includes(id));
  }

  function energyLimit(state) {
    return state.upgrades.includes("cart") ? 18 : 12;
  }

  function price(state) {
    return APPOINTMENTS[state.chapter].reward + (state.upgrades.includes("booth") ? 15 : 0);
  }

  function advance(state) {
    if (pendingReply(state)) return false;
    switch (state.phase) {
      case "checkin":
        state.phase = "merge";
        break;
      case "merge":
        if (missingItems(state).length) return false;
        for (const id of APPOINTMENTS[state.chapter].needs) {
          state.board[state.board.indexOf(id)] = null;
        }
        state.phase = "style";
        break;
      case "style":
        if (state.painted.length !== NAILS) return false;
        state.phase = "checkout";
        break;
      case "checkout": {
        if (!state.workplaceReady || state.results.length !== state.chapter) return false;
        const reward = price(state);
        state.results.push({
          chapter: state.chapter, reward, look: APPOINTMENTS[state.chapter].looks[state.look],
          attempts: state.tried.length + 1
        });
        state.cash += reward;
        state.energy = Math.min(energyLimit(state), state.energy + 5);
        state.phase = "result";
        break;
      }
      case "result":
        if (state.results.length === APPOINTMENTS.length) {
          state.phase = "complete";
        } else {
          state.chapter += 1;
          state.phase = "checkin";
          state.look = 0;
          state.painted = [];
          state.tried = [];
          state.workplaceReady = false;
        }
        break;
      default:
        return false;
    }
    return true;
  }

  function chooseLook(state, index) {
    if (state.phase !== "style" || !Number.isInteger(index) ||
        !APPOINTMENTS[state.chapter].looks[index] || state.look === index) return false;
    state.look = index;
    state.painted = [];
    return true;
  }

  function paint(state, index) {
    if (state.phase !== "style" || pendingReply(state) || !Number.isInteger(index) ||
        index < 0 || index >= NAILS || state.painted.includes(index)) return false;
    state.painted.push(index);
    return true;
  }

  function nextItem(id) {
    const item = ITEMS[id];
    return item && item.rank < 4 ? item.chain + (item.rank + 1) : null;
  }

  function combine(board, from, to) {
    if (from === to || !Number.isInteger(to) || to < 0 || to >= board.length || !board[from]) return null;
    const source = board[from];
    const target = board[to];
    const upgrade = nextItem(source);
    if (target && (target !== source || !upgrade)) return null;
    board[from] = null;
    board[to] = target ? upgrade : source;
    return { id: board[to], merged: Boolean(target) };
  }

  function dispense(state, chain) {
    if (state.phase !== "merge" || pendingReply(state) || !Object.hasOwn(CHAINS, chain) || state.energy < 1) return [];
    const count = chain === "color" && state.upgrades.includes("wall") ? 2 : 1;
    const positions = [];
    for (let index = 0; index < state.board.length && positions.length < count; index += 1) {
      if (state.board[index] === null) {
        state.board[index] = chain + "1";
        positions.push(index);
      }
    }
    if (positions.length) state.energy -= 1;
    return positions;
  }

  function hintPair(state) {
    for (const id of missingItems(state)) {
      const needed = ITEMS[id];
      for (let rank = needed.rank - 1; rank > 0; rank -= 1) {
        const pair = state.board.flatMap((item, index) => item === needed.chain + rank ? [index] : []);
        if (pair.length >= 2) return pair.slice(0, 2);
      }
    }
    return [];
  }

  function buyUpgrade(state, id) {
    const upgrade = Object.hasOwn(UPGRADES, id) && UPGRADES[id];
    if (!upgrade || state.cash < upgrade.cost || state.upgrades.includes(id)) return false;
    state.cash -= upgrade.cost;
    state.upgrades.push(id);
    if (id === "cart") state.energy = Math.min(energyLimit(state), state.energy + 6);
    return true;
  }

  function inside(polygon, point) {
    const [x, y] = point;
    let winding = 0;
    for (let i = 0; i < polygon.length; i += 1) {
      const [ax, ay] = polygon[i];
      const [bx, by] = polygon[(i + 1) % polygon.length];
      const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      if (Math.abs(cross) < 1e-7) continue;
      const sign = Math.sign(cross);
      if (winding && sign !== winding) return false;
      winding = sign;
    }
    return true;
  }

  function canWalk(room, point) {
    return point.every(Number.isFinite) && room.floor.some(polygon => inside(polygon, point));
  }

  function distance(room, a, b) {
    return Math.hypot(a[0] - b[0], (a[1] - b[1]) / room.aspect);
  }

  // Clip the movement segment to each convex patch of floor. The union has to
  // cover the entire path, including any narrow gap between adjoining patches.
  function floorSpan(polygon, from, to) {
    let first = 0;
    let last = 1;
    for (let i = 0; i < polygon.length; i += 1) {
      const [ax, ay] = polygon[i];
      const [bx, by] = polygon[(i + 1) % polygon.length];
      const cross = ([x, y]) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      const start = cross(from);
      const change = cross(to) - start;
      if (Math.abs(change) < 1e-7) {
        if (start < -1e-7) return null;
        continue;
      }
      const edge = -start / change;
      if (change > 0) first = Math.max(first, edge);
      else last = Math.min(last, edge);
      if (first > last + 1e-7) return null;
    }
    return [first, last];
  }

  function clearLine(room, from, to) {
    const spans = room.floor.map(polygon => floorSpan(polygon, from, to)).filter(Boolean).sort((a, b) => a[0] - b[0]);
    let covered = 0;
    for (const [start, end] of spans) {
      if (start > covered + 1e-7) return false;
      covered = Math.max(covered, end);
      if (covered >= 1 - 1e-7) return true;
    }
    return false;
  }

  function step(room, from, dx, dy) {
    const [x, y] = from;
    for (const target of [[x + dx, y + dy], [x + dx, y], [x, y + dy]]) {
      if (clearLine(room, from, target)) return target;
    }
    return from;
  }

  function approach(room, from, to, length) {
    const remaining = distance(room, from, to);
    if (remaining <= length) return to;
    const ratio = length / remaining;
    return [from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio];
  }

  function route(room, from, to) {
    if (!canWalk(room, from) || !canWalk(room, to)) return [];
    if (clearLine(room, from, to)) return [to];
    const points = [from, ...room.turns, to];
    const best = points.map((_, index) => index === 0 ? 0 : Infinity);
    const parent = points.map(() => -1);
    const open = new Set(points.keys());
    const destination = points.length - 1;

    // Each connection stays on the floor, including the bend by the pink sofa.
    while (open.size) {
      const nearest = [...open].reduce((a, b) => best[a] < best[b] ? a : b);
      if (best[nearest] === Infinity) break;
      if (nearest === destination) {
        const path = [];
        for (let i = nearest; i > 0; i = parent[i]) path.unshift(points[i]);
        return path;
      }
      open.delete(nearest);
      for (const candidate of open) {
        const score = best[nearest] + distance(room, points[nearest], points[candidate]);
        if (score < best[candidate] && clearLine(room, points[nearest], points[candidate])) {
          best[candidate] = score;
          parent[candidate] = nearest;
        }
      }
    }
    return [];
  }

  const api = {
    APPOINTMENTS, CHAINS, ITEMS, LOOKS, UPGRADES, ROOMS, RETURN_FROM_SUPPLY, COLUMNS, NAILS,
    initialState, restore, workStation, pendingReply, reply, advance, missingItems, energyLimit, price,
    chooseLook, paint, nextItem, combine, dispense, hintPair, buyUpgrade,
    canWalk, distance, step, approach, route
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.MAShowcase = api;
})(globalThis);
