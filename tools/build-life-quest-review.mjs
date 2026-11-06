// Build an offline, fictional review copy from the actual branch implementation.
// npm install --prefix /tmp/life-quest-qa --no-save esbuild@0.25.12
// LIFE_QUEST_ESBUILD=/tmp/life-quest-qa/node_modules/esbuild node tools/build-life-quest-review.mjs --out /absolute/path/Life_Quest_Private_Review.html
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),{build}=require(process.env.LIFE_QUEST_ESBUILD||'esbuild');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=process.argv[process.argv.indexOf('--out')+1];
if(!process.argv.includes('--out')||!path.isAbsolute(out||''))throw Error('Supply --out with an absolute HTML filename.');
const assets=new Map();
async function dataURL(file){
 file=path.resolve(file);if(!assets.has(file)){
  const bytes=await fs.readFile(file),type={'.png':'image/png','.webp':'image/webp'}[path.extname(file)];
  if(!type)throw Error('Unsupported inline asset: '+file);assets.set(file,'data:'+type+';base64,'+bytes.toString('base64'));
 }return assets.get(file);
}
const result=await build({entryPoints:[path.join(root,'assets/life-quest/app.mjs')],bundle:true,format:'iife',target:['es2022'],write:false,minify:true,define:{'globalThis.LIFE_QUEST_REVIEW':'true'},plugins:[{name:'offline-art',setup(b){
 b.onLoad({filter:/\.mjs$/},async args=>{
  if(args.path.endsWith('/life-quest/profile.mjs'))return {contents:'export const currentStudent=()=>"Fictional Explorer";export const profileFor=()=>{throw Error("Profiles are unavailable in fictional review")};',loader:'js'};
  let source=await fs.readFile(args.path,'utf8');
  if(args.path.endsWith('/life-quest/app.mjs'))source=source.replace(/if\(!practice\)\{const script=document\.createElement\('script'\);script\.src='assets\/classroom-monitor\/student\.js[^']*';document\.body\.append\(script\);\}/,'');
  const matches=[...source.matchAll(/(['"])([^'"\n]+\.(?:png|webp))\1/g)];
  for(const match of matches){const ref=match[2],file=ref.startsWith('assets/')?path.join(root,ref):path.resolve(path.dirname(args.path),ref);source=source.replaceAll(match[0],JSON.stringify(await dataURL(file)));}
  source=source.replaceAll('import.meta.url',JSON.stringify('https://offline.invalid/'));
  return {contents:source,loader:'js'};
 });
}}]});
let html=await fs.readFile(path.join(root,'transition-mission-2.html'),'utf8');
for(const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]){
 const file=path.join(root,match[1]);let css=await fs.readFile(file,'utf8');
 for(const url of [...css.matchAll(/url\(['"]?([^)'" ]+)['"]?\)/g)])css=css.replaceAll(url[0],`url("${await dataURL(path.resolve(path.dirname(file),url[1]))}")`);
 html=html.replace(match[0],'<style>'+css+'</style>');
}
html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
html=html.replace('<body>','<body><aside class="preview-banner">PRIVATE OFFLINE REVIEW <span>Fictional practice · all 20 missions · no classroom connection</span></aside>');

html=html.replace(/href="(?:transition-town|school-directory|transition-mission|classroom-monitor)[^"]*"/g,'href="#main"');
html=html.replace('To customize, return to Town and choose <b>Edit My Character</b>. Save there only when you want to change your profile; reopen Life Quest to load the change.','This disconnected review uses a fictional customizable character. Classroom play reads each student’s saved Town customization.');
html=html.replace(/<footer class="page-footer">[\s\S]*?<\/footer>/,'<footer class="page-footer"><span>Transition Mission 2.0 · Fictional practice only · use My Progress to print your practice results.</span></footer>');
html=html.replace(' <div id="print-area"></div>',' <div id="print-area"></div><script>globalThis.LIFE_QUEST_REVIEW=true;</script>');
const bundle=result.outputFiles[0].text;
if(/https:\/\/(?!offline\.invalid)/.test(bundle)||/classroom-monitor\/student\.js/.test(bundle))throw Error('Offline bundle retained a network or classroom dependency.');
const sourceHash=createHash('sha256').update(bundle).digest('hex');
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
html=html.replace('</body>',`<script>try{${bundle.replaceAll('</script','<\\/script')}document.documentElement.dataset.lifeQuestReady='true';}catch(error){document.documentElement.dataset.lifeQuestReady='false';const notice=document.createElement('p');notice.className='boot-notice';notice.setAttribute('role','alert');notice.textContent='The practice copy could not start. Open this downloaded HTML file in a current desktop browser. '+String(error.message||error).slice(0,200);document.body.prepend(notice);}</script></body>`);
html=html.replace('</head>',`<meta name="life-quest-review-source" content="${commit}"><meta name="life-quest-review-sha256" content="${sourceHash}"></head>`);
await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,html);
console.log(JSON.stringify({file:out,bytes:Buffer.byteLength(html),assets:assets.size,source_commit:commit,bundle_sha256:sourceHash}));
