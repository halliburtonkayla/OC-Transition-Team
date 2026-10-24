/* Integer-cents accounting and deterministic practice identities. No real credentials. */
(function(root){'use strict';
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const random=seed=>{let n=hash(seed);return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
function shuffle(a,seed){const r=random(seed),v=a.slice();for(let i=v.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return v}
const normalize=s=>String(s??'').toLowerCase().replace(/[^a-z0-9]/g,'');
const money=c=>(c/100).toLocaleString('en-US',{style:'currency',currency:'USD'});
const denominations=[5000,2000,1000,500,100,25,10,5,1];
const openingCounts={'5000':0,'2000':3,'1000':3,'500':4,'100':20,'25':40,'10':50,'5':80,'1':100};
const countDrawer=counts=>denominations.reduce((sum,d)=>sum+d*(Number(counts[d])||0),0);
function persona(actor,job,cycle=0){const h=hash(actor+job.id+cycle),last=['Brooks','Morgan','Reed','Ellis','Bennett','Parker','Hayes','Carter'][h%8],first=actor.replace(/[^a-zA-Z -]/g,'').split(' ')[0]||'Jordan';
 const streets=['Career Lane','Opportunity Avenue','Learning Drive','Maple Way','College Street','Town Square'];
 const variant=h%3,education={...job.education,school:job.level==='Entry'?['Transition Town High School','Opportunity Learning Center','Town Adult Learning Academy'][variant]:['Transition Technical College','Opportunity Career Institute','Transition Town University'][variant],year:2022+variant};
 if(job.level==='Entry'&&variant===2)education.qualification='High school equivalency diploma';
 const experience=job.experience.map((e,i)=>({...e,from:String(Number(e.from.slice(0,4))+variant)+e.from.slice(4),to:String(Number(e.to.slice(0,4))+variant)+e.to.slice(4),duties:[...e.duties]}));
 experience[0].title=job.roles[h%job.roles.length].title+' Intern';
 experience[0].duties=['Prepared assigned materials and records for '+job.roles[h%job.roles.length].title.toLowerCase()+'.','Used '+job.skills[0].toLowerCase()+' and '+job.skills[1].toLowerCase()+' skills, checked completed work, and reported discrepancies to a supervisor.'];
 const references=job.references.map(r=>({...r}));
 return {id:'TT-'+String(h%900000+100000),name:first+' '+last,actor,jobId:job.id,address:(100+h%800)+' '+streets[h%streets.length],city:'Transition Town',state:'TT',zip:'00000',phone:'202-555-'+String(100+h%100).padStart(4,'0'),email:(first+'.'+last+h%100).toLowerCase()+'@example.com',availability:'Monday–Friday, 8:00 AM–4:00 PM',startDate:'2026-11-02',education,experience,references,skills:job.skills,createdAt:new Date().toISOString()};
}
function assignment(actor,job,cycle=0){const roleIndex=hash(actor+':'+job.id+':'+cycle)%job.roles.length;return {jobId:job.id,roleIndex,title:job.roles[roleIndex].title,assignedAt:new Date().toISOString(),supervisor:'Jordan Ellis',shiftCode:'LAB-'+String(hash(actor+job.id+cycle)%9000+1000)}}
function newProject(actor,job,cycle=0){return {version:1,cycle,persona:persona(actor,job,cycle),resume:{},application:{},resumeComplete:false,applicationComplete:false,assignment:null,shift:null,events:[],createdAt:new Date().toISOString(),position:{x:500,y:615}}}
function newShift(project,job){const a=project.assignment;if(!a)throw Error('An application and assignment are required.');const role=job.roles[a.roleIndex];return {id:project.persona.id+'-'+Date.now(),jobId:job.id,roleIndex:a.roleIndex,startedAt:new Date().toISOString(),endedAt:null,activeSeconds:0,corrections:0,tasks:role.tasks.map((t,i)=>({index:i,type:t.type,startedAt:null,completedAt:null,attempts:0,corrections:0,state:{}}))}}
function completeTask(shift,index){const task=shift.tasks[index];if(!task||task.completedAt)return false;task.completedAt=new Date().toISOString();if(shift.tasks.every(t=>t.completedAt))shift.endedAt=task.completedAt;return true}
function canVisit(p,station){if(station==='id'||station==='careers')return true;if(!p?.persona)return false;if(station==='resume'||station==='portfolio')return true;if(station==='applications')return p.resumeComplete;return !!p.applicationComplete&&!!p.assignment}
function createTill(){return {opening:countDrawer(openingCounts),counts:{...openingCounts},cashSales:0,transactions:[]}}
function settle(till,total,tender,change){if(!Number.isInteger(total)||total<0||!Number.isInteger(tender)||tender<total)throw Error('Payment must cover the total.');
 if(denominations.some(d=>!Number.isInteger(Number(change[d]||0))||Number(change[d]||0)<0))throw Error('Choose whole, nonnegative counts of notes and coins.');
 if(countDrawer(change)!==tender-total)throw Error('Recount the change before handing it to the customer.');
 if(!denominations.includes(tender))throw Error('This practice customer pays with one displayed banknote.');
 const next={...till.counts};next[tender]=(next[tender]||0)+1;
 for(const d of denominations){next[d]-=Number(change[d]||0);if(next[d]<0)throw Error('There are not enough of those notes or coins in the drawer.');}
 till.counts=next;till.cashSales+=total;till.transactions.push({total,tender,change:countDrawer(change),at:new Date().toISOString()});return till;
}
function checkResume(p,r){const issues=[],same=(key,expected,label)=>{if(normalize(r[key])!==normalize(expected))issues.push(label)};same('name',p.name,'Use the full name on your practice ID.');same('address',p.address,'Check your practice street address.');same('phone',p.phone,'Check the practice phone number.');same('email',p.email,'Check the practice email address.');
 if((r.objective||'').trim().length<25)issues.push('Write a career objective of at least 25 characters.');
 if(!normalize(r.education).includes(normalize(p.education.qualification)))issues.push('Include the qualification from your background sheet.');
 if((r.experience||'').trim().length<60||!normalize(r.experience).includes(normalize(p.experience[0].employer)))issues.push('Include your most recent practice employer and at least two specific duties.');
 if((r.skills||'').trim().length<15)issues.push('Describe at least two skills for this career.');return issues;
}
function checkApplication(p,a){const issues=[];for(const [key,val] of Object.entries({name:p.name,address:p.address,city:p.city,phone:p.phone,email:p.email,employer:p.experience[0].employer,jobTitle:p.experience[0].title,reference:p.references[0].name,referencePhone:p.references[0].phone})){if(normalize(a[key])!==normalize(val))issues.push('Check '+({jobTitle:'previous job title',reference:'reference name',referencePhone:'reference phone'}[key]||key)+' against your practice background.');}
 if(a.from!==p.experience[0].from||a.to!==p.experience[0].to)issues.push('Use the employment dates on your background sheet.');
 if(!a.availability||!a.startDate)issues.push('Complete your availability and start date.');
 if((a.reason||'').trim().length<25)issues.push('Explain why you fit this job in at least 25 characters.');
 if(!a.certify)issues.push('Review the application and check the practice declaration.');return issues;
}
root.TTCareerCore={hash,random,shuffle,normalize,money,denominations,openingCounts,countDrawer,persona,assignment,newProject,newShift,completeTask,canVisit,createTill,settle,checkResume,checkApplication};
if(typeof module==='object')module.exports=root.TTCareerCore;
})(typeof window==='object'?window:globalThis);
