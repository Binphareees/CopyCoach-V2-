"use strict";

// Authentic product capture of the LIVE local CopyCoach AI app.
// Playwright drives a real Chromium at a phone-sized viewport (540x960 @ 2x == 1080x1920)
// and records genuine interaction (typing, clicking, scrolling) to a WebM while also
// saving clean per-scene PNG stills for the FFmpeg composition.

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

const settled = new Set();

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

  const scrollTo = async (sel) => {
    await page
      .evaluate((s) => {
        const el = document.querySelector(s);
        if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
      }, sel)
      .catch(() => {});
    await settle(700);
  };

  try {
    // ─────────────────────────  HOME / LANDING  ─────────────────────────
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await settle(2500);
    await shot("01-home-hero");

    await page.evaluate(() => document.getElementById("pricing")?.scrollIntoView({ block: "start" }));
    await settle(900);
    await shot("02-home-pricing");

    await page.evaluate(() => document.getElementById("mobile-app")?.scrollIntoView({ block: "start" }));
    await settle(900);
    await shot("03-home-mobile-app");

    // ─────────────────────────  AUTH  ─────────────────────────
    await page.goto(BASE + "/auth/login", { waitUntil: "domcontentloaded", timeout: 120000 });
    await settle(1800);
    await shot("04-login");

    console.log("LOGIN: filling credentials");
    await page.fill("#signin-email", EMAIL);
    await page.fill("#signin-password", PASS);
    await settle(300);
    await shot("05-login-filled");

    console.log("LOGIN: submitting");
    await Promise.all([
      page.waitForURL("**/dashboard", { timeout: 60000 }).catch(() => console.log("login nav timeout")),
      page.click('button[type="submit"]'),
    ]);
    await settle(4000);

    // ─────────────────────────  DASHBOARD OVERVIEW  ─────────────────────────
    await page.waitForSelector("#product-description", { timeout: 90000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(1200);
    await shot("10-dashboard-top");

    // ─────────────────────────  STUDIO: CATEGORY  ─────────────────────────
    console.log("STUDIO: category = Ad Campaign");
    await page.getByRole("button", { name: "Ad Campaign" }).click();
    await settle(600);
    await shot("11-category-ad");

    // ─────────────────────────  STUDIO: CONTEXT  ─────────────────────────
    console.log("STUDIO: filling product context");
    await page.fill("#product-name", "Peakflow");
    await page.fill(
      "#product-description",
      "Our new productivity app helps you get more done every day. Download now and become more productive."
    );
    await settle(700);
    await shot("12-context-copy");

    await page.evaluate(() => window.scrollBy(0, 340));
    await settle(600);
    await page.fill("#target-audience", "Busy professionals who want to reclaim their time");
    await page.fill("#cta", "Download Peakflow today and get more done.");
    await settle(600);
    await shot("13-context-audience-cta");

    // ─────────────────────────  STUDIO: TONE  ─────────────────────────
    console.log("STUDIO: tone = Persuasive");
    await page.getByRole("button", { name: /Persuasive & High-Converting/ }).click();
    await settle(700);
    await page.evaluate(() => window.scrollBy(0, 420));
    await settle(600);
    await shot("14-tone-language");

    // ─────────────────────────  IMPROVE + LOADING  ─────────────────────────
    console.log("STUDIO: clicking Improve your copy");
    await page.getByRole("button", { name: "Improve your copy" }).click();

    // scroll so the staged-processing panel is centered on screen
    await page
      .evaluate(() => {
        const nodes = [...document.querySelectorAll("span, p")];
        const el = nodes.find((n) => n.textContent && n.textContent.includes("CopyCoach is working"));
        if (el) el.closest("div")?.scrollIntoView({ block: "center" });
      })
      .catch(() => {});
    await settle(800);

    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(950);
      await shot(`20-processing-${i}`);
    }

    // ─────────────────────────  REVIEW / RESULT  ─────────────────────────
    console.log("RESULT: waiting for CopyCoach Review");
    try {
      await page.getByText("CopyCoach Review", { exact: true }).first().waitFor({ timeout: 150000 });
    } catch (e) {
      console.log("RESULT: timeout waiting for review - dumping state");
      await shot("99-result-missing");
    }
    await settle(1800);
    await shot("30-review-score");

    // scroll through result sections (whole page scrolls on mobile)
    const sectionShots = [
      ["31-review-improved", 620],
      ["32-review-why-works", 620],
      ["33-review-writing-quality", 620],
      ["34-review-ai-risk", 620],
      ["35-review-framework", 520],
      ["36-review-feedback", 520],
    ];
    for (const [name, by] of sectionShots) {
      await page.evaluate((d) => window.scrollBy(0, d), by);
      await settle(750);
      await shot(name);
    }

    // ─────────────────────────  LIBRARY  ─────────────────────────
    await scrollTo("#copy-library");
    await settle(900);
    await shot("40-library");

    // favorite the saved entry (real feature)
    console.log("LIBRARY: star first saved entry");
    const fav = page.getByRole("button", { name: "Star" }).first();
    if (await fav.count()) {
      await fav.click();
      await settle(800);
      await shot("41-library-starred");
    }

    // filter to favorites (real search + favorite filter)
    const searchInput = page.getByRole("textbox", { name: /Search/i }).first();
    if (await searchInput.count()) {
      await searchInput.fill("Peakflow");
      await settle(800);
      await shot("42-library-search");
    }

    // ─────────────────────────  PROJECTS  ─────────────────────────
    await scrollTo("#dashboard-projects");
    await shot("50-projects-empty");

    console.log("PROJECTS: create project");
    const createBtn = page.getByRole("button", { name: "Create Project" }).first();
    if (await createBtn.count()) {
      await createBtn.click();
      await settle(900);
      await shot("51-project-modal");

      const modalInput = page.locator(".glass-modal input").first();
      await modalInput.fill("Product Launch - Q4");
      await settle(600);
      await page.getByRole("button", { name: "Create Project" }).last().click();
      await settle(2500);
      await shot("52-projects-with-project");
    }

    // ─────────────────────────  PRO / CREDITS  ─────────────────────────
    // profile page shows the real plan + credits ("Free plan - 5 / day")
    await page.goto(BASE + "/dashboard/profile", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector("text=/Free plan|Pro membership/i", { timeout: 60000 }).catch(() => {});
    await settle(1500);
    await shot("60-profile-plan-credits");

    // ─────────────────────────  WRAP UP  ─────────────────────────
    console.log("DONE - closing browser to flush recording");
  } catch (err) {
    console.error("CAPTURE ERROR:", err);
    try {
      await shot("99-error-state");
    } catch (e) {
      /* ignore */
    }
  } finally {
    await context.close();
    await browser.close();
  }
})();