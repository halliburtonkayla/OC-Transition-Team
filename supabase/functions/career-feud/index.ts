import {BANK} from './questions.js';
import {createState,mutate,view} from './core.js';
const BASE=Deno.env.get('SUPABASE_URL')!,KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN='https://halliburtonkayla.github.io';
class Problem extends Error{constructor(public status:number,msg:string){super(msg)}}
const fail=(status:number,msg:string):never=>{throw new Problem(status,msg)};
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function db(path:string,method='GET',body?:unknown){
 const r=await fetch(BASE+'/rest/v1/'+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){console.error('Career Feud database status',r.status);fail(r.status===409?409:503,r.status===409?'Please retry; this room changed.':'The game connection is temporarily unavailable.');}
 return r.status===204?[]:await r.json();
}
async function teacher(req:Request){
 const bearer=req.headers.get('authorization')||'';
 if(/^Bearer tt-pin-[a-f0-9]{64}$/.test(bearer)){
  const h=await hash(bearer.slice(7));
  const rows=await db('tt_monitor_teacher_sessions?token_hash=eq.'+h+'&revoked_at=is.null&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&limit=1');
  const u=rows[0];if(!u)fail(401,'Enter your teacher passcode again.');
  const current=await db('tt_monitor_pin_settings?id=eq.true&teacher_id=eq.'+u.teacher_id+'&select=teacher_id');
  if(!current.length)fail(403,'Teacher access is unavailable.');return u.teacher_id;
 }
 const response=await fetch(BASE+'/auth/v1/user',{headers:{apikey:KEY,Authorization:bearer}});
 if(!response.ok)fail(401,'Unlock Host Game with your existing teacher passcode.');
 const u=await response.json();if(!u.id||!u.email_confirmed_at||u.is_anonymous)fail(403,'Approved teacher access required.');
 const allowed=await db('tt_teacher_access?email=eq.'+encodeURIComponent(String(u.email).toLowerCase())+'&select=email');
 if(!allowed.length)fail(403,'This account is not an approved teacher.');return u.id;
}
const codeOf=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
const validToken=(s:unknown)=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
Deno.serve(async req=>{
 const origin=req.headers.get('origin'),allowed=!origin||[ORIGIN,'http://localhost:4173','http://127.0.0.1:4173','http://terminal.local:4173'].includes(origin);
 const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':allowed?(origin||ORIGIN):ORIGIN,'Access-Control-Allow-Headers':'content-type, authorization, apikey','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
 const out=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers});
 if(!allowed)return out({error:'Origin not allowed.'},403);
 if(req.method==='OPTIONS')return new Response('',{headers});
 if(req.method==='GET')return out({service:'Transition Town Career Feud',version:1});
 if(req.method!=='POST')return out({error:'Use POST.'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>32000)fail(413,'Request too large.');
  const raw=await req.text();if(raw.length>32000)fail(413,'Request too large.');
  let b:any;try{b=JSON.parse(raw)}catch{fail(400,'Invalid request.')}
  const action=String(b.action||'');
  if(action==='create'){
   const teacherId=await teacher(req);
   if(!validToken(b.token))fail(400,'Create a new host session.');
   const h=await hash(b.token),prior=(await db('tt_career_feud_rooms?host_hash=eq.'+h+'&teacher_id=eq.'+teacherId+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&limit=1'))[0];
   if(prior)return out({code:prior.code,...view(prior.state,'host',Date.now(),prior.team_hashes.map(Boolean))});
   const recent=await db('tt_career_feud_rooms?teacher_id=eq.'+teacherId+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-3600000).toISOString())+'&select=code');
   if(recent.length>=20)fail(429,'Several rooms were recently created. Reopen your existing room.');
   // Remove expired game records only; other Town records are untouched.
   await db('tt_career_feud_rooms?expires_at=lt.'+encodeURIComponent(new Date().toISOString()),'DELETE');
   const s=createState(b,BANK,Date.now(),()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296);
   for(let i=0;i<4;i++){const code=codeOf();try{await db('tt_career_feud_rooms','POST',{code,teacher_id:teacherId,host_hash:h,state:s});return out({code,...view(s,'host',Date.now())});}catch(e){if(!(e instanceof Problem)||e.status!==409)throw e;}}
   fail(503,'Please try creating the room again.');
  }
  const code=String(b.code||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))fail(400,'Enter the six-character room code.');
  const tokenHash=validToken(b.token)?await hash(b.token):'';
  for(let attempt=0;attempt<12;attempt++){
   const row=(await db('tt_career_feud_rooms?code=eq.'+code+'&limit=1'))[0];
   if(!row||Date.parse(row.expires_at)<=Date.now())fail(404,'Room not found or expired. Check the code with your teacher.');
   const claimed=row.team_hashes.map(Boolean);
   if(action==='inspect')return out({code,phase:row.state.phase,teams:row.state.teams.map((t:any,i:number)=>({...t,available:!claimed[i]}))});
   if(!tokenHash)fail(401,'Rejoin using this device or ask the host to release your team seat.');
   let role:any=row.host_hash===tokenHash?'host':row.team_hashes.indexOf(tokenHash);
   let state=row.state,hashes=[...row.team_hashes];
   if(action==='join'){
    if(role==='host')fail(403,'Use a separate laptop for each team.');
    const team=Number(b.team);if(team!==0&&team!==1)fail(400,'Choose one of the two teams.');
    if(role!==-1&&role!==team)fail(409,'This device already belongs to the other team.');
    if(hashes[team]&&hashes[team]!==tokenHash)fail(409,'That team is already on another laptop. Choose your assigned team or ask the host to release the seat.');
    if(state.phase==='ended'&&role===-1)fail(409,'This session has ended.');
    role=team;hashes[team]=tokenHash;state=mutate(state,role,{action:'heartbeat'},Date.now());
   }else{
    if(role===-1)fail(401,'This device is not assigned to the room. Rejoin or ask the teacher to release the seat.');
    if(action==='state')return out({code,...view(state,role,Date.now(),claimed)});
    // Every write is bound to the authenticated capability, never a role supplied by the client.
    state=mutate(state,role,b,Date.now());
    if(action==='release'&&role==='host')hashes[Number(b.team)]=null;
   }
   const rows=await db('tt_career_feud_rooms?code=eq.'+code+'&version=eq.'+row.version,'PATCH',{state,team_hashes:hashes,version:row.version+1});
   if(rows.length)return out({code,...view(state,role,Date.now(),hashes.map(Boolean))});
  }
  fail(409,'The room is busy. Retry your action; saved answers are safe.');
 }catch(e){const status=e instanceof Problem?e.status:400;return out({error:e instanceof Error?e.message:'Game request failed.'},status);}
});
