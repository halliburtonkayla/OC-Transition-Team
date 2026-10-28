"""Render the same lesson/mission data as the live site into monochrome letter-size packets."""
import json, re, io
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((ROOT/'tmp/pdfs/content.json').read_text())
OUT=ROOT/'printables';OUT.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('SchoolSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SchoolBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='SchoolBody',fontName='SchoolSans',fontSize=10,leading=14,spaceAfter=9))
styles.add(ParagraphStyle(name='SchoolTitle',fontName='SchoolBold',fontSize=21,leading=25,spaceAfter=13))
styles.add(ParagraphStyle(name='SchoolHeading',fontName='SchoolBold',fontSize=13,leading=17,spaceBefore=10,spaceAfter=9))
styles.add(ParagraphStyle(name='SchoolSmall',fontName='SchoolSans',fontSize=8,leading=11,spaceAfter=7))
styles.add(ParagraphStyle(name='SchoolQuestion',fontName='SchoolSans',fontSize=11,leading=16,spaceAfter=0))
styles.add(ParagraphStyle(name='SchoolPictureQuestion',fontName='SchoolBold',fontSize=12,leading=17,spaceAfter=8))
def para(text,style='SchoolBody'):return Paragraph(escape(str(text)),styles[style])
def head(l,kind):return [para('TRANSITION TOWN SCHOOL  /  WATCH & LEARN','SchoolSmall'),para(l['title'],'SchoolTitle'),para(kind,'SchoolHeading')]
def time(n):return f'{n//60}:{n%60:02d}'
def footer(c,doc):
    c.setFont('SchoolSans',8);c.setFillColor(colors.black);c.drawString(34,23,'Transition Town School  |  Practice with permission and support')
    c.drawRightString(578,23,f'{doc.page}')
def doc(file,elements):SimpleDocTemplate(str(file),pagesize=(612,792),rightMargin=36,leftMargin=36,topMargin=32,bottomMargin=38,title=file.stem,author='Transition Town School').build(elements,onFirstPage=footer,onLaterPages=footer)
def table(rows,widths,header=True):
    rows=[[para(v,'SchoolSmall') if isinstance(v,str) else v for v in row] for row in rows]
    t=Table(rows,colWidths=widths,hAlign='LEFT');t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.6,colors.black),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),7),*([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#efefef'))] if header else [])]));return t
def pict(id,size=64):
    raw=DATA['icons'][id]
    raw=re.sub(r'fill="(?!none)[^"]*"','fill="#f5f5f5"',raw);raw=re.sub(r'stroke="(?!none)[^"]*"','stroke="#111111"',raw)
    d=svg2rlg(io.BytesIO(raw.encode()));d.scale(size/d.width,size/d.height);d.width=size;d.height=size;return d
class Faces(Flowable):
    def __init__(self):
        super().__init__();self.width=540;self.height=73
    def draw(self):
        c=self.canv;c.setFont('SchoolBold',10);c.drawString(0,59,'How did my job feel? Point to or circle a face.')
        for x,mood in [(110,'Happy'),(270,'Okay'),(430,'Unhappy')]:
            c.circle(x,28,18);c.circle(x-6,33,1.5,fill=1);c.circle(x+6,33,1.5,fill=1)
            p=c.beginPath();p.moveTo(x-8,24)
            if mood=='Happy':p.curveTo(x-4,15,x+4,15,x+8,24)
            elif mood=='Okay':p.lineTo(x+8,24)
            else:p.curveTo(x-4,31,x+4,31,x+8,24)
            c.drawPath(p);c.setFont('SchoolSans',8);c.drawCentredString(x,2,mood)
def packet(l):
    e=head(l,'Fill-in-the-blank worksheet')+[para('Name / code: ____________________     Date: ____________________'),para('Follow the video in order. Write, say, type or point to your answer. The teacher may pause at each worksheet marker.')]
    for q in l['questions']:e+=[Spacer(1,10),para(f"{q['number']}. {q['text']}",'SchoolQuestion'),Spacer(1,10)]
    e+=[Spacer(1,12),table([['WORD BANK'],['  |  '.join(sorted(q['answer'] for q in l['questions']))]],[540]),Spacer(1,10),para('School practice: '+l['practice'],'SchoolSmall'),PageBreak()]
    for page in range(2):
        e+=head(l,f'Picture worksheet - {page+1} of 2')+[para('Point, circle, say or use supported communication. No handwriting required. A partner may read each direction.','SchoolSmall')]
        for q in l['questions'][page*4:page*4+4]:
            ids=[q['picture'],q['distractor']] if q['number']%2 else [q['distractor'],q['picture']]
            e+=[KeepTogether([para(f"{q['number']}. {q['review']}",'SchoolPictureQuestion'),table([[pict(ids[0],72),pict(ids[1],72)]],[270,270],False),Spacer(1,12)])]
        e+=[para('Match and show: Point from one picture to the matching action your teacher demonstrates.','SchoolSmall'),PageBreak()]
    e+=head(l,'Teacher answer key')+[para('Times are teaching-scene starts on the six-minute lesson timeline. Every missing word is spoken in that scene. Optional teacher pauses occur after the narration finishes. Actual wall time can be longer with pauses or slower device voices.')]
    e+=[table([['#','Scene begins','Answer','Teaching scene']]+[[str(q['number']),time(q['time']),q['answer'],q['title']] for q in l['questions']],[30,80,120,310])]
    e+=[para('Picture worksheet key','SchoolHeading'),para('  |  '.join(f"{q['number']}: {'Left' if q['number']%2 else 'Right'} picture" for q in l['questions'])),para('Accept pointing, speech, eye gaze, sign, gesture, partner-assisted scanning or a communication device. A partner may mark the choice.','SchoolSmall'),para('Observe actual participation and support. A completed game does not certify independent workplace performance.','SchoolSmall'),PageBreak()]
    e+=head(l,'30-minute lesson plan')+[para('Objective: '+l['objective']),table([['Minutes','Teaching activity'],['0-3','Preview the job skill with pictures. Invite supported responses.'],['3-12','Play the six-minute lesson. Pause at the eight worksheet answers and discuss examples.'],['12-18','Play the six-question review. Reveal, discuss, encourage and retry.'],['18-27','Practice an approved school task with a supervisor.'],['27-30','Reflect, record observed support, and select the next step.']],[65,475]),para('Real-world practice','SchoolHeading'),para(l['practice']),para('CDC and communication adaptations','SchoolHeading'),para('Offer two picture choices, one direction at a time, an adult model and extra wait time. Accept pointing, eye gaze, sign, partner-assisted scanning, speech or a communication device. Do not require handwriting. Provide breaks and respect sensory needs.'),para('Materials','SchoolHeading'),para('Screen or projector, optional audio, standard or picture worksheet, approved classroom materials and a supervisor.'),para('Related Transition Town activity: '+l['related'],'SchoolSmall'),PageBreak()]
    for half in range(2):
        e+=head(l,f'Original script and scene plan - {half+1} of 2')
        for i,s in enumerate(l['scenes'][half*6:half*6+6],start=half*6):
            match=next((q for q in l['questions'] if q['scene']==i),None)
            e+=[KeepTogether([para(f"{time(i*30)} - {s['title']}"+(f" - Worksheet {match['number']}" if match else ''),'SchoolHeading'),para(s['script'])])]
        if half==0:e+=[PageBreak()]
    doc(OUT/f"watch-learn-{l['id']}.pdf",e)
def mission_cards():
    e=[]
    for i,m in enumerate(DATA['missions']):
        if i:e+=[PageBreak()]
        e+=[para('TRANSITION TOWN SCHOOL  /  JOB MISSIONS','SchoolSmall'),para(m['title'],'SchoolTitle'),para('Workplace skill: '+m['skill']),para('Materials: '+m['materials']),para('Before starting: Get staff permission. Use approved, clean, safe materials. Follow your supervisor’s directions.','SchoolSmall'),para('My school job','SchoolHeading')]
        for n,(id,text) in enumerate(m['steps'],1):e+=[table([[str(n),pict(id,40),para(text,'SchoolQuestion'),'□ Done']],[30,60,370,80],False),Spacer(1,8)]
        e+=[Spacer(1,10),para('Completion: □ Followed directions   □ Checked work   □ Asked for help   □ Put supplies away','SchoolSmall'),para('Teacher observation','SchoolHeading'),para('Prompting: □ None   □ Verbal   □ Visual   □ Physical'),para('Independence: _____________________    Accuracy: __________'),para('Notes: __________________________________________________________'),para('_______________________________________________________________'),Faces(),Spacer(1,6),para('Student / code: ______________________    Date: __________________','SchoolSmall')]
    doc(OUT/'job-missions-school-cards.pdf',e)
if __name__=='__main__':
    for l in DATA['lessons']:packet(l)
    mission_cards()
    print('Created six lesson packets and six school mission cards.')
