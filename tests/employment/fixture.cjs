/* Isolated PostgreSQL + actual Edge handler. Never contacts Supabase. */
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),{stripTypeScriptTypes}=require('node:module');
const {PGlite}=require(process.env.TT_PGLITE||'/tmp/tt-employment-qa/node_modules/@electric-sql/pglite');
async function fixture(){
 const db=new PGlite();await db.exec(`
 create role anon;create role authenticated;create role service_role;
 create table tt_monitor_devices(id uuid primary key default gen_random_uuid(),student text not null,school text default '',token_hash text unique,pair_code text,approved_at timestamptz,approved_by uuid,expires_at timestamptz,revoked_at timestamptz,created_at timestamptz default now(),last_seen timestamptz default now());
 create table tt_notifications(id uuid default gen_random_uuid(),source_id text primary key,kind text,applicant text,employer text,title text,body text,recipient text,details jsonb default '{}',created_at timestamptz default now());
 create table tt_job_decisions(source_id text primary key references tt_notifications(source_id),decision text,decided_at timestamptz);
 create table tt_phone_contacts(name text primary key,extension text);insert into tt_phone_contacts values('QA Student','9001'),('QA Other','9002'),('Miss Kayla','9000');
 create table student_accounts(full_name text,school_key text,enrollment_status text,pin_hash text,profile jsonb default '{}');
 create table tt_phone_groups(id uuid primary key,members text[]);
 create table tt_town_messages(id uuid primary key default gen_random_uuid(),from_name text,to_name text,body text,group_id uuid);
 create table tt_teacher_access(email text);insert into tt_teacher_access values('qa-teacher@example.invalid');
 create table tt_monitor_settings(id boolean primary key,enabled boolean,retention_days int);insert into tt_monitor_settings values(true,true,30);
 `);
 await db.exec(fs.readFileSync('docs/employment/proposed-schema.sql','utf8'));
 let handler;
 const query=async(path,method='GET',body,prefer='')=>{
  const u=new URL('http://fixture/'+path),table=u.pathname.split('/').pop();
  if(table==='tt_employment_command'){
   const b=body;try{return (await db.query('select tt_employment_command($1,$2,$3,$4) as result',[b.p_action,b.p_actor,b.p_command,b.p_payload])).rows[0].result;}catch(e){e.status=e.code==='PT409'?409:400;throw e;}
  }
  if(!/^[a-z_]+$/.test(table))throw Error('Invalid table');
  let values=[],where=[];const param=x=>{values.push(x);return '$'+values.length};
  for(let [key,v]of u.searchParams){if(['select','order','limit','offset','on_conflict'].includes(key))continue;if(key==='profile->>townSignIn')key="profile->>'townSignIn'";else if(!/^[a-z_]+$/.test(key))throw Error('Unexpected filter '+key);
   if(v==='is.null')where.push(key+' is null');else if(v==='not.is.null')where.push(key+' is not null');else if(v.startsWith('in.(')){const xs=v.slice(4,-1).split(',');where.push(key+' in ('+xs.map(param).join(',')+')');}else {const ix=v.indexOf('.'),op=v.slice(0,ix),value=v.slice(ix+1);const map={eq:'=',neq:'<>',gt:'>',gte:'>=',lt:'<',lte:'<=',like:'like'};if(!map[op])throw Error('Unexpected operator '+v);where.push(key+' '+map[op]+' '+param(op==='like'?value.replaceAll('*','%'):value));}}
  const condition=where.length?' where '+where.join(' and '):'';
  if(method==='GET'){let select=u.searchParams.get('select')||'*';if(!/^[a-z_,*]+$/.test(select))throw Error('Invalid select');let order=u.searchParams.get('order')||'';order=order? ' order by '+order.split(',').map(s=>s.replace('.asc',' asc').replace('.desc',' desc')).join(','):'';return (await db.query('select '+select+' from '+table+condition+order+' limit '+Number(u.searchParams.get('limit')||10000)+' offset '+Number(u.searchParams.get('offset')||0),values)).rows;}
  if(method==='PATCH'){const set=Object.entries(body).map(([k,v])=>k+'='+param(typeof v==='object'&&v!==null?JSON.stringify(v):v));return(await db.query('update '+table+' set '+set.join(',')+condition+' returning *',values)).rows;}
  if(method==='POST'){const arr=Array.isArray(body)?body:[body],out=[];for(const row of arr){const keys=Object.keys(row),vals=Object.values(row).map(v=>v&&typeof v==='object'?JSON.stringify(v):v);const conflict=prefer.includes('ignore-duplicates')?' on conflict do nothing':'';out.push(...(await db.query('insert into '+table+'('+keys.join(',')+') values('+keys.map((_,i)=>'$'+(i+1)).join(',')+')'+conflict+' returning *',vals)).rows);}return out;}
  throw Error('Unimplemented fixture method '+method);
 };
 const fetcher=async(url,opts={})=>{
  const u=new URL(url);if(u.hostname!=='fixture.invalid')throw Error('Blocked external request: '+u.hostname);
  if(u.pathname==='/auth/v1/user')return opts.headers.Authorization==='Bearer qa-teacher'?Response.json({id:'11111111-1111-4111-8111-111111111111',email:'qa-teacher@example.invalid',email_confirmed_at:new Date().toISOString()}):Response.json({error:'Unauthorized'},{status:401});
  if(u.pathname==='/functions/v1/town-room')return JSON.parse(opts.body).code==='QA-TEACHER'?Response.json({decisions:[]}):Response.json({error:'Unauthorized'},{status:403});
  if(u.pathname.includes('/rest/v1/')){try{const body=opts.body?JSON.parse(opts.body):undefined;const r=await query(u.pathname.replace('/rest/v1/','')+u.search,opts.method,body,opts.headers.Prefer);return Response.json(r);}catch(e){return Response.json({message:e.message,code:e.code},{status:e.status||400});}}
  throw Error('Blocked route '+url);
 };
 const context=vm.createContext({console,crypto:crypto.webcrypto,TextEncoder,Response,Request,URL,fetch:fetcher,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://fixture.invalid':'fixture-only-key'},serve:fn=>handler=fn},setTimeout,clearTimeout});
 for(const f of ['assets/classroom-monitor/core.js','assets/employment/core.js','assets/employment/questions.js','supabase/functions/classroom-monitor/employment.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
 vm.runInContext(stripTypeScriptTypes(fs.readFileSync('supabase/functions/classroom-monitor/index.ts','utf8').replace(/^import .*?;\n/,''),{mode:'transform'}),context);
 const call=async(action,b={},teacher=false)=>{const r=await handler(new Request('https://fixture.invalid/functions/v1/classroom-monitor',{method:'POST',headers:{'Content-Type':'application/json',...(teacher?{Authorization:'Bearer qa-teacher'}:{})},body:JSON.stringify({action,...b})}));return{status:r.status,...await r.json()};};
 const pair=async(student='QA Student',approve=true)=>{const d=await call('employment_pair',{student});if(d.status!==200)throw Error(JSON.stringify(d));if(approve)await db.query("update tt_monitor_devices set approved_at=now(),school='South Fulton High School' where id=$1",[d.device_id]);return{token:d.token,expected_student:student,...d};};
 return {db,call,pair,handler,query,close:()=>db.close()};
}
module.exports={fixture};
