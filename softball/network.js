import {createClient} from '../assets/vendor/supabase-2.117.2.js';
import {SPORTS_URL,SPORTS_KEY} from '../park-sports-config.js';
import {validState} from './core.js';
const actions=new Set(['pitch','swing','style','advance','hold','switch','kind-fast','kind-change','kind-drop','throw-1','throw-2','throw-3','throw-4','pause']);
export const cleanKeys=k=>({up:!!k?.up,down:!!k?.down,left:!!k?.left,right:!!k?.right});
export function roomCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return [...crypto.getRandomValues(new Uint8Array(8))].map(n=>alphabet[n%alphabet.length]).join('');}
export class SoftballRoom {
 constructor({host,code,onState,onInput,onAction,onReady,onStatus}){
  this.host=host;this.code=code;this.id=crypto.randomUUID();this.peer=null;this.connected=false;this.ready=false;this.seq=0;this.actionSeq=0;this.ack=0;this.pending=[];this.received=performance.now();
  Object.assign(this,{onState,onInput,onAction,onReady,onStatus});
  this.client=createClient(SPORTS_URL,SPORTS_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});
  this.channel=this.client.channel('tt-softball-v2:'+code,{config:{broadcast:{self:false},presence:{key:this.id}}});
  this.channel.on('broadcast',{event:'state'},({payload:p})=>{
   if(this.host||p?.from!==this.peer||p?.to!==this.id||!Number.isInteger(p.seq)||p.seq<=this.seq||!validState(p.game))return;
   this.seq=p.seq;this.received=performance.now();this.pending=this.pending.filter(a=>a.seq>p.ack);this.onState(p.game,!!p.paused);this.setReady(!!p.ready);
  });
  this.channel.on('broadcast',{event:'input'},({payload:p})=>{
   if(!this.host||p?.from!==this.peer||!p?.keys)return;this.received=performance.now();this.onInput(cleanKeys(p.keys));if(this.connected)this.setReady(true);
   if(Array.isArray(p.actions))for(const a of p.actions.slice(0,8)){
    if(!Number.isInteger(a.seq)||a.seq<=this.ack||!actions.has(a.name))continue;
    this.ack=a.seq;if(this.ready)this.onAction(a.name,{pitchId:a.pitchId,pitchT:a.pitchT});
   }
  });
  this.channel.on('presence',{event:'sync'},()=>this.presence());
 }
 setReady(value){if(this.ready!==value){this.ready=value;this.onReady(value);}}
 async connect(){
  this.channel.subscribe(async status=>{
   if(this.closed)return;
   if(status==='SUBSCRIBED'){this.connected=true;await this.channel.track({role:this.host?'host':'guest',joined:Date.now()});if(!this.closed)this.presence();}
   else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){this.connected=false;this.setReady(false);this.onStatus('Connection interrupted. Keep both screens open, or leave and create a new room.');}
  });
  this.timer=setInterval(()=>{
   if(!this.connected)return;
   if(this.ready&&performance.now()-this.received>5000){this.setReady(false);this.onStatus('Connection paused. Waiting for the other player…');}
   if(this.host&&this.game)this.channel.send({type:'broadcast',event:'state',payload:{from:this.id,to:this.peer,seq:++this.seq,ack:this.ack,ready:this.ready,paused:this.paused,game:this.game}});
   else if(!this.host)this.sendInput();
  },80);
 }
 presence(){
  const peers=Object.entries(this.channel.presenceState()).flatMap(([id,rows])=>rows.map(p=>({...p,id})));
  if(this.host){const guest=peers.filter(p=>p.role==='guest').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id))[0];
   if(this.peer!==guest?.id){this.peer=guest?.id||null;this.ack=0;this.received=performance.now();}
   this.setReady(!!this.peer);this.onStatus(this.peer?'Connected · You are Player 1':'Room open · Waiting for Player 2');
  } else {
   const host=peers.find(p=>p.role==='host');this.peer=host?.id||null;
   const first=peers.filter(p=>p.role==='guest').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id))[0];
   if(first&&first.id!==this.id){this.setReady(false);this.onStatus('This room is full. Leave and create a new room.');}
   else this.onStatus(host?'Connected · You are Player 2':'Waiting for the host. Check the code and keep their screen open.');
  }
 }
 sendInput(){if(this.connected)this.channel.send({type:'broadcast',event:'input',payload:{from:this.id,keys:cleanKeys(this.keys),actions:this.pending}});}
 action(name,meta={}){if(!actions.has(name)||this.pending.length>=8)return;this.pending.push({seq:++this.actionSeq,name,pitchId:meta.pitchId,pitchT:meta.pitchT});this.sendInput();}
 publish(game,paused){this.game=game;this.paused=paused;}
 close(){this.closed=true;clearInterval(this.timer);this.channel.untrack();this.client.removeAllChannels();this.client.realtime.disconnect();}
}
