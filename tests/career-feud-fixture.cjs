// Isolated transport for the production Edge Function. No production network or credentials.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const C=new Function(read('supabase/functions/career-feud/core.js').replace(/export /g,'')+'\nreturn {createState,mutate,view'+(read('supabase/functions/career-feud/core.js').includes('function claimName')?',claimName':'')+'};')();
const BANK=new Function(read('supabase/functions/career-feud/questions.js').replace(/export /g,'')+'\nreturn BANK;')();
function fixture(){
 const tables={tt_career_feud_rooms:[],tt_teacher_access:[{email:'teacher@example.invalid'}]};
 let conflicts=0,forceConflict=0;
 async function transport(input,opts={}){
  const u=new URL(input),method=opts.method||'GET';
  if(u.pathname==='/auth/v1/user')return opts.headers.Authorization==='Bearer test-teacher'?Response.json({id:'teacher-test',email:'teacher@example.invalid',email_confirmed_at:'2026-01-01',is_anonymous:false}):Response.json({error:'No teacher'},{status:401});
  if(!u.pathname.startsWith('/rest/v1/'))throw Error('Unexpected fixture network: '+u.pathname);
  const table=u.pathname.slice('/rest/v1/'.length);if(!tables[table])throw Error('Unexpected fixture table '+table);
  let rows=tables[table].filter(row=>[...u.searchParams].every(([key,v])=>{
   if(['select','limit','order'].includes(key))return true;
   const [op,...parts]=v.split('.'),value=parts.join('.');
   if(op==='eq')return String(row[key])===value;
   if(op==='gt')return String(row[key])>value;
   if(op==='lt')return String(row[key])<value;
   if(op==='is')return value==='null'?row[key]==null:String(row[key])===value;
   throw Error('Unexpected fixture filter '+v);
  }));
  if(method==='GET')return Response.json(rows.slice(0,Number(u.searchParams.get('limit'))||undefined));
  if(method==='DELETE'){tables[table]=tables[table].filter(r=>!rows.includes(r));return Response.json(rows);}
  if(method==='POST'){
   const b=JSON.parse(opts.body);if(tables[table].some(r=>r.code===b.code))return Response.json({error:'Duplicate room'},{status:409});
   const r={team_hashes:[null,null],version:0,created_at:new Date().toISOString(),expires_at:new Date(Date.now()+86400e3).toISOString(),...b};tables[table].push(r);return Response.json([r]);
  }
  if(method==='PATCH'){
   if(forceConflict>0){forceConflict--;conflicts++;return Response.json([]);}
   if(!rows.length)conflicts++;
   const b=JSON.parse(opts.body);rows.forEach(r=>Object.assign(r,b));return Response.json(rows);
  }
  throw Error('Unexpected fixture method '+method);
 }
 let handler;
 const source=stripTypeScriptTypes(read('supabase/functions/career-feud/index.ts').replace(/^import[^\n]*\n/gm,''),{mode:'transform'});
 vm.runInNewContext(source,{console,...C,BANK,crypto,TextEncoder,Response,Request,URL,fetch:transport,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://fixture.invalid':'fixture-only-key'},serve:fn=>handler=fn}},{filename:'career-feud-index.ts'});
 async function call(body,authorization='',origin='https://halliburtonkayla.github.io'){
  const response=await handler(new Request('https://fixture.invalid/functions/v1/career-feud',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(authorization?{Authorization:authorization}:{})},body:JSON.stringify(body)}));
  return {status:response.status,body:await response.json()};
 }
 return {call,tables,get conflicts(){return conflicts},set forceConflict(n){forceConflict=n}};
}
module.exports={fixture,C,BANK};
