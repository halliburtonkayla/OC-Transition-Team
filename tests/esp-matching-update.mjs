import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
class El {
 constructor(){this.children=[];this.dataset={};this.attrs={};this.events={};this.style={};this.classList={toggle(){}};this.open=false;this.hidden=false;}
 addEventListener(n,f){this.events[n]=f;} append(x){this.children.push(x);} replaceChildren(){this.children=[];}
 setAttribute(k,v){this.attrs[k]=v;} querySelectorAll(){return this.children;} querySelector(){return this.children.find(c=>c.attrs['aria-disabled']==='false');} focus(){}
 showModal(){this.open=true;} close(){this.open=false;this.events.close?.();}
}
const els=new Map(), get=id=>{if(!els.has(id))els.set(id,new El());return els.get(id)};
const callbacks=new Map();let timer=0, saved;
globalThis.document={getElementById:get,createElement:()=>new El(),hidden:false,addEventListener(){}};
globalThis.window={addEventListener(){}};globalThis.sessionStorage={getItem:()=>null,setItem:(_,s)=>saved=JSON.parse(s)};
globalThis.setTimeout=(f,ms)=>{callbacks.set(++timer,{f,ms});return timer};globalThis.clearTimeout=id=>callbacks.delete(id);
let src=fs.readFileSync('assets/extended-school-program/game.mjs','utf8').replace("'./core.mjs'",JSON.stringify(pathToFileURL(process.cwd()+'/assets/extended-school-program/core.mjs').href));
await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
const click=id=>get('board').children.find(c=>c.dataset.card===id).events.click();
const run=ms=>{for(const [id,t] of callbacks)if(t.ms===ms){callbacks.delete(id);t.f();return true}return false};
click('number-1');click('quantity-2');assert.equal(saved.phase,'handoff');assert.equal(get('match-party').children.length,0);click('number-3');assert.equal(saved.flipped.length,2);assert.ok(run(1300));assert.equal(saved.phase,'choose');assert.deepEqual(saved.flipped,[]);
click('number-1');click('quantity-1');assert.equal(get('match-party').children.length,150);assert.deepEqual(saved.matched,[1]);assert.ok(run(1300));assert.equal(saved.phase,'choose');assert.ok(run(2800));assert.equal(get('match-party').children.length,0);
click('number-2');click('quantity-3');get('teacher').events.click();assert.equal(run(1300),false);get('keep-board').events.click();assert.ok(run(1300));assert.equal(saved.phase,'choose');
for(let n=2;n<=6;n++){click('number-'+n);click('quantity-'+n);if(n<6)assert.ok(run(1300));}
assert.equal(saved.phase,'complete');assert.equal(get('match-party').children.length,150);assert.ok(run(5000));assert.equal(saved.level,1);assert.equal(get('board').children.length,16);
assert.ok(!fs.readFileSync('esp-number-match.html','utf8').includes('id="next-player"'));
console.log('PASS automatic mismatch/match turns, repeated click guard, 150-piece celebration/cleanup, dialog pause/resume, completion and 16-card progression, removed Next Player.');
