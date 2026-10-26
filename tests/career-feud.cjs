const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const C=new Function(read('supabase/functions/career-feud/core.js').replace(/export /g,'')+'\nreturn {FOCI,createState,mutate,view,remaining};')();
const BANK=new Function(read('supabase/functions/career-feud/questions.js').replace(/export /g,'')+'\nreturn BANK;')();
const w={};new Function('window',read('assets/career-feud/report.js'))(w);const REPORT=w.CareerFeudReport;

const passed=(function(){
const assertions=[];
function ok(v,label){if(!v)throw Error(label);assertions.push(label)}
function rejects(fn,label){let failed=false;try{fn()}catch{failed=true}ok(failed,label)}
let now=1000000,st=C.createState({length:14,seconds:90},BANK,now,()=>.42);
ok(BANK.length>=35,'At least 35 scenarios');
ok(BANK.filter(q=>q.focus==='Workplace Readiness').length>=35,'At least 35 Workplace Readiness scenarios');
ok(BANK.every(q=>q.lookFor.length>=3&&q.alternatives&&q.points&&q.teaching),'Every question has teacher judging guidance');
ok(new Set(st.deck.map(q=>q.id)).size===14,'14 unique questions');
ok(st.deck.every(q=>q.focus==='Workplace Readiness'),'Session contains exactly one service focus');
ok(st.teams[0].members.includes('Olivia')&&st.teams[1].members.includes('Jocquan'),'Requested classroom teams');
rejects(()=>C.createState({teams:[{name:'A',members:['Olivia','Jocquan','A']},{name:'B',members:['B','C','D']}]},BANK,now),'Olivia and Jocquan cannot share a team');
rejects(()=>C.mutate(st,'host',{action:'start'},now),'Host waits for both connected ready teams');
const send=(role,action,b={})=>st=C.mutate(st,role,{action,...b},++now);
send(0,'heartbeat');send(1,'heartbeat');send(0,'ready',{ready:true});send(1,'ready',{ready:true});send('host','start',{requestId:'start-once'});
const first=st.rounds[0].question.prompt;
ok([0,1,'host'].every(role=>C.view(st,role,now).round.prompt===first),'All three sessions see the same question');
send(0,'draft',{round:1,answer:'We protect the hazard area and tell our supervisor.'});
send(0,'lock',{round:1,answer:'First team PRIVATE answer'});
ok(C.view(st,1,now).round.answers[0].text===null,'Opposing answer filtered from student payload');
ok(!JSON.stringify(C.view(st,1,now)).includes('PRIVATE'),'Hidden answer is absent from serialized response');
ok(!('guidance' in C.view(st,0,now).round),'Judging guidance absent from student payload');
ok(!('notes' in C.view(st,0,now)),'Participation notes absent from student payload');
ok(C.view(st,0,now).round.answers[0].text==='First team PRIVATE answer','Own locked answer survives reconstructed session');
rejects(()=>send(0,'lock',{round:1,answer:'overwrite'}),'Locked answer cannot be overwritten');
rejects(()=>send(1,'reveal'),'Students cannot reveal');
rejects(()=>send(0,'score',{team:0,round:1,points:99}),'Students cannot score');
rejects(()=>send(1,'end'),'Students cannot end the room');
send('host','unlock',{team:0});send(0,'lock',{round:1,answer:'Corrected team answer'});
send(1,'lock',{round:1,answer:'Second team answer'});
ok(st.phase==='discuss'&&!st.rounds[0].revealed,'Both submissions do not automatically reveal');
send('host','pause');rejects(()=>send(0,'draft',{round:1,answer:'x'}),'Paused discussion rejects answers');
send('host','timer',{seconds:30});const pausedRemaining=C.remaining(st,now+10000);ok(pausedRemaining===30,'Paused timer holds');
send('host','resume');send('host','reveal');
ok(C.view(st,1,now).round.answers[0].text==='Corrected team answer','Host reveal releases opponent answer');
send('host','score',{team:0,round:1,points:8});send('host','score',{team:1,round:1,points:6});
ok([0,1,'host'].every(role=>C.view(st,role,now).scores.join(',')==='8,6'),'Scores agree in all three views');
send('host','score',{team:0,round:1,points:3});send('host','undo');ok(C.view(st,'host',now).scores[0]===8,'Undo restores prior points');
send('host','next',{requestId:'next-once'});send('host','next',{requestId:'next-once'});
ok(st.phase==='between'&&st.rounds.length===1,'Retried next action is idempotent');
ok(C.view(st,0,now).upcomingRoles[0][0].student==='Bradley (Max)','Roles rotate between rounds');
send(0,'ready',{ready:true});send(1,'ready',{ready:true});send('host','start');
rejects(()=>send(0,'lock',{round:1,answer:'stale'}),'Stale round submission rejected');
now+=100000;rejects(()=>send(1,'lock',{round:2,answer:'late'}),'Expired timer rejects lock');
send('host','timer',{seconds:0});send(1,'lock',{round:2,answer:'Untimed accepted'});
send('host','notes',{notes:{'0:0':'Olivia explained the first step with one prompt.'},nextPlan:'Practice supervisor check-ins.'});
send('host','skip');
ok(!C.view(st,0,now).round.revealed&&C.view(st,0,now).round.answers[1].text===null,'Skip does not reveal hidden opposing answer');
send('host','end');
const host={code:'TESTAB',...C.view(st,'host',now)};
const page=REPORT.html(host),individual=REPORT.html(host,'0:0');
ok(page.includes('Practice supervisor check-ins.')&&page.includes('Workplace Readiness'),'Session report contains focus and next plan');
ok(page.includes('Corrected team answer')&&page.includes('Untimed accepted'),'Host report contains actual submitted team answers');
ok(individual.includes('Olivia explained the first step with one prompt.')&&individual.includes('TEAM WORK'),'Individual report uses observations and team-work labels');
ok(individual.includes('does not establish that an individual demonstrated'),'Individual report does not infer individual skill from team correctness');
ok(page.includes('Discussion leader')&&page.includes('Typist')&&page.includes('Spokesperson'),'Report includes role assignments');
rejects(()=>REPORT.html(C.view(st,0,now)),'Students cannot generate host documentation');
st.notes['0:0']='<script>alert(1)</script>';ok(!REPORT.html({code:'TESTAB',...C.view(st,'host',now)},'0:0').includes('<script>'),'Reports escape user-entered content');
for(const f of C.FOCI){const x=C.createState({focus:f,length:14,seconds:0},BANK,now);ok(x.deck.every(q=>q.focus===f)&&new Set(x.deck.map(q=>q.id)).size===14,'Unique focused session: '+f)}
return assertions;

})();
for(const file of ['assets/career-feud/game.js','assets/career-feud/report.js','assets/school/entrance.js'])new vm.Script(read(file),{filename:file});
const town=read('transition-town.html');for(const m of town.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc=/.test(m[1]))new vm.Script(m[2]);}
if(!read('assets/school/entrance.js').includes('href="career-feud.html"')||!town.includes('transition-game-show.html'))throw Error('School integration or legacy game missing');
console.log('Career Feud logic/report checks passed: '+passed.length);
