# Student businesses: Opening Day and special payday

The Town map and Student Shops directory now open `business-workday.html?shop=<business>` for all five businesses. Existing interviews, detailed salon studio, supply ordering, employee management and bank pages remain linked.

## Classroom flow

Complete the four opening routines (safety, waiting area, restroom, supply count). The resulting printable certificate is explicitly a **classroom simulation, not a state license**. Open the shop to begin a 6 AM–6 PM day compressed into ten minutes. Preparation is outside the ten-minute clock. Pause the clock when a group needs extra instructional time.

Choose solo practice to save progress in the existing device/profile wallet, or connect devices with the current classroom Town code to share the work board, task claims, attendance and payments. Devices claim tasks with a renewable two-minute lease. Ordered steps, duplicate requests, double bookings and repeated sales are checked by the same reducer on the server and in solo mode. Connection errors do not silently change a shared shift into a solo shift.

- **3K Tire Shop:** authorized work orders, supervised tire replacement and oil/filter service, matching specifications, tool placement, rotating the wrench, star-pattern fasteners, measurements, final checks, invoices and customer release.
- **Cool Vibes:** customer requests, allergy checks, payments, custom sandwich/coffee preparation, measurements, serving, restocking and cleanup.
- **The Zoo:** owner/pet matching, separate kennels, playful and fearful/growling behavior, water/food, written fictional medication orders with supervisor checks, supervised play, a controllable park walking route, kennel cleaning, boarding payments and authorized collection.
- **Guardian Angel:** five to ten fictional children, daily sign-in/out sheet, authorized adults, allergy cards, breakfast, two snacks, lunch, activities, rest checks, optional daycare park route, repeated headcounts and weekly invoices. The first practice day is Friday so students encounter weekly billing immediately; weekdays follow. Unpaid weekly invoices carry forward and block that child's pickup until settled.
- **The Main Attraction:** receptionist appointments with conflicting slots blocked, nail/pedicure/hair activities, payments, supplies and sanitation of service stations, waiting area and restroom. The existing detailed studio remains available for the full range of hair, nail and lash work.

Cash drawers accept bills and coins. Students build the actual change amount and enter each running total as they count back from the sale total to the cash tendered. Mouse/touch gestures have keyboard alternatives. Cleaning requires covering all marked sections; work steps are measured or performed individually.

A fictional inspector arrives after the first shift and on later shifts. Findings add correction tasks, and unresolved findings block the next shift. Simulated work is never a substitute for licensed instruction, written care plans, qualified vehicle supervision or real medication guidance.

## Reports and live viewing

Each ended shift generates a saved report with elapsed/simulated time, completed and unfinished tasks, worker-selected practice steps, correction attempts, help requests, cash transactions, business sales, attendance and inspection findings. Download CSV, full JSON or print. These are application-reported practice records, not verified independence or teacher observation.

The new page is included in the existing classroom monitor's allowed Town pages. The existing teacher-approved device process and live-view grid remain in effect, with HTTPS snapshot fallback when enabled. The deployed monitoring configuration was checked: recording enabled, 30-day retention and snapshot fallback enabled. Teacher observations and private student reports remain at `classroom-monitor.html`. Mirroring covers the Town page, not other Chromebook tabs or the desktop.

## One-time $2,000 Town payday

Campaign `town-community-payday-2026-10-28` adds $2,000 classroom dollars to each Town profile, including Miss Kayla and Guest, without replacing their existing checking balance. All known profiles on a device receive the campaign credit when an eligible user reaches the map. Each profile sees its own large celebration on entering the map and can send the flying-money animation toward its right-side balance. The campaign marker prevents another deposit on reload, logout/login or repeat navigation. Future paydays need a new campaign ID; this event does not repeat on a timer.

Town checking and campaign receipts use the existing **device-local** `ttWorld` storage. Different browsers/devices have separate personal wallets; clearing browser data removes those local records. Shared business work and reports use the existing classroom service, separately from personal Town balances.

## Verification

- `node tests/business-workday.cjs`: all five complete shifts plus clocks, attendance, payment sequencing, safety steps, claims, inspection corrections and payday idempotence.
- `node tests/business-workday-edge.cjs`: real Edge handler with isolated transport fixtures, including invalid codes, workspace separation, leases, stale steps, duplicate requests and compare-and-swap retry.
- Existing shop, salon studio, classroom monitor and multiview regression suites.
- Browser QA: map login/payday, opening routines, cash drawer, reports/inspection and visual layout in the managed preview. School-network live mirroring still depends on approved devices and the existing teacher session.
