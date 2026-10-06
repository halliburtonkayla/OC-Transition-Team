const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end('missing');}});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:process.env.SOFTBALL_BROWSER||'/tmp/driving-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('BROWSER:',m.text().slice(0,500));});
 const base=`http://127.0.0.1:${server.address().port}`;await page.goto(base+'/park-fishing.html');
 assert.equal(await page.locator('#error').isVisible(),false);assert.ok(await page.locator('#view').isVisible());
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'/tmp/fishing-mobile.png'});await page.locator('#view').dispatchEvent('pointerdown',{clientX:200,clientY:280,pointerId:1,pointerType:'touch'});
 await page.click('#cast');await page.waitForSelector('#hook:visible',{timeout:7500});assert.match(await page.locator('#status').textContent(),/BITE/);
 await page.click('#hook');await page.waitForSelector('#reel:visible');
 for(let i=0;i<18&&await page.locator('#reel').isVisible();i++){
  const box=await page.locator('#reel').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  await page.waitForTimeout(900);
 }
 assert.match(await page.locator('#caught').textContent(),/1 \/ 5/);assert.match(await page.locator('#status').textContent(),/landed/);
 await page.screenshot({path:'/tmp/fishing-catch.png'});
 await page.click('#sound');assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
 await page.setViewportSize({width:844,height:390});await page.screenshot({path:'/tmp/fishing-landscape.png'});const button=await page.locator('#cast').boundingBox();assert.ok(button.y+button.height<=390);
 await page.goto(base+'/transition-town.html#park');await page.waitForSelector('#recreationZone');await page.locator('.rzGame').filter({hasText:'Fishing'}).click();await page.waitForURL('**/park-fishing.html?*');
 assert.deepEqual(errors,[]);console.log('Fishing browser checks passed: 3D, mobile layout, bite, hook, tension-controlled catch, sound and park navigation.');await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});
