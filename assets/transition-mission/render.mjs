import {CAREERS,PORTALS,WORLD_END} from './careers.mjs';
const TAU=Math.PI*2;
const round=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const circle=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();};
function gradient(c,x,y,w,h,a,b){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
export function iconSVG(name='star',color='currentColor'){
 const paths={basket:'<path d="m7 10 5-7 5 7M3 10h18l-2 11H5Z"/><path d="M8 13v5m4-5v5m4-5v5"/>',pizza:'<path d="M4 4q9-4 16 6L5 21Z"/><path d="m4 7 13 5"/><circle cx="8" cy="11" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="12" cy="12" r="1"/>',paw:'<ellipse cx="12" cy="16" rx="5" ry="4"/><ellipse cx="5" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="5" rx="2" ry="3"/><ellipse cx="20" cy="10" rx="2" ry="3"/>',book:'<path d="M12 6Q7 2 2 5v15q5-3 10 0 5-3 10 0V5q-5-3-10 1v14"/>',medical:'<path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5Z"/>',bank:'<path d="M2 8 12 2l10 6ZM3 21h18M5 10v8m7-8v8m7-8v8"/>',tire:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5m0 8v5M3 12h5m8 0h5m-10-2 6 6m0-6-6 6"/>',folder:'<path d="M2 6h8l2 3h10v12H2Z"/><path d="M3 3h7l2 3h9v3"/>',crate:'<path d="M3 5h18v16H3ZM3 10h18M7 5v16m10-16v16M3 15h18"/>',cup:'<path d="M4 7h12v8a6 6 0 0 1-12 0ZM16 8h3a3 3 0 0 1 0 6h-3M3 22h16M7 1v3m5-3v3"/>',helmet:'<path d="M3 17h18M5 17v-5a7 7 0 0 1 14 0v5M9 5v7m6-7v7M3 17v4h18v-4"/>',computer:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4m-5 0h10"/>',flower:'<path d="M12 14v8m0-3q5-7 9-3-3 5-9 3m0-2q-5-7-9-3 3 5 9 3"/><circle cx="12" cy="8" r="3"/><path d="M12 5q-8-7-6 1-8 1-1 5 0 7 6 2 6 5 7-1 7-4 0-6 1-7-6-1Z"/>',leaf:'<path d="M4 20Q1 3 21 3q0 17-17 17ZM4 20 16 8"/>',bolt:'<path d="m14 2-9 12h7l-2 8 9-13h-7Z"/>',mail:'<rect x="2" y="5" width="20" height="15" rx="2"/><path d="m2 6 10 8L22 6"/>',van:'<path d="M2 5h12v13H2ZM14 9h5l3 5v4h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',comb:'<path d="M3 4h18v5H3Zm1 5v10m4-10v10m4-10v10m4-10v10m4-10v10"/>',art:'<path d="M12 2C-1 2-1 22 10 22c6 0 2-6 6-6 9 1 9-14-4-14Z"/><circle cx="7" cy="8" r="1"/><circle cx="12" cy="6" r="1"/><circle cx="17" cy="9" r="1"/>',bed:'<path d="M2 6v16m20-10v10M2 17h20M4 12h18v5H2v-5h8V8H4Z"/>',ball:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2q-8 10 0 20m0-20q8 10 0 20"/>',drop:'<path d="M12 2Q-2 18 12 22 26 18 12 2Z"/>',fan:'<circle cx="12" cy="12" r="2"/><path d="M10 10C-4 3 11-4 12 10m2 0C21-4 28 11 14 12m0 2c14 7-1 14-2 0m-2 0C3 28-4 13 10 12"/>',clean:'<path d="m14 2-4 10m-4 1 9 3-2 6-11-4Zm11-5h5m-2-2v4"/>',plate:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><path d="M1 3v18m22-18v18"/>',bread:'<path d="M4 9C-2 1 25 1 20 9v12H4Z"/><path d="M8 4 6 8m8-4-2 4m7-3-2 4"/>',apple:'<path d="M12 7C-3 0 1 24 12 21 23 24 27 0 12 7Zm0-1 2-5m-2 5q-7-7-7-1Z"/>',milk:'<path d="M7 2h10l4 6v14H3V8Zm0 0v6h14M3 8l4-6M7 13h10v5H7Z"/>',pencil:'<path d="m3 21 2-7L17 2l5 5L10 19Zm2-7 5 5M15 4l5 5"/>',cone:'<path d="m12 2 7 17H5ZM2 22h20M8 12h8"/>',bowl:'<path d="M2 10h20q0 12-10 12T2 10ZM2 10q10-7 20 0"/>',blocks:'<path d="M2 4h9v9H2Zm11 0h9v9h-9ZM7 15h9v8H7Z"/>',ring:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',mat:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16m5-16v16m5-16v16"/>',cheese:'<path d="m2 14 12-9 8 9v7H2Zm0 0h20"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="18" r="1"/>',pepper:'<path d="M12 7q-7-3-8 5 0 12 8 9 8 3 8-9-1-8-8-5Zm0 0q0-5 5-5"/>',cake:'<path d="M4 10h16v12H4ZM3 10q0-8 4-6 5-8 8 0 6-2 6 6ZM4 16h16"/>',shop:'<path d="M3 10h18v12H3ZM2 4h20l1 6H1ZM8 22v-8h8v8"/>',star:'<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.star}</svg>`;
}
const portraits=new Map();
function imageFor(path){if(!path)return null;let im=portraits.get(path);if(!im){im=new Image();im.src=path;portraits.set(path,im);}return im;}
export function portraitOwner(name){return globalThis.TTBusinessAvatars?.[name]||null;}
function headCrop(img,owner){
 let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;
 if(owner.walkingCrop){const a=owner.walkingCrop;return [a[0]*sw,a[1]*sh,a[2]*sw,a[3]*sh];}
 if(owner.size!=='contain'){const z=owner.size.split(' ').map(parseFloat),p=owner.position.split(' ').map(parseFloat);const w=sw/(z[0]/100),h=sh/((z[1]||z[0])/100);sx=(sw-w)*(p[0]||0)/100;sy=(sh-h)*(p[1]||0)/100;sw=w;sh=h;}
 return [sx+sw*.19,sy+sh*.015,sw*.62,sh*.46];
}
export function drawAvatar(c,x,y,avatar,time=0,moving=false,jumping=false,facing=1,scale=1,owner=null){
 const a=avatar||{skin:'#955b3d',hair:'#231b1b',shirt:'#eab542',pants:'#24475c',hairStyle:'Curls'};
 const phase=moving?time*1.05:0,swing=jumping?.66:moving?Math.sin(phase)*.68:0,bob=moving&&!jumping?Math.abs(Math.sin(phase))*2.5:0;
 c.save();c.translate(x,y-bob);c.scale(facing*scale,scale);
 c.fillStyle='#092f3840';c.beginPath();c.ellipse(0,4,23,6,0,0,TAU);c.fill();
 const limb=(px,py,angle,len,width,color,bend=0)=>{c.save();c.translate(px,py);c.rotate(angle);round(c,-width/2,0,width,len*.57,width*.46,gradient(c,-width/2,0,width,len,color,'#233447'));c.translate(0,len*.5);c.rotate(bend);round(c,-width/2,0,width,len*.55,width*.4,color);round(c,-width*.55,len*.47,width*1.35,7,3,'#edf3ed');round(c,-width*.55,len*.57,width*1.35,3,1,'#27414b');c.restore();};
 limb(-7,-39,swing,37,11,a.pants,jumping?-.75:-swing*.55);limb(7,-39,-swing,37,11,a.pants,jumping?.8:swing*.55);
 round(c,-18,-76,36,39,[12,12,8,8],gradient(c,-17,-75,34,39,a.shirt,'#1b666f'));round(c,-18,-70,6,24,3,'#ffffff20');
 round(c,-23,-76,11,27,5,gradient(c,-23,-76,11,27,'#f3c654','#b5802a'));round(c,-24,-69,11,5,2,'#fff5c9');
 function arm(px,angle,back){c.save();c.translate(px,-70);c.rotate(angle);round(c,-5,0,10,17,5,back?'#1d747c':a.shirt);c.translate(0,13);c.rotate(jumping?-1.1:-.38);round(c,-4,0,8,18,4,a.skin);circle(c,0,17,4.8,a.skin);c.restore();}
 arm(-16,jumping?-1.6:-swing*.85,true);arm(16,jumping?-2.15:swing*.85,false);
 round(c,-5,-85,10,13,4,a.skin);
 const backgrounds=['white','black','hispanic','asian'],column=backgrounds.indexOf(a.background),img=imageFor(owner?.image||(column>=0?new URL('./characters.webp',import.meta.url).href:null));
 if(img?.complete&&img.naturalWidth){let src;if(owner)src=headCrop(img,owner);else{const w=img.naturalWidth/4,h=img.naturalHeight/2;src=[column*w+w*.13,(a.gender==='male'?h:0)+h*.015,w*.74,h*.83];}c.save();c.beginPath();c.roundRect(-19,-117,38,42,14);c.clip();c.drawImage(img,...src,-19,-117,38,42);c.restore();}
 else{
  if(a.hairStyle==='Long'||a.hairStyle==='Braids')round(c,-18,-113,33,47,12,a.hair);
  c.fillStyle=gradient(c,-16,-111,30,33,a.skin,'#b8805b');c.beginPath();c.ellipse(0,-98,16,20,0,0,TAU);c.fill();circle(c,15,-97,4,a.skin);
  c.fillStyle=a.hair;c.beginPath();c.ellipse(-1,-113,18,10,-.08,0,TAU);c.fill();round(c,-18,-112,6,19,4,a.hair);
  if(a.hairStyle==='Curls'){for(let i=0;i<7;i++)circle(c,-14+i*4.5,-116-Math.sin(i/6*Math.PI)*4,6,a.hair);circle(c,-10,-124,10,a.hair);}
  if(a.hairStyle==='Braids'){for(let i=0;i<4;i++)round(c,-18+i*4,-108,3,38,2,a.hair);}
  c.fillStyle='#203039';c.beginPath();c.ellipse(7,-98,2.2,3,0,0,TAU);c.fill();circle(c,7.5,-99,0.8,'#fff');c.strokeStyle='#683f32';c.lineWidth=1.4;c.beginPath();c.arc(6,-92,5,.2,1.8);c.stroke();
 }
 if(/glasses/i.test(a.outfit||'')){c.strokeStyle='#183440';c.lineWidth=1.2;c.strokeRect(0,-102,13,8);}
 c.restore();
}
export function createRenderer(canvas){
 const c=canvas.getContext('2d',{alpha:false});const valley=new Image();valley.src=new URL('./valley.webp',import.meta.url).href;let width=960,height=540,dpr=1,camera=0;
 function resize(){const r=canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;dpr=Math.min(globalThis.devicePixelRatio||1,2);height=540;width=Math.max(620,r.width/(r.height/height||1));canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);}
 function text(str,x,y,size=18,color='#fff',align='center'){c.fillStyle=color;c.textAlign=align;c.font=`800 ${size}px system-ui`;c.fillText(str,x,y);}
 function coin(x,y,time,star=false){c.save();c.translate(x,y);if(star){const g=gradient(c,-15,-15,30,30,'#fff6af','#e8a71e');c.fillStyle=g;c.strokeStyle='#fff4a0';c.lineWidth=2;c.shadowColor='#ffdd52';c.shadowBlur=16;c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?8:18;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();}else{c.scale(.7+Math.abs(Math.cos(time*3+x))*.3,1);circle(c,0,0,11,'#bc7a1e');circle(c,0,-1.7,10,gradient(c,-8,-10,18,20,'#fff5a5','#eaaa27'));c.strokeStyle='#f7d665';c.lineWidth=1.7;c.beginPath();c.ellipse(0,-2,6,8,0,0,TAU);c.stroke();text('·',0,2,14,'#b7802b');}c.restore();}
 function platform(p){const x=p.x-camera;if(x+p.w<0||x>width)return;c.save();c.shadowColor='#062e3840';c.shadowBlur=12;c.shadowOffsetY=8;round(c,x,p.y,p.w,p.h,p.ground?0:8,gradient(c,x,p.y,0,p.h,'#bd9566','#735b43'));c.shadowBlur=0;c.strokeStyle='#705d4540';c.lineWidth=2;for(let by=p.y+23;by<p.y+p.h;by+=27){c.beginPath();c.moveTo(x,by);c.lineTo(x+p.w,by);c.stroke();for(let bx=x+(by%2)*24;bx<x+p.w;bx+=48){c.beginPath();c.moveTo(bx,by-25);c.lineTo(bx,by);c.stroke();}}round(c,x-2,p.y-6,p.w+4,14,6,gradient(c,x,p.y-8,0,18,'#b7d96c','#427b47'));c.fillStyle='#ceec9540';for(let i=0;i<p.w;i+=19)c.fillRect(x+i,p.y-4,8,2);c.restore();}
 function portal(p,index,s,time){const x=p.x-camera;if(x<-200||x>width+200)return;const done=s.gate>index,active=s.gate===index;c.save();c.translate(x,470);c.fillStyle='#163e3e';c.beginPath();c.roundRect(-45,-98,90,104,[43,43,0,0]);c.fill();c.strokeStyle=active?'#4cd5bd':'#609c8b';c.lineWidth=15;c.stroke();c.strokeStyle='#b1e6b2';c.lineWidth=2;c.stroke();round(c,-54,-5,108,12,4,'#d7cba0');const light=c.createRadialGradient(0,-37,2,0,-37,52);light.addColorStop(0,done?'#80eabb70':'#ffc95b90');light.addColorStop(1,'#ffc95b00');c.fillStyle=light;c.fillRect(-45,-88,90,83);for(let i=0;i<4;i++)round(c,-34+i*4,-22+i*6,68-i*8,5,1,'#b99a60');round(c,-72,-145,144,33,9,active?'#173f46':'#3e6058');text(done?'✓ '+p.title:p.title,0,-124,12);if(active){const bob=s.settings.reducedMotion?0:Math.sin(time*3)*5;text('↓',0,-160+bob,30,'#fff2a2');}if(active&&s.position>p.x+25){c.globalAlpha=.25+Math.sin(time*2)*.08;round(c,77,-190,5,190,2,'#fff0a4');}c.restore();}
 function draw({player:p,world,s,time=0,particles=[],home=false,owner=null,avatar=null}){
  canvas.dataset.position=String(Math.round(p.x));canvas.dataset.motion=p.grounded?(Math.abs(p.vx)>1?'running':'standing'):'jumping';canvas.dataset.view=home?'home':s.view;
  const scale=canvas.height/540;c.setTransform(scale,0,0,scale,0,0);width=canvas.width/scale;
  camera=home?0:Math.max(0,Math.min(WORLD_END-width+400,p.x-width*.3));
  c.fillStyle=gradient(c,0,0,0,540,'#82ccdc','#cee6cb');c.fillRect(0,0,width,540);
  if(valley.complete&&valley.naturalWidth){const bgH=590,bgW=valley.width/valley.height*bgH,offset=camera*.17%bgW;for(let x=-offset;x<width;x+=bgW)c.drawImage(valley,x,-30,bgW,bgH);}
  else{for(let i=0;i<8;i++){const x=(i*270-camera*.15)%(width+350);c.fillStyle=i%2?'#6ca78b':'#89b69b';c.beginPath();c.ellipse(x,390,230,180,0,0,TAU);c.fill();}}
  const mist=c.createLinearGradient(0,300,0,540);mist.addColorStop(0,'#114c5d00');mist.addColorStop(1,'#113e4290');c.fillStyle=mist;c.fillRect(0,300,width,240);
  if(home){c.fillStyle='#103d3b18';c.fillRect(0,0,width,540);}
  for(const q of world.platforms)platform(q);
  for(const crate of world.crates){const x=crate.x-camera;if(x<-80||x>width+80)continue;round(c,x,crate.y,crate.w,crate.h,5,gradient(c,x,crate.y,crate.w,crate.h,'#d3aa76','#966e47'));c.strokeStyle='#f1d3a0';c.lineWidth=4;c.strokeRect(x+5,crate.y+5,crate.w-10,crate.h-10);c.beginPath();c.moveTo(x+7,crate.y+8);c.lineTo(x+crate.w-7,crate.y+crate.h-8);c.stroke();}
  for(const e of world.enemies){if(e.dead||s.defeated.includes(e.id))continue;const x=e.x-camera;if(x<-80||x>width+80)continue;const bob=s.settings.reducedMotion?0:Math.abs(Math.sin(time*3+e.home))*5;c.save();c.translate(x,e.y+17-bob);c.fillStyle='#16363c33';c.beginPath();c.ellipse(0,20+bob,23,5,0,0,TAU);c.fill();c.fillStyle=gradient(c,-20,-15,40,35,'#b6a6e4','#7165a7');c.beginPath();c.ellipse(0,0,23,18,0,0,TAU);c.fill();circle(c,-8,-4,5,'#fff4da');circle(c,8,-4,5,'#fff4da');circle(c,-7,-3,2,'#3d355e');circle(c,9,-3,2,'#3d355e');text('⌢',0,11,12,'#4b3867');c.restore();}
  for(const a of world.coins)if(!s.collected.includes(a.id)&&a.x>camera-30&&a.x<camera+width+30)coin(a.x-camera,a.y+(s.settings.reducedMotion?0:Math.sin(time*2+a.x)*2),time);
  for(const a of world.stars)if(!s.collected.includes(a.id)&&a.x>camera-30&&a.x<camera+width+30)coin(a.x-camera,a.y+(s.settings.reducedMotion?0:Math.sin(time*2)*5),time,true);
  PORTALS.forEach((portalInfo,index)=>portal(portalInfo,index,s,time));
  const fx=WORLD_END-camera;if(fx>-100&&fx<width+160){round(c,fx,200,6,270,3,'#e9e9d2');circle(c,fx+3,196,7,'#e6bd59');c.fillStyle='#fffbea';c.beginPath();c.moveTo(fx+6,207);c.quadraticCurveTo(fx+48,194,fx+90,209);c.lineTo(fx+90,265);c.quadraticCurveTo(fx+48,251,fx+6,267);c.fill();round(c,fx-62,451,130,19,4,'#ddcda2');text('FINISH',fx+6,320,17,'#fff6cd');}
  if(p.invulnerable<=0||Math.floor(time*9)%2===0)drawAvatar(c,p.x-camera,p.y,avatar||s.character,p.runCycle,Math.abs(p.vx)>1,!p.grounded,p.facing,.84,owner);
  for(const q of particles){c.globalAlpha=q.life;c.fillStyle=q.color;circle(c,q.x-camera,q.y,q.r,q.color);}c.globalAlpha=1;
  if(home){const g=c.createLinearGradient(0,0,width*.78,0);g.addColorStop(0,'#0d363bd9');g.addColorStop(1,'#0d363b00');c.fillStyle=g;c.fillRect(0,0,width,540);}
 }
 resize();return {draw,resize,width:()=>width,dispose(){portraits.clear();}};
}
