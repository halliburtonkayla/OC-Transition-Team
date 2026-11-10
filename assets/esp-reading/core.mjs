// Original anonymous, untimed shared reading adventure. No identities or scores.
export const CHAPTERS = ['Pack for the trail', 'Across the creek', 'Light the tower'];
export const STEPS = [
  {place:'At the camp', reward:'Map', short:'Pip is lost. A map can help.', story:'Pip wants to find the tower. He does not know the way. A map shows the path.', question:'What will help Pip find the way?', choices:['Take the map.','Take a nap.','Take a cup.'], win:'Map packed! Pip knows where to go.', x:22, y:77},
  {place:'The forest path', reward:'Trail step', short:'A log is on the path. Pip can hop.', story:'A small log blocks the path. Pip cannot walk through it. He can hop over it.', question:'How can Pip get past the log?', choices:['Hop over it.','Sit on it.','Hide behind it.'], win:'Hop! Pip makes it over the log.', x:30, y:74},
  {place:'The trail fork', reward:'Trail step', short:'The left path is wet. The right path is dry.', story:'The trail splits in two. Mud fills the left path. The path on the right is dry.', question:'Which way keeps Pip out of the mud?', choices:['Go right.','Go left.','Go into the mud.'], win:'Dry paws! Pip follows the right path.', x:37, y:70},
  {place:'By the creek', reward:'Kindness', short:'A duck is stuck. Pip can help it out.', story:'Pip sees a duck stuck in a soft patch of mud. He stops and offers the duck a paw.', question:'What kind thing can Pip do?', choices:['Help the duck.','Walk away.','Hide from the duck.'], win:'A helping paw! The duck is free.', x:43, y:66},
  {place:'The stepping stones', reward:'Trail step', short:'The big rock is dry. The small rock is wet.', story:'Pip finds two rocks in the creek. The small rock is wet and slick. The big rock has a dry top.', question:'Which rock is a better step?', choices:['Step on the big rock.','Step on the small rock.','Step in the creek.'], win:'One good step! Pip crosses the creek.', x:51, y:62},
  {place:'A shady rest', reward:'Snack', short:'Pip is hungry. He has an apple in his bag.', story:'Pip has walked a long way. His tummy rumbles. He finds an apple and a cup in his bag.', question:'What will help his hunger?', choices:['Eat the apple.','Put on the bag.','Look at the cup.'], win:'Crunch! A little rest gives Pip energy.', x:59, y:58},
  {place:'Near the tower', reward:'Key', short:'A key is in the box. Pip lifts the lid.', story:'The tower door is shut. Pip finds a box beside it. A note says the key is inside the box.', question:'Where should Pip look for the key?', choices:['In the box.','Under a rock.','In the creek.'], win:'Key found! The tower is almost ready.', x:67, y:54},
  {place:'The tower door', reward:'Trail step', short:'Pip has the key. He can open the door.', story:'Pip puts the key in the lock. He turns it and hears a click. Now the door can open.', question:'What can Pip do next?', choices:['Open the door.','Find a new key.','Go back to camp.'], win:'Click! Pip opens the tower door.', x:76, y:47},
  {place:'The lantern room', reward:'Light', short:'The lamp is dim. Pip turns the dial.', story:'The sun is low. The tower lamp is dim. Pip finds a dial that can make it bright.', question:'How can Pip make the lamp bright?', choices:['Turn the dial.','Close the door.','Put away the map.'], win:'The lantern glows. You helped light the way!', x:84, y:39}
];
export function shuffle(items, rng = Math.random) {
 const out = [...items];
 for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
 return out;
}
export function makeRun(level = 'short', choiceCount = 3, rng = Math.random) {
 return {version:1, level:level === 'story' ? 'story' : 'short', choiceCount:choiceCount === 2 ? 2 : 3, index:0, phase:'read', choices:STEPS.map(s => shuffle(s.choices.slice(0, choiceCount === 2 ? 2 : 3), rng)), tried:[], helped:false};
}
export function choose(state, text) {
 if (!state || state.phase !== 'read' || !state.choices[state.index]?.includes(text) || state.tried.includes(text)) return state;
 if (text === STEPS[state.index].choices[0]) return {...state, phase:'handoff'};
 return {...state, tried:[...state.tried, text]};
}
export function helpTogether(state) {
 if (!state || state.phase !== 'read') return state;
 return {...state, phase:'handoff', helped:true};
}
export function nextTurn(state) {
 if (!state || state.phase !== 'handoff') return state;
 if (state.index === STEPS.length - 1) return {...state, phase:'complete'};
 return {...state, index:state.index + 1, phase:'read', tried:[], helped:false};
}
export function restoreRun(value) {
 if (!value || value.version !== 1 || !['short','story'].includes(value.level) || ![2,3].includes(value.choiceCount) || !Number.isInteger(value.index) || value.index < 0 || value.index >= STEPS.length || !['read','handoff','complete'].includes(value.phase) || (value.phase === 'complete' && value.index !== STEPS.length - 1) || typeof value.helped !== 'boolean') return null;
 if (!Array.isArray(value.choices) || value.choices.length !== STEPS.length || !value.choices.every((c,i) => Array.isArray(c) && c.length === value.choiceCount && new Set(c).size === value.choiceCount && c.every(t => STEPS[i].choices.slice(0,value.choiceCount).includes(t)))) return null;
 if (!Array.isArray(value.tried) || new Set(value.tried).size !== value.tried.length || !value.tried.every(t => value.choices[value.index].includes(t) && t !== STEPS[value.index].choices[0]) || (value.phase === 'read' && value.helped)) return null;
 return {version:1, level:value.level, choiceCount:value.choiceCount, index:value.index, phase:value.phase, choices:value.choices.map(a => [...a]), tried:[...value.tried], helped:value.helped};
}
