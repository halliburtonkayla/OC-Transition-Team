// A failed module fetch must present a stable error, never an automatic reload loop.
const banner=document.createElement('p');banner.className='boot-notice';banner.setAttribute('role','status');banner.textContent='Opening your adventure…';document.body.prepend(banner);
try{
 await import('./app.mjs');
 banner.remove();document.documentElement.dataset.lifeQuestReady='true';
}catch(error){
 document.documentElement.dataset.lifeQuestReady='false';
 banner.textContent='The adventure could not start. Your saved progress has been kept. Check your connection and reload once, or use the downloaded practice copy.';
 const detail=document.createElement('details'),summary=document.createElement('summary'),message=document.createElement('code');summary.textContent='Loading details';message.textContent=String(error?.message||error).slice(0,300);detail.append(summary,message);banner.append(detail);
 console.error('Life Quest startup failed',error);
}
