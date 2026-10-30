// Checks the current checkout, never a cached file manifest. No production records are read.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(p=>fs.existsSync(p)&&/\.(html|css|m?js|cjs)$/.test(p)&&!p.startsWith('tests/')&&!p.startsWith('docs/'));
const missing=[],syntax=[],external=new Set();let references=0;
function reference(from,raw){
 if(!raw||/^(?:#|data:|blob:|javascript:|mailto:|tel:|\/\/)/i.test(raw))return;
 if(/^https?:/i.test(raw)){external.add(raw);return;}
 if(/[${}<>\\]/.test(raw))return;
 let target;try{target=decodeURIComponent(raw.split(/[?#]/)[0]);}catch{return;}
 if(!target||target.endsWith('/'))return;
 if(target.startsWith('/OC-Transition-Team/'))target=target.slice('/OC-Transition-Team/'.length);
 else if(target.startsWith('/'))return;
 else target=path.posix.join(path.posix.dirname(from),target);
 target=path.posix.normalize(target);if(target.endsWith('/'))target+='index.html';
 references++;if(!fs.existsSync(path.join(root,target)))missing.push({from,target});
}
for(const file of files){
 const text=fs.readFileSync(file,'utf8');
 if(file.endsWith('.html')){
  for(const m of text.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi))reference(file,m[1]);
  for(const [i,m] of [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
   if(!m[2].trim()||/type=["'](?:module|application\/ld\+json|application\/json)/i.test(m[1]))continue;
   try{new vm.Script(m[2],{filename:file+':script'+i});}catch(e){syntax.push({file,message:e.message});}
  }
 }
 if(/\.(?:m?js|cjs)$/.test(file)){
  try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch(e){syntax.push({file,message:String(e.stderr).slice(0,450)});}
  for(const m of text.matchAll(/(?:from\s*|import\s*\()\s*["'](\.[^"']+)["']/g))reference(file,m[1]);
 }
 if(file.endsWith('.css'))for(const m of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g))reference(file,m[1]);
}
const unique=[...new Map(missing.map(m=>[m.from+'|'+m.target,m])).values()];
const archived=p=>/^index(?:[-_(])/.test(p)||p==='INDEX_CHANGES.html'||p==='ADD-THIS-BUTTON.html';
const result={files:files.length,references,syntax,missing:unique,activeMissing:unique.filter(m=>!archived(m.from)),external:[...external]};
if(process.env.RELEASE_AUDIT_OUTPUT)fs.writeFileSync(process.env.RELEASE_AUDIT_OUTPUT,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,external:external.size},null,2));
if(syntax.length||result.activeMissing.length)process.exitCode=1;
