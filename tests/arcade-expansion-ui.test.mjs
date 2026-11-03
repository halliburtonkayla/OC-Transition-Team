import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  { JSDOM } = require(
    process.env.ARCADE_JSDOM || "/tmp/learning-arcade-qa/node_modules/jsdom",
  );
import { generatePuzzle } from "../assets/learning-arcade/expansion/word-core.mjs";
test("Actual Word Quest DOM supports mouse/touch paths, keyboard words, 20 locked highlights, check marks, questions, page turns and bookmarks", async () => {
  const dom = new JSDOM('<dialog open><div id="root"></div></dialog>', {
      url: "https://fixture.example.invalid",
      pretendToBeVisual: true,
    }),
    w = dom.window,
    originals = new Map();
  for (const k of ["window", "document", "matchMedia", "AbortController"])
    originals.set(k, Object.getOwnPropertyDescriptor(globalThis, k));
  Object.defineProperties(globalThis, {
    window: { value: w, configurable: true },
    document: { value: w.document, configurable: true },
    matchMedia: { value: () => ({ matches: true }), configurable: true },
    AbortController: { value: w.AbortController, configurable: true },
  });
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  const root = w.document.querySelector("#root"),
    run = { options: { mode: "cdc", record: false }, activeMs: 0 },
    events = [],
    helps = [];
  let mounted,
    saveCount = 0;
  const host = {
    get: () => run,
    notice: () => "Fixture only",
    connected: () => false,
    identity: () => "Fictional QA",
    changed() {},
    save: async () => {
      saveCount++;
      return true;
    },
    pause() {},
    exit() {},
    print() {},
    attempt: (x) => events.push(x),
    help: (x) => helps.push(x),
  };
  const click = (s) => {
    const n = root.querySelector(s);
    assert.ok(n, s);
    n.click();
  };
  try {
    const mod = await import(
      "../assets/learning-arcade/expansion/word-app.mjs"
    );
    run.checkpoint = {
      ...mod.initialWord(),
      seed: 126,
      preferences: { sound: false, reduced: true, text: 1, hints: true },
    };
    mounted = await mod.mount(root, host);
    assert.equal(root.querySelectorAll("[data-book]").length, 10);
    click("[data-book=careers]");
    const p = generatePuzzle("careers", 1, 0, 126);
    const cell = (i) => root.querySelector(`[data-cell="${i}"]`);
    function pointerPath(f, drag = false) {
      let current = cell(f.path[0]);
      w.document.elementFromPoint = () => current;
      const down = () =>
          current.dispatchEvent(
            new w.MouseEvent("pointerdown", {
              bubbles: true,
              clientX: 10,
              clientY: 10,
            }),
          ),
        up = () =>
          current.dispatchEvent(
            new w.MouseEvent("pointerup", {
              bubbles: true,
              clientX: 10,
              clientY: 10,
            }),
          );
      down();
      if (drag) {
        current = cell(f.path.at(-1));
        current.dispatchEvent(
          new w.MouseEvent("pointermove", {
            bubbles: true,
            clientX: 50,
            clientY: 10,
          }),
        );
        up();
      } else {
        up();
        current = cell(f.path.at(-1));
        down();
        up();
      }
    }
    pointerPath(p.placements[0], true);
    assert.equal(run.checkpoint.found.length, 1);
    pointerPath(p.placements[0], true);
    assert.equal(run.checkpoint.found.length, 1);
    const f = p.placements[1];
    cell(f.path[0]).dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    cell(f.path.at(-1)).dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    assert.equal(run.checkpoint.found.length, 2);
    for (const f of p.placements.slice(2)) pointerPath(f);
    assert.equal(run.checkpoint.found.length, 20);
    assert.equal(root.querySelectorAll(".locked-word").length, 20);
    assert.equal(root.querySelectorAll(".bank-word.is-found").length, 20);
    assert.ok(
      [...root.querySelectorAll(".word-check")].every(
        (n) => n.textContent === "✓",
      ),
    );
    assert.equal(events.filter((x) => x.kind === "round").length, 1);
    click("[data-ui=hint]");
    assert.equal(helps.length, 0);
    click("[data-answer]");
    assert.equal(events.filter((x) => x.kind === "question").length, 1);
    assert.ok(mounted.print("bank").includes("Student puzzle"));
    assert.ok(mounted.print("key").includes("Teacher answer key"));
    click("[data-ui=next]");
    assert.equal(run.checkpoint.page, 1);
    assert.equal(run.checkpoint.found.length, 0);
    const next = generatePuzzle("careers", 1, 1, 126);
    pointerPath(next.placements[0]);
    click("[data-ui=library]");
    click("[data-book=money]");
    assert.equal(run.checkpoint.bookId, "money");
    click("[data-ui=library]");
    click("[data-book=careers]");
    assert.equal(run.checkpoint.page, 1);
    assert.equal(run.checkpoint.found.length, 1);
    assert.ok(saveCount > 20);
  } finally {
    mounted?.dispose();
    w.close();
    for (const [k, v] of originals)
      if (v) Object.defineProperty(globalThis, k, v);
      else delete globalThis[k];
  }
});
