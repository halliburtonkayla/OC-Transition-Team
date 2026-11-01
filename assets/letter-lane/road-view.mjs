import {ROAD,jumpHeight,nextLetter} from './runner.mjs';

export function projectRoad(z,lane,width,height){
 const scale=60/(Math.max(-20,z)+60);
 const horizon=width/height<1.1?Math.min(height*.72,width*.83)*.445:height*.42;
 return {x:width*.5+(lane-1)*width*.28*scale,y:horizon+(height*.84-horizon)*scale,scale};
}
function pathStar(ctx,x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,s=i%2?r*.46:r;const px=x+Math.cos(a)*s,py=y+Math.sin(a)*s;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();}
function shadow(ctx,x,y,w,h,alpha=.22){ctx.fillStyle=`rgba(12,30,38,${alpha})`;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,Math.PI*2);ctx.fill();}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
export function createRoadView(canvas,onReady=()=>{}){
 const ctx=canvas.getContext('2d'),landscape=new Image(),texture=document.createElement('canvas');let loaded=false,pattern=null;
 texture.width=texture.height=256;
 landscape.onload=()=>{loaded=true;const t=texture.getContext('2d');
  // Mirror the asphalt sample so repeated tiles meet without visible seams.
  for(const mx of [0,1])for(const my of [0,1]){t.save();t.translate(mx?256:0,my?256:0);t.scale(mx?-1:1,my?-1:1);t.drawImage(landscape,landscape.naturalWidth*.4,landscape.naturalHeight*.82,landscape.naturalWidth*.18,landscape.naturalHeight*.16,0,0,128,128);t.restore();}
  pattern=ctx?.createPattern(texture,'repeat');onReady();};
 landscape.src='assets/letter-lane/landscape.webp';
 function letter(e,p,size,highlight,uppercase,time,calm){
  const x=p.x,y=p.y-size*.9;
  shadow(ctx,x,p.y,size*.47,size*.12);
  if(highlight){const glow=ctx.createRadialGradient(x,y,1,x,y,size*.9);glow.addColorStop(0,'#fff9acaa');glow.addColorStop(1,'#ffef6600');ctx.fillStyle=glow;ctx.fillRect(x-size,y-size,size*2,size*2);}
  const g=ctx.createLinearGradient(x-size*.5,y-size*.5,x+size*.5,y+size*.6);g.addColorStop(0,'#fffeec');g.addColorStop(.5,highlight?'#ffe071':'#fff0bb');g.addColorStop(1,'#e7ab3b');
  rounded(ctx,x-size*.5,y-size*.55,size,size*1.05,size*.23);ctx.fillStyle='#a96d24';ctx.save();ctx.translate(0,size*.075);ctx.fill();ctx.restore();ctx.fillStyle=g;ctx.fill();ctx.lineWidth=Math.max(1.5,size*.043);ctx.strokeStyle=highlight?'#fff9bd':'#fff0bd';ctx.stroke();
  rounded(ctx,x-size*.42,y-size*.47,size*.84,size*.87,size*.17);ctx.strokeStyle='#e3b952';ctx.lineWidth=Math.max(1,size*.02);ctx.stroke();
  ctx.fillStyle='#fff9df99';rounded(ctx,x-size*.35,y-size*.41,size*.7,size*.25,size*.12);ctx.fill();
  ctx.font=`900 ${size*.72}px "Trebuchet MS",Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#4b3c25';ctx.fillText(uppercase?e.letter.toUpperCase():e.letter,x,y+size*.02);
  if(highlight){ctx.fillStyle='#fffce4';ctx.font=`900 ${Math.max(12,size*.38)}px Arial`;ctx.fillText('▼',x,y-size*.85);}
 }
 function coin(e,p,size,time,calm){
  const power=e.kind==='jump'||e.kind==='boost',spin=calm?1:Math.max(.38,Math.abs(Math.cos(time*2.2+e.at*.03))),r=size*.43;
  const y=p.y-r*1.1-(calm?0:Math.sin(time*3+e.at*.09)*3*p.scale);
  shadow(ctx,p.x,p.y,r*.7,r*.2);
  ctx.save();ctx.translate(p.x,y);ctx.scale(spin,1);
  if(power){ctx.shadowColor=e.kind==='jump'?'#9afff2':'#73bdff';ctx.shadowBlur=15*p.scale;}
  let g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#fff8ba');g.addColorStop(.27,'#ffe779');g.addColorStop(.56,'#d79727');g.addColorStop(.8,'#fff09e');g.addColorStop(1,'#ac6822');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#b57921';ctx.lineWidth=Math.max(1,r*.09);ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,r*.76,0,Math.PI*2);ctx.fillStyle=power?(e.kind==='jump'?'#268b87':'#416eab'):'#edb33a';ctx.fill();ctx.strokeStyle='#fff1a9';ctx.lineWidth=Math.max(1,r*.055);ctx.stroke();
  ctx.fillStyle=power?'#fffbda':'#fff0a5';ctx.font=`900 ${r*1.22}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.kind==='jump'?'↑':e.kind==='boost'?'ϟ':'★',0,r*.04);
  ctx.strokeStyle='#fffbd8';ctx.lineWidth=Math.max(1,r*.08);ctx.beginPath();ctx.arc(0,0,r*.9,Math.PI*1.08,Math.PI*1.65);ctx.stroke();ctx.restore();
 }
 function cone(p,size){
  const x=p.x,y=p.y;
  shadow(ctx,x,y+size*.04,size*.6,size*.15,.28);
  ctx.fillStyle='#24373b';ctx.beginPath();ctx.moveTo(x-size*.61,y-size*.07);ctx.lineTo(x-size*.34,y-size*.25);ctx.lineTo(x+size*.53,y-size*.18);ctx.lineTo(x+size*.64,y+size*.06);ctx.lineTo(x-size*.42,y+size*.15);ctx.closePath();ctx.fill();
  const g=ctx.createLinearGradient(x-size*.4,0,x+size*.4,0);g.addColorStop(0,'#dc4c1d');g.addColorStop(.35,'#ffab4a');g.addColorStop(.65,'#ff792c');g.addColorStop(1,'#a9371a');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-size*.4,y-size*.1);ctx.quadraticCurveTo(x-size*.18,y-size*.65,x-size*.09,y-size*1.02);ctx.quadraticCurveTo(x,y-size*1.09,x+size*.09,y-size*1.02);ctx.quadraticCurveTo(x+size*.18,y-size*.65,x+size*.4,y-size*.1);ctx.quadraticCurveTo(x,y+size*.04,x-size*.4,y-size*.1);ctx.fill();
  for(const [top,bottom] of [[.76,.62],[.42,.26]]){ctx.fillStyle='#fff5de';ctx.beginPath();ctx.moveTo(x-size*(.4-.3*top),y-size*top);ctx.quadraticCurveTo(x,y-size*(top-.04),x+size*(.4-.3*top),y-size*top);ctx.lineTo(x+size*(.4-.3*bottom),y-size*bottom);ctx.quadraticCurveTo(x,y-size*(bottom-.055),x-size*(.4-.3*bottom),y-size*bottom);ctx.closePath();ctx.fill();}
  ctx.strokeStyle='#ffd99799';ctx.lineWidth=Math.max(1,size*.035);ctx.beginPath();ctx.moveTo(x-size*.05,y-size*.94);ctx.lineTo(x-size*.29,y-size*.18);ctx.stroke();
 }
 function scenery(distance,w,h,calm){
  for(let n=0;n<11;n++){const z=(((n*35-distance)%385)+385)%385;if(z>ROAD.far)continue;
   for(const lane of [-.9,2.9]){const p=projectRoad(z,lane,w,h),s=Math.min(80,w*.12)*p.scale;if(p.x<-s||p.x>w+s)continue;
    shadow(ctx,p.x,p.y,s*.23,s*.065,.2);
    const g=ctx.createLinearGradient(p.x-s*.1,0,p.x+s*.1,0);g.addColorStop(0,'#e0e2d6');g.addColorStop(.35,'#fff9e7');g.addColorStop(1,'#a9b6af');ctx.fillStyle=g;
    rounded(ctx,p.x-s*.1,p.y-s*.92,s*.2,s*.92,s*.045);ctx.fill();
    ctx.fillStyle='#384c53';ctx.fillRect(p.x-s*.1,p.y-s*.82,s*.2,s*.2);
    ctx.fillStyle=lane<1?'#df744b':'#f7db83';ctx.fillRect(p.x-s*.065,p.y-s*.78,s*.13,s*.09);
    ctx.fillStyle='#ffffff77';ctx.fillRect(p.x-s*.06,p.y-s*.51,s*.025,s*.4);
   }
  }
 }
 function draw(race,{calm=false,uppercase=false,guided=false}={}){
  if(!ctx)return;
  const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const time=race?.elapsed||0,distance=race?.distance||0;
  if(loaded){
   if(w/h<1.1){const artH=Math.min(h*.72,w*.83);ctx.drawImage(landscape,0,0,landscape.naturalWidth,landscape.naturalHeight,0,0,w,artH);ctx.save();ctx.translate(0,h+artH);ctx.scale(1,-1);ctx.drawImage(landscape,0,landscape.naturalHeight*.71,landscape.naturalWidth,landscape.naturalHeight*.29,0,artH,w,h-artH);ctx.restore();}
   else ctx.drawImage(landscape,0,0,w,h);
  }else{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#78d3e6');g.addColorStop(.43,'#bde7bc');g.addColorStop(.44,'#6ea352');g.addColorStop(1,'#537449');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  if(!race)return;
  const top=projectRoad(2000,1,w,h).y;
  ctx.save();ctx.beginPath();ctx.moveTo(w*.49,top);ctx.lineTo(w*.51,top);ctx.lineTo(w*1.3,h*1.1);ctx.lineTo(-w*.3,h*1.1);ctx.closePath();ctx.clip();
  if(pattern){ctx.translate(0,(distance*5)%256);ctx.fillStyle=pattern;ctx.fillRect(0,-256,w,h+256);ctx.translate(0,-(distance*5)%256);}else{ctx.fillStyle='#68747b';ctx.fillRect(0,top,w,h-top);}
  const roadLight=ctx.createLinearGradient(0,top,0,h);roadLight.addColorStop(0,'#839096a8');roadLight.addColorStop(.5,'#62727c22');roadLight.addColorStop(1,'#2e42472b');ctx.fillStyle=roadLight;ctx.fillRect(0,top,w,h-top);ctx.restore();
  for(let z=ROAD.far;z>-20;z-=4){
   const a=projectRoad(z,1,w,h),b=projectRoad(z-4,1,w,h),halfA=w*.48*a.scale,halfB=w*.48*b.scale;
   for(const sign of [-1,1]){const xa=w*.5+halfA*sign,xb=w*.5+halfB*sign;ctx.strokeStyle=(Math.floor((distance+z)/18)%2)?'#fff8df':'#e7b749';ctx.lineWidth=2+4*b.scale;ctx.beginPath();ctx.moveTo(xa,a.y);ctx.lineTo(xb,b.y);ctx.stroke();}
   if(Math.floor((distance+z)/12)%2===0)for(const lane of [.5,1.5]){const pa=projectRoad(z,lane,w,h),pb=projectRoad(z-4,lane,w,h);ctx.strokeStyle='#faf1d0b5';ctx.lineWidth=1+3*b.scale;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();}
  }
  scenery(distance,w,h,calm);
  const target=nextLetter(race),maxSize=Math.min(116,w*.18);
  for(const e of [...race.entities].sort((a,b)=>b.at-a.at)){
   const z=e.at-distance;if(z>ROAD.far||z<0)continue;
   const p=projectRoad(z,e.lane,w,h),size=maxSize*p.scale;
   if(e.kind==='letter')letter(e,p,size,guided&&e.id===target?.id,uppercase,time,calm);
   else if(e.kind==='cone')cone(p,size*.9);
   else if(e.kind==='star'){
    const y=p.y-size*.7;shadow(ctx,p.x,p.y,size*.28,size*.07,.13);const g=ctx.createLinearGradient(p.x-size*.4,y-size*.4,p.x+size*.4,y+size*.4);g.addColorStop(0,'#fff8c8');g.addColorStop(.4,'#ffdd62');g.addColorStop(1,'#df8e26');pathStar(ctx,p.x,y,size*.4);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#ad7627';ctx.lineWidth=Math.max(1,size*.025);ctx.stroke();
   }else coin(e,p,size,time,calm);
  }
  if(race.boostOn&&race.boostFuel>0&&!calm){
   const p=projectRoad(0,race.x,w,h),y=h*.96;
   for(const sign of [-1,1]){const x=p.x+sign*Math.min(32,w*.045);const g=ctx.createLinearGradient(0,y-18,0,y+35);g.addColorStop(0,'#e7fbff');g.addColorStop(.4,'#6bd3ffbb');g.addColorStop(1,'#4d8bff00');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-7,y-12);ctx.quadraticCurveTo(x-11,y+12,x,y+33+Math.sin(time*27)*7);ctx.quadraticCurveTo(x+11,y+12,x+7,y-12);ctx.closePath();ctx.fill();}
   ctx.strokeStyle='#dffaff88';ctx.lineWidth=2;for(let i=0;i<8;i++){const z=(i*41-distance*2)%310,p1=projectRoad(Math.abs(z),i%2?-1:3,w,h),p2=projectRoad(Math.abs(z)-15,i%2?-1:3,w,h);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();}
  }
 }
 return {draw,project:(z,lane)=>{const r=canvas.getBoundingClientRect();return projectRoad(z,lane,r.width,r.height);}};
}
