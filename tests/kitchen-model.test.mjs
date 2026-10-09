import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildKitchenModel,decodeKitchenModel} from '../kitchen-model.js';
const meta=JSON.parse(fs.readFileSync(new URL('../transition-life/assets/kitchen-3d/scene.json',import.meta.url),'utf8'));const bytes=fs.readFileSync(new URL('../transition-life/assets/kitchen-3d/scene.bin',import.meta.url));const data=decodeKitchenModel(meta,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
assert.equal(data.format,2);assert.equal(data.up,'z');assert.ok(data.meshes.length<100);
for(const mesh of data.meshes){assert.equal(mesh.positions.length,mesh.normals.length);assert.equal(mesh.positions.length%3,0);assert.ok(mesh.positions.every(Number.isFinite));assert.ok(mesh.normals.every(Number.isFinite));assert.ok(mesh.indices.every(n=>Number.isInteger(n)&&n>=0&&n<mesh.positions.length/3));}
for(const kind of ['eggs','toast','pasta','chicken']){
 const model=buildKitchenModel(data,{kind,step:2});assert.ok(model.food.visible);assert.ok(model.food.children.length);assert.equal(model.room.rotation.x,-Math.PI/2);assert.ok(model.selectable.some(m=>m.userData.part==='fridge'));assert.ok(model.selectable.some(m=>m.userData.part==='sink'));let triangles=0;for(const g of model.geometries){assert.ok(g.boundingSphere.radius>0);assert.ok(Number.isFinite(g.boundingSphere.radius));triangles+=g.index.count/3;}assert.ok(triangles<110000,`mobile triangle budget: ${triangles}`);model.dispose();
 const prep=buildKitchenModel(data,{kind,step:0});assert.equal(prep.food.visible,false);prep.dispose();
 const served=buildKitchenModel(data,{kind,step:7,complete:true});assert.equal(served.food.position.x,1);assert.equal(served.food.position.y,-.88);assert.ok(served.food.visible);served.dispose();
}
console.log('PASS: real Three.js mesh construction, all four food meshes, indexed geometry/normals, mobile triangle budget, appliance raycast targets, prep visibility, plated food, disposal. WebGL/browser appearance not tested.');
