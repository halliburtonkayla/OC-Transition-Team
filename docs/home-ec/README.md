# Home Economics & Life Skills Center

This branch adds `home-economics.html` to the original school hallway. It is a review build, not a merged classroom release. The approved “Home Economics Life Skills Center.png” was inspected as the design reference. PR #11 was reviewed before implementation; its flat pilot and batch recipe are replaced on this new branch by a shared Three.js scene and an individual-serving recipe.

## What is implemented

- A modeled classroom with two kitchen islands, raised cabinet doors, stone counters, French-door refrigerator, hinged microwave, sink/faucet, measuring utensils, ingredient packages, washer/dryer drums, baskets, clothing, folding table, household supplies, bed, and signage. Materials, warm lighting, reflections from a generated environment map, shadows, raycast targets, and camera transitions use a locally bundled Three.js 0.180.0. The approved image is not used as a clickable backdrop.
- Tap-to-explore and avatar walk-around share one activity state. Keyboard, held touch controls, camera turning, object highlighting, large equivalent action controls, read-aloud, pause/resume, support levels and larger projector text are provided. Existing avatar colors are used on a modeled character; the existing portrait renderer is retained in the identity area. The source avatars are 2D, not full-body 3D assets.
- The individual recipe uses **½ cup cereal, ⅓ cup mini marshmallows, and ¾ teaspoon butter**. Fourteen supported practice steps break the twelve recipe directions into safety, handwashing, tools, measuring, preparation, supervised microwave practice, cooling and cleanup. Wrong amounts and ordering remain retryable. Handwashing requires 20 elapsed seconds. Microwave/cooling/laundry timers are explicitly game waits, not real appliance instructions.
- Three recipe-writing PDFs, three shopping-list PDFs, an individual teacher checklist, and a snack-shop menu/cost/role planner. Eight files, eleven pages; no learner answers or student names are automatically filled. The recipe data is the generator's source of truth.
- The **existing `grocery-store.html`** retains its entrance, aisle artwork, products, checkout scanner and employee link. Missing cereal and mini-marshmallow packages are appended. Recipe shelves and a modeled wire cart supplement its customer view. Selection, comparison, quantity changes and item scanning use the existing handlers and catalog.
- Lesson checkout has a separate instructional cart, requires all three ingredients, checks product identity/size/price against the current catalog, reconciles integer cents, rejects overspending, saves a receipt, and resumes the saved cooking step. The $20 example produces an $11.27 receipt and $8.73 remaining. It never calls the ordinary bank payment or household-inventory writer. It does not offer a student-selectable bank-payment mode.
- The store's one existing Grocery Radio is reused. Browser-permitted autoplay is attempted; blocked playback exposes **ENTER STORE & PLAY MUSIC**. The music preference and on/off control remain available. Employee code is unchanged.
- A ten-step laundry routine covers sorting, labels, loading, wash settings, labeled detergent amount, wash, lint/low-heat drying, folding and storage. Seven household routines cover dishes, counters, cabinets, groceries, making a bed, supplies and hazards.
- The existing learning store keys records to the active Town profile. Guest practice uses session storage. Meaningful completed steps, budgeting, help requests and support level feed approved-device classroom events. A new private teacher tab uses the existing authenticated `add_observation` endpoint for individually confirmed real-world performance. Assignment links carry support/activity/class-plan preferences without a new student database.
- PR #8's existing Candy Counter files are carried forward unchanged so the weekly snack-shop connection works on this branch. Its storage identity, worker records and pretend-money logic are reused. No new snack ledger is added. Main's newer Letter Lane links and other activities are retained.

## Preview and classroom entry

Serve this static repository with a normal web server. Sign in through `transition-town.html`, choose School, then **Home Economics & Life Skills**. Direct entry uses the existing Town sign-in redirect. Teacher tools are in `classroom-monitor.html#homeec`, behind the existing teacher sign-in.

The development preview uses the managed preview service and a generated static copy. That copy and preview configuration are local-only and are not part of the PR. No production Site or GitHub Pages deployment was made.

## Persistence and evidence boundaries

The shared checkpoint and append-only learning records use `learningStore('home-economics')`. Checkpoints remain on the same device/origin, consistent with the existing learning activities. Approved classroom events can appear in the existing private report system. They are application-reported simulation; visits, attempted controls and print requests are not claimed as mastery or physical performance. Typed reflections remain on the device.

Only the existing authenticated teacher service saves real-world observations. The new checklist requires an individual active session, an observed task/support selection and personal-observation confirmation. The original service limit of 1,500 characters is respected. No database migration, credentials, production data edit, service deployment or new authorization system is required.

There is no lesson cutoff. Local learning progress supports 30-minute, 50-minute, extended and multi-day work. The existing monitor ends non-group reporting windows after 30 minutes; use its existing group-session workflow for connected logs over a longer class. This branch does not change unrelated monitor session rules.

## Verification

See [QA.md](QA.md) for the exact checks and limits. **Do not call the graphics accepted or the feature release-ready until a WebGL-enabled browser has rendered and reviewed it against the approved reference.** The available preview browser reports `GL_RENDERER = Disabled` and refuses a WebGL context. The accessible workflow was tested there; this is not proof of 3D camera quality or device performance.

## Rebuild and checks

```sh
npm ci --prefix tools/home-ec --ignore-scripts --no-audit --no-fund
SCHOOL_JSDOM="$PWD/tools/home-ec/node_modules/jsdom" node --test tests/home-ec*.test.mjs tests/candy-counter*.test.mjs tests/school-release.test.mjs
node tests/student-shop-core.cjs
node tests/business-workday.cjs
node tests/classroom-monitor.cjs
python3 tools/home-ec/build_printables.py
```

PDF generation needs ReportLab, DejaVu Sans and Node. Rebuild the rendering bundle with the same pinned Three.js/esbuild dependencies already used by the Town:

```sh
npm ci --prefix tools/softball --ignore-scripts --no-audit --no-fund
cd tools/softball
./node_modules/.bin/esbuild home-ec-three-entry.js --bundle --format=esm --minify --outfile=../../assets/home-ec/three.js
```

Three.js/addon licensing remains MIT; see `assets/vendor/three-LICENSE` and bundled notices. Classroom meshes are original code, and snack photos reuse PR #8's existing assets. `tools/home-ec/export-scene.mjs` can export the exact meshes for independent inspection with optional `@napi-rs/canvas`; that export is a geometry artifact, not a screenshot or proof of WebGL rendering.
