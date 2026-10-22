# The Main Attraction Beauty Studio

Open `main-attraction.html` → **Play Beauty Studio**, or `main-attraction-studio.html`.

## Play a shift

Choose your town profile, then open the salon. **Choose a work role → enter your four-digit employee PIN → Clock In** starts one wall-clock timer at the first worker’s clock-in: 600 real seconds represents 08:00–16:00. Time continues through customer services, supplies, room care, background tabs and reconnections. A completed or early-ended shift produces actual business results and separate worker summaries. Unfinished clients are not charged. Teammates clock in to the same running shift without restarting it. Clock Out records each worker’s time; the shift ends early if everyone clocks out.

For shared play, open **Play together / switch mode**, enter the existing classroom town code, and use salon session **classroom** on every device. This is the same workspace used by the existing salon supply room and business account. Custom session names intentionally have separate practice accounts. Solo practice shares the existing `ttShopWork_v1:main-attraction:<town profile>` state on that device.

Invite an unclaimed client to your chair. Read the request. Select a tool and work directly on every highlighted illustration area; keyboard users can focus an area and press Enter or Space. Each service step must be checked before the next unlocks. Clients arrive approximately every 40 real seconds, subject to waiting-room capacity. The clock does not reset per customer.

Services: French-tip full set, acrylic full set, fill-in, manicure and art, pedicure, lashes, shampoo/style, trim, braids and fictional color/style. Nails have color, length, shape and design choices. Draw white French tips, dots or stripes on all five nails using touch/mouse/trackpad. Undo and clear are available. Tap-to-design mode provides a motor-access alternative; keyboard activation also places the requested design. Validation checks simple placement, not artistic quality.

A service mistake records customer feedback and a retry; the student can still correct the work and finish the sequence. As requested, that attempt receives no service payment or tip. A fully correct service earns its agreed price and a 20% classroom tip. Cash checkout checks invoice, amount received and change; card checkout checks invoice. A failed cash calculation can be corrected before the payment posts. Posted payments and retries are idempotent. These are classroom customer scenarios, not real salon policies.

The existing original salon illustrations and storefront remain. The foreground hand, foot, face, tools and hair are interactive SVG graphics. The game is virtual workplace practice, not a real chemical, adhesive or cosmetology procedure. No real chemical ratios or processing instructions are supplied.

## One salon account

The new game, original shared service desk, and existing supply/bank pages now use the same `tt_shop_workspaces` row (`student-shop-work-v1:<workspace>`, `main-attraction`). The old service endpoint is a compatibility adapter. Existing shared service rows, if present, import once under their legacy keys; they are not deleted. Solo legacy service data imports once into the existing profile-specific business state.

Service payments increase cash and service revenue. Supply orders decrease the same checking balance and add deliveries. Count and receive deliveries before use. Consumed materials reduce inventory and become cost of goods used; buying unused inventory lowers cash but is not yet a profit expense. Fictional daily operating bills are accrued at opening and paid separately. Tips are liabilities held for workers, not inflated business profit. Tip payouts and owner withdrawals reduce cash without reducing operating profit. Existing personal town balances are preserved.

Practice menu prices and supply assumptions are labeled and menu prices are editable. The initial salon account comes from the existing classroom business configuration, not a new grant of personal money.

## Room care and records

Waiting lounge and restroom checks become due during the shift. Lobby, restroom and supply-room routines are ordered work tasks. Supplies and restroom refills are consumed. The restroom task currently uses the original support/laundry room illustration rather than inventing an exterior or implying that artwork is a new bathroom rendering.

Printable results show revenue, material costs, supply purchases, operating costs, tips, profit, complaints, unfinished clients, and each worker's actual saved tasks. Application activity hooks feed the private classroom monitor. Automated arrivals are not credited as independent student accomplishments.

## Active-work payday and new visits

A named, teacher-connected student earns $200 in personal classroom dollars per **25 active work minutes**, carrying partial time across visits and devices. The private server accumulates capped heartbeat intervals only with recent work actions on supported job/business pages. Hidden or unfocused tabs, Town browsing, idle intervals, and automatic simulation ticks do not qualify. Offline work is not awarded unverifiable credit. Browser-reported activity is not tamper-proof assessment.

The server records cumulative pay once. Each device projects only unapplied earnings into that profile's existing local Town checking balance. This does not turn all legacy personal banking transactions into cloud-synchronized accounts. A large dollar-sign notice and synthesized ka-ching announce each unpaid notification; missed notifications remain available at next connected login. Browser audio restrictions can require tapping the sound button. Notifications are acknowledged separately from deposits, so dismiss/retry does not pay twice. The old automatic $500 reward for every two session-end clicks is removed.

A new direct visit asks students to choose their name; internal Town navigation retains that visit. Browser-back restoration also asks for a fresh login. Students need no teacher passcode, email or pairing code. The teacher connects a named device once by school and name. Device recognition lasts up to 30 days and can be revoked. Pausing/ending a student session remains available. The teacher's passcode session is separate and lasts one hour.

## Reports

Report Center includes **Delete report**, **Deleted reports**, and **Restore report**. Deletion is reversible until the normal record-retention cutoff; it does not remove game progress or another student's history. Removed reports are excluded from normal lists and new print/export selections.

## Verification

`tests/main-attraction-studio.cjs` exercises all ten services, correct/incorrect results, financial links, deliveries, full timer expiry, report ownership, legacy register receipts, no overdraft, and repeat-safe payouts. Existing shop and classroom-monitor checks remain required. Native isolated server checks cover shared endpoint compatibility and atomic stored state; no real students receive test wages or purchases. Physical school Chromebooks/iPhones and sound playback still need classroom verification.

The pink-and-gold Employee Time Clock is the first panel in Beauty Studio. The practice employee PIN card reuses the profile’s existing grocery PIN when available; it grants no teacher access. The keypad supports touch and keyboard input. The same PIN clocks the employee out.

Applicant pages separate waiting, hired, held and declined candidates. Student devices must be connected by Miss Kayla (school + Connect student) to read saved classroom hiring. Individual question progress restores from that student’s recorded interview actions within the configured retention period; other students’ actions remain separate. Shared decision cards show team questions heard without exposing private notes. Unrecorded work on another device cannot be reconstructed.

## Beauty game presentation — October 22

The main service area now uses a focused close-up layout, a tactile tool tray, polish-bottle swatches and a moving tool cursor. Drag a tool from the tray onto a target, or select it first. Nail polish uses clipped brush strokes rather than filling a nail on a single ordinary tap. Tap assist and keyboard controls remain available. Full hand / Nail 1–5 detail controls enlarge the drawing area. French-tip, dots and stripe art still goes through the existing service validation, complaints, payment and tip rules. Arrival updates refresh the lounge without replacing the active drawing surface.

The original salon setting, four-digit employee clock and shared business state are reused. The only new bitmap is `assets/main-attraction/manicure-hand-v2.webp` (approximately 89 KB). It is original artwork made with the built-in image-generation tool and compressed to WebP for the game. The interactive nails, painting, tools and visual effects remain SVG/JavaScript. The hand is an illustrated sprite, not a 3D physics model. The tool and close-up layout also apply to the existing lashes, hair and pedicure services; their existing illustrations remain code-drawn.

Artwork prompt: Transform the project’s hand-position guide into an original polished 3D cartoon manicure-game hand sprite: warm medium-brown skin, natural knuckles, soft dimensional highlights, short nude nails and a gold bracelet. Match the guide’s framing and five nail-bed locations so live nail overlays align. Use a genuine transparent background. Include only one five-finger hand and bracelet; no UI, text, extra objects or borrowed game art.

Validation: existing 49 service/finance/shift tests and the real keypad DOM flow pass. In an isolated browser practice fixture, all five brush-painted nails passed the next-step check; a freehand French tip in detail view plus the optional tap controls for the remaining tips passed art validation; top coat, client review, station reset and a $45 card checkout produced $9 tip and $54 business cash increase. No real student records or balances were used.
