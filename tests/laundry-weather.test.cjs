// Run with: node --test tests/laundry-weather.test.cjs
// Deterministic DOM, clock and speech fakes exercise the actual inline game.
// Chrome keyboard/mouse and responsive/touch checks are separate browser QA.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'laundry-weather-game.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const answers = [
  ['summer', 'summer', 'spring', 'summer'],
  ['winter', 'snow', 'fall', 'winter'],
  ['rain', 'spring', 'rain', 'fall'],
  ['fall', 'rain', 'snow', 'summer']
];

function game({ speech = true, throwSpeech = false } = {}) {
  let now = 0, nextTimer = 0;
  const timers = new Map(), elements = new Map(), spoken = [];
  const windowEvents = new Map();
  let focused = null, cancellations = 0;
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase();
      this.className = '';
      this.dataset = {};
      this.style = {};
      this.attributes = {};
      this.children = [];
      this.hidden = false;
      this.disabled = false;
      this._html = '';
      this.textContent = '';
      this.classList = {
        contains: c => this.className.split(/\s+/).includes(c),
        add: (...cs) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...cs])].join(' '); },
        remove: (...cs) => { this.className = this.className.split(/\s+/).filter(c => !cs.includes(c)).join(' '); }
      };
    }
    get innerHTML() { return this._html; }
    set innerHTML(value) { this._html = value; this.children = []; this.textContent = ''; }
    appendChild(child) { this.children.push(child); return child; }
    insertAdjacentHTML(position, value) { assert.equal(position, 'beforeend'); this._html += value; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
    focus() { focused = this; }
    querySelectorAll(selector) {
      return this.children.filter(c => selector[0] === '.' ? c.classList.contains(selector.slice(1)) : c.tagName.toLowerCase() === selector);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    click() { if (!this.disabled && !this.hidden && this.onclick) this.onclick(); }
  }
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)) {
    const element = new Element(match[1]);
    element.hidden = /\bhidden\b/.test(match[2]);
    const className = match[2].match(/class="([^"]+)"/);
    if (className) element.className = className[1];
    elements.set(match[3], element);
  }
  const window = { addEventListener: (event, callback) => windowEvents.set(event, callback) };
  if (speech) {
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    window.speechSynthesis = {
      paused: false,
      resume() { this.paused = false; },
      cancel() { cancellations++; },
      speak(utterance) { if (throwSpeech) throw new Error('No speech engine'); spoken.push(utterance); }
    };
  }
  const context = vm.createContext({
    window, document: { getElementById: id => elements.get(id), createElement: tag => new Element(tag) },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout: id => timers.delete(id), console
  });
  vm.runInContext(source, context, { filename: 'laundry-weather-game.html' });
  const id = name => elements.get(name);
  const cards = () => id('socks').children;
  function tick(delay) {
    const until = now + delay;
    for (;;) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    now = until;
  }
  function choose(key) { id('choices').children.find(b => b.dataset.k === key).click(); }
  function completeLevel(index) { for (const key of answers[index]) { choose(key); tick(1000); } }
  function pairs() {
    const groups = new Map();
    for (const card of cards()) groups.set(card.dataset.v, [...(groups.get(card.dataset.v) || []), card]);
    return [...groups.values()];
  }
  function matchAll() { for (const pair of pairs()) pair.forEach(card => card.click()); }
  async function flush() { for (let i = 0; i < 5; i++) await Promise.resolve(); }
  return { id, cards, choose, completeLevel, pairs, matchAll, tick, timers, spoken, flush,
    focused: () => focused, cancellations: () => cancellations,
    leave: () => windowEvents.get('pagehide')() };
}

test('each of all four levels gets a fresh, fully playable bonus; completion stays visible', () => {
  const g = game();
  for (let level = 0; level < 4; level++) {
    g.completeLevel(level);
    assert.equal(g.id('reward').style.display, 'block');
    assert.equal(g.id('bonus').hidden, false, 'bonus must return after every level');
    assert.equal(g.id('bonusPanel').hidden, true);
    assert.equal(g.cards().length, 0);
    assert.equal(g.focused(), g.id('rewardTitle'));
    g.id('bonus').click();
    assert.equal(g.cards().length, 8);
    assert.ok(g.pairs().every(pair => pair.length === 2));
    assert.equal(g.id('bonusProgress').textContent, 'Pairs found: 0 of 4');
    g.matchAll();
    assert.equal(g.id('bonusProgress').textContent, 'Pairs found: 4 of 4');
    assert.equal(g.id('bonusFeedback').textContent, 'All four pairs found! Reward complete.');
    assert.ok(g.cards().every(card => card.classList.contains('done')));
    g.tick(10000);
    assert.equal(g.id('reward').style.display, 'block', 'do not rush past a completed reward');
    assert.equal(g.id('next').textContent, level === 3 ? 'Finish Game' : 'Next Level');
    g.id('next').click();
  }
  assert.equal(g.id('weather').textContent, 'All Levels Complete!');
  assert.equal(g.id('feedback').textContent, 'You finished with 16 correct outfits.');
  assert.equal(String(g.id('round').textContent), '4');
  assert.equal(g.id('readChoices').hidden, true);
  assert.doesNotThrow(() => g.id('readWeather').onclick());
});

test('skip before, during, and after a reward; stale mismatch timers cannot alter the next board', () => {
  const g = game();
  g.completeLevel(0);
  g.id('next').click();
  g.completeLevel(1);
  g.id('bonus').click();
  const [a, b] = g.pairs();
  a[0].click(); b[0].click();
  const stale = [...g.timers.values()][0].callback;
  g.id('next').click();
  assert.equal(g.timers.size, 0);
  g.completeLevel(2);
  g.id('bonus').click();
  const newCard = g.cards()[0];
  newCard.click();
  stale();
  assert.equal(newCard.classList.contains('open'), true);
  assert.equal(g.id('bonusProgress').textContent, 'Pairs found: 0 of 4');
  g.id('next').click();
  g.completeLevel(3);
  assert.equal(g.id('bonus').hidden, false);
  g.id('next').click();
  assert.equal(g.id('weather').textContent, 'All Levels Complete!');
  g.id('next').onclick();
  assert.equal(g.id('weather').textContent, 'All Levels Complete!');
});

test('mismatches turn back over, rapid third taps and duplicate pairs do not score', () => {
  const g = game();
  g.completeLevel(0); g.id('bonus').click();
  const [a, b, c] = g.pairs();
  a[0].click(); a[0].click();
  assert.equal(g.id('bonusProgress').textContent, 'Pairs found: 0 of 4');
  b[0].click(); c[0].click();
  assert.equal(c[0].classList.contains('open'), false);
  assert.equal(g.id('bonusFeedback').textContent, 'Different socks. Try again.');
  g.tick(1100);
  assert.ok([a[0], b[0]].every(card => !card.classList.contains('open') && card.innerHTML.includes('sock-back')));
  a.forEach(card => card.click());
  a.forEach(card => card.click());
  assert.equal(g.id('bonusProgress').textContent, 'Pairs found: 1 of 4');
  assert.ok(a.every(card => card.innerHTML.includes('match-mark') && card.getAttribute('aria-disabled') === 'true'));
});

test('socks have distinct patterned pictures, spoken labels, and an optional audio toggle', () => {
  const g = game();
  g.completeLevel(0); g.id('bonus').click();
  const labels = [];
  for (const pair of g.pairs()) {
    pair[0].click();
    const label = pair[0].getAttribute('aria-label');
    labels.push(label);
    assert.match(pair[0].innerHTML, /<svg class="sock-art"/);
    assert.equal(g.spoken.at(-1).text, label);
    pair[1].click();
  }
  assert.deepEqual(labels.sort(), [
    'Blue sock with white dots', 'Purple sock with yellow stars',
    'Red sock with white stripes', 'Yellow sock with dark zigzags'
  ]);
  g.id('next').click(); g.completeLevel(1); g.id('bonus').click();
  g.id('sockAudio').click();
  const count = g.spoken.length;
  g.matchAll();
  assert.equal(g.spoken.length, count, 'audio off must leave matching fully playable');
  assert.equal(g.id('sockAudio').getAttribute('aria-pressed'), 'false');
});

test('long outfit choices advance only on speech completion, with one highlight at a time', async () => {
  const g = game();
  g.id('readChoices').click();
  const buttons = g.id('choices').children;
  const cancels = g.cancellations();
  assert.equal(g.spoken.length, 1);
  for (let i = 0; i < 6; i++) {
    assert.equal(g.spoken.length, i + 1);
    assert.equal(buttons.filter(button => button.classList.contains('reading')).length, 1);
    assert.equal(buttons[i].classList.contains('reading'), true);
    assert.match(g.spoken[i].text, new RegExp('^Choice ' + (i + 1) + '\\. '));
    assert.ok(!g.spoken[i].text.includes('+'));
    g.tick(12000); await g.flush();
    assert.equal(g.spoken.length, i + 1, 'a fixed delay must never interrupt a long utterance');
    assert.equal(g.cancellations(), cancels);
    g.spoken[i].onend(); await g.flush();
  }
  assert.equal(buttons.some(button => button.classList.contains('reading')), false);
  assert.equal(g.id('readChoices').textContent, 'Read Choices');
  assert.equal(g.id('readChoices').getAttribute('aria-pressed'), 'false');
});

test('stopping, restarting, choosing, or reading weather cancels old speech without restarting it', async () => {
  const g = game();
  g.id('readChoices').click();
  const staleEnd = g.spoken.at(-1).onend;
  g.id('readChoices').click(); await g.flush();
  assert.equal(g.id('readChoices').textContent, 'Read Choices');
  g.id('readChoices').click();
  staleEnd(); await g.flush();
  assert.equal(g.spoken.length, 2);
  assert.equal(g.id('readChoices').textContent, 'Stop Reading');
  g.id('readWeather').click(); await g.flush();
  assert.match(g.spoken.at(-1).text, /Sunny and hot/);
  assert.equal(g.id('choices').children.some(button => button.classList.contains('reading')), false);
  const count = g.spoken.length;
  g.spoken.at(-1).onend(); await g.flush();
  assert.equal(g.spoken.length, count);
  g.id('readChoices').click();
  const choiceEnd = g.spoken.at(-1).onend;
  g.choose('summer');
  choiceEnd(); await g.flush();
  assert.equal(g.id('readChoices').textContent, 'Read Choices');
  g.tick(1000); await g.flush();
  assert.equal(String(g.id('round').textContent), '2');
  assert.ok(g.id('choices').children.every(button => !button.classList.contains('reading')));
});

test('speech errors or missing engines leave controls and gameplay usable', async () => {
  const g = game();
  g.id('readChoices').click();
  g.spoken.at(-1).onerror({ error: 'synthesis-unavailable' }); await g.flush();
  assert.equal(g.id('readChoices').textContent, 'Read Choices');
  assert.match(g.id('speechStatus').textContent, /Reading stopped/);
  assert.equal(g.id('choices').children.some(button => button.classList.contains('reading')), false);
  const throwing = game({ throwSpeech: true });
  throwing.id('readChoices').click(); await throwing.flush();
  assert.equal(throwing.id('readChoices').textContent, 'Read Choices');
  const silent = game({ speech: false });
  silent.id('readChoices').click();
  assert.match(silent.id('speechStatus').textContent, /unavailable/);
  silent.completeLevel(0); silent.id('bonus').click(); silent.matchAll();
  assert.equal(silent.id('bonusProgress').textContent, 'Pairs found: 4 of 4');
  assert.equal(silent.id('sockAudio').disabled, true);
});

test('weather reactions, score lock, school return, and classroom monitor stay intact', () => {
  const g = game();
  g.choose('winter');
  assert.equal(g.id('reaction').textContent, 'Whew! I am too hot.');
  g.choose('summer'); g.choose('summer');
  assert.equal(Number(g.id('score').textContent), 1);
  g.tick(1000);
  for (const key of answers[0].slice(1)) { g.choose(key); g.tick(1000); }
  g.id('next').click();
  g.choose('summer');
  assert.equal(g.id('reaction').textContent, 'Brrr! I am too cold.');
  g.completeLevel(1); g.id('next').click();
  g.choose('summer');
  assert.equal(g.id('reaction').textContent, 'I am getting wet!');
  g.leave();
  assert.equal(g.timers.size, 0);
  assert.match(html, /href="transition-town\.html\?school=1"/);
  assert.match(html, /src="assets\/classroom-monitor\/student\.js\?v=[^"\s]+" defer/);
});
