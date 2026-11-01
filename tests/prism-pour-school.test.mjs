import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FEATURED} from '../assets/school-directory/catalogue.mjs';
import {createProfileStorage} from '../assets/prism-pour/town-profile.mjs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
function fakeStorage(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),map:m};}
function host(){return {localStorage:fakeStorage(),sessionStorage:fakeStorage()};}

test('Prism Pour is visible on the first WOW Zone shelf and both school game entrances',()=>{
 assert.ok(FEATURED.wow.slice(0,8).some(([url])=>url==='prism-pour.html'));
 for(const file of ['transition-town.html','game-zone.html'])assert.ok(read(file).includes('prism-pour.html'),file);
 const inventory=JSON.parse(read('docs/school-inventory.json'));assert.equal(inventory.pages.find(p=>p.path==='prism-pour.html').room,'wow');
});

test('the school game and worker use repository-local assets and retain their return route',()=>{
 const html=read('prism-pour.html');assert.ok(html.includes('transition-town.html?school=1'));assert.ok(html.includes('school-directory.html?room=wow'));
 assert.ok(!html.includes('chatgpt.site'));assert.ok(!html.includes('http://terminal.local'));
 for(const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){const path=match[1].split(/[?#]/)[0];if(!path||path.startsWith('data:'))continue;assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)),path);}
 const app=read('assets/prism-pour/app.mjs');assert.ok(app.includes("new Worker(new URL('./solver.mjs',import.meta.url)"));assert.ok(fs.existsSync(new URL('../assets/prism-pour/solver.mjs',import.meta.url)));
});

test('Town profiles keep separate game and report records without touching financial data',()=>{
 const h=host();h.localStorage.setItem('ttWorld','{"balance":1234}');h.sessionStorage.setItem('ttCurrent','Student A');const a=createProfileStorage(h);
 a.setItem('game','A-progress');a.setItem('reports','A-report');
 h.sessionStorage.setItem('ttCurrent','Student B');const b=createProfileStorage(h);assert.equal(b.getItem('game'),null);assert.equal(b.getItem('reports'),null);b.setItem('game','B-progress');
 assert.throws(()=>a.setItem('reports','B-overwrite'));
 h.sessionStorage.setItem('ttCurrent','Student A');const again=createProfileStorage(h);assert.equal(again.getItem('game'),'A-progress');assert.equal(again.getItem('reports'),'A-report');
 assert.equal(h.localStorage.getItem('ttWorld'),'{"balance":1234}');assert.ok(!h.localStorage.getItem('prism-pour:v1'));
});

test('guest and teacher practice use tab storage; shared monitoring keeps its existing controls',()=>{
 for(const identity of ['Guest','Miss Kayla']){const h=host();h.sessionStorage.setItem('ttCurrent',identity);const profile=createProfileStorage(h);profile.setItem('reports','example');assert.equal(profile.namedStudent,false);assert.equal(h.localStorage.map.size,0);assert.equal(profile.getItem('reports'),'example');}
 const source=read('assets/classroom-monitor/student.js');assert.ok(source.includes('transition-town|prism-pour|letter-lane|'));assert.ok(source.includes("if(!d.approved)"));assert.ok(source.includes("if(!session||paused||stopped||!cfg?.enabled||name()!==student)return;"));
 const html=read('prism-pour.html');assert.ok(html.includes('data-monitor-private id="reportDialog"'));assert.ok(html.includes('data-monitor-private id="sessionSetup"'));
});
