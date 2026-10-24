/* Draw the existing Town avatar colors and hairstyle as a walking character. */
(function(){'use strict';
const portraits=new Map();
function drawBusinessAvatar(ctx,x,y,name,time,moving,scale){
const owner=window.TTBusinessAvatars?.[name];if(!owner?.image)return false;
let img=portraits.get(owner.image);if(!img){img=new Image();img.src=owner.image;portraits.set(owner.image,img)}
const bob=moving?Math.sin(time*10)*2:0,r=35;
ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
ctx.fillStyle='#102b3544';ctx.beginPath();ctx.ellipse(0,3,29,8,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(0,-43+bob,r,0,Math.PI*2);ctx.fillStyle='#fffbea';ctx.fill();
if(img.complete&&img.naturalWidth){
let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;
if(owner.walkingCrop){const c=owner.walkingCrop;sx=c[0]*sw;sy=c[1]*sh;sw*=c[2];sh*=c[3]}
else if(owner.size!=='contain'){const size=owner.size.split(' ').map(parseFloat),pos=owner.position.split(' ').map(parseFloat);sw=img.naturalWidth/(size[0]/100);sh=img.naturalHeight/((size[1]||size[0])/100);sx=(img.naturalWidth-sw)*(pos[0]||0)/100;sy=(img.naturalHeight-sh)*(pos[1]||0)/100;}
const side=Math.min(sw,sh);sx+=(sw-side)/2;sy+=(sh-side)/2;
ctx.save();ctx.clip();ctx.drawImage(img,sx,sy,side,side,-r,-43+bob-r,r*2,r*2);ctx.restore();
}else{ctx.fillStyle='#51406d';ctx.font='bold 25px Arial';ctx.textAlign='center';ctx.fillText(name[0],0,-34+bob)}
ctx.strokeStyle='#fffbea';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-43+bob,r,0,Math.PI*2);ctx.stroke();ctx.restore();return true;
}
window.TTDrawAvatar=function(ctx,x,y,a={},time=0,moving=false,scale=1,name=''){
if(drawBusinessAvatar(ctx,x,y,name,time,moving,scale))return;
a=a||{};
const safe=(v,d)=>/^#[0-9a-f]{3,8}$/i.test(v||'')?v:d,skin=safe(a.skin,'#9b654b'),hair=safe(a.hair,'#33231f'),shirt=safe(a.shirt,'#6c57a7'),pants=safe(a.pants,'#33435e'),step=moving?Math.sin(time*12)*5:0;
ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#102b3533';ctx.beginPath();ctx.ellipse(0,3,19,7,0,0,Math.PI*2);ctx.fill();
function rect(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
rect(-12,-24+step,10,25,4,pants);rect(3,-24-step,10,25,4,pants);rect(-14,-4+step,13,7,3,'#253245');rect(2,-4-step,14,7,3,'#253245');
if(a.hairStyle==='Long')rect(-18,-69,36,42,12,hair);
rect(-18,-46,36,30,9,shirt);rect(-25,-43-step,9,27,5,skin);rect(16,-43+step,9,27,5,skin);rect(-5,-53,10,12,4,skin);
ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,-63,18,21,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(0,-77,19,10,0,0,Math.PI*2);ctx.fill();rect(-19,-76,5,16,3,hair);
if(a.hairStyle==='Curls'){for(let i=-16;i<=16;i+=8){ctx.beginPath();ctx.arc(i,-80+Math.abs(i)*.17,6,0,Math.PI*2);ctx.fill()}}
ctx.fillStyle='#1c2734';ctx.beginPath();ctx.arc(-6,-62,2,0,7);ctx.arc(6,-62,2,0,7);ctx.fill();ctx.strokeStyle='#643c37';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,-57,5,.15,Math.PI-.15);ctx.stroke();
if(/glasses/i.test(a.outfit||'')){ctx.strokeStyle='#26354b';ctx.strokeRect(-11,-66,9,8);ctx.strokeRect(2,-66,9,8);ctx.beginPath();ctx.moveTo(-2,-62);ctx.lineTo(2,-62);ctx.stroke()}
ctx.restore();};
})();
