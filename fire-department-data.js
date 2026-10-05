(function(){'use strict';
const FD={
 images:{exterior:'01_Fire_Department_Exterior.png',bay:'02_Engine_Bay.png',gear:'03_Gear_Room.png',cab:'04_Fire_Truck_Dispatch_Cab.png',structure:'05_Structure_House_Fire.png',crash:'06_Vehicle_Crash_Extrication.png',training:'07_Training_Briefing_Area.png',safety:'08_Fire_Safety_Training.png',tour:'09_Fire_Station_Tour.png',kitchen:'10_Kitchen_Fire.png',medical:'11_Medical_Assist.png',cleanup:'12_After_Call_Cleanup_Reset.png'},
 videos:{dayLife:'haVtnYw5X4o',fireSafety:'cX8pPbYCtMU',stationTour:'qO6j6oJtK_Q'},
 promotions:['Firefighter Recruit','Firefighter','Driver / Engineer','Lieutenant','Captain','Fire Chief'],
 calls:{
  structure:{label:'STRUCTURE FIRE',icon:'🔥',units:'Engine 1 / Ladder 1',addresses:['214 Oak Street','88 Maple Avenue','412 Jefferson Street','31 Park Lane'],hazards:['Possible occupant inside','Heavy smoke from second floor','Fire showing from front window','Garage fire extending to house']},
  kitchen:{label:'KITCHEN FIRE',icon:'🍳',units:'Engine 1',addresses:['19 Willow Drive','505 College Street','73 Magnolia Lane','260 Church Street'],hazards:['Grease fire on stove','Smoke from kitchen','Pan fire — occupants outside','Kitchen fire with heavy smoke']},
  crash:{label:'VEHICLE CRASH',icon:'🚗',units:'Engine 1 / Rescue 1',addresses:['Main Street & Broadway','Highway 22 at Industrial Drive','University Street & Lindell','Skyhawk Parkway'],hazards:['One occupant trapped','Two vehicles — traffic hazard','Door will not open','EMS requesting extrication assistance']},
  medical:{label:'MEDICAL ASSIST',icon:'❤️',units:'Engine 1 / Medic 1',addresses:['Transition Town Park','146 Cedar Street','Transition Town School','302 Main Street'],hazards:['Unresponsive adult','Possible cardiac arrest','Person collapsed — bystander calling 911','Medical emergency — CPR may be needed']}
 }
};
function world(){try{return JSON.parse(localStorage.ttWorld||'{}')||{}}catch(e){return {}}}
function save(w){localStorage.ttWorld=JSON.stringify(w)}
function name(){return localStorage.ttCurrent||sessionStorage.ttCurrent||'Guest'}
function resident(w){w=w||world();w.residents=w.residents||{};return w.residents[name()]||null}
function isKayla(){return /kayla/i.test(name())||new URLSearchParams(location.search).get('manager')==='1'}
function employeePin(){let w=world(),r=resident(w);if(isKayla())return '6437';if(!r){let n=name(),s=0;for(let i=0;i<n.length;i++)s=(s+n.charCodeAt(i)*(i+7))%9000;return String(1000+s).slice(-4)}if(r.employeePin)return String(r.employeePin);if(r.groceryPin)r.employeePin=String(r.groceryPin);else if(r.employment&&r.employment.pizza&&r.employment.pizza.pin)r.employeePin=String(r.employment.pizza.pin);else{let n=name(),s=0;for(let i=0;i<n.length;i++)s=(s+n.charCodeAt(i)*(i+7))%9000;r.employeePin=String(1000+s).slice(-4)}r.groceryPin=r.groceryPin||r.employeePin;if(r.employment&&r.employment.pizza)r.employment.pizza.pin=r.employeePin;save(w);return String(r.employeePin)}
function employment(){let r=resident();return r&&r.employment&&r.employment.fire||null}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function makeCall(type,source){let key=type||pick(Object.keys(FD.calls)),c=FD.calls[key],call={id:'FIRE-'+Date.now(),type:key,label:c.label,icon:c.icon,address:pick(c.addresses),hazard:pick(c.hazards),units:c.units,source:source||'Fire Department Dispatch',createdAt:Date.now(),status:'DISPATCHED'};let w=world();w.emergencyCalls=w.emergencyCalls||[];w.emergencyCalls.push(call);save(w);return call}
function queueEmergency(call){let w=world();w.emergencyCalls=w.emergencyCalls||[];call.id=call.id||'FIRE-'+Date.now();call.createdAt=call.createdAt||Date.now();call.status=call.status||'PENDING';w.emergencyCalls.push(call);save(w);return call}
function pendingCall(){let w=world(),a=(w.emergencyCalls||[]).filter(x=>['PENDING','DISPATCHED'].includes(x.status));return a[0]||null}
function patchCall(id,p){let w=world(),c=(w.emergencyCalls||[]).find(x=>x.id===id);if(c)Object.assign(c,p);save(w);return c}
function apply(){let w=world();w.fireApplications=w.fireApplications||[];let existing=w.fireApplications.find(a=>a.resident===name()&&/Pending|Review/i.test(a.status||''));if(existing)return existing;let a={id:'FIREAPP-'+Date.now(),resident:name(),position:'Firefighter Recruit',employer:'Transition Town Fire Department',status:'Pending Miss Kayla Review',submitted:new Date().toLocaleString()};w.fireApplications.push(a);save(w);return a}
function speak(t,rate){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(String(t||''));u.rate=rate||.9;window.speechSynthesis.speak(u)}
function stopSpeech(){if('speechSynthesis'in window)window.speechSynthesis.cancel()}
function returnTown(){let n=name();if(n&&n!=='Guest'){localStorage.ttCurrent=n;sessionStorage.ttCurrent=n;location.href='transition-town.html?return=1&resident='+encodeURIComponent(n)}else location.href='transition-town.html'}
window.FireDept={config:FD,world,save,name,resident,isKayla,employeePin,employment,pick,makeCall,queueEmergency,pendingCall,patchCall,apply,speak,stopSpeech,returnTown};
})();