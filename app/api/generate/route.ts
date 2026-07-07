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

    const hasReelScript = types.some((t: string) =>
      t.toLowerCase().includes("reel")
    );

    // Build the example schema. Reel script gets a special scene-based shape;
    // everything else stays a plain string.
    const exampleSchema = Object.fromEntries(
      types.map((t: string) => {
        if (t.toLowerCase().includes("reel")) {
          return [
            t,
            {
              hook: "1-2 second attention-grabbing opening line",
              scenes: [
                {
                  scene: 1,
                  duration: "0-3s",
                  visual: "what's shown on screen",
                  voiceover: "what's said or captioned",
                },
                {
                  scene: 2,
                  duration: "3-7s",
                  visual: "what's shown on screen",
                  voiceover: "what's said or captioned",
                },
              ],
              cta: "closing call-to-action line",
            },
          ];
        }
        return [t, "generated content here"];
      })
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

${
  hasReelScript
    ? `For "Reel script" specifically: break it into a scene-by-scene structure with a hook, 3-6 scenes (each with duration, visual direction, and voiceover/caption text), and a closing CTA. Keep each scene short and punchy, suited for a 15-30 second vertical video.`
    : ""
}

All other content types should be a plain string value (not an object).

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
            "You are Captionly, an AI social media content creator. You always return valid JSON with EXACTLY the keys the user specifies, never renamed or generic labels. Every type is a plain string EXCEPT 'Reel script', which must be a structured object with hook, scenes (array), and cta as described.",
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

    const results: Record<string, any> = {};
    for (const t of types) {
      const value = parsed[t];
      const isReel = t.toLowerCase().includes("reel");

      if (isReel) {
        // Keep the structured object as-is (with a safe fallback shape).
        if (value && typeof value === "object" && Array.isArray(value.scenes)) {
          results[t] = value;
        } else {
          results[t] = {
            hook: typeof value === "string" ? value : "",
            scenes: [],
            cta: "",
          };
        }
      } else if (typeof value === "string") {
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