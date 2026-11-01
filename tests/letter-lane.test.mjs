import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORDS,MODES,letterChoices,newDrive,chooseLetter,withHelp,driveSummary,restoreDrive} from '../assets/letter-lane/core.mjs';
import {learningStore} from '../assets/learning/progress.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all picture words have three collectable letters; shuffled choices always include the target once',()=>{
 assert.equal(WORDS.length,12);assert.equal(WORDS[0].word,'jam');assert.equal(new Set(WORDS.map(w=>w.id)).size,12);
 for(const w of WORDS){assert.match(w.word,/^[a-z]{3}$/);for(let i=0;i<w.word.length;i++)for(let run=0;run<30;run++){const row=letterChoices(w.word,i);assert.equal(row.length,3);assert.equal(new Set(row).size,3);assert.equal(row.filter(c=>c===w.word[i]).length,1);}}
 assert.deepEqual(letterChoices('jam',3),[]);
});
test('wrong letters retain progress and stars; supported attempts remain distinct from independent practice',()=>{
 let d=newDrive('jam','match',false,'one');let result=chooseLetter(d,'j');d=result.drive;assert.equal(d.index,1);assert.equal(d.stars,3);assert.equal(result.answer.help,false);
 result=chooseLetter(d,'m');d=result.drive;assert.equal(result.answer.correct,false);assert.equal(d.index,1);assert.equal(d.stars,3);
 d=withHelp(d);d=chooseLetter(d,'a').drive;d=chooseLetter(d,'m').drive;
 assert.deepEqual(driveSummary(d),{word:'jam',mode:'match',letters:3,stars:9,attempts:4,retries:1,supportedLetters:1,complete:true});
 const completed=chooseLetter(d,'m');assert.equal(completed.accepted,false);assert.deepEqual(completed.drive,d);
});
test('every word completes in every mode, with truthful guidance records',()=>{
 for(const mode of Object.keys(MODES))for(const word of WORDS){let d=newDrive(word.id,mode,true,mode+word.id);for(const c of word.word)d=chooseLetter(d,c).drive;assert.equal(d.complete,true);assert.equal(d.stars,9);assert.equal(d.answers.length,3);assert.equal(driveSummary(d).supportedLetters,mode==='guided'?3:0);assert.deepEqual(restoreDrive(JSON.parse(JSON.stringify(d))),d);}
});
test('resume validates a complete prefix and rejects corrupt checkpoints and impossible rewards',()=>{
 let d=newDrive('jam','spell',false,'resume');d=chooseLetter(d,'x').drive;d=withHelp(d);d=chooseLetter(d,'j').drive;
 assert.deepEqual(restoreDrive(JSON.parse(JSON.stringify(d))),d);
 for(const bad of [null,{...d,wordId:'missing'},{...d,mode:'missing'},{...d,stars:99},{...d,index:3},{...d,complete:true},{...d,answers:[...d.answers,{index:2,letter:'m'}]},{...d,helped:[-1]}])assert.equal(restoreDrive(bad),null);
});
test('separate practice records are idempotent, isolated by player, and do not touch the town ledger',()=>{
 const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};
 const host={localStorage:storage(),sessionStorage:storage(),TTMonitor:{record:()=>{}}};host.sessionStorage.setItem('ttCurrent','QA Learner');host.localStorage.setItem('ttWorld','{"balance":4321}');
 const a=learningStore('letter-lane',host);a.append({id:'step',word:'jam'});a.append({id:'step',word:'bad'});a.checkpoint(newDrive());assert.equal(a.read().records.length,1);
 host.sessionStorage.setItem('ttCurrent','QA Other');assert.equal(a.append({id:'late'}),false);assert.equal(a.checkpoint({bad:true}),false);const b=learningStore('letter-lane',host);assert.equal(b.read().records.length,0);assert.equal(host.localStorage.getItem('ttWorld'),'{"balance":4321}');
 host.sessionStorage.setItem('ttCurrent','Guest');const guest=learningStore('letter-lane',host);guest.append({id:'guest'});assert.equal(host.localStorage.getItem('ttLearning:v1:Guest:letter-lane'),null);assert.equal(guest.read().records.length,1);
});
test('the school, CDC center, game zone, full catalogue and approved-device monitor recognize Letter Lane',()=>{
 for(const p of ['transition-town.html','cdc-center.html','game-zone.html','assets/school-directory/catalogue.mjs'])assert.ok(read(p).includes('letter-lane.html'),p);
 assert.equal(JSON.parse(read('docs/school-inventory.json')).pages.filter(p=>p.path==='letter-lane.html'&&p.room==='wow').length,1);
 assert.ok(read('assets/classroom-monitor/student.js').includes('|letter-lane|'));
 const html=read('letter-lane.html');for(const p of ['game.css','game.mjs','car.webp'])assert.ok(html.includes('assets/letter-lane/'+p));
 for(const p of ['game.css','game.mjs','core.mjs','pictures.mjs','landscape.webp','car.webp'])assert.ok(fs.statSync(new URL('../assets/letter-lane/'+p,import.meta.url)).size>0);
});
