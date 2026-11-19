import {CATALOG} from './catalog.mjs';

export const ACTIVITY = 'virtual-career-fair';
export const CAREERS = CATALOG.flatMap(group => group.careers.map(career => ({...career, group})));
export const careerById = new Map(CAREERS.map(career => [career.id, career]));
export const stateFor = (records, id) => records[id] || {
  answers: [], ranges: [], seconds: 0, watched: false, read: false,
  tries: 0, best: 0, scenario: false, scenarioTries: 0, completed: null
};

export function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function score(questions, answers) {
  const checks = questions.map(({accept}, index) => accept.some(answer => normalize(answer) === normalize(answers[index])));
  return {checks, correct: checks.filter(Boolean).length};
}

export function mergeRanges(...ranges) {
  const merged = [];
  for (const range of ranges.filter(pair => Array.isArray(pair) && Number.isFinite(pair[0]) && pair[1] > pair[0]).sort((a,b) => a[0] - b[0])) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1] + .15) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

export function coverage(ranges, duration) {
  return ranges.reduce((total, [start, end]) => total + Math.max(0, Math.min(end, duration) - Math.max(start, 0)), 0);
}

export function canComplete(career, state) {
  return (state.watched || state.read) && state.best === career.questions.length && state.scenario;
}

export function summarize(records) {
  const states = CAREERS.map(career => stateFor(records, career.id));
  const groups = CATALOG.filter(group => group.careers.every(career => records[career.id]?.completed)).length;
  return {
    careers: states.filter(state => state.completed).length, groups,
    videos: states.filter(state => state.watched).length,
    worksheets: CAREERS.filter(career => records[career.id]?.best === career.questions.length).length
  };
}

export const BADGES = [
  {id:'watcher', icon:'🎬', title:'Video Watcher', goal:'Watch your first career video.', earned: stats => stats.videos >= 1},
  {id:'worksheet', icon:'📋', title:'Worksheet Pro', goal:'Get every blank right on one worksheet.', earned: stats => stats.worksheets >= 1},
  {id:'explorer', icon:'⭐', title:'Career Explorer', goal:'Complete your first career.', earned: stats => stats.careers >= 1},
  {id:'ready', icon:'🏅', title:'Career Ready', goal:'Complete all ten careers in one group.', earned: stats => stats.groups >= 1},
  {id:'all', icon:'🏆', title:'Fair Champion', goal:'Complete every career group.', earned: stats => stats.groups === CATALOG.length}
];

export function evidenceDetails(career, state, stage, extras = {}) {
  return {
    action: ACTIVITY, item: career.id, status: stage, success: state.best,
    quantity: career.questions.length, attempt: state.tries,
    decision: state.scenario, role: state.watched ? 'video' : state.read ? 'reading' : 'pending',
    ...extras
  };
}
