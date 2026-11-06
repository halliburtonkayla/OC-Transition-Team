import assert from 'node:assert/strict';
import {step,attemptFor} from '../../assets/life-quest/engine.mjs';
export function roadInput(state,target){
 const p=state.active.level.p,dx=target.x-p.x,dy=target.y-p.y;
 if(Math.abs(dx)>3)return {[dx>0?'right':'left']:true};
 if(Math.abs(dy)>3)return {[dy>0?'down':'up']:true};
 return null;
}
export function roadGap(state,target){
 const trial=structuredClone(state),failures=attemptFor(trial).failures,phase=trial.active.level.phase;
 for(let n=0;n<1800;n++){
  const input=roadInput(trial,target);if(!input)return true;
  step(trial,input,1/60);
  if(attemptFor(trial).failures!==failures)return false;
  if(trial.active.level.phase!==phase||trial.active.level.pending)return true;
 }return false;
}
export function walkRoad(state){
 const l=state.active.level;
 const travel=target=>{
  let found=false;
  for(let wait=0;wait<900;wait++){
   if(roadGap(state,target)){found=true;break;}
   for(let n=0;n<6;n++)step(state,{},1/60);
  }
  assert.ok(found,'A safe traffic gap must exist within 90 seconds');
  for(let n=0;n<1800;n++){const input=roadInput(state,target);if(!input)return;step(state,input,1/60);if(state.active.level.pending||state.active.level.phase!==l.phase)return;}
  assert.fail('Road movement did not reach target');
 };
 travel({x:l.p.x,y:360});if(l.walls.length)travel({x:l.walls[0].x+l.walls[0].w+55,y:l.p.y});travel({x:l.p.x,y:270});
 if(l.road)travel({x:l.road.passX,y:270});
 travel({x:l.p.x,y:180});
 if(l.road?.required===2)travel({x:960-l.road.passX,y:180});
 travel({x:l.p.x,y:75});travel({x:l.exit.x,y:60});
}
