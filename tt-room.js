(function(){'use strict';
const URL='https://tyzpophjoptciihaszqj.supabase.co/functions/v1/town-room';
const ROOM='ttTownRoomCode',TEACHER='ttTownTeacherCode';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sessionKey=name=>'ttTownSession:'+name;
function code(){return sessionStorage.getItem(TEACHER)||localStorage.getItem(ROOM)||''}
async function call(action,extra={}){const r=await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,code:code(),...extra})});const data=await r.json();if(!r.ok)throw Error(data.error||'Connection problem');return data}
function join(value,teacher=false){const v=value.trim().toUpperCase();if(!v)return false;if(teacher)sessionStorage.setItem(TEACHER,v);else localStorage.setItem(ROOM,v);return true}
function forget(){sessionStorage.removeItem(TEACHER);localStorage.removeItem(ROOM)}
function leaveStudent(name){sessionStorage.removeItem(sessionKey(name));sessionStorage.removeItem(sessionKey(name)+':pair')}
let timer=null;
function openPhone(name,isTeacher,openSheet){
 if(timer)clearInterval(timer);
 if(!isTeacher)sessionStorage.removeItem(TEACHER);
 const teacher=!!sessionStorage.getItem(TEACHER),student=name!=='Guest'&&!isTeacher,self=teacher?'Miss Kayla':name;
 let selected={type:'contact',name:'Miss Kayla'},messages=[],groups=[],contacts=[],approved=false,pairCode='';
 const box='<h2>📱 Transition Town Phone</h2>'+
 (!code()?'<p>Enter the classroom town code to connect this device.</p><input class=field id=roomCode placeholder="Town code" autocapitalize=characters><button class=primary id=joinRoom>Join Town</button>':'<p>Connected to Transition Town. <button id=leaveRoom>Change code</button></p>')+
 (isTeacher&&!teacher?'<p>Miss Kayla: enter your private teacher code.</p><input class=field id=teacherCode type=password placeholder="Teacher code"><button class=primary id=joinTeacher>Open Teacher Phone</button>':'')+
 (code()?'<p id=roomStatus>Loading phone…</p><div id=phoneApproval></div><h3>Contacts</h3><div class=actions id=phoneContacts></div><h3>Groups</h3><div class=actions id=phoneGroups></div><h3 id=chatTitle>Miss Kayla</h3><div class=chat id=roomMessages></div><textarea class=field id=roomText placeholder="Write a message" maxlength=2000></textarea><button class=primary id=roomSend>Send Message</button>':'')+
 (teacher?'<p><a href="miss-kayla-inbox.html">All notifications and teacher controls →</a></p>':'')+
 '<p class=tiny>Private conversations are visible to their members and Miss Kayla. Guest can message Miss Kayla and see class announcements.</p>';
 openSheet(box);
 const $=id=>document.getElementById(id),token=()=>sessionStorage.getItem(sessionKey(name))||'';
 if($('joinRoom'))$('joinRoom').onclick=()=>{if(join($('roomCode').value))openPhone(name,isTeacher,openSheet)};
 if($('joinTeacher'))$('joinTeacher').onclick=()=>{if(join($('teacherCode').value,true))openPhone(name,isTeacher,openSheet)};
 if($('leaveRoom'))$('leaveRoom').onclick=()=>{forget();leaveStudent(name);openPhone(name,isTeacher,openSheet)};
 function title(){return selected.type==='group'?groups.find(g=>g.id===selected.id)?.title||'Group':selected.name}
 function drawMessages(){
  if(!$('roomMessages'))return;
  $('chatTitle').textContent=title();
  const shown=messages.filter(m=>selected.type==='group'?m.group_id===selected.id:!m.group_id&&(selected.name==='Everyone'?m.to_name==='Everyone':(m.from_name===selected.name&&m.to_name===self)||(m.from_name===self&&m.to_name===selected.name)));
  $('roomMessages').innerHTML=shown.length?shown.map(m=>'<div class=bubble><b>'+esc(m.from_name)+' → '+esc(m.to_name==='Group'?title():m.to_name)+'</b><br>'+esc(m.body)+'<br><small>'+esc(new Date(m.created_at).toLocaleString())+'</small></div>').join(''):'No messages here yet.';
  $('roomText').placeholder=selected.type==='group'?'Message this group':'Message '+title();
 }
 function drawContacts(){
  if(!$('phoneContacts'))return;
  $('phoneContacts').innerHTML='<button class=action data-contact="Everyone">📣 Everyone — announcements</button>'+contacts.filter(c=>c.name!==name).map(c=>'<button class=action data-contact="'+esc(c.extension)+'">'+esc(c.name)+' · '+esc(c.extension)+'</button>').join('')+'<p class=tiny>Guest is a visitor profile and has no private phone number.</p>';
  $('phoneContacts').querySelectorAll('[data-contact]').forEach(b=>b.onclick=()=>{let key=b.dataset.contact;selected={type:'contact',name:key==='Everyone'?'Everyone':contacts.find(c=>c.extension===key)?.name||'Miss Kayla'};drawMessages()});
  $('phoneGroups').innerHTML=groups.length?groups.map(g=>'<button class=action data-group="'+esc(g.id)+'">👥 '+esc(g.title)+'</button>').join(''):'<p class=tiny>No groups yet.</p>';
  $('phoneGroups').querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{selected={type:'group',id:b.dataset.group};drawMessages()});
 }
 async function approval(){
  if(!student||!$('phoneApproval'))return;
  if(!token()){$('phoneApproval').innerHTML='<div class=notice><b>Private messages</b><p>Ask Miss Kayla to approve this device so only you can open messages to your number.</p><button id=requestPhone>Request My Phone</button></div>';$('requestPhone').onclick=async()=>{try{let d=await call('request_access',{name});sessionStorage.setItem(sessionKey(name),d.token);sessionStorage.setItem(sessionKey(name)+':pair',d.pairCode);pairCode=d.pairCode;await approval()}catch(e){$('roomStatus').textContent=e.message}};return}
  try{let d=await call('access_status',{sessionToken:token()});approved=!!d.approved&&d.name===name;if(d.expired||d.name&&d.name!==name){leaveStudent(name);return approval()}
   $('phoneApproval').innerHTML=approved?'<div class=notice>✓ Your private phone is ready.</div>':'<div class=notice><b>Waiting for Miss Kayla</b><p>Show her your name and pairing code: <strong>'+esc(pairCode||sessionStorage.getItem(sessionKey(name)+':pair')||'')+'</strong></p><p class=tiny>Leave this phone open while she approves it.</p></div>';
  }catch(e){$('roomStatus').textContent=e.message}
 }
 async function refresh(){
  if(!$('roomMessages')){clearInterval(timer);return}
  try{let extra={name,sessionToken:token()};let [d,g,c]=await Promise.all([call('list',extra),call('groups',extra),call('directory')]);messages=d.messages;groups=g.groups;contacts=c.contacts;approved=!!d.verified;
   $('roomStatus').textContent=d.teacher?'Miss Kayla’s phone':approved?'Your private messages and class announcements':'Class announcements and messages to Miss Kayla';
   await approval();drawContacts();drawMessages()
  }catch(e){$('roomStatus').textContent=e.message}
 }
 if($('roomSend'))$('roomSend').onclick=async()=>{let b=$('roomSend'),value=$('roomText').value.trim();if(!value)return;
  if(selected.name==='Everyone'&&!teacher&&selected.type==='contact'){$('roomStatus').textContent='Only Miss Kayla can message everyone.';return}
  b.disabled=true;try{await call('send',{name,sessionToken:token(),body:value,to:selected.name,group_id:selected.type==='group'?selected.id:undefined});$('roomText').value='';await refresh()}catch(e){$('roomStatus').textContent=e.message}finally{b.disabled=false}};
 if(code()){refresh();timer=setInterval(()=>{if(!document.hidden)refresh()},8000)}
}
window.TTRoom={call,join,forget,code,esc,openPhone,leaveStudent};
})();
