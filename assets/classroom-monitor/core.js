/* Evidence rules shared by the private service and report UI. No observations are inferred. */
(function(g){'use strict';
const SERVICES=['Job Exploration Counseling','Work-Based Learning Experiences','Counseling on Postsecondary Education Opportunities','Workplace Readiness Training','Instruction in Self-Advocacy'];
const aliases={Max:'Bradley','Bradley (Max) Dane':'Bradley',Nick:'Nicholas',Aubry:'Aubrey',Jayden:'Jaden'};
const canonical=n=>aliases[String(n||'').trim()]||String(n||'').trim();
const text=(x,n=240)=>String(x??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
const uid=x=>/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(String(x||''));
const kinds=['visit','action','completed','correction','decision','choice','session','observation'];
function cleanEvent(e,now=Date.now()){
 if(!uid(e.id)||!kinds.includes(e.kind)||e.kind==='observation')throw Error('Invalid student event.');
 const at=Date.parse(e.at);const details={};
 for(const k of ['action','item','task','role','decision','applicant','step','status','amount','quantity','attempt','success','order','scope'])if(['string','number','boolean'].includes(typeof e.details?.[k]))details[k]=typeof e.details[k]==='string'?text(e.details[k],120):e.details[k];
 if(e.details?.totals)details.totals=Object.fromEntries(['sales','expenses','profit'].filter(k=>Number.isFinite(e.details.totals[k])).map(k=>[k,Math.round(e.details.totals[k]*100)/100]));
 return {id:e.id,kind:e.kind,at:new Date(Number.isFinite(at)?Math.max(now-5*60e3,Math.min(now,at)):now).toISOString(),summary:text(e.summary,360)||'Town action recorded',business:text(e.business,80),page:text(e.page,100),details,source:e.kind==='visit'?'page_visit':e.kind==='action'?'ui_attempt':'application_event'};
}
function draft({student,school,service,start,end,events=[]}){
 const own=events.filter(e=>canonical(e.student)===canonical(student)&&Date.parse(e.at)>=Date.parse(start)&&Date.parse(e.at)<=Date.parse(end)).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
 const done=own.filter(e=>['completed','decision','choice'].includes(e.kind)),errors=own.filter(e=>e.kind==='correction');
 const pages=[...new Set(own.filter(e=>e.kind==='visit').map(e=>e.summary))];
 const actions=[...new Set(done.map(e=>e.summary))].slice(0,60);
 const areas=[];const all=done.map(e=>e.summary.replace(/(?:The Zoo Pet Sitting|Cool Vibes Caf[ée]|The Main Attraction|3K Tire Shop|Guardian Angel)/gi,'')+' '+(e.details?.action||'')).join(' ').toLowerCase();
 for(const [pattern,label] of [[/buy|purchase|restock|inventory|delivery|shelv|stock/,'Inventory counting, purchasing, and organization'],[/pay|purchase|bank|cash|sale|bill|profit|wage/,'Money management and transaction decisions'],[/interview|hire|hired|declined|applicant/,'Interviewing and job-related hiring decisions'],[/recipe|bake|prepare|food|donut|measure/,'Following preparation instructions and measurements'],[/\b(?:feed|feeding|walk|walking|animal-care|pet-care|care card|pen-clean|bath|brush)\b/,'Animal-care routines and task sequencing'],[/tire|service|customer|appointment/,'Customer-service and service-workflow decisions'],[/clean|bathroom|restroom|saniti/,'Workplace cleanliness and safety routines'],[/clock|shift|assign|coach|staff/,'Attendance, work roles, and employee supervision']])if(pattern.test(all))areas.push(label);
 const corrected=errors.filter(e=>done.some(d=>d.details?.action&&d.details.action===e.details?.action&&Date.parse(d.at)>Date.parse(e.at))).length;
 return {student:canonical(student),school:school||'School not yet verified',service:SERVICES.includes(service)?service:'',start,end,duration_minutes:Math.round(Math.max(0,Date.parse(end)-Date.parse(start))/600)/100,
 activities:actions.length?actions.join('\n'):'No completed activities were recorded. Check the history and enter only verified observations.',
 skills:areas.length?areas.join('\n'):'No skill demonstration inferred from page visits or button clicks.',
 participation:own.filter(e=>e.kind==='observation'&&e.source==='teacher_observed').map(e=>e.summary).join('\n')||'Not observed by the specialist in this record. Add verified participation and assistance here.',
 results:`${done.length} application-reported completed actions/decisions; ${errors.length} correction messages; ${corrected} correction sequences followed by a reported successful action of the same type. These counts do not establish mastery or independence.`,
 next:errors.length?'Review the recorded correction messages, then practice the relevant task with the support actually needed.':done.length?'Review today’s decisions, then practice the next step in the same work routine.':'Confirm the student’s activity and choose a supported task for the next session.',
 evidence_count:own.length,completed_count:done.length,correction_count:errors.length,visited:pages,evidence_note:'Draft based on this student’s timestamped application events. Visits and attempted clicks are not counted as completions. Review before approval; teacher observations are entered separately.'};
}
function validateReport(d,approve=false){
 const out={};for(const k of ['student','school','service','start','end','activities','skills','participation','results','next'])out[k]=['activities','skills','participation','results','next'].includes(k)?String(d[k]??'').replace(/\r/g,'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,10000):text(d[k],160);
 if(approve&&(!SERVICES.includes(out.service)||!out.school||!out.activities||!out.participation||/Not observed by the specialist/.test(out.participation)))throw Error('Select one service and enter verified participation/assistance before approving.');
 if(!Number.isFinite(Date.parse(out.start))||!Number.isFinite(Date.parse(out.end))||Date.parse(out.end)<Date.parse(out.start))throw Error('Check report start and end times.');
 out.duration_minutes=Math.round((Date.parse(out.end)-Date.parse(out.start))/600)/100;return out;
}
const api={SERVICES,canonical,text,uid,cleanEvent,draft,validateReport};g.TTMonitorCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
