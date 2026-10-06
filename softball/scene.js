import * as T from '../assets/vendor/three-0.180.0.js';
import {BASES,FENCE,runnerPosition} from './core.js';
const colors=[0x6951c5,0xe16840],skins=[0xb97950,0xe0a47b,0x865233,0xc68d62,0x613d2b];
const v=(x,y,z)=>new T.Vector3(x,y,z);
export class SoftballScene {
 constructor(canvas){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));this.renderer.setClearColor(0xb8dded);
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.scene=new T.Scene();this.scene.fog=new T.Fog(0xb8dded,115,230);
  this.camera=new T.PerspectiveCamera(54,1,.08,300);this.camera.position.set(0,4,-9);this.look=v(0,1,15);
  this.scene.add(new T.HemisphereLight(0xe1f5ff,0x8d8b57,2.2));const sun=new T.DirectionalLight(0xffedcf,2.6);sun.position.set(-30,60,-20);this.scene.add(sun);
  this.materials=new Map();this.ballTrail=[];this.last=0;this.previousPhase='';this.view='auto';
  this.buildField();
  this.defenders=Array.from({length:9},(_,i)=>this.person(i));this.batter=this.person(10);this.runners=Array.from({length:4},(_,i)=>this.person(i+12));
  this.ball=this.sphere(.15,0xf3f740);this.ball.geometry=new T.SphereGeometry(.15,14,10);this.scene.add(this.ball);
  // Red seams remain visible in the close batting camera.
  for(const flip of [-1,1]){const seam=new T.Mesh(new T.TorusGeometry(.136,.007,4,28,Math.PI*1.5),this.mat(0xd34336));seam.rotation.y=flip*.55;seam.position.x=flip*.03;this.ball.add(seam);}
  this.shadow=this.disk(.26,0x162c20,.22);this.marker=this.ring(1.5,0xffea77);this.selection=this.ring(.6,0x7ee9f2);
  this.zone=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.6,1,.025)),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.65}));this.zone.position.set(0,1,0);this.scene.add(this.zone);
  this.aim=this.sphere(.075,0xff5959);this.scene.add(this.aim);
  this.resize();
 }
 mat(color){if(!this.materials.has(color))this.materials.set(color,new T.MeshStandardMaterial({color,roughness:.8}));return this.materials.get(color);}
 sphere(r,color){return new T.Mesh(new T.SphereGeometry(r,12,9),this.mat(color));}
 mesh(geo,color,x=0,y=0,z=0,parent=this.scene){const m=new T.Mesh(geo,this.mat(color));m.position.set(x,y,z);parent.add(m);return m;}
 disk(r,color,opacity=1){const m=new T.Mesh(new T.CircleGeometry(r,40),new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.025;this.scene.add(m);return m;}
 ring(r,color){const m=new T.Mesh(new T.RingGeometry(r*.86,r,48),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:.85,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.035;this.scene.add(m);return m;}
 line(points,color=0xfff7e6,width=.05){const a=new T.Vector3(...points[0]),b=new T.Vector3(...points[1]),d=new T.Vector3().subVectors(b,a);const m=this.mesh(new T.CylinderGeometry(width,width,d.length(),8),color);m.position.copy(a.add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(v(0,1,0),d.normalize());return m;}
 text(text,width,height,color='#f8f6e8',bg='#173e3a'){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,1024,256);x.fillStyle=color;x.font='bold 74px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,128,965);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));
 }
 buildField(){
  const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');
  x.fillStyle='#47794c';x.fillRect(0,0,1024,1024);for(let i=0;i<16;i++){x.fillStyle=i%2?'#568650':'#4d7e49';x.fillRect(0,i*64,1024,64);}
  let seed=73;for(let i=0;i<38000;i++){seed=(seed*16807)%2147483647;const a=seed%1024;seed=(seed*16807)%2147483647;const b=seed%1024;x.fillStyle=i%2?'#c6d4a018':'#1a3c2718';x.fillRect(a,b,1,3);}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,2);tex.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
  const grass=new T.Mesh(new T.PlaneGeometry(220,220),new T.MeshStandardMaterial({map:tex,roughness:1}));grass.rotation.x=-Math.PI/2;grass.position.z=45;this.scene.add(grass);
  const dirt=new T.Shape();dirt.moveTo(0,0);for(let i=0;i<=80;i++){const a=-Math.PI/4+i/80*Math.PI/2;dirt.lineTo(Math.sin(a)*29,Math.cos(a)*29);}dirt.lineTo(0,0);
  const earth=this.mesh(new T.ShapeGeometry(dirt),0xc8986c);earth.rotation.x=Math.PI/2;earth.material.side=T.DoubleSide;earth.position.y=.012;
  const home=this.disk(3.1,0xc8986c);home.position.z=0;
  const mound=this.disk(2.44,0xc39264);mound.position.z=13.1;const circle=this.ring(2.44,0xfff9ea);circle.position.z=13.1;
  for(let i=0;i<4;i++){const a=BASES[i],b=BASES[i+1];this.line([[a.x,.045,a.z],[b.x,.045,b.z]],0xf6eee0,.05);}
  for(const sign of [-1,1])this.line([[0,.04,0],[sign*FENCE/Math.sqrt(2),.04,FENCE/Math.sqrt(2)]],0xfef7e8,.045);
  for(let i=1;i<4;i++){const b=BASES[i];const m=this.mesh(new T.BoxGeometry(.46,.10,.46),0xfffdf1,b.x,.065,b.z);m.rotation.y=Math.PI/4;}
  this.mesh(new T.BoxGeometry(.61,.03,.15),0xfffbec,0,.04,13.1);
  const plate=new T.Shape();plate.moveTo(-.22,.18);plate.lineTo(.22,.18);plate.lineTo(.22,-.05);plate.lineTo(0,-.25);plate.lineTo(-.22,-.05);plate.closePath();const pm=this.mesh(new T.ShapeGeometry(plate),0xffffff);pm.rotation.x=-Math.PI/2;pm.position.y=.045;
  for(const side of [-1,1]){const a=side*.75;for(const pair of [[[a-.28,.035,-.7],[a-.28,.035,.7]],[[a+.28,.035,-.7],[a+.28,.035,.7]],[[a-.28,.035,-.7],[a+.28,.035,-.7]],[[a-.28,.035,.7],[a+.28,.035,.7]]])this.line(pair,0xfff8e9,.025);}
  // Warning track, padded fence, mesh backstop and foul poles.
  for(let i=0;i<48;i++){
   const a=-Math.PI/4+i/48*Math.PI/2,b=-Math.PI/4+(i+1)/48*Math.PI/2,m=(a+b)/2;
   const track=this.mesh(new T.BoxGeometry(2.15,.022,3),0xb18b66,Math.sin(m)*62.5,.02,Math.cos(m)*62.5);track.rotation.y=m;
   const wall=this.mesh(new T.BoxGeometry(2.14,2.2,.25),i%2?0x28534a:0x315f50,Math.sin(m)*FENCE,1.1,Math.cos(m)*FENCE);wall.rotation.y=m;
   this.line([[Math.sin(a)*FENCE,2.25,Math.cos(a)*FENCE],[Math.sin(b)*FENCE,2.25,Math.cos(b)*FENCE]],0xe9bb53,.065);
  }
  for(const side of [-1,1])this.line([[side*45.25,0,45.25],[side*45.25,10,45.25]],0xf5ce46,.095);
  for(let n=-6;n<=6;n++){this.line([[n,-.05,-12],[n,4.5,-12]],0x6c817b,.016);this.line([[-6,(n+6)*.36,-12],[6,(n+6)*.36,-12]],0x6c817b,.012);}
  // Dugouts, aluminum bleachers, park trees and light standards.
  for(const side of [-1,1]){
   this.mesh(new T.BoxGeometry(2.5,.13,10),0x294d47,side*17,2.7,2);
   for(const z of [-2.5,6.5])this.line([[side*17,0,z],[side*17,2.7,z]],0x486865,.065);
   this.mesh(new T.BoxGeometry(.6,.12,8),0xc2c9c3,side*17,.5,2);
   for(let row=0;row<4;row++)this.mesh(new T.BoxGeometry(1.1,.18,11),0xb6c3c4,side*(23+row),.5+row*.6,9);
   for(let i=0;i<4;i++){
    const px=side*(51+i*3),pz=13+i*19;this.line([[px,0,pz],[px,15,pz]],0x6c7d7d,.12);this.mesh(new T.BoxGeometry(3.5,.45,.65),0xd7e1dc,px,15,pz);
   }
  }
  for(let i=0;i<48;i++){
   const a=i*.53,r=79+(i%4)*5,px=Math.sin(a)*r,pz=35+Math.cos(a)*r;if(pz<-8&&Math.abs(px)<40)continue;
   this.mesh(new T.CylinderGeometry(.2,.38,4,7),0x6d5842,px,2,pz);
   const crown=this.sphere(3.7,[0x315f44,0x44714a,0x507d4f][i%3]);crown.scale.y=1.3; crown.position.set(px,6,pz);this.scene.add(crown);
  }
  const banner=this.text('TRANSITION TOWN  •  SOFTBALL',25,5);banner.position.set(0,7,68);banner.rotation.y=Math.PI;this.scene.add(banner);
  this.line([[-10,0,68],[-10,9,68]],0x445e55,.15);this.line([[10,0,68],[10,9,68]],0x445e55,.15);
 }
 person(index){
  const root=new T.Group();this.scene.add(root);const skin=skins[index%skins.length],body=new T.Group();root.add(body);
  const jersey=new T.MeshStandardMaterial({color:colors[0],roughness:.75});
  const torso=new T.Mesh(new T.CapsuleGeometry(.23,.39,6,12),jersey);torso.scale.set(1,.94,.72);torso.position.y=1.19;body.add(torso);
  this.mesh(new T.CylinderGeometry(.15,.16,.13,12),skin,0,1.51,0,body);
  const head=this.mesh(new T.SphereGeometry(.155,16,12),skin,0,1.7,0,body);head.scale.set(.85,1.18,.94);
  const hair=this.mesh(new T.SphereGeometry(.161,14,10,0,Math.PI*2,0,Math.PI*.62),0x3e2c26,0,1.75,-.013,body);
  const pony=this.mesh(new T.SphereGeometry(.105,10,8),0x3e2c26,0,1.65,-.19,body);pony.scale.set(.62,1.8,.8);
  for(const sign of [-1,1]){this.mesh(new T.SphereGeometry(.012,6,5),0x211b1a,sign*.055,1.715,.132,body);this.mesh(new T.SphereGeometry(.025,8,6),skin,sign*.139,1.7,0,body);}
  this.mesh(new T.SphereGeometry(.023,8,6),skin,0,1.665,.143,body);
  const helmet=new T.Mesh(new T.SphereGeometry(.18,16,10,0,Math.PI*2,0,Math.PI*.61),jersey);helmet.position.set(0,1.76,0);body.add(helmet);
  const visor=new T.Mesh(new T.SphereGeometry(.15,12,6),jersey);visor.scale.set(1,.13,1);visor.position.set(0,1.77,.14);body.add(visor);
  const arms=[],legs=[];
  for(const sign of [-1,1]){
   const arm=new T.Group();arm.position.set(sign*.24,1.4,0);body.add(arm);arms.push(arm);
   const sleeve=new T.Mesh(new T.CapsuleGeometry(.085,.12,4,8),jersey);sleeve.position.y=-.1;arm.add(sleeve);
   this.mesh(new T.CapsuleGeometry(.057,.24,4,8),skin,0,-.32,0,arm);this.mesh(new T.SphereGeometry(.065,8,6),skin,0,-.5,0,arm);
   const leg=new T.Group();leg.position.set(sign*.115,.91,0);body.add(leg);legs.push(leg);
   this.mesh(new T.CapsuleGeometry(.10,.30,4,10),0xf4efdf,0,-.19,0,leg);
   const shin=this.mesh(new T.CapsuleGeometry(.068,.25,4,8),0xf4efdf,0,-.54,.01,leg);
   const sock=new T.Mesh(new T.CylinderGeometry(.073,.064,.22,10),jersey);sock.position.set(0,-.69,.015);leg.add(sock);
   const foot=this.mesh(new T.SphereGeometry(.1,10,8),0x273c3b,0,-.82,.07,leg);foot.scale.set(.75,.55,1.6);
  }
  const glove=this.mesh(new T.SphereGeometry(.13,10,8),0xae7945,0,-.51,.03,arms[0]);glove.scale.set(1.05,1.2,.4);glove.rotation.y=.5;
  const bat=new T.Group();arms[1].add(bat);bat.position.set(0,-.5,0);
  this.mesh(new T.CylinderGeometry(.035,.02,.85,12),0xc3c7cc,0,-.42,0,bat);this.mesh(new T.CylinderGeometry(.021,.021,.2,10),0x262e38,0,-.07,0,bat);
  const number=this.text(String(index%9+1),.19,.14,'#fff','#6951c5');number.position.set(0,1.27,-.175);number.rotation.y=Math.PI;body.add(number);
  const shadow=this.disk(.44,0x102c20,.20);shadow.scale.z=.65;
  return {root,body,arms,legs,glove,bat,helmet,visor,jersey,shadow,number,oldX:0,oldZ:0};
 }
 pose(p,x,z,team,t,{run=false,heading=0,batter=false,swing=0,pitch=0,catcher=false,throwing=0,visible=true}={}){
  p.root.visible=p.shadow.visible=visible;if(!visible)return;
  p.root.position.set(-x,0,z);p.root.rotation.y=-heading;p.jersey.color.setHex(colors[team]);p.bat.visible=batter;p.glove.visible=!batter;p.helmet.visible=batter;p.visor.visible=true;p.number.visible=true;
  const cycle=Math.sin(t*14),stride=run?.7:0;p.body.position.y=run?Math.abs(cycle)*.055:Math.sin(t*2)*.008;
  p.body.rotation.set(0,0,0);p.legs[0].rotation.x=cycle*stride;p.legs[1].rotation.x=-cycle*stride;
  p.arms[0].rotation.set(-cycle*stride*.8,0,.09);p.arms[1].rotation.set(cycle*stride*.8,0,-.09);
  if(batter){p.root.rotation.y=.22;p.legs[0].rotation.x=.12;p.legs[1].rotation.x=-.15;
   const u=swing>0?1-swing/.38:0;p.body.rotation.y=swing>0?-.9+u*2.2:-.6;
   p.arms[0].rotation.set(-1.4,0,-.5);p.arms[1].rotation.set(-2.1+u*1.2,0,.3+u*1.8);p.bat.rotation.z=-.3;
  }
  if(pitch>0){p.arms[1].rotation.x=-pitch*Math.PI*2;p.arms[0].rotation.x=-.6;p.legs[0].rotation.x=-Math.sin(pitch*Math.PI)*.4;p.body.position.y=Math.sin(pitch*Math.PI)*.04;}
  if(throwing>0){p.arms[1].rotation.x=-2.8+throwing*3.4;p.body.rotation.y=Math.sin(throwing*Math.PI)*.45;}
  if(catcher){p.body.position.y=-.48;p.legs[0].rotation.x=p.legs[1].rotation.x=-1.0;p.arms[0].rotation.x=-1.1;}
  p.shadow.position.set(-x,.026,z);
 }
 resize(){const c=this.renderer.domElement,w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 draw(g,side,dt){
  const live=['live','throw','homer','foul'].includes(g.phase),wide=this.view==='field'||live;
  let pos=wide?v(0,51,-28):v(-.15,3.25,-7.7),look=wide?v(0,0,24):v(0,1.15,13.1);
  if(this.camera.aspect<1){pos=wide?v(0,70,-42):v(0,4.1,-11);}
  const k=1-Math.exp(-dt*(live?5:3));this.camera.position.lerp(pos,k);this.look.lerp(look,k);this.camera.lookAt(this.look);
  for(let i=0;i<9;i++){const f=g.fielders[i];this.pose(this.defenders[i],f.x,f.z,1-g.batting,g.time,{run:f.moving,heading:f.heading,pitch:i===0&&g.phase==='pitch'&&g.pitch.t<g.pitch.windup?g.pitch.t/g.pitch.windup:0,throwing:g.throw?.by===i?Math.min(1,g.throw.t/.42):0,catcher:i===1&&!live});}
  this.pose(this.batter,-.8,0,g.batting,g.time,{batter:true,swing:g.swing,visible:!live});
  if(live){g.runners.forEach((r,i)=>{const p=runnerPosition(r),b=BASES[Math.min(4,Math.floor(r.progress)+1)];this.pose(this.runners[i],p.x,p.z,g.batting,g.time,{run:r.progress<r.target,heading:Math.atan2(b.x-p.x,b.z-p.z),visible:!r.out&&!r.scored});});for(let i=g.runners.length;i<4;i++)this.runners[i].root.visible=this.runners[i].shadow.visible=false;}
  else {for(let i=0;i<4;i++){const b=BASES[i+1]||BASES[0];this.pose(this.runners[i],b.x-.6,b.z,g.batting,g.time,{visible:i<3&&g.bases[i],heading:Math.PI/2});}}
  this.ball.position.set(-g.ball.x,g.ball.y,g.ball.z);this.ball.rotation.x=g.time*12;this.ball.rotation.z=g.time*7;
  this.shadow.position.set(-g.ball.x,.03,g.ball.z);this.shadow.scale.setScalar(1+Math.max(0,g.ball.y)*.04);
  this.marker.visible=g.phase==='live'&&g.holder===null&&!!g.landing&&!g.bounced;if(this.marker.visible)this.marker.position.set(-g.landing.x,.038,g.landing.z);
  this.selection.visible=side!==g.batting&&['live','throw'].includes(g.phase);const f=g.fielders[g.selected];this.selection.position.set(-f.x,.05,f.z);
  this.zone.visible=!wide&&['ready','pitch'].includes(g.phase);this.aim.visible=side!==g.batting&&g.phase==='ready';this.aim.position.set(-g.pitchAim.x,g.pitchAim.y,-.06);
  this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});this.renderer.dispose();}
}
