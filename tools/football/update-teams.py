"""Rebuild the West Tennessee football directory from TSSAA's current records.
Uses athletic districts 7/8/9 intersected with active football classification.
No logos or real student rosters are copied. Run: python tools/football/update-teams.py
"""
import concurrent.futures, html, json, re, time
from pathlib import Path
from urllib.request import urlopen
ROOT=Path(__file__).resolve().parents[2]
BASE='https://portal.tssaa.org/common/'
def get(url):
 for attempt in range(3):
  try:
   with urlopen(url,timeout=25) as r:return r.read().decode()
  except Exception:
   if attempt==2:raise
   time.sleep(.5)
def clean(s):return html.unescape(re.sub('<[^>]+>','',s)).strip()
def build():
 directory=get(BASE+'directory/districts.cfm');classification=get(BASE+'classification/?schoolYear=2026&sportid=1')
 active=set(re.findall(r'teamActive1[^>]*>\s*<a href="/common/directory/detail.cfm\?id=(\d+)"',classification))
 teams=[]
 for district in (7,8,9):
  section=directory.split('<h4>Athletic District '+str(district)+'</h4>')[1].split('</ul>')[0]
  for id,name,city in re.findall(r'<li><a href="detail.cfm\?id=(\d+)">(.*?)</a>\s*\((.*?)\)</li>',section):
   if id in active:teams.append(dict(id=id,name=clean(name),city=clean(city),district=district))
 def details(t):
  url=BASE+'directory/detail.cfm?id='+t['id'];doc=get(url)
  for key,label in [('mascot','Mascot'),('colors','Colors'),('county','County')]:
   m=re.search(r'<strong>'+label+r':</strong>\s*([^<\r\n]+)',doc);t[key]=clean(m[1]) if m else ''
  m=re.search(r'border-color:\s*(#[0-9a-fA-F]{6})',doc);t['primary']=m[1] if m else '#244575'
  t['source']=url
  return t
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:teams=list(pool.map(details,teams))
 teams.sort(key=lambda t:t['name'])
 result={'season':'2026–2027','checked':'2026-10-06','scope':'Active TSSAA football programs in athletic districts 7, 8 and 9 (West Tennessee); includes Northpoint in Southaven, MS, which competes in the West region.','sources':[BASE+'directory/districts.cfm',BASE+'classification/?schoolYear=2026&sportid=1'],'teams':teams}
 (ROOT/'football/teams.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
 print('Saved',len(teams),'verified football programs. Missing fields:',[(t['name'],k) for t in teams for k in ['mascot','colors','county'] if not t[k]])
if __name__=='__main__':build()
