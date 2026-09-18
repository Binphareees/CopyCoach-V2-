"use strict";

// QC helper: OCR a still and print the detected text so we can verify
// the real UI content landed on screen without image support.
// Usage: node scripts/ocr.js 10-dashboard-top

const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");

(async () => {
  const name = process.argv[2];
  if (!name) {
    console.error("usage: node ocr.js <shot-name> [shot-name...]");
    process.exit(1);
  }
  const files = process.argv.slice(2);
  const OUT = path.resolve(__dirname, "../assets/screenshots");

  const worker = await createWorker("eng", 1, {
    logger: () => {},
  });

  for (const f of files) {
    const fp = path.join(OUT, `${f}.png`);
    if (!fs.existsSync(fp)) {
      console.log("MISSING", f);
      continue;
    }
    const start = Date.now();
    const { data } = await worker.recognize(fp);
    const text = data.text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 14);
    console.log(`\n===== ${f} (${Date.now() - start}ms) =====`);
    console.log(text.join(" | "));
  }

  await worker.terminate();
})();