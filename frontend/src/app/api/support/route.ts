import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const supportSystemPrompt = `
You are CopyCoach AI Support & Copywriting Assistant.
Your job is to assist users with:
1. Copywriting advice, frameworks (AIDA, PAS, BAB, FAB, 4Ps), hooks, headlines, and call-to-actions.
2. How CopyCoach AI platform works (Practice Drills, AI Critiques, Scores 0-100, Project Folders, Saved Drills).
3. Subscription plans:
   - The Spark (Free): $0/mo, 3 drills/mo, basic scores & frameworks.
   - The Apprentice: $19/mo, 25 drills/mo, line-by-line red-pen annotations & 50+ briefs.
   - The Pro: $39/mo, Unlimited drills, real-time rewrite engine, dynamic client briefs, niche simulator.
   - The Studio (Agency): $119/mo, Unlimited drills, 5 seats, team dashboard, custom brief uploader.
4. Account or technical questions (Logging in, password reset, usage limits).

Be helpful, concise, friendly, and structured. If the question sounds like a bug report, critical complaint, or account billing refund issue, advise them to click "Submit Ticket" to escalate to human support.
`;

export async function POST(req: NextRequest) {
  try {
    const { question, userTier = "Spark" } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    let answer = "";

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${supportSystemPrompt}\n\nUser Tier: ${userTier}\nUser Question: ${question}`,
      });
      answer = response.text || "";
    } else if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: supportSystemPrompt },
          { role: "user", content: `User Tier: ${userTier}\nUser Question: ${question}` },
        ],
      });
      answer = completion.choices[0]?.message?.content || "";
    } else {
      // Smart Fallback Response
      answer = `Thank you for asking about CopyCoach AI! 

Here is what you need to know:
• **Practice Drills**: Paste your draft copy in the dashboard to receive an instant score (0-100), framework breakdown (AIDA/PAS), strengths, weaknesses, and a refined rewrite.
• **Plans & Quotas**: 
  - **The Spark (Free)**: 3 drills / month.
  - **The Apprentice ($19/mo)**: 25 drills / month + line-by-line annotations.
  - **The Pro ($39/mo)**: Unlimited drills, real-time rewrite engine & client briefs.
  - **The Studio ($119/mo)**: Unlimited drills for 5 seats & agency tools.

If you are experiencing a technical bug or require billing assistance, please switch to the **Submit Ticket** tab to route your request to our priority engineering queue.`;
    }

    return NextResponse.json({
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("AI Support Error:", msg);
    return NextResponse.json({ error: "Failed to process AI support request." }, { status: 500 });
  }
}
