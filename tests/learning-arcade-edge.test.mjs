import test from "node:test";
import assert from "node:assert/strict";
import { handleArcade } from "../supabase/functions/classroom-monitor/arcade.ts";
import {
  newRun,
  makeTask,
  recordAttempt,
} from "../assets/learning-arcade/core.mjs";
const studentId = "11111111-1111-4111-8111-111111111112",
  otherId = "11111111-1111-4111-8111-111111111113",
  teacherId = "11111111-1111-4111-8111-111111111114";
function fixture() {
  const accounts = [
    {
      id: studentId,
      first_name: "Sample",
      full_name: "Sample Learner",
      school_key: "sf",
      record_key: "sample-key-100",
      enrollment_status: "active",
      program: "cdc",
      grade: "8",
      grade_verified: true,
      grade_source: "Fictional fixture",
      profile: { learning: { mode: "cdc", questions: false } },
      revision: 0,
    },
    {
      id: otherId,
      first_name: "Other",
      full_name: "Other Learner",
      school_key: "oc",
      record_key: "other-key-100",
      enrollment_status: "active",
      program: "preets",
      grade: "10",
      grade_verified: true,
      profile: {},
      revision: 0,
    },
  ];
  const approvedReports = [
    {
      id: "latest-service",
      status: "approved",
      student: "Sample",
      created_at: "2026-11-02T15:00:00Z",
      draft: { end: "2026-11-02T15:00:00Z" },
    },
    {
      id: "later-entry-old-service",
      status: "approved",
      student: "Sample",
      created_at: "2026-11-03T15:00:00Z",
      draft: { end: "2026-11-01T15:00:00Z" },
    },
  ];
  const states = [
    {
      student_id: studentId,
      state: {
        legacy: "preserved",
        arcade: { private: { id: "private", options: { mode: "cdc" } } },
      },
      revision: 0,
    },
  ];
  let saved = null,
    teacherReads = 0;
  const fail = (status, message) => {
    throw Object.assign(Error(message), { status });
  };
  const db = async (path, method = "GET", body) => {
    const u = new URL("https://example.invalid/" + path),
      table = u.pathname.slice(1);
    if (table.startsWith("rpc/")) {
      saved = { path, body };
      return { saved: true };
    }
    let a =
      table === "student_accounts"
        ? accounts
        : table === "student_state"
          ? states
          : table === "tt_student_aliases"
            ? [{ alias: "Sample", student_id: studentId }]
            : table === "tt_monitor_reports"
              ? approvedReports
              : table === "tt_monitor_settings"
                ? [{ roster_revision: 0 }]
                : table === "tt_phone_contacts"
                  ? [{ name: "Sample" }, { name: "Unlinked" }]
                  : [];
    for (const [k, v] of u.searchParams) {
      if (["select", "order", "limit"].includes(k)) continue;
      if (v.startsWith("eq."))
        a = a.filter((r) => String(r[k]) === decodeURIComponent(v.slice(3)));
    }
    if (method === "PATCH") {
      a.forEach((r) => Object.assign(r, body));
    }
    if (method === "POST" && table === "tt_monitor_devices")
      saved = { path, body };
    return structuredClone(a);
  };
  const c = {
    api: db,
    fail,
    hash: async (s) => "hashed:" + s,
    teacher: async (req) => {
      if (req.headers.get("authorization") !== "Bearer approved")
        fail(
          req.headers.get("authorization") ? 403 : 401,
          "Teacher authorization required",
        );
      teacherReads++;
      return { id: teacherId };
    },
    student: async (token) => {
      if (
        token !== "verified" &&
        token !== "pending" &&
        token !== "wrong-school"
      )
        fail(401, "Invalid device");
      return {
        student_id: studentId,
        student: "Sample",
        school:
          token === "wrong-school"
            ? "Obion County Central High School"
            : "South Fulton Middle/High School",
        approved_at: token === "pending" ? null : "2026-11-03T00:00:00Z",
      };
    },
  };
  return {
    accounts,
    states,
    c,
    get saved() {
      return saved;
    },
    get teacherReads() {
      return teacherReads;
    },
    call: async (action, b = {}, auth = "") =>
      handleArcade(
        action,
        b,
        new Request("https://example.invalid", {
          headers: auth ? { Authorization: "Bearer " + auth } : {},
        }),
        c,
      ),
  };
}
test("Every teacher route rejects missing/unapproved auth before reading student records", async () => {
  for (const action of [
    "arcade_roster",
    "arcade_preview",
    "arcade_reconcile",
    "arcade_profile",
    "arcade_schedule",
    "arcade_plan",
    "arcade_notes",
    "arcade_device",
    "arcade_export",
    "arcade_week",
    "arcade_observation",
  ]) {
    const f = fixture();
    await assert.rejects(
      () => f.call(action),
      (e) => e.status === 401,
    );
    await assert.rejects(
      () => f.call(action, {}, "other"),
      (e) => e.status === 403,
    );
    assert.equal(f.teacherReads, 0);
  }
});
test("Device identity owns its records; student-supplied identifiers cannot cross schools", async () => {
  const f = fixture();
  const own = await f.call("arcade_me", {
    token: "verified",
    studentId: otherId,
  });
  assert.equal(own.profile.id, studentId);
  assert.equal(own.profile.displayName, "Sample");
  assert.equal(own.records.length, 1);
  assert.ok(!("recordKey" in own.profile));
  await assert.rejects(
    () => f.call("arcade_me", { token: "pending" }),
    (e) => e.status === 403,
  );
  await assert.rejects(
    () => f.call("arcade_me", { token: "wrong-school" }),
    (e) => e.status === 403,
  );
  await assert.rejects(
    () => f.call("arcade_me", { token: "guessed" }),
    (e) => e.status === 401,
  );
});
test("Only validated practice reaches the existing state RPC; no banking or official-service call occurs", async () => {
  const f = fixture(),
    run = newRun("coins", { mode: "esp", record: true });
  recordAttempt(run, {
    task: makeTask("coins"),
    correct: true,
    choice: "Penny",
  });
  await f.call("arcade_save", { token: "verified", studentId: otherId, run });
  assert.equal(f.saved.body.p_student, studentId);
  assert.ok(f.saved.path.includes("tt_arcade_save_run"));
  assert.equal(f.saved.body.p_run.options.mode, "esp");
  assert.ok(!("teacherNotes" in f.saved.body.p_run));
  await assert.rejects(
    () =>
      f.call("arcade_save", {
        token: "verified",
        run: { ...run, activeMs: 9999999 },
      }),
    (e) => e.status === 400,
  );
  await assert.rejects(
    () =>
      f.call("arcade_save", {
        token: "verified",
        run: { ...run, game: "unapproved" },
      }),
    (e) => e.status === 400,
  );
});
test("Roster preview and stale-note updates preserve stable IDs and require review", async () => {
  const f = fixture(),
    input = {
      fullName: "Sample Learner",
      school: "sf",
      recordKey: "sample-key-100",
      aliases: ["Sample"],
      status: "active",
      grade: "8",
      gradeVerified: true,
      source: "Fictional fixture",
    };
  const preview = await f.call(
    "arcade_preview",
    { students: [input] },
    "approved",
  );
  assert.equal(preview.plan[0].id, studentId);
  assert.equal(preview.plan[0].action, "update");
  assert.equal(f.saved, null);
  await assert.rejects(
    () =>
      f.call(
        "arcade_reconcile",
        { students: [input], reviewed: false, revision: 0 },
        "approved",
      ),
    (e) => e.status === 400,
  );
  await assert.rejects(
    () =>
      f.call(
        "arcade_notes",
        { studentId, profileRevision: 4, notes: "stale" },
        "approved",
      ),
    (e) => e.status === 409,
  );
  assert.ok(!f.accounts[0].profile.communicationNotes);
});
test("Private device provisioning stores only a hash; it never alters financial/legacy contacts", async () => {
  const f = fixture(),
    d = await f.call("arcade_device", { studentId }, "approved");
  assert.equal(d.token.length, 64);
  assert.equal(f.saved.body.student_id, studentId);
  assert.ok(f.saved.body.token_hash.startsWith("hashed:tt-monitor-v1:"));
  assert.ok(!("token" in f.saved.body));
  assert.equal(f.states[0].state.legacy, "preserved");
});
test("Unknown or inconsistent scheduling data never becomes an elective suggestion", async () => {
  const f = fixture();
  await assert.rejects(
    () =>
      f.call(
        "arcade_plan",
        {
          studentId,
          plan: { date: "2026-11-04", start: "09:00", duration: 30 },
          revision: 0,
        },
        "approved",
      ),
    (e) => e.status === 400,
  );
  await assert.rejects(
    () =>
      f.call(
        "arcade_schedule",
        {
          studentId,
          schedule: [
            {
              period: "1",
              start: "10:00",
              end: "09:00",
              days: ["MO"],
              type: "elective",
              verified: true,
              source: "fixture",
            },
          ],
        },
        "approved",
      ),
    (e) => e.status === 400,
  );
  assert.equal(f.saved, null);
});

test("Last approved service uses the actual service date rather than the report creation date", async () => {
  const f = fixture();
  const d = await f.call("arcade_profile", { studentId }, "approved");
  assert.equal(d.approvedReports[0].id, "latest-service");
});

test('Expansion games save only validated own-learner checkpoints through the existing private service', async()=>{
 const {generatePuzzle}=await import('../assets/learning-arcade/expansion/word-core.mjs');
 const f=fixture(),p=generatePuzzle('careers',1,0,51),run=newRun('wordquest',{mode:'preets',record:true});
 run.checkpoint={version:1,seed:51,level:1,page:0,bookId:'careers',found:[p.placements[0]],progress:{},bookmarks:{},teacherNotes:'forged',studentId:otherId};run.checkpointRevision=1;run.teacherNotes='forged';
 await f.call('arcade_save',{token:'verified',studentId:otherId,run});
 assert.equal(f.saved.body.p_student,studentId);assert.equal(f.saved.body.p_run.checkpoint.found.length,1);assert.equal(f.saved.body.p_run.checkpointRevision,1);assert.ok(!('teacherNotes'in f.saved.body.p_run));assert.ok(!('studentId'in f.saved.body.p_run.checkpoint));assert.ok(!('teacherNotes'in f.saved.body.p_run.checkpoint));
 run.checkpoint.found=[{word:p.words[0],path:[0,1]}];await assert.rejects(()=>f.call('arcade_save',{token:'verified',run}),/Invalid saved word/);
 await assert.rejects(()=>f.call('arcade_save',{token:'pending',run}),/approve this device/);
});
test('Dress checkpoints recompute practical results and preserve outfit/avatar without allowing forged teacher evidence',async()=>{
 const {defaultAvatar,defaultOutfit}=await import('../assets/learning-arcade/expansion/dress-data.mjs');
 const {makeScenario,evaluateOutfit}=await import('../assets/learning-arcade/expansion/dress-core.mjs');
 const f=fixture(),run=newRun('dresspart',{mode:'esp',record:true});run.checkpointRevision=2;run.checkpoint={version:1,seed:51,level:3,index:0,avatar:{...defaultAvatar(),body:2},outfit:defaultOutfit(),history:[{level:3,index:0,at:new Date().toISOString(),outfit:defaultOutfit(),evaluation:{success:true,score:100},attempt:1,teacherNotes:'forged'}]};
 await f.call('arcade_save',{token:'verified',run});const cp=f.saved.body.p_run.checkpoint;
 assert.equal(cp.avatar.body,2);assert.deepEqual(cp.history[0].evaluation,evaluateOutfit(makeScenario(3,0,51),defaultOutfit()));assert.ok(!('teacherNotes'in cp.history[0]));assert.equal(f.saved.body.p_run.options.mode,'esp');
});
