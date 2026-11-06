# ESP Team Bowling 2.0

A standalone, no-login classroom bowling game at `esp-bowling.html`.

## Play

- Choose one shared lane (1–6 teams) or two independent split lanes (exactly two teams).
- Choose 1–12 children **on each team**, 1–3 turns per child, and math, spelling, or mixed questions. Team sizes are equal in this version.
- A correct answer unlocks one roll. Incorrect answers show encouragement and a hint without losing a turn or changing the score. There is no skip or timer.
- Shared mode rotates teams after every roll, then rotates each team's numbered players. Split mode lets teams progress independently at any pace. Everyone gets the selected number of rolls.
- Position the ball with a slider, Left/Center/Right buttons, or a tap on the lane, then press Bowl. One fallen pin is one point. A center shot clears all ten pins. This is forgiving, deterministic classroom scoring, not regulation bowling or a realistic physics simulation. No strike/spare bonuses.
- Finish each team's last result to display the final scores. Replay preserves setup but resets scores. Teacher options keep current scores unless Start is chosen. Opening options during a roll settles that earned roll once.

## Learning content and access

Math uses addition/subtraction with answers from 0–10. Spelling uses eight familiar three-letter words, illustrated clues, and one missing-letter choice. Mixed mode alternates math and spelling for each team. Device speech is an optional convenience, with visible teacher-read fallback, not guaranteed recorded audio.

Native buttons and a range input support keyboard, mouse, touch and pen. Main student targets are at least 52px high (answers and Bowl are 64px or more). At widths below 720px, split lanes stack vertically, so a phone can scroll between the teams without squeezing the question controls. Teams do not need simultaneous input or multitouch hardware. Reduced-motion preference shortens rolls and removes animation.

The Full screen button uses the browser API where supported. Otherwise it enables an expanded layout and gives Safari Add to Home Screen guidance. It does not claim to hide iPhone browser chrome. Actual board, iPhone Safari and pen-device testing is still recommended.

No names, accounts, analytics, student monitoring, storage APIs or network requests are used. Scores live only in memory in this tab and reset on refresh/navigation. Existing Transition Town accounts and ledgers are untouched. All graphics are inline SVG and CSS; there are no external fonts/assets.

## Integration

This branch deliberately does not edit the school hallway, existing games or ESP entry page. The ESP entryway work supplies `extended-school-program.html`.

After those changes are integrated, add a card/link on that entry page:

```html
<a href="esp-bowling.html">Team Bowling 2.0 — Answer, aim and bowl together</a>
```

The game's back link already points to `extended-school-program.html`. Before the entry page is integrated, the release audit reports that one expected missing link. Do not deploy this branch on its own without resolving that dependency. No deployment or merge was performed.

## Tests

```sh
npm install --prefix /tmp/esp-bowling-qa --no-save jsdom@26.1.0
SCHOOL_JSDOM=/tmp/esp-bowling-qa/node_modules/jsdom node --test tests/esp-bowling*.test.mjs
node --check assets/esp-bowling/game.mjs
node --check assets/esp-bowling/core.mjs
node --check assets/esp-bowling/art.mjs
node tools/release-audit.mjs
```

The 12 focused tests cover bounded setup, question validity, wrong/correct answers, duplicate actions, rotation for all size boundaries, split-lane independence, scoring, keyboard-compatible range input, full-game UI completion, replay, interrupted-roll settings, fullscreen fallback, speech fallback and existing storage isolation. The release audit finds no JavaScript syntax errors and only the expected ESP-entry dependency above.
