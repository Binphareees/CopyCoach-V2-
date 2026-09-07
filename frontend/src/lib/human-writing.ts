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

const humanWritingPrompt = `You are the Human Writing Engine inside CopyCoach AI.

Your job is to improve AI-assisted copy so that it reads like natural, specific, context-aware writing from an experienced human copywriter.

RULES:
- Do NOT intentionally introduce mistakes.
- Do NOT make unsupported claims.
- Do NOT fabricate facts.
- Do NOT blindly remove phrases simply because they sometimes appear in AI-generated text.
- Treat AI-writing patterns as signals, not rules.
- Preserve the user's meaning, offer, audience, tone, and persuasive goal.

PREFER:
- concrete language
- natural sentence rhythm
- varied structure
- specific benefits
- direct language
- authentic voice
- useful details
- natural transitions
- appropriate personality

AVOID:
- generic corporate filler ("transform your business", "unlock your potential")
- excessive rhetorical symmetry
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

Return ONLY valid JSON with these exact keys:
{
  "polishedCopy": "The refined copy that sounds naturally human-written",
  "naturalness": <number 0-100>,
  "specificity": <number 0-100>,
  "voice": <number 0-100>,
  "sentenceRhythm": <number 0-100>,
  "clarity": <number 0-100>,
  "contextualFit": <number 0-100>,
  "repetition": <number 0-100>,
  "formulaicPatternRisk": <number 0-100>
}

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

function parseHumanWritingResponse(raw: string): HumanWritingResult | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    const result: HumanWritingResult = {
      polishedCopy: parsed.polishedCopy || "",
      naturalness: clamp(parsed.naturalness, 0, 100),
      specificity: clamp(parsed.specificity, 0, 100),
      voice: clamp(parsed.voice, 0, 100),
      sentenceRhythm: clamp(parsed.sentenceRhythm, 0, 100),
      clarity: clamp(parsed.clarity, 0, 100),
      contextualFit: clamp(parsed.contextualFit, 0, 100),
      repetition: clamp(parsed.repetition, 0, 100),
      formulaicPatternRisk: clamp(parsed.formulaicPatternRisk, 0, 100),
    };

    return result;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 70;
  return Math.max(min, Math.min(max, Math.round(value)));
}

export async function runHumanWritingEngine(
  copy: string,
  copyType: string,
  tone: string,
  productName: string,
  targetAudience: string
): Promise<HumanWritingResult> {
  const contextBlock = [
    `Copy Type: ${copyType || "General"}`,
    `Tone: ${tone || "Professional"}`,
    `Product/Brand: ${productName || "Not provided"}`,
    `Target Audience: ${targetAudience || "Not provided"}`,
  ].join("\n");

  const userMessage = `${contextBlock}\n\nCopy to review and polish:\n${copy}`;

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

  // Parse the response
  const result = raw ? parseHumanWritingResponse(raw) : null;

  if (result && result.polishedCopy) {
    return result;
  }

  // Graceful fallback: return the original copy with moderate scores
  return {
    polishedCopy: copy,
    naturalness: 70,
    specificity: 70,
    voice: 70,
    sentenceRhythm: 70,
    clarity: 70,
    contextualFit: 70,
    repetition: 70,
    formulaicPatternRisk: 30,
  };
}
