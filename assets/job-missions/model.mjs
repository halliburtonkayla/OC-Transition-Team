// Pure activity rules, shared by the interface and regression tests. No network or Town records.
export const ITEMS = {};
const item=(id,label,shape,color='#3676b8',pattern='') => { ITEMS[id]={id,label,shape,color,pattern}; return id; };
item('apple','Apple','apple','#db4b49'); item('banana','Banana','banana','#eabb32');
item('carrot','Carrot','carrot','#ea833b'); item('milk','Milk','milk','#67a9d4');
item('cheese','Cheese','cheese','#edbe44'); item('bread','Bread','bread','#bd8044');
item('cereal','Cereal','box','#a575c2'); item('beans','Beans','can','#5f9a69');
item('produce','Fruit and vegetables','basket','#61986a'); item('dairy','Dairy shelf','shelf','#67a9d4');
item('bakery','Bakery shelf','shelf','#bd8044'); item('pantry','Pantry shelf','shelf','#a575c2');
item('redSock','Red striped sock','sock','#cc4f55','stripes'); item('blueSock','Blue dotted sock','sock','#3378ae','dots');
item('greenSock','Green striped sock','sock','#3d8b66','stripes'); item('goldSock','Gold dotted sock','sock','#c08b17','dots');
item('shirt','Shirt','shirt','#4786b6'); item('pants','Pants','pants','#535e89');
item('coat','Coat','coat','#b66745'); item('hat','Warm hat','hat','#a373ab');
item('boots','Rain boots','boots','#d3a52d'); item('shorts','Shorts','shorts','#569e8a');
item('sun','Hot and sunny','sun','#dcad26'); item('rain','Rainy','rain','#488db9'); item('snow','Cold and snowy','snow','#609abb');
item('shirts','Shirt basket','shirt','#4786b6'); item('trousers','Pants basket','pants','#535e89'); item('socks','Sock basket','sock','#cc4f55','stripes');
item('towel','Towel','towel','#4f9a97'); item('flat','Lay towel flat','flat','#4f9a97');
item('half','Fold in half','half','#4f9a97'); item('fold','Fold again','fold','#4f9a97'); item('stack','Put on shelf','stack','#4f9a97');
item('sandwich','Sandwich','sandwich','#c18d52'); item('salad','Salad','salad','#5e9a59');
item('water','Water','water','#559ac3'); item('fork','Clean fork','fork','#718299'); item('spoon','Clean spoon','spoon','#718299');
item('napkin','Napkin','paper','#e4cf9a'); item('forkBin','Fork bin','fork','#718299'); item('spoonBin','Spoon bin','spoon','#718299'); item('napkinBin','Napkin bin','paper','#bba977');
item('art','Art room','art','#b779ac'); item('library','Library','book','#6c84ba');
item('office','School office','office','#c59446'); item('gym','Gym','ball','#c37147'); item('classroom','Classroom','board','#4f8c79');
item('envelope','Practice envelope','envelope','#4d8eae'); item('package','Package','box','#bd8a58');
item('pencil','Pencil','pencil','#dda932'); item('paper','Paper','paper','#8d9ab0'); item('folder','Folder','folder','#5ca9a2');
item('crayon','Crayons','crayon','#c86d63'); item('glue','Glue stick','glue','#a27ac1'); item('eraser','Eraser','eraser','#ce848e');
item('clockIn','Clock in','clockIn','#3d9a7f'); item('clockOut','Clock out','clockOut','#657ca8');
item('supplyJob','Supply helper job','folder','#5ca9a2'); item('mailJob','Mail helper job','envelope','#4d8eae'); item('lunchJob','Lunchroom job','tray','#b78653');
item('help','Ask supervisor for help','help','#7770b5'); item('wait','Stop and wait safely','hand','#d6a34e');
item('guess','Guess the directions','question','#9e7184'); item('leave','Leave the job unfinished','door','#9e7184');
item('walk','Walk safely','walk','#4b8e7d'); item('run','Run in the hallway','run','#b57070');
item('clean','Wipe with approved supplies','clean','#639c90'); item('wash','Wash hands','wash','#6a9cbb');
item('ready','Order is correct','check','#4c9278'); item('fix','Fix the order','fix','#bd814d');
item('star','Job star','star','#e7b443');
item('check','Check the work','check','#4c9278'); item('shelf','Labeled shelf','shelf','#b0946c');
item('hand','Stop safely','hand','#d6a34e'); item('question','Ask a question','question','#7770b5');

export const MISSIONS=[
 {id:'store',title:'Stock the Store',role:'GROCERY TEAM',icon:'basket',color:'#328479',light:'#e4f3ed',skill:'Sort, match, restock and follow a shopping list',levels:['Sort groceries','Match picture labels','Restock the shelves','Fill a shopping list'],materials:'Classroom supplies, labeled bins, a picture inventory list',steps:[['basket','Gather the supplies.'],['folder','Sort into matching bins.'],['check','Check each picture label.'],['paper','Count and check the inventory.']],real:'Sort classroom supplies, organize bins, and check an inventory list.'},
 {id:'laundry',title:'Laundry Helper',role:'CLOTHING CARE',icon:'sock',color:'#7763a8',light:'#efeaf8',skill:'Match patterns, sort clothes, dress for weather and follow folding steps',levels:['Match the socks','Sort the clothes','Dress for the weather','Fold and organize'],materials:'Clean towels, clean socks, clothing or fabric, labeled baskets',steps:[['sock','Match the clean socks.'],['shirt','Sort the clothing.'],['half','Fold a towel.'],['stack','Stack items in the right place.']],real:'Fold towels, match socks, and organize clothing or fabric supplies.'},
 {id:'lunch',title:'Lunchroom Worker',role:'CAFETERIA CREW',icon:'tray',color:'#b66e3b',light:'#fff0dc',skill:'Match orders, prepare trays, sort clean supplies and work in order',levels:['Match a lunch order','Build a tray','Sort clean supplies','Serve customers in order'],materials:'Clean napkins, clean utensils, supply bins, picture orders',steps:[['hand','Get staff permission.'],['fork','Sort clean supplies.'],['napkin','Organize the napkins.'],['clean','Use the approved cleaning routine.']],real:'With staff permission, organize napkins, sort clean supplies, and practice approved cleaning routines.'},
 {id:'mail',title:'Mailroom Helper',role:'SCHOOL OFFICE',icon:'envelope',color:'#3d80ae',light:'#e5f1fa',skill:'Match destinations, sort into cubbies and follow a delivery route',levels:['Match mail labels','Sort the cubbies','Deliver the packages','Follow a delivery route'],materials:'Practice envelopes, picture labels, labeled cubbies, approved materials',steps:[['envelope','Check the practice envelope.'],['office','Match the destination picture.'],['walk','Deliver approved materials.'],['check','Tell staff the delivery is done.']],real:'Sort practice envelopes and deliver approved, nonconfidential materials.'},
 {id:'supply',title:'Classroom Supply Shop',role:'SUPPLY TEAM',icon:'folder',color:'#b05d76',light:'#faeaf0',skill:'Identify, count, fill orders and check for errors',levels:['Find the supplies','Count and sort','Fill teacher orders','Check the order'],materials:'Approved pencils, paper, folders, supply bins, picture order cards',steps:[['paper','Look at the picture order.'],['pencil','Count the requested supplies.'],['folder','Pack the supply kit.'],['check','Check the kit with the teacher.']],real:'Prepare approved classroom supply kits for teachers.'},
 {id:'helper',title:'School Helper Challenge',role:'YOUR SCHOOL WORKDAY',icon:'clockIn',color:'#5972a5',light:'#e9eefb',skill:'Clock in and out, follow directions, complete three jobs and ask for help',levels:['My first workday','Follow the work plan','Handle a change','Independent workday'],materials:'Picture work schedule, approved supplies, supervisor, completion checklist',steps:[['clockIn','Check in with your supervisor.'],['paper','Choose your assigned job.'],['help','Do three tasks. Ask for help.'],['clockOut','Check your work and clock out.']],real:'Complete three approved school tasks with a supervisor, ask for help, and check out.'}
];
export const DIFFICULTIES={supported:'More support',standard:'Practice',challenge:'Extra challenge'};
export const label=id=>ITEMS[id]?.label||id;
const C=(id,text,picture=id)=>({id,label:text||label(id),picture});
function task(kind,prompt,target,options,extra={}){return {kind,prompt,target,options:options.map(o=>typeof o==='string'?C(o):o),...extra};}
const pick=(prompt,target,options,extra={})=>task('pick',prompt,target,options,extra);
const pack=(prompt,request,options,extra={})=>task('pack',prompt,null,options,{request,...extra});
const departments={apple:'produce',banana:'produce',carrot:'produce',milk:'dairy',cheese:'dairy',bread:'bakery',cereal:'pantry',beans:'pantry'};
const sockIds=['redSock','blueSock','greenSock','goldSock'];
const groceries=['apple','milk','bread','banana','cheese','cereal','carrot','beans'];
const supplies=['pencil','paper','folder','crayon','glue','eraser'];
const places=['art','library','office','gym','classroom'];
export function createLevel(id,level,difficulty='standard'){
 if(!MISSIONS.some(m=>m.id===id)||!Number.isInteger(level)||level<1||level>4||!DIFFICULTIES[difficulty])throw new Error('Choose a valid mission, level and difficulty.');
 const n=difficulty==='supported'?3:difficulty==='challenge'?6:4;let tasks=[];
 if(id==='store'){
  if(level===1)tasks=groceries.slice(0,n).map(x=>pick('Put the '+label(x).toLowerCase()+' in its department.',departments[x],['produce','dairy','bakery','pantry'],{item:x,context:'sort',hint:'Look for the matching kind of food.'}));
  if(level===2)tasks=groceries.slice(0,n).map(x=>pick('Find the product that matches this shelf label.',x,groceries,{reference:x,context:'shelf',hint:'Match the picture on the label.'}));
  if(level===3)tasks=groceries.slice(0,n+1).map(x=>pick('Restock the '+label(x).toLowerCase()+'. Find its picture on the shelf.',x,groceries,{item:x,context:'restock',hint:'Look for the same product picture on a shelf.'}));
  if(level===4)tasks=Array.from({length:n-1},(_,i)=>pack('Fill this customer’s shopping basket.',[groceries[i],groceries[i+2],...(difficulty==='challenge'?[groceries[i]]:[])],groceries,{context:'basket',customer:i,hint:'Check each picture and quantity on the shopping list.'}));
 }
 if(id==='laundry'){
  if(level===1)tasks=sockIds.slice(0,Math.min(n,4)).map(x=>pick('Find the sock with the same color and pattern.',x,sockIds,{reference:x,context:'sock',hint:'Match both the color and the stripes or dots.'}));
  if(level===2)tasks=['shirt','pants','redSock','blueSock','shirt','pants'].slice(0,n).map(x=>pick('Sort this clothing into the matching basket.',x==='shirt'?'shirts':x==='pants'?'trousers':'socks',['shirts','trousers','socks'],{item:x,context:'sort'}));
  if(level===3)tasks=[['sun','shorts'],['snow','coat'],['rain','boots'],['snow','hat'],['sun','shorts'],['rain','boots']].slice(0,n).map(([weather,x])=>pick('Choose clothing for '+label(weather).toLowerCase()+' weather.',x,['shorts','coat','boots','hat'],{reference:weather,context:'weather',hint:weather==='sun'?'Choose light clothes for a hot day.':weather==='rain'?'Keep your feet dry in puddles.':x==='hat'?'Keep your head warm.':'Keep your body warm.'}));
  if(level===4)tasks=['flat','half','fold','stack'].map((x,i)=>pick(['Lay the towel flat.','Fold the towel in half.','Fold it again into a smaller towel.','Put the folded towel on the shelf.'][i],x,['flat','half','fold','stack'],{reference:x,context:'fold',foldStep:i+1,hint:'Follow the highlighted picture step.'}));
 }
 if(id==='lunch'){
  const food=['sandwich','apple','milk','salad','water','banana'];
  if(level===1)tasks=food.slice(0,n).map((x,i)=>pick('Give the customer the food in their picture order.',x,food,{reference:x,context:'order',customer:i}));
  if(level===2)tasks=Array.from({length:n-1},(_,i)=>pack('Build the tray to match the picture order.',[food[i%food.length],food[(i+2)%food.length],...(difficulty==='challenge'?['napkin']:[])],[...food,'napkin'],{context:'tray',customer:i}));
  if(level===3)tasks=['fork','spoon','napkin','fork','spoon','napkin'].slice(0,n).map(x=>pick('Put the clean supply in its matching bin.',x+'Bin',['forkBin','spoonBin','napkinBin'],{item:x,context:'sort'}));
  if(level===4){
   const orders=[['sandwich','milk'],['salad','water'],['apple','banana']];
   tasks=orders.map((request,i)=>pack('Serve customer '+(i+1)+' first. Follow the order on the ticket.',request,food,{context:'queue',customer:i,queue:orders,hint:'Check the current customer’s ticket before serving.'}));
   if(difficulty==='challenge')tasks.push(pack('The last customer needs two milks and an apple.',['milk','milk','apple'],food,{context:'queue',customer:3}));
  }
 }
 if(id==='mail'){
  if(level===1)tasks=places.slice(0,n).map(x=>pick('Match this envelope’s picture label.',x,places,{reference:x,item:'envelope',context:'mail'}));
  if(level===2)tasks=places.slice(0,n).map(x=>pick('Put this envelope in the matching cubby.',x,places,{reference:x,item:'envelope',context:'cubby'}));
  if(level===3)tasks=places.slice(0,n).map(x=>pick('Deliver this package to the pictured school room.',x,places,{reference:x,item:'package',context:'delivery'}));
  if(level===4){const route=places.slice(0,difficulty==='supported'?3:5);tasks=route.map((x,i)=>pick('Delivery stop '+(i+1)+'. Follow the highlighted picture on your route.',x,places,{reference:x,item:i%2?'package':'envelope',route,routeIndex:i,context:'route'}));}
 }
 if(id==='supply'){
  if(level===1)tasks=supplies.slice(0,n).map(x=>pick('Find the supply on the teacher’s picture card.',x,supplies,{reference:x,context:'supply'}));
  if(level===2)tasks=supplies.slice(0,n).map((x,i)=>pack('Count '+(i%3+1)+' '+label(x).toLowerCase()+'. Put them in the bin.',Array(i%3+1).fill(x),supplies,{context:'count'}));
  if(level===3)tasks=Array.from({length:n-1},(_,i)=>pack('Prepare the teacher’s supply kit.',[supplies[i],supplies[i],supplies[(i+2)%6],...(difficulty==='challenge'?['paper','folder']:[])],supplies,{context:'kit',customer:i}));
  if(level===4)tasks=Array.from({length:n},(_,i)=>{const request=['pencil','folder',...(difficulty==='challenge'?['paper']:[])],contents=i%2?[...request]:['pencil','paper'];return pick('Check this kit. Does it match the picture order?',i%2?'ready':'fix',['ready','fix'],{request,contents,context:'inspect',hint:'Compare the order pictures with every item in the kit.'});});
 }
 if(id==='helper'){
  const job=level>=3?'mailJob':'supplyJob';
  tasks=[pick('Start your workday. Clock in.','clockIn',['clockIn','clockOut'],{reference:'clockIn',context:'clock'}),pick('Choose your assigned job. Match the picture on your work plan.',job,['supplyJob','mailJob','lunchJob'],{reference:job,context:'plan'})];
  tasks.push(level===1?pick('Task one. Find a pencil for the classroom.','pencil',supplies,{reference:'pencil',context:'supply'}):pack('Task one. Fill this classroom supply order.',level===4?['pencil','pencil','folder','paper']:['pencil','folder'],supplies,{context:'kit'}));
  tasks.push(level===1?pick('Task two. Match this sock.','blueSock',sockIds,{reference:'blueSock',context:'sock'}):pack('Task two. Prepare the lunch tray.',['sandwich','milk'],['sandwich','milk','salad','water'],{context:'tray'}));
  tasks.push(pick('A supply is missing. What should you do?','help',['help','guess','leave'],{reference:'help',context:'help',hint:'Ask your supervisor for the missing supply.'}));
  if(level>=2)tasks.push(pick(level>=3?'The supervisor changed the delivery room. Ask them to show you the new room.':'You do not understand a direction. Ask your supervisor to show you.','help',['help','guess','leave'],{reference:level===2?'help':undefined,context:'change',hint:'Ask for clarification before you continue.'}));
  tasks.push(pick('Task three. Deliver this approved envelope to the pictured room.',level>=3?'library':'office',places,{reference:level>=3?'library':'office',item:'envelope',context:'delivery'}));
  tasks.push(pick('How do you move safely in the school hallway?','walk',['walk','run','leave'],{reference:level===1?'walk':undefined,context:'behavior',hint:'Walk, carry supplies carefully, and follow school rules.'}));
  if(level===4)tasks.push(pick('Your supervisor asks you to wait while the route is cleared. What do you do?','wait',['wait','run','guess'],{context:'behavior',hint:'Stop in a safe place and wait for your supervisor.'}));
  tasks.push(pick('Your three tasks are finished. Tell your supervisor and clock out.','clockOut',['clockIn','clockOut'],{reference:'clockOut',context:'clock'}));
 }
 // Fewer distractors at supported difficulty; always keep the correct answer and every requested item.
 return tasks.map((t,index)=>{
  const required=new Set(t.kind==='pack'?t.request:[t.target]);
  const limit=difficulty==='supported'?Math.max(required.size+1,2):difficulty==='standard'?Math.max(required.size+1,4):9;
  const essentials=t.options.filter(o=>required.has(o.id));
  const others=t.options.filter(o=>!required.has(o.id));
  const options=[...essentials,...others.slice(0,Math.max(0,limit-essentials.length))];
  return {...t,id:id+'-'+level+'-'+index,options,hint:t.hint||'Look at the picture. Take your time and try again.'};
 });
}
export function matchesRequest(actual,requested){return actual.length===requested.length&&[...actual].sort().every((x,i)=>x===[...requested].sort()[i]);}
export class WorkSession{
 constructor(mission,level,difficulty='standard'){this.mission=mission;this.level=level;this.difficulty=difficulty;this.tasks=createLevel(mission,level,difficulty);this.index=0;this.attempts=0;this.firstTry=0;this.retries=0;this.onTaskAttempts=0;this.helpCount=0;this.done=false;this.lastCorrect=false;}
 get task(){return this.tasks[this.index];}
 answer(value){if(this.done||this.lastCorrect)return {ignored:true};const t=this.task;this.attempts++;this.onTaskAttempts++;const correct=t.kind==='pack'?matchesRequest(value,t.request):value===t.target;if(correct){if(this.onTaskAttempts===1)this.firstTry++;this.lastCorrect=true;}else this.retries++;return {correct,hint:t.hint};}
 next(){if(!this.lastCorrect)return false;this.index++;this.lastCorrect=false;this.onTaskAttempts=0;if(this.index>=this.tasks.length)this.done=true;return true;}
 summary(){return {mission:this.mission,level:this.level,difficulty:this.difficulty,tasks:this.tasks.length,firstTry:this.firstTry,accuracy:Math.round(100*this.firstTry/this.tasks.length),attempts:this.attempts,retries:this.retries,helpCount:this.helpCount,completed:this.done};}
}
export const REWARDS=[{id:'memory',title:'Color Match',icon:'apple'},{id:'socks',title:'Sock Match',icon:'redSock'},{id:'sort',title:'Quick Sort',icon:'basket'},{id:'puzzle',title:'Picture Puzzle',icon:'art'},{id:'surprise',title:'Surprise Stars',icon:'star'}];
export class RewardSession{
 constructor(type,random=Math.random){if(!REWARDS.some(r=>r.id===type))throw new Error('Unknown reward');this.type=type;this.selected=[];this.matched=[];this.first=null;this.done=false;this.mismatch=false;this.count=0;this.random=random;const values=type==='socks'?sockIds.slice(0,3):['apple','milk','banana'];this.cards=shuffle([...values,...values].map((value,i)=>({id:i,value})),random);this.pieces=shuffle([0,1,2,3],random);this.placed=[null,null,null,null];}
 flip(id){if(this.done||this.mismatch||this.matched.includes(id)||this.first===id)return 'ignored';const c=this.cards.find(c=>c.id===id);if(!c)return 'ignored';if(this.first===null){this.first=id;return 'first';}if(c.value===this.cards.find(c=>c.id===this.first).value){this.matched.push(this.first,id);this.first=null;this.done=this.matched.length===this.cards.length;return 'match';}this.selected=[this.first,id];this.mismatch=true;return 'retry';}
 retry(){this.selected=[];this.first=null;this.mismatch=false;}
 sort(id){const expected=['produce','dairy','produce','dairy'];if(this.done)return false;if(id!==expected[this.count])return false;this.count++;this.done=this.count===expected.length;return true;}
 place(piece,slot){if(this.done||this.placed.includes(piece)||slot!==piece||this.placed[slot]!==null)return false;this.placed[slot]=piece;this.done=this.placed.every(x=>x!==null);return true;}
 reveal(){this.count++;this.done=this.count>=5;}
}
export function shuffle(values,random=Math.random){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
export const freshState=()=>({version:1,code:'GUEST',assignment:null,records:[]});
export const validCode=value=>/^[A-Z0-9-]{2,16}$/.test(value);
export function cleanState(raw){if(!raw||raw.version!==1||!Array.isArray(raw.records))return freshState();const out=freshState();out.code=validCode(raw.code)?raw.code:'GUEST';out.records=raw.records.filter(r=>r&&typeof r.id==='string'&&validCode(r.code)&&MISSIONS.some(m=>m.id===r.mission)&&Number.isInteger(r.level)&&r.level>=1&&r.level<=4&&r.completed===true&&Number.isFinite(r.accuracy)&&r.accuracy>=0&&r.accuracy<=100);if(raw.assignment&&validCode(raw.assignment.code)&&MISSIONS.some(m=>m.id===raw.assignment.mission)&&Number.isInteger(raw.assignment.level)&&raw.assignment.level>=1&&raw.assignment.level<=4&&DIFFICULTIES[raw.assignment.difficulty])out.assignment=raw.assignment;return out;}
