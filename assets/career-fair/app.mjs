import {CATALOG} from './catalog.mjs';
import {ACTIVITY, CAREERS, careerById, stateFor, score, canComplete, summarize, BADGES, mergeRanges, coverage, evidenceDetails} from './model.mjs';
import {escapeHTML as esc, learningStore} from '../learning/progress.mjs';
import {worksheetPaper, printFair} from './print.mjs';

const root = document.querySelector('#cf-main');
const store = learningStore(ACTIVITY);
const account = document.querySelector('#cf-identity');
const status = document.querySelector('#cf-storage');
let activeVideo;
let first = true;

account.textContent = store.guest ? 'Guest practice' : store.student;
document.querySelector('#cf-sign-in').textContent = store.guest ? 'Town sign-in' : 'Town account & sign-out';
if (!store.guest) document.querySelector('#cf-sign-in').href = 'transition-town.html';

const art = name => `assets/career-fair/art/${name}.webp`;
const records = () => store.read().checkpoint?.careers || {};
const badge = (item, stats) => `<article class="cf-badge" data-earned="${item.earned(stats)}"><span aria-hidden="true">${item.icon}</span><strong>${item.title}</strong><p>${item.earned(stats) ? 'Earned' : 'Locked'} · ${item.goal}</p></article>`;
const title = (heading, context = '', actions = '') => `<div class="cf-title"><div>${context ? `<p>${esc(context)}</p>` : ''}<h1 tabindex="-1">${esc(heading)}</h1></div>${actions}</div>`;
const back = (route, label) => `<a class="cf-button" href="#${route}">← ${esc(label)}</a>`;
const booth = group => `<article class="cf-booth" style="--booth:${group.color}">
  <h3>${esc(group.title)}</h3>
  ${group.art ? `<img src="${art(group.id)}" alt="">` : `<span class="cf-booth-icon" aria-hidden="true">${group.icon}</span>`}
  <a class="cf-button" href="#group/${group.id}" aria-label="Explore ${esc(group.title)} careers">Explore careers</a>
</article>`;

function progressSummary(stats) {
  return `<p><b>${stats.groups} / ${CATALOG.length}</b> career groups completed</p>
    <progress value="${stats.groups}" max="${CATALOG.length}" aria-label="Career groups completed"></progress>
    <p><b>${stats.careers} / ${CAREERS.length}</b> careers completed</p>`;
}

function home() {
  const stats = summarize(records());
  root.innerHTML = `${title('Virtual Career Fair')}
    <div class="cf-home">
      <aside class="cf-panel"><h2>Career groups</h2><nav class="cf-groups" aria-label="Explore career groups">${CATALOG.map(group => `<a class="cf-group-link" href="#group/${group.id}"><b aria-hidden="true">${group.icon}</b><span>${esc(group.title)}</span><b aria-hidden="true">›</b></a>`).join('')}</nav></aside>
      <section class="cf-panel"><img class="cf-plaza" src="${art('plaza')}" alt=""><h2>Explore the booths</h2>
        <div class="cf-booths">${CATALOG.filter(group => group.art).map(booth).join('')}</div>
        <p><a class="cf-button cf-primary" href="#booths">See all ten career groups</a></p>
        <h2>How it works</h2><ol><li>Watch a career video or choose the reading option.</li><li>Fill in the blanks and check your answers.</li><li>Choose what you would do at work.</li><li>Earn badges as you go.</li></ol>
      </section>
      <aside class="cf-panel"><h2>My progress</h2>${progressSummary(stats)}<a href="#progress">View career progress</a><h2>My badges</h2><p>${BADGES.filter(item => item.earned(stats)).length} of ${BADGES.length} earned</p><a href="#badges">View badge collection</a></aside>
    </div>`;
}

function booths() {
  root.innerHTML = `${title('Career booths', '10 groups · 100 careers')}
    <div class="cf-list">${CATALOG.map(booth).join('')}</div>`;
}

function stateLabel(career, state) {
  return state.completed ? 'Completed' : state.tries || state.seconds || state.read || state.scenarioTries || state.answers.some(Boolean) ? 'In progress' : 'Ready to start';
}

function groupPage(group) {
  const saved = records();
  root.innerHTML = `${title(group.title, 'Career booth', back('booths', 'All booths'))}<div class="cf-list">
  ${group.careers.map(({id}) => {
    const career = careerById.get(id);
    const state = stateFor(saved, id);
    return `<article class="cf-panel"><h2>${esc(career.title)}</h2><p>${stateLabel(career, state)}</p>
      <a class="cf-button cf-primary" href="#career/${id}" aria-label="Open ${esc(career.title)}">${state.completed ? 'Review career' : 'Open career'}</a></article>`;
  }).join('')}</div>`;
}

function careerList(mode) {
  const saved = records();
  const stats = summarize(saved);
  root.innerHTML = `${title(mode === 'worksheets' ? 'My worksheets' : 'My progress')}
  ${mode === 'progress' ? `<section class="cf-panel">${progressSummary(stats)}<p>${stats.videos} videos watched · ${stats.worksheets} worksheets mastered</p></section>` : ''}
  <section class="cf-panel">
    <div class="cf-row"><label>Find a career<input id="cf-filter" type="search" placeholder="Search by career title"></label>
    <label>Career group<select id="cf-filter-group"><option value="">All career groups</option>${CATALOG.map(group => `<option value="${group.id}">${esc(group.title)}</option>`).join('')}</select></label></div>
    <p id="cf-results-count" role="status"></p>
    <div class="cf-table-wrap" tabindex="0" role="region" aria-label="Career results"><table class="cf-table"><thead><tr><th scope="col">Career</th><th scope="col">Group</th><th scope="col">Best score</th><th scope="col">Status</th>${mode === 'worksheets' ? '<th scope="col">Print</th>' : ''}</tr></thead><tbody></tbody></table></div>
  </section>`;
  const filter = root.querySelector('#cf-filter');
  const groupSelect = root.querySelector('#cf-filter-group');
  const draw = () => {
    const query = filter.value.toLowerCase().trim();
    const chosen = CAREERS.filter(career => (!groupSelect.value || career.group.id === groupSelect.value) && career.title.toLowerCase().includes(query));
    root.querySelector('#cf-results-count').textContent = `${chosen.length} career${chosen.length === 1 ? '' : 's'}`;
    root.querySelector('tbody').innerHTML = chosen.map(career => {
      const state = stateFor(saved, career.id);
      return `<tr><th scope="row"><a href="#career/${career.id}">${esc(career.title)}</a></th><td>${esc(career.group.title)}</td><td>${state.tries ? `${state.best}/${career.questions.length}` : '—'}</td><td>${stateLabel(career,state)}</td>
        ${mode === 'worksheets' ? `<td><button data-print-career="${career.id}" aria-label="Print ${esc(career.title)} worksheet">Print</button></td>` : ''}</tr>`;
    }).join('');
  };
  filter.addEventListener('input', draw);
  groupSelect.addEventListener('change', draw);
  draw();
}

function updateCareer(career, change, report) {
  const all = records();
  const previous = stateFor(all, career.id);
  const next = {...previous, ...change(previous)};
  const newlyComplete = !previous.completed && canComplete(career,next);
  if (newlyComplete) next.completed = new Date().toISOString();
  const saved = store.checkpoint({careers:{...all, [career.id]:next}});
  status.textContent = store.notice();
  if (saved && report && !store.guest) {
    const milestone = report(next);
    if (milestone) {
      const [kind, description, stage] = milestone;
      store.event(kind, `${career.title} · ${description}`, evidenceDetails(career, next, stage));
    }
  }
  if (saved && newlyComplete && !store.guest) {
    store.event('completed', `Completed career fair booth: ${career.title} (${next.best}/${career.questions.length}, workplace decision passed)`, evidenceDetails(career,next,'completed'));
  }
  return {state: next, saved, newlyComplete: newlyComplete && saved};
}

function careerPage(career) {
  const initial = stateFor(records(), career.id);
  const scenario = career.group.scenario;
  root.innerHTML = `${title(career.title, career.group.title, back('group/'+career.group.id, career.group.title))}
  <p id="cf-career-status" role="status">${initial.completed ? 'Career completed. You can review the video and activities.' : 'Complete the video or reading option, worksheet, and workplace scenario.'}</p>
  <div class="cf-player-layout">
  <section class="cf-panel" aria-labelledby="cf-video-title">
    <h2 id="cf-video-title">1 · Career video</h2>
    <video class="cf-video" id="cf-video" controls playsinline preload="none" tabindex="0"
      src="${esc(career.media)}" aria-label="${esc(career.title)} career video" aria-describedby="cf-video-status"></video>
    <div class="cf-row"><button type="button" id="cf-toggle" class="cf-primary">Play video</button><button type="button" id="cf-restart">Restart video</button>
    <label class="cf-speed">Playback speed<select id="cf-speed"><option value=".75">0.75×</option><option value="1" selected>Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div>
    <p id="cf-video-status" role="status">${initial.watched ? 'Video watched.' : 'Select Play video to start.'}</p>
    <p><a href="${esc(career.source)}" target="_blank" rel="noopener">Watch with captions at My Next Move</a> · <a href="${esc(career.media)}" target="_blank" rel="noopener">Open MP4 directly</a></p>
    <p>At My Next Move, select Watch Career Video. Only this player records video progress. If you watch in another tab, you can also complete the reading option below.</p>
    <details id="cf-transcript"><summary>Reading option · Key points from the video</summary>
      <ul>${career.questions.map(({prompt,accept}) => `<li>${esc(prompt.replace('_____',accept[0]))}</li>`).join('')}</ul>
      <button type="button" id="cf-read">Mark reading complete</button>
      <p id="cf-reading-status" role="status">${initial.read ? 'Reading option recorded.' : ''}</p>
    </details>
    <p>Video by CareerOneStop. Study notes by Transition Town.</p>
  </section>
  <section class="cf-panel" aria-labelledby="cf-worksheet-title">
    <h2 id="cf-worksheet-title">2 · Fill in the blanks</h2>
    <p>Use the video, transcript, or study notes to fill each blank. You can try again after checking.</p>
    <form id="cf-worksheet">
      ${career.questions.map(({prompt}, index) => `<div class="cf-input-row"><label for="cf-word-${index}">${index+1}. ${esc(prompt)}</label><input id="cf-word-${index}" name="word" type="text" maxlength="100" autocomplete="off" aria-describedby="cf-word-status-${index}" value="${esc(initial.answers[index]||'')}"><small id="cf-word-status-${index}" class="cf-feedback"></small></div>`).join('')}
      <div class="cf-row"><button class="cf-primary">Check my answers</button><button type="button" data-print-career="${career.id}">Print worksheet</button></div>
    </form>
    <p id="cf-score" role="status">${initial.tries ? `Best score ${initial.best} of ${career.questions.length}.` : ''}</p>
  </section>
  </div>
  <section class="cf-panel" aria-labelledby="cf-scenario-title">
    <h2 id="cf-scenario-title">3 · What would you do?</h2>
    <form id="cf-scenario"><fieldset><legend>${esc(scenario.prompt)}</legend>
    ${scenario.options.map((option,index) => `<label class="cf-choice"><input type="radio" name="decision" value="${index}" required>${esc(option)}</label>`).join('')}
    </fieldset><button class="cf-primary">Check my decision</button></form>
    <p id="cf-decision" role="status">${initial.scenario ? 'Workplace scenario passed.' : ''}</p>
  </section>`;
  const completion = root.querySelector('#cf-career-status');
  const showCompletion = ({newlyComplete, saved}) => {
    if (newlyComplete) completion.textContent = 'Career completed! Visit My Badges to see what you earned.';
    if (!saved) completion.textContent = 'Progress could not be saved in this browser.';
  };

  const worksheet = root.querySelector('#cf-worksheet');
  const inputs = [...worksheet.elements.namedItem('word')];
  inputs.forEach((input,index) => input.addEventListener('input', () => {
    updateCareer(career, old => {
      const answers = [...old.answers];
      answers[index] = input.value;
      return {answers};
    });
    input.removeAttribute('aria-invalid');
    root.querySelector(`#cf-word-status-${index}`).textContent = '';
  }));
  worksheet.addEventListener('submit', event => {
    event.preventDefault();
    const answers = inputs.map(input => input.value);
    if (!answers.every(value => value.trim())) {
      root.querySelector('#cf-score').textContent = 'Fill in every blank before checking.';
      inputs.find(input => !input.value.trim()).focus();
      return;
    }
    const {checks, correct} = score(career.questions, answers);
    checks.forEach((right,index) => {
      inputs[index].setAttribute('aria-invalid', String(!right));
      root.querySelector(`#cf-word-status-${index}`).textContent = right ? 'Correct.' : 'Try this one again.';
    });
    const result = updateCareer(career, old => ({answers, tries:old.tries+1, best:Math.max(old.best,correct)}), () => [
      correct === checks.length ? 'completed' : 'correction',
      `worksheet scored ${correct}/${checks.length}`, 'worksheet'
    ]);
    root.querySelector('#cf-score').textContent = `${correct} of ${checks.length} correct. Best score ${result.state.best} of ${checks.length}.`;
    showCompletion(result);
  });

  root.querySelector('#cf-scenario').addEventListener('submit', event => {
    event.preventDefault();
    const picked = Number(new FormData(event.currentTarget).get('decision'));
    const right = picked === scenario.correct;
    root.querySelector('#cf-decision').textContent = right ? scenario.feedback : 'Try again. Think about what you can do before the problem gets worse.';
    showCompletion(updateCareer(career, old => ({scenario:old.scenario || right, scenarioTries:old.scenarioTries+1}), () => [
      right ? 'decision' : 'correction', right ? 'workplace scenario passed' : 'workplace scenario retry', 'scenario'
    ]));
  });
  setupVideo(career, initial, showCompletion);
}

function setupVideo(career, initial, showCompletion) {
  const video = root.querySelector('#cf-video');
  const toggle = root.querySelector('#cf-toggle');
  const notice = root.querySelector('#cf-video-status');
  let lastSave = 0;
  let watched = initial.watched;
  let stopped = false;
  let playbackAttempt = 0;
  let loadTimer;
  let resumeAt = initial.watched ? 0 : initial.position;
  const speed = root.querySelector('#cf-speed');
  const clearLoadTimer = () => window.clearTimeout(loadTimer);

  function persist(force = false) {
    if (stopped || !Number.isFinite(video.duration) || video.duration <= 0 || watched) return;
    if (!force && performance.now() - lastSave < 2500) return;
    lastSave = performance.now();
    const played = Array.from({length:video.played.length}, (_,index) => [video.played.start(index),video.played.end(index)]);
    if (!played.length) return;
    let earned = false;
    const result = updateCareer(career, old => {
      const ranges = mergeRanges(...old.ranges,...played);
      const seconds = coverage(ranges,video.duration);
      earned = !old.watched && seconds >= video.duration*.85;
      return {ranges, seconds, position:video.currentTime, watched: old.watched || earned};
    }, () => earned ? ['completed','career video watched','video'] : null);
    watched = result.saved && result.state.watched;
    if (watched) notice.textContent = 'Video watched.';
    if (earned || result.newlyComplete) showCompletion(result);
  }
  activeVideo = () => {
    persist(true);
    stopped = true;
    clearLoadTimer();
    video.pause();
  };
  video.addEventListener('loadedmetadata', () => {
    if (resumeAt > 0 && resumeAt < video.duration - 2) video.currentTime = resumeAt;
    resumeAt = 0;
    video.playbackRate = Number(speed.value);
  });
  video.addEventListener('timeupdate', () => persist());
  for (const event of ['pause', 'ended', 'seeked']) video.addEventListener(event, () => persist(true));

  function showLoading() {
    clearLoadTimer();
    notice.textContent = 'Loading video…';
    loadTimer = window.setTimeout(() => {
      notice.textContent = 'This video is taking longer to load. You can keep waiting or use either link below.';
    }, 10000);
  }

  function showError(error) {
    clearLoadTimer();
    toggle.textContent = 'Retry video';
    notice.textContent = error?.name === 'NotAllowedError'
      ? 'This browser blocked playback. Try the player’s Play control or open the video using a link below.'
      : 'The player could not load this video. Try again or use a link below.';
  }

  video.addEventListener('play', () => {
    toggle.textContent = 'Pause video';
    showLoading();
  });
  video.addEventListener('waiting', () => {
    if (!video.paused && !stopped) showLoading();
  });
  video.addEventListener('playing', () => {
    clearLoadTimer();
    notice.textContent = watched ? 'Video watched.' : 'Playing. Your progress is tracked in this player.';
    toggle.textContent = 'Pause video';
  });
  for (const event of ['pause', 'ended']) {
    video.addEventListener(event, () => {
      clearLoadTimer();
      if (stopped || video.error) return;
      toggle.textContent = 'Play video';
      notice.textContent = watched ? 'Video watched.' : 'Select Play video to continue.';
    });
  }
  video.addEventListener('error', () => { if (!stopped) showError(); });

  async function playVideo({restart = false} = {}) {
    const attempt = ++playbackAttempt;
    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      if (!restart) resumeAt = video.currentTime || resumeAt;
      video.load();
    }
    showLoading();
    try {
      await video.play();
    } catch (error) {
      if (!stopped && attempt === playbackAttempt && error.name !== 'AbortError') showError(error);
    }
  }

  toggle.addEventListener('click', () => {
    if (video.paused || video.error) void playVideo();
    else { playbackAttempt++; video.pause(); }
  });
  root.querySelector('#cf-restart').addEventListener('click', () => {
    resumeAt = 0;
    if (video.readyState) video.currentTime = 0;
    void playVideo({restart:true});
  });
  speed.addEventListener('change', () => { video.playbackRate = Number(speed.value); });
  root.querySelector('#cf-read').addEventListener('click', () => {
    if (stateFor(records(),career.id).read) return;
    const result = updateCareer(career, () => ({read:true}), () => ['completed','reading option marked complete by student','reading']);
    root.querySelector('#cf-reading-status').textContent = result.saved ? 'Reading option recorded.' : 'Reading could not be saved.';
    showCompletion(result);
  });
}

function help() {
  root.innerHTML = `${title('Career fair help')}
  <div class="cf-panel"><h2>Use a keyboard</h2><p>Press Tab and Shift+Tab to move between controls. Press Enter to open links and use Enter or Space on buttons. Use the arrow keys to change your workplace choice. The video also has a Play / Pause button.</p>
  <h2>Finish a career</h2><p>Watch at least 85% in the fair player or use the reading option and mark it complete. Then get all worksheet blanks right and pass the workplace scenario. Replay the video or try the questions again anytime.</p>
  <h2>Save your progress</h2><p>Sign in to Transition Town and use the same profile and browser to continue later. Miss Kayla receives evidence during an active classroom recording session on an approved device.</p>
  <h2>Print a worksheet</h2><p>Open a career or My Worksheets and choose Print. Teachers can print answer keys from Teacher Report after signing in.</p></div>`;
}

function render() {
  activeVideo?.();
  activeVideo = undefined;
  const [screen, id] = location.hash.replace(/^#/,'').split('/');
  const group = CATALOG.find(item => item.id === id);
  const career = careerById.get(id);
  if (screen === 'booths') booths();
  else if (screen === 'group' && group) groupPage(group);
  else if (screen === 'career' && career) careerPage(career);
  else if (screen === 'progress' || screen === 'worksheets') careerList(screen);
  else if (screen === 'badges') root.innerHTML = `${title('My badges')}<div class="cf-badge-grid">${BADGES.map(item => badge(item,summarize(records()))).join('')}</div>`;
  else if (screen === 'help') help();
  else home();
  status.textContent = store.notice();
  const selected = ['group','career'].includes(screen) ? 'booths' : screen || 'home';
  document.querySelectorAll('.cf-header nav a[href^="#"]').forEach(link => {
    if (link.hash === '#'+selected) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  if (!first) root.querySelector('h1')?.focus();
  first = false;
}

root.addEventListener('click', event => {
  const trigger = event.target.closest('[data-print-career]');
  if (trigger) printFair(worksheetPaper(careerById.get(trigger.dataset.printCareer)));
});
document.querySelector('.cf-skip').addEventListener('click', event => { event.preventDefault(); root.focus(); });
window.addEventListener('hashchange', render);
window.addEventListener('pagehide', () => activeVideo?.());
window.addEventListener('pageshow', event => { if (event.persisted) render(); });
window.addEventListener('storage', event => { if (event.key === 'ttCurrent' && !sessionStorage.getItem('ttCurrent')) location.reload(); });
render();
