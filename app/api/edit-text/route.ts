import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, instruction } = await req.json();

    if (!text?.trim() || !instruction?.trim()) {
      return NextResponse.json(
        { error: "Missing text or instruction" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a precise text editor. You are given a short snippet of text and an instruction for how to change it. Return ONLY the rewritten text — no quotes, no explanation, no preamble, no markdown formatting. Keep it roughly the same length unless the instruction asks you to shorten or expand it. Preserve the original tone and meaning unless told otherwise.",
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nText: "${text}"\n\nRewritten text:`,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content?.trim() || text;

    // Strip wrapping quotes if the model added them anyway
    const cleaned = result.replace(/^["'](.*)["']$/s, "$1").trim();

    return NextResponse.json({ result: cleaned });
  } catch (error) {
    console.error("Edit-text API error:", error);
    return NextResponse.json(
      { error: "Failed to edit text" },
      { status: 500 }
    );
  }
}