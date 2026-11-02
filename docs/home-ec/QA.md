# Home Economics implementation and release review

Updated November 2, 2026 (America/Chicago). Review branch: `feature/home-economics-3d-center`, pull request #13. The original flat pilot in PR #11 remains separate and unmerged. Main was reconciled at `7c7b0a0`, including the released Prism Pour activity.

## Implemented and checked locally

| Area | Evidence |
| --- | --- |
| School integration | The original school hallway has an additive Home Economics & Life Skills entrance and a working return route. Original art and doors remain. The newer Prism Pour and Letter Lane entries are retained. |
| Real 3D classroom | Modeled cabinets, two islands, refrigerator, hinged pantry, stove/oven, microwave, sink, bowls, measuring tools, product packages, laundry appliances and clothing. Bundled photographic material maps, HDR lighting, actual floor reflections and scanned plants render on real meshes. Geometry/raycast/camera tests pass. |
| Main lesson order | Safety and handwashing → recipe review → tool collection → ingredient checks → existing store → return at measuring. Missing supplies block measuring. The grocery-first option also retains its cooking checkpoint. |
| Recipe | Exact individual serving: ½ cup cereal, ⅓ cup mini marshmallows and ¾ teaspoon butter. Real elapsed 20-second handwashing, exact measures, retries, supervision/mitts, no metal spoon inside microwave, heat/stir sequence, transfer, cooling, dishes and counter cleanup. Short appliance waits are game practice, not real appliance timing instructions. |
| Existing grocery | Actual shared catalog/register/scanner/receipt handlers run in DOM tests. Missing ingredients, altered prices/quantities, over-budget carts, identity changes and duplicate payment are checked. The ordinary grocery payment/inventory path is tested separately. |
| Financial preservation | Kitchen purchases use an instructional budget. Existing bank, business, ordinary cart and grocery settings remain unchanged during the lesson. No new ledger or backend is introduced. |
| Laundry | All ten stages pass rule tests: sorting, labels, loading, settings, detergent line, wash, transfer/lint/low heat, dry, fold and put away. Beginning mode presents one item or sub-action at a time; other levels retain the larger guided activity. |
| Pre-ETS questions | Eight picture/audio questions plus three independent-level budgeting/customer/time questions. One question at a time, actual choices, dates, levels, hints, retries and safe feedback are saved. Wrong answers do not prevent retry. |
| Reports | Individual name, date, lesson/status, difficulty, measured active time, completed steps, actual skills practiced, response history and requested assistance. Completion snapshots are append-only in the existing learning history. Opening the lesson invents no activity, skills or elapsed time. |
| Time measurement | Focused, visible, unpaused practice only, with a 60-second input idle limit. Kitchen and lesson shopping are included. Reload never reconstructs elapsed time. Pure clock tests cover idle/background/paused gaps; reports distinguish this from attendance and service minutes. |
| Teacher tools | Existing protected dashboard supports assignment links and individually confirmed real-world observations through the existing endpoint. DOM/service fixtures verify authorization and evidence separation; no real learner observation was written. |
| Profiles and resume | Uses the existing profile learning-store identity. Guest practice stays in session storage. Profiles remain isolated; writes after an identity change fail. Current checkpoints and earlier reports remain separate. |
| Accessibility | Large equivalent station/object controls, single-sub-action beginner view, read-aloud/hints, keyboard navigation, touch walking pad, reduced motion, projector text, pause/resume and a disclosed WebGL-unavailable fallback. |

Local verification: **81 tests passed** across Home Economics, Candy Counter, existing school activities and Prism Pour, plus **241 existing bank/business/workday/classroom assertions** (59 + 97 + 85). The static audit checks **208 HTML pages with zero missing local references**. The release audit checks 397 source files / 2,339 references with no script syntax failures or missing references.

## Rendered browser evidence

The browser workflow runs this branch in isolated GitHub Actions Chromium with production service endpoints blocked and disposable Guest data. It verifies actual WebGL rendering, avatar displacement, photographic materials/reflections/plants, original-school entry, the existing store, saved return, measuring and microwave safety, 390/768/1366px layouts, projector text, and uncaught errors. The extended journey exercises the full preparation/recipe/cleanup/reflection path, question retries/hints, measured practice time, PDF print layout and reload.

The November 2 art-review run [41475368237](https://github.com/halliburtonkayla/OC-Transition-Team/actions/runs/41475368237) successfully rendered the revised room, walking, laundry and counter. That run's separate journey failed its initial five-second return-heading assertion; it is not presented as a passed full journey. The return works in the manual accessible preview. The new browser journey waits explicitly for the resumed measuring step with a bounded WebGL initialization deadline and captures failure state/screenshots if a problem remains. Current final-run results are recorded in the PR.

The manually operated cloud preview has WebGL disabled. Its school entrance, existing-store checkout/receipt/return, supported controls, work-skills responses, hints and populated report were inspected directly. This fallback run is not claimed as proof of rendered 3D.

All automated rendered images use a software GPU (ANGLE SwiftShader). They demonstrate real rendering and controls; they do not certify physical device frame rate or Safari behavior. The actual scene captures are linked from the PR and the workflow artifacts.

## Review before publishing

1. Compare the actual 3D room, appliances, counter and laundry views with the approved glossy artwork. The room uses the reference's composition, warm materials, reflective floor, kitchen islands, cabinetry, appliances and pink/blue controls; owner acceptance of the final visual design is pending.
2. Trial the complete loop on an actual school laptop, iPad and phone. Check touch feel, keyboard/screen-reader use, audio, long-session graphics stability and native printing. Automated viewport checks are not physical-device certification.
3. On an approved classroom device, verify teacher sign-in, connected practice records and one individually confirmed observation. Existing authorization is preserved; production learner writes were deliberately excluded from QA.
4. Approve merge and publishing after review. No main update, deployment, auto-merge, bank change, database migration or backend release has been performed.

Only the individual Rice Krispie recipe is fully playable. Future recipe names are explicitly labeled. Local lesson checkpoints remain on the same device/origin, consistent with existing activities; approved connected classroom reporting continues through the existing monitor/group-session workflow. These implementation limits are disclosed rather than replaced with invented progress or an additional student database.
