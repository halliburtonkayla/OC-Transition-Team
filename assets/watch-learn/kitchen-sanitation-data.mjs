// Public educational narration by CDC and USDA. Keep the listening excerpts in playback order.
export const KITCHEN_LESSON_ID='kitchen-sanitation';
export const KITCHEN_STUDENT_PDF='printables/watch-learn-kitchen-sanitation-student.pdf';
export const KITCHEN_TEACHER_PDF='printables/watch-learn-kitchen-sanitation-teacher.pdf';
export const KITCHEN_VIDEOS=Object.freeze([
 {id:'eZw4Ga3jg3E',title:'Fight Germs. Wash Your Hands!',publisher:'CDC',duration:'3:00',heading:'Wash your hands'},
 {id:'JFq4sWTzTA8',title:'The Importance of Cleaning and Washing During Food Preparation',publisher:'USDA Food Safety',duration:'2:51',heading:'Clean food preparation'},
 {id:'Xm_X5LJmrbw',title:'How Does Cross-Contamination Happen?',publisher:'USDA Food Safety',duration:'3:12',heading:'Prevent contamination'}
]);
export const KITCHEN_QUESTIONS=Object.freeze([
 {part:0,before:'Dirty hands spread ',answer:'disease',after:'.'},
 {part:0,before:'First, wet your hands with clean running water, turn off the tap, and apply ',answer:'soap',after:'.'},
 {part:0,before:'Scrub your hands for at least ',answer:'20',after:' seconds.'},
 {part:0,before:'Rinse your hands well under clean, running ',answer:'water',after:'.'},
 {part:1,before:'Lucia should never wash meat or ',answer:'poultry',after:'.'},
 {part:1,before:'She uses a scrub ',answer:'brush',after:' for firm fruits and vegetables.'},
 {part:1,before:'Sam and Lucia can now enjoy a healthy ',answer:'snack',after:', knowing they have a clean kitchen, clean hands and clean food.'},
 {part:2,before:'Cross-contamination can also happen in his ',answer:'refrigerator',after:'.'},
 {part:2,before:'He also washes the cutting board and ',answer:'utensils',after:'.'},
 {part:2,before:'He keeps the pork and lettuce ',answer:'separate',after:' during his prep, and now he can safely serve them together.'}
]);
export function checkKitchenAnswers(answers){
 return KITCHEN_QUESTIONS.map((q,i)=>{
  const value=String(answers?.[i]??'').trim().toLowerCase();
  return value===q.answer||(q.answer==='20'&&value==='twenty');
 });
}
