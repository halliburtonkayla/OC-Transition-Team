# Transition Mission 2.0 — Life Quest

Sign in to Transition Town, enter the school, and choose **Learning Arcade → Play Life Quest**. The game is also listed in the School Directory under **The Wow Zone**, alongside the original Transition Mission. Students can resume from **Continue Adventure** on the same device and browser.

Computers support arrows or WASD, Space to jump, Enter to interact, Shift to run, and Escape to pause. Phones and tablets show a direction pad and action buttons. Students can also enable or hide on-screen controls in Settings.

The actual branch now uses directional animated sprite characters, the illustrated town map, hallway art, textured room scenes, furnished stations, vehicle artwork, and a blue/gold interface. The original Transition Mission and its assets are unchanged. This remains a lightweight Canvas 2D/2.5D game; it is not a new full 3D engine or an exact recreation of the mockup's camera angles.

## Private testing

Download **Life_Quest_Private_Review.html** and open it in a current desktop browser. This self-contained practice build needs no server, sign-in gate, hosted preview, separate asset download, roster, or classroom recorder. All 20 destinations are available across four district tabs. It forces a fictional identity even without `?practice=1` and excludes the real profile adapter and recorder script.

**Character** offers fictional palette, hairstyle, outfit/accessory and character variations. **My Progress** prints the actual practice results. Practice saves remain in that browser tab, separate from classroom progress. Keep the tab open or print results before closing it. Blocked storage produces a saving-unavailable notice. Browser speech depends on installed voices; the game and synthesized effects/music require no audio service.

To review source, check out this branch, run `python -m http.server 8000`, and open `http://localhost:8000/transition-mission-2.html?practice=1`. The disconnected teacher fixture remains at `http://localhost:8000/tests/life-quest-teacher-preview.html`. Do not authorize a classroom device during review.

To rebuild the portable file:

```bash
npm install --prefix /tmp/life-quest-qa --no-save esbuild@0.25.12
LIFE_QUEST_ESBUILD=/tmp/life-quest-qa/node_modules/esbuild node tools/build-life-quest-review.mjs --out /absolute/path/Life_Quest_Private_Review.html
```

It embeds scripts, styles and seven art assets. Metadata records the source commit and script SHA-256. The builder rejects retained recorder/network dependencies; it neither deploys nor writes to GitHub.

## Characters, controls and saves

The renderer reads the validated Town fields: skin, hair, shirt, pants, hair style, outfit/accessories, and gender. Cached sprite frames apply the palette and supported hair/accessory variations. It does not import the original Mission renderer or paste portrait head crops onto bodies. The artwork is a new interpretation of saved customization, not the student's original mesh or portrait. Assigned business portrait files remain untouched. Original sprite/background files were copied unchanged from Kayla's November 5 private review; customization happens at runtime.

Only fictional practice offers local appearance controls. Classroom mode keeps the existing read-only profile adapter. Life Quest never writes Town avatars, bank balances, rosters or original-game storage.

Arrows/WASD move, Space jumps, Enter interacts, Shift runs, Escape pauses, and R resets the box puzzle. Native Tab navigation, remapping, four movement speeds, optional timing, reduced decorative motion, speech, music/effects, mute and volume remain available.

The separate `transition-mission-2` namespace, version-2 checkpoint, suspended missions, completion evidence, active participation timing, printable report and approved-device teacher reporting remain intact. New metadata is saved and validated; legacy checkpoints still restore. Restarts affect only the current mission. No live classroom recording or student records were used in QA. Saves remain browser/device-local, and the existing name-based login is not tamper-proof authentication.

## Difficulty and variety

New adventures start in **Adventure**. Existing saved supports and unfinished layouts are preserved. Movement speed and hazard pacing respond immediately; stored layouts/workloads stay intact until a new attempt so settings changes do not discard objectives.

| Mechanic | Supported | Adventure | Challenge |
| --- | --- | --- | --- |
| Cross Town | 8 vehicles, 1 pickup | 12 vehicles, 2 pickups, roadwork | 16 vehicles, 2 pickups, roadwork |
| Restaurant | 3 deliveries | 4 seeded deliveries | 5 seeded deliveries |
| Grocery | Fixed equal-size prices | Changing equal-size prices | Unit-cost comparisons |
| Budget | $6 total / $4 transit / $2 savings | $12 / $7 / $5 | $18 / $11 / $7 |
| Radio | 3 destinations | 4 changing instructions | 5 changing instructions |
| Box puzzle | Original goals/walls | More distant goals | Distant goals plus another wall |

Traffic alternates directions, mixes vehicle lengths, includes deliberate gaps and lane-specific acceleration, and gets faster toward work. A specific workplace and required route pickups prevent a straight sprint from completing the mission. Four variants rotate across new attempts, with eight commute-planning decisions. Retries keep the route; completed replays add capped escalation (maximum 16%). **Try a new traffic route** retains the abandoned attempt's local evidence and all earlier completions.

Later patrols require tighter timing. Runner obstacles use seeded spacing/movement; the platform mission keeps its lift, gaps and checkpoint. Other missions retain their distinct physical objectives: maze supplies/key, interview documents/appointment, ordered recipe, supportive encounters, three-part relay, bus stops, application fields, laundry cycle, moving parcels, WALK signals, shift tasks and self-advocacy gates. Each retains two required recorded exit decisions. This is seeded variety, not an unlimited content generator; some curricula intentionally repeat for practice.

## Loading investigation

The earlier hosted preview currently serves a ChatGPT sign-in gate before the game. Available error logs contained no events, and the game source has no automatic reload/retry loop. These observations do **not** establish the exact cause of the earlier retry prompts. The account/preview environment remains a plausible cause; a failed module/asset request is another possible failure class.

The portable file removes that hosted gate and dependent requests. The repository launcher also has a stable startup error panel if a module fails, with a bounded diagnostic message, preserved saves and no automatic reload. The hosted sign-in environment itself was not redeployed or claimed repaired.

See [verification.md](verification.md) for checks and remaining pilot limits.
