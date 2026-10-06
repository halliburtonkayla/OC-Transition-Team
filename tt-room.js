(function(){'use strict';
const URL='https://tyzpophjoptciihaszqj.supabase.co/functions/v1/town-room';
const ROOM='ttTownRoomCode',TEACHER='ttTownTeacherCode';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function code(){return sessionStorage.getItem(TEACHER)||localStorage.getItem(ROOM)||''}
async function call(action,extra={}){const r=await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,code:code(),...extra})});const data=await r.json();if(!r.ok)throw Error(data.error||'Connection problem');return data}
function join(value,teacher=false){const v=value.trim().toUpperCase();if(!v)return false;if(teacher)sessionStorage.setItem(TEACHER,v);else localStorage.setItem(ROOM,v);return true}
function forget(){sessionStorage.removeItem(TEACHER);localStorage.removeItem(ROOM)}
let timer=null;
function openPhone(name,isTeacher,openSheet){if(timer)clearInterval(timer);const teacher=!!sessionStorage.getItem(TEACHER);const box='<h2>📱 Transition Town Phone</h2>'+
 (!code()?'<p>Enter the Transition Town code Miss Kayla gave your class. Use the same code on any phone, iPad, or computer.</p><input class=field id=roomCode placeholder="Town code" autocapitalize=characters><button class=primary id=joinRoom>Join Town</button>':'<p>Connected to the shared town. <button id=leaveRoom>Change code</button></p>')+
 (isTeacher&&!teacher?'<p>Miss Kayla: enter your private teacher code to read all messages.</p><input class=field id=teacherCode type=password placeholder="Teacher code"><button class=primary id=joinTeacher>Open Teacher Inbox</button>':'')+
 (code()?'<p id=roomStatus>Loading messages…</p><div class=chat id=roomMessages></div><textarea class=field id=roomText placeholder="Message to Miss Kayla" maxlength=2000></textarea><button class=primary id=roomSend>Send to Miss Kayla</button>':'')+
 (teacher?'<p><a href="miss-kayla-inbox.html">Open all notifications and send to everyone →</a></p>':'')+
 '<p class=tiny>Messages are shared across devices and monitored by Miss Kayla.</p>';
 openSheet(box);
 const $=id=>document.getElementById(id);
 if($('joinRoom'))$('joinRoom').onclick=()=>{if(join($('roomCode').value))openPhone(name,isTeacher,openSheet)};
 if($('joinTeacher'))$('joinTeacher').onclick=()=>{if(join($('teacherCode').value,true))openPhone(name,isTeacher,openSheet)};
 if($('leaveRoom'))$('leaveRoom').onclick=()=>{forget();openPhone(name,isTeacher,openSheet)};
 async function refresh(){if(!$('roomMessages')){clearInterval(timer);return}try{const d=await call('list',{name});$('roomStatus').textContent=d.teacher?'Teacher view — all town phone messages':'Messages to Miss Kayla and class announcements';$('roomMessages').innerHTML=d.messages.length?d.messages.map(m=>'<div class=bubble><b>'+esc(m.from_name)+' → '+esc(m.to_name)+'</b><br>'+esc(m.body)+'<br><small>'+esc(new Date(m.created_at).toLocaleString())+'</small></div>').join(''):'No messages yet.'}catch(e){$('roomStatus').textContent=e.message}}
 if($('roomSend'))$('roomSend').onclick=async()=>{let b=$('roomSend'),value=$('roomText').value.trim();if(!value)return;b.disabled=true;try{await call('send',{name,body:value});$('roomText').value='';await refresh()}catch(e){$('roomStatus').textContent=e.message}finally{b.disabled=false}};
 if(code()){refresh();timer=setInterval(()=>{if(!document.hidden)refresh()},8000)}
}
window.TTRoom={call,join,forget,code,esc,openPhone};
})();
