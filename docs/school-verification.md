# School update: implementation and verification

This additive update introduces a six-room school directory, Job Missions and Watch & Learn. The original hallway remains available through `transition-town.html?school=legacy`. Existing games, student avatars, businesses and Town storage are retained. No database migration or authentication replacement is included.

## Implemented

- Six room entrances with optional spoken labels, Home, Back to School, a searchable catalogue and eight-item pagination.
- A static inventory of all 198 existing user-facing HTML pages, including current local and external links, categories and unresolved references. See `school-audit.md` and `school-inventory.json`.
- Six playable Job Missions with four levels each, three support settings, picture choices, keyboard/touch-friendly buttons, optional drag placement, unlimited retries, hints, replay, points and separate optional rewards.
- Five playable rewards: memory matching, patterned Sock Match, sorting, picture puzzle and a star reveal. Every completed level creates a fresh reward offer.
- Teacher mission assignments by anonymous code, task accuracy, completed levels, observed prompting/independence/accuracy, one-page school mission cards and completion certificates.
- Six original timed narrated animated lessons. Each has twelve 30-second teaching scenes, 698–724 spoken-script words, eight synchronized worksheet blanks, a two-page picture worksheet, a timestamped answer key, a six-question review, a 30-minute lesson plan and a complete script.
- A resource-library tab within the existing authenticated teacher dashboard, with 48 resources filtered by skill, reading support and activity type. Public teaching materials contain no confidential student information.
- Letter-size black-and-white PDFs: six seven-page lesson packets and six one-page school mission cards.

## Automated checks

108 selected Node tests pass, including 72 mission/level/support combinations. Checks exercise wrong choices, retries, exact quantities, completion locks, first-try accuracy, all five reward types, fresh reward state, lesson end/replay/seek, speech-completion boundaries, teacher answer pauses, worksheet order, spoken answers, keys, review progression, room destinations and resource filtering.

Existing checks also pass for Laundry & Weather (eight regressions), Career Lab (1,537 assertions), connected game-show logic, teacher evidence and access rules (85 assertions), student businesses (59 assertions), Transition Life, driving, basketball, football and softball. No legacy browser-test suite was run through standalone Playwright; browser QA uses the managed browser.

The unrelated 3D kitchen geometry check could not run in this partial source checkout because its original 2.5 MB `scene.bin` was not downloaded. That binary, the kitchen code and the rest of the original repository tree are preserved unchanged in publication.

## Browser checks performed

- All six room entrances, primary links, Home and Back to School.
- Complete catalogue loading and a Laundry search; removed duplicate primary activity cards.
- Grocery sorting with an incorrect answer, successful retry, keyboard Enter, completion and points.
- Sock Match completion and progression to Level 2; verified PLAY REWARD is offered again after Level 2.
- Supply order correction by removing a wrong packed item and adding the requested item.
- Anonymous teacher assignment; separate prompting, independence and observed-accuracy recording.
- All six Lesson 1 review questions, a wrong answer, retry, correct-response celebrations and the real-world practice handoff.
- Classroom presentation layout, optional captions, scene controls and reduced-motion controls.
- Responsive measurements at 320, 768 and 1366 CSS pixels for the directory, mission hub, lesson player and video library: no horizontal overflow or undersized measured controls. This is browser layout verification, not a physical Chromebook/tablet certification.
- Teacher-resource route displays the existing teacher sign-in wall without an authenticated session. Authenticated resource rendering/filtering is covered in an isolated component test; no real teacher credentials were used in QA.
- PDFs rendered and inspected; corrected an observation/reflection overlap before delivery. All pages use US Letter dimensions; mission cards each occupy one page.

## Audio and fullscreen limits

Device narration is implemented with optional, nonoverlapping Web Speech audio. The managed test browser reports that its speech engine is unavailable. Scripts, pictures, captions, controls and transcripts continue to work, but intelligible spoken playback could not be verified here.

Recorded HeyGen narration was attempted once for Lesson 1 using a public catalog voice and Starfish. The service rejected the request: `This workspace requires Orca for public voices. Select Orca or choose another voice.` No audio file was produced. The narrator skill requires approval before another generation attempt. No additional engine, retry or paid generation was used. Recorded narration remains unfinished; it must not be described as delivered or tested.

The projector layout works. The managed browser denied the Fullscreen API request; the layout remains usable and explains the browser fullscreen fallback. Native fullscreen still needs verification on the classroom device.

## Privacy and preservation

Job Missions does not read or write existing Town identities, business balances, avatars or educational records. Its default storage is session-only under its own `tt-job-missions-v1` key; optional device saving is explicit and may be erased independently. Use anonymous codes and keep any code-to-name key in the school’s approved private system. No new student names or disability information are seeded in client code.

Four missing document links remain only in archived index snapshots. They are documented in the audit. Active legacy `#demo` destinations now lead to appropriate existing activities; no original activity file is deleted.

## Source and maintenance notes

- Original teaching scripts and illustration code are in `assets/watch-learn/` and `assets/job-missions/`.
- Generate PDF data with `node tools/school/export-print-data.mjs`, then use `tools/school/print-packets.py` with ReportLab, svglib and the DejaVu font installed.
- Regenerate the inventory with `node tools/school/audit.mjs`. The saved repository manifest supplies names of original binary assets unavailable in a partial checkout.
- Web Speech reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Fullscreen reference: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
- Handwashing fact check: https://www.cdc.gov/clean-hands/about/index.html . The personal-care lesson uses the general wet/soap/scrub/rinse/dry routine and at least 20 seconds of scrubbing. It uses original wording and does not embed or rehost third-party videos.
