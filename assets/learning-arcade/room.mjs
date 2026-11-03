import * as T from "../vendor/three-0.180.0.js";
import { GAMES } from "./curriculum.mjs";
import { softwareRenderer } from "./software-renderer.mjs";
// A real, raycastable room. No background screenshot or invisible hotspots.
export function createArcadeRoom(
  canvas,
  { onStation = () => {}, onReady = () => {}, onUnavailable = () => {} } = {},
) {
  let renderer,
    software = false;
  try {
    renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: true,
    });
  } catch (e) {
    try {
      software = true;
      renderer = softwareRenderer(canvas);
    } catch {
      onUnavailable(e);
      return null;
    }
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  if (!software) {
    const faces = Array.from({ length: 6 }, (_, i) => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d"),
        g = x.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#faf2df");
      g.addColorStop(0.55, "#9aaaba");
      g.addColorStop(1, "#d9d1c4");
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
      x.fillStyle = "#ffffff";
      x.fillRect(20, 17, 88, 13);
      return c;
    });
    const env = new T.CubeTexture(faces);
    env.colorSpace = T.SRGBColorSpace;
    env.needsUpdate = true;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
  }
  scene.background = new T.Color("#dfe7eb");
  scene.fog = new T.Fog("#dfe7eb", 28, 65);
  const camera = new T.PerspectiveCamera(53, 1, 0.1, 70);
  let needsRender = true,
    quality = "balanced",
    walk = false,
    motion = !matchMedia("(prefers-reduced-motion: reduce)").matches,
    paused = false,
    frame = 0,
    last = 0,
    tick = 0,
    yaw = 0,
    focus = "room";
  const eye = new T.Vector3(0, 7.0, 12.5),
    aim = new T.Vector3(0, 1.75, -2.4),
    goalEye = eye.clone(),
    goalAim = aim.clone();
  camera.position.copy(eye);
  camera.lookAt(aim);
  const lights = new T.Group();
  scene.add(lights);
  lights.add(new T.HemisphereLight("#f4f9ff", "#a7899e", 1.6));
  const sun = new T.DirectionalLight("#fff0d5", 2.5);
  sun.position.set(-4, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.bias = -0.0006;
  lights.add(sun);
  const fill = new T.DirectionalLight("#b5dcff", 1.3);
  fill.position.set(8, 5, -2);
  lights.add(fill);
  const m = (c, r = 0.3, metal = 0.03, extra = {}) =>
    new T.MeshPhysicalMaterial({
      color: c,
      roughness: r,
      metalness: metal,
      clearcoat: 1,
      clearcoatRoughness: 0.14,
      ...extra,
    });
  const M = {
    wall: m("#e9e6de", 0.9),
    cream: m("#fff5e3", 0.6),
    wood: m("#bda68e", 0.5),
    navy: m("#29394e", 0.22, 0.15),
    pink: m("#e1aacb", 0.2),
    blue: m("#9ebfcf", 0.2),
    steel: m("#b8c6cc", 0.17, 0.7),
    gold: m("#cbaa70", 0.23, 0.7),
    glass: m("#b4d4e5", 0.12, 0.15, { transparent: true, opacity: 0.5 }),
    screen: m("#213c50", 0.15, 0.1),
    leaf: m("#779786", 0.8),
  };
  const group = new T.Group();
  scene.add(group);
  const targets = [],
    cabinets = [],
    floating = [];
  function mesh(geo, mat, parent = group) {
    const o = new T.Mesh(geo, mat);
    parent.add(o);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  }
  function box(x, y, z, w, h, d, mat, parent = group) {
    const geo =
      software || Math.min(w, h, d) < 0.07
        ? new T.BoxGeometry(w, h, d)
        : new T.RoundedBoxGeometry(
            w,
            h,
            d,
            1,
            Math.min(0.06, w * 0.12, h * 0.12, d * 0.12),
          );
    const o = mesh(geo, mat, parent);
    o.position.set(x, y, z);
    return o;
  }
  function cylinder(x, y, z, r, h, mat, parent = group) {
    const o = mesh(new T.CylinderGeometry(r, r, h, 24), mat, parent);
    o.position.set(x, y, z);
    return o;
  }
  function sphere(x, y, z, r, mat, parent = group) {
    const o = mesh(new T.SphereGeometry(r, 20, 14), mat, parent);
    o.position.set(x, y, z);
    return o;
  }
  function texture(lines, bg, accent = "#d6b7d1", size = 512) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const x = c.getContext("2d");
    const grad = x.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, bg);
    grad.addColorStop(1, "#213c54");
    x.fillStyle = grad;
    x.fillRect(0, 0, size, size);
    x.strokeStyle = accent;
    x.lineWidth = 8;
    x.strokeRect(17, 17, size - 34, size - 34);
    x.fillStyle = "#fff5df";
    x.textAlign = "center";
    lines.forEach((l, i) => {
      x.font = `${i === 0 ? "bold " : ""}${Math.min(70, size / (l.length * 0.65))}px Arial`;
      x.fillText(l, size / 2, (size * (i + 1)) / (lines.length + 1), size - 50);
    });
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return { t, c, x };
  }
  function panel(
    lines,
    x,
    y,
    z,
    w,
    h,
    bg = "#304963",
    accent = "#e0afce",
    parent = group,
  ) {
    const { t } = texture(lines, bg, accent);
    const mat = new T.MeshStandardMaterial({
      map: t,
      emissiveMap: t,
      emissive: "#fff",
      emissiveIntensity: 0.34,
      roughness: 0.3,
    });
    const o = mesh(new T.PlaneGeometry(w, h), mat, parent);
    o.position.set(x, y, z);
    o.castShadow = false;
    return o;
  }
  // Ivory terrazzo, brass inlay, warm wood wall and soft daylight windows.
  const floorTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const x = c.getContext("2d");
    x.fillStyle = "#dcdedb";
    x.fillRect(0, 0, 512, 512);
    let seed = 71;
    for (let i = 0; i < 1900; i++) {
      seed = (seed * 16807) % 2147483647;
      const a = seed % 512;
      seed = (seed * 16807) % 2147483647;
      const b = seed % 512;
      x.fillStyle = ["#d3c7be", "#afbac233", "#bda7b433", "#fff5e9"][i % 4];
      x.beginPath();
      x.ellipse(a, b, 1 + (i % 4), 1 + (i % 3), i, 0, 6.3);
      x.fill();
    }
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(5, 5);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  })();
  const floor = mesh(
    new T.PlaneGeometry(19, 19, 24, 24),
    m("#e6e5df", 0.16, 0.1, { map: floorTex }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  box(0, 0.012, 0, 0.035, 0.014, 18, M.gold);
  for (const x of [-5, 5]) box(x, 0.012, 0, 0.022, 0.016, 18, M.gold);
  box(0, 2.65, -7.8, 18, 5.3, 0.25, M.wall);
  for (const x of [-9, 9]) {
    for (let z = -7; z < 7; z += 1)
      box(x, z < 1 ? 2.65 : 1, z, 0.25, z < 1 ? 5.3 : 2, 1, M.wall);
  }
  for (let x = -8.7; x < 8.8; x += 0.24)
    box(x, 1.65, -7.59, 0.08, 3.3, 0.09, M.wood);
  box(0, 4.75, -7.4, 17, 0.1, 0.28, M.gold);
  const led = m("#f2cadc", 0.25, 0, {
    emissive: "#edb3d0",
    emissiveIntensity: 0.6,
  });
  box(0, 4.93, -7.4, 17, 0.09, 0.24, led);
  for (const x of [-8.8, 8.8])
    for (const z of [-4, 1.5]) {
      box(x, 3, z, 0.08, 2.65, 2.7, M.blue);
      box(
        x,
        3,
        z,
        0.1,
        2.35,
        2.4,
        m("#d5e6e5", 0.25, 0, { emissive: "#d5e6e5", emissiveIntensity: 0.18 }),
      );
      box(x, 3, z, 0.14, 0.065, 2.5, M.cream);
      box(x, 3, z, 0.14, 2.45, 0.065, M.cream);
    }
  const sign = panel(
    ["THE LEARNING", "ARCADE", "TRANSITION TOWN SCHOOL"],
    0,
    4.0,
    -7.32,
    7.2,
    1.4,
    "#334359",
    "#e6c6dc",
  );
  // Main selection board and illuminated plinth.
  const board = box(0, 2.25, -6.9, 5.2, 2.1, 0.35, M.navy);
  panel(
    [
      "FIND YOUR NEXT DISCOVERY",
      "MATCH · COUNT · READ · EXPLORE",
      GAMES.length + " STATIONS • YOUR PACE",
    ],
    0,
    2.25,
    -6.7,
    4.95,
    1.85,
    "#3b6175",
    "#dcb7ce",
  );
  board.userData.station = "board";
  targets.push(board);
  for (const game of GAMES) {
    const i = GAMES.indexOf(game),
      split = Math.ceil(GAMES.length / 2),
      side = i < split ? -1 : 1,
      index = i < split ? i : i - split;
    const g = new T.Group();
    g.position.set(
      side * 5.4,
      0,
      -4.55 + index * (7.5 / Math.max(1, Math.ceil(GAMES.length / 2) - 1)),
    );
    g.rotation.y = -side * 0.25;
    g.userData.station = game.id;
    group.add(g);
    cabinets.push(g);
    targets.push(g);
    const paint = m(game.color, 0.22, 0.13);
    box(0, 0.18, 0, 2.15, 0.26, 1.9, M.navy, g);
    box(0, 0.93, 0, 1.9, 1.5, 1.55, paint, g);
    box(0, 1.15, 0.81, 1.62, 0.85, 0.05, M.navy, g);
    box(0, 1.16, 0.845, 1.45, 0.66, 0.015, paint, g);
    box(0, 1.68, 0.27, 2.1, 0.18, 2.15, M.cream, g);
    box(0, 2.62, -0.4, 2.13, 1.85, 0.33, M.navy, g);
    box(0, 3.65, -0.36, 2.2, 0.4, 0.65, paint, g);
    panel(
      [
        game.id === "monsters"
          ? "NUMBER MONSTERS"
          : game.id === "coins"
            ? "COIN SPEEDWAY"
            : game.id === "phonics"
              ? "SOUND POP"
              : game.id === "words"
                ? "WORD DELIVERY"
                : game.id === "store"
                  ? "SUPERSTORE"
                  : "MATCH IT!",
      ],
      0,
      3.65,
      0.01,
      2.02,
      0.32,
      game.color,
      "#fff0df",
      g,
    );
    const screen = texture(
      [
        game.title.split(" ").slice(0, 2).join(" "),
        "PLAY · DISCOVER",
        game.id === "phonics"
          ? "A   B   C"
          : game.id === "monsters"
            ? "1   2   3"
            : game.id === "coins"
              ? "1¢  5¢  10¢"
              : game.id === "words"
                ? "C   A   T"
                : game.id === "store"
                  ? "SCAN • PAY"
                  : "●   ▲   ■",
      ],
      game.color,
    );
    const mat = new T.MeshStandardMaterial({
      map: screen.t,
      emissiveMap: screen.t,
      emissive: "#fff",
      emissiveIntensity: 0.55,
      roughness: 0.18,
    });
    const display = mesh(new T.PlaneGeometry(1.87, 1.5), mat, g);
    display.position.set(0, 2.64, -0.216);
    cylinder(-0.58, 1.86, 0.65, 0.1, 0.22, M.steel, g);
    sphere(-0.58, 2.01, 0.65, 0.15, paint, g);
    for (const x of [0.1, 0.42, 0.74])
      cylinder(
        x,
        1.82,
        0.7,
        0.12,
        0.12,
        x === 0.1 ? M.pink : x === 0.42 ? M.blue : M.gold,
        g,
      );
    box(0, 1.89, -0.75, 2.12, 0.07, 0.1, led, g);
    for (const x of [-0.95, 0.95])
      box(
        x,
        2.55,
        -0.22,
        0.035,
        1.9,
        0.035,
        m(game.color, 0.2, 0, { emissive: game.color, emissiveIntensity: 0.7 }),
        g,
      );
    // Small floating stars are preview animation; motion can be disabled.
    const star = mesh(new T.IcosahedronGeometry(0.16, 0), M.gold, g);
    star.position.set(0.74, 4.18, -0.25);
    floating.push(star);
  }
  // Central low activity table, stools and quiet learning nook; aisle remains clear.
  cylinder(0, 0.94, 2.15, 1.6, 0.13, M.cream);
  cylinder(0, 0.46, 2.15, 0.35, 0.9, M.steel);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const x = Math.cos(a) * 2.1,
      z = 2.15 + Math.sin(a) * 2.1;
    cylinder(x, 0.52, z, 0.43, 0.19, i % 2 ? M.blue : M.pink);
    cylinder(x, 0.26, z, 0.08, 0.45, M.steel);
    cylinder(x, 0.04, z, 0.34, 0.07, M.steel);
  }
  panel(
    ["PROGRESS", "ONE STEP AT A TIME"],
    0,
    1.06,
    2.15,
    1.6,
    0.7,
    "#4a6576",
    "#e9cad6",
  ).rotation.x = -Math.PI / 2;
  const trophy = new T.Group();
  trophy.position.set(0, 0, -4.9);
  group.add(trophy);
  box(0, 0.35, 0, 2.1, 0.7, 1.15, M.pink, trophy);
  cylinder(0, 0.9, 0, 0.23, 0.6, M.gold, trophy);
  const cup = mesh(
    new T.SphereGeometry(0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
    M.gold,
    trophy,
  );
  cup.position.set(0, 1.3, 0);
  cup.rotation.z = Math.PI;
  panel(
    ["YOUR PROGRESS", "KEEP GROWING"],
    0,
    0.42,
    0.59,
    1.8,
    0.48,
    "#77567e",
    "#fff4d6",
    trophy,
  );
  trophy.userData.station = "progress";
  targets.push(trophy);
  function plant(x, z) {
    const p = new T.Group();
    p.position.set(x, 0, z);
    group.add(p);
    cylinder(0, 0.34, 0, 0.4, 0.66, M.cream, p);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4,
        h = 1.0 + (i % 3) * 0.24;
      const leaf = mesh(new T.SphereGeometry(1, 12, 10), M.leaf, p);
      leaf.scale.set(0.18, 0.5, 0.08);
      leaf.rotation.set(0.4, a, 0.5);
      leaf.position.set(Math.sin(a) * 0.26, h, Math.cos(a) * 0.26);
      cylinder(
        Math.sin(a) * 0.1,
        h / 2,
        Math.cos(a) * 0.1,
        0.015,
        h,
        M.leaf,
        p,
      );
    }
  }
  plant(-7.9, -6.8);
  plant(7.9, -6.8);
  plant(-8, 6.2);
  plant(8, 6.2);
  for (const x of [-4, 4]) {
    cylinder(x, 4.85, -1, 0.65, 0.18, M.cream);
    const l = new T.PointLight("#ffe9c3", 8, 7, 2);
    l.position.set(x, 4.6, -1);
    lights.add(l);
  }
  const ray = new T.Raycaster(),
    mouse = new T.Vector2();
  let down = null;
  canvas.addEventListener("pointerdown", (e) => {
    down = [e.clientX, e.clientY];
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 15)
      return;
    const r = canvas.getBoundingClientRect();
    mouse.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(targets, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData.station) o = o.parent;
      if (o) {
        focus = o.userData.station;
        onStation(focus);
      }
    }
    down = null;
  });
  const keys = new Set();
  function move(code, on) {
    if (on) keys.add(code);
    else keys.delete(code);
  }
  const kd = (e) => {
    if (
      !walk ||
      paused ||
      /INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target?.tagName) ||
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "KeyW",
        "KeyS",
        "KeyA",
        "KeyD",
        "KeyQ",
        "KeyE",
        "Enter",
      ].includes(e.code)
    )
      return;
    e.preventDefault();
    if (e.code === "Enter") {
      ray.setFromCamera(new T.Vector2(0, 0), camera);
      const hit = ray.intersectObjects(targets, true)[0];
      if (hit) {
        let o = hit.object;
        while (o && !o.userData.station) o = o.parent;
        if (o) onStation(o.userData.station);
      }
      return;
    }
    move(e.code, true);
  };
  const ku = (e) => move(e.code, false);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  window.addEventListener("blur", () => keys.clear());
  const ro = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    if (r.width && r.height) {
      renderer.setSize(r.width, r.height, false);
      needsRender = true;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    }
  });
  ro.observe(canvas);
  function animate(now) {
    frame = requestAnimationFrame(animate);
    if (document.hidden || paused) {
      last = now;
      return;
    }
    const dt = Math.min(0.04, (now - last) / 1000 || 0);
    last = now;
    tick += dt;
    if (walk) {
      const f =
          (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0) -
          (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0),
        s =
          (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) -
          (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
      yaw += ((keys.has("KeyQ") ? 1 : 0) - (keys.has("KeyE") ? 1 : 0)) * dt;
      let nx = goalEye.x + (Math.cos(yaw) * s - Math.sin(yaw) * f) * dt * 3,
        nz = goalEye.z + (-Math.cos(yaw) * f - Math.sin(yaw) * s) * dt * 3;
      // Boundaries and furniture collision. Safe central aisle and side walkways.
      const blocked =
        cabinets.some(
          (g) =>
            Math.abs(nx - g.position.x) < 1.6 &&
            Math.abs(nz - g.position.z) < 1.55,
        ) ||
        Math.hypot(nx, nz - 2.15) < 1.75 ||
        (Math.abs(nx) < 1.35 && nz < -4.05 && nz > -5.8);
      if (!blocked) {
        goalEye.x = Math.max(-8, Math.min(8, nx));
        goalEye.z = Math.max(-6, Math.min(8, nz));
      }
      goalAim.set(
        goalEye.x - Math.sin(yaw) * 6,
        1.8,
        goalEye.z - Math.cos(yaw) * 6,
      );
    }
    const changed =
      camera.position.distanceToSquared(goalEye) > 1e-6 ||
      aim.distanceToSquared(goalAim) > 1e-6;
    camera.position.lerp(goalEye, software || !motion ? 1 : 0.1);
    aim.lerp(goalAim, software || !motion ? 1 : 0.1);
    camera.lookAt(aim);
    if (motion && !software)
      floating.forEach((s, i) => {
        s.rotation.y = tick * 0.5;
        s.position.y = 4.18 + Math.sin(tick * 1.4 + i) * 0.08;
      });
    if (!walk && (software || !motion) && !changed && !needsRender) return;
    if (quality === "low" && now % 66 > 34) return;
    renderer.render(scene, camera);
    canvas.dataset.rendered = "true";
    canvas.dataset.position = camera.position
      .toArray()
      .map((n) => n.toFixed(3))
      .join(",");
    needsRender = false;
  }
  frame = requestAnimationFrame(animate);
  canvas.dataset.objects = String(group.children.length);
  canvas.dataset.ready = "true";
  canvas.dataset.renderer = software ? "software" : "webgl";
  onReady();
  return {
    get position() {
      return camera.position.toArray();
    },
    get objectCount() {
      return group.children.length;
    },
    setWalk(value) {
      walk = value;
      keys.clear();
      if (walk) {
        goalEye.set(0, 1.8, 7.5);
        yaw = 0;
        goalAim.set(0, 1.8, -4);
      } else this.home();
    },
    home() {
      walk = false;
      goalEye.copy(eye);
      goalAim.set(0, 1.75, -2.4);
    },
    move,
    view(id) {
      const i = GAMES.findIndex((g) => g.id === id);
      if (i < 0) return;
      walk = false;
      const split = Math.ceil(GAMES.length / 2),
        side = i < split ? -1 : 1,
        index = i < split ? i : i - split,
        z = -4.55 + index * (7.5 / Math.max(1, split - 1));
      goalEye.set(side * 2.1, 2.9, z + 3.8);
      goalAim.set(side * 5.4, 2, z);
    },
    setMotion(v) {
      motion = v;
      needsRender = true;
    },
    setPaused(v) {
      paused = v;
      keys.clear();
    },
    setQuality(v) {
      quality = v;
      needsRender = true;
      renderer.setPixelRatio(
        v === "low" ? 1 : Math.min(devicePixelRatio || 1, 1.5),
      );
      renderer.shadowMap.enabled = v !== "low";
    },
    dispose() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      group.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          for (const mat of [o.material].flat()) {
            mat.map?.dispose();
            mat.dispose();
          }
        }
      });
      renderer.dispose();
    },
  };
}
