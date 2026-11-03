import { expansionReport } from "./expansion/reports.mjs";
import { summary } from "./core.mjs";
import { gameById, MODES } from "./curriculum.mjs";
import { escapeHTML as e } from "../learning/progress.mjs";
export const stamp = (t) =>
  t
    ? new Date(t).toLocaleString("en-US", {
        timeZone: "America/Chicago",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "In progress";
export function runReport(run) {
  const s = summary(run);
  return `<article class="report-entry${run.checkpoint ? " with-expansion" : ""}">${run.unsaved ? "<p><b>UNSAVED: This copy is only available in the open page. Print it before leaving.</b></p>" : ""}<h3>${e(gameById(run.game)?.title || run.game)} · ${e(MODES.find((m) => m.id === run.options.mode)?.label)}</h3><p>${e(stamp(run.startedAt))} — ${e(stamp(run.endedAt))} · ${e(run.status)}</p><p>${s.minutes} active minutes · ${s.rounds} rounds completed · Levels ${s.levels.join(", ") || "none completed"} · ${s.accuracy === null ? "Accuracy not measured" : s.accuracy + "% game accuracy (" + s.correct + "/" + s.attempts + ")"}</p><p>Learning questions: ${s.questions ? s.questionCorrect + " correct responses / " + s.questions + " attempts" : "not required / not used"}. Stars: ${s.stars}.</p><p><b>Skills actually practiced:</b> ${e(s.skills.join(" ") || "No scored activity yet.")}</p><p><b>Help requests:</b> ${run.assistance?.length || 0}. ${e(run.assistance?.map((a) => a.kind).join("; ") || "None recorded in the game.")}</p><p><b>Assistance provided:</b> ${e(run.assistanceProvided || "Not observed or recorded by a teacher.")}</p><p><b>Teacher observations:</b> ${e(run.teacherNotes || "Not recorded. Game events do not establish independence or official service minutes.")}</p>${expansionReport(run)}${run.notes ? "<p><b>Notes:</b> " + e(run.notes) + "</p>" : ""}</article>`;
}
export function reportHTML(
  records,
  {
    name = "Guest practice",
    school = "Not connected",
    studentId = "Not recorded",
    title = "Learning Arcade Progress",
  } = {},
) {
  return `<h1>${e(title)}</h1><p><b>${e(name)}</b> · ${e(school)}<br>Student identifier: ${e(studentId)}<br>Printed ${e(stamp(new Date().toISOString()))} · Central time</p><p class="small">CDC = foundational practice. ESP = enrichment, kept separately. Pre-ETS Learning = activity evidence for specialist review; participation is not automatically an official Pre-ETS service. Bank deposits and time-clock rules are separate.</p>${
    ["cdc", "preets", "esp"]
      .map((mode) => {
        const rows = records.filter((r) => r.options?.mode === mode);
        if (!rows.length) return "";
        const sums = rows.map(summary);
        return `<h2>${e(MODES.find((m) => m.id === mode).label)}</h2><p>${sums.reduce((n, s) => n + s.rounds, 0)} completed rounds · ${Math.round(sums.reduce((n, s) => n + s.minutes, 0) * 100) / 100} active practice minutes</p>${rows.map(runReport).join("")}`;
      })
      .join("") || "<p>No practice has been recorded.</p>"
  }`;
}
