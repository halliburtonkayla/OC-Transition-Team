import {clamp,direction,WIDTH} from './engine.js';
const TAU=Math.PI*2;
export class Renderer{
 constructor(canvas,teams){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.teams=teams;this.camera=36;this.smoothed=new Map();this.play=-1;this.canvas.width=1200;this.canvas.height=660;}
 team(id){return this.teams.find(t=>t.id===id)||this.teams[0];}
 point(x,y,z=0){const scale=.81+y*.0043;return{x:this.canvas.width/2+(x-this.camera)*14*scale,y:155+y*7.5-z,scale};}
 polygon(points,color,stroke){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>{const p=this.point(x,y);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);});c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
 text(text,x,y,size,color='#fff',align='center'){const c=this.c;c.fillStyle=color;c.font=`700 ${size}px system-ui, sans-serif`;c.textAlign=align;c.fillText(text,x,y);}
 line(x,y,xx,yy,color,width=1){const c=this.c;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
 fieldLine(x,y,xx,yy,color,width=1){const a=this.point(x,y),b=this.point(xx,yy);this.line(a.x,a.y,b.x,b.y,color,width);}
 ellipse(x,y,rx,ry,color){const c=this.c;c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
 draw(g,side,dt,online=false){
  const width=this.canvas.id==='field'&&this.canvas.clientWidth<600&&window.innerHeight>window.innerWidth?720:1200;if(this.canvas.width!==width)this.canvas.width=width;const mid=width/2;
  const c=this.c,carrier=g.attack[g.carrier],q=g.flight;const focus=q?q.x+(q.tx-q.x)*clamp(q.t/q.duration,0,1):carrier.x;
  this.camera+=(clamp(focus+direction(g)*12,23,77)-this.camera)*Math.min(1,dt*3.5);
  const sky=c.createLinearGradient(0,0,0,180);sky.addColorStop(0,'#102440');sky.addColorStop(1,'#677d8b');c.fillStyle=sky;c.fillRect(0,0,1200,660);
  // Town skyline and stadium lights.
  for(let i=0;i<20;i++){const x=i*70,h=18+(i*31%36);c.fillStyle='#1c3544';c.fillRect(x,104-h,42,h);c.fillStyle='#b9c398';c.fillRect(x+8,92-h,4,5);}
  for(const x of [95,1105]){this.line(x,21,x,135,'#778b98',5);const glow=c.createRadialGradient(x,25,1,x,25,95);glow.addColorStop(0,'#f7ffdc50');glow.addColorStop(1,'#f7ffdc00');c.fillStyle=glow;c.fillRect(x-95,0,190,135);for(let j=-2;j<=2;j++)this.ellipse(x+j*12,23,4,5,'#fffac9');}
  c.fillStyle='#30404b';c.fillRect(0,103,1200,35);for(let row=0;row<3;row++)for(let n=0;n<115;n++){const x=n*11+(row%2)*4,y=110+row*9;this.ellipse(x,y,2.6,3.5,['#dbbc97','#99a5b2','#9d6b51','#cdd8d9','#c36b5c'][(n*13+row*3)%5]);}
  c.fillStyle='#172e37';c.fillRect(0,136,1200,19);this.text('TRANSITION PARK  /  FRIDAY NIGHT FOOTBALL',mid,149,10,'#c0d2c8');
  c.fillStyle='#283f37';c.fillRect(0,155,1200,505);
  this.polygon([[-12,-2],[112,-2],[112,WIDTH+2],[-12,WIDTH+2]],'#c5cbc0');
  for(let n=-10;n<110;n+=5)this.polygon([[n,0],[n+5,0],[n+5,WIDTH],[n,WIDTH]],n%10===0?'#346747':'#39714c');
  const home=this.team(g.teams[0]),away=this.team(g.teams[1]);
  this.polygon([[-10,0],[0,0],[0,WIDTH],[-10,WIDTH]],home.primary);this.polygon([[100,0],[110,0],[110,WIDTH],[100,WIDTH]],away.primary);
  for(let n=0;n<=100;n+=5)this.fieldLine(n,0,n,WIDTH,n%10?'#d9e4d275':'#e8eee0c5',n%10?1:1.6);
  for(let n=1;n<100;n++){for(const y of [1,20.6,32.7,WIDTH-1])this.fieldLine(n,y,n,y+.8,'#f1f3ddaa',1);}
  this.fieldLine(-10,0,110,0,'#fff',3);this.fieldLine(-10,WIDTH,110,WIDTH,'#fff',3);
  for(let n=10;n<100;n+=10)for(const y of [7,45.5]){const p=this.point(n,y);c.save();c.translate(p.x,p.y);c.scale(1,.77);this.text(String(n<=50?n:100-n),0,0,24,'#eff3dcbb');c.restore();}
  const center=this.point(50,WIDTH/2);c.save();c.globalAlpha=.17;this.ellipse(center.x,center.y,43,32,'#fff');this.text('TP',center.x,center.y+8,31,'#163b36');c.restore();
  for(const [x,team,rot] of [[-5,home,-Math.PI/2],[105,away,Math.PI/2]]){const p=this.point(x,26.7);c.save();c.translate(p.x,p.y);c.rotate(rot);this.text(team.name.replace(/ High School| School| Comprehensive/g,'').slice(0,27).toUpperCase(),0,0,24);c.restore();}
  if(g.phase!=='final'){
   this.fieldLine(g.line,0,g.line,WIDTH,'#70cbea',3);this.fieldLine(g.target,0,g.target,WIDTH,'#ffc744',3);
   const stick=this.point(g.target,WIDTH+1);this.line(stick.x,stick.y,stick.x,stick.y-24,'#fc8d41',3);this.ellipse(stick.x,stick.y-25,5,5,'#fc8d41');
  }
  for(const x of [-10,110]){const p=this.point(x,26.7);this.line(p.x,p.y,p.x,p.y-50,'#e4bc58',3);this.line(p.x-20,p.y-50,p.x+20,p.y-50,'#f5d46c',3);this.line(p.x-20,p.y-50,p.x-20,p.y-83,'#f5d46c',3);this.line(p.x+20,p.y-50,p.x+20,p.y-83,'#f5d46c',3);}
  if(g.phase==='ready'&&g.offense===side){c.save();c.setLineDash([5,7]);for(let i=1;i<=3;i++){const p=g.attack[i],endY=g.formation==='slants'?p.y+(i===3?-12:9):p.y;this.fieldLine(p.x,p.y,clamp(p.x+direction(g)*18,0,100),endY,'#e7db9290',2);}c.restore();}
  const newPlay=this.play!==g.playId;this.play=g.playId;const people=[];
  for(const [arr,team,tag]of [[g.attack,g.offense,'o'],[g.defense,1-g.offense,'d']])arr.forEach((p,i)=>{
   const key=tag+i,old=this.smoothed.get(key);const k=online&&!newPlay?Math.min(1,dt*18):1;
   const v={...p,x:old?old.x+(p.x-old.x)*k:p.x,y:old?old.y+(p.y-old.y)*k:p.y};this.smoothed.set(key,v);
   people.push({p:v,team,selected:tag==='o'?side===team&&i===g.carrier:side===team&&i===g.defender,ball:tag==='o'&&i===g.carrier&&!g.flight,receiver:tag==='o'&&i>0&&i<4&&side===g.offense&&g.carrier===0&&!g.thrown,label:['','A','B','C'][i]});
  });
  people.sort((a,b)=>a.p.y-b.p.y).forEach(v=>this.person(v,g));
  if(q){const t=clamp(q.t/q.duration,0,1),p=this.point(q.x+(q.tx-q.x)*t,q.y+(q.ty-q.y)*t);this.ellipse(p.x,p.y,8,3,'#081e2866');this.ball(p.x,p.y-Math.sin(Math.PI*t)*(q.kind==='pass'?65:110)-15,g.time*8);const target=this.point(q.tx,q.ty);c.strokeStyle='#fff6';c.lineWidth=2;c.beginPath();c.ellipse(target.x,target.y,12,6,0,0,TAU);c.stroke();}
  // Drive direction and field overview are visible while the camera follows play.
  const targetSide=direction(g)>0?'RIGHT →':'← LEFT';c.fillStyle='#0d202ddd';c.fillRect(18,18,250,47);this.text((side===g.offense?'ATTACK ':'DEFEND ')+targetSide,34,47,16,'#edf5ef','left');
  this.mini(g);if(g.phase==='ready')this.banner('CHOOSE A PLAY · SNAP WHEN READY',g.formation.toUpperCase()+'  /  '+Math.ceil(g.playClock)+' SEC');
  if(g.phase==='dead')this.banner(g.message.split(' · ')[0],g.message.includes('FIRST DOWN')?'Move the chains':'Next play in a moment');
  if(g.phase==='final')this.banner('FINAL  '+g.score[0]+' – '+g.score[1],g.score[0]===g.score[1]?'Tie game':this.team(g.teams[g.score[0]>g.score[1]?0:1]).name+' wins');
  if(g.phase==='kickmeter'){c.fillStyle='#102738ee';c.fillRect(mid-250,70,500,73);this.text('KICK IN THE GOLD ZONE',mid,94,17);c.fillStyle='#a9b9b9';c.fillRect(mid-200,112,400,9);c.fillStyle='#faca61';c.fillRect(mid-45,109,90,15);this.ellipse(mid+Math.sin(g.kick*2.5)*200,116,6,10,'#fff');}
 }
 person(v,g){
  const c=this.c,p=v.p,s=this.point(p.x,p.y),speed=Math.hypot(p.vx,p.vy),stride=Math.sin(g.time*(speed>1?12:2)+p.n),swing=speed>1?stride*5:0,team=this.team(g.teams[v.team]);
  c.save();c.translate(s.x,s.y);c.scale(s.scale,s.scale);
  this.ellipse(3,3,12,4,'#071e294d');if(v.selected){c.strokeStyle='#84ffe2';c.lineWidth=2.5;c.beginPath();c.ellipse(0,3,14,6,0,0,TAU);c.stroke();}
  const uniform=v.team===0?team.primary:'#e4e9e6',pants=v.team===0?'#d0d7db':team.primary;
  if(g.phase==='dead'&&v.ball)c.rotate(.75);
  // Articulated legs, knees, socks and cleats; shoulders taper into the jersey.
  const limb=(x,y,xx,yy,color,w)=>{c.lineCap='round';this.line(x,y,xx,yy,color,w);};
  for(const sign of [-1,1]){const step=sign*swing;limb(sign*3,-12,sign*4+step*.4,-6,pants,5);limb(sign*4+step*.4,-6,sign*4+step,0,'#e5e9e2',3.5);limb(sign*4+step,0,sign*4+step+3,1,'#19242a',3.8);}
  c.fillStyle=uniform;c.beginPath();c.moveTo(-8,-25);c.quadraticCurveTo(0,-28,8,-25);c.lineTo(6,-12);c.quadraticCurveTo(0,-10,-6,-12);c.closePath();c.fill();
  this.ellipse(-8,-24,4.5,4,uniform);this.ellipse(8,-24,4.5,4,uniform);
  const skin=['#b47750','#895836','#daaa82','#603e2b'][p.n%4];
  limb(-10,-23,-11-swing*.35,-17,skin,3.6);limb(-11-swing*.35,-17,-9-swing*.55,-14,skin,3.5);
  limb(10,-23,11+swing*.35,-17,skin,3.6);limb(11+swing*.35,-17,9+swing*.55,-14,skin,3.5);
  c.fillStyle=v.team===0?'#ffffff24':'#00000015';c.fillRect(-6,-24,4,11);
  this.text(String(p.n),0,-16,8,v.team===0?'#fff':team.primary);
  const helmet=c.createRadialGradient(-2,-36,1,0,-32,8);helmet.addColorStop(0,'#f6f8ef');helmet.addColorStop(.4,team.primary);helmet.addColorStop(1,'#172d38');this.ellipse(0,-31,7,7.7,helmet);limb(0,-38,0,-26,'#e5e9dd',1.7);
  const face=p.vx>=0?1:-1;this.ellipse(face*4,-29,3,3,'#222d30');limb(face*3,-30,face*8,-28,'#c8d0ca',1);limb(face*8,-28,face*7,-25,'#c8d0ca',1);limb(face*2,-25,face*7,-25,'#c8d0ca',1);
  if(v.ball)this.ball(10,-18,-.55,.6);
  if(v.receiver){this.ellipse(0,-51,9,9,'#f7d785');this.text(v.label,0,-47,11,'#203631');}
  if(v.selected){this.text('YOU',0,-45,9,'#a3ffe3');c.fillStyle='#193b39';c.fillRect(-12,11,24,3);c.fillStyle='#83e0bb';c.fillRect(-12,11,24*p.stamina,3);}
  c.restore();
 }
 ball(x,y,angle=0,scale=1){const c=this.c;c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);this.ellipse(0,0,9,5,'#3c241b');this.ellipse(-1,-1,8,4,'#986844');this.line(-4,-1,4,-1,'#f7edcf',1.3);for(let i=-3;i<=3;i+=2)this.line(i,-3,i,1,'#f7edcf',.8);c.restore();}
 banner(main,sub){const c=this.c,mid=this.canvas.width/2;c.fillStyle='#102735e8';c.fillRect(mid-290,571,580,67);this.text(main.slice(0,58),mid,598,18);this.text(sub.slice(0,68),mid,623,13,'#b8d8ce');}
 mini(g){const c=this.c;c.save();c.translate(this.canvas.width-1200,0);c.fillStyle='#102735e8';c.fillRect(989,15,194,61);c.strokeStyle='#729887';c.lineWidth=1;c.strokeRect(999,28,172,33);for(let n=0;n<=10;n++)this.line(999+n*17.2,28,999+n*17.2,61,'#769b7955');const x=999+clamp(g.attack[g.carrier].x,0,100)*1.72;this.ellipse(x,28+g.attack[g.carrier].y*.62,4,4,'#ffc95b');this.text('FIELD POSITION',1086,24,8,'#cfe2d5');c.restore();}
}
