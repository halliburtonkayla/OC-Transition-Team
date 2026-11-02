import test from 'node:test';
import assert from 'node:assert/strict';
import {makeLevel,applyPour,isWon,solve,pourInfo,clone} from '../assets/prism-pour/engine.mjs';

test('every level has a legal, color-conserving route to completion',()=>{
 const identities=new Set();
 for(let level=1;level<=30;level++){
  const puzzle=makeLevel(level);let board=puzzle.board;
  const colors=board.flat().sort().join(',');
  assert.equal(board.length,9);assert.ok(!isWon(board));
  assert.equal(board.flat().length,level>20?28:24);
  identities.add(JSON.stringify(board));
  for(const [from,to] of puzzle.solution){
   const before=clone(board),next=applyPour(board,from,to);
   assert.ok(next,`Level ${level}, ${from} → ${to}`);
   assert.deepEqual(board,before,'Pouring does not mutate previous states');
   assert.ok(next.board.every(b=>b.length<=4));
   assert.equal(next.board.flat().sort().join(','),colors);
   board=next.board;
  }
  assert.ok(isWon(board),`Level ${level} completes`);
  assert.deepEqual(makeLevel(level).board,puzzle.board,'Restart is deterministic');
 }
 assert.equal(identities.size,30);
});

test('hint solver finds and returns valid solutions for all 30 starting boards',()=>{
 for(let level=1;level<=30;level++){
  let board=makeLevel(level).board;const solution=solve(board);
  assert.ok(solution?.length,`Level ${level} has a hint`);
  for(const [from,to] of solution){const next=applyPour(board,from,to);assert.ok(next);board=next.board;}
  assert.ok(isWon(board));
 }
});

test('pouring honors top color, available room, and contiguous layers',()=>{
 assert.equal(pourInfo([[0,1],[0]],0,1),null);
 assert.equal(pourInfo([[],[0]],0,1),null);
 assert.equal(pourInfo([[0],[0,0,0,0]],0,1),null);
 assert.equal(pourInfo([[0]],0,0),null);
 assert.equal(pourInfo([[1,0,0],[0,0,0]],0,1).count,1);
 assert.deepEqual(applyPour([[1,0,0],[]],0,1).board,[[1],[0,0]]);
 assert.equal(pourInfo([[1,0,0],[]],0,1).color,0);
});

test('winning requires full, single-color bottles',()=>{
 assert.equal(isWon([[0,0],[1,1,1,1],[]]),false);
 assert.equal(isWon([[0,0,0,1],[],[]]),false);
 assert.equal(isWon([[0,0,0,0],[1,1,1,1],[]]),true);
});
