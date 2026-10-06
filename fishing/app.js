import * as THREE from '../assets/vendor/three-0.180.0.js?v=fishing1';
const $=id=>document.getElementById(id),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=[['Bluegill',0xf1ab48,.7,1.4],['Largemouth bass',0x778b4a,2.1,5.5],['Rainbow trout',0x92adbd,1.5,4.1],['Channel catfish',0x677a88,3,7.6],['Golden perch',0xe3bb54,1.2,3.3]];
let scene,camera,renderer,water,bobber,fish,line,rod,tip,aimRing,ripples=[],clouds=[],wildlife=[],ray,waterPlane;
let state='ready',target=new THREE.Vector3(0,.14,-9),biteAt=0,deadline=0,castAt=0,progress=0,tension=0,caught=0,best=0,reeling=false,fishType=null,fishWeight=0,fishGroup=null,now=0,last=0,animation=0,ctx=null,soundOn=true,closed=false;
const M=(color,roughness=1,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,transparent,opacity,side:THREE.DoubleSide});
function mesh(geo,material,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m;}
function cylinder(a,b,r,color,parent=scene){const diff=new THREE.Vector3().subVectors(b,a);const o=mesh(new THREE.CylinderGeometry(r,r,diff.length(),8),M(color),0,0,0,parent);o.position.copy(a).addScaledVector(diff,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());return o;}
function tree(x,z,h=3){mesh(new THREE.CylinderGeometry(.13,.23,h,7),M(0x675847),x,h/2,z);for(let i=0;i<3;i++)mesh(new THREE.ConeGeometry(1.2-i*.22,1.65,9),M(i%2?0x326d48:0x235d42),x,h+i*.55,z);}
function makeFish(spec){const g=new THREE.Group();const color=spec[1];mesh(new THREE.SphereGeometry(.52,14,10),M(color,.6),0,0,0,g).scale.set(1.9,.58,.72);
 const tail=mesh(new THREE.ConeGeometry(.39,.82,3),M(color),-.97,0,0,g);tail.rotation.z=Math.PI/2;
 const fin=mesh(new THREE.ConeGeometry(.23,.55,3),M(color),.08,.35,0,g);fin.rotation.z=-.5;
 for(const z of [-.34,.34]){mesh(new THREE.SphereGeometry(.066,8,6),M(0x111b23),.62,.08,z,g);mesh(new THREE.SphereGeometry(.025,6,4),M(0xffffff),.635,.105,z*1.15,g);}
 g.visible=false;scene.add(g);return g;}
function build(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x8ed0e4);scene.fog=new THREE.Fog(0x8ed0e4,42,105);
 camera=new THREE.PerspectiveCamera(59,1,.1,200);camera.position.set(0,6.7,13);camera.lookAt(0,.2,-12);
 renderer=new THREE.WebGLRenderer({canvas:$('view'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
 scene.add(new THREE.HemisphereLight(0xeaffff,0x657656,2.25));const sun=new THREE.DirectionalLight(0xfff2ca,2.25);sun.position.set(-20,40,-25);scene.add(sun);
 const ground=M(0x6c9e64);mesh(new THREE.PlaneGeometry(120,120),ground,0,-.2,-24).rotation.x=-Math.PI/2;
 water=mesh(new THREE.PlaneGeometry(100,75),new THREE.MeshPhongMaterial({color:0x398b9c,specular:0xb8efdc,shininess:90,transparent:true,opacity:.9,side:THREE.DoubleSide}),0,0,-28);water.rotation.x=-Math.PI/2;
 const bank=mesh(new THREE.BoxGeometry(100,.35,7),M(0xbbad80),0,-.1,9);bank.rotation.y=.015;
 const dock=mesh(new THREE.BoxGeometry(4,.22,11),M(0x85664c),0,.36,5);dock.position.z=5;
 for(let i=-2;i<=2;i++)mesh(new THREE.BoxGeometry(.065,.01,10.8),M(0xb6986d),i*.72,.48,5);
 for(const x of [-1.8,1.8])for(const z of [.3,9.6])cylinder(new THREE.Vector3(x,-.4,z),new THREE.Vector3(x,.65,z),.09,0x584334);
 // Distant island, hills, clouds, reeds, rocks, and irregular shoreline give depth to the lake.
 for(let i=0;i<13;i++){const x=-55+i*9;mesh(new THREE.ConeGeometry(9+i%3*2,10+i%4*2,8),M(i%2?0x699a76:0x5d8d70),x,3,-64-(i%3)*4);}
 for(let i=0;i<38;i++){const x=(i*17.31%86)-43,z=i%2?-53-(i*5%8):10+(i*7%8);if(Math.abs(x)<4&&z>0)continue;tree(x,z,2.5+(i*19%25)/10);}
 for(let i=0;i<26;i++){const x=(i*9.7%42)-21,z=-2-(i*17%35);if(i%3===0)mesh(new THREE.DodecahedronGeometry(.2+(i%4)*.09),M(0x938b72),x,.14,z);}
 for(let i=0;i<30;i++){const x=(i*11.4%37)-18,z=i%2?7:-49;const reed=cylinder(new THREE.Vector3(x,0,z),new THREE.Vector3(x+.14,.8+(i%4)*.2,z),.025,0x506d39);wildlife.push(reed);}
 for(let i=0;i<9;i++){const group=new THREE.Group();for(let j=0;j<3;j++)mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshBasicMaterial({color:0xe7f2e9,transparent:true,opacity:.8}),j*.5,.1*j,0,group);group.position.set(-32+i*9,13+i%3*1.3,-54-i%2*3);scene.add(group);clouds.push(group);}
 for(let i=0;i<9;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.45+i%3*.3,.015,4,40),new THREE.MeshBasicMaterial({color:0xb9e6d8,transparent:true,opacity:.46}));ring.rotation.x=Math.PI/2;ring.position.set((i*13.11%30)-15,.035,-4-(i*8.5%39));scene.add(ring);ripples.push(ring);}
 rod=new THREE.Group();rod.position.set(1.5,1,9.6);scene.add(rod);cylinder(new THREE.Vector3(0,0,0),new THREE.Vector3(-1.3,2.4,-4.2),.045,0x2b3730,rod);
 cylinder(new THREE.Vector3(-1.3,2.4,-4.2),new THREE.Vector3(-2.2,2.9,-6),.018,0xf2dfb6,rod);
 tip=new THREE.Vector3(-.7,3.9,3.6);line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([tip,tip]),new THREE.LineBasicMaterial({color:0xe4f0e5,transparent:true,opacity:.9}));scene.add(line);
 bobber=new THREE.Group();mesh(new THREE.SphereGeometry(.16,12,10),M(0xfff6da,.4),0,0,0,bobber);mesh(new THREE.SphereGeometry(.1,10,8),M(0xf05242,.4),0,.12,0,bobber);bobber.visible=false;scene.add(bobber);
 aimRing=new THREE.Mesh(new THREE.RingGeometry(.33,.39,32),new THREE.MeshBasicMaterial({color:0xffe19a,side:THREE.DoubleSide,transparent:true,opacity:.9}));aimRing.rotation.x=-Math.PI/2;aimRing.position.copy(target);scene.add(aimRing);
 fishGroup=makeFish(TYPES[0]);ray=new THREE.Raycaster();waterPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.14);resize();
}
function resize(){if(!renderer)return;const c=$('view'),w=c.clientWidth,h=c.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function point(e){const r=$('view').getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),camera);const p=new THREE.Vector3();if(ray.ray.intersectPlane(waterPlane,p)){target.set(clamp(p.x,-18,18),.14,clamp(p.z,-38,-3));aimRing.position.copy(target);}}
function audio(f=400,d=.15,type='sine',gain=.08,end=f){if(!soundOn)return;try{ctx ||=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const osc=ctx.createOscillator(),vol=ctx.createGain(),t=ctx.currentTime;osc.type=type;osc.frequency.setValueAtTime(f,t);osc.frequency.exponentialRampToValueAtTime(Math.max(40,end),t+d);vol.gain.setValueAtTime(gain,t);vol.gain.exponentialRampToValueAtTime(.001,t+d);osc.connect(vol).connect(ctx.destination);osc.start(t);osc.stop(t+d+.02);}catch{}}
function vibe(pattern){try{navigator.vibrate?.(pattern)}catch{}}
function message(s){$('status').textContent=s;}
function ui(){ $('caught').textContent=`${caught} / 5`; $('best').textContent=best?best.toFixed(1)+' lb':'—'; $('cast').hidden=!['ready','miss','caught','won'].includes(state);$('cast').textContent=state==='won'?'CAST AGAIN':'CAST LINE';$('hook').hidden=state!=='bite';$('reel').hidden=state!=='fight';$('meter').hidden=state!=='fight';$('tension').style.width=(tension*100)+'%';$('tension').style.background=tension>.72?'#e4514b':tension>.5?'#e8ac32':'#45ab66';$('progress').textContent=Math.round(progress*100)+'% landed';}
function cast(){if(!['ready','miss','caught','won'].includes(state))return;if(state==='won'){caught=0;best=0;}state='cast';castAt=now;reeling=false;tension=0;progress=0;biteAt=now+2+Math.random()*2.2;fishType=TYPES[Math.floor(Math.random()*TYPES.length)];fishWeight=fishType[2]+Math.random()*(fishType[3]-fishType[2]);fishGroup.visible=false;bobber.visible=true;aimRing.visible=false;audio(230,.35,'triangle',.07,700);vibe(35);message('Line flying… watch the bobber.');ui();}
function hook(){if(state!=='bite')return;state='fight';progress=.03;tension=.16;fishGroup.visible=true;fishGroup.position.set(target.x+1,-.19,target.z-.4);audio(470,.18,'square',.07,900);vibe([60,40,90]);message('Fish on! Hold REEL. Release before the tension reaches red!');ui();}
function lose(reason){state='miss';reeling=false;fishGroup.visible=false;bobber.visible=false;aimRing.visible=true;message(reason+' Aim and cast again.');audio(270,.4,'sawtooth',.05,90);vibe([100,70,120]);ui();}
function catchFish(){state=++caught>=5?'won':'caught';reeling=false;best=Math.max(best,fishWeight);fishGroup.visible=false;bobber.visible=false;aimRing.visible=true;audio(680,.18,'sine',.08,1000);setTimeout(()=>audio(900,.3,'sine',.07,1300),160);vibe([50,50,50,50,130]);message(`${fishWeight.toFixed(1)} lb ${fishType[0]} landed! ${state==='won'?'Five fish! You completed the lake challenge!':'Cast again for your next fish.'}`);ui();}
function frame(ts){if(closed)return;now=ts/1000;const dt=Math.min(.05,Math.max(0,now-last));last=now;const t=now;
 if(state==='cast'){const u=clamp((now-castAt)/.9,0,1);bobber.position.set(target.x*u,Math.sin(u*Math.PI)*3+.16,target.z*u+3*(1-u));if(u===1){state='waiting';message('Keep watching. A fish could bite any moment.');ui();audio(180,.2,'triangle',.06,80);}}
 if(state==='waiting'&&now>biteAt){state='bite';deadline=now+2.1;audio(660,.13,'square',.09,980);setTimeout(()=>{if(state==='bite')audio(780,.15,'square',.07,1000)},170);vibe([70,60,130]);message('BITE! Tap HOOK IT!');ui();}
 if(state==='bite'){bobber.position.y=.05+Math.sin(t*23)*.12;if(now>deadline)lose('The fish got away.');}
 if(state==='fight'){const surge=Math.sin(t*4+fishWeight)*.5+.5;if(reeling){progress+=dt*(.16+(.5-surge)*.06);tension+=dt*(.34+surge*.28);if(Math.random()<dt*6)audio(140+surge*70,.06,'triangle',.014,190);if(tension>.84&&Math.random()<dt*5)vibe(35);}else{tension=Math.max(.07,tension-dt*.43);progress=Math.max(.01,progress-dt*.028);}
  fishGroup.position.set(target.x+(1-progress)*Math.sin(t*5)*1.8,-.12+Math.sin(t*14)*.08,target.z+(1-progress)*1.8);fishGroup.rotation.y=Math.sin(t*4)*.4;bobber.position.set(fishGroup.position.x,Math.max(.04,.2+Math.sin(t*15)*.12),fishGroup.position.z);
  if(tension>=1)lose('The line snapped!');else if(progress>=1)catchFish();else ui();}
 if(bobber.visible){if(state==='waiting')bobber.position.y=.17+Math.sin(t*3)*.045;line.geometry.dispose();line.geometry=new THREE.BufferGeometry().setFromPoints([tip,bobber.position]);line.visible=true;}else line.visible=false;
 aimRing.material.opacity=.6+Math.sin(t*3)*.3;for(let i=0;i<ripples.length;i++){const r=ripples[i];const u=(t*.27+i*.13)%1;r.scale.setScalar(.7+u*1.7);r.material.opacity=(1-u)*.3;}
 for(let i=0;i<clouds.length;i++)clouds[i].position.x+=dt*(.08+i%3*.025);
 renderer.render(scene,camera);animation=requestAnimationFrame(frame);
}
function start(){try{build();}catch(e){console.error(e);$('error').hidden=false;return;}
 $('view').addEventListener('pointerdown',e=>{if(['ready','miss','caught','won'].includes(state))point(e);$('view').setPointerCapture(e.pointerId);});$('view').addEventListener('pointermove',e=>{if(e.buttons&&['ready','miss','caught','won'].includes(state))point(e);});
 $('cast').onclick=cast;$('hook').onclick=hook;
 const release=()=>{reeling=false};$('reel').addEventListener('pointerdown',e=>{if(state==='fight'){e.preventDefault();$('reel').setPointerCapture(e.pointerId);reeling=true;audio(195,.08,'triangle',.04,280);}});for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('reel').addEventListener(ev,release);
 document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||document.querySelector('dialog[open]'))return;e.preventDefault();if(state==='fight')reeling=true;else if(state==='bite')hook();else cast();});document.addEventListener('keyup',e=>{if(e.code==='Space')release()});
 $('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)audio(520,.12);};$('restart').onclick=()=>{state='ready';caught=0;best=0;reeling=false;bobber.visible=false;fishGroup.visible=false;aimRing.visible=true;message('Drag on the water to aim, then cast.');ui();};
 $('help').onclick=()=>$('instructions').showModal();$('closeHelp').onclick=()=>$('instructions').close();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)reeling=false;});window.addEventListener('pagehide',()=>{closed=true;cancelAnimationFrame(animation);renderer.dispose();ctx?.close();});ui();animation=requestAnimationFrame(frame);
}
start();
