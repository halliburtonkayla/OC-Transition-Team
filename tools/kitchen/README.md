# Real 3D kitchen assets

The runtime uses the repository's existing `assets/vendor/three-0.180.0.js`.
No CDN or new runtime package is required. Recipes, banking, resident storage,
and inventory continue to live in the original application.

Rebuild from the repository root (Blender 4.3+ and Python 3):

1. `blender -b --threads 4 --python tools/kitchen/build_scene.py -- "$PWD/transition-life/assets/kitchen-3d"`
2. `python tools/kitchen/pack_model.py transition-life/assets/kitchen-3d/scene.json`
3. `convert transition-life/assets/kitchen-3d/kitchen-3d-overview.png -quality 84 transition-life/assets/kitchen-3d/kitchen-3d-overview.webp`

Deploy the `scene.json`, `scene.bin`, and `.webp` files, not the `.blend`/PNG
review artifacts. The build uses fixed random seeds. Keep binary and metadata
from the same build together. Geometry is in meters with Z up; the viewer
rotates the room into Three's Y-up coordinate system.

The offline PNG previews render the same meshes with Blender Cycles area
lighting. They demonstrate geometry and spatial depth; they are not browser
screenshots, and Three's lighting/reflections differ. The WebP is only a loading
or unsupported-WebGL fallback. A successful viewer displays a real WebGL canvas.

Runtime details: 64 material/interaction batches, about 110,000 maximum triangles
per selected food model, 2.58 MB binary payload plus 16 KB metadata, pixel ratio
capped at 1.5, 512px shadow map on narrow screens, demand-driven rendering,
local asset caching, and explicit resource disposal when a lesson panel closes.
Drag to inspect, choose camera presets, or tap modeled appliances for guidance.
The existing cooking gesture rotates actual food meshes. No new movement/game
progress mechanics are introduced.

Checks:
- `node tests/transition-life-core.test.cjs`
- `node tests/kitchen-visual.test.cjs`
- `node tests/kitchen-model.test.mjs`

The latter two are DOM-shim and actual Three mesh-construction tests respectively;
they do not replace WebGL/browser/mobile layout QA.
