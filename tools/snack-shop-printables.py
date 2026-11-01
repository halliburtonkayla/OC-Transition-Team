"""Rebuild the blank CDC pilot packet. Requires reportlab, Pillow and svglib.
No student records are read. Run from any directory; output is in docs/.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color, black, white
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/cdc-snack-shop-rice-krispie-pilot.pdf'
pdfmetrics.registerFont(TTFont('ShopSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('ShopSans-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('ShopSans',normal='ShopSans',bold='ShopSans-Bold',italic='ShopSans',boldItalic='ShopSans-Bold')
C=canvas.Canvas(str(OUT),pagesize=(612,792))
C.setTitle('CDC Weekly Snack Shop - Rice Krispie Pilot')
C.setAuthor('Transition Team - Miss Kayla')
TEAL=HexColor('#175b50'); INK=HexColor('#173b33'); PALE=HexColor('#eef3e9'); LINE=HexColor('#aebeb2')
style=ParagraphStyle('body',fontName='ShopSans',fontSize=11,leading=15,textColor=INK)
small=ParagraphStyle('small',parent=style,fontSize=9,leading=12)
big=ParagraphStyle('big',parent=style,fontSize=15,leading=20)
page=0

def text(value,x,y,w=528,st=style):
    p=Paragraph(value,st);ww,h=p.wrap(w,700);p.drawOn(C,x,y-h);return y-h

def line(y,x=42,w=528):
    C.setStrokeColor(LINE);C.line(x,y,x+w,y)

def start(kicker,title,subtitle):
    global page
    page+=1
    C.setFillColor(TEAL);C.rect(0,752,612,40,fill=1,stroke=0)
    C.setFillColor(white);C.setFont('ShopSans-Bold',9);C.drawString(42,768,'TRANSITION TOWN  /  MISS KAYLA’S CLASSROOM SHOP'.replace('’',"'"))
    text(kicker.upper(),42,733,st=small)
    text('<b>'+title+'</b>',42,710,st=ParagraphStyle('title',parent=style,fontSize=25,leading=28))
    text(subtitle,42,675,st=style)

def end():
    line(43);text('South Fulton CDC  |  Pretend money only  |  Reusable blank classroom packet',42,35,450,small)
    C.setFillColor(INK);C.setFont('ShopSans',9);C.drawRightString(570,25,str(page));C.showPage()

def heading(value,y):
    return text('<b>'+value+'</b>',42,y,st=ParagraphStyle('h',parent=style,fontSize=14,leading=19))-7

def image(file,x,y,w,h):
    C.drawImage(ImageReader(str(ROOT/file)),x,y,width=w,height=h,preserveAspectRatio=True,anchor='c',mask='auto')

def box(x,y,w,h):
    C.setStrokeColor(LINE);C.setFillColor(white);C.roundRect(x,y,w,h,8,stroke=1,fill=1)

def table(headers,rows,x,y,widths,rowh=34):
    C.setFillColor(PALE);C.rect(x,y-28,sum(widths),28,fill=1,stroke=0)
    xx=x
    for head,w in zip(headers,widths):text('<b>'+head+'</b>',xx+7,y-6,w-14,small);xx+=w
    yy=y-28
    for row in rows:
        xx=x
        for val,w in zip(row,widths):text(str(val),xx+7,yy-7,w-14,small);xx+=w
        yy-=rowh;line(yy,x,sum(widths))
    return yy

start('Week 1 - Teacher plan','Rice Krispie Snack Shop','Teach a small batch first. Bring a larger prepared batch for classmates to buy with play money on a later day.')
y=heading('Before the first lesson',625)
y=text('Gather crispy rice cereal, marshmallows, butter, measuring cups, a bowl, spatula, lined pan, wrappers, pretend quarters, a tray and these pages. Check ingredient labels, student food needs and your school’s food guidance. Adults handle heat and cutting. Keep food handling and money handling separate.',42,y)-18
y=heading('Day 1 - Prepare & explore jobs (about 30 minutes, plus cooling)',y)
y=text('<b>5 min:</b> Students choose a task, practice asking for help, wash hands and set up.<br/><b>15 min:</b> Measure cereal, watch the adult melting step, mix and press with the pictured directions on page 2.<br/><b>10 min:</b> Clean, wrap cooled portions when ready, and choose a preferred job. Waiting for cooling may extend the session. If classroom heating is unavailable, the adult demonstrates with prepared ingredients or a finished batch.',42,y)-18
y=heading('Day 2 - Invite classmates as customers (about 30 minutes)',y)
y=text('Bring 12-24 consistently sized, individually wrapped portions, adjusted to your class size. Give each customer a pretend quarter. Set the menu to <b>Rice Krispie treats, 25 cents, one item per order</b>. Put menu/tickets at one end of the library table, wrapped stock in the middle and play money at the cashier end.',42,y)-9
y=text('Serve 2-3 classmates, pause and rotate jobs. Repeat for three short rounds so everyone tries each responsibility. A classmate points or reads, places an order, gives the worker a ticket, pays and says thank you. Use one shared classroom device, or use the paper tickets entirely offline.',42,y)-18
y=heading('Transition Town setup for this pilot',y)
y=text('Teacher tools → Use Rice pilot → check the practice stock. Add student codes and choose the active worker before each turn. Use <b>Classmates: place an order</b>, then let workers complete the pictured checkout. Practice completion changes practice stock only. Physical stock changes only after a separate teacher-confirmed handoff.',42,y)-10
text('Finish with: “Which job did you like?” and “What help worked for you?” Record what you observed on page 6. Save/print browser records before clearing classroom browser data.',42,y,st=small)
end()

start('Day 1 - Picture preparation cards','Make the teaching batch','No oven needed. Adult heat is required for melting. Use these cards with the teacher, not as unsupervised cooking directions.')
text('<b>Ingredients:</b> 6 cups crispy rice cereal + one 10 oz package of marshmallows + 3 tablespoons butter. Use a 13 x 9 inch pan. Adult handles hot mixture and cutting.',42,628)
steps=[
('wash','1. Wash & get ready','Wash hands. Clean your space. Ask for a job.'),
('measure','2. Measure cereal','Fill one cup. Pour it. Count six cups with a partner.'),
('heat','3. Adult melts','The adult melts butter and marshmallows. Watch from your place.'),
('mix','4. Mix with help','Add cereal. Stir with the adult when it is safe.'),
('press','5. Press in the pan','Use the spatula. Gently press the mixture flat.'),
('wrap','6. Cool & wrap','Wait until cool. The adult cuts. Wrap one treat. Clean your place.')]
for i,(icon,title,body) in enumerate(steps):
    x=42+(i%2)*272;top=568-(i//2)*156;box(x,top-142,256,142)
    d=svg2rlg(str(ROOT/f'assets/candy-counter/prep/{icon}.svg'));d.scale(.50,.50);renderPDF.draw(d,C,x+12,top-62)
    text('<b>'+title+'</b>',x+73,top-13,171,ParagraphStyle('card-title',parent=style,fontSize=12,leading=16))
    text(body,x+13,top-73,230,ParagraphStyle('card-body',parent=style,fontSize=12,leading=16))
text('Adult: melt butter on low heat, stir in marshmallows, then remove from heat. Mix in cereal. Press into the prepared pan, cool and cut. Store covered; use within two days at room temperature.',42,104,st=small)
text('<link href="https://www.ricekrispies.us/original-treats-saucepan" color="#175b50">Adapted from: ricekrispies.us/original-treats-saucepan</link>',42,66,st=small)
end()

start('Day 2 - Jobs & supports','Everyone tries every job','Write the three student names/codes below. Keep their individual supports as jobs rotate.')
rows=[['Round 1','Worker A','Worker B','Worker C'],['Round 2','Worker C','Worker A','Worker B'],['Round 3','Worker B','Worker C','Worker A']]
table(['After 2-3 customers','Customer service','Stock / packing','Cashier'],rows,42,627,[120,136,136,136],34)
text('A: __________________   B: __________________   C: __________________',42,477)
roles=[('CUSTOMER SERVICE','Greet the customer. Point to or read the menu. Listen to the choice and confirm the ticket.','“What would you like?”  “One treat, please?”'),('STOCK / PACKING','Match the ticket picture. Put one wrapped treat in one order space. Check with the customer.','“Is this your order?”  “Please check with me.”'),('CASHIER','Match one pretend quarter to 25 cents. Check exact payment or practice change with teacher support. Thank the customer.','“Twenty-five cents, please.”  “Thank you.”')]
for i,(title,body,say) in enumerate(roles):
    top=438-i*104;box(42,top-94,528,94);text('<b>'+title+'</b>',54,top-10,504);text(body,54,top-32,504,small);text(say,54,top-68,504,small)
text('<b>Adapt the task, keep the job.</b> Beginning numbers: one picture, one object, one quarter, one space; accept pointing or partner counting. Developing money skills: match coin pictures and touch/count payment. Independent readers: read tickets, confirm totals, explain each job; later try a $1 payment and 75 cents change.',42,106,st=small)
end()

start('Photocopy for the table','This week: Rice Krispie treats','Pretend-money classroom shop. One treat costs one quarter (25 cents).')
image('assets/candy-counter/rice-treat.webp',65,485,235,145)
image('assets/money-match/quarter.webp',350,490,110,110)
text('<b>1 treat = 25 cents</b>',330,475,220,big)
text('Point, speak or use your device:<br/>“I would like one treat, please.”<br/>“Thank you.”',330,442,215)
for i in range(4):
    x=42+(i%2)*272;top=365-(i//2)*150
    box(x,top-134,256,134)
    text('<b>ORDER TICKET</b>  Customer # ______',x+12,top-12,232,small)
    text('Rice Krispie treat  |  Quantity: 1',x+12,top-38,232)
    text('Price: 25 cents  |  Total: 25 cents',x+12,top-60,232)
    text('Play payment: ______  Change: ______',x+12,top-82,232,small)
    text('Received ___ Packed ___ Thank you ___',x+12,top-106,232,small)
text('Cut out the tickets, or have classmates complete them on the screen. Print a fresh menu from Teacher tools whenever you change products or prices.',42,70,st=small)
end()

start('Beginning counting & communication','One item. One place.','Point or tap each picture. A partner can say the number with you. No reading or numeral naming is required.')
box(42,458,245,165);box(325,458,245,165)
text('<b>Match one wrapped treat</b>',54,607,220)
image('assets/candy-counter/rice-treat.webp',77,474,175,98)
text('<b>Put one wrapped treat here</b>',338,607,220)
C.setStrokeColor(TEAL);C.setDash(6,4);C.roundRect(368,475,155,95,10,stroke=1,fill=0);C.setDash()
text('ONE',423,533,70,big)
box(42,270,245,165);box(325,270,245,165)
text('<b>Match one quarter (25 cents)</b>',54,419,220)
image('assets/money-match/quarter.webp',105,289,98,98)
text('<b>Put one play quarter here</b>',338,419,220)
C.setStrokeColor(TEAL);C.setDash(6,4);C.circle(448,340,47,stroke=1,fill=0);C.setDash()
text('25¢',429,351,60,big)
for i,(title,say) in enumerate([('HELP','Please help me.'),('SHOW ME','Please show me.'),('BREAK','I need a break.'),('DIFFERENT JOB','I want a different job.')]):
    x=42+(i%2)*272;top=247-(i//2)*84;box(x,top-70,256,70)
    text('<b>'+title+'</b>',x+15,top-10,226,ParagraphStyle('help',parent=style,fontSize=13,leading=17));text(say,x+15,top-39,226)
text('Point, speak or use a device. Tell your teacher what help you need.',42,66,st=small)
end()

start('Photocopy one per student / session','Pre-ETS observation sheet','Student/code: ____________________   Date: __________   Observer: ____________________')
text('School/group: _____________________   Week: _________________   Product: ______________<br/>Job tried: _________________________   Preparation ___   Shop ___   Start/end (actual): __________',42,627)
text('<b>Support key:</b> I = independent; V = verbal cue; P = picture/model; H = hands-on help; N = not assessed. Record support and attempts; accept speech, pointing, signs or a communication device.',42,573,st=small)
rows=[['Workplace readiness','Follows one preparation step; cleans work area.\nObserved: ____________________','____ / ____\nSupport: ____'],['Readiness: counting','Matches one item to one space; packs ordered quantity.\nObserved: ____________________','____ / ____\nSupport: ____'],['Readiness: money / communication','Counts play payment; checks change; greets or thanks a customer.\nObserved: ____________________','____ / ____\nSupport: ____'],['Self-advocacy','Chooses a task/support; asks for help, break or different job.\nObserved: ____________________','____ / ____\nSupport: ____'],['Job exploration','Tries a job and communicates a preference.\nObserved: ____________________','____ / ____\nSupport: ____']]
table(['Focus','Observable action / evidence','Trials / support'],[[v.replace('\n','<br/>') for v in row] for row in rows],42,527,[113,295,120],59)
text('Order: ____ items x ____ cents   Payment: ____ cents   Change: ____ cents',42,190)
text('Student’s words / gesture: ______________________________________________________<br/>Actual assistance given: ________________________________________________________<br/>Next small step: ______________________________________________________________<br/>Reviewed by / date: ___________________________________________________________',42,161,st=style)
text('Record observed actions only. App clicks do not establish independence, attendance, service minutes or billable time. Keep completed sheets in classroom records.',42,79,st=small)
end()

start('Reuse for every menu','Next week’s shop planner','Choose the snack once. Change the menu and prices in Teacher tools; keep the same jobs and checkout.')
text('Week / menu label: ______________________  Preparation day: ______  Shop day: ______<br/>Product: _________________________________  Price per item: ______ cents<br/>Practice quantity: ______  Actual portions counted by teacher (optional): ______<br/>Maximum per ticket: ______  Support level: _________________________________',42,626)
y=heading('Plan one small goal for each learner',526)
for top in [490,411,332]:
    text('Student/code: _____________________   Job to try first: ______________________<br/>What I will look for: ____________________________________________________<br/>Pictures / counting / reading / communication support: ________________________',42,top)
y=heading('Keep the weekly routine',249)
text('<b>1.</b> Prepare and explore a job. <b>2.</b> Teacher brings the classroom batch.<br/><b>3.</b> Classmates order with pretend money. <b>4.</b> Rotate every 2-3 customers.<br/><b>5.</b> Students choose a preferred job and identify useful help. <b>6.</b> Observe, review and plan the next small step.',42,y)
text('<b>Future menu ideas:</b> Dum-Dums: practice wrapped-item stock and checkout. Cocoa: let an adult prepare and handle the drink; students can practice with empty cups. Use another inexpensive packaged snack when a closer fit is needed. Select the nearest picture model and change the label.',42,144,st=small)
text('In Transition Town, past tickets and sales keep their original product, week and price. Switching the menu keeps saved records. Each device has its own activity records; export a backup before clearing browser data.',42,86,st=small)
end()
C.save()
print(OUT)
