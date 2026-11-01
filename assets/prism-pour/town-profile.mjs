import {learningStore} from '../learning/progress.mjs';

// Match the school's per-profile learning storage. Never read or change Town balances.
export function createProfileStorage(host){
 const identity=()=>{try{return host.sessionStorage.getItem('ttCurrent')||host.localStorage.getItem('ttCurrent')||'Guest';}catch{return 'Guest';}};
 const student=identity(),namedStudent=!/guest|kayla/i.test(student);
 const prefix='ttPrism:v1:'+encodeURIComponent(student)+':';
 let backend;try{backend=namedStudent?host.localStorage:host.sessionStorage;}catch{}
 return {student,namedStudent,
  getItem(key){if(identity()!==student)throw new Error('Town profile changed. Open the game again.');return backend?.getItem(prefix+key)??null;},
  setItem(key,value){if(identity()!==student)throw new Error('Town profile changed. Open the game again.');if(!backend)throw new Error('Saving unavailable');backend.setItem(prefix+key,value);}
 };
}
export const profileStorage=typeof window==='undefined'?null:createProfileStorage(window);
export const schoolProfile=profileStorage?{student:profileStorage.student,namedStudent:profileStorage.namedStudent}:{student:'Guest',namedStudent:false};
export const townLearning=typeof window==='undefined'?null:learningStore('prism-pour');
