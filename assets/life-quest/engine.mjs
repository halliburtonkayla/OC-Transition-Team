import {MISSIONS,DEFAULT_SETTINGS,DIFFICULTIES} from './missions.mjs';
const copy=x=>structuredClone(x),now=()=>new Date().toISOString();
export const money=n=>'$'+(n/100).toFixed(2);
export const unlocked=s=>s.practice&&s.student==='Fictional Explorer'?20:Math.min(20,s.completed.length+1);
export function newAdventure(student,id='quest-'+Date.now().toString(36),practice=false){
 return {version:2,id,student,practice,startedAt:now(),settings:copy(DEFAULT_SETTINGS),completed:[],attempts:[],active:null,suspended:{},avatarReference:null,lastSavedAt:null};
}
export function settingsValid(o){return o&&Object.hasOwn(DIFFICULTIES,o.difficulty)&&[120,180,240,300].includes(o.speed)&&['timed','reducedMotion','voice','effects','music'].every(k=>typeof o[k]==='boolean')&&Number.isFinite(o.volume)&&o.volume>=0&&o.volume<=1&&o.keys&&Object.keys(DEFAULT_SETTINGS.keys).every(k=>typeof o.keys[k]==='string'&&/^(Arrow(Up|Down|Left|Right)|Key[A-Z]|Space|Enter|ShiftLeft|ShiftRight)$/.test(o.keys[k]))&&Object.values(o.keys).every(k=>k!=='KeyR')&&new Set(Object.values(o.keys)).size===7;}
export function restoreAdventure(raw,student){
 try{
  if(!raw||JSON.stringify(raw).length>2500000)return null;const s=copy(raw);
  if(s.version!==2||s.student!==student||typeof s.id!=='string'||s.id.length>100||!settingsValid(s.settings)||!Array.isArray(s.completed)||s.completed.length>20||s.completed.some((c,i)=>(s.practice?c.mission<1||c.mission>20:c.mission!==i+1)||!Number.isFinite(Date.parse(c.at)))||new Set(s.completed.map(c=>c.mission)).size!==s.completed.length)return null;
  if(!Array.isArray(s.attempts)||s.attempts.length>1000||s.attempts.some(a=>!a||typeof a.id!=='string'||!Number.isInteger(a.mission)||a.mission<1||a.mission>20||!['active','paused','completed','abandoned'].includes(a.status)||!Number.isFinite(a.activeSeconds)||a.activeSeconds<0||!Array.isArray(a.questions)||!Array.isArray(a.actions)||a.actions.some(x=>!x||typeof x.label!=='string'||typeof x.correct!=='boolean'||typeof x.skill!=='string')||!Array.isArray(a.rewardIds)||a.questions.some(q=>typeof q.correct!=='boolean'||!Number.isInteger(q.index)||q.index<0||q.index>1||typeof q.prompt!=='string'||typeof q.response!=='string'))||new Set(s.attempts.map(a=>a.id)).size!==s.attempts.length)return null;
  for(const a of s.attempts){a.points??=0;if(!settingsValid(a.settings)||['stars','coins','points','failures','restarts'].some(k=>!Number.isInteger(a[k])||a[k]<0||a[k]>100000000))return null;}
  s.suspended??={};if(typeof s.suspended!=='object'||Array.isArray(s.suspended)||Object.keys(s.suspended).length>20)return null;
  if(Object.entries(s.suspended).some(([id,run])=>!/^([1-9]|1[0-9]|20)$/.test(id)||!run||run.level?.id!==Number(id)))return null;
  for(const run of [s.active,...Object.values(s.suspended)].filter(Boolean)){const a=s.attempts.find(a=>a.id===run.attemptId),l=run.level;
   if(!a||!['active','paused','completed'].includes(a.status)||!l||l.id!==a.mission||l.id>unlocked(s)||!Number.isFinite(l.p?.x)||!Number.isFinite(l.p?.y)||l.p.x<0||l.p.x>5000||l.p.y<0||l.p.y>900||!Number.isInteger(l.lives)||l.lives<1||l.lives>3||!Array.isArray(l.answered)||l.answered.some(n=>n!==0&&n!==1))return null;
   for(const k of ['items','stations','hazards','walls','platforms','gaps'])if(!Array.isArray(l[k])||l[k].length>500)return null;
   if(!l.flags||typeof l.flags!=='object'||Array.isArray(l.flags)||!Array.isArray(l.inventory)||!Array.isArray(l.done)||!Number.isInteger(l.phase)||l.phase<0||l.phase>(l.id===10?2:0)||l.kind!==MISSIONS[l.id-1].kind||!Number.isFinite(l.width)||l.width!==createLevel(l.id,l.phase).width)return null;
   if(l.mode==='grid'&&(!l.grid||!Array.isArray(l.grid.boxes)||l.grid.boxes.length!==2||!Array.isArray(l.grid.goals)||l.grid.goals.length!==2))return null;
   if(l.items.some(i=>!i||typeof i.id!=='string'||typeof i.taken!=='boolean')||l.stations.some(t=>!t||typeof t.id!=='string'||typeof t.label!=='string')||l.hazards.some(h=>!h||typeof h.id!=='string'))return null;
   if(['vx','vy','z','vz','cycle','invulnerable'].some(k=>!Number.isFinite(l.p[k])))return null;
   if(!Number.isFinite(l.time)||!Number.isInteger(l.step)||l.step<0||l.step>30)return null;
   const finite=x=>typeof x==='number'?Number.isFinite(x)&&Math.abs(x)<1e9:Array.isArray(x)?x.every(finite):x&&typeof x==='object'?Object.values(x).every(finite):true;
   if(!finite(l))return null;
  }
  return s;
 }catch{return null;}
}
const station=(id,x,y,label,icon='star',extra={})=>({id,x,y,w:74,h:48,label,icon,...extra});
const item=(id,x,y,type='star',extra={})=>({id,x,y,type,taken:false,...extra});
const hazard=(id,x,y,axis,range,speed,w=65,h=30)=>({id,x,y,homeX:x,homeY:y,axis,range,speed,w,h});
export function createLevel(id,phase=0){
 const mission=MISSIONS[id-1],l={id,kind:mission.kind,phase,time:0,limit:100+id*8,lives:3,step:0,phaseSteps:0,answered:[],pending:null,
  p:{x:70,y:450,vx:0,vy:0,z:0,vz:0,facing:1,grounded:true,cycle:0,invulnerable:0},checkpoint:{x:70,y:450},width:960,height:540,
  items:[],stations:[],hazards:[],walls:[],platforms:[],gaps:[],inventory:[],done:[],carry:null,flags:{},message:'',mode:'top',exit:{x:875,y:100,label:'Next portal'},ready:false};
 const side=id===1||id===9||id===10&&phase===0;
 if(side){
  l.mode='side';l.width=id===9?2700:id===10?2300:1900;l.p.y=470;l.checkpoint.y=470;l.exit={x:l.width-90,y:470,label:id===1?'CLASS 204':id===9?'TRAINING':'NEXT LEG'};
  for(let x=220,i=0;x<l.width-120;x+=130,i++)l.items.push(item('reward'+i,x,405,i%3===0?'star':'coin'));
  if(id!==9){for(let x=450,i=0;x<l.width-160;x+=430,i++){l.walls.push({x,y:432,w:42,h:38,jumpable:true,label:'Bag'});l.hazards.push(hazard('crowd'+i,x+260,470,'x',40,45+id*3,70,70));}l.platforms.push({x:0,y:470,w:l.width,h:70});}
  else{
   l.gaps=[{x:510,w:90},{x:1060,w:110},{x:1700,w:140},{x:2260,w:110}];let x=0;for(const g of l.gaps){l.platforms.push({x,y:470,w:g.x-x,h:70});x=g.x+g.w;}l.platforms.push({x,y:470,w:l.width-x,h:70});
   l.platforms.push({x:1620,homeX:1620,y:413,w:125,h:18,moving:true});l.stations.push(station('checkpoint',1330,470,'Checkpoint','star'));
   for(let x=820,i=0;x<l.width-150;x+=620,i++)l.hazards.push(hazard('cart'+i,x,470,'x',55,85,48,35));
  }
  return l;
 }
 const road=id===2||id===10&&phase===1;
 if(road){l.mode='roads';l.p.x=480;l.p.y=500;l.checkpoint={x:480,y:500};l.exit={x:480,y:48,label:'WORKPLACE'};
  for(let lane=0;lane<4;lane++){const y=135+lane*90;for(let j=0;j<2+(id>2?1:0);j++)l.hazards.push({...hazard('car'+lane+'-'+j,90+j*420,y,'loop',1100,(lane%2?1:-1)*(70+lane*20+id*2),100,40),lane});l.items.push(item('roadstar'+lane,220+(lane%2)*440,y-40));}return l;
 }
 if(id===3){
  l.mode='maze';l.p.x=78;l.p.y=450;l.exit={x:870,y:80,label:'KEY EXIT'};
  for(let col=0;col<4;col++){const x=185+col*180;l.walls.push({x,y:col%2?180:90,w:60,h:col%2?285:290,label:'Shelves'});}
  for(const [i,[x,y]] of [[100,90],[320,450],[330,100],[500,450],[680,90],[870,440]].entries())l.items.push(item('supply'+i,x,y,'supply'));
  l.items.push(item('key',865,270,'key'));l.hazards=[hazard('patrol-a',460,410,'x',300,80,60,32),hazard('patrol-b',460,125,'x',300,95,60,32)];return l;
 }
 const spots=[[180,130],[450,125],[740,130],[190,330],[450,330],[740,330]];
 const stations=(labels,icons=[])=>labels.forEach((label,i)=>l.stations.push(station('s'+i,...spots[i],label,icons[i]||mission.icon)));
 l.hazards.push(hazard('cart',480,245,'x',330,45+id*4,55,28));
 for(let i=0;i<6;i++)l.items.push(item('bonus'+i,110+i*145,480,i%2?'coin':'star'));
 if(id===4){stations(['Apples $1 / $2','Milk $2 / $3','Oats $2 / $4','Checkout']);l.exit={x:190,y:330,label:'CHECKOUT'};}
 if(id===5){stations(['Kitchen: soup','Kitchen: salad','Kitchen: sandwich','Table 1','Table 2','Table 3']);l.orders=[{meal:'soup',source:'s0',target:'s3'},{meal:'salad',source:'s1',target:'s4'},{meal:'sandwich',source:'s2',target:'s5'}];l.exit={x:875,y:450,label:'SHIFT END'};}
 if(id===6){stations(['Room 1 · 9 AM','Room 2 · 11 AM','Room 3 · 10 AM']);l.items.push(item('resume',180,360,'supply',{label:'Résumé'}),item('badge',720,360,'key',{label:'ID badge'}));l.exit={x:740,y:130,label:'ROOM 3'};}
 if(id===7){stations(['1 · Wash hands','2 · Fruit + yogurt','3 · Mix bowl','4 · Serve']);l.hazards.push(hazard('hot-zone',650,390,'x',0,0,120,65));l.exit={x:190,y:330,label:'SERVE'};}
 if(id===8){stations(['Help a friend','Support a coworker','Help at home']);l.walls.push({x:800,y:0,w:44,h:540,label:'Bridge needs 3 acts of kindness',gate:true});l.exit={x:900,y:95,label:'KINDNESS BRIDGE'};}
 if(id===10){stations(['Collect work kit','Deliver to supervisor']);l.exit={x:875,y:430,label:'CAREER FINISH'};}
 if(id===11){stations(['Add $1 coin','Add $2 coin','Reset coin tray','Transit pass $4','Savings $2']);l.wallet=0;l.exit={x:450,y:330,label:'SAVINGS'};}
 if(id===12){l.hazards=[];l.p.x=480;l.p.y=460;l.stations=[station('training',340,290,'Blue · Training bus','van'),station('shops',690,290,'Orange · Shops bus','van')];l.exit={x:860,y:90,label:'TRAINING STOP'};l.limit=180;}
 if(id===13){stations(['Availability card','Strength card','Reference card','Submit application']);l.exit={x:190,y:330,label:'APPLICATION DESK'};}
 if(id===14){stations(['Dispatch: read route','Team A · Packing','Team B · Supplies','Team C · Office']);l.route=['s2','s1','s3'];l.exit={x:860,y:430,label:'RADIO BASE'};}
 if(id===15){stations(['Lights washer','Darks washer','Start wash','Drying rack']);l.items.push(item('light-shirt',330,415,'clothes',{label:'Light shirt',group:'light'}),item('dark-shirt',610,415,'clothes',{label:'Dark shirt',group:'dark'}));l.exit={x:190,y:330,label:'CLEAN LAUNDRY'};}
 if(id===16){l.mode='conveyor';l.stations=[station('bay0',190,420,'Bay A · red','crate'),station('bay1',480,420,'Bay B · blue','crate'),station('bay2',760,420,'Bay C · gold','crate')];l.parcels=[0,1,2].map(i=>({id:'parcel'+i,color:i,x:100+i*290,y:160}));l.exit={x:860,y:440,label:'DISPATCH FINISH'};}
 if(id===17){l.hazards=[];l.p.x=180;l.p.y=470;l.stations=[station('button',180,390,'Request WALK','cone'),station('help',780,90,'Report blocked path','mail')];l.walls=[{x:0,y:220,w:380,h:88,label:'Use marked crossing'},{x:580,y:220,w:380,h:88,label:'Use marked crossing'}];l.exit={x:780,y:90,label:'HELP STATION'};l.flags.signal=-99;}
 if(id===18){stations(['1 · Clock in','2 · Stock shelves','3 · Take break','4 · Clock out']);l.exit={x:190,y:330,label:'CLOCK OUT'};l.limit=125;}
 if(id===19){
  l.mode='grid';l.hazards=[];l.items=[];l.p.x=285;l.p.y=436;l.grid={size:70,ox:180,oy:100,cols:8,rows:5,player:{x:1,y:4},boxes:[{x:2,y:2},{x:4,y:2}],goals:[{x:5,y:1},{x:5,y:3}],walls:[{x:3,y:0},{x:3,y:4}],cooldown:0};l.exit={x:850,y:450,label:'HOME READY'};
 }
 if(id===20){stations(['Ramp support','Written checklist','Quiet workspace']);l.walls.push({x:810,y:0,w:40,h:540,label:'Summit support gate',gate:true});l.hazards.push(hazard('busy-path',690,280,'y',180,120,45,35));l.exit={x:905,y:110,label:'MY FUTURE'};}
 return l;
}
export const attemptFor=s=>s.active?s.attempts.find(a=>a.id===s.active.attemptId):null;
export function startMission(s,id,uid){
 if(!Number.isInteger(id)||id<1||id>unlocked(s))return false;
 s.suspended??={};if(s.active){const old=attemptFor(s);if(old?.status==='active'){s.suspended[s.active.level.id]=copy(s.active);old.status='paused';}}
 if(s.suspended[id]){s.active=s.suspended[id];delete s.suspended[id];attemptFor(s).status='active';return true;}
 const a={id:uid||s.id+'-'+(s.attempts.length+1),mission:id,startedAt:now(),finishedAt:null,activeSeconds:0,status:'active',questions:[],actions:[],rewardIds:[],stars:0,coins:0,points:0,failures:0,restarts:0,settings:copy(s.settings)};
 s.attempts.push(a);s.active={attemptId:a.id,level:createLevel(id)};return true;
}
function record(s,label,correct=true,skill){const a=attemptFor(s);a.actions.push({label,correct,skill:skill||MISSIONS[a.mission-1].skills[0],at:now()});if(correct)a.points=(a.points||0)+50;return {type:'action',label,correct};}
const overlap=(x,y,w,h,b)=>x+w/2>b.x&&x-w/2<b.x+b.w&&y>b.y&&y-h<b.y+b.h;
const near=(p,o,r=72)=>Math.hypot(p.x-o.x,p.y-o.y)<r;
const effectiveKind=l=>l.id===10?(l.phase===0?'runner':l.phase===1?'roads':'delivery'):l.kind;
export function reward(s,c){const a=attemptFor(s),l=s.active.level,key=l.phase+':'+c.id;if(c.taken)return null;c.taken=true;if(a.rewardIds.includes(key))return null;a.rewardIds.push(key);const type=c.type==='coin'?'coin':'star';a[type==='coin'?'coins':'stars']++;a.points=(a.points||0)+(type==='coin'?10:75);return {type};}
export function hurt(s,cause){
 const l=s.active.level,a=attemptFor(s);if(l.p.invulnerable>0)return [];
 a.failures++;l.lives--;const reset=l.lives<=0||l.mode==='roads'||l.id===10||cause==='time';
 const events=[{type:'hurt',cause}];
 if(reset){const lives=l.lives>0?l.lives:3;const fresh=createLevel(l.id);fresh.lives=lives;fresh.answered=[...l.answered];fresh.p.invulnerable=DIFFICULTIES[s.settings.difficulty].damageDelay;s.active.level=fresh;a.restarts++;events.push({type:'restart',message:'Mission restarted. Your completed missions are safe.'});}
 else{l.p.x=l.checkpoint.x;l.p.y=l.checkpoint.y;l.p.vy=0;l.p.z=0;l.p.vz=0;l.p.invulnerable=DIFFICULTIES[s.settings.difficulty].damageDelay;}
 return events;
}
export function answerQuestion(s,index,choice){
 const l=s.active?.level,a=attemptFor(s),q=MISSIONS[l?.id-1]?.questions[index];
 if(!q||l.pending?.index!==index||!Number.isInteger(choice)||choice<0||choice>=q.options.length)return {ok:false};
 const correct=choice===q.answer;a.questions.push({index,prompt:q.prompt,response:q.options[choice],correct,skill:q.skill,service:q.service,at:now()});
 if(correct){if(!l.answered.includes(index)){l.answered.push(index);a.points=(a.points||0)+100;}l.pending=null;}
 return {ok:true,correct,message:q.why};
}
function ask(s,index){const l=s.active.level;if(l.answered.includes(index))return [];l.pending={index};return [{type:'question',index}];}
function finish(s){
 const l=s.active.level,a=attemptFor(s);l.ready=true;for(let i=0;i<2;i++)if(!l.answered.includes(i))return ask(s,i);
 if(a.status!=='active')return [];a.status='completed';a.finishedAt=now();a.settings=copy(s.settings);a.points=(a.points||0)+500;
 if(!s.completed.some(c=>c.mission===l.id))s.completed.push({mission:l.id,at:a.finishedAt,attemptId:a.id});
 return [{type:'complete',mission:l.id}];
}
export function objective(l){
 const k=effectiveKind(l),counts=t=>l.items.filter(i=>i.type===t&&i.taken).length;
 if(k==='runner')return 'Run to '+l.exit.label+'. Give groups space; jump over bags.';
 if(k==='roads')return 'Watch four lanes of traffic. Reach the workplace at the top.';
 if(k==='maze')return `${counts('supply')}/6 work supplies · ${l.items.find(i=>i.id==='key').taken?'key found':'find the key'}`;
 if(k==='grocery')return `${l.done.length}/3 best buys · ${l.inventory.join(', ')||'Read prices at the shelves'}`;
 if(k==='restaurant')return `Order ${Math.min(3,l.step+1)}/3: ${l.orders[l.step]?.meal||'orders complete'} → Table ${l.step+1} · Carrying: ${l.carry||'nothing'}`;
 if(k==='interview')return '10 AM · Room 3 · '+l.items.filter(i=>['resume','badge'].includes(i.id)&&i.taken).length+'/2 interview items';
 if(k==='kitchen')return ['Wash hands first','Collect fruit + yogurt','Mix the bowl','Serve your bowl','Recipe complete'][l.step];
 if(k==='kindness')return `${l.done.length}/3 neighbors helped · build the kindness bridge`;
 if(k==='platform')return 'Jump gaps and ride the moving lift. Midpoint flag saves a checkpoint.';
 if(k==='delivery')return ['Collect your work kit','Deliver the kit to the supervisor','Reach the finish portal'][l.step];
 if(k==='budget')return `Practice tray ${money(l.wallet)} · ${l.step===0?'Collect exactly $6, then pay Transit':l.step===1?'Keep the remaining $2 in Savings':'Budget complete'}`;
 if(k==='bus')return l.flags.riding?'On board · Current stop: '+busStop(l)+' · Enter rings the bell':'Board the BLUE Training bus while it is stopped. Enter to board.';
 if(k==='application')return `${l.done.length}/3 application field cards ready · deliver to desk`;
 if(k==='radio')return `Dispatch: ${l.step<3?['Team B · Supplies','Team A · Packing','Team C · Office'][l.step]:'Return to Radio Base'} · ${l.step}/3 messages delivered`;
 if(k==='laundry')return l.flags.clean?'Clothes clean! Take them to the rack.':l.flags.washAt!==undefined?'Wash cycle: '+Math.max(0,Math.ceil(6-(l.time-l.flags.washAt)))+' seconds':`${l.done.length}/2 sorted · Carrying: ${l.carry||'nothing'} · Enter near a shirt to pick it up`;
 if(k==='conveyor')return `Catch ${['RED','BLUE','GOLD'][l.step]||'all done'} parcel → Bay ${['A','B','C'][l.step]||'finished'} · Carrying: ${l.carry===null?'nothing':['red','blue','gold'][l.carry]}`;
 if(k==='signals')return `${signalWalk(l)?'WALK · cross now':'WAIT · request the signal'} · cross the marked strip, then report the blocked path`;
 if(k==='schedule')return ['Clock in','Stock shelves','Take your break','Clock out','Shift complete'][l.step]+' · follow the checklist in order';
 if(k==='sokoban')return 'Push both boxes onto green pads. R resets only this puzzle.';
 if(k==='advocacy')return `${l.done.length}/3 support beacons activated · open the summit path`;
 return '';
}
export const busStopped=l=>l.time%12<5;
export const busStop=l=>['Park','Shops','Training','Home'][Math.floor((l.time-(l.flags.boardAt||0))/5)%4];
export const signalWalk=l=>l.flags.signal!==undefined&&l.time-l.flags.signal>=2&&l.time-l.flags.signal<12;
function gridMove(s,input,dt){
 const l=s.active.level,g=l.grid;g.cooldown=Math.max(0,g.cooldown-dt);if(g.cooldown>0)return [];
 const dx=input.right?1:input.left?-1:0,dy=dx?0:input.down?1:input.up?-1:0;if(!dx&&!dy)return [];
 g.cooldown=.17;const blocked=(x,y)=>x<0||x>=g.cols||y<0||y>=g.rows||g.walls.some(w=>w.x===x&&w.y===y),x=g.player.x+dx,y=g.player.y+dy;if(blocked(x,y))return [];
 const box=g.boxes.find(b=>b.x===x&&b.y===y);if(box){if(blocked(x+dx,y+dy)||g.boxes.some(b=>b.x===x+dx&&b.y===y+dy))return [];box.x+=dx;box.y+=dy;}
 g.player={x,y};l.p.x=g.ox+x*g.size+g.size/2;l.p.y=g.oy+y*g.size+g.size*.8;l.p.cycle+=.8;l.p.facing=dx||l.p.facing;
 if(g.goals.every(t=>g.boxes.some(b=>b.x===t.x&&b.y===t.y))){if(!l.ready){record(s,'Organized both supply boxes on storage pads',true,'Organizing a home');l.ready=true;}return finish(s);}return [];
}
export function step(s,input={},seconds=1/60){
 if(!s.active||attemptFor(s)?.status!=='active'||s.active.level.pending)return [];
 let l=s.active.level,p=l.p;const dt=Math.min(.05,Math.max(0,seconds)),d=DIFFICULTIES[s.settings.difficulty],events=[];
 l.time+=dt;if(input.active!==false)attemptFor(s).activeSeconds+=dt;p.invulnerable=Math.max(0,p.invulnerable-dt);
 if(s.settings.timed&&l.time>l.limit){events.push(...hurt(s,'time'));s.active.level.time=0;return events;}
 if(l.mode==='grid')return l.ready?finish(s):gridMove(s,input,dt);
 const dir=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0),speed=s.settings.speed*(input.sprint?1.3:1);
 p.vx=dir*speed;p.vy=l.mode==='side'?p.vy:dy*speed;if(dir)p.facing=dir;if(dir||dy)p.cycle+=dt*speed*.055;
 if(l.mode==='side'){
  const prevY=p.y;
  const auto=d.assist&&p.grounded&&dir>0&&(l.gaps.some(g=>g.x>p.x&&g.x-p.x<speed*.23+22)||l.walls.some(w=>w.x>p.x&&w.x-p.x<speed*.22+25)||l.hazards.some(h=>h.x>p.x&&h.x-p.x<speed*.22+42));
  if((input.jump||auto)&&p.grounded){p.vy=-740;p.grounded=false;events.push({type:'jump'});}
  // Gentle-speed jump assistance carries the avatar over the widest training gap.
  if(d.assist&&!p.grounded&&dir&&l.gaps.some(g=>p.x>g.x-80&&p.x<g.x+g.w+25))p.vx=dir*Math.max(speed,220);
  p.x=Math.max(24,Math.min(l.width-24,p.x+p.vx*dt));p.vy+=1450*dt;p.y+=p.vy*dt;p.grounded=false;
  for(const plat of l.platforms){if(plat.moving){const old=plat.x;plat.x=plat.homeX+Math.sin(l.time*1.1)*110;if(prevY===plat.y&&p.x>old&&p.x<old+plat.w)p.x+=plat.x-old;}
   if(p.vy>=0&&p.x+13>plat.x&&p.x-13<plat.x+plat.w&&prevY<=plat.y+2&&p.y>=plat.y){p.y=plat.y;p.vy=0;p.grounded=true;}}
  for(const w of l.walls)if(overlap(p.x,p.y,26,65,w)){if(prevY<=w.y+3&&p.vy>=0){p.y=w.y;p.vy=0;p.grounded=true;}else p.x=dir>0?w.x-14:w.x+w.w+14;}
  if(d.assist&&p.y>470&&p.vy>0&&l.gaps.some(g=>p.x>g.x-15&&p.x<g.x+g.w+15)){p.y=470;p.vy=-480;p.grounded=false;events.push({type:'assist',message:'Jump support helped you across the gap.'});}
  if(p.y>650)return hurt(s,'missed platform');
  if(l.id===9&&p.x>1300&&p.grounded&&l.checkpoint.x<1300){l.checkpoint={x:1300,y:470};events.push({type:'checkpoint'});}
 }else if(!l.flags.riding){
  const scale=dir&&dy?Math.SQRT1_2:1,ox=p.x,oy=p.y;p.x=Math.max(25,Math.min(935,p.x+dir*speed*dt*scale));if(l.walls.some(w=>!(w.gate&&l.flags.gateOpen)&&overlap(p.x,p.y,27,26,w)))p.x=ox;
  p.y=Math.max(55,Math.min(510,p.y+dy*speed*dt*scale));if(l.walls.some(w=>!(w.gate&&l.flags.gateOpen)&&overlap(p.x,p.y,27,26,w)))p.y=oy;
  if(input.jump&&p.z===0){p.vz=260;events.push({type:'jump'});}p.z=Math.max(0,p.z+p.vz*dt);p.vz-=850*dt;if(p.z===0)p.vz=0;
 }
 for(const h of l.hazards){
  if(h.axis==='loop')h.x=((h.homeX+70+l.time*h.speed*d.hazard)%1100+1100)%1100-70;
  else if(h.axis==='x')h.x=h.homeX+Math.sin(l.time*(Math.abs(h.speed)/90)*d.hazard)*h.range;
  else h.y=h.homeY+Math.sin(l.time*(Math.abs(h.speed)/90)*d.hazard)*h.range;
  const box={x:h.x-h.w/2,y:l.mode==='side'?h.y-h.h:h.y-h.h/2,w:h.w,h:h.h};
  if(overlap(p.x,p.y,26,l.mode==='side'?65:24,box)){
   if(l.mode==='side'&&d.assist){p.y=Math.min(p.y,box.y-2);p.vy=Math.min(p.vy,-260);p.grounded=false;events.push({type:'assist',message:'Jump support helped you clear the obstacle.'});}
   else return [...events,...hurt(s,h.id.startsWith('car')?'traffic':'obstacle')];
  }
 }
 for(const c of l.items){if(c.taken||c.type==='clothes')continue;if(Math.abs(p.x-c.x)<31&&Math.abs((l.mode==='side'?p.y-52:p.y-15)-c.y)<42){if(['supply','key'].includes(c.type)){c.taken=true;l.inventory.push(c.id);events.push(record(s,'Collected '+(c.label||c.type)));}else{const r=reward(s,c);if(r)events.push(r);}}}
 if(l.id===12&&l.flags.riding){p.x=480;p.y=275;if(busStop(l)==='Training')l.message='Training stop! Press Enter to ring the bell.';}
 if(l.id===15&&l.flags.washAt!==undefined&&l.time-l.flags.washAt>=6)l.flags.clean=true;
 if(l.id===16)for(const parcel of l.parcels)parcel.x=(100+parcel.color*290+l.time*(60+l.id*2)*d.hazard)%870+30;
 if(l.id===17&&p.y<325&&p.y>210&&!signalWalk(l))return [...events,...hurt(s,'crossed before WALK')];
 if(l.id===17&&p.y<205)l.flags.crossed=true;
 if(l.mode==='side'&&p.x>l.exit.x-35){if(l.id===10)return [...events,...nextRelay(s)];return [...events,...finish(s)];}
 if(l.mode==='roads'&&p.y<70){if(l.id===10)return [...events,...nextRelay(s)];return [...events,...finish(s)];}
 return events;
}
function nextRelay(s){const l=s.active.level;record(s,'Finished career relay leg '+(l.phase+1));const n=createLevel(10,l.phase+1);n.lives=l.lives;n.answered=l.answered;s.active.level=n;return [{type:'phase',message:'Relay leg '+(n.phase+1)+' · '+objective(n)}];}
function choice(label,options,answers,skill){return {type:'task',label,options,answers,skill};}
export function interact(s){
 const l=s.active?.level;if(!l||attemptFor(s)?.status!=='active')return [];const k=effectiveKind(l),p=l.p;
 if(l.ready&&near(p,l.exit))return finish(s);
 const st=l.stations.find(o=>near(p,o));
 const done=(label,skill)=>{const e=record(s,label,true,skill);l.message=label;return [e];};
 const retry=(message,skill)=>[record(s,message,false,skill),{type:'notice',message}];
 if(l.mode==='side'){if(st?.id==='checkpoint'){l.checkpoint={x:1330,y:470};return [{type:'checkpoint'}];}return [];}
 if(k==='maze'&&near(p,l.exit)){if(l.items.filter(i=>i.type==='supply'&&i.taken).length===6&&l.inventory.includes('key'))return finish(s);l.message='Find all 6 supplies and the brass key first.';return [{type:'notice',message:l.message}];}
 if(k==='grocery'&&st){if(st.id==='s3'){if(l.done.length===3)return finish(s);l.message='Your list needs apples, milk, and oats.';}else if(!l.done.includes(st.id)){const i=Number(st.id.slice(1)),prices=[[100,200],[200,300],[200,400]][i];return [choice('Choose your '+['apples','milk','oats'][i],[money(prices[1])+' · same size',money(prices[0])+' · same size'],[1],'Comparing prices')];}}
 if(k==='restaurant'&&st){const o=l.orders[l.step];if(!o){if(near(p,l.exit))return finish(s);return [{type:'notice',message:'All orders delivered. Go to the shift-end portal.'}];}
  if(st.id===o.source&&!l.carry){l.carry=o.meal;return done('Picked up '+o.meal);}
  if(st.id===o.target&&l.carry===o.meal){l.carry=null;l.step++;return done('Delivered '+o.meal+' to Table '+l.step,'Customer service');}
  return retry('Check your order: '+o.meal+' → Table '+(l.step+1)+'.','Order accuracy');}
 if(k==='interview'&&st){if(st.id==='s2'&&l.inventory.includes('resume')&&l.inventory.includes('badge'))return finish(s);return retry(st.id==='s2'?'Collect your résumé and ID badge first.':'Your appointment is at 10 AM in room 3.','Interview preparation');}
 if(k==='kitchen'&&st){if(st.id==='s'+l.step){l.step++;const e=done(['Washed hands','Collected fruit and yogurt','Mixed the bowl','Served the no-heat recipe'][l.step-1],'Following a recipe');if(l.step===4)return [...e,...finish(s)];return e;}return retry('Follow the recipe: '+objective(l),'Following a recipe');}
 if(k==='kindness'&&st&&!l.done.includes(st.id))return [choice(st.label,['Ask what help is wanted, listen, and follow through.','Ignore them and laugh.','Decide everything for them.'],[0],'Supportive relationships')];
 if(k==='delivery'&&st){if(st.id==='s'+l.step){l.step++;return done(l.step===1?'Collected a work kit':'Delivered the kit to the supervisor');}}
 if(k==='budget'&&st){if(st.id==='s0'||st.id==='s1'){l.wallet+=st.id==='s0'?100:200;return done('Added practice coin: tray '+money(l.wallet),'Money management');}if(st.id==='s2'){l.wallet=0;return [{type:'notice',message:'Practice coin tray reset.'}];}if(st.id==='s3'&&l.step===0){if(l.wallet===600){l.wallet-=400;l.step=1;return done('Paid $4 transit fare; $2 remains','Budgeting');}return [{type:'notice',message:'Build exactly $6 before paying. Reset the tray if needed.'}];}if(st.id==='s4'&&l.step===1&&l.wallet===200){l.wallet=0;l.step=2;return [...done('Saved the remaining $2','Budgeting'),...finish(s)];}}
 if(k==='bus'){
  if(l.flags.riding){if(busStop(l)==='Training'){l.flags.riding=false;l.p={...p,x:860,y:90};l.ready=true;return [...done('Rang the bell and exited at Training','Public transportation'),...finish(s)];}return retry('This is '+busStop(l)+'. Wait for Training, then ring the bell.','Public transportation');}
  if(st?.id==='training'){if(busStopped(l)){l.flags.riding=true;l.flags.boardAt=l.time;return done('Boarded the Training bus','Public transportation');}return [{type:'notice',message:'Wait until the blue bus stops. It returns every 12 seconds.'}];}
  if(st?.id==='shops')return retry('This bus goes to Shops. Find the blue Training bus.','Public transportation');
 }
 if(k==='application'&&st){if(st.id==='s3'){if(l.done.length===3)return finish(s);return [{type:'notice',message:'Collect all three field cards first.'}];}
  if(!l.done.includes(st.id)){const fields=[['Which availability fits an after-school shift?',['Weekdays after school','Every school day during class'],0],['Choose an honest strength.',['I can sort supplies and ask for help.','I have every skill without training.'],0],['Choose a practice reference.',['Fictional Teacher Lee · with permission','A stranger’s private phone number'],0]];const [title,opts,a]=fields[Number(st.id.slice(1))];return [choice(title,opts,[a],'Job applications')];}}
 if(k==='radio'&&st){if(st.id==='s0')return [{type:'notice',message:objective(l)}];if(st.id===l.route[l.step]){l.step++;return done('Delivered radio message '+l.step+' to '+st.label,'Workplace communication');}return retry('Repeat the current instruction: '+objective(l),'Workplace communication');}
 if(k==='laundry'){
  if(st){if(st.id==='s0'||st.id==='s1'){if(l.carry){const c=l.items.find(i=>i.id===l.carry),group=st.id==='s0'?'light':'dark';if(c.group===group){l.done.push(c.id);l.carry=null;return done('Sorted '+c.label+' into '+group+' washer','Sorting laundry');}return [{type:'notice',message:'Check light and dark clothing before sorting.'}];}}
   if(st.id==='s2'){if(l.done.length===2){l.flags.washAt??=l.time;return done('Started the laundry cycle','Laundry skills');}return [{type:'notice',message:'Sort both shirts before starting the wash.'}];}
   if(st.id==='s3'&&l.flags.clean)return [...done('Hung the clean laundry','Independent living'),...finish(s)];
  }else if(!l.carry){const c=l.items.find(i=>i.type==='clothes'&&!i.taken&&near(p,i,68));if(c){c.taken=true;l.carry=c.id;return done('Picked up '+c.label,'Sorting laundry');}}
 }
 if(k==='conveyor'){
  if(l.carry===null){const c=l.parcels.find(i=>i.color===l.step&&near(p,i,76));if(c){l.carry=c.color;return done('Caught '+['red','blue','gold'][c.color]+' parcel','Matching orders');}}
  if(st&&l.carry!==null){if(st.id==='bay'+l.carry){const n=l.carry;l.carry=null;l.step++;return done('Dispatched '+['red','blue','gold'][n]+' parcel to Bay '+['A','B','C'][n],'Customer service');}return retry('Read the parcel color and matching bay.','Order accuracy');}
 }
 if(k==='signals'&&st){if(st.id==='button'){l.flags.signal=l.time;return done('Requested a safe WALK signal','Community safety');}if(st.id==='help'&&l.flags.crossed)return [...done('Reported the blocked path to the help station','Reporting hazards'),...finish(s)];}
 if(k==='schedule'&&st){if(st.id==='s'+l.step){l.step++;const e=done('Completed shift checklist: '+st.label,'Time management');return l.step===4?[...e,...finish(s)]:e;}return retry('Next appointment: '+objective(l),'Time management');}
 if(k==='advocacy'&&st&&!l.done.includes(st.id)){const labels=['I need a ramp to reach the next area.','A written checklist helps me follow the steps.','A quiet space helps me focus.'];return [choice('Request the support at this beacon',[labels[Number(st.id.slice(1))],'I should never ask for help.'],[0],'Self-advocacy')];}
 if(near(p,l.exit)){
  const ready=k==='kindness'&&l.done.length===3||k==='delivery'&&l.step===2||k==='restaurant'&&l.step===3||k==='radio'&&l.step===3||k==='conveyor'&&l.step===3||k==='advocacy'&&l.done.length===3||k==='bus'&&l.ready;
  if(ready)return finish(s);
 }
 return [{type:'notice',message:l.message||'Move close to a station, item, or portal and press Enter.'}];
}
export function answerTask(s,task,choiceIndex){
 const l=s.active?.level;if(!l||!task||task.type!=='task'||!Number.isInteger(choiceIndex)||!task.options[choiceIndex])return [];
 const correct=task.answers.includes(choiceIndex),st=l.stations.find(o=>near(l.p,o));
 if(!st||l.done.includes(st.id))return [];const e=record(s,task.label+': '+task.options[choiceIndex],correct,task.skill);
 if(!correct)return [e,{type:'notice',message:'Try again. '+(task.skill==='Comparing prices'?'Compare equal sizes and select the smaller price.':'Choose a safe, honest, respectful response.')}];
 if(!l.done.includes(st.id))l.done.push(st.id);
 if(l.kind==='grocery')l.inventory.push(['apples','milk','oats'][Number(st.id.slice(1))]);
 if((l.kind==='kindness'||l.kind==='advocacy')&&l.done.length===3)l.flags.gateOpen=true;
 return [e,{type:'task-complete',message:'Good choice! '+(l.flags.gateOpen?'The path is now open.':'Continue your mission.')}];
}
export function resetPuzzle(s){if(s.active?.level.id!==19)return false;const old=s.active.level,fresh=createLevel(19);fresh.answered=old.answered;fresh.time=old.time;fresh.lives=old.lives;s.active.level=fresh;record(s,'Reset the move-in puzzle to try another route',false,'Planning ahead');return true;}
export function restartMission(s){if(!s.active)return false;const old=s.active.level,fresh=createLevel(old.id);fresh.answered=old.answered;s.active.level=fresh;attemptFor(s).restarts++;return true;}
