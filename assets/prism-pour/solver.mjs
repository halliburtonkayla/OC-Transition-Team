import {solve} from './engine.mjs';
self.onmessage=({data})=>{self.postMessage({id:data.id,key:data.key,solution:solve(data.board)});};
