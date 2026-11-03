import {
  SCHOOLS,
  reconcileRoster,
  norm,
  cleanSchedule,
  scheduleConflicts,
  pullWindows,
  teacherEmail,
} from "./management.mjs";
import { GAMES, CATEGORIES, MODES, SERVICES } from "./curriculum.mjs";
import { reportHTML, stamp } from "./report.mjs";
import { summary, uid } from "./core.mjs";
import { escapeHTML as esc } from "../learning/progress.mjs";
let css = false;
const mounts = new WeakMap();
export async function mountStudentManagement(root, api) {
  mounts.get(root)?.();
  const controller = new window.AbortController(),
    signal = controller.signal;
  let alive = true;
  const dispose = () => {
    alive = false;
    controller.abort();
    if (imageURL) URL.revokeObjectURL(imageURL);
    root.classList.remove("arcade-teacher");
  };
  mounts.set(root, dispose);
  if (!css) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "assets/learning-arcade/teacher.css";
    document.head.append(l);
    css = true;
  }
  root.classList.add("arcade-teacher");
  root.dataset.monitorPrivate = "";
  let school = "sf",
    status = "active",
    selected = "",
    roster = [],
    revision = 0,
    legacy = [],
    details = null,
    subview = "profile",
    schedule = [],
    imageURL = "",
    importPlan = null,
    importRows = null,
    importRevision = null,
    plans = [];
  const $ = (s) => root.querySelector(s),
    nowDate = () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
  function message(text, error = false) {
    const m = $("#at-message");
    if (m) {
      m.textContent = text;
      m.classList.toggle("error", error);
    }
  }
  async function refresh() {
    try {
      const r = await api("arcade_roster");
      roster = r.students;
      legacy = r.legacyProfiles;
      revision = r.revision;
      if (alive && root.isConnected) draw();
    } catch (e) {
      if (!alive || !root.isConnected) return;
      root.innerHTML = `<div class="at-box"><p class="at-kicker">STUDENTS & SCHEDULING</p><h2>Your private learning workspace.</h2><p>The Learning Arcade games are available for review. The private roster and scheduling extension must be installed in the existing classroom service before these tools can save records.</p><p class="at-message error">${esc(e.message)}</p><p>No student records have been changed.</p><a href="learning-arcade.html">Open The Learning Arcade →</a><p><a href="docs/learning-arcade/README.md">Review implementation and release instructions</a></p></div>`;
    }
  }
  function draw() {
    const active = roster.filter(
        (s) => s.school === school && s.status === "active",
      ),
      list = roster.filter(
        (s) => s.school === school && (status === "all" || s.status === status),
      ),
      middle = active.filter((s) => s.gradeVerified && Number(s.grade) <= 8),
      high = active.filter((s) => !middle.includes(s));
    root.innerHTML = `<div class="at-titlebar"><div><p class="at-kicker">ONE WORKSPACE · TWO SCHOOLS</p><h2>Students & scheduling.</h2><p class="at-roster-count">${active.length} active · ${school === "sf" ? high.length + " high school / " + middle.length + " middle school · " : ""}${roster.filter((s) => s.school === school && s.status === "archived").length} archived</p></div><div class="at-tools"><button data-at="import">Review roster import</button><button data-at="add">Add a student</button><button data-at="week">Weekly service plan</button><button data-at="summary">Print school summary</button></div></div><div class="at-tabs" role="group" aria-label="School view">${SCHOOLS.map((s) => `<button data-school="${s.id}" aria-pressed="${school === s.id}">${esc(s.label)}</button>`).join("")}</div><div id="at-message" class="at-message" role="status">Student records are private. Changes preserve historical records and require review.</div><section id="at-import" hidden></section><div class="at-grid"><aside class="at-list"><label>Enrollment status<select id="at-status"><option value="active">Active</option><option value="archived">Archived</option><option value="on_hold">On hold</option><option value="review">Needs review</option><option value="all">All records</option></select></label><label>Find a student<input id="at-search" type="search" placeholder="Name or grade"></label><div id="at-students">${list.map(studentButton).join("") || '<p class="at-mini">No students in this view. Review an import or add an ESP learner.</p>'}</div></aside><div id="at-profile" class="at-profile"><div class="at-box"><p class="at-kicker">MAKE THE NEXT SESSION EASIER</p><h3>Choose a student.</h3><p>Review their learning, verify a class schedule, plan an elective pull-out and prepare an editable teacher email.</p><p class="at-mini">Unlinked existing Town profiles: ${legacy.filter((n) => !roster.some((s) => (s.aliases || []).includes(n))).length}. These accounts and their historical records remain available.</p></div></div></div>`;
    $("#at-status").value = status;
    if (selected) openProfile(selected);
  }
  const studentButton = (s) =>
    `<button data-student="${s.id}" class="${s.id === selected ? "selected" : ""}">${esc(s.fullName)}<small>${esc(s.gradeVerified ? "Grade " + s.grade : "Grade unverified")} · ${esc(s.status)} · ${esc(s.program.toUpperCase())}</small></button>`;
  async function openProfile(id) {
    selected = id;
    details = null;
    $("#at-profile").innerHTML = "<p>Loading private student profile…</p>";
    try {
      const d = await api("arcade_profile", { studentId: id });
      if (selected !== id || !root.isConnected) return;
      details = d;
      schedule = d.management.schedule || [];
      plans = d.management.plans || [];
      renderProfile();
      root
        .querySelectorAll("[data-student]")
        .forEach((b) =>
          b.classList.toggle("selected", b.dataset.student === id),
        );
    } catch (e) {
      message(e.message, true);
    }
  }
  function renderProfile() {
    if (!details) return;
    const s = details.student,
      records = details.records || [],
      sums = records.map(summary),
      last = details.approvedReports?.[0],
      learning = s.learning || {};
    $("#at-profile").innerHTML =
      `<div class="at-box"><p class="at-kicker">${esc(SCHOOLS.find((x) => x.id === s.school)?.label)}</p><h3 class="at-name">${esc(s.fullName)}</h3><p class="at-student-meta">${esc(s.gradeVerified ? "Verified grade: " + s.grade : "Grade not verified")} · ${esc(s.status)} · ${esc(s.program.toUpperCase())}<br><small>Stable student identifier: ${esc(s.id)}</small></p><div class="at-metrics"><div><b>${records.filter((r) => r.endedAt).length}</b>saved game sessions</div><div><b>${sums.reduce((n, r) => n + r.rounds, 0)}</b>completed rounds</div><div><b>${last ? esc(stamp(last.draft?.end || last.created_at)) : "No approved record"}</b>last verified service date</div></div><div class="at-subtabs">${[
        ["profile", "Learning profile"],
        ["schedule", "Class schedule"],
        ["plan", "Weekly plan"],
        ["progress", "Progress & reports"],
      ]
        .map(
          ([id, label]) =>
            `<button data-subview="${id}" aria-pressed="${subview === id}">${label}</button>`,
        )
        .join("")}</div><div id="at-detail"></div></div>`;
    if (subview === "schedule") renderSchedule();
    else if (subview === "plan") renderPlan();
    else if (subview === "progress") renderProgress();
    else renderLearning();
  }
  function renderLearning() {
    const s = details.student,
      l = s.learning || {};
    $("#at-detail").innerHTML =
      `<h3>A flexible path forward.</h3><p class="at-mini">Change difficulty whenever a student is ready. These preferences provide a starting point; they do not lock a student to one level.</p><form id="at-learning"><div class="at-fields"><label>Starting learning mode<select name="mode">${MODES.map((m) => `<option value="${m.id}">${m.label}</option>`).join("")}</select></label><label>Next recommended activity<select name="recommendedGame">${GAMES.map((g) => `<option value="${g.id}">${g.title}</option>`).join("")}</select></label><label>Starting difficulty<input name="level" type="number" min="1" max="12" value="${l.level || 1}"></label><label>Matching category<select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${c.title}</option>`).join("")}</select></label></div><label>Learning objective<textarea name="objective" maxlength="500">${esc(l.objective || "")}</textarea></label><label><input type="checkbox" name="questions" ${l.questions ? "checked" : ""} style="display:inline;width:20px;min-height:20px"> Offer learning questions outside CDC Beginner mode</label><label>Teacher communication notes<textarea name="notes" maxlength="5000">${esc(s.communicationNotes || "")}</textarea></label><button class="primary">Save learning preferences</button></form><div class="at-tools"><button data-at="device">Connect a student device</button><button data-at="export">Export student backup</button></div><div id="at-device"></div><p class="at-mini">Grade source: ${esc(s.source || "No source recorded")}. To change grade, school or enrollment status, use the reviewed roster import. Archive records; never delete historical work.</p>`;
    const f = $("#at-learning");
    for (const key of ["mode", "recommendedGame", "category"])
      f.elements[key].value =
        l[key] ||
        {
          mode: s.program === "esp" ? "esp" : "cdc",
          recommendedGame: "match",
          category: "colors",
        }[key];
    f.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const learning = Object.fromEntries(new FormData(f));
        learning.questions = f.elements.questions.checked;
        await api("arcade_notes", {
          studentId: selected,
          profileRevision: details.student.revision,
          learning,
          notes: f.elements.notes.value,
        });
        message("Learning preferences saved.");
        await openProfile(selected);
      } catch (e) {
        message(e.message, true);
      }
    };
  }
  function scheduleRow(r = {}, i = 0) {
    return `<tr data-period="${i}"><td><input name="period" aria-label="Period ${i + 1}" value="${esc(r.period || "")}" placeholder="Period"></td><td><input name="course" aria-label="Course ${i + 1}" value="${esc(r.course || "")}" placeholder="Course"><input name="teacher" aria-label="Teacher ${i + 1}" value="${esc(r.teacher || "")}" placeholder="Teacher"><input name="room" aria-label="Room ${i + 1}" value="${esc(r.room || "")}" placeholder="Room"></td><td><input type="time" name="start" aria-label="Start time ${i + 1}" value="${r.start || ""}"><input type="time" name="end" aria-label="End time ${i + 1}" value="${r.end || ""}"></td><td class="days">${["MO", "TU", "WE", "TH", "FR"].map((d) => `<label><input type="checkbox" name="days" value="${d}" ${(r.days || []).includes(d) ? "checked" : ""}>${d}</label>`).join("")}</td><td><select name="type" aria-label="Class type ${i + 1}">${[
      ["unknown", "Unverified type"],
      ["elective", "Elective"],
      ["tested", "Tested — restricted"],
      ["restricted", "Other restricted"],
    ]
      .map(
        ([id, label]) =>
          `<option value="${id}" ${r.type === id ? "selected" : ""}>${label}</option>`,
      )
      .join(
        "",
      )}</select><label><input name="verified" type="checkbox" ${r.verified ? "checked" : ""}>Reviewed</label><input name="source" aria-label="Verification source ${i + 1}" value="${esc(r.source || "")}" placeholder="Verified source"><button type="button" data-remove-period="${i}">Remove row</button></td></tr>`;
  }
  function renderSchedule() {
    $("#at-detail").innerHTML =
      `<h3>A schedule you can trust.</h3><p class="at-message">${esc(details.student.note || "Enter only verified schedule information.")}</p><p class="at-mini">Upload a schedule photograph to view it beside manual entry. Automated extraction is not configured. Review every field and class type before marking it verified. The image stays in this open browser page and is not uploaded or saved.</p><label>Schedule photograph<input type="file" id="at-photo" accept="image/jpeg,image/png,image/webp,image/heic"></label><div id="at-photo-view"></div><form id="at-schedule"><div class="at-table-wrap"><table class="at-table"><thead><tr><th>Period</th><th>Class / teacher / room</th><th>Start / end</th><th>Weekdays</th><th>Type & verification</th></tr></thead><tbody id="at-periods">${schedule.map(scheduleRow).join("")}</tbody></table></div><div class="at-tools"><button type="button" data-at="period">Add class period</button><button class="primary">Review & save schedule</button></div></form><div id="at-windows"></div>`;
    $("#at-photo").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 12 * 1024 * 1024) {
        message("Choose an image smaller than 12 MB.", true);
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/heic"].includes(
          file.type,
        )
      ) {
        message("Choose a JPEG, PNG, WebP or HEIC schedule photograph.", true);
        return;
      }
      if (imageURL) URL.revokeObjectURL(imageURL);
      imageURL = URL.createObjectURL(file);
      $("#at-photo-view").innerHTML =
        '<img class="at-image" alt="Uploaded class schedule for manual review">';
      $("#at-photo-view img").src = imageURL;
      $("#at-photo-view img").onerror = () =>
        message(
          "This browser cannot display that image format. Convert it to JPEG or enter the schedule manually.",
          true,
        );
    };
    $("#at-schedule").onsubmit = async (e) => {
      e.preventDefault();
      try {
        const rows = readSchedule(),
          clean = cleanSchedule(rows),
          conflicts = scheduleConflicts(clean);
        if (conflicts.length) throw Error(conflicts.join(" "));
        if (clean.some((r) => r.verified && !r.source))
          throw Error("Record a source for every verified class.");
        await api("arcade_schedule", {
          studentId: selected,
          schedule: clean,
          revision: details.revision,
        });
        message(
          "Verified schedule saved. Tested and unverified classes remain unavailable for pull-outs.",
        );
        await openProfile(selected);
      } catch (e) {
        message(e.message, true);
      }
    };
    showWindows();
  }
  function readSchedule() {
    return [...root.querySelectorAll("[data-period]")].map((tr) => {
      const get = (n) => tr.querySelector(`[name="${n}"]`);
      return {
        period: get("period").value,
        course: get("course").value,
        teacher: get("teacher").value,
        room: get("room").value,
        start: get("start").value,
        end: get("end").value,
        days: [...tr.querySelectorAll("[name=days]:checked")].map(
          (x) => x.value,
        ),
        type: get("type").value,
        verified: get("verified").checked,
        source: get("source").value,
      };
    });
  }
  function showWindows() {
    const rows = pullWindows(schedule);
    $("#at-windows").innerHTML =
      "<h3>Available elective windows</h3>" +
      (rows.length
        ? rows
            .map(
              (r) =>
                `<p class="at-mini">${esc(r.days.join(", "))} · ${esc(r.start)}–${esc(r.end)} · ${esc(r.period)} · ${esc(r.course)} · ${esc(r.teacher)} · Room ${esc(r.room || "not verified")}</p>`,
            )
            .join("")
        : '<p class="at-mini">No verified 30-minute elective window yet. Missing and tested periods are never treated as available.</p>');
  }
  function renderPlan() {
    const windows = pullWindows(schedule);
    $("#at-detail").innerHTML =
      `<h3>Make room for the next step.</h3><p class="at-mini">Only verified elective periods can be planned. Sessions are checked against all student plans, including a 20-minute travel gap between schools. Planned sessions are not attendance or services delivered.</p><form id="at-plan"><div class="at-fields"><label>Date<input name="date" type="date" value="${nowDate()}" required></label><label>Start time<input name="start" type="time" required></label><label>Session duration<input name="duration" type="number" min="5" max="120" value="30" required></label><label>Suggested Pre-ETS category<select name="service"><option value="">Choose when relevant</option>${SERVICES.map((s) => `<option>${s}</option>`).join("")}</select></label></div><label>General instructional purpose<input name="objective" maxlength="500" placeholder="Workplace communication practice" required></label><button class="primary" ${!windows.length ? "disabled" : ""}>Check conflicts & add to plan</button></form><h3>Verified elective periods</h3>${windows.map((r) => `<p class="at-mini">${esc(r.period)} · ${esc(r.days.join(", "))} · ${esc(r.start)}–${esc(r.end)} · ${esc(r.teacher)}</p>`).join("") || "<p>Collect and review the schedule first.</p>"}<h3>Planned sessions</h3>${plans.map((p) => `<div class="at-plan-card"><b>${esc(p.date)} · ${esc(p.start)} · ${p.duration} minutes</b><br>${esc(p.period)} · ${esc(p.teacher)} · ${esc(p.objective)}<div class="at-tools"><button data-email-plan="${esc(p.id)}">Prepare teacher email draft</button></div></div>`).join("") || '<p class="at-mini">No planned sessions yet.</p>'}<div id="at-email" class="at-email"></div>`;
    $("#at-plan").onsubmit = async (e) => {
      e.preventDefault();
      try {
        const p = Object.fromEntries(new FormData(e.target));
        p.duration = Number(p.duration);
        await api("arcade_plan", {
          studentId: selected,
          plan: p,
          revision: details.revision,
        });
        message("Session added to the weekly plan. No email has been sent.");
        await openProfile(selected);
      } catch (e) {
        message(e.message, true);
      }
    };
  }
  function renderProgress() {
    const s = details.student;
    $("#at-detail").innerHTML =
      `<h3>Practice, made visible.</h3><div class="at-tools"><button data-at="print-student">Print individual progress</button><button data-at="export">Export student backup</button><a href="pre-ets-session-reports.html">Review official service reports →</a></div><p class="at-mini">Game evidence describes simulated practice. Official services use the existing reviewed report center. ESP, CDC and Pre-ETS Learning stay distinguished.</p>${reportHTML(details.records || [], { name: s.fullName, school: SCHOOLS.find((x) => x.id === s.school)?.label, studentId: s.id })}<h3>Record an observation you actually made</h3><form id="at-observation"><label>Game session<select name="runId">${(details.records || []).map((r) => `<option value="${esc(r.id)}">${esc(GAMES.find((g) => g.id === r.game)?.title || r.game)} · ${esc(stamp(r.startedAt))}</option>`).join("")}</select></label><label>Observed participation / teacher notes<textarea name="notes" maxlength="4000"></textarea></label><label>Assistance you actually provided<textarea name="assistance" maxlength="2000"></textarea></label><label><input name="observed" type="checkbox" style="display:inline;width:20px;min-height:20px" required> I observed the participation or provided the assistance described above.</label><button class="primary" ${!details.records?.length ? "disabled" : ""}>Save my observation</button></form><h3>Approved service records</h3>${(details.approvedReports || []).map((r) => `<p class="at-mini">${esc(stamp(r.draft?.end || r.created_at))} · ${esc(r.draft?.service || "Review source report")} · ${esc(r.draft?.duration_minutes ?? "Not verified")} minutes</p>`).join("") || '<p class="at-mini">No approved source report linked to this student. No service date or duration is inferred from games.</p>'}`;
    $("#at-observation").onsubmit = async (e) => {
      e.preventDefault();
      try {
        const f = e.target;
        await api("arcade_observation", {
          studentId: selected,
          runId: f.elements.runId.value,
          observed: f.elements.observed.checked,
          notes: f.elements.notes.value,
          assistance: f.elements.assistance.value,
          revision: details.revision,
        });
        message(
          "Teacher observation saved separately from game-generated evidence.",
        );
        await openProfile(selected);
      } catch (e) {
        message(e.message, true);
      }
    };
  }
  function showImport(rows) {
    importRows = rows;
    importPlan = null;
    $("#at-import").hidden = false;
    $("#at-import").innerHTML =
      `<div class="at-box at-import-panel"><p class="at-kicker">REVIEW BEFORE CHANGING ENROLLMENT</p><h3>Reconcile your roster.</h3><p class="at-mini">Import the private JSON roster prepared for this expansion, or enter a student below. Existing stable keys and approved Town aliases are checked before an account is created. Nothing is removed from the old Town profiles, bank or businesses.</p><label>Private roster JSON<input id="at-roster-file" type="file" accept="application/json,.json"></label><label>Roster rows (JSON array)<textarea id="at-roster-json" spellcheck="false">${esc(JSON.stringify(rows || [], null, 2))}</textarea></label><button data-at="preview" class="primary">Preview proposed roster</button><div id="at-import-plan"></div></div>`;
    $("#at-roster-file").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 300000) {
        message("Choose a roster file smaller than 300 KB.", true);
        return;
      }
      $("#at-roster-json").value = await file.text();
    };
    $("#at-import").scrollIntoView({ block: "start", behavior: "smooth" });
  }
  function showAdd() {
    $("#at-import").hidden = false;
    $("#at-import").innerHTML =
      `<div class="at-box"><h3>Add a student.</h3><p class="at-mini">ESP learners can join without Pre-ETS caseload enrollment. Every new account is checked against the existing roster before it is created.</p><form id="at-add"><div class="at-fields"><label>Full name<input name="fullName" maxlength="160" required></label><label>School<select name="school">${SCHOOLS.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join("")}</select></label><label>Program<select name="program"><option value="esp">ESP Enrichment</option><option value="preets">Pre-ETS caseload</option><option value="cdc">CDC instruction</option></select></label><label>Grade (leave blank when unknown)<input name="grade" maxlength="10"></label><label>Grade verification source<input name="source" maxlength="200"></label><label>Existing Town profile, if any<select name="alias"><option value="">New learner / no Town profile</option>${legacy.map((n) => `<option>${esc(n)}</option>`).join("")}</select></label></div><label><input name="gradeVerified" type="checkbox" style="display:inline;width:20px;min-height:20px"> I verified this grade from the named source</label><button class="primary">Check existing accounts & review</button></form></div>`;
    $("#at-add").elements.school.value = school;
    $("#at-add").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target,
        v = Object.fromEntries(new FormData(f));
      if (
        roster.some(
          (s) => s.school === v.school && norm(s.fullName) === norm(v.fullName),
        )
      ) {
        message(
          "This student already exists. Reuse their existing profile; change the enrollment-status filter if needed.",
          true,
        );
        return;
      }
      const student = {
        ...v,
        recordKey: uid(),
        gradeVerified: f.elements.gradeVerified.checked,
        aliases: v.alias ? [v.alias] : [],
        status: "active",
        learning: { mode: v.program === "esp" ? "esp" : "cdc" },
      };
      showImport([student]);
      await preview();
    };
  }
  async function showWeek() {
    const d = await api("arcade_week"),
      students = d.students.filter((s) => s.school === school),
      entries = students
        .flatMap((s) =>
          (s.plans || []).map((p) => ({ ...p, name: s.fullName })),
        )
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    $("#at-import").hidden = false;
    $("#at-import").innerHTML =
      `<div class="at-box"><p class="at-kicker">PLANNED · NOT SERVICES DELIVERED</p><h3>${esc(SCHOOLS.find((s) => s.id === school).label)} weekly service plan</h3><p class="at-mini">${students.filter((s) => s.status === "active" && !s.scheduleCount).length} active students still need a schedule. Missing details are never filled in automatically.</p><label>Week beginning<input type="date" id="at-week-date" value="${nowDate()}"></label><button data-at="print-week">Print this week</button><div id="at-week-rows"></div></div>`;
    const render = () => {
      const start = $("#at-week-date").value,
        end = new Date(start + "T12:00:00Z");
      end.setUTCDate(end.getUTCDate() + 7);
      const stop = end.toISOString().slice(0, 10);
      $("#at-week-rows").innerHTML =
        `<table class="at-table"><tr><th>Student</th><th>Date & time</th><th>Teacher / room</th><th>Purpose</th></tr>${entries
          .filter((p) => p.date >= start && p.date < stop)
          .map(
            (p) =>
              `<tr><td>${esc(p.name)}</td><td>${esc(p.date)} ${esc(p.start)} · ${p.duration} min</td><td>${esc(p.teacher)} · ${esc(p.room || "Unverified room")}</td><td>${esc(p.objective)}</td></tr>`,
          )
          .join("")}</table>`;
    };
    $("#at-week-date").onchange = render;
    render();
  }
  async function preview() {
    try {
      const parsed = JSON.parse($("#at-roster-json").value);
      importRows = Array.isArray(parsed) ? parsed : parsed.students;
      if (!Array.isArray(importRows))
        throw Error("Import must contain a students array.");
      const d = await api("arcade_preview", { students: importRows });
      importPlan = d.plan;
      importRevision = d.revision;
      $("#at-import-plan").innerHTML =
        `<h3>Proposed changes · not yet applied</h3><div class="at-table-wrap"><table class="at-table"><thead><tr><th>Student</th><th>School / grade</th><th>Enrollment</th><th>Account decision</th></tr></thead><tbody>${importPlan.map((p) => `<tr><td>${esc(p.student.fullName)}</td><td>${esc(p.student.school.toUpperCase())} · ${esc(p.student.gradeVerified ? p.student.grade : "Unverified")}</td><td>${esc(p.student.status)}${p.student.initialSchedule?.length ? "<br>" + p.student.initialSchedule.length + " schedule draft row(s) for review" : ""}</td><td>${esc(p.action)} · ${esc(p.reason)}${p.id ? "<br>Existing ID: " + esc(p.id) : ""}</td></tr>`).join("")}</tbody></table></div><p class="at-mini">Every unlisted existing account stays unchanged. Seniors are archived only when verified in the reviewed import. Historical records are preserved.</p><label><input id="at-import-reviewed" type="checkbox" style="display:inline;width:20px;min-height:20px"> I reviewed every name, school, grade, alias and enrollment decision.</label><button data-at="apply-import" class="at-approve" ${importPlan.some((p) => p.action === "review") ? "disabled" : ""}>Apply this reviewed roster</button>`;
      message(
        "Preview ready. Review the proposed final roster before applying.",
      );
    } catch (e) {
      message(e.message, true);
    }
  }
  function download(data, name) {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function print(html) {
    let el = document.querySelector(".at-print-area");
    if (!el) {
      el = document.createElement("div");
      el.className = "at-print-area";
      el.dataset.monitorPrivate = "";
      document.body.append(el);
    }
    el.innerHTML = html;
    el.classList.add("printing");
    window.print();
    window.addEventListener(
      "afterprint",
      () => {
        el.classList.remove("printing");
        el.innerHTML = "";
      },
      { once: true },
    );
  }
  root.addEventListener(
    "change",
    (e) => {
      if (e.target.id === "at-status") {
        status = e.target.value;
        selected = "";
        draw();
      }
    },
    { signal },
  );
  root.addEventListener(
    "input",
    (e) => {
      if (e.target.id === "at-search") {
        const q = e.target.value.toLowerCase();
        $("#at-students").innerHTML = roster
          .filter(
            (s) =>
              s.school === school &&
              (status === "all" || s.status === status) &&
              (s.fullName + " " + s.grade).toLowerCase().includes(q),
          )
          .map(studentButton)
          .join("");
      }
    },
    { signal },
  );
  root.addEventListener(
    "click",
    async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      try {
        if (b.dataset.school) {
          school = b.dataset.school;
          selected = "";
          draw();
          return;
        }
        if (b.dataset.student) {
          openProfile(b.dataset.student);
          return;
        }
        if (b.dataset.subview) {
          subview = b.dataset.subview;
          renderProfile();
          return;
        }
        if (b.dataset.removePeriod !== undefined) {
          schedule = readSchedule().filter(
            (_, i) => i !== Number(b.dataset.removePeriod),
          );
          renderSchedule();
          return;
        }
        if (b.dataset.emailPlan) {
          const plan = plans.find((p) => p.id === b.dataset.emailPlan),
            draft = teacherEmail(plan, details.student);
          $("#at-email").innerHTML =
            `<h3>Review your teacher email.</h3><p class="at-mini">Edit and copy this draft after you approve its contents. This workspace never sends email.</p><label>Subject<input id="at-email-subject" value="${esc(draft.subject)}"></label><label>Message<textarea id="at-email-body">${esc(draft.body)}</textarea></label><button data-at="copy-email">I reviewed this draft · copy email</button>`;
          return;
        }
        const a = b.dataset.at;
        if (a === "import") showImport([]);
        if (a === "week") await showWeek();
        if (a === "print-week")
          print(
            "<h1>Weekly service plan</h1><p>Planned sessions only. Not a record of service delivery.</p>" +
              $("#at-week-rows").innerHTML,
          );
        if (a === "add") showAdd();
        if (a === "preview") await preview();
        if (a === "apply-import") {
          if (!$("#at-import-reviewed")?.checked)
            throw Error(
              "Review the proposed roster and check the approval box.",
            );
          await api("arcade_reconcile", {
            students: importRows,
            revision: importRevision,
            reviewed: true,
          });
          selected = "";
          await refresh();
          message(
            "Roster reconciled. Existing student IDs and historical records were preserved.",
          );
        }
        if (a === "period") {
          schedule = readSchedule();
          schedule.push({
            days: ["MO", "TU", "WE", "TH", "FR"],
            type: "unknown",
            verified: false,
          });
          renderSchedule();
        }
        if (a === "device") {
          const d = await api("arcade_device", { studentId: selected });
          $("#at-device").innerHTML =
            `<p class="at-mini">Privately copy this key onto the student’s device using Learning Arcade → Connect my learning. It expires ${esc(stamp(d.expires_at))}. Do not include it in email or reports.</p><p class="at-key">${esc(d.token)}</p>`;
        }
        if (a === "export") {
          download(
            await api("arcade_export", { studentId: selected }),
            "student-learning-backup.json",
          );
          message("Private student backup downloaded.");
        }
        if (a === "print-student")
          print(
            reportHTML(details.records, {
              name: details.student.fullName,
              school: SCHOOLS.find((s) => s.id === school)?.label,
              studentId: selected,
            }),
          );
        if (a === "copy-email") {
          try {
            await navigator.clipboard.writeText(
              "Subject: " +
                $("#at-email-subject").value +
                "\n\n" +
                $("#at-email-body").value,
            );
            message("Reviewed email copied. No message has been sent.");
          } catch {
            message("Select and copy the edited subject and message manually.");
          }
        }
        if (a === "summary") {
          const d = await api("arcade_week");
          const list = d.students.filter((s) => s.school === school);
          print(
            `<h1>${esc(SCHOOLS.find((s) => s.id === school).label)} · Teacher summary</h1><p>Printed ${esc(stamp(new Date().toISOString()))}</p><table><tr><th>Student</th><th>Grade</th><th>Status</th><th>Program</th><th>Next activity</th><th>Actual game evidence</th></tr>${list
              .map(
                (s) =>
                  `<tr><td>${esc(s.fullName)}</td><td>${esc(s.gradeVerified ? s.grade : "Unverified")}</td><td>${esc(s.status)}</td><td>${esc(s.program)}</td><td>${esc(GAMES.find((g) => g.id === s.learning?.recommendedGame)?.title || "Teacher selects")}</td><td>${[
                    "cdc",
                    "preets",
                    "esp",
                  ]
                    .map((mode) => {
                      const sums = (s.records || [])
                        .filter((r) => r.options.mode === mode)
                        .map(summary);
                      return (
                        esc(mode.toUpperCase()) +
                        ": " +
                        sums.reduce((n, r) => n + r.rounds, 0) +
                        " rounds / " +
                        Math.round(sums.reduce((n, r) => n + r.minutes, 0)) +
                        " active min"
                      );
                    })
                    .join("<br>")}</td></tr>`,
              )
              .join(
                "",
              )}</table><p>ESP enrichment is separate from official Pre-ETS service documentation. This list is not a service record.</p>`,
          );
        }
      } catch (e) {
        message(e.message, true);
      }
    },
    { signal },
  );
  await refresh();
  return dispose;
}
