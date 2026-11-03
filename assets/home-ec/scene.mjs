import * as T from './three.js';
import {photographicMaterials,drapedClothGeometry,spoonBowlGeometry,createPolishedFloor,plaqueGeometry} from './visuals.mjs';

// All classroom objects are real meshes. Shared materials, instanced small parts,
// static mesh batching, capped resolution and idle rendering keep school devices viable.
export const VIEWS={
 classroom:{eye:[.45,2.18,6.8],at:[-.65,1.8,-2.8]},
 kitchen:{eye:[-1.05,2.25,3.15],at:[-2.5,1.43,.1]},
 recipes:{eye:[-4.8,2.25,2.7],at:[-3.2,1.42,.1]},
 pantry:{eye:[-5.1,2.4,-1.7],at:[-7.15,2.1,-5.2]},
 stove:{eye:[2.1,2.55,-1.7],at:[2.2,1.25,-4.9]},
 fridge:{eye:[-4.8,2.15,-1.65],at:[-6.2,1.5,-4.6]},
 shopping:{eye:[-5.8,2.4,-.1],at:[-5.9,1.5,-3.8]},
 sink:{eye:[-.8,2.65,-1.9],at:[-.9,1.3,-4.65]},
 microwave:{eye:[-4.2,2.45,-1.7],at:[-3.95,1.5,-4.65]},
 laundry:{eye:[6.85,2.35,1.1],at:[5.7,1.55,-4.4]},
 folding:{eye:[4.9,2.25,2.1],at:[7,1.2,-.2]},
 storage:{eye:[4.9,2.2,4.1],at:[7.1,1,2.2]},
 cleaning:{eye:[5.2,3.0,5.3],at:[3.05,1.25,1.45]},
 clothing:{eye:[6.9,3.6,4.0],at:[5.0,1.1,1.2]},
 challenge:{eye:[-1.0,3.2,4.15],at:[-2.45,1.3,.15]},
 progress:{eye:[5.2,3.9,7.0],at:[2.3,1.3,.2]}
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Some targets contain children positioned in room coordinates. Use visible
// geometry for proximity rather than a wrapper group's often-zero origin.
export function interactionDistance(object,position){return new T.Box3().setFromObject(object).getCenter(new T.Vector3()).distanceTo(position);}
let seed=731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function label(lines,{bg='#fbf5e9',fg='#233945',accent='#e8a6bb',w=1024,h=512,rounded=false}={}){
 return texture((x,W,H)=>{x.fillStyle=bg;if(rounded){x.beginPath();x.roundRect(0,0,W,H,H*.27);x.fill();}else x.fillRect(0,0,W,H);x.strokeStyle=accent;x.lineWidth=12;if(rounded){x.beginPath();x.roundRect(10,10,W-20,H-20,H*.24);x.stroke();}else x.strokeRect(10,10,W-20,H-20);x.textAlign='center';x.textBaseline='middle';lines.forEach((l,i)=>{x.font=`${i===0?'bold ':''}${Math.min(H/(lines.length+1)*.7,W/(l.length*.59))}px Arial`;x.fillStyle=fg;x.fillText(l,W/2,H*(i+1)/(lines.length+1),W-55);});},w,h);
}
const marble=()=>texture((x,w,h)=>{x.fillStyle='#e4e1d8';x.fillRect(0,0,w,h);for(let i=0;i<4000;i++){const v=Math.floor(180+random()*50);x.fillStyle=`rgba(${v},${v},${v},.12)`;x.fillRect(random()*w,random()*h,3,3);}for(let i=0;i<22;i++){x.strokeStyle=i%4?'#92969738':'#b6a28b45';x.lineWidth=i%4?.5:2;x.beginPath();let y=random()*h;x.moveTo(0,y);for(let a=0;a<=w;a+=16){y+=(random()-.5)*22;x.lineTo(a,y);}x.stroke();}});
const wood=()=>texture((x,w,h)=>{x.fillStyle='#ac7951';x.fillRect(0,0,w,h);for(let i=0;i<250;i++){x.strokeStyle=`rgba(${i%2?50:220},${i%2?30:170},${i%2?10:110},${.05+random()*.12})`;x.lineWidth=random()*2;x.beginPath();let y=random()*h;x.moveTo(0,y);for(let z=0;z<w;z+=12)x.lineTo(z,y+Math.sin(z*.015+i)*3);x.stroke();}});

export function createClassroom(canvas,{onObject=()=>{},onReady=()=>{},onError=()=>{},profile={},student='Guest',groceryProducts=null,offline=false}={}){
 seed=731;
 let renderer;if(!offline)try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});}catch(e){onError(e);return null;}
 if(!offline){renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.35:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
 const scene=new T.Scene();scene.background=new T.Color('#ede9df');scene.fog=new T.Fog('#ede9df',25,65);
 const camera=new T.PerspectiveCamera(55,1,.05,90);let env;if(!offline){const environment=new T.RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromScene(environment,.04);scene.environment=env.texture;scene.environmentIntensity=.75;environment.dispose();pmrem.dispose();}
 const mat=(color,roughness=.45,metalness=0,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
 const M={wall:mat('#cfc2ae',.85),ceiling:mat('#f7f0dd',.85),navy:mat('#36444b',.22,.12),inset:mat('#2c3e46',.3,.12),oak:mat('#bc8b56',.4,0,{map:wood()}),stone:mat('#eee9df',.18,.06,{map:marble()}),steel:mat('#afbabd',.24,.86),steelDark:mat('#454f55',.3,.7),brass:mat('#ad834d',.25,.8),black:mat('#111b20',.17,.4),white:mat('#f4f2e8',.23,.08),pink:mat('#eaa9be',.25,.08),blue:mat('#82b9e3',.28,.1),green:mat('#375647',.5),leaf:mat('#3f653b',.65),leafLight:mat('#7c985a',.55),terra:mat('#b17a52',.65),water:new T.MeshPhysicalMaterial({color:'#94c7da',roughness:.08,metalness:0,transparent:true,opacity:.5,transmission:.35}),glass:new T.MeshPhysicalMaterial({color:'#d5edf3',roughness:.06,metalness:.05,transparent:true,opacity:.78,transmission:.62,thickness:.04,ior:1.45}),cloth:mat('#adc5ca',.92),cream:mat('#f7ead0',.8),food:mat('#d6a75b',.68),butter:mat('#f0d775',.38),light:mat('#fff5d3',.25,0,{emissive:'#ffd78b',emissiveIntensity:2.3})};
 const art=photographicMaterials(M,{offline,onChange:()=>wake()});let polishedFloor;let environmentReady=Promise.resolve();
 if(!offline)environmentReady=new Promise((resolve,reject)=>new T.RGBELoader().load(new URL('./materials/studio-small-03.hdr',import.meta.url).href,hdr=>{const generator=new T.PMREMGenerator(renderer),next=generator.fromEquirectangular(hdr);hdr.dispose();generator.dispose();env.dispose();env=next;scene.environment=env.texture;scene.environmentIntensity=.7;scene.environmentRotation.y=Math.PI*.25;wake();resolve();},undefined,reject));
 M.leaf.side=T.DoubleSide;M.leafLight.side=T.DoubleSide;const leafGeometry=new T.PlaneGeometry(.22,.52,6,10),leafVertices=leafGeometry.getAttribute('position');for(let i=0;i<leafVertices.count;i++){const y=leafVertices.getY(i),t=(y+.26)/.52;leafVertices.setX(i,leafVertices.getX(i)*Math.pow(Math.max(.001,Math.sin(Math.PI*t)),.65));leafVertices.setZ(i,.055*Math.sin(Math.PI*t)+.09*t*t);}leafGeometry.computeVertexNormals();
 const root=new T.Group();scene.add(root);const targets=new Map(),moving={},geoms=new Map(),selectable=[],colliders=[];
 const g=new T.Group();root.add(g);const plantHolders=[];
 function mesh(geometry,material,parent=g){const o=new T.Mesh(geometry,material);o.castShadow=!material.transparent;o.receiveShadow=true;parent.add(o);return o;}
 function box(p,s,m=M.white,parent=g,r=.025){const key=s.join(',')+','+r;let geo=geoms.get(key);if(!geo){geo=r?new T.RoundedBoxGeometry(...s,2,Math.min(r,...s.map(v=>v*.18))):new T.BoxGeometry(...s);geoms.set(key,geo);}const o=mesh(geo,m,parent);o.position.set(...p);return o;}
 function cyl(p,r,h,m=M.steel,parent=g,r2=r,seg=32){const o=mesh(new T.CylinderGeometry(r2,r,h,seg,1),m,parent);o.position.set(...p);return o;}
 function sphere(p,s,m,parent=g){const o=mesh(new T.SphereGeometry(1,18,12),m,parent);o.position.set(...p);o.scale.set(...s);return o;}
 function ring(p,r,t,m,parent=g,rotation=[Math.PI/2,0,0]){const o=mesh(new T.TorusGeometry(r,t,8,40),m,parent);o.position.set(...p);o.rotation.set(...rotation);return o;}
 function tube(points,r,m,parent=g){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),20,r,6,false),m,parent);}
 function target(id,build,parent=g){const o=new T.Group();parent.add(o);o.userData.target=id;build(o);targets.set(id,o);selectable.push(o);return o;}
 function sign(lines,p,s,style={},parent=g){const t=label(lines,style),o=mesh(new T.PlaneGeometry(...s),new T.MeshStandardMaterial({map:t,roughness:.36,metalness:.02,transparent:!!style.rounded,emissive:'#ffffff',emissiveMap:t,emissiveIntensity:style.rounded?.18:0}),parent);o.position.set(...p);o.castShadow=false;return o;}
 function litPlaque(lines,p,s,{blue=false,id}={}){const panel=new T.Group();panel.position.set(...p);g.add(panel);const glow=new T.MeshPhysicalMaterial({color:blue?'#77bdff':'#ff9ec5',roughness:.18,clearcoat:1,emissive:blue?'#126ed4':'#d22a72',emissiveIntensity:.5});mesh(plaqueGeometry(s[0]+.1,s[1]+.1),glow,panel);sign(lines,[0,0,.038],s,{bg:blue?'#d5efff':'#ffcadc',fg:'#153448',accent:'#fff5f9',h:256,rounded:true},panel);if(id){panel.userData.target=id;selectable.push(panel);}return panel;}
 function plant(x,y,z,scale=.7,parent=g){const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);parent.add(p);if(!offline){p.userData.plant=true;plantHolders.push(p);return p;}cyl([0,.17,0],.2,.33,M.terra,p,.24);cyl([0,.335,0],.22,.018,mat('#3e3020'),p);for(let i=0;i<17;i++){const a=i*2.399,r=.17+random()*.18,yy=.35+random()*.55;tube([[0,.32,0],[Math.sin(a)*r*.6,yy*.8,Math.cos(a)*r*.6],[Math.sin(a)*r,yy,Math.cos(a)*r]],.008,M.green,p);const leaf=mesh(leafGeometry,i%2?M.leaf:M.leafLight,p);leaf.position.set(Math.sin(a)*r,yy,Math.cos(a)*r);leaf.rotation.set(-1.0,a,.2);}return p;}
 function handle(x,y,z,w=.35,parent=g){tube([[x-w/2,y,z+.018],[x-w/2,y,z+.07],[x+w/2,y,z+.07],[x+w/2,y,z+.018]],.014,M.brass,parent);}
 function cabinet(x,z,w=.94,h=1.1,parent=g,interactive=false){
  if(interactive){box([x,h/2,z-.49],[w,h,.055],M.navy,parent);for(const side of [-1,1])box([x+side*(w/2-.03),h/2,z],[.055,h,1.04],M.navy,parent);for(const yy of [.1,.58,1.05])box([x,yy,z],[w-.07,.045,1.0],M.oak,parent);}else box([x,h/2,z],[w,h,1.04],M.navy,parent,.035);box([x,.085,z+.04],[w-.07,.12,.97],M.black,parent,.012);
  const build=door=>{door.position.set(x-w/2+.025,0,z+.55);box([w/2-.025,.65,0],[w-.055,.88,.035],M.navy,door);box([w/2-.025,.65,.027],[w-.19,.7,.017],M.inset,door,.01);for(const xx of [.07,w-.12])box([xx,.65,.032],[.035,.77,.035],M.navy,door,.004);handle(w/2-.025,.94,.06,.26,door);};
  if(interactive){const door=target('cabinet',build,parent);moving.cabinet=door;}else{const door=new T.Group();parent.add(door);build(door);}
  box([x,h+.04,z],[w+.05,.1,1.13],M.stone,parent,.035);
 }
 function book(x,y,z,parent=g){return target('recipes',b=>{b.position.set(x,y,z);const cover=box([0,0,0],[.68,.06,.47],M.pink,b,.012);cover.rotation.x=-.12;for(let j=0;j<6;j++)box([0,.035+j*.003,0],[.65,.002,.44],M.cream,b,.001);const page=sign(['MY RECIPE BOOK','COOK  ·  SHARE  ·  LEARN'],[0,.072,0],[.61,.4],{accent:'#dc8eaa',h:512},b);page.rotation.x=-Math.PI/2;},parent);}
 function spoon(x,y,z,parent=g,color=M.steel){const sp=new T.Group();parent.add(sp);sp.position.set(x,y,z);mesh(spoonBowlGeometry(),color,sp);const h=tube([[0,-.003,.065],[0,.008,.13],[0,.01,.26],[0,.016,.36],[0,.014,.395]],.014,color,sp);h.scale.y=.55;return sp;}
 function bowl(x,y,z,parent=g,material=M.glass,r=.34){const points=[];for(let i=0;i<=16;i++){const t=i/16;points.push(new T.Vector2(.08+Math.sin(t*Math.PI/2)*r,t*.26));}for(let i=16;i>=0;i--){const t=i/16;points.push(new T.Vector2(.065+Math.sin(t*Math.PI/2)*(r-.016),t*.26+.016));}const o=mesh(new T.LatheGeometry(points,40),material,parent);o.position.set(x,y,z);ring([x,y+.27,z],r+.08,.012,M.glass,parent);return o;}
 function measuringCup(x,y,z,labelText='½ cup',parent=g){const cup=new T.Group();parent.add(cup);cup.position.set(x,y,z);const profile=[[0,.008],[.097,.008],[.125,.035],[.133,.22],[.121,.22],[.114,.044],[.091,.025],[0,.025]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(profile,40),M.steel,cup);ring([0,.22,0],.128,.007,M.steel,cup);box([0,.164,.25],[.054,.018,.31],M.steel,cup,.014);sign([labelText],[0,.177,.27],[.052,.2],{bg:labelText==='½ cup'?'#e69f42':'#2a875e',fg:'#fffaf0',accent:'#ffffff',w:128,h:512},cup).rotation.x=-Math.PI/2;return cup;}
 function packageItem(p,id,product,parent=g){
  const o=new T.Group();o.position.set(...p);parent.add(o);const isCereal=/cereal|rice|flakes/i.test(product.name||''),butter=/butter/i.test(product.name||''),kind=butter?'butter':isCereal?'cereal':'marshmallows',skin=art.packaging[kind];
  const size=butter?[.48,.17,.23]:isCereal?[.42,.69,.2]:[.43,.5,.22];
  box([0,size[1]/2,0],size,skin.body,o,isCereal?.012:butter?.018:.055);
  if(!butter){for(const yy of [.018,size[1]-.018])box([0,yy,0],[size[0]+.012,.027,size[2]+.01],skin.body,o,.006);}
  const face=mesh(new T.PlaneGeometry(size[0]*.98,size[1]*.96),skin.front,o);face.position.set(0,size[1]/2,size[2]/2+.004);face.castShadow=false;
  const side=sign([isCereal?'RICE KRISPIES':butter?'BUTTER':'MINI MARSHMALLOWS',product.size||''],[size[0]/2+.002,size[1]/2,0],[size[2]*.92,size[1]*.9],{bg:butter?'#e8c153':isCereal?'#0868b2':'#52c5df',fg:'#fffdf5',accent:butter?'#e8c153':isCereal?'#0868b2':'#52c5df',w:256,h:512},o);side.rotation.y=Math.PI/2;
  if(id){o.userData.target=id;targets.set(id,o);selectable.push(o);}return o;
 }
 function stool(x,z,parent=g){const p=new T.Group();p.position.set(x,0,z);parent.add(p);cyl([0,.69,0],.29,.09,M.oak,p);for(const dx of [-.18,.18])for(const dz of [-.18,.18]){const leg=box([dx,.35,dz],[.035,.66,.035],M.black,p,.009);leg.rotation.z=dx*.18;}ring([0,.25,0],.24,.013,M.black,p);}
 function pendant(x,z,parent=g){cyl([x,3.46,z],.014,.89,M.black,parent);cyl([x,2.97,z],.32,.27,M.black,parent,.12);cyl([x,2.82,z],.30,.015,M.light,parent);const l=new T.PointLight('#ffe2ac',7.5,6,2);l.position.set(x,2.68,z);scene.add(l);}
 function machine(x,z,id,parent=g){const washer=id.startsWith('washer');return target(id,o=>{
  o.position.set(x,0,z);box([0,.69,0],[1.14,1.35,1.13],M.white,o,.055);box([0,1.39,0],[1.17,.055,1.16],M.white,o,.015);
  box([0,1.19,.583],[1.06,.25,.035],M.white,o);box([-.33,1.22,.61],[.33,.105,.018],M.white,o,.012);handle(-.33,1.25,.626,.22,o);
  sign(['TRANSITION HOME'],[-.28,1.347,.579],[.44,.035],{bg:'#e7e9e8',fg:'#525b61',accent:'#e7e9e8',w:512,h:64},o);
  const dial=cyl([.0,1.2,.644],.085,.053,M.steel,o,undefined,48);dial.rotation.x=Math.PI/2;box([0,1.255,.676],[.008,.02,.006],M.black,o,.002);moving[id+'Dial']=dial;
  moving[id+'Display']=sign(['READY'],[.32,1.22,.613],[.39,.086],{bg:'#12242a',fg:'#86d9f6',accent:'#12242a',w:512,h:128},o);
  for(let j=0;j<4;j++){const b=cyl([.2+j*.075,1.08,.618],.018,.015,M.steel,o,undefined,16);b.rotation.x=Math.PI/2;}
  box([0,.07,.574],[1.0,.016,.014],M.steelDark,o,.002);box([-.39,.15,.586],[.19,.12,.015],M.white,o,.012);
  const dr=new T.Group();dr.position.set(0,.65,.6);o.add(dr);ring([0,0,0],.394,.042,M.white,dr,[0,0,0]);ring([0,0,.025],.365,.035,M.steel,dr,[0,0,0]);ring([0,0,.052],.326,.022,M.black,dr,[0,0,0]);
  const cavity=cyl([0,0,.008],.323,.025,M.black,dr,undefined,48);cavity.rotation.x=Math.PI/2;
  const drum=new T.Group();drum.position.z=.028;dr.add(drum);moving[id]=drum;
  for(let i=0;i<6;i++){const a=i*2.4,cloth=mesh(drapedClothGeometry(.21,.19,.025),i%3===0?M.fabricPink:i%3===1?M.fabricBlue:M.fabricWhite,drum);cloth.position.set(Math.cos(a)*.15,Math.sin(a)*.14,.015);cloth.rotation.set(Math.PI/2,0,a);}
  const window=mesh(new T.SphereGeometry(.31,40,20,0,Math.PI*2,0,Math.PI/2),M.applianceGlass,dr);window.rotation.x=Math.PI/2;window.scale.y=.22;window.position.z=.047;
  tube([[.28,-.095,.098],[.34,-.095,.125],[.34,.095,.125],[.28,.095,.098]],.022,M.steel,dr);
 },parent);}

 function basket(x,y,z,color=M.blue,parent=g){const b=new T.Group();b.position.set(x,y,z);parent.add(b);box([0,.045,0],[.65,.06,.46],color,b);for(const xx of [-.32,.32]){for(let k=0;k<6;k++)box([xx,.2,-.21+k*.084],[.025,.33,.025],color,b,.006);}for(const zz of [-.23,.23])for(let k=0;k<9;k++)box([-.31+k*.078,.2,zz],[.025,.33,.025],color,b,.006);for(const yy of [.12,.24,.36]){box([0,yy,.23],[.67,.02,.025],color,b,.005);box([0,yy,-.23],[.67,.02,.025],color,b,.005);box([.32,yy,0],[.025,.02,.46],color,b,.005);box([-.32,yy,0],[.025,.02,.46],color,b,.005);}return b;}
 function garment(x,y,z,id,color,parent=g){return target(id,o=>{
  o.position.set(x,y,z);o.userData.home=[x,y,z];const fabric=id==='shirt'?M.fabricWhite:id==='jeans'?M.fabricBlue:M.fabricPink;
  if(id==='shirt'){
   mesh(drapedClothGeometry(.37,.51),fabric,o);for(const sign of [-1,1]){const sleeve=mesh(drapedClothGeometry(.17,.21),fabric,o);sleeve.position.set(sign*.22,0,-.12);sleeve.rotation.y=sign*.5;}
   cyl([0,.038,-.2],.046,.002,M.inset,o,undefined,24);ring([0,.041,-.2],.055,.006,fabric,o);
  }else if(id==='jeans'){
   const waist=mesh(drapedClothGeometry(.37,.15),fabric,o);waist.position.z=-.23;for(const sign of [-1,1]){const leg=mesh(drapedClothGeometry(.16,.48,.008),fabric,o);leg.position.set(sign*.095,0,.065);tube([[sign*.165,.018,-.25],[sign*.165,.018,-.1],[sign*.17,.02,.28]],.0018,M.cream,o);}
   tube([[-.15,.025,-.23],[-.12,.025,-.14],[-.04,.025,-.15]],.0015,M.cream,o);cyl([0,.025,-.23],.009,.004,M.steel,o,undefined,16);
  }else{
   mesh(drapedClothGeometry(.46,.59,.008),fabric,o);for(const end of [-.24,.24])tube([[-.21,.023,end],[0,.023,end],[.21,.023,end]],.003,M.fabricWhite,o);
  }
  sign(['COLD / LOW'],[0,.033,.08],[.2,.07],{w:256,h:128},o).rotation.x=-Math.PI/2;
 },parent);}


 scene.add(new T.HemisphereLight('#e9f1ff','#6d553b',.38));
 const sun=new T.DirectionalLight('#ffe3b7',3.0);sun.position.set(-3,7,-4);sun.castShadow=true;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;sun.shadow.mapSize.set(innerWidth<700?768:1536,innerWidth<700?768:1536);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:30});sun.shadow.normalBias=.025;sun.shadow.bias=-.00025;scene.add(sun);
 const fill=new T.DirectionalLight('#dceaff',.28);fill.position.set(2,4,9);scene.add(fill);
 if(!groceryProducts){
  // Stone tile floor, room shell, architectural trim and glazing.
  box([0,-.14,0],[16.4,.25,13],M.wall);
  const ceiling=mesh(new T.PlaneGeometry(16,12.5),M.ceiling);ceiling.rotation.x=Math.PI/2;ceiling.position.set(0,4.02,0);ceiling.castShadow=false;
  for(const z of [-4,-1,2,5])box([0,3.99,z],[15.9,.025,.025],M.white);for(const x of [-6,-3,0,3,6])box([x,3.99,0],[.025,.025,12.4],M.white);
  for(const x of [-4,4])for(const z of [-3,2])box([x,3.98,z],[1.1,.025,.5],M.light);
  polishedFloor=createPolishedFloor(g,{width:16.2,depth:12.5,material:M.floor,offline,mobile:innerWidth<700});
  box([0,2.1,-6],[16,.15,.16],M.oak);box([0,3.95,-6],[16,.14,.18],M.ceiling);box([0,1.0,-6],[16,2,.15],M.wall);box([-7.95,2,-1],[.14,4,10],M.wall);box([7.95,2,-1],[.14,4,10],M.wall);
  // Real framed windows; a photographic outdoor texture stays beyond the room.
  box([0,3.63,-5.94],[16,.62,.12],M.wall);
  for(const x of [-7.1,-5.7,-4.3,4.3,5.7,7.1])box([x,2.4,-5.98],[1.35,1.9,.12],M.wall);
  const gardenMaterial=new T.MeshBasicMaterial({color:'#c7d7b7'});
  const garden=mesh(new T.PlaneGeometry(7.3,2.44),gardenMaterial);garden.position.set(0,2.34,-6.24);garden.castShadow=false;
  if(!offline)new T.TextureLoader().load(new URL('./garden-view.webp',import.meta.url).href,t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;gardenMaterial.map=t;gardenMaterial.color.set('#ffffff');gardenMaterial.needsUpdate=true;wake();},undefined,()=>{});
  for(const x of [-3.6,-2.4,-1.2,0,1.2,2.4,3.6]){box([x,2.25,-5.78],[.055,2.2,.15],M.white);box([x,1.14,-5.72],[.055,.1,.26],M.white);}
  box([0,2.3,-5.74],[7.25,.05,.12],M.white);box([0,1.18,-5.65],[7.4,.1,.44],M.stone);
  for(const x of [-2.7,2.7])plant(x,1.24,-5.6,.8);
  cabinet(-3.85,-5.15,1.35,1.1,g,false);
  for(let x=-2.6;x<=3.2;x+=.98)cabinet(x,-5.15,.94,1.1,g,false);
  // Backsplash tile and overhead cupboards.
  for(let row=0;row<3;row++)for(let col=0;col<14;col++)box([-4.6+col*.59,1.2+row*.18,-5.65],[.575,.16,.025],M.white,g,.009);
  for(const x of [-6.8]){box([x,2.55,-5.5],[1.3,1.15,.65],M.navy);for(const xx of [x-.32,x+.32]){box([xx,2.55,-5.15],[.59,1.07,.035],M.inset);handle(xx,2.24,-5.11,.16);}}
  target('pantry',pantry=>{
  for(const y of [1.2,1.85,2.5,3.15]){box([-7.18,y,-5.42],[1.15,.055,.7],M.oak,pantry);box([-7.18,y-.036,-5.07],[1.03,.018,.025],M.light,pantry);}
  for(const x of [-7.74,-6.62])box([x,2.16,-5.6],[.05,2.05,.6],M.oak,pantry);
  for(let i=0;i<5;i++){const x=-7.56+(i%3)*.34,y=i<3?1.89:2.54;cyl([x,y+.15,-5.26],.105,.29,M.glass,pantry);cyl([x,y+.13,-5.26],.085,.22,i%2?M.food:M.cream,pantry);cyl([x,y+.31,-5.26],.115,.045,M.steel,pantry);}

  const door=new T.Group();door.position.set(-7.76,0,-4.98);pantry.add(door);for(const x of [.02,1.13])box([x,2.18,0],[.06,2.36,.07],M.navy,door);for(const y of [1.02,3.34])box([.57,y,0],[1.18,.06,.07],M.navy,door);box([.57,2.18,0],[1.05,2.22,.018],M.glass,door);handle(.98,2.05,.07,.05,door);moving.pantryDoor=door;sign(['PANTRY'],[-7.18,3.46,-4.94],[1.1,.22],{w:512,h:128},pantry);});
  target('stove',stove=>{stove.position.set(2.2,0,-4.88);box([0,1.195,0],[1.15,.045,.79],M.black,stove);for(const x of [-.27,.27])for(const z of [-.19,.19]){ring([x,1.224,z],.17,.01,M.steel,stove);ring([x,1.225,z],.12,.005,M.steelDark,stove);}box([0,.64,.565],[1.09,.77,.055],M.steel,stove);box([0,.65,.606],[.87,.53,.025],M.black,stove);box([0,.65,.624],[.72,.39,.015],M.glass,stove);handle(0,1.0,.635,.75,stove);for(const x of [-.36,-.12,.12,.36]){const knob=cyl([x,1.115,.55],.04,.035,M.steel,stove);knob.rotation.x=Math.PI/2;}sign(['OFF · ADULT HELP'],[0,1.36,-.43],[.9,.16],{w:512,h:128},stove);});
  const sideCounter=new T.Group();sideCounter.position.set(-7.28,0,-1.45);sideCounter.rotation.y=Math.PI/2;g.add(sideCounter);cabinet(-.8,0,1.5,1.1,sideCounter);cabinet(.8,0,1.5,1.1,sideCounter);colliders.push({x:-7.8,z:-3.2,w:1.25,d:3.5});
  for(let i=0;i<4;i++){const cup=new T.Group();sideCounter.add(cup);cup.position.set(-.95+i*.33,1.23,0);cyl([0,.12,0],.1,.23,i%2?M.white:M.pink,cup);ring([.105,.13,0],.074,.014,i%2?M.white:M.pink,cup,[0,0,0]);}
  // French-door refrigerator and its interactive doors.
  target('fridge',fr=>{fr.position.set(-6.2,0,-4.84);box([0,1.42,-.5],[1.55,2.84,.18],M.steelDark,fr,.06);for(const xx of [-.72,.72])box([xx,1.42,0],[.12,2.84,1.18],M.steel,fr);box([0,2.78,0],[1.55,.12,1.18],M.steel,fr);box([0,.86,0],[1.4,.12,1.1],M.white,fr);box([0,1.8,-.38],[1.3,1.8,.07],M.white,fr);for(const yy of [1.08,1.62,2.16]){box([0,yy,.02],[1.3,.035,.95],M.glass,fr);box([0,yy,.5],[1.3,.035,.03],M.steel,fr);}packageItem([-.3,1.1,.1],null,{name:'Butter',size:'Keep refrigerated'},fr);for(const xx of [.15,.42])cyl([xx,1.3,-.12],.09,.36,M.white,fr);for(const xx of [-.39,.39]){const door=new T.Group();door.position.set(xx<0?-.77:.77,0,.64);fr.add(door);box([xx<0?.38:-.38,1.86,0],[.75,1.75,.09],M.steel,door,.04);handle(xx<0?.62:-.62,1.7,.075,.028,door);box([xx<0?.62:-.62,1.62,.16],[.034,.65,.04],M.brass,door,.013);if(xx<0){box([.23,1.82,.057],[.25,.37,.018],M.black,door);box([.23,1.65,.1],[.28,.025,.13],M.steel,door);}moving[xx<0?'fridgeL':'fridgeR']=door;}box([0,.46,.655],[1.48,.72,.11],M.steel,fr,.04);handle(0,.64,.73,1.1,fr);});
  // Sink with inset well, arched faucet, water stream and soap bottle.
  target('sink',si=>{si.position.set(-.75,0,-4.88);box([0,1.18,0],[1.02,.035,.76],M.steel,si);box([0,1.196,0],[.83,.025,.57],M.steelDark,si);box([0,1.2,0],[.67,.03,.42],M.black,si);cyl([0,1.22,0],.055,.01,M.steel,si);tube([[.24,1.2,-.3],[.24,1.7,-.3],[.22,1.8,-.2],[.07,1.8,-.1],[0,1.7,-.1],[0,1.58,-.1]],.025,M.brass,si);cyl([.4,1.3,-.3],.028,.2,M.brass,si);moving.water=cyl([0,1.4,-.1],.018,.36,M.water,si);moving.water.visible=false;moving.bubbles=new T.Group();si.add(moving.bubbles);for(let i=0;i<22;i++)sphere([-.3+random()*.6,1.24+random()*.09,-.18+random()*.36],[.025,.025,.025],M.white,moving.bubbles);moving.bubbles.visible=false;});
  target('soap',s=>{s.position.set(.02,1.2,-5);box([0,.13,0],[.16,.24,.12],M.blue,s,.04);cyl([0,.29,0],.03,.06,M.steel,s);box([.04,.33,0],[.12,.03,.03],M.black,s);sign(['SOAP'],[0,.14,.064],[.13,.07],{w:256,h:128},s);});
  target('towel',t=>{box([-1.5,1.19,-4.74],[.33,.04,.4],M.cloth,t,.04);});
  // Microwave hinge, cavity, glass, readable controls, removable bowl.
  target('microwave',mi=>{mi.position.set(-3.85,1.17,-4.92);box([0,.38,-.43],[1.35,.75,.065],M.steel,mi,.025);for(const xx of [-.65,.65])box([xx,.38,0],[.06,.75,.91],M.steel,mi);for(const yy of [.035,.72])box([0,yy,0],[1.35,.07,.91],M.steel,mi);box([.54,.38,.02],[.25,.65,.88],M.steel,mi);box([-.14,.37,-.387],[.99,.55,.018],M.steelDark,mi);box([-.14,.083,.02],[1.01,.025,.83],M.steelDark,mi);cyl([-.14,.1,.05],.32,.018,M.glass,mi);const door=new T.Group();door.position.set(-.65,0,.5);mi.add(door);for(const yy of [.09,.65])box([.51,yy,0],[1.01,.09,.045],M.black,door,.018);for(const xx of [.06,.96])box([xx,.37,0],[.11,.52,.045],M.black,door,.018);box([.47,.37,.029],[.76,.43,.01],M.glass,door,.01);for(let j=0;j<7;j++)box([.46,.21+j*.051,.04],[.72,.002,.003],M.steelDark,door,.001);box([.91,.36,.085],[.035,.38,.045],M.steel,door,.016);moving.microwaveDoor=door;sign(['READY'],[.52,.55,.49],[.2,.11],{bg:'#13262a',fg:'#b9eafa',accent:'#13262a',w:256,h:128},mi);for(let j=0;j<9;j++)box([.46+(j%3)*.055,.23+Math.floor(j/3)*.068,.49],[.025,.03,.02],M.black,mi,.003);});
  // Two independent kitchen islands with recessed cabinet doors and stool seating.
  for(const x of [-2.65,2.55]){
   box([x,.57,.18],[3.34,1.12,1.45],M.navy,g,.04);box([x,.12,.18],[3.13,.2,1.25],M.black);
   for(let i=-1;i<=1;i++){const xx=x+i*1.05;box([xx,.66,.935],[1.0,.85,.034],M.inset);for(const dx of [-.45,.45])box([xx+dx,.66,.965],[.045,.79,.035],M.navy);handle(xx,.95,.97,.36);}
   box([x,1.17,.13],[3.58,.14,1.72],M.stone,g,.055);
   for(const xx of [x-1.15,x+1.15])stool(xx,1.5);pendant(x,.1);colliders.push({x:x-1.9,z:-.9,w:3.8,d:2.15});
  }
  cabinet(-4.5,-.22,.86,1.1,g,true);
  book(-3.7,1.28,.16);
  litPlaque(['Recipe Book'],[-3.52,.63,.972],[1.25,.32],{id:'recipes'});
  litPlaque(['Kitchen Lab'],[2.55,.63,.976],[1.5,.34],{id:'station-kitchen'});
  // Actual measuring and cooking objects on the working island.
  packageItem([-3.62,1.25,-.4],'cereal',{name:'Rice Krispies Cereal',size:'½ cup for your recipe'});
  packageItem([-3.1,1.25,-.42],'marshmallows',{name:'Mini Marshmallows',size:'⅓ cup for your recipe'});
  packageItem([-2.65,1.25,-.48],'butter',{name:'Butter',size:'¾ teaspoon'});
  target('bowl',b=>{b.position.set(-2.25,1.25,.2);bowl(0,0,0,b);moving.mixture=cyl([0,.07,0],.22,.04,M.cream,b);moving.mixture.visible=false;moving.food=new T.Group();b.add(moving.food);for(let i=0;i<90;i++){const a=i*2.399,r=.22*Math.sqrt((i+.5)/90);const o=sphere([Math.cos(a)*r,.1+random()*.05,Math.sin(a)*r],[.032,.016,.019],M.food,moving.food);o.rotation.y=a;}moving.food.visible=false;moving.spoon=spoon(.18,.25,0,b);moving.spoon.rotation.z=.35;moving.spoon.userData.target='spoon';targets.set('spoon',moving.spoon);selectable.push(moving.spoon);});
  for(let j=0;j<3;j++)target('cup'+[4,6,12][j],p=>{measuringCup(-1.7+j*.19,1.25,-.39,['⅓ cup','½ cup','1 cup'][j],p);const fill=cyl([-1.7+j*.19,1.47,-.39],.11,.025,M.food,p);fill.visible=false;moving['fill'+[4,6,12][j]]=fill;});
  for(let j=0;j<3;j++)target('measure'+[1,2,4][j],p=>{const sp=spoon(-1.82+j*.21,1.3,.45,p);sp.scale.setScalar(.85+j*.07);sign(['¼ tsp','½ tsp','1 tsp'].slice(j,j+1),[-1.82+j*.21,1.29,.74],[.16,.07],{w:256,h:128},p).rotation.x=-Math.PI/2;});
  moving.spills=[];for(let i=0;i<5;i++){const spill=sphere([-3.9+i*.47,1.249,.7],[.12,.002,.07],mat('#bc9f6d',.85));moving.spills.push(spill);}
  target('container',p=>{box([-2.92,1.28,.57],[.6,.09,.4],M.white,p);box([-2.92,1.335,.57],[.53,.008,.33],M.cream,p);});
  box([-2.75,1.23,-4.92],[.73,.04,.58],M.oak);moving.spoonRest=spoon(-2.55,1.29,-4.72,g);moving.spoonRest.visible=false;
  target('mitts',p=>{box([-4.55,1.22,-4.9],[.3,.06,.42],M.pink,p,.08);box([-4.35,1.22,-4.84],[.16,.06,.2],M.pink,p,.05);});
  // Preparation props, serving area and utensils.
  for(const x of [1.65,3.48]){cyl([x,1.36,-.28],.14,.3,M.white);for(let j=0;j<5;j++){const sp=spoon(x+(random()-.5)*.13,1.68,-.28+(random()-.5)*.1,g,M.oak);sp.rotation.x=1.1;sp.rotation.z=(random()-.5)*.8;}}
  const fruit=bowl(2.5,1.25,.12,g,M.white,.26);for(let j=0;j<7;j++)sphere([2.5+Math.sin(j*2.4)*.19,1.47,.1+Math.cos(j*2.4)*.15],[.1,.1,.1],j%2?M.butter:mat('#b95736',.3));
  // Laundry machines, folding station, woven baskets, detergent and garment rails.
  machine(5,-4.5,'washer');machine(6.38,-4.5,'dryer');const upperWash=machine(5,-4.5,'washer-upper'),upperDry=machine(6.38,-4.5,'dryer-upper');upperWash.position.y=1.49;upperDry.position.y=1.49;box([5.69,1.46,-4.5],[2.66,.06,1.19],M.steelDark);
  litPlaque(['Laundry Room'],[5.7,3.35,-4.94],[2.75,.4],{blue:true,id:'station-laundry'});
  target('detergent',p=>{box([7.15,1.37,-.65],[.32,.5,.2],M.blue,p,.07);cyl([7.15,1.68,-.65],.06,.12,M.pink,p);sign(['DETERGENT','SMALL LOAD','FILL TO LINE 1'],[7.15,1.39,-.539],[.28,.32],{w:256,h:512},p);});
  for(let i=0;i<3;i++){const b=basket(4.8+i*.8,0,-2.8,i===0?M.white:i===1?M.blue:M.pink);b.userData.target=['lights','darks','colors'][i];targets.set(b.userData.target,b);selectable.push(b);sign([['LIGHTS','DARKS','COLORS'][i]],[4.8+i*.8,.25,-2.56],[.45,.12],{w:256,h:128});}
  box([7.15,1.05,-.2],[1.2,.14,3.15],M.oak);for(const x of [6.65,7.65])for(const z of [-1.55,1.15])box([x,.5,z],[.065,1,.065],M.black);
  garment(7.0,1.14,-1.1,'shirt',M.white);garment(7.0,1.14,-.25,'jeans',M.blue);garment(7.0,1.14,.6,'laundry-towel',M.pink);
  target('clothing',p=>{box([7.1,.8,2.2],[1.3,1.6,.7],M.oak,p);for(let j=0;j<3;j++){box([7.1,.35+j*.45,2.58],[1.2,.4,.025],M.white,p);handle(7.1,.47+j*.45,2.62,.4,p);}sign(['PUT AWAY'],[7.1,1.9,2.3],[1.3,.25],{h:256},p);});
  colliders.push({x:6.4,z:-1.8,w:1.5,d:3.6},{x:4.45,z:2.2,w:2.1,d:2.7});
  // Household corner includes a real made bed and independently movable bedding.
  target('bed',p=>{p.position.set(5.5,0,3.5);box([0,.4,0],[1.65,.5,2.35],M.oak,p,.08);box([0,.74,0],[1.6,.28,2.24],M.white,p,.12);moving.cover=box([0,.9,.27],[1.57,.06,1.68],M.blue,p,.08);moving.pillow=box([0,.98,-.78],[1.2,.16,.43],M.cream,p,.14);box([0,.9,-1.22],[1.75,1.1,.1],M.oak,p,.06);});
  target('cleaning',p=>{box([3.7,.75,3.5],[1.1,1.5,.65],M.navy,p);for(let j=0;j<3;j++)box([3.7,.2+j*.55,3.86],[1.03,.045,.68],M.oak,p);for(let j=0;j<3;j++){box([3.45+j*.24,.93,3.55],[.15,.28,.12],j%2?M.pink:M.blue,p,.035);sign(['LABEL'],[3.45+j*.24,.95,3.616],[.13,.08],{w:128,h:64},p);}sign(['CLEAN & ORGANIZE'],[3.6,1.8,3.8],[2.1,.34],{bg:'#f4c0d0',h:256},p);});
  target('cloth',p=>{box([3.7,1.27,.5],[.38,.04,.3],M.cloth,p,.04);});
  const contactTexture=texture((x,w,h)=>{const shade=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.5);shade.addColorStop(0,'rgba(30,25,19,.65)');shade.addColorStop(.55,'rgba(30,25,19,.35)');shade.addColorStop(1,'rgba(30,25,19,0)');x.fillStyle=shade;x.fillRect(0,0,w,h);},256,256);
  const contactMaterial=new T.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false});
  for(const [x,z,w,d]of [[-2.65,.18,4.25,2.5],[2.55,.18,4.25,2.5],[-6.2,-4.84,2,1.75],[5.7,-4.5,3.3,1.75],[5.65,-.6,3.6,1.7],[5.5,3.5,2.15,2.8]]){const shadow=mesh(new T.PlaneGeometry(w,d),contactMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.026,z);shadow.castShadow=false;shadow.receiveShadow=false;}
  // Natural room signage, classroom table, planner and student portfolio.
  litPlaque(['Home Economics & Life Skills Center','COOK   ·   SHOP   ·   CLEAN   ·   LAUNDRY   ·   PLAN   ·   LIVE'],[0,3.5,-5.46],[8.8,.65]);
  plant(-6.4,.03,1.2,1.5);plant(7.4,0,-4.9,1.3);
  sign(['Good food.','Good skills.','Bright futures.'],[-4.2,2.8,-5.13],[1.15,1.0],{bg:'#263d3f',fg:'#f8eacb',accent:'#bd8e55'});
  target('progress',p=>{box([.7,1.27,.54],[.63,.08,.43],M.blue,p);sign(['MY PROGRESS'],[.7,1.32,.54],[.57,.35],{bg:'#e0edf8',accent:'#72aad6'},p).rotation.x=-Math.PI/2;});
  target('shopping',p=>{box([-6.05,1.75,-3.7],[.65,.8,.07],M.oak,p);sign(['GROCERY PLAN','LIST · BUDGET','SHOP · RETURN'],[-6.05,1.76,-3.65],[.59,.72],{bg:'#f6e5c6',w:512,h:512},p);});
 }else{
  // Supplemental interactive shelves inside the existing grocery page; catalog
  // and all purchase handlers are supplied by that page, never cloned here.
  box([0,-.12,0],[10,.2,9],M.stone);box([0,1.8,-1],[8,3.6,.18],M.wall);
  for(const y of [.35,1.2,2.05]){box([0,y,-.35],[6.6,.09,1.1],M.white);box([0,y-.055,.23],[6.6,.12,.045],M.blue);}
  for(const x of [-3.3,0,3.3])box([x,1.34,-.82],[.055,2.6,.06],M.steel);
  for(const [index,p]of groceryProducts.entries()){
   const stock=new T.Group();g.add(stock);stock.userData.target=p.key;targets.set(p.key,stock);selectable.push(stock);
   const template=new T.Group();packageItem([0,0,0],null,{name:p.name,size:p.size,price:p.price},template);const parts=template.children[0].children,places=[];
   for(let row=0;row<3;row++)for(let col=0;col<8;col++)if(Math.floor(col/8*groceryProducts.length)===index)places.push([-2.9+col*.82,.4+row*.85,-.15]);
   const groups=new Map();for(const child of parts){child.updateMatrix();const geometry=child.geometry.clone().applyMatrix4(child.matrix),key=child.material.uuid;if(!groups.has(key))groups.set(key,{material:child.material,geometries:[]});groups.get(key).geometries.push(geometry);}
   for(const entry of groups.values()){const geometry=T.mergeGeometries(entry.geometries.map(v=>v.index?v.toNonIndexed():v),false),instances=new T.InstancedMesh(geometry,entry.material,places.length),dummy=new T.Object3D();for(const [i,pos]of places.entries()){dummy.position.set(...pos);dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix);}instances.instanceMatrix.needsUpdate=true;instances.castShadow=true;instances.receiveShadow=true;stock.add(instances);}
   sign([p.name,'$'+p.price.toFixed(2)+' · '+p.size],[-3.28+6.56/groceryProducts.length*(index+.5),.26,.28],[6.56/groceryProducts.length-.12,.18],{bg:'#fffbea',w:1024,h:128});
  }
  // Wire shopping cart with swivel wheels and padded handle.
  const cart=target('cart',c=>{c.position.set(1.7,0,2.05);box([0,.4,0],[1.4,.055,.85],M.steel,c);for(let k=0;k<11;k++)for(const z of [-.43,.43])box([-.7+k*.14,.88,z],[.018,.91,.018],M.steel,c,.005);for(let k=0;k<7;k++)for(const x of [-.71,.71])box([x,.88,-.43+k*.143],[.018,.91,.018],M.steel,c,.005);for(const y of [.5,.7,.9,1.1,1.3]){box([0,y,.43],[1.45,.018,.018],M.steel,c);box([0,y,-.43],[1.45,.018,.018],M.steel,c);box([-.71,y,0],[.018,.018,.88],M.steel,c);box([.71,y,0],[.018,.018,.88],M.steel,c);}tube([[-.71,1.32,-.43],[-.9,1.5,-.43],[-.9,1.5,.43],[-.71,1.32,.43]],.026,M.blue,c);for(const x of [-.57,.57])for(const z of [-.34,.34]){const wheel=cyl([x,.15,z],.12,.065,M.black,c);wheel.rotation.x=Math.PI/2;box([x,.28,z],[.04,.24,.04],M.steel,c);}});moving.cart=cart;
  sign(['TRANSITION TOWN GROCERY','YOUR RECIPE · YOUR SHOPPING LIST'],[0,3.13,-.85],[6.5,.5],{bg:'#e6f0ea',accent:'#79ac94',h:256});
 }
 function paintCart(items){if(!moving.cart)return;if(moving.cartItems){moving.cartItems.traverse(o=>{if(o.material&&!Object.values(M).includes(o.material)){o.material.map?.dispose();o.material.dispose();}});moving.cart.remove(moving.cartItems);}const products=new T.Group();moving.cart.add(products);moving.cartItems=products;for(const [i,item]of items.slice(0,6).entries())packageItem([-.42+(i%3)*.4,.45+Math.floor(i/3)*.15,-.16+Math.floor(i/3)*.3],null,{name:item.name,size:item.size,price:item.price},products);}
 // Use the existing student avatar palette and original portrait when available.
 const avatar=new T.Group();scene.add(avatar);avatar.position.set(0,0,3);const safe=(v,def)=>/^#[0-9a-f]{3,8}$/i.test(v||'')?v:def;
 const skin=mat(safe(profile.skin,'#a87559'),.7),hair=mat(safe(profile.hair,'#352822'),.7),shirt=mat(safe(profile.shirt,'#6d88aa'),.6),pants=mat(safe(profile.pants,'#34475c'),.7);
 sphere([0,1.49,0],[.19,.23,.18],skin,avatar);sphere([0,1.62,-.025],[.2,.13,.18],hair,avatar);box([0,1.1,0],[.46,.53,.27],shirt,avatar,.12);for(const x of [-.075,.075])sphere([x,1.5,.164],[.018,.024,.013],M.black,avatar);
 const limbs=[];for(const x of [-.14,.14]){const leg=box([x,.43,0],[.19,.74,.2],pants,avatar,.08);box([x,.085,.06],[.21,.13,.34],M.black,avatar,.05);limbs.push(leg);}for(const x of [-.31,.31])limbs.push(box([x,1.03,0],[.13,.55,.15],skin,avatar,.06));
 const hud=document.getElementById('student-portrait');if(hud&&window.TTDrawAvatar){const ctx=hud.getContext('2d');window.TTDrawAvatar(ctx,44,89,profile,0,false,1.02,student);}
 avatar.visible=false;
 // Static batching retains interaction groups while reducing draw calls.
 function batch(group){for(const child of [...group.children])if(child.isGroup&&!Object.values(moving).includes(child)&&child!==avatar)batch(child);
  const bins=new Map();for(const child of [...group.children])if(child.isMesh&&!child.isInstancedMesh&&!Object.values(moving).includes(child)&&!child.material.transparent){const key=child.material.uuid;child.updateMatrix();let geo=child.geometry.clone().applyMatrix4(child.matrix);if(geo.index){const non=geo.toNonIndexed();geo.dispose();geo=non;}if(!bins.has(key))bins.set(key,{material:child.material,geometries:[],objects:[]});const b=bins.get(key);b.geometries.push(geo);b.objects.push(child);}
  for(const b of bins.values())if(b.objects.length>1){const merged=T.mergeGeometries(b.geometries,false);if(merged){b.objects.forEach(o=>group.remove(o));mesh(merged,b.material,group);}b.geometries.forEach(v=>v.dispose());}
 }
 function flatten(group){for(const child of [...group.children])if(child.isGroup&&!child.userData.target&&!child.userData.plant&&!Object.values(moving).includes(child)){flatten(child);child.updateMatrixWorld(true);for(const item of [...child.children])group.attach(item);group.remove(child);}}
 const foliageReady=offline||!plantHolders.length?Promise.resolve():new Promise((resolve,reject)=>new T.GLTFLoader().load(new URL('./materials/potted-plant.glb',import.meta.url).href,gltf=>{const source=gltf.scene,bounds=new T.Box3().setFromObject(source),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());source.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));const normalized=new T.Group();normalized.scale.setScalar(1/size.y);normalized.add(source);source.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});for(const holder of plantHolders)holder.add(normalized.clone(true));sun.shadow.needsUpdate=true;wake();resolve();},undefined,reject));
 if(moving.food)batch(moving.food);if(moving.cart)batch(moving.cart);for(const id of ['washer','dryer','washer-upper','dryer-upper'])if(moving[id])batch(moving[id]);flatten(g);batch(g);
 if(offline){camera.position.set(...(groceryProducts?[5,3.15,6.1]:VIEWS.classroom.eye));camera.lookAt(new T.Vector3(...(groceryProducts?[.6,1.3,.1]:VIEWS.classroom.at)));scene.updateMatrixWorld(true);return {scene,camera,targets,updateCart:paintCart};}
 let mode='tap',station='classroom',state=null,disposed=false,raf=0,last=0,animateUntil=performance.now()+2000,lastFrame=0,drag=null,hover=null,rotation=0,turn=0,gesture=0,fridgeOpen=false,pantryOpen=false,dynamicUntil=0,shadowStamp=0;
 const eye=new T.Vector3(...(groceryProducts?[5,3.15,6.1]:VIEWS.classroom.eye)),at=new T.Vector3(...(groceryProducts?[.6,1.3,.1]:VIEWS.classroom.at));camera.position.copy(eye);const look=at.clone();camera.lookAt(look);
 const keys=new Set(),walk={yaw:0,pitch:.3},ray=new T.Raycaster(),mouse=new T.Vector2();
 const wake=(duration=900)=>{animateUntil=Math.max(animateUntil,performance.now()+duration);if(!raf)raf=requestAnimationFrame(draw);};
 function resize(){const rect=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();wake();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 function tint(o,value){if(!o)return;const clones=new Map(),disposedMaterials=new Set();o.traverse(c=>{if(!c.isMesh||!c.material.emissive)return;if(value){const original=c.material;let highlighted=clones.get(original);if(!highlighted){highlighted=original.clone();highlighted.emissive.set('#77435c');highlighted.emissiveIntensity=.25;clones.set(original,highlighted);}c.userData.hoverOriginal=original;c.material=highlighted;}else if(c.userData.hoverOriginal){disposedMaterials.add(c.material);c.material=c.userData.hoverOriginal;delete c.userData.hoverOriginal;}});disposedMaterials.forEach(m=>m.dispose());}
 function hit(e){const b=canvas.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);const intersections=ray.intersectObjects(selectable,true);for(const i of intersections){let o=i.object;while(o&&!o.userData.target)o=o.parent;if(o)return o;}return null;}
 function move(dx,dz,dt){const nx=avatar.position.x+(Math.sin(walk.yaw)*dz+Math.cos(walk.yaw)*dx)*dt*2.7,nz=avatar.position.z+(Math.cos(walk.yaw)*dz-Math.sin(walk.yaw)*dx)*dt*2.7;if(nx<-7.2||nx>7.2||nz<-3.7||nz>5.25)return;if(colliders.some(c=>nx>c.x&&nx<c.x+c.w&&nz>c.z&&nz<c.z+c.d))return;avatar.position.x=nx;avatar.position.z=nz;avatar.rotation.y=walk.yaw+Math.atan2(dx,dz);}
 function draw(time){raf=0;if(disposed||document.hidden)return;const elapsed=Math.max(0,(time-(last||time))/1000),dt=Math.min(.06,elapsed);last=time;const active=(!state?.paused&&state?.work?.hands?.rubbing&&!state?.work?.hands?.dried)||(state?.work?.microwave?.until>Date.now())||(state?.laundry?.work?.washUntil>Date.now())||(state?.laundry?.work?.dryUntil>Date.now());
  let movingNow=false;if(mode==='walk'&&!state?.paused){const dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dz=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);if(dx||dz){move(dx,dz,dt);movingNow=true;}eye.set(avatar.position.x+Math.sin(walk.yaw)*4,2.65+walk.pitch,avatar.position.z+Math.cos(walk.yaw)*4);at.set(avatar.position.x,1.25,avatar.position.z);}
  const t=1-Math.exp(-Math.min(.6,elapsed)*7);camera.position.lerp(eye,t);look.lerp(at,t);camera.lookAt(look);limbs.forEach((l,i)=>l.rotation.x=movingNow?Math.sin(time*.012)*(i%2?-.25:.25):0);
  const house=state?.activeHousehold,hstep=state?.household?.[house]?.step||0,houseActive=['cleaning','clothing'].includes(state?.station);
  if(moving.cabinet)moving.cabinet.rotation.y+=(((houseActive&&house==='cabinets'&&hstep>0&&hstep<4)||state?.work?.cabinetOpen?-1.55:0)-moving.cabinet.rotation.y)*t;
  const fridgeWide=fridgeOpen||(houseActive&&house==='groceries'&&hstep>0&&hstep<4);for(const [id,sign]of [['fridgeL',-1],['fridgeR',1]])if(moving[id])moving[id].rotation.y+=((fridgeWide?sign*1.3:0)-moving[id].rotation.y)*t;
  if(targets.get('butter'))targets.get('butter').position.lerp(new T.Vector3(...(houseActive&&house==='groceries'&&hstep>=2?[-6.45,1.12,-4.7]:[-2.65,1.25,-.48])),t);
  if(targets.get('cloth')){targets.get('cloth').position.x=houseActive&&house==='counters'&&hstep>=3?-.5:0;}
  if(moving.microwaveDoor)moving.microwaveDoor.rotation.y+=((state?.work?.microwave?.open?-1.7:0)-moving.microwaveDoor.rotation.y)*t;
  if(moving.water)moving.water.visible=!!state?.work?.hands?.water&&!state?.work?.hands?.dried&&station==='sink';
  if(moving.spoonRest)moving.spoonRest.visible=state?.step===7&&!!state?.work?.microwave?.in;
  if(moving.spoon){moving.spoon.visible=!(state?.step===7&&state?.work?.microwave?.in);rotation+=(turn-rotation)*t;moving.spoon.rotation.y=rotation;moving.spoon.position.x=.16*Math.cos(rotation);moving.spoon.position.z=.16*Math.sin(rotation);}
  if(moving.mixture){moving.mixture.visible=!!state?.work?.butter||!!state?.work?.marshmallows;moving.mixture.scale.y=state?.work?.microwave?.intervals?1.2:1;}
  if(moving.food){moving.food.visible=!!state?.work?.cereal;moving.food.position.lerp(new T.Vector3(state?.work?.transferred?-.67:0,state?.work?.transferred ? .08 : 0,state?.work?.transferred ? .37 : 0),t);}
  if(moving.bubbles){moving.bubbles.visible=!!state?.work?.hands?.rubbing&&!state?.work?.hands?.rinsed&&station==='sink';if(moving.bubbles.visible)moving.bubbles.children.forEach((b,i)=>b.position.y=1.25+Math.sin(time*.004+i)*.018);}
  for(const amount of [4,6,12]){const c=targets.get('cup'+amount);if(c){c.position.y=state?.work?.selected===amount&&state?.step!==3 ? .1 : 0;if(moving['fill'+amount])moving['fill'+amount].visible=!!state?.work?.scooped&&state?.work?.selected===amount&&state?.step!==3;}}
  for(const amount of [1,2,4]){const s=targets.get('measure'+amount);if(s)s.position.y=state?.work?.selected===amount&&state?.step===3 ? .1 : 0;}
  const bowlObject=targets.get('bowl');if(bowlObject){const microwaving=state?.step===7&&state?.work?.microwave?.in;bowlObject.position.lerp(new T.Vector3(...(microwaving?[-3.99,1.28,-4.77]:houseActive&&house==='dishes'&&hstep>=2?[-.75,1.25,-4.88]:state?.phase==='cook'&&state?.step===7?[-2.75,1.25,-4.92]:state?.phase==='cook'&&state?.step===2&&!state?.work?.tools?.includes('bowl')?[-4.5,.63,-.22]:[-2.25,1.25,.2])),t);}
  for(const [i,objectId]of ['shirt','jeans','laundry-towel'].entries()){const garment=targets.get(objectId);if(!garment)continue;const item=['shirt','jeans','towel'][i],l=state?.laundry,w=l?.work||{},folding=l?.step>=8;let p=garment.userData.home||[7,1.14,-1.1+i*.85];if(w.sorted?.includes(item)&&!folding)p=[4.8+i*.8,.23,-2.8];garment.visible=folding||!(w.loaded>i);if(folding){garment.scale.x=1-(w.folds>0?.24:0);garment.scale.z=1-(w.folds>1?.3:0);}if(w.away?.includes(item))p=[7.1,.35+i*.45,2.65];garment.position.lerp(new T.Vector3(...p),t);}
  if(moving.spills)moving.spills.forEach((o,i)=>o.visible=state?.phase==='cook'&&state?.step>=12&&i>=(state?.work?.wipes||0));
  for(const id of ['washer','washer-upper','dryer','dryer-upper']){const drum=moving[id];if(!drum)continue;const w=state?.laundry?.work||{},washer=id.startsWith('washer');drum.visible=washer?!!w.loaded&&!w.moved:!!w.moved;if((washer?w.washUntil:w.dryUntil)>Date.now()&&!state?.paused)drum.rotation.z+=dt*(washer?3:2);}
  if(moving.pantryDoor)moving.pantryDoor.rotation.y=moving.pantryDoor.rotation.y+((pantryOpen?-1.5:0)-moving.pantryDoor.rotation.y)*Math.min(1,dt*8);
  if(moving.cover&&state?.household?.bed)moving.cover.scale.z=.6+Math.min(4,state.household.bed.step)*.1;
  if((movingNow||time<dynamicUntil)&&time-shadowStamp>100){sun.shadow.needsUpdate=true;shadowStamp=time;}
  if(time-lastFrame>32){renderer.render(scene,camera);lastFrame=time;}
  const unsettled=camera.position.distanceToSquared(eye)>.0001||Math.abs(turn-rotation)>.01;
  if(time<animateUntil||unsettled||movingNow||keys.size||active)raf=requestAnimationFrame(draw);
 }
 function focus(name,instant=false){station=VIEWS[name]?name:'classroom';if(groceryProducts)return;if(mode==='walk'&&station!=='classroom'){const v=VIEWS[station];avatar.position.set(clamp(v.eye[0],-7,7),0,clamp(v.eye[2],-3.5,5));walk.yaw=Math.atan2(v.eye[0]-v.at[0],v.eye[2]-v.at[2]);}else{eye.set(...VIEWS[station].eye);at.set(...VIEWS[station].at);}if(instant||matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(eye);look.copy(at);}wake(1200);}
 function update(s){state=s;dynamicUntil=performance.now()+900;sun.shadow.needsUpdate=true;for(const id of ['washer','washer-upper','dryer','dryer-upper']){const display=moving[id+'Display'],w=s.laundry?.work||{},washer=id.startsWith('washer'),text=washer?(w.temp||w.cycle?((w.temp||'TEMP?')+' · '+(w.cycle||'CYCLE?')).toUpperCase():'READY'):(w.heat?'HEAT · '+w.heat.toUpperCase():'READY');if(display&&display.userData.text!==text){display.material.map.dispose();display.material.map=label([text],{bg:'#12242a',fg:'#86d9f6',accent:'#12242a',w:512,h:128});display.material.needsUpdate=true;display.userData.text=text;}}if(s.paused)keys.clear();mode=s.mode||'tap';avatar.visible=mode==='walk'&&!groceryProducts;wake();}
 const down=e=>{drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:0,target:hit(e)};canvas.setPointerCapture(e.pointerId);};
 const pointerMove=e=>{if(drag){const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;drag.lastX=e.clientX;drag.lastY=e.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);
   const targetId=drag.target?.userData.target;
   if(targetId==='bowl'&&['combine','stir'].includes(state?.phase==='cook'&&['safety','hands','tools','butter','marshmallows','combine','supervision','microwave','cereal','stir'][state.step])){gesture+=Math.hypot(dx,dy);if(gesture>70){gesture=0;turn+=1;onObject('stirGesture');}}
   else if(mode==='walk'){walk.yaw-=dx*.006;walk.pitch=clamp(walk.pitch+dy*.004,-.5,1);}
   else{const offset=eye.clone().sub(at),radius=offset.length(),theta=Math.atan2(offset.x,offset.z)-dx*.006,phi=clamp(Math.acos(offset.y/radius)+dy*.004,.25,1.4);eye.set(at.x+radius*Math.sin(phi)*Math.sin(theta),at.y+radius*Math.cos(phi),at.z+radius*Math.sin(phi)*Math.cos(theta));}wake();
  }else{const o=hit(e);if(o!==hover){tint(hover,false);hover=o;tint(hover,true);canvas.style.cursor=o?'pointer':'grab';const tooltip=document.getElementById('object-label');if(tooltip){tooltip.textContent=o?.userData.target.replace(/-/g,' ')||'Drag to look around';}wake();}}};
 const up=e=>{if(drag&&drag.moved<10){const o=hit(e);if(o){if(mode==='walk'&&interactionDistance(o,avatar.position)>3.3){onObject('approach',o.userData.target);}else onObject(o.userData.target);}}drag=null;};
 const keydown=e=>{if(e.target.closest('input,select,textarea,button,a,dialog')||e.ctrlKey||e.metaKey||e.altKey)return;if(mode==='walk'&&['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){keys.add(e.key);e.preventDefault();wake();}if(mode==='walk'&&e.key==='e'){let nearest=null,distance=3.4;for(const o of selectable){const dist=interactionDistance(o,avatar.position);if(dist<distance){nearest=o;distance=dist;}}if(nearest)onObject(nearest.userData.target);}};
 const keyup=e=>keys.delete(e.key),blur=()=>{keys.clear();drag=null;},visibility=()=>{if(!document.hidden){last=0;wake();}else blur();};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',blur);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
 resize();Promise.all([art.ready,environmentReady,foliageReady]).then(async()=>{if(disposed)return;await renderer.compileAsync(scene,camera);if(disposed)return;onReady({meshes:renderer.info.render.calls});wake(1800);}).catch(error=>{if(!disposed)onError(error);});wake(2500);
 let touchKey='';
 return {focus,update,pose:()=>({avatar:avatar.position.toArray(),camera:camera.position.toArray(),mode,station,spoonVisible:moving.spoon?.visible,materials:{...art.state},plants:plantHolders.filter(p=>p.children.length).length,reflection:!!polishedFloor?.mirror,bowl:targets.get('bowl')?.position.toArray()}),updateCart:items=>{paintCart(items);wake();},startMove:direction=>{if(state?.paused)return;touchKey=({forward:'w',back:'s',left:'a',right:'d'})[direction]||'';if(touchKey)keys.add(touchKey);wake();},stopMove:()=>{if(touchKey)keys.delete(touchKey);touchKey='';},setQuality:quality=>{const low=quality==='low';renderer.setPixelRatio(low?.75:Math.min(devicePixelRatio||1,innerWidth<700?1.35:1.6));renderer.shadowMap.enabled=!low;if(polishedFloor?.mirror)polishedFloor.mirror.visible=!low;sun.shadow.needsUpdate=true;resize();},rotate:dir=>{if(mode==='walk')walk.yaw+=dir*.3;else{const v=eye.clone().sub(at),a=dir*.22;eye.set(at.x+v.x*Math.cos(a)+v.z*Math.sin(a),eye.y,at.z+v.z*Math.cos(a)-v.x*Math.sin(a));}wake();},step:direction=>{if(state?.paused)return;move(direction==='left'?-1:direction==='right'?1:0,direction==='forward'?-1:direction==='back'?1:0,.22);wake();},animate:kind=>{dynamicUntil=performance.now()+1000;if(kind==='fridge'){fridgeOpen=!fridgeOpen;sun.shadow.needsUpdate=true;}if(kind==='pantry')pantryOpen=!pantryOpen;if(kind==='stir'){turn+=Math.PI*.7;}if(kind==='scoop'&&moving.spoon)turn+=.5;wake(1000);},stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,width:canvas.width,height:canvas.height}),dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',blur);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material){ms.add(o.material);for(const value of Object.values(o.material))if(value?.isTexture)ts.add(value);}});gs.forEach(o=>o.dispose());ms.forEach(o=>o.dispose());ts.forEach(o=>o.dispose());art.dispose();polishedFloor?.dispose();env.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
