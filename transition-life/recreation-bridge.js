/* Quiet connection to the existing park games; no new UI or game mechanics. */
(function(){'use strict';const S=TTLifeStore,K=TTLifeCore,resident=S.name();let interacted=-Infinity,last=performance.now();
function activity(){interacted=performance.now();}
document.addEventListener('pointerdown',activity,{passive:true});document.addEventListener('keydown',activity);
setInterval(()=>{const now=performance.now(),seconds=Math.min(15,(now-last)/1000);last=now;if(document.hidden||now-interacted>45000||S.name()!==resident)return;
try{const w=S.read(),r=w.residents[resident];if(!r?.life)return;K.tick(r,seconds);r.life.needs.fun=Math.min(100,r.life.needs.fun+seconds/15);S.write(w,resident);}catch(e){/* Park gameplay remains available if storage is unavailable. */}},15000);
document.addEventListener('visibilitychange',()=>{last=performance.now();interacted=-Infinity;});
})();
