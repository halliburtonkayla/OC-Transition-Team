import {createClient} from '../assets/vendor/supabase-2.117.2.js';
import {SPORTS_URL,SPORTS_KEY} from '../park-sports-config.js';
import {validState,ACTIONS,clamp} from './engine.js';
export const cleanInput=k=>({x:Number.isFinite(k?.x)?clamp(k.x,-1,1):0,y:Number.isFinite(k?.y)?clamp(k.y,-1,1):0,sprint:k?.sprint===true});
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const roomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%alphabet.length]).join('');
export const validCode=c=>typeof c==='string'&&/^[A-HJ-NP-Z2-9]{8}$/.test(c);
// Ephemeral game data only. No town profiles, messages or student information.
export class Room{
 constructor({host,code,team,onState,onAction,onPeer,onStatus}){
  Object.assign(this,{host,code,team,onState,onAction,onPeer,onStatus});this.id=crypto.randomUUID();this.connected=false;this.closed=false;this.hostId=host?this.id:null;this.guestId=null;this.peer=null;this.input=cleanInput({});this.remoteInput=cleanInput({});this.paused=false;this.remotePaused=false;this.lastInput=0;this.lastState=0;this.seq=0;this.inputSeq=0;this.acceptedInput=0;this.actionSeq=0;this.acceptedAction=0;this.pending=[];this.receivedSeq=0;this.joined=Date.now();
 }
 async connect(){
  this.client=createClient(SPORTS_URL,SPORTS_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});
  const c=this.client.channel('tt-football-v1:'+this.code,{config:{broadcast:{self:false},presence:{key:this.id}}});this.channel=c;
  c.on('presence',{event:'sync'},()=>this.presence());
  c.on('broadcast',{event:'state'},({payload:p})=>{
   if(this.closed||this.host||!p||p.host!==this.hostId||p.guest!==this.id||!Number.isInteger(p.seq)||p.seq<=this.receivedSeq||!validState(p.game))return;
   this.receivedSeq=p.seq;this.lastState=performance.now();this.pending=this.pending.filter(a=>a.seq>p.ack);this.onState(p);
  });
  c.on('broadcast',{event:'input'},({payload:p})=>{
   if(this.closed||!this.host||!p||p.id!==this.guestId||!Number.isInteger(p.seq)||p.seq<=this.acceptedInput)return;
   this.acceptedInput=p.seq;this.lastInput=performance.now();this.remoteInput=cleanInput(p.keys);this.remotePaused=p.paused===true;
   if(Array.isArray(p.actions))for(const a of p.actions.slice(0,16)){
    if(!a||!Number.isInteger(a.seq)||a.seq<=this.acceptedAction||!ACTIONS.includes(a.name))continue;
    this.acceptedAction=a.seq;this.onAction(a.name);
   }
  });
  c.subscribe(async state=>{
   if(this.closed)return;
   if(state==='SUBSCRIBED'){
    this.connected=true;const result=await c.track({role:this.host?'host':'guest',team:this.team,joined:this.joined});
    if(this.closed)return;if(result!=='ok'){this.onStatus('Could not enter the room. Leave and try again.');return;}this.presence();
   }else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(state)){
    this.connected=false;this.remoteInput=cleanInput({});this.onStatus('Connection interrupted. Reconnecting… Keep both games open.');
   }
  });
  this.timeout=setTimeout(()=>{if(!this.peer&&!this.closed)this.onStatus(this.host?'Room is open. Your friend can join with the code.':'No host found. Check the code and keep the creator’s game open.');},12000);
 }
 presence(){
  if(this.closed)return;
  const peers=Object.entries(this.channel.presenceState()).flatMap(([id,ps])=>ps.map(p=>({...p,id}))).filter(p=>['host','guest'].includes(p.role)&&typeof p.team==='string'&&/^\d{1,5}$/.test(p.team)&&Number.isFinite(p.joined));
  const hosts=peers.filter(p=>p.role==='host').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));
  if(this.host){
   if(hosts[0]&&hosts[0].id!==this.id){this.connected=false;this.onStatus('Room code collision. Leave and create a new room.');return;}
   const guests=peers.filter(p=>p.role==='guest').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));
   const peer=guests.find(p=>p.id===this.guestId)||guests[0]||null;
   if(peer?.id!==this.guestId){this.lastInput=0;this.acceptedInput=0;this.acceptedAction=0;this.remoteInput=cleanInput({});}
   this.peer=peer;this.guestId=peer?.id||null;this.onPeer(peer);
  }else{
   const host=hosts[0];if(this.hostId!==host?.id){this.receivedSeq=0;this.lastState=0;}this.hostId=host?.id||null;this.peer=host||null;
   const guests=peers.filter(p=>p.role==='guest').sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));
   if(guests[0]&&guests[0].id!==this.id){this.onStatus('This room is full — two players are already here. Create another room.');this.peer=null;}
   else{this.onPeer(host||null);if(!host)this.onStatus('Waiting for the creator. Check your room code.');}
  }
 }
 sendAction(name){if(this.pending.length<16)this.pending.push({seq:++this.actionSeq,name});this.sendInput();}
 sendInput(){if(!this.connected||this.host||this.closed||!this.peer)return;void this.channel.send({type:'broadcast',event:'input',payload:{id:this.id,seq:++this.inputSeq,keys:this.input,paused:this.paused,actions:this.pending}});}
 sendState(game,started,ready){if(!this.connected||!this.host||this.closed)return;void this.channel.send({type:'broadcast',event:'state',payload:{host:this.id,guest:this.guestId,seq:++this.seq,ack:this.acceptedAction,started,ready,game}});}
 healthy(){return this.connected&&!!this.peer&&(this.host?performance.now()-this.lastInput<1800:performance.now()-this.lastState<2200);}
 close(){this.closed=true;clearTimeout(this.timeout);this.input=cleanInput({});this.remoteInput=cleanInput({});if(this.channel){void this.channel.untrack();void this.client.removeChannel(this.channel);}this.client?.realtime.disconnect();}
}
