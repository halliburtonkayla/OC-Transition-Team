/* Final rule layer, shared by the existing browser and Edge Function. */
(function(g){'use strict';
const C=g.TTBusinessCore,base=C.reduce,restricted=s=>['3k-tire-shop','main-attraction'].includes(s.shop)&&s.pricingApproval?.approved!==true;
const financial=new Set(['prices','tire-prices','studio-prices','purchase','new-order','payment','tire-payment','tire-order','bank-transfer','pay-bill','payroll','owner-pay','staff','start-day','studio-start','studio-checkout','studio-tips','wd-start','complete-item','tire-complete','studio-step','open']);
function check(s,a){if(!restricted(s))return;
 const legacy=a.type==='salon-service'&&['book','pay','purchase','step','supplies'].includes(a.service?.type);
 const active=s.day?.active||s.workday?.active;
 if(financial.has(a.type)||legacy||(active&&['tick','studio-tick','wd-tick','end-day','studio-end','wd-end','wd-read'].includes(a.type))||(a.type==='wd-step'&&s.workday?.phase==='shift'))throw Error('Miss Kayla must approve this business’s pricing stage before sales, prices, supply spending, wages, or paid shifts. Interviews and free opening practice remain available.');
}
C.reduce=function(previous,a,id,now){check(previous,a);return base(previous,a,id,now);};
g.TTBusinessPricing={restricted,check};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{const page=location.pathname.split('/').pop(),shop=new URLSearchParams(location.search).get('shop')||(/main-attraction/.test(page)?'main-attraction':'');if(!['3k-tire-shop','main-attraction'].includes(shop))return;const note=document.createElement('aside');note.className='pricing-stage-notice';note.style.cssText='padding:14px 20px;background:#fff3d4;border:1px solid #d0af56;color:#432f14;font:16px/1.5 system-ui';note.innerHTML='Pricing is teacher controlled. Until Miss Kayla approves this stage, use interviews, opening checks, and free workstation practice. <a href="classroom-monitor.html#business">Miss Kayla: review pricing stage</a>';document.body.prepend(note);});
})(globalThis);
