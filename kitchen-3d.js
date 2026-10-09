/* Mobile-conscious real geometry viewer. No resident storage, purchases, or lesson mutation. */
import * as T from './assets/vendor/three-0.180.0.js';
import {buildKitchenModel,decodeKitchenModel} from './kitchen-model.js';
const modelURL=new URL('./transition-life/assets/kitchen-3d/scene.json',import.meta.url);
let modelPromise;const viewers=new Map();
const loadModel=()=>modelPromise||(modelPromise=fetch(modelURL).then(r=>{if(!r.ok)throw Error('Kitchen model unavailable');return r.json();}).then(async meta=>{const response=await fetch(new URL(meta.buffer,modelURL));if(!response.ok)throw Error('Kitchen geometry unavailable');return decodeKitchenModel(meta,await response.arrayBuffer());}).catch(e=>{modelPromise=null;throw e;}));
const views={room:{eye:[4.7,-6.5,3.7],target:[0,.05,1.2]},worktop:{eye:[2.3,-3.6,3.35],target:[-.1,-.64,1.08]},stove:{eye:[.1,-2.3,2.55],target:[-.17,-.8,1.10]},prep:{eye:[-2.25,-2.5,2.7],target:[-.95,-.65,1.08]}};
const descriptions={fridge:'Refrigerator: keep chilled ingredients here. Your groceries stay in your own inventory.',sink:'Sink: wash your hands before preparing food.',stove:'Oven and range: follow the recipe and turn the heat off when you finish.',pan:'Cooking station: use the recipe controls below. Stir by dragging when the stirring step is active.',prep:'Preparation area: gather ingredients and handle kitchen tools safely.',plate:'Serving area: plate your finished food after completing the recipe.',food:'Your recipe ingredients are cooking in the skillet.'};
const xyz=v=>new T.Vector3(v[0],v[2],-v[1]);
async function mount(host){
 const canvas=host.querySelector('canvas'),status=host.querySelector('.kitchen-render-state'),fallback=host.querySelector('img'),signal=host.querySelector('.kitchen-stir-signal');
 let disposed=false,renderer,raf=0,resizeObserver,signalObserver;const materials=[],geometries=[];const state={dispose(){disposed=true;cancelAnimationFrame(raf);resizeObserver?.disconnect();signalObserver?.disconnect();materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer?.dispose();renderer?.forceContextLoss();}};viewers.set(host,state);
 try{
 const data=await loadModel();if(disposed||!host.isConnected)return;
 renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0xe5e1d6,1);renderer.shadowMap.enabled=true;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(47,1,.05,40);scene.background=new T.Color(0xe5e1d6);
 const hemi=new T.HemisphereLight(0xdceaff,0x706248,2.1);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffeed4,4.0);sun.position.set(-3,6,-1);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<600?512:1024,innerWidth<600?512:1024);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:16});sun.shadow.bias=-.0003;sun.shadow.normalBias=.012;scene.add(sun);
 const fill=new T.DirectionalLight(0xdcecff,1.5);fill.position.set(3,4,6);scene.add(fill);
 const model=buildKitchenModel(data,{kind:host.dataset.kind,step:Number(host.dataset.step),complete:host.dataset.complete==='true'});const {room,food,selectable}=model;scene.add(room);materials.push(...model.materials);geometries.push(...model.geometries);
 let target=new T.Vector3(),view='room';const draw=()=>{if(disposed||raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!disposed)renderer.render(scene,camera);});};
 const chooseView=name=>{view=name;const preset=views[name];camera.position.copy(xyz(preset.eye));target.copy(xyz(preset.target));camera.lookAt(target);host.querySelectorAll('[data-kitchen-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kitchenView===name)));draw();};
 host.querySelector('.kitchen-view-controls').addEventListener('pointerdown',e=>e.stopPropagation());
 host.querySelectorAll('[data-kitchen-view]').forEach(b=>b.addEventListener('click',()=>chooseView(b.dataset.kitchenView)));
 const resize=()=>{const w=canvas.parentElement.clientWidth,h=Math.max(220,Math.round(w*.69));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();};resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down=null;
 canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:0};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;down.lastX=e.clientX;down.lastY=e.clientY;down.moved+=Math.abs(dx)+Math.abs(dy);if(host.dataset.interactive==='true')return;const offset=camera.position.clone().sub(target),radius=offset.length(),theta=Math.max(-1.1,Math.min(1.1,Math.atan2(offset.x,offset.z)-dx*.006)),phi=Math.max(.28,Math.min(1.38,Math.acos(offset.y/radius)+dy*.005));camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);draw();});
 canvas.addEventListener('pointerup',e=>{if(down&&down.moved<8){const bounds=canvas.getBoundingClientRect();pointer.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);const part=raycaster.intersectObjects(selectable,false)[0]?.object.userData.part;if(part){host.querySelector('.kitchen-object-hint').textContent=descriptions[part];if(part==='pan'||part==='food')chooseView('stove');if(part==='prep'||part==='plate')chooseView('prep');}}down=null;});canvas.addEventListener('pointercancel',()=>{down=null;});
 signalObserver=new MutationObserver(()=>{food.rotation.z=(parseFloat(signal.style.rotate)||0)*Math.PI/180;draw();});signalObserver.observe(signal,{attributes:true,attributeFilter:['style']});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback.hidden=false;status.hidden=false;status.textContent='3D rendering paused. Cooking controls still work.';});
 chooseView(host.dataset.interactive==='true'?'stove':'room');resize();fallback.hidden=true;status.hidden=true;host.dataset.rendered='true';
 }catch(error){if(!disposed){status.textContent='3D is unavailable here. Cooking controls still work.';canvas.hidden=true;fallback.hidden=false;host.dataset.rendered='fallback';host.querySelector('.kitchen-object-hint').textContent='Static 3D model preview. Use the cooking steps to continue.';}}
}
function reconcile(){for(const [host,viewer]of viewers)if(!host.isConnected){viewer.dispose();viewers.delete(host);}for(const host of document.querySelectorAll('.kitchen-scene3d'))if(!viewers.has(host))mount(host);}
new MutationObserver(reconcile).observe(document.documentElement,{childList:true,subtree:true});reconcile();
