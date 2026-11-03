import {escapeHTML as e} from '../../learning/progress.mjs';
import {BOOKS,DIFFICULTIES} from './word-data.mjs';
import {makeScenario,requirementsFor,outfitSummary} from './dress-core.mjs';
import {WEATHER} from './dress-data.mjs';
export function expansionReport(run){
 const c=run.checkpoint;if(!c)return '';
 if(run.game==='wordquest')return `<div class="expansion-evidence"><h4>Word Quest page evidence</h4><p>${e(BOOKS.find(b=>b.id===c.bookId)?.title)} · ${e(DIFFICULTIES[c.level-1])} · Page ${c.page+1}. ${c.found?.length||0} / 20 words found. Seed ${c.seed}.</p><p>Found: ${e(c.found?.map(f=>f.word).join(', ')||'None yet.')}</p><p>Optional vocabulary attempts on this saved page: ${c.questionAnswers?.length||0}. Completed book pages: ${e(Object.entries(c.progress||{}).map(([k,v])=>k+' = '+v).join('; ')||'None yet.')}</p></div>`;
 if(run.game==='dresspart')return `<div class="expansion-evidence"><h4>Dress the Part · scenario evidence</h4>${(c.history||[]).map(h=>{
  const s=makeScenario(h.level,h.index,c.seed),r=h.evaluation;
  return `<section class="dress-report-scenario"><h4>${e(s.label)} · ${e(DIFFICULTIES[h.level-1])} · Attempt ${h.attempt}</h4><p>${e(h.at)} · Weather: ${e(WEATHER[s.weather].label)}${s.change?' → '+e(WEATHER[s.change].label):''}</p><p><b>Dress requirements:</b> ${e(requirementsFor(s).join(' '))}</p><p><b>Selected outfit:</b> ${e(outfitSummary(h.outfit).join('; '))}</p><p><b>Result:</b> ${r.success?'Completed':'Retry available'} · ${r.score}% practical checks · Practice cost $${r.cost}.</p><p><b>Successful decisions:</b> ${e(r.successes.join(' '))}</p><p><b>Areas to practice:</b> ${e(r.improvements.join(' ')||'All stated checks met.')}</p>${h.reflection?'<p><b>Student reflection:</b> '+e(h.reflection)+'</p>':''}</section>`;
 }).join('')||'<p>No outfit has been evaluated yet.</p>'}</div>`;
 return '';
}
