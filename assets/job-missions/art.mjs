import {ITEMS} from './model.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 apple:'<path d="M32 24C13 12 6 32 13 47c7 15 14 12 19 9 8 5 17 2 22-12 6-17-3-28-22-20Z"/><path d="M32 23q-3-12 4-17" fill="none"/><path d="M36 13q7-9 14-3-5 10-14 3" fill="#57986c"/>',
 banana:'<path d="M13 13q-6 30 18 39 20 7 25-13-26 11-37-24Z"/><path d="m12 12 7 3m29 25 7-3"/>',
 carrot:'<path d="m22 22 25 8-33 29Z"/><path d="m25 22-3-16m8 17 6-17m-1 18 13-11" fill="none" stroke="#52865c" stroke-width="5"/>',
 milk:'<path d="m16 20 8-12h17l8 12v38H16Z"/><path d="M16 20h33M24 8v12h25M18 34h29v16H18Z" fill="#fff"/><path d="M27 34q-9 13 5 14 13-2 0-14Z"/>',
 cheese:'<path d="m10 31 33-18 13 18v21H10Z"/><path d="M10 31h46" fill="none"/><circle cx="22" cy="42" r="4" fill="#fff0aa"/><circle cx="43" cy="38" r="3" fill="#fff0aa"/>',
 bread:'<path d="M14 54V29C3 16 23 8 31 16 41 7 62 18 50 29v25Z"/><path d="M21 48V29q-6-12 10-7 19-5 12 7v19Z" fill="#f2d19b"/>',
 can:'<path d="M16 15h32v38H16Z"/><ellipse cx="32" cy="15" rx="16" ry="5" fill="#dce3de"/><path d="M16 27h32v17H16Z" fill="#fff"/><ellipse cx="31" cy="35" rx="9" ry="4"/>',
 box:'<path d="m12 19 20-10 21 10v29L32 59 12 48Z"/><path d="m12 19 20 11 21-11M32 30v29M23 14l21 10v10" fill="none"/>',
 basket:'<path d="m8 28 7 27h35l7-27Z"/><path d="m20 27 12-17 13 17M22 35v12m11-12v12m10-12v12" fill="none"/><circle cx="22" cy="23" r="7" fill="#dc6c58"/><circle cx="42" cy="24" r="8" fill="#e6be52"/>',
 shelf:'<path d="M7 10h50v48H7Z" fill="#e8ddc7"/><path d="M9 32h46M9 52h46" fill="none" stroke-width="4"/><path d="M14 15h11v15H14Zm19 2h15v13H33Zm-17 20h14v13H16Zm22 0h12v13H38Z"/>',
 sock:'<path d="M29 8h22v29q0 11-11 15l-17 7Q9 63 7 51q-1-6 7-9l15-6Z"/><path d="M29 17h22M29 23h22" stroke="#fff" stroke-width="3"/>',
 shirt:'<path d="m21 10-16 9 7 15 9-5v29h24V29l8 5 7-15-17-9q-10 13-22 0Z"/>',
 coat:'<path d="m22 9-14 8-4 27 11 2 6-19-3 31h29l-4-31 6 19 12-2-5-27-15-8-9 9Z"/><path d="m25 10 7 9 7-9M32 20v37" fill="none" stroke="#fff"/>',
 pants:'<path d="M15 9h35l-3 48H34l-2-31-4 31H15Z"/><path d="M16 16h32M32 10v16" fill="none" stroke="#fff"/>',
 shorts:'<path d="M12 14h41v37H35l-3-20-3 20H11Z"/><path d="M13 21h39M32 15v14" fill="none" stroke="#fff"/>',
 hat:'<path d="M12 42q0-28 20-28t20 28Z"/><rect x="8" y="40" width="49" height="13" rx="4"/><circle cx="32" cy="10" r="7"/>',
 boots:'<path d="M10 9h17v30l8 4v14H7V44l3-7Zm28 0h17v30l7 4v14H35V44l3-7Z"/><path d="M7 50h27m1 0h27" stroke="#fff"/>',
 sun:'<circle cx="32" cy="32" r="14"/><path d="M32 3v9m0 40v9M3 32h9m40 0h9M11 11l7 7m28 28 7 7m0-42-7 7M18 46l-7 7" fill="none" stroke-width="4"/>',
 rain:'<path d="M15 35C1 22 18 10 27 17c9-15 29-1 24 10 13 1 11 14 0 14H17Z"/><path d="m17 48-4 9m20-9-4 9m20-9-4 9" fill="none" stroke-width="4"/>',
 snow:'<path d="M32 5v54M8 18l48 28M8 46l48-28M24 9l8 8 8-8M24 55l8-8 8 8M9 27l10-3-1-10M55 37l-10 3 1 10M9 37l10 3-1 10M55 27l-10-3 1-10" fill="none" stroke-width="3"/>',
 towel:'<rect x="10" y="12" width="45" height="42" rx="4"/><path d="M16 16v33m5-33v33M46 16v33" stroke="#fff" fill="none"/>',
 flat:'<path d="m7 22 33-10 19 30-34 14Z"/><path d="m12 24 15 25m7-32 16 25" fill="none" stroke="#fff"/>',
 half:'<path d="m11 26 25-8 18 24-26 10Z"/><path d="M11 26v6l17 26 26-9v-7M8 11q18-15 28 0m-5-8 6 9-11-1" fill="none"/>',
 fold:'<rect x="16" y="23" width="34" height="29" rx="4"/><path d="M17 45h31M11 15q14-15 27 0m-3-8 4 9-11-1" fill="none"/>',
 stack:'<path d="M7 55h52M13 35h39v16H13Zm3-15h33v14H16Z"/><path d="M14 44h36M17 28h30" fill="none" stroke="#fff"/>',
 sandwich:'<path d="m6 34 28-21 25 21-25 21Z"/><path d="m9 36 24 13 23-13M8 30l25 14 24-14" fill="none" stroke="#6b9757" stroke-width="5"/><path d="m6 27 28-18 25 18-25 16Z" fill="#e9cc8f"/>',
 salad:'<path d="M7 32h50Q52 57 32 57T7 32Z"/><circle cx="22" cy="26" r="10" fill="#7da957"/><circle cx="41" cy="25" r="12" fill="#77a75f"/><circle cx="31" cy="20" r="7" fill="#d8664a"/>',
 water:'<path d="M24 8h16v10l7 9v30H17V27l7-9Z"/><path d="M18 32h28v14H18Z" fill="#fff"/><path d="M24 14h16" fill="none"/>',
 fork:'<path d="M32 26v33M21 7v15q0 12 11 12t11-12V7M32 7v17" fill="none" stroke-width="5"/>',
 spoon:'<ellipse cx="32" cy="19" rx="12" ry="15"/><path d="M32 32v27" fill="none" stroke-width="6"/>',
 paper:'<path d="M14 7h28l10 11v39H14Z" fill="#fff"/><path d="M42 7v13h10M22 29h22M22 37h22M22 45h15" fill="none"/>',
 pencil:'<path d="m15 45 28-36 12 9-29 36-16 6Z"/><path d="m15 45 11 9M39 14l12 9M10 60l5-15" fill="none"/><path d="m10 60 9-4-6-5Z" fill="#384d55"/>',
 folder:'<path d="M7 17h19l6 7h25v32H7Z"/><path d="M7 27h50l-6 29H7Z" fill="#a9d6ca"/>',
 crayon:'<path d="M9 24h12v32H9ZM27 17h12v39H27ZM45 27h12v29H45Z"/><path d="m9 24 6-10 6 10m6-7 6-10 6 10m6 10 6-10 6 10" fill="#e4c369"/>',
 glue:'<rect x="20" y="20" width="25" height="36" rx="3"/><path d="M20 20V8h25v12M21 32h23v15H21Z" fill="#fff"/>',
 eraser:'<path d="m8 39 27-27 22 20-27 27H22Z"/><path d="m23 25 21 20-14 14h-8L8 39Z" fill="#e9b3b3"/>',
 envelope:'<rect x="5" y="14" width="54" height="38" rx="4"/><path d="m6 17 26 20 26-20M6 51l17-19m35 19L41 32" fill="none" stroke="#fff"/>',
 art:'<path d="M33 7C5 7-3 43 17 53c10 6 16-4 10-9-7-7 7-12 13-7 18 9 24-26-7-30Z"/><circle cx="18" cy="25" r="4" fill="#edb742"/><circle cx="33" cy="17" r="4" fill="#dc6b62"/><circle cx="46" cy="25" r="4" fill="#7ca8b5"/>',
 book:'<path d="M5 12q15-4 27 4 13-8 27-4v42q-16-4-27 3-12-7-27-3Z"/><path d="M32 16v41M11 24l14 3m14 0 14-3m-42 9 14 3m14 0 14-3" fill="none" stroke="#fff"/>',
 office:'<path d="M8 30h48v10H8Zm5 10v16m38-16v16M19 30V10h28v20" fill="none" stroke-width="5"/><path d="M24 16h18v10H24Z"/>',
 board:'<path d="M7 10h50v34H7Zm25 34v15M20 58l12-14 12 14"/><path d="M16 20h31M16 29h20" fill="none" stroke="#fff"/>',
 ball:'<circle cx="32" cy="32" r="26"/><path d="M6 32h52M32 6v52M13 15q38 17 0 35m38-35q-38 17 0 35" fill="none"/>',
 tray:'<rect x="5" y="19" width="54" height="35" rx="6"/><path d="M9 38h45M28 22v27" fill="none" stroke="#fff"/><circle cx="18" cy="29" r="5" fill="#cfe3a7"/><rect x="35" y="25" width="14" height="9" fill="#e4ba7a"/>',
 clockIn:'<circle cx="31" cy="31" r="25" fill="#fff"/><path d="M31 13v18l10 6M4 49h31m-9-7 9 7-9 7" fill="none" stroke-width="4"/>',
 clockOut:'<circle cx="31" cy="31" r="25" fill="#fff"/><path d="M31 13v18l-9 6M29 49h31m-9-7 9 7-9 7" fill="none" stroke-width="4"/>',
 help:'<path d="M7 9h50v34H32L19 55V43H7Z"/><path d="M25 20q9-10 14 0 0 6-7 8v4m0 4v2" fill="none" stroke="#fff" stroke-width="4"/>',
 hand:'<path d="M16 35V17q4-6 8 0v13-20q4-6 8 0v20-23q4-6 8 0v23-17q4-6 8 0v25l8-9q8-1 6 6L45 57H25L8 40q-3-9 3-9Z"/>',
 question:'<circle cx="32" cy="32" r="25"/><path d="M22 23q8-17 19-4 8 12-9 17v5m0 5v3" fill="none" stroke="#fff" stroke-width="5"/>',
 door:'<path d="M13 58V7h36v51Z"/><path d="M19 58V13h24v45" fill="#fff"/><circle cx="38" cy="35" r="3"/>',
 walk:'<circle cx="33" cy="10" r="6"/><path d="m29 22 5 17-13 19m13-19 12 19M29 22 17 35m12-13 17 11" fill="none" stroke-width="6"/>',
 run:'<circle cx="40" cy="9" r="6"/><path d="m35 21-8 17-16 6m16-6 14 6-1 15M35 21l-12-5-9 7m21-2 8 12 14-1" fill="none" stroke-width="6"/>',
 clean:'<path d="M14 21h22v36H14Zm5 0V10h20l9 8H31v4M42 39l13-9 7 18-15 9Z"/><path d="m52 12 2 7m-7-3h12" fill="none"/>',
 wash:'<path d="M13 23V10h24v13H27v-7h-7v7M17 37q7-7 13 0l11-6q10 1 6 7L31 49H14Z"/><path d="m31 23-3 7m9-7-2 7" fill="none"/>',
 check:'<circle cx="32" cy="32" r="26"/><path d="m17 33 10 10 21-23" fill="none" stroke="#fff" stroke-width="5"/>',
 fix:'<path d="M49 20A23 23 0 1 0 54 42M49 7v16H34" fill="none" stroke-width="5"/><path d="m20 34 9 9 16-17" fill="none" stroke-width="4"/>',
 star:'<path d="m32 4 9 18 20 3-14 15 3 21-18-10-19 10 4-21L2 25l21-3Z"/>'
};
export function icon(id,cls='pict',extra=''){
 const a=ITEMS[id]||{shape:id,color:'#558e91',label:id};
 let body=paths[a.shape]||paths.box;
 if(a.shape==='sock'&&a.pattern==='dots')body=body.replace('<path d="M29 17h22M29 23h22" stroke="#fff" stroke-width="3"/>','<g fill="#fff" stroke="none"><circle cx="35" cy="17" r="2"/><circle cx="44" cy="25" r="2"/><circle cx="35" cy="31" r="2"/></g>');
 return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="${a.color}" stroke="#304653" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" ${extra}>${body}</svg>`;
}
const person=(x,y,shirt,skin='#a8785d',smile=true)=>`<g transform="translate(${x} ${y})"><path d="M-18 81v-28q18-16 36 0v28" fill="${shirt}"/><path d="M-12 81v25m24-25v25" stroke="#394d62" stroke-width="11"/><circle cy="26" r="17" fill="${skin}"/><path d="M-17 24q-3-26 17-23 21-1 17 24l-8-12-23 8Z" fill="#39404c"/><circle cx="-6" cy="27" r="1.8" fill="#283e49"/><circle cx="6" cy="27" r="1.8" fill="#283e49"/><path d="M-5 35q5 ${smile?6:0} 10 0" fill="none" stroke="#613f35" stroke-width="2"/></g>`;
export function scene(mission,celebrate=false){
 const tones={store:['#d6e8dd','#4d8f76'],laundry:['#e4dff1','#8374ac'],lunch:['#f2e4ca','#c3965b'],mail:['#dce9f2','#5c91b3'],supply:['#efdee5','#b5748b'],helper:['#dde4ee','#6b85ad']};
 const [wall,accent]=tones[mission]||tones.helper;
 const mini=(id,x,y,size=43)=>`<g transform="translate(${x} ${y}) scale(${size/64})">${icon(id).replace('<svg ', '<svg width="64" height="64" ')}</g>`;
 let room='';
 if(mission==='laundry')room='<rect x="20" y="58" width="90" height="91" rx="7" fill="#fff"/><circle cx="65" cy="108" r="29" fill="#bdd7e0" stroke="#637e91" stroke-width="6"/><path d="M37 111q22-30 51 0" fill="#8f93b5"/><circle cx="94" cy="69" r="4" fill="#99bcb2"/>'+mini('stack',140,45,60)+mini('redSock',148,115,42);
 else if(mission==='mail')room='<rect x="17" y="29" width="173" height="125" rx="5" fill="#a9c6d6"/>'+[0,1,2,3,4,5].map((_,i)=>`<rect x="${26+i%3*54}" y="${39+Math.floor(i/3)*54}" width="44" height="43" rx="3" fill="#f9f7ef"/>`+mini(['art','library','office','gym','classroom','envelope'][i],29+i%3*54,40+Math.floor(i/3)*54,35)).join('');
 else if(mission==='helper')room='<rect x="20" y="30" width="140" height="100" rx="5" fill="#fff"/><path d="M35 55h100M35 80h100M35 105h70" stroke="#cad9df" stroke-width="4"/>'+mini('clockIn',164,40,48)+mini('check',29,40,25)+mini('folder',29,69,25)+mini('clockOut',29,96,25);
 else room='<rect x="19" y="32" width="170" height="119" rx="5" fill="#faf8ef"/><path d="M24 91h160M24 146h160" stroke="'+accent+'" stroke-width="6"/>'+[0,1,2,3,4,5].map((_,i)=>mini((mission==='store'?['apple','milk','bread','cereal','banana','cheese']:mission==='lunch'?['sandwich','salad','milk','fork','spoon','napkin']:['pencil','folder','paper','crayon','glue','eraser'])[i],27+i%3*51,40+Math.floor(i/3)*55,43)).join('');
 return `<svg class="room-scene ${celebrate?'celebrate':''}" viewBox="0 0 380 220" aria-hidden="true" focusable="false"><path fill="${wall}" d="M0 0h380v220H0Z"/><path fill="#c9b99e" d="M0 165h380v55H0Z"/><path d="M0 165h380" stroke="#ffffff" stroke-width="4"/><rect x="265" y="22" width="94" height="82" rx="6" fill="#fff8dd"/><path d="M310 24v78M268 63h87" stroke="#c1d7dc" stroke-width="5"/>${room}${person(248,43,accent,'#b47f61',true)}${person(323,61,'#e2bb72','#e0b391',true)}<rect x="189" y="151" width="185" height="18" rx="5" fill="${accent}"/><rect x="201" y="169" width="159" height="45" fill="#e4d9c4"/>${celebrate?'<g fill="#e8b33f"><path d="m220 27 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/><circle cx="292" cy="18" r="5"/><path d="m354 119 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"/></g>':''}</svg>`;
}
export function puzzlePiece(piece){return scene('store',true).replace('class="room-scene celebrate"','class="puzzle-art"').replace('viewBox="0 0 380 220"',`viewBox="${piece%2*190} ${Math.floor(piece/2)*110} 190 110"`);}
