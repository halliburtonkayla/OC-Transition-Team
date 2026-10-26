(function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp=t=>t?new Date(t).toLocaleString('en-US',{timeZone:'America/Chicago',dateStyle:'medium',timeStyle:'short'}):'Not started';
function report(s,studentKey){
 if(s.role!=='host')throw Error('Only the host can print classroom documentation.');
 const individual=studentKey!==undefined&&studentKey!=='',parts=individual?studentKey.split(':').map(Number):null;
 if(individual&&(!parts||!s.teams[parts[0]]?.members[parts[1]]))throw Error('Select a student.');
 const name=individual?s.teams[parts[0]].members[parts[1]]:'';
 const minutes=s.startedAt?Math.max(0,((s.endedAt||s.serverNow)-s.startedAt)/60000):0;
 const roster=s.teams.map((t,i)=>'<tr><th>'+esc(t.name)+'</th><td>'+t.members.map(esc).join(', ')+'</td><td>'+s.scores[i]+'</td></tr>').join('');
 const observations=individual?'<p>'+esc(s.notes[studentKey]||'No individual teacher observation recorded.')+'</p>':s.teams.map((t,i)=>t.members.map((n,j)=>'<h3>'+esc(n)+'</h3><p>'+esc(s.notes[i+':'+j]||'No individual teacher observation recorded.')+'</p>').join('')).join('');
 const rounds=(s.history||[]).map(r=>{
  const teamIndices=individual?[parts[0]]:[0,1];
  const roleRows=teamIndices.map(i=>'<tr><th>'+esc(s.teams[i].name)+'</th><td>'+r.roles[i].map(x=>esc(x.role)+': '+esc(x.student)).join('<br>')+'</td></tr>').join('');
  return '<article><h3>Question '+r.number+(r.skipped?' · Skipped':'')+(!r.revealed?' · Not revealed to opposing team':'')+'</h3><p>'+esc(r.prompt)+'</p><table><tr><th>Team</th><th>Assigned roles this round</th></tr>'+roleRows+'</table>'+teamIndices.map(i=>'<p class="report-label">'+esc(s.teams[i].name)+' — TEAM WORK · '+r.points[i]+' points</p><p>'+esc(r.answers[i].text||'No answer recorded.')+'</p><p>Submission: '+(r.answers[i].submittedAt?'Locked at '+stamp(r.answers[i].submittedAt):r.answers[i].text?'Draft only; not locked':'Not submitted')+'</p>').join('')+'<p><strong>Teaching explanation:</strong> '+esc(r.guidance?.teaching||r.teaching||'')+'</p></article>';
 }).join('');
 return '<h1>Ready, Set, Work! — Career Feud</h1><h2>'+(individual?'Individual student summary: '+esc(name):'Classroom session report')+'</h2><p><strong>Date:</strong> '+stamp(s.startedAt||s.createdAt)+' (Central Time)<br><strong>Session duration:</strong> '+minutes.toFixed(1)+' minutes'+(!s.endedAt?' (in progress)':'')+'<br><strong>Pre-ETS service focus:</strong> '+esc(s.focus)+'<br><strong>Room:</strong> '+esc(s.code)+'<br><strong>Questions presented:</strong> '+s.roundNumber+' of '+s.total+'<br><strong>Session status:</strong> '+esc(s.phase)+'</p><p class="report-note">Answers and points below are TEAM WORK. A team answer does not establish that an individual demonstrated a skill. Individual evidence is limited to the teacher observations recorded in this report. Duration is elapsed session time, including pauses; it is not an automatic billable-time claim.</p><table><tr><th>Team</th><th>Roster</th><th>Team score</th></tr>'+roster+'</table><h2>Teacher observations'+(individual?' for '+esc(name):' by student')+'</h2>'+observations+'<h2>Questions, team answers, and role rotation</h2>'+(rounds||'<p>No question was presented.</p>')+'<h2>Next-session plan</h2><p>'+esc(s.nextPlan||'Not entered.____________________________________________________________')+'</p><footer>Transition Town School · Classroom decision-making game · Teacher-awarded points; no survey results.</footer>';
}
window.CareerFeudReport={html:report};
})();
