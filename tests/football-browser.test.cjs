/* Actual two-context Supabase test. No mocked transport or in-memory room substitute.
   Run node tests/football-browser.test.cjs. Set FOOTBALL_BROWSER to override Chromium. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),mime={'.js':'application/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.png':'image/png'};
const server=http.createServer((req,res)=>{const p=path.join(root,decodeURIComponent(req.url.split('?')[0]));try{res.setHeader('Content-Type',mime[path.extname(p)]||'text/plain');res.end(fs.readFileSync(p))}catch{res.statusCode=404;res.end('missing')}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const b=await chromium.launch({executablePath:process.env.FOOTBALL_BROWSER||'/tmp/driving-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox','--ignore-certificate-errors'],...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{})});
 const errors=[];const newPage=async(viewport={width:1280,height:920})=>{const c=await b.newContext({viewport,hasTouch:true,ignoreHTTPSErrors:true});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/park-football.html');await p.waitForFunction(()=>!document.getElementById('solo').disabled);return p;};
 const snap=p=>p.evaluate(()=>TTFootball.snapshot()),pause=ms=>new Promise(r=>setTimeout(r,ms));
 const host=await newPage();assert.equal(await host.locator('#team option').count(),94);await host.fill('#search','Weakley');assert.equal(await host.locator('#team option').count(),4);await host.fill('#search','no-such-school');assert.ok(await host.locator('#solo').isDisabled());await host.fill('#search','');await host.selectOption('#team','462');await host.click('#host');const code=(await snap(host)).code;assert.equal(code.length,8);
 const guest=await newPage({width:844,height:390});await guest.selectOption('#team','119');await guest.fill('#roomInput',code);await guest.click('#join');
 await host.waitForFunction(()=>TTFootball.snapshot().peer,null,{timeout:25000});await host.waitForTimeout(500);await host.click('#startMatch');await guest.waitForFunction(()=>TTFootball.snapshot().ready,null,{timeout:15000});assert.deepEqual((await snap(guest)).game.teams,['462','119']);assert.equal((await snap(host)).game.cpu,false);assert.equal((await snap(guest)).side,1);
 console.log('PASS live room: South Fulton vs Dresden, independent browser contexts.');
 // Guest movement reaches the host, and authoritative positions return to the guest.
 await host.keyboard.press('Space');await guest.waitForFunction(()=>TTFootball.snapshot().game.phase==='live');const initial=(await snap(host)).game.defense[0].y;
 await guest.keyboard.down('ArrowUp');await pause(650);await guest.keyboard.up('ArrowUp');await pause(250);
 const a=await snap(host),z=await snap(guest);assert.ok(a.game.defense[0].y<initial-2,'Guest controls host simulation');assert.ok(Math.abs(a.game.defense[0].y-z.game.defense[0].y)<1,'Guest receives shared positions');assert.ok(Math.abs(a.game.clock-z.game.clock)<.6);assert.deepEqual(a.game.score,z.game.score);
 // Pause from either device stops the host clock, then resumes cleanly.
 await guest.click('#pause');await host.waitForFunction(()=>!TTFootball.snapshot().ready);const frozen=(await snap(host)).game.clock;await pause(700);assert.equal((await snap(host)).game.clock,frozen);await guest.click('#pause');await host.waitForFunction(()=>TTFootball.snapshot().ready);
 // Match advances to the next play; host punt switches possession for BOTH players.
 await host.waitForFunction(()=>TTFootball.snapshot().game.phase==='ready',null,{timeout:20000});await host.locator('[data-action="punt"]').click();await guest.waitForFunction(()=>TTFootball.snapshot().game.offense===1,null,{timeout:7000});assert.equal((await snap(host)).game.offense,1);assert.equal((await snap(guest)).game.offense,1);
 console.log('PASS guest controls, clock/state synchronization, guest pause and punt possession change.');
 // A third device receives a clear full-room notice and cannot join the match.
 const third=await newPage();await third.fill('#roomInput',code);await third.click('#join');await third.waitForFunction(()=>document.getElementById('connection').textContent.includes('full'),null,{timeout:20000});assert.equal((await snap(third)).ready,false);await third.click('#leave');
 // Live landscape controls and portrait layout do not overflow the screen.
 await guest.screenshot({path:'/tmp/football-landscape.png',fullPage:true});await guest.setViewportSize({width:390,height:844});await pause(250);assert.equal(await guest.evaluate(()=>document.documentElement.scrollWidth),390);await guest.screenshot({path:'/tmp/football-portrait.png',fullPage:true});await guest.setViewportSize({width:844,height:390});assert.equal(await guest.evaluate(()=>document.documentElement.scrollWidth),844);
 // Physical second touch: hold the movement pad and snap using another finger.
 await guest.waitForFunction(()=>TTFootball.snapshot().game.phase==='ready',null,{timeout:6000});
 await guest.evaluate(()=>window.scrollTo(0,0));const cdp=await guest.context().newCDPSession(guest),rect=await guest.locator('#stick').boundingBox(),snapBox=await guest.locator('[data-action="snap"]').boundingBox();
 assert.ok(snapBox.y+snapBox.height<390,'Touch action stays inside landscape viewport');const finger={x:rect.x+rect.width*.5,y:rect.y+rect.height*.75,id:1},button={x:snapBox.x+snapBox.width/2,y:snapBox.y+snapBox.height/2,id:2};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger,button]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[finger]});await pause(400);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await host.waitForFunction(()=>TTFootball.snapshot().game.phase==='live'||TTFootball.snapshot().game.phase==='dead',null,{timeout:3000});assert.ok((await snap(guest)).game.playTime>0);
 // Disconnect pauses instead of turning the absent person into a computer.
 await guest.click('#leave');await host.waitForFunction(()=>!TTFootball.snapshot().ready,null,{timeout:6000});const stopped=(await snap(host)).game.clock;await pause(500);assert.equal((await snap(host)).game.clock,stopped);assert.equal((await snap(host)).game.cpu,false);await host.click('#leave');
 // Park route and return link resolve to this existing town's football entry.
 await host.click('.back');await host.waitForSelector('#recreationZone');await host.locator('.rzGame').filter({hasText:'Football'}).click();await host.waitForURL('**/park-football.html');assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS room capacity, mobile layouts, two-finger snap, disconnect pause, park integration; no runtime errors.');await b.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});
