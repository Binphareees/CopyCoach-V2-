import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

export interface HumanWritingResult {
  polishedCopy: string;
  naturalness: number;
  specificity: number;
  voice: number;
  sentenceRhythm: number;
  clarity: number;
  contextualFit: number;
  repetition: number;
  formulaicPatternRisk: number;
}

export interface HumanWritingInput {
  originalCopy: string;
  pass1Copy: string;
  copyType: string;
  tone: string;
  productName: string;
  targetAudience: string;
  cta: string;
}

const humanWritingPrompt = `You are the Human Writing Engine inside CopyCoach AI — the SECOND pass of a two-pass pipeline.

You receive:
- ORIGINAL COPY: what the user actually wrote. Your factual and contextual reference.
- PASS 1 COPY: the first AI rewrite of that copy. This is the text you evaluate and improve.
- Context: copy type, tone, product/brand, target audience, and the user's CTA.

Your job: make the PASS 1 COPY read like natural, specific, context-aware writing from an experienced human copywriter, while staying faithful to the ORIGINAL COPY's facts, offer, and intent.

MINIMAL-CHANGE GATE (apply this first):
Before editing anything, ask: "Is PASS 1 already strong, natural, specific, audience-appropriate, and faithful to the ORIGINAL?"
- If YES: make only the necessary edits. Do NOT rewrite simply to make the text different. Preserve good wording, useful specificity, and the user's intent.
- If NO: make meaningful improvements where they are needed.
Do not assume every input needs substantial rewriting.

RULES:
- Do NOT intentionally introduce mistakes.
- Do NOT make unsupported claims or fabricate facts: no invented product capabilities, ingredients, performance claims, guarantees, statistics, testimonials, or certifications.
- Preserve important concrete details and factual claims from the ORIGINAL COPY.
- Do NOT replace a specific claim (in PASS 1 or the ORIGINAL) with a vaguer marketing phrase.
- Do NOT turn concise copy into bloated copy.
- Do NOT blindly remove phrases simply because they sometimes appear in AI-generated text. Treat AI-writing patterns as signals, not rules.
- Preserve the strongest useful phrase when appropriate — from PASS 1 or from the ORIGINAL.
- Use the target audience and copy type as context. Follow the requested tone.
- Preserve the user's meaning, offer, audience, tone, and persuasive goal.

CTA PRESERVATION:
- If a CTA is provided, the polished copy must keep its essential meaning and its concrete details EXACTLY: phone numbers, URLs, discount codes, prices, offer terms, product names, dates, and promotional conditions.
- Only adjust a CTA if there is a genuine formatting problem.
- If no CTA is provided, do NOT invent one — no fabricated phone number, URL, discount code, offer, price, or urgency.

PREFER:
- concrete language over abstract praise
- natural sentence rhythm
- varied sentence openings and varied structure
- specific benefits
- direct language
- authentic voice
- useful details
- natural transitions
- appropriate personality

AVOID:
- generic corporate filler ("transform your business", "unlock your potential")
- excessive rhetorical symmetry and AI-style template constructions
- repetitive sentence patterns
- unnecessary transitions (Moreover, Furthermore, Additionally)
- excessive em-dashes as structural crutches
- vague marketing claims
- predictable AI-style introductions and conclusions
- excessive explanation
- unnecessary adjectives and jargon
- repetitive three-part lists ("X, Y, and Z" used repeatedly)

STYLE SIGNALS (only rewrite when they feel formulaic or repetitive):
- "not only X but also Y"
- "not just X but Y"
- "whether X or Y"
- "it's not about X, it's about Y"
- "here's why"
- "let's dive in"
- "in today's fast-paced world"
- "it's worth noting"

GENERIC AI VOCABULARY (replace only when a simpler word communicates better):
delve, leverage, robust, seamless, tapestry, landscape, realm, foster,
underscore, navigate, unlock, transformative, ever-evolving, game-changing,
groundbreaking, holistic, multifaceted

TONE PRESERVATION:
- Professional ≠ robotic
- Friendly ≠ childish
- Luxury ≠ excessive adjectives
- Funny ≠ random jokes
- Urgent ≠ fake pressure

READ-ALOUD TEST:
If someone read this copy aloud, would it sound like something a real person would naturally say for this specific audience and situation?

Return ONLY valid JSON with these exact keys (all nine, no missing fields):
{
  "polishedCopy": "The refined copy that sounds naturally human-written. If PASS 1 was already strong, this may be nearly identical to it with only necessary edits.",
  "naturalness": <number 0-100>,
  "specificity": <number 0-100>,
  "voice": <number 0-100>,
  "sentenceRhythm": <number 0-100>,
  "clarity": <number 0-100>,
  "contextualFit": <number 0-100>,
  "repetition": <number 0-100>,
  "formulaicPatternRisk": <number 0-100>
}

The scores must honestly evaluate the FINAL polishedCopy you return — not the input. Do not inflate scores to look good.

scoring guide:
- naturalness: How natural and human-like the writing sounds (0=very robotic, 100=perfectly natural)
- specificity: Use of concrete, specific language vs vague claims (0=all vague, 100=highly specific)
- voice: Authentic, distinctive voice appropriate for the tone (0=generic, 100=strong authentic voice)
- sentenceRhythm: Natural variation in sentence length and structure (0=monotonous, 100=natural rhythm)
- clarity: Clear, direct communication without unnecessary complexity (0=confusing, 100=crystal clear)
- contextualFit: How well the copy fits the audience and situation (0=mismatched, 100=perfectly targeted)
- repetition: Low repetition of words, phrases, and structures (0=highly repetitive, 100=no unnecessary repetition)
- formulaicPatternRisk: How many formulaic AI-style patterns remain (0=no risk, 100=heavily formulaic)

Do not wrap in markdown block. Return raw JSON object.`;

export function calculateOverallScore(result: HumanWritingResult): number {
  const weights = {
    naturalness: 0.2,
    specificity: 0.18,
    voice: 0.15,
    sentenceRhythm: 0.12,
    clarity: 0.15,
    contextualFit: 0.1,
    repetition: 0.05,
  };

  let weighted = 0;
  for (const [key, weight] of Object.entries(weights)) {
    weighted += (result[key as keyof typeof weights] || 70) * weight;
  }
  return Math.round(weighted);
}

const REQUIRED_SCORE_FIELDS = [
  "naturalness",
  "specificity",
  "voice",
  "sentenceRhythm",
  "clarity",
  "contextualFit",
  "repetition",
  "formulaicPatternRisk",
] as const;

function validScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > 100) return null;
  return Math.round(value);
}

// Returns a HumanWritingResult ONLY when every required field is present and
// valid. Anything else (malformed JSON, missing fields, non-numeric or
// out-of-range scores, empty polishedCopy) is an HWE FAILURE and returns null.
// No default scores are ever manufactured here.
function parseHumanWritingResponse(raw: string): HumanWritingResult | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object") return null;

    const polishedCopy =
      typeof parsed.polishedCopy === "string" && parsed.polishedCopy.trim()
        ? parsed.polishedCopy
        : null;
    if (!polishedCopy) return null;

    const result = { polishedCopy } as Record<string, unknown>;
    for (const field of REQUIRED_SCORE_FIELDS) {
      const score = validScore(parsed[field]);
      if (score === null) return null;
      result[field] = score;
    }

    return result as unknown as HumanWritingResult;
  } catch {
    return null;
  }
}

export async function runHumanWritingEngine(
  input: HumanWritingInput
): Promise<HumanWritingResult | null> {
  const contextBlock = [
    `Copy Type: ${input.copyType || "General"}`,
    `Tone: ${input.tone || "Professional"}`,
    `Product/Brand: ${input.productName || "Not provided"}`,
    `Target Audience: ${input.targetAudience || "Not provided"}`,
    `CTA: ${input.cta || "Not provided"}`,
  ].join("\n");

  const userMessage = `${contextBlock}

ORIGINAL COPY (the user's own copy — factual/contextual reference, not automatically better wording):
${input.originalCopy}

PASS 1 COPY (the AI rewrite you are evaluating and improving — polish THIS text):
${input.pass1Copy}`;

  let raw = "";

  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `${humanWritingPrompt}\n\n${userMessage}`,
        config: {
          responseMimeType: "application/json",
        },
      });
      raw = response.text || "";
    } catch (err) {
      console.error(
        "Human Writing Engine Gemini failed, trying Groq:",
        err instanceof Error ? err.message : err
      );
    }
  }

  // Fallback to Groq
  if (!raw && process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "groq/compound",
        messages: [
          { role: "system", content: humanWritingPrompt },
          { role: "user", content: userMessage },
        ],
      });
      raw = completion.choices[0]?.message?.content || "";
    } catch (err) {
      console.error(
        "Human Writing Engine Groq failed:",
        err instanceof Error ? err.message : err
      );
    }
  }

  // Parse the response. If no provider returned anything, or the output is
  // malformed/incomplete/invalid, HWE has FAILED: return null so the caller
  // can honestly fall back to the Pass 1 result. Never return fake scores.
  return raw ? parseHumanWritingResponse(raw) : null;
}
