import { z } from "zod";

export const AI_TIMEOUT_MS = 8000;

const endpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const responseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string().optional() })).optional(),
        }),
      }),
    )
    .optional(),
});

export interface GeminiResult {
  ok: boolean;
  text: string | null;
}

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function callGemini(
  prompt: string,
  options: { system?: string; timeoutMs?: number } = {},
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, text: null };

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? AI_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${endpoint(model)}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        ...(options.system
          ? { systemInstruction: { parts: [{ text: options.system }] } }
          : {}),
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) return { ok: false, text: null };
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success) return { ok: false, text: null };
    const text =
      parsed.data.candidates?.[0]?.content.parts?.map((part) => part.text ?? "").join("") ??
      null;
    return { ok: Boolean(text), text };
  } catch {
    return { ok: false, text: null };
  } finally {
    clearTimeout(timer);
  }
}
