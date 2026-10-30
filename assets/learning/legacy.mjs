import {learningId,learningStore} from './progress.mjs';
const stores=new Map();
window.TTLearning={record(activity,kind,summary,details={}){let store=stores.get(activity);if(!store){store=learningStore(activity);stores.set(activity,store);}store.append({id:learningId(),kind,summary,details});store.event(kind,summary,details);}};
