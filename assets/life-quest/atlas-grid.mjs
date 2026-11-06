// Atlas dimensions need not divide evenly by the number of frames. Floor both
// boundaries, rather than reading pixel data at fractional row offsets.
export const atlasCells=(width,height,columns,rows)=>Array.from({length:columns*rows},(_,i)=>{
 const col=i%columns,row=Math.floor(i/columns),x=Math.floor(col*width/columns),y=Math.floor(row*height/rows);
 return {x,y,w:Math.floor((col+1)*width/columns)-x,h:Math.floor((row+1)*height/rows)-y};
});
