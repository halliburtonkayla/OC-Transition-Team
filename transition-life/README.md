# Transition Life in the existing Transition Town

This is an extension of `halliburtonkayla/OC-Transition-Team`. It uses the same origin, resident selection, `ttWorld`, checking and savings accounts, housing applications, utilities, job application center, Grocery Store, restaurants and Transition Park. There is no new login, starting grant, bank or replacement town.

## Entry points

- Existing town: `transition-town.html` → My Home / Home & Beyond in the directory.
- Playable home: `transition-life.html`.
- Home goods store: `home-beyond.html`.
- Existing Miss Kayla profile → Transition Life / Housing overview.

The original map artwork and all building hitboxes remain intact. The audited artwork has no empty large storefront footprint: Home & Beyond uses an added South Market plot at its open outer edge, inside the existing map viewport, with a clickable illustrated storefront. It does not cover or replace a business. This is an edge extension rather than a replacement of the original map image.

## Existing-system audit and integration

| Existing system | Integration |
| --- | --- |
| `ttWorld.residents[name]`, `ttCurrent` | Same selected resident; new data only in `resident.life`. No duplicate profiles. |
| Checking, savings, history, $10,000 initialization | Existing amounts retained. Purchases and payments debit checking. Savings transfers update both existing balances. A legacy migration previously replaced zero with $10,000; zero is now preserved. The old one-time teacher balance reset is removed. |
| Town Center / Oak Ridge apartment applications | Existing tours, options and application fees retained. Approved applications now lead to reviewed first-month/deposit payment and keys. |
| Housing Office / house and mansion listings | Existing listings retained. `offer.html` saves purchase offers into the same housing application collection. Teacher approval is required before a closing payment. |
| `resident.home` | A previously acquired home is honored without a second move-in charge. Monthly amounts encoded in legacy home strings become future household bills. Unselected homes remain unselected. |
| `resident.utilities` | Same electric/water flags and deposits ($200/$160), monthly $85/$45. Existing City Hall utility links route moved-in residents to household invoices to avoid double billing. |
| Grocery Store | Existing departments, budget game and scan/register UI retained. Its successful checkout adds the actual purchased food/supplies to the same resident. Carts now have a resident-specific key; an old unscoped cart is adopted once. |
| Pizza / Coffee Shop | Existing ordering and work flows retained. Life residents pay for cash practice purchases from checking too. Paid food can restore the shared hunger meter through existing eating actions; food is consumed once. |
| Existing employment application center | Home & Beyond applications appear for interview/review/hiring. Training does not hire or pay the student. Existing teacher hiring creates the employer assignment. Generic session payday is suppressed for this employer, which uses verified work payroll. |
| Transition Park | Same park and recreation controls; active recreation restores Fun. Existing standalone fishing, football and softball pages include a quiet shared-needs adapter, with no changes to their gameplay. |
| Teacher Central Hub | Existing notification adapter receives household alerts and requests. No database or authentication migration. |
| Mobile navigation | Same town return paths plus horizontal Life navigation, 44-pixel touch controls, tap placement, keyboard alternatives to stirring and read-aloud job instructions. |

## Play and simulation rules

1. Apply for an existing property. Miss Kayla reviews it. The student deliberately accepts the agreement and pays from checking. Homes begin empty except permanent fixtures; existing purchased groceries are retained.
2. Keys open the automatic move-in guide. Utility setup uses real simulated account funds. Internet is optional; gas appears only when a housing agreement requires it.
3. Shop illustrated departments, compare basic/mid-range/premium products, scan each cart item and confirm checkout. Guide checks derive from owned inventory. Large items need a scheduled delivery on the next simulation day or later, then an answer at the door before placement.
4. Tap a room or the floor to walk. Tap objects to use them. Place/rearrange delivered furniture in allowed rooms. Mattress, TV and console actions require delivered, placed purchases. Supplies are available from cupboards without placing every small item.
5. Buy groceries at the existing store. Cooking requires the actual ingredients, cookware, water and stove power. Preparation has a stirring interaction. Cooking consumes ingredients; eating consumes food and restores Hunger. Floor rest is less effective than a mattress. Showers and baths require water. Home activities are animated in the illustrated rooms; an owned console has an offline star-catching game.
6. Needs decline only during active Life play: Hunger 0.8, Energy 0.5, Hygiene 0.4, Fun 0.6 points per minute. No offline deprivation. Sleeping for the night advances one simulation day. Real absence does not advance bills.
7. Monthly invoices recur every 30 simulation days. Autopay starts off and must be enabled deliberately. Paying from savings requires a deliberate transfer. Rent progresses through past due, late fee (day 7), warning (14), final notice (21), housing at risk (30), possible eviction (45). Mortgages use delinquency (30), serious delinquency (60) and foreclosure risk (90). Neither path automatically deletes a home.
8. Utilities go past due, final notice (14 days), disconnected (21). Pay outstanding invoices and the $25 simulated reconnection fee to restore service. Rent late fees are $25 and other invoice late fees are $15 after 7 days. These are classroom rules, not legal or real-lender guidance.
9. Each of eight Home & Beyond roles has three hands-on training tasks. A paid shift requires hiring, completed training, at least six verified work tasks and five active real minutes (eight simulated paid hours). Each shift can pay once. Cashier change, product/budget selection, shelf placement/counting, return policy/refund amounts, and shipment/order verification are checked against the task data.
10. Miss Kayla can inspect all residents saved on the device. Safe test mode clones the world into session storage; new Life/store actions affect only that copy. Leaving for older town pages is blocked until exiting test mode. Advance-day and practice-move-in controls operate on the practice copy.

## Data and preservation

`resident.life` contains version, simulated date, four needs, personal inventory/food/meals, orders and delivery status, cart, bills, transaction history, room placements, training and work progress. Existing resident records, businesses, games, applications and other fields are retained. New home/store transactions read the current world and save funds plus inventory together. Active-resident guards prevent a stale page from purchasing for a newly selected resident.

Progress remains in the repository's existing **device-local storage**. The teacher overview is an aggregate of that device's residents. Existing Central Hub alerts can travel across devices when its existing service is available; household inventories themselves are not a new cross-device sync system. Safe test copies never send their alerts. The application remains a classroom simulation with the existing teacher/profile access model, not a new secured multi-user account service.

Furniture delivery currently supports scheduling, warehouse status and receiving at home. Delivery-team work covers manifest checking, packing, destination labels and load preparation; it links to the existing driving simulator. Live routes and cross-device student delivery assignments are future connections, as requested for the later driving integration.

## Code

- `catalog.js`: store merchandise, guide rules, roles and recipes.
- `core.js`: shared household transactions, housing, bills, needs, inventories.
- `storage.js`: adapter to the existing town and isolated teacher test copy.
- `app.js` / `life.css`: visual home/store UI, movement, placement, activities and navigation.
- `work-core.js` / `work.js`: verified training, task gameplay and payroll.
- `town-bridge.js`: additive hooks into existing town navigation and utilities.
- `recreation-bridge.js`: shared Fun and gentle needs updates in the existing standalone park games.
- `assets/`: coordinated store/home scenes and furniture artwork.

No framework, package manager or site rebuild is required. These are same-origin static pages, like the rest of the repository.

## Verification

Run `node tests/transition-life-core.test.cjs` for account preservation, housing gates, personal inventory, delivery/placement, grocery receipt idempotency, cooking, staged bills/disconnections, owner protection, gentle needs, all eight job roles and exactly-once payroll.

With Playwright installed, run `node tests/transition-life-browser.test.cjs`. Optionally set `CHROMIUM_EXECUTABLE_PATH` for a supplied Chromium. Set `LIFE_BROWSER=webkit` for WebKit; `WEBKIT_EXECUTABLE_PATH` can supply a portable WebKit launcher. The suite starts a local server, blocks every external request (including teacher notification services), and uses disposable browser storage. It covers the actual existing apartment application, teacher review, first payment, utilities, store scan checkout, phone furniture placement/reload, existing grocery checkout, cooking/eating, profile isolation, hiring/interview/training/payroll, homeowner offer/closing, restaurant hunger, and the teacher sandbox. It checks both 390×844 and 844×390 layouts, page errors, local missing assets and retained map entries.

`node tests/transition-life-park.test.cjs` checks the original park plus standalone football, fishing and softball after adding the quiet needs adapter. It confirms that gameplay can start, Fun increases only for the selected resident, and bank balances remain unchanged.
