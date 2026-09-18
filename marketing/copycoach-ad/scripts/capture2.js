"use strict";

// Targeted re-capture: correct, centered shots of the Review / Result panel,
// the loading state, and the Projects section (which now contains a real project).
// Overwrites/replaces the mis-scrolled 30-34 frames and adds 53-54.

const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const EXEC = "/home/binpharees/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const BASE = "http://localhost:3000";
const OUT = path.resolve(__dirname, "../assets/screenshots");
const REC = path.resolve(__dirname, "../assets/recordings");

const EMAIL = "capture-ad@copycoach.test";
const PASS = "AdCapture!2026";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(REC, { recursive: true });

const selectOutputPanel = `
  (() => {
    const el = [...document.querySelectorAll("div")].find(
      (d) => d.className && typeof d.className === "string" && d.className.includes("md:col-span-5")
    );
    if (el) el.scrollIntoView({ block: "center" });
    return !!el;
  })()
`;

(async () => {
  const browser = await chromium.launch({
    executablePath: EXEC,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "en-US",
    recordVideo: { dir: REC, size: { width: 1080, height: 1920 } },
  });

  const page = await context.newPage();

  const shot = async (name, opts = {}) => {
    try {
      await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
      console.log("SHOT", name);
    } catch (e) {
      console.log("SHOT_FAIL", name, e.message);
    }
  };

  const settle = async (ms = 1000) => {
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(ms);
  };

  try {
    await page.goto(BASE + "/auth/login", { waitUntil: "domcontentloaded", timeout: 120000 });
    await settle(1500);
    await page.fill("#signin-email", EMAIL);
    await page.fill("#signin-password", PASS);
    await Promise.all([
      page.waitForURL("**/dashboard", { timeout: 60000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForSelector("#product-description", { timeout: 90000 });
    await settle(2500);

    // fill the form
    await page.getByRole("button", { name: "Ad Campaign" }).click();
    await page.fill("#product-name", "Peakflow");
    await page.fill(
      "#product-description",
      "Our new productivity app helps you get more done every day. Download now and become more productive."
    );
    await page.fill("#target-audience", "Busy professionals who want to reclaim their time");
    await page.fill("#cta", "Download Peakflow today and get more done.");
    await page.getByRole("button", { name: /Persuasive & High-Converting/ }).click();
    await settle(400);

    // center the output panel so loading + result are filmed correctly
    await page.evaluate(selectOutputPanel);
    await settle(900);
    await shot("15-output-empty");

    console.log("STUDIO: clicking Improve your copy (output panel centered)");
    await page.getByRole("button", { name: "Improve your copy" }).click();
    await settle(500);

    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(750);
      await shot(`21-processing-centered-${i}`);
    }

    console.log("RESULT: waiting for CopyCoach Review");
    try {
      await page.getByText("CopyCoach Review", { exact: true }).first().waitFor({ timeout: 150000 });
    } catch (e) {
      console.log("RESULT: timeout");
      await shot("99b-result-missing");
    }
    await settle(1600);
    await shot("30-review-score");
    await shot("30b-review-score-alt");

    const steps = [
      ["31-review-improved", 700],
      ["32-review-why-works", 700],
      ["33-review-quality", 700],
      ["34-review-risk", 650],
      ["35-review-feedback", 650],
    ];
    for (const [name, by] of steps) {
      await page.evaluate((d) => window.scrollBy(0, d), by);
      await settle(800);
      await shot(name);
    }

    // Projects section now contains "Product Launch - Q4"
    await page.evaluate(() => {
      const el = document.getElementById("dashboard-projects");
      if (el) el.scrollIntoView({ block: "start" });
    });
    await settle(900);
    await shot("53-projects-with-project");

    // open the project detail page
    const openProject = page.getByRole("button", { name: /Open Project/ }).first();
    if (await openProject.count()) {
      await openProject.click();
      await page.waitForURL(/\/dashboard\/projects\//, { timeout: 60000 }).catch(() => {});
      await settle(2500);
      await shot("54-project-detail");
    }

    console.log("CAPTURE2 DONE");
  } catch (err) {
    console.error("CAPTURE2 ERROR:", err);
    try {
      await shot("99c-error-state");
    } catch (e) {
      /* ignore */
    }
  } finally {
    await context.close();
    await browser.close();
  }
})();