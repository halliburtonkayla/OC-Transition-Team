import {drawRoomScene} from './scenery.mjs';
import {drawProp,drawVehicle} from './artwork.mjs';
import {drawAvatar} from './characters.mjs';
import {MISSIONS} from './missions.mjs';
import {busStopped,busStop,signalWalk} from './engine.mjs';
const TAU=Math.PI*2;
const hallway=new Image(),town=new Image();hallway.src=new URL('./art/school-hall.webp',import.meta.url).href;town.src=new URL('./art/town-map.webp',import.meta.url).href;
const round=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const circle=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();};
const text=(c,s,x,y,size=16,color='#173f43',align='center')=>{c.fillStyle=color;c.textAlign=align;c.font=`800 ${size}px system-ui`;c.fillText(s,x,y);};
const grad=(c,y,h,a,b)=>{const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
function star(c,x,y,r=13){c.save();c.translate(x,y);c.fillStyle=grad(c,-r,r*2,'#fff9bb','#eeb734');c.strokeStyle='#bd842b';c.lineWidth=1.5;c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.47:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();c.restore();}
function portal(c,x,y,label,active,time,reduced){
 c.save();c.translate(x,y);round(c,-40,-100,80,105,[40,40,0,0],'#257a70');round(c,-29,-88,58,89,[28,28,0,0],grad(c,-88,89,active?'#a3e3b6':'#537778',active?'#f8df86':'#193f46'));
 c.strokeStyle='#e3d5a5';c.lineWidth=3;c.strokeRect(-39,-14,78,16);round(c,-67,-130,134,27,7,'#183f47');text(c,label,x*0,-111,12,'#fff6d4');
 if(active){c.globalAlpha=.5;circle(c,0,-43,24+(reduced?0:Math.sin(time*3)*3),'#fff5bb');c.globalAlpha=1;star(c,0,-47,13);}c.restore();
}
function building(c,x,y,name,color='#f4e8ca',w=145){round(c,x-w/2,y-97,w,95,8,'#173f4330');round(c,x-w/2,y-105,w,95,8,color);round(c,x-w/2-5,y-114,w+10,16,5,'#376b65');round(c,x-15,y-64,30,55,4,'#396d70');for(const off of [-45,45]){round(c,x+off-13,y-83,26,25,4,'#a8dae1');round(c,x+off-13,y-80,26,5,2,'#f4fbeb');}round(c,x-w/2,y-145,w,25,6,'#214d50');text(c,name,x,y-127,12,'#fff6d4');}
function floor(c,mission){
 const palette=[8,20].includes(mission.id)?['#bddba8','#79b797']:mission.id===7?['#d6e5d6','#a4c4bc']:mission.id===3?['#d1d7cd','#98afa7']:['#dfd5c3','#a9b2ba'];
 c.fillStyle=grad(c,0,540,...palette);c.fillRect(0,0,960,540);
 c.strokeStyle='#ffffff28';c.lineWidth=1;for(let x=0;x<960;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,540);c.stroke();}for(let y=0;y<540;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();}
 round(c,0,0,960,55,0,'#617a9b');round(c,0,49,960,6,0,'#243d66');round(c,18,10,924,34,8,'#152e56');text(c,mission.place.toUpperCase(),480,37,15,'#fff8dd');
 // Environmental details keep the walking lanes open and readable.
 if([4,5,7,11,13,14,15,18].includes(mission.id)){
  round(c,25,58,910,24,6,'#7a9f89');round(c,27,58,906,6,3,'#f5eccb');
  for(const x of [50,865]){round(c,x,90,42,300,7,'#8caa9250');for(let y=110;y<375;y+=70){round(c,x+4,y,34,42,6,'#6c9682');circle(c,x+21,y+13,11,'#9ab982');}}
 }
 if([8,20].includes(mission.id)){
  round(c,50,170,710,115,45,'#ddcda263');for(const [x,y]of [[70,110],[875,415],[80,370],[520,75]]){round(c,x-6,y-20,12,35,4,'#876d4b');circle(c,x,y-30,29,'#609b72');circle(c,x-13,y-35,20,'#85b67c');circle(c,x+12,y-40,20,'#a4c98c');}
  for(let i=0;i<16;i++){const x=100+i*46;circle(c,x,525,3,i%2?'#e8ca74':'#e0c9d4');}
 }
 if(mission.id===19){round(c,30,75,115,370,8,'#ba9870');for(let y=90;y<430;y+=25){c.strokeStyle='#e2c194';c.beginPath();c.moveTo(30,y);c.lineTo(145,y);c.stroke();}round(c,39,90,95,65,8,'#729e92');round(c,45,95,80,35,8,'#b2ccaa');text(c,'MY FIRST HOME',480,505,17,'#386d60');}
}
function stationArt(c,st,l,time,reduce){
 const done=l.done.includes(st.id),highlight=st.id==='s'+l.step||l.id===14&&st.id===l.route[l.step];
 c.save();c.translate(st.x,st.y);c.fillStyle='#193f4325';c.beginPath();c.ellipse(0,12,48,13,0,0,TAU);c.fill();
 if([8,14].includes(l.id)&&st.id!=='s0'||l.id===8){
  const i=Number(st.id.slice(1))||0;drawAvatar(c,0,5,{skin:['#b9825f','#76543f','#dfb48c'][i%3],hair:['#352a27','#292631','#674f37'][i%3],shirt:['#bf825b','#697fa4','#ad879c'][i%3],pants:'#3e5c68',hairStyle:['Curls','Short','Long'][i%3]},time*3,false,false,1,.65);
  round(c,-81,18,162,29,7,done?'#277a65':'#24494b');text(c,st.label,0,37,12,'#fff9e5');if(done){circle(c,30,-63,12,'#3b8a6b');text(c,'✓',30,-59,15,'#fff8d6');}c.restore();return;
 }
 if(l.id===6){round(c,-47,-90,94,95,[10,10,0,0],'#487a72');round(c,-37,-80,74,85,5,'#d2b77d');round(c,-24,-69,48,31,4,'#afcfcb');circle(c,25,-22,4,'#ffeb9f');text(c,st.id.slice(1)*1+1,0,-47,21,'#24544e');round(c,-87,18,174,29,7,'#24494b');text(c,st.label,0,37,12,'#fff9e5');c.restore();return;}
 const prop=l.id===4?(st.id==='s3'?2:0):l.id===5&&Number(st.id[1])<3?1:[13,18].includes(l.id)?2:l.id===7?(st.id==='s0'?3:4):l.id===15?5:l.id===16?7:-1;
 if(prop>=0&&drawProp(c,prop,0,9,155,85)){round(c,-90,16,180,29,8,highlight?'#284e84':'#152f57');text(c,st.label,0,36,12,'#fff5db');if(done){circle(c,55,-85,12,'#2a995e');text(c,'✓',55,-80,17,'white');}c.restore();return;}
 const lift=highlight&&!reduce?Math.sin(time*2)*2:0;c.translate(0,lift);round(c,-38,-65,76,60,8,grad(c,-65,60,done?'#9bbca3':'#f5e5ba',done?'#619886':'#b79b6a'));round(c,-42,-70,84,14,5,done?'#337968':'#527f75');
 if(l.id===5){circle(c,0,-45,23,'#fff5d9');circle(c,0,-45,17,st.id==='s0'?'#bf8a5d':st.id==='s1'?'#7aaf6a':st.id==='s2'?'#dfbd78':'#cae1cc');if(Number(st.id[1])>=3)text(c,st.id==='s3'?'1':st.id==='s4'?'2':'3',0,-39,17);else{circle(c,5,-48,4,'#eed290');circle(c,-7,-42,3,'#6d9b6c');}}
 else if(l.id===4){const i=Number(st.id.slice(1));if(i===0){for(const x of [-20,0,20]){circle(c,x,-43,10,'#bf6d52');round(c,x-1,-58,3,7,1,'#54865f');}}else if(i===1){for(const x of [-17,17]){round(c,x-9,-61,18,38,3,'#e2f0df');round(c,x-9,-46,18,15,2,'#73a7ab');}}else if(i===2){for(const x of [-17,17]){round(c,x-11,-61,22,37,6,'#d4ab65');circle(c,x,-44,8,'#f8edcc');}}else{round(c,-24,-63,48,25,4,'#365b61');round(c,-18,-59,36,15,3,'#bedcc0');round(c,-29,-31,58,12,3,'#739084');}}
 else if(l.id===7){const i=Number(st.id[1]);if(i===0){round(c,-28,-63,56,38,9,'#c4ddd8');round(c,-22,-57,44,24,8,'#79b4bd');round(c,0,-77,8,22,3,'#7b9a96');}else{circle(c,0,-43,22,'#eff5dc');circle(c,0,-43,15,i===1?'#bf7c67':'#dbdfac');circle(c,-6,-47,5,'#cf8967');circle(c,6,-40,5,'#7eaa76');}}
 else if(l.id===15){round(c,-23,-60,46,48,5,'#f1f3df');circle(c,0,-33,16,st.id==='s1'?'#3f4e70':'#8fb5ba');circle(c,0,-33,10,'#bfe5e0');}
 else if(l.id===11){if(st.id==='s0'||st.id==='s1'){circle(c,0,-43,22,'#ce9e43');circle(c,0,-45,19,'#f7d87b');text(c,st.id==='s0'?'$1':'$2',0,-39,17,'#805a29');}else{round(c,-21,-63,42,44,5,'#54887e');round(c,-15,-57,30,17,3,'#d0e7c9');round(c,-12,-31,24,5,2,'#f5db92');}}
 else if([13,18,20].includes(l.id)){round(c,-21,-65,42,45,4,'#fff4d7');round(c,-12,-58,24,5,2,'#85ae94');for(let i=0;i<3;i++)round(c,-12,-45+i*7,24-i*4,3,1,'#6e9b8b');if(done)text(c,'✓',0,-32,20,'#2e7c60');}
 else{star(c,0,-43,15);if(done)text(c,'✓',0,-36,22,'#19564b');}
 round(c,-87,18,174,29,7,highlight?'#225f58':'#24494b');text(c,st.label,0,37,12,'#fff9e5');if(done){circle(c,34,-70,11,'#237965');text(c,'✓',34,-65,13,'#fff');}c.restore();
}
function car(c,h){
 if(drawVehicle(c,h))return;
 c.save();c.translate(h.x,h.y);if(h.speed<0)c.scale(-1,1);const w=h.w,color=['#d24c3d','#3b83d4','#efc440','#535d9b','#e8e9ee','#258b7c'][h.color??h.lane%6];
 c.shadowColor='#0b173b66';c.shadowBlur=9;c.shadowOffsetY=8;round(c,-w/2,-23,w,43,10,'#172435');c.shadowColor='transparent';
 round(c,-w/2,-29,w,42,10,grad(c,-29,42,color,'#283a58'));
 if(w>130){round(c,-w/2+5,-26,w-48,36,4,'#e3ded3');for(let x=-w/2+12;x<w/2-45;x+=10)round(c,x,-23,2,30,1,'#c5c4c5');round(c,w/2-35,-23,23,30,3,'#a3d6ed');}
 else{round(c,-w*.18,-24,w*.42,33,8,'#b6dce9');round(c,-w*.14,-20,w*.32,24,5,'#294d79');round(c,0,-18,3,20,1,'#d1e1ee');}
 for(const x of [-w*.3,w*.3]){round(c,x-9,-32,18,7,3,'#122134');round(c,x-9,10,18,7,3,'#122134');}
 round(c,w/2-7,-22,4,9,2,'#fff3c5');round(c,w/2-7,0,4,9,2,'#fff3c5');round(c,-w/2+2,-22,4,8,1,'#ef533c');round(c,-w/2+2,1,4,8,1,'#ef533c');
 c.strokeStyle='#ffffff55';c.lineWidth=1;c.strokeRect(-w/2+8,-25,w-16,34);c.restore();
}
function roadScene(c,l){
 c.fillStyle=grad(c,0,540,'#b5cdaa','#4f794f');c.fillRect(0,0,960,540);
 for(const [i,y]of [135,225,315,405].entries()){
  round(c,0,y-36,960,76,0,'#26334a');round(c,0,y-32,960,63,0,grad(c,y-32,63,'#5b6776','#394656'));
  round(c,0,y-35,960,3,0,'#d1cec2');round(c,0,y+31,960,5,0,'#ddd6c7');
  c.setLineDash([30,24]);c.strokeStyle='#ece4cd';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.lineTo(960,y);c.stroke();c.setLineDash([]);
  for(const x of [160,760])for(let dy=-27;dy<27;dy+=12)round(c,x, y+dy,65,7,0,'#f6f2ddbb');
  text(c,i%2?'→':'←',65,y+7,24,'#cad5e7');
 }
 for(const y of [180,270,360,500]){
  round(c,0,y-5,960,19,0,grad(c,y-5,19,'#d3c5a9','#a49c8d'));
  for(let x=0;x<960;x+=45){c.strokeStyle='#7b817966';c.beginPath();c.moveTo(x,y-5);c.lineTo(x,y+14);c.stroke();}
 }
 round(c,0,0,960,93,0,'#c2b398');
 for(const [i,x]of [100,370,650,880].entries()){
  const target=l.road&&Math.abs(x-l.exit.x)<140;round(c,x-77,-20,154,84,5,'#16355766');round(c,x-77,-30,154,83,5,['#a4684f','#d4ad72','#6b85a3','#8c6b9a'][i]);
  round(c,x-83,-4,166,9,2,'#f2dfbd');for(let j=-50;j<=50;j+=50){round(c,x+j-12,8,24,25,3,'#9ed8e4');round(c,x+j-9,11,3,20,1,'#ffffff77');}
 }
 if(town.complete&&town.naturalWidth)c.drawImage(town,0,town.naturalHeight*.16,town.naturalWidth,town.naturalHeight*.23,0,0,960,94);
 const ex=l.exit.x;round(c,ex-64,39,128,37,8,l.inventory.length>=(l.road?.required||0)?'#16875c':'#183c70');text(c,'WORKPLACE',ex,63,14,'#fff4c5');
 if(l.road){round(c,320,505,320,26,8,'#112c54');text(c,l.road.name.toUpperCase(),480,524,13,'#fff3ce');}
 for(const w of l.walls){round(c,w.x,w.y-10,w.w,w.h+10,3,'#d99b43');for(let x=w.x+5;x<w.x+w.w-6;x+=18){c.strokeStyle='#fff4ce';c.lineWidth=5;c.beginPath();c.moveTo(x,w.y+7);c.lineTo(x+9,w.y-5);c.stroke();}text(c,'ROADWORK',w.x+w.w/2,w.y-16,10,'#173051');}
 for(const h of l.hazards)car(c,h);
}
function grid(c,l){const g=l.grid;round(c,g.ox-10,g.oy-10,g.cols*g.size+20,g.rows*g.size+20,12,'#4a736a');for(let x=0;x<g.cols;x++)for(let y=0;y<g.rows;y++)round(c,g.ox+x*g.size+2,g.oy+y*g.size+2,g.size-4,g.size-4,6,'#e2d6b9');for(const w of g.walls)round(c,g.ox+w.x*g.size+2,g.oy+w.y*g.size+2,66,66,5,'#6b897c');for(const t of g.goals){round(c,g.ox+t.x*g.size+7,g.oy+t.y*g.size+7,56,56,8,'#5baf82');text(c,'✓',g.ox+t.x*g.size+35,g.oy+t.y*g.size+46,28,'#fff8d7');}for(const b of g.boxes){const x=g.ox+b.x*g.size,y=g.oy+b.y*g.size;round(c,x+7,y+7,56,56,6,grad(c,y,56,'#edc78a','#a3774c'));c.strokeStyle='#fff3c1';c.lineWidth=3;c.strokeRect(x+13,y+13,44,44);}}
export function createQuestRenderer(canvas){
 const c=canvas.getContext('2d',{alpha:false}),valley=new Image();valley.src='assets/transition-mission/valley.webp';let camera=0;
 function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=Math.max(960,Math.round(r.width*dpr));canvas.height=Math.round(canvas.width*540/960);}
 function draw(l,profile,settings,celebrate=false){
  c.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);const m=MISSIONS[l.id-1],reduced=settings.reducedMotion,t=l.time,p=l.p;camera=l.mode==='side'?Math.max(0,Math.min(l.width-960,p.x-260)):0;
  if(l.mode==='side'){
   c.fillStyle=grad(c,0,540,'#9ed9df','#d2e6c5');c.fillRect(0,0,960,540);if(valley.complete&&valley.naturalWidth)c.drawImage(valley,0,0,valley.width,valley.height,0,-20,960,600);
   if((l.id===1||l.id===10)&&hallway.complete&&hallway.naturalWidth){
    const offset=(camera*.65)%960;c.drawImage(hallway,-offset,0,960,540);c.drawImage(hallway,960-offset,0,960,540);
   }
   c.save();c.translate(-camera,0);
   for(const plat of l.platforms){if((l.id===1||l.id===10)&&!plat.moving)continue;round(c,plat.x,plat.y,plat.w,plat.h,plat.moving?5:0,grad(c,plat.y,plat.h,'#bc9e72','#79654b'));round(c,plat.x-1,plat.y-6,plat.w+2,13,5,plat.moving?'#eac76a':'#64a16a');}
   for(const w of l.walls){round(c,w.x+3,w.y+5,w.w,w.h,8,'#14294444');round(c,w.x,w.y,w.w,w.h,8,grad(c,w.y,w.h,'#bf8d65','#6e4f3f'));round(c,w.x+9,w.y-5,w.w-18,8,4,'#483b39');round(c,w.x+5,w.y+13,w.w-10,19,5,'#a16f51');round(c,w.x+8,w.y+14,w.w-16,2,1,'#edc78d');}
   for(const h of l.hazards){if(l.id===1||l.id===10){for(let i=0;i<3;i++)drawAvatar(c,h.x-20+i*20,h.y,{skin:'#b77d58',hair:'#3a3030',sprite:i%2?'jordan':'avery',shirt:['#8c7fa2','#c88764','#4b8b8b'][i],pants:'#455f69',hairStyle:i?'Short':'Curls'},t*4,true,false,1,.82);}else{round(c,h.x-24,h.y-36,48,30,7,'#9c86ab');circle(c,h.x-14,h.y-3,6,'#3d5c60');circle(c,h.x+14,h.y-3,6,'#3d5c60');}}
   for(const st of l.stations){round(c,st.x-4,st.y-90,7,90,2,'#f2e7b8');round(c,st.x+3,st.y-90,55,29,3,'#48a394');text(c,'✓',st.x+29,st.y-68,20,'#fff');}
   portal(c,l.exit.x,l.exit.y,l.exit.label,true,t,reduced);
  }else{
   floor(c,m);if(l.mode!=='roads')drawRoomScene(c,l.id,m.place);if(l.mode==='roads'){
    roadScene(c,l);
   }else if(l.mode==='grid'){grid(c,l);}
   else{
    if(l.id===16){round(c,25,130,910,70,16,'#355958');for(let x=30;x<930;x+=35)round(c,x,138,20,54,8,'#658c82');for(const a of l.parcels){if(a.color<l.step||l.carry===a.color)continue;round(c,a.x-20,a.y-25,40,40,5,['#c76454','#4d8eaf','#d4a63d'][a.color]);text(c,['A','B','C'][a.color],a.x,a.y+1,19,'#fff');}}
    if(l.id===17){round(c,0,220,960,88,0,'#647b7a');for(let y=225;y<300;y+=19)round(c,388,y,184,10,0,'#f8edcd');const walk=signalWalk(l);round(c,600,150,140,53,10,walk?'#287f59':'#874d40');text(c,walk?'WALK':'WAIT',670,183,23,'#fff7db');}
    for(const w of l.walls){if(w.gate&&l.flags.gateOpen)continue;round(c,w.x,w.y,w.w,w.h,6,grad(c,w.y,w.h,'#5177aa','#223f68'));if(w.label==='Shelves')for(let yy=w.y+25;yy<w.y+w.h;yy+=48){round(c,w.x+5,yy,w.w-10,13,2,'#c3ae78');for(let x=w.x+9;x<w.x+w.w-8;x+=15)round(c,x,yy-14,10,16,2,'#e4d9b4');}}
    for(const h of l.hazards){if(h.id!=='hot-zone'&&drawProp(c,7,h.x,h.y+10,h.w+18,58))continue;const color=h.id==='hot-zone'?'#c37b54':'#9b83a8';round(c,h.x-h.w/2,h.y-h.h/2,h.w,h.h,6,grad(c,h.y-h.h/2,h.h,color,'#4a6964'));text(c,h.id==='hot-zone'?'HOT':'!',h.x,h.y+5,13,'#fff8d8');}
    for(const st of l.stations)stationArt(c,st,l,t,reduced);
    if(l.id===12){round(c,65,300,830,40,5,'#d5ba83');for(const [i,x] of [340,690].entries()){const visible=busStopped(l)||l.flags.riding;round(c,x-72+(visible?0:Math.sin(t)*50),190,145,60,12,i?'#ba7941':'#367fa2');for(let w=0;w<4;w++)round(c,x-60+w*30,198,24,24,3,'#c3e1dc');circle(c,x-40,251,13,'#345052');circle(c,x+42,251,13,'#345052');}text(c,l.flags.riding?'ON BOARD · '+busStop(l).toUpperCase():busStopped(l)?'BUS STOPPED · READY TO BOARD':'BUSES MOVING · PLEASE WAIT',480,360,18);}
    if(!l.stations.some(st=>Math.hypot(st.x-l.exit.x,st.y-l.exit.y)<80))portal(c,l.exit.x,l.exit.y,l.exit.label,l.ready||l.flags.gateOpen||l.step===3,t,reduced);
   }
   c.save();
  }
  for(const a of l.items){if(a.taken)continue;const bob=reduced?0:Math.sin(t*2+a.x)*3;
   if(a.type==='coin'){circle(c,a.x,a.y+bob,11,'#b9872f');circle(c,a.x,a.y-2+bob,9,'#f6d56a');text(c,'·',a.x,a.y+2+bob,15,'#a6772c');}
   else if(a.type==='star')star(c,a.x,a.y+bob);else if(a.type==='key'){circle(c,a.x-7,a.y,8,'#d2a749');round(c,a.x,a.y-3,23,6,2,'#f1cf6b');round(c,a.x+15,a.y,6,10,2,'#f1cf6b');}
   else if(a.type==='clothes'){round(c,a.x-16,a.y-18,32,30,6,a.group==='light'?'#fff5db':'#4a536d');round(c,a.x-24,a.y-18,48,10,4,a.group==='light'?'#eee4ca':'#48516a');}
   else{round(c,a.x-14,a.y-22,28,34,4,'#fff2d4');round(c,a.x-8,a.y-13,16,4,1,'#427b72');round(c,a.x-8,a.y-4,12,3,1,'#9bb49a');}
   if(a.label){round(c,a.x-58,a.y+20,116,23,6,'#1c4c4a');text(c,a.label,a.x,a.y+36,11,'#fff8d9');}
  }
  const scale=l.mode==='side'?.77:.58,py=p.y-(l.mode==='side'?0:p.z||0)-(celebrate&&!reduced?Math.abs(Math.sin(Date.now()/130))*20:0);
  if(p.invulnerable<=0||Math.floor(t*7)%2===0)drawAvatar(c,p.x,py,profile.avatar,p.cycle,Math.abs(p.vx)>1||l.mode!=='side'&&Math.abs(p.vy)>1,l.mode==='side'?!p.grounded:p.z>0,p.facing,scale*(l.mode==='side'?1.6:1.4),profile.owner,l.mode==='side'?(p.facing<0?'left':'right'):p.look||'front');
  if(l.carry!==null){round(c,p.x+15,py-32,22,20,3,'#ecc671');star(c,p.x+26,py-22,7);}
  c.restore();
  if(celebrate&&!reduced)for(let i=0;i<50;i++){const tt=Date.now()/700,x=(i*97)%960,y=(i*43+tt*(25+i%7*4))%540;c.save();c.translate(x,y);c.rotate(tt+i);round(c,0,0,6,11,1,['#f4cb6b','#73c3a7','#e8ecda','#af97ce'][i%4]);c.restore();}
  const motion=l.mode==='side'?!p.grounded?'jumping':p.vx?'running':'standing':p.z?'jumping':p.vx||p.vy?'walking':'standing',position=Math.round(p.x)+','+Math.round(p.y);if(canvas.dataset.motion!==motion)canvas.dataset.motion=motion;if(canvas.dataset.position!==position)canvas.dataset.position=position;if(canvas.dataset.mission!==String(l.id))canvas.dataset.mission=String(l.id);
 }
 resize();return {draw,resize,portrait(profile,reduced=false){
 c.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);c.fillStyle='#173a69';c.fillRect(0,0,960,540);
 if(town.complete&&town.naturalWidth)c.drawImage(town,0,0,960,540);c.fillStyle='#102b5055';c.fillRect(0,0,960,540);
 const halo=c.createRadialGradient(480,260,25,480,280,280);halo.addColorStop(0,'#fff1b580');halo.addColorStop(1,'#fff1b500');c.fillStyle=halo;c.fillRect(0,0,960,540);
 c.fillStyle='#11274d99';c.beginPath();c.ellipse(480,502,190,28,0,0,TAU);c.fill();
 drawAvatar(c,480,510,profile.avatar,0,false,false,1,3.45,profile.owner,'front');
}};
}
