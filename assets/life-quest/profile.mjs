// Read the current Town profile only. No avatar, ledger, roster, or original game writes.
import {safeAvatar} from '../transition-mission/core.mjs';
export const currentStudent=(host=globalThis)=>{try{return host.sessionStorage.getItem('ttCurrent')||host.localStorage.getItem('ttCurrent')||'Guest';}catch{return 'Guest';}};
export function profileFor(student,host=globalThis){
 let resident=null;try{resident=JSON.parse(host.localStorage.getItem('ttWorld')||'{}').residents?.[student]||null;}catch{}
 const avatar=safeAvatar(resident?.avatar),owner=host.TTBusinessAvatars?.[student];
 return {student,school:String(resident?.school||'School not recorded on this device'),avatar:avatar||{skin:'#9b654b',hair:'#33231f',shirt:'#6c57a7',pants:'#33435e',hairStyle:'Curls',outfit:'Everyday'},owner:owner?.image?owner:null,source:avatar?'Saved Town character':owner?.image?'Assigned Town character':'Adventure default',reference:avatar?'ttWorld.residents[current].avatar':owner?.image?owner.image:'life-quest:default'};
}
