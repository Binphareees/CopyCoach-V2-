"use strict";

// CopyCoach AI promo assembler.
// Renders real-product still frames into a 1080x1920@30 cinematic timeline
// (zoompan / pan moves + crossfades), burns styled captions, and appends an
// end card. Single ffmpeg invocation, one encode for max quality.

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(ROOT, "assets", "screenshots");
const GEN = path.join(ROOT, "assets", "generated");
const OUT = path.join(ROOT, "output");
const SCENES = JSON.parse(fs.readFileSync(path.join(ROOT, "scenes.json"), "utf8"));
const BASE = process.env.AD_BASE || "copycoach-ai-ad"; // prefix for output filenames

const FPS = 30;
const XF = 0.4; // crossfade duration (s)
const W = 1080;
const H = 1920;
const MIN_TOTAL = 76.0;

const FONT = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf";
const ACCENT = "#3d7bfd";

fs.mkdirSync(GEN, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- 1. end card ----------
{
  const png = path.join(GEN, "endcard.png");
  execFileSync("convert", [
    "-size", "1080x1920", "gradient:#10141c-#06080c",
    "-gravity", "center",
    "-font", FONT, "-pointsize", 96, "-fill", "#ffffff",
    "-annotate", "+0-140", "CopyCoach AI",
    "-font", FONT, "-pointsize", 46, "-fill", ACCENT,
    "-annotate", "+0+70", "Write better. Understand why. Improve.",
    "-font", FONT, "-pointsize", 40, "-fill", "#d7dce6",
    "-annotate", "+0+240", "Try CopyCoach AI \u00b7 it\u2019s free",
    "-font", FONT, "-pointsize", 32, "-fill", "#8b93a5",
    "-annotate", "+0+410", "copy-coach-v2-frontend.vercel.app",
    "-stroke", ACCENT, "-strokewidth", "3", "-fill", "none",
    "-draw", "roundrectangle 90,780 990,804 12,12",
    "-draw", "roundrectangle 90,1330 990,1354 12,12",
    png,
  ], { stdio: "ignore" });
  console.log("endcard written");
}

// ---------- 2. durations / totals ----------
let total = SCENES.reduce((s, c) => s + c.dur, 0) - XF * (SCENES.length - 1);
if (total < MIN_TOTAL) {
  SCENES[SCENES.length - 1].dur += MIN_TOTAL - total;
  total = MIN_TOTAL;
}
const frames = SCENES.map((c) => Math.round(c.dur * FPS));

// ---------- 3. caption timeline (ASS + SRT) ----------
function fmtSrt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return (
    String(h).padStart(2, "0") + ":" +
    String(m).padStart(2, "0") + ":" +
    String(s).padStart(2, "0") + "," +
    String(ms).padStart(3, "0")
  );
}
function fmtAss(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.round((sec - Math.floor(sec)) * 100);
  return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(cs).padStart(2, "0");
}

const offsets = []; // offsets[i] = xfade offset before scene i+1
{
  let acc = 0;
  for (let i = 0; i < SCENES.length - 1; i++) {
    acc += SCENES[i].dur;
    offsets.push(acc - (i + 1) * XF);
  }
}
const sceneStart = SCENES.map((_, i) => (i === 0 ? 0 : offsets[i - 1]));

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
  let end = start + c.dur - XF * 0.5;
  end = Math.min(end, sceneStart[i + 1] ?? total);
  const textAss = c.caption.replace(/\n/g, "\\N").replace(/\|/g, "\\N");
  const textSrt = c.caption.replace(/\|/g, "\n");
  ass += `Dialogue: 0,${fmtAss(start)},${fmtAss(end)},Default,,0,0,0,,${textAss}\n`;
  srt.push(`${i + 1}\n${fmtSrt(start)} --> ${fmtSrt(end)}\n${textSrt}\n`);
});
fs.writeFileSync(path.join(ROOT, "captions.ass"), ass);
fs.writeFileSync(path.join(ROOT, "captions.srt"), srt.join("\n"));
console.log("captions written:", SCENES.filter((c) => c.caption).length, "entries, total", total.toFixed(2) + "s");

// ---------- 4. build ffmpeg filtergraph ----------
const inputs = [];
SCENES.forEach((c) => {
  inputs.push("-i", c.file === "endcard.png" ? path.join(GEN, c.file) : path.join(SHOTS, c.file));
});

const zoom = (c, i) => {
  const n = frames[i];
  const exprZ =
    c.mode === "zoom" ? "min(1+0.0009*on,1.12)"
    : c.mode === "pan-up" ? "1.18"
    : c.mode === "pan-down" ? "1.18"
    : "1";
  const exprX = "(iw-iw/zoom)/2";
  const exprY =
    c.mode === "pan-up" ? `(ih-ih/zoom)*(1-on/${n})`
    : c.mode === "pan-down" ? `(ih-ih/zoom)*(on/${n})`
    : "(ih-ih/zoom)/2";
  return `scale=2160:3840:flags=lanczos,zoompan=z='${exprZ}':x='${exprX}':y='${exprY}':d=${n}:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p,settb=AVTB`;
};

let fc = SCENES.map((c, i) => `[${i}:v]${zoom(c, i)}[v${i}]`).join(";");

let label = "v0";
for (let i = 0; i < SCENES.length - 1; i++) {
  const next = `[x${i + 1}]`;
  fc += `;[${label}][v${i + 1}]xfade=transition=fade:duration=${XF}:offset=${offsets[i].toFixed(3)}${next}`;
  label = `x${i + 1}`;
}

const audioIndex = SCENES.length;
const cmd = [
  "-y",
  ...inputs,
  "-f", "lavfi", "-t", total.toFixed(2), "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
  "-filter_complex", fc,
  "-map", `[${label}]`, "-map", `${audioIndex}:a`,
  "-r", String(FPS),
  "-c:v", "libx264", "-preset", "medium", "-crf", "18",
  "-c:a", "aac", "-b:a", "128k",
  path.join(OUT, `${BASE}-silent.mp4`),
];
console.log("rendering", total.toFixed(2) + "s timeline -> " + `${BASE}-silent.mp4`);
execFileSync("ffmpeg", cmd, { stdio: "inherit", maxBuffer: 64 * 1024 * 1024 });

console.log("DONE ->", path.join(OUT, `${BASE}-silent.mp4`));