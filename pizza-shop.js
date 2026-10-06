'use strict';
const app=document.getElementById('app'),PS=PizzaShop,M=PS.menu;
let statusTimer=null,currentOrderId=null,builder=null,meal=null;

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function pizzaEmployment(){let n=PS.residentName(),w=PS.world(),r=w.residents&&w.residents[n],e=r&&r.employment&&r.employment.pizza;return e&&e.active!==false?e:null}
function canUseEmployeeEntrance(){return /kayla/i.test(PS.residentName())||!!pizzaEmployment()}
function syncEmploymentAction(){let b=document.getElementById('employmentAction');if(!b)return;let hired=canUseEmployeeEntrance();b.textContent=hired?'Employee Entrance':'Apply Now';b.className=hired?'employee':'employee apply';b.hidden=!!document.querySelector('.storefront')}
function openEmployee(){let n=PS.residentName();if(n&&n!=='Guest'){localStorage.ttCurrent=n;sessionStorage.ttCurrent=n}location.href='pizza-employee.html'+(/kayla/i.test(n)?'?manager=1':'')}
function applyNow(){let n=PS.residentName();if(n&&n!=='Guest'){localStorage.ttCurrent=n;sessionStorage.ttCurrent=n}location.href='pizza-employee.html#apply'}
function employmentAction(){canUseEmployeeEntrance()?openEmployee():applyNow()}
function clearTimers(){if(statusTimer){clearInterval(statusTimer);statusTimer=null}}
function title(s){return String(s).replace(/\b\w/g,m=>m.toUpperCase())}
function money(v){return PS.money(v)}

function storefront(){
 clearTimers();let hired=canUseEmployeeEntrance();
 app.innerHTML=`<section class="storefront approvedStorefront" aria-label="Transition Town Pizza Shop storefront"><img class="storefrontImage" src="00_Pizza_Shop_Storefront.png" alt="The original Transition Town Pizza Shop, with its red and white awning and glass entrance" width="1312" height="1199"><div class="storefrontEntrances"><button class="customerBtn" onclick="enterRestaurant()">ENTER AS CUSTOMER</button><button class="employeeBtn" onclick="employmentAction()">${hired?'EMPLOYEE ENTRANCE':'APPLY NOW'}</button></div></section><section class="card"><span class="badge">Transition Town Business</span><h1>Welcome, ${esc(PS.residentName())}!</h1><p>${hired?'Enter as a customer or use your employee entrance.':'Walk up to the counter to order. Interested in working here? Tap Apply Now.'}</p></section>`;
 syncEmploymentAction();window.scrollTo(0,0);
}

function enterRestaurant(){
 const b=document.getElementById('employmentAction');if(b)b.hidden=false;
 builder={size:'Medium',crust:'Hand Tossed',pizza:'Cheese',sauce:'Regular',mods:{},items:[],drink:null};
 renderOrder('size');
}
function optionButtons(options,selected,handler){
 return '<div class="optionGrid compact">'+options.map(item=>{const value=Array.isArray(item)?item[0]:item;const label=esc(value);const price=Array.isArray(item)?' • '+money(item[1]):'';return '<button class="option '+(selected===value?'selected':'')+'" onclick="'+handler+'(\''+String(value).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')">'+label+price+'</button>'}).join('')+'</div>';
}
function stepNav(step){
 const steps=[['size','Size'],['crust','Crust'],['pizza','Pizza'],['customize','Toppings'],['sides','Sides'],['drink','Drink'],['review','Review']];
 return '<div class="orderSteps" aria-label="Order progress">'+steps.map(([key,label],i)=>'<span class="'+(key===step?'current':steps.findIndex(s=>s[0]===step)>i?'done':'')+'">'+(i+1)+'. '+label+'</span>').join('')+'</div>';
}
function applyPreset(){builder.mods={};builder.sauce=M.pizzas[builder.pizza].sauce||'Regular'}

function approvedScene(file,alt,fallback){
 return '<div class="approvedPizzaScene"><img class="approvedPizzaImg" src="'+file+'" alt="'+alt+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><div class="approvedFallback" style="display:none">'+fallback+'</div></div>';
}
function counterScene(){
 return approvedScene('01_Customer_Counter_POV.png','Transition Town Pizza Shop customer counter',
  '<div class="counterScene"><div class="menuBoards"><span>TRANSITION TOWN PIZZA</span><span>PIZZAS • SIDES • DRINKS</span><span>ORDER HERE</span></div><div class="counterPeople"><div class="cashierAvatar"><div class="head"></div><div class="shirt">PIZZA<br>SHOP</div></div><div class="register">POS</div><div class="ovenGlow">HOT<br>KITCHEN</div></div></div>');
}
function waitingScene(){
 return approvedScene('03_Customer_Table_POV.png','Transition Town Pizza Shop customer table',
  '<div class="tableScene"><div class="tv">TRANSITION TOWN SPORTS</div><div class="tables"><div class="table"><div class="phone">PHONE</div></div></div></div>');
}
function renderOrder(step){
 let body='';
 if(step==='size')body=`<h2>1. Choose Pizza Size</h2>${optionButtons(M.sizes,builder.size,'chooseSize')}`;
 if(step==='crust')body=`<h2>2. Choose Crust</h2>${optionButtons(M.crusts,builder.crust,'chooseCrust')}`;
 if(step==='pizza')body=`<h2>3. Choose Pizza</h2>${optionButtons(Object.keys(M.pizzas).map(x=>x==='Custom Pizza'?'Build Your Own':x),builder.pizza==='Custom Pizza'?'Build Your Own':builder.pizza,'choosePizza')}`;
 if(step==='customize')body=customizePanel();
 if(step==='sides')body=extrasPanel();
 if(step==='drink')body=drinkPanel();
 if(step==='review')body=reviewPanel();
 app.innerHTML=`${counterScene()}<section class="card orderPanel"><span class="badge">AT THE FRONT COUNTER</span>${stepNav(step)}${body}</section>`;
 window.scrollTo(0,Math.max(0,document.querySelector('.orderPanel').offsetTop-70));
}
function chooseSize(v){builder.size=v;renderOrder('crust')}
function chooseCrust(v){builder.crust=v;renderOrder('pizza')}
function choosePizza(v){builder.pizza=v==='Build Your Own'?'Custom Pizza':v;applyPreset();renderOrder('customize')}
function setMod(name,v){if(v==='REGULAR')builder.mods[name]='Regular';else builder.mods[name]=title(v.toLowerCase())}
function setSauce(v){builder.sauce=title(v.toLowerCase())}
function customizePanel(){
 let modOpts=['NO','LIGHT','REGULAR','EXTRA','ADD'];
 return `<h2>4. Customize</h2><p class="muted">Tap the modifier beside each topping. Leave it on REGULAR when no change is needed.</p>
 <div class="modifierRow"><b>Sauce</b><select onchange="setSauce(this.value)">${['LIGHT','REGULAR','EXTRA'].map(o=>`<option ${o.toLowerCase()===builder.sauce.toLowerCase()?'selected':''}>${o}</option>`).join('')}</select></div>
 ${M.toppings.map(t=>{let val=(builder.mods[t]||'Regular').toUpperCase();return `<div class="modifierRow"><b>${esc(t)}</b><select onchange="setMod('${esc(t).replace(/'/g,"\\'")}',this.value)">${modOpts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}</select></div>`}).join('')}
 <div class="stepActions"><button class="primary" onclick="commitPizza()">ADD THIS PIZZA & CONTINUE</button><button class="secondary" onclick="renderOrder('pizza')">Back</button></div>`;
}
function pizzaPrice(){
 let size=M.sizes.find(x=>x[0]===builder.size)[1],crust=M.crusts.find(x=>x[0]===builder.crust)[1],p=M.pizzas[builder.pizza],extra=0;
 Object.entries(builder.mods).forEach(([k,v])=>{let included=(p.toppings||[]).map(title).includes(k);if(v==='Add'&&!included)extra+=1.35;if(v==='Extra')extra+=1.15});
 return Math.round((size+crust+p.base+extra)*100)/100;
}
function pizzaDescription(){
 let mods=Object.entries(builder.mods).filter(([k,v])=>v!=='Regular').map(([k,v])=>v+' '+k);if(builder.sauce!=='Regular')mods.push(/sauce$/i.test(builder.sauce)?builder.sauce:builder.sauce+' Sauce');
 return `${builder.size} ${builder.crust} ${builder.pizza==='Custom Pizza'?'Build Your Own':builder.pizza}${mods.length?' • '+mods.join(', '):''}`;
}
function commitPizza(){
 let existing=builder.items.findIndex(x=>x.type==='pizza');
 let item={type:'pizza',name:pizzaDescription(),price:pizzaPrice(),details:{size:builder.size,crust:builder.crust,pizza:builder.pizza,modifiers:Object.assign({},builder.mods),sauce:builder.sauce}};
 if(existing>=0)builder.items[existing]=item;else builder.items.unshift(item);renderOrder('sides');
}
function addExtra(type,name,price){builder.items.push({type,name,price:Number(price)});renderOrder('sides')}
function extrasPanel(){
 let group=(label,arr,type)=>`<h3>${label}</h3><div class="optionGrid compact">${arr.map(x=>`<button class="option" onclick="addExtra('${type}','${esc(x[0]).replace(/'/g,"\\'")}',${x[1]})"><b>${esc(x[0])}</b><br><small>${money(x[1])} • ADD</small></button>`).join('')}</div>`;
 return `<h2>5. Sides</h2>${group('Breadsticks • Cheese Sticks • Wings • Desserts',M.sides,'side')}${group('Dipping Sauces',M.sauces,'sauce')}<div class="stepActions"><button class="primary" onclick="renderOrder('drink')">CONTINUE TO DRINK</button><button class="secondary" onclick="renderOrder('customize')">Back</button></div>`;
}
const drinkTypes=['Cola','Diet Cola','Lemon-Lime','Root Beer','Fruit Punch','Iced Tea','Bottled Water'];
function chooseDrinkType(v){builder.drink=builder.drink||{};builder.drink.name=v;renderOrder('drink')}
function chooseDrinkSize(v){builder.drink=builder.drink||{};builder.drink.size=v;renderOrder('drink')}
function commitDrink(){if(!builder.drink||!builder.drink.name)return renderOrder('review');let size=builder.drink.size||'Medium',price=size==='Small'?2.29:size==='Large'?3.29:2.79;if(builder.drink.name==='Bottled Water')price=1.99;let idx=builder.items.findIndex(x=>x.type==='drink');let item={type:'drink',name:(builder.drink.name==='Bottled Water'?'':size+' ')+builder.drink.name,price};if(idx>=0)builder.items[idx]=item;else builder.items.push(item);renderOrder('review')}
function drinkPanel(){
 let d=builder.drink||{};
 return `<h2>6. Drink</h2><p class="muted">A drink is optional.</p><h3>Choose Drink</h3>${optionButtons(drinkTypes,d.name||'','chooseDrinkType')}<h3>Choose Size</h3>${optionButtons(['Small','Medium','Large'],d.size||'Medium','chooseDrinkSize')}<div class="stepActions"><button class="primary" onclick="commitDrink()">ADD DRINK & REVIEW</button><button class="secondary" onclick="renderOrder('review')">NO DRINK</button><button class="secondary" onclick="renderOrder('sides')">Back</button></div>`;
}
function removeItem(i){builder.items.splice(i,1);renderOrder('review')}
function reviewPanel(){
 let total=builder.items.reduce((a,x)=>a+Number(x.price||0),0);
 return `<h2>7. Review Order</h2>${builder.items.length?`<div class="orderCart">${builder.items.map((x,i)=>`<div class="cartrow"><span><b>${esc(x.name)}</b><br><small>${esc(x.type)}</small></span><span>${money(x.price)}<br><button class="mini" onclick="removeItem(${i})">Remove</button></span></div>`).join('')}<p class="total">TOTAL: ${money(total)}</p></div>`:'<div class="notice">Your order is empty.</div>'}<div class="bigchoice"><button class="secondary" onclick="renderOrder('size')">CHANGE ORDER</button><button class="primary" ${builder.items.length?'':'disabled'} onclick="submitOrder()">PLACE ORDER</button></div><p class="muted">Payment is due when you pick up your completed order.</p>`;
}
function submitOrder(){
 if(!builder.items.length)return;
 let order={resident:PS.residentName(),items:builder.items,total:Math.round(builder.items.reduce((a,x)=>a+Number(x.price||0),0)*100)/100,paymentStatus:'UNPAID',source:'customer-counter',queue:'kitchen',kitchen:{tickets:builder.items.filter(x=>x.type==='pizza'||x.type==='side').map((x,i)=>({ticket:i+1,orderItem:x,status:'QUEUED'}))}};
 let saved=PS.addOrder(order);currentOrderId=saved.id;localStorage.ttPizzaActiveOrder=String(saved.id);waitingRoom();
}
const statuses=['ORDER RECEIVED','PREPARING','IN THE OVEN','FINISHING YOUR ORDER','READY FOR PICKUP'];
function gameStatus(o){
 if(o.completed)return 'COMPLETED';
 if(o.kitchenClaimed||Number(localStorage.ttPizzaKitchenUntil||0)>Date.now())return o.status||'ORDER RECEIVED';
 let tickets=o.kitchen&&o.kitchen.tickets||[];
 if(tickets.some(t=>t.status&&t.status!=='QUEUED'))return o.status||'PREPARING';
 let e=(Date.now()-Number(o.createdAt||Date.now()))/1000;
 if(e>=20)return 'READY FOR PICKUP';if(e>=15)return 'FINISHING YOUR ORDER';if(e>=9)return 'IN THE OVEN';if(e>=3)return 'PREPARING';return 'ORDER RECEIVED';
}
function syncGameStatus(){
 let o=PS.getOrder(currentOrderId);if(!o)return null;let s=gameStatus(o);if(o.status!==s)o=PS.patchOrder(o.id,{status:s,readyAt:s==='READY FOR PICKUP'?(o.readyAt||Date.now()):o.readyAt});return o;
}
function waitingRoom(){
 clearTimers();renderWaiting();
 statusTimer=setInterval(()=>{let before=PS.getOrder(currentOrderId),was=before&&before.status,o=syncGameStatus();if(!o)return;if(o.status==='READY FOR PICKUP'&&was!=='READY FOR PICKUP'){showReadyNotification(o)}renderWaiting(false)},800);
}
function waitingVisual(){
 return `<section class="waitingScene"><div class="waitKitchen"><b>OPEN KITCHEN</b><span>Pizza makers are working on orders.</span></div><div class="pickupWindow">ORDER PICKUP</div><div class="booth"></div><div class="waitTable"><div class="tableCircle"></div></div></section>`;
}
function renderWaiting(scroll=true){
 let o=syncGameStatus();if(!o)return storefront();let idx=statuses.indexOf(o.status);
 app.innerHTML=`${waitingScene()}<section class="card"><span class="badge">ORDER IN PROGRESS</span><div class="orderNum">ORDER #${o.id}</div><div class="statusTrack">${statuses.map((s,i)=>`<div class="statusStep ${i<idx?'done':i===idx?'current':''}">${s}</div>`).join('')}</div><div class="good"><b>${esc(o.status)}</b></div>${o.status==='READY FOR PICKUP'?'<p><button class="primary" onclick="pickupCounter()">PICK UP MY PIZZA</button></p>':`<div class="waitActions"><button class="secondary" onclick="lookAtKitchen()">LOOK AT KITCHEN</button><button class="secondary" onclick="lookAtMenu()">LOOK AT MENU</button><button class="secondary" onclick="renderWaiting()">CHECK ORDER</button></div><p class="muted">Have a seat. Your phone will let you know when the order is ready.</p>`}</section>`;
 if(scroll)window.scrollTo(0,0);
}
function lookAtKitchen(){app.innerHTML=`${approvedScene('04_Pizza_Maker_Kitchen.png','Pizza makers working in the approved Pizza Shop kitchen','<p>The kitchen picture could not load. Please refresh.</p>')}<section class="card"><h2>Open Kitchen</h2><p>You can see pizza makers topping pizzas and moving orders toward the ovens.</p><button class="primary" onclick="renderWaiting()">Back to My Order</button></section>`}
function lookAtMenu(){app.innerHTML=`${counterScene()}<section class="card"><h2>Menu Boards</h2><p>Pizza • Wings • Breadsticks • Desserts • Drinks</p><button class="primary" onclick="renderWaiting()">Back to My Order</button></section>`}
function readyChime(){try{let A=window.AudioContext||window.webkitAudioContext,ctx=new A(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.value=.05;o.start();o.stop(ctx.currentTime+.18)}catch(e){}if(navigator.vibrate)navigator.vibrate([100,60,100])}
function showReadyNotification(o){
 let n=document.getElementById('phoneNotice');n.innerHTML=`<div class="phoneHead"><b>TRANSITION TOWN PIZZA SHOP</b><span>now</span></div><div class="phoneTitle">🍕 Order #${o.id} is ready!</div><div class="phoneBody">Please come to the pickup counter.</div><button class="notifyBtn" onclick="pickupCounter()">PICK UP MY PIZZA</button>`;n.classList.add('show');readyChime();setTimeout(()=>n.classList.remove('show'),9000);
}
function pickupCounter(){
 clearTimers();let o=PS.getOrder(currentOrderId);if(!o)return storefront();
 app.innerHTML=`${counterScene()}<section class="card pickupCard"><span class="badge">PICKUP COUNTER</span><h1>Order #${o.id}</h1><div class="foodPreview">🍕</div><div class="orderCart">${o.items.map(x=>`<div class="cartrow"><span>${esc(x.name)}</span><b>${money(x.price)}</b></div>`).join('')}<p class="total">TOTAL DUE: ${money(o.total)}</p></div><h2>Pay at Pickup</h2><div class="payGrid"><button class="primary" onclick="cashPayment()">CASH</button><button class="primary" onclick="cardPayment()">DEBIT / CARD</button></div></section>`;window.scrollTo(0,document.querySelector('.pickupCard').offsetTop-60);
}
function cashPayment(){
 let o=PS.getOrder(currentOrderId),t=[10,20,50,100].filter(v=>v>=o.total);if(!t.length)t=[100];
 app.innerHTML=`<section class="card"><span class="badge">CASH PAYMENT</span><h1>Total: ${money(o.total)}</h1><p>Choose the amount you hand to the cashier.</p><div class="cashChoices">${t.map(v=>`<button class="primary" onclick="cashTender(${v})">$${v}</button>`).join('')}</div><button class="secondary" onclick="pickupCounter()">Back</button></section>`;
}
function cashTender(v){
 let o=PS.getOrder(currentOrderId),change=Math.round((v-o.total)*100)/100;
 app.innerHTML=`<section class="card"><span class="badge">PRACTICE YOUR CHANGE</span><h1>You paid $${v.toFixed(2)}</h1><p>Total: <b>${money(o.total)}</b></p><label><b>How much change should you receive?</b><input id="changeAnswer" class="field" inputmode="decimal" placeholder="Example: 6.75"></label><p id="changeMsg"></p><button class="primary" onclick="checkChange(${v},${change})">CHECK MY ANSWER</button></section>`;
}
function checkChange(tender,change){let ans=Number(document.getElementById('changeAnswer').value),m=document.getElementById('changeMsg');if(Math.abs(ans-change)>.009){m.className='notice';m.textContent='Try again. Subtract the total from the cash you gave the cashier.';return}m.className='good';m.textContent='Correct! Change: '+money(change);setTimeout(()=>completePayment('Cash',{tender,change}),650)}
function cardPayment(){app.innerHTML=`<section class="card"><span class="badge">CARD TERMINAL</span><h1>Debit / Card</h1><p>Tap the practice terminal to pay.</p><button class="primary" onclick="completePayment('Debit / Card',{})">TAP / INSERT CARD</button> <button class="secondary" onclick="pickupCounter()">Back</button></section>`}
function completePayment(method,details){
 let o=PS.getOrder(currentOrderId);if(!o||o.resident!==PS.residentName())return alert('Open your own order first.');if(o.paymentStatus==='PAID')return orderReadyActions(o);let w=PS.world(),r=w.residents&&w.residents[o.resident];let lifePayment=!!r?.life;
 if((method==='Debit / Card'||lifePayment)&&r&&Number(r.checking||0)<o.total){app.innerHTML='<section class="card"><div class="notice"><b>Card declined.</b> There is not enough money in Transition Town checking.</div><button class="primary" onclick="pickupCounter()">Choose Another Payment</button></section>';return}
 if((method==='Debit / Card'||lifePayment)&&r){r.checking=Math.round((Number(r.checking||0)-o.total)*100)/100;r.history=r.history||[];r.history.push('Pizza Shop purchase -'+money(o.total)+' — Order #'+o.id);if(r.life){r.life.meals.push({id:'pizza-'+o.id,name:'Pizza Shop order #'+o.id,hunger:45});r.life.actions.push({receipt:'pizza-'+o.id,type:'restaurant'});}Object.assign(w.pizzaOrders.find(x=>x.id===o.id),{paymentStatus:'PAID',paymentMethod:method,paymentDetails:details,paidAt:Date.now()});PS.saveWorld(w)}
 o=PS.patchOrder(currentOrderId,{paymentStatus:'PAID',paymentMethod:method,paymentDetails:details,paidAt:Date.now()});orderReadyActions(o);
}
function orderReadyActions(o){
 app.innerHTML=`<section class="card"><div class="good"><b>Payment complete.</b> The employee places Order #${o.id} on the pickup counter.</div><div class="foodPreview">🍕</div><div class="bigchoice"><button class="primary" onclick="takeOrder()">TAKE MY ORDER</button><button class="secondary" onclick="viewReceipt()">VIEW RECEIPT</button></div></section>`;
}
function viewReceipt(){
 let o=PS.getOrder(currentOrderId);app.innerHTML=`<section class="card"><div class="receipt"><h2>TRANSITION TOWN PIZZA SHOP</h2><p>ORDER #${o.id}</p><hr>${o.items.map(x=>`<div class="cartrow"><span>${esc(x.name)}</span><span>${money(x.price)}</span></div>`).join('')}<p><b>TOTAL ${money(o.total)}</b></p><p>PAID: ${esc(o.paymentMethod)}</p></div><button class="primary" onclick="takeOrder()">TAKE MY ORDER</button></section>`;
}
const problems=[
 {type:'hair',title:'You notice a hair on your pizza.',line:"Excuse me, there’s a hair in my pizza. Could I please have it remade?",foodSafety:true},
 {type:'wrongTopping',title:'There is a topping on your pizza that you did not order.',line:"Excuse me, this isn’t what I ordered. Could you please fix it?"},
 {type:'missingTopping',title:'A topping you ordered is missing.',line:"Excuse me, my pizza is missing a topping I ordered. Could you please fix it?"},
 {type:'wrongPizza',title:'This is the wrong pizza.',line:"Excuse me, this isn’t what I ordered."},
 {type:'burned',title:'Your pizza is badly burned.',line:"Excuse me, my pizza is burned. Could I please have it remade?"},
 {type:'undercooked',title:'The center of your pizza looks undercooked.',line:"Excuse me, this pizza looks undercooked. Could I please have it remade?",foodSafety:true},
 {type:'cold',title:'Your pizza is cold.',line:"Excuse me, my pizza is cold. Could you please replace it?"},
 {type:'missingSide',title:'One of your sides is missing.',line:"Excuse me, I’m missing part of my order."},
 {type:'wrongDrink',title:'You received the wrong drink.',line:"Excuse me, I received the wrong drink. Could I please get the one I ordered?"}
];
function chooseProblem(){
 if(Math.random()>.28)return null;let available=problems.filter(p=>{let o=PS.getOrder(currentOrderId);if(p.type==='missingSide')return o.items.some(x=>x.type==='side'||x.type==='sauce');if(p.type==='wrongDrink')return o.items.some(x=>x.type==='drink');return o.items.some(x=>x.type==='pizza')});return available.length?available[Math.floor(Math.random()*available.length)]:null;
}
function takeOrder(){
 let o=PS.getOrder(currentOrderId);if(!o||o.resident!==PS.residentName())return alert('Open your own order first.');meal={problem:chooseProblem(),problemFixed:false,slices:8,drink:o.items.some(x=>x.type==='drink')?5:0,sauce:o.items.some(x=>x.type==='sauce'),napkin:false};inspectFood();
}
function inspectFood(){
 let p=meal.problem;
 app.innerHTML=`<section class="card"><span class="badge">CHECK YOUR ORDER</span><h1>Inspect your food before eating.</h1><div class="pizzaGame previewPizza"><div class="pizzaWhole">🍕</div></div>${p?`<div class="problem"><h2>${esc(p.title)}</h2><p>What do you want to do?</p><div class="problemChoices"><button class="primary" onclick="problemChoice('return')">TAKE IT BACK TO THE COUNTER</button><button class="secondary" onclick="problemChoice('dont')">DO NOT EAT IT</button><button class="danger" onclick="problemChoice('ignore')">IGNORE IT AND KEEP EATING</button></div></div>`:`<div class="good"><b>Everything looks correct!</b> Your order is ready to eat.</div><p><button class="primary" onclick="startEating()">GO EAT</button></p>`}</section>`;
}
function problemChoice(choice){
 let p=meal.problem;
 if(choice==='return')return complaintCounter();
 if(choice==='dont'){app.innerHTML=`<section class="card"><div class="good"><b>Good choice.</b> If food seems unsafe or wrong, you do not have to eat it.</div><button class="primary" onclick="complaintCounter()">TAKE IT TO THE COUNTER</button></section>`;return}
 if(choice==='ignore'){let msg=p.foodSafety?'Eating food that may be contaminated or undercooked can make you sick. A safer choice is to stop and speak with the restaurant.':'You can politely speak up when an order is wrong. You paid for the order you requested.';app.innerHTML=`<section class="card"><div class="notice"><b>Think about your choice.</b><p>${msg}</p></div><button class="primary" onclick="complaintCounter()">SPEAK TO THE EMPLOYEE</button><button class="secondary" onclick="startEating()">KEEP IT ANYWAY</button></section>`}
}
function complaintCounter(){
 let p=meal.problem;
 let wrong=["Hey! You messed up my food!","Excuse me, "+(p.type==='cold'?'my pizza is cold.':p.type==='missingSide'?"I’m missing part of my order.":"this isn’t what I ordered.")+" Could you please help me?",p.line];
 app.innerHTML=`${counterScene()}<section class="card"><span class="badge">BACK AT THE COUNTER</span><h2>What will you say?</h2><div class="speechChoices">${wrong.map((x,i)=>`<button class="${i===0?'danger':'primary'}" onclick="sayComplaint(${i})">“${esc(x)}”</button>`).join('')}</div></section>`;
}
function sayComplaint(i){
 if(i===0){app.innerHTML+=`<section class="card notice"><b>The employee wants to help.</b> Try explaining the problem calmly and respectfully.<br><button class="primary" onclick="complaintCounter()">TRY AGAIN</button></section>`;return}
 let p=meal.problem,remake=!['missingSide','wrongDrink'].includes(p.type);
 app.innerHTML=`${counterScene()}<section class="card"><div class="good"><b>Employee:</b> “I’m sorry about that. Thank you for letting me know. ${remake?'We’ll remake that for you right away.':'I’ll get the correct item for you right now.'}”</div><p>${p.foodSafety?'The contaminated/unsafe food is replaced rather than simply removing the problem.':''}</p><button class="primary" onclick="fixedOrder()">WAIT FOR THE FIX</button></section>`;
}
function fixedOrder(){meal.problemFixed=true;meal.problem=null;app.innerHTML=`<section class="card"><div class="good"><h2>Your corrected order is ready.</h2><p>Thank you for waiting patiently.</p></div><button class="primary" onclick="startEating()">GO EAT</button></section>`}
function pizzaVisual(){
 let n=meal.slices,out='';for(let i=0;i<8;i++)out+=`<button class="slice ${i<n?'':'eaten'}" ${i<n?'onclick="eatSlice()"':''}>🍕</button>`;return out;
}
function startEating(){
 app.innerHTML=`<section class="card eatingCard"><span class="badge">MEAL TIME</span><h1>Tap the pizza to eat it.</h1><div id="pizzaPlate" class="pizzaPlate">${pizzaVisual()}</div><p id="eatMessage">${meal.slices} slices left.</p><div class="mealControls">${meal.drink?'<button class="secondary" onclick="takeDrink()">🥤 TAKE A DRINK</button>':''}<button class="secondary" onclick="useNapkin()">USE NAPKIN</button>${meal.sauce?'<button class="secondary" onclick="dipSauce()">DIP IN SAUCE</button>':''}</div><p id="mealAction" class="muted"></p></section>`;
}
function eatSlice(){if(meal.slices<=0)return;meal.slices--;document.getElementById('pizzaPlate').innerHTML=pizzaVisual();document.getElementById('eatMessage').textContent=meal.slices?meal.slices+' slices left.':'Pizza finished!';if(meal.slices===0)setTimeout(finishMeal,650)}
function takeDrink(){if(meal.drink<=0){document.getElementById('mealAction').textContent='Your drink is empty.';return}meal.drink--;document.getElementById('mealAction').textContent=meal.drink?'You took a drink. '+meal.drink+' sips left.':'You finished your drink.'}
function useNapkin(){meal.napkin=true;document.getElementById('mealAction').textContent='You used a napkin.'}
function dipSauce(){document.getElementById('mealAction').textContent='You dipped your pizza in the sauce you ordered.'}
function finishMeal(){
 const lifeWorld=PS.world(),lifeOrder=PS.getOrder(currentOrderId),lifeResident=lifeWorld.residents?.[PS.residentName()];if(lifeOrder?.resident===PS.residentName()&&lifeResident?.life?.meals.some(m=>m.id==='pizza-'+currentOrderId)){TTLifeCore.eat(lifeResident,'pizza-'+currentOrderId,true);PS.saveWorld(lifeWorld);}
 let o=PS.patchOrder(currentOrderId,{completed:true,status:'COMPLETED',completedAt:Date.now()});localStorage.removeItem('ttPizzaActiveOrder');
 app.innerHTML=`<section class="card"><div class="good"><h1>Meal finished! 🍕</h1><p>Order #${o.id} is complete.</p></div><div class="bigchoice"><button class="primary" onclick="storefront()">RETURN TO PIZZA SHOP</button><button class="secondary" onclick="PizzaShop.returnToTown()">RETURN TO TRANSITION TOWN</button></div></section>`;
}
(function resume(){let id=Number(localStorage.ttPizzaActiveOrder||0),o=id&&PS.getOrder(id);if(o&&o.resident===PS.residentName()&&!o.completed){currentOrderId=id;if(o.paymentStatus==='PAID')orderReadyActions(o);else waitingRoom()}else storefront()})();