/* Run: node tests/storytime-browser.test.cjs
   Set STORYTIME_ENGINE=webkit for Safari's engine; STORYTIME_ASSETS=1 checks every illustration.
   All external requests are blocked so fixtures cannot touch live services. */
const {chromium,webkit}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),artRequired=process.env.STORYTIME_ASSETS==='1';
const mime={'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.html':'text/html'};
const server=http.createServer((req,res)=>{
  try{const name=decodeURIComponent(req.url.split('?')[0]),p=path.resolve(root,'.'+name);if(!p.startsWith(root+path.sep))throw Error('invalid');const data=fs.readFileSync(p);res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');
    if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/),start=+m[1],end=m[2]?+m[2]:data.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}else res.end(data);
  }catch{res.statusCode=404;res.end('missing');}
});
const fixture={residents:{Guest:{checking:1234.56,savings:4321,sessions:7,career:'Coding',job:'Bakery',home:'Existing apartment',car:'Existing car',history:['Keep this history'],notifications:[],inventory:[{id:'milk',qty:2}],employment:{grocery:{active:true}}},'Miss Kayla':{checking:10000,savings:55,sessions:4,career:'Teacher',job:'Specialist',home:'House',history:['Keep teacher history'],notifications:[]}},messages:[{from:'fixture',to:'Guest',text:'Keep this'}],businesses:{'Preserved Student Business':{balance:333,owners:['Guest']}},events:[{issue:'Keep'}]};
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const engine=process.env.STORYTIME_ENGINE||'chromium';
  const browser=await (engine==='webkit'?webkit.launch({headless:true,executablePath:process.env.STORYTIME_WEBKIT}):chromium.launch({headless:true,executablePath:process.env.STORYTIME_CHROME||'/tmp/driving-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']}));
  const errors=[],results=[];
  for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1365,height:900}]){
    const ctx=await browser.newContext({viewport,isMobile:viewport.width<1000,hasTouch:viewport.width<1000,reducedMotion:'reduce'});
    await ctx.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>{if(r.url().includes('/assets/storytime/'))requests.push(r.url())});
    await page.addInitScript(({fixture})=>{if(!localStorage.ttWorld){localStorage.ttWorld=JSON.stringify(fixture);localStorage.ttKaylaBalanceReset20261003Park='done';localStorage.ttStoryFixture='yes';}}, {fixture});
    await page.goto(base+'/transition-town.html');await page.selectOption('#loginProfile','Guest');await page.locator('button').filter({hasText:/^Enter Transition Town$/}).click();
    const before=await page.evaluate(()=>JSON.parse(localStorage.ttWorld));
    // Real navigation from the existing map through park and playground.
    await page.locator('.townmap .park').click();await page.locator('.parkplay').click();await page.locator('[aria-label="Story Time"]').click();
    await page.waitForSelector('#transitionStory .stBook');assert.equal(await page.locator('.stBook').count(),12);
    assert.equal(await page.locator('[data-st-action="sound"]').getAttribute('aria-pressed'),'false');
    assert.ok(requests.every(r=>r.endsWith('/cover-thumb.webp')),'Shelf must request covers only');
    assert.ok(await page.evaluate(()=>{const r=document.getElementById('transitionStory');return r.scrollWidth<=r.clientWidth}),'No horizontal reader overflow');
    await page.screenshot({path:'/workspace/scratch/1e04116ffe06/storytime-shelf-'+viewport.width+'.png'});
    const titles=await page.evaluate(()=>ttStoryBooks.map(b=>b.t));
    for(let i=0;i<12;i++){
      await page.locator('[data-st-action="book"][data-index="'+i+'"]').click();assert.equal(await page.locator('.stCoverCopy h1').textContent(),titles[i]);
      await page.locator('[data-st-action="start"]').click();assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');
      assert.equal(await page.locator('[data-st-action="previous"]').isDisabled(),true);
      for(let j=0;j<10;j++){
        const expected=await page.evaluate(({i,j})=>ttStoryBooks[i].pages[j],{i,j});assert.equal(await page.locator('#stStoryText').textContent(),expected);
        if(artRequired){await page.waitForFunction(()=>{const img=document.querySelector('.stScene img');return img&&img.complete&&img.naturalWidth>0});assert.equal(await page.locator('.stImageNote').count(),0);}
        assert.ok(await page.evaluate(()=>{const r=document.getElementById('transitionStory');return r.scrollWidth<=r.clientWidth}));
        if(j===1){await page.locator('[data-st-action="previous"]').click();assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');await page.locator('[data-st-action="next"]').click();}
        if(await page.locator('.stChoice').count()){
          await page.locator('[data-st-action="choice"]').first().click();assert.equal(await page.locator('[data-st-action="choice"]').first().getAttribute('aria-pressed'),'true');assert.ok((await page.locator('.stConsequence').textContent()).length>20);
        }
        if(i===0&&j===0)await page.screenshot({path:'/workspace/scratch/1e04116ffe06/storytime-page-'+viewport.width+'.png'});
        await page.locator('[data-st-action="next"]').click();
      }
      assert.equal(await page.locator('.stEnd h1').textContent(),'The End');assert.equal(await page.locator('.stReflections li').count(),3);
      if(i===0){await page.locator('[data-st-action="again"]').click();assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');await page.locator('[data-st-action="shelf"]').click();}
      else await page.locator('[data-st-action="shelf"]').click();
    }
    // Keyboard, pure vertical scrolling, horizontal swipe, and cancelled diagonal swipe.
    await page.locator('[data-st-action="book"][data-index="0"]').click();await page.locator('[data-st-action="start"]').click();
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#stCount').textContent(),'Page 2 of 10');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');
    async function gesture(dx,dy){await page.locator('#stSpread').dispatchEvent('touchstart',{touches:[{identifier:1,clientX:260,clientY:200}]});await page.locator('#stSpread').dispatchEvent('touchmove',{touches:[{identifier:1,clientX:260+dx,clientY:200+dy}]});await page.locator('#stSpread').dispatchEvent('touchend',{touches:[],changedTouches:[{identifier:1,clientX:260+dx,clientY:200+dy}]});}
    await gesture(-10,-170);assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');await gesture(-160,5);assert.equal(await page.locator('#stCount').textContent(),'Page 2 of 10');await gesture(160,5);assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');await gesture(-120,-100);assert.equal(await page.locator('#stCount').textContent(),'Page 1 of 10');
    if(viewport.width<1000){assert.ok(await page.evaluate(()=>{const e=document.getElementById('transitionStory');e.scrollTop=300;return e.scrollTop>0;}),'Vertical scrolling works');}
    assert.equal(await page.locator('#stSpread').evaluate(el=>getComputedStyle(el).animationName),'none');
    // Exercise TTS orchestration deterministically; actual installed voice availability varies by OS.
    const hasSpeech=await page.evaluate(()=>'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window);
    if(hasSpeech){
      await page.evaluate(()=>{window.__speech=[];speechSynthesis.speak=u=>{window.__utterance=u;window.__speech.push(u.text);u.onstart?.();};speechSynthesis.cancel=()=>{};speechSynthesis.getVoices=()=>[];});
      await page.locator('[data-st-action="play"]').click();assert.ok(await page.locator('.stSpeaking').count());
      await page.locator('[data-st-action="pause"]').click();assert.match(await page.locator('#stVoiceStatus').textContent(),/Paused/);
      await page.locator('[data-st-action="play"]').click();await page.locator('[data-st-action="restart"]').click();
      assert.ok((await page.evaluate(()=>window.__speech.length))>=3);
      await page.evaluate(()=>{for(let i=0;i<2;i++)window.__utterance.onend?.();});assert.equal(await page.locator('#stCount').textContent(),'Page 2 of 10');
      await page.locator('[data-st-action="pause"]').click();
    }
    // Existing recorded MP3 remains primary and can play, pause, restart, and seek.
    await page.locator('[data-st-action="shelf"]').click();await page.locator('[data-st-action="book"][data-index="6"]').click();await page.locator('[data-st-action="read"]').click();
    assert.equal(await page.locator('#stSource').inputValue(),'recording');
    await page.waitForFunction(()=>transitionStoryAudio&&transitionStoryAudio.currentTime>0,{},{timeout:15000});
    await page.locator('[data-st-action="pause"]').click();assert.equal(await page.evaluate(()=>transitionStoryAudio.paused),true);
    await page.locator('[data-st-action="restart"]').click();await page.waitForFunction(()=>transitionStoryAudio.currentTime>0);await page.locator('[data-st-action="next"]').click();assert.equal(await page.locator('#stCount').textContent(),'Page 2 of 10');
    await page.locator('[data-st-action="shelf"]').click();assert.equal(await page.evaluate(()=>transitionStoryAudio.paused),true);
    await page.locator('[data-st-action="park"]').click();await page.waitForSelector('#transitionParkScene');await page.locator('.parkback').click();assert.equal(await page.locator('#transitionParkScene').count(),0);assert.equal(await page.locator('#transitionStory').count(),0);
    const after=await page.evaluate(()=>JSON.parse(localStorage.ttWorld));assert.equal(Object.keys(after.residents.Guest.storytime.books).length,12);delete after.residents.Guest.storytime;assert.deepEqual(after,before,'Every non-Storytime world field must remain unchanged');
    assert.equal(await page.locator('.townmap').evaluate(el=>el.inert),false);assert.ok(await page.locator('.townmap .banklot').isVisible());
    results.push({engine,viewport,books:12,pages:120,recordedAudio:true,speechOrchestration:hasSpeech,storagePreserved:true});await ctx.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify(results,null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
