(() => {
  "use strict";

  const root = document.getElementById("ma-showcase");
  const G = window.MAShowcase;
  if (!root || !G) return;

  const find = selector => root.querySelector(selector);
  const world = find("#shift-world");
  const roomArt = find("#shift-room-art");
  const salonImage = roomArt.getAttribute("src");
  const markers = find("#shift-markers");
  const actor = find("#shift-actor");
  const side = find("#shift-side");
  const notebook = find("#shift-notebook");
  const notebookContent = find("#shift-notebook-content");
  const preview = root.dataset.preview === "true";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const directions = {
    ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0],
    ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1]
  };
  const directionsByFace = { front: 0, right: 1, back: 2, left: 3 };
  // The original Beauty Studio hand uses a 480 by 390 coordinate system.
  const nails = [[116, 172], [186, 71], [252, 39], [313, 75], [367, 143]];
  const phaseTitles = {
    checkin: "Check in at the front desk",
    merge: "Pull supplies at the color bar",
    style: "Style the nails at the nail table",
    checkout: "Take payment at the front desk",
    result: "Review the appointment"
  };
  const itemIds = Object.keys(G.ITEMS);
  const keys = new Set();
  let state = G.restore(readStorage());
  let roomId = "salon";
  let position = [...G.ROOMS.salon.spawn];
  let face = "back";
  let path = [];
  let destination = null;
  let animation = 0;
  let lastFrame = null;
  let gait = 0;
  let openStop = null;
  let selected = null;
  let dragFrom = null;
  let focusTile = 0;
  let hints = [];
  let undo = null;
  let boardMessage = "";
  let activeNotebook = null;
  let audio;
  let saveError = false;

  function readStorage() {
    try { return localStorage.getItem(saveKey()); } catch { return null; }
  }

  function saveKey() {
    const profile = preview ? "preview" : sessionStorage.getItem("ttCurrent") || localStorage.getItem("ttCurrent") || "practice";
    return "ttMainAttractionShowcase.v1:" + encodeURIComponent(profile);
  }

  function save() {
    try {
      localStorage.setItem(saveKey(), JSON.stringify(state));
      saveError = false;
    } catch { saveError = true; }
  }

  function room() { return G.ROOMS[roomId]; }
  function client() { return G.APPOINTMENTS[state.chapter]; }
  function currency(amount) { return "$" + amount; }
  function text(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function announce(message) { find("#shift-status").textContent = message; }

  function goal() {
    const station = G.workStation(state);
    if (roomId === "supply") return station === "color" ? "color" : station ? "exit" : null;
    return station === "color" ? "supplyDoor" : station;
  }

  function drawActor(moving = false) {
    const [x, y] = position;
    const depth = roomId === "supply" ? 0.8 + (y - 77) * 0.012 : 0.34 + (y - 36) * 0.012;
    const frame = moving && !reducedMotion.matches ? [1, 2, 3, 2][Math.floor(gait / 86) % 4] : 0;
    actor.style.setProperty("--actor-x", x + "%");
    actor.style.setProperty("--actor-y", y + "%");
    actor.style.setProperty("--depth", depth.toFixed(3));
    actor.style.setProperty("--frame-x", frame * (100 / 3) + "%");
    actor.style.setProperty("--frame-y", directionsByFace[face] * (100 / 3) + "%");
    for (const button of markers.querySelectorAll("button")) {
      const stop = room().stops[button.dataset.stop];
      button.dataset.near = String(G.distance(room(), position, stop.point) <= 3.2);
    }
  }

  function markGoal() {
    const currentGoal = goal();
    for (const mark of markers.querySelectorAll("[data-stop]")) {
      mark.dataset.goal = String(mark.dataset.stop === currentGoal);
    }
  }

  function drawRoom(next, at = G.ROOMS[next].spawn) {
    roomId = next;
    position = [...at];
    world.dataset.room = roomId;
    roomArt.src = roomId === "salon" ? salonImage : roomArt.dataset.supply || root.dataset.assetPath + room().art;
    roomArt.alt = roomId === "supply"
      ? "The Main Attraction's original color bar, supply cabinets and towel station"
      : "The Main Attraction's original pink salon, front desk and manicure tables";
    world.setAttribute("aria-label", "Walkable " + room().name.toLowerCase());
    find("#shift-room-name").textContent = room().name;
    markers.innerHTML = Object.entries(room().stops).map(([id, stop]) =>
      '<i aria-hidden="true" class="world-pin" data-stop="' + id + '" style="--spot-x:' + stop.point[0] +
      '%;--spot-y:' + stop.point[1] + '%"></i><button type="button" data-stop="' + id +
      '" aria-label="Walk to ' + stop.name + '" style="--pin-x:' + stop.label[0] + '%;--pin-y:' +
      stop.label[1] + '%">' + stop.name + '</button>'
    ).join("");
    drawActor();
    markGoal();
  }

  function walkTo(point, stop = null) {
    const nextPath = G.route(room(), position, point);
    if (!nextPath.length) {
      announce("Tap an open part of the floor or a station marker.");
      return;
    }
    if (openStop) leaveStation(false);
    keys.clear();
    path = nextPath;
    destination = stop;
    focusWorld();
    if (stop) announce("Walking to " + room().stops[stop].name.toLowerCase() + "…");
    requestWalk();
  }

  function requestWalk() {
    if (!animation) animation = requestAnimationFrame(tick);
  }

  function stopWalk() {
    if (animation) cancelAnimationFrame(animation);
    animation = 0;
    lastFrame = null;
    keys.clear();
    path = [];
    destination = null;
    drawActor();
  }

  function tick(now) {
    animation = 0;
    const milliseconds = lastFrame === null ? 16 : Math.min(35, now - lastFrame);
    lastFrame = now;
    const length = 27 * milliseconds / 1000;
    const previous = position;

    if (keys.size) {
      const vector = [...keys].reduce(([x, y], key) => [x + directions[key][0], y + directions[key][1]], [0, 0]);
      const magnitude = Math.hypot(...vector);
      if (magnitude) {
        position = G.step(room(), position, vector[0] * length / magnitude,
          vector[1] * length * room().aspect / magnitude);
      }
    } else if (path.length) {
      const next = path[0];
      position = G.approach(room(), position, next, length);
      if (position === next) path.shift();
    }

    const dx = position[0] - previous[0];
    const dy = position[1] - previous[1];
    const moving = Math.abs(dx) + Math.abs(dy) > 1e-6;
    if (moving) {
      gait += milliseconds;
      face = Math.abs(dx) >= Math.abs(dy / room().aspect)
        ? (dx > 0 ? "right" : "left")
        : (dy > 0 ? "front" : "back");
    }
    drawActor(moving);

    if (path.length || keys.size) {
      requestWalk();
    } else {
      lastFrame = null;
      drawActor();
      if (destination) {
        const stop = destination;
        destination = null;
        arrive(stop);
      }
    }
  }

  function nearestStop() {
    return Object.entries(room().stops).find(([, stop]) => G.distance(room(), position, stop.point) <= 3.2)?.[0];
  }

  function arrive(id) {
    const stop = room().stops[id];
    if (!stop || G.distance(room(), position, stop.point) > 3.2) {
      announce("Walk up to a station to use it.");
      return;
    }
    stopWalk();
    if (id === "supplyDoor" || id === "exit") {
      openStop = null;
      drawRoom(id === "supplyDoor" ? "supply" : "salon",
        id === "supplyDoor" ? G.ROOMS.supply.spawn : G.RETURN_FROM_SUPPLY);
      announce(id === "supplyDoor" ? "You’re in the color room." : "You’re back on the salon floor.");
      drawSide();
      world.focus({preventScroll: true});
      return;
    }
    if (id === "lounge") {
      announce(state.phase === "complete" ? "Your shift is finished. Take a seat." : client().name + " is at the salon for the showcase.");
      return;
    }
    if (id !== G.workStation(state)) {
      announce(state.phase === "complete" ? "All six appointments are complete." : "Next task: " + phaseTitles[state.phase].toLowerCase() + ".");
      return;
    }
    openStop = id;
    announce(stop.name + " is open.");
    drawSide();
    focusSide("#shift-task-title", true);
  }

  function leaveStation(focus = true) {
    openStop = null;
    selected = null;
    hints = [];
    drawSide();
    if (focus) focusWorld();
  }

  function focusWorld() {
    world.focus({preventScroll: true});
    world.scrollIntoView({block: "nearest", inline: "nearest"});
  }

  function selectStation(id) {
    const stop = room().stops[id];
    if (stop) walkTo(stop.point, id);
  }

  function chime(notes) {
    if (!state.sound) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audio ??= new Audio();
      if (audio.state === "suspended") audio.resume().catch(() => {});
      notes.forEach((tone, index) => {
        const at = audio.currentTime + index * 0.073;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.setValueAtTime(tone, at);
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.exponentialRampToValueAtTime(0.085, at + 0.013);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.15);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start(at);
        oscillator.stop(at + 0.16);
      });
    } catch { /* Sound is optional on classroom devices. */ }
  }

  function art(index) {
    return '<span class="cast-pic" aria-hidden="true" style="--art-x:' + (index % 4) * (100 / 3) +
      '%;--art-y:' + Math.floor(index / 4) * 25 + '%"></span>';
  }

  function message(name, words) {
    return '<blockquote class="client-text"><cite>' + text(name) + ' · Client text</cite>“' + text(words) + '”</blockquote>';
  }

  function clientHeading() {
    const c = client();
    return '<p class="shift-counter">Appointment ' + (state.chapter + 1) + ' of ' + G.APPOINTMENTS.length + '</p>' +
      '<div class="client-heading">' + art(12 + state.chapter) + '<div><h2>' + text(c.title) + '</h2><p>' +
      text(c.name) + ' · ' + text(c.occasion) + '</p></div></div>';
  }

  function focusSide(selector, scroll = false) {
    side.querySelector(selector)?.focus({preventScroll: !scroll});
  }

  function primary(label, action, disabled = false) {
    return '<button type="button" class="shift-primary" data-action="' + action + '"' +
      (disabled ? ' disabled' : '') + '>' + text(label) + '</button>';
  }

  function objectiveView() {
    const c = client();
    const target = room().stops[goal()];
    const story = state.phase === "checkin"
      ? '<p class="task-copy">' + text(c.story) + '</p>' + message(c.name, c.message)
      : '';
    return story + '<div class="next-task"><h3>' + text(phaseTitles[state.phase]) + '</h3>' +
      (state.phase === "merge" && roomId === "salon" ? '<p>Use the back door marked Color room.</p>' : '') +
      (target ? primary("Walk to " + target.name.toLowerCase(), "go") : '') + '</div>';
  }

  function replyView() {
    const c = client();
    const last = state.tried.at(-1);
    return '<h3 id="shift-task-title" tabindex="-1">' + text(c.skill) + '</h3>' +
      '<p class="task-copy">' + text(c.situation) + '</p><div class="shift-choices">' + c.options.map((line, index) =>
        '<button type="button" class="shift-answer" data-reply="' + index + '"' +
        (state.tried.includes(index) ? ' disabled' : '') + '>' + text(line) + '</button>'
      ).join("") + '</div>' + (last === undefined ? '' : '<p class="work-feedback" role="status">' +
        text(c.coaching[last]) + '</p>');
  }

  function orderList() {
    return '<ul class="shift-order" aria-label="Appointment supplies">' + client().needs.map(id => {
      const ready = state.board.includes(id);
      return '<li data-ready="' + ready + '"><span>' + text(G.ITEMS[id].name) + '</span><span>' +
        (ready ? "✓ Ready" : "· Lv " + G.ITEMS[id].rank) + '</span></li>';
    }).join("") + '</ul>';
  }

  function boardView() {
    const cells = state.board.map((id, index) => {
      const item = G.ITEMS[id];
      const name = item ? item.name : "Empty space";
      return '<button type="button" data-tile="' + index + '" data-chain="' + (item?.chain || "") +
        '" data-hint="' + hints.includes(index) + '" aria-pressed="' + (selected === index) +
        '" aria-label="' + text(name) + ', row ' + (Math.floor(index / G.COLUMNS) + 1) + ', column ' +
        (index % G.COLUMNS + 1) + '" tabindex="' + (index === focusTile ? 0 : -1) +
        '" draggable="' + Boolean(item) + '">' + (item ? art(itemIds.indexOf(id)) + text(name) : '<span class="empty-spot" aria-hidden="true">·</span>') + '</button>';
    }).join("");
    const supplyButtons = Object.entries(G.CHAINS).map(([id, chain]) =>
      '<button type="button" data-drawer="' + id + '">' + text(chain.label) + '</button>'
    ).join("");
    const missing = G.missingItems(state);
    return '<h3 id="shift-task-title" tabindex="-1">Color bar</h3><p class="task-copy">Tap or drag two matching supplies together.</p>' +
      orderList() + '<div class="shift-grid" role="group" aria-label="Merge board">' + cells + '</div>' +
      '<p class="shift-board-status" role="status">' + text(boardMessage || "Missing supplies can be made from matching pairs.") + '</p>' +
      '<div class="station-toolbar" aria-label="Supply drawers">' + supplyButtons + '<span>Energy ' + state.energy +
      ' / ' + G.energyLimit(state) + '</span><button type="button" data-action="refill"' +
      (state.energy < G.energyLimit(state) ? "" : " disabled") + '>Refill</button></div>' +
      '<div class="station-toolbar"><button type="button" data-action="hint">Hint</button><button type="button" data-action="recycle"' +
      (selected === null ? " disabled" : "") + '>Recycle tile</button><button type="button" data-action="undo"' +
      (undo ? "" : " disabled") + '>Undo</button></div>' + primary("Pack supplies for the nail table", "advance", missing.length > 0);
  }

  function manicure(lookId, finished = false) {
    const [name, color, light, dark, design] = G.LOOKS[lookId];
    const targets = nails.map(([x, y], index) => {
      const painted = finished || state.painted.includes(index);
      const spot = ' style="--nail-x:' + (x / 480 * 100).toFixed(2) + '%;--nail-y:' +
        (y / 390 * 100 - 1).toFixed(2) + '%;--tilt:' + (index === 0 ? -12 : 0) + 'deg" data-painted="' + painted + '"';
      const fill = '<i aria-hidden="true" class="nail-color"></i>';
      return finished ? '<span class="finished-nail"' + spot + '>' + fill + '</span>'
        : '<button type="button" aria-pressed="' + painted + '" aria-label="Paint nail ' + (index + 1) +
          '" data-paint="' + index + '"' + spot + '>' + fill + '</button>';
    }).join("");
    return '<div class="manicure" role="' + (finished ? "img" : "group") + '" aria-label="' +
      text(name) + '" data-design="' + design + '" style="--look-color:' + color + ';--look-light:' +
      light + ';--look-dark:' + dark + '">' + targets + '</div>';
  }

  function styleView() {
    const c = client();
    const finished = state.painted.length === G.NAILS;
    const choices = c.looks.map((id, index) => '<button type="button" data-look="' + index +
      '" aria-pressed="' + (index === state.look) + '"><i aria-hidden="true" style="--swatch:' +
      G.LOOKS[id][1] + '"></i>' + text(G.LOOKS[id][0]) + '</button>').join("");
    return '<h3 id="shift-task-title" tabindex="-1">Nail table</h3><div class="shade-picker" role="group" aria-label="Nail looks">' +
      choices + '</div><p class="task-copy" role="status">' + (finished ? "The set is ready." :
        "Tap each nail to paint it · " + state.painted.length + " / " + G.NAILS) + '</p>' +
      manicure(c.looks[state.look]) + primary("Head to checkout", "advance", !finished);
  }

  function checkoutView() {
    return '<h3 id="shift-task-title" tabindex="-1">Checkout</h3><dl class="checkout-summary"><dt>Practice service total</dt><dd>' +
      currency(G.price(state)) + '</dd></dl>' + primary("Complete checkout", "advance");
  }

  function resultView() {
    const record = state.results.at(-1);
    return '<h3 id="shift-task-title" tabindex="-1">Appointment complete · +' + currency(record.reward) + '</h3>' +
      '<p class="task-copy">' + text(client().success) + '</p>' + message(client().name, client().reply) +
      manicure(record.look, true) + primary(state.results.length === G.APPOINTMENTS.length ? "Finish the shift" : "Next client", "advance");
  }

  function workView() {
    if (G.pendingReply(state)) return replyView();
    switch (state.phase) {
      case "checkin":
        return '<h3 id="shift-task-title" tabindex="-1">Front desk</h3>' +
          message(client().name, client().message) + primary("Check in " + client().name, "advance");
      case "merge": return boardView();
      case "style": return styleView();
      case "checkout": return checkoutView();
      case "result": return resultView();
      default: return "";
    }
  }

  function drawSide() {
    if (state.phase === "complete") {
      side.innerHTML = '<h2>Showcase complete</h2><p class="task-copy">Six clients made it to the showcase. Your skills log is ready.</p>' +
        '<button type="button" class="shift-primary" data-notebook="log">View skills log</button>';
    } else {
      side.innerHTML = clientHeading() + (openStop === G.workStation(state)
        ? '<div class="station-task">' + workView() + '<button class="shift-return" type="button" data-action="leave">Back to the floor</button></div>'
        : objectiveView());
    }
    markGoal();
    const cash = find("#shift-cash");
    cash.textContent = currency(state.cash);
    cash.setAttribute("aria-label", currency(state.cash) + " practice cash");
  }

  function updateSide(focusSelector) {
    save();
    drawSide();
    if (focusSelector) focusSide(focusSelector);
  }

  function rememberBoard() {
    undo = { board: [...state.board], energy: state.energy };
  }

  function mergeTiles(from, to) {
    const before = { board: [...state.board], energy: state.energy };
    const change = G.combine(state.board, from, to);
    if (change) {
      undo = before;
      selected = null;
      hints = [];
      boardMessage = change.merged ? "Made " + G.ITEMS[change.id].name.toLowerCase() + "." : "Supply moved.";
      if (change.merged) chime([523, 659, 784]);
    } else {
      selected = state.board[to] ? to : null;
      boardMessage = "Match two supplies of the same type and level.";
    }
    focusTile = to;
    updateSide('[data-tile="' + to + '"]');
    if (change?.merged) side.querySelector('[data-tile="' + to + '"]')?.classList.add("station-success");
  }

  function pickTile(index) {
    focusTile = index;
    hints = [];
    if (selected !== null && selected !== index) {
      mergeTiles(selected, index);
      return;
    }
    selected = selected === index || !state.board[index] ? null : index;
    const item = selected === null ? null : state.board[selected];
    const upcoming = item && G.nextItem(item);
    boardMessage = upcoming ? "Match this to make " + G.ITEMS[upcoming].name.toLowerCase() + "."
      : item ? "This supply is already at its highest level." : "Choose a tile to start a merge.";
    drawSide();
    focusSide('[data-tile="' + index + '"]');
  }

  function dispense(chain) {
    const before = { board: [...state.board], energy: state.energy };
    const spots = G.dispense(state, chain);
    if (spots.length) {
      undo = before;
      hints = [];
      boardMessage = "Added " + (spots.length === 2 ? "two pink polish bottles." : G.ITEMS[chain + "1"].name.toLowerCase() + ".");
      chime([441]);
    } else {
      boardMessage = state.energy === 0 ? "Refill energy for free to keep playing." : "Make room by merging or recycling a spare tile.";
    }
    updateSide('[data-drawer="' + chain + '"]');
  }

  function boardAction(action) {
    if (action === "hint") {
      hints = G.hintPair(state);
      selected = null;
      const missing = G.missingItems(state);
      boardMessage = hints.length ? "Merge the two outlined tiles." : missing.length
        ? "Try the " + G.CHAINS[G.ITEMS[missing[0]].chain].label.toLowerCase() + " drawer."
        : "All supplies are ready for the nail table.";
    } else if (action === "refill") {
      rememberBoard();
      state.energy = G.energyLimit(state);
      boardMessage = "Energy refilled.";
    } else if (action === "recycle" && selected !== null) {
      rememberBoard();
      state.board[selected] = null;
      selected = null;
      hints = [];
      boardMessage = "Tile recycled. Undo is available.";
    } else if (action === "undo" && undo) {
      state.board = undo.board;
      state.energy = undo.energy;
      undo = null;
      selected = null;
      hints = [];
      boardMessage = "Last board action undone.";
    }
    updateSide(action === "refill" ? "[data-drawer]" : '[data-action="' + action + '"]:not(:disabled)');
  }

  function advance() {
    const previous = state.phase;
    if (!G.advance(state)) return;
    undo = null;
    selected = null;
    hints = [];
    boardMessage = "";
    if (state.phase === "result") {
      updateSide("#shift-task-title");
      side.querySelector(".station-task")?.classList.add("station-success");
      chime([523, 659, 784, 1047]);
      announce("Checkout complete. You earned " + currency(state.results.at(-1).reward) + ".");
    } else {
      save();
      leaveStation();
      announce(state.phase === "complete" ? "Showcase complete." : phaseTitles[state.phase] + ".");
      if (previous === "result" && state.phase === "checkin") focusSide('[data-action="go"]');
    }
  }

  function useReply(index) {
    const result = G.reply(state, index);
    if (!result) return;
    if (result.correct) {
      chime([523, 659, 784]);
      announce("You handled the situation. Continue the appointment.");
    }
    updateSide(result.correct ? "#shift-task-title" : ".shift-answer:not(:disabled)");
  }

  function drawNotebook() {
    if (activeNotebook === "upgrades") {
      find("#shift-notebook-title").textContent = "Salon upgrades";
      notebookContent.innerHTML = '<p>' + currency(state.cash) + ' practice cash available</p><ul class="notebook-list">' +
        Object.entries(G.UPGRADES).map(([id, upgrade]) => {
          const owned = state.upgrades.includes(id);
          return '<li><b>' + text(upgrade.name) + '</b><p>' + text(upgrade.effect) + '</p><button type="button" data-upgrade="' + id +
            '"' + (owned || upgrade.cost > state.cash ? " disabled" : "") + '>' +
            (owned ? "Installed" : "Install for " + currency(upgrade.cost)) + '</button></li>';
        }).join("") + '</ul>';
      return;
    }
    find("#shift-notebook-title").textContent = "Workplace Readiness skills log";
    notebookContent.innerHTML = '<p>' + state.results.length + ' of ' + G.APPOINTMENTS.length + ' appointments complete.</p>' +
      (state.results.length ? '<ul class="notebook-list">' + state.results.map(record => {
        const appointment = G.APPOINTMENTS[record.chapter];
        return '<li><b>' + text(appointment.name) + ' · ' + text(appointment.skill) + '</b><p>' +
          text(G.LOOKS[record.look][0]) + ' · ' + record.attempts + ' ' +
          (record.attempts === 1 ? "response" : "responses") + ' · ' + currency(record.reward) + '</p></li>';
      }).join("") + '</ul>' : '') + (saveError ? '<p>Browser storage is unavailable for this visit.</p>' : '') +
      '<div class="notebook-actions">' + (preview ? '' : '<button type="button" data-notebook-action="print">Print log</button> ') +
      '<button type="button" data-notebook-action="restart">Restart practice</button></div>';
  }

  function openNotebook(kind) {
    stopWalk();
    activeNotebook = kind;
    drawNotebook();
    notebook.showModal();
  }

  function reset() {
    state = G.initialState();
    openStop = null;
    selected = null;
    undo = null;
    hints = [];
    focusTile = 0;
    face = "back";
    boardMessage = "";
    notebook.close();
    drawRoom("salon");
    updateSide();
    drawSound();
    announce("Practice restarted. Walk to the front desk to check in.");
    world.focus();
  }

  function drawSound() {
    const button = find("#shift-sound");
    button.textContent = state.sound ? "Sound on" : "Sound off";
    button.setAttribute("aria-pressed", String(state.sound));
  }

  world.addEventListener("click", event => {
    const marker = event.target.closest("button[data-stop]");
    if (marker) {
      selectStation(marker.dataset.stop);
      return;
    }
    const box = world.getBoundingClientRect();
    const point = [(event.clientX - box.left) / box.width * 100, (event.clientY - box.top) / box.height * 100];
    walkTo(point);
  });

  world.addEventListener("keydown", event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (event.target !== world || notebook.open) return;
    if (key === "Enter" || key === "e" || key === " ") {
      event.preventDefault();
      if (!event.repeat) arrive(nearestStop());
      return;
    }
    if (!Object.hasOwn(directions, key)) return;
    event.preventDefault();
    if (openStop) leaveStation(false);
    path = [];
    destination = null;
    keys.add(key);
    requestWalk();
  });

  window.addEventListener("keyup", event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
  window.addEventListener("blur", stopWalk);
  world.addEventListener("blur", () => { keys.clear(); });

  side.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    const {action, tile, drawer, look, paint, reply} = button.dataset;
    if (action === "go") {
      selectStation(goal());
      return;
    }
    if (openStop !== G.workStation(state)) return;
    if (action === "leave") leaveStation();
    else if (action === "advance") advance();
    else if (reply !== undefined) useReply(Number(reply));
    else if (look !== undefined && G.chooseLook(state, Number(look))) {
      updateSide('[data-look="' + look + '"]');
    } else if (paint !== undefined && G.paint(state, Number(paint))) {
      chime([523 + Number(paint) * 38]);
      updateSide(G.pendingReply(state) ? "#shift-task-title" : '[data-paint="' + paint + '"]');
    } else if (state.phase === "merge" && !G.pendingReply(state)) {
      if (tile !== undefined) pickTile(Number(tile));
      else if (drawer !== undefined) dispense(drawer);
      else if (["hint", "refill", "recycle", "undo"].includes(action)) boardAction(action);
    }
  });

  side.addEventListener("keydown", event => {
    const tile = event.target.closest("[data-tile]");
    if (event.key === "Escape" && openStop) {
      leaveStation();
      return;
    }
    if (!tile || !event.key.startsWith("Arrow") || !directions[event.key]) return;
    const index = Number(tile.dataset.tile);
    const [dx, dy] = directions[event.key];
    const column = index % G.COLUMNS + dx;
    event.preventDefault();
    if (column < 0 || column >= G.COLUMNS) return;
    const next = index + dx + dy * G.COLUMNS;
    const target = side.querySelector('[data-tile="' + next + '"]');
    if (!target) return;
    tile.tabIndex = -1;
    focusTile = next;
    target.tabIndex = 0;
    target.focus();
  });

  side.addEventListener("dragstart", event => {
    const tile = event.target.closest('[data-tile][draggable="true"]');
    if (!tile) return;
    dragFrom = Number(tile.dataset.tile);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", tile.dataset.tile);
  });
  side.addEventListener("dragover", event => {
    if (dragFrom !== null && event.target.closest("[data-tile]")) event.preventDefault();
  });
  side.addEventListener("drop", event => {
    const tile = event.target.closest("[data-tile]");
    if (dragFrom === null || !tile) return;
    event.preventDefault();
    const from = dragFrom;
    dragFrom = null;
    if (state.phase === "merge" && openStop === "color" && !G.pendingReply(state)) {
      mergeTiles(from, Number(tile.dataset.tile));
    }
  });
  side.addEventListener("dragend", () => { dragFrom = null; });

  root.addEventListener("click", event => {
    const button = event.target.closest("button[data-notebook]");
    if (button) openNotebook(button.dataset.notebook);
  });
  find("#shift-sound").addEventListener("click", () => {
    state.sound = !state.sound;
    drawSound();
    save();
    chime([523, 659]);
  });
  notebookContent.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    const {upgrade, notebookAction} = button.dataset;
    if (upgrade && G.buyUpgrade(state, upgrade)) {
      undo = null;
      updateSide();
      drawNotebook();
      notebook.querySelector("form button").focus();
      chime([587, 740, 880]);
    }
    if (notebookAction === "print" && !preview) window.print();
    if (notebookAction === "restart") {
      notebookContent.innerHTML = '<p>Restart this practice shift and clear its practice earnings and skills log?</p>' +
        '<button type="button" data-notebook-action="cancel">Keep playing</button> <button type="button" data-notebook-action="confirm">Restart</button>';
      notebookContent.querySelector("button").focus();
    }
    if (notebookAction === "cancel") drawNotebook();
    if (notebookAction === "confirm") reset();
  });

  drawRoom("salon");
  drawSide();
  drawSound();
  announce(state.phase === "complete" ? "Showcase complete." : phaseTitles[state.phase] + ".");
})();
