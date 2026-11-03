// Run by GitHub Actions. All private services are blocked; the teacher fixture
// contains only fictional records. No production student data is touched.
const { chromium } = require("@playwright/test"),
  { spawn } = require("node:child_process"),
  fs = require("node:fs"),
  assert = require("node:assert/strict");
const output = "arcade-test-output";
fs.mkdirSync(output, { recursive: true });
const server = spawn(
  "python3",
  ["-m", "http.server", "4173", "--bind", "127.0.0.1"],
  { stdio: "ignore" },
);
let browser;
(async () => {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4173/learning-arcade.html")).ok) break;
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
    viewport: { width: 1366, height: 900 },
    reducedMotion: "reduce",
  });
  await context.route("**/*.supabase.co/**", (r) => r.abort());
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/learning-arcade.html");
  await page.locator("#arcade-room[data-rendered=true]").waitFor();
  assert.equal(
    await page.locator("#arcade-room").getAttribute("data-renderer"),
    "webgl",
  );
  assert.ok(
    Number(await page.locator("#arcade-room").getAttribute("data-objects")) >
      100,
  );
  await page.screenshot({
    path: output + "/classroom-webgl.jpg",
    fullPage: true,
    type: "jpeg",
    quality: 84,
  });
  // A guest-only viewport image in bounded log chunks permits visual PR review through the read-only GitHub connector.
  const roomJpeg = await page.screenshot({
    path: output + "/classroom-webgl-viewport.jpg",
    type: "jpeg",
    quality: 76,
  });
  const encoded = roomJpeg.toString("base64");
  for (let at = 0, index = 0; at < encoded.length; at += 24000, index++)
    console.log(
      "ARCADE_ROOM_JPEG_" + index + ":" + encoded.slice(at, at + 24000),
    );

  await page.getByRole("button", { name: "Walk around", exact: true }).click();
  await page.locator("#arcade-room").focus();
  const before = await page
    .locator("#arcade-room")
    .getAttribute("data-position");
  await page.keyboard.down("w");
  await page.waitForFunction(
    (previous) =>
      document.querySelector("#arcade-room").dataset.position !== previous,
    before,
    { timeout: 20000 },
  );
  await page.keyboard.up("w");
  assert.notEqual(
    await page.locator("#arcade-room").getAttribute("data-position"),
    before,
    "walk changes actual camera position",
  );
  await page.getByRole("button", { name: "Room view", exact: true }).click();
  console.log("PASS WebGL camera walk and room return");
  async function start(
    game,
    { mode = "cdc", level = 1, questions = false } = {},
  ) {
    await page.locator('[data-launch="' + game + '"]').click();
    await page.locator("#setup-mode").selectOption(mode);
    await page.locator("#setup-level").selectOption(String(level));
    if (questions) await page.locator("#setup-questions").check();
    await page.locator("#start-game").click();
    await page.locator("#play-dialog[open]").waitFor();
  }
  async function leave() {
    await page.locator("#leave-game").click();
    await page.locator("#play-dialog").waitFor({ state: "hidden" });
  }
  await start("match");
  assert.ok(await page.locator("#setup-questions").isDisabled());
  for (const item of await page.locator("[data-item]").all()) {
    const id = await item.getAttribute("data-item");
    await item.click();
    await page.locator('[data-target="' + id + '"]').click();
  }
  assert.equal(await page.locator("#next-round").textContent(), "Next round →");
  await page.screenshot({
    path: output + "/match-beginner.jpg",
    type: "jpeg",
    quality: 84,
  });
  await page.locator("#next-round").click();
  assert.ok(
    (await page.locator("#play-level").textContent()).includes("LEVEL 1"),
  );
  await leave();
  await start("match", { mode: "preets", questions: true });
  for (const item of await page.locator("[data-item]").all()) {
    const id = await item.getAttribute("data-item");
    await item.click();
    await page.locator('[data-target="' + id + '"]').click();
  }
  await page.locator("#next-round").click();
  assert.ok(
    (await page.locator("#game-prompt").textContent()).includes(
      "Which picture matches",
    ),
  );
  await page.screenshot({
    path: output + "/learning-question.jpg",
    type: "jpeg",
    quality: 84,
  });
  await leave();
  console.log("PASS matching and question-free/question checkpoints");
  await start("coins");
  await page.locator('[data-drive="right"]').click();
  await page.locator('[data-drive="jump"]').click();
  assert.ok(await page.locator(".road-car.jumping").count());
  await page.screenshot({
    path: output + "/coin-speedway.jpg",
    type: "jpeg",
    quality: 84,
  });
  await leave();
  console.log("PASS coin driving controls");
  await start("phonics");
  await page.locator('#game-actions button[aria-label="A"]').click();
  assert.ok(await page.locator("#next-round").isVisible());
  await page.screenshot({
    path: output + "/phonics.jpg",
    type: "jpeg",
    quality: 84,
  });
  await leave();
  console.log("PASS phonics bubble");
  await start("monsters");
  await page.locator('[data-feed="add"]').click();
  await page.locator('[data-feed="check"]').click();
  assert.ok(await page.locator("#next-round").isVisible());
  await page.screenshot({
    path: output + "/number-monster.jpg",
    type: "jpeg",
    quality: 84,
  });
  await leave();
  console.log("PASS counting monster");
  await start("words", { level: 2 });
  for (const letter of ["C", "A", "T"])
    await page
      .locator('#game-actions button[aria-label="' + letter + '"]')
      .click();
  assert.ok(await page.locator("#next-round").isVisible());
  await page.screenshot({
    path: output + "/word-delivery.jpg",
    type: "jpeg",
    quality: 84,
  });
  await leave();
  console.log("PASS word delivery");
  await start("store");
  await page.locator("[data-scan-next]").click();
  assert.ok(await page.locator("#next-round").isVisible());
  await page.screenshot({
    path: output + "/checkout.jpg",
    type: "jpeg",
    quality: 84,
  });
  await leave();
  await page.locator("#progress-button").click();
  await page.evaluate(() => (window.print = () => {}));
  await page.locator("#print-progress").click();
  assert.ok(
    (await page.locator("#print-area").textContent()).includes(
      "Guest practice",
    ),
  );
  await page.pdf({
    path: output + "/guest-progress-report.pdf",
    format: "Letter",
    printBackground: false,
  });
  const teacher = await context.newPage();
  await teacher.goto(
    "http://127.0.0.1:4173/tests/learning-arcade-teacher-fixture.html",
  );
  await teacher.locator("[data-student]").first().click();
  await teacher
    .getByRole("button", { name: "Class schedule", exact: true })
    .click();
  await teacher.locator("[name=type]").selectOption("tested");
  await teacher
    .getByRole("button", { name: "Review & save schedule", exact: true })
    .click();
  await teacher
    .getByText("No verified 30-minute elective window yet.", { exact: false })
    .waitFor();
  await teacher.locator("[name=type]").selectOption("elective");
  await teacher
    .getByRole("button", { name: "Review & save schedule", exact: true })
    .click();
  await teacher
    .getByRole("button", { name: "Weekly plan", exact: true })
    .click();
  await teacher.locator("[name=date]").fill("2026-11-04");
  await teacher.locator("[name=start]").fill("09:00");
  await teacher
    .locator("[name=objective]")
    .fill("Workplace communication practice");
  await teacher
    .getByRole("button", { name: "Check conflicts & add to plan", exact: true })
    .click();
  await teacher
    .getByRole("button", { name: "Prepare teacher email draft", exact: true })
    .click();
  assert.ok(
    (await teacher.locator("#at-email-body").inputValue()).includes(
      "30 minutes",
    ),
  );
  assert.equal(
    await teacher.getByRole("button", { name: /send email/i }).count(),
    0,
  );
  await teacher.screenshot({
    path: output + "/teacher-schedule-email-fixture.jpg",
    fullPage: true,
    type: "jpeg",
    quality: 84,
  });
  await teacher
    .getByRole("button", {
      name: "Obion County Central High School",
      exact: true,
    })
    .click();
  assert.equal(await teacher.locator("[data-student]").count(), 1);
  assert.ok(
    (await teacher.locator("[data-student]").textContent()).includes(
      "Other School Learner",
    ),
  );
  for (const width of [390, 768]) {
    const phone = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: true,
      isMobile: width === 390,
      reducedMotion: "reduce",
    });
    await phone.route("**/*.supabase.co/**", (r) => r.abort());
    const p = await phone.newPage();
    await p.goto("http://127.0.0.1:4173/learning-arcade.html");
    await p.locator("#arcade-room[data-rendered=true]").waitFor();
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await p.locator("[data-launch=monsters]").tap();
    await p.locator("#start-game").tap();
    await p.locator("[data-feed=add]").tap();
    await p.locator("[data-feed=check]").tap();
    await p.screenshot({
      path: output + "/touch-" + width + ".jpg",
      type: "jpeg",
      quality: 84,
    });
    assert.ok(await p.locator("#next-round").isVisible());
    await phone.close();
  }
  // A blocked WebGL context must retain the same room, walk controls and games.
  const locked = await browser.newContext({
    viewport: { width: 1366, height: 900 },
  });
  await locked.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/i.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await locked.route("**/*.supabase.co/**", (r) => r.abort());
  const fallback = await locked.newPage();
  await fallback.goto("http://127.0.0.1:4173/learning-arcade.html");
  await fallback.locator("#arcade-room[data-rendered=true]").waitFor();
  assert.equal(
    await fallback.locator("#arcade-room").getAttribute("data-renderer"),
    "software",
  );
  await fallback.screenshot({
    path: output + "/classroom-lower-graphics.jpg",
    type: "jpeg",
    quality: 84,
  });
  await locked.close();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    output + "/results.json",
    JSON.stringify(
      {
        passed: true,
        desktop: true,
        touchWidths: [390, 768],
        actualWebGL: true,
        softwareFallback: true,
        teacherFixture: true,
        productionServicesBlocked: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS actual 3D room, movement, six games, question-free play, questions, print PDF, teacher scheduling/email draft, school separation and touch layouts.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server.kill();
  });
