// Real frontend + production Edge Function logic, with isolated in-memory transport.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,expect}=require('@playwright/test');
const {fixture}=require('./career-feud-fixture.cjs');
const root=path.resolve(__dirname,'..'),f=fixture(),ART=path.join(root,'career-feud-test-output');fs.mkdirSync(ART,{recursive:true});
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(target,(err,stat)=>{if(err||!stat.isFile())return res.writeHead(404).end();res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res)});
});
(async()=>{
 await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));const browser=await chromium.launch(),contexts=[],errors=[],testPages=[];
 try{
  async function page(){
   const context=await browser.newContext({viewport:{width:1366,height:768}});contexts.push(context);
   await context.route('https://tyzpophjoptciihaszqj.supabase.co/**',async route=>{const r=await f.call(route.request().postDataJSON(),route.request().headers().authorization);await route.fulfill({status:r.status,contentType:'application/json',body:JSON.stringify(r.body)})});
   const p=await context.newPage();testPages.push(p);p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());return p;
  }
  const host=await page(),players=await Promise.all(Array.from({length:6},page)),duplicate=await page();
  await host.goto('http://127.0.0.1:4173/career-feud.html');
  await host.evaluate(()=>sessionStorage.setItem('tt-monitor-auth-v1',JSON.stringify({access_token:'test-teacher'})));
  const setup=async(count,length=1)=>{await host.locator('[data-action=setup]').click();await host.locator('#gameMode').selectOption('individual');await host.locator('#playerCount').selectOption(String(count));await host.locator('[name=length]').selectOption(String(length));await host.locator('[name=seconds]').selectOption('0');};
  await setup(3,2);
  await expect(host.locator('[name^=student]')).toHaveCount(0);
  for(const n of ['Olivia','Bradley','Alyssa','Jocquan','Kaylee','Nick'])if((await host.locator('#app').innerText()).includes(n))throw Error('Preset name in setup: '+n);
  await host.locator('#hostForm button.primary').evaluate(el=>{el.click();el.click()});await expect(host.locator('.room-code')).toBeVisible();
  const code=await host.locator('.room-code').innerText(),url='http://127.0.0.1:4173/career-feud.html?room='+code;
  await expect(host.locator('.podium')).toHaveCount(3);await expect(host.locator('[data-action=start]')).toBeDisabled();
  for(let i=0;i<3;i++)await players[i].goto(url);
  await players[0].locator('[data-action=claim][data-team="0"]').click();await expect(players[0].locator('#notice')).toContainText('name');
  for(let i=0;i<3;i++){
   await players[i].locator('#playerName').fill(['Alex','Blake','Casey'][i]);
   await players[i].locator('[data-action=claim][data-team="'+i+'"]').click();await expect(players[i].locator('.podium')).toHaveCount(3);
  }
  await duplicate.goto(url);for(let i=0;i<3;i++)await expect(duplicate.locator('[data-action=claim][data-team="'+i+'"]').first()).toBeDisabled();
  async function ready(active=[0,1,2]){await expect(host.locator('#app')).not.toHaveClass(/\bbusy\b/);for(const i of active)await players[i].locator('[data-action=ready]').click();await expect(host.locator('[data-action=start]')).toBeEnabled();await host.locator('[data-action=start]').evaluate(el=>{el.click();el.click()});await expect(host.locator('.question')).toBeVisible();}
  async function answer(active=[0,1,2]){for(const i of active){await expect(players[i].locator('#teamAnswer')).toBeVisible();await players[i].locator('#teamAnswer').fill('PRIVATE '+i+': Explain the safe next step.');await players[i].locator('#lockButton').click();}await expect(host.locator('.response').first()).toContainText('PRIVATE 0');}
  async function score(points){await host.locator('[data-action=reveal]').click();for(let i=0;i<points.length;i++){if(points[i]===null)continue;await host.locator('.scoreForm[data-team="'+i+'"] input').first().fill(String(points[i]));await host.locator('.scoreForm[data-team="'+i+'"] button').first().click();await expect(host.locator('#app')).not.toHaveClass(/\bbusy\b/);}}
  await ready();await answer();
  if((await players[1].locator('#app').innerText()).includes('PRIVATE 0'))throw Error('Hidden answer leaked');
  await players[0].reload();await expect(players[0].locator('#teamAnswer')).toHaveValue(/PRIVATE 0/);await expect(players[0].locator('#teamAnswer')).toBeDisabled();
  await score([10,7,3]);await host.locator('[data-action=next]').evaluate(el=>{el.click();el.click()});await ready();await answer();await score([0,3,0]);await host.locator('[data-action=next]').click();
  await expect(host.locator('.board')).toContainText('The lead is tied');await expect(players[2].locator('[data-action=ready]')).toHaveCount(0);
  await ready([0,1]);await expect(players[2].locator('#teamAnswer')).toHaveCount(0);await answer([0,1]);await score([5,5,null]);await host.locator('[data-action=next]').click();
  await expect(host.locator('.board')).toContainText('The lead is tied');
  await host.screenshot({path:path.join(ART,'three-player-repeat-tie.png'),fullPage:true});
  await ready([0,1]);await answer([0,1]);await score([2,1,null]);await host.locator('[data-action=next]').click();
  for(const p of [host,...players.slice(0,3)]){await expect(p.locator('.results-heading')).toContainText('Alex wins');await expect(p.locator('.score')).toHaveText(['17','16','3']);}
  await expect(host.locator('.tally')).toContainText('TB 2');await expect(host.locator('.tally')).toContainText('17');
  await host.evaluate(()=>window.print=()=>{});await host.locator('[data-action=print]').click();await expect(host.locator('#printArea')).toContainText('Overall tally sheet');await expect(host.locator('#printArea')).toContainText('Tiebreaker 2');await expect(host.locator('#printArea')).toContainText('Winner: Alex');
  await host.screenshot({path:path.join(ART,'three-player-final-tally.png'),fullPage:true});
  await host.reload();await expect(host.locator('.results-heading')).toContainText('Alex wins');
  // New session: no names or old scores persist, and six actual individual seats work.
  await host.locator('[data-action=leave]').click();await setup(6);await host.locator('#hostForm button.primary').click();await expect(host.locator('.podium')).toHaveCount(6);
  const six=await host.locator('.room-code').innerText();
  for(let i=0;i<6;i++){await players[i].goto('http://127.0.0.1:4173/career-feud.html?room='+six);await expect(players[i].locator('#playerName')).toHaveValue('');await players[i].locator('#playerName').fill('Player Test '+(i+1));await players[i].locator('[data-action=claim][data-team="'+i+'"]').click();await players[i].locator('[data-action=ready]').click();}
  await expect(host.locator('.score')).toHaveText(['0','0','0','0','0','0']);await expect(host.locator('[data-action=start]')).toBeEnabled();await host.locator('[data-action=start]').click();await expect(players[5].locator('#teamAnswer')).toBeVisible();
  await players[5].setViewportSize({width:390,height:844});if(await players[5].evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Six-player mobile overflow');
  await host.screenshot({path:path.join(ART,'six-player-session.png'),fullPage:true});
  // Team roster respects actual count and is blank on every new setup.
  await host.locator('[data-action=leave]').click();await setup(3);await host.locator('#gameMode').selectOption('teams');await expect(host.locator('[name^=student]')).toHaveCount(3);
  await host.locator('#playerCount').selectOption('6');await expect(host.locator('[name^=student]')).toHaveCount(6);for(const el of await host.locator('[name^=student]').all())await expect(el).toHaveValue('');
  await host.locator('[data-action=home]').click();await host.locator('[data-action=setup]').click();await expect(host.locator('#playerCount')).toHaveValue('6');await expect(host.locator('#gameMode')).toHaveValue('teams');
  if(errors.length)throw Error('Browser exceptions: '+errors.join('; '));
  console.log('Career Feud individual browser checks passed: actual3/6 counts, own typed names, blank reset, independent sync/privacy, rapid controls, cumulative winner, repeated tied-leader rounds, report/reconnect, team roster count, mobile layout. Isolated production-handler fixture; not live network.');
 }catch(error){for(let i=0;i<testPages.length;i++){try{await testPages[i].screenshot({path:path.join(ART,'failure-player-'+i+'.png'),fullPage:true});fs.writeFileSync(path.join(ART,'failure-player-'+i+'.txt'),await testPages[i].locator('body').innerText())}catch{}}fs.writeFileSync(path.join(ART,'failure-fixture.json'),JSON.stringify(f.tables.tt_career_feud_rooms.map(r=>({code:r.code,state:r.state})),null,2));throw error;}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
