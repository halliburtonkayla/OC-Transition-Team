(function(){'use strict';
const $=id=>document.getElementById(id),esc=TTRoom.esc;let rows=[],working=false,contacts=[];
function status(s){$('status').textContent=s}
function render(){
 const f=$('filter').value,filtered=rows.filter(r=>f==='all'||r.kind===f);
 $('notifications').innerHTML=filtered.length?filtered.map(r=>'<article class="card '+(!r.read_at?'unread':'')+'"><b>'+esc(r.applicant)+' — '+esc(r.title)+'</b><p class="body">'+esc(r.body)+'</p><small>'+esc(r.employer)+' • '+esc(new Date(r.created_at).toLocaleString())+'</small>'+(r.details&&Object.keys(r.details).length?'<details><summary>Application or message details</summary>'+Object.entries(r.details).filter(([k])=>k!=='id').map(([k,v])=>'<div><b>'+esc(k.replace(/_/g,' '))+':</b> '+esc(typeof v==='object'?JSON.stringify(v):v)+'</div>').join('')+'</details>':'')+(!r.read_at?'<p><button data-read="'+esc(r.id)+'">Mark Read</button></p>':'')+'</article>').join(''):'<p>No notifications in this category yet.</p>';
 $('notifications').querySelectorAll('[data-read]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await TTRoom.call('read',{id:b.dataset.read});await refresh()}catch(e){status(e.message);b.disabled=false}});
}
async function refresh(){
 if(working)return;working=true;
 try{
  const [n,m,p,d,g]=await Promise.all([TTRoom.call('notifications'),TTRoom.call('list',{name:'Miss Kayla'}),TTRoom.call('pending'),TTRoom.call('directory'),TTRoom.call('groups')]);
  $('gate').hidden=true;$('inbox').hidden=false;rows=n.notifications;render();contacts=d.contacts;
  $('messages').innerHTML=m.messages.length?m.messages.slice().reverse().map(x=>'<article class="card"><b>'+esc(x.from_name)+' → '+esc(x.to_name==='Group'?'Group':x.to_name)+'</b><p class="body">'+esc(x.body)+'</p><small>'+esc(new Date(x.created_at).toLocaleString())+'</small></article>').join(''):'<p>No town phone messages yet.</p>';
  $('pending').innerHTML=p.pending.length?p.pending.map(x=>'<div class="card"><b>'+esc(x.name)+'</b> — pairing code <strong>'+esc(x.pair_code)+'</strong><br><button data-approve="'+esc(x.id)+'">Approve This Device</button></div>').join(''):'<p>No students waiting for approval.</p>';
  $('pending').querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await TTRoom.call('approve',{id:b.dataset.approve});await refresh();status('Student phone approved.')}catch(e){status(e.message);b.disabled=false}});
  if(!$('members').hasChildNodes())$('members').innerHTML=contacts.filter(c=>c.name!=='Miss Kayla').map(c=>'<label style="display:inline-block;margin:6px 12px 6px 0"><input type="checkbox" value="'+esc(c.name)+'"> '+esc(c.name)+' · '+esc(c.extension)+'</label>').join('');
  $('groupList').innerHTML=g.groups.length?'<h3>Existing groups</h3>'+g.groups.map(x=>'<p><b>'+esc(x.title)+'</b>: '+x.members.map(esc).join(', ')+'</p>').join(''):'<p>No groups yet.</p>';
  status('Updated '+new Date().toLocaleTimeString());
 }catch(e){status(e.message);if(/code/i.test(e.message)){$('inbox').hidden=true;$('gate').hidden=false}}finally{working=false}
}
$('enter').onclick=()=>{if(TTRoom.join($('teacherCode').value,true))refresh()};
$('teacherCode').onkeydown=e=>{if(e.key==='Enter')$('enter').click()};
$('refresh').onclick=refresh;$('filter').onchange=render;
$('exit').onclick=()=>{TTRoom.forget();$('inbox').hidden=true;$('gate').hidden=false;status('Inbox locked.')};
$('send').onclick=async()=>{let b=$('send'),value=$('broadcast').value.trim();if(!value)return;b.disabled=true;try{await TTRoom.call('send',{body:value,to:'Everyone'});$('broadcast').value='';await refresh();status('Sent to everyone in Transition Town.')}catch(e){status(e.message)}finally{b.disabled=false}};
$('createGroup').onclick=async()=>{const title=$('groupTitle').value.trim(),members=[...$('members').querySelectorAll('input:checked')].map(x=>x.value);try{await TTRoom.call('create_group',{title,members});$('groupTitle').value='';$('members').querySelectorAll('input').forEach(x=>x.checked=false);await refresh();status('Group created. Members can open it on their approved phones.')}catch(e){status(e.message)}};
const category=new URLSearchParams(location.search).get('category');if([...$('filter').options].some(x=>x.value===category))$('filter').value=category;
if(sessionStorage.getItem('ttTownTeacherCode'))refresh();
setInterval(()=>{if(!document.hidden&&!$('inbox').hidden)refresh()},10000);
})();
