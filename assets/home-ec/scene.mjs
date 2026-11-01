import * as T from './three.js';

// All classroom objects are real meshes. Shared materials, instanced small parts,
// static mesh batching, capped resolution and idle rendering keep school devices viable.
export const VIEWS={
 classroom:{eye:[10,6.9,12.8],at:[0,1.45,-1.1]},
 kitchen:{eye:[-1.0,3.2,4.15],at:[-2.45,1.3,.15]},
 recipes:{eye:[-6.1,2.8,3.8],at:[-3.65,1.3,.3]},
 shopping:{eye:[-5.8,2.4,-.1],at:[-5.9,1.5,-3.8]},
 sink:{eye:[-.8,2.65,-1.9],at:[-.9,1.3,-4.65]},
 microwave:{eye:[-4.2,2.45,-1.7],at:[-3.95,1.5,-4.65]},
 laundry:{eye:[7.0,3.15,3.4],at:[5.65,1.25,-2.9]},
 cleaning:{eye:[5.2,3.0,5.3],at:[3.05,1.25,1.45]},
 clothing:{eye:[6.9,3.6,4.0],at:[5.0,1.1,1.2]},
 challenge:{eye:[-1.0,3.2,4.15],at:[-2.45,1.3,.15]},
 progress:{eye:[5.2,3.9,7.0],at:[2.3,1.3,.2]}
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let seed=731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function label(lines,{bg='#fbf5e9',fg='#233945',accent='#e8a6bb',w=1024,h=512}={}){
 return texture((x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle=accent;x.lineWidth=12;x.strokeRect(10,10,W-20,H-20);x.textAlign='center';x.textBaseline='middle';lines.forEach((l,i)=>{x.font=`${i===0?'bold ':''}${Math.min(H/(lines.length+1)*.64,W/(l.length*.62))}px ${i===0?'Georgia':'Arial'}`;x.fillStyle=fg;x.fillText(l,W/2,H*(i+1)/(lines.length+1),W-55);});},w,h);
}
const marble=()=>texture((x,w,h)=>{x.fillStyle='#e4e1d8';x.fillRect(0,0,w,h);for(let i=0;i<4000;i++){const v=Math.floor(180+random()*50);x.fillStyle=`rgba(${v},${v},${v},.12)`;x.fillRect(random()*w,random()*h,3,3);}for(let i=0;i<22;i++){x.strokeStyle=i%4?'#92969738':'#b6a28b45';x.lineWidth=i%4?.5:2;x.beginPath();let y=random()*h;x.moveTo(0,y);for(let a=0;a<=w;a+=16){y+=(random()-.5)*22;x.lineTo(a,y);}x.stroke();}});
const wood=()=>texture((x,w,h)=>{x.fillStyle='#ac7951';x.fillRect(0,0,w,h);for(let i=0;i<250;i++){x.strokeStyle=`rgba(${i%2?50:220},${i%2?30:170},${i%2?10:110},${.05+random()*.12})`;x.lineWidth=random()*2;x.beginPath();let y=random()*h;x.moveTo(0,y);for(let z=0;z<w;z+=12)x.lineTo(z,y+Math.sin(z*.015+i)*3);x.stroke();}});

export function createClassroom(canvas,{onObject=()=>{},onReady=()=>{},onError=()=>{},profile={},student='Guest',groceryProducts=null,offline=false}={}){
 seed=731;
 let renderer;if(!offline)try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});}catch(e){onError(e);return null;}
 if(!offline){renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.35:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
 const scene=new T.Scene();scene.background=new T.Color('#ede9df');scene.fog=new T.Fog('#ede9df',25,65);
 const camera=new T.PerspectiveCamera(49,1,.05,90);let env;if(!offline){const environment=new T.RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromScene(environment,.04);scene.environment=env.texture;environment.dispose();pmrem.dispose();}
 const mat=(color,roughness=.45,metalness=0,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
 const M={wall:mat('#e4d9c5',.9),ceiling:mat('#f7f0dd',.85),navy:mat('#364952',.22,.12),inset:mat('#2c3e46',.3,.12),oak:mat('#bc8b56',.4,0,{map:wood()}),stone:mat('#eee9df',.18,.06,{map:marble()}),steel:mat('#afbabd',.24,.86),steelDark:mat('#454f55',.3,.7),brass:mat('#ad834d',.25,.8),black:mat('#111b20',.17,.4),white:mat('#f4f2e8',.23,.08),pink:mat('#eaa9be',.25,.08),blue:mat('#82b9e3',.28,.1),green:mat('#375647',.5),leaf:mat('#3f653b',.65),leafLight:mat('#7c985a',.55),terra:mat('#b17a52',.65),water:new T.MeshPhysicalMaterial({color:'#94c7da',roughness:.08,metalness:0,transparent:true,opacity:.5,transmission:.35}),glass:new T.MeshPhysicalMaterial({color:'#d5edf3',roughness:.06,metalness:.05,transparent:true,opacity:.36,transmission:.65,thickness:.08}),cloth:mat('#adc5ca',.92),cream:mat('#f7ead0',.8),food:mat('#d6a75b',.68),butter:mat('#f0d775',.38),light:mat('#fff5d3',.25,0,{emissive:'#ffd78b',emissiveIntensity:2.3})};
 const root=new T.Group();scene.add(root);const targets=new Map(),moving={},geoms=new Map(),selectable=[],colliders=[];
 const g=new T.Group();root.add(g);
 function mesh(geometry,material,parent=g){const o=new T.Mesh(geometry,material);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(p,s,m=M.white,parent=g,r=.025){const key=s.join(',')+','+r;let geo=geoms.get(key);if(!geo){geo=r?new T.RoundedBoxGeometry(...s,2,Math.min(r,...s.map(v=>v*.18))):new T.BoxGeometry(...s);geoms.set(key,geo);}const o=mesh(geo,m,parent);o.position.set(...p);return o;}
 function cyl(p,r,h,m=M.steel,parent=g,r2=r,seg=32){const o=mesh(new T.CylinderGeometry(r2,r,h,seg,1),m,parent);o.position.set(...p);return o;}
 function sphere(p,s,m,parent=g){const o=mesh(new T.SphereGeometry(1,18,12),m,parent);o.position.set(...p);o.scale.set(...s);return o;}
 function ring(p,r,t,m,parent=g,rotation=[Math.PI/2,0,0]){const o=mesh(new T.TorusGeometry(r,t,8,40),m,parent);o.position.set(...p);o.rotation.set(...rotation);return o;}
 function tube(points,r,m,parent=g){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),20,r,6,false),m,parent);}
 function target(id,build,parent=g){const o=new T.Group();parent.add(o);o.userData.target=id;build(o);targets.set(id,o);selectable.push(o);return o;}
 function sign(lines,p,s,style={},parent=g){const t=label(lines,style),o=mesh(new T.PlaneGeometry(...s),new T.MeshStandardMaterial({map:t,roughness:.52,metalness:.02}),parent);o.position.set(...p);o.castShadow=false;return o;}
 function plant(x,y,z,scale=.7,parent=g){const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);parent.add(p);cyl([0,.17,0],.2,.33,M.terra,p,.24);cyl([0,.335,0],.22,.018,mat('#3e3020'),p);for(let i=0;i<17;i++){const a=i*2.399,r=.17+random()*.18,yy=.35+random()*.55;tube([[0,.32,0],[Math.sin(a)*r*.6,yy*.8,Math.cos(a)*r*.6],[Math.sin(a)*r,yy,Math.cos(a)*r]],.008,M.green,p);const leaf=sphere([Math.sin(a)*r,yy,Math.cos(a)*r],[.1,.035,.24],i%2?M.leaf:M.leafLight,p);leaf.rotation.set(-.3,a,.3);}return p;}
 function handle(x,y,z,w=.35,parent=g){tube([[x-w/2,y,z+.018],[x-w/2,y,z+.07],[x+w/2,y,z+.07],[x+w/2,y,z+.018]],.014,M.brass,parent);}
 function cabinet(x,z,w=.94,h=1.1,parent=g,interactive=false){
  if(interactive){box([x,h/2,z-.49],[w,h,.055],M.navy,parent);for(const side of [-1,1])box([x+side*(w/2-.03),h/2,z],[.055,h,1.04],M.navy,parent);for(const yy of [.1,.58,1.05])box([x,yy,z],[w-.07,.045,1.0],M.oak,parent);}else box([x,h/2,z],[w,h,1.04],M.navy,parent,.035);box([x,.085,z+.04],[w-.07,.12,.97],M.black,parent,.012);
  const build=door=>{door.position.set(x-w/2+.025,0,z+.55);box([w/2-.025,.65,0],[w-.055,.88,.035],M.navy,door);box([w/2-.025,.65,.027],[w-.19,.7,.017],M.inset,door,.01);for(const xx of [.07,w-.12])box([xx,.65,.032],[.035,.77,.035],M.navy,door,.004);handle(w/2-.025,.94,.06,.26,door);};
  if(interactive){const door=target('cabinet',build,parent);moving.cabinet=door;}else{const door=new T.Group();parent.add(door);build(door);}
  box([x,h+.04,z],[w+.05,.1,1.13],M.stone,parent,.035);
 }
 function book(x,y,z,parent=g){return target('recipes',b=>{b.position.set(x,y,z);const cover=box([0,0,0],[.68,.06,.47],M.pink,b,.012);cover.rotation.x=-.12;for(let j=0;j<6;j++)box([0,.035+j*.003,0],[.65,.002,.44],M.cream,b,.001);const page=sign(['MY RECIPE BOOK','COOK  ·  SHARE  ·  LEARN'],[0,.072,0],[.61,.4],{accent:'#dc8eaa',h:512},b);page.rotation.x=-Math.PI/2;},parent);}
 function spoon(x,y,z,parent=g,color=M.steel){const sp=new T.Group();parent.add(sp);sp.position.set(x,y,z);box([0,0,.19],[.035,.025,.35],color,sp,.016);sphere([0,0,-.035],[.072,.014,.1],color,sp);return sp;}
 function bowl(x,y,z,parent=g,material=M.glass,r=.34){const points=[];for(let i=0;i<=16;i++){const t=i/16;points.push(new T.Vector2(.08+Math.sin(t*Math.PI/2)*r,t*.26));}for(let i=16;i>=0;i--){const t=i/16;points.push(new T.Vector2(.065+Math.sin(t*Math.PI/2)*(r-.016),t*.26+.016));}const o=mesh(new T.LatheGeometry(points,40),material,parent);o.position.set(x,y,z);ring([x,y+.27,z],r+.08,.012,M.glass,parent);return o;}
 function measuringCup(x,y,z,labelText='½ cup',parent=g){const cup=new T.Group();parent.add(cup);cup.position.set(x,y,z);cyl([0,.11,0],.125,.21,M.steel,cup);cyl([0,.219,0],.11,.008,M.black,cup);ring([0,.22,0],.124,.009,M.steel,cup);box([0,.16,.25],[.055,.035,.3],M.steel,cup,.018);sign([labelText],[0,.17,.403],[.21,.075],{w:256,h:128},cup);return cup;}
 function packageItem(p,id,product,parent=g){
  const o=new T.Group();o.position.set(...p);parent.add(o);const isCereal=/cereal|rice|flakes/i.test(product.name||''),butter=/butter/i.test(product.name||'');
  const color=butter?'#e9bd4c':isCereal?'#1875b6':'#a8c4dc',size=butter?[.48,.17,.23]:isCereal?[.42,.69,.2]:[.43,.5,.23];
  box([0,size[1]/2,0],size,mat(color,.34,.02),o,.022);
  if(!butter){box([0,size[1]-.03,0],[size[0]+.015,.035,.24],mat(color,.5),o,.008);box([0,.028,0],[size[0]+.015,.035,.24],M.white,o,.008);}
  const t=label([butter?'CREAMERY':isCereal?'CEREAL':/marshmallow/i.test(product.name||'')?'MINI':'GROCERIES',butter?'BUTTER':isCereal?String(product.name).toUpperCase():String(product.name).toUpperCase(),product.size||'',product.price!=null?'$'+product.price.toFixed(2):''],{bg:butter?'#f8da7e':isCereal?'#eaf5f8':'#edf3fc',fg:'#1b3d57',accent:color,w:512,h:512});
  const face=mesh(new T.PlaneGeometry(size[0]*.91,size[1]*.79),new T.MeshStandardMaterial({map:t,roughness:.55}),o);face.position.set(0,size[1]/2,size[2]/2+.003);
  if(isCereal){for(let j=0;j<18;j++){const a=j*2.4,rr=.11*Math.sqrt(j/18);sphere([Math.sin(a)*rr,.2+Math.cos(a)*rr,.108],[.018,.009,.012],M.food,o);}}
  if(/marshmallow/i.test(product.name||'')){for(let j=0;j<8;j++)cyl([-.11+(j%4)*.075,.09+Math.floor(j/4)*.055,.125],.025,.035,M.cream,o);}
  if(id){o.userData.target=id;targets.set(id,o);selectable.push(o);}return o;
 }
 function stool(x,z,parent=g){const p=new T.Group();p.position.set(x,0,z);parent.add(p);cyl([0,.69,0],.29,.09,M.oak,p);for(const dx of [-.18,.18])for(const dz of [-.18,.18]){const leg=box([dx,.35,dz],[.035,.66,.035],M.black,p,.009);leg.rotation.z=dx*.18;}ring([0,.25,0],.24,.013,M.black,p);}
 function pendant(x,z,parent=g){cyl([x,3.46,z],.014,.89,M.black,parent);cyl([x,2.97,z],.32,.27,M.black,parent,.12);cyl([x,2.82,z],.30,.015,M.light,parent);const l=new T.PointLight('#ffe2ac',7.5,6,2);l.position.set(x,2.68,z);scene.add(l);}
 function machine(x,z,id,parent=g){const m=target(id,o=>{o.position.set(x,0,z);box([0,.69,0],[1.14,1.35,1.13],M.white,o,.07);box([0,1.41,0],[1.21,.08,1.18],M.stone,o);box([0,1.19,.583],[1.06,.24,.035],M.steel,o);sign([id==='washer'?'WASH · COLD':'DRY · LOW'],[.15,1.2,.608],[.49,.09],{bg:'#15262c',fg:'#9addf4',accent:'#15262c',w:512,h:128},o);const dial=cyl([-.35,1.2,.63],.075,.044,M.steelDark,o);dial.rotation.x=Math.PI/2;const dr=new T.Group();dr.position.set(0,.65,.61);o.add(dr);ring([0,0,0],.39,.06,M.steel,dr,[0,0,0]);ring([0,0,.014],.323,.023,M.black,dr,[0,0,0]);const pane=cyl([0,0,0],.31,.025,M.black,dr);pane.rotation.x=Math.PI/2;const drum=new T.Group();drum.position.z=.023;dr.add(drum);for(let i=0;i<9;i++){const a=i*2.4;const cloth=box([Math.cos(a)*.14,Math.sin(a)*.16,0],[.2,.14,.035],i%3===0?M.pink:i%3===1?M.blue:M.cream,drum,.04);cloth.rotation.z=a;}const glass=cyl([0,0,.044],.3,.025,M.glass,dr);glass.rotation.x=Math.PI/2;tube([[.32,-.08,.06],[.37,-.08,.08],[.37,.08,.08],[.32,.08,.06]],.024,M.steel,dr);moving[id]=drum;},parent);return m;}
 function basket(x,y,z,color=M.blue,parent=g){const b=new T.Group();b.position.set(x,y,z);parent.add(b);box([0,.045,0],[.65,.06,.46],color,b);for(const xx of [-.32,.32]){for(let k=0;k<6;k++)box([xx,.2,-.21+k*.084],[.025,.33,.025],color,b,.006);}for(const zz of [-.23,.23])for(let k=0;k<9;k++)box([-.31+k*.078,.2,zz],[.025,.33,.025],color,b,.006);for(const yy of [.12,.24,.36]){box([0,yy,.23],[.67,.02,.025],color,b,.005);box([0,yy,-.23],[.67,.02,.025],color,b,.005);box([.32,yy,0],[.025,.02,.46],color,b,.005);box([-.32,yy,0],[.025,.02,.46],color,b,.005);}return b;}
 function garment(x,y,z,id,color,parent=g){const p=target(id,o=>{o.position.set(x,y,z);box([0,.02,0],[.37,.038,.51],color,o,.06);box([-.22,.016,-.12],[.17,.035,.21],color,o,.04).rotation.y=-.5;box([.22,.016,-.12],[.17,.035,.21],color,o,.04).rotation.y=.5;ring([0,.047,-.2],.055,.012,M.white,o);sign(['COLD / LOW'],[0,.045,.08],[.23,.09],{w:256,h:128},o).rotation.x=-Math.PI/2;},parent);return p;}

 scene.add(new T.HemisphereLight('#e4f1ff','#80715a',2.25));
 const sun=new T.DirectionalLight('#fff0d4',3.5);sun.position.set(-3,7,-4);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<700?768:1536,innerWidth<700?768:1536);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:30});sun.shadow.normalBias=.025;sun.shadow.bias=-.00025;scene.add(sun);
 const fill=new T.DirectionalLight('#d0e5ff',1.1);fill.position.set(2,4,9);scene.add(fill);
 if(!groceryProducts){
  // Stone tile floor, room shell, architectural trim and glazing.
  box([0,-.14,0],[16.4,.25,13],M.wall);
  for(let row=0;row<10;row++)for(let col=0;col<13;col++){const f=box([-7.4+col*1.23,-.005,-5.8+row*1.23],[1.215,.055,1.215],M.stone,g,.008);if((row+col)%2)f.rotation.y=Math.PI/2;}
  box([0,2.1,-6],[16,.15,.16],M.oak);box([0,3.95,-6],[16,.14,.18],M.ceiling);box([0,1.0,-6],[16,2,.15],M.wall);box([-7.95,2,-1],[.14,4,10],M.wall);box([7.95,2,-1],[.14,4,10],M.wall);
  // Clerestory and a real window opening, with layered outdoor tree geometry.
  box([0,3.63,-5.94],[16,.62,.12],M.wall);
  for(const x of [-7.1,-5.7,-4.3,4.3,5.7,7.1])box([x,2.4,-5.98],[1.35,1.9,.12],M.wall);
  const sky=mat('#c5e5ee',.9);box([0,2.2,-6.35],[7.3,2.5,.08],sky);box([0,1.38,-6.25],[7.3,.8,.08],mat('#b9cb96',1));
  for(let i=0;i<18;i++){const x=-3.4+i*.4;tube([[x,1.3,-6.23],[x+.12,2.0,-6.2],[x+.04,2.5,-6.2]],.018,M.oak);for(let n=0;n<5;n++)sphere([x+(random()-.5)*.52,1.9+random()*.95,-6.16],[.27,.25,.06],n%2?M.leaf:M.leafLight);}
  for(const x of [-3.6,-2.4,-1.2,0,1.2,2.4,3.6]){box([x,2.25,-5.78],[.055,2.2,.15],M.white);box([x,1.14,-5.72],[.055,.1,.26],M.white);}
  box([0,2.3,-5.74],[7.25,.05,.12],M.white);box([0,1.18,-5.65],[7.4,.1,.44],M.stone);
  for(const x of [-2.7,2.7])plant(x,1.24,-5.6,.8);
  for(let x=-2.6;x<=3.2;x+=.98)cabinet(x,-5.15,.94,1.1,g,false);
  // Backsplash tile and overhead cupboards.
  for(let row=0;row<3;row++)for(let col=0;col<14;col++)box([-4.6+col*.59,1.2+row*.18,-5.65],[.575,.16,.025],M.white,g,.009);
  for(const x of [-6.8,4.8,6.4]){box([x,2.55,-5.5],[1.3,1.15,.65],M.navy);for(const xx of [x-.32,x+.32]){box([xx,2.55,-5.15],[.59,1.07,.035],M.inset);handle(xx,2.24,-5.11,.16);}}
  // French-door refrigerator and its interactive doors.
  target('fridge',fr=>{fr.position.set(-6.2,0,-4.84);box([0,1.42,0],[1.55,2.84,1.18],M.steelDark,fr,.08);for(const xx of [-.39,.39]){const door=new T.Group();door.position.set(xx<0?-.77:.77,0,.64);fr.add(door);box([xx<0?.38:-.38,1.86,0],[.75,1.75,.09],M.steel,door,.04);handle(xx<0?.62:-.62,1.7,.075,.028,door);box([xx<0?.62:-.62,1.62,.16],[.034,.65,.04],M.brass,door,.013);if(xx<0){box([.23,1.82,.057],[.25,.37,.018],M.black,door);box([.23,1.65,.1],[.28,.025,.13],M.steel,door);}moving[xx<0?'fridgeL':'fridgeR']=door;}box([0,.46,.655],[1.48,.72,.11],M.steel,fr,.04);handle(0,.64,.73,1.1,fr);});
  // Sink with inset well, arched faucet, water stream and soap bottle.
  target('sink',si=>{si.position.set(-.75,0,-4.88);box([0,1.18,0],[1.02,.035,.76],M.steel,si);box([0,1.196,0],[.83,.025,.57],M.steelDark,si);box([0,1.2,0],[.67,.03,.42],M.black,si);cyl([0,1.22,0],.055,.01,M.steel,si);tube([[.24,1.2,-.3],[.24,1.7,-.3],[.22,1.8,-.2],[.07,1.8,-.1],[0,1.7,-.1],[0,1.58,-.1]],.025,M.brass,si);cyl([.4,1.3,-.3],.028,.2,M.brass,si);moving.water=cyl([0,1.4,-.1],.018,.36,M.water,si);moving.water.visible=false;moving.bubbles=new T.Group();si.add(moving.bubbles);for(let i=0;i<22;i++)sphere([-.3+random()*.6,1.24+random()*.09,-.18+random()*.36],[.025,.025,.025],M.white,moving.bubbles);moving.bubbles.visible=false;});
  target('soap',s=>{s.position.set(.02,1.2,-5);box([0,.13,0],[.16,.24,.12],M.blue,s,.04);cyl([0,.29,0],.03,.06,M.steel,s);box([.04,.33,0],[.12,.03,.03],M.black,s);sign(['SOAP'],[0,.14,.064],[.13,.07],{w:256,h:128},s);});
  target('towel',t=>{box([-1.5,1.19,-4.74],[.33,.04,.4],M.cloth,t,.04);});
  // Microwave hinge, cavity, glass, readable controls, removable bowl.
  target('microwave',mi=>{mi.position.set(-3.85,1.17,-4.92);box([0,.38,0],[1.35,.75,.91],M.steel,mi,.06);box([-.14,.36,.467],[.96,.56,.018],M.black,mi);cyl([-.14,.1,.05],.32,.018,M.glass,mi);const door=new T.Group();door.position.set(-.65,0,.5);mi.add(door);box([.51,.37,0],[1.01,.65,.045],M.black,door,.025);box([.47,.37,.029],[.76,.43,.01],M.glass,door,.01);for(let j=0;j<7;j++)box([.46,.21+j*.051,.04],[.72,.002,.003],M.steelDark,door,.001);box([.91,.36,.085],[.035,.38,.045],M.steel,door,.016);moving.microwaveDoor=door;sign(['READY'],[.52,.55,.49],[.2,.11],{bg:'#13262a',fg:'#b9eafa',accent:'#13262a',w:256,h:128},mi);for(let j=0;j<9;j++)box([.46+(j%3)*.055,.23+Math.floor(j/3)*.068,.49],[.025,.03,.02],M.black,mi,.003);});
  // Two independent kitchen islands with recessed cabinet doors and stool seating.
  for(const x of [-2.65,2.55]){
   box([x,.57,.18],[3.34,1.12,1.45],M.navy,g,.04);box([x,.12,.18],[3.13,.2,1.25],M.black);
   for(let i=-1;i<=1;i++){const xx=x+i*1.05;box([xx,.66,.935],[1.0,.85,.034],M.inset);for(const dx of [-.45,.45])box([xx+dx,.66,.965],[.045,.79,.035],M.navy);handle(xx,.95,.97,.36);}
   box([x,1.17,.13],[3.58,.14,1.72],M.stone,g,.055);
   for(const xx of [x-1.15,x+1.15])stool(xx,1.5);pendant(x,.1);colliders.push({x:x-1.9,z:-.9,w:3.8,d:2.15});
  }
  cabinet(-4.5,-.22,.86,1.1,g,true);
  book(-3.7,1.28,.16);
  sign(['RECIPE BOOK'],[-3.52,.63,.972],[1.25,.27],{bg:'#f5bfcd',accent:'#ffe5ed',h:256});
  sign(['KITCHEN LAB'],[2.55,.63,.976],[1.5,.3],{bg:'#f8ccd6',accent:'#fff0ed',h:256});
  // Actual measuring and cooking objects on the working island.
  packageItem([-3.62,1.25,-.4],'cereal',{name:'Rice Krispies Cereal',size:'½ cup for your recipe'});
  packageItem([-3.1,1.25,-.42],'marshmallows',{name:'Mini Marshmallows',size:'⅓ cup for your recipe'});
  packageItem([-2.65,1.25,-.48],'butter',{name:'Butter',size:'¾ teaspoon'});
  target('bowl',b=>{b.position.set(-2.25,1.25,.2);bowl(0,0,0,b);moving.mixture=cyl([0,.07,0],.22,.04,M.cream,b);moving.mixture.visible=false;moving.food=new T.Group();b.add(moving.food);for(let i=0;i<90;i++){const a=i*2.399,r=.22*Math.sqrt((i+.5)/90);const o=sphere([Math.cos(a)*r,.1+random()*.05,Math.sin(a)*r],[.032,.016,.019],M.food,moving.food);o.rotation.y=a;}moving.food.visible=false;moving.spoon=spoon(.18,.25,0,b);moving.spoon.rotation.z=.35;});
  for(let j=0;j<3;j++)target('cup'+[4,6,12][j],p=>{measuringCup(-1.7+j*.19,1.25,-.39,['⅓ cup','½ cup','1 cup'][j],p);const fill=cyl([-1.7+j*.19,1.47,-.39],.11,.025,M.food,p);fill.visible=false;moving['fill'+[4,6,12][j]]=fill;});
  for(let j=0;j<3;j++)target('measure'+[1,2,4][j],p=>{const sp=spoon(-1.82+j*.21,1.3,.45,p);sp.scale.setScalar(.85+j*.07);sign(['¼ tsp','½ tsp','1 tsp'].slice(j,j+1),[-1.82+j*.21,1.29,.74],[.16,.07],{w:256,h:128},p).rotation.x=-Math.PI/2;});
  moving.spills=[];for(let i=0;i<5;i++){const spill=sphere([-3.9+i*.47,1.249,.7],[.12,.002,.07],mat('#bc9f6d',.85));moving.spills.push(spill);}
  target('container',p=>{box([-2.92,1.28,.57],[.6,.09,.4],M.white,p);box([-2.92,1.335,.57],[.53,.008,.33],M.cream,p);});
  target('mitts',p=>{box([-4.55,1.22,-4.9],[.3,.06,.42],M.pink,p,.08);box([-4.35,1.22,-4.84],[.16,.06,.2],M.pink,p,.05);});
  // Preparation props, serving area and utensils.
  for(const x of [1.65,3.48]){cyl([x,1.36,-.28],.14,.3,M.white);for(let j=0;j<5;j++){const sp=spoon(x+(random()-.5)*.13,1.68,-.28+(random()-.5)*.1,g,M.oak);sp.rotation.x=1.1;sp.rotation.z=(random()-.5)*.8;}}
  const fruit=bowl(2.5,1.25,.12,g,M.white,.26);for(let j=0;j<7;j++)sphere([2.5+Math.sin(j*2.4)*.19,1.47,.1+Math.cos(j*2.4)*.15],[.1,.1,.1],j%2?M.butter:mat('#b95736',.3));
  // Laundry machines, folding station, woven baskets, detergent and garment rails.
  machine(5,-4.5,'washer');machine(6.38,-4.5,'dryer');
  sign(['LAUNDRY ROOM','SORT · WASH · DRY · FOLD'],[5.7,2.83,-5.12],[3.15,.63],{bg:'#9ccbea',accent:'#e2f4ff'});
  target('detergent',p=>{box([4.82,1.7,-4.55],[.32,.5,.2],M.blue,p,.07);cyl([4.82,2.01,-4.55],.06,.12,M.pink,p);sign(['DETERGENT','SMALL LOAD','FILL TO LINE 1'],[4.82,1.72,-4.439],[.28,.32],{w:256,h:512},p);});
  for(let i=0;i<3;i++){const b=basket(4.8+i*.8,0,-2.8,i===0?M.white:i===1?M.blue:M.pink);b.userData.target=['lights','darks','colors'][i];targets.set(b.userData.target,b);selectable.push(b);sign([['LIGHTS','DARKS','COLORS'][i]],[4.8+i*.8,.25,-2.56],[.45,.12],{w:256,h:128});}
  box([5.65,1.05,-.6],[3.15,.14,1.2],M.oak);for(const x of [4.3,7])for(const z of [-1.05,-.12])box([x,.5,z],[.065,1,.065],M.black);
  garment(4.8,1.14,-.5,'shirt',M.white);garment(5.65,1.14,-.5,'jeans',M.blue);garment(6.5,1.14,-.5,'laundry-towel',M.pink);
  target('clothing',p=>{box([7.1,.8,2.2],[1.3,1.6,.7],M.oak,p);for(let j=0;j<3;j++){box([7.1,.35+j*.45,2.58],[1.2,.4,.025],M.white,p);handle(7.1,.47+j*.45,2.62,.4,p);}sign(['PUT AWAY'],[7.1,1.9,2.3],[1.3,.25],{h:256},p);});
  colliders.push({x:4.05,z:-1.3,w:3.3,d:1.6},{x:4.45,z:2.2,w:2.1,d:2.7});
  // Household corner includes a real made bed and independently movable bedding.
  target('bed',p=>{p.position.set(5.5,0,3.5);box([0,.4,0],[1.65,.5,2.35],M.oak,p,.08);box([0,.74,0],[1.6,.28,2.24],M.white,p,.12);moving.cover=box([0,.9,.27],[1.57,.06,1.68],M.blue,p,.08);moving.pillow=box([0,.98,-.78],[1.2,.16,.43],M.cream,p,.14);box([0,.9,-1.22],[1.75,1.1,.1],M.oak,p,.06);});
  target('cleaning',p=>{box([3.7,.75,3.5],[1.1,1.5,.65],M.navy,p);for(let j=0;j<3;j++)box([3.7,.2+j*.55,3.86],[1.03,.045,.68],M.oak,p);for(let j=0;j<3;j++){box([3.45+j*.24,.93,3.55],[.15,.28,.12],j%2?M.pink:M.blue,p,.035);sign(['LABEL'],[3.45+j*.24,.95,3.616],[.13,.08],{w:128,h:64},p);}sign(['CLEAN & ORGANIZE'],[3.6,1.8,3.8],[2.1,.34],{bg:'#f4c0d0',h:256},p);});
  target('cloth',p=>{box([3.7,1.27,.5],[.38,.04,.3],M.cloth,p,.04);});
  // Natural room signage, classroom table, planner and student portfolio.
  sign(['HOME ECONOMICS & LIFE SKILLS','COOK   ·   SHOP   ·   CLEAN   ·   PLAN   ·   LIVE'],[0,3.51,-5.46],[8.8,.65],{bg:'#f0bac9',accent:'#ffdfde',w:2048,h:256});
  for(const x of [-7.1,7.1])plant(x,0,-2.4,1.9);
  sign(['Good food.','Good skills.','Bright futures.'],[-4.2,2.8,-5.13],[1.15,1.0],{bg:'#263d3f',fg:'#f8eacb',accent:'#bd8e55'});
  target('progress',p=>{box([.7,1.27,.54],[.63,.08,.43],M.blue,p);sign(['MY PROGRESS'],[.7,1.32,.54],[.57,.35],{bg:'#e0edf8',accent:'#72aad6'},p).rotation.x=-Math.PI/2;});
  target('shopping',p=>{box([-6.05,1.75,-3.7],[.65,.8,.07],M.oak,p);sign(['GROCERY PLAN','LIST · BUDGET','SHOP · RETURN'],[-6.05,1.76,-3.65],[.59,.72],{bg:'#f6e5c6',w:512,h:512},p);});
 }else{
  // Supplemental interactive shelves inside the existing grocery page; catalog
  // and all purchase handlers are supplied by that page, never cloned here.
  box([0,-.12,0],[10,.2,9],M.stone);box([0,1.8,-1],[8,3.6,.18],M.wall);
  for(const y of [.35,1.2,2.05]){box([0,y,-.35],[6.6,.09,1.1],M.white);box([0,y-.055,.23],[6.6,.12,.045],M.blue);}
  for(const x of [-3.3,0,3.3])box([x,1.34,-.82],[.055,2.6,.06],M.steel);
  groceryProducts.forEach((p,i)=>{const x=-2.6+(i%4)*1.65,y=.4+Math.floor(i/4)*.85;packageItem([x,y,-.15],p.key,{name:p.name,size:p.size,price:p.price});sign([p.name,'$'+p.price.toFixed(2)+' · '+p.size],[x,y-.12,.27],[1.5,.2],{bg:'#fffbea',w:512,h:128});});
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
  const bins=new Map();for(const child of [...group.children])if(child.isMesh&&!Object.values(moving).includes(child)&&!child.material.transparent){const key=child.material.uuid;child.updateMatrix();let geo=child.geometry.clone().applyMatrix4(child.matrix);if(geo.index){const non=geo.toNonIndexed();geo.dispose();geo=non;}if(!bins.has(key))bins.set(key,{material:child.material,geometries:[],objects:[]});const b=bins.get(key);b.geometries.push(geo);b.objects.push(child);}
  for(const b of bins.values())if(b.objects.length>2){const merged=T.mergeGeometries(b.geometries,false);if(merged){b.objects.forEach(o=>group.remove(o));mesh(merged,b.material,group);}b.geometries.forEach(v=>v.dispose());}
 }
 function flatten(group){for(const child of [...group.children])if(child.isGroup&&!child.userData.target&&!Object.values(moving).includes(child)){flatten(child);child.updateMatrixWorld(true);for(const item of [...child.children])group.attach(item);group.remove(child);}}
 flatten(g);batch(g);
 if(offline){camera.position.set(...(groceryProducts?[6,4,7]:VIEWS.classroom.eye));camera.lookAt(new T.Vector3(...(groceryProducts?[0,1,.3]:VIEWS.classroom.at)));scene.updateMatrixWorld(true);return {scene,camera,targets,updateCart:paintCart};}
 let mode='tap',station='classroom',state=null,disposed=false,raf=0,last=0,animateUntil=performance.now()+2000,lastFrame=0,drag=null,hover=null,rotation=0,turn=0,gesture=0;
 const eye=new T.Vector3(...(groceryProducts?[6,4,7]:VIEWS.classroom.eye)),at=new T.Vector3(...(groceryProducts?[0,1,.3]:VIEWS.classroom.at));camera.position.copy(eye);const look=at.clone();camera.lookAt(look);
 const keys=new Set(),walk={yaw:0,pitch:.3},ray=new T.Raycaster(),mouse=new T.Vector2();
 const wake=(duration=900)=>{animateUntil=Math.max(animateUntil,performance.now()+duration);if(!raf)raf=requestAnimationFrame(draw);};
 function resize(){const rect=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();wake();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 function tint(o,value){if(!o)return;const clones=new Map(),disposedMaterials=new Set();o.traverse(c=>{if(!c.isMesh||!c.material.emissive)return;if(value){const original=c.material;let highlighted=clones.get(original);if(!highlighted){highlighted=original.clone();highlighted.emissive.set('#77435c');highlighted.emissiveIntensity=.25;clones.set(original,highlighted);}c.userData.hoverOriginal=original;c.material=highlighted;}else if(c.userData.hoverOriginal){disposedMaterials.add(c.material);c.material=c.userData.hoverOriginal;delete c.userData.hoverOriginal;}});disposedMaterials.forEach(m=>m.dispose());}
 function hit(e){const b=canvas.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);const intersections=ray.intersectObjects(selectable,true);for(const i of intersections){let o=i.object;while(o&&!o.userData.target)o=o.parent;if(o)return o;}return null;}
 function move(dx,dz,dt){const nx=avatar.position.x+(Math.sin(walk.yaw)*dz+Math.cos(walk.yaw)*dx)*dt*2.7,nz=avatar.position.z+(Math.cos(walk.yaw)*dz-Math.sin(walk.yaw)*dx)*dt*2.7;if(nx<-7.2||nx>7.2||nz<-3.7||nz>5.25)return;if(colliders.some(c=>nx>c.x&&nx<c.x+c.w&&nz>c.z&&nz<c.z+c.d))return;avatar.position.x=nx;avatar.position.z=nz;avatar.rotation.y=walk.yaw+Math.atan2(dx,dz);}
 function draw(time){raf=0;if(disposed||document.hidden)return;const dt=Math.min(.06,(time-(last||time))/1000);last=time;const active=(!state?.paused&&state?.work?.hands?.rubbing&&!state?.work?.hands?.dried)||(state?.work?.microwave?.until>Date.now())||(state?.laundry?.work?.washUntil>Date.now())||(state?.laundry?.work?.dryUntil>Date.now());
  let movingNow=false;if(mode==='walk'&&!state?.paused){const dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dz=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);if(dx||dz){move(dx,dz,dt);movingNow=true;}eye.set(avatar.position.x+Math.sin(walk.yaw)*4,2.65+walk.pitch,avatar.position.z+Math.cos(walk.yaw)*4);at.set(avatar.position.x,1.25,avatar.position.z);}
  const t=1-Math.exp(-dt*7);camera.position.lerp(eye,t);look.lerp(at,t);camera.lookAt(look);limbs.forEach((l,i)=>l.rotation.x=movingNow?Math.sin(time*.012)*(i%2?-.25:.25):0);
  if(moving.cabinet)moving.cabinet.rotation.y+=((state?.work?.cabinetOpen?-1.55:0)-moving.cabinet.rotation.y)*t;
  if(moving.microwaveDoor)moving.microwaveDoor.rotation.y+=((state?.work?.microwave?.open?-1.7:0)-moving.microwaveDoor.rotation.y)*t;
  if(moving.water)moving.water.visible=!!state?.work?.hands?.water&&!state?.work?.hands?.dried&&station==='sink';
  if(moving.spoon){rotation+=(turn-rotation)*t;moving.spoon.rotation.y=rotation;moving.spoon.position.x=.16*Math.cos(rotation);moving.spoon.position.z=.16*Math.sin(rotation);}
  if(moving.mixture){moving.mixture.visible=!!state?.work?.butter||!!state?.work?.marshmallows;moving.mixture.scale.y=state?.work?.microwave?.intervals?1.2:1;}
  if(moving.food){moving.food.visible=!!state?.work?.cereal;moving.food.position.lerp(new T.Vector3(state?.work?.transferred?-.67:0,state?.work?.transferred ? .08 : 0,state?.work?.transferred ? .37 : 0),t);}
  if(moving.bubbles){moving.bubbles.visible=!!state?.work?.hands?.rubbing&&!state?.work?.hands?.rinsed&&station==='sink';if(moving.bubbles.visible)moving.bubbles.children.forEach((b,i)=>b.position.y=1.25+Math.sin(time*.004+i)*.018);}
  for(const amount of [4,6,12]){const c=targets.get('cup'+amount);if(c){c.position.y=state?.work?.selected===amount&&state?.step!==3 ? .1 : 0;if(moving['fill'+amount])moving['fill'+amount].visible=!!state?.work?.scooped&&state?.work?.selected===amount&&state?.step!==3;}}
  for(const amount of [1,2,4]){const s=targets.get('measure'+amount);if(s)s.position.y=state?.work?.selected===amount&&state?.step===3 ? .1 : 0;}
  const bowlObject=targets.get('bowl');if(bowlObject){const microwaving=state?.step===7&&state?.work?.microwave?.in;bowlObject.position.lerp(new T.Vector3(...(microwaving?[-3.99,1.28,-4.77]:state?.phase==='cook'&&state?.step===2&&!state?.work?.tools?.includes('bowl')?[-4.5,.63,-.22]:[-2.25,1.25,.2])),t);}
  for(const [i,objectId]of ['shirt','jeans','laundry-towel'].entries()){const garment=targets.get(objectId);if(!garment)continue;const item=['shirt','jeans','towel'][i],l=state?.laundry,w=l?.work||{},folding=l?.step>=8;let p=[4.8+i*.85,1.14,-.5];if(w.sorted?.includes(item)&&!folding)p=[4.8+i*.8,.23,-2.8];garment.visible=folding||!(w.loaded>i);if(folding){garment.scale.x=1-(w.folds>0?.24:0);garment.scale.z=1-(w.folds>1?.3:0);}if(w.away?.includes(item))p=[7.1,.35+i*.45,2.65];garment.position.lerp(new T.Vector3(...p),t);}
  if(moving.spills)moving.spills.forEach((o,i)=>o.visible=state?.phase==='cook'&&state?.step>=12&&i>=(state?.work?.wipes||0));
  if(moving.washer&&state?.laundry?.work?.washUntil>Date.now()&&!state?.paused)moving.washer.rotation.z+=dt*3;
  if(moving.dryer&&state?.laundry?.work?.dryUntil>Date.now()&&!state?.paused)moving.dryer.rotation.z+=dt*2;
  if(moving.cover&&state?.household?.bed)moving.cover.scale.z=.6+Math.min(4,state.household.bed.step)*.1;
  if(time-lastFrame>32){renderer.render(scene,camera);lastFrame=time;}
  const unsettled=camera.position.distanceToSquared(eye)>.0001||Math.abs(turn-rotation)>.01;
  if(time<animateUntil||unsettled||movingNow||keys.size||active)raf=requestAnimationFrame(draw);
 }
 function focus(name,instant=false){station=VIEWS[name]?name:'classroom';if(groceryProducts)return;if(mode==='walk'&&station!=='classroom'){const v=VIEWS[station];avatar.position.set(clamp(v.eye[0],-7,7),0,clamp(v.eye[2],-3.5,5));walk.yaw=Math.atan2(v.eye[0]-v.at[0],v.eye[2]-v.at[2]);}else{eye.set(...VIEWS[station].eye);at.set(...VIEWS[station].at);}if(instant||matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(eye);look.copy(at);}wake(1200);}
 function update(s){state=s;if(s.paused)keys.clear();mode=s.mode||'tap';avatar.visible=mode==='walk'&&!groceryProducts;wake();}
 const down=e=>{drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:0,target:hit(e)};canvas.setPointerCapture(e.pointerId);};
 const pointerMove=e=>{if(drag){const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;drag.lastX=e.clientX;drag.lastY=e.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);
   const targetId=drag.target?.userData.target;
   if(targetId==='bowl'&&['combine','stir'].includes(state?.phase==='cook'&&['safety','hands','tools','butter','marshmallows','combine','supervision','microwave','cereal','stir'][state.step])){gesture+=Math.hypot(dx,dy);if(gesture>70){gesture=0;turn+=1;onObject('stirGesture');}}
   else if(mode==='walk'){walk.yaw-=dx*.006;walk.pitch=clamp(walk.pitch+dy*.004,-.5,1);}
   else{const offset=eye.clone().sub(at),radius=offset.length(),theta=Math.atan2(offset.x,offset.z)-dx*.006,phi=clamp(Math.acos(offset.y/radius)+dy*.004,.25,1.4);eye.set(at.x+radius*Math.sin(phi)*Math.sin(theta),at.y+radius*Math.cos(phi),at.z+radius*Math.sin(phi)*Math.cos(theta));}wake();
  }else{const o=hit(e);if(o!==hover){tint(hover,false);hover=o;tint(hover,true);canvas.style.cursor=o?'pointer':'grab';const tooltip=document.getElementById('object-label');if(tooltip){tooltip.textContent=o?.userData.target.replace(/-/g,' ')||'Drag to look around';}wake();}}};
 const up=e=>{if(drag&&drag.moved<10){const o=hit(e);if(o){const pos=new T.Vector3();o.getWorldPosition(pos);if(mode==='walk'&&pos.distanceTo(avatar.position)>3.3){onObject('approach',o.userData.target);}else onObject(o.userData.target);}}drag=null;};
 const keydown=e=>{if(e.target.closest('input,select,textarea,button,a,dialog')||e.ctrlKey||e.metaKey||e.altKey)return;if(mode==='walk'&&['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){keys.add(e.key);e.preventDefault();wake();}if(mode==='walk'&&e.key==='e'){let nearest=null,distance=3.4;for(const o of selectable){const v=new T.Vector3();o.getWorldPosition(v);const dist=v.distanceTo(avatar.position);if(dist<distance){nearest=o;distance=dist;}}if(nearest)onObject(nearest.userData.target);}};
 const keyup=e=>keys.delete(e.key),blur=()=>{keys.clear();drag=null;},visibility=()=>{if(!document.hidden){last=0;wake();}else blur();};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',blur);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
 resize();onReady({meshes:renderer.info.render.calls});wake(2500);
 let touchKey='';
 return {focus,update,updateCart:items=>{paintCart(items);wake();},startMove:direction=>{if(state?.paused)return;touchKey=({forward:'w',back:'s',left:'a',right:'d'})[direction]||'';if(touchKey)keys.add(touchKey);wake();},stopMove:()=>{if(touchKey)keys.delete(touchKey);touchKey='';},setQuality:quality=>{renderer.setPixelRatio(quality==='low'?1:Math.min(devicePixelRatio||1,innerWidth<700?1.35:1.6));resize();},rotate:dir=>{if(mode==='walk')walk.yaw+=dir*.3;else{const v=eye.clone().sub(at),a=dir*.22;eye.set(at.x+v.x*Math.cos(a)+v.z*Math.sin(a),eye.y,at.z+v.z*Math.cos(a)-v.x*Math.sin(a));}wake();},step:direction=>{if(state?.paused)return;move(direction==='left'?-1:direction==='right'?1:0,direction==='forward'?-1:direction==='back'?1:0,.22);wake();},animate:kind=>{if(kind==='stir'){turn+=Math.PI*.7;}if(kind==='scoop'&&moving.spoon)turn+=.5;wake(1000);},stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,width:canvas.width,height:canvas.height}),dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',blur);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material){ms.add(o.material);if(o.material.map)ts.add(o.material.map);}});gs.forEach(o=>o.dispose());ms.forEach(o=>o.dispose());ts.forEach(o=>o.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
