// Lightweight perspective court: no remote textures or WebGL requirement.
const TAU=Math.PI*2;
const project=(x,y,z=0)=>({x:480+(x-480)*(.74+(y-90)/1500),y:172+(y-90)*.68-z});
function path(c,pts,fill,stroke,width=2){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function ground(c,pts,fill,stroke,w){path(c,pts.map(p=>project(...p)),fill,stroke,w);}
function line(c,a,b,color,w=3){c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
function ellipse(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function arc(c,x,y,r,start=0,end=TAU){let ps=[];for(let t=start;t<=end+.01;t+=.045)ps.push(project(x+Math.cos(t)*r,y+Math.sin(t)*r));c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
function text(c,t,x,y,size,color='#fff'){c.fillStyle=color;c.font=`700 ${size}px system-ui,Arial`;c.textAlign='center';c.fillText(t,x,y);}
let background;
function court(c){
 if(background){c.drawImage(background,0,0);return;}
 const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#b5d8e2');sky.addColorStop(.45,'#e2ebd7');sky.addColorStop(1,'#294e46');c.fillStyle=sky;c.fillRect(0,0,960,540);
 // Town buildings, distant trees and a fence establish the park setting.
 for(let i=0;i<12;i++){const x=i*88-30,h=32+(i%3)*15;c.fillStyle=['#8faeb0','#a6b6ab','#adc3bd'][i%3];c.fillRect(x,117-h,70,h+35);for(let j=0;j<3;j++){c.fillStyle='#dce6dc';c.fillRect(x+12+j*17,123-h,8,12);}}
 c.fillStyle='#638369';c.fillRect(0,140,960,400);
 for(let i=0;i<14;i++){let x=i*77-18;line(c,{x,y:149},{x,y:91},'#566c54',6);ellipse(c,x,95,31,35,'#618c6e');ellipse(c,x-15,110,25,22,'#749b74');ellipse(c,x+13,101,23,27,'#81a47a');}
 c.fillStyle='#b7b9a5';c.fillRect(0,146,960,26);
 for(let x=0;x<980;x+=25)line(c,{x,y:116},{x:x-40,y:169},'#516e6b44',1);
 for(let x=0;x<980;x+=25)line(c,{x,y:116},{x:x+40,y:169},'#516e6b44',1);
 for(let x=12;x<970;x+=125)line(c,{x,y:113},{x,y:172},'#4b6662',3);
 line(c,{x:0,y:116},{x:960,y:116},'#526d68',3);
 ground(c,[[50,65],[910,65],[930,510],[30,510]],'#244e49');
 ground(c,[[80,90],[880,90],[880,450],[80,450]],'#418b87','#dcece0',3);
 ground(c,[[80,190],[250,190],[250,350],[80,350]],'#214c61','#e0eeeb',2);
 ground(c,[[710,190],[880,190],[880,350],[710,350]],'#214c61','#e0eeeb',2);
 c.strokeStyle='#e0eeeb';c.lineWidth=2;arc(c,480,270,56);arc(c,250,270,60,-Math.PI/2,Math.PI/2);arc(c,710,270,60,Math.PI/2,Math.PI*1.5);
 arc(c,120,270,245,-Math.PI*.25,Math.PI*.25);arc(c,840,270,245,Math.PI*.75,Math.PI*1.25);
 line(c,project(480,90),project(480,450),'#dfefea',2);
 text(c,'TRANSITION TOWN',480,287,18,'#d6e9df88');text(c,'P A R K   C O U R T',480,310,10,'#d6e9df99');
 // Soft evening shadows, lamps and sideline seating.
 for(const x of [36,924]){line(c,{x,y:164},{x,y:30},'#35524f',5);line(c,{x,y:30},{x:x+(x<100?36:-36),y:30},'#35524f',5);ellipse(c,x+(x<100?36:-36),31,14,4,'#fff2cc');}
 for(const x of[270,620]){c.fillStyle='#b08b63';c.fillRect(x,140,70,7);c.fillRect(x,152,70,6);line(c,{x:x+7,y:154},{x:x+7,y:165},'#314f45',3);line(c,{x:x+63,y:154},{x:x+63,y:165},'#314f45',3);}
 text(c,'01   /   NEIGHBORHOOD HOOPS',480,47,14,'#304e50');
 const shade=c.createLinearGradient(0,450,0,540);shade.addColorStop(0,'#12312b00');shade.addColorStop(1,'#102e2b99');c.fillStyle=shade;c.fillRect(0,440,960,100);
 background=document.createElement('canvas');background.width=960;background.height=540;background.getContext('2d').drawImage(c.canvas,0,0);
}
function hoop(c,x){
 const p=project(x,270),dir=x<480?-1:1;
 line(c,{x:p.x+dir*23,y:p.y+20},{x:p.x+dir*23,y:p.y-110},'#203f4d',7);
 line(c,{x:p.x+dir*23,y:p.y-104},{x:p.x,y:p.y-95},'#203f4d',5);
 c.fillStyle='#e5f4f3bb';c.strokeStyle='#effaf6';c.lineWidth=3;c.fillRect(p.x-25,p.y-125,50,39);c.strokeRect(p.x-25,p.y-125,50,39);c.strokeRect(p.x-11,p.y-106,22,17);
 for(let i=-12;i<=12;i+=6){line(c,{x:p.x+i,y:p.y-85},{x:p.x+i*.65,y:p.y-63},'#f7fcf1cc',1.3);}
 line(c,{x:p.x-9,y:p.y-70},{x:p.x+9,y:p.y-70},'#edf5ed',1);
 ellipse(c,p.x,p.y-86,17,6,null,'#ff8248');
}
function athlete(c,p,side,g,selected){
 const b=g.basket,base=project(p.x,p.y),scale=.78+(p.y-90)/1100,jump=Math.sin((b.jumps[side]||0)/.65*Math.PI)*25;
 const moving=b.motion?.[side]||0,phase=g.time*13+side,swing=Math.sin(phase)*moving;
 ellipse(c,base.x+7,base.y+4,20*scale,7*scale,'#08242f55');
 if(selected)ellipse(c,base.x,base.y+3,23*scale,8*scale,null,side===0?'#a8dbff':'#ffcba8');
 c.save();c.translate(base.x,base.y-jump);c.scale(scale,scale);
 const skin=side===0?'#9f6448':'#d29c74',jersey=side===0?'#638bf7':'#fb8555',dark=side===0?'#304991':'#b44e36';
 // Articulated legs, sneakers, arms, jersey and face.
 const knee1={x:-7+swing*8,y:-17},knee2={x:7-swing*8,y:-17};
 line(c,{x:-7,y:-32},knee1,skin,8);line(c,knee1,{x:-9-swing*8,y:-3},skin,7);
 line(c,{x:7,y:-32},knee2,skin,8);line(c,knee2,{x:10+swing*8,y:-3},skin,7);
 line(c,{x:-12-swing*8,y:-2},{x:-3-swing*8,y:-2},'#f0f5f4',6);line(c,{x:6+swing*8,y:-2},{x:17+swing*8,y:-2},'#f0f5f4',6);
 const shooting=(b.jumps[side]||0)>.1;let hand=shooting?-83:-43+Math.sin(g.time*10)*6;
 line(c,{x:-12,y:-56},{x:-20,y:shooting?-69:-39-swing*5},skin,7);line(c,{x:-20,y:shooting?-69:-39-swing*5},{x:shooting?-10:-13,y:shooting?-81:-31-swing*7},skin,6);
 line(c,{x:12,y:-56},{x:20,y:shooting?-69:-43},skin,7);line(c,{x:20,y:shooting?-69:-43},{x:shooting?8:25,y:hand},skin,6);
 path(c,[{x:-12,y:-59},{x:12,y:-59},{x:13,y:-34},{x:-13,y:-34}],jersey);
 path(c,[{x:-13,y:-35},{x:13,y:-35},{x:14,y:-24},{x:2,y:-24},{x:0,y:-29},{x:-2,y:-24},{x:-14,y:-24}],dark);
 line(c,{x:-9,y:-57},{x:-9,y:-37},'#ffffff88',2);line(c,{x:9,y:-57},{x:9,y:-37},'#ffffff88',2);
 ellipse(c,0,-69,9,11,skin);ellipse(c,0,-76,9,5,'#28282c');line(c,{x:-4,y:-67},{x:0,y:-67},'#272830',1);line(c,{x:4,y:-67},{x:5,y:-67},'#272830',1);
 text(c,side===0?'01':'02',0,-42,12);c.restore();
 text(c,selected?'YOU':g.cpu&&side===1?'CPU':'P'+(side+1),base.x,base.y+22,11,side===0?'#d7e7ff':'#ffe2cb');
}
function basketball(c,x,y,z){const p=project(x,y,z),shadow=project(x,y);ellipse(c,shadow.x+5,shadow.y+3,9,4,'#152f3244');
 const grad=c.createRadialGradient(p.x-3,p.y-4,1,p.x,p.y,10);grad.addColorStop(0,'#ffd17e');grad.addColorStop(.6,'#e99238');grad.addColorStop(1,'#a84b20');ellipse(c,p.x,p.y,9,9,grad,'#71361f');line(c,{x:p.x-8,y:p.y},{x:p.x+8,y:p.y},'#71361f',1);line(c,{x:p.x,y:p.y-8},{x:p.x,y:p.y+8},'#71361f',1);c.strokeStyle='#71361f';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,4,8,.3,0,TAU);c.stroke();}
export function drawBasketball(c,g,side){
 court(c);const b=g.basket;
 hoop(c,120);hoop(c,840);
 [...b.players.keys()].sort((a,d)=>b.players[a].y-b.players[d].y).forEach(i=>athlete(c,b.players[i],i,g,side===i));
 if(b.shot){const q=b.shot,t=Math.min(1,q.t/q.duration);basketball(c,q.from.x+(q.to.x-q.from.x)*t,q.from.y+(q.to.y-q.from.y)*t,48+(86-48)*t+Math.sin(t*Math.PI)*105);}
 else if(b.owner!==null){const p=b.players[b.owner];basketball(c,p.x+23,p.y,9+Math.abs(Math.sin(g.time*10))*29);}
 else if(b.loose)basketball(c,b.loose.x,b.loose.y,9);
 text(c,'P2  ←  ATTACK',211,412,12,'#ffcfb5');text(c,'ATTACK  →  P1',746,412,12,'#c9ddff');
 if(b.owner!==null){const p=b.players[b.owner],d=Math.hypot(p.x-(b.owner===0?840:120),p.y-270);text(c,(d>245?'3 POINT RANGE':'2 POINT RANGE')+'   •   '+Math.ceil(b.clock)+'s',480,132,12,'#f8ffe7');}
}
