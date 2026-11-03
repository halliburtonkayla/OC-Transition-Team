import * as T from "../../vendor/three-0.180.0.js";
import { softwareRenderer } from "../software-renderer.mjs";
import {
  SKINS,
  HAIRCOLORS,
  EYES,
  COLORS,
  WEATHER,
  garmentById,
  defaultAvatar,
  defaultOutfit,
} from "./dress-data.mjs";
// Original articulated Transition Town character and fitted wardrobe generator.
// Body proportions transform a single compatible joint hierarchy. Replacements
// remove and dispose the previous garment group; no flat clothing overlays exist.
const disposeGroup = (g) => {
  g.traverse((o) => {
    o.geometry?.dispose();
    if (o.material) {
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        m.map?.dispose();
        m.dispose();
      }
    }
  });
  g.removeFromParent();
};
const mat = (c, rough = 0.65, extra = {}) =>
  new T.MeshPhysicalMaterial({
    color: c,
    roughness: rough,
    metalness: 0,
    clearcoat: 0.15,
    ...extra,
  });
function mesh(geo, material, parent, x = 0, y = 0, z = 0) {
  const o = new T.Mesh(geo, material);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
function box(parent, x, y, z, w, h, d, color, r = 0.04) {
  return mesh(
    r
      ? new T.RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 3, h / 3, d / 3))
      : new T.BoxGeometry(w, h, d),
    typeof color === "string" ? mat(color) : color,
    parent,
    x,
    y,
    z,
  );
}
function ball(parent, x, y, z, rx, ry, rz, color) {
  const b = mesh(
    new T.SphereGeometry(1, 24, 16),
    typeof color === "string" ? mat(color) : color,
    parent,
    x,
    y,
    z,
  );
  b.scale.set(rx, ry, rz);
  return b;
}
function tube(parent, x, y, z, rt, rb, h, color) {
  return mesh(
    new T.CylinderGeometry(rt, rb, h, 28),
    typeof color === "string" ? mat(color) : color,
    parent,
    x,
    y,
    z,
  );
}
function textile(color, pattern) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = color;
  x.fillRect(0, 0, 128, 128);
  if (pattern === "stripe") {
    x.fillStyle = "#ffffff65";
    for (let i = 0; i < 128; i += 22) x.fillRect(0, i, 128, 7);
  }
  if (pattern === "check") {
    x.fillStyle = "#ffffff35";
    for (let i = 0; i < 128; i += 32) {
      x.fillRect(i, 0, 10, 128);
      x.fillRect(0, i, 128, 10);
    }
  }
  x.strokeStyle = pattern === "texture" ? "#ffffff28" : "#ffffff0c";
  x.lineWidth = 1;
  for (let i = 0; i < 128; i += 4) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i, 128);
    x.stroke();
    x.beginPath();
    x.moveTo(0, i);
    x.lineTo(128, i);
    x.stroke();
  }
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return mat("#ffffff", 0.72, { map: tex, clearcoat: 0 });
}
function torso(
  parent,
  material,
  { height = 0.54, width = 0.275, y = 1.38, bottom = 0.91 } = {},
) {
  const geo = new T.CylinderGeometry(1, 1, height, 36, 14),
    a = geo.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const yy = a.getY(i) / height + 0.5,
      t = 1 - yy;
    const curve =
      yy > 0.78
        ? 1.02 - (yy - 0.78) * 0.13
        : yy > 0.4
          ? 0.78 + (yy - 0.4) * 0.63
          : bottom + (yy / 0.4) * (0.78 - bottom);
    a.setXYZ(
      i,
      a.getX(i) * width * curve,
      a.getY(i),
      a.getZ(i) * 0.145 * (0.92 + 0.08 * Math.sin(t * Math.PI)),
    );
  }
  geo.computeVertexNormals();
  return mesh(geo, material, parent, 0, y, 0);
}
function label(
  parent,
  text,
  x,
  y,
  z,
  w = 2,
  h = 0.4,
  bg = "#173f45",
  fg = "#f8efdb",
) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 144;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 768, 144);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.font = "600 45px Arial";
  ctx.fillText(text, 384, 88, 730);
  const tx = new T.CanvasTexture(c);
  tx.colorSpace = T.SRGBColorSpace;
  return mesh(
    new T.PlaneGeometry(w, h),
    new T.MeshBasicMaterial({ map: tx }),
    parent,
    x,
    y,
    z,
  );
}
export function createCharacter(
  config = defaultAvatar(),
  outfit = defaultOutfit(),
  { npc = false } = {},
) {
  const root = new T.Group();
  root.name = npc ? "supportive-character" : "learner-avatar";
  const rig = new T.Group();
  root.add(rig);
  rig.scale.set([0.9, 1, 1.17][config.body], config.height, 1);
  const skin = mat(SKINS[config.skin], 0.6, { clearcoat: 0.05 }),
    hair = mat(HAIRCOLORS[config.hairColor], 0.74);
  const head = new T.Group();
  rig.add(head);
  head.position.set(0, 1.91, 0);
  head.scale.x = [1, 1.08, 0.94][config.face];
  ball(head, 0, 0, 0, 0.158, 0.204, 0.143, skin);
  ball(head, -0.159, -0.006, 0, 0.024, 0.043, 0.025, skin);
  ball(head, 0.159, -0.006, 0, 0.024, 0.043, 0.025, skin);
  ball(
    head,
    0,
    -0.011,
    0.143,
    0.019 + [0.002, 0.008, 0][config.features],
    0.038,
    0.024,
    skin,
  );
  tube(rig, 0, 1.694, 0, 0.061, 0.067, 0.14, skin);
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new T.Group();
    head.add(eye);
    eye.position.set(side * 0.061, 0.031, 0.128);
    eye.rotation.y = side * 0.17;
    eyes.push(eye);
    ball(eye, 0, 0, 0, 0.034, 0.019, 0.012, "#f7f3eb");
    ball(eye, 0, 0, 0.01, 0.013, 0.014, 0.006, EYES[config.eye]);
    ball(eye, 0, 0, 0.015, 0.006, 0.008, 0.003, "#171719");
    ball(eye, -0.004, 0.005, 0.019, 0.0035, 0.0035, 0.002, "#ffffff");
    const brow = ball(
      head,
      side * 0.063,
      0.065,
      0.131,
      0.036,
      0.006,
      0.009,
      hair,
    );
    brow.rotation.z = side * 0.09;
  }
  const mouth = ball(
    head,
    0,
    -0.073,
    0.137,
    0.038 + [0, 0.003, 0.008][config.features],
    0.008,
    0.011,
    mat("#8e4e48", 0.55),
  );
  ball(head, 0, -0.084, 0.138, 0.031, 0.006, 0.009, mat("#af6e61", 0.5));
  const hairGroup = new T.Group();
  head.add(hairGroup);
  const cap = mesh(
    new T.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, 1.67),
    hair,
    hairGroup,
    0,
    0.033,
    -0.012,
  );
  cap.scale.set(0.166, 0.19, 0.151);
  if (config.hair === 0 || config.hair === 1) {
    for (let i = 0; i < 8; i++) {
      const strand = ball(
        hairGroup,
        -0.12 + i * 0.033,
        0.178,
        0.014,
        0.028,
        0.047,
        0.115,
        hair,
      );
      strand.rotation.z = config.hair === 1 ? -0.4 : 0;
    }
  }
  if (config.hair === 2) {
    for (let i = 0; i < 45; i++) {
      const a = i * 2.399963,
        r = 0.157 * Math.sqrt((i + 0.5) / 45),
        y = 0.065 + 0.16 * Math.sqrt(Math.max(0, 1 - (r * r) / 0.027));
      ball(
        hairGroup,
        Math.cos(a) * r,
        y,
        Math.sin(a) * r,
        0.039,
        0.04,
        0.039,
        hair,
      );
    }
  }
  if ([3, 4, 5].includes(config.hair)) {
    for (let i = 0; i < (config.hair === 4 ? 10 : 8); i++) {
      const a = (i / 9 - 0.5) * Math.PI * 1.45;
      if (config.hair === 4) {
        for (let j = 0; j < 8; j++)
          ball(
            hairGroup,
            Math.sin(a) * (0.146 + j * 0.002),
            0.09 - j * 0.065,
            -0.05 - Math.cos(a) * 0.13,
            0.022,
            0.041,
            0.025,
            hair,
          );
      } else {
        const strand = ball(
          hairGroup,
          Math.sin(a) * 0.15,
          -0.09,
          -0.087 - Math.cos(a) * 0.08,
          0.04,
          0.26,
          0.05,
          hair,
        );
        strand.rotation.z = Math.sin(a) * 0.12;
      }
    }
  }
  if (config.hair === 5)
    ball(hairGroup, 0, -0.03, -0.19, 0.075, 0.24, 0.065, hair);
  if (config.hair === 6)
    ball(hairGroup, 0, 0.195, -0.07, 0.092, 0.087, 0.085, hair);
  if (config.hair === 7) {
    cap.scale.set(0.16, 0.172, 0.145);
    cap.position.y = 0.025;
  }
  if (config.glasses) {
    const metal = mat("#383342", 0.25, { metalness: 0.55 });
    for (const side of [-1, 1]) {
      const ring = mesh(
        new T.TorusGeometry(0.041, 0.0045, 8, 28),
        metal,
        head,
        side * 0.063,
        0.028,
        0.155,
      );
      ring.scale.y = 0.78;
      box(head, side * 0.116, 0.029, 0.103, 0.008, 0.008, 0.11, metal);
    }
    box(head, 0, 0.028, 0.157, 0.035, 0.006, 0.007, metal);
  }
  const joints = {};
  for (const side of [-1, 1]) {
    const arm = new T.Group();
    arm.position.set(side * 0.275, 1.605, 0);
    arm.rotation.z = side * 0.075;
    rig.add(arm);
    joints[side < 0 ? "leftArm" : "rightArm"] = arm;
    const elbow = new T.Group();
    arm.add(elbow);
    elbow.position.y = -0.31;
    joints[side < 0 ? "leftElbow" : "rightElbow"] = elbow;
    // Rounded joint bridges the upper/lower arm through every pose.
    const elbowSkin = ball(elbow, 0, 0, 0, 0.053, 0.063, 0.051, skin);
    joints[side < 0 ? "leftSkinElbow" : "rightSkinElbow"] = elbowSkin;
    const upper = mesh(
      new T.CapsuleGeometry(0.062, 0.19, 6, 16),
      skin,
      arm,
      0,
      -0.135,
      0,
    );
    const lower = mesh(
      new T.CapsuleGeometry(0.047, 0.19, 6, 16),
      skin,
      elbow,
      0,
      -0.128,
      0,
    );
    ball(elbow, 0, -0.302, 0.008, 0.052, 0.072, 0.035, skin);
    for (let f = 0; f < 3; f++)
      ball(elbow, -0.026 + f * 0.022, -0.341, 0.018, 0.009, 0.033, 0.011, skin);
    const leg = new T.Group();
    leg.position.set(side * 0.119, 1.015, 0);
    rig.add(leg);
    joints[side < 0 ? "leftLeg" : "rightLeg"] = leg;
    const bare = mesh(
      new T.CapsuleGeometry(0.072, 0.64, 6, 18),
      skin,
      leg,
      0,
      -0.46,
      0,
    );
    joints[side < 0 ? "leftSkinLeg" : "rightSkinLeg"] = bare;
    joints[side < 0 ? "leftSkinUpper" : "rightSkinUpper"] = upper;
    joints[side < 0 ? "leftSkinLower" : "rightSkinLower"] = lower;
  }
  let clothes = new T.Group();
  clothes.name = "fitted-wardrobe";
  rig.add(clothes);
  const outfitGroup = (slot, id) => {
    const g = new T.Group();
    g.name = "garment:" + slot + ":" + id;
    g.userData = { slot, garment: id };
    clothes.add(g);
    return g;
  };
  // Each joint's garment is placed in the single removable wardrobe group, with
  // the joint transform updated by pose(). This keeps fitting and motion aligned.
  const attached = [];
  function attach(parent, joint, geo, material, x, y, z) {
    const o = mesh(geo, material, parent, x, y, z);
    attached.push({ o, joint, local: new T.Vector3(x, y, z) });
    return o;
  }
  function build(o) {
    const old = clothes;
    clothes = new T.Group();
    clothes.name = "fitted-wardrobe";
    rig.add(clothes);
    attached.length = 0;
    disposeGroup(old);
    let top = garmentById(o.top?.id),
      dress = garmentById(o.dress?.id),
      outer = garmentById(o.outer?.id);
    for (const side of ["left", "right"]) {
      joints[side + "SkinUpper"].visible = true;
      joints[side + "SkinLower"].visible = true;
      joints[side + "SkinElbow"].visible = true;
      joints[side + "SkinLeg"].visible = true;
    }
    function shirt(value, isOuter = false) {
      if (!value) return;
      const g = garmentById(value.id),
        p = outfitGroup(g.slot, g.id),
        m = textile(COLORS[value.color], value.pattern),
        long = [
          "button",
          "blouse",
          "sweater",
          "hoodie",
          "coat",
          "jacket",
          "raincoat",
          "blazer",
        ].includes(g.cut),
        vest = g.cut === "vest";
      torso(p, m, {
        height: isOuter
          ? g.cut === "coat" || g.cut === "raincoat"
            ? 0.81
            : 0.59
          : 0.54,
        width: isOuter ? 0.302 : 0.278,
        y: isOuter && ["coat", "raincoat"].includes(g.cut) ? 1.25 : 1.38,
        bottom: isOuter ? 1.07 : 0.91,
      });
      if (["polo", "button", "uniform", "blazer"].includes(g.cut)) {
        for (const side of [-1, 1]) {
          const lapel = box(p, side * 0.052, 1.634, 0.112, 0.07, 0.1, 0.026, m);
          lapel.rotation.z = side * -0.43;
        }
        for (let i = 0; i < 5; i++)
          ball(p, 0, 1.57 - i * 0.088, 0.144, 0.007, 0.007, 0.005, "#e5dfd1");
      } else {
        const collar = mesh(
          new T.TorusGeometry(0.065, 0.012, 8, 28),
          m,
          p,
          0,
          1.648,
          0,
        );
        collar.rotation.x = Math.PI / 2;
      }
      if (["hoodie", "raincoat", "coat"].includes(g.cut)) {
        const hood = mesh(
          new T.TorusGeometry(0.107, 0.029, 10, 28),
          m,
          p,
          0,
          1.65,
          -0.045,
        );
        hood.scale.y = 0.62;
        hood.rotation.x = 0.5;
      }
      if (!vest)
        for (const side of ["left", "right"]) {
          joints[side + "SkinUpper"].visible = !long;
          attach(
            p,
            joints[side + "Arm"],
            new T.CapsuleGeometry(
              isOuter ? 0.082 : 0.073,
              long ? 0.2 : 0.07,
              6,
              20,
            ),
            m,
            0,
            long ? -0.14 : -0.084,
            0,
          );
          if (long) {
            joints[side + "SkinLower"].visible = false;
            joints[side + "SkinElbow"].visible = false;
            attach(
              p,
              joints[side + "Elbow"],
              new T.CapsuleGeometry(isOuter ? 0.069 : 0.059, 0.19, 6, 18),
              m,
              0,
              -0.122,
              0,
            );
          }
        }
      if (g.cut === "uniform")
        box(p, -0.112, 1.49, 0.145, 0.089, 0.065, 0.009, "#e5e5cf", 0.003);
      if (vest) {
        for (const y of [1.2, 1.37]) {
          const band = tube(p, 0, y, 0, 0.302, 0.302, 0.026, "#e6edda");
          band.scale.z = 0.54;
        }
      }
      if (["coat", "jacket", "raincoat"].includes(g.cut))
        box(p, 0, 1.32, 0.164, 0.009, 0.44, 0.009, "#cfccb8", 0.003);
      return p;
    }
    if (dress) {
      shirt(o.dress);
      const p = outfitGroup("dress-skirt", dress.id),
        m = textile(COLORS[o.dress.color], o.dress.pattern),
        skirt = tube(
          p,
          0,
          0.855,
          0,
          0.234,
          dress.cut === "formal" ? 0.39 : 0.33,
          0.68,
          m,
        );
      skirt.scale.z = 0.65;
      for (const side of ["left", "right"]) {
        joints[side + "SkinLeg"].scale.y = 0.58;
        joints[side + "SkinLeg"].position.y = -0.62;
      }
    } else {
      shirt(o.top);
      const v = o.bottom,
        g = garmentById(v?.id);
      if (g) {
        const p = outfitGroup("bottom", g.id),
          m = textile(COLORS[v.color], v.pattern);
        if (g.cut === "skirt") {
          const k = tube(p, 0, 0.82, 0, 0.237, 0.34, 0.52, m);
          k.scale.z = 0.64;
          for (const side of ["left", "right"]) {
            joints[side + "SkinLeg"].scale.y = 0.62;
            joints[side + "SkinLeg"].position.y = -0.6;
          }
        } else {
          ball(p, 0, 1.01, 0, 0.244, 0.15, 0.14, m);
          for (const side of ["left", "right"]) {
            const short = g.cut === "shorts";
            joints[side + "SkinLeg"].visible = short;
            joints[side + "SkinLeg"].scale.y = short ? 0.6 : 1;
            joints[side + "SkinLeg"].position.y = short ? -0.6 : -0.46;
            const pants = attach(
              p,
              joints[side + "Leg"],
              new T.CylinderGeometry(0.113, 0.083, short ? 0.3 : 0.85, 24, 4),
              m,
              0,
              short ? -0.13 : -0.4,
              0,
            );
            pants.scale.z = 0.87;
            if (!short) {
              const seam = attach(
                p,
                joints[side + "Leg"],
                new T.BoxGeometry(0.005, 0.74, 0.005),
                mat("#ffffff", 0.9, { transparent: true, opacity: 0.16 }),
                side === "left" ? -0.088 : 0.088,
                -0.42,
                0.047,
              );
            }
          }
          box(p, 0, 1.077, 0.134, 0.04, 0.035, 0.012, "#78756c", 0.003);
        }
      }
    }
    if (outer) {
      // A closed coat replaces the visible torso and sleeves. A sleeveless vest
      // retains the shirt's sleeves. There are never two competing torso surfaces.
      if (outer.cut !== "vest") {
        for (const child of [...clothes.children])
          if (["top", "dress"].includes(child.userData.slot))
            disposeGroup(child);
        for (let i = attached.length - 1; i >= 0; i--)
          if (!attached[i].o.parent) attached.splice(i, 1);
      } else {
        for (const child of clothes.children)
          if (child.userData.slot === "top")
            for (const o of child.children)
              if (
                o.geometry?.type === "CylinderGeometry" &&
                o.position.y === 1.38
              )
                o.visible = false;
      }
      shirt(o.outer, true);
    }
    const fv = o.feet,
      fg = garmentById(fv?.id);
    if (fg) {
      const p = outfitGroup("feet", fg.id),
        m = textile(COLORS[fv.color], fv.pattern),
        sole = mat("#34353b", 0.8);
      for (const side of ["left", "right"]) {
        const boot = ["boots", "workboots"].includes(fg.cut),
          sand = fg.cut === "sandals",
          j = joints[side + "Leg"];
        attach(
          p,
          j,
          new T.RoundedBoxGeometry(0.17, 0.055, 0.3, 2, 0.025),
          sole,
          0,
          -0.969,
          0.055,
        );
        attach(
          p,
          j,
          new T.SphereGeometry(1, 24, 14),
          m,
          0,
          -0.917,
          0.072,
        ).scale.set(0.087, 0.062, 0.155);
        if (boot) {
          const shaft = attach(
            p,
            j,
            new T.CylinderGeometry(0.094, 0.087, 0.25, 24),
            m,
            0,
            -0.805,
            0,
          );
          shaft.scale.z = 0.88;
        }
        if (sand) {
          attach(
            p,
            j,
            new T.BoxGeometry(0.16, 0.022, 0.04),
            mat("#e2cba5"),
            0,
            -0.862,
            0.12,
          );
        } else
          for (let k = 0; k < 3; k++)
            attach(
              p,
              j,
              new T.BoxGeometry(0.072, 0.006, 0.008),
              mat("#e1e0d6"),
              0,
              -0.854,
              0.065 + k * 0.025,
            );
      }
    }
    if (o.head) {
      const v = o.head,
        g = garmentById(v.id),
        p = outfitGroup("head", g.id),
        m = textile(COLORS[v.color], v.pattern),
        hat = mesh(
          new T.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, 1.6),
          m,
          p,
          0,
          2.015,
          -0.008,
        );
      hat.scale.set(0.179, 0.145, 0.166);
      if (g.cut === "cap" || g.cut === "helmet")
        ball(p, 0, 2.022, 0.15, 0.177, 0.011, 0.15, m);
      if (g.cut === "beanie") ball(p, 0, 2.17, -0.008, 0.038, 0.038, 0.038, m);
      if (g.cut === "hairnet") {
        m.transparent = true;
        m.opacity = 0.85;
        hat.scale.set(0.181, 0.15, 0.175);
      }
    }
    if (o.neck) {
      const p = outfitGroup("neck", o.neck.id),
        m = textile(COLORS[o.neck.color], o.neck.pattern);
      const scarf = mesh(
        new T.TorusGeometry(0.085, 0.029, 10, 28),
        m,
        p,
        0,
        1.672,
        0,
      );
      scarf.rotation.x = Math.PI / 2;
      box(p, 0.07, 1.54, 0.17, 0.065, 0.28, 0.02, m);
    }
    if (o.hands) {
      const p = outfitGroup("hands", o.hands.id),
        m = textile(COLORS[o.hands.color], o.hands.pattern);
      for (const side of ["left", "right"])
        attach(
          p,
          joints[side + "Elbow"],
          new T.CapsuleGeometry(0.056, 0.11, 6, 14),
          m,
          0,
          -0.302,
          0.009,
        );
    }
    if (o.accessory) {
      const g = garmentById(o.accessory.id),
        p = outfitGroup("accessory", g.id),
        m = textile(COLORS[o.accessory.color], o.accessory.pattern);
      if (g.cut === "watch")
        attach(
          p,
          joints.leftElbow,
          new T.RoundedBoxGeometry(0.08, 0.045, 0.073, 2, 0.01),
          m,
          0,
          -0.245,
          0,
        );
      if (g.cut === "bag") {
        box(p, 0.32, 1.01, 0, 0.18, 0.26, 0.11, m);
        const strap = mesh(
          new T.TorusGeometry(0.31, 0.012, 8, 30),
          m,
          p,
          0.15,
          1.36,
          0,
        );
        strap.scale.set(0.8, 1, 0.5);
      }
      if (g.cut === "umbrella") {
        tube(p, 0.37, 1.55, 0.08, 0.011, 0.011, 1.18, "#b7b9b8");
        const canopy = mesh(
          new T.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, 1.37),
          m,
          p,
          0.37,
          2.06,
          0.08,
        );
        canopy.scale.set(0.45, 0.22, 0.45);
      }
    }
    pose(0, false);
    root.userData.outfit = structuredClone(o);
    root.userData.garments = Object.values(o)
      .filter(Boolean)
      .map((x) => x.id);
  }
  function pose(t, walking = false, mood = "idle") {
    const stride = walking ? Math.sin(t * 7) * 0.38 : 0;
    joints.leftLeg.rotation.x = stride;
    joints.rightLeg.rotation.x = -stride;
    joints.leftArm.rotation.x = -stride * 0.8;
    joints.rightArm.rotation.x = stride * 0.8;
    joints.leftElbow.rotation.x = -0.08;
    joints.rightElbow.rotation.x = -0.08;
    if (mood === "shiver") {
      joints.leftArm.rotation.z = -0.3 + Math.sin(t * 32) * 0.035;
      joints.rightArm.rotation.z = 0.3 + Math.sin(t * 32) * 0.035;
    } else {
      joints.leftArm.rotation.z = -0.075;
      joints.rightArm.rotation.z = 0.075;
    }
    mouth.scale.y =
      0.008 * (mood === "talk" ? 1 + Math.abs(Math.sin(t * 10)) * 2 : 1);
    const blink = t % 5.7 > 5.5;
    eyes.forEach((e) => (e.scale.y = blink ? 0.12 : 1));
    head.rotation.z = mood === "celebrate" ? Math.sin(t * 3) * 0.03 : 0;
    rig.position.y = walking ? Math.abs(Math.sin(t * 7)) * 0.018 : 0;
    root.updateMatrixWorld(true);
    for (const a of attached) {
      if (!a.o.parent?.parent) continue;
      const target = a.joint.localToWorld(a.local.clone());
      rig.worldToLocal(target);
      a.o.position.copy(target);
      a.o.quaternion.copy(
        rig
          .getWorldQuaternion(rig.quaternion.clone())
          .invert()
          .multiply(a.joint.getWorldQuaternion(a.o.quaternion.clone())),
      );
    }
  }
  build(outfit);
  return {
    root,
    rig,
    joints,
    head,
    eyes,
    updateOutfit: build,
    pose,
    dispose: () => disposeGroup(root),
  };
}
function makeRoom(sceneGroup, weather) {
  const wood = mat("#ae9173", 0.55),
    cream = mat("#ece6da", 0.8),
    teal = mat("#295b5d", 0.48),
    gold = mat("#b99455", 0.3, { metalness: 0.6 });
  box(sceneGroup, 0, -0.12, -0.8, 8, 0.2, 7, "#c5b19a");
  for (let i = 0; i < 16; i++)
    box(
      sceneGroup,
      -3.8 + i * 0.5,
      -0.009,
      -0.8,
      0.012,
      0.006,
      7,
      "#b49b80",
      0,
    );
  box(sceneGroup, 0, 1.7, -3.2, 8, 3.5, 0.15, cream);
  box(sceneGroup, -4, 1.7, -0.6, 0.12, 3.5, 5.4, cream);
  for (let i = 0; i < 13; i++)
    box(sceneGroup, -3.5 + i * 0.58, 1.2, -3.09, 0.025, 2.3, 0.035, "#ded5c5");
  // Bed, upholstered headboard, quilt, pillows, nightstand and warm table lamp.
  box(sceneGroup, -2.3, 0.27, -1.1, 1.7, 0.42, 2.5, wood);
  box(sceneGroup, -2.3, 0.58, -1.1, 1.72, 0.34, 2.48, "#f2efe5");
  box(sceneGroup, -2.3, 0.81, -2.25, 1.85, 1.5, 0.15, teal, 0.06);
  box(sceneGroup, -2.3, 0.79, -0.75, 1.73, 0.15, 1.75, "#b7c8bf");
  for (let k = 0; k < 9; k++)
    box(
      sceneGroup,
      -3.05 + k * 0.19,
      0.872,
      -0.75,
      0.012,
      0.005,
      1.72,
      "#dde2d8",
      0,
    );
  box(sceneGroup, -2.69, 0.84, -1.98, 0.64, 0.17, 0.43, "#fff9ed");
  box(sceneGroup, -1.92, 0.84, -1.98, 0.64, 0.17, 0.43, "#e4c4ad");
  box(sceneGroup, -3.48, 0.43, -2.08, 0.57, 0.84, 0.62, wood);
  box(sceneGroup, -3.48, 0.89, -2.08, 0.62, 0.07, 0.64, cream);
  tube(sceneGroup, -3.48, 1.11, -2.08, 0.025, 0.025, 0.42, gold);
  tube(sceneGroup, -3.48, 1.4, -2.08, 0.17, 0.24, 0.3, "#ece2ca");
  // Window with frame and changing weather. Sky is geometry, not a background photo.
  box(sceneGroup, -0.55, 2.12, -3.05, 1.78, 1.5, 0.08, "#faf7ef");
  box(
    sceneGroup,
    -0.55,
    2.12,
    -2.996,
    1.6,
    1.31,
    0.015,
    mat(WEATHER[weather].sky, 0.2, {
      emissive: WEATHER[weather].sky,
      emissiveIntensity: 0.15,
    }),
  );
  if (WEATHER[weather].rain || WEATHER[weather].snow)
    for (let i = 0; i < 15; i++)
      ball(
        sceneGroup,
        -1.25 + (i % 5) * 0.34,
        1.65 + Math.floor(i / 5) * 0.4,
        -2.97,
        WEATHER[weather].snow ? 0.018 : 0.005,
        WEATHER[weather].snow ? 0.018 : 0.055,
        0.003,
        WEATHER[weather].snow ? "#ffffff" : "#e8f5ff",
      );
  box(sceneGroup, -0.55, 2.12, -2.98, 0.035, 1.32, 0.03, "#faf7ef");
  box(sceneGroup, -0.55, 2.12, -2.98, 1.6, 0.035, 0.03, "#faf7ef");
  label(
    sceneGroup,
    WEATHER[weather].label,
    -0.55,
    1.29,
    -2.98,
    1.65,
    0.28,
    "#f1ede4",
    "#29454a",
  );
  // Walk-in closet: rails, hanging fitted garment miniatures, shelves and drawers.
  for (const x of [1.85, 3.3]) {
    box(sceneGroup, x, 1.38, -2.84, 1.4, 2.77, 0.62, teal);
    box(sceneGroup, x, 1.44, -2.49, 1.22, 2.55, 0.08, "#1d4548");
    const rail = tube(sceneGroup, x, 2.37, -2.25, 0.018, 0.018, 1.14, gold);
    rail.rotation.z = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const h = new T.Group();
      h.position.set(x - 0.48 + i * 0.18, 1.9, -2.24);
      sceneGroup.add(h);
      h.userData.action = "closet:top";
      const wire = mesh(
        new T.TorusGeometry(0.07, 0.006, 5, 3),
        gold,
        h,
        0,
        0.31,
        0,
      );
      wire.rotation.z = Math.PI;
      ball(
        h,
        0,
        0.04,
        0,
        0.1,
        0.19,
        0.045,
        mat(COLORS[(i + Math.round(x)) % COLORS.length]),
      );
    }
    for (let i = 0; i < 3; i++) {
      box(
        sceneGroup,
        x,
        0.17 + i * 0.23,
        -2.35,
        1.16,
        0.21,
        0.4,
        wood,
      ).userData.action = "closet:bottom";
      box(sceneGroup, x, 0.17 + i * 0.23, -2.12, 0.25, 0.017, 0.025, gold);
    }
  }
  // The mirror has a synchronized reflected character. It shares the current
  // fitted outfit and is rebuilt immediately when clothing or proportions change.
  box(sceneGroup, 1.55, 1.17, -1.7, 1.03, 2.34, 0.1, gold).userData.action =
    "mirror";
  box(
    sceneGroup,
    1.55,
    1.17,
    -1.63,
    0.92,
    2.22,
    0.025,
    mat("#9eafb2", 0.11, { metalness: 0.75, clearcoat: 1 }),
  ).userData.action = "mirror";
  tube(sceneGroup, 0, 0.009, 0.3, 0.9, 0.9, 0.012, "#d3cbbd");
  // Door, challenge phone stand, framed artwork, plant, wall light.
  box(sceneGroup, 3.61, 1.2, -0.3, 0.13, 2.4, 1.16, "#9c8061").userData.action =
    "door";
  ball(sceneGroup, 3.51, 1.15, -0.08, 0.03, 0.03, 0.03, gold);
  box(sceneGroup, 0.55, 0.77, -2.5, 0.65, 1.48, 0.38, wood);
  box(
    sceneGroup,
    0.55,
    1.61,
    -2.4,
    0.31,
    0.45,
    0.04,
    "#253b45",
  ).userData.action = "challenge";
  label(sceneGroup, "YOUR NEXT STEP", 0.55, 1.64, -2.37, 0.29, 0.19, "#234d55");
  box(sceneGroup, -3.89, 2, -0.3, 0.045, 0.78, 0.62, gold);
  box(sceneGroup, -3.855, 2, -0.3, 0.02, 0.67, 0.51, "#c5806d");
  plant(sceneGroup, -1.3, 0, -2.5, 1);
  label(
    sceneGroup,
    "THE TRANSITION TOWN WARDROBE",
    2.58,
    3,
    -2.47,
    2.55,
    0.3,
    "#295b5d",
  );
}
function plant(g, x, y, z, scale = 1) {
  const p = new T.Group();
  g.add(p);
  p.position.set(x, y, z);
  p.scale.setScalar(scale);
  tube(p, 0, 0.18, 0, 0.16, 0.13, 0.36, "#d1bfaa");
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const l = ball(
      p,
      Math.cos(a) * 0.13,
      0.54 + i * 0.045,
      Math.sin(a) * 0.13,
      0.06,
      0.24,
      0.03,
      "#526e4d",
    );
    l.rotation.z = Math.cos(a) * 0.4;
  }
}
function seat(g, x, z, color = "#607c7b") {
  box(g, x, 0.4, z, 0.9, 0.17, 0.7, color);
  box(g, x, 0.77, z - 0.3, 0.93, 0.7, 0.13, color);
  for (const dx of [-0.34, 0.34])
    for (const dz of [-0.23, 0.23])
      box(g, x + dx, 0.18, z + dz, 0.04, 0.4, 0.04, "#665947");
}
function destination(g, type, weather) {
  box(g, 0, -0.12, -0.8, 9, 0.2, 9, type === "park" ? "#a4b28c" : "#c0b3a0");
  if (type === "park") {
    box(g, 0, 0, 0, 2, 0.02, 8, "#c9bd9b");
    for (const [x, z] of [
      [-2, -2],
      [2.5, -3],
      [-3, 1],
      [3, 1],
    ]) {
      tube(g, x, 1, z, 0.09, 0.13, 2, "#795c43");
      ball(g, x, 2.3, z, 0.9, 1.1, 0.8, "#6e8b5c");
    }
    seat(g, -1.8, -0.8);
    label(g, "TRANSITION TOWN PARK", 0, 2.45, -3.5, 3, 0.5);
  } else {
    box(g, 0, 1.65, -3.5, 9, 3.4, 0.16, "#e7e3d8");
    for (const x of [-3.4, 3.4]) {
      box(g, x, 1.65, -1.5, 0.14, 3.4, 4.1, "#dad7ce");
      plant(g, x * 0.8, 0, -2.8, 1.3);
    }
    if (type === "grocery") {
      for (const x of [-2.6, 2.6]) {
        box(g, x, 0.95, -1.5, 1.5, 1.9, 0.5, "#b2b2a7");
        for (let j = 0; j < 4; j++) {
          box(g, x, 0.25 + j * 0.43, -1.15, 1.45, 0.04, 0.5, "#ddd8c4");
          for (let i = 0; i < 5; i++)
            box(
              g,
              x - 0.53 + i * 0.25,
              0.36 + j * 0.43,
              -1.18,
              0.16,
              0.22,
              0.14,
              COLORS[(i + j * 3) % 12],
            );
        }
      }
      box(g, 0, 0.47, -2.3, 1.8, 0.94, 0.65, "#6b867f");
      box(g, 0.4, 1.12, -2.3, 0.34, 0.31, 0.04, "#354952");
    } else if (type === "office" || type === "workplace") {
      box(g, 0, 0.82, -2.2, 2.3, 0.13, 1, "#ac9273");
      for (const x of [-0.9, 0.9])
        box(g, x, 0.4, -2.2, 0.08, 0.8, 0.8, "#3c5355");
      box(g, 0.15, 1.1, -2.3, 0.58, 0.4, 0.04, "#314a51");
      seat(g, -1, -0.5);
      seat(g, 1, -0.5);
      if (type === "workplace")
        for (let i = 0; i < 4; i++)
          box(g, -2.8, 1.2, -2 + i * 0.65, 0.7, 2, 0.4, "#8c9998");
    } else if (type === "school") {
      box(g, 0, 1.93, -3.35, 3, 1.15, 0.06, "#3a6561");
      label(
        g,
        "YOUR NEXT STEP STARTS HERE",
        0,
        1.96,
        -3.3,
        2.7,
        0.4,
        "#3a6561",
      );
      for (let i = 0; i < 5; i++) {
        box(g, -2.6 + i * 0.43, 1, -2.9, 0.4, 1.9, 0.4, COLORS[9 + (i % 3)]);
        box(g, -2.47 + i * 0.43, 1.04, -2.67, 0.025, 0.12, 0.025, "#ece9dd");
      }
      seat(g, 1.8, -1.7);
    } else if (type === "church" || type === "memorial") {
      for (const z of [-2.2, -1.1])
        for (const x of [-1.9, 1.9]) {
          box(g, x, 0.5, z, 1.8, 0.12, 0.5, "#9d8061");
          box(g, x, 0.8, z - 0.2, 1.8, 0.55, 0.09, "#9d8061");
        }
      box(g, 0, 0.78, -2.8, 0.7, 1.55, 0.5, "#aa957a");
      for (const x of [-0.8, 0.8]) {
        plant(g, x, 0, -3, 1.7);
        for (let i = 0; i < 4; i++)
          ball(
            g,
            x - 0.1 + i * 0.07,
            1.07 + (i % 2) * 0.08,
            -2.95,
            0.07,
            0.07,
            0.07,
            type === "memorial" ? "#f5e7e0" : "#d7bc99",
          );
      }
    } else if (type === "restaurant" || type === "celebration") {
      for (const x of [-2, 2]) {
        tube(g, x, 0.8, -1.5, 0.7, 0.7, 0.1, "#dfd4c0");
        tube(g, x, 0.4, -1.5, 0.04, 0.04, 0.8, "#5d5851");
        seat(g, x, -2.4);
        tube(g, x, 0.88, -1.5, 0.12, 0.12, 0.08, "#f7f3e9");
        plant(g, x, 0.85, -1.5, 0.35);
      }
      if (type === "celebration")
        for (let i = 0; i < 9; i++) {
          const b = ball(
            g,
            -2.3 + i * 0.6,
            2.55 + Math.sin(i) * 0.16,
            -3,
            0.13,
            0.19,
            0.13,
            COLORS[i % 12],
          );
        }
    } else if (type === "daycare") {
      box(g, -1.5, 0.012, -1.4, 2, 0.03, 2, "#a9bcbd");
      for (let i = 0; i < 9; i++)
        box(
          g,
          -2 + (i % 3) * 0.3,
          0.14 + Math.floor(i / 3) * 0.2,
          -1.5,
          0.2,
          0.2,
          0.2,
          COLORS[i % 12],
        );
      box(g, 1.9, 0.7, -2.8, 1.5, 1.4, 0.6, "#b69a7d");
    } else {
      seat(g, -1.9, -1.5, "#8ca7a0");
      seat(g, 1.8, -1.5, "#8ca7a0");
      box(g, 0, 0.4, -1.9, 1.1, 0.08, 0.7, "#b39b7d");
      box(g, 0, 1.9, -3.36, 1.5, 0.8, 0.05, "#a8b8ae");
    }
    label(
      g,
      {
        grocery: "TRANSITION MARKET",
        office: "OPPORTUNITY OFFICE",
        workplace: "WORK & COMMUNITY",
        school: "TRANSITION TOWN SCHOOL",
        church: "COMMUNITY GATHERING",
        memorial: "REMEMBERING TOGETHER",
        daycare: "LITTLE STEPS CENTER",
        house: "A FRIEND’S PLACE",
        living: "HOME, YOUR WAY",
        restaurant: "THE TOWN TABLE",
        celebration: "LET’S CELEBRATE",
      }[type] || "WELCOME",
      0,
      2.98,
      -3.34,
      3.5,
      0.43,
    );
  }
}
export function createDressScene(
  canvas,
  {
    config = defaultAvatar(),
    outfit = defaultOutfit(),
    weather = "sunny",
    onError = () => {},
    onInteract = () => {},
  } = {},
) {
  let needsRender = true;
  let renderer,
    software = false,
    disposed = false,
    raf = 0,
    motion = true,
    low = false,
    active = true,
    rotation = 0,
    viewMode = "bedroom",
    character,
    reflection,
    npc,
    stage = "bedroom",
    walking = false,
    mood = "idle",
    npcTalking = false,
    transition = null;
  try {
    renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: true,
    });
  } catch {
    try {
      renderer = softwareRenderer(canvas);
      software = true;
    } catch (e) {
      onError(e);
      return null;
    }
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = !software;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color("#e8e3d8");
  scene.fog = new T.Fog("#e8e3d8", 13, 32);
  const camera = new T.PerspectiveCamera(38, 1, 0.05, 50),
    aim = new T.Vector3(0, 1.07, 0),
    cameraGoal = new T.Vector3(0.3, 1.65, 4.4);
  camera.position.copy(cameraGoal);
  camera.lookAt(aim);
  scene.add(new T.HemisphereLight("#fff4e5", "#829495", 2.1));
  const sun = new T.DirectionalLight("#ffe2b8", 3.6);
  sun.position.set(-3, 6, 4);
  sun.castShadow = !software;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -4 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const fill = new T.DirectionalLight("#c4e4ff", 1.35);
  fill.position.set(4, 4, -2);
  scene.add(fill);
  if (!software) {
    const imgs = Array.from({ length: 6 }, () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const x = c.getContext("2d"),
        g = x.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0, "#fff4d5");
      g.addColorStop(0.5, "#b1c0c6");
      g.addColorStop(1, "#716c60");
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
      x.fillStyle = "#fff";
      x.fillRect(10, 5, 45, 9);
      return c;
    });
    const env = new T.CubeTexture(imgs);
    env.colorSpace = T.SRGBColorSpace;
    env.needsUpdate = true;
    scene.environment = env;
    scene.environmentIntensity = 0.48;
  }
  let env = new T.Group();
  scene.add(env);
  makeRoom(env, weather);
  character = createCharacter(config, outfit);
  scene.add(character.root);
  function reflect() {
    needsRender = true;
    if (reflection) {
      reflection.removeFromParent();
    }
    reflection = character.root.clone(true);
    reflection.name = "outfit-mirror-reflection";
    reflection.position.set(1.55, 0.12, -1.53);
    reflection.scale.set(-0.8, 0.8, 0.8);
    reflection.rotation.y = -0.06;
    scene.add(reflection);
  }
  reflect();
  const particle = new T.Group();
  scene.add(particle);
  for (let i = 0; i < 36; i++) {
    const drop = ball(
      particle,
      ((i % 6) - 3) * 0.8,
      1 + (i % 5) * 0.43,
      -2.85,
      weather === "snowy" ? 0.025 : 0.008,
      weather === "snowy" ? 0.025 : 0.085,
      0.008,
      weather === "snowy" ? "#f8fcff" : "#a1c6dd",
    );
    drop.userData.phase = i * 0.37;
  }
  particle.visible = false;
  const raycaster = new T.Raycaster();
  let pointer = null;
  function resize() {
    needsRender = true;
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  const down = (e) => {
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    canvas.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (pointer?.id !== e.pointerId) return;
    const dx = e.clientX - pointer.x;
    if (Math.abs(dx) > 1) pointer.moved = true;
    rotation += dx * 0.012;
    needsRender = true;
    pointer.x = e.clientX;
  };
  const up = (e) => {
    if (pointer?.id !== e.pointerId) return;
    if (!pointer.moved) {
      const r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new T.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          1 - ((e.clientY - r.top) / r.height) * 2,
        ),
        camera,
      );
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        let o = hit.object;
        while (o && !o.userData.action) o = o.parent;
        if (o) {
          onInteract(o.userData.action);
          break;
        }
      }
    }
    pointer = null;
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  const key = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      rotation += (e.key === "ArrowLeft" ? -1 : 1) * 0.18;
      needsRender = true;
    }
  };
  canvas.addEventListener("keydown", key);
  let last = 0,
    frames = 0,
    totalMs = 0,
    lastTime = performance.now();
  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden || now - last < (low || software ? 65 : 32))
      return;
    const delta = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!motion && !walking && !transition && !needsRender) return;
    const t = motion ? now / 1000 : 0;
    if (transition) {
      const f = motion
        ? Math.min(1, (now - transition.start) / transition.duration)
        : 1;
      const smooth = f * f * (3 - 2 * f);
      character.root.position.lerpVectors(
        transition.from,
        transition.to,
        smooth,
      );
      if (f === 1) {
        walking = false;
        const cb = transition.done;
        transition = null;
        cb();
      }
    }
    character.root.rotation.y = rotation;
    character.pose(t, walking, mood);
    npc?.pose(t, false, npcTalking ? "talk" : "idle");
    camera.position.lerp(cameraGoal, motion ? 0.12 : 1);
    camera.lookAt(aim);
    if (motion && particle.visible)
      particle.children.forEach(
        (d) => (d.position.y = 3 - ((t * 1.4 + d.userData.phase) % 3)),
      );
    renderer.render(scene, camera);
    needsRender = false;
    frames++;
    totalMs += performance.now() - lastTime;
    lastTime = performance.now();
    canvas.dataset.rendered = "true";
    canvas.dataset.renderer = software ? "software" : "webgl";
    canvas.dataset.stage = stage;
    canvas.dataset.garments = character.root.userData.garments.join(",");
    canvas.dataset.body = String(config.body);
    canvas.dataset.config = JSON.stringify(config);
    canvas.dataset.rotation = rotation.toFixed(2);
    canvas.dataset.frames = String(frames);
    canvas.dataset.triangles = String(renderer.info?.render?.triangles || 0);
  }
  raf = requestAnimationFrame(frame);
  const api = {
    update(c, o) {
      config = c;
      outfit = o;
      const pos = character.root.position.clone();
      character.dispose();
      character = createCharacter(c, o);
      character.root.position.copy(pos);
      scene.add(character.root);
      reflect();
    },
    change(o) {
      outfit = o;
      character.updateOutfit(o);
      reflect();
      canvas.dataset.garments = character.root.userData.garments.join(",");
    },
    rotate(n) {
      rotation += n;
      needsRender = true;
    },
    view(mode) {
      viewMode = mode;
      if (mode === "room") {
        cameraGoal.set(0.2, 2.65, 6.8);
        aim.set(0, 1, -0.5);
      } else if (mode === "face") {
        cameraGoal.set(0.1, 1.93, 1.3);
        aim.set(0, 1.86, 0);
      } else if (mode === "closet") {
        cameraGoal.set(0.9, 1.72, camera.aspect < 0.8 ? 4.6 : 3.4);
        aim.set(0.8, 1.12, -0.7);
      } else if (mode === "mirror") {
        cameraGoal.set(2.2, 1.75, 2.9);
        aim.set(0.55, 1.15, -0.25);
      } else {
        cameraGoal.set(0.3, 1.65, camera.aspect < 0.8 ? 5.5 : 4.4);
        aim.set(0, 1.07, 0);
      }
      resize();
    },
    moveTo(where) {
      const target =
        where === "closet"
          ? new T.Vector3(0.8, 0, -0.7)
          : where === "door"
            ? new T.Vector3(2.8, 0, 0.1)
            : new T.Vector3(0, 0, 0);
      walking = true;
      return new Promise((done) => {
        transition?.done();
        transition = {
          from: character.root.position.clone(),
          to: target,
          start: performance.now(),
          duration: 800,
          done,
        };
      });
    },
    destination(type, w) {
      stage = "destination";
      disposeGroup(env);
      env = new T.Group();
      scene.add(env);
      destination(env, type, w);
      reflection.visible = false;
      character.root.position.set(0, 0, 0);
      rotation = 0;
      weather = w;
      scene.background.set(WEATHER[w].sky);
      particle.visible = !!(WEATHER[w].rain || WEATHER[w].snow);
      npc?.dispose();
      npc = createCharacter(
        { ...defaultAvatar(), skin: 2, hair: 1, body: 0 },
        { ...defaultOutfit(), top: { id: "polo", color: 5, pattern: "solid" } },
        { npc: true },
      );
      npc.root.userData.action = "feedback";
      npc.root.position.set(-1.5, 0, -1.5);
      npc.root.rotation.y = 0.25;
      scene.add(npc.root);
      api.view("full");
    },
    bedroom(w) {
      stage = "bedroom";
      weather = w;
      disposeGroup(env);
      env = new T.Group();
      scene.add(env);
      makeRoom(env, w);
      npc?.dispose();
      npc = null;
      character.root.position.set(0, 0, 0);
      reflection.visible = true;
      rotation = 0;
      mood = "idle";
      scene.background.set("#e8e3d8");
      particle.visible = false;
      api.view("full");
    },
    travel() {
      stage = "travel";
      disposeGroup(env);
      env = new T.Group();
      scene.add(env);
      box(env, 0, -0.08, -1, 8, 0.15, 9, "#aebf9d");
      box(env, 0, 0.01, -1, 1.8, 0.03, 9, "#c4bda7");
      for (let i = 0; i < 6; i++)
        box(
          env,
          (i % 2 ? 1 : -1) * 2,
          1.3,
          -4 + Math.floor(i / 2) * 2,
          1.5,
          2.6,
          1.4,
          i % 2 ? "#c6b49c" : "#b9c6bc",
        );
      reflection.visible = false;
      character.root.position.set(0, 0, 1);
      walking = true;
      rotation = Math.PI;
      api.view("room");
    },
    mood(v) {
      mood = v;
      needsRender = true;
    },
    talk(v) {
      npcTalking = v;
    },
    pause(v) {
      active = !v;
      needsRender = true;
    },
    motion(v) {
      motion = v;
      needsRender = true;
    },
    quality(v) {
      low = v;
      renderer.setPixelRatio(v ? 1 : Math.min(devicePixelRatio || 1, 1.5));
      renderer.shadowMap.enabled = !v && !software;
      sun.castShadow = !v && !software;
      resize();
    },
    inspect() {
      return {
        renderer: software ? "software" : "webgl",
        avatar: character,
        scene,
        clothes: character.root.userData.garments,
        frames,
        averageFrameMs: frames ? totalMs / frames : 0,
      };
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("keydown", key);
      transition?.done();
      character.dispose();
      npc?.dispose();
      reflection?.removeFromParent();
      disposeGroup(env);
      disposeGroup(particle);
      scene.environment?.dispose();
      renderer.dispose?.();
    },
  };
  return api;
}
