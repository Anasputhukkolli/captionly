import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Detects if the user explicitly asked to avoid emojis, in common phrasings/typos.
function userWantsNoEmoji(prompt: string): boolean {
  const p = prompt.toLowerCase();
  const patterns = [
    "no emoji",
    "no emojis",
    "without emoji",
    "without emojis",
    "don't use emoji",
    "dont use emoji",
    "avoid emoji",
    "no emojy",
    "no emojies",
    "no emoticon",
    "plain text only",
    "no icons",
  ];
  return patterns.some((phrase) => p.includes(phrase));
}

export async function POST(req: Request) {
  try {
    const { prompt, types, image } = await req.json();

    if (!prompt?.trim() || !Array.isArray(types) || types.length === 0) {
      return NextResponse.json(
        { error: "Missing prompt or types" },
        { status: 400 },
      );
    }

    const hasReelScript = types.some((t: string) =>
      t.toLowerCase().includes("reel"),
    );

    const noEmoji = userWantsNoEmoji(prompt);

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
      }),
    );

    const emojiInstruction = noEmoji
      ? `EMOJI RULE: The user explicitly asked for NO emojis. Do not include any emoji or emoticon anywhere in any field, including hashtags and reel scripts. Plain text only.`
      : `EMOJI RULE: Use emoji naturally where they add tone or warmth — 1-3 per caption, never stacked back to back, never one on every line. Place them at the end of a sentence or phrase, not randomly mid-word. Reel scripts should stay text-only in "visual"/"voiceover" fields (no emoji there) but the hook and cta may use them sparingly.`;

    const userContent: any[] = [
      {
        type: "text",
        text: `
USER'S RAW INPUT:
${prompt}

SELECTED CONTENT TYPES:
${types.join(", ")}

First understand what the user probably means, even if the input has spelling mistakes or incomplete wording.

If the user mentions "my app", "this platform", "my project", or similar, assume they want content about Captiondoo unless the image clearly shows something else.

Captiondoo is an AI content creation platform that can generate Instagram captions, LinkedIn posts, Facebook captions, X posts, hashtags, reel scripts, and content ideas from one prompt or uploaded image.

${emojiInstruction}

Generate complete, ready-to-post content for each selected type, following the FORMATTING RULES from the system prompt exactly — proper line breaks, ${noEmoji ? "no emojis" : "natural emoji use"}, hashtags on their own line at the end.

Return a JSON object where the keys are EXACTLY these strings:
${types.map((t: string) => `"${t}"`).join(", ")}

Do not rename the keys.

${
  hasReelScript
    ? `For "Reel script": return a structured object with hook, 3-6 scenes, and cta. Each scene's visual and voiceover must be a full clean sentence.`
    : ""
}

All other content types should be plain strings with proper paragraph breaks ("\\n\\n") — never a single unbroken block of text.

Expected JSON shape:
${JSON.stringify(exampleSchema, null, 2)}

Return valid JSON only.
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
          content: `You are Captiondoo, an intelligent AI social media content creator.

Users may write short, unclear, misspelled, grammatically wrong, or incomplete prompts.

Your job:
- Understand the user's real intention.
- Correct spelling and grammar internally.
- Never simply repeat the user's input.
- Generate complete, useful, ready-to-post content.
- If details are missing, make reasonable assumptions.
- Use the uploaded image context if provided.
- Return valid JSON with EXACTLY the requested keys.

FORMATTING RULES (very important, apply to every plain-string field):
- Write in short, scannable paragraphs (1-3 sentences each), separated by a blank line ("\\n\\n"). Never return one dense paragraph.
- ${noEmoji ? "Do NOT use any emoji or emoticon anywhere, in any field." : "Use emoji naturally and sparingly (1-3 per caption) to add tone, not decoration overload. Never stack multiple emoji in a row."}
- If the content includes hashtags, put them on their own line at the very end, separated from the caption body by a blank line — never inline mid-sentence.
- If the content has a hook/body/CTA structure (e.g. LinkedIn, Instagram), separate each part with a blank line.
- Do not use markdown symbols like ** or # for emphasis — this is plain text for social platforms.

Every type must be a plain string EXCEPT "Reel script", which must be an object with hook, scenes, and cta.`,
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
      { status: 500 },
    );
  }
}