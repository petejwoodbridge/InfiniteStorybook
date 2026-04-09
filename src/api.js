/* ─────────────────────────────────────────────
 *  Nano Banana (Gemini) — Image generation
 * ───────────────────────────────────────────── */

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Call the Gemini REST API with arbitrary contents.
 * Returns { text, imageB64 } where imageB64 is raw base64 PNG or null.
 */
export async function geminiGenerate(apiKey, contents) {
  const body = {
    contents,
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "3:4" },
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  let text = "";
  let imageB64 = null;

  for (const p of parts) {
    if (p.thought) continue;           // skip thinking tokens
    if (p.text) text += p.text;
    if (p.inlineData?.data) imageB64 = p.inlineData.data;
  }

  return { text, imageB64 };
}

/**
 * Generate a character sheet image from a text description.
 */
export async function generateCharacter(apiKey, description) {
  const { imageB64 } = await geminiGenerate(apiKey, [
    { role: "user", parts: [{ text: description }] },
  ]);
  if (!imageB64) throw new Error("No image returned — try tweaking the description.");
  return imageB64;
}

/**
 * Generate a scene illustration using the character reference image
 * for visual consistency. Optionally also pass the previous page's
 * illustration so the model has two anchors to stay consistent.
 */
export async function generateIllustration(apiKey, sceneDescription, characterImageB64, prevIllustrationB64 = null) {
  const prompt = [
    "Create a children's storybook illustration for this scene: ",
    `"${sceneDescription}". `,
    "ART STYLE: bold marker illustration — thick confident ink outlines, ",
    "vibrant flat colours with loose hatching and gestural shading, ",
    "like a modern children's picture book illustrated with Copic markers. ",
    "Expressive, energetic, slightly textured. ",
    characterImageB64
      ? "IMPORTANT — character consistency: the main character MUST look EXACTLY " +
        "like the character shown in the reference image(s) — identical species, " +
        "colour, markings, outfit, face shape, and proportions. " +
        "Do NOT invent a new character. "
      : "",
    "Portrait 3:4 composition.",
  ].join("");

  const parts = [{ text: prompt }];
  if (characterImageB64) {
    parts.push({ inlineData: { mimeType: "image/png", data: characterImageB64 } });
  }
  if (prevIllustrationB64) {
    parts.push({ inlineData: { mimeType: "image/png", data: prevIllustrationB64 } });
  }

  try {
    const { imageB64 } = await geminiGenerate(apiKey, [
      { role: "user", parts },
    ]);
    return imageB64;
  } catch {
    // Graceful fallback — story continues without illustration
    return null;
  }
}

/**
 * Generate a full book cover image. Uses a wider 2:1 aspect ratio
 * to span the full book spread.
 */
export async function generateBookCover(apiKey, title, charDesc, genre, characterImageB64, sceneImageB64 = null, childName = null) {
  const prompt = [
    `Create a beautiful children's book COVER illustration in PORTRAIT orientation. `,
    `NO text, titles, words, letters or lettering anywhere in the image — the title will be added separately as a text overlay. `,
    `Main character: ${charDesc}. Genre: ${genre}. Story title for scene inspiration (do NOT render as text): "${title}". `,
    `ART STYLE: bold marker illustration — thick confident ink outlines, vibrant flat colours `,
    `with loose hatching and gestural shading, like a modern children's picture book `,
    `illustrated with Copic markers. Expressive, energetic, slightly textured. `,
    `The character should be the hero, prominently featured in a magical, `,
    `eye-catching, inviting scene. This is a BOOK COVER — vibrant, dramatic, `,
    `tall/portrait format. Rich colours, dramatic lighting, a sense of adventure and wonder. `,
    `Leave the top ~25% of the image as a visually interesting but less busy area suitable for a title overlay. `,
    characterImageB64
      ? `The character in the cover MUST look EXACTLY like the reference image — same species, colour, markings, outfit, face shape.`
      : ``,
  ].join("");

  const parts = [{ text: prompt }];
  if (characterImageB64) {
    parts.push({ inlineData: { mimeType: "image/png", data: characterImageB64 } });
  }
  if (sceneImageB64) {
    parts.push({ inlineData: { mimeType: "image/png", data: sceneImageB64 } });
  }

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "3:4" },
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const imgPart = (data.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  return imgPart?.inlineData?.data || null;
}


/* ─────────────────────────────────────────────
 *  Gemini — Story text generation
 * ───────────────────────────────────────────── */

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent`;

/**
 * Send a prompt to Gemini for story text and parse the JSON response.
 * messages: [{ role: "user", content: "..." }, ...]
 */
export async function geminiStory(apiKey, messages) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
  }));

  const res = await fetch(`${GEMINI_TEXT_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text:
            "You are a wonderful children's storyteller for ages 4-10. " +
            "Respond ONLY in valid JSON, no markdown fences or extra text.",
        }],
      },
      contents,
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini story error ${res.status}`);
  }

  const data = await res.json();
  const raw = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
