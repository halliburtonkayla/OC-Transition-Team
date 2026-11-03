import test from "node:test";
import assert from "node:assert/strict";
import { createCharacter } from "../assets/learning-arcade/expansion/dress-scene.mjs";
import {
  defaultAvatar,
  defaultOutfit,
  GARMENTS,
} from "../assets/learning-arcade/expansion/dress-data.mjs";
import { wear } from "../assets/learning-arcade/expansion/dress-core.mjs";
const doc = {
  createElement() {
    return {
      width: 128,
      height: 128,
      getContext() {
        return {
          fillRect() {},
          beginPath() {},
          moveTo() {},
          lineTo() {},
          stroke() {},
        };
      },
    };
  },
};
test("Actual original meshes replace clothes across all body types and heights without retaining the original garment", () => {
  const original = globalThis.document;
  globalThis.document = doc;
  try {
    for (const body of [0, 1, 2])
      for (const height of [0.88, 1, 1.12]) {
        let o = defaultOutfit();
        const ch = createCharacter({ ...defaultAvatar(), body, height }, o);
        const old = ch.rig.children.find((g) => g.name === "fitted-wardrobe");
        o = wear(o, "polo", 0);
        ch.updateOutfit(o);
        assert.equal(old.parent, null);
        assert.equal(
          ch.rig.children.filter((g) => g.name === "fitted-wardrobe").length,
          1,
        );
        let names = [];
        ch.root.traverse((o) => names.push(o.name));
        assert.ok(!names.includes("garment:top:tee"));
        assert.ok(names.includes("garment:top:polo"));
        for (const g of GARMENTS) {
          o = wear(o, g.id);
          ch.updateOutfit(o);
          ch.pose(1.7, true);
          assert.equal(
            ch.rig.children.filter((g) => g.name === "fitted-wardrobe").length,
            1,
          );
          let meshes = 0;
          ch.root.traverse((m) => {
            if (!m.isMesh) return;
            meshes++;
            const p = m.geometry.attributes.position;
            for (let i = 0; i < p.count; i++) {
              assert.ok(Number.isFinite(p.getX(i)));
              assert.ok(Number.isFinite(p.getY(i)));
              assert.ok(Number.isFinite(p.getZ(i)));
            }
          });
          assert.ok(meshes > 30);
        }
        o = wear(defaultOutfit(), "formal", 0);
        ch.updateOutfit(o);
        names = [];
        ch.root.traverse((o) => names.push(o.name));
        assert.ok(!names.includes("garment:top:tee"));
        assert.ok(!names.includes("garment:bottom:jeans"));
        assert.ok(names.includes("garment:dress:formal"));
        o = wear(o, "coat");
        ch.updateOutfit(o);
        names = [];
        ch.root.traverse((o) => names.push(o.name));
        assert.ok(!names.includes("garment:dress:formal"));
        assert.ok(names.includes("garment:dress-skirt:formal"));
        assert.ok(names.includes("garment:outer:coat"));
        ch.dispose();
      }
  } finally {
    globalThis.document = original;
  }
});
test("Avatar features, hair, glasses, facial motion and joint movement exist as actual original 3D geometry", () => {
  const original = globalThis.document;
  globalThis.document = doc;
  try {
    for (let hair = 0; hair < 8; hair++) {
      const ch = createCharacter(
        { ...defaultAvatar(), hair, glasses: true },
        defaultOutfit(),
      );
      const before = ch.joints.leftLeg.rotation.x;
      ch.pose(1, true);
      assert.notEqual(ch.joints.leftLeg.rotation.x, before);
      ch.pose(5.6, false);
      assert.equal(ch.eyes[0].scale.y, 0.12);
      ch.pose(2, false, "shiver");
      assert.ok(ch.joints.leftArm.rotation.z < 0);
      assert.ok(ch.root.children.length);
      ch.dispose();
    }
  } finally {
    globalThis.document = original;
  }
});
