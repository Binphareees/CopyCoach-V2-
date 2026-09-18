"use strict";

// Final targeted capture:
//  - clean "Improved Copy" section view (heading, actions, full body)
//  - Projects list with real project + the project detail page
// Regenerates once (fresh review) so the Improved Copy panel is on screen.

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

const centerOutput = `
  (() => {
    const el = [...document.querySelectorAll("div")].find(
      (d) => d.className && typeof d.className === "string" && d.className.includes("md:col-span-5")
    );
    if (el) el.scrollIntoView({ block: "start" });
    return !!el;
  })()
`;

const scrollToText = (txt) => `
  (() => {
    const h = [...document.querySelectorAll("h2,h3,h4,p,span")].find(
      (n) => (n.textContent || "").trim() === ${JSON.stringify(txt)}
    );
    if (h) h.scrollIntoView({ block: "start" });
    return !!h;
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

  const shot = async (name) => {
    try {
      await page.screenshot({ path: path.join(OUT, `${name}.png`) });
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

    await page.getByRole("button", { name: "Ad Campaign" }).click();
    await page.fill("#product-name", "Peakflow");
    await page.fill(
      "#product-description",
      "Our new productivity app helps you get more done every day. Download now and become more productive."
    );
    await page.fill("#target-audience", "Busy professionals who want to reclaim their time");
    await page.fill("#cta", "Download Peakflow today and get more done.");
    await page.getByRole("button", { name: /Persuasive & High-Converting/ }).click();
    await settle(300);

    await page.evaluate(centerOutput);
    await settle(700);

    await page.getByRole("button", { name: "Improve your copy" }).click();
    await page.waitForTimeout(900);
    await shot("22-processing-fast");

    try {
      await page.getByText("CopyCoach Review", { exact: true }).first().waitFor({ timeout: 150000 });
    } catch (e) {
      console.log("RESULT: timeout");
    }
    await settle(1500);

    // 1) Improved Copy section, framed cleanly
    await page.evaluate(scrollToText("Improved Copy"));
    await settle(1200);
    await shot("31b-improved-copy");
    await page.evaluate(() => window.scrollBy(0, 620));
    await settle(800);
    await shot("31c-improved-copy-body");

    // 2) Writing Quality section
    await page.evaluate(scrollToText("Writing Quality"));
    await settle(900);
    await shot("33b-writing-quality");

    // 3) Projects list with the real project
    await page.evaluate(() => document.getElementById("dashboard-projects")?.scrollIntoView({ block: "start" }));
    await settle(1000);
    await shot("53b-projects-with-project");

    // 4) Open project detail page
    const openProject = page.getByRole("button", { name: /Open project/i }).first();
    if (await openProject.count()) {
      await openProject.click();
      await page.waitForURL(/\/dashboard\/projects\//, { timeout: 60000 }).catch(() => {});
      await settle(2500);
      await shot("54-project-detail");
      await page.evaluate(() => window.scrollBy(0, 640));
      await settle(900);
      await shot("55-project-detail-lower");
    }

    console.log("CAPTURE3 DONE");
  } catch (err) {
    console.error("CAPTURE3 ERROR:", err);
    try {
      await shot("99d-error-state");
    } catch (e) {
      /* ignore */
    }
  } finally {
    await context.close();
    await browser.close();
  }
})();