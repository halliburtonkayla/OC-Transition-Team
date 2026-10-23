/* Independent, authenticated Town-only live channels. No historical frames are retained. */
export class ClassroomGrid {
 constructor({root,api,Mirror,csp,onOpen,onUpdate=()=>{},now=()=>Date.now(),direct=!!globalThis.RTCPeerConnection}) {
  Object.assign(this,{root,api,Mirror,csp,onOpen,onUpdate,now,direct});this.tiles=new Map();this.running=true;this.closed=false;this.settings={};
  this.resize=globalThis.ResizeObserver?new ResizeObserver(()=>{for(const t of this.tiles.values())this.scale(t)}):null;this.resize?.observe(root);
 }
 current(t,ch=t.channel){return !this.closed&&this.running&&this.tiles.get(t.session.id)===t&&t.channel===ch}
 eligible(s){return this.settings.enabled&&!s.ended_at&&s.status==='active'&&s.mirror_allowed&&this.now()-Date.parse(s.last_seen)<50000}
 label(t,text){t.el.dataset.live=String(!!t.lastFrame);t.label.textContent=text;this.onUpdate(this.stats())}
 stats(){return {students:this.tiles.size,live:[...this.tiles.values()].filter(t=>t.lastFrame&&this.now()-t.lastFrame<10000).length,running:this.running}}
 card(s){
  const el=document.createElement('article');el.className='monitor-tile';
  el.innerHTML='<header><div><h3></h3><p class="monitor-tile-place"></p></div><button type="button" class="secondary">Enlarge ↗</button></header><div class="monitor-tile-viewport"><iframe sandbox="" referrerpolicy="no-referrer"></iframe><button type="button" class="monitor-tile-open"></button><p class="monitor-tile-empty">Waiting for a current Town frame…</p></div><div class="monitor-tile-status" role="status"></div><p class="monitor-tile-activity"></p>';
  el.querySelector('h3').textContent=s.student;
  const frame=el.querySelector('iframe'),open=()=>this.onOpen(s.id);frame.title='Live Transition Town view · '+s.student;
  el.querySelector('header button').onclick=open;const overlay=el.querySelector('.monitor-tile-open');overlay.onclick=open;overlay.setAttribute('aria-label','Enlarge '+s.student+'’s Town screen');
  const t={session:s,el,frame,box:el.querySelector('.monitor-tile-viewport'),empty:el.querySelector('.monitor-tile-empty'),label:el.querySelector('.monitor-tile-status'),channel:'',peer:null,mode:'',since:'',seen:new Set(),lastFrame:0,started:0,renew:0,retries:0,polling:false,nextTry:0};this.root.append(el);return t;
 }
 sync(sessions,settings){
  if(this.closed)return;this.settings=settings;const ids=new Set(sessions.map(s=>s.id));
  for(const [id,t] of this.tiles)if(!ids.has(id)){this.tiles.delete(id);this.disconnect(t);t.el.remove()}
  for(const s of sessions){let t=this.tiles.get(s.id);if(!t){t=this.card(s);this.tiles.set(s.id,t)}t.session=s;
   t.el.querySelector('.monitor-tile-place').textContent=s.business||s.page||'Town map';t.el.querySelector('.monitor-tile-activity').textContent=s.activity||'Connected to Town';
   if(!this.running||!this.eligible(s)){this.disconnect(t);this.label(t,!this.running?'Grid viewing stopped':!settings.enabled?'Recording is off':s.status==='paused'?'Student paused recording':'Live view off or Town tab in background');}
   else if(t.mode==='snapshot'&&!settings.allow_snapshot_fallback){this.disconnect(t);t.nextTry=0;}
   if(this.running&&this.eligible(s)&&!t.channel&&this.now()>=t.nextTry)this.connect(t).catch(e=>this.fail(t,e));
  }this.onUpdate(this.stats());
 }
 clear(t){t.lastFrame=0;t.frame.srcdoc='';t.frame.hidden=true;t.empty.hidden=false;t.dimensions=null;}
 disconnect(t,notify=true){const ch=t.channel;t.channel='';t.peer?.close();t.peer=null;t.mode='';this.clear(t);if(notify&&ch)this.api('revoke_view',{session_id:t.session.id,channel:ch}).catch(()=>{});}
 fail(t,e){if(this.closed||this.tiles.get(t.session.id)!==t)return;this.disconnect(t);t.nextTry=this.now()+30000;this.label(t,e.status===401||e.status===403?'View unavailable · check connection or teacher sign-in':'Connection interrupted · retrying shortly');}
 async connect(t,snapshot=false){
  if(!this.running||this.closed||!this.eligible(t.session))return;this.disconnect(t);const ch=crypto.randomUUID();t.channel=ch;t.mode=snapshot?'snapshot':'direct';t.since='';t.seen.clear();t.started=t.renew=this.now();t.nextTry=0;
  this.label(t,snapshot?'Connecting · secure snapshots (~3s)':'Connecting live Town mirror…');
  if(!snapshot&&!this.direct){if(this.settings.allow_snapshot_fallback)return this.connect(t,true);this.disconnect(t);t.nextTry=Infinity;return this.label(t,'Direct live view is unavailable in this browser');}
  if(!snapshot)t.peer=new this.Mirror.Peer({channel:ch,signal:body=>this.current(t,ch)?this.api('signal_teacher',{session_id:t.session.id,...body}):Promise.resolve(),onFrame:f=>this.render(t,ch,f,'LIVE · direct Town mirror'),onStatus:status=>{if(this.current(t,ch)&&['failed','disconnected','closed'].includes(status)){this.clear(t);this.label(t,'Live connection interrupted · reconnecting…')}}});
  try{await this.api('signal_teacher',{session_id:t.session.id,channel:ch,kind:'request',...(snapshot?{payload:{transport:'snapshot'}}:{})});if(!this.current(t,ch)){this.api('revoke_view',{session_id:t.session.id,channel:ch}).catch(()=>{});return}if(!snapshot)await t.peer?.offer();}catch(e){if(this.current(t,ch))this.fail(t,e)}
 }
 render(t,ch,f,label){if(!this.current(t,ch)||!this.eligible(t.session))return;t.lastFrame=this.now();t.retries=0;t.dimensions={width:Math.min(10000,Math.max(200,f.width)),height:Math.min(10000,Math.max(200,f.height))};t.frame.hidden=false;t.empty.hidden=true;this.scale(t);t.frame.srcdoc='<!doctype html>'+this.csp()+f.html;this.label(t,label+' · '+new Date(f.at).toLocaleTimeString());}
 scale(t){if(!t.dimensions)return;const {width,height}=t.dimensions,scale=Math.min((t.box.clientWidth||360)/width,(t.box.clientHeight||225)/height);Object.assign(t.frame.style,{width:width+'px',height:height+'px',transform:'scale('+scale+')'});}
 async pollTile(t){
  const ch=t.channel;if(!ch||t.polling||!this.current(t,ch))return;t.polling=true;
  try{
   if(t.lastFrame&&this.now()-t.lastFrame>10000){this.clear(t);this.label(t,'Waiting for a current Town frame · stale view hidden');}
   if(t.mode==='snapshot'){
    if(this.now()-t.renew>30000){await this.api('signal_teacher',{session_id:t.session.id,channel:ch,kind:'request',payload:{transport:'snapshot'}});if(!this.current(t,ch))return;t.renew=this.now();}
    const r=await this.api('view_snapshot',{session_id:t.session.id,channel:ch});if(!this.current(t,ch))return;
    if(r.frame&&r.frame.at!==t.snapshotAt){const f=await this.Mirror.unpack(r.frame.payload);if(!this.current(t,ch))return;t.snapshotAt=r.frame.at;this.render(t,ch,f,'LIVE · secure snapshots (~3s)');}
   }else if(!t.lastFrame||this.now()-t.lastFrame>5000){
    const r=await this.api('signals_teacher',{session_id:t.session.id,since:t.since});if(!this.current(t,ch))return;
    for(const x of r.signals){if(x.channel!==ch||t.seen.has(x.id))continue;t.seen.add(x.id);t.since=x.created_at;await t.peer?.receive(x.kind,x.payload);}
   }
   if(this.current(t,ch)&&this.now()-(t.lastFrame||t.started)>20000){
    if(t.mode==='direct'&&this.settings.allow_snapshot_fallback){t.snapshotAt='';return await this.connect(t,true)}
    if(t.retries<2){t.retries++;return await this.connect(t,t.mode==='snapshot')}
    this.disconnect(t);t.nextTry=this.now()+30000;this.label(t,'No current frames · retrying shortly');
   }
  }catch(e){if(this.current(t,ch))this.fail(t,e)}finally{t.polling=false}
 }
 async poll(){if(this.closed||!this.running)return;await Promise.allSettled([...this.tiles.values()].map(t=>this.pollTile(t)));}
 pause(){this.running=false;for(const t of this.tiles.values()){this.disconnect(t);this.label(t,'Grid viewing stopped')}this.onUpdate(this.stats())}
 resume(){this.running=true;for(const t of this.tiles.values())t.nextTry=0;this.sync([...this.tiles.values()].map(t=>t.session),this.settings)}
 destroy(notify=true){this.closed=true;this.running=false;this.resize?.disconnect();for(const t of this.tiles.values())this.disconnect(t,notify);this.tiles.clear();}
}
