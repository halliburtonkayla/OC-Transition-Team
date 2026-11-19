import {CATALOG} from './catalog.mjs';
import {ACTIVITY, careerById} from './model.mjs';
import {worksheetPaper, printFair} from './print.mjs';
import {centralRange, stamp} from '../life-quest/report.mjs';
import {escapeHTML as esc} from '../learning/progress.mjs';

const stages = new Set(['video','reading','worksheet','scenario','completed']);

export function careerFairRows(events, schools = {}) {
  const rows = new Map();
  for (const event of [...events].sort((a,b) => Date.parse(a.at)-Date.parse(b.at))) {
    const details = event.details;
    if (event.source !== 'application_event' || details?.action !== ACTIVITY || !stages.has(details.status)) continue;
    const career = careerById.get(details.item);
    if (!career) continue;
    const key = JSON.stringify([event.student, career.id]);
    const row = rows.get(key) || {
      student:event.student, school:schools[event.student] || 'School unverified', career, completed:false,
      video:false, transcript:false, best:0, attempts:0, scenario:false, seenWorksheet:false
    };
    row.last = event.at;
    row.video ||= details.role === 'video' || details.status === 'video';
    row.transcript ||= details.role === 'reading' || details.status === 'reading';
    row.completed ||= details.status === 'completed' && event.kind === 'completed';
    row.scenario ||= details.decision === true;
    row.attempts = Math.max(row.attempts, Math.max(0, Math.trunc(Number(details.attempt)||0)));
    row.seenWorksheet ||= row.attempts > 0;
    row.best = Math.max(row.best, Math.min(career.questions.length, Math.trunc(Number(details.success)||0)));
    rows.set(key,row);
  }
  return [...rows.values()].sort((a,b) => a.student.localeCompare(b.student) || a.career.title.localeCompare(b.career.title));
}

function resultsTable(rows) {
  const evidence = row => [row.video && 'Video watched', row.transcript && 'Reading option completed'].filter(Boolean).join(' · ') || '—';
  return `<div class="cf-table-wrap" tabindex="0" role="region" aria-label="Career fair results"><table class="cf-table">
    <thead><tr><th scope="col">Student / school</th><th scope="col">Career</th><th scope="col">Video / reading</th><th scope="col">Best worksheet</th><th scope="col">Scenario</th><th scope="col">Progress</th><th scope="col">Last evidence</th></tr></thead>
    <tbody>${rows.map(row => `<tr><th scope="row">${esc(row.student)}<br>${esc(row.school)}</th><td>${esc(row.career.title)}<br>${esc(row.career.group.title)}</td><td>${evidence(row)}</td><td>${row.seenWorksheet ? `${row.best}/${row.career.questions.length} · ${row.attempts} checks` : '—'}</td><td>${row.scenario ? 'Passed' : '—'}</td><td>${row.completed ? 'Completed' : 'In progress'}</td><td>${esc(stamp(row.last))}</td></tr>`).join('')}</tbody>
  </table></div>`;
}

export function mountCareerFair(root,{data,api,isCurrent = () => true}) {
  const pupils = [...new Set([...(data.roster || []),...(data.devices || []).filter(device => device.approved_at).map(device => device.student)])].filter(Boolean).sort();
  const schools = Object.fromEntries([...(data.devices||[]),...(data.sessions||[])].filter(record => record.school).map(record => [record.student, record.school]));
  const groupOptions = CATALOG.map(group => `<option value="${group.id}">${esc(group.title)}</option>`).join('');
  const markup = document.createElement('section');
  markup.className = 'cf-teacher';
  markup.innerHTML = `<h2>Virtual Career Fair · Teacher report</h2>
    <p>Career activity recorded during approved classroom sessions. Review this evidence with the student before using it in a Pre-ETS report.</p>
    <form class="cf-teacher-form">
      <label>Student<select name="student"><option value="">All connected students</option>${pupils.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></label>
      <label>Career group<select name="group"><option value="">All career groups</option>${groupOptions}</select></label>
      <label>From (Central)<input type="date" name="from" required></label>
      <label>Through (Central)<input type="date" name="to" required></label>
      <button>Load recorded results</button>
    </form>
    <p role="status" data-cf-teacher-status>Choose dates to load recorded results.</p>
    <div data-cf-teacher-results></div>
    <button data-cf-teacher-print type="button" disabled>Print loaded results</button>
    <hr>
    <h3>Worksheet answer keys</h3>
    <form class="cf-teacher-form" data-cf-key>
      <label>Career<select name="career">${CATALOG.map(group => `<optgroup label="${esc(group.title)}">${group.careers.map(({id,title}) => `<option value="${id}">${esc(title)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <button>Print teacher answer key</button>
    </form>
    <p><a href="virtual-career-fair.html">Open the Virtual Career Fair</a></p>`;
  root.replaceChildren(markup);
  const connected = () => isCurrent() && markup.isConnected;
  const form = markup.querySelector('form');
  const print = markup.querySelector('[data-cf-teacher-print]');
  const status = markup.querySelector('[data-cf-teacher-status]');
  const output = markup.querySelector('[data-cf-teacher-results]');
  const schoolToday = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  form.elements.to.value = schoolToday;
  form.elements.from.value = schoolToday.slice(0,8)+'01';
  let rows = [];

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const {student,group,from,to} = Object.fromEntries(new FormData(form));
    if (from > to) { status.textContent = 'Choose an end date on or after the start date.'; return; }
    const range = centralRange(from,to);
    const chosen = student ? [student] : pupils;
    const button = event.submitter || form.querySelector('button');
    button.disabled = true;
    print.disabled = true;
    output.replaceChildren();
    status.textContent = 'Loading classroom history…';
    const events = [];
    const failures = [];
    let next = 0;
    async function worker() {
      while (connected() && next < chosen.length) {
        const name = chosen[next++];
        try { events.push(...(await api('history',{student:name,...range})).events); }
        catch { failures.push(name); }
      }
    }
    await Promise.all(Array.from({length:Math.min(4,chosen.length)},worker));
    if (!connected()) return;
    rows = careerFairRows(events,schools).filter(row => !group || row.career.group.id === group);
    status.textContent = `${rows.length} career record${rows.length === 1 ? '' : 's'}. ${failures.length ? `Could not load history for ${failures.join(', ')}.` : rows.length ? '' : 'No career fair evidence in this date range.'}`;
    if (rows.length) output.innerHTML = resultsTable(rows);
    print.disabled = !rows.length;
    button.disabled = false;
  });
  print.addEventListener('click', () => {
    if (rows.length) printFair(`<h1>Transition Town Virtual Career Fair</h1><h2>Recorded career results</h2><p>Application-reported classroom evidence · Central time</p>${resultsTable(rows)}`);
  });
  markup.querySelector('[data-cf-key]').addEventListener('submit', event => {
    event.preventDefault();
    printFair(worksheetPaper(careerById.get(event.currentTarget.elements.career.value),true));
  });
}
