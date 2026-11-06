import {atlasCells} from './atlas-grid.mjs';
const atlas=(path,cols,rows)=>{
 const a={image:new Image(),cells:null};a.image.onload=()=>{
  const im=a.image,canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  a.cells=atlasCells(canvas.width,canvas.height,cols,rows).map(({x:ox,y:oy,w:cw,h:ch})=>{let x0=cw,y0=ch,x1=0,y1=0;
   const seen=new Uint8Array(cw*ch);let largest=0,bounds=null;
   for(let y=1;y<ch-1;y++)for(let x=1;x<cw-1;x++){
    const index=y*cw+x;if(seen[index]||rgba[((oy+y)*canvas.width+ox+x)*4+3]<=110)continue;
    const queue=[index];seen[index]=1;let count=0,bx0=x,bx1=x,by0=y,by1=y;
    for(let q=0;q<queue.length;q++){const p=queue[q],px=p%cw,py=Math.floor(p/cw);count++;bx0=Math.min(bx0,px);bx1=Math.max(bx1,px);by0=Math.min(by0,py);by1=Math.max(by1,py);
     for(const [nx,ny]of [[px-1,py],[px+1,py],[px,py-1],[px,py+1]]){if(nx<1||ny<1||nx>=cw-1||ny>=ch-1)continue;const ni=ny*cw+nx;if(seen[ni]||rgba[((oy+ny)*canvas.width+ox+nx)*4+3]<=110)continue;seen[ni]=1;queue.push(ni);}
    }
    if(count>largest){largest=count;bounds=[bx0,by0,bx1,by1];}
   }
   if(bounds)[x0,y0,x1,y1]=bounds;
   return {x:ox+x0,y:oy+y0,w:x1-x0+1,h:y1-y0+1};
  });
 };a.image.src=new URL(path,import.meta.url).href;return a;
};
const props=atlas('./art/room-props.webp',3,3),cars=atlas('./art/traffic-sprites.webp',3,2);
export function drawProp(ctx,index,x,y,width=140,height=110){
 if(!props.cells)return false;const p=props.cells[index],k=Math.min(width/p.w,height/p.h),w=p.w*k,h=p.h*k;
 ctx.save();ctx.fillStyle='#13284e40';ctx.beginPath();ctx.ellipse(x,y+3,w*.48,9,0,0,Math.PI*2);ctx.fill();ctx.drawImage(props.image,p.x,p.y,p.w,p.h,x-w/2,y-h,w,h);ctx.restore();return true;
}
export function drawVehicle(ctx,h){
 if(!cars.cells)return false;const index=h.w>130?4:([0,1,2,3,5][(h.color??h.lane)%5]),p=cars.cells[index];
 ctx.save();ctx.translate(h.x,h.y);if(h.speed<0)ctx.scale(-1,1);ctx.fillStyle='#06152f55';ctx.beginPath();ctx.ellipse(0,12,h.w*.48,20,0,0,Math.PI*2);ctx.fill();ctx.drawImage(cars.image,p.x,p.y,p.w,p.h,-h.w/2,-25,h.w,50);ctx.restore();return true;
}
