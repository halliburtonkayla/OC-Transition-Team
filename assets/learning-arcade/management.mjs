import { GAMES, SERVICES } from "./curriculum.mjs";
import { uid } from "./core.mjs";
export const SCHOOLS = [
  { id: "sf", label: "South Fulton Middle/High School" },
  { id: "oc", label: "Obion County Central High School" },
];
export const norm = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
export function cleanStudent(row) {
  const school = ["sf", "oc"].includes(row.school) ? row.school : null,
    name = String(row.fullName || "")
      .trim()
      .replace(/\s+/g, " ");
  if (!school || name.length < 3 || name.length > 160)
    throw Error("Provide a full student name and verified school.");
  const status = ["active", "archived", "on_hold", "review"].includes(
      row.status,
    )
      ? row.status
      : "review",
    program = ["preets", "cdc", "esp"].includes(row.program)
      ? row.program
      : "preets";
  const aliases = Array.isArray(row.aliases)
    ? [...new Set(row.aliases.map((x) => String(x).trim()).filter(Boolean))]
    : [];
  if (aliases.length > 10 || aliases.some((s) => s.length > 100))
    throw Error("Too many aliases or an alias is too long.");
  const grade = String(row.grade || "")
      .trim()
      .slice(0, 10),
    source = String(row.source || "")
      .trim()
      .slice(0, 200);
  if (row.gradeVerified && (!grade || !source))
    throw Error("Verified grades need a source.");
  return {
    recordKey: String(row.recordKey || "").slice(0, 120),
    fullName: name,
    school,
    status,
    program,
    grade,
    gradeVerified: !!row.gradeVerified,
    source,
    aliases,
    learning: cleanLearning(row.learning || {}),
    note: String(row.note || "").slice(0, 3000),
    initialSchedule: Array.isArray(row.initialSchedule)
      ? cleanSchedule(row.initialSchedule)
      : [],
  };
}
export function cleanLearning(v) {
  return {
    mode: ["cdc", "preets", "esp"].includes(v.mode) ? v.mode : "cdc",
    level: Math.max(1, Math.min(12, Number(v.level) || 1)),
    category: String(v.category || "colors").slice(0, 40),
    questions: !!v.questions,
    recommendedGame: GAMES.some((g) => g.id === v.recommendedGame)
      ? v.recommendedGame
      : "match",
    objective: String(v.objective || "").slice(0, 500),
  };
}
export function reconcileRoster(input, existing = []) {
  const rows = input.map(cleanStudent),
    keys = new Set(),
    names = new Set();
  return rows.map((r, index) => {
    const nk = r.school + ":" + norm(r.fullName),
      key = r.recordKey && r.school + ":" + r.recordKey;
    if ((key && keys.has(key)) || names.has(nk))
      throw Error("Duplicate student in the import. Review the file.");
    if (key) keys.add(key);
    names.add(nk);
    const byKey = existing.filter(
        (s) => key && s.school === r.school && s.recordKey === r.recordKey,
      ),
      byName = existing.filter(
        (s) => s.school === r.school && norm(s.fullName) === norm(r.fullName),
      ),
      byAlias = existing.filter((s) =>
        (s.aliases || []).some((a) =>
          r.aliases.some((b) => norm(a) === norm(b)),
        ),
      );
    const matches = [
      ...new Map(
        [...byKey, ...byName, ...byAlias].map((s) => [s.id, s]),
      ).values(),
    ];
    const crossSchool = matches.some((s) => s.school !== r.school),
      keyMismatch =
        matches.length === 1 &&
        matches[0].recordKey &&
        r.recordKey &&
        matches[0].recordKey !== r.recordKey;
    return {
      index,
      student: r,
      id: matches.length === 1 ? matches[0].id : null,
      action:
        crossSchool || keyMismatch || matches.length > 1
          ? "review"
          : matches.length
            ? "update"
            : r.recordKey
              ? "create"
              : "review",
      reason: crossSchool
        ? "Alias belongs to another school."
        : keyMismatch
          ? "Stable import key differs from the existing account; verify identity before applying."
          : matches.length > 1
            ? "Several existing accounts match."
            : matches.length
              ? "Reuse existing stable identifier."
              : r.recordKey
                ? "New account; no match in verified account registry."
                : "Stable import key is required before creating an account.",
    };
  });
}
export const timeMinutes = (t) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t))
    ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
    : null;
export function cleanSchedule(rows) {
  if (!Array.isArray(rows) || rows.length > 50)
    throw Error("Enter at most 50 schedule rows.");
  const seen = new Set();
  return rows.map((r) => {
    const p = String(r.period || "")
        .trim()
        .slice(0, 40),
      start = timeMinutes(r.start),
      end = timeMinutes(r.end),
      days = [
        ...new Set(
          (r.days || []).filter((d) =>
            ["MO", "TU", "WE", "TH", "FR"].includes(d),
          ),
        ),
      ];
    if (!p) throw Error("Each class needs a period label.");
    if (
      r.verified &&
      (start === null || end === null || end <= start || !days.length)
    )
      throw Error("Verified classes need valid start/end times and weekdays.");
    if (start !== null && end !== null && end <= start)
      throw Error("Class end must be after its start.");
    for (const d of days) {
      const k = d + ":" + p;
      if (seen.has(k))
        throw Error("A period appears twice on the same weekday.");
      seen.add(k);
    }
    return {
      period: p,
      course: String(r.course || "")
        .trim()
        .slice(0, 160),
      teacher: String(r.teacher || "")
        .trim()
        .slice(0, 120),
      room: String(r.room || "")
        .trim()
        .slice(0, 60),
      start: start === null ? "" : r.start,
      end: end === null ? "" : r.end,
      days,
      type: ["elective", "tested", "restricted", "unknown"].includes(r.type)
        ? r.type
        : "unknown",
      verified: r.verified === true,
      source: String(r.source || "")
        .trim()
        .slice(0, 200),
    };
  });
}
export function scheduleConflicts(rows) {
  const result = [];
  for (let i = 0; i < rows.length; i++)
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i],
        b = rows[j];
      if (
        [a.start, a.end, b.start, b.end].every(
          (t) => timeMinutes(t) !== null,
        ) &&
        a.days.some((d) => b.days.includes(d)) &&
        timeMinutes(a.start) < timeMinutes(b.end) &&
        timeMinutes(b.start) < timeMinutes(a.end)
      )
        result.push(`${a.period} overlaps ${b.period}.`);
    }
  return result;
}
export function pullWindows(rows, duration = 30) {
  if (!Number.isFinite(duration) || duration < 5 || duration > 120)
    throw Error("Choose a duration from 5 to 120 minutes.");
  const conflicts = scheduleConflicts(rows);
  return rows
    .filter(
      (r) =>
        r.verified &&
        r.type === "elective" &&
        timeMinutes(r.end) - timeMinutes(r.start) >= duration &&
        !rows.some(
          (other) =>
            other !== r &&
            timeMinutes(other.start) !== null &&
            timeMinutes(other.end) !== null &&
            other.days.some((d) => r.days.includes(d)) &&
            timeMinutes(r.start) < timeMinutes(other.end) &&
            timeMinutes(other.start) < timeMinutes(r.end),
        ),
    )
    .map((r) => ({
      ...r,
      duration,
      reason: "Verified elective; confirm teacher availability.",
    }));
}
const dateOK = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s;
export function validatePlan(entry, student, plans = [], duration = 30) {
  if (!dateOK(entry.date)) throw Error("Choose a valid date.");
  const start = timeMinutes(entry.start),
    end = start === null ? null : start + duration;
  if (start === null || duration < 5 || duration > 120 || end > 1440)
    throw Error("Choose valid session times.");
  const weekday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][
      new Date(entry.date + "T12:00:00Z").getUTCDay()
    ],
    windows = pullWindows(student.schedule || [], duration);
  const match = windows.find(
    (r) =>
      r.days.includes(weekday) &&
      timeMinutes(r.start) <= start &&
      timeMinutes(r.end) >= end,
  );
  if (!match)
    throw Error(
      "This time is not inside a verified, conflict-free elective period.",
    );
  for (const p of plans.filter(
    (p) =>
      p.date === entry.date && p.status !== "cancelled" && p.id !== entry.id,
  )) {
    const a = timeMinutes(p.start),
      b = a + p.duration,
      buffer = p.school !== student.school ? 20 : 0;
    if (start < b + buffer && a < end + buffer)
      throw Error(
        p.school !== student.school
          ? "Allow at least 20 minutes between schools."
          : "This overlaps another planned session.",
      );
  }
  return {
    id: entry.id || uid(),
    studentId: student.id,
    school: student.school,
    date: entry.date,
    start: entry.start,
    duration,
    period: match.period,
    teacher: match.teacher,
    room: match.room,
    objective: String(entry.objective || "").slice(0, 500),
    service: SERVICES.includes(entry.service) ? entry.service : "",
    status: "planned",
  };
}
export function teacherEmail(plan, student) {
  if (!plan.teacher || !plan.date || !plan.start || !plan.duration)
    throw Error("Verify the teacher and requested date/time first.");
  return {
    subject: `Pre-ETS session request — ${student.fullName} — ${plan.date}`,
    body: `Hello ${plan.teacher},\n\nMay I work with ${student.fullName} on ${plan.date} at ${plan.start} for ${plan.duration} minutes during ${plan.period}? Our general instructional focus is ${plan.objective || "workplace readiness and transition skill development"}.\n\nPlease let me know if this conflicts with class activities or if another elective time would work better.\n\nThank you,\nKayla Halliburton\nWork-Based Specialist\nObion County Schools`,
  };
}
