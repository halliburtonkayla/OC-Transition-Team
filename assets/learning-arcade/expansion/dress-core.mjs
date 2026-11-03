import {GARMENTS,SLOTS,SCENARIOS,WEATHER,garmentById,defaultAvatar,defaultOutfit,item,COLORS,PATTERNS} from './dress-data.mjs';
import {permute,random} from './word-core.mjs';
export function cleanAvatar(v={}){
 const pick=(k,max,def=0)=>Number.isInteger(v[k])&&v[k]>=0&&v[k]<max?v[k]:def;
 return {skin:pick('skin',8,4),face:pick('face',3),features:pick('features',3),eye:pick('eye',5),hair:pick('hair',8,2),hairColor:pick('hairColor',8),body:pick('body',3,1),height:Math.max(.88,Math.min(1.12,Number(v.height)||1)),glasses:!!v.glasses};
}
export function cleanOutfit(v={}){const o={};for(const slot of SLOTS){const a=v[slot],g=garmentById(a?.id);o[slot]=g?.slot===slot?item(g.id,Number.isInteger(a.color)&&a.color>=0&&a.color<COLORS.length?a.color:8,PATTERNS.includes(a.pattern)?a.pattern:'solid'):null;}if(o.dress){o.top=null;o.bottom=null;}return o;}
export function wear(outfit,id,color=8,pattern='solid'){
 const g=garmentById(id);if(!g)throw Error('Unknown garment');const next=structuredClone(outfit);
 next[g.slot]=item(id,color,pattern);
 if(g.slot==='dress'){next.top=null;next.bottom=null;}
 if(['top','bottom'].includes(g.slot)&&next.dress){next.dress=null;next.top||=item('tee',4);next.bottom||=item('jeans',8);}
 return cleanOutfit(next);
}
export function outfitCost(o){return Object.values(o).reduce((n,v)=>n+(garmentById(v?.id)?.price||0),0);}
export function outfitSummary(o){return Object.values(o).filter(Boolean).map(v=>`${garmentById(v.id)?.label||v.id} (${COLORS[v.color]}, ${v.pattern})`);}
export function makeScenario(level=1,index=0,seed=76531){
 level=Math.max(1,Math.min(4,level));const rng=random(seed+level*971),pool=level===1?SCENARIOS.filter(s=>s.requirements.length<=1):SCENARIOS,order=permute(pool,rng),s=structuredClone(order[index%order.length]);
 const weathers=level===1?['sunny','cloudy']:level===2?['sunny','hot','cold','rainy','cloudy']:Object.keys(WEATHER);
 const wr=random(seed+index*3253+level*29),weather=s.id==='relax'?'cloudy':weathers[Math.floor(wr()*weathers.length)];
 const change=level>=3&&index%3===2&&s.id!=='relax'?(weather==='rainy'?'cold':'rainy'):null;
 const essentials=['tee','polo','button','trousers','workpants','jeans','sneakers','boots','workboots','uniform','vest','helmet','hairnet','coat','raincoat','gloves','beanie','umbrella','formal','dressshoes'];
 return {...s,instance:`${seed}-${level}-${index}`,level,index,weather,change,budget:level===4?165:null,limited:level===4,allowed:level===4?essentials:GARMENTS.map(g=>g.id)};
}
export function requirementsFor(s){
 const w=WEATHER[s.change||s.weather];
 return [s.description,...(s.id==='relax'?[]:[`Weather: ${WEATHER[s.weather].label}.`,...(s.change?[`Forecast update before arrival: ${w.label}. Plan for both conditions.`]:[]),...(w.warm?[`Choose enough warm layers for ${w.label.toLowerCase()}.`]:[]),...(w.rain?['Choose rain protection: a hooded raincoat or an umbrella.']:[]),...(w.snow?['Choose insulated, waterproof footwear with grip.']:[])]),...(s.budget?[`Practice clothing budget: $${s.budget}. Only the available wardrobe collection can be selected.`]:[])];
}
export function evaluateOutfit(s,raw){
 const o=cleanOutfit(raw),gs=Object.values(o).filter(Boolean).map(v=>garmentById(v.id)),has=t=>gs.some(g=>g.tags.includes(t)),feet=garmentById(o.feet?.id),top=garmentById(o.top?.id)||garmentById(o.dress?.id),bottom=garmentById(o.bottom?.id),checks=[];
 const add=(key,pass,yes,no)=>checks.push({key,pass:!!pass,feedback:pass?yes:no});
 add('complete',!!(o.feet&&((o.top&&o.bottom)||o.dress)),'You chose a complete outfit.','Choose a top and bottom (or a dress), plus shoes.');
 for(const req of s.requirements){
  let ok=false,yes='',no='';
  if(req==='closed'){ok=feet?.tags.includes('closed');yes='Your closed shoes protect your feet.';no='This visit requires closed shoes. Choose sneakers, work shoes, polished shoes, or boots.';}
  if(req==='grip'){ok=feet?.tags.includes('grip');yes='Your footwear has the grip required for this task.';no='Choose footwear marked non-slip or grip for this task.';}
  if(req==='protective'){ok=feet?.tags.includes('protective');yes='Your protective work boots meet this site’s requirement.';no='This site requires protective work boots; regular sneakers are not protective boots.';}
  if(req==='uniform'){ok=!!o.top&&garmentById(o.top.id).tags.includes('uniform');yes='Your polo or uniform meets the stated work rule.';no='This workplace asks for a polo or work uniform shirt.';}
  if(req==='smart'){ok=top?.tags.includes('smart')&&(!!o.dress||bottom?.tags.includes('smart'));yes='Your outfit meets the stated business-casual expectation.';no='Try a polo, button-down, blouse, or sweater with dress pants or a midi skirt, or a day dress.';}
  if(req==='formal'){ok=top?.tags.includes('formal')&&(!!o.dress||bottom?.tags.includes('formal'));yes='Your outfit meets the invitation’s formal request.';no='Try a button-down or blouse with dress pants or a midi skirt, or the occasion dress.';}
  if(req==='neat'){ok=top?.tags.includes('neat');yes='Your choice meets this host’s stated neat-clothing request.';no='Choose a top or dress marked neat. There is no required color or gendered style.';}
  if(req==='long'){ok=bottom?.tags.includes('long')&&!o.dress;yes='Your long pants meet the task’s stated protection rule.';no='For this specific work task, choose long pants.';}
  if(req==='hivis'){ok=has('hivis');yes='Your high-visibility vest is ready for the site.';no='Add the high-visibility work vest required at this site.';}
  if(req==='helmet'){ok=o.head?.id==='helmet';yes='You have the required safety helmet.';no='Add the safety helmet required at this site.';}
  if(req==='hairrestraint'){ok=has('hairrestraint');yes='Your food-service hair covering meets the task rule.';no='Add the food-service hair covering required for this task.';}
  add(req,ok,yes,no);
 }
 if(['shelter','outdoor'].includes(s.id))add('secure',!has('loose'),'Your outfit avoids loose accessories near equipment.','Remove loose scarves or a loose hoodie around this task’s equipment.');
 const w=WEATHER[s.change||s.weather];
 if(s.id!=='relax'){
  if(w.warm){const warmth=gs.reduce((n,g)=>n+g.warmth,0);add('warmth',warmth>=w.warm,`Your layers provide warmth for ${w.label.toLowerCase()}.`,'Add warm layers for the forecast. A coat, warm hat, gloves, and warm footwear offer options.');}
  if(w.rain)add('rain',has('rainhood')||has('raincover'),'You planned rain protection.','Add a hooded raincoat or umbrella to stay dry on the trip.');
  if(w.snow)add('snow',feet?.tags.includes('insulated')&&feet.tags.includes('waterproof')&&feet.tags.includes('grip'),'Your warm waterproof footwear has grip for wintry conditions.','Choose weather boots or protective work boots for warmth, water protection, and grip.');
  if(s.weather==='hot'||(!s.change&&w.temperature>30))add('heat',!gs.some(g=>g.slot==='outer'&&g.warmth>=3),'Your outer layer allows a comfortable choice for hot weather.','Swap the insulated winter coat for a lighter layer in hot weather.');
 }
 if(s.budget){add('budget',outfitCost(o)<=s.budget,`Your $${outfitCost(o)} practice outfit stays within $${s.budget}.`,`Your outfit costs $${outfitCost(o)}. Try another combination within $${s.budget}.`);add('available',gs.every(g=>s.allowed.includes(g.id)),'Your choices are available in this challenge’s collection.','Choose from the available challenge collection.');}
 const success=checks.every(c=>c.pass),score=Math.round(checks.filter(c=>c.pass).length/checks.length*100);
 return {success,score,stars:success?3:0,checks,successes:checks.filter(c=>c.pass).map(c=>c.feedback),improvements:checks.filter(c=>!c.pass).map(c=>c.feedback),cost:outfitCost(o)};
}
// One known valid outfit is used for solvability verification and optional spoken
// guidance. Evaluation still accepts any combination meeting the actual rules.
export function suggestedOutfit(s){
 let o=defaultOutfit();const put=id=>{o=wear(o,id);};
 if(s.requirements.includes('smart')){put('button');put('trousers');}
 if(s.requirements.includes('formal')){put('button');put('trousers');}
 if(s.requirements.includes('uniform'))put('polo');
 if(s.requirements.includes('long'))put('workpants');
 if(s.requirements.includes('protective'))put('workboots');
 if(s.requirements.includes('hivis'))put('vest');
 if(s.requirements.includes('helmet'))put('helmet');
 if(s.requirements.includes('hairrestraint'))put('hairnet');
 const w=WEATHER[s.change||s.weather];
 if(w.snow)put(s.requirements.includes('protective')?'workboots':'boots');
 if(w.warm>=3){if(!s.requirements.includes('hivis'))put('coat');if(!s.requirements.includes('hairrestraint'))put('beanie');if(s.requirements.includes('helmet'))put('helmet');put('gloves');}
 if(w.rain)put('umbrella');
 return o;
}
