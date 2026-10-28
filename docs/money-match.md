# Money Match — Transition Town School

The existing `money-counting-game.html` now offers coin identification, money-to-amount matching, and counting. Its existing route and Back to School destination are preserved. The Wow Zone featured shelf is renamed for this expanded game, and CDC Student Center gains one game card. No town, avatar, account, banking, business, or server files change.

## Activities

- Know the coin: ten questions about pennies, nickels, dimes, and quarters. Two or three picture choices. Correct answers wait for Next; retries remain available.
- Match the money: two boards. Bills + coins has five groups per board. The first amounts match the classroom reference: $1.26, $0.81, $0.16, $5.80, $0.26. Coins-only has three groups per board. Choose a group then an amount using touch, mouse, or Enter; desktop dragging is also supported. Check my matches locks correct pairs and returns incorrect groups for retry. Clear retains checked correct matches.
- Count the money: ten questions, using the original denominations ($1, $5, $10 and the four coins), or coins only. Totals and distractors use integer cents. Optional per-item value labels provide support.

## Access and support

No timer or automatic next-question delay. Large controls, native buttons and keyboard focus, live feedback, a modal coin-value chart, reduced-motion styling, and device speech synthesis. Speech is optional and depends on the browser's installed voices. Start over and Play again reset the activity. Results stay in this visit; this change does not add durable student assessment records or expand classroom-monitor permissions. The existing monitor script remains referenced.

All seven money pictures are local assets. Coins: 2025 U.S. Mint obverses. Notes: U.S. Currency Education Program front images, including their supplied markings. Exact source URLs are in `assets/money-match/sources.json`. Pictures are enlarged for instruction; they are not a physical size reference.

## Verification

`node --test tests/money-match.test.mjs` — eight tests cover exact photographed totals, randomized choice uniqueness, integer-cent totals, solvable one-to-one matching, retries without duplicate scores, group replacement and locks, incomplete/incorrect checks, and local assets/navigation. The randomized checks cover 100 seeds for coin and counting questions.

Browser checks completed locally: ten coin questions with an intentional retry (9 first-try answers), both five-group matching boards with an intentional wrong placement (9 first-try groups), ten counting questions (10 first-try answers), value-label help, two-choice setup, coins-only matching, modal coin chart, keyboard selection and checking, and a 390px iframe layout without horizontal overflow. Desktop native dragging successfully placed a group into a matching box. Device audio output, an actual school touchscreen, and Safari are not directly verified by these checks.
