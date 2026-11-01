import * as T from './three.js';

// Photographic material maps are local, CC0 Poly Haven assets. Packaging maps
// are authored for the actual pickable meshes; no room image replaces geometry.
export function photographicMaterials(M,{offline=false,onChange=()=>{}}={}){
 const pending=[],owned=new Set(),loader=offline?null:new T.TextureLoader();
 const load=(file,{color=false,repeat=[1,1]}={})=>{
  if(offline)return null;
  let texture;pending.push(new Promise((resolve,reject)=>{
   texture=loader.load(new URL('./materials/'+file,import.meta.url).href,()=>{onChange();resolve(texture);},undefined,reject);
  }));
  if(color)texture.colorSpace=T.SRGBColorSpace;
  texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(...repeat);texture.anisotropy=4;owned.add(texture);return texture;
 };
 M.floor=new T.MeshPhysicalMaterial({color:'#ffffff',roughness:.22,clearcoat:.65,clearcoatRoughness:.15,map:load('floor_tiles_06-diff.jpg',{color:true,repeat:[5.4,4.2]}),normalMap:load('floor_tiles_06-nor_gl.jpg',{repeat:[5.4,4.2]}),normalScale:new T.Vector2(.16,.16)});
 M.stone.map=load('marble_01-diff.jpg',{color:true});M.stone.normalMap=load('marble_01-nor_gl.jpg');M.stone.normalScale=new T.Vector2(.055,.055);M.stone.color.set('#fffdf4');M.stone.roughness=.12;M.stone.metalness=0;
 M.oak.map=load('kitchen_wood-diff.jpg',{color:true});M.oak.normalMap=load('kitchen_wood-nor_gl.jpg');M.oak.normalScale=new T.Vector2(.14,.14);M.oak.color.set('#e4cdaa');M.oak.roughness=.28;
 M.navy=new T.MeshPhysicalMaterial({color:'#4f5153',roughness:.26,metalness:.1,clearcoat:.52,clearcoatRoughness:.22});
 M.inset=new T.MeshPhysicalMaterial({color:'#45484a',roughness:.28,metalness:.08,clearcoat:.45,clearcoatRoughness:.25});
 M.steel.color.set('#c4cbd0');M.steel.metalness=1;M.steel.roughness=.19;
 M.brass.color.set('#c9ced0');M.brass.metalness=1;M.brass.roughness=.21;
 M.white=new T.MeshPhysicalMaterial({color:'#f4f2ec',roughness:.23,clearcoat:.65,clearcoatRoughness:.12});
 M.glass=new T.MeshPhysicalMaterial({color:'#f1fbff',roughness:.035,metalness:0,transmission:.94,thickness:.025,ior:1.47,clearcoat:1,transparent:true,opacity:1});
 M.applianceGlass=new T.MeshPhysicalMaterial({color:'#778c97',roughness:.07,metalness:.08,transmission:.72,thickness:.035,ior:1.48,clearcoat:1,transparent:true,opacity:1});
 M.wall.color.set('#bdb2a1');M.ceiling.color.set('#d5cdbb');
 M.pink.color.set('#ed87ae');M.blue.color.set('#599dda');
 const weave=load('fabric-normal.jpg',{repeat:[2,2]});for(const [name,color]of [['fabricWhite','#eeeee6'],['fabricBlue','#397aab'],['fabricPink','#da89a9']])M[name]=new T.MeshStandardMaterial({color,roughness:.98,side:T.DoubleSide,normalMap:weave,normalScale:new T.Vector2(.24,.24)});
 const packaging={};for(const [kind,color]of [['cereal','#0964ac'],['marshmallows','#48b9da'],['butter','#e1b644']]){
  packaging[kind]={body:new T.MeshPhysicalMaterial({color,roughness:.33,clearcoat:.35,clearcoatRoughness:.24}),front:new T.MeshStandardMaterial({map:load('label-'+kind+'.webp',{color:true}),roughness:.34})};
 }
 const state={ready:offline,loaded:0,total:pending.length};
 const ready=offline?Promise.resolve():Promise.all(pending).then(()=>{state.ready=true;state.loaded=state.total;onChange();});
 return {packaging,state,ready,dispose(){owned.forEach(t=>t.dispose());}};
}

export function drapedClothGeometry(width,depth,fold=0){
 const geometry=new T.PlaneGeometry(width,depth,12,12),p=geometry.getAttribute('position');
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i);const edge=Math.pow(Math.abs(x)/(width/2),3);p.setXYZ(i,x,.011*Math.sin(x*31+z*17)+.008*Math.sin(z*39)+edge*.012+fold*Math.sin(z/depth*Math.PI),z);}
 geometry.computeVertexNormals();return geometry;
}

export function spoonBowlGeometry(){
 const pos=[],uv=[],indices=[],rings=8,sides=32;
 for(let layer=0;layer<2;layer++)for(let r=0;r<=rings;r++)for(let j=0;j<=sides;j++){
  const t=r/rings,a=j/sides*Math.PI*2;pos.push(Math.cos(a)*t*.074,-.025*(1-t*t)-layer*.006,Math.sin(a)*t*.105);uv.push(j/sides,t);
 }
 const count=(rings+1)*(sides+1);for(let l=0;l<2;l++)for(let r=0;r<rings;r++)for(let j=0;j<sides;j++){const a=l*count+r*(sides+1)+j,b=a+sides+1;if(l)indices.push(a,b,a+1,b,b+1,a+1);else indices.push(a,a+1,b,b,a+1,b+1);}
 for(let j=0;j<sides;j++){const a=rings*(sides+1)+j,b=a+count;indices.push(a,b,a+1,b,b+1,a+1);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

export function plaqueGeometry(width,height,radius=.12){
 const x=-width/2,y=-height/2,r=Math.min(radius,height/2,width/2),shape=new T.Shape();
 shape.moveTo(x+r,y);shape.lineTo(x+width-r,y);shape.quadraticCurveTo(x+width,y,x+width,y+r);shape.lineTo(x+width,y+height-r);shape.quadraticCurveTo(x+width,y+height,x+width-r,y+height);shape.lineTo(x+r,y+height);shape.quadraticCurveTo(x,y+height,x,y+height-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
 return new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008,curveSegments:10});
}

export function createPolishedFloor(parent,{width,depth,material,offline=false,mobile=false}){
 const floor=new T.Mesh(new T.PlaneGeometry(width,depth),material);floor.rotation.x=-Math.PI/2;floor.position.y=.026;floor.receiveShadow=true;parent.add(floor);
 if(offline)return {floor,dispose(){}};
 const mirror=new T.Reflector(new T.PlaneGeometry(width,depth),{color:'#d4c7b5',textureWidth:mobile?256:512,textureHeight:mobile?256:512,clipBias:.003,multisample:0});
 mirror.rotation.x=-Math.PI/2;mirror.position.y=.03;mirror.material.transparent=true;mirror.material.depthWrite=false;
 mirror.material.fragmentShader=mirror.material.fragmentShader.replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4( blendOverlay( base.rgb, color ), 0.28 )');
 const renderReflection=mirror.onBeforeRender;let stamp=-Infinity;
 mirror.onBeforeRender=function(...args){const now=performance.now();if(now-stamp<100)return;stamp=now;renderReflection.apply(this,args);};
 parent.add(mirror);return {floor,mirror,dispose(){mirror.getRenderTarget().dispose();mirror.material.dispose();}};
}
