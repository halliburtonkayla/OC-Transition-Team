// Cached room art keeps lighting and texture work out of the animation loop.
const scenes=new Map();
const box=(c,x,y,w,h,color,r=0)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const line=(c,x,y,xx,yy,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
function scene(id){
 if(scenes.has(id))return scenes.get(id);
 const cv=document.createElement('canvas');cv.width=960;cv.height=540;const c=cv.getContext('2d');
 const garden=[8,20].includes(id),work=[3,10,14,16].includes(id),home=[15,19].includes(id),wood=home||id===5;
 const floor=c.createLinearGradient(0,55,960,540);floor.addColorStop(0,garden?'#a8c79b':wood?'#b39675':work?'#70869a':'#d6cbbc');floor.addColorStop(1,garden?'#638f71':wood?'#d3b28a':work?'#a7b6bd':'#f1e5cf');c.fillStyle=floor;c.fillRect(0,48,960,492);
 if(garden){
  c.strokeStyle='#e8d9b4';c.lineWidth=86;c.lineCap='round';c.beginPath();c.moveTo(70,455);c.bezierCurveTo(450,475,150,110,800,120);c.stroke();
  for(let i=0;i<95;i++){const x=(i*173)%960,y=65+(i*97)%465;c.fillStyle=i%3?'#ffffff18':'#2f69492b';c.fillRect(x,y,3,2);}
  for(const [x,y]of [[35,140],[910,300],[480,65],[30,320]]){
   box(c,x-6,y,13,40,'#76533a',4);for(const [dx,dy,r,color]of [[0,-15,29,'#427a55'],[-13,-25,24,'#659565'],[15,-35,22,'#96b979']]){c.fillStyle=color;c.beginPath();c.arc(x+dx,y+dy,r,0,Math.PI*2);c.fill();}
  }
 }else{
  for(let y=60,row=0;y<540;y+=wood?28:60,row++){
   line(c,0,y,960,y,wood?'#74584438':'#6e85852b');
   for(let x=wood?row%2*80:row%2*30;x<960;x+=wood?170:60)line(c,x,y,x,y+(wood?28:60),'#6d79742d');
   if(wood)line(c,0,y+2,960,y+2,'#fff3cf20');
  }
  const wall=c.createLinearGradient(0,0,0,85);wall.addColorStop(0,work?'#223b56':'#4f6985');wall.addColorStop(.85,work?'#58738a':'#9eb1b9');wall.addColorStop(1,'#354557');box(c,0,0,960,82,wall);box(c,0,77,960,8,'#32455c');box(c,0,85,960,6,'#132b4330');
  for(const x of [35,810]){
   box(c,x,13,115,54,'#203d57',3);box(c,x+4,17,107,46,'#a4dae3',2);line(c,x+57,17,x+57,63,'#e1e9dc',4);line(c,x+4,41,x+111,41,'#dfebe9',3);
   c.fillStyle='#fff7d31b';c.beginPath();c.moveTo(x+4,90);c.lineTo(x+111,90);c.lineTo(x+240,500);c.lineTo(x-100,500);c.fill();
  }
  if(id===7){
   for(let x=160;x<800;x+=48){box(c,x,12,46,43,x%96?'#c0c9c1':'#e3e6d5');line(c,x+3,51,x+43,51,'#879d9b',2);}
   box(c,40,89,880,14,'#343e49',3);box(c,40,91,880,6,'#eee4cf');
  }
  if(work){
   c.setLineDash([12,8]);c.strokeStyle='#f2d472aa';c.lineWidth=3;c.strokeRect(65,103,830,398);c.setLineDash([]);
   for(const x of [17,925])for(let y=150;y<470;y+=50){box(c,x,y,18,6,'#f4ca69');box(c,x,y+7,18,6,'#263e53');}
  }
  if(id===5){for(const x of [24,917]){box(c,x,100,17,350,'#6a513e',3);box(c,x+3,100,4,350,'#ccad78');}}
 }
 // Soft frame lighting without obscuring the walkable playfield.
 const shade=c.createRadialGradient(480,240,100,480,270,570);shade.addColorStop(0,'#091e3300');shade.addColorStop(1,'#081b3438');c.fillStyle=shade;c.fillRect(0,0,960,540);
 scenes.set(id,cv);return cv;
}
export function drawRoomScene(ctx,id,title){
 ctx.drawImage(scene(id),0,0);
 box(ctx,240,17,480,36,'#112d53ee',8);ctx.font='800 15px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff0c7';ctx.fillText(title.toUpperCase(),480,41);
}
