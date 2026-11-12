(function(){'use strict';if(window.TTEmploymentLoading)return;window.TTEmploymentLoading=true;
const root=new URL('./',document.currentScript.src);const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('employment.css',root);document.head.append(css);
(async()=>{for(const file of ['core.js','questions.js','client.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(file,root);s.onload=resolve;s.onerror=reject;document.head.append(s);});})().catch(()=>{window.TTEmploymentLoading=false;});
})();
