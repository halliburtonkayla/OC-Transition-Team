// Local practice evidence. Never inferred attendance, service minutes or mastery.
export function newEvidence(id, at = new Date().toISOString()) {
  return {version:1,id,trackingSince:at,activeMs:0,areas:{},answers:[],supportChanges:[],assistance:[]};
}
export function ensureEvidence(state, id, at) {
  if (!state.practice || state.practice.version !== 1) state.practice = newEvidence(id,at);
  return state.practice;
}

// Count only visible, focused practice within 60 seconds of real user input.
// A new clock never reconstructs time from a saved wall-clock timestamp.
export function activeClock({now=()=>performance.now(),credit,idleMs=60000}) {
  let last=now(),deadline=last,enabled=true;
  function flush() {
    const t=now(),ms=enabled?Math.max(0,Math.min(t,deadline)-last):0;
    last=t;if(ms)credit(Math.round(ms));return ms;
  }
  return {flush,touch(){flush();deadline=now()+idleMs;},setEnabled(value){flush();enabled=!!value;last=now();if(!enabled)deadline=last;}};
}

export function bindPracticeClock({host=window,getState,area,save,id}) {
  let visible=!host.document.hidden,focused=host.document.hasFocus();
  const eligible=()=>visible&&focused&&!getState().paused;
  const clock=activeClock({now:()=>host.performance.now(),credit:ms=>{
    const p=ensureEvidence(getState(),id());p.activeMs+=ms;const key=area();p.areas[key]=(p.areas[key]||0)+ms;
  }});
  clock.setEnabled(eligible());
  const input=e=>{if(e.isTrusted&&eligible())clock.touch();};
  for(const type of ['pointerdown','keydown','wheel','input'])host.document.addEventListener(type,input,{capture:true,passive:true});
  const visibility=()=>{clock.flush();visible=!host.document.hidden;clock.setEnabled(eligible());save();};
  const focus=()=>{clock.flush();focused=host.document.hasFocus();clock.setEnabled(eligible());};
  host.document.addEventListener('visibilitychange',visibility);host.addEventListener('focus',focus);host.addEventListener('blur',focus);
  const interval=host.setInterval(()=>{clock.setEnabled(eligible());clock.flush();save();},5000);
  const flush=()=>{clock.flush();save();};host.addEventListener('pagehide',flush);
  return {flush:()=>clock.flush(),sync:()=>clock.setEnabled(eligible()),dispose(){flush();host.clearInterval(interval);host.removeEventListener('pagehide',flush);host.document.removeEventListener('visibilitychange',visibility);host.removeEventListener('focus',focus);host.removeEventListener('blur',focus);for(const type of ['pointerdown','keydown','wheel','input'])host.document.removeEventListener(type,input,true);}};
}

export const SKILL_QUESTIONS = [
  {id:'help',skill:'Self-advocacy',prompt:'You need help with a step. What can you do?',choices:[['ask','Ask my teacher for help','hand'],['guess','Guess and keep going','bowl'],['hide','Hide the problem','cabinet']],correct:'ask',hint:'Practice saying: “Can you show me this step?”'},
  {id:'sequence',skill:'Following instructions',prompt:'You used soap and rubbed for 20 seconds. What comes next?',choices:[['eat','Start eating','bowl'],['rinse','Rinse my hands','tap'],['shop','Go shopping','shopping']],correct:'rinse',hint:'Use clean running water before drying your hands.'},
  {id:'microwave',skill:'Workplace safety',prompt:'How do you safely use the real microwave?',choices:[['alone','Use it alone','clock'],['adult','Ask an adult and use a microwave-safe bowl','safety'],['metal','Leave the metal spoon inside','spoon']],correct:'adult',hint:'An adult supervises heat. Keep metal out and use dry mitts for hot bowls.'},
  {id:'missing',skill:'Problem solving',prompt:'An ingredient is missing. What should you do?',choices:[['list','Check the list and ask to visit the store','shopping'],['skip','Skip it without asking','bowl'],['swap','Use an unknown ingredient','cabinet']],correct:'list',hint:'Tell your teacher what is missing. Take your shopping list to the grocery store.'},
  {id:'cleanup',skill:'Workplace readiness',prompt:'Why do we clean the workspace?',choices:[['looks','Only to make it look pretty','clothing'],['safe','To keep people and food safe','cloth'],['hide','To hide a mistake','cabinet']],correct:'safe',hint:'A clean counter helps prevent contamination, spills and workplace hazards.'},
  {id:'career',skill:'Job exploration',prompt:'Which worker uses these food preparation skills?',choices:[['cook','A café food preparation worker','bowl'],['driver','A delivery driver at the wheel','clock'],['mechanic','A tire mechanic repairing wheels','safety']],correct:'cook',hint:'Think about a worker who measures ingredients, prepares food and cleans the kitchen.'},
  {id:'labels',skill:'Following instructions',prompt:'The care label says COLD. Which wash setting matches?',choices:[['hot','HOT water','laundry'],['cold','COLD water','laundry'],['warm','WARM water','laundry']],correct:'cold',hint:'Match the word COLD on the label to COLD on the washer.'},
  {id:'detergent',skill:'Workplace safety',prompt:'You do not understand the detergent label. What should you do?',choices:[['help','Ask for help before pouring','hand'],['extra','Add extra detergent','bowl'],['mix','Mix it with another cleaner','cleaning']],correct:'help',hint:'Read the real product label with your teacher. Never taste or mix cleaners.'},
  {id:'budget',skill:'Money management',advanced:true,prompt:'Your practice budget is $20. Groceries cost $11.27. How much remains?',choices:[['eight','$8.73','shopping'],['eleven','$11.27','shopping'],['thirty','$31.27','shopping']],correct:'eight',hint:'Subtract 11 dollars 27 cents from 20 dollars. Your Town bank balance is separate.'},
  {id:'customer',skill:'Communication',advanced:true,prompt:'A customer asks whether a treat contains milk. How should you respond?',choices:[['promise','Promise it is safe without checking','bowl'],['check','Check the ingredient labels with my supervisor','safety'],['ignore','Ignore the customer','cabinet']],correct:'check',hint:'Listen, check the labels and involve your supervisor. Do not guess about allergens.'},
  {id:'time',skill:'Time management',advanced:true,prompt:'Your shift has 10 minutes left. A new task needs 20 minutes. What is the best next step?',choices:[['rush','Rush and skip cleanup','clock'],['leave','Leave without telling anyone','clothing'],['plan','Tell my supervisor and agree on a plan','hand']],correct:'plan',hint:'Communicate early so your supervisor can help plan a safe finish or handoff.'}
];
export const questionsFor=level=>SKILL_QUESTIONS.filter(q=>level==='independent'||!q.advanced);
export function answerQuestion(state,id,choice,at=new Date().toISOString()) {
  const q=questionsFor(state.support).find(q=>q.id===id);
  if(state.paused||!q||!q.choices.some(c=>c[0]===choice)||!state.practice)return {ok:false};
  const answer={id,choice,correct:choice===q.correct,support:state.support,at,hintUsed:!!state.questionHints?.[id]};
  state.practice.answers.push(answer);return {ok:true,answer,question:q};
}

export function practiceReport(state,student,at=new Date().toISOString()) {
  const p=state.practice;
  return {version:1,id:p?.id||null,student,generatedAt:at,trackingSince:p?.trackingSince||null,lesson:'Microwave Rice Krispie Treat & Life Skills',difficulty:state.support,status:state.phase==='complete'?'Recipe simulation complete':state.phase==='reflection'?'Recipe complete; reflection pending':'In progress',completedRecipes:state.completed||0,cookingSteps:[...state.completedSteps],laundrySteps:state.laundry.completed?10:state.laundry.step,laundryComplete:state.laundry.completed,household:Object.keys(state.household).filter(k=>state.household[k].completed),shopping:state.shopping.receipt?{totalCents:state.shopping.receipt.totalCents,remainingCents:state.shopping.receipt.remainingCents}:null,activeMs:p?.activeMs||0,areas:{...p?.areas},answers:(p?.answers||[]).map(a=>({...a})),assistance:(p?.assistance||[]).map(a=>({...a})),helpRequests:p?.assistance.length||0,supportChanges:(p?.supportChanges||[]).map(a=>({...a})),skills:[...new Set([...(state.completedSteps.length||state.laundry.step||Object.values(state.household).some(t=>t.step)||state.planning.recipeReviewed?['Workplace readiness','Following instructions','Independent living']:[]),...(state.shopping.receipt?['Money management','Independent living']:[]),...(p?.answers||[]).map(a=>SKILL_QUESTIONS.find(q=>q.id===a.id)?.skill).filter(Boolean),...(p?.assistance.length?['Self-advocacy']:[])])]};
}
