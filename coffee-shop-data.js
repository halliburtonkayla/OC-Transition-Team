(function(){'use strict';
const MENU={
 drinks:['Coffee','Latte','Iced Latte','Cappuccino','Americano','Mocha','Iced Coffee','Cold Brew','Hot Chocolate','Tea','Iced Tea','Refresher','Frappé'],
 sizes:['Small','Medium','Large'],temps:['Hot','Iced'],
 milks:['Whole','2%','Skim','Oat','Almond','Soy'],
 flavors:['None','Vanilla','Caramel','Hazelnut','Mocha','White Chocolate','Brown Sugar Cinnamon','Strawberry'],
 sweeteners:['None','Sugar','Honey','Stevia'],
 ice:['No Ice','Light Ice','Regular Ice','Extra Ice'],
 toppings:['Whipped Cream','Cold Foam','Caramel Drizzle','Chocolate Drizzle','Cinnamon'],
 foods:['None','Butter Croissant','Blueberry Muffin','Chocolate Chip Cookie','Bagel','Breakfast Sandwich','Cake Pop','Brownie']
};
function world(){try{return JSON.parse(localStorage.ttWorld||'{}')||{}}catch(e){return {}}}
function save(w){localStorage.ttWorld=JSON.stringify(w)}
function name(){return localStorage.ttCurrent||sessionStorage.ttCurrent||'Guest'}
function resident(w){w.residents=w.residents||{};return w.residents[name()]||null}
function ensure(w){w.coffeeOrders=w.coffeeOrders||[];w.coffeeNextOrder=Number(w.coffeeNextOrder||201);return w}
function addOrder(o){let w=ensure(world());o.id=w.coffeeNextOrder++;o.createdAt=Date.now();o.status='ORDER RECEIVED';o.restaurant='Transition Town Coffee Shop';o.drinkStatus=o.drink?'WAITING':'NOT NEEDED';o.foodStatus=o.food&&o.food!=='None'?'WAITING':'NOT NEEDED';o.pickupStatus='WAITING';w.coffeeOrders.push(o);save(w);return o}
function getOrder(id){return ensure(world()).coffeeOrders.find(o=>Number(o.id)===Number(id))||null}
function patch(id,p){let w=ensure(world()),o=w.coffeeOrders.find(x=>Number(x.id)===Number(id));if(!o)return null;Object.assign(o,p);if((o.drinkStatus==='READY'||o.drinkStatus==='NOT NEEDED')&&(o.foodStatus==='READY'||o.foodStatus==='NOT NEEDED')){o.status='READY';o.readyAt=o.readyAt||Date.now()}save(w);return o}
function active(){return ensure(world()).coffeeOrders.filter(o=>!o.completed&&o.status!=='PICKED UP')}
function price(o){let p={Coffee:2.5,Latte:4.25,'Iced Latte':4.5,Cappuccino:4.25,Americano:3.25,Mocha:4.75,'Iced Coffee':3.5,'Cold Brew':4.25,'Hot Chocolate':3.75,Tea:3,'Iced Tea':3,Refresher:4.25,'Frappé':5.25}[o.drink]||0;p+=o.size==='Large'?1:o.size==='Medium'?.5:0;p+=['Oat','Almond','Soy'].includes(o.milk)?.75:0;p+=Math.max(0,Number(o.shots||0)-2)*.9;p+=Object.values(o.flavors||{}).reduce((a,v)=>a+(v==='Extra'?1.1:v==='Add'||v==='Regular'?.6:v==='Light'?.3:0),0);p+=(o.toppings||[]).length*.6;let fp={'Butter Croissant':3.25,'Blueberry Muffin':3.25,'Chocolate Chip Cookie':2.5,Bagel:3,'Breakfast Sandwich':5.5,'Cake Pop':2.75,Brownie:3.25}[o.food]||0;return Math.round((p+fp)*100)/100}
function employeePin(){
 let w=world(),r=resident(w);if(!r){let n=name(),b=0;for(let i=0;i<n.length;i++)b=(b+n.charCodeAt(i)*(i+7))%9000;return String(1000+b).slice(-4)}
 if(r.employeePin)return String(r.employeePin);
 if(r.groceryPin)r.employeePin=String(r.groceryPin);
 else if(r.employment&&r.employment.pizza&&r.employment.pizza.pin)r.employeePin=String(r.employment.pizza.pin);
 else {let n=name(),b=0;for(let i=0;i<n.length;i++)b=(b+n.charCodeAt(i)*(i+7))%9000;r.employeePin=String(1000+b).slice(-4)}
 r.groceryPin=r.groceryPin||r.employeePin;if(r.employment&&r.employment.pizza)r.employment.pizza.pin=r.employeePin;save(w);return String(r.employeePin)
}
function speak(t,rate){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.rate=rate||.9;window.speechSynthesis.speak(u)}
function returnTown(){let n=name();if(n&&n!=='Guest'){localStorage.ttCurrent=n;sessionStorage.ttCurrent=n;location.href='transition-town.html?return=1&resident='+encodeURIComponent(n)}else location.href='transition-town.html'}
window.CoffeeShop={menu:MENU,world,save,name,resident,ensure,addOrder,getOrder,patch,active,price,employeePin,speak,returnTown};
})();