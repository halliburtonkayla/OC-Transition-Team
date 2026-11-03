# Home Economics art assets

`assets/home-ec/garden-view.webp` was generated with the built-in image generation tool and optimized to WebP. It is used only beyond the real 3D window frame. It contains no interaction hotspots. All classroom furniture, appliances, utensils, ingredients, clothing and activities use actual modeled meshes.

Prompt: “Use case: photorealistic-natural. Asset type: outdoor background texture for windows in an interactive 3D school kitchen, not a room illustration. Primary request: create a photorealistic panoramic view of a calm landscaped school garden on a bright overcast spring morning. View at standing eye height from just outside a building. Soft leafy mature trees, ornamental grasses, natural lawn and shrubs; no people, no buildings, no fences. Composition: landscape 3:1 panorama, level horizon around mid-frame, detailed green foliage across the full width and soft pale blue sky in upper quarter. Gentle natural light with subtle depth, realistic leaf textures. No indoor objects, no window frame, no text, no UI, no watermark. This will be used only as scenery beyond genuinely modeled 3D windows.”

## Approved-reference art revision

The visual target remains the approved glossy classroom image. The interactive scene now uses local photographic PBR maps, an HDR lighting environment, a live planar reflection of the actual room, detailed packaging textures, curved metal/glass appliance parts, stacked laundry units, draped garments and optimized scanned foliage. These assets are applied to real geometry; the classroom image is not a clickable backdrop. The original school hallway artwork is unchanged.

| Local asset | Source / author | Preparation |
| --- | --- | --- |
| `floor_tiles_06-*.jpg` | [Floor Tiles 06](https://polyhaven.com/a/floor_tiles_06), Rob Tuytel | 1K color and OpenGL normal maps; physically reflective stone floor. |
| `marble_01-*.jpg` | [Marble 01](https://polyhaven.com/a/marble_01), Rob Tuytel | 1K color and normal maps on countertop meshes. |
| `kitchen_wood-*.jpg` | [Kitchen Wood](https://polyhaven.com/a/kitchen_wood), Rob Tuytel | 1K source resized to 768px JPG for wood shelves/tables. |
| `fabric-normal.jpg` | [Fabric Pattern 07](https://polyhaven.com/a/fabric_pattern_07), Rob Tuytel | 512px OpenGL normal map on draped fabric geometry. |
| `studio-small-03.hdr` | [Studio Small 03](https://polyhaven.com/a/studio_small_03), Greg Zaal | 1K RGBE environment, converted at runtime to a prefiltered lighting map. |
| `potted-plant.glb` | [Potted Plant 01](https://polyhaven.com/a/potted_plant_01), Rico Cilliers | Welded and simplified to 31,653 triangles; 512px embedded WebP maps. Geometry/materials are shared across instances. |
| `label-cereal.webp`, `label-marshmallows.webp`, `label-butter.webp` | Built-in image generation | Authored flat front textures wrapped onto pickable 3D packages. Cereal edited to depict puffed rice, not cornflakes. |

The Poly Haven assets are CC0, including redistribution with the project; [license](https://polyhaven.com/license). The runtime loads only bundled local assets. File hashes and sizes are recorded in `assets/home-ec/materials/provenance.json`. These simulated product labels do not replace reading real food allergy/ingredient labels with an adult.

The scanned plant was prepared with `@gltf-transform/cli` 4.2.1 using `weld`, `simplify --ratio 0.18 --error 0.015`, `resize --width 512 --height 512`, and `webp --quality 88`. Original GLTF files and their linked source files were downloaded from the provider's public files metadata with MD5 verification.

Packaging prompts are preserved in `assets/home-ec/materials/packaging-prompts.json`. The window-only scenery prompt above remains unchanged.
