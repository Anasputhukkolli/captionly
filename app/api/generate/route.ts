import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, types, image } = await req.json();

    if (!prompt?.trim() || !Array.isArray(types) || types.length === 0) {
      return NextResponse.json(
        { error: "Missing prompt or types" },
        { status: 400 }
      );
    }

    // Build an explicit example so the model knows EXACTLY which keys to use.
    const exampleSchema = Object.fromEntries(
      types.map((t: string) => [t, "generated content here"])
    );

    const userContent: any[] = [
      {
        type: "text",
        text: `
Analyze the uploaded image if provided.

User idea:
${prompt}

Generate content for each of these content types: ${types.join(", ")}

Return a JSON object where the keys are EXACTLY these strings (character for character, same casing):
${types.map((t: string) => `"${t}"`).join(", ")}

Do not rename, shorten, or relabel the keys. Do not use generic labels like "Caption" or "Post".
Each value should be the generated content as a plain string (not an object).

Example of the exact shape expected:
${JSON.stringify(exampleSchema, null, 2)}

Return valid JSON only, no extra text.
`,
      },
    ];

    if (image) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: image,
        },
      });
    }

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are Captionly, an AI social media content creator. You always return valid JSON with EXACTLY the keys the user specifies, never renamed or generic labels. Each value must be a plain string, never a nested object.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    // Safety net: normalize any value that came back as an object into a string,
    // and make sure every requested type has a result (even if empty).
    const results: Record<string, string> = {};
    for (const t of types) {
      const value = parsed[t];
      if (typeof value === "string") {
        results[t] = value;
      } else if (value && typeof value === "object") {
        results[t] = Object.entries(value)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n\n");
      } else {
        results[t] = "";
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}