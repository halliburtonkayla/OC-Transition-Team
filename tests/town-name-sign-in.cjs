const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('transition-town.html', 'utf8');
const profiles = html.slice(html.indexOf('const townLoginProfiles='), html.indexOf('function logoutTown()'));
const login = html.slice(html.indexOf('function login(){'), html.indexOf('function loginKayla()'));
const restore = html.slice(html.indexOf('(async function restoreOpeningLoginAndKaylaBalance(){'), html.indexOf('</script>', html.indexOf('(async function restoreOpeningLoginAndKaylaBalance(){')));
let checks = 0;
const eq = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
function makeContext() {
  const elements = {
    loginProfile: { value: '', innerHTML: '', isConnected: true },
    townProfilesNotice: { textContent: '', innerHTML: '' }
  };
  const localStorage = { ttWorld: '{"residents":{"Name Learner":{"checking":147,"sessions":3}}}' };
  const sessionStorage = { removeItem(key) { delete this[key]; }, getItem(key) { return this[key] || null; } };
  localStorage.removeItem = sessionStorage.removeItem;
  const context = vm.createContext({
    console, AbortSignal, URLSearchParams, elements, localStorage, sessionStorage,
    current: '', calls: [], selected: '', entered: '', shown: '', teacherOpened: false,
    names: ['Name Learner', 'Second Learner'], failFetch: false,
    document: { querySelector: selector => elements[selector.slice(1)] || null, body: { classList: { add() {} } } },
    status: { textContent: '' }, location: { search: '', replace: value => { context.redirect = value; } },
    alert: text => { context.alerted = text; }, window: {},
    ensure: name => { context.selected = name; },
    openSheet: markup => { context.shown = markup; },
    studentView: () => { context.entered = context.current; },
    teacherView: () => { context.teacherOpened = true; },
    fetch: async (url, options) => {
      context.calls.push(JSON.parse(options.body));
      if (context.failFetch) throw Error('Offline');
      return { ok: true, json: async () => ({ students: context.names }) };
    }
  });
  vm.runInContext(profiles + '\n' + login, context);
  return context;
}
(async () => {
  const c = makeContext();
  const before = c.localStorage.ttWorld;
  c.elements.loginProfile.value = 'Jaden';
  await c.refreshTownLoginProfiles();
  eq(c.elements.loginProfile.value, 'Jaden', 'loading names preserves the current selection');
  eq(c.elements.loginProfile.innerHTML.includes('Name Learner'), true);
  await c.refreshTownLoginProfiles();
  eq((c.elements.loginProfile.innerHTML.match(/value="Name Learner"/g) || []).length, 1, 'repeat loads do not duplicate names');
  c.resident();
  eq(c.shown.includes('type="password"'), false, 'login has no access-code field');
  eq(c.shown.includes('privateTownSignIn'), false);
  await c.loadTownLoginProfiles();
  c.sessionStorage.ttPrivateTownCode = 'old-session-code';
  c.elements.loginProfile.value = 'Name Learner';
  c.login();
  eq(c.entered, 'Name Learner');
  eq(c.sessionStorage.ttCurrent, 'Name Learner');
  eq(c.sessionStorage.ttVisitIdentity, 'Name Learner');
  eq(c.sessionStorage.ttPrivateTownCode, undefined);
  eq(c.localStorage.ttWorld, before, 'existing progress is preserved');
  eq(c.calls.every(call => call.action === 'town_profiles'), true, 'entry never verifies or sends an access code');
  c.elements.loginProfile.value = 'Miss Kayla';
  c.login();
  eq(c.teacherOpened, true, 'teacher sign-in still takes the protected teacher path');
  const returning = makeContext();
  returning.sessionStorage.ttCurrent = 'Name Learner';
  await vm.runInContext(restore, returning);
  eq(returning.entered, 'Name Learner', 'new name profiles restore without a code');
  const retry = makeContext();
  retry.failFetch = true;
  await retry.refreshTownLoginProfiles();
  eq(retry.elements.townProfilesNotice.innerHTML.includes('Try again'), true);
  retry.failFetch = false;
  await retry.refreshTownLoginProfiles();
  eq(retry.elements.townProfilesNotice.textContent.includes('No access code'), true);
  const escaped = makeContext();
  escaped.names = ['<img onerror="bad">'];
  await escaped.refreshTownLoginProfiles();
  eq(escaped.elements.loginProfile.innerHTML.includes('<img'), false, 'names are escaped before rendering');
  const forward = makeContext();
  forward.location.search = '?next=watch-and-learn.html';
  forward.elements.loginProfile.value = 'Name Learner';
  forward.login();
  eq(forward.redirect, 'watch-and-learn.html', 'activity return links still work');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=|\btype\s*=\s*["']module/.test(match[1])) new vm.Script(match[2]);
  }
  console.log(`PASS ${checks} name-selection, no-code entry, progress, restore, retry, escaping and navigation assertions; inline scripts parse`);
})().catch(error => { console.error(error); process.exitCode = 1; });
