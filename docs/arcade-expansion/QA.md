# Expansion QA

## Verified results

All five GitHub workflows passed for source commit
`7602656a0c0df972f09bd46839f73be117a74ddb`: Word Quest / Dress the Part,
Learning Arcade, Classroom Release, Prism Pour, and Letter Lane.

[Full gameplay and PDF run](https://github.com/halliburtonkayla/OC-Transition-Team/actions/runs/41640738466)
· [Complete original artifact](https://github.com/halliburtonkayla/OC-Transition-Team/actions/runs/41640738466/artifacts/13232557785).

- 38 expansion / Arcade / authorization / PostgreSQL tests passed.
- 26 original game / school regressions and 241 classroom / bank / business /
  workday assertions passed.
- Actual WebGL, full-screen entry/exit, text scaling, mouse / keyboard selection,
  phone finger dragging and grid movement, clothing replacement and keyboard
  focus, retry / travel, save/reload, failed-save recovery, and private report
  isolation passed with synthetic data only.
- Browser errors: zero. Print PDFs use 612 × 792 point US Letter pages. Both
  student/key pages and both individual-report pages were rendered and visually
  checked. No clipping, broken grids or blank cover page remains.
- The screenshots and print examples in [evidence/](evidence/) are unmodified
  artifacts from this source revision. They contain only guest / fictional QA
  learners. Later follow-ups improve phone grid controls after touch dragging,
  enlarge their touch targets, and strengthen browser synchronization. Latest
  workflow results are attached to PR #19; the captured scenes retain the same
  original game models, vocabulary and gameplay.

## Automated coverage

- 1,200 deterministic Word Quest puzzles: all 10 topics, four difficulties and
  30 seeds, exactly 20 unique words, every placed letter/path valid, required
  direction coverage, overlap, reproducibility and reversed player selection.
- All 800 vocabulary entries and 20 reachable multiple-choice prompts for every
  topic/tier. Straight paths reject crooked, skipped and out-of-range selections.
- Exact digital/print grid equality; blank, bank, completed, teacher key and
  vocabulary variants; no unsanitized identity HTML.
- Actual Word Quest DOM: pointer drag, tap endpoints, keyboard endpoints, all 20
  locked highlights/check marks, optional questions, next page, per-book resume.
- 4,000 scenario combinations across four difficulties: each has an affordable,
  available, safe solution. All 20 scenarios and eight weather types are covered.
- Practical safety / rain / snow / warmth / formal and workplace checks, multiple
  acceptable interview outfits, flexible memorial guidance, and color/pattern
  invariance. Avatar characteristics are absent from evaluation inputs.
- Original model geometry: replacement and disposal of old garments; no retained
  original T-shirt after replacement; dresses remove top/pants, coats cover the
  torso correctly; every garment across three body types and three heights;
  finite vertices, joint motion, blinking and shivering.
- Actual private function handler: approved-device ownership, denied pending
  devices, no client student-ID override, sanitized save, tampered path rejection,
  recomputed outfit results, no forged teacher observations, separate ESP mode.
- Actual PostgreSQL: identical retries, stale same-version checkpoint rejection,
  newer checkpoint acceptance, and exact preservation of finances, business
  records and previous game sessions. Existing authorization/RLS/roster tests run
  unchanged except additive expansion assertions.
- Isolated CI browser: all 40 topic/difficulty pages, real mouse/keyboard paths,
  completed 20-word page, optional vocabulary, exact print/key, next-page resume;
  actual WebGL avatar customization, immediate red-shirt replacement, front/side/
  back rotation, mirror, unsafe-shoe retry, successful arrival, reflections,
  private fixture saving/reload, lower graphics and shared-device report isolation;
  actual 390-pixel phone touch/drag and grid navigation, full-screen entry/exit,
  actual text-size changes, wardrobe keyboard focus, and responsive layouts;
  native Chromium PDF output.

The CI artifact is named `arcade-expansion-gameplay-evidence`. The workflow has no
publishing or deployment step. Screenshots contain only guest or fictional QA
records, never real student data or the uploaded Snapchat reference.

## Limits to review before release

- Main release still requires approval and the coordinated PR #16 backend/SQL
  rollout. Tests do not call the live private service or edit live records.
- The current cloud interactive browser disables WebGL; its visible manual QA
  uses the same-geometry software fallback. CI explicitly checks WebGL rendering
  in isolated Chromium with SwiftShader.
- Physical school hardware, touchscreen sensitivity, local speech voices,
  school-network restrictions, mobile fullscreen support and a real US Letter
  printer require classroom testing.
- Original parametric characters are stylized. They do not claim photorealistic
  facial fidelity, garment physics, artist-authored skin weights or commercial
  open-world production quality. The source is ready for further art refinement.
- Saved guest play is memory-only, by design. Cross-session / cross-device resume
  requires a connected teacher-approved private learning profile.
- The renderer's simulated mirror duplicates the fitted character. It is not a
  physically traced mirror. Destination sets are deliberately bounded for school
  devices, with scene interaction focused on the learning/feedback flow.

## Bounded saved evidence

The checkpoint holds up to 120 recent detailed outfit attempts and 500 achievement
identifiers; aggregate response/time events remain in the existing run record.
The existing private service limits one run to 5,000 response events, 24 active
hours, and the overall student-state JSON to 5 MB. Longer-term archival, unbounded
outfit history and a separate session-rollover UI are not included. Export / print
classroom evidence regularly and review retention needs before a wider release.
