/* Render only teacher-authorized records returned by the existing town hub. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),esc=TTRoom.esc;
 const SHOPS=[['main-attraction','The Main Attraction'],['cool-vibes','Cool Vibes Café'],['3k-tire-shop','3K Tire Shop'],['the-zoo','The Zoo Pet Sitting'],['guardian-angel','Guardian Angel Childcare']];
 let rows=[],busy=false,generation=0,expanded=new Set();
 const date=s=>{const d=new Date(s);return Number.isNaN(+d)?'Date unavailable':d.toLocaleString();};
 function selected(){
  let shop=$('interview-shop').value,choice=$('interview-choice').value;if(!['all',...SHOPS.map(s=>s[0])].includes(shop))$('interview-shop').value=shop='all';if(!['all','Hired','On hold','Declined'].includes(choice))$('interview-choice').value=choice='all';const search=$('interview-search').value.trim().toLowerCase();
  return rows.filter(r=>(shop==='all'||r.shop_id===shop)&&(choice==='all'||r.decision===choice)&&(!search||[r.owner_name,r.applicant_name,r.details?.position,r.details?.reason].join(' ').toLowerCase().includes(search)));
 }
 function card(r){
  const d=r.details||{},ratings=d.ratings||{},label=r.decision==='Hired'?'Hire':r.decision==='Declined'?'Decline':'Hold';
  return `<article class="decision-result"><div class="decision-heading"><span class="choice ${r.decision==='Hired'?'hire':r.decision==='Declined'?'decline':'hold'}">${label}</span><span class="muted">${esc(r.shop_name)}</span></div><h3>${esc(r.applicant_name)}</h3><p><b>Decision by:</b> ${esc(r.owner_name)}<br><b>Position:</b> ${esc(d.position||'Not specified')}</p><p class="body decision-reason">${esc(d.reason||'No reason provided')}</p><p class="muted">Decided ${esc(date(r.decided_at))}<br>Received ${esc(date(r.received_at))}</p><details data-decision-detail="${esc(r.source_id)}" ${expanded.has(r.source_id)?'open':''}><summary>Notes, ratings & interview answers</summary><dl><dt>Skills & qualifications</dt><dd>${esc(ratings.skills||'Not rated')}${ratings.skills?' / 5':''}</dd><dt>Professional behavior</dt><dd>${esc(ratings.professional||'Not rated')}${ratings.professional?' / 5':''}</dd><dt>Dependability & availability</dt><dd>${esc(ratings.reliable||'Not rated')}${ratings.reliable?' / 5':''}</dd><dt>Interview progress</dt><dd>${Array.isArray(d.asked)?d.asked.length:0} of 8 main questions; ${Array.isArray(d.followed)?d.followed.length:0} follow-ups.</dd><dt>Student notes</dt><dd>${esc(d.notes||'No additional notes')}</dd><dt>Verify / support</dt><dd>${esc(d.support||'Not entered')}</dd></dl><h4>Interview conversation</h4>${Array.isArray(d.transcript)&&d.transcript.length?d.transcript.map(t=>`<p class="body"><b>${esc(t.speaker)}:</b> ${esc(t.text)}</p>`).join(''):'<p>No conversation saved.</p>'}</details></article>`;
 }
 function render(){
  if(!$('interview-results'))return;
  $('interview-results').querySelectorAll('[data-decision-detail]').forEach(el=>{if(el.open)expanded.add(el.dataset.decisionDetail);else expanded.delete(el.dataset.decisionDetail);});
  const shown=selected();
  $('interview-summary').innerHTML=SHOPS.map(([id,name])=>{const shop=rows.filter(r=>r.shop_id===id);return `<button class="shop-summary ${$('interview-shop').value===id?'selected':''}" data-shop-filter="${id}" aria-label="Show ${esc(name)} decisions"><b>${esc(name)}</b><span>${shop.length} decision${shop.length===1?'':'s'}</span><small>${shop.filter(r=>r.decision==='Hired').length} hire · ${shop.filter(r=>r.decision==='On hold').length} hold · ${shop.filter(r=>r.decision==='Declined').length} decline</small></button>`;}).join('');
  $('interview-count').textContent=shown.length+' decision'+(shown.length===1?'':'s')+' shown';
  $('interview-results').innerHTML=shown.length?shown.map(card).join(''):`<div class="decision-empty"><h3>${rows.length?'No matching decisions.':'No interview decisions received yet.'}</h3><p>${rows.length?'Try another shop, decision, or student name.':'Have students refresh their shop page once. Saved decisions will upload, and new hire, hold, or decline choices will appear here automatically.'}</p></div>`;
  $('interview-summary').querySelectorAll('[data-shop-filter]').forEach(b=>b.onclick=()=>{$('interview-shop').value=b.dataset.shopFilter;render();});
 }
 async function refresh(){
  if(busy||!sessionStorage.getItem('ttTownTeacherCode'))return;
  busy=true;const current=++generation;
  try{
   let all=[],after='',pages=0;
   do{
    const response=await TTRoom.call('interview_decisions',{after});
    if(!Array.isArray(response.decisions))throw Error('Interview decisions are unavailable.');
    all.push(...response.decisions);after=response.nextCursor||'';
    if(++pages>100)throw Error('Too many results to load. Please contact support.');
   }while(after);
   if(current!==generation||!sessionStorage.getItem('ttTownTeacherCode'))return;
   rows=all.sort((a,b)=>Date.parse(b.received_at)-Date.parse(a.received_at));render();
   $('interview-status').textContent='Live · Updated '+new Date().toLocaleTimeString()+'. Refreshes every 10 seconds.';
  }catch(e){if(current===generation)$('interview-status').textContent='Could not refresh interview decisions. '+e.message;}
  finally{busy=false;}
 }
 function clear(){generation++;rows=[];expanded.clear();render();$('interview-status').textContent='Enter your private teacher code to see decisions.';}
 const initialShop=$('interview-shop').value;$('interview-shop').innerHTML='<option value="all">All five shops</option>'+SHOPS.map(([id,name])=>'<option value="'+id+'">'+esc(name)+'</option>').join('');$('interview-shop').value=['all',...SHOPS.map(s=>s[0])].includes(initialShop)?initialShop:'all';
 ['interview-shop','interview-choice'].forEach(id=>$(id).addEventListener('change',render));
 $('interview-search').addEventListener('input',render);
 $('interview-refresh').addEventListener('click',refresh);
 $('interview-print').addEventListener('click',()=>{document.body.classList.add('print-interviews');window.print();});
 window.addEventListener('afterprint',()=>document.body.classList.remove('print-interviews'));
 if(new URLSearchParams(location.search).get('view')==='interviews')document.body.classList.add('interviews-only');
 window.TTInterviewDashboard={refresh,clear};
 render();
})();
