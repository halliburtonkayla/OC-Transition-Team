import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  { JSDOM } = require(
    process.env.ARCADE_JSDOM || "/tmp/learning-arcade-qa/node_modules/jsdom",
  );
test("Actual arcade DOM supports all six games, questions, beginner practice, settings and printable evidence without touching Town finances", async (t) => {
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
    "fetch",
    "AbortController",
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
  define("AbortController", w.AbortController);
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
      await new Promise((r) => setTimeout(r, 70));
    };
  try {
    await import("../assets/learning-arcade/app.mjs?dom-test=1");
    await flush();
    assert.equal(w.document.querySelectorAll("[data-launch]").length, 8);
    const start = (
      id,
      { mode = "cdc", level = 1, questions = false, record } = {},
    ) => {
      click(`[data-launch="${id}"]`);
      change("#setup-mode", mode);
      change("#setup-level", String(level));
      $("#setup-questions").checked = questions;
      if (record !== undefined) $("#setup-record").checked = record;
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
    click('[data-close="progress-dialog"]');
    await t.test(
      "Guest, connected, unrecorded and failed-save evidence stays with its own learner across lock/reconnect",
      async () => {
        const serverRecords = new Map();
        let failSave = false;
        define("fetch", async (_url, options) => {
          const body = JSON.parse(options.body);
          assert.ok(["fixture-one", "fixture-two"].includes(body.token));
          if (body.action === "arcade_me")
            return {
              ok: true,
              json: async () => ({
                profile: {
                  id: body.token,
                  displayName:
                    body.token === "fixture-one"
                      ? "Sample learner one"
                      : "Sample learner two",
                  schoolLabel: "Fictional school",
                },
                records: structuredClone(serverRecords.get(body.token) || []),
              }),
            };
          assert.equal(body.action, "arcade_save");
          if (failSave)
            return {
              ok: false,
              status: 503,
              json: async () => ({ error: "Fixture offline" }),
            };
          const own = serverRecords.get(body.token) || [];
          serverRecords.set(
            body.token,
            own
              .filter((r) => r.id !== body.run.id)
              .concat(structuredClone(body.run)),
          );
          return { ok: true, json: async () => ({ saved: true }) };
        });
        const connectAs = async (key) => {
          click("#connect-button");
          $("#device-key").value = key;
          $("#connect-form").dispatchEvent(
            new w.Event("submit", { bubbles: true, cancelable: true }),
          );
          await flush();
          assert.equal($("#connect-dialog").open, false);
        };
        const progressCount = () => {
          click("#progress-button");
          const count = w.document.querySelectorAll(
            "#progress-content .report-entry",
          ).length;
          click("#print-progress");
          click('[data-close="progress-dialog"]');
          return count;
        };
        const guests = progressCount();
        assert.equal(guests, 8);
        await connectAs("fixture-one");
        assert.equal(
          $("#print-area").textContent,
          "",
          "connecting clears rendered guest evidence",
        );
        assert.equal(
          progressCount(),
          0,
          "guest practice is never attributed to a student",
        );
        assert.ok($("#print-area").textContent.includes("Sample learner one"));
        start("monsters", { record: false });
        click('[data-feed="add"]');
        click('[data-feed="check"]');
        click("#leave-game");
        await flush();
        assert.equal(progressCount(), 1);
        assert.ok(
          $("#print-area").textContent.includes("Feed the Number Monsters"),
        );
        click("#disconnect-button");
        await flush();
        assert.equal(
          $("#print-area").textContent,
          "",
          "locking clears the learner's rendered report",
        );
        assert.equal(
          progressCount(),
          guests,
          "student's unrecorded game does not become guest evidence",
        );
        await connectAs("fixture-two");
        assert.equal(
          progressCount(),
          0,
          "another student sees neither prior identity's evidence",
        );
        click("#disconnect-button");
        await flush();
        await connectAs("fixture-one");
        assert.equal(
          progressCount(),
          1,
          "open-page unrecorded practice returns only to its owner",
        );
        failSave = true;
        start("match");
        matchRound();
        click("#leave-game");
        await flush();
        assert.equal(progressCount(), 2);
        assert.ok($("#print-area").textContent.includes("UNSAVED"));
        click("#disconnect-button");
        await flush();
        await connectAs("fixture-one");
        assert.equal(
          progressCount(),
          2,
          "failed-save printable fallback survives reconnect for the same owner",
        );
        failSave = false;
        start("phonics");
        [...w.document.querySelectorAll("[data-choice]")]
          .find((b) => b.getAttribute("aria-label") === "A")
          .click();
        click("#leave-game");
        await flush();
        assert.equal(progressCount(), 3);
        assert.equal(serverRecords.get("fixture-one").length, 1);
        assert.equal(w.localStorage.getItem("ttWorld"), original);
        assert.equal(w.localStorage.length, 1);

        // Exercise the expansion through the actual shared host, including a
        // failed save, resume/recovery, and a different learner on this device.
        failSave = true;
        click('[data-launch="wordquest"]');
        await flush();
        click('[data-book="careers"]');
        await flush();
        click('[data-ui="save"]');
        await flush();
        assert.ok(
          $('[data-ui="notice"]').textContent.includes("Could not save:"),
        );
        click('[data-ui="exit"]');
        await flush();
        assert.equal(progressCount(), 4);
        const wordEntry = () =>
          [
            ...w.document.querySelectorAll("#progress-content .report-entry"),
          ].find((e) => e.textContent.includes("Word Quest"));
        click("#progress-button");
        assert.ok(wordEntry().textContent.includes("UNSAVED"));
        click('[data-close="progress-dialog"]');
        failSave = false;
        click('[data-launch="wordquest"]');
        await flush();
        click('[data-ui="continue"]');
        await flush();
        click('[data-ui="save"]');
        await flush();
        click('[data-ui="exit"]');
        await flush();
        click("#progress-button");
        assert.ok(!wordEntry().textContent.includes("UNSAVED"));
        click('[data-close="progress-dialog"]');
        assert.equal(progressCount(), 4);
        assert.equal(serverRecords.get("fixture-one").length, 2);
        click("#disconnect-button");
        await flush();
        await connectAs("fixture-two");
        assert.equal(progressCount(), 0);
        assert.equal(w.localStorage.getItem("ttWorld"), original);
      },
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
