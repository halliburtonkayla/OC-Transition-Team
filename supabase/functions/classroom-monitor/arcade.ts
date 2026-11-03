import { cleanCheckpoint } from "../../../assets/learning-arcade/expansion/checkpoint.mjs";
import {
  cleanStudent,
  cleanLearning,
  reconcileRoster,
  cleanSchedule,
  scheduleConflicts,
  validatePlan,
  SCHOOLS,
} from "../../../assets/learning-arcade/management.mjs";
import { GAMES } from "../../../assets/learning-arcade/curriculum.mjs";
type Context = {
  api: (
    path: string,
    method?: string,
    body?: unknown,
    prefer?: string,
  ) => Promise<any>;
  teacher: (req: Request) => Promise<any>;
  student: (token: unknown) => Promise<any>;
  hash: (s: string) => Promise<string>;
  fail: (status: number, message: string) => never;
};
const enc = encodeURIComponent,
  now = () => new Date().toISOString();
const teachers = new Set([
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
]);
const publicStudent = (r: any) => ({
  id: r.id,
  fullName: r.full_name,
  school: r.school_key,
  recordKey: r.record_key,
  status: r.enrollment_status,
  program: r.program,
  grade: r.grade,
  gradeVerified: r.grade_verified,
  source: r.grade_source,
  learning: r.profile?.learning || {},
  note: r.profile?.rosterNote || "",
  revision: r.revision,
  communicationNotes: r.profile?.communicationNotes || "",
});
function cleanRun(v: any, fail: Context["fail"]) {
  if (
    !v ||
    typeof v.id !== "string" ||
    v.id.length > 100 ||
    !GAMES.some((g) => g.id === v.game) ||
    !["cdc", "preets", "esp"].includes(v.options?.mode) ||
    !Array.isArray(v.rounds) ||
    v.rounds.length > 5000 ||
    !Number.isFinite(v.activeMs) ||
    v.activeMs < 0 ||
    v.activeMs > 86400000
  )
    fail(400, "Invalid game practice record.");
  const start = Date.parse(v.startedAt),
    end = v.endedAt === null ? null : Date.parse(v.endedAt);
  if (
    !Number.isFinite(start) ||
    start > Date.now() + 60000 ||
    (end !== null && (!Number.isFinite(end) || end < start)) ||
    v.activeMs > Math.max(0, (end ?? Date.now()) - start) + 5000
  )
    fail(400, "Invalid practice timing.");
  const rounds = v.rounds.map((r: any) => {
    if (
      !r ||
      !["game", "question", "round"].includes(r.kind) ||
      !Number.isInteger(r.level) ||
      r.level < 1 ||
      r.level > (GAMES.find((g) => g.id === v.game)?.levels || 0) ||
      !Number.isInteger(r.round) ||
      r.round < 0 ||
      typeof r.correct !== "boolean" ||
      !Number.isFinite(Date.parse(r.at))
    )
      fail(400, "Invalid practice response.");
    return {
      at: r.at,
      kind: r.kind,
      level: r.level,
      round: r.round,
      correct: r.correct,
      choice: String(r.choice || "").slice(0, 160),
      objective: String(r.objective || "").slice(0, 500),
    };
  });
  return {
    id: v.id,
    game: v.game,
    startedAt: v.startedAt,
    endedAt: v.endedAt,
    activeMs: Math.round(v.activeMs),
    status: ["playing", "finished", "settings_changed", "locked"].includes(
      v.status,
    )
      ? v.status
      : "finished",
    options: {
      mode: v.options.mode,
      level: Math.max(1, Math.min(12, Number(v.options.level) || 1)),
      category: String(v.options.category || "colors").slice(0, 40),
      questions: v.options.mode === "cdc" ? false : !!v.options.questions,
      timed: v.options.mode === "cdc" ? false : !!v.options.timed,
      minutes:
        v.options.mode === "esp" && [5, 10, 15].includes(v.options.minutes)
          ? v.options.minutes
          : 0,
      record: true,
    },
    rounds,
    assistance: (Array.isArray(v.assistance) ? v.assistance : [])
      .slice(0, 1000)
      .map((a: any) => ({
        at: String(a.at).slice(0, 40),
        kind: String(a.kind || "Help requested").slice(0, 200),
      })),
    ...(GAMES.find((g) => g.id === v.game)?.premium
      ? {
          checkpoint: cleanCheckpoint(v.game, v.checkpoint),
          checkpointRevision:
            Number.isSafeInteger(v.checkpointRevision) &&
            v.checkpointRevision >= 0
              ? v.checkpointRevision
              : 0,
        }
      : {}),
    notes: "",
  };
}
export async function handleArcade(
  action: string,
  b: any,
  req: Request,
  c: Context,
) {
  try {
    return await route(action, b, req, c);
  } catch (e) {
    if ((e as any)?.status) throw e;
    return c.fail(
      400,
      String((e as Error).message || "Review the entered information.").slice(
        0,
        350,
      ),
    );
  }
}
async function route(action: string, b: any, req: Request, c: Context) {
  const { api, fail } = c;
  let teacher: any = null,
    device: any = null;
  if (teachers.has(action)) teacher = await c.teacher(req);
  else if (["arcade_me", "arcade_save"].includes(action)) {
    device = await c.student(b.token);
    if (!device.approved_at || device.revoked_at)
      fail(403, "Ask your teacher to approve this device.");
  } else fail(400, "Unknown learning action.");
  async function account(id: string) {
    if (!/^[a-f0-9-]{36}$/.test(String(id)))
      fail(400, "Invalid student identifier.");
    const r = (
      await api(
        "student_accounts?id=eq." +
          enc(id) +
          "&select=id,full_name,first_name,school_key,record_key,enrollment_status,program,grade,grade_verified,grade_source,profile,revision",
      )
    )[0];
    if (!r) fail(404, "Student profile not found.");
    return r;
  }
  async function state(id: string) {
    return (
      (await api("student_state?student_id=eq." + enc(id)))[0] || {
        state: {},
        revision: 0,
      }
    );
  }
  async function roster() {
    const [rows, aliases] = await Promise.all([
      api(
        "student_accounts?select=id,full_name,school_key,record_key,enrollment_status,program,grade,grade_verified,grade_source,profile,revision&order=full_name.asc&limit=1000",
      ),
      api("tt_student_aliases?select=alias,student_id&limit=2000"),
    ]);
    return rows.map((r: any) => ({
      ...publicStudent(r),
      aliases: aliases
        .filter((a: any) => a.student_id === r.id)
        .map((a: any) => a.alias),
    }));
  }
  async function learner() {
    let id = device.student_id;
    if (!id) {
      const a = await api(
        "tt_student_aliases?alias=eq." +
          enc(device.student) +
          "&select=student_id",
      );
      if (a.length !== 1)
        fail(
          409,
          "Your teacher needs to link this existing Town profile to a verified student identifier.",
        );
      id = a[0].student_id;
    }
    const r = await account(id);
    if (!["active", "review"].includes(r.enrollment_status))
      fail(
        403,
        "This learning profile is inactive. Ask your teacher for help.",
      );
    const expected =
      r.school_key === "oc"
        ? "Obion County Central High School"
        : "South Fulton";
    if (
      (r.school_key === "oc" && !String(device.school).includes(expected)) ||
      (r.school_key === "sf" && !String(device.school).includes("South Fulton"))
    )
      fail(
        403,
        "This device’s school does not match the verified student profile.",
      );
    return r;
  }
  if (action === "arcade_me") {
    const r = await learner(),
      s = await state(r.id);
    return {
      profile: {
        id: r.id,
        displayName: r.first_name,
        school: r.school_key,
        schoolLabel: SCHOOLS.find((x) => x.id === r.school_key)?.label,
        learning: r.profile?.learning || {},
      },
      records: Object.values(s.state.arcade || {}),
    };
  }
  if (action === "arcade_save") {
    const r = await learner();
    return await api("rpc/tt_arcade_save_run", "POST", {
      p_student: r.id,
      p_run: cleanRun(b.run, fail),
    });
  }
  if (action === "arcade_week") {
    const [students, states] = await Promise.all([
      roster(),
      api("student_state?select=student_id,state&limit=1000"),
    ]);
    return {
      students: students.map((s: any) => {
        const st = states.find((x: any) => x.student_id === s.id)?.state || {};
        return {
          ...s,
          plans: st.management?.plans || [],
          scheduleCount: st.management?.schedule?.length || 0,
          records: Object.values(st.arcade || {}),
        };
      }),
    };
  }
  if (action === "arcade_roster") {
    const [students, config, contacts] = await Promise.all([
      roster(),
      api("tt_monitor_settings?id=eq.true&select=roster_revision"),
      api("tt_phone_contacts?select=name&name=neq.Miss%20Kayla"),
    ]);
    return {
      students,
      legacyProfiles: contacts.map((x: any) => x.name),
      revision: config[0]?.roster_revision || 0,
    };
  }
  if (action === "arcade_preview") {
    if (
      !Array.isArray(b.students) ||
      b.students.length > 100 ||
      !b.students.length
    )
      fail(400, "Choose a roster import with 1–100 students.");
    const students = await roster();
    const plan = reconcileRoster(b.students, students);
    const aliases = new Map();
    for (const p of plan)
      for (const a of p.student.aliases) {
        const k = a.toLowerCase();
        if (aliases.has(k) && aliases.get(k) !== p.index)
          fail(409, "An existing Town profile is linked twice in this import.");
        aliases.set(k, p.index);
      }
    const config = await api(
      "tt_monitor_settings?id=eq.true&select=roster_revision",
    );
    return { plan, revision: config[0]?.roster_revision || 0 };
  }
  if (action === "arcade_reconcile") {
    if (b.reviewed !== true)
      fail(400, "Review the proposed roster before applying it.");
    const plan = reconcileRoster(b.students, await roster());
    if (plan.some((p: any) => p.action === "review"))
      fail(409, "Resolve every uncertain account match first.");
    return await api("rpc/tt_arcade_reconcile", "POST", {
      p_rows: plan,
      p_teacher: teacher.id,
      p_expected: b.revision,
    });
  }
  const student = await account(b.studentId);
  if (action === "arcade_device") {
    if (!["active", "review"].includes(student.enrollment_status))
      fail(400, "Restore this student to an active or review status first.");
    const token = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
    const aliases = await api(
      "tt_student_aliases?student_id=eq." +
        enc(student.id) +
        "&select=alias&limit=1",
    );
    const expires = new Date(Date.now() + 8 * 3600000).toISOString();
    await api("tt_monitor_devices", "POST", {
      student: aliases[0]?.alias || student.full_name,
      student_id: student.id,
      school:
        student.school_key === "oc"
          ? "Obion County Central High School"
          : "South Fulton Middle/High School",
      token_hash: await c.hash("tt-monitor-v1:" + token),
      pair_code: String(
        crypto.getRandomValues(new Uint32Array(1))[0] % 10000,
      ).padStart(4, "0"),
      expires_at: expires,
      approved_at: now(),
      approved_by: teacher.id,
    });
    return { token, expires_at: expires };
  }
  const stored = await state(student.id),
    management = stored.state.management || {};
  if (action === "arcade_profile" || action === "arcade_export") {
    const aliases = await api(
      "tt_student_aliases?student_id=eq." + enc(student.id) + "&select=alias",
    );
    const reports = [];
    for (const a of aliases) {
      const found = await api(
        "tt_monitor_reports?student=eq." +
          enc(a.alias) +
          "&status=eq.approved&deleted_at=is.null&select=id,student,school,draft,created_at&order=created_at.desc&limit=20",
      );
      reports.push(...found);
    }
    const serviceTime = (r: any) => {
      const value = Date.parse(r.draft?.end || r.draft?.start);
      return Number.isFinite(value) ? value : -Infinity;
    };
    reports.sort(
      (a, b) =>
        serviceTime(b) - serviceTime(a) ||
        String(a.id).localeCompare(String(b.id)),
    );
    return {
      student: publicStudent(student),
      management,
      revision: stored.revision,
      records: Object.values(stored.state.arcade || {}).map((r: any) => ({
        ...r,
        teacherNotes: management.observations?.[r.id]?.notes || "",
        assistanceProvided: management.observations?.[r.id]?.assistance || "",
      })),
      approvedReports: reports,
    };
  }
  if (action === "arcade_observation") {
    if (b.observed !== true || !stored.state.arcade?.[b.runId])
      fail(400, "Select an actual game session and confirm your observation.");
    const notes = String(b.notes || "")
        .trim()
        .slice(0, 4000),
      assistance = String(b.assistance || "")
        .trim()
        .slice(0, 2000);
    if (!notes && !assistance)
      fail(
        400,
        "Describe the participation or assistance you actually observed.",
      );
    return await api("rpc/tt_arcade_management", "POST", {
      p_student: student.id,
      p_expected: b.revision,
      p_value: {
        ...management,
        observations: {
          ...management.observations,
          [b.runId]: { notes, assistance, at: now(), teacherId: teacher.id },
        },
      },
    });
  }
  if (action === "arcade_schedule") {
    const schedule = cleanSchedule(b.schedule);
    if (schedule.some((r: any) => r.verified && !r.source))
      fail(400, "Verified schedule rows need a source.");
    if (scheduleConflicts(schedule).length)
      fail(409, "Resolve overlapping classes before saving the schedule.");
    return await api("rpc/tt_arcade_management", "POST", {
      p_student: student.id,
      p_expected: b.revision,
      p_value: {
        ...management,
        schedule,
        scheduleVerifiedAt: now(),
        scheduleVerifiedBy: teacher.id,
      },
    });
  }
  if (action === "arcade_notes") {
    if (b.profileRevision !== student.revision)
      fail(409, "Student profile changed. Refresh before saving.");
    const learning = cleanLearning(
        b.learning || student.profile?.learning || {},
      ),
      rows = await api(
        "student_accounts?id=eq." +
          enc(student.id) +
          "&revision=eq." +
          student.revision,
        "PATCH",
        {
          profile: {
            ...student.profile,
            learning,
            communicationNotes: String(b.notes || "").slice(0, 5000),
          },
          revision: student.revision + 1,
        },
      );
    if (!rows.length)
      fail(409, "Student profile changed. Refresh before saving.");
    return { saved: true };
  }
  if (action === "arcade_plan") {
    // A teacher-level lock in SQL serializes plans across all students so two tabs
    // cannot reserve overlapping pull-outs or omit the other school’s travel gap.
    const rows = await api("student_state?select=student_id,state&limit=1000"),
      plans = rows.flatMap((r: any) => r.state.management?.plans || []);
    const plan = validatePlan(
      b.plan,
      {
        id: student.id,
        school: student.school_key,
        schedule: management.schedule || [],
      },
      plans,
      Number(b.plan?.duration) || 30,
    );
    return await api("rpc/tt_arcade_add_plan", "POST", {
      p_student: student.id,
      p_plan: plan,
      p_expected: b.revision,
    });
  }
  fail(400, "Unknown learning action.");
}
