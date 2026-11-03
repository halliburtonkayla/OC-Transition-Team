import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PGlite } = require(
  process.env.ARCADE_PGLITE ||
    "/tmp/learning-arcade-qa/node_modules/@electric-sql/pglite",
);
const teacher = "11111111-1111-4111-8111-111111111111";
async function setup() {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${teacher}');create table public.student_accounts(id uuid primary key default gen_random_uuid(),first_name text not null,pin_hash text not null,created_at timestamptz not null default now());create table public.student_state(student_id uuid primary key references public.student_accounts(id),state jsonb not null default '{}',updated_at timestamptz not null default now());create table public.tt_monitor_devices(id uuid primary key default gen_random_uuid());create table public.tt_monitor_settings(id boolean primary key default true);insert into public.tt_monitor_settings values(true);`,
  );
  await db.exec(fs.readFileSync("docs/learning-arcade/schema.sql", "utf8"));
  return db;
}
const row = (fullName = "Sample Learner", key = "sample-key-100") => ({
  recordKey: key,
  fullName,
  school: "sf",
  status: "active",
  program: "cdc",
  grade: "8",
  gradeVerified: true,
  source: "Fictional fixture",
  aliases: [fullName.split(" ")[0]],
  learning: { mode: "cdc", level: 1, questions: false },
  note: "Sample only",
  initialSchedule: [],
});
async function reconcile(db, rows, expected = 0) {
  return (
    await db.query(
      "select public.tt_arcade_reconcile($1::jsonb,$2::uuid,$3::bigint) as result",
      [JSON.stringify(rows), teacher, expected],
    )
  ).rows[0].result;
}
test("Real PostgreSQL migration, atomic imports, duplicate prevention and history preservation", async () => {
  const db = await setup();
  try {
    await db.exec(fs.readFileSync("docs/learning-arcade/schema.sql", "utf8"));
    const first = row();
    await reconcile(db, [{ action: "create", student: first }]);
    const id = (await db.query("select id from student_accounts")).rows[0].id;
    await db.query(
      "insert into student_state(student_id,state) values($1,$2::jsonb)",
      [
        id,
        JSON.stringify({
          balance: 1234,
          business: { orders: [1, 2] },
          history: ["old"],
          arcade: {},
        }),
      ],
    );
    await reconcile(
      db,
      [{ action: "update", id, student: { ...first, status: "archived" } }],
      1,
    );
    assert.equal(
      (await db.query("select enrollment_status from student_accounts")).rows[0]
        .enrollment_status,
      "archived",
    );
    assert.deepEqual(
      (await db.query("select state from student_state")).rows[0].state,
      {
        balance: 1234,
        business: { orders: [1, 2] },
        history: ["old"],
        arcade: {},
      },
    );
    assert.equal(
      (await db.query("select count(*)::int n from tt_roster_changes")).rows[0]
        .n,
      2,
    );
    await assert.rejects(() =>
      reconcile(db, [{ action: "create", student: first }], 2),
    );
    assert.equal(
      (await db.query("select count(*)::int n from student_accounts")).rows[0]
        .n,
      1,
    );
    await assert.rejects(() =>
      reconcile(
        db,
        [
          { action: "create", student: row("Other Learner", "other-100") },
          { action: "create", student: first },
        ],
        2,
      ),
    );
    assert.equal(
      (await db.query("select count(*)::int n from student_accounts")).rows[0]
        .n,
      1,
      "entire failed import rolled back",
    );
    await assert.rejects(() =>
      reconcile(db, [{ action: "update", id, student: first }], 0),
    );
  } finally {
    await db.close();
  }
});
test("Private records reject anonymous and ordinary authenticated table/RPC access", async () => {
  const db = await setup();
  try {
    for (const role of ["anon", "authenticated"]) {
      await db.exec("set role " + role);
      for (const table of [
        "student_accounts",
        "student_state",
        "tt_student_aliases",
        "tt_roster_changes",
      ])
        await assert.rejects(() => db.query("select * from " + table));
      await assert.rejects(() =>
        db.query("select tt_arcade_reconcile($1::jsonb,$2::uuid,0)", [
          JSON.stringify([{ action: "create", student: row() }]),
          teacher,
        ]),
      );
      await db.exec("reset role");
    }
    const tables = await db.query(
      "select relname,relrowsecurity from pg_class where relname in ('student_accounts','student_state','tt_student_aliases','tt_roster_changes')",
    );
    assert.ok(tables.rows.every((t) => t.relrowsecurity));
  } finally {
    await db.close();
  }
});
test("Run merges are idempotent, reject stale snapshots, and preserve unrelated state", async () => {
  const db = await setup();
  try {
    await reconcile(db, [{ action: "create", student: row() }]);
    const id = (await db.query("select id from student_accounts")).rows[0].id;
    await db.query(
      "insert into student_state(student_id,state) values($1,$2::jsonb)",
      [id, JSON.stringify({ legacy: "untouched" })],
    );
    const run = {
      id: "fixture-run",
      startedAt: "2026-11-03T00:00:00Z",
      endedAt: null,
      activeMs: 1000,
      rounds: [{ correct: true }],
    };
    const save = async (r) =>
      (
        await db.query("select tt_arcade_save_run($1::uuid,$2::jsonb) result", [
          id,
          JSON.stringify(r),
        ])
      ).rows[0].result;
    assert.equal((await save(run)).saved, true);
    assert.equal((await save(run)).saved, true);
    assert.equal((await save({ ...run, activeMs: 500 })).saved, false);
    const finished = {
      ...run,
      endedAt: "2026-11-03T00:01:00Z",
      activeMs: 5000,
    };
    await save(finished);
    assert.equal((await save({ ...run, activeMs: 6000 })).saved, false);
    const state = (await db.query("select state from student_state")).rows[0]
      .state;
    assert.equal(state.legacy, "untouched");
    assert.equal(Object.keys(state.arcade).length, 1);
    assert.equal(state.arcade["fixture-run"].activeMs, 5000);
  } finally {
    await db.close();
  }
});
test("Schedule revisions, elective-only plans and cross-student conflicts are enforced in SQL", async () => {
  const db = await setup();
  try {
    await reconcile(db, [
      { action: "create", student: row() },
      {
        action: "create",
        student: {
          ...row("Second Learner", "second-key-200"),
          aliases: ["Second"],
        },
      },
    ]);
    const ids = (
      await db.query("select id from student_accounts order by full_name")
    ).rows.map((r) => r.id);
    const schedule = [
      {
        period: "2",
        course: "Art",
        teacher: "Teacher Example",
        room: "12",
        start: "09:00",
        end: "09:50",
        days: ["WE"],
        type: "elective",
        verified: true,
        source: "Fictional fixture",
      },
    ];
    for (const id of ids) {
      await db.query("select tt_arcade_management($1::uuid,$2::jsonb,0)", [
        id,
        JSON.stringify({ schedule }),
      ]);
    }
    await assert.rejects(() =>
      db.query("select tt_arcade_management($1::uuid,$2::jsonb,0)", [
        ids[0],
        JSON.stringify({ schedule: [] }),
      ]),
    );
    const plan = {
      id: crypto.randomUUID(),
      studentId: ids[0],
      school: "sf",
      date: "2026-11-04",
      start: "09:00",
      duration: 30,
      status: "planned",
    };
    await db.query("select tt_arcade_add_plan($1::uuid,$2::jsonb,1)", [
      ids[0],
      JSON.stringify(plan),
    ]);
    await assert.rejects(() =>
      db.query("select tt_arcade_add_plan($1::uuid,$2::jsonb,1)", [
        ids[1],
        JSON.stringify({ ...plan, id: crypto.randomUUID(), studentId: ids[1] }),
      ]),
    );
    await assert.rejects(() =>
      db.query("select tt_arcade_add_plan($1::uuid,$2::jsonb,1)", [
        ids[1],
        JSON.stringify({ ...plan, start: "10:00", studentId: ids[1] }),
      ]),
    );
    const r = (
      await db.query("select state from student_state where student_id=$1", [
        ids[0],
      ])
    ).rows[0].state;
    assert.equal(r.management.plans.length, 1);
    assert.equal(r.management.schedule[0].teacher, "Teacher Example");
  } finally {
    await db.close();
  }
});
test("Partial schedule drafts never overwrite an existing verified schedule during reimport", async () => {
  const db = await setup();
  try {
    const input = {
      ...row(),
      initialSchedule: [
        {
          period: "1",
          course: "",
          teacher: "Example Teacher",
          room: "12",
          start: "",
          end: "",
          days: [],
          type: "unknown",
          verified: false,
          source: "Old sample photo",
        },
      ],
    };
    await reconcile(db, [{ action: "create", student: input }]);
    const id = (await db.query("select id from student_accounts")).rows[0].id;
    const first = (await db.query("select state from student_state")).rows[0]
      .state;
    assert.equal(first.management.schedule[0].verified, false);
    await reconcile(
      db,
      [
        {
          action: "update",
          id,
          student: { ...input, initialSchedule: [{ period: "2" }] },
        },
      ],
      1,
    );
    assert.equal(
      (await db.query("select state from student_state")).rows[0].state
        .management.schedule[0].period,
      "1",
    );
  } finally {
    await db.close();
  }
});
