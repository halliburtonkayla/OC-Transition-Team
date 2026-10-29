export const LEVELS = [
  {id:'first',min:1,max:5,label:'1–5',place:'Market Square',tag:'START HERE',subtitle:'Meet your first five numbers.',picture:'apple',color:'mint'},
  {id:'ten',min:1,max:10,label:'1–10',place:'Courtside',tag:'BUILD YOUR SKILLS',subtitle:'Keep counting. Go all the way to ten.',picture:'ball',color:'peach'},
  {id:'twenty',min:11,max:20,label:'11–20',place:'Delivery District',tag:'YOUR NEXT ADVENTURE',subtitle:'Discover ten and a little more.',picture:'parcel',color:'purple'},
  {id:'thirty',min:21,max:30,label:'21–30',place:'City Lights',picture:'parcel',color:'mint'},
  {id:'fifty',min:31,max:50,label:'31–50',place:'Skyline Station',picture:'ball',color:'peach'},
  {id:'seventyfive',min:51,max:75,label:'51–75',place:'Summit Trail',picture:'apple',color:'purple'},
  {id:'hundred',min:76,max:100,label:'76–100',place:'The Grand Lookout',picture:'parcel',color:'mint'}
];
export const MODES = [
  {id:'count',name:'Touch & count',icon:'☝',description:'Touch each picture. Hear every number.'},
  {id:'match',name:'Match the group',icon:'▦',description:'Match a number to a group of pictures.'},
  {id:'numeral',name:'Find the number',icon:'7',description:'Hear a number. Find its numeral.'},
  {id:'next',name:'What comes next?',icon:'→',description:'Follow the number path. Find the next number.'}
];
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
export function word(n){return n===100?'one hundred':n<20?ONES[n]:TENS[Math.floor(n/10)]+(n%10?' '+ONES[n%10]:'');}
export function shuffle(values,random=Math.random){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function optionsFor(answer,min,max,size=2,random=Math.random){
  const pool=Array.from({length:max-min+1},(_,i)=>min+i).filter(n=>n!==answer);
  const nearby=pool.filter(n=>Math.abs(n-answer)<=3),rest=pool.filter(n=>!nearby.includes(n));
  return shuffle([answer,...shuffle(nearby,random).concat(shuffle(rest,random)).slice(0,size-1)],random);
}
export function questions(level,mode,size=2,random=Math.random){
  if(!LEVELS.includes(level)||!MODES.some(m=>m.id===mode))throw Error('Choose a known mission.');
  if(level.min>20&&mode!=='next')throw Error('Original levels use next-number practice.');
  // Never require zero, six, eleven, or 101 outside the selected range.
  const min=mode==='next'&&level.min===1?2:level.min;
  return Array.from({length:level.max-min+1},(_,i)=>{
    const answer=min+i;
    return {id:i,mode,answer,previous:answer-1,picture:level.picture,options:optionsFor(answer,level.min,level.max,size,random)};
  });
}
export class Round {
  constructor(question){this.q=question;this.touched=new Map();this.attempts=0;this.helpUsed=false;this.solved=false;this.recounts=0;}
  touch(index){
    if(this.q.mode!=='count'||!Number.isInteger(index)||index<0||index>=this.q.answer||this.solved)return null;
    if(this.touched.has(index))return {number:this.touched.get(index),fresh:false};
    const number=this.touched.size+1;this.touched.set(index,number);return {number,fresh:true};
  }
  get ready(){return this.q.mode!=='count'||this.touched.size===this.q.answer;}
  answer(value){
    if(this.solved||!this.ready||!this.q.options.includes(value))return null;
    this.attempts++;if(value===this.q.answer){this.solved=true;return true;}return false;
  }
  recount(){if(this.solved||this.q.mode!=='count')return false;this.touched.clear();this.recounts++;this.helpUsed=true;return true;}
  help(){if(!this.solved)this.helpUsed=true;}
}
