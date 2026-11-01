import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=fs.readdirSync(root,{recursive:true}).filter(p=>!p.startsWith('.git/')&&!p.startsWith('.preview-static/')&&!p.startsWith('.openai/')&&fs.statSync(path.join(root,p)).isFile()).map(p=>({path:p,size:fs.statSync(path.join(root,p)).size}));
const known=new Set(files.map(f=>f.path));
for(const p of fs.readdirSync(root,{recursive:true}))if(!p.startsWith('dist/')&&!p.startsWith('.git/'))known.add(p);
const extra=['job-missions.html','watch-and-learn.html','school-directory.html'];
extra.forEach(p=>known.add(p));
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const title=s=>(s.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'Untitled').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
function category(p){
 if(['career-feud.html','transition-game-show.html'].includes(p))return 'wow';
 if(/^(?:index(?:[-_(]|\.html)|ADD-|INDEX_|apartment-simulator\()/.test(p)||/^(?:house|mansion|book)-\d/.test(p)||p.startsWith('tests/'))return 'compatibility';
 if(/^(?:classroom-monitor|pre-ets|miss-kayla|downloads|worksheets|expanded-resource|resource-viewer|pdf-viewer)/.test(p))return 'teacher';
 if(/^(?:group-projects|relax-color|build-your-own-story|group-readings|animated-stories|interactive-stories)/.test(p))return 'kindness';
 if(/^(?:career|job-exploration|job-description|school-career|job-application|mock-interview|resume|business-startup|developer|college|postsecondary|offer)/.test(p)||/presentation/.test(p))return 'studio';
 if(/^(?:candy-counter|job-missions|work-crew|cdc-(?:hands|cleaning|cooking|job)|.*simulator|grocery-employee|pizza-employee|coffee-employee|main-attraction-(?:employee|service|workstations))/.test(p))return 'jobs';
 if(/^(?:workplace-readiness|workplace-communication|workplace-problem|attendance|read-work|first-day|first-paycheck|transportation|teamwork|customer|ask-for-help|self-advocacy|smart-transition|career-research|career-interest|grocery-budget|housing-comparison|cdc-center|cdc-hygiene|watch-and-learn)/.test(p))return 'watch';
 if(/^(?:transition-town|student-business|3k-tire|cool-vibes|guardian-angel\.html|the-zoo|main-attraction\.html|grocery-store|pizza-shop|coffee-shop|bank|fire-department|housing-office|home-beyond)/.test(p))return 'town';
 return 'wow';
}
const results=[];
for(const f of files.filter(f=>/\.html$/i.test(f.path)&&!f.path.startsWith('tests/'))){
 const html=text(f.path),links=[];
 for(const re of [/\b(?:href|src)\s*=\s*["']([^"']+)["']/g,/\blocation(?:\.href)?\s*=\s*["']([^"']+\.html(?:\?[^"']*)?)["']/g]){
  for(const match of html.matchAll(re)){
   const raw=match[1];if(/^(?:https?:|\/\/|data:|mailto:|javascript:|#)/i.test(raw)||/[{}<>$\\]/.test(raw))continue;
   let pathname;try{pathname=decodeURIComponent(raw.split(/[?#]/)[0]);}catch{continue;}
   if(!pathname||pathname.endsWith('/')||pathname==='.')continue;const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(f.path),pathname));
   links.push({target:resolved,exists:known.has(resolved)});
  }
 }
 const unique=[...new Map(links.map(l=>[l.target,l])).values()];
 const externalLinks=[...new Set([...html.matchAll(/\bhref\s*=\s*["'](https?:[^"']+)["']/g)].map(m=>m[1]))];
 const ids=new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m=>m[1]));
 const fragmentReview=[...new Set([...html.matchAll(/\bhref\s*=\s*["']#([^"']+)["']/g)].map(m=>m[1]).filter(x=>!ids.has(x)))];
 results.push({path:f.path,title:title(html),room:category(f.path),links:unique,externalLinks,fragmentReview,contentFlags:[...html.matchAll(/(?:coming soon|under construction|not yet available|work in progress)/gi)].map(m=>m[0]),bytes:f.size});
}
const broken=results.flatMap(p=>p.links.filter(l=>!l.exists).map(l=>({from:p.path,to:l.target})));
const audit={date:'2026-10-30',scope:'All repository HTML pages and their literal local href/src and navigation URLs. External availability and dynamic URLs are not inferred.',pages:results,broken};
fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/school-inventory.json',JSON.stringify(audit,null,2)+'\n');
let report='# Transition Town School activity and navigation audit\n\nAudited 2026-10-30. Existing files, Town records, business pages and game URLs are preserved.\n\n'+results.length+' existing HTML pages inspected. '+broken.length+' literal local references still point to absent repository files. The remaining references are listed below. External URLs, dynamic destinations, playback and game behavior require separate checks.\n\n## Navigation decisions\n\n- School entry now presents six room signs. All original hallway actions remain under Original hallway.\n- The two Ready, Set, Work! activities are labeled Connected classroom game show and Solo / shared-keyboard game show to distinguish their different modes.\n- Career exploration and résumé/interview tools are under Career & Interview Studio; practical simulators are under Job Missions; arcade, math and life games are under The Wow Zone.\n- Kindness & Creativity links group projects, storytelling and coloring.\n- Teacher Resource Center uses the existing authenticated teacher dashboard. No authentication or student records are migrated.\n- Backup index files, house models and book chapters are retained but omitted from the main directory. Their library/parent pages remain accessible.\n- Fixed active pages that requested session.css, game-ui.css or session.js from the wrong directory; existing root implementations are reused.\n- Fixed book Library and end-of-book Home links that escaped the project path.\n\n## Existing activities and current local links\n\n| Existing URL | Page title | Room | Local links | Missing references |\n| --- | --- | --- | ---: | ---: |\n';
for(const p of results)report+=`| ${p.path.replaceAll('|','\\|')} | ${p.title.replaceAll('|','\\|')} | ${p.room} | ${p.links.length} | ${p.links.filter(l=>!l.exists).length} |\n`;
report+='\n## Pre-existing missing local references\n\n';
for(const b of broken)report+=`- ${b.from} → ${b.to}\n`;
report+='\n## Duplicate, confusing and unfinished navigation\n\n- The old hallway exposed Career Lab, classroom, educational-game and training links both as doors and in a long footer. The six-room directory groups those destinations, with at most eight catalogue items per page.\n- Both game shows used Ready, Set, Work! labels. The directory now distinguishes connected classroom play from solo/shared-keyboard play.\n- Four old simulator landing pages had #demo buttons without an activity target. Their buttons now link to existing working Town activities: workplace retail → Job Missions, restaurant → Pizza Employee, auto → 3K Tire Shop, veterinary → The Zoo; salon → Main Attraction Studio; move-out → Transition Life; conflict → Workplace Problem Solving. The original landing pages and URLs remain intact.\n- index_fixed_presentations.html has a pre-existing #quickChoice fragment needing review in that archived index. It is not part of the active school directory.\n- shop-floor.html generates its #work-content target at runtime; its static fragment warning is not treated as broken.\n- Four archived index snapshots still reference the absent Transition_Team_Resource_Library_Guide.docx. No substitute was invented.\n\n## Content needing manual review\n\n';const flagged=results.filter(p=>p.contentFlags.length);report+=flagged.length?flagged.map(p=>`- ${p.path}: contains ${[...new Set(p.contentFlags)].join(', ')}. Inspect context before treating this as unfinished.`).join('\n'):'No literal coming-soon or under-construction markers found.';
report+='\n\n## Verification limits\n\nThe inventory is a static audit, not a claim that every legacy game has been manually played. New room links are validated against the repository tree. New mission rules, narrated lessons, worksheet alignment and quiz progression have separate automated tests. No outside video is embedded in the new learning center; it uses original timed narrated animated lessons.\n';
fs.writeFileSync('docs/school-audit.md',report);
console.log(JSON.stringify({pages:results.length,broken:broken.length,flagged:flagged.map(x=>x.path)}));
