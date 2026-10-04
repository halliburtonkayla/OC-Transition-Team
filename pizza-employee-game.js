'use strict';
/* Pizza Shop employee gameplay extension: cashier + richer kitchen interactions.
   Uses the shared PizzaShop order store and the existing 5-minute time clock. */
let cashierGame=null;

function clockIn(role){
  let v=document.getElementById('pin').value;
  if(v!==empPin()){document.getElementById('pinmsg').innerHTML='<span class="notice">Incorrect PIN. Try again.</span>';return}
  let now=Date.now();
  shift={role,start:now,end:now+REAL_SHIFT*1000,completed:0,correct:0,mistakes:0,oven:null,current:null};
  let k=roleKey(role);
  if(k==='kitchen') startKitchen();
  else if(k==='cashier') startCashier();
  else stationPlaceholder(role);
}

function cashierDifficulty(){return Math.min(4,1+Math.floor((shift&&shift.completed||0)/2))}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function spokenSize(){return pick(['Personal','Small','Medium','Large','Extra Large'])}
function generateCustomerOrder(){
  let level=cashierDifficulty(), size=spokenSize(), crust=pick(['Hand Tossed','Thin Crust','Pan','Stuffed Crust']);
  let pizza=pick(['Cheese','Pepperoni','Sausage','Meat Lovers','Supreme','Veggie','Hawaiian','BBQ Chicken','Buffalo Chicken']);
  let sauce=level>=2?pick(['Light','Regular','Extra']):'Regular';
  let mods={}, phrases=[];
  let pool=['Pepperoni','Sausage','Ham','Bacon','Chicken','Mushrooms','Onions','Green Peppers','Black Olives','Jalapeños','Pineapple','Tomatoes','Extra Cheese'];
  let base=(PS.menu.pizzas[pizza]&&PS.menu.pizzas[pizza].toppings||[]).map(x=>x.replace(/\\b\\w/g,m=>m.toUpperCase()));
  let count=level===1?0:level===2?1:level===3?2:3;
  for(let i=0;i<count;i++){let existing=base.filter(x=>!mods[x]),adding=pool.filter(x=>!base.includes(x)&&!mods[x]),useExisting=existing.length&&Math.random()<.55,t=pick(useExisting?existing:adding),m=useExisting?pick(['No','Light','Extra']):'Add';mods[t]=m;phrases.push(m.toLowerCase()+' '+t.toLowerCase())}
  let side=null,drink=null,dessert=null,sauceDip=null;
  if(level>=1&&Math.random()<.7) side=pick(['Breadsticks','Cheese Sticks','6 Wings','12 Wings']);
  if(level>=1&&Math.random()<.85) drink={name:pick(['Cola','Diet Cola','Lemon-Lime','Root Beer','Fruit Punch','Iced Tea']),size:pick(['Small','Medium','Large'])};
  if(level>=3&&Math.random()<.45) dessert=pick(['Cinnamon Bites','Chocolate Brownie']);
  if((side||level>=3)&&Math.random()<.5) sauceDip=pick(['Ranch','Garlic Butter','Marinara','Buffalo','BBQ']);
  let words='Can I get a '+size.toLowerCase()+' '+crust.toLowerCase()+' '+pizza.toLowerCase()+' pizza';
  if(sauce!=='Regular')words+=' with '+sauce.toLowerCase()+' sauce';
  if(phrases.length)words+=', '+phrases.join(', ');
  if(side)words+=', '+side.toLowerCase();
  if(sauceDip)words+=' with '+sauceDip.toLowerCase();
  if(drink)words+=', and a '+drink.size.toLowerCase()+' '+drink.name;
  if(dessert)words+=', and '+dessert.toLowerCase();
  return {size,crust,pizza,sauce,mods,side,drink,dessert,sauceDip,spoken:words+' please.'};
}
function startCashier(){
  cashierGame={target:null,entry:null,payment:null,stage:'listen'};
  nextCashierCustomer();
  if(shiftTimer)clearInterval(shiftTimer);
  shiftTimer=setInterval(()=>{if(shiftClock().left<=0)clockOutPrompt();else updateCashierClock()},500);
}
function nextCashierCustomer(){
  cashierGame.target=generateCustomerOrder();
  cashierGame.entry={size:null,crust:null,pizza:null,sauce:'Regular',mods:{},side:null,drink:null,dessert:null,sauceDip:null};
  cashierGame.stage='read';renderCashier();
}
function updateCashierClock(){
  let el=document.getElementById('cashClock'),bar=document.getElementById('cashBar');if(!el||!bar)return;
  let t=shiftClock();el.textContent=t.time;bar.style.width=t.pct+'%';
}
function replayCustomer(){PS.speak(cashierGame.target.spoken,.88)}
function cashierScene(){
  return '<div class="cashierPOV"><div class="customerAvatar"><i></i><b>Customer</b></div><div class="posScreen">PIZZA SHOP POS</div><div class="registerBase"></div></div>';
}
function renderCashier(){
  let t=shiftClock(),e=cashierGame.entry,order=cashierGame.target&&cashierGame.target.spoken||'';
  app.innerHTML=`<section class="card"><span class="badge">CASHIER • CLOCKED IN</span><div id="cashClock" class="clock">${t.time}</div><div class="shiftbar"><i id="cashBar" style="width:${t.pct}%"></i></div><div class="statgrid"><div><b>${shift.completed}</b><br>Customers</div><div><b>${shift.correct}</b><br>Correct</div><div><b>${shift.mistakes}</b><br>Corrections</div></div></section>${cashierScene()}<section class="card customerOrderCard"><span class="badge">CUSTOMER ORDER</span><h2>Enter This Order Into the Register</h2><div class="writtenOrder">“${esc(order)}”</div><p>Read the customer's order carefully. Use the POS below to enter every size, crust, pizza, modifier, side, sauce, drink and dessert they requested.</p><div id="customerReply"></div></section><section class="card pos"><h2>POS Register</h2>${posGroup('SIZE',['Personal','Small','Medium','Large','Extra Large'],'size',e.size)}${posGroup('CRUST',['Hand Tossed','Thin Crust','Pan','Stuffed Crust'],'crust',e.crust)}${posGroup('PIZZA',['Cheese','Pepperoni','Sausage','Meat Lovers','Supreme','Veggie','Hawaiian','BBQ Chicken','Buffalo Chicken'],'pizza',e.pizza)}${posGroup('SAUCE',['Light','Regular','Extra'],'sauce',e.sauce)}<h3>TOPPINGS / MODIFIERS</h3><div class="posMods">${['Pepperoni','Sausage','Ham','Bacon','Chicken','Mushrooms','Onions','Green Peppers','Black Olives','Jalapeños','Pineapple','Tomatoes','Extra Cheese'].map(x=>{let cv=e.mods[x]||'Regular';return `<label>${x}<select onchange="cashMod('${x}',this.value)">${['Regular','No','Light','Extra','Add'].map(v=>`<option ${v===cv?'selected':''}>${v}</option>`).join('')}</select></label>`}).join('')}</div>${posGroup('SIDE',['None','Breadsticks','Cheese Sticks','6 Wings','12 Wings'],'side',e.side||'None')}${posGroup('DIPPING SAUCE',['None','Ranch','Garlic Butter','Marinara','Buffalo','BBQ'],'sauceDip',e.sauceDip||'None')}${posGroup('DRINK',['None','Cola','Diet Cola','Lemon-Lime','Root Beer','Fruit Punch','Iced Tea'],'drinkName',e.drink&&e.drink.name||'None')}${posGroup('DRINK SIZE',['Small','Medium','Large'],'drinkSize',e.drink&&e.drink.size||'Medium')}${posGroup('DESSERT',['None','Cinnamon Bites','Chocolate Brownie'],'dessert',e.dessert||'None')}<div class="bigbuttons"><button class="btn green" onclick="readBackOrder()">CHECK / READ BACK ORDER</button></div></section>`;
}
function posGroup(label,vals,key,current){return `<h3>${label}</h3><div class="posBtns">${vals.map(v=>`<button class="btn ${v===current?'green':'white'}" onclick="cashSet('${key}','${v.replace(/'/g,"\\'")}')">${v}</button>`).join('')}</div>`}
function cashSet(key,v){
  let e=cashierGame.entry;
  if(key==='drinkName'){if(v==='None')e.drink=null;else e.drink={name:v,size:e.drink&&e.drink.size||'Medium'}}
  else if(key==='drinkSize'){if(e.drink)e.drink.size=v}
  else e[key]=v==='None'?null:v;
  renderCashier();
}
function cashMod(k,v){if(v==='Regular')delete cashierGame.entry.mods[k];else cashierGame.entry.mods[k]=v}
function normMods(o){let x={};Object.keys(o||{}).sort().forEach(k=>x[k]=o[k]);return JSON.stringify(x)}
function cashierMatches(){
  let a=cashierGame.target,b=cashierGame.entry;
  return a.size===b.size&&a.crust===b.crust&&a.pizza===b.pizza&&a.sauce===b.sauce&&a.side===b.side&&a.dessert===b.dessert&&a.sauceDip===b.sauceDip&&normMods(a.mods)===normMods(b.mods)&&JSON.stringify(a.drink)===JSON.stringify(b.drink);
}
function enteredPizzaPrice(){
  let e=cashierGame.entry,m=PS.menu,s=m.sizes.find(x=>x[0]===e.size),c=m.crusts.find(x=>x[0]===e.crust),p=m.pizzas[e.pizza];if(!s||!c||!p)return 0;
  let extra=Object.values(e.mods).filter(x=>x==='Extra'||x==='Add').length*1.15;return Math.round((s[1]+c[1]+p.base+extra)*100)/100;
}
function entryItems(){
  let e=cashierGame.entry,items=[],mods=Object.entries(e.mods).map(([k,v])=>v+' '+k);
  items.push({type:'pizza',name:e.size+' '+e.crust+' '+e.pizza+(e.sauce!=='Regular'?' • '+e.sauce+' Sauce':'')+(mods.length?' • '+mods.join(', '):''),price:enteredPizzaPrice(),details:{size:e.size,crust:e.crust,pizza:e.pizza,sauce:e.sauce,modifiers:Object.assign({},e.mods)}});
  let sidePrices={'Breadsticks':5.49,'Cheese Sticks':6.99,'6 Wings':8.99,'12 Wings':15.99};if(e.side)items.push({type:'side',name:e.side,price:sidePrices[e.side]||0});
  if(e.sauceDip)items.push({type:'sauce',name:e.sauceDip,price:.79});
  if(e.drink){let pr=e.drink.size==='Small'?2.29:e.drink.size==='Large'?3.29:2.79;items.push({type:'drink',name:e.drink.size+' '+e.drink.name,price:pr})}
  if(e.dessert)items.push({type:'dessert',name:e.dessert,price:e.dessert==='Cinnamon Bites'?5.99:6.49});return items;
}
function readBackOrder(){
  let e=cashierGame.entry;if(!e.size||!e.crust||!e.pizza){document.getElementById('customerReply').innerHTML='<div class="notice">Finish the pizza size, crust, and pizza type first.</div>';return}
  let ok=cashierMatches();if(!ok){shift.mistakes++;document.getElementById('customerReply').innerHTML='<div class="notice"><b>Customer:</b> “Something in that read-back isn’t what I ordered. Please check my order again.”</div>';return}
  shift.correct++;cashierPayment();
}
function cashierPayment(){
  let items=entryItems(),total=Math.round(items.reduce((a,x)=>a+x.price,0)*100)/100;
  let card=Math.random()<.45,tender=[20,50,100].find(x=>x>=total)||100;
  cashierGame.payment={type:card?'CARD':'CASH',total,tender};
  app.innerHTML=`${cashierScene()}<section class="card"><div class="good"><b>Customer:</b> “Yes, that’s correct.”</div><h1>Total: ${PS.money(total)}</h1>${card?'<p>The customer hands you a card.</p><button class="btn green" onclick="finishCashierPayment()">PROCESS CARD</button>':`<p>The customer gives you <b>$${tender.toFixed(2)}</b>.</p><label>Enter the change due<input id="cashChange" class="field" inputmode="decimal" placeholder="0.00"></label><p id="cashMsg"></p><button class="btn green" onclick="checkCashierChange()">GIVE CHANGE</button>`}</section>`;
}
function checkCashierChange(){
  let p=cashierGame.payment,due=Math.round((p.tender-p.total)*100)/100,ans=Number(document.getElementById('cashChange').value);
  if(Math.abs(ans-due)>.009){shift.mistakes++;document.getElementById('cashMsg').innerHTML='<span class="notice">That change is not correct. Count it again.</span>';return}
  shift.correct++;finishCashierPayment();
}
function finishCashierPayment(){
  let items=entryItems(),p=cashierGame.payment,total=p.total;
  let order=PS.addOrder({resident:'Restaurant Customer',items,total,paymentStatus:'PAID',paymentMethod:p.type,source:'cashier-pos',queue:'kitchen',cashier:PS.residentName(),kitchen:{tickets:items.filter(x=>x.type==='pizza'||x.type==='side').map((x,i)=>({ticket:i+1,orderItem:x,status:'QUEUED'}))}});
  shift.completed++;shift.correct++;
  app.innerHTML=`<section class="card"><div class="good"><h1>Order #${order.id} sent to kitchen!</h1><p>The exact POS order you entered is now a shared kitchen ticket.</p></div><button class="btn green" onclick="nextCashierCustomer()">NEXT CUSTOMER</button></section>`;
}

/* Richer kitchen prep: modifier quantities, visible build, oven timing, touch cutter. */
function toppingStation(x){
  let d=x.pizza.details||{},mods=d.modifiers||{},counts=x.chosen.counts||(x.chosen.counts={});
  let ticket=Object.entries(mods).map(([k,v])=>v+' '+k).join(' • ')||'Standard recipe toppings';
  let dots=Object.entries(counts).map(([k,n])=>Array(Math.min(n,4)).fill('<i title="'+esc(k)+'"></i>').join('')).join('');
  return `<h2>Order #${x.id} — Build Pizza</h2><div class="ticket">${esc(x.pizza.name)}<br><b>${esc(ticket)}</b></div><div class="prepPizza"><div class="pizzaDough">${dots}</div></div><p>Tap an ingredient to add it. Light = 1 tap, Regular/Add = 2 taps, Extra = 3 taps. NO = 0.</p><div class="makegrid">${PS.menu.toppings.map(v=>`<button class="btn white" onclick="addKitchenTop('${esc(v).replace(/'/g,"\\'")}')">${esc(v)} <b>${counts[v]||0}</b></button>`).join('')}</div><p><button class="btn green" onclick="checkToppingCounts()">CHECK PIZZA</button> <button class="btn white" onclick="clearKitchenTops()">CLEAR TOPPINGS</button></p>`;
}
function addKitchenTop(v){let c=shift.current.chosen.counts||(shift.current.chosen.counts={});c[v]=(c[v]||0)+1;if(c[v]>3)c[v]=0;renderKitchen(false)}
function clearKitchenTops(){shift.current.chosen.counts={};renderKitchen(false)}
function expectedTopCounts(){
  let d=shift.current.pizza.details||{},mods=d.modifiers||{},base=(PS.menu.pizzas[d.pizza]&&PS.menu.pizzas[d.pizza].toppings||[]).map(x=>x.replace(/\b\w/g,m=>m.toUpperCase()));
  let out={};base.forEach(k=>out[k]=2);
  Object.entries(mods).forEach(([k,v])=>{out[k]=/no/i.test(v)?0:/light/i.test(v)?1:/extra/i.test(v)?3:2});return out;
}
function checkToppingCounts(){
  let need=expectedTopCounts(),got=shift.current.chosen.counts||{},keys=new Set([...Object.keys(need),...Object.keys(got)]),ok=true;
  keys.forEach(k=>{if((need[k]||0)!==(got[k]||0))ok=false});
  if(ok){shift.correct++;shift.current.step='oven'}else shift.mistakes++;renderKitchen();
}
function makeStation(x){
  let d=x.pizza.details||{},step=x.step;
  if(step==='dough')return `<h2>Order #${x.id} — Dough</h2><p>Select the correct dough/size.</p><div class="makegrid">${['Personal','Small','Medium','Large','Extra Large'].map(v=>`<button class="btn white" onclick="kitchenChoice('dough','${v}')">${v}</button>`).join('')}</div>`;
  if(step==='crust')return `<h2>Crust</h2><div class="makegrid">${['Hand Tossed','Thin Crust','Pan','Stuffed Crust'].map(v=>`<button class="btn white" onclick="kitchenChoice('crust','${v}')">${v}</button>`).join('')}</div>`;
  if(step==='sauce')return `<h2>Spread Sauce</h2><p>Ticket calls for <b>${esc(d.sauce||'Regular')} Sauce</b>.</p><div class="makegrid">${['Light','Regular','Extra'].map(v=>`<button class="btn white" onclick="kitchenChoice('sauce','${v}')">${v} Sauce</button>`).join('')}</div>`;
  if(step==='toppings')return toppingStation(x);
  if(step==='oven')return ovenStation(x);
  if(step==='cut')return cutterStation(x);
  if(step==='box')return `<h2>Box & Match</h2><p>Place the pizza in a box, then match it to the correct ticket.</p><div class="pizzaBox">PIZZA BOX<br><b>?</b></div><div class="makegrid">${[x.id,x.id+1,x.id+2].sort(()=>Math.random()-.5).map(n=>`<button class="btn white" onclick="matchOrder(${n})">ORDER #${n}</button>`).join('')}</div>`;
  return '';
}
function cutterStation(x){
  let cuts=x.chosen.cuts||0;
  return `<h2>Cut the Pizza</h2><p>Swipe across the pizza or tap CUT until you have four cut lines.</p><div id="cutPizza" class="cutPizza" ontouchstart="cutStart(event)" ontouchend="cutEnd(event)" onpointerdown="cutPointer(event)" onpointerup="cutPointerEnd(event)">🍕<b>${cuts}/4 cuts</b></div><button class="btn green" onclick="makeCut()">CUT</button> ${cuts>=4?'<button class="btn green" onclick="kitchenAdvance(\'box\')">BOX PIZZA</button>':''}`;
}
let cutX=0,cutY=0;
function cutStart(e){let t=e.touches[0];cutX=t.clientX;cutY=t.clientY}
function cutEnd(e){let t=e.changedTouches[0];if(Math.hypot(t.clientX-cutX,t.clientY-cutY)>35)makeCut()}
function cutPointer(e){cutX=e.clientX;cutY=e.clientY}
function cutPointerEnd(e){if(Math.hypot(e.clientX-cutX,e.clientY-cutY)>35)makeCut()}
function makeCut(){shift.current.chosen.cuts=Math.min(4,(shift.current.chosen.cuts||0)+1);renderKitchen(false)}

/* Kitchen side/fryer queue: pizza and hot sides share the same order tickets. */
function activeKitchenOrders(){let w=PS.world();return (w.pizzaOrders||[]).filter(o=>!o.completed&&(o.kitchen&&o.kitchen.tickets||[]).some(t=>t.status!=='READY FOR PICKUP')).slice(0,4)}
function kitchenWorkItems(o){return (o.items||[]).map((item,index)=>({item,index})).filter(x=>x.item.type==='pizza'||x.item.type==='side')}
function renderKitchen(scroll=true){
  let t=shiftClock(),orders=ensureRush(),cards='';
  orders.forEach(o=>{cards+=`<div class="order"><b>ORDER #${o.id}</b>`;kitchenWorkItems(o).forEach(({item,index})=>{let tk=(o.kitchen&&o.kitchen.tickets||[]).find(q=>q.orderItem&&q.orderItem.name===item.name),done=tk&&tk.status==='READY FOR PICKUP';cards+=`<div class="ticket">${esc(item.name)}<br>STATUS: <b>${done?'READY':shift.current&&shift.current.id===o.id&&shift.current.itemIndex===index?'WORKING':'WAITING'}</b><br>${done?'':`<button class="btn green" onclick="selectKitchenItem(${o.id},${index})">START ITEM</button>`}</div>`});cards+='</div>'});
  let work=shift.current?(shift.current.pizza?makeStation(shift.current):sideStation(shift.current)):'<div class="notice">Choose a waiting item. Keep an eye on anything already cooking.</div>';
  app.innerHTML=`<section class="card"><span class="badge">KITCHEN • CLOCKED IN</span><div class="clock">${t.time}</div><div class="shiftbar"><i style="width:${t.pct}%"></i></div><p>${Math.floor(t.left/60)}:${String(t.left%60).padStart(2,'0')} real time remaining</p><div class="statgrid"><div><b>${shift.completed}</b><br>Items</div><div><b>${shift.correct}</b><br>Correct Steps</div><div><b>${shift.mistakes}</b><br>Corrections</div></div></section><section class="card"><h2>Kitchen Tickets</h2>${cards||'<div class="notice">No tickets yet.</div>'}</section><section class="card">${work}</section>`;if(scroll)window.scrollTo(0,0)
}
function selectKitchenItem(id,index){
  let o=PS.getOrder(id),item=o&&o.items[index];if(!item)return;
  PS.patchOrder(id,{kitchenClaimed:true,status:'PREPARING'});
  if(item.type==='pizza')shift.current={id,itemIndex:index,step:'dough',pizza:item,chosen:{}};
  else shift.current={id,itemIndex:index,step:'startSide',side:item,chosen:{}};
  renderKitchen();
}
function sideStation(x){
  let n=x.side.name;
  if(!/Wings/i.test(n))return `<h2>Order #${x.id} — ${esc(n)}</h2><p>Place the side in the accelerated oven.</p>${x.sideCook?sideCookView(x,8,12):'<button class="btn green" onclick="startSideCook()">START COOKING</button>'}`;
  return `<h2>Order #${x.id} — ${esc(n)}</h2><p>Drop the wings in the fryer. Work efficiently, but do not serve undercooked chicken.</p>${x.sideCook?sideCookView(x,10,15):'<button class="btn green" onclick="startSideCook()">DROP CHICKEN</button>'}`;
}
function startSideCook(){shift.current.sideCook={start:Date.now()};renderKitchen(false)}
function sideCookView(x,min,max){
  let sec=(Date.now()-x.sideCook.start)/1000,label=sec<min?'COOKING — TOO EARLY':sec<=max?'READY WINDOW':'OVERCOOKING';
  return `<div class="ovenbar"><i style="width:${Math.min(100,sec/(max+5)*100)}%"></i></div><p><b>${label}</b> • ${sec.toFixed(1)} sec</p><button class="btn red" onclick="finishSideCook(${min},${max})">REMOVE ${/Wings/i.test(x.side.name)?'FROM FRYER':'FROM OVEN'}</button>`;
}
function finishSideCook(min,max){
  let sec=(Date.now()-shift.current.sideCook.start)/1000;if(sec<min||sec>max){shift.mistakes++;shift.current.sideCook=null;renderKitchen();return}
  shift.correct++;markKitchenItemReady(shift.current.id,shift.current.itemIndex);shift.completed++;shift.current=null;renderKitchen();
}
function markKitchenItemReady(id,index){
  let o=PS.getOrder(id);if(!o)return;let item=o.items[index],k=o.kitchen||{tickets:[]},tk=(k.tickets||[]).find(q=>q.orderItem&&q.orderItem.name===item.name);if(tk)tk.status='READY FOR PICKUP';
  let all=k.tickets&&k.tickets.length&&k.tickets.every(q=>q.status==='READY FOR PICKUP');PS.patchOrder(id,{kitchen:k,status:all?'READY FOR PICKUP':'PREPARING',readyAt:all?Date.now():o.readyAt});
}
function matchOrder(n){
  if(n!==shift.current.id){shift.mistakes++;renderKitchen();return}
  markKitchenItemReady(shift.current.id,shift.current.itemIndex);shift.completed++;shift.correct++;shift.current=null;ensureRush();renderKitchen();
}

/* Final employee-center completion: shared PIN, pickup, cleanup, and accurate manager labels. */
function managerHome(){
 return '<p>Choose any Pizza Shop station to test. Manager/Test shifts never deposit wages or overwrite student employment.</p><div class="grid">'+
 ['Cashier / Order Taker','Pizza Maker / Kitchen','Dishwasher / Cleanup','Order Pickup / Counter'].map(role=>'<div class="job"><h2>'+role+'</h2><p>Training → Clock In → Work Shift → Clock Out → Shift Report</p><button class="btn green" onclick="training(\''+role+'\')">TRAINING / CLOCK IN</button></div>').join('')+
 '</div><p><button class="btn green" onclick="orderBoard()">LIVE RESTAURANT ORDER BOARD</button> <button class="btn white" onclick="applicationList()">PIZZA APPLICATIONS</button></p><div class="arch"><b>Shared restaurant system:</b><p>Customer and cashier orders use the same pizzaOrders records that feed kitchen and pickup.</p><p><b>Shift clock:</b> 5 real minutes = 8 simulated hours.</p></div>';
}
function empPin(){
 let w=PS.world(),r=resident(w),e=employment(w);if(isKayla())return '6437';
 if(r&&r.employeePin){if(e)e.pin=String(r.employeePin);PS.saveWorld(w);return String(r.employeePin)}
 if(r&&r.groceryPin){r.employeePin=String(r.groceryPin);if(e)e.pin=r.employeePin;PS.saveWorld(w);return r.employeePin}
 if(e&&e.pin){if(r)r.employeePin=String(e.pin);PS.saveWorld(w);return String(e.pin)}
 let n=PS.residentName(),sum=0;for(let i=0;i<n.length;i++)sum+=n.charCodeAt(i)*(i+3);let pin=String(1000+(sum%9000));
 if(r){r.employeePin=pin;r.groceryPin=r.groceryPin||pin}if(e)e.pin=pin;PS.saveWorld(w);return pin;
}
function timeClock(role){
 let pin=empPin();
 app.innerHTML='<section class="card"><span class="badge">EMPLOYEE TIME CLOCK</span><h1>Clock In</h1><p>Shift: <b>8:00 AM–4:00 PM</b> • 5 real minutes</p>'+
 (isKayla()?'<div class="notice">Manager/Test Mode. Enter the manager PIN.</div>':'<div class="good">Your Transition Town employee PIN: <b>'+esc(pin)+'</b></div>')+
 '<label>Enter PIN<input id="pin" class="field" inputmode="numeric" maxlength="4" type="password"></label><p id="pinmsg"></p><button class="btn green" onclick="clockIn(\''+esc(role).replace(/'/g,"\\'")+'\')">CLOCK IN</button> <button class="btn white" onclick="landing()">Cancel</button></section>';
}
function training(role){
 stopTimers();let k=roleKey(role),lesson=
 k==='kitchen'?'Read every ticket before starting. Build the exact pizza, manage hot sides and oven timing, cut, box, and match the order number.' :
 k==='cashier'?'Read the customer order shown on screen, enter it exactly in the POS, read it back, total it, make correct change when needed, and send that exact order to the kitchen.' :
 k==='dishwasher'?'Keep dirty and clean items separate. Scrape, wash, rinse, sanitize, air dry, and store in the correct order. Handle spills and handwashing safely.' :
 'Check the order number and verify every pizza, side, sauce, dessert and drink before handing the order to the customer.';
 app.innerHTML='<section class="card"><span class="badge">'+esc(role)+' TRAINING</span><h1>Before You Clock In</h1><div class="good">'+esc(lesson)+'</div><p><button class="btn white" onclick="PS.speak(\''+lesson.replace(/'/g,"\\'")+'\',.9)">🔊 AUDIO INSTRUCTIONS</button></p><p><button class="btn green" onclick="timeClock(\''+esc(role).replace(/'/g,"\\'")+'\')">GO TO TIME CLOCK</button> <button class="btn white" onclick="landing()">Back</button></p></section>';
}
function clockIn(role){
 let v=document.getElementById('pin').value;if(v!==empPin()){document.getElementById('pinmsg').innerHTML='<span class="notice">Incorrect PIN. Try again.</span>';return}
 let now=Date.now();shift={role,start:now,end:now+REAL_SHIFT*1000,completed:0,correct:0,mistakes:0,oven:null,current:null,service:0,safety:0,cleanliness:0};
 let k=roleKey(role);if(k==='kitchen')startKitchen();else if(k==='cashier')startCashier();else if(k==='dishwasher')startCleanup();else startPickup();
}
function pickupOrders(){
 let w=PS.world();return (w.pizzaOrders||[]).filter(o=>!o.completed&&o.status==='READY FOR PICKUP'&&(!o.pickup||o.pickup.status!=='HANDED OUT')).slice(0,6);
}
function startPickup(){renderPickup();if(shiftTimer)clearInterval(shiftTimer);shiftTimer=setInterval(()=>{if(shiftClock().left<=0)clockOutPrompt();else renderPickup(false)},900)}
function renderPickup(scroll=true){
 let t=shiftClock(),orders=pickupOrders(),cards=orders.map(o=>'<div class="pickupTicket"><b>ORDER #'+o.id+'</b><div class="pickupItems">'+(o.items||[]).map(x=>'<span>'+esc(x.name)+'</span>').join('')+'</div><button class="btn green" onclick="verifyPickup('+o.id+')">VERIFY ORDER</button></div>').join('');
 app.innerHTML='<section class="card"><span class="badge">ORDER PICKUP • CLOCKED IN</span><div class="clock">'+t.time+'</div><div class="shiftbar"><i style="width:'+t.pct+'%"></i></div><div class="statgrid"><div><b>'+shift.completed+'</b><br>Handed Out</div><div><b>'+shift.correct+'</b><br>Correct</div><div><b>'+shift.mistakes+'</b><br>Corrections</div></div></section><section class="card"><h2>Pickup Counter</h2><p>Match the customer/order number to every item before handoff.</p>'+(cards||'<div class="notice">No completed kitchen orders are waiting right now.</div>')+'</section>';
 if(scroll)window.scrollTo(0,0);
}
function verifyPickup(id){
 let o=PS.getOrder(id);if(!o)return;
 let items=(o.items||[]).map((x,i)=>({x,i}));let correct=Math.random()<.78?id:(pickupOrders().find(x=>x.id!==id)||{id:id+1}).id;
 app.innerHTML='<section class="card"><span class="badge">ORDER CHECK</span><h1>Bag / Box #'+id+'</h1><p>Items in this order:</p><div class="pickupItems">'+items.map(a=>'<span>'+esc(a.x.name)+'</span>').join('')+'</div><h3>Which customer/order gets this food?</h3><div class="makegrid">'+[id,correct,id+2].filter((v,i,a)=>a.indexOf(v)===i).sort(()=>Math.random()-.5).map(n=>'<button class="btn white" onclick="handoffPickup('+id+','+n+')">ORDER #'+n+'</button>').join('')+'</div></section>';
}
function handoffPickup(id,chosen){
 if(Number(id)!==Number(chosen)){shift.mistakes++;app.innerHTML='<section class="card"><div class="notice"><h2>Stop — wrong order number.</h2><p>Recheck the receipt and food before handing it out.</p></div><button class="btn green" onclick="renderPickup()">RECHECK ORDER</button></section>';return}
 let o=PS.getOrder(id);if(!o)return;o.pickup={status:'HANDED OUT',employee:PS.residentName(),at:Date.now()};let patch={pickup:o.pickup};if(o.source!=='customer-counter'){patch.completed=true;patch.status='COMPLETED';patch.completedAt=Date.now()}PS.patchOrder(id,patch);shift.completed++;shift.correct++;shift.service++;renderPickup();
}
const CLEAN_STEPS=['SCRAPE FOOD','WASH WITH SOAP','RINSE','SANITIZE','AIR DRY','STORE CLEAN ITEMS'];
let cleanRound=null;
function startCleanup(){newCleanRound();if(shiftTimer)clearInterval(shiftTimer);shiftTimer=setInterval(()=>{if(shiftClock().left<=0)clockOutPrompt();else renderCleanup(false)},900)}
function newCleanRound(){cleanRound={step:0,spill:Math.random()<.25,washedHands:false};renderCleanup()}
function renderCleanup(scroll=true){
 let t=shiftClock(),s=cleanRound.step;
 app.innerHTML='<section class="card"><span class="badge">DISHWASHER / CLEANUP • CLOCKED IN</span><div class="clock">'+t.time+'</div><div class="shiftbar"><i style="width:'+t.pct+'%"></i></div><div class="statgrid"><div><b>'+shift.completed+'</b><br>Racks</div><div><b>'+shift.safety+'</b><br>Safety</div><div><b>'+shift.mistakes+'</b><br>Corrections</div></div></section><section class="card cleanupGame"><h2>Dirty Dish Rack</h2>'+(cleanRound.spill?'<div class="spillAlert">⚠️ A drink spilled near the work area.</div><button class="btn red" onclick="cleanSpill()">CLEAN & MARK WET FLOOR</button>':'')+'<p>Complete sanitation in the correct order.</p><div class="cleanSteps">'+CLEAN_STEPS.map((x,i)=>'<button class="btn '+(i<s?'green':'white')+'" onclick="cleanAction('+i+')">'+(i<s?'✓ ':'')+x+'</button>').join('')+'</div>'+(s>=CLEAN_STEPS.length?'<button class="btn green" onclick="finishCleanRack()">FINISH RACK</button>':'')+'</section>';
 if(scroll)window.scrollTo(0,0);
}
function cleanSpill(){cleanRound.spill=false;shift.safety++;shift.correct++;renderCleanup(false)}
function cleanAction(i){
 if(i!==cleanRound.step){shift.mistakes++;renderCleanup(false);return}
 cleanRound.step++;shift.correct++;if(i===3)shift.safety++;renderCleanup(false);
}
function finishCleanRack(){
 if(cleanRound.step<CLEAN_STEPS.length||cleanRound.spill){shift.mistakes++;renderCleanup(false);return}
 shift.completed++;shift.cleanliness++;shift.correct++;newCleanRound();
}

function clockOut(){
 let input=document.getElementById('pin');if(!input||input.value!==empPin()){let m=document.getElementById('pinmsg');if(m)m.innerHTML='<span class="notice">Incorrect PIN.</span>';return}
 let preview=isKayla(),w=PS.world(),e=employment(w),wage=Number(e&&e.wage||12),gross=Math.round(wage*WORK_HOURS*100)/100;
 let report={business:'Transition Town Pizza Shop',employee:PS.residentName(),position:shift.role,clockIn:'8:00 AM',clockOut:'4:00 PM',hours:8,ordersCompleted:shift.completed,correctSteps:shift.correct,corrections:shift.mistakes,customerService:shift.service||0,foodSafety:shift.safety||0,cleanliness:shift.cleanliness||0,gross,preview,date:new Date().toISOString()};
 w.employeeShiftReports=w.employeeShiftReports||[];w.employeeShiftReports.push(report);
 if(!preview){let r=resident(w);if(r){r.checking=Math.round((Number(r.checking||0)+gross)*100)/100;r.employment=r.employment||{};r.employment.pizza=r.employment.pizza||e||{};r.employment.pizza.shifts=r.employment.pizza.shifts||[];r.employment.pizza.shifts.push(report)}}
 PS.saveWorld(w);
 app.innerHTML='<section class="card"><div class="good"><h1>Clocked Out at 4:00 PM</h1><p>Timecard: 8:00 AM–4:00 PM • 8.0 simulated hours</p></div><div class="statgrid"><div><b>'+shift.completed+'</b><br>Completed</div><div><b>'+shift.correct+'</b><br>Correct</div><div><b>'+shift.mistakes+'</b><br>Corrections</div></div><p><b>Gross pay:</b> $'+gross.toFixed(2)+(preview?' — Manager/Test Mode, not deposited.':' — added to Transition Town checking.')+'</p><button class="btn green" onclick="landing()">EMPLOYEE CENTER</button></section>';
}

function application(){
 app.innerHTML='<section class="card"><span class="badge">NOW HIRING</span><h1>Pizza Shop Employment Application</h1><p>Practice application. Do not enter real private financial information.</p><form onsubmit="submitApplication(event)"><div class="appgrid"><label>Name<input class="field" name="name" required value="'+esc(PS.residentName())+'"></label><label>Position<select class="field" name="position"><option>Cashier / Order Taker</option><option>Pizza Maker / Kitchen</option><option>Dishwasher / Cleanup</option><option>Order Pickup / Counter</option><option>Restaurant Crew - Any Station</option></select></label><label>Desired Hours<input class="field" name="hours" type="number" min="1" max="40"></label><label>Can you arrive on time?<select class="field" name="attendance"><option>Yes</option><option>No</option></select></label></div><label>Why would you be a good Pizza Shop employee?<textarea class="field" name="why" rows="3" required></textarea></label><label>A restaurant gets busy and several orders arrive at once. What should you do?<textarea class="field" name="busy" rows="3" required></textarea></label><label>What should you do before handling food or clean dishes?<textarea class="field" name="sanitation" rows="3" required></textarea></label><button class="btn red" type="submit">SUBMIT TO MISS KAYLA</button> <button class="btn white" type="button" onclick="landing()">Back</button></form></section>';
}

function startKitchen(){
 localStorage.ttPizzaKitchenUntil=String(Date.now()+REAL_SHIFT*1000);
 ensureRush();renderKitchen();
 if(shiftTimer)clearInterval(shiftTimer);
 shiftTimer=setInterval(()=>{let t=shiftClock();if(t.left<=0)return clockOutPrompt();renderKitchen(false)},700);
}
