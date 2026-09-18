"use strict";

// Final assembly for the CopyCoach AI ad:
//  1. re-times captions (ASS + SRT) so they land with the voiceover
//  2. muxes the corrected silent master + full audio mix + burned captions
//     -> output/copycoach-ai-ad-final.mp4  (1080x1920 @30, H.264 yuv420p, AAC)
// Runs AFTER: build.js (silent master) and build_audio.js (mix_audio.wav).

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "output");
const SCENES = JSON.parse(fs.readFileSync(path.join(ROOT, "scenes.json"), "utf8"));
const VO = JSON.parse(fs.readFileSync(path.join(OUT, "vo_timings.json"), "utf8"));

const XF = 0.4;
const FPS = 30;
const SILENT = path.join(OUT, "copycoach-ai-ad-final-silent.mp4");
const MIX = path.join(OUT, "mix_audio.wav");
const FINAL = path.join(OUT, "copycoach-ai-ad-final.mp4");

// ---------- timeline math (identical to build.js) ----------
const offsets = [];
{
  let acc = 0;
  for (let i = 0; i < SCENES.length - 1; i++) {
    acc += SCENES[i].dur;
    offsets.push(acc - (i + 1) * XF);
  }
}
const sceneStart = SCENES.map((_, i) => (i === 0 ? 0 : offsets[i - 1]));
const total = sceneStart[sceneStart.length - 1] + SCENES[SCENES.length - 1].dur;

// late VO end per scene
const voEndByScene = {};
VO.forEach((seg) => {
  voEndByScene[seg.scene] = Math.max(voEndByScene[seg.scene] || 0, seg.end);
});

const captionScenes = SCENES.map((_, i) => i).filter((i) => SCENES[i].caption);
const nextCaptionStart = (i) => {
  const nxt = captionScenes.find((k) => k > i);
  return nxt === undefined ? total : sceneStart[nxt];
};

// ---------- caption files (retimed to the voiceover) ----------
function fmtSrt(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60), ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
function fmtAss(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60), cs = Math.round((sec - Math.floor(sec)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

const assHeader = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,52,&H00FFFFFF,&H000000FF,&H64000000,&HB0000000,-1,0,0,0,100,100,0,0,1,3,2,2,90,90,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

let ass = assHeader;
const srt = [];
SCENES.forEach((c, i) => {
  if (!c.caption) return;
  const start = sceneStart[i];
  let end = Math.min(start + c.dur - XF * 0.5, sceneStart[i + 1] ?? total);
  if (voEndByScene[i]) end = Math.max(end, voEndByScene[i] + 0.15);
  end = Math.min(end, nextCaptionStart(i) - 0.05, total);
  if (end <= start) end = start + 0.5;
  const textAss = c.caption.replace(/\n/g, "\\N").replace(/\|/g, "\\N");
  const textSrt = c.caption.replace(/\|/g, "\n");
  ass += `Dialogue: 0,${fmtAss(start)},${fmtAss(end)},Default,,0,0,0,,${textAss}\n`;
  srt.push(`${i + 1}\n${fmtSrt(start)} --> ${fmtSrt(end)}\n${textSrt}\n`);
});
fs.writeFileSync(path.join(ROOT, "captions.ass"), ass);
fs.writeFileSync(path.join(ROOT, "captions.srt"), srt.join("\n"));
console.log("captions written,", SCENES.filter((c) => c.caption).length, "entries");

// ---------- final mux ----------
console.log("muxing final ->", FINAL);
execFileSync("ffmpeg", ["-y", "-v", "error",
  "-i", SILENT,
  "-i", MIX,
  "-map", "0:v:0",
  "-map", "1:a:0",
  "-vf", `ass=${path.join(ROOT, "captions.ass")}`,
  "-pix_fmt", "yuv420p",
  "-c:v", "libx264", "-preset", "medium", "-crf", "18",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
  "-movflags", "+faststart",
  "-shortest",
  FINAL,
], { stdio: "inherit", maxBuffer: 4e7 });
console.log("DONE ->", FINAL);