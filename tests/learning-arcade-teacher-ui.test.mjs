import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mountStudentManagement } from "../assets/learning-arcade/teacher.mjs";
import {
  reconcileRoster,
  validatePlan,
} from "../assets/learning-arcade/management.mjs";
const require = createRequire(import.meta.url),
  { JSDOM } = require(
    process.env.ARCADE_JSDOM || "/tmp/learning-arcade-qa/node_modules/jsdom",
  );
test("Actual teacher workspace keeps schools separate, rejects duplicate enrollment, edits verified schedules, plans sessions and drafts unsent email", async () => {
  const dom = new JSDOM('<main id="root"></main>', {
      url: "https://school.example.invalid/classroom-monitor.html",
    }),
    w = dom.window,
    old = { window: globalThis.window, document: globalThis.document };
  globalThis.window = w;
  globalThis.document = w.document;
  w.HTMLElement.prototype.scrollIntoView = () => {};
  const students = [
      {
        id: crypto.randomUUID(),
        recordKey: "fixture-key-111",
        fullName: "Sample Learner",
        school: "sf",
        status: "active",
        program: "cdc",
        grade: "8",
        gradeVerified: true,
        source: "Fixture",
        aliases: ["Sample"],
        learning: { mode: "cdc", questions: false },
        revision: 0,
      },
      {
        id: crypto.randomUUID(),
        recordKey: "fixture-key-222",
        fullName: "Other School Learner",
        school: "oc",
        status: "active",
        program: "esp",
        grade: "10",
        gradeVerified: true,
        source: "Fixture",
        aliases: [],
        learning: { mode: "esp" },
        revision: 0,
      },
    ],
    calls = [],
    management = {
      schedule: [
        {
          period: "2",
          course: "Art",
          teacher: "Teacher Example",
          room: "115",
          start: "09:00",
          end: "09:50",
          days: ["WE"],
          type: "elective",
          verified: true,
          source: "Fixture",
        },
      ],
      plans: [],
    };
  const api = async (action, b = {}) => {
    calls.push({ action, b });
    const s = students.find((x) => x.id === b.studentId);
    if (action === "arcade_roster")
      return { students, revision: 0, legacyProfiles: ["Sample"] };
    if (action === "arcade_profile")
      return {
        student: s,
        management,
        records: [],
        approvedReports: [],
        revision: 0,
      };
    if (action === "arcade_schedule") {
      management.schedule = b.schedule;
      return { saved: true };
    }
    if (action === "arcade_notes") return { saved: true };
    if (action === "arcade_plan") {
      management.plans.push(
        validatePlan(
          b.plan,
          { ...s, schedule: management.schedule },
          [],
          b.plan.duration,
        ),
      );
      return { saved: true };
    }
    if (action === "arcade_preview")
      return { plan: reconcileRoster(b.students, students), revision: 0 };
    throw Error("Unexpected action " + action);
  };
  const root = w.document.getElementById("root"),
    $ = (s) => root.querySelector(s),
    click = (s) => {
      assert.ok($(s), s);
      $(s).click();
    },
    flush = async () => new Promise((r) => setTimeout(r, 10));
  try {
    await mountStudentManagement(root, api);
    assert.equal(root.querySelectorAll("[data-student]").length, 1);
    click("[data-student]");
    await flush();
    assert.ok($("#at-profile").textContent.includes("Sample Learner"));
    click("[data-subview=schedule]");
    $("#at-periods [name=type]").value = "tested";
    $("#at-schedule").dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    );
    await flush();
    assert.ok($("#at-windows").textContent.includes("No verified"));
    $("#at-periods [name=type]").value = "elective";
    $("#at-schedule").dispatchEvent(
      new w.Event("submit", { bubbles: true, cancelable: true }),
    );
    await flush();
    assert.ok($("#at-windows").textContent.includes("09:00"));
    click("[data-subview=plan]");
    const form = $("#at-plan");
    form.elements.date.value = "2026-11-04";
    form.elements.start.value = "09:00";
    form.elements.objective.value = "Workplace communication"; // Use the window FormData implementation when module event handlers run.
    const native = globalThis.FormData;
    globalThis.FormData = w.FormData;
    try {
      form.dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      );
      await flush();
    } finally {
      globalThis.FormData = native;
    }
    click("[data-email-plan]");
    assert.ok($("#at-email-body").value.includes("30 minutes"));
    assert.ok($("#at-email-body").value.includes("Teacher Example"));
    assert.equal(calls.filter((c) => /send|email/.test(c.action)).length, 0);
    click("[data-at=add]");
    const add = $("#at-add");
    add.elements.fullName.value = "Sample Learner";
    add.elements.school.value = "sf";
    globalThis.FormData = w.FormData;
    try {
      add.dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      );
      await flush();
    } finally {
      globalThis.FormData = native;
    }
    assert.ok($("#at-message").textContent.includes("already exists"));
    assert.equal(
      calls.filter((c) => c.action === "arcade_reconcile").length,
      0,
    );
    click("[data-school=oc]");
    assert.equal(root.querySelectorAll("[data-student]").length, 1);
    assert.ok($("#at-students").textContent.includes("Other School Learner"));
    assert.ok(!$("#at-students").textContent.includes("Sample Learner"));
    await mountStudentManagement(root, api);
    const before = calls.length;
    click("[data-at=import]");
    $("#at-roster-json").value = JSON.stringify([
      { ...students[0], aliases: ["Sample"] },
    ]);
    click("[data-at=preview]");
    await flush();
    assert.equal(
      calls.slice(before).filter((c) => c.action === "arcade_preview").length,
      1,
      "remount disposes prior event handlers",
    );
    assert.ok($("#at-import-plan").textContent.includes("Existing ID"));
    assert.equal(
      calls.filter((c) => c.action === "arcade_reconcile").length,
      0,
    );
  } finally {
    globalThis.window = old.window;
    globalThis.document = old.document;
    dom.window.close();
  }
});
