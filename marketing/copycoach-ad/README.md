# CopyCoach AI — Promotional Video (9:16)

Production-ready promo spot for CopyCoach AI built entirely from **real app footage** of the
live application. No fabricated UI, no mockups, no stock phone mockups.

## Deliverables

| File | Purpose |
| --- | --- |
| `output/copycoach-ai-ad.mp4` | **Final ad** — 1080x1920, 30 fps, H.264 + silent AAC, 76 s, ~21 MB |
| `output/copycoach-ai-ad-silent.mp4` | Same edit, **without burned captions** (for VO/clean-slate edits) |
| `captions.srt` / `captions.ass` | Captions (SRT for editors, styled ASS for burning) |
| `scripts/voiceover.txt` | Read-in last voiceover script + fact-check |
| `storyboard.md` | Scene-by-scene plan: image, motion, caption, VO |

## Specs

- Portrait **1080x1920** (9:16) — invisible-friendly for Reels/TikTok/Shorts
- 30 fps, H.264 (yuv420p), AAC 48 kHz stereo (silent track placeholder for muxing VO)
- ~76 s: cold open → problem → product tour → review → library → projects → pricing → end card
- Camera: slow **Ken Burns** zooms/pan moves + 0.4 s crossfades, subtle, no flashing
- Captions: bottom-center, Noto Sans, `#FFFFFF` with dark outline + shadow — readable over
  dark UI without covering key content

## How it was made (reproducibility)

1. **Real product, real data.** A sandbox account was created via the app's own signup API
   (`capture-ad@copycoach.test`). Screens/generation are 100% the live app on
   `localhost:3000` (session that created the "Ad Campaign / Peakflow" example).
2. **Capture.** `scripts/capture*.js` drive a real Chromium (Playwright) at a phone viewport
   (540x960 @ 2x device-scale-factor = pixel-perfect 1080x1920), producing genuine interaction
   (typing, category/tone clicks, real AI generation, favorites, project creation) as still
   frames + a WebM recording per run.
3. **Verify.** `scripts/ocr.js` / `scripts/ocrdir.js` OCR every frame so frames were checked
   for correct content and **no private data** without visual inspection.
4. **Assemble.** `scripts/build.js` builds the ffmpeg graph (scaled zoompan per scene →
   xfade chain → ASS caption burn → single encode), then `node scripts/build.js`.

Prereqs: `ffmpeg` (6.x), `playwright-core` (~1.63, devDep here), `tesseract.js` (devDep, OCR QC),
ImageMagick `convert` (end card). The Next.js dev server is expected at `localhost:3000`.

## Captures used (all in `assets/screenshots/`)

`01-home-hero`, `02-home-pricing`, `04-login`, `10-dashboard-top`, `13b-category-copy`,
`16d-tone-language`, `14-tone-language`, `21-processing-centered-2`, `30-review-score`,
`31b-improved-copy`, `32-review-why-works`, `33b-writing-quality`, `40-library`,
`41-library-starred`, `53b-projects-with-project`, `54-project-detail`, `endcard.png` (generated).

Unused stills (`11`, `12`, `13`, `15`, `20-*`, `98/98*`, `60`, …) were either duplicates,
mis-scrolled copies, or in the case of `60-profile-plan-credits` **excluded deliberately**
because it shows the sandbox email address.

## The end card domain

The printed URL is the real production alias **`copy-coach-v2-frontend.vercel.app`**. When a
custom domain (e.g. `copycoach.app`) is attached to the Vercel production deployment, swap it
in `scripts/build.js` (end-card `-annotate` line) and rebuild.

## Fact-check / guardrails honored

- Free = **5 credits/day**, Pro = **100 credits/month** — matches the live dashboard copy.
- Upgrade is a **paid** subscription (Paystack). No "free during testing/trial" claim.
- No "100% human" claim — VO uses "More natural. More human."
- No secrets: no env values, API keys, real user emails, or personal data in the video.