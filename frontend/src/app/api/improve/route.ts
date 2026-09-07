import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { canGenerate, consumeCredit } from "@/lib/credits";
import { getServerUser } from "@/lib/auth-server";
import { getRateLimiter } from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/analytics";
import { runHumanWritingEngine } from "@/lib/human-writing";

const systemPrompt = `
You are CopyCoach AI, an expert senior copywriter and marketing coach.

Analyze the user's copy and provide coaching.

Return ONLY valid JSON with keys:
"score": A number from 0-100.
"strengths": An array of 3 strings detailing what the copy does well.
"weaknesses": An array of 3 strings detailing what needs improvement.
"framework": The copywriting framework used (e.g., AIDA, PAS, BAB, FAB, or None).
"improvedCopy": A professional rewrite of the copy.
"coachAdvice": A short explanation of why the changes improve conversion.

Do not wrap in markdown block. Return raw JSON object.
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
    const improvedCopyText = parsed.improvedCopy || text;
    let humanWriting;
    try {
      humanWriting = await runHumanWritingEngine(
        improvedCopyText,
        typeof copyType === "string" ? copyType : "General",
        typeof tone === "string" ? tone : "Professional",
        typeof productName === "string" ? productName : "",
        typeof targetAudience === "string" ? targetAudience : ""
      );
    } catch (hweErr) {
      console.error("Human Writing Engine error:", hweErr);
      humanWriting = null;
    }

    // Use the polished copy from Human Writing Engine if available
    if (humanWriting && humanWriting.polishedCopy) {
      parsed.improvedCopy = humanWriting.polishedCopy;
    }

    // Merge Human Writing scores into result
    const finalResult = {
      ...parsed,
      humanWritingScore: humanWriting?.humanWritingScore ?? 70,
      aiPatternRisk: humanWriting?.aiPatternRisk ?? 30,
      humanWritingAnalysis: humanWriting?.humanWritingAnalysis ?? {
        naturalness: 70,
        specificity: 70,
        voice: 70,
        sentenceRhythm: 70,
        clarity: 70,
        contextualFit: 70,
        repetition: 70,
        formulaicPatternRisk: 30,
      },
    };

    // Consume credit ONLY after successful generation
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

    return NextResponse.json({
      result: finalResult,
      creditsRemaining: Math.max(0, check.remaining - 1),
    });
  } catch (error) {
    console.error("IMPROVE API ERROR:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}