// Save route configuration with each attempt so a resumed game is identical.
export const ROUTE_NAMES=['Downtown shift','Station district','Market commute','Riverside route'];
export function seedFor(text){let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return (n>>>0)%1000000000;}
export function trafficPlan(seed,difficulty='standard',replay=0){
 let n=seed>>>0;const rand=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
 const supported=difficulty==='supported',hard=difficulty==='challenge',variant=seed%4;
 const count=supported?2:hard?4:3,boost=1+Math.min(replay,4)*.04;
 const lanes=Array.from({length:4},(_,i)=>({y:135+i*90,speed:(i%2?1:-1)*(supported?90+(3-i)*8+rand()*15:hard?170+(3-i)*20+rand()*25:125+(3-i)*18+rand()*25)*boost,offset:rand()*1100,vehicles:Array.from({length:count},(_,j)=>({offset:j*1100/count+(j%2?32:-32)+(rand()-.5)*20,w:!supported&&j===0?148:88+Math.round(rand()*28),color:Math.floor(rand()*6)}))}));
 return {seed,difficulty,replay,variant,name:ROUTE_NAMES[variant],lanes,passX:variant%2?780:180,targetX:variant%2?230:730,required:supported?1:2,phase:rand()*6};
}
// Integrate distance instead of recomputing position from elapsed time. Changing
// an accommodation mid-crossing changes velocity without teleporting vehicles.
export function advanceTraffic(h,level,dt,factor,playerSpeed){
 const road=level.road,frequency=.45+(h.lane||0)*.10,amplitude=road.difficulty==='supported'?.06:road.difficulty==='challenge'?.20:.14;
 const pace=Math.min(1,playerSpeed/180),velocity=1+Math.cos(level.time*frequency+road.phase)*amplitude;
 h.travel??=(level.time-dt)*h.speed*factor*pace;
 h.travel+=dt*h.speed*factor*pace*velocity;
 return ((h.homeX+70+h.travel)%1100+1100)%1100-70;
}
const q=(prompt,options,why,skill='Transportation planning')=>({prompt,options,why,answer:0,skill,service:'Workplace Readiness Training'});
export const COMMUTE_QUESTIONS=[
 q('Your shift begins at 4:00. The 3:25 bus arrives at 3:50; the 3:40 bus arrives at 4:05. Which plan gives you time to clock in?', ['Take the 3:25 bus and allow the ten-minute buffer.','Take the 3:40 bus and hope it arrives early.','Choose the later bus and clock in before arriving.'],'Plan for arrival before the start of your shift, including time to get inside and clock in.'),
 q('Construction blocks your usual crossing. The marked detour adds six minutes. What is the best plan?',['Use the marked detour and notify your supervisor if you will be late.','Take the shortest path between construction vehicles.','Wait beside the closed crossing until someone moves the barrier.'],'Use the designated safe route and communicate changes to your arrival time.','Community safety'),
 q('The walk signal changes while you are still on the sidewalk. A coworker says, “We can make it.” What do you do?',['Wait for the next safe crossing phase, even if the coworker goes.','Follow because staying together matters more than the signal.','Enter the road and stop in the next traffic lane.'],'Make your own safe decision; do not let time pressure or peer pressure choose your crossing.','Self-advocacy'),
 q('Your usual ride cancels. You have $8. A trusted bus route costs $2 each way; a taxi costs $10 one way. Which is a workable plan?',['Confirm the bus schedule, reserve $4 for both trips, and tell your supervisor.','Use the taxi and work out the extra cost after the ride.','Spend all $8 getting there without planning the return.'],'A transportation plan needs to cover timing, cost, and the trip home.'),
 q('A delivery truck hides your view of the next lane. What should you do before entering that lane?',['Wait in the safe area until you can see and check the lane clearly.','Assume the hidden lane is empty because the truck stopped.','Walk close to the truck so drivers will notice you.'],'A stopped vehicle can hide other moving traffic. Check every lane from a safe position.','Community safety'),
 q('You can get to work on time only if the bus makes a very tight connection. What would make this plan more reliable?',['Choose an earlier departure and identify a backup route.','Use the same plan and assume the first bus will never run late.','Ask a coworker to record your arrival before you get there.'],'Build in a realistic buffer and know a backup route before a delay occurs.'),
 q('Your phone is at 3% and you need it for a bus ticket after work. What is the most useful next step?',['Save the route details, reduce battery use, and arrange a valid backup ticket method.','Keep streaming videos and hope the battery lasts.','Assume the driver will accept an unavailable ticket.'],'Prepare a usable ticket and route plan before your phone becomes unavailable.'),
 q('You discover the return bus stops running before your shift ends. What should you do?',['Discuss a reliable, affordable return plan before accepting that schedule.','Accept every shift and leave coworkers to arrange rides afterward.','Wait until closing time to find out whether anyone can help.'],'Consider the whole schedule and communicate transportation limits before committing.')
];
export function routeQuestions(level,fallback){if(!level.road||level.id!==2)return fallback;const i=level.road.variant*2;return COMMUTE_QUESTIONS.slice(i,i+2);}
