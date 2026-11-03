// Isolated CI only: synthetic learners, fake private service, no production writes.
const { chromium } = require("@playwright/test"),
  { spawn } = require("node:child_process"),
  fs = require("node:fs"),
  assert = require("node:assert/strict");
const out = "arcade-expansion-output";
fs.mkdirSync(out, { recursive: true });
let browser;
const server = spawn(
  "python3",
  ["-m", "http.server", "4173", "--bind", "127.0.0.1"],
  { stdio: "ignore" },
);
const base = "http://127.0.0.1:4173/";
function findPaths(grid, words) {
  const size = Math.sqrt(grid.length),
    dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
  return words.map((word) => {
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        for (const [dr, dc] of dirs) {
          const path = [];
          for (let i = 0; i < word.length; i++) {
            const rr = r + dr * i,
              cc = c + dc * i;
            if (
              rr < 0 ||
              cc < 0 ||
              rr >= size ||
              cc >= size ||
              grid[rr * size + cc] !== word[i]
            )
              break;
            path.push(rr * size + cc);
          }
          if (path.length === word.length) return { word, path, dr, dc };
        }
    throw Error("Missing word " + word);
  });
}
(async () => {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(base + "learning-arcade.html")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({
    headless: true,
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--disable-dev-shm-usage",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    reducedMotion: "reduce",
  });
  await context.route("**/*.supabase.co/**", (r) => r.abort());
  await context.addInitScript(() => {
    window.print = () => {
      window.__printCount = (window.__printCount || 0) + 1;
    };
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "learning-arcade.html");
  assert.equal(await page.locator("[data-launch]").count(), 8);
  await page.locator("[data-launch=wordquest]").click();
  await page.locator("[data-book=careers]").waitFor();
  await page.screenshot({
    path: out + "/word-library.jpg",
    quality: 84,
    type: "jpeg",
  });
  // All 40 topic/difficulty combinations are opened in the real UI.
  for (let level = 1; level <= 4; level++)
    for (const book of [
      "careers",
      "readiness",
      "money",
      "interviews",
      "kitchen",
      "service",
      "tools",
      "living",
      "advocacy",
      "future",
    ]) {
      await page.locator("[data-ui=difficulty]").selectOption(String(level));
      await page.locator("[data-book=" + book + "]").click();
      assert.equal(await page.locator("[data-read-word]").count(), 20);
      assert.equal(
        Number(await page.locator("[data-ui=count]").textContent()),
        0,
      );
      await page.locator("[data-ui=library]").click();
    }
  await page.locator("[data-ui=difficulty]").selectOption("1");
  await page.locator("[data-book=careers]").click();
  const standardFont = await page
    .locator(".letter-glyph")
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await page.locator(".premium-settings summary").click();
  await page.locator("[data-ui=text]").selectOption("1.35");
  assert.ok(
    (await page
      .locator(".letter-glyph")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) >
      standardFont,
  );
  await page.locator("[data-ui=text]").selectOption("1");
  await page.locator(".premium-settings summary").click();
  await page.locator("[data-ui=fullscreen]").click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await page.locator("[data-ui=fullscreen]").click();
  await page.waitForFunction(() => !document.fullscreenElement);
  const grid = await page.locator("[data-cell]").allTextContents(),
    words = await page
      .locator("[data-read-word]")
      .evaluateAll((a) => a.map((b) => b.dataset.readWord)),
    paths = findPaths(grid, words),
    size = Math.sqrt(grid.length);
  async function drag(f) {
    const a = page.locator('[data-cell="' + f.path[0] + '"]'),
      b = page.locator('[data-cell="' + f.path.at(-1) + '"]');
    await a.scrollIntoViewIfNeeded();
    await b.scrollIntoViewIfNeeded();
    const aa = await a.boundingBox(),
      bb = await b.boundingBox();
    await page.mouse.move(aa.x + aa.width / 2, aa.y + aa.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, {
      steps: Math.max(4, f.path.length),
    });
    await page.mouse.up();
  }
  async function keyboard(f) {
    const a = page.locator('[data-cell="' + f.path[0] + '"]');
    await a.press("Enter");
    for (let i = 1; i < f.path.length; i++) {
      const key =
        f.dr === 1
          ? "ArrowDown"
          : f.dr === -1
            ? "ArrowUp"
            : f.dc === 1
              ? "ArrowRight"
              : "ArrowLeft";
      await page.keyboard.press(key);
      if (f.dr && f.dc)
        await page.keyboard.press(f.dc > 0 ? "ArrowRight" : "ArrowLeft");
    }
    await page.keyboard.press("Enter");
  }
  await drag(paths[0]);
  await page.waitForFunction(
    () => document.querySelector("[data-ui=count]").textContent === "1",
  );
  await keyboard(paths[1]);
  assert.equal(await page.locator(".locked-word").count(), 2);
  for (const f of paths.slice(2, 7)) await drag(f);
  await page.locator(".open-book").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: out + "/word-quest-playing.jpg",
    quality: 86,
    type: "jpeg",
  });
  for (const f of paths.slice(7)) await drag(f);
  assert.equal(await page.locator("[data-ui=count]").textContent(), "20");
  assert.equal(await page.locator(".bank-word.is-found").count(), 20);
  assert.equal(await page.locator(".locked-word").count(), 20);
  assert.equal(await page.locator("[data-ui=next]").isVisible(), true);
  await page.locator("[data-ui=vocabulary] summary").click();
  await page.locator("[data-answer]").first().click();
  assert.ok(
    (await page.locator("[data-ui=q-feedback]").textContent()).length > 0,
  );
  await page.locator("[data-ui=print]").click();
  await page.locator("[data-print-kind=pair]").click();
  assert.equal(await page.locator("#print-area td").count(), grid.length * 2);
  assert.deepEqual(
    (
      await page
        .locator("#print-area .word-print-grid")
        .first()
        .locator("td")
        .allTextContents()
    ).map((t) => t[0]),
    grid,
  );
  await page.pdf({
    path: out + "/word-search-student-and-key.pdf",
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await page.locator("[data-ui=next]").click();
  assert.equal(await page.locator("[data-ui=count]").textContent(), "0");
  await page.locator("[data-ui=exit]").click();
  await page.locator("[data-launch=wordquest]").click();
  await page.locator("[data-ui=continue]").click();
  assert.equal(
    (await page.locator(".page-footer").textContent()).includes("PAGE 2"),
    true,
  );
  await page.locator("[data-ui=exit]").click();
  console.log(
    "PASS all 40 Word Quest pages, real mouse and keyboard, all 20 locks, questions, print equality, page turns and guest resume",
  );
  // A synthetic approved learner receives a deterministic challenge; no private
  // production endpoint is ever contacted or used as a fallback.
  const { makeScenario } = await import(
      "../assets/learning-arcade/expansion/dress-core.mjs"
    ),
    { defaultAvatar, defaultOutfit } = await import(
      "../assets/learning-arcade/expansion/dress-data.mjs"
    );
  const seed = 453,
    index = Array.from({ length: 1000 }, (_, i) => i).find((i) => {
      const s = makeScenario(3, i, seed);
      return s.id === "grocerywork" && s.weather === "sunny" && !s.change;
    });
  assert.ok(index !== undefined);
  let stored = [
      {
        id: "fictional-dress-run",
        game: "dresspart",
        options: {
          mode: "preets",
          level: 3,
          record: true,
          questions: false,
          timed: false,
        },
        rounds: [],
        assistance: [],
        notes: "",
        status: "playing",
        activeMs: 0,
        startedAt: new Date().toISOString(),
        endedAt: null,
        checkpointRevision: 0,
        checkpoint: {
          version: 1,
          seed,
          level: 3,
          index,
          stage: "bedroom",
          avatar: defaultAvatar(),
          outfit: defaultOutfit(),
          created: true,
          history: [],
          achievements: [],
          questionIndex: 0,
          preferences: {
            reduced: true,
            low: false,
            text: 1,
            sound: false,
            hints: true,
            simple: true,
          },
        },
      },
    ],
    calls = [];
  await context.unroute("**/*.supabase.co/**");
  await context.route("**/*.supabase.co/**", async (route) => {
    const b = route.request().postDataJSON();
    calls.push(b.action);
    assert.equal(b.token, "fictional-key");
    if (b.action === "arcade_me")
      return route.fulfill({
        json: {
          profile: {
            id: "11111111-1111-4111-8111-111111111112",
            displayName: "Fictional QA",
            schoolLabel: "Synthetic test school",
            learning: { mode: "preets" },
          },
          records: stored,
        },
      });
    if (b.action === "arcade_save") {
      stored = stored
        .filter((r) => r.id !== b.run.id)
        .concat(structuredClone(b.run));
      return route.fulfill({ json: { saved: true } });
    }
    throw Error("Unexpected service action " + b.action);
  });
  await page.locator("#connect-button").click();
  await page.locator("#device-key").fill("fictional-key");
  await page
    .getByRole("button", { name: "Connect this device", exact: true })
    .click();
  await page.locator("[data-launch=dresspart]").click();
  await page
    .locator("[data-ui=canvas][data-rendered=true]")
    .waitFor({ timeout: 60000 });
  assert.equal(
    await page.locator("[data-ui=canvas]").getAttribute("data-renderer"),
    "webgl",
  );
  await page.locator("[data-ui=edit-avatar]").click();
  await page.locator("[data-config=body]").selectOption("2");
  await page.locator("[data-config=hair]").selectOption("4");
  await page.locator("[data-config=glasses]").check();
  await page.locator("[data-ui=canvas]").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: out + "/dress-avatar-creator.jpg",
    quality: 86,
    type: "jpeg",
  });
  await page.locator("[data-avatar-done]").click();
  await page.locator("[data-enter-closet]").click();
  const canvas = page.locator("[data-ui=canvas]");
  const initialImage = await canvas.screenshot();
  await page.locator('[data-color="0"]').click();
  await page.locator("[data-wear=polo]").click();
  await page.waitForFunction(() =>
    document
      .querySelector("[data-ui=canvas]")
      .dataset.garments.includes("polo"),
  );
  assert.ok(
    !(await canvas.getAttribute("data-garments")).split(",").includes("tee"),
  );
  assert.equal(
    await page.evaluate(() => document.activeElement.dataset.wear),
    "polo",
  );
  const changedImage = await canvas.screenshot();
  assert.ok(
    !initialImage.equals(changedImage),
    "actual rendered pixels change when the shirt is replaced",
  );
  await page.locator("[data-view=full]").click();
  await page.screenshot({
    path: out + "/dress-red-polo-front.jpg",
    quality: 86,
    type: "jpeg",
  });
  for (let n = 0; n < 5; n++) await page.locator("[data-ui=right]").click();
  await canvas.screenshot({ path: out + "/dress-red-polo-side.png" });
  for (let n = 0; n < 4; n++) await page.locator("[data-ui=right]").click();
  await canvas.screenshot({ path: out + "/dress-red-polo-back.png" });
  for (let n = 0; n < 9; n++) await page.locator("[data-ui=left]").click();
  await page.locator("[data-slot=feet]").click();
  await page.locator("[data-wear=sandals]").click();
  await page.locator("[data-mirror]").click();
  await page.locator("[data-leave]").click();
  await page.locator("[data-retry]").waitFor({ timeout: 60000 });
  assert.ok(
    (await page.locator(".outfit-checks").textContent()).includes(
      "closed shoes",
    ),
  );
  assert.ok((await page.locator(".outfit-checks .improve").count()) >= 1);
  await page.screenshot({
    path: out + "/dress-supportive-retry.jpg",
    quality: 84,
    type: "jpeg",
  });
  await page.locator("[data-retry]").click();
  await page.locator("[data-slot=feet]").click();
  await page.locator("[data-wear=workshoes]").click();
  await page.locator("[data-mirror]").click();
  await page.locator("[data-leave]").click();
  await page.locator("[data-next-challenge]").waitFor({ timeout: 60000 });
  assert.ok(
    (await page.locator(".result-heading").textContent()).includes("100%"),
  );
  await page.locator("[data-ui=canvas][data-stage=destination]").waitFor();
  await page.screenshot({
    path: out + "/dress-destination-success.jpg",
    quality: 86,
    type: "jpeg",
  });
  await page.locator(".dress-reflection summary").click();
  await page.locator('[data-reflection="0"]').click();
  await page.locator("[data-ui=print]").click();
  await page.locator("[data-print-kind=report]").click();
  assert.ok(
    (await page.locator("#print-area").textContent()).includes("Attempt 2"),
  );
  assert.ok(
    (await page.locator("#print-area").textContent()).includes(
      "Non-slip work shoes",
    ),
  );
  await page.emulateMedia({ media: "print" });
  assert.equal(
    await page
      .locator("#print-area .report-entry")
      .evaluate((el) => getComputedStyle(el).breakInside),
    "auto",
  );
  await page.pdf({
    path: out + "/dress-student-practice-report.pdf",
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.locator("[data-next-challenge]").click();
  assert.notEqual(
    await page.locator("[data-ui=scenario-title]").textContent(),
    "A grocery-store shift",
  );
  await page.locator("[data-ui=save]").click();
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-ui=notice]")
        .textContent.includes("saved") ||
      document.querySelector("[data-ui=notice]").textContent.includes("Saved"),
  );
  assert.equal(stored[0].checkpoint.avatar.body, 2);
  assert.equal(stored[0].checkpoint.avatar.glasses, true);
  assert.equal(stored[0].checkpoint.history.length, 2);
  assert.equal(stored[0].checkpoint.achievements.length, 1);
  assert.ok(calls.every((a) => ["arcade_me", "arcade_save"].includes(a)));
  await page.locator("[data-ui=exit]").click();
  await page.reload();
  await page.locator("#disconnect-button").waitFor();
  await page.locator("[data-launch=dresspart]").click();
  await page
    .locator("[data-ui=canvas][data-rendered=true]")
    .waitFor({ timeout: 60000 });
  assert.equal(
    JSON.parse(
      await page.locator("[data-ui=canvas]").getAttribute("data-config"),
    ).body,
    2,
  );
  assert.ok(
    (
      await page.locator("[data-ui=canvas]").getAttribute("data-garments")
    ).includes("polo"),
  );
  await page.locator(".premium-settings summary").click();
  await page.locator("[data-ui=low]").check();
  await page.locator("[data-ui=canvas]").press("ArrowRight");
  assert.ok(
    (
      await page.locator("[data-ui=canvas]").getAttribute("data-garments")
    ).includes("polo"),
  );
  await page.locator("[data-ui=exit]").click();
  await page.locator("#disconnect-button").click();
  await page.locator("#progress-button").click();
  assert.ok(
    !(await page.locator("#progress-content").textContent()).includes(
      "Fictional QA",
    ),
  );
  await page.locator("[data-close=progress-dialog]").click();
  console.log(
    "PASS actual WebGL avatar, fitting, immediate red-shirt replacement, rotation, mirror, travel, safety retry, destination, reflections, private saving, reload, lower graphics and shared-device isolation",
  );
  // Release desktop graphics before the isolated phone acquires a context.
  await context.close();
  // Real phone touch endpoints and responsive game controls.
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await mobile.route("**/*.supabase.co/**", (r) => r.abort());
  const phone = await mobile.newPage();
  phone.on("pageerror", (e) => errors.push(e.message));
  await phone.bringToFront();
  await phone.goto(base + "learning-arcade.html");
  await phone.waitForFunction(() => document.visibilityState === "visible");
  await phone
    .locator("#arcade-room[data-rendered=true]")
    .waitFor({ timeout: 60000 });
  await phone.locator("[data-launch=wordquest]").tap();
  await phone.locator("[data-book=money]").tap();
  const mg = await phone.locator("[data-cell]").allTextContents(),
    mw = await phone
      .locator("[data-read-word]")
      .evaluateAll((a) => a.map((n) => n.dataset.readWord)),
    mp = findPaths(mg, mw)[0];
  await phone.locator('[data-cell="' + mp.path[0] + '"]').tap();
  await phone.locator('[data-cell="' + mp.path.at(-1) + '"]').tap();
  assert.equal(await phone.locator("[data-ui=count]").textContent(), "1");
  const touchPath = findPaths(mg, mw).find(
    (f) => f.dr === 0 && f.word !== mp.word && f.word.length <= 7,
  );
  assert.ok(touchPath);
  const touchStart = phone.locator('[data-cell="' + touchPath.path[0] + '"]'),
    touchEnd = phone.locator('[data-cell="' + touchPath.path.at(-1) + '"]');
  await touchStart.scrollIntoViewIfNeeded();
  await touchEnd.scrollIntoViewIfNeeded();
  const ta = await touchStart.boundingBox(),
    tb = await touchEnd.boundingBox(),
    touchSession = await mobile.newCDPSession(phone);
  await touchSession.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: ta.x + ta.width / 2, y: ta.y + ta.height / 2, id: 1 }],
  });
  for (let i = 1; i <= touchPath.path.length; i++) {
    const f = i / touchPath.path.length;
    await touchSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: ta.x + ta.width / 2 + (tb.x - ta.x) * f,
          y: ta.y + ta.height / 2 + (tb.y - ta.y) * f,
          id: 1,
        },
      ],
    });
  }
  await touchSession.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await touchSession.detach();
  assert.equal(await phone.locator("[data-ui=count]").textContent(), "2");
  await phone.locator("[data-grid-pan=left]").tap();
  const scrollLeft = await phone
    .locator(".letter-scroll")
    .evaluate((el) => el.scrollLeft);
  await phone.locator("[data-grid-pan=right]").tap();
  assert.ok(
    (await phone.locator(".letter-scroll").evaluate((el) => el.scrollLeft)) >
      scrollLeft,
  );
  assert.equal(await phone.locator("[data-ui=count]").textContent(), "2");

  assert.ok(
    await phone.evaluate(
      () =>
        document.querySelector("#premium-dialog").scrollWidth <= innerWidth + 2,
    ),
  );
  await phone.screenshot({
    path: out + "/word-quest-phone.jpg",
    quality: 80,
    type: "jpeg",
  });
  await phone.locator("[data-ui=exit]").tap();
  await phone.locator("#premium-dialog").waitFor({ state: "hidden" });
  await phone.locator("[data-launch=dresspart]").tap();
  await phone
    .locator("[data-ui=canvas][data-rendered=true]")
    .waitFor({ timeout: 60000 });
  await phone.locator("[data-avatar-done]").tap();
  await phone.locator("[data-enter-closet]").tap();
  await phone.locator("[data-wear=button]").tap();
  assert.ok(
    (
      await phone.locator("[data-ui=canvas]").getAttribute("data-garments")
    ).includes("button"),
  );
  await phone.locator(".dress-stage").scrollIntoViewIfNeeded();
  await phone.screenshot({
    path: out + "/dress-the-part-phone.jpg",
    quality: 82,
    type: "jpeg",
  });
  assert.ok(
    await phone.evaluate(
      () =>
        document.querySelector("#premium-dialog").scrollWidth <= innerWidth + 2,
    ),
  );
  await mobile.close();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    out + "/browser-results.json",
    JSON.stringify(
      {
        status: "passed",
        wordPages: 40,
        wordsPerPage: 20,
        renderer: "WebGL / SwiftShader",
        mobileWidth: 390,
        privateService: "synthetic only",
        errors,
      },
      null,
      2,
    ),
  );
  // Bounded images in the CI log allow connector-only visual review of actual
  // WebGL output when artifact byte transfer is not available.
  for (const name of [
    "word-quest-playing.jpg",
    "dress-red-polo-front.jpg",
    "dress-destination-success.jpg",
  ]) {
    const data = fs.readFileSync(out + "/" + name).toString("base64");
    for (let i = 0; i < data.length; i += 24000)
      console.log(
        "EXPANSION_IMAGE " +
          JSON.stringify({
            name,
            index: i / 24000,
            data: data.slice(i, i + 24000),
          }),
      );
  }
  console.log(
    "PASS phone touch, responsive layouts, printable PDFs and all browser checks",
  );
})()
  .catch(async (e) => {
    console.error(e);
    try {
      const pages = browser?.contexts().flatMap((c) => c.pages()) || [];
      if (pages.length)
        await pages[0].screenshot({
          path: out + "/failure.jpg",
          fullPage: true,
        });
    } catch {}
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server.kill();
  });
