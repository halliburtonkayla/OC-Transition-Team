# Word Quest & Dress the Part

This development expansion adds two playable stations to the Learning Arcade in
PR #16. It reuses the same private learner connection, game evidence, teacher
recommendations, teacher observations and report pipeline. No separate roster,
student database, wallet or official-service system is created.

## Review and release boundary

Review this companion PR against `feature/learning-arcade-student-management`.
The current main branch's Kitchen Sanitation lesson is retained as well. Nothing
in this PR merges, publishes, deploys, applies SQL, or edits live student data.
After approval, the existing Arcade release must include the updated classroom
function, its module dependencies, and the reviewed `tt_arcade_save_run` definition
in `docs/learning-arcade/schema.sql` before enabling connected saving in the new
stations. The function remains service-only and derives ownership from the
approved device. The new checkpoint revision check prevents a stale tab from
overwriting newer avatar or puzzle edits. Use the established PR #16 release
procedure; this document is not authorization to execute it.

Guest and explicitly unrecorded play stays in page memory. Guest saves do not
survive closing/reloading a tab. Connected saves resume the exact page and outfit
through the existing private service. Failed saves stay printable in the open
page. Locking clears rendered private information before another learner connects.
No gameplay calls a bank, payroll, business ledger, or official Pre-ETS service.
ESP, CDC and Pre-ETS Learning evidence remain separately labeled.

## Word Quest: Glossy Bubble Edition

- Ten original book themes, four difficulties, **exactly 20 distinct words** on
  every page. Each theme has 20 concept-linked vocabulary prompts, with four
  vocabulary tiers. There are 800 tiered vocabulary entries.
- Seeded generation verifies complete placement before filling spare cells.
  Beginner uses right/down, Medium uses four orthogonal directions, and Hard /
  Expert use all eight. The two advanced levels deliberately prefer overlap.
  A deterministic grid expansion resolves unusually dense advanced pages rather
  than dropping words or returning an unsolvable page.
- Pointer dragging, touch endpoints and keyboard endpoints share the same straight
  path validator. Arrow keys move focus, Enter / Space select endpoints, Escape
  clears. Found paths remain as separate colored SVG strokes, including overlaps.
- Check marks, retained strikethrough words, optional original synthesized chimes,
  celebrations, hints, reduced motion, read-aloud, text sizing, full screen and
  optional timing. Questions never block puzzle completion.
- Per-book / difficulty bookmarks preserve unfinished pages when changing books.
  Page completion and assistance are evidence events, not mastery certification.
- Blank puzzle, word-bank puzzle, current / completed puzzle, separate answer key,
  paired student/key printing, optional vocabulary prompts and private progress
  report. All print modes use the same generated grid and puzzle ID. US Letter
  layout uses black text and ink-friendly key outlines; Save as PDF is available
  through the browser print dialog.

## Dress the Part: Life in Style

- Original procedural human avatars: eight skin tones, three face shapes, three
  facial feature sets, five eye colors, eight hairstyles, eight hair colors,
  three body proportions, adjustable height and glasses. No Snapchat character,
  branding, recording or proprietary asset is included in the repository.
- The original articulated character source and garment assets are in
  `assets/learning-arcade/expansion/dress-scene.mjs`. Garments are actual 3D meshes
  fitted to a shared joint hierarchy and proportional transform. Replacing a
  garment removes/disposes its prior group; dresses remove conflicting top and
  bottom meshes, and closed coats replace the visible torso and sleeves while
  retaining a dress skirt. Short sleeves leave the appropriate exposed arm visible.
  Avatar changes update the character without reloading the room or page.
- 36 garment/accessory styles, 12 colors and four fabric treatments. Tops, pants,
  skirts, dresses, shoes, outer layers, headwear, scarves, gloves and accessories
  have independent slots and appropriate conflict rules. Prices are fictional
  instructional prices, unrelated to the Town bank or businesses.
- Bedroom with bed, nightstand, lamp, window/weather, dresser, clothing racks,
  shelves/drawers, full-length mirror, challenge phone and door. Racks/drawers,
  mirror and phone support raycast interaction as well as equivalent buttons.
- Twenty scenarios, eight weather conditions and forecast changes. Beginner
  scenarios use a smaller simple deck and clear weather; Medium combines the
  destination and weather; Hard adds safety/dress rules and changing forecasts;
  Expert also uses a clothing budget and limited collection.
- Bedroom → walk-in closet → outfit changes → mirror → departure/travel → destination
  → supportive evaluation → retry or return home / next challenge. Twelve original
  destination scene types include market, office, school, workplace, church,
  memorial, daycare, park, friend's home, restaurant, celebration and home living
  room. A supportive NPC and optional spoken feedback accompany the checks.
- Suitability checks consider completeness, actual dress expectations, protective
  shoes, grip, long pants, required equipment, warmth, rain, snow, budget and
  available items. Colors, skin tone, body proportions, gender and fashion
  preference never determine a score. The memorial scenario states the host's
  flexible request and welcomes any color or style.
- Retries preserve the outfit. Successful challenges award practice stars, unlock
  the next challenge and can be replayed. Three optional self-advocacy / planning
  reflection prompts do not gate progression.
- Private individual reports retain actual scenarios, difficulty, weather/changes,
  outfit, dress rules, successful decisions, improvement feedback, attempts,
  completion, active time and existing teacher observations. The server sanitizes
  checkpoints and recomputes practical outfit results rather than trusting client
  result labels.

## Graphics and device limitations

This is a working original 3D game with a **stylized parametric character**, not a
photorealistic scanned or artist-sculpted commercial character. Garments follow
an articulated hierarchy; the assets do not use imported skeletal skin weights
or cloth physics. The mirror is a synchronized reflected avatar, rather than an
expensive planar-reflection render pass. The destinations provide the scenario,
rotatable avatar, character feedback and retry flow; they are compact modeled
sets rather than open-world environments.

Balanced WebGL uses physical materials, procedural fabric textures, environment
lighting and shadows. Lower graphics reduces resolution, shadow cost and frame
frequency while preserving the same fitted meshes and customization. A software
renderer preserves geometry and controls when WebGL is unavailable, at a lower
visual and performance level. Actual Chromebook / iPad / school-network / local
voice / physical printer trials remain necessary; software-GPU CI is not a claim
of performance on every school device. Word Quest has a horizontally scrollable
letter area on small screens so the 20-word grid stays readable.

Speech depends on installed browser voices and requires a user action. Sounds
are off initially and do not use commercial music. All spoken content is also
shown as text. No AI API, paid generation service, external tracking or remote
model CDN is required by the new games.

## Verification

Run from repository root with Node 24 and isolated dependencies:

```sh
npm install --prefix /tmp/learning-arcade-qa --no-save jsdom@26.1.0 @electric-sql/pglite@0.3.14 @playwright/test@1.51.1
node --test tests/arcade-expansion-*.test.mjs tests/learning-arcade-*.test.mjs
```

The CI workflow also runs existing school / Prism Pour / classroom / bank /
business regressions and a release audit. The isolated Chromium check uses only
fictional learners and mocked private responses; it blocks production service
access. Its artifact contains actual implemented gameplay screenshots and US
Letter print PDFs, plus a machine-readable browser result.

Actual implemented gameplay and print examples:

- [Word Quest library](evidence/word-library.jpg) · [Playing the glossy book](evidence/word-quest-playing.jpg) · [Phone touch play](evidence/word-quest-phone.jpg)
- [Avatar creation](evidence/dress-avatar-creator.jpg) · [Red polo replacement](evidence/dress-red-polo-front.jpg) · [Side view](evidence/dress-red-polo-side.png) · [Back view](evidence/dress-red-polo-back.png)
- [Supportive correction](evidence/dress-supportive-retry.jpg) · [Successful destination](evidence/dress-destination-success.jpg) · [Phone wardrobe](evidence/dress-the-part-phone.jpg)
- [Exact student puzzle + teacher key PDF](evidence/word-search-student-and-key.pdf) · [Fictional individual practice report PDF](evidence/dress-student-practice-report.pdf)

See [QA.md](QA.md) for passing check links, coverage, bounded saved-evidence limits
and school-device verification still needed.
