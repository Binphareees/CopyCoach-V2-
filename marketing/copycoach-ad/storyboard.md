# Storyboard — CopyCoach AI promo (1080x1920 / ~76s)

Chapter → still → motion → caption → VO line. Timings after crossfades; durations are
per-scene holds (0.4 s crossfade between every scene).

## 1. Cold open (0:00–0:04.5) — `01-home-hero`
- Move: slow zoom-in on hero ("Master copywriting. With your personal AI coach.")
- Caption: — (none)
- VO: "You know the feeling. A great product. And copy that just… doesn't convert."

## 2. Problem (0:04.1–0:07.6) — `02-home-pricing`
- Move: pan up through the pricing/features section
- Caption: "Great product. Flat copy."
- VO: — (beat)

## 3. Meet CopyCoach (0:07.2–0:10.7) — `04-login` (empty form)
- Move: zoom-in
- Caption: "Meet CopyCoach — your AI copywriting coach."
- VO: "Meet CopyCoach — your personal AI copywriting coach. Not a rewriter. A coach."

## 4. Workspace + credits (0:10.3–0:14.8) — `10-dashboard-top`
- Move: zoom-in on the stat cards ("5 / 5 left today", "Upgrade to Pro")
- Caption: "Free: five credits a day. Pro: a hundred monthly."
- VO: — (pricing beat lands on actual dashboard numbers)

## 5. Paste your copy (0:14.4–0:17.9) — `13b-category-copy`
- Move: pan down the generator form ("01 Choose Copy Type", "02 Your Copy & Context")
- Caption: "Paste your copy. Add your context."
- VO: "Drop in the copy you have. Add your product, your audience, your call to action."

## 6. Audience + CTA (0:17.5–0:21.0) — `16d-tone-language`
- Move: zoom-in on filled fields (Product / Brand Name "Peakflow", Target Audience, CTA)
- Caption: "Your audience and call to action."
- VO: "Choose your format — ads, email, landing pages."

## 7. Tone + language (0:20.6–0:24.1) — `14-tone-language`
- Move: pan up through tone chips and the "Copy Language" section
- Caption: "Your tone. Your language."
- VO: "Pick a tone. Pick a language."

## 8. Generating (0:23.7–0:29.2) — `21-processing-centered-2`
- Move: slow zoom-in on the "CopyCoach is working" staged steps
- Caption: "Improve — and the frameworks get to work."
- VO: "Then hit Improve. Watch CopyCoach work through proven frameworks, step by step."

## 9. Conversion Score (0:28.8–0:34.8) — `30-review-score`
- Move: zoom-in on "CopyCoach Review → Conversion Score 85"
- Caption: "Conversion Score: 85. Conversion ready."
- VO: "You get a real conversion score. A sharper rewrite. And the why behind it — so you learn as you improve."

## 10. Improved Copy (0:34.4–0:40.9) — `31b-improved-copy`
- Move: pan down the rewrite ("copy it, export it, download it")
- Caption: "A sharper rewrite — copy it, export it."
- VO: (continues over)

## 11. Why This Works (0:39.7–0:44.7) — `32-review-why-works`
- Move: zoom-in on strengths/improvements
- Caption: "Why it works — so you learn as you go."
- VO: "Writing quality, scored in seconds. AI pattern risk, flagged. Every result saved to your library."

## 12. Writing Quality (0:44.3–0:48.3) — `33b-writing-quality`
- Move: zoom-in on the score bars + AI Pattern Risk "Low"
- Caption: "Writing quality, scored in seconds."
- VO: (continues)

## 13. Library overview (0:47.9–0:52.4) — `40-library`
- Move: slow pan over the saved-entry library + "Upgrade to Pro"
- Caption: "Saved to your library, automatically."
- VO: "Star the lines that work. Search everything. Reuse what converts."

## 14. Favorite (0:52.0–0:55.5) — `41-library-starred`
- Move: zoom-in on the starred card
- Caption: "Star what works. Reuse it."
- VO: (continues)

## 15. Projects (0:55.1–0:59.6) — `53b-projects-with-project`
- Move: pan up from library to the "Product Launch - Q4" project
- Caption: "Projects — every campaign in one place."
- VO: "Organize it all into projects — every campaign, every client, in one place."

## 16. Project detail (0:59.2–1:02.7) — `54-project-detail`
- Move: zoom-in on project workspace
- Caption: — (let it breathe)
- VO: "The free plan gives you five credits a day. Pro gives you a hundred a month."

## 17. End card (1:02.3–1:10.3) — `assets/generated/endcard.png`
- Static. Wordmark, tagline, "Try CopyCoach AI", real URL.
- Caption: — (on card)
- VO: "More natural. More human. More you. CopyCoach AI. Write better. Understand why. Improve."

## Motion rules (enforced in `build.js`)
- Zoom ≤ 12 %, pan ≤ 18 % of frame — subtle, never jittery (input upscaled 2x before zoompan)
- Only fades (0.4 s) between scenes. No glitch/flash/cut stutter.
- Captions bottom-center with outline + shadow so they never fight the UI.

## Speed notes for VO recording (optional)
Reading `scripts/voiceover.txt` at a natural founder pace should land the last line right as
the end card settles (~1:02). If the recording runs long, the end card hold grows to absorb it
(`MIN_TOTAL` in `build.js`).