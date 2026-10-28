import fs from 'node:fs';
import {LESSONS,worksheet} from '../../assets/watch-learn/lessons.mjs';
import {MISSIONS} from '../../assets/job-missions/model.mjs';
import {icon} from '../../assets/job-missions/art.mjs';
const icons={};for(const l of LESSONS)for(const q of worksheet(l))for(const id of [q.picture,q.distractor])icons[id]=icon(id);
for(const m of MISSIONS)for(const [id] of m.steps)icons[id]=icon(id);
fs.mkdirSync('tmp/pdfs',{recursive:true});fs.writeFileSync('tmp/pdfs/content.json',JSON.stringify({lessons:LESSONS.map(l=>({...l,questions:worksheet(l)})),missions:MISSIONS,icons}));
