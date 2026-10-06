(function(){'use strict';
const K='ttWorld',TEST='ttLifeTestWorld';
const teacher=n=>/^(?:miss|ms\.)\s*kayla$/i.test(n||'');
function name(){return localStorage.getItem('ttCurrent')||sessionStorage.getItem('ttCurrent')||'';}
function sandbox(){return teacher(name())&&sessionStorage.getItem(TEST)!==null;}
function read(){let raw=sandbox()?sessionStorage.getItem(TEST):localStorage.getItem(K);if(!raw)throw Error('Choose your resident in Transition Town first.');let w;try{w=JSON.parse(raw)}catch(e){throw Error('Your saved town could not be read. No data has been changed. Ask Miss Kayla for help.');}if(!w?.residents)throw Error('Your town needs an existing resident profile.');return w;}
function snapshot(w,n){if(sandbox())return;const r=w.residents[n];if(!r?.life)return;const alerts=TTLifeCore.alerts(r),stamp=JSON.stringify(alerts);if(r.life.alertStamp===stamp)return;r.life.alertStamp=stamp;w.notifications=w.notifications||[];w.notifications.push({id:TTLifeCore.uid(),from:n,to:'Miss Kayla',title:'Transition Life • '+n,text:alerts.join(' • '),date:new Date().toISOString(),details:{resident:n,simulationDate:r.life.date,alerts,home:r.home}});}
function write(w,n){snapshot(w,n);const raw=JSON.stringify(w);try{if(sandbox())sessionStorage.setItem(TEST,raw);else localStorage.setItem(K,raw);}catch(e){throw Error('Progress could not be saved. Free device storage before continuing; this action was not completed.');}if(!sandbox()&&window.TTNotifications)TTNotifications.sync();window.dispatchEvent(new CustomEvent('tt-life-change',{detail:{resident:n}}));}
function change(fn,expected=name()){if(expected!==name())throw Error('Your active resident changed. Reload before continuing.');const w=read(),r=w.residents[expected];if(!r)throw Error('Return to town and choose your existing profile.');TTLifeCore.init(r);const result=fn(r,w);write(w,expected);return result;}
function demo(start){if(!teacher(name()))throw Error('Open Miss Kayla’s existing profile to use test mode.');if(start){const w=read();sessionStorage.setItem(TEST,JSON.stringify(w));}else sessionStorage.removeItem(TEST);}
window.TTLifeStore={name,teacher,sandbox,read,write,change,demo};
})();
