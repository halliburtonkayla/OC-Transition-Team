import test from "node:test";
import assert from "node:assert/strict";
import { GAMES, CATEGORIES } from "../assets/learning-arcade/curriculum.mjs";
import {
  makeTask,
  settings,
  wordChoices,
  checkpoint,
  newRun,
  recordAttempt,
  summary,
  ActiveClock,
} from "../assets/learning-arcade/core.mjs";
import {
  reconcileRoster,
  cleanSchedule,
  pullWindows,
  scheduleConflicts,
  validatePlan,
  teacherEmail,
} from "../assets/learning-arcade/management.mjs";
import { reportHTML } from "../assets/learning-arcade/report.mjs";
test("The original six games, 15 categories, and all progressive levels produce solvable tasks", () => {
  assert.equal(GAMES.length, 8);
  assert.equal(CATEGORIES.length, 15);
  for (const mode of ["cdc", "preets", "esp"])
    for (const g of GAMES.filter((g) => !g.premium))
      for (let level = 1; level <= g.levels; level++)
        for (let round = 0; round < 30; round++)
          for (const category of g.id === "match"
            ? CATEGORIES
            : [CATEGORIES[0]]) {
            const t = makeTask(
              g.id,
              { mode, level, category: category.id },
              round,
              177 + round,
            );
            assert.ok(t.objective);
            assert.ok(t.prompt);
            assert.ok(t.spoken);
            if (t.kind === "match") {
              assert.equal(
                new Set(t.items.map((p) => p.id)).size,
                t.items.length,
              );
              assert.deepEqual(
                t.items.map((p) => p.id).sort(),
                t.targets.map((p) => p.id).sort(),
              );
            } else if (t.kind === "word") {
              for (let i = 0; i < t.word.length; i++) {
                const a = wordChoices(t, i);
                assert.equal(a.filter((x) => x.value === t.word[i]).length, 1);
                assert.equal(new Set(a.map((x) => x.id)).size, a.length);
              }
            } else if (["feed", "scan", "pay"].includes(t.kind)) {
              assert.ok(t.answer >= 0);
            } else {
              assert.ok(
                t.options.some((c) => c.value === t.answer),
                g.id + " " + level + " " + round,
              );
              assert.equal(
                new Set(t.options.map((c) => c.id)).size,
                t.options.length,
              );
            }
            const q = checkpoint(t);
            assert.ok(
              q.options.some((c) => c.value === q.answer),
              "Question must have a reachable correct answer",
            );
          }
});
test("Beginner mode cannot inherit a timer or question requirement", () => {
  assert.deepEqual(
    settings({ mode: "cdc", questions: true, timed: true, minutes: 5 })
      .questions,
    false,
  );
  assert.equal(settings({ mode: "cdc", timed: true }).timed, false);
  assert.equal(settings({ mode: "esp", minutes: 10 }).minutes, 10);
  assert.equal(settings({ mode: "preets", minutes: 10 }).minutes, 0);
});
test("Actual attempts, complete rounds and questions stay distinct", () => {
  const r = newRun("match", { mode: "cdc" }, 0),
    task = makeTask("match");
  assert.equal(summary(r).rounds, 0);
  assert.equal(summary(r).accuracy, null);
  recordAttempt(r, { correct: false, task, choice: "wrong" }, 1);
  recordAttempt(r, { correct: true, task, choice: "right" }, 2);
  recordAttempt(r, { correct: true, task, kind: "round" }, 3);
  recordAttempt(r, { correct: true, task, kind: "question" }, 4);
  assert.equal(summary(r).accuracy, 50);
  assert.equal(summary(r).rounds, 1);
  assert.equal(summary(r).questions, 1);
  assert.equal(summary(r).stars, 3);
  r.status = "finished";
  assert.equal(recordAttempt(r, { correct: true, task }), false);
});
test("Active clock excludes hidden, paused, idle and suspended gaps", () => {
  const c = new ActiveClock(0);
  assert.equal(c.tick(1000), 1000);
  assert.equal(c.tick(3000, { paused: true }), 0);
  assert.equal(c.tick(4000), 0);
  c.touch(4000);
  assert.equal(c.tick(5000), 1000);
  assert.equal(c.tick(6000, { visible: false }), 0);
  assert.equal(c.tick(7000, { visible: true }), 0);
  assert.equal(c.tick(100000), 0);
  c.touch(100000);
  assert.equal(c.tick(101000), 1000);
  assert.equal(c.tick(201000), 0);
});
const row = {
  fullName: "Example Learner",
  school: "sf",
  recordKey: "sample-key-123",
  status: "active",
  program: "esp",
  aliases: ["Example"],
  grade: "10",
  gradeVerified: true,
  source: "Verified sample",
};
test("Reconciliation reuses IDs and blocks duplicates, cross-school aliases and missing keys", () => {
  const exists = { ...row, id: crypto.randomUUID() };
  assert.equal(reconcileRoster([row], [exists])[0].id, exists.id);
  assert.equal(reconcileRoster([row], [exists])[0].action, "update");
  assert.throws(() => reconcileRoster([row, row]));
  assert.equal(
    reconcileRoster([{ ...row, school: "oc" }], [exists])[0].action,
    "review",
  );
  assert.equal(
    reconcileRoster([{ ...row, recordKey: "" }])[0].action,
    "review",
  );
  assert.equal(
    reconcileRoster([{ ...row, status: "archived" }], [exists])[0].student
      .status,
    "archived",
  );
});
const elective = {
  period: "2",
  course: "Art",
  teacher: "Teacher Example",
  room: "12",
  start: "09:00",
  end: "09:50",
  days: ["MO", "WE"],
  type: "elective",
  verified: true,
  source: "Sample schedule",
};
test("Only verified electives provide windows; overlapping and tested classes are excluded", () => {
  const rows = cleanSchedule([
    elective,
    { ...elective, period: "3", start: "10:00", end: "10:50", type: "tested" },
    { ...elective, period: "4", start: "11:00", end: "11:50", verified: false },
  ]);
  assert.equal(pullWindows(rows).length, 1);
  assert.equal(pullWindows([{ ...elective, type: "unknown" }]).length, 0);
  assert.throws(() => cleanSchedule([elective, { ...elective }]));
  assert.throws(() => cleanSchedule([{ ...elective, end: "08:00" }]));
  assert.equal(
    pullWindows([
      elective,
      { ...elective, period: "X", start: "09:30", end: "10:00" },
    ]).length,
    0,
  );
  assert.equal(
    scheduleConflicts([elective, { ...elective, period: "X" }]).length,
    1,
  );
});
test("Planning requires verified windows, catches cross-student and travel conflicts and yields an editable unsent email", () => {
  const s = {
      id: crypto.randomUUID(),
      fullName: "Example Learner",
      school: "sf",
      schedule: [elective],
    },
    input = {
      date: "2026-11-04",
      start: "09:00",
      objective: "Workplace communication",
    };
  const p = validatePlan(input, s);
  assert.equal(p.duration, 30);
  assert.throws(() => validatePlan({ ...input, start: "10:00" }, s));
  assert.throws(() => validatePlan(input, s, [{ ...p, id: "other" }]));
  assert.throws(() =>
    validatePlan(input, s, [
      { ...p, id: "other", school: "oc", start: "08:20", duration: 30 },
    ]),
  );
  assert.throws(() => validatePlan({ ...input, date: "2026-11-05" }, s));
  const email = teacherEmail(p, s);
  assert.ok(email.body.includes("Teacher Example"));
  assert.ok(email.body.includes("30 minutes"));
  assert.ok(email.subject.includes("2026-11-04"));
});
test("Reports escape private input and separate CDC, Pre-ETS Learning and ESP evidence", () => {
  const rows = ["cdc", "preets", "esp"].map((mode) => {
    const r = newRun("coins", { mode });
    r.notes = "<script>bad()</script>";
    return r;
  });
  const h = reportHTML(rows, { name: "<b>Student</b>" });
  assert.ok(h.includes("&lt;b&gt;Student"));
  assert.ok(!h.includes("<script>"));
  assert.ok(h.includes("ESP Enrichment"));
  assert.ok(h.includes("not automatically"));
});
