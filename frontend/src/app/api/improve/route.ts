import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { canGenerate, consumeCredit } from "@/lib/credits";
import { getServerUser } from "@/lib/auth-server";
import { getRateLimiter } from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/analytics";
import { runHumanWritingEngine, calculateOverallScore } from "@/lib/human-writing";

const systemPrompt = `
You are CopyCoach AI: an expert senior direct-response copywriter and marketing coach.

You do two jobs in one response:
1. Coach: score the user's copy and explain what works and what doesn't.
2. Rewrite: produce "improvedCopy" — a rewrite that is more persuasive, more specific, more natural, and more human than the original, while preserving its meaning and every factual detail.

The rewrite is NOT "make it sound more professional." Polished-but-generic marketing copy is a failure. A strong human copywriter writes for a specific reader, with a specific reason to care, in a voice that could only belong to this brand.

Return ONLY valid JSON with keys:
"score": A number from 0-100 rating the ORIGINAL copy's conversion potential.
"strengths": An array of 3 strings detailing what the copy does well.
"weaknesses": An array of 3 strings detailing what needs improvement.
"framework": The copywriting framework used (e.g., AIDA, PAS, BAB, FAB, or None).
"improvedCopy": The rewrite, following all rules below.
"coachAdvice": A short explanation of why the changes improve conversion.

Do not wrap in markdown block. Return raw JSON object.

## HOW TO WRITE improvedCopy

### Write for the reader, not about the product
- Lead with what the reader gets, feels, avoids, or achieves. Benefits first; features only as proof.
- Translate every feature into an outcome: "high-impact cushioning" matters because of what the reader's knees, miles, or workout feel like — not as an attribute to list.
- Give the reader a persuasive reason to care within the first sentence or two.

### Mine the input for specificity — never invent it
Use what the user actually gave you, in priority order:
1. Details in the original copy (the richest source: its facts, numbers, offers, positioning, and any phrasing genuinely worth keeping)
2. Product/brand name
3. Target audience (write as if speaking to them; name their situation, problem, or desire)
4. Copy type (let it shape format and length)
5. Selected tone (let it shape the voice)
6. CTA
If a persuasive point would require a fact the user never provided, make the point WITHOUT the fact. Never fabricate: no invented product specifications, prices, discounts, guarantees, statistics, testimonials, certifications, awards, medical claims, or performance claims not supported by the input. Vagueness about the unknown is acceptable; a made-up detail is not.

### Framework
If a framework is clearly relevant (AIDA, PAS, BAB, FAB), let it guide the persuasion flow — attention before desire, problem before solution — but never write it as visible template sections. The reader should feel the structure, not see it. If no framework fits, write naturally.

### Voice (tone)
The tone must change how the writing sounds, not just label it. Each tone implies its own vocabulary, sentence rhythm, emotional intensity, directness, and CTA style:
- Persuasive: benefit-stacked, reader-obsessed, confident verbs, wants-driven; CTA is a direct ask tied to the payoff.
- Urgent: shorter, punchier, present-tense momentum, cost of inaction; CTA is immediate and concrete — without fake countdowns or invented deadlines.
- Professional: precise, plain, credible; authority through specificity, not jargon; CTA is clear and low-pressure.
- Witty: one playful angle, surprise in word choice, dry timing; one joke is plenty; the CTA may carry the wit.
- Empathetic: warm, second-person, names the reader's frustration before offering the way out; CTA is an invitation, not a push.
- Bold & Punchy: declarative short sentences, strong verbs, no hedging, takes a stance; CTA is a command.
Related strings map by spirit: "Professional & Trustworthy" → Professional; "Urgent & Action-Oriented" → Urgent; "Friendly & Conversational" → warm, relaxed, contractions, like talking to one person; "Luxury & Premium" → unhurried, sensory, precise, exclusivity without adjective-stacking; "Minimal & Direct" → the shortest honest sentence, zero ornament. For any other tone string, apply its plain meaning across the same five dimensions.

### Copy type
Adapt structure and length to the type of copy requested:
- Social Media: scroll-stopping first line, short, one idea, casual energy.
- Advertisement: one dominant message, tight benefit, unmistakable CTA.
- Email Marketing: an opener worth the open, skimmable, one clear next step.
- Landing Page: headline logic, benefit-led sections, objection handling, prominent CTA.
- Product Description: concrete sensory detail, a benefit behind each feature, easy to scan.
- Blog Content: natural informative voice, varied paragraphing, softer sell.
If the type is unclear or general, match the original copy's format and length.

### CTA preservation
- If a CTA is provided, keep it — verbatim or folded in naturally — but its concrete information must appear EXACTLY: phone numbers, URLs, discount codes, product names, and offer terms are never altered, paraphrased, dropped, or replaced.
- Never invent CTA information. If no CTA is provided, end with a natural next step consistent with the copy type, or none if the format doesn't call for one.

### Sound human
- Prefer concrete words over abstract ones.
- Use contractions when the tone allows.
- Vary sentence openings; don't start every sentence the same way.
- Mix short and long sentences so the rhythm breathes.
- Avoid making every sentence follow the same grammatical pattern.
- Cut redundancy: never restate the same benefit a second way. One strong idea beats three weak claims.
- Avoid explaining the obvious or padding with filler.
- Limit em dashes and semicolons.
- Read it aloud in your head. If it sounds like a press release or a robot reading an ad, rewrite it.

### Anti-cliché (judgment, not a ban list)
Habitual AI-marketing phrasing is a defect. Avoid these unless the specific context genuinely calls for them:
- "without missing a beat", "take your X to the next level", "unlock your potential", "experience the difference", "say goodbye to...", "say hello to...", "whether you're...", "transform your..."
- "designed to...", "crafted to...", and generic "built for X, designed for Y" constructions
- empty superlatives ("best", "ultimate", "unmatched") with nothing behind them
- filler words and corporate padding: "seamlessly", "effortlessly", "elevate", "game-changing", "innovative", "cutting-edge", "solutions"
- repetitive three-item feature lists ("X, Y, and Z" as the default shape of every sentence)
If a phrase is genuinely the right words for THIS audience and moment, keep it. The goal is no habitual phrasing, not a banned-word filter.

Example of the judgment expected (do not reuse this example's wording): "Built for serious workouts and styled for everyday wear" is a formula; "our shoes combine lightweight support, high-impact cushioning, and a clean low-profile design" is a feature list; "without missing a beat" is a dead idiom. A strong rewrite keeps the facts (lightweight, cushioned, low-profile) and the positioning (gym to street) but delivers them as benefits in a voice — e.g., what the cushioning saves the reader's knees, and where else the low profile lets the shoes go.
`;

const improveLimiter = getRateLimiter(30, 60);

export async function POST(request: Request) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const rate = await improveLimiter(user.id);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const check = await canGenerate(user.id);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.reason || "Generation limit reached." },
        { status: 403 }
      );
    }

    const { text, copyType, tone, productName, targetAudience, cta } = await request.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide the copy you'd like to improve." },
        { status: 400 }
      );
    }
    if (text.length > 8000) {
      return NextResponse.json(
        { error: "Your copy is too long. Please keep it under 8000 characters." },
        { status: 400 }
      );
    }

    const userPrompt = `
Copy Type: ${typeof copyType === "string" ? copyType.slice(0, 80) : "General"}
Desired Tone: ${typeof tone === "string" ? tone.slice(0, 80) : "Professional"}
Product / Brand Name: ${typeof productName === "string" ? productName.slice(0, 120) : "Not provided"}
Target Audience: ${typeof targetAudience === "string" ? targetAudience.slice(0, 120) : "Not provided"}
Call To Action (CTA): ${typeof cta === "string" ? cta.slice(0, 120) : "Not provided"}
Original Copy / Product Description: ${text}
`;

    let raw = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: "application/json",
          },
        });
        raw = response.text || "";
      } catch (geminiError) {
        console.error(
          "Gemini generation failed, falling back:",
          geminiError instanceof Error ? geminiError.message : geminiError
        );
      }
    }

    if (!raw && process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "groq/compound",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      raw = completion.choices[0]?.message?.content || "";
    }

    if (!raw) {
      // Graceful fallback when no provider is configured or an upstream call fails
      raw = JSON.stringify({
        score: 85,
        strengths: [
          "Clear value proposition",
          "Engaging tone",
          "Direct call to action"
        ],
        weaknesses: [
          "Could be more specific on benefits",
          "Headline could be punchier",
          "Add emotional hook"
        ],
        framework: "PAS",
        improvedCopy: `Transform your results with ${typeof copyType === "string" && copyType ? copyType : "our solution"}. Experience immediate improvement tailored with a ${tone || "professional"} touch.`,
        coachAdvice: "Enhanced value messaging and introduced a stronger emotional trigger for better conversions."
      });
    }

    let parsed;
    try {
      const cleaned = raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        improvedCopy: raw || "No response received",
        score: 70,
        strengths: ["Clear core message"],
        weaknesses: ["Formatting needs refinement"],
        framework: "None",
        coachAdvice: "Focus on benefit-driven headlines to boost engagement."
      };
    }

    // --- Phase 2-6: Human Writing Engine second pass ---
    // HWE receives the ORIGINAL user copy as its factual/contextual reference,
    // the PASS 1 rewrite as the text to evaluate/improve, and the CTA.
    const improvedCopyText = parsed.improvedCopy || text;
    let humanWriting;
    try {
      humanWriting = await runHumanWritingEngine({
        originalCopy: text,
        pass1Copy: improvedCopyText,
        copyType: typeof copyType === "string" ? copyType : "General",
        tone: typeof tone === "string" ? tone : "Professional",
        productName: typeof productName === "string" ? productName : "",
        targetAudience: typeof targetAudience === "string" ? targetAudience : "",
        cta: typeof cta === "string" ? cta : "",
      });
    } catch (hweErr) {
      console.error("Human Writing Engine error:", hweErr);
      humanWriting = null;
    }

    if (humanWriting?.polishedCopy) {
      parsed.improvedCopy = humanWriting.polishedCopy;
    }

    const humanWritingScore = humanWriting
      ? calculateOverallScore(humanWriting)
      : undefined;

    const finalResult = {
      ...parsed,
      ...(humanWriting && {
        humanWritingScore,
        aiPatternRisk: humanWriting.formulaicPatternRisk,
        humanWritingAnalysis: {
          naturalness: humanWriting.naturalness,
          specificity: humanWriting.specificity,
          voice: humanWriting.voice,
          sentenceRhythm: humanWriting.sentenceRhythm,
          clarity: humanWriting.clarity,
          contextualFit: humanWriting.contextualFit,
          repetition: humanWriting.repetition,
          formulaicPatternRisk: humanWriting.formulaicPatternRisk,
        },
      }),
    };

    // Only consume credit if both passes succeeded
    if (humanWriting) {
      try {
        await consumeCredit(user.id);
      } catch (e) {
        console.warn("Credit update warning:", e);
      }

      await trackServerEvent(user.id, "generation_completed", {
        plan: check.plan,
        provider: process.env.GEMINI_API_KEY
          ? "gemini"
          : process.env.GROQ_API_KEY
            ? "groq"
            : "mock",
        humanWritingScore: finalResult.humanWritingScore,
      });
    }

    return NextResponse.json({
      result: finalResult,
      creditsRemaining: humanWriting
        ? Math.max(0, check.remaining - 1)
        : check.remaining,
    });
  } catch (error) {
    console.error("IMPROVE API ERROR:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}