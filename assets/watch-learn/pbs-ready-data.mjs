// Short source excerpts verified against the PBS transcript. Do not add transcript copies.
export const PBS_VIDEO={
 title:'What are the MOST Essential Skills for Job Seekers?',
 source:'https://www.pbs.org/video/what-are-the-most-essential-skills-for-job-seekers-lsrp7h/',
 embed:'https://player.pbs.org/viralplayer/3072467436/',
 publisher:'CET/ThinkTV Education · PBS',duration:'6:52',
 studentPdf:'printables/watch-learn-pbs-ready-student.pdf'
};
export const QUESTIONS=Object.freeze([
 {before:"It's being logical and ",after:'.',answer:'informed'},
 {before:'Trust is at the foundation of all ',after:'.',answer:'collaboration'},
 {before:'Empathy is the ',after:' that holds the team together.',answer:'glue'}
]);
export const WORD_BANK=Object.freeze(['glue','informed','collaboration']);
export function placeWord(answers,word,index){
 if(!WORD_BANK.includes(word)||!Number.isInteger(index)||index<0||index>=QUESTIONS.length)return [...answers];
 const next=answers.map(w=>w===word?'':w);next[index]=word;return next;
}
export function checkAnswers(answers){return QUESTIONS.map((q,i)=>answers[i]===q.answer);}
