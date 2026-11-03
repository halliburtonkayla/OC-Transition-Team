// QA only: fictional identifiers, no network requests or real student records.
import { mountStudentManagement } from "../assets/learning-arcade/teacher.mjs";
import {
  reconcileRoster,
  cleanSchedule,
  validatePlan,
} from "../assets/learning-arcade/management.mjs";
import {
  newRun,
  makeTask,
  recordAttempt,
  uid,
} from "../assets/learning-arcade/core.mjs";
const students = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    recordKey: "fictional-1000",
    fullName: "Sample Learner",
    school: "sf",
    status: "active",
    program: "cdc",
    grade: "8",
    gradeVerified: true,
    source: "Fictional QA fixture",
    aliases: ["Sample"],
    learning: {
      mode: "cdc",
      level: 1,
      category: "coins",
      questions: false,
      recommendedGame: "coins",
      objective: "Identify coins using pictures and spoken directions.",
    },
    revision: 0,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    recordKey: "fictional-2000",
    fullName: "Example Learner",
    school: "sf",
    status: "active",
    program: "preets",
    grade: "10",
    gradeVerified: true,
    source: "Fictional QA fixture",
    aliases: ["Example"],
    learning: {
      mode: "preets",
      level: 3,
      category: "service",
      questions: true,
    },
    revision: 0,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    recordKey: "fictional-3000",
    fullName: "Archived Example",
    school: "sf",
    status: "archived",
    program: "preets",
    grade: "12",
    gradeVerified: true,
    source: "Fictional QA fixture",
    aliases: [],
    learning: {},
    revision: 0,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    recordKey: "fictional-4000",
    fullName: "Other School Learner",
    school: "oc",
    status: "active",
    program: "esp",
    grade: "10",
    gradeVerified: true,
    source: "Fictional QA fixture",
    aliases: [],
    learning: { mode: "esp" },
    revision: 0,
  },
];
const records = [],
  states = new Map();
for (const s of students)
  states.set(s.id, {
    revision: 0,
    management: {
      schedule: [
        {
          period: "2",
          course: "Art",
          teacher: "Teacher Example",
          room: "115",
          start: "09:00",
          end: "09:50",
          days: ["MO", "TU", "WE", "TH", "FR"],
          type: "elective",
          verified: true,
          source: "Fictional schedule",
        },
      ],
      plans: [],
    },
  });
const run = newRun("coins", { mode: "cdc" }, Date.now() - 180000);
run.activeMs = 90000;
const task = makeTask("coins", { mode: "cdc" });
recordAttempt(run, { task, correct: true, choice: "Penny" });
recordAttempt(run, {
  task,
  correct: true,
  kind: "round",
  choice: "Completed round",
});
run.endedAt = new Date().toISOString();
run.status = "finished";
records.push(run);
async function api(action, b = {}) {
  const s = students.find((x) => x.id === b.studentId),
    state = s ? states.get(s.id) : null;
  if (action === "arcade_roster")
    return {
      students: structuredClone(students),
      legacyProfiles: ["Sample", "Example", "Unlinked Example"],
      revision: 0,
    };
  if (action === "arcade_profile" || action === "arcade_export")
    return {
      student: structuredClone(s),
      ...structuredClone(state),
      records: s.id === students[0].id ? structuredClone(records) : [],
      approvedReports: [],
    };
  if (action === "arcade_week")
    return {
      students: students.map((s) => ({
        ...s,
        plans: states.get(s.id).management.plans,
        scheduleCount: 1,
        records: s.id === students[0].id ? records : [],
      })),
    };
  if (action === "arcade_preview")
    return { plan: reconcileRoster(b.students, students), revision: 0 };
  if (action === "arcade_reconcile") {
    for (const p of reconcileRoster(b.students, students)) {
      if (p.action === "update")
        Object.assign(
          students.find((s) => s.id === p.id),
          p.student,
        );
      else if (p.action === "create") {
        const id = uid();
        students.push({ ...p.student, id });
        states.set(id, {
          revision: 0,
          management: { schedule: [], plans: [] },
        });
      } else throw Error("Resolve uncertain matches.");
    }
    return { count: b.students.length };
  }
  if (action === "arcade_notes") {
    Object.assign(s, {
      learning: b.learning,
      communicationNotes: b.notes,
      revision: s.revision + 1,
    });
    return { saved: true };
  }
  if (action === "arcade_schedule") {
    state.management.schedule = cleanSchedule(b.schedule);
    state.revision++;
    return { saved: true };
  }
  if (action === "arcade_plan") {
    const plans = [...states.values()].flatMap((s) => s.management.plans);
    const p = validatePlan(
      b.plan,
      { ...s, schedule: state.management.schedule },
      plans,
      b.plan.duration,
    );
    state.management.plans.push(p);
    state.revision++;
    return { saved: true };
  }
  if (action === "arcade_device")
    return {
      token: "fictional-key-only-not-valid-in-production",
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };
  if (action === "arcade_observation") {
    state.management.observations = {
      ...state.management.observations,
      [b.runId]: { notes: b.notes, assistance: b.assistance },
    };
    records.find((r) => r.id === b.runId).teacherNotes = b.notes;
    return { saved: true };
  }
  throw Error("Unsupported fixture operation");
}
await mountStudentManagement(document.getElementById("teacher-fixture"), api);
