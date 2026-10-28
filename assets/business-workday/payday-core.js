/* A named, one-time event in the same device-local wallet used throughout Town. */
(function(g){'use strict';
const campaign={id:'town-community-payday-2026-10-28',amount:2000};
function award(previous,names,now=Date.now()){
 const world=JSON.parse(JSON.stringify(previous||{}));world.residents=world.residents||{};
 for(const name of [...new Set(names)]){
  const r=world.residents[name]||(world.residents[name]={checking:10000,savings:0,sessions:0,career:'Not selected',job:'Needs a job',home:'Not selected',car:'Not selected',history:[],notifications:[],avatar:null});
  r.paydayEvents=r.paydayEvents||{};if(r.paydayEvents[campaign.id])continue;
  const before=Number(r.checking);if(!Number.isFinite(before))continue;
  r.checking=Math.round((before+campaign.amount)*100)/100;
  r.paydayEvents[campaign.id]={amount:campaign.amount,creditedAt:now,celebrated:false};
  r.history=Array.isArray(r.history)?r.history:[];r.history.push('Town celebration payday +$2,000 · '+campaign.id);
  r.notifications=Array.isArray(r.notifications)?r.notifications:[];r.notifications.push('You’ve been paid $2,000! Your special Town payday is in checking.');
 }
 return world;
}
g.TTPaydayCore={campaign,award};
})(globalThis);
