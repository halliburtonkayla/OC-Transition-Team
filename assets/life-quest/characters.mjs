// Life Quest owns this renderer. Town profiles are read-only inputs; the original
// Mission's face-cropping renderer is intentionally not imported.
import {atlasCells} from './atlas-grid.mjs';
const sheets=new Map(),variants=new Map();
const RGB=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const valid=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(value||'')?value:fallback;
export function characterStyle(avatar={}){
 return {skin:valid(avatar.skin,'#b47b58'),hair:valid(avatar.hair,'#302623'),shirt:valid(avatar.shirt,'#328c7d'),pants:valid(avatar.pants,'#344e62'),hairStyle:['Classic','Short','Curls','Long','Braids'].includes(avatar.hairStyle)?avatar.hairStyle:'Classic',outfit:String(avatar.outfit||'Everyday').slice(0,24),gender:avatar.gender==='male'?'male':'female'};
}
function loadSheet(name){
 if(sheets.has(name))return sheets.get(name);
 const asset={image:new Image(),cells:null,error:false};sheets.set(name,asset);
 asset.image.onload=()=>{
  try{
   const im=asset.image,canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);
   const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   asset.cells=atlasCells(canvas.width,canvas.height,4,4).map(({x:ox,y:oy,w,h})=>{
    let x0=w,y0=h,x1=0,y1=0;
    for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++)if(data[((oy+y)*canvas.width+ox+x)*4+3]>180){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    return {x:ox+x0,y:oy+y0,w:x1-x0+1,h:y1-y0+1};
   });
  }catch{asset.error=true;}
 };
 asset.image.onerror=()=>{asset.error=true;};
 asset.image.src=new URL(name==='avery'?'./art/explorer-sprites.webp':'./art/jordan-sprites.webp',import.meta.url).href;
 return asset;
}
// The glasses sheet is used only when the saved outfit actually requests glasses.
// The other sheet is a neutral clothed body with optional saved hair/accessories.
const sheetName=a=>a.gender==='female'&&/glasses/i.test(a.outfit)?'avery':'jordan';
function coloredFrame(asset,cell,a,row){
 const canvas=document.createElement('canvas');canvas.width=160;canvas.height=320;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=cell.w/cell.h*300,left=(160-w)/2;
 ctx.drawImage(asset.image,cell.x,cell.y,cell.w,cell.h,left,10,w,300);
 const pixels=ctx.getImageData(0,0,160,320),d=pixels.data,colors=Object.fromEntries(['skin','hair','shirt','pants'].map(k=>[k,RGB(a[k])]));
 for(let y=0;y<320;y++)for(let x=0;x<160;x++){
  const i=(y*160+x)*4;if(d[i+3]<110){d[i+3]=0;continue;}
  const r=d[i],g=d[i+1],b=d[i+2],nx=(x-left)/w,ny=(y-10)/300,luma=.2126*r+.7152*g+.0722*b;
  const warm=r>g*1.13&&g>b*.97&&r-b>22;
  let zone=null,base=1;
  if(warm&&((ny<.34&&ny>.08)||(ny>.47&&ny<.70&&(nx<.26||nx>.72)))){zone='skin';base=139;}
  else if(ny<.30&&luma<88&&!warm){zone='hair';base=40;}
  else if(ny>.29&&ny<.55&&!warm){zone='shirt';base=55;}
  else if(ny>.55&&ny<.93&&b>r*1.03&&!warm){zone='pants';base=99;}
  if(zone){const k=Math.max(.28,Math.min(1.65,luma/base));for(let c=0;c<3;c++)d[i+c]=Math.min(255,colors[zone][c]*k);}
 }
 ctx.putImageData(pixels,0,0);
 // Saved hair silhouettes are part of the same cached animation frame.
 // Keep the expressive face and the directional body animation from the atlas.
 const cx=80,headY=42,hair=colors.hair,shade=`rgb(${hair.map(v=>Math.round(v*.60)).join(',')})`;
 ctx.lineCap='round';ctx.lineJoin='round';ctx.fillStyle=a.hair;ctx.strokeStyle=shade;
 const long=a.hairStyle==='Long',braids=a.hairStyle==='Braids';
 if(long||braids){
  const xs=row===0?[cx-21,cx+21]:row===2?[cx-17,cx+17]:[cx+(row===1?-15:15)];
  ctx.save();if(long)ctx.globalCompositeOperation='destination-over';
  for(const x of xs){
   const g=ctx.createLinearGradient(x-7,0,x+7,0);g.addColorStop(0,shade);g.addColorStop(.55,a.hair);g.addColorStop(1,shade);ctx.strokeStyle=g;ctx.lineWidth=long?12:5;
   ctx.beginPath();ctx.moveTo(x,headY);ctx.bezierCurveTo(x+(x<cx?-8:8),68,x+(x<cx?-10:10),93,x+(x<cx?-6:6),113);ctx.stroke();
   if(long){ctx.strokeStyle='#ffffff18';ctx.lineWidth=1;for(let strand=-3;strand<=3;strand+=3){ctx.beginPath();ctx.moveTo(x+strand,headY+3);ctx.bezierCurveTo(x+strand+(x<cx?-8:8),68,x+strand+(x<cx?-10:10),93,x+strand+(x<cx?-6:6),109);ctx.stroke();}}
   if(braids){ctx.strokeStyle='#ffffff22';ctx.lineWidth=1;for(let y=56;y<116;y+=7){ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y+4);ctx.stroke();}}
  }ctx.restore();
 }
 if(a.hairStyle==='Curls'){
  for(let i=0;i<9;i++){const theta=Math.PI+i/8*Math.PI,x=cx+Math.cos(theta)*21,y=headY+Math.sin(theta)*20;ctx.fillStyle=i%2?a.hair:shade;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();}
 }
 if(a.hairStyle==='Classic'||a.hairStyle==='Short'){
  ctx.fillStyle=a.hair;ctx.beginPath();ctx.moveTo(cx-23,headY+1);ctx.quadraticCurveTo(cx-23,headY-28,cx+10,headY-24);ctx.quadraticCurveTo(cx+27,headY-20,cx+23,headY-3);ctx.quadraticCurveTo(cx+12,headY-13,cx-2,headY-8);ctx.quadraticCurveTo(cx-15,headY-6,cx-23,headY+1);ctx.fill();
 }
 if(/glasses/i.test(a.outfit)&&sheetName(a)!=='avery'&&row!==2){
  ctx.strokeStyle='#222935';ctx.lineWidth=2;
  if(row===0){for(const x of [cx-11,cx+11]){ctx.beginPath();ctx.roundRect(x-9,57,18,13,5);ctx.stroke();}ctx.beginPath();ctx.moveTo(cx-2,62);ctx.lineTo(cx+2,62);ctx.stroke();}
  else{ctx.beginPath();ctx.roundRect(row===1?82:60,56,19,14,5);ctx.stroke();}
 }
 if(/work|interview|formal/i.test(a.outfit)){
  ctx.fillStyle='#f7f4e8';ctx.beginPath();ctx.moveTo(70,105);ctx.lineTo(80,120);ctx.lineTo(90,105);ctx.lineTo(86,101);ctx.lineTo(80,108);ctx.lineTo(74,101);ctx.closePath();ctx.fill();
  if(/interview|formal/i.test(a.outfit)){ctx.fillStyle='#28405e';ctx.beginPath();ctx.moveTo(80,115);ctx.lineTo(76,135);ctx.lineTo(80,141);ctx.lineTo(84,135);ctx.closePath();ctx.fill();}
 }
 return canvas;
}
function framesFor(avatar){
 const a=characterStyle(avatar),key=JSON.stringify(a),asset=loadSheet(sheetName(a));
 if(!asset.cells)return {asset,frames:null};
 if(!variants.has(key)){
  if(variants.size>=16)variants.delete(variants.keys().next().value);
  variants.set(key,Array(16).fill(null));
 }
 return {asset,frames:variants.get(key)};
}
loadSheet('avery');loadSheet('jordan');
export function drawAvatar(ctx,x,y,avatar,time=0,moving=false,jumping=false,facing=1,scale=1,owner=null,direction=null){
 const {asset,frames}=framesFor(avatar),row={front:0,right:1,back:2,left:3}[direction||(!moving?'front':facing<0?'left':'right')];
 const frame=jumping?2:moving?[1,2,3,2][Math.floor(time*.85)%4]:0;
 ctx.save();ctx.fillStyle='#071b3650';ctx.beginPath();ctx.ellipse(x,y+2,21*scale,5*scale,0,0,Math.PI*2);ctx.fill();
 if(frames){const index=row*4+frame;frames[index]??=coloredFrame(asset,asset.cells[index],characterStyle(avatar),row);ctx.drawImage(frames[index],x-31.5*scale,y-124*scale,63*scale,126*scale);}
 else if(asset.image.complete&&asset.image.naturalWidth){const w=asset.image.naturalWidth/4,h=asset.image.naturalHeight/4;ctx.drawImage(asset.image,frame*w,row*h,w,h,x-50*scale,y-118*scale,100*scale,118*scale);}
 else{ctx.fillStyle='#f5d270';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('◆',x,y-30*scale);}
 ctx.restore();
}
