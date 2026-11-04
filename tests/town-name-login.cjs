'use strict';

// Run the page's own sign-in functions in an isolated DOM/storage fixture.
// Network access is intentionally unavailable: choosing a student must work offline.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'transition-town.html'), 'utf8');

const newStudents = [
  'Alexis Sims', 'Angelina Whitson', 'Avery Fisher', 'Ayden Patterson',
  'Chayden Cleek', 'Christopher Infelise', 'Ethan Jack Merritt',
  'Justice Yonushewski', 'Karina Bramlett', 'Leonel Sanchez-Aguilar',
  'Owen Sharp', 'Preston Goodman', 'Savannah Lannom', 'Tyler Elkins'
];
const legacyProfiles = [
  'Bradley', 'Jaden', 'Clark', 'Noah', 'Olivia', 'Kaylee', 'Gia', 'Jacob',
  'Jasmine', 'Cameron', 'Dalton', 'Allen', 'Snow', 'Aubrey', 'Haley',
  'Jocquan', 'Alyssa', 'Nicholas', 'Aiden', 'Chevi', 'Adon', 'Miss Kayla', 'Guest'
];
const originalOCProfiles = ['Jasmine', 'Cameron', 'Snow', 'Aubrey', 'Chevi'];
let checks = 0;
function eq(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++; }
function ok(value, message) { assert.ok(value, message); checks++; }
function section(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, `Page section exists: ${startMarker}`);
  return html.slice(start, end);
}
const loginSource = section('function ensure(n)', 'function loginKayla()');
const viewSource = section('function studentView()', 'async function unlockKaylaView()');
const restoreSource = section('(async function restoreOpeningLoginAndKaylaBalance(){', '</script>');
const plain = value => JSON.parse(JSON.stringify(value));

function storage(initial = {}) {
  const target = Object.assign(Object.create(null), initial);
  Object.defineProperties(target, {
    getItem: { value(key) { return Object.hasOwn(this, key) ? String(this[key]) : null; } },
    setItem: { value(key, value) { this[key] = String(value); } },
    removeItem: { value(key) { delete this[key]; } }
  });
  return target;
}
function savedResident() {
  return {
    checking: 4275.65, savings: 810, sessions: 7, career: 'Veterinary assistant',
    job: 'Pet sitter', home: 'Apartment', car: 'Compact', avatar: null,
    history: [{ kind: 'purchase', amount: 24 }], notifications: [{ read: true }],
    progress: { completed: ['budget', 'interview'], score: 6 }
  };
}
function fixture({ selected = '', session = {}, local = {}, current = '', world } = {}) {
  const initialWorld = world || {
    residents: { Jasmine: savedResident(), 'Existing unrelated profile': savedResident() },
    revision: 8, settings: { music: false }
  };
  const localStorage = storage({ ttWorld: JSON.stringify(initialWorld), ...local });
  const sessionStorage = storage(session);
  const classes = new Set(['login-required']);
  const calls = { fetch: 0, close: 0, dashboard: 0, teacher: 0, monitorEnd: 0, alerts: [], leave: [], payday: [] };
  let rendered = '';
  const selection = { value: selected };
  const pin = { focus() {}, addEventListener() {} };
  const context = vm.createContext({
    AbortSignal, URLSearchParams, TypeError, sessionStorage, localStorage,
    current, activeGroup: [], status: { textContent: '' },
    location: { search: '', replace(url) { calls.redirect = url; } },
    document: {
      querySelector(selector) { return selector === '#loginProfile' ? selection : null; },
      getElementById(id) { return id === 'ttKaylaPin' ? pin : null; },
      body: { classList: {
        add(...names) { names.forEach(name => classes.add(name)); },
        remove(...names) { names.forEach(name => classes.delete(name)); }
      } }
    },
    window: {
      TTRoom: { leaveStudent(name) { calls.leave.push(name); } },
      TTPayday: { enter(name) { calls.payday.push(name); } },
      TTMonitor: { end() { calls.monitorEnd++; } }
    },
    get() { return JSON.parse(localStorage.ttWorld); },
    put(value) { localStorage.ttWorld = JSON.stringify(value); },
    openSheet(value) { rendered = value; },
    closeSheet() { calls.close++; },
    renderResidentDashboard() { calls.dashboard++; },
    teacher() { calls.teacher++; },
    alert(value) { calls.alerts.push(value); },
    async fetch() { calls.fetch++; throw new Error('Network access is disabled in sign-in tests'); }
  });
  context.TTRoom = context.window.TTRoom;
  vm.runInContext(loginSource + '\n' + viewSource, context);
  return {
    context, localStorage, sessionStorage, calls, classes, selection,
    rendered: () => rendered,
    world: () => JSON.parse(localStorage.ttWorld),
    run: source => vm.runInContext(source, context)
  };
}

(async function main() {
  const picker = fixture();
  const profiles = plain(picker.run('townLoginProfiles'));
  eq([...profiles].sort(), [...legacyProfiles, ...newStudents].sort(), 'all existing profiles and all 14 new students are available exactly once');
  eq(new Set(profiles).size, profiles.length, 'picker has no duplicate identity keys');
  eq(plain(picker.run('Array.from(townOCProfiles)')).sort(), [...originalOCProfiles, ...newStudents].sort(), 'OC section includes the original five and all 14 new students');
  picker.run('resident()');
  const markup = picker.rendered();
  const options = [...markup.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)];
  eq(options.filter(match => match[1]).map(match => match[1]).sort(), [...profiles].sort(), 'select values preserve stored identity keys');
  ok(!/<input\b|<form\b|id="privateTown(?:Code|SignIn)"/.test(markup), 'name picker requires no input or access-code form');
  ok(/<select[^>]*id="loginProfile"/.test(markup) && /onclick="login\(\)"/.test(markup), 'name picker has a connected enter button');
  eq(options.find(match => match[1] === 'Ethan Jack Merritt')?.[2], 'Ethan “Jack” Merritt', 'nickname is displayed without changing the saved student identity');
  eq(picker.calls.fetch, 0, 'rendering the login form does not request a code');

  // Existing students and the newly listed names use exactly the same login path.
  for (const name of [...legacyProfiles.filter(name => name !== 'Miss Kayla'), ...newStudents]) {
    const world = {
      residents: { [name]: savedResident(), 'Other student': savedResident() },
      settings: { music: false }, revision: 11
    };
    const f = fixture({ selected: name, current: 'Previous student', world,
      session: { ttPrivateTownCode: 'obsolete-session-value', ttKaylaPinVerified: 'yes' } });
    f.classes.add('teacher-mode');
    await f.run('login()');
    eq(f.context.current, name, 'selected student becomes the active identity');
    eq([f.localStorage.ttCurrent, f.sessionStorage.ttCurrent, f.sessionStorage.ttVisitIdentity], [name, name, name], 'login keeps the exact identity across navigation');
    eq(f.sessionStorage.getItem('ttPrivateTownCode'), null, 'name login discards a stale access code');
    eq(f.world(), world, 'login preserves existing balances, activity, and other profiles');
    eq(f.calls.fetch, 0, 'student login works without a server request');
    eq(f.calls.leave, ['Previous student'], 'changing students leaves the previous classroom identity');
    ok(!f.classes.has('login-required') && !f.classes.has('teacher-mode'), 'student entry opens student view');
    eq(f.sessionStorage.getItem('ttKaylaPinVerified'), null, 'student view does not retain teacher authorization');
  }

  const firstVisit = fixture({ selected: newStudents[0] });
  const oldWorld = firstVisit.world();
  await firstVisit.run('login()');
  eq(firstVisit.world().residents[newStudents[0]].checking, 10000, 'first visit receives the normal starting balance');
  eq(firstVisit.world().residents.Jasmine, oldWorld.residents.Jasmine, 'creating one new profile preserves existing student data');
  const afterFirstVisit = firstVisit.world();
  await firstVisit.run('login()');
  eq(firstVisit.world(), afterFirstVisit, 'repeated login never creates a second profile or another starting balance');

  // Opening the town again in the same tab restores every new account without a code.
  for (const name of newStudents) {
    const world = { residents: { [name]: savedResident(), Jasmine: savedResident() } };
    const f = fixture({ world, session: {
      ttCurrent: name, ttVisitIdentity: name, ttPrivateTownCode: 'obsolete-session-value'
    } });
    await f.run(restoreSource);
    eq(f.context.current, name, 'same-tab reload restores a new student');
    eq(f.sessionStorage.getItem('ttPrivateTownCode'), null, 'reload discards the former code');
    eq(f.calls.fetch, 0, 'same-tab restore needs no access-code verification');
    eq(f.world(), world, 'same-tab restore preserves saved progress and balances');
    ok(!f.classes.has('login-required'), 'restored student enters town');
  }

  const navigation = fixture({ session: { ttCurrent: 'Cameron', ttVisitIdentity: 'Cameron' } });
  navigation.context.location.search = '?resident=' + encodeURIComponent('Ethan Jack Merritt');
  await navigation.run(restoreSource);
  eq(navigation.context.current, 'Ethan Jack Merritt', 'same-tab resident navigation preserves the full stored name');
  eq(navigation.calls.fetch, 0, 'resident navigation does not request a code');

  const exit = fixture({ selected: newStudents[0], session: { ttTownTeacherCode: 'obsolete-session-value' }, local: { ttActiveGroup: '["Alexis Sims"]' } });
  await exit.run('login()');
  const beforeExit = exit.world();
  exit.sessionStorage.setItem('ttPrivateTownCode', 'obsolete-session-value');
  exit.run('logoutTown()');
  eq(exit.context.current, '', 'logout clears the current student');
  for (const key of ['ttCurrent', 'ttVisitIdentity', 'ttPrivateTownCode', 'ttKaylaPinVerified', 'ttTownTeacherCode']) {
    eq(exit.sessionStorage.getItem(key), null, 'logout removes temporary sign-in state');
  }
  eq(exit.localStorage.getItem('ttCurrent'), null, 'logout clears persisted current identity');
  eq(exit.localStorage.getItem('ttActiveGroup'), null, 'logout clears the selected group');
  eq(exit.world(), beforeExit, 'logout leaves student progress saved');
  await exit.run(restoreSource);
  eq(exit.context.current, '', 'reload after logout stays at the picker');
  ok(exit.classes.has('login-required') && /id="loginProfile"/.test(exit.rendered()), 'logout returns to name selection');
  eq(exit.calls.fetch, 0, 'student logout and reopening make no sign-in requests');

  const newTab = fixture({ local: { ttCurrent: newStudents[0] } });
  await newTab.run(restoreSource);
  eq(newTab.context.current, '', 'a saved device profile alone does not select a student in a fresh tab');
  ok(newTab.classes.has('login-required'), 'fresh tab requires name selection');

  const empty = fixture();
  const beforeEmpty = empty.world();
  await empty.run('login()');
  eq(empty.calls.alerts, ['Choose a profile first.'], 'empty selection asks for a name');
  eq(empty.world(), beforeEmpty, 'empty selection does not create a profile');
  eq(empty.context.current, '', 'empty selection does not enter town');

  const teacher = fixture({ selected: 'Miss Kayla', session: { ttPrivateTownCode: 'obsolete-session-value' } });
  await teacher.run('login()');
  eq(teacher.calls.teacher, 0, 'choosing the teacher profile does not bypass its PIN');
  ok(!teacher.classes.has('teacher-mode'), 'teacher controls stay locked before PIN verification');
  ok(/id="ttKaylaPin"/.test(teacher.rendered()) && /type="password"/.test(teacher.rendered()), 'the existing teacher PIN form still opens');
  eq(teacher.sessionStorage.getItem('ttPrivateTownCode'), null, 'teacher profile selection also clears the obsolete student code');
  teacher.sessionStorage.setItem('ttKaylaPinVerified', 'yes');
  teacher.run('teacherView()');
  eq(teacher.calls.teacher, 1, 'the verified teacher session can open its existing controls');
  ok(teacher.classes.has('teacher-mode'), 'verified teacher view retains its normal mode');
  eq(teacher.calls.fetch, 0, 'selecting a teacher profile does not use student access-code verification');

  const redirect = fixture({ selected: newStudents[0] });
  redirect.context.location.search = '?next=the-zoo.html%3Factivity%3Dcare';
  await redirect.run('login()');
  eq(redirect.calls.redirect, 'the-zoo.html?activity=care', 'name login still continues to the requested town activity');
  eq(redirect.sessionStorage.ttCurrent, newStudents[0], 'activity navigation keeps the chosen student');

  console.log(`PASS ${checks} town-name-login assertions (all 14 new students, legacy profiles, saved progress, reload/logout, and teacher PIN)`);
})().catch(error => { console.error(error); process.exitCode = 1; });
