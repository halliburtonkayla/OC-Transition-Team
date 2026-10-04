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
  let count=level===1?0:level===2?1:level===3?2:3;
  for(let i=0;i<count;i++){let t=pick(pool.filter(x=>!mods[x]));let m=pick(['No','Light','Extra','Add']);mods[t]=m;phrases.push(m.toLowerCase()+' '+t.toLowerCase())}
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
  cashierGame.stage='listen';renderCashier();setTimeout(()=>replayCustomer(),350);
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
  let t=shiftClock(),e=cashierGame.entry;
  app.innerHTML=`<section class="card"><span class="badge">CASHIER • CLOCKED IN</span><div id="cashClock" class="clock">${t.time}</div><div class="shiftbar"><i id="cashBar" style="width:${t.pct}%"></i></div><div class="statgrid"><div><b>${shift.completed}</b><br>Customers</div><div><b>${shift.correct}</b><br>Correct</div><div><b>${shift.mistakes}</b><br>Corrections</div></div></section>${cashierScene()}<section class="card"><h2>Listen to the Customer</h2><p>The complete order is not written on the screen. Listen, then enter it into the POS.</p><button class="btn green" onclick="replayCustomer()">🔊 REPLAY CUSTOMER AUDIO</button><div id="customerReply"></div></section><section class="card pos"><h2>POS Register</h2>${posGroup('SIZE',['Personal','Small','Medium','Large','Extra Large'],'size',e.size)}${posGroup('CRUST',['Hand Tossed','Thin Crust','Pan','Stuffed Crust'],'crust',e.crust)}${posGroup('PIZZA',['Cheese','Pepperoni','Sausage','Meat Lovers','Supreme','Veggie','Hawaiian','BBQ Chicken','Buffalo Chicken'],'pizza',e.pizza)}${posGroup('SAUCE',['Light','Regular','Extra'],'sauce',e.sauce)}<h3>TOPPINGS / MODIFIERS</h3><div class="posMods">${['Pepperoni','Sausage','Ham','Bacon','Chicken','Mushrooms','Onions','Green Peppers','Black Olives','Jalapeños','Pineapple','Tomatoes','Extra Cheese'].map(x=>`<label>${x}<select onchange="cashMod('${x}',this.value)"><option>Regular</option><option>No</option><option>Light</option><option>Extra</option><option>Add</option></select></label>`).join('')}</div>${posGroup('SIDE',['None','Breadsticks','Cheese Sticks','6 Wings','12 Wings'],'side',e.side||'None')}${posGroup('DIPPING SAUCE',['None','Ranch','Garlic Butter','Marinara','Buffalo','BBQ'],'sauceDip',e.sauceDip||'None')}${posGroup('DRINK',['None','Cola','Diet Cola','Lemon-Lime','Root Beer','Fruit Punch','Iced Tea'],'drinkName',e.drink&&e.drink.name||'None')}${posGroup('DRINK SIZE',['Small','Medium','Large'],'drinkSize',e.drink&&e.drink.size||'Medium')}${posGroup('DESSERT',['None','Cinnamon Bites','Chocolate Brownie'],'dessert',e.dessert||'None')}<div class="bigbuttons"><button class="btn green" onclick="readBackOrder()">READ BACK ORDER</button><button class="btn white" onclick="replayCustomer()">REPLAY AUDIO</button></div></section>`;
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
  let ok=cashierMatches();if(!ok){shift.mistakes++;document.getElementById('customerReply').innerHTML='<div class="notice"><b>Customer:</b> “Something in that read-back isn’t what I ordered. Can you listen again?”</div>';return}
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
