"use strict";

// OCR a directory of extracted frames and print a compact one-line signature per frame,
// so we can locate the "Improved Copy body" frame by content without seeing images.
// Usage: node scripts/ocrdir.js /tmp/opencode/improved-cand

const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");

(async () => {
  const dir = process.argv[2];
  if (!dir || !fs.existsSync(dir)) {
    console.error("usage: node ocrdir.js <dir>");
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter((f) => /\.png$/.test(f)).sort();
  const worker = await createWorker("eng", 1, { logger: () => {} });
  for (const f of files) {
    const { data } = await worker.recognize(path.join(dir, f));
    const lines = data.text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const sig = lines.slice(0, 8).join(" / ").slice(0, 220);
    console.log(`${f}\t${sig}`);
  }
  await worker.terminate();
})();