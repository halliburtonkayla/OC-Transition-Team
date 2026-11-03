# Transition Mission

A platform adventure in the existing school, available from the Wow Zone, Job Missions, the school hallway, and the Game Zone. This change adds no student roster, financial ledger, database schema, or new account system.

Students run and jump between four mission tunnels: assigned career and a transition scenario; a three-field fictional application; a job offer and practice clock-in; and three short job tasks. The white finish flag completes the stage, celebrates with an original synthesized jingle and optional confetti, then moves the animated avatar across the map to the next assigned career. The existing helpdesk image `miss-kayla-info-center.png` is used without redrawing Miss Kayla.

The 30 careers are Cashier, Pizza Maker, Pet Care Assistant, Childcare Assistant, Tire Shop Assistant, Bank Teller, Nurse, Teacher, Grocery Stocker, Café Barista, Restaurant Server, Bakery Assistant, Custodian, Office Assistant, Mail Carrier, Warehouse Associate, Delivery Driver, Construction Helper, Electrician Helper, Plumber Helper, HVAC Helper, Graphic Designer, IT Support Assistant, Library Assistant, Salon Assistant, Florist Assistant, Hotel Assistant, Landscape Assistant, Recreation Assistant, and Small Business Owner. Introductory career descriptions use the [BLS Occupational Outlook Handbook](https://www.bls.gov/ooh/); the fictional tasks are practice, not occupational certification or medical/trade training.

## Movement, identity, and sound

The saved Town avatar colors and hairstyle are read without changing `ttWorld`. Where the existing business avatar artwork is assigned, its original portrait is attached to an articulated running/jumping body. Otherwise the picker has four fictional character backgrounds and male/female appearance choices. The game uses keyboard and held pointer controls, five run speeds, three jump paces, optional jump assistance, readable directions, optional device read-aloud, and reduced extra motion.

Music and reward effects are synthesized locally after a user gesture. Volume, music, effects, and narration can be controlled separately. No external music or paid service is required.

## Progress and evidence

The existing per-profile learning store checkpoints progress, settings, character choice, collected rewards, completed careers, and actual task attempts on this device. Guest practice remains in the browser tab. There is no cross-device cloud save. A changed student identity stops the game and clears the previous report. Approved classroom recording uses the existing monitor and its existing device authorization.

Wrong scored task responses and failed hazards use a life. After three lost lives, the latest checkpoint is restored with three lives; completed careers, completed tasks, coins, and response evidence remain. Incomplete preference/application fields are validation messages rather than scored wrong answers. Game coins never modify Town bank balances.

Pause and report controls offer printing, direct PDF download, and the device share menu when file sharing is supported. The default report includes every career reached, summary counts, supports, retries, and the most recent ten responses. An option includes all response details. Application practice names are omitted. Sharing requires the student to choose the recipient and complete the share action; the game sends no email automatically.

## Verification

`node --test tests/transition-mission.test.mjs` covers every career, gate ordering, money validation, checkpoints, all speed/jump combinations, all 30 assisted routes, identity separation, report escaping, and original audio controls. The dedicated GitHub workflow also runs actual Chromium workflows for every career’s tasks, applications, clock-in, three-life rescue, finish/map/resume, PDF download, identity changes, and desktop/tablet/phone layouts. Fictional browser fixtures are isolated from production data. Existing classroom, Letter Lane, and Prism Pour workflows remain enabled.
