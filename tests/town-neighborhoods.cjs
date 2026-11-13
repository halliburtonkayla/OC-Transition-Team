const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.style={};this.events={};this.textContent='';this.classList={add:n=>this.className+=' '+n};}
 append(...items){for(const c of items){if(c.parent)c.parent.children=c.parent.children.filter(x=>x!==c);c.parent=this;this.children.push(c)}}
 before(...items){this.beforeNodes=items}after(...items){this.afterNodes=items}replaceChildren(...items){this.children=[];this.append(...items)}
 setAttribute(k,v){this.attributes[k]=v}addEventListener(k,v){this.events[k]=v}getBoundingClientRect(){return {height:this.height||600}}querySelector(s){return s==='.townmap'?original:null}querySelectorAll(){return []}
}
const original=new Element('section'),viewport=new Element('div');viewport.append(original);
const elements=[];let allowed=true,calls=[],sheet='',navTarget='';
const win={addEventListener(){},need(){calls.push('need');return allowed},riverviewApartments(){calls.push('oak')},townCenterApartments(){calls.push('center')},buyHouse(){calls.push('house')},openSheet(s){sheet=s},location:{set href(x){navTarget=x}}};
const doc={querySelector:s=>s==='.mapviewport'?viewport:null,getElementById:id=>elements.find(e=>e.id===id),createElement:t=>{const e=new Element(t);elements.push(e);return e}};
const source=fs.readFileSync('assets/town-neighborhoods/neighborhoods.js','utf8');
const context=vm.createContext({window:win,document:doc,ResizeObserver:class{observe(){}},console});vm.runInContext(source,context);
const stage=doc.getElementById('ttNeighborhoodStage'),track=stage.children[0],panels=track.children,nav=viewport.beforeNodes[0],status=viewport.beforeNodes[1];
const [prev,next]=nav.children;const click=b=>b.events.click();
eq(panels.length,3);eq(panels[0].children[0],original,'original DOM preserved, not cloned');eq(panels.map(p=>p.inert),[false,true,true]);
click(next);eq(track.style.transform,'translateX(-100%)');eq(panels.map(p=>p.inert),[true,false,true]);eq(status.textContent,'Business Neighborhood · 2 of 3');
click(next);eq(track.style.transform,'translateX(-200%)');click(next);eq(track.style.transform,'translateX(-0%)');click(prev);eq(status.textContent,'Residential Neighborhood · 3 of 3');
for(let i=0;i<30;i++)click(next);eq(status.textContent,'Residential Neighborhood · 3 of 3','rapid clicks remain consistent');
let prevented=false;nav.events.keydown({key:'ArrowLeft',preventDefault(){prevented=true}});eq(prevented,true);eq(status.textContent,'Business Neighborhood · 2 of 3');
const buttons=elements.filter(e=>e.tag==='button'&&e.className?.includes('Hotspot'));
const find=name=>buttons.find(b=>b.attributes['aria-label'].startsWith(name));
click(find('Back to Original'));eq(status.textContent,'Original Town · 1 of 3');click(find('Next: Residential'));eq(status.textContent,'Residential Neighborhood · 3 of 3');click(find('Next: Original'));eq(status.textContent,'Original Town · 1 of 3');
click(find('Home & Beyond'));eq(navTarget,'home-beyond.html');click(find('Library'));eq(navTarget,'town-library/index.html');click(find('Movie Theater'));eq(sheet.includes('still being prepared'),true);
allowed=false;calls=[];click(find('Oak Ridge'));eq(calls,['need'],'signed-out click cannot access rentals');allowed=true;calls=[];click(find('Oak Ridge'));eq(calls,['need','oak']);calls=[];click(find('Town Center'));eq(calls,['need','center']);calls=[];click(find('House 1:'));eq(calls,['need','house']);
eq(buttons.filter(x=>x.attributes['aria-label'].startsWith('House ')).length,10);eq(buttons.filter(x=>x.attributes['aria-label'].startsWith('Estate ')).length,4);
for(const b of buttons){for(const p of ['left','top','width','height'])assert.ok(parseFloat(b.style[p])>=0);assert.ok(parseFloat(b.style.left)+parseFloat(b.style.width)<=100);assert.ok(parseFloat(b.style.top)+parseFloat(b.style.height)<=100)}checks+=buttons.length;
const before=elements.length;vm.runInContext(source,context);eq(elements.length,before,'double inclusion does not duplicate UI');
eq(/localStorage|sessionStorage|fetch\(|XMLHttpRequest/.test(source),false,'no resident data or backend access');
const loader=fs.readFileSync('assets/career-lab/town-walk.js','utf8');eq((loader.match(/neighborhoods\.js\?/g)||[]).length,1);eq((loader.match(/neighborhoods\.css\?/g)||[]).length,1);
console.log(`${checks} neighborhood checks passed`);
