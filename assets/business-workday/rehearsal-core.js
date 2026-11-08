/* Service-card ideas recovered from PR #1 (ba68b4e). Uses the released shop
   record and command path; this module cannot post money or consume stock. */
(function(g){
'use strict';
const C=g.TTBusinessCore,base=C.reduce,clone=x=>JSON.parse(JSON.stringify(x));
const fail=message=>{throw Error(message);};
const check=(id,prompt,answer,other)=>({id,prompt,answer,options:[answer,other]});
function card(shop){
 switch(shop){
 case 'cool-vibes':return {title:'Café order and allergy rehearsal',lines:['Fictional guest Morgan requests coffee with milk.','Read the ingredient and allergy information with the supervisor.','Label the order for Morgan and verify collection.'],checks:[
  check('request','Which order did Morgan request?','Coffee with milk','A different drink'),
  check('allergy','Morgan mentions a milk allergy. What should happen?','Pause and ask the supervisor to review ingredients','Guess that a small amount is safe'),
  check('supplies','Which supplies belong at this station?','Clean supplies listed on the approved work card','Any supplies from the cleaning cupboard'),
  check('record','What should the work record include?','The actual order, allergy concern and supervisor response','Work that was never completed'),
  check('pickup','Who should receive the labeled order?','Morgan, after the order and collection name are verified','Any waiting guest')]};
 case 'the-zoo':return {title:'Pet-care and authorized pickup rehearsal',lines:['Fictional pet Buddy belongs to Morgan.','Use the owner-provided food and written care card. No medicine is requested.','Supervise activity and verify Morgan at pickup.'],checks:[
  check('identity','Whose care instructions should you follow?','The verified owner’s written care card','Your own guess'),
  check('supplies','Which food should Buddy receive?','Only the owner-approved food on the care card','Food from another pet’s bag'),
  check('activity','Choose the safe activity.','Supervised activity suited to Buddy’s care card','Leave Buddy outside unattended'),
  check('concern','Buddy seems unusually tired. What should happen?','Pause and report the concern to the supervisor','Give medicine without instructions'),
  check('pickup','Who may collect Buddy?','Morgan, after authorization is verified','An unknown visitor')]};
 case 'guardian-angel':return {title:'Childcare care-card rehearsal',lines:['Fictional child Mia has a peanut allergy.','There are 3 children in the activity group.','Use the family-approved snack plan. Morgan is the authorized pickup adult.'],checks:[
  check('identity','What should be verified before care begins?','Authorized family contact and written care instructions','Only the child’s first name'),
  check('headcount','How many children are in this activity group?','3','4'),
  check('allergy','Choose the snack and activity plan.','Family-approved allergy-safe snack and supervised activity','Any unchecked snack and unsupervised play'),
  check('record','What belongs in the care log?','Attendance, activity, snack and concerns actually recorded','Activities that did not happen'),
  check('pickup','An unfamiliar adult asks to collect Mia. What should happen?','Keep Mia supervised and verify authorization with the supervisor','Release Mia immediately')]};
 case '3k-tire-shop':return {title:'Tire work-order rehearsal',lines:['Fictional practice vehicle: one tire replacement only.','Work-order tire specification: 205/55R16.','No real tools or vehicle work. A qualified supervisor must check the simulated job.'],checks:[
  check('authorized','Which work is authorized?','One tire replacement','Any extra repair you notice'),
  check('bay','Which training bay is safe to use?','A clear supervisor-approved bay with the required PPE','A blocked bay without PPE'),
  check('specification','Match the tire specification on the work order.','205/55R16','215/60R17'),
  check('record','What belongs in the completed work record?','Only approved simulated work and reported concerns','Repairs that were never performed'),
  check('supervisor','What is required before returning the practice vehicle?','Qualified supervisor final check and customer explanation','Skip the final check')]};
 case 'main-attraction':return {title:'Salon consultation rehearsal',lines:['Fictional customer Morgan requests a simple natural look.','Ask about product sensitivities and follow supervisor directions.','No real chemicals, blades or lash procedures. Record the service and clean the station.'],checks:[
  check('appointment','Which appointment should you follow?','The customer’s confirmed appointment and requested look','A different service without asking'),
  check('supplies','Which supplies should be selected?','Clean appointment supplies listed on the work card','Unlisted products and shared unclean tools'),
  check('sensitivity','Morgan reports a product sensitivity. What should happen?','Pause and ask the supervisor to review a suitable plan','Ignore it and proceed'),
  check('preference','How should a change to the requested look be handled?','Confirm the preference and get agreement before changes','Change the look without asking'),
  check('cleanup','What completes this appointment?','Record actual service, check satisfaction and sanitize the station','Leave the station for someone else')]};
 default:fail('Choose an existing student business.');
 }
}
const current=s=>(s.rehearsal?.runs||[]).find(r=>r.completedAt===null&&!r.endedAt);
function reduce(previous,a,id,now=Date.now()){
 if(!String(a?.type||'').startsWith('rehearsal-'))return base(previous,a,id,now);
 if(!/^[a-zA-Z0-9-]{8,100}$/.test(String(id||'')))fail('A rehearsal action needs a valid request ID.');
 if(previous.seen.includes(id))return clone(previous);
 if(!Number.isFinite(now))fail('The rehearsal needs a valid time.');
 const definition=card(previous.shop),s=clone(previous);
 const store=s.rehearsal||(s.rehearsal={version:1,runs:[]});
 if(store.version!==1)fail('This rehearsal record needs a compatible classroom update.');
 const actor=String(a.actor||'Practice worker').trim().slice(0,50);
 let run=current(s);
 if(a.type==='rehearsal-start'){
  if(store.runs.some(r=>r.id===id))return clone(previous);
  if(run)fail('A team rehearsal is already in progress. Continue its service card.');
  if(store.runs.length>=100)fail('This workspace has 100 rehearsal records. Export them and ask Miss Kayla to choose another work session. Saved records have not been removed.');
  run={id,version:1,number:store.runs.length+1,title:definition.title,startedAt:now,startedBy:actor,completedAt:null,progress:0,events:[]};
  store.runs.push(run);
 }else{
  if(!run||a.run!==run.id)fail('This rehearsal changed or finished. Refresh the service card.');
  if(run.version!==1)fail('This service card needs a compatible classroom update.');
  let st=definition.checks[run.progress];
  let result,response;
  if(a.type==='rehearsal-end'){
   run.endedAt=now;run.endedBy=actor;run.endedEarly=true;
   st={id:'review',prompt:'Rehearsal stopped for review'};result='review';response='Saved without completing every step';
  }else{
  if(a.step!==st.id)fail('A teammate updated this step. Read the current service card.');
  if(run.events.length>=100)fail('This rehearsal has 100 recorded attempts. Finish and review the saved responses, then start another rehearsal.');
  if(a.type==='rehearsal-hint'){result='hint';response='Read-aloud and service-card instructions requested';}
  else if(a.type==='rehearsal-answer'){
   if(!st.options.includes(a.answer))fail('Choose one of the answers on this service card.');
   response=a.answer;result=response===st.answer?'correct':'retry';
   if(result==='correct'){run.progress++;if(run.progress===definition.checks.length)run.completedAt=now;}
  }else fail('Unknown rehearsal action.');
  }
  run.events.push({id,at:now,actor,step:st.id,prompt:st.prompt,response,result});
 }
 s.seen.push(id);s.seen=s.seen.slice(-500);
 return s;
}
function rows(s){
 return (s.rehearsal?.runs||[]).flatMap(run=>run.events.map(e=>({business:s.shop,rehearsal:run.number,run:run.id,...e,evidence:'Application-reported free rehearsal; not teacher observation, attendance, independence or billable minutes.'})));
}
C.reduce=reduce;
g.TTBusinessRehearsal={card,current,rows,reduce};
})(globalThis);
