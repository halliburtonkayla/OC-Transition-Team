// Pure construction of real exported meshes, shared by the viewer and geometry tests.
import * as T from './assets/vendor/three-0.180.0.js';
const probe=new T.BoxGeometry(),Attribute=probe.getAttribute('position').constructor;probe.dispose();
export function decodeKitchenModel(meta,buffer){
 if(meta.format!==2)throw Error('Unsupported kitchen model');
 return {...meta,meshes:meta.meshes.map(m=>({...m,positions:new Float32Array(buffer,m.positionOffset,m.vertexCount*3),normals:Float32Array.from(new Int16Array(buffer,m.normalOffset,m.vertexCount*3),n=>n/32767),indices:Array.from(m.indexBits===16?new Uint16Array(buffer,m.indexOffset,m.indexCount):new Uint32Array(buffer,m.indexOffset,m.indexCount))}))};
}
export function buildKitchenModel(data,{kind='eggs',step=0,complete=false}={}){
 const materials=[],geometries=[];
 const room=new T.Group();room.rotation.x=-Math.PI/2;const food=new T.Group();food.position.set(...data.foodPivot);room.add(food);
 const materialMap={};for(const [name,spec]of Object.entries(data.materials)){const m=new T.MeshStandardMaterial({color:new T.Color().setRGB(...spec.color),roughness:spec.roughness,metalness:Math.min(spec.metalness,.72)});materialMap[name]=m;materials.push(m);}
 const selectable=[];for(const spec of data.meshes){if(spec.recipe&&spec.recipe!==kind)continue;const positions=new Float32Array(spec.positions);if(spec.part==='food')for(let i=0;i<positions.length;i+=3){positions[i]-=data.foodPivot[0];positions[i+1]-=data.foodPivot[1];positions[i+2]-=data.foodPivot[2];}
 const g=new T.BufferGeometry();g.setAttribute('position',new Attribute(positions,3));g.setAttribute('normal',new Attribute(spec.normals,3));if(spec.indices)g.setIndex(spec.indices);g.computeBoundingSphere();geometries.push(g);const mesh=new T.Mesh(g,materialMap[spec.material]);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.part=spec.part;(spec.part==='food'?food:room).add(mesh);if(spec.part!=='room')selectable.push(mesh);}
 food.visible=step>=2||complete;
 if(complete){food.position.set(1,-.88,1.11);food.scale.setScalar(.72);}
 return {room,food,selectable,materials,geometries,dispose(){materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());}};
}
