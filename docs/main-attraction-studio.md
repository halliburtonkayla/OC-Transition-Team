# The Main Attraction Beauty Studio

Open `main-attraction.html` → **Play Beauty Studio**, or `main-attraction-studio.html`.

## Play a shift

Choose your town profile, then open the salon. **Choose a work role → Clock In for Work** starts one wall-clock timer at the first worker’s clock-in: 600 real seconds represents 08:00–16:00. Time continues through customer services, supplies, room care, background tabs and reconnections. A completed or early-ended shift produces actual business results and separate worker summaries. Unfinished clients are not charged. Teammates clock in to the same running shift without restarting it. Clock Out records each worker’s time; the shift ends early if everyone clocks out.

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
