"use strict";

// Builds the FULL audio bed for the final ad:
//  1. neural voiceover (edge-tts, natural voice) per scene line
//  2. generative ambient music (synthesized here, no copyright risk)
//  3. sparse UI sound effects (click on Improve, soft chime on result)
//  4. ducks music underneath the voice, mixes, writes output/mix_audio.wav
// Also writes output/vo_timings.json (per-line start/end) for caption alignment.

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIO = path.join(ROOT, "assets", "audio");
const OUT = path.join(ROOT, "output");
const SCENES = JSON.parse(fs.readFileSync(path.join(ROOT, "scenes.json"), "utf8"));
const LINES = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "vo_lines.json"), "utf8"));

const XF = 0.4;
const FPS = 30;
const DUR = 76.0;
const run = (file, args, opts = {}) => execFileSync(file, args, { stdio: "ignore", maxBuffer: 2e7, ...opts });

fs.mkdirSync(AUDIO, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- scene timing (identical math to build.js) ----------
const offsets = [];
{
  let acc = 0;
  for (let i = 0; i < SCENES.length - 1; i++) {
    acc += SCENES[i].dur;
    offsets.push(acc - (i + 1) * XF);
  }
}
const sceneStart = SCENES.map((_, i) => (i === 0 ? 0 : offsets[i - 1]));
const VO_OFFSET = 0.35; // narration starts slightly into each scene

const dur = (file) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

// ---------- 1. generate neural voiceover ----------
const EDGE_ARGS = ["-m", "edge_tts", "--voice", "en-US-ChristopherNeural", "--rate=+25%"];
function tts(text, file) {
  try {
    run("python3", EDGE_ARGS.concat(["--text", text, "--write-media", file + ".mp3"]), {
      env: { ...process.env, PYTHONPATH: path.join(ROOT, ".pylibs") },
    });
  } catch (e) {
    throw new Error("edge-tts failed: " + e.message);
  }
  run("ffmpeg", ["-y", "-v", "error"].concat(["-i", file + ".mp3", "-ar", "48000", "-ac", "2", file]));
  fs.rmSync(file + ".mp3", { force: true });
  return dur(file);
}

const voSegs = [];
let prevEnd = 0.05;
LINES.forEach((line, i) => {
  const wav = path.join(AUDIO, `vo_${i + 1}.wav`);
  const lineDur = tts(line.text, wav);
  // continuous narration: each line queues right after the previous one.
  // the script order already mirrors the on-screen montage beats.
  const start = prevEnd + 0.15;
  voSegs.push({ i, scene: line.scene, text: line.text, file: wav, start, dur: lineDur, end: start + lineDur });
  prevEnd = start + lineDur;
  console.log(`VO ${i + 1}: ${lineDur.toFixed(2)}s  start=${start.toFixed(2)}s  end=${(start + lineDur).toFixed(2)}s  (scene ${line.scene})`);
});
fs.writeFileSync(path.join(OUT, "vo_timings.json"), JSON.stringify(voSegs, null, 2));
console.log("VO TOTAL (speech only):", voSegs.reduce((s, v) => s + v.dur, 0).toFixed(1) + "s");
console.log("VO LAST LINE ENDS:", prevEnd.toFixed(2) + "s (video is 76s)");

// ---------- 2. generative ambient music (4-chord pad, synthesized here) ----------
const CHORDS = [
  [110.0, 164.81, 220.0, 261.63],   // Am
  [87.31, 130.81, 174.61, 220.0],   // F
  [65.41, 98.0, 130.81, 196.0],     // C
  [98.0, 146.83, 196.0, 246.94],    // G
];
function chordExpr(fs_) {
  const parts = fs_.map((f, k) => {
    const amp = [1.0, 0.6, 0.42, 0.3][k];
    const d1 = 0.012 * k; // slight detune spread for width/warmth
    return `${amp}*sin(2*PI*${(f * (1 + d1)).toFixed(4)}*t)`;
  });
  const body = parts.join("+");
  const lfo = `(0.82+0.18*sin(2*PI*0.05*t+${Math.random().toFixed(3)}))`;
  return `(${body})*${lfo}`;
}
{
  const flow = CHORDS.map((fs_, k) => {
    const e0 = chordExpr(fs_);
    const e1 = chordExpr(fs_.map((f) => f * 1.0012));
    return `aevalsrc='${e0}|${e1}':s=48000:d=20,lowpass=f=2400,aecho=0.6:0.4:120:0.35,volume=0.16[m${k}]`;
  }).join(";");
  // chain acrossfades 0.8s between the four 20s chords -> ~77.6s
  let chain = `[m0][m1]acrossfade=d=0.8:c1=tri[x1];[x1][m2]acrossfade=d=0.8:c1=tri[x2];[x2][m3]acrossfade=d=0.8:c1=tri[x3]`;
  const full = `-filter_complex`, graph = flow + ";" + chain + ";[x3]atrim=0:" + DUR + ",afade=t=in:st=0:d=1.5,afade=t=out:st=" + (DUR - 2) + ":d=2[music]";
  execFileSync("ffmpeg", ["-y", "-v", "error", "-filter_complex", graph, "-map", "[music]", path.join(AUDIO, "music.wav")], { stdio: "ignore", maxBuffer: 2e7 });
  console.log("music.wav:", dur(path.join(AUDIO, "music.wav")).toFixed(2) + "s");
}

// ---------- 3. SFX: click (Improve) + chime (result) ----------
function synth(expr, d, file) {
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", `aevalsrc='${expr}':s=48000:d=${d}`, path.join(AUDIO, file)], { stdio: "ignore", maxBuffer: 2e7 });
}
// subtle UI click — soft filtered tick
synth(`0.6*sin(2*PI*1600*t)*exp(-t*700)`, 0.09, "sfx_click.wav");
// soft confirmation chime — two notes, quick decay
synth(`0.5*sin(2*PI*880*t)*exp(-t*4)+0.35*sin(2*PI*1318.5*t)*exp(-t*5.5)`, 1.4, "sfx_chime.wav");

const sfx = []; // {file, at}
const S_IMPROVE = sceneStart[7] + 0.35; // pressing "Improve your copy"
const S_RESULT = sceneStart[8] + 1.0;   // the score lands
sfx.push({ file: path.join(AUDIO, "sfx_click.wav"), at: S_IMPROVE, gain: 0.55 });
sfx.push({ file: path.join(AUDIO, "sfx_chime.wav"), at: S_RESULT, gain: 0.4 });

// ---------- 4. mix: vo track + ducked music + sfx ----------
{
  const inputArgs = [];
  const voGraph = [];
  voSegs.forEach((s, i) => {
    inputArgs.push("-i", s.file);
    voGraph.push(`[${i}:a]adelay=${Math.round(s.start * 1000)}:all=1,apad[vd${i}]`);
  });
  const VIN = voSegs.length;
  inputArgs.push("-i", path.join(AUDIO, "music.wav"));
  inputArgs.push("-i", sfx[0].file, "-i", sfx[1].file);

  const vmix =
    voGraph.join(";") +
    ";" +
    voSegs.map((_, i) => `[vd${i}]`).join("") +
    `amix=inputs=${voSegs.length}:normalize=0:dropout_transition=0[vvo]`;
  const duck = `;[vvo]asplit=2[voA][voB];[${VIN}:a]volume=0.9,asplit=2[musA][musB];[musA][voB]sidechaincompress=threshold=0.035:ratio=10:attack=40:release=450:makeup=1[md];[musB]anullsink;`;
  const sfxMix = sfx.map((s, i) => `[${VIN + 1 + i}:a]volume=${s.gain},adelay=${Math.round(s.at * 1000)}:all=1[se${i}]`).join(";") + ";";
  const sfxAmix = sfx.map((_, i) => `[se${i}]`).join("") + `amix=inputs=${sfx.length}:normalize=0[se]`;
  const finalMix = `[voA][md][se]amix=inputs=3:normalize=0,alimiter=limit=0.95,atrim=0:${DUR},asetpts=N/SR/TB[out]`;

  const graph = vmix + duck + sfxMix + sfxAmix + ";" + finalMix;
  execFileSync("ffmpeg", ["-y", "-v", "error"].concat(inputArgs, ["-filter_complex", graph, "-map", "[out]", "-t", String(DUR), path.join(OUT, "mix_audio.wav")]), { stdio: "inherit", maxBuffer: 2e7 });
  console.log("mix_audio.wav:", dur(path.join(OUT, "mix_audio.wav")).toFixed(2) + "s");
}

console.log("AUDIO BUILD DONE -> output/mix_audio.wav");