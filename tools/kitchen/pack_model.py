"""Pack indexed mesh arrays into a compact binary file after build_scene.py."""
from pathlib import Path
import json,struct,sys
p=Path(sys.argv[1]);data=json.loads(p.read_text())
if data['format']!=1:raise SystemExit('Expected fresh format-1 build')
buf=bytearray()
def append(values,fmt):
 while len(buf)%4:buf.append(0)
 offset=len(buf);buf.extend(struct.pack('<'+str(len(values))+fmt,*values));return offset
for mesh in data['meshes']:
 pos=mesh.pop('positions');norm=mesh.pop('normals');idx=mesh.pop('indices');mesh['vertexCount']=len(pos)//3;mesh['indexCount']=len(idx)
 mesh['positionOffset']=append(pos,'f');mesh['normalOffset']=append([round(max(-1,min(1,n))*32767)for n in norm],'h')
 mesh['indexBits']=16 if max(idx)<65536 else 32;mesh['indexOffset']=append(idx,'H' if mesh['indexBits']==16 else 'I')
data['format']=2;data['buffer']='scene.bin';(p.parent/'scene.bin').write_bytes(buf);p.write_text(json.dumps(data,separators=(',',':')))
print('Packed model:',len(buf),'bytes plus',p.stat().st_size,'bytes metadata')
