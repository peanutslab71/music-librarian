import json, os, base64, io, glob
from PIL import Image
import sys
LIB = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
art = {}
for f in os.listdir('artwork'):
    if not f.endswith('.jpg'): continue
    img = Image.open(os.path.join('artwork', f)); img.thumbnail((384, 384))
    buf = io.BytesIO(); img.save(buf, 'JPEG', quality=78)
    art[f[:-4]] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
lib = json.load(open('library.json')); notes = json.load(open('notes.json'))
for a in lib:
    if a['id'] in notes: a['note'] = notes[a['id']]
models = {}
for f in []:  # GLTF crowd disabled — procedural figures preferred
    name = os.path.basename(f)
    models[name] = 'data:model/gltf-binary;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
    print('embedded character:', name)
three = open('node_modules/three/build/three.min.js').read()
gltfl = open('node_modules/three/examples/js/loaders/GLTFLoader.js').read()
skel = open('node_modules/three/examples/js/utils/SkeletonUtils.js').read()
app = open('app.js').read(); shell = open('shell.html').read()
db = ('<script>\nconst LIBRARY = ' + json.dumps(lib) + ';\nconst ART = ' + json.dumps(art) +
      ';\nconst MODELS = ' + json.dumps(models) + ';\n</script>')
html = shell.replace('<!--THREE-->', '<script>\n' + three + '\n</script>\n<script>\n' + gltfl + '\n</script>\n<script>\n' + skel + '\n</script>')
html = html.replace('<!--DATA-->', db).replace('<!--APP-->', '<script>\n' + app + '\n</script>')
open(os.path.join(LIB, 'The Listening Rooms.html'), 'w').write(html)
print('built', os.path.getsize(os.path.join(LIB, 'The Listening Rooms.html')) // 1024, 'KB, models:', len(models))
