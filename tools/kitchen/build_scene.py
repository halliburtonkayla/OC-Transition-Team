"""Build and export the same beveled 3D geometry used by the browser kitchen viewer.
Run: blender -b --python tools/kitchen/build_scene.py -- /absolute/output/directory
"""
import bpy, math, json, os, sys, random
from mathutils import Vector
random.seed(42)
out=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else os.getcwd()
os.makedirs(out,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
mats={}
def mat(name,color,rough=.5,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;mats[name]=m;return m
mat('wall',(0.57,.54,.46),.9);mat('ceiling',(.93,.90,.80),.9);mat('sage',(.10,.20,.14),.45);mat('sage-inset',(.07,.15,.105),.55);mat('stone',(.66,.65,.58),.32);mat('stone-edge',(.65,.66,.60),.4);mat('tile',(.89,.88,.79),.23);mat('grout',(.62,.65,.59),.8);mat('brass',(.65,.44,.19),.25,.78);mat('steel',(.34,.40,.40),.28,.82);mat('dark-steel',(.12,.15,.16),.3,.6);mat('black-glass',(.022,.039,.043),.14,.38);mat('pan',(.045,.052,.056),.52,.35);mat('pan-inner',(.077,.080,.075),.85,.2);mat('burner',(.60,.15,.025),.35,.35);mat('white',(.91,.90,.82),.18);mat('dark',(.027,.033,.031),.8);mat('blue-sky',(.45,.70,.76),.6);mat('grass',(.23,.4,.24),.9);mat('terracotta',(.50,.25,.14),.7);mat('leaf',(.15,.32,.075),.7);mat('leaf-light',(.25,.43,.11),.65);mat('oil',(.34,.39,.07),.3);mat('label',(.85,.77,.49),.9);mat('egg',(.86,.54,.06),.65);mat('egg-light',(.96,.72,.20),.7);mat('egg-shell',(.84,.76,.60),.6);mat('tomato',(.65,.075,.025),.35);mat('bread',(.70,.40,.15),.7);mat('bread-inner',(.86,.64,.32),.9);mat('chicken',(.65,.34,.12),.6);mat('carrot',(.83,.32,.04),.7);mat('sauce',(.51,.09,.025),.65);mat('paper',(.91,.85,.69),.9)
for i in range(7):mat('oak'+str(i),(.42+i*.022,.25+i*.014,.12+i*.008),.62)
def finish(obj,name,material,part='room',recipe=None):
 obj.name=name;obj.data.materials.append(mats[material]);obj['part']=part
 if recipe:obj['recipe']=recipe
 return obj

def box(name,loc,scale,material,bevel=.018,part='room',recipe=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Soft machined edges','BEVEL');mod.width=bevel;mod.segments=3
  mod=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
 return finish(o,name,material,part,recipe)
def cyl(name,loc,radius,depth,material,part='room',rotation=(0,0,0),recipe=None,vertices=32):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc,rotation=rotation);o=bpy.context.object
 mod=o.modifiers.new('Rounded rim','BEVEL');mod.width=min(.012,depth*.18);mod.segments=2;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return finish(o,name,material,part,recipe)
def sphere(name,loc,scale,material,part='room',recipe=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=1,location=loc);o=bpy.context.object;o.scale=scale
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,material,part,recipe)
def torus(name,loc,radius,tube,material,part='room',rotation=(0,0,0),recipe=None):
 bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=8,location=loc,major_radius=radius,minor_radius=tube,rotation=rotation);o=bpy.context.object
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,material,part,recipe)
def tube(name,points,radius,material,part='room'):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=radius;curve.bevel_resolution=3;s=curve.splines.new('POLY');s.points.add(len(points)-1)
 for p,v in zip(s.points,points):p.co=(*v,1)
 o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);o.data.materials.append(mats[material]);o['part']=part;return o
# Real room shell and individual oak floor planks.
box('Foundation',(0,0,-.06),(7.0,5.1,.12),'oak2',.01)
for row in range(16):
 y=-2.15+row*.29
 for col in range(5):
  x=-3.0+col*1.31+(.32 if row%2 else 0)
  box('Oak floor plank',(x,y,.009),(1.295,.282,.025),'oak'+str(random.randrange(7)),.005)
box('Back plaster wall',(0,1.92,1.57),(6.4,.13,3.15),'wall',.005);box('Left plaster wall',(-3.2,-.13,1.57),(.13,4.1,3.15),'wall',.005)
box('Left skirting',(-3.1,-.1,.11),(.08,4,.19),'ceiling',.01)
# Refrigerator with distinct freezer, door seams, handles and dispenser.
box('Refrigerator body',(-2.54,1.28,1.21),(1.0,1.04,2.38),'dark-steel',.07,'fridge')
for x in [-2.78,-2.30]:
 box('Refrigerator door',(x,.729,1.56),(.469,.10,1.60),'steel',.045,'fridge')
 box('Fridge grip',(x+(.18 if x<-2.5 else -.18),.639,1.52),(.027,.054,.60),'brass',.013,'fridge')
box('Freezer drawer',(-2.54,.72,.41),(.96,.12,.64),'steel',.04,'fridge');box('Freezer pull',(-2.54,.61,.65),(.66,.045,.026),'brass',.012,'fridge')
box('Water dispenser',(-2.81,.663,1.45),(.25,.025,.33),'black-glass',.016,'fridge');box('Dispenser shelf',(-2.81,.59,1.3),(.23,.14,.018),'steel',.006,'fridge')
# Shaker cabinets: recessed panels, raised frames, handles, toe kicks.
def cabinet(x,width=.7,z=.46,height=.84,y=1.40,depth=.76):
 box('Cabinet carcass',(x,y,z),(width-.01,depth,height),'sage',.014)
 front=y-depth/2-.022
 box('Recessed shaker panel',(x,front,z),(width-.11,.028,height-.13),'sage-inset',.008)
 for xx in [x-width/2+.035,x+width/2-.035]:box('Shaker stile',(xx,front-.018,z),(.068,.040,height-.02),'sage',.008)
 for zz in [z-height/2+.04,z+height/2-.04]:box('Shaker rail',(x,front-.018,zz),(width-.07,.045,.075),'sage',.008)
 box('Cabinet brass pull',(x,front-.055,z+height*.31),(.22,.028,.017),'brass',.008)
for x in [-1.65,-.91,-.17,.57,2.37]:cabinet(x,.72)
box('Toe kick',(.15,1.10,.075),(4.95,.1,.12),'dark',.01)
# Counter splits around sink and range.
box('Counter left',(-1.48,1.31,.918),(1.1,1.02,.075),'stone',.032)
box('Counter right',(.27,1.31,.918),(1.20,1.02,.075),'stone',.032)
box('Counter end',(2.4,1.31,.918),(.75,1.02,.075),'stone',.032)
box('Sink front edge',(-.64,.848,.918),(.58,.12,.075),'stone',.022,'sink');box('Sink back edge',(-.64,1.77,.918),(.58,.10,.075),'stone',.02,'sink')
box('Sink basin',(-.64,1.3,.765),(.55,.65,.08),'steel',.06,'sink')
for x in [-.94,-.34]:box('Sink side',(x,1.3,.84),(.035,.70,.20),'steel',.014,'sink')
for y in [.95,1.65]:box('Sink end',(-.64,y,.84),(.62,.025,.20),'steel',.014,'sink')
cyl('Drain',(-.64,1.30,.81),.055,.012,'dark-steel','sink')
tube('Arched brass faucet',[(-.62,1.70,.94),(-.62,1.70,1.25),(-.62,1.67,1.34),(-.62,1.61,1.38),(-.62,1.48,1.38),(-.62,1.41,1.32),(-.62,1.41,1.25)],.022,'brass','sink')
cyl('Faucet lever',(-.43,1.67,.995),.02,.14,'brass','sink')
# Tile backsplash, fitted upper cabinets, window reveals.
for row in range(4):
 for col in range(19):
  x=-1.9+col*.245
  box('Glazed backsplash',(x,1.828,1.02+row*.135),(.235,.028,.126),'tile',.009)
box('Window outer frame',(-.76,1.75,2.03),(1.58,.18,1.20),'ceiling',.022)
box('Window glass',(-.76,1.642,2.04),(1.35,.022,.98),'blue-sky',0)
box('Window landscape',(-.76,1.622,1.77),(1.34,.018,.42),'grass',0)
for x in [-1.24,-.82,-.43,-.21]:sphere('Distant tree',(x,1.60,1.85+random.random()*.13),(.17,.01,.19),'leaf')
for x in [-1.47,-.76,-.05]:box('Window mullion',(x,1.59,2.05),(.036,.05,1.05),'ceiling',.004)
box('Window crossbar',(-.76,1.59,2.03),(1.42,.055,.036),'ceiling',.004)
box('Window sill',(-.76,1.57,1.44),(1.62,.33,.075),'stone',.025)
for x in [.45,2.38]:cabinet(x,.77,2.04,1.06,1.60,.42)
# Oven/range, handles, knobs, door bevel, glass, racks.
box('Oven body',(1.46,1.30,.48),(1.01,.95,.91),'steel',.035,'stove')
box('Oven black inset',(1.46,.799,.47),(.91,.036,.63),'black-glass',.035,'stove')
box('Oven glass pane',(1.46,.772,.47),(.72,.018,.43),'dark-steel',.023,'stove')
for z in [.33,.40,.51]:box('Visible oven rack',(1.46,.75,z),(.63,.007,.008),'steel',.001,'stove')
box('Oven door grip',(1.46,.69,.77),(.76,.045,.032),'brass',.015,'stove')
box('Range control panel',(1.46,1.69,1.06),(1.0,.16,.25),'steel',.035,'stove')
box('Digital display',(1.46,1.596,1.08),(.30,.019,.09),'black-glass',.01,'stove')
for x in [1.1,1.23,1.70,1.83]:cyl('Range dial',(x,1.575,1.055),.038,.038,'dark-steel','stove',(math.pi/2,0,0))
box('Range cooktop',(1.46,1.25,.955),(1.02,.92,.057),'black-glass',.025,'stove')
for x in [1.22,1.70]:
 for y in [1.02,1.46]:torus('Range burner',(x,y,.99),.14,.008,'steel','stove')
box('Extractor chimney',(1.46,1.71,2.44),(.51,.34,.70),'steel',.024)
box('Extractor canopy',(1.46,1.55,2.16),(1.04,.68,.13),'steel',.04)
for x in [1.25,1.65]:cyl('Hood downlight',(x,1.35,2.08),.049,.008,'white')
# Foreground island with end panels and stone overhang.
box('Island cabinet base',(.04,-.73,.46),(2.65,1.20,.88),'sage',.035)
for x in [-.82,.05,.92]:cabinet(x,.85,.47,.83,-.76,1.18)
box('Island plinth',(.04,-.75,.09),(2.5,1.13,.13),'dark',.02)
box('Island stone slab',(.04,-.76,.968),(2.88,1.48,.11),'stone',.045)
# Fine stone veins as sparse shallow inlays.
tube('Stone natural vein',[(-1.35,-.10,1.025),(-.89,-.13,1.025),(-.62,-.18,1.025),(-.31,-.14,1.025)],.002,'stone-edge')
tube('Stone natural vein',[(.65,-1.4,1.025),(.77,-1.2,1.025),(1.12,-1.05,1.025),(1.36,-1.08,1.025)],.002,'stone-edge')
# Glass induction hob and nested rings, physical skillet and riveted grip.
box('Island induction hob',(.10,-.68,1.03),(1.14,.95,.036),'black-glass',.035,'pan')
for x,y in [(-.18,-.48),(.4,-.48),(.40,-.99)]:
 torus('Etched burner ring',(x,y,1.052),.175,.004,'steel','pan');torus('Inner burner ring',(x,y,1.052),.152,.003,'dark-steel','pan')
px,py=-.19,-.94
cyl('Skillet body',(px,py,1.10),.266,.085,'pan','pan');cyl('Skillet cooking surface',(px,py,1.148),.243,.009,'pan-inner','pan');torus('Skillet polished lip',(px,py,1.15),.254,.012,'steel','pan')
handle=box('Skillet handle',(px-.31,py-.22,1.112),(.43,.073,.050),'dark-steel',.029,'pan');handle.rotation_euler[2]=.58
for t in [.02,.055]:sphere('Skillet rivet',(px-.21-t,py-.075-t,1.151),(.011,.011,.004),'steel','pan')
# Food objects are real mesh groups selected by recipe without touching inventory.
for i in range(17):
 a=i*2.399;r=.18*math.sqrt((i+1)/17);x=px+math.cos(a)*r;y=py+math.sin(a)*r
 egg=sphere('Scrambled egg curd',(x,y,1.175+random.random()*.015),(.046,.036,.019),'egg' if i%3 else 'egg-light','food','eggs');egg.rotation_euler[2]=random.random()*3
for i in range(12):
 a=i*2.5;r=.18*math.sqrt((i+1)/12)
 box('Chopped chive',(px+math.cos(a)*r,py+math.sin(a)*r,1.21),(.016,.004,.004),'leaf',.001,'food','eggs')
for i in range(2):
 bread=box('Toast crust',(px+(-.09 if i==0 else .09),py,1.176),(.16,.28,.042),'bread',.036,'food','toast');bread.rotation_euler[2]=(-.15 if i==0 else .1)
 box('Toast crumb',(bread.location.x,py,1.201),(.13,.245,.012),'bread-inner',.028,'food','toast')
for i in range(24):
 a=i*2.4;r=.19*math.sqrt((i+1)/24);o=cyl('Penne pasta',(px+math.cos(a)*r,py+math.sin(a)*r,1.18+random.random()*.025),.018,.095,'egg','food',(0,math.pi/2,random.random()*6),'pasta',12)
for i in range(8):sphere('Pasta sauce',(px+random.uniform(-.12,.12),py+random.uniform(-.1,.1),1.222),(.049,.038,.013),'sauce','food','pasta')
for dx in [-.10,.09]:
 sphere('Chicken breast',(px+dx,py,1.197),(.085,.16,.039),'chicken','food','chicken')
 for k in range(4):o=box('Chicken grill mark',(px+dx,py-.085+k*.054,1.234),(.103,.006,.005),'bread',.002,'food','chicken');o.rotation_euler[2]=.22
for i in range(5):
 a=i*1.3;sphere('Broccoli floret',(px+math.cos(a)*.205,py+math.sin(a)*.20,1.195),(.038,.041,.029),'leaf','food','chicken')
# Preparation objects, board, knife, tomato, egg bowl, recipe book, plate and oil.
box('End grain chopping board',(-.95,-.69,1.057),(.61,.65,.055),'oak5',.033,'prep')
for i in range(6):box('Board grain strip',(-1.2+i*.1,-.69,1.086),(.003,.60,.001),'oak1',0,'prep')
blade=box('Chef knife blade',(-.82,-.68,1.101),(.055,.27,.012),'steel',.007,'prep');blade.rotation_euler[2]=-.16
knife=box('Chef knife walnut grip',(-.78,-.91,1.105),(.04,.18,.03),'dark',.014,'prep');knife.rotation_euler[2]=-.16
for i in range(3):sphere('Knife rivet',(-.78,-.86-i*.05,1.124),(.005,.005,.003),'steel','prep')
for x,y in [(-1.08,-.55),(-1.13,-.75)]:
 sphere('Fresh tomato',(x,y,1.145),(.065,.06,.061),'tomato','prep')
 for a in range(5):
  leaf=sphere('Tomato calyx',(x+math.cos(a*1.257)*.013,y+math.sin(a*1.257)*.013,1.204),(.025,.007,.004),'leaf','prep');leaf.rotation_euler[2]=a*1.257
# Serving plate with formed foot and glazed concentric lip.
cyl('Plate foot',(1,-.88,1.045),.14,.022,'white','plate');cyl('Plate',(1,-.88,1.071),.265,.026,'white','plate');torus('Plate raised rim',(1,-.88,1.091),.245,.016,'white','plate')
for x in [.75,1.28]:box('Cutlery handle',(x,-1.14,1.064),(.018,.22,.012),'brass',.006,'plate')
sphere('Spoon bowl',(1.28,-.985,1.073),(.037,.06,.014),'brass','plate')
box('Fork head',(.75,-.982,1.071),(.032,.065,.008),'brass',.004,'plate')
for x in [.74,.75,.76]:box('Fork tine',(x,-.933,1.071),(.005,.044,.006),'brass',.002,'plate')
cyl('Oil bottle',(.91,-.26,1.16),.059,.26,'oil','prep');cyl('Oil bottle neck',(.91,-.26,1.33),.027,.1,'oil','prep');cyl('Bottle cap',(.91,-.26,1.39),.032,.037,'brass','prep');box('Bottle paper label',(.91,-.323,1.18),(.067,.003,.11),'label',.002,'prep')
# Potted herbs with individual organic leaves.
cyl('Herb pot',(1.23,-.24,1.115),.10,.17,'terracotta','prep');cyl('Soil',(1.23,-.24,1.204),.087,.008,'dark','prep')
for i in range(14):
 a=i*2.4;r=random.uniform(.035,.12);z=random.uniform(1.24,1.45);tube('Herb stem',[(1.23,-.24,1.20),(1.23+math.cos(a)*r,-.24+math.sin(a)*r,z)],.004,'leaf','prep');o=sphere('Basil leaf',(1.23+math.cos(a)*r,-.24+math.sin(a)*r,z),(.045,.020,.008),'leaf' if i%2 else 'leaf-light','prep');o.rotation_euler=(.3,random.random()*.7,a)
# Background countertop objects: toaster, mugs, recipe book and oak shelves.
box('Toaster',(-1.57,1.3,1.078),(.37,.28,.24),'steel',.07,'prep')
for x in [-1.64,-1.50]:box('Toaster slot',(x,1.3,1.206),(.023,.20,.008),'dark',.008,'prep')
box('Recipe book cover',(.2,1.32,.97),(.39,.33,.023),'sage',.006,'prep');box('Recipe book pages',(.2,1.31,.985),(.37,.31,.018),'paper',.004,'prep')
for x in [2.24,2.52]:
 cyl('Coffee cup',(x,1.37,1.053),.065,.18,'white','prep');torus('Cup handle',(x+.075,1.37,1.066),.039,.01,'white','prep',(math.pi/2,0,0))
# Warm pendant above workspace, open underside.
tube('Pendant cable',[(.05,-.64,3.14),(.05,-.64,2.65)],.008,'dark')
cyl('Pendant canopy',(.05,-.64,3.13),.10,.035,'brass');cyl('Pendant shade',(.05,-.64,2.62),.32,.17,'sage');cyl('Pendant diffuser',(.05,-.64,2.535),.285,.008,'white');torus('Pendant rim',(.05,-.64,2.54),.311,.015,'brass')
# Convert evaluated geometry into material/part batches consumed by Three.js.
scene=bpy.context.scene;deps=bpy.context.evaluated_depsgraph_get();batches={}
for obj in list(scene.objects):
 if obj.type not in ['MESH','CURVE']:continue
 ev=obj.evaluated_get(deps);mesh=ev.to_mesh();mesh.calc_loop_triangles();material=obj.data.materials[0].name;key=(material,obj.get('part','room'),obj.get('recipe',''));b=batches.setdefault(key,{'material':material,'part':key[1],'recipe':key[2],'positions':[],'normals':[]});nm=obj.matrix_world.to_3x3().inverted().transposed()
 for tri in mesh.loop_triangles:
  for li in tri.loops:
   loop=mesh.loops[li];v=obj.matrix_world@mesh.vertices[loop.vertex_index].co;n=(nm@mesh.corner_normals[li].vector).normalized()
   b['positions'].extend(round(c,5) for c in v);b['normals'].extend(round(c,4) for c in n)
 ev.to_mesh_clear()
# Index shared position/normal pairs to keep the mobile download and GPU memory small.
for batch in batches.values():
 unique={};positions=[];normals=[];indices=[]
 for i in range(0,len(batch['positions']),3):
  key=tuple(batch['positions'][i:i+3]+batch['normals'][i:i+3])
  if key not in unique:
   unique[key]=len(positions)//3;positions.extend(key[:3]);normals.extend(key[3:])
  indices.append(unique[key])
 batch['positions']=positions;batch['normals']=normals;batch['indices']=indices
materials={name:{'color':list(m.diffuse_color[:3]),'roughness':m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value,'metalness':m.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value}for name,m in mats.items()}
with open(os.path.join(out,'scene.json'),'w')as f:json.dump({'format':1,'units':'meters','up':'z','foodPivot':[px,py,1.17],'materials':materials,'meshes':list(batches.values())},f,separators=(',',':'))
# Render the actual exported model geometry with soft physically based lighting.
for obj in scene.objects:
 if obj.get('recipe') and obj['recipe']!='eggs':obj.hide_render=True
world=bpy.data.worlds.new('Kitchen daylight');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.82,.95,1);world.node_tree.nodes['Background'].inputs[1].default_value=.24;scene.world=world
for name,loc,power,size,color,target in [('Window daylight',(-1,1.1,3.5),450,3,(.82,.91,1),(0,-.7,0)),('Large softbox',(1,-3.5,4.5),300,4,(1,.90,.75),(0,0,1)),('Pendant warm glow',(.05,-.64,2.4),45,1,(1,.77,.47),(0,-.7,1))]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color;o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(4.7,-6.5,3.7));camera=bpy.context.object;camera.rotation_euler=(Vector((0,.05,1.20))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=43;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=128;scene.cycles.use_denoising=False;scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX';scene.render.filepath=os.path.join(out,'kitchen-3d-overview.png');bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'kitchen.blend'));bpy.ops.render.render(write_still=True)
camera.location=(2.30,-3.6,3.35);camera.rotation_euler=(Vector((-.10,-.64,1.08))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=48;scene.render.filepath=os.path.join(out,'kitchen-3d-countertop.png');bpy.ops.render.render(write_still=True)
print('Exported',len(batches),'mesh batches to',out)
