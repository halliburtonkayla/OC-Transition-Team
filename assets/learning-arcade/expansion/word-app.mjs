import { BOOKS, DIFFICULTIES, questions } from "./word-data.mjs";
import {
  generatePuzzle,
  pathBetween,
  selectedWord,
  wordPrint,
  permute,
  random,
} from "./word-core.mjs";
import { shell, $, on, chime, celebrate } from "./shared.mjs";
import { escapeHTML as e } from "../../learning/progress.mjs";
const HIGHLIGHTS = [
  "#e565b3",
  "#42bbc2",
  "#a98de0",
  "#eabf4f",
  "#86bf72",
  "#5d9fdf",
  "#ee9173",
  "#bb91bc",
  "#7bbaa7",
  "#d0a550",
];
export const initialWord = () => ({
  version: 1,
  bookId: "careers",
  level: 1,
  page: 0,
  seed: Math.floor(Math.random() * 4294967295),
  found: [],
  progress: {},
  bookmarks: {},
  questionIndex: 0,
  questionAnswers: [],
  preferences: {
    sound: false,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    low: false,
    text: 1,
    simple: true,
    hints: true,
  },
});
export async function mount(root, host) {
  const c = host.get().checkpoint || initialWord();
  host.get().checkpoint = c;
  c.bookmarks ||= {};
  let libraryLevel = c.level,
    puzzle,
    anchor = null,
    path = [],
    dragging = false,
    moved = false,
    origin = null,
    library = true,
    hintPath = [],
    hintTimer = 0,
    panTouch = null,
    lastTouchPan = null,
    disposed = false;
  const ui = shell(root, host, {
    title: "Word Quest.",
    kicker: "GLOSSY BUBBLE EDITION",
    description:
      "Twenty discoveries on every page. Find your words. Find your next step.",
    onPrint: () =>
      ui.printOptions([
        ["blank", "Blank student puzzle · no word bank"],
        ["bank", "Student puzzle + word bank"],
        ["completed", "Current / completed puzzle"],
        ["key", "Separate teacher answer key"],
        ["pair", "Student puzzle + separate answer key"],
        ["questions", "20 optional vocabulary prompts"],
        ["report", "Student completion report"],
      ]),
  });
  const content = ui.content;
  const modes = `<label>Practice mode <select data-ui="mode">${[
    ["cdc", "CDC Beginner"],
    ["preets", "Pre-ETS Learning"],
    ["esp", "ESP Enrichment"],
  ]
    .map(
      ([id, label]) =>
        `<option value="${id}" ${host.get().options.mode === id ? "selected" : ""}>${label}</option>`,
    )
    .join("")}</select></label>`;
  function roundId() {
    return (
      BOOKS.findIndex((b) => b.id === c.bookId) * 40000 +
      (c.level - 1) * 10000 +
      c.page
    );
  }
  function bookmark() {
    c.bookmarks[c.bookId + ":" + c.level] = {
      page: c.page,
      found: structuredClone(c.found),
    };
  }
  function save() {
    bookmark();
    host.changed();
    host.save();
  }
  function libraryView() {
    library = true;
    anchor = null;
    content.className = "premium-content word-library";
    content.innerHTML = `<div class="library-top"><div><p class="premium-eyebrow">THE WORD-SEARCH LIBRARY</p><h2>A new chapter starts here.</h2><p>Choose a book. Each page hides exactly <b>20 words</b>.</p></div><div class="game-controls">${modes}<label>Difficulty <select data-ui="difficulty">${DIFFICULTIES.map((l, i) => `<option value="${i + 1}" ${libraryLevel === i + 1 ? "selected" : ""}>${l}</option>`).join("")}</select></label><button data-ui="continue">Continue saved page →</button></div></div><div class="book-shelf">${BOOKS.map(
      (b, i) =>
        `<button class="glossy-cover" data-book="${b.id}" style="--book-color:${b.color};--book-index:${i}"><span class="cover-series">TRANSITION TOWN / WORD QUEST</span><span class="cover-emblem" aria-hidden="true">${b.icon}</span><strong>${e(b.title)}</strong><span class="cover-words">20 WORDS · 4 DIFFICULTIES</span><span class="cover-bottom">${Object.entries(
          c.progress,
        )
          .filter(([k]) => k.startsWith(b.id + ":"))
          .reduce(
            (n, [, v]) => n + v,
            0,
          )} pages complete <b>↗</b></span></button>`,
    ).join(
      "",
    )}</div><p class="library-note">Your own pace. Unlimited Beginner hints. Optional vocabulary. No required timer.</p>`;
    ui.instructions =
      "Welcome to the Word Quest library. Choose a book and a difficulty. Every puzzle has twenty words. You can drag across a word, tap its first and last letters, or use the arrow keys and Enter.";
  }
  function openBook(id = c.bookId, level = c.level) {
    bookmark();
    const old = c.bookId + ":" + c.level,
      key = id + ":" + level;
    if (old !== key) {
      c.bookId = id;
      c.level = Number(level);
      const b = c.bookmarks[key];
      c.page = b?.page || 0;
      c.found = structuredClone(b?.found || []);
      c.questionIndex = 0;
      c.questionAnswers = [];
    }
    host.get().options.level = c.level;
    library = false;
    puzzle = generatePuzzle(c.bookId, c.level, c.page, c.seed);
    anchor = null;
    path = [];
    hintPath = [];
    const b = BOOKS.find((b) => b.id === c.bookId);
    content.className = "premium-content word-play";
    content.style.setProperty("--book-color", b.color);
    content.innerHTML = `<div class="book-topline"><button data-ui="library">← Book library</button><span>${e(b.title)} / ${DIFFICULTIES[c.level - 1]}</span><div class="word-top-tools"><label><input type="checkbox" data-ui="timed" ${host.get().options.timed ? "checked" : ""} ${c.level === 1 ? "disabled" : ""}> Optional 10-minute challenge</label><span data-ui="timer"></span></div></div><div class="open-book" data-ui="open-book"><section class="book-left"><header><div><span class="page-eyebrow">CHAPTER ${String(c.page + 1).padStart(2, "0")}</span><h2>${e(b.title)}</h2></div><span class="bubble-badge" aria-hidden="true">${b.icon}</span></header><p class="word-directions" data-ui="directions">${c.level === 1 ? "Find words going right → or down ↓." : c.level === 2 ? "Find words across or down, forward or backward." : "Find words in all eight directions, including diagonals."} Drag, or tap the first and last letter. Keyboard: arrows move; Enter selects endpoints; Escape clears.</p><div class="grid-pan-tools" aria-label="Move around the letter grid"><span>Move the grid</span><button data-grid-pan="left" aria-label="Move grid left">←</button><button data-grid-pan="right" aria-label="Move grid right">→</button><button data-grid-pan="up" aria-label="Move grid up">↑</button><button data-grid-pan="down" aria-label="Move grid down">↓</button></div><div class="letter-scroll"><div class="letter-grid" data-ui="grid" role="grid" aria-label="${e(b.title)} word search, ${puzzle.size} rows and columns" style="--grid-size:${puzzle.size}"><svg class="grid-lines" data-ui="lines" viewBox="0 0 ${puzzle.size} ${puzzle.size}" preserveAspectRatio="none" aria-hidden="true"></svg>${puzzle.grid
      .map(
        (row, r) =>
          `<div class="letter-row" role="row">${row
            .map((v, col) => {
              const i = r * puzzle.size + col;
              return `<button class="bubble-letter" data-cell="${i}" role="gridcell" tabindex="${i === 0 ? "0" : "-1"}" aria-label="Row ${r + 1}, column ${col + 1}, ${v}"><span class="letter-glyph">${v}</span></button>`;
            })
            .join("")}</div>`,
      )
      .join(
        "",
      )}</div></div><div class="page-footer"><span>TRANSITION TOWN · WORD QUEST</span><span>PAGE ${c.page + 1}</span></div></section><section class="book-right"><div class="word-progress"><div><span class="page-eyebrow">YOUR DISCOVERIES</span><h2><b data-ui="count">0</b><small> / 20 words</small></h2></div><button data-ui="hint" ${ui.preferences.hints ? "" : "hidden"}>A little hint ✦</button></div><div class="progress-track"><i data-ui="bar"></i></div><div class="word-bank" data-ui="bank"></div><p class="word-feedback" data-ui="feedback" role="status">Take your time. Every word stays visible after you find it.</p><button class="next-page" data-ui="next" hidden>Beautiful work. Turn the page →</button><details class="word-vocabulary" data-ui="vocabulary"><summary>Optional vocabulary · learn what the words mean</summary><div data-ui="question"></div></details><p class="word-practice-note">No questions are required to finish this page.<br>Hints and active practice time appear in your report.</p></section></div>`;
    ui.instructions = $(root, "directions").textContent;
    update();
    renderQuestion();
    save();
  }
  function update() {
    if (library || !puzzle) return;
    $(root, "count").textContent = c.found.length;
    $(root, "bar").style.width = (c.found.length / 20) * 100 + "%";
    $(root, "next").hidden = c.found.length !== 20;
    $(root, "hint").hidden = !ui.preferences.hints;
    $(root, "bank").innerHTML = puzzle.words
      .map((w, i) => {
        const f = c.found.find((f) => f.word === w),
          n = c.found.indexOf(f);
        return `<button class="bank-word ${f ? "is-found" : ""}" data-read-word="${w}" style="--found-color:${HIGHLIGHTS[Math.max(0, n) % 10]}" aria-label="${e(w)}${f ? ", found" : ""}. Read word aloud"><span class="word-check" aria-hidden="true">${f ? "✓" : "○"}</span><span>${e(w)}</span><span class="word-sound" aria-hidden="true">♪</span></button>`;
      })
      .join("");
    drawPaths();
  }
  function drawPaths() {
    if (!puzzle || library) return;
    const line = (p, color, cls = "") => {
      if (!p.length) return "";
      const a = p[0],
        b = p.at(-1);
      return `<line class="${cls}" x1="${(a % puzzle.size) + 0.5}" y1="${Math.floor(a / puzzle.size) + 0.5}" x2="${(b % puzzle.size) + 0.5}" y2="${Math.floor(b / puzzle.size) + 0.5}" stroke="${color}"/>`;
    };
    $(root, "lines").innerHTML =
      c.found
        .map((f, i) => line(f.path, HIGHLIGHTS[i % 10], "locked-word"))
        .join("") +
      line(hintPath, "#e4aa37", "hint-word") +
      line(path, "#9042cc", "selected-path");
    const selection = new Set(path);
    content.querySelectorAll("[data-cell]").forEach((b) => {
      b.classList.toggle("selecting", selection.has(Number(b.dataset.cell)));
      b.setAttribute(
        "aria-selected",
        String(selection.has(Number(b.dataset.cell))),
      );
    });
  }
  function feedback(text) {
    $(root, "feedback").textContent = text;
  }
  function choose(p) {
    if (!p.length) return;
    const word = selectedWord(puzzle, p),
      duplicate = c.found.some((f) => f.word === word);
    if (word && !duplicate) {
      c.found.push({ word, path: [...p] });
      host.attempt({
        correct: true,
        kind: "game",
        choice: word,
        objective: `Find and recognize ${BOOKS.find((b) => b.id === c.bookId).title} vocabulary.`,
        round: roundId(),
        level: c.level,
      });
      feedback(
        `✓ ${word.toLowerCase()} — found it! ${c.found.length} of 20 words.`,
      );
      chime(ui.preferences.sound, c.found.length === 20);
      celebrate(root, word, ui.preferences.reduced);
      if (c.found.length === 20) {
        const key = c.bookId + ":" + c.level;
        if ((c.progress[key] || 0) <= c.page) {
          c.progress[key] = c.page + 1;
          host.attempt({
            correct: true,
            kind: "round",
            choice: `Completed ${c.bookId}, page ${c.page + 1}`,
            objective: "Complete a twenty-word search page.",
            round: roundId(),
            level: c.level,
          });
        }
        celebrate(
          root,
          "Congratulations! All 20 words found.",
          ui.preferences.reduced,
        );
        feedback(
          "Congratulations! All 20 words found. You can print your page or turn to the next puzzle.",
        );
      }
      save();
    } else if (duplicate)
      feedback("You already found that one. Its highlight stays in place.");
    else {
      feedback(
        "That path is not one of this page’s words yet. Try another straight line.",
      );
      host.attempt({
        correct: false,
        kind: "game",
        choice: p
          .map((i) => puzzle.grid[Math.floor(i / puzzle.size)][i % puzzle.size])
          .join(""),
        objective: "Find a straight word path.",
        round: roundId(),
        level: c.level,
      });
    }
    anchor = null;
    path = [];
    drawPaths();
    update();
  }
  function indexAt(ev) {
    const el = document
      .elementFromPoint(ev.clientX, ev.clientY)
      ?.closest("[data-cell]");
    return el && content.contains(el) ? Number(el.dataset.cell) : null;
  }
  content.addEventListener(
    "pointerdown",
    (ev) => {
      const cell = ev.target.closest("[data-cell]");
      if (!cell || ui.paused) return;
      ev.preventDefault();
      cell.focus();
      const i = Number(cell.dataset.cell);
      dragging = true;
      moved = false;
      origin = { x: ev.clientX, y: ev.clientY, index: i, previous: anchor };
      path = [i];
      content
        .querySelector('[data-ui="grid"]')
        .setPointerCapture?.(ev.pointerId);
      drawPaths();
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "pointermove",
    (ev) => {
      if (!dragging || !origin || ui.paused) return;
      if (Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) > 5)
        moved = true;
      const i = indexAt(ev);
      if (i !== null) {
        path = pathBetween(origin.index, i, puzzle.size);
        drawPaths();
      }
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "pointerup",
    (ev) => {
      if (!dragging || !origin) return;
      dragging = false;
      const grid = content.querySelector('[data-ui="grid"]');
      if (grid.hasPointerCapture?.(ev.pointerId))
        grid.releasePointerCapture(ev.pointerId);
      const i = indexAt(ev) ?? origin.index;
      if (moved) {
        choose(pathBetween(origin.index, i, puzzle.size));
      } else if (ui.preferences.simple === false) {
        anchor = null;
        path = [];
        drawPaths();
        feedback(
          "Drag from the first letter to the last letter. Turn on tap endpoints in Accessibility for simpler controls.",
        );
      } else if (origin.previous !== null) {
        choose(pathBetween(origin.previous, i, puzzle.size));
      } else {
        anchor = i;
        path = [i];
        feedback("First letter selected. Choose the last letter of that word.");
        drawPaths();
      }
      origin = null;
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "pointercancel",
    () => {
      dragging = false;
      anchor = null;
      origin = null;
      path = [];
      drawPaths();
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "keydown",
    (ev) => {
      const cell = ev.target.closest("[data-cell]");
      if (!cell || ui.paused) return;
      const i = Number(cell.dataset.cell),
        r = Math.floor(i / puzzle.size),
        col = i % puzzle.size;
      let n = i;
      if (ev.key === "ArrowLeft") n = r * puzzle.size + Math.max(0, col - 1);
      else if (ev.key === "ArrowRight")
        n = r * puzzle.size + Math.min(puzzle.size - 1, col + 1);
      else if (ev.key === "ArrowUp") n = Math.max(0, r - 1) * puzzle.size + col;
      else if (ev.key === "ArrowDown")
        n = Math.min(puzzle.size - 1, r + 1) * puzzle.size + col;
      else if (ev.key === "Home") n = r * puzzle.size;
      else if (ev.key === "End") n = r * puzzle.size + puzzle.size - 1;
      else if (["Enter", " "].includes(ev.key)) {
        ev.preventDefault();
        if (anchor === null) {
          anchor = i;
          path = [i];
          feedback(
            "First letter selected. Move to the last letter and press Enter.",
          );
        } else choose(pathBetween(anchor, i, puzzle.size));
        drawPaths();
        return;
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        ev.stopPropagation();
        anchor = null;
        path = [];
        drawPaths();
        return;
      } else return;
      ev.preventDefault();
      cell.tabIndex = -1;
      const next = content.querySelector(`[data-cell="${n}"]`);
      next.tabIndex = 0;
      next.focus();
      if (anchor !== null) {
        path = pathBetween(anchor, n, puzzle.size);
        drawPaths();
      }
    },
    { signal: ui.signal },
  );
  function renderQuestion() {
    if (library) return;
    const q = questions(c.bookId, c.level)[c.questionIndex];
    const options = permute(q.options, random(c.seed + c.questionIndex));
    $(root, "question").innerHTML =
      `<p class="vocab-word">${e(q.word)}</p><p>${e(q.prompt)}</p><button data-q-read>Read prompt ♪</button><div class="vocab-options">${options.map((o) => `<button data-answer="${e(o)}">${e(o)}</button>`).join("")}</div><p data-ui="q-feedback" role="status"></p><div class="vocab-nav"><button data-q-prev aria-label="Previous vocabulary question">←</button><span>${c.questionIndex + 1} / 20 optional prompts</span><button data-q-next aria-label="Next vocabulary question">→</button></div>`;
  }
  function panGrid(button) {
    const scroller = content.querySelector(".letter-scroll"),
      dir = button.dataset.gridPan;
    button.focus({ preventScroll: true });
    scroller.scrollBy({
      left:
        dir === "left" ? -scroller.clientWidth * 0.65
          : dir === "right" ? scroller.clientWidth * 0.65 : 0,
      top:
        dir === "up" ? -scroller.clientHeight * 0.65
          : dir === "down" ? scroller.clientHeight * 0.65 : 0,
      behavior: ui.preferences.reduced ? "auto" : "smooth",
    });
  }
  content.addEventListener(
    "pointerdown",
    (ev) => {
      const button = ev.target.closest("[data-grid-pan]");
      if (button && ev.pointerType === "touch" && !ui.paused)
        panTouch = { button, id: ev.pointerId, x: ev.clientX, y: ev.clientY };
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "pointerup",
    (ev) => {
      const touch = panTouch;
      panTouch = null;
      if (
        !touch || touch.id !== ev.pointerId || ui.paused ||
        ev.target.closest("[data-grid-pan]") !== touch.button ||
        Math.hypot(ev.clientX - touch.x, ev.clientY - touch.y) > 10
      ) return;
      // Mobile browsers can suppress a compatibility click after a letter drag.
      // Handle a completed touch directly, then ignore only its duplicate click.
      ev.preventDefault();
      panGrid(touch.button);
      lastTouchPan = { button: touch.button, at: performance.now() };
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "pointercancel",
    () => { panTouch = null; },
    { signal: ui.signal },
  );
  content.addEventListener(
    "click",
    (ev) => {
      if (ui.paused) return;
      const b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.gridPan) {
        const duplicateTouchClick = ev.detail > 0 && ev.pointerType !== "mouse" &&
          lastTouchPan?.button === b && performance.now() - lastTouchPan.at < 800;
        if (!duplicateTouchClick) panGrid(b);
        return;
      }
      if (b.dataset.book)
        openBook(b.dataset.book, Number($(root, "difficulty").value));
      else if (b.dataset.ui === "continue") openBook();
      else if (b.dataset.ui === "library") {
        save();
        libraryView();
      } else if (b.dataset.readWord) ui.say(b.dataset.readWord.toLowerCase());
      else if (b.dataset.ui === "next") {
        bookmark();
        c.page++;
        c.found = [];
        c.questionAnswers = [];
        c.questionIndex = 0;
        openBook();
        $(root, "open-book").classList.add("turning-page");
      } else if (b.dataset.ui === "hint") {
        const f = puzzle.placements.find(
          (p) => !c.found.some((f) => f.word === p.word),
        );
        if (f) {
          hintPath = f.path.slice(0, Math.min(3, f.path.length));
          feedback(
            `Look for ${f.word.toLowerCase()}. Its first letters are glowing.`,
          );
          host.help(`Word Quest hint: ${f.word}`);
          drawPaths();
          clearTimeout(hintTimer);
          hintTimer = setTimeout(() => {
            hintPath = [];
            drawPaths();
          }, 4500);
        }
      } else if (b.hasAttribute("data-q-read")) {
        const q = questions(c.bookId, c.level)[c.questionIndex];
        ui.say(q.prompt + " " + q.options.join(". "));
      } else if (b.dataset.answer) {
        const q = questions(c.bookId, c.level)[c.questionIndex],
          correct = q.answer === b.dataset.answer;
        c.questionAnswers.push({ id: q.id, correct, choice: b.dataset.answer });
        host.attempt({
          kind: "question",
          correct,
          choice: b.dataset.answer,
          objective: q.prompt,
          round: roundId(),
          level: c.level,
        });
        $(root, "q-feedback").textContent = correct
          ? "✓ " + q.feedback
          : "Try another choice. Think about " + q.word.toLowerCase() + ".";
        save();
      } else if (
        b.hasAttribute("data-q-next") ||
        b.hasAttribute("data-q-prev")
      ) {
        c.questionIndex =
          (c.questionIndex + (b.hasAttribute("data-q-next") ? 1 : 19)) % 20;
        renderQuestion();
        save();
      }
    },
    { signal: ui.signal },
  );
  content.addEventListener(
    "change",
    (ev) => {
      if (ev.target.dataset.ui === "difficulty") {
        libraryLevel = Number(ev.target.value);
      }
      if (ev.target.dataset.ui === "mode") {
        host.get().options.mode = ev.target.value;
        if (ev.target.value === "cdc") host.get().options.timed = false;
        host.changed();
      }
      if (ev.target.dataset.ui === "timed") {
        host.get().options.timed = ev.target.checked;
        host.changed();
      }
    },
    { signal: ui.signal },
  );
  const timer = setInterval(() => {
    if (library || !host.get().options.timed) return;
    const elapsed = Math.floor(host.get().activeMs / 1000);
    $(root, "timer").textContent =
      Math.max(0, 600 - elapsed) + " seconds · optional";
    if (elapsed >= 600)
      $(root, "timer").textContent = "Challenge time reached · keep practicing";
  }, 1000);
  ui.onChange = () => update();
  libraryView();
  return {
    ui,
    print(kind) {
      if (kind === "report") return null;
      const p = puzzle || generatePuzzle(c.bookId, c.level, c.page, c.seed);
      return kind === "pair"
        ? wordPrint(p, "bank", c.found, host.identity()) +
            wordPrint(p, "key", c.found, "Teacher copy")
        : wordPrint(p, kind, c.found, host.identity());
    },
    pause(v) {
      ui.onPause(v);
    },
    dispose() {
      disposed = true;
      clearTimeout(hintTimer);
      clearInterval(timer);
      ui.dispose();
    },
  };
}
