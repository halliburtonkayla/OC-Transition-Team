"""Rebuild the Home Economics handwriting PDFs from the executable recipe data.
Run: python3 tools/home-ec/build_printables.py (ReportLab required).
All pages are monochrome. No student information is read or embedded.
"""
from pathlib import Path
import json,subprocess
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import black,white,Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'printables/home-ec';OUT.mkdir(parents=True,exist_ok=True)
recipe=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {RECIPES} from './assets/home-ec/recipes.mjs'; console.log(JSON.stringify(RECIPES[0]));"],cwd=ROOT,text=True))
pdfmetrics.registerFont(TTFont('LifeSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('LifeBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('LifeSans',normal='LifeSans',bold='LifeBold',italic='LifeSans',boldItalic='LifeBold')
C=None;page=0;name=''
BODY=ParagraphStyle('body',fontName='LifeSans',fontSize=10,leading=14,textColor=black)
SMALL=ParagraphStyle('small',parent=BODY,fontSize=8,leading=11)
TITLE=ParagraphStyle('title',parent=BODY,fontSize=23,leading=27)

def txt(t,x,y,w=528,style=BODY):
 p=Paragraph(t,style);_,h=p.wrap(w,740);p.drawOn(C,x,y-h);return y-h

def line(x,y,w=528):C.setStrokeColor(Color(.42,.42,.42));C.setLineWidth(.6);C.line(x,y,x+w,y)
def lines(y,n=1,gap=24,x=42,w=528):
 for j in range(n):line(x,y-j*gap,w)
 return y-n*gap

def box(x,y,w,h):C.setStrokeColor(black);C.setLineWidth(.8);C.roundRect(x,y,w,h,7,fill=0)
def check(x,y):C.rect(x,y,11,11,fill=0)
def start(file,title):
 global C,page,name
 name=title;page=0;C=canvas.Canvas(str(OUT/file),pagesize=(612,792));C.setTitle(title);C.setAuthor('Transition Town - Home Economics & Life Skills')
def header(kicker,title,subtitle=''):
 global page
 page+=1
 C.setFillColor(black);C.setFont('LifeBold',8);C.drawString(42,758,'TRANSITION TOWN / HOME ECONOMICS & LIFE SKILLS')
 line(42,746);txt(kicker.upper(),42,734,style=SMALL);txt('<b>'+title+'</b>',42,713,style=TITLE)
 if subtitle:txt(subtitle,42,676,style=BODY)
 txt('Student: __________________________________   Date: __________________',42,647)
 return 618

def end():
 line(42,43);txt('Individual recipe - adult supervision required. Virtual practice is not real-world safety certification.',42,36,style=SMALL)
 C.setFont('LifeSans',8);C.drawRightString(570,21,str(page));C.showPage()

def picture(kind,x,y,s=1):
 C.saveState();C.translate(x,y);C.scale(s,s);C.setStrokeColor(black);C.setLineWidth(1.2);C.setFillColor(white)
 if kind=='cereal':
  C.rect(5,0,58,76);C.line(5,76,18,84);C.line(18,84,73,84);C.line(73,84,63,76);C.line(63,0,73,8);C.line(73,8,73,84);C.line(5,76,63,76)
  C.setFont('LifeBold',8);C.drawCentredString(34,55,'CRISP RICE');C.drawCentredString(34,44,'CEREAL');C.ellipse(16,10,55,29);C.line(16,20,55,20)
  for i in range(9):C.ellipse(20+(i%3)*9,16+(i//3)*3,25+(i%3)*9,19+(i//3)*3)
 elif kind=='marshmallows':
  p=C.beginPath();p.moveTo(5,4);p.lineTo(0,70);p.lineTo(8,78);p.lineTo(65,78);p.lineTo(72,70);p.lineTo(67,4);p.close();C.drawPath(p);C.line(3,70,69,70);C.line(5,9,67,9)
  C.setFont('LifeBold',7);C.drawCentredString(36,58,'MINI');C.drawCentredString(36,47,'MARSHMALLOWS')
  for j in range(6):C.roundRect(13+(j%3)*16,18+(j//3)*11,13,8,3)
 elif kind=='butter':
  C.rect(0,14,74,36);C.line(0,50,11,60);C.line(11,60,82,60);C.line(82,60,74,50);C.line(74,14,82,24);C.line(82,24,82,60);C.setFont('LifeBold',10);C.drawCentredString(37,29,'BUTTER')
 C.restoreState()

def table(headers,rows,y,widths,rowh=38):
 x=42;C.setFillColor(Color(.94,.94,.94));C.rect(x,y-28,sum(widths),28,fill=1,stroke=0);xx=x
 for h,w in zip(headers,widths):txt('<b>'+h+'</b>',xx+5,y-6,w-10,SMALL);xx+=w
 yy=y-28
 for row in rows:
  xx=x
  for v,w in zip(row,widths):txt(v,xx+5,yy-8,w-10,SMALL);xx+=w
  yy-=rowh;line(42,yy,sum(widths))
 return yy

for level in (1,2,3):
 start(f'rice-treat-level-{level}.pdf',f'Individual Rice Krispie Treat - Recipe Writing Level {level}')
 header(f'Level {level} / '+['Picture supported','Guided writing','Independent writing'][level-1],'My individual recipe',recipe['title']+' - makes 1 individual treat')
 if level==1:
  txt('<b>Look. Match. Trace. Then write.</b> Match each ingredient to its amount.',42,615)
  for j,i in enumerate(recipe['ingredients']):
   y=570-j*123;picture(i['id'],47,y-63,.68)
   txt('<b>'+i['name']+'</b>',115,y,300)
   txt('Amount to match: '+i['amount'],115,y-24,300)
   C.setFillColor(Color(.66,.66,.66));C.setFont('LifeSans',14);C.drawString(116,y-57,i['name']);C.setFillColor(black)
   txt('Write:',115,y-73,50,SMALL);line(158,y-91,400)
  txt('<b>Match these amounts to the pictures:</b>  ¾ teaspoon     ½ cup     ⅓ cup',42,205)
  txt('My recipe makes ______ treat.  I will ask __________________ for help.',42,170)
  txt('<b>Equipment:</b> microwave-safe bowl, measuring cups, measuring spoons, stirring spoon, serving container.',42,132)
  txt('Copy one tool name:',42,91);line(165,73,393)
 elif level==2:
  txt('<b>Use the recipe book. Write the missing amounts.</b>',42,614)
  table(['Ingredient','Quantity / measurement','My check'],[[i['name'],'__________________','________'] for i in recipe['ingredients']],579,[234,220,74],52)
  txt('<b>Equipment I need</b> - check, then copy two tool names.',42,366)
  for j,t in enumerate(recipe['equipment']):check(45,328-j*25);txt(t['name'],67,340-j*25)
  txt('1. ______________________________________________________________',42,191)
  txt('2. ______________________________________________________________',42,155)
  txt('Number of servings: _______   Where will I find the butter? ______________',42,112)
  txt('My kitchen partner / person who can help: ____________________________',42,78)
 else:
  txt('Recipe title: ____________________________________________________',42,609)
  txt('Number of servings: ______  Preparation time estimate: _________________',42,574)
  table(['Ingredient','Amount for 1 treat','Amount for 2 treats'],[['_____________________','______________','______________'] for _ in range(4)],538,[248,140,140],49)
  txt('Equipment needed:',42,289);lines(252,3,28)
  txt('Fraction work: How did you double the butter measurement?',42,150);lines(113,2,27)
 end()
 header(f'Level {level} / Directions, safety & reflection','Write how to make it',recipe['title']+' - continue on the back if needed')
 if level==1:
  txt('Teacher or partner: read each step aloud. Student: check it and copy an action word.',42,614,style=SMALL)
  for j,d in enumerate(recipe['directions']):
   yy=583-j*26;check(44,yy-12);txt(str(j+1)+'. '+d,64,yy,504,SMALL)
  txt('Copy two action words:  wash / measure / stir / clean',42,268)
  lines(240,2,24)
 elif level==2:
  guided=['Wash hands with soap and water for ______ seconds.','Gather a microwave-safe ______ and measuring tools.','Measure ______ teaspoon butter and ______ cup mini marshmallows.','Combine butter and marshmallows in the __________________.','With adult help, heat in ______ intervals and stir carefully.','Measure ______ cup cereal. Add cereal and stir gently.','Transfer to a suitable container and let it _______________.','Wash dishes and __________________ the workstation.']
  for j,d in enumerate(guided):check(44,585-j*38-12);txt(str(j+1)+'. '+d,64,585-j*38,504)
  txt('One direction in my own words:',42,267);lines(236,2,27)
 else:
  txt('Write clear, numbered directions. Include measuring, adult help, cooling and cleanup.',42,613,style=SMALL)
  for j in range(12):txt(str(j+1)+'.',42,580-j*26,25,SMALL);line(66,562-j*26,504)
 for j,t in enumerate(['Check food allergies and ingredient labels with an adult.','An adult supervises the real microwave. No metal utensils inside.','Use dry mitts. Hot bowls and melted marshmallows can burn. Cool before eating.']):
  txt('<b>Safety:</b> '+t if j==0 else t,42,194-j*15,528,SMALL)
 txt('Reflection: What did I practice? _____________________________________',42,135)
 txt('When did / would I ask for help? ____________________________________',42,103)
 txt('One skill to practice again: _________________________________________',42,71)
 end();C.save()

for level in (1,2,3):
 start(f'rice-treat-shopping-{level}.pdf',f'Rice Krispie Treat - Handwritten Shopping List Level {level}')
 header(f'Shopping list / Level {level}','My grocery shopping list',recipe['title']+' - recipe makes 1 individual treat')
 txt('Instructional budget: $__________  Store / date: _______________________',42,611)
 if level==1:
  for j,i in enumerate(recipe['ingredients']):
   yy=567-j*112;picture(i['id'],44,yy-67,.64);txt('<b>'+i['name']+'</b> - recipe needs '+i['amount'],108,yy,450)
   txt('Store package: '+i['package']+'  |  Buy: _____ package(s)',108,yy-24,450,SMALL)
   txt('Copy item name: _______________________________________',108,yy-46,450)
   check(109,yy-80);txt('Found it!   Estimate: $_______  Actual: $_______',130,yy-66,420,SMALL)
 else:
  table(['Found','Item / copy name','Recipe needs','Package / #','Estimate $','Actual $'],[['[  ]',i['name']+'<br/>________________',i['amount'],'________<br/># ______','_______','_______'] for i in recipe['ingredients']]+[['[  ]','________________','_______','_______','_______','_______']],573,[37,158,78,95,80,80],62)
  if level==3:
   txt('<b>Compare two cereal packages.</b> Read the shelf labels.',42,271)
   table(['Package size','Price','Price per ounce','My choice / why'],[['________','________','________','________________'],['________','________','________','________________']],246,[112,85,135,196],32)
 if level!=3:
  txt('Estimate total: $__________  Actual total: $__________',42,217 if level==1 else 260)
  txt('Budget - actual total = remaining budget: $________________',42,181 if level==1 else 222)
 else:
  txt('Estimate: $________  Actual total: $________  Remaining: $________',42,126)
 txt('Which item belongs in the refrigerator? ______________________________',42,137 if level==1 else 177 if level==2 else 91)
 if level!=3:txt('My helper / question: ______________________________________________',42,99 if level==1 else 132)
 txt('Use pretend lesson money. Package prices are simulation prices, not current store quotes.',42,64,style=SMALL)
 end();C.save()

start('teacher-observation.pdf','Home Economics - Individual Teacher Observation')
header('Teacher use only / Actual classroom performance','NOW YOU’RE THE CHEF!','Complete one sheet per student. Cooking and heating require adult supervision.')
txt('Observer: _________________________  School: ______________________',42,609)
txt('Recipe / task: ______________________  Date / actual time: ______________',42,578)
txt('I = independent; P = picture cue; V = verbal cue; M = modeled; H = physical help;<br/>NY = not yet demonstrated; NA = not observed. Mark only what you personally observe.',42,545,style=SMALL)
rows=[[v,'','','','','','',''] for v in ['Washed hands','Gathered tools','Identified ingredients','Measured ingredients','Followed directions','Requested help appropriately','Followed safety procedures','Completed cleanup']]
table(['Observed task','I','P','V','M','H','NY','NA'],rows,500,[234,42,42,42,42,42,42,42],32)
txt('Individual support / adaptations actually provided:',42,194);lines(164,2,25)
txt('Student preference / next real-world practice step:',42,106);line(42,77)
end();C.save()

start('snack-shop-plan.pdf','Home Economics - Classroom Snack Shop Planner')
header('Menu, costs, roles & individual supports','From kitchen to snack shop','Use the existing weekly Candy Counter with pretend money. Adults supervise food preparation.')
txt('Week: __________  Menu item: ______________________________________',42,610)
txt('Preparation day: _______________  Classroom sale day: _________________',42,577)
table(['Ingredient / supplies','Package cost','Amount used','Estimated recipe cost'],[['_____________________','__________','__________','__________'] for _ in range(4)],542,[211,90,106,121],35)
txt('Cost total: $__________  Portions: ______  Cost per portion: $__________',42,347)
txt('Pretend price: $__________  Planned portions: ______  Estimate sales: $_______',42,314)
table(['Student / code','Job / role','Individual support / goal'],[['________________','________________','_______________________'] for _ in range(3)],275,[150,150,228],36)
txt('Customer greeting / help request to practice: ___________________________',42,113)
txt('Cleanup jobs: ____________________________________________________',42,77)
end();C.save()
print('Built 8 PDF files from the individual-serving recipe data in',OUT)
