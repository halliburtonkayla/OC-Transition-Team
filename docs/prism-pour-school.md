# Prism Pour in Transition Town School

Prism Pour is served directly from `prism-pour.html`, with its complete game, sixty transition questions, read-aloud, clues, teacher-recorded support, and printable session reports. It has no separate ChatGPT login or external game-host dependency.

Find it on the first shelf of School Directory → The WOW Zone, in the existing school hallway’s Educational Games room, and in the Digital Game & Simulator Zone. The game links back to the original school hallway and WOW Zone. The school artwork is preserved.

Each named Town profile has separate game and report storage on the current device. Its name is filled from the current visit. Guest and teacher practice use tab storage, matching the school’s existing learning records. No standalone-site records are copied across origins. Ending a lesson restores that profile’s prior puzzle progress.

The existing approved-device classroom monitor can record confirmed puzzle completions, transition question results, passed checkpoints and ended sessions. Its approval, pause, end-session and privacy controls are reused. Names and teacher notes in setup/report surfaces are marked private for live-view masking. Complete printable answer records remain in the game on the current device. These practice records do not certify mastery or replace teacher-reviewed observations.

Verification: `node --test tests/prism-pour-*.test.mjs`, the existing classroom monitor regressions, and `node tools/release-audit.mjs`. Browser checks cover navigation from the school directory, local modules and worker, setup, checkpoint progression, report preview and the return to school. A system print dialog is not exposed by the cloud QA browser.
