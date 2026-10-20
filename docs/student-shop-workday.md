# Student shop workday

The existing shop URLs and town map stay in place. Cool Vibes, The Zoo and 3K Tire Shop now link into `shop-floor.html?shop=<shop-id>`. The original storefront artwork is retained. Separate room views use the established Transition Town illustration style.

## Use today: interviews and preparation

1. Open the existing shop. Choose your interviewer name and open Applicants.
2. At The Zoo, standard cards give Max the full interview. Starred short-path cards give Jaden four shorter questions, short answers and optional decision-reason choices. Either owner can use either path. The two paths keep separate transcripts and decisions.
3. Enter the shop and choose **Working as**. Use **Train & prepare** before opening for customers.
4. A **training ticket** practices the real register, kitchen, pet-care or tire-service flow without creating customer-sales revenue. It does use supplies, recorded separately as training costs.
5. Visit the rooms, practice cleaning, count supplies and learn the business bank. Customer arrivals remain off until a practice shift is explicitly started.

## Shared classroom and solo practice

Connect the customer and worker devices using the same existing classroom town code. The teacher may use the existing private teacher code on the teacher device. Do not give the teacher's private code to students. The connection field is masked.

Shared work, stock, business money and employee assignments are saved for the classroom. Solo practice saves separately for the current Transition Town profile on that browser. Existing town profiles, personal balances, applications, interview records, timers and older practice records are not reset.

## The rooms

Cool Vibes has the original exterior; a centered front register; left pastry/menu case; right dining room; baking kitchen; food pantry; separate non-food supply room; and restroom. The bakery uses a recipe, lined-up tools, dry measuring cups, a liquid jug, measuring spoons, ingredients and amounts. Donuts proceed from ingredients and dough through rolling, cutting, frying, draining, decorating and boxing. The recipes and quantities are classroom practice models.

The Zoo has its original exterior, reception, separate pens, care cards, wash area, supplies, restroom and a touch/keyboard dog-walking route to the park and back. Check the pet in before care. Match food labels and portions. Attach the leash, stay on the sidewalk, play, clean up waste and return safely. Extended stays generate repeat water, feeding and cleaning checks.

3K has its original exterior, service desk/register, waiting room, work bay, tire racks, parts room and restroom. The services come from its original branding menu: tires, installation, rotation, balancing, approved tire repair, oil change, brake check and brake replacement. These are virtual, supervised service sequences, not instructions for unsupervised real vehicle repairs. Match the vehicle card, use manufacturer-specific specifications and complete the qualified-supervisor check.

## Run an eight-hour practice shift

Choose **Practice shift** and select 5 or 10 real minutes. Both represent eight simulated hours. Pick a 30- or 60-minute simulated restroom-check interval. Starting the shift enables practice customer arrivals and records fictional daily allocations of rent, electricity, phone, water and insurance.

Customers continue to arrive. Stock is depleted by completed work. Rooms need repeated cleaning and the pantry generates date/condition checks. The class can perform every job themselves or supervise hired fictional employees.

After an interview, select Hire and provide a job-related reason. Use **Hired employees → Load hired applicants**, then assign a station. In shared mode only applicants with a saved Hire decision can be assigned. Employee work habits reflect their interview answers. Errors, skipped routines or stock problems create supervisor check-ins. Coach with a specific instruction, or take over and return the employee to work later. Employee automation is identified separately in the activity data.

## Buy, receive and replenish supplies

Every student business can buy the same supply repeatedly when its checking account can cover the purchase. A purchase reduces checking and creates a receipt and delivery. Count the delivered units and choose the correct storage area before using them. Food and cleaning supplies are kept separately; perishable ingredients go in refrigerated storage. Remove expired/damaged practice stock and rotate older usable stock to the front.

Marketplace prices are retained where available. Pack sizes, added training supplies, selling prices, bill allocations and the $10/hour employee wage are classroom assumptions. The original Cool Vibes and 3K selling-price spaces were blank, so their practice selling prices remain editable.

## Business bank and profit

The existing town bank contains **Student Business Accounts**. The shop also has a **Business bank** tab. All five student businesses have separate checking, savings, receipts, bills, payroll and owner-pay balances.

- Customer payments increase sales and business checking.
- Inventory purchases reduce checking. Unused inventory remains an asset; the amount consumed is recognized as cost.
- Earned employee wages, operating bills, wasted stock and training supplies reduce profit. Paying an already-recorded bill or wage settles it without counting the expense a second time.
- Checking/savings transfers move money between accounts.
- Owner pay transfers money to the named owner's pay subaccount. It is an owner withdrawal, not another operating expense. The shop reserves unpaid bills and wages before allowing an owner withdrawal.

**Profit = sales − ingredients/supplies used − wages earned − operating costs − waste/training costs.** Profit differs from the checking balance. Opening classroom funds are not sales or profit. The Zoo begins with the packet's completed $890 startup cart and $110 remaining; its newer pet-care price begins at $40 per pet.

The bank page includes open instructions, read-aloud support, an example calculation, register reconciliation, bill/payroll controls and a complete transaction ledger. Banking is simulated; no real account or payment details are requested.

## Documentation and data

**Activity data** provides a printable report and CSV export with the business, worker, timestamp, simulated minute, task, response/correction, support requested and whether work was automated. Interview transcripts and decisions retain their existing delivery to Miss Kayla. The existing 30-minute Pre-ETS summary remains available for observed participation, actual support and next-session planning.

Records describe actions; they do not infer independence or mastery. The latest 5,000 detailed events are retained per workspace. Export each workday for a permanent classroom record. Previously saved `tt_biz_*` practice records are preserved separately.

## Validation

`node tests/student-shop-core.cjs` checks preparation-mode gating, correct change, duplicate prevention, inventory deliveries, costs/profit, bank transfers, wages, owner pay, pet care, tire service, timed shifts and employee behavior. Additional DOM interaction checks exercised all five shops, complete baking/measuring, pet check-in/walk controls, service/payment and both interview paths.

Live shared-service checks verified code rejection, preparation defaults, concurrent device purchases, idempotent retries and overdraft prevention. A later outbound-network restriction interrupted the rest of the live play-through. Browser/device visual QA was unavailable in this managed environment; touch movement and responsive layout still need a real-device play-through. No real classroom workspace was used for test purchases.

Tire training sources: [NHTSA TireWise](https://www.nhtsa.gov/vehicle-safety/tires) and [Michelin tire repair criteria](https://www.michelinman.com/auto/auto-tips-and-advice/tire-maintenance/can-my-tire-be-repaired). The practice vehicle's 32 PSI card is fictional and is not a universal pressure recommendation.
