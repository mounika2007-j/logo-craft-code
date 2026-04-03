import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const generateLogoInputSchema = z.object({
  prompt: z.string().min(1).max(500),
  style: z.enum(["minimal", "bold", "vintage", "futuristic", "organic"]),
});

export const generateLogo = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof generateLogoInputSchema>) =>
    generateLogoInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { error: "API key not configured", imageUrl: null };
    }

    const stylePrompts: Record<string, string> = {
      minimal: "minimalist, clean lines, simple geometric shapes, flat design, modern",
      bold: "bold, striking, high contrast, impactful, strong typography",
      vintage: "vintage, retro, classic, hand-drawn feel, warm tones, nostalgic",
      futuristic: "futuristic, sleek, neon accents, tech-inspired, cutting-edge",
      organic: "organic, natural, flowing curves, earthy, hand-crafted feel",
    };

    const fullPrompt = `Design a professional logo: ${data.prompt}. Style: ${stylePrompts[data.style]}. The logo should be on a solid white background, centered, with no text unless specifically requested. High quality, vector-style, suitable for branding.`;

    try {
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: fullPrompt }],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        console.error("AI API error:", response.status, response.statusText);
        return { error: "Failed to generate logo. Please try again.", imageUrl: null };
      }

      const result = await response.json();
      const imageUrl =
        result.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;

      if (!imageUrl) {
        return { error: "No image was generated. Please try a different prompt.", imageUrl: null };
      }

      return { error: null, imageUrl };
    } catch (err) {
      console.error("Logo generation failed:", err);
      return { error: "An unexpected error occurred. Please try again.", imageUrl: null };
    }
  });
