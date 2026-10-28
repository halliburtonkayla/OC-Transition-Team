// Clock pauses at scene boundaries until narration finishes; speech is never cut off by a timer.
export class LessonClock{
 constructor(scenes,onChange=()=>{}){this.scenes=scenes;this.onChange=onChange;this.index=0;this.elapsed=0;this.playing=false;this.ended=false;this.narrationDone=false;this.answerPause=false;this.pauseAtAnswers=false;}
 get duration(){return this.scenes.reduce((n,s)=>n+s.duration,0);}
 get position(){return this.scenes.slice(0,this.index).reduce((n,s)=>n+s.duration,0)+this.elapsed;}
 play(){if(this.ended)this.seek(0);this.playing=true;this.answerPause=false;this.onChange('play');}
 pause(){this.playing=false;this.onChange('pause');}
 seek(index){this.index=Math.max(0,Math.min(this.scenes.length-1,index));this.elapsed=0;this.ended=false;this.narrationDone=false;this.answerPause=false;this.onChange('scene');}
 narrationEnded(){this.narrationDone=true;}
 tick(delta){if(!this.playing||this.ended)return;this.elapsed=Math.min(this.scenes[this.index].duration,this.elapsed+Math.max(0,delta));this.onChange('tick');if(this.elapsed<this.scenes[this.index].duration||!this.narrationDone)return;if(this.pauseAtAnswers&&this.scenes[this.index].question&&!this.answerPause){this.playing=false;this.answerPause=true;this.onChange('answer-pause');return;}this.next();}
 next(){if(this.index===this.scenes.length-1){this.playing=false;this.ended=true;this.onChange('end');return;}this.index++;this.elapsed=0;this.narrationDone=false;this.answerPause=false;this.onChange('scene');}
 continueAfterAnswer(){if(!this.answerPause)return this.play();this.answerPause=false;this.playing=true;this.next();}
}
export class ReviewRound{
 constructor(questions){this.questions=questions;this.index=0;this.correct=false;this.done=false;this.attempts=0;}
 answer(id){if(this.correct||this.done)return null;this.attempts++;this.correct=id===this.questions[this.index].answer;return this.correct;}
 next(){if(!this.correct)return false;this.index++;this.correct=false;this.done=this.index===this.questions.length;return true;}
}
