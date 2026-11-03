import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  { JSDOM } = require(
    process.env.ARCADE_JSDOM || "/tmp/learning-arcade-qa/node_modules/jsdom",
  );
test("Actual arcade DOM supports all six games, questions, beginner practice, settings and printable evidence without touching Town finances", async () => {
  const dom = new JSDOM(fs.readFileSync("learning-arcade.html", "utf8"), {
      url: "https://school.example.invalid/learning-arcade.html",
      pretendToBeVisual: true,
    }),
    w = dom.window;
  const saved = new Map(),
    timers = [];
  for (const key of [
    "window",
    "document",
    "sessionStorage",
    "localStorage",
    "navigator",
    "speechSynthesis",
    "SpeechSynthesisUtterance",
    "matchMedia",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "ResizeObserver",
    "devicePixelRatio",
    "innerWidth",
  ])
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  const define = (k, v) =>
    Object.defineProperty(globalThis, k, {
      value: v,
      configurable: true,
      writable: true,
    });
  const originalInterval = globalThis.setInterval;
  define("window", w);
  define("document", w.document);
  define("sessionStorage", w.sessionStorage);
  define("localStorage", w.localStorage);
  define("navigator", w.navigator);
  define("speechSynthesis", { cancel() {}, speak() {} });
  w.speechSynthesis = globalThis.speechSynthesis;
  define(
    "SpeechSynthesisUtterance",
    class {
      constructor(text) {
        this.text = text;
      }
    },
  );
  w.SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance;
  define("matchMedia", () => ({ matches: false }));
  define("devicePixelRatio", 1);
  define("innerWidth", 1366);
  define("requestAnimationFrame", () => 1);
  define("cancelAnimationFrame", () => {});
  define(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  w.HTMLCanvasElement.prototype.getContext = () => null;
  globalThis.setInterval = (fn, ms) => {
    const t = originalInterval(fn, ms);
    t.unref();
    timers.push(t);
    return t;
  };
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  let prints = 0;
  w.print = () => prints++;
  w.localStorage.setItem(
    "ttWorld",
    '{"students":{"existing":{"balance":9123,"business":"preserved"}}}',
  );
  const original = w.localStorage.getItem("ttWorld");
  const $ = (s) => w.document.querySelector(s),
    click = (s) => {
      const b = $(s);
      assert.ok(b, s);
      b.click();
    },
    change = (s, v) => {
      $(s).value = v;
      $(s).dispatchEvent(new w.Event("change", { bubbles: true }));
    },
    flush = async () => {
      await new Promise((r) => setTimeout(r, 10));
    };
  try {
    await import("../assets/learning-arcade/app.mjs?dom-test=1");
    await flush();
    assert.equal(w.document.querySelectorAll("[data-launch]").length, 6);
    const start = (id, { mode = "cdc", level = 1, questions = false } = {}) => {
      click(`[data-launch="${id}"]`);
      change("#setup-mode", mode);
      change("#setup-level", String(level));
      $("#setup-questions").checked = questions;
      $("#setup-form").dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      );
    };
    const matchRound = () => {
      for (const b of [...w.document.querySelectorAll("[data-item]")]) {
        click(`[data-item="${b.dataset.item}"]`);
        click(`[data-target="${b.dataset.item}"]`);
      }
    };
    start("match");
    assert.ok($("#setup-questions").disabled);
    assert.ok($("#setup-timed").disabled);
    matchRound();
    assert.equal($("#next-round").textContent, "Next round →");
    click("#next-round");
    assert.ok($("#play-level").textContent.includes("LEVEL 1"));
    click("#leave-game");
    await flush();
    start("match", { mode: "preets", questions: true });
    matchRound();
    assert.equal($("#next-round").textContent, "Learning question →");
    click("#next-round");
    assert.ok(
      $("#game-prompt").textContent.startsWith("Which picture matches"),
    );
    const firstItem = (
      await import("../assets/learning-arcade/core.mjs")
    ).makeTask("match", { mode: "preets", level: 1, category: "colors" }, 0, 42)
      .items[0];
    const task = (await import("../assets/learning-arcade/core.mjs")).makeTask(
      "match",
      { mode: "preets", level: 1, category: "colors" },
      0,
      42,
    );
    const answer = task.targets.findIndex((t) => t.id === firstItem.id);
    click(`[data-choice="${answer}"]`);
    assert.equal($("#next-round").textContent, "Next round →");
    click("#leave-game");
    await flush();
    start("coins");
    const coinTask = (
      await import("../assets/learning-arcade/core.mjs")
    ).makeTask("coins", { mode: "cdc" }, 0, 42);
    const coinIndex = coinTask.options.findIndex(
      (c) => c.value === coinTask.answer,
    );
    click(`[data-choice="${coinIndex}"]`);
    assert.ok(!$("#next-round").hidden);
    click("#leave-game");
    await flush();
    start("phonics");
    const a = [...w.document.querySelectorAll("[data-choice]")].find(
      (b) => b.getAttribute("aria-label") === "A",
    );
    a.click();
    assert.ok(!$("#next-round").hidden);
    click("#leave-game");
    await flush();
    start("monsters");
    click('[data-feed="add"]');
    click('[data-feed="check"]');
    assert.ok(!$("#next-round").hidden);
    click("#leave-game");
    await flush();
    start("words", { level: 2 });
    for (const letter of ["C", "A", "T"]) {
      const b = [...w.document.querySelectorAll("[data-choice]")].find(
        (b) => b.getAttribute("aria-label") === letter,
      );
      assert.ok(b, letter);
      b.click();
    }
    assert.ok(!$("#next-round").hidden);
    click("#leave-game");
    await flush();
    start("store");
    click("[data-scan-next]");
    assert.ok(!$("#next-round").hidden);
    click("#leave-game");
    await flush();
    start("store", { mode: "preets", level: 6 });
    const quarter = [...w.document.querySelectorAll("[data-choice]")].find(
      (b) => b.getAttribute("aria-label") === "Quarter",
    );
    quarter.click();
    click("[data-pay-check]");
    assert.ok(!$("#next-round").hidden);
    click("#next-round");
    assert.ok($("#game-prompt").textContent.includes("50 cents"));
    for (let i = 0; i < 2; i++) {
      [...w.document.querySelectorAll("[data-choice]")]
        .find((b) => b.getAttribute("aria-label") === "Quarter")
        .click();
    }
    click("[data-pay-check]");
    assert.ok(!$("#next-round").hidden);
    click("#leave-game");
    await flush();
    click("#progress-button");
    assert.ok(
      $("#progress-content").textContent.includes("Superstore Money Dash"),
    );
    click("#print-progress");
    assert.equal(prints, 1);
    assert.ok($("#print-area").textContent.includes("CDC Beginner"));
    assert.ok($("#print-area").textContent.includes("Pre-ETS Learning"));
    assert.equal(w.localStorage.getItem("ttWorld"), original);
    assert.equal(
      w.localStorage.length,
      1,
      "no new identifiable local record store",
    );
  } finally {
    for (const timer of timers) clearInterval(timer);
    globalThis.setInterval = originalInterval;
    for (const [key, d] of saved)
      if (d) Object.defineProperty(globalThis, key, d);
      else delete globalThis[key];
    dom.window.close();
  }
});
