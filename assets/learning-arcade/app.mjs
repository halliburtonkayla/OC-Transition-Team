import {
  GAMES,
  MODES,
  CATEGORIES,
  gameById,
  categoryById,
} from "./curriculum.mjs";
import {
  settings,
  makeTask,
  newRun,
  recordAttempt,
  summary,
  checkpoint,
  wordChoices,
  ActiveClock,
} from "./core.mjs";
import { picture } from "./art.mjs";
import { escapeHTML as esc, speak } from "../learning/progress.mjs";
import { request, existingDevice, connectionKey } from "./service.mjs";
import { reportHTML, runReport } from "./report.mjs";
const $ = (id) => document.getElementById(id);
let premium = null, premiumClosing = false, premiumLoading = false, connectionAttempt = null;
let mode = "cdc",
  selectedGame = "match",
  run = null,
  task = null,
  round = 0,
  matched = new Set(),
  selected = null,
  feed = 0,
  paid = 0,
  wordIndex = 0,
  pass = 1,
  scanned = 0,
  phase = "game",
  paused = false,
  lane = 1,
  stars = 0,
  room = null,
  walk = false,
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
  low = false,
  token = connectionKey(),
  profile = null,
  records = [],
  guestRecords = [],
  transientByStudent = new Map(),
  saving = false,
  dirty = false,
  clock = new ActiveClock(performance.now()),
  challengeNotice = false,
  sessionNotice = false,
  settingsFromRun = false,
  printRecords = [],
  jumpReady = false;
const say = (text) => {
  if (!speak(text))
    $("game-feedback").textContent =
      "Your device cannot play speech. Ask your teacher to read the direction. Picture clues are still available.";
};
const choices = (items, extra = "") =>
  items
    .map(
      (c, i) =>
        `<button class="choice ${extra}" data-choice="${i}" aria-label="${esc(c.label)}">${picture(c.icon, c.label)}<span>${esc(c.label)}</span></button>`,
    )
    .join("");
function setMode(id) {
  mode = id;
  document
    .querySelectorAll("[data-mode]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.mode === id)),
    );
  $("mode-description").textContent = MODES.find(
    (m) => m.id === id,
  ).description;
}
$("station-cards").innerHTML = GAMES.map(
  (g, i) =>
    `<article class="station-card" style="--wash:${g.color}42"><div class="station-art"><span class="station-number">STATION / 0${i + 1}</span>${picture(g.icon, g.title)}<span class="station-tag">${g.id === "match" ? "15 CATEGORIES" : g.levels + " LEARNING LEVELS"}</span></div><div class="station-copy"><h3>${esc(g.title)}</h3><p class="sub">${esc(g.subtitle)}</p><p class="skills">${esc(g.skill)}</p><button data-launch="${g.id}">Let’s play <span>↗</span></button></div></article>`,
).join("");
$("setup-category").innerHTML = CATEGORIES.map(
  (c) => `<option value="${c.id}">${esc(c.title)}</option>`,
).join("");
function setup(game, fromRun = false) {
  if (premiumLoading) return;
  if (gameById(game)?.premium) { launchPremium(game); return; }
  selectedGame = game;
  settingsFromRun = fromRun;
  const g = gameById(game);
  $("setup-title").textContent = g.title;
  $("setup-eyebrow").textContent = g.subtitle.toUpperCase();
  $("setup-intro").textContent = g.skill;
  $("setup-picture").innerHTML = picture(g.icon, g.title);
  $("setup-level").innerHTML = Array.from(
    { length: g.levels },
    (_, i) =>
      `<option value="${i + 1}">Level ${i + 1}${i === 0 ? " · Start here" : ""}</option>`,
  ).join("");
  $("setup-level").value = String(
    Math.min(
      g.levels,
      fromRun ? run.options.level : profile?.learning?.level || 1,
    ),
  );
  $("setup-mode").value = mode;
  $("setup-category").value = fromRun
    ? run.options.category
    : profile?.learning?.category || "colors";
  $("setup-questions").checked = fromRun
    ? run.options.questions
    : profile?.learning?.questions || false;
  $("setup-timed").checked = fromRun ? run.options.timed : false;
  $("setup-record").checked = fromRun ? run.options.record : !!profile;
  $("setup-record").disabled = !profile;
  $("category-wrap").hidden = game !== "match";
  $("setup-status").textContent = "";
  updateSetup();
  $("setup-dialog").showModal();
}
function updateSetup() {
  mode = $("setup-mode").value;
  const beginner = mode === "cdc";
  $("setup-questions").disabled = beginner;
  $("setup-timed").disabled = beginner;
  if (beginner) {
    $("setup-questions").checked = false;
    $("setup-timed").checked = false;
  }
  $("minutes-wrap").hidden = mode !== "esp";
  const t = makeTask(selectedGame, {
    mode,
    level: $("setup-level").value,
    category: $("setup-category").value,
  });
  $("setup-objective").textContent = "Learning goal: " + t.objective;
}
for (const id of ["setup-mode", "setup-level", "setup-category"])
  $(id).addEventListener("change", updateSetup);
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-launch]");
  if (b) {
    room?.view(b.dataset.launch);
    setup(b.dataset.launch);
  }
  const c = e.target.closest("[data-close]");
  if (c) $(c.dataset.close).close();
  const m = e.target.closest("[data-mode]");
  if (m) setMode(m.dataset.mode);
});
$("setup-form").onsubmit = async (e) => {
  e.preventDefault();
  const o = settings({
    mode: $("setup-mode").value,
    level: $("setup-level").value,
    category: $("setup-category").value,
    questions: $("setup-questions").checked,
    timed: $("setup-timed").checked,
    minutes: $("setup-minutes").value,
    record: $("setup-record").checked && !!profile,
  });
  if (settingsFromRun && run) {
    await endRun("settings_changed");
  }
  setMode(o.mode);
  run = newRun(selectedGame, o);
  run.ownerId = profile?.id || null;
  round = 0;
  clock = new ActiveClock(performance.now());
  dirty = false;
  paused = false;
  challengeNotice = false;
  sessionNotice = false;
  $("setup-dialog").close();
  if (!$("play-dialog").open) $("play-dialog").showModal();
  room?.setPaused(true);
  newTask();
};

async function launchPremium(game, resume = null) {
  if (run || premiumLoading) return;
  premiumLoading = true;
  try {
    if (connectionAttempt) await connectionAttempt;
    const module = await import(game === "wordquest" ? "./expansion/word-app.mjs" : "./expansion/dress-app.mjs");
    const prior = resume || allRecords().filter(r => r.game === game && r.checkpoint && r.status === "playing" && !r.endedAt).at(-1);
    run = prior ? structuredClone(prior) : newRun(game, {mode, level: 1, record: !!profile});
    run.ownerId = profile?.id || null;
    if (!run.checkpoint) run.checkpoint = game === "wordquest" ? module.initialWord() : module.initialDress();
    run.checkpointRevision ||= 0;
    run.options.level = run.checkpoint.level;
    clock = new ActiveClock(performance.now());
    paused = false;
    dirty = !prior;
    room?.setPaused(true);
    $("premium-dialog").showModal();
    const host = {
      get: () => run,
      connected: () => !!profile,
      identity: () => profile ? profile.displayName + " · " + profile.schoolLabel + " · ID " + profile.id : "Guest practice · no student identity recorded",
      notice: () => run?.options.record && profile ? "Connected private practice · use Save progress before leaving. Official services require teacher review." : "Guest / unrecorded practice stays in this open page. Print your report before closing this tab.",
      changed: () => { if (run) { run.checkpointRevision = (run.checkpointRevision || 0) + 1; dirty = true; } },
      attempt: (a) => { if (!run) return; recordAttempt(run, {kind:a.kind,correct:a.correct,choice:a.choice,task:{level:a.level,round:a.round,objective:a.objective}});host.changed(); },
      help: (kind) => { run.assistance.push({at:new Date().toISOString(),kind});host.changed(); },
      save,
      pause: (v) => { tick(); paused = v; clock.touch(performance.now()); },
      print: (kind) => {
        tick(); const custom = premium?.print(kind);
        $("print-area").innerHTML = custom || reportHTML([run], {name:profile?.displayName || "Guest practice",school:profile?.schoolLabel || "Not connected",studentId:profile?.id || "Not recorded",title:gameById(game).title});
        const previous = paused; paused = true; window.print(); paused = previous;
      },
      exit: suspendPremium,
    };
    premium = await module.mount($("premium-root"),host);
    $("premium-root").querySelector("button")?.focus();
  } catch(e) {
    premium?.dispose(); premium = null; run = null; dirty = false;
    $("premium-dialog").close(); room?.setPaused(false);
    $("connection-status").textContent = "This station could not load: " + e.message + ". Your existing learning records are preserved.";
  } finally { premiumLoading = false; }
}
async function suspendPremium() {
  if (!premium || premiumClosing) return;
  premiumClosing = true;
  tick(); paused = true;
  while (saving) await new Promise(resolve => setTimeout(resolve,50));
  await save();
  const copy = structuredClone(run);
  if (run.options.record && dirty) copy.unsaved = true;
  if (run.options.record && profile && !dirty) records = records.filter(r=>r.id!==run.id).concat(copy);
  else if (run.ownerId) transientByStudent.set(run.ownerId,(transientByStudent.get(run.ownerId)||[]).filter(r=>r.id!==run.id).concat(copy));
  else guestRecords = guestRecords.filter(r=>r.id!==run.id).concat(copy);
  premium.dispose(); premium = null;
  $("premium-dialog").close(); $("premium-root").replaceChildren();
  if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
  run = null; dirty = false; paused = false; premiumClosing = false;
  room?.setPaused(false);
  $("station-cards").querySelector("button")?.focus();
}
$("premium-dialog").addEventListener("cancel", (e) => { e.preventDefault(); suspendPremium(); });

function newTask() {
  if (!run) return;
  task = makeTask(run.game, run.options, round, 42 + round * 17);
  phase = "game";
  selected = null;
  matched = new Set();
  feed = paid = wordIndex = scanned = 0;
  pass = 1;
  lane = 1;
  jumpReady = false;
  paused = false;
  $("paused-overlay").hidden = true;
  $("pause-game").textContent = "Pause";
  $("pause-game").setAttribute("aria-pressed", "false");
  $("next-round").hidden = true;
  $("game-feedback").textContent =
    "Take your time. You can practice as much as you like.";
  draw();
  clock.touch(performance.now());
  say(task.spoken);
}
function draw() {
  const g = gameById(run.game),
    s = summary(run);
  $("play-title").textContent = g.title;
  $("play-mode").textContent = MODES.find(
    (m) => m.id === run.options.mode,
  ).label;
  $("play-level").textContent =
    "LEVEL " +
    run.options.level +
    " / " +
    g.levels +
    " · " +
    (run.game === "match" ? categoryById(run.options.category).title : g.skill);
  $("play-stars").textContent = s.stars + " stars";
  $("play-rounds").textContent = "Round " + (round + 1);
  $("game-prompt").textContent = task.prompt;
  $("game-actions").innerHTML = "";
  if (task.kind === "match") drawMatch();
  else if (task.kind === "feed") drawFeed();
  else if (task.kind === "word") drawWord();
  else if (task.kind === "scan") drawScan();
  else if (task.kind === "pay") drawPay();
  else drawChoices();
  $("game-prompt").focus({ preventScroll: true });
  updateSaveNotice();
}
function drawMatch() {
  const textOnly = run.options.level === 4 || pass === 2;
  $("game-visual").innerHTML =
    `<div class="match-halves"><div><p class="match-heading">1 · CHOOSE A PICTURE</p><div class="match-column">${task.items.map((p) => `<button draggable="${!matched.has(p.id)}" class="match-tile ${matched.has(p.id) ? "matched" : ""} ${selected === p.id ? "selected" : ""}" data-item="${p.id}" aria-pressed="${selected === p.id}" ${matched.has(p.id) ? "disabled" : ""} aria-label="${esc(p.label)}">${picture(p.icon, p.label)}${run.options.mode !== "cdc" ? "<span>" + esc(p.label) + "</span>" : ""}</button>`).join("")}</div></div><div><p class="match-heading">2 · FIND ITS MATCH</p><div class="match-column">${task.targets.map((p) => `<button class="match-tile ${matched.has(p.id) ? "matched" : ""}" data-target="${p.id}" ${matched.has(p.id) ? "disabled" : ""} aria-label="${esc(p.target)}">${textOnly ? '<span class="target-word">' + esc(p.target) + "</span>" : picture(p.targetIcon, p.target)}${!textOnly && run.options.mode !== "cdc" ? "<span>" + esc(p.target) + "</span>" : ""}</button>`).join("")}</div></div></div>`;
}
const road = () =>
  `<div class="road"><div class="scenery">${["school", "store", "household", "garage"].map((id) => picture(id)).join("")}</div><div class="road-pickups">${task.options.map((c, i) => `<button class="road-pickup" style="left:${10 + i * (80 / Math.max(1, task.options.length - 1))}%" data-road-choice="${i}" aria-label="Collect ${esc(c.label)}">${picture(c.icon, c.label)}<span>${esc(c.label)}</span></button>`).join("")}</div>${run.options.mode !== "cdc" && run.options.level >= 5 ? '<div class="road-cone" aria-label="Cone obstacle in the middle lane">' + picture("cone", "Cone obstacle") + "</div>" : ""}<div class="road-car" id="road-car">${picture(run.game === "words" ? "truck" : "car")}</div></div><div class="lane-controls"><button data-drive="left" aria-label="Steer left">← Steer</button><button data-drive="collect">Collect · Enter</button><button data-drive="right" aria-label="Steer right">Steer →</button><button data-drive="jump">Jump / Space</button><button data-drive="boost" ${summary(run).stars < 3 ? "disabled" : ""}>Star boost</button></div>`;
function drawChoices() {
  const driving = run.game === "coins",
    bubbles = run.game === "phonics";
  $("game-visual").innerHTML =
    (driving ? road() : "") +
    (task.coins
      ? `<div class="coin-tray">${task.coins.map((id) => picture(id, id)).join("")}</div>`
      : "") +
    (task.quantity
      ? `<div class="count-items">${Array.from({ length: task.quantity }, () => picture(task.product.id, task.product.label)).join("")}</div>`
      : "") +
    (!driving && !task.coins && !task.quantity
      ? `<div class="task-picture">${picture(task.targetIcon, task.product?.label || "Picture clue")}</div>`
      : "");
  $("game-actions").innerHTML = choices(
    task.options,
    bubbles ? "bubble-choice" : "",
  );
  if (driving) updateLane();
}
function drawFeed() {
  const n = Number(task.answer);
  $("game-visual").innerHTML =
    `<div class="monster-stage"><div class="monster-body">${picture("monster", "Friendly number monster")}<span class="fed-number">${feed}</span></div><div><div class="task-picture">${task.level <= 4 ? picture("number-" + n, "Target number " + n) : '<span class="math-clue">' + esc(task.level <= 6 ? task.left + " + " + task.right : task.level === 7 ? task.left + " − " + task.right : "Count the stars") + "</span>"}</div><div class="number-space" aria-label="${feed} stars fed, target ${n}">${Array.from({ length: task.level <= 4 ? Math.max(n, feed) : feed }, (_, i) => `<span class="${i < feed ? "filled" : ""}">${i < feed ? "★" : ""}</span>`).join("")}</div></div></div>`;
  $("game-actions").innerHTML =
    `<div class="feed-controls"><button data-feed="remove" ${feed === 0 ? "disabled" : ""}>− Take one back</button><button class="primary" data-feed="add">${picture("star", "Star")} Feed one star</button><button data-feed="check">Check my count</button></div>`;
}
function drawWord() {
  const list = wordChoices(task, wordIndex);
  task.options = list;
  $("game-visual").innerHTML =
    road() +
    `<div class="task-picture">${picture(task.targetIcon, "Picture clue")}</div><div class="letter-slots" aria-label="Word ${esc(task.word)}. ${wordIndex} letters collected.">${task.word
      .split("")
      .map(
        (l, i) =>
          `<span class="${i === wordIndex ? "next" : ""}">${i < wordIndex ? l : run.options.level <= 2 ? l : "_"}</span>`,
      )
      .join("")}</div>`;
  $("game-actions").innerHTML = choices(list);
  updateLane();
}
function drawScan() {
  $("game-visual").innerHTML =
    `<div class="checkout-belt">${Array.from({ length: Number(task.answer) }, (_, i) => `<button class="scan-item ${i < scanned ? "scanned" : ""}" data-scan="${i}" aria-label="Scan ${task.product.label} ${i + 1}" ${i < scanned ? "disabled" : ""}>${picture(task.product.id, task.product.label)}</button>`).join("")}</div><p class="scanner" role="status">${scanned} / ${task.answer} scanned</p>`;
  $("game-actions").innerHTML =
    '<button class="primary" data-scan-next>Scan next item</button>';
}
function drawPay() {
  $("game-visual").innerHTML =
    `<div class="checkout-belt">${picture(task.product.id, task.product.label)}<div class="scanner">${task.price}¢ total<br>${paid}¢ paid</div></div><p class="small">Pretend money practice. Choose coins, then check the amount.</p>`;
  $("game-actions").innerHTML =
    choices(task.options) +
    '<button data-reset-pay>Take coins back</button><button class="primary" data-pay-check>Finish paying</button>';
}
function attempt(correct, value, kind = "game") {
  recordAttempt(run, { correct, choice: value, task, kind });
  dirty = true;
}
function feedback(correct, detail = "") {
  const text = correct
    ? "That’s it! " + detail
    : "Let’s try again. " +
      (detail || "Listen to the direction and look at the pictures.");
  $("game-feedback").textContent = text;
  if (!correct) {
    say(text);
  }
}
function answer(index) {
  if (!run || paused || phase === "complete" || phase === "done") return;
  const q = phase === "question" ? checkpoint(task) : task,
    option = q.options[index];
  if (!option) return;
  if (task.kind === "pay" && phase === "game") {
    paid += Number(option.value);
    drawPay();
    say(paid + " cents paid.");
    return;
  }
  const correct =
    task.kind === "word" && phase === "game"
      ? option.value === task.word[wordIndex]
      : option.value === q.answer;
  attempt(correct, option.label, phase === "question" ? "question" : "game");
  if (correct && task.kind === "word" && phase === "game") {
    wordIndex++;
    feedback(true, option.label + " delivered.");
    if (wordIndex < task.word.length) {
      lane = 1;
      drawWord();
      say("Now find the letter " + task.word[wordIndex] + ".");
      return;
    }
  }
  if (correct) {
    if (phase === "question") {
      finishRound();
    } else completeGame();
  } else {
    feedback(
      false,
      task.kind === "word"
        ? "Find the next letter " + task.word[wordIndex] + "."
        : "",
    );
    const b = $("game-actions").querySelector(`[data-choice="${index}"]`);
    b?.classList.add("retry");
  }
}
function completeGame() {
  if (run.options.questions) {
    phase = "complete";
    $("next-round").hidden = false;
    $("next-round").textContent = "Learning question →";
    feedback(true, "Ready for a learning question.");
  } else finishRound();
}
function finishRound() {
  phase = "done";
  recordAttempt(run, {
    correct: true,
    choice: "Completed round",
    task,
    kind: "round",
  });
  dirty = true;
  const s = summary(run);
  $("play-stars").textContent = s.stars + " stars";
  $("game-actions")
    .querySelectorAll("button")
    .forEach((b) => (b.disabled = true));
  $("game-visual")
    .querySelectorAll("button")
    .forEach((b) => (b.disabled = true));
  $("next-round").hidden = false;
  $("next-round").textContent = "Next round →";
  $("next-round").focus({ preventScroll: true });
  feedback(
    true,
    round % 3 === 2
      ? "You’re ready for the next level, or keep practicing at this level."
      : "You completed this round.",
  );
  say("Great practice. Choose next round when you are ready.");
  save();
}
$("next-round").onclick = () => {
  if (phase === "complete") {
    phase = "question";
    const q = checkpoint(task);
    $("game-prompt").textContent = q.prompt;
    $("game-visual").innerHTML =
      `<div class="task-picture">${picture(task.targetIcon || "match", "Picture clue")}</div>`;
    $("game-actions").innerHTML = choices(q.options);
    $("next-round").hidden = true;
    say(q.spoken);
    return;
  }
  if (phase !== "done") return;
  round++;
  if (round % 3 === 0 && run.options.mode !== "cdc")
    run.options.level = Math.min(
      gameById(run.game).levels,
      run.options.level + 1,
    );
  newTask();
};
$("game-visual").addEventListener("click", (e) => {
  if (!run || paused || phase !== "game") return;
  const item = e.target.closest("[data-item]");
  if (item) {
    selected = item.dataset.item;
    const p = task.items.find((p) => p.id === selected);
    say(p.label + ". Find its match.");
    drawMatch();
    $("game-visual")
      .querySelector("[data-target]:not(:disabled)")
      ?.focus({ preventScroll: true });
    return;
  }
  const target = e.target.closest("[data-target]");
  if (target) {
    matchTarget(target.dataset.target);
    return;
  }
  const scan = e.target.closest("[data-scan]");
  if (scan) {
    doScan(Number(scan.dataset.scan));
    return;
  }
  const pickup = e.target.closest("[data-road-choice]");
  if (pickup) {
    lane = Number(pickup.dataset.roadChoice);
    updateLane();
    driveAction("collect");
    return;
  }
  const drive = e.target.closest("[data-drive]");
  if (drive) driveAction(drive.dataset.drive);
});
function matchTarget(id) {
  if (!selected) {
    feedback(false, "Choose a picture on the left first.");
    return;
  }
  const correct = id === selected;
  attempt(correct, task.targets.find((p) => p.id === id)?.target);
  if (correct) {
    matched.add(id);
    selected = null;
    drawMatch();
    $("game-visual")
      .querySelector("[data-item]:not(:disabled)")
      ?.focus({ preventScroll: true });
    if (matched.size === task.items.length) {
      if (task.steps === 2 && pass === 1) {
        pass = 2;
        matched.clear();
        drawMatch();
        $("game-prompt").textContent =
          "Now match the same pictures to their labels.";
        say("Great. Now match the pictures to their labels.");
      } else completeGame();
    } else feedback(true, "Choose another picture.");
  } else feedback(false, "Try another match.");
}
$("game-visual").addEventListener("dragstart", (e) => {
  const b = e.target.closest("[data-item]");
  if (b && run && !paused && phase === "game") {
    selected = b.dataset.item;
    e.dataTransfer.setData("text/plain", selected);
    e.dataTransfer.effectAllowed = "move";
  }
});
$("game-visual").addEventListener("dragover", (e) => {
  if (e.target.closest("[data-target]")) e.preventDefault();
});
$("game-visual").addEventListener("drop", (e) => {
  const b = e.target.closest("[data-target]");
  if (b && run && !paused && phase === "game") {
    e.preventDefault();
    matchTarget(b.dataset.target);
  }
});
$("game-actions").addEventListener("click", (e) => {
  if (!run || paused || phase === "done" || phase === "complete") return;
  const b = e.target.closest("[data-choice]");
  if (b) {
    answer(Number(b.dataset.choice));
    return;
  }
  const f = e.target.closest("[data-feed]");
  if (f) {
    if (f.dataset.feed === "add") {
      feed = Math.min(task.limit + 5, feed + 1);
      drawFeed();
      $("game-actions")
        .querySelector("[data-feed=add]")
        ?.focus({ preventScroll: true });
      say(String(feed));
    } else if (f.dataset.feed === "remove") {
      feed = Math.max(0, feed - 1);
      drawFeed();
      $("game-actions")
        .querySelector("[data-feed=add]")
        ?.focus({ preventScroll: true });
      say(String(feed));
    } else {
      attempt(feed === task.answer, String(feed));
      if (feed === task.answer) completeGame();
      else
        feedback(
          false,
          feed < task.answer
            ? "Feed a few more stars."
            : "Take back a few stars.",
        );
    }
    return;
  }
  if (e.target.closest("[data-scan-next]")) {
    doScan(scanned);
    return;
  }
  if (e.target.closest("[data-reset-pay]")) {
    paid = 0;
    drawPay();
    return;
  }
  if (e.target.closest("[data-pay-check]")) {
    attempt(paid === task.answer, paid + " cents");
    if (paid === task.answer) completeGame();
    else
      feedback(
        false,
        paid < task.answer
          ? "Add more coins."
          : "Take the coins back and try a smaller amount.",
      );
  }
});
function doScan(i) {
  if (i !== scanned) {
    feedback(false, "Scan the next item in order.");
    return;
  }
  scanned++;
  attempt(true, "Scanned " + task.product.label + " " + scanned);
  drawScan();
  if (scanned === task.answer) completeGame();
  else say(scanned + " scanned.");
}
function updateLane() {
  const el = $("road-car");
  if (el)
    el.style.left = `calc(${10 + lane * (80 / Math.max(1, task.options.length - 1))}% - 53px)`;
  document
    .querySelectorAll("[data-choice]")
    .forEach((el, i) => el.classList.toggle("selected", i === lane));
}
function driveAction(action) {
  if (!run || paused || phase !== "game") return;
  if (action === "left" || action === "right") {
    lane = Math.max(
      0,
      Math.min(task.options.length - 1, lane + (action === "left" ? -1 : 1)),
    );
    updateLane();
  } else if (action === "collect") {
    if (
      run.options.mode !== "cdc" &&
      run.options.level >= 5 &&
      lane === 1 &&
      !jumpReady
    ) {
      $("game-feedback").textContent =
        "There’s a cone in this lane. Choose Jump, then collect. You can take your time.";
      say("Choose jump to clear the cone. Then collect.");
      return;
    }
    jumpReady = false;
    answer(lane);
  } else if (action === "jump") {
    jumpReady = true;
    $("road-car")?.classList.add("jumping");
    feedback(true, "Nice jump! Find your learning target.");
  } else if (action === "boost" && summary(run).stars >= 3) {
    $("road-car")?.classList.add("boost");
    setTimeout(() => $("road-car")?.classList.remove("boost"), 1500);
    feedback(true, "Star boost!");
  }
}
window.addEventListener("keydown", (e) => {
  if (
    !run ||
    !$("play-dialog").open ||
    paused ||
    !["coins", "words"].includes(run.game) ||
    phase !== "game" ||
    e.target.closest("button,input,select,textarea")
  )
    return;
  const a = {
    ArrowLeft: "left",
    ArrowRight: "right",
    Enter: "collect",
    Space: "jump",
  }[e.code];
  if (a) {
    e.preventDefault();
    driveAction(a);
  }
});
function togglePause(value) {
  if (!run) return;
  tick();
  paused = value;
  $("paused-overlay").hidden = !value;
  $("pause-game").textContent = value ? "Resume" : "Pause";
  $("pause-game").setAttribute("aria-pressed", String(value));
  if (value) speechSynthesis?.cancel();
  else clock.touch(performance.now());
  clock.tick(performance.now(), { visible: !document.hidden, paused });
}
$("pause-game").onclick = () => togglePause(!paused);
$("resume-game").onclick = () => togglePause(false);
$("read-prompt").onclick = () => {
  if (!run) return;
  run.assistance.push({
    at: new Date().toISOString(),
    kind: "Repeated spoken directions",
  });
  dirty = true;
  say(phase === "question" ? checkpoint(task).spoken : task.spoken);
};
$("help-button").onclick = () => {
  if (!run) return;
  run.assistance.push({
    at: new Date().toISOString(),
    kind: "Student requested help; adult assistance not yet observed",
  });
  dirty = true;
  $("game-feedback").textContent =
    "It’s okay to ask. Tell your teacher: “Can you help me, please?”";
  say("Can you help me, please?");
};
$("change-settings").onclick = () => {
  if (!run) return;
  togglePause(true);
  setup(run.game, true);
};
$("setup-dialog").addEventListener("close", () => {
  if (settingsFromRun && run) togglePause(false);
});
function updateSaveNotice() {
  $("save-status").textContent = run?.options.record
    ? dirty
      ? "Your latest practice is waiting to save."
      : "Connected learning · practice record. Your teacher reviews official services separately."
    : `${profile ? "Unrecorded practice" : "Guest practice"} · this practice report stays in this open page. Print before leaving.`;
}
async function save() {
  if (!run?.options.record || !profile || !token) return false;
  if (saving) return false;
  if (!dirty) return true;
  const snapshot = structuredClone(run);
  saving = true;
  try {
    const saved = await request("arcade_save", { token, run: snapshot });
    if (saved.saved === false)
      throw Error(saved.reason || "A newer record already exists.");
    if (
      run?.id === snapshot.id &&
      JSON.stringify(run) === JSON.stringify(snapshot)
    )
      dirty = false;
    $("save-status").textContent =
      "Practice saved to your connected learning profile.";
    premium?.ui.status("Practice saved to your connected private learning profile.");
    return true;
  } catch (e) {
    $("save-status").textContent =
      "Could not save: " +
      e.message +
      " Keep this page open or print your report.";
    premium?.ui.status($("save-status").textContent);
    return false;
  } finally {
    saving = false;
  }
}
async function endRun(reason = "finished") {
  if (premium) { await suspendPremium(); return; }
  if (!run) return;
  tick();
  run.endedAt = new Date().toISOString();
  run.status = reason;
  dirty = true;
  while (saving) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await save();
  const copy = structuredClone(run);
  if (run.options.record && dirty) {
    copy.unsaved = true;
    $("connection-status").textContent =
      "This activity could not be saved. Keep this page open and print the practice report before leaving.";
  }
  if (run.options.record && profile && !dirty) {
    records = records.filter((r) => r.id !== run.id).concat(copy);
    transientByStudent.set(
      run.ownerId,
      (transientByStudent.get(run.ownerId) || []).filter(
        (r) => r.id !== run.id,
      ),
    );
  } else if (run.ownerId) {
    const own = transientByStudent.get(run.ownerId) || [];
    transientByStudent.set(
      run.ownerId,
      own.filter((r) => r.id !== run.id).concat(copy),
    );
  } else guestRecords.push(copy);
  run = null;
  dirty = false;
  paused = false;
  room?.setPaused(false);
  speechSynthesis?.cancel();
}
$("leave-game").onclick = async () => {
  await endRun();
  $("play-dialog").close();
};
$("play-dialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  $("leave-game").click();
});
function tick() {
  const now = performance.now(),
    delta = clock.tick(now, {
      visible: !document.hidden,
      paused:
        paused || !run || (!$("play-dialog").open && !$("premium-dialog").open) || $("setup-dialog").open || !!$("premium-root").querySelector(".premium-print-dialog[open]"),
    });
  if (!run) return;
  if (delta > 0) {
    run.activeMs += delta;
    if (run.checkpoint) run.checkpointRevision = (run.checkpointRevision || 0) + 1;
    dirty = true;
  }
  const sec = Math.floor(run.activeMs / 1000);
  $("play-timer").hidden = !run.options.timed;
  if (run.options.timed)
    $("play-timer").textContent = Math.max(0, 90 - sec) + "s challenge";
  if (run.options.timed && sec >= 90 && !challengeNotice) {
    challengeNotice = true;
    $("game-feedback").textContent =
      "Your 90-second challenge is complete. You can keep practicing or return to the arcade for your report.";
    say("Challenge complete. Keep practicing or return to the arcade.");
  }
  if (
    run.options.minutes &&
    sec >= run.options.minutes * 60 &&
    !sessionNotice
  ) {
    sessionNotice = true;
    $("game-feedback").textContent =
      "Your quick-play session is complete. Keep practicing or return to the arcade to finish.";
    say("Your quick play is complete. Great practice.");
  }
}
setInterval(() => {
  tick();
}, 1000);
setInterval(save, 10000);
document.addEventListener("visibilitychange", () => {
  tick();
  if (document.hidden) save();
});
for (const type of ["pointerdown", "keydown"])
  document.addEventListener(
    type,
    () => {
      clock.touch(performance.now());
    },
    { passive: true },
  );
window.addEventListener("pagehide", () => {
  tick();
  speechSynthesis?.cancel();
});
window.addEventListener("beforeunload", (e) => {
  if (run?.options.record && dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
function connectionUI() {
  // Clear the previous learner's rendered evidence before changing identities.
  printRecords = [];
  $("progress-content").replaceChildren();
  $("print-area").replaceChildren();
  if ($("progress-dialog").open) $("progress-dialog").close();
  let recommend = $("recommended-button");
  if (profile?.learning?.recommendedGame) {
    if (!recommend) {
      recommend = document.createElement("button");
      recommend.id = "recommended-button";
      document.querySelector(".connection-tools").prepend(recommend);
    }
    recommend.textContent =
      "Next: " + gameById(profile.learning.recommendedGame).title;
    recommend.dataset.launch = profile.learning.recommendedGame;
  } else recommend?.remove();
  $("learner-title").textContent = profile
    ? profile.displayName + "’s learning journey."
    : "Ready when you are.";
  $("connection-status").textContent = profile
    ? profile.schoolLabel +
      " · Private learning connected. Your teacher can change your learning plan."
    : "Play freely as a guest, or use a teacher-approved device to save your learning.";
  $("connect-button").hidden = !!profile;
  $("disconnect-button").hidden = !profile;
}
async function connect(key) {
  if (run) throw Error("Finish the current game before changing learners.");
  const d = await request("arcade_me", { token: key });
  if (run) throw Error("Finish the current game before connecting a learner.");
  token = key;
  profile = d.profile;
  records = d.records || [];
  sessionStorage.setItem("ttArcadeDevice", key);
  if (profile.learning?.mode) setMode(profile.learning.mode);
  connectionUI();
}
$("connect-button").onclick = () => $("connect-dialog").showModal();
$("connect-form").onsubmit = async (e) => {
  e.preventDefault();
  try {
    await connect($("device-key").value.trim());
    $("device-key").value = "";
    $("connect-dialog").close();
  } catch (e) {
    $("connect-message").textContent = e.message;
  }
};
$("connect-town").onclick = async () => {
  try {
    const key = existingDevice();
    if (!key)
      throw Error(
        "No approved Town device found. Ask your teacher to connect this device.",
      );
    await connect(key);
    $("connect-dialog").close();
  } catch (e) {
    $("connect-message").textContent = e.message;
  }
};
$("disconnect-button").onclick = async () => {
  await endRun("locked");
  profile = null;
  token = "";
  records = [];
  sessionStorage.removeItem("ttArcadeDevice");
  connectionUI();
};
function allRecords() {
  const own = profile
    ? [...records, ...(transientByStudent.get(profile.id) || [])]
    : guestRecords;
  const unique = new Map();
  for (const candidate of own) {
    const previous = unique.get(candidate.id);
    if (
      !previous ||
      (candidate.rounds.length >= previous.rounds.length &&
        candidate.activeMs >= previous.activeMs &&
        !(previous.endedAt && !candidate.endedAt))
    )
      unique.set(candidate.id, candidate);
  }
  if (run && run.ownerId === (profile?.id || null)) unique.set(run.id, run);
  return [...unique.values()];
}
function showProgress() {
  tick();
  if (run && $("play-dialog").open) togglePause(true);
  printRecords = allRecords();
  const totals = printRecords.map(summary);
  $("progress-content").innerHTML =
    `<div class="report-metrics"><span><b>${totals.reduce((n, s) => n + s.stars, 0)}</b>stars earned</span><span><b>${totals.reduce((n, s) => n + s.rounds, 0)}</b>rounds completed</span><span><b>${Math.round(totals.reduce((n, s) => n + s.minutes, 0))}</b>active minutes</span></div>${printRecords.length ? printRecords.map((r) => runReport(r) + (!run && r.status === "playing" && profile ? '<button data-resume="' + esc(r.id) + '">Continue unfinished activity</button>' : "")).join("") : "<p>Your next discovery is waiting. Choose a game to begin.</p>"}`;
  $("progress-dialog").showModal();
}
$("progress-content").addEventListener("click", (e) => {
  const b = e.target.closest("[data-resume]");
  if (!b || run) return;
  const saved = allRecords().find((r) => r.id === b.dataset.resume);
  if (!saved) return;
  if (gameById(saved.game)?.premium) { $("progress-dialog").close(); launchPremium(saved.game, saved); return; }
  run = structuredClone(saved);
  run.ownerId = profile.id;
  round =
    Math.max(
      -1,
      ...run.rounds.filter((r) => r.kind === "round").map((r) => r.round),
    ) + 1;
  run.endedAt = null;
  run.status = "playing";
  clock = new ActiveClock(performance.now());
  setMode(run.options.mode);
  $("progress-dialog").close();
  $("play-dialog").showModal();
  room?.setPaused(true);
  newTask();
});
$("progress-button").onclick = showProgress;
$("print-summary").onclick = () => {
  printRecords = allRecords();
  print();
};
$("print-progress").onclick = print;
function print() {
  tick();
  $("print-area").innerHTML = reportHTML(printRecords, {
    name: profile?.displayName || "Guest practice",
    school: profile?.schoolLabel || "Not connected",
    studentId: profile?.id || "Not recorded",
  });
  window.print();
}
$("walk-button").onclick = () => {
  walk = !walk;
  $("walk-button").setAttribute("aria-pressed", String(walk));
  $("walk-controls").hidden = !walk;
  room?.setWalk(walk);
  if (walk) $("arcade-room").focus();
};
$("room-home").onclick = () => {
  walk = false;
  $("walk-button").setAttribute("aria-pressed", "false");
  $("walk-controls").hidden = true;
  room?.home();
};
function setReduced() {
  document.body.classList.toggle("reduced-motion", reduced);
  $("motion-button").setAttribute("aria-pressed", String(reduced));
  room?.setMotion(!reduced);
}
$("motion-button").onclick = () => {
  reduced = !reduced;
  setReduced();
};
$("graphics-button").onclick = () => {
  low = !low;
  $("graphics-button").setAttribute("aria-pressed", String(low));
  room?.setQuality(low ? "low" : "balanced");
};
document.querySelectorAll("[data-move]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    room?.move(b.dataset.move, true);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(type, () => room?.move(b.dataset.move, false));
});
setReduced();
if (token)
  connectionAttempt = connect(token).catch(() => {
    token = "";
    sessionStorage.removeItem("ttArcadeDevice");
    connectionUI();
  }).finally(() => { connectionAttempt = null; });
import("./room.mjs")
  .then((m) => {
    room = m.createArcadeRoom($("arcade-room"), {
      onStation: (id) => {
        if (id === "progress") showProgress();
        else if (id === "board") $("game-board").scrollIntoView();
        else setup(id);
      },
      onReady: () => {
        $("room-status").textContent =
          "3D classroom ready. Tap a game station or use the game board.";
      },
      onUnavailable: () => {
        $("room-status").classList.remove("sr-only");
        $("room-status").textContent =
          "3D is unavailable on this device. All games are available from the game board below.";
      },
    });
    setReduced();
    room?.setPaused($("play-dialog").open || $("premium-dialog").open);
  })
  .catch((error) => {
    console.error("Arcade room:", error);
    $("room-status").classList.remove("sr-only");
    $("room-status").textContent =
      "The classroom view could not load. Choose any game below to play.";
  });
