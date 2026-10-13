// Build a self-contained local demo; no teacher secret or shared-data access.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');const data=n=>'data:image/png;base64,'+fs.readFileSync(path.join(root,n)).toString('base64');
let html=read('student-business.html');let css=read('student-business/style.css');for(const img of ['team.png','cafe.png'])css=css.replaceAll('assets/'+img,data('student-business/assets/'+img));
let catalog=read('student-business/catalog.mjs').replace(/\bexport /g,'');for(const n of ['Ava.png','Eli.png','Marcus.png','Sofia.png'])catalog=catalog.replaceAll("'"+n+"'",JSON.stringify(data(n)));
const engine=read('student-business/engine.mjs').replace(/^import .*;\n/gm,'').replace(/\bexport /g,'');let app=read('student-business/app.mjs').replace(/^import .*;\n/gm,'');
app=app.replace("let teacherCode=sessionStorage.getItem('ttTownTeacherCode')||'',device=JSON.parse(sessionStorage.getItem(store)||'null')", "let teacherCode='',device=null");
app=app.replace("const API='https://tyzpophjoptciihaszqj.supabase.co/functions/v1/student-business';", "const API='';");
// Demo cannot contact the shared service even if a user finds the join form after locking.
app=app.replace("if(demo)return demoCall(action,data);", "if(demo)return demoCall(action,data);throw Error('This downloaded demonstration is local only. Use the town website after the release passes browser QA.');");
html=html.replace('<link rel="stylesheet" href="student-business/style.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="student-business/app.mjs"></script>',()=>'<script type="module">'+catalog+'\n'+engine+'\n'+app+'\nawait act({dataset:{act:"demo"}});\n</script>');
html=html.replaceAll('href="transition-town.html"','href="#"');html=html.replace('href="student-business/assets/original-ingredients.pdf"','href="#"');html=html.replace('Live classroom updates every 3 seconds. No student email or paid student account needed.','Local demonstration only. Shared Chromebook sessions require the tested website release.');
fs.writeFileSync(process.argv[2]||path.join(root,'student-business-demo.html'),html);console.log('Built self-contained local demonstration.');
