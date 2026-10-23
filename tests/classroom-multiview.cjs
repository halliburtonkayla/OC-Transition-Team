const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const repo=require('path').resolve(__dirname,'..')+'/';
// Minimal DOM adapter: channel lifecycle tests do not require a browser renderer.
class Element {
 constructor(){this.dataset={};this.style={};this.nodes=new Map();this.children=[];this.srcdoc='';this.textContent='';this.hidden=false;}
 querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,new Element());return this.nodes.get(selector)}
 append(el){this.children.push(el);el.parent=this;}remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}setAttribute(name,value){this[name]=value}
}
const screens=new Element(),document={createElement:()=>new Element(),getElementById:()=>screens,body:new Element()};
let clock=Date.now(),calls=[],peers=[];class Peer {constructor(opts){this.opts=opts;this.closed=false;peers.push(this)}async offer(){this.offered=true}async receive(kind,payload){this.received={kind,payload}}close(){this.closed=true}}
const context={document,crypto:require('crypto').webcrypto,console};vm.createContext(context);vm.runInContext(fs.readFileSync(repo+'assets/classroom-monitor/multiview.js','utf8').replace('export class ClassroomGrid','globalThis.ClassroomGrid=class ClassroomGrid'),context);
const sessions=['Kaylee','Olivia','Jaden'].map((student,i)=>({id:'s'+i,student,status:'active',mirror_allowed:i!==2,last_seen:new Date(clock).toISOString(),business:'cool-vibes',activity:'Making an order'}));
let open=null;const api=async(action,b)=>{calls.push({action,...b});return {signals:[],frame:null}};
const grid=new context.ClassroomGrid({root:document.getElementById('screens'),api,Mirror:{Peer},csp:()=>'<meta>',onOpen:id=>open=id,now:()=>clock,direct:true});
const tick=()=>new Promise(setImmediate);
(async()=>{
 grid.sync(sessions,{enabled:true,allow_snapshot_fallback:false});await tick();assert.equal(grid.tiles.size,3);assert.equal(peers.length,2);assert.equal(calls.filter(c=>c.action==='signal_teacher').length,2);assert.notEqual(peers[0].opts.channel,peers[1].opts.channel);
 peers[0].opts.onFrame({html:'<p>KAYLEE ONLY</p>',width:1280,height:800,at:clock});peers[1].opts.onFrame({html:'<p>OLIVIA ONLY</p>',width:1000,height:800,at:clock});assert.equal(grid.stats().live,2);assert.ok(grid.tiles.get('s0').frame.srcdoc.includes('KAYLEE ONLY'));assert.ok(!grid.tiles.get('s1').frame.srcdoc.includes('KAYLEE ONLY'));assert.equal(grid.tiles.get('s2').frame.srcdoc,'');
 grid.tiles.get('s0').el.querySelector('header button').onclick();assert.equal(open,'s0');
 grid.sync(sessions,{enabled:true});await tick();assert.equal(peers.length,2,'overview refresh preserves connected tiles');
 grid.pause();assert.equal(grid.stats().live,0);assert.ok(peers.every(p=>p.closed));assert.equal(grid.tiles.get('s0').frame.srcdoc,'');grid.sync(sessions,{enabled:true});assert.equal(peers.length,2,'pause prevents overview reconnect');grid.resume();await tick();assert.equal(peers.length,4);
 peers[2].opts.onFrame({html:'NEW',width:1000,height:800,at:clock});clock+=11000;await grid.poll();assert.equal(grid.tiles.get('s0').frame.srcdoc,'','stale frames hidden');
 grid.sync([sessions[1],sessions[2]],{enabled:true});assert.ok(!grid.tiles.has('s0'),'logout removes old tile');const old=peers[2];old.opts.onFrame({html:'LATE PRIVATE FRAME',width:1000,height:800,at:clock});assert.equal(old.closed,true,'late frames cannot reopen a removed session');
 sessions[1].status='paused';grid.sync([sessions[1],sessions[2]],{enabled:true});assert.equal(grid.tiles.get('s1').frame.srcdoc,'');assert.ok(grid.tiles.get('s1').label.textContent.includes('paused'));
 grid.destroy();assert.equal(grid.tiles.size,0);assert.ok(peers.every(p=>p.closed));const total=calls.length;await grid.poll();assert.equal(calls.length,total);
 const backup=new context.ClassroomGrid({root:document.getElementById('screens'),api,Mirror:{Peer,unpack:async()=>({html:'BACKUP',width:1280,height:800,at:clock})},csp:()=>'',onOpen(){},now:()=>clock,direct:false});const s={...sessions[0],last_seen:new Date(clock).toISOString()};backup.sync([s],{enabled:true,allow_snapshot_fallback:true});await tick();assert.equal(backup.tiles.get('s0').mode,'snapshot');assert.ok(calls.some(c=>c.payload?.transport==='snapshot'));backup.destroy();
 console.log('PASS multiview: separate live channels and frames, masked/off student excluded, enlarge, refresh preserves streams, stop/resume, stale clearing, logout, late frames, pause, cleanup and optional backup');
})().catch(e=>{console.error(e);process.exitCode=1});
