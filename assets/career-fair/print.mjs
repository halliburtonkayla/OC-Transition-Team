import {escapeHTML as esc} from '../learning/progress.mjs';

export function worksheetPaper(career, key = false) {
  return `<h1>Transition Town Virtual Career Fair</h1><h2>${esc(career.title)} · ${key ? 'Teacher answer key' : 'Student worksheet'}</h2>
  <p>${esc(career.group.title)} · Job Exploration</p>
  ${key ? '<p>Accept the listed alternatives or equivalent answers that fit the sentence.</p>' : '<p>Name _______________________________ &nbsp; Date ________________</p><p>Watch the career video or use the reading option. Fill in each blank.</p>'}
  <ol>${career.questions.map(({prompt,accept}) => `<li>${esc(prompt).replace('_____', key ? `<b>${esc(accept[0])}</b>` : '_____________________')}${key && accept.length > 1 ? `<br>Also accept ${esc(accept.slice(1).join(', '))}.` : ''}</li>`).join('')}</ol>
  <h2>What would you do?</h2><p>${esc(career.group.scenario.prompt)}</p>
  ${key ? `<p><b>${esc(career.group.scenario.options[career.group.scenario.correct])}</b></p><p>${esc(career.group.scenario.feedback)}</p>` : `<ul>${career.group.scenario.options.map(option => `<li>□ ${esc(option)}</li>`).join('')}</ul>`}
  <p>Video and transcript from CareerOneStop via My Next Move. <a href="${esc(career.source)}">${esc(career.source)}</a></p>`;
}

export function printFair(content) {
  let area = document.querySelector('.cf-print');
  if (!area) {
    area = document.createElement('section');
    area.className = 'cf-print';
    document.body.append(area);
  }
  area.innerHTML = content;
  window.addEventListener('afterprint', () => area.replaceChildren(), {once: true});
  window.print();
}
