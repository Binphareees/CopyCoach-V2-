"use strict";

// Form-field capture: centered, real views of the filled generator form fields
// (product details / audience+CTA). No AI generation — zero credits used.

const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const EXEC = "/home/binpharees/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const BASE = "http://localhost:3000";
const OUT = path.resolve(__dirname, "../assets/screenshots");

const EMAIL = "capture-ad@copycoach.test";
const PASS = "AdCapture!2026";

fs.mkdirSync(OUT, { recursive: true });

const centerOn = (id) => `
  (() => {
    const el = document.getElementById(${JSON.stringify(id)});
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
  });
  const page = await context.newPage();

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log("SHOT", name);
  };
  const settle = async (ms = 900) => {
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
    await settle(300);

    // category + pasted copy (already decent in 13, recapture with Ad Campaign emphasized)
    await page.evaluate(centerOn, "generate");
    await settle(900);
    await shot("13b-category-copy");

    // product fields centered
    await page.evaluate(centerOn, "product-name");
    await settle(900);
    await shot("16b-product-form");

    // audience + CTA centered
    await page.evaluate(centerOn, "target-audience");
    await settle(900);
    await shot("16c-audience-cta");

    // tone chips + language centered
    await page.evaluate(centerOn, "cta");
    await page.evaluate(() => window.scrollBy(0, 420));
    await settle(900);
    await shot("16d-tone-language");

    console.log("CAPTURE4 DONE");
  } catch (err) {
    console.error("CAPTURE4 ERROR:", err);
  } finally {
    await context.close();
    await browser.close();
  }
})();