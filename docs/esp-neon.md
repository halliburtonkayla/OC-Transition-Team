# Neon games in ESP

Open School → The Wow Zone → ESP. Magic E Word Search and Glow to 100 run directly from Transition Town. Each game has a return link to the ESP chooser and a link to the other neon game.

Imported from the reviewed private Neon Arcade source commit `4e3931cf2baf2ee197c2796a2a984f9a4c013c10`. Game mechanics, anonymous progress keys and the recorded crowd cheer are retained. The private Site keeps its existing audience.

Magic E includes ten puzzles of twenty words, mouse and keyboard selection, optional eight-direction play, hints and printing. Glow to 100 provides three choices for each missing box, retry after a wrong answer, three support levels, row celebrations and automatic new boards after completion. Smooth screen-edge lighting honors reduced motion. Audio provenance is in `esp-neon/credits.html`.

Progress stays in the same browser. These shared games do not collect student names or automatically submit teacher reports. Existing accounts, balances and student records are unchanged.

Verification: `SCHOOL_JSDOM=/path/to/jsdom node --test tests/esp-neon/*.test.mjs`; the same suites run in Classroom release checks. Validate the school route, both return links, one word selection and a whole number board in a browser before release. Physical classroom boards and iPhone Safari still need a device trial.
