const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const C=new Function(read('supabase/functions/career-feud/core.js').replace(/export /g,'')+'\nreturn {FOCI,createState,mutate,view,remaining};')();
const BANK=new Function(read('supabase/functions/career-feud/questions.js').replace(/export /g,'')+'\nreturn BANK;')();
const w={};new Function('window',read('assets/career-feud/report.js'))(w);const REPORT=w.CareerFeudReport;

const http=require('node:http'),{chromium,expect}=require('@playwright/test');
const rooms=new Map(),errors=[],ART=path.join(root,'career-feud-test-output');
fs.mkdirSync(ART,{recursive:true});
function mock(b,headers,url){
 if(url.includes('classroom-monitor'))return {token:'tt-pin-'+('a'.repeat(64)),expires_at:new Date(Date.now()+3600000).toISOString(),user:{id:'test-teacher'}};
 let room=rooms.get(b.code);
 if(b.action==='create'){
  if(!headers.authorization)throw Error('Teacher authentication required');
  room={code:'TESTAB',host:b.token,seats:[null,null],state:C.createState(b,BANK,Date.now())};rooms.set(room.code,room);return {code:room.code,...C.view(room.state,'host',Date.now())};
 }
 if(!room)throw Error('Room not found');
 if(b.action==='inspect')return {code:room.code,phase:room.state.phase,teams:room.state.teams.map((t,i)=>({...t,available:!room.seats[i]}))};
 let role=b.token===room.host?'host':room.seats.indexOf(b.token);
 if(b.action==='join'){
  if(room.seats[b.team]&&room.seats[b.team]!==b.token)throw Error('That team is already on another laptop');
  room.seats[b.team]=b.token;role=b.team;room.state=C.mutate(room.state,role,{action:'heartbeat'},Date.now());
 }else{if(role===-1)throw Error('Unauthorized');if(b.action!=='state'){room.state=C.mutate(room.state,role,b,Date.now());if(b.action==='release')room.seats[b.team]=null;}}
 return {code:room.code,...C.view(room.state,role,Date.now(),room.seats.map(Boolean))};
}
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.stat(target,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end();return}
 const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'};
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 try{
  const contexts=await Promise.all(Array.from({length:4},()=>browser.newContext({viewport:{width:1366,height:768}})));
  for(const context of contexts){
   await context.route('https://tyzpophjoptciihaszqj.supabase.co/**',async route=>{
    try{const data=mock(route.request().postDataJSON()||{},route.request().headers(),route.request().url());await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)})}
    catch(e){await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:e.message})})}
   });
  }
  const [host,one,two,duplicate]=await Promise.all(contexts.map(c=>c.newPage()));
  for(const p of [host,one,two,duplicate]){p.on('dialog',d=>d.accept());p.on('pageerror',e=>{if(p.url().includes('career-feud'))errors.push(e.message)})}
  
  await host.goto('http://127.0.0.1:4173/transition-town.html?school=1');
  await host.locator('#loginProfile').selectOption('Olivia');await host.getByRole('button',{name:'Enter Transition Town',exact:true}).click();
  await host.evaluate(()=>trainingCollege());
  await expect(host.locator('.school-hall-art')).toBeVisible();
  await expect(host.getByRole('button',{name:'School Directory',exact:true})).toBeVisible();
  await expect(host.locator('#schoolDirectoryDialog')).toHaveCount(0);
  await host.getByRole('button',{name:'School Directory',exact:true}).click();
  await expect(host.locator('#schoolDirectoryDialog .school-room')).toHaveCount(6);
  await host.keyboard.press('Escape');
  await expect(host.locator('#schoolDirectoryDialog')).toHaveCount(0);
  await expect(host.locator('.school-hall-art')).toBeVisible();
  await host.evaluate(()=>{schoolClassrooms()});await expect(host.locator('#centerScene')).toBeVisible();
  await host.evaluate(()=>{trainingCollege()});
  await host.getByRole('button',{name:'School Directory',exact:true}).click();
  await host.locator('#schoolDirectoryDialog [data-school-dir="room"][data-room="wow"]').click();
  await host.locator('#schoolDirectoryDialog .school-feature-link[href="career-feud.html"]').click();
  await expect(host.getByRole('button',{name:'Host Game',exact:true})).toBeVisible();
  await host.getByRole('button',{name:'Host Game',exact:true}).click();
  await host.locator('select[name=length]').selectOption('2');await host.locator('#teacherPin').fill('1234');
  await host.getByRole('button',{name:'Create live room'}).click();
  await expect(host.locator('.room-code')).toHaveText('TESTAB');
  await one.goto('http://127.0.0.1:4173/career-feud.html?room=TESTAB');
  await two.goto('http://127.0.0.1:4173/career-feud.html?room=TESTAB');
  await one.locator('[data-action=claim][data-team="0"]').click();
  await two.locator('[data-action=claim][data-team="1"]').click();
  await duplicate.goto('http://127.0.0.1:4173/career-feud.html?room=TESTAB');
  await expect(duplicate.locator('[data-action=claim][data-team="0"]')).toBeDisabled();
  await expect(duplicate.locator('[data-action=claim][data-team="1"]')).toBeDisabled();
  await one.locator('[data-action=ready]').click();await two.locator('[data-action=ready]').click();
  await expect(host.locator('[data-action=start]')).toBeEnabled();await host.locator('[data-action=start]').click();
  await expect(one.locator('.question')).toHaveText(await host.locator('.question').innerText());
  await expect(two.locator('.question')).toHaveText(await host.locator('.question').innerText());
  const lockBox=await one.locator('#lockButton').boundingBox();if(lockBox.y+lockBox.height>768)throw Error('Student LOCK IN requires scrolling at 1366x768');
  await one.locator('#teamAnswer').fill('TEAM ONE SECRET: We would check the hazard, then ask the supervisor.');
  await one.locator('#lockButton').click();
  await expect(host.locator('.response').first()).toContainText('TEAM ONE SECRET');
  if((await two.locator('body').innerText()).includes('TEAM ONE SECRET'))throw Error('Opponent answer leaked in UI');
  await expect(two.locator('[data-action=reveal]')).toHaveCount(0);
  await one.reload();await expect(one.locator('#teamAnswer')).toHaveValue(/TEAM ONE SECRET/);await expect(one.locator('#teamAnswer')).toBeDisabled();
  await host.locator('[data-action=unlock][data-team="0"]').click();
  await expect(one.locator('#teamAnswer')).toBeEnabled();
  await one.locator('#teamAnswer').fill('TEAM ONE CORRECTED: Communicate the safe next step.');await one.locator('#lockButton').click();
  await two.locator('#teamAnswer').fill('TEAM TWO ANSWER: Ask for clarification and explain the priority.');await two.locator('#lockButton').click();
  await expect(host.locator('.response').nth(1)).toContainText('TEAM TWO ANSWER');
  await host.screenshot({path:path.join(ART,'host-before-reveal.png'),fullPage:true});
  await one.screenshot({path:path.join(ART,'student-locked.png')});
  await host.locator('[data-action=reveal]').click();
  await expect(two.locator('.response').first()).toContainText('TEAM ONE CORRECTED');
  await host.locator('.scoreForm[data-team="0"] input').fill('8');await host.locator('.scoreForm[data-team="0"] button').click();
  await host.locator('.scoreForm[data-team="1"] input').fill('6');await host.locator('.scoreForm[data-team="1"] button').click();
  for(const p of [host,one,two])await expect(p.locator('.score')).toHaveText(['8','6']);
  await host.locator('[data-action=next]').click();
  await expect(one.locator('.role-ribbon')).toContainText('Bradley (Max)');
  await one.locator('[data-action=ready]').click();await two.locator('[data-action=ready]').click();
  await expect(host.locator('[data-action=start]')).toBeEnabled();await host.locator('[data-action=start]').click();
  await host.locator('[data-action=pause]').click();await expect(one.locator('#teamAnswer')).toBeDisabled();
  await host.locator('[data-action=untimed]').click();await host.locator('[data-action=resume]').click();
  await expect(one.locator('#clock')).toHaveText('UNTIMED');
  await host.locator('details.notes').first().locator('summary').click();
  await host.locator('[data-note="0:0"]').fill('Observed Olivia explain the first step with one prompt.');
  await host.locator('#nextPlan').fill('Practice asking supervisors for clarification.');
  await host.getByRole('button',{name:'Save notes',exact:true}).click();await expect(host.locator('#notesSaved')).toHaveText('Saved');
  await host.locator('[data-action=end]').click();
  await expect(one.locator('.results-heading')).toBeVisible();
  await expect(host.locator('#studentReport')).toHaveCount(1);
  await host.evaluate(()=>window.print=()=>{window.__printed=true});
  await host.locator('[data-action=print]').first().click();
  await expect(host.locator('#printArea')).toContainText('TEAM ONE CORRECTED');
  await expect(host.locator('#printArea')).toContainText('Practice asking supervisors for clarification.');
  await host.locator('[data-action=printStudent]').first().click();
  await expect(host.locator('#printArea')).toContainText('Observed Olivia explain');
  await expect(host.locator('#printArea')).toContainText('TEAM WORK');
  await host.locator('#studentReport').selectOption('1:2');await host.locator('[data-note="1:2"]').fill('Observed Nick take the spokesperson turn.');await host.locator('[data-action=printStudent]').first().click();
  await expect(host.locator('#printArea h2').first()).toHaveText('Individual student summary: Nick');await expect(host.locator('#printArea')).toContainText('Observed Nick take the spokesperson turn.');
  await host.emulateMedia({media:'print'});await host.pdf({path:path.join(ART,'individual-summary.pdf'),format:'Letter'});await host.emulateMedia({media:'screen'});
  // Check a smaller Chromebook display and narrow layout with a new session.
  await host.locator('[data-action=leave]').click();await host.locator('[data-action=setup]').click();await host.locator('select[name=seconds]').selectOption('0');await host.locator('#hostForm button.primary').click();
  for(const p of [one,two]){await p.evaluate(()=>localStorage.removeItem('ttCareerFeudTeam:TESTAB'));}
  await one.setViewportSize({width:1280,height:720});
  await one.goto('http://127.0.0.1:4173/career-feud.html?room=TESTAB');await one.locator('[data-action=claim][data-team="0"]').click();
  await two.goto('http://127.0.0.1:4173/career-feud.html?room=TESTAB');await two.locator('[data-action=claim][data-team="1"]').click();
  await one.locator('[data-action=ready]').click();await two.locator('[data-action=ready]').click();await expect(host.locator('[data-action=start]')).toBeEnabled();await host.locator('[data-action=start]').click();
  await expect(one.locator('#lockButton')).toBeVisible();const small=await one.locator('#lockButton').boundingBox();if(small.y+small.height>720)throw Error('Student LOCK IN requires scrolling at 1280x720');
  await one.screenshot({path:path.join(ART,'student-chromebook.png')});
  await one.setViewportSize({width:390,height:844});
  if(await one.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Mobile horizontal overflow');
  if(errors.length)throw Error('Client exceptions: '+errors.join('; '));
  console.log('Career Feud browser checks passed: school entry, four isolated contexts, two seats, typing, lock, reveal, reconnect, scoring, rotation, timer, notes, print, 1366x768, 1280x720, narrow layout.');
  console.log('Browser network uses an isolated in-memory fixture. Production backend API verification is documented separately.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
