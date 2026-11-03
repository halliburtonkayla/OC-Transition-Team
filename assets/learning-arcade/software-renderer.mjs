// A depth-buffered CPU renderer for devices where WebGL is blocked. It projects
// the exact same room meshes, textures and camera, preserving walk and raycasts.
import * as T from "../vendor/three-0.180.0.js";
export function softwareRenderer(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw Error("Canvas unavailable");
  let W = 800,
    H = 500,
    pixels = null,
    depth = null;
  const textures = new WeakMap(),
    sun = new T.Vector3(-0.4, 0.9, 0.3).normalize();
  function textureData(map) {
    if (!map?.image) return null;
    if (textures.has(map)) return textures.get(map);
    try {
      const img = map.image,
        c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      const out = {
        data: x.getImageData(0, 0, c.width, c.height).data,
        w: c.width,
        h: c.height,
        rx: map.repeat?.x || 1,
        ry: map.repeat?.y || 1,
      };
      textures.set(map, out);
      return out;
    } catch {
      return null;
    }
  }
  return {
    shadowMap: { enabled: false },
    setPixelRatio() {},
    setSize(w, h) {
      const scale = Math.min(1, 1000 / w);
      W = Math.max(1, Math.round(w * scale));
      H = Math.max(1, Math.round(h * scale));
      canvas.width = W;
      canvas.height = H;
      pixels = ctx.createImageData(W, H);
      depth = new Float32Array(W * H);
    },
    dispose() {},
    render(scene, camera) {
      if (!pixels || !depth) return;
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      depth.fill(Infinity);
      const out = pixels.data;
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 225;
        out[i + 1] = 229;
        out[i + 2] = 228;
        out[i + 3] = 255;
      }
      scene.traverse((o) => {
        if (!o.isMesh || !o.visible) return;
        for (let parent = o.parent; parent; parent = parent.parent)
          if (!parent.visible) return;
        const mirrored = o.matrixWorld.determinant() < 0;
        const geo = o.geometry,
          pos = geo.attributes.position,
          idx = geo.index,
          uv = geo.attributes.uv,
          mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (!pos || !mat || mat.opacity === 0) return;
        const tex = textureData(mat.map),
          verts = [];
        for (let i = 0; i < pos.count; i++) {
          const world = new T.Vector3(
              pos.getX(i),
              pos.getY(i),
              pos.getZ(i),
            ).applyMatrix4(o.matrixWorld),
            eye = world.clone().applyMatrix4(camera.matrixWorldInverse),
            v = world.project(camera);
          verts.push({
            x: ((v.x + 1) * W) / 2,
            y: ((1 - v.y) * H) / 2,
            z: v.z,
            iw: 1 / -eye.z,
            u: uv?.getX(i) || 0,
            v: 1 - (uv?.getY(i) || 0),
          });
        }
        for (let i = 0, n = idx ? idx.count : pos.count; i < n; i += 3) {
          const ids = [0, 1, 2].map((j) => (idx ? idx.getX(i + j) : i + j)),
            [a, b, c] = ids.map((id) => verts[id]);
          if ([a, b, c].some((p) => p.z >= 1 || p.z <= -1 || p.iw <= 0))
            continue;
          const den = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
          if (
            Math.abs(den) < 0.01 ||
            (den * (mirrored ? -1 : 1) > 0 && mat.side !== T.DoubleSide)
          )
            continue;
          const xmin = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x))),
            xmax = Math.min(W - 1, Math.ceil(Math.max(a.x, b.x, c.x))),
            ymin = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y))),
            ymax = Math.min(H - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
          if (xmax < xmin || ymax < ymin) continue;
          const normal = new T.Vector3(
            pos.getX(ids[1]) - pos.getX(ids[0]),
            pos.getY(ids[1]) - pos.getY(ids[0]),
            pos.getZ(ids[1]) - pos.getZ(ids[0]),
          )
            .cross(
              new T.Vector3(
                pos.getX(ids[2]) - pos.getX(ids[0]),
                pos.getY(ids[2]) - pos.getY(ids[0]),
                pos.getZ(ids[2]) - pos.getZ(ids[0]),
              ),
            )
            .transformDirection(o.matrixWorld);
          const shade = 0.68 + Math.max(0, normal.dot(sun)) * 0.32,
            color = (mat.color?.clone() || new T.Color("#ddd")).multiplyScalar(
              shade,
            ),
            hex = color.getHex(T.SRGBColorSpace),
            r = (hex >> 16) & 255,
            g = (hex >> 8) & 255,
            bl = hex & 255,
            alpha = mat.opacity ?? 1;
          for (let y = ymin; y <= ymax; y++)
            for (let x = xmin; x <= xmax; x++) {
              const l1 =
                  ((b.y - c.y) * (x + 0.5 - c.x) +
                    (c.x - b.x) * (y + 0.5 - c.y)) /
                  den,
                l2 =
                  ((c.y - a.y) * (x + 0.5 - c.x) +
                    (a.x - c.x) * (y + 0.5 - c.y)) /
                  den,
                l3 = 1 - l1 - l2;
              if (l1 < -0.00001 || l2 < -0.00001 || l3 < -0.00001) continue;
              const z = l1 * a.z + l2 * b.z + l3 * c.z,
                index = y * W + x;
              if (z >= depth[index]) continue;
              depth[index] = z;
              const offset = index * 4;
              let rr = r,
                gg = g,
                bb = bl;
              if (tex) {
                const q = l1 * a.iw + l2 * b.iw + l3 * c.iw,
                  uu =
                    (l1 * a.u * a.iw + l2 * b.u * b.iw + l3 * c.u * c.iw) / q,
                  vv =
                    (l1 * a.v * a.iw + l2 * b.v * b.iw + l3 * c.v * c.iw) / q;
                const tx = Math.min(
                    tex.w - 1,
                    Math.floor(((((uu * tex.rx) % 1) + 1) % 1) * tex.w),
                  ),
                  ty = Math.min(
                    tex.h - 1,
                    Math.floor(((((vv * tex.ry) % 1) + 1) % 1) * tex.h),
                  ),
                  ti = (ty * tex.w + tx) * 4;
                rr = tex.data[ti] * shade;
                gg = tex.data[ti + 1] * shade;
                bb = tex.data[ti + 2] * shade;
              }
              out[offset] = rr * alpha + out[offset] * (1 - alpha);
              out[offset + 1] = gg * alpha + out[offset + 1] * (1 - alpha);
              out[offset + 2] = bb * alpha + out[offset + 2] * (1 - alpha);
            }
        }
      });
      ctx.putImageData(pixels, 0, 0);
    },
  };
}
