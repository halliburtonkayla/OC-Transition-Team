/* A new visit asks for a name; internal Town navigation retains the current visit. */
(function(){'use strict';const here=location.pathname.split('/').pop(),ref=document.referrer;let inside=false;try{const u=new URL(ref);inside=u.origin===location.origin&&u.pathname.startsWith(new URL('../',document.currentScript.src).pathname)}catch{}
const reload=performance.getEntriesByType('navigation')[0]?.type==='reload';const current=sessionStorage.getItem('ttVisitIdentity');
if(!current||(!inside&&!reload)){localStorage.removeItem('ttCurrent');sessionStorage.removeItem('ttCurrent');sessionStorage.removeItem('ttVisitIdentity');sessionStorage.removeItem('ttKaylaPinVerified');}
else{localStorage.ttCurrent=current;sessionStorage.ttCurrent=current;}
window.addEventListener('pageshow',e=>{if(e.persisted){localStorage.removeItem('ttCurrent');sessionStorage.removeItem('ttCurrent');sessionStorage.removeItem('ttVisitIdentity');location.replace(new URL('../transition-town.html',document.currentScript?.src||new URL('assets/town-visit.js',location.href)).href);}});
const teacher=/^(classroom-monitor|pre-ets-session-reports|miss-kayla-inbox)\.html$/.test(here);
if(!teacher&&here!=='transition-town.html'&&!sessionStorage.getItem('ttCurrent')){const base=new URL('../',document.currentScript.src);const go=new URL('transition-town.html',base);go.searchParams.set('next',location.pathname.split('/').pop()+location.search);location.replace(go.href);}
})();
