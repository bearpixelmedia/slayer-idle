import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { imageUrl, imageWidth, imageHeight } = body;

    if (!imageUrl || !imageWidth || !imageHeight) {
      return Response.json({ error: "Missing imageUrl, imageWidth, or imageHeight" }, { status: 400 });
    }

    // Use a more robust, detailed prompt with vision
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this ${imageWidth}x${imageHeight}px weapon spritesheet carefully. It contains multiple individual weapon sprites arranged in a grid or rows.

Output EVERY sprite you see. For each sprite, provide:
- x: left edge pixel (0-indexed)
- y: top edge pixel (0-indexed)  
- w: width in pixels
- h: height in pixels

Rules:
1. Count carefully — a 4x8 grid = 32 sprites, output exactly 32 entries
2. Each weapon = one entry, never merge multiple weapons
3. Weapons typically arranged in rows with consistent spacing
4. Return all results sorted top-to-bottom, left-to-right
5. Include ALL sprites even if some look similar

Respond with ONLY valid JSON: {"frames": [{"x": 0, "y": 0, "w": 32, "h": 32}, ...]}`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: "object",
        properties: {
          frames: {
            type: "array",
            items: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                w: { type: "number" },
                h: { type: "number" }
              },
              required: ["x", "y", "w", "h"]
            }
          }
        },
        required: ["frames"]
      },
      model: "gpt_5"
    });

    // Extract frames with multiple fallback paths
    let frames = [];
    if (result?.frames && Array.isArray(result.frames)) {
      frames = result.frames;
    } else if (result?.data?.frames && Array.isArray(result.data.frames)) {
      frames = result.data.frames;
    } else if (Array.isArray(result)) {
      frames = result;
    } else if (typeof result === 'object') {
      const arr = Object.values(result).find(v => Array.isArray(v));
      if (arr) frames = arr;
    }

    // Validate and clean frames
    const validFrames = frames
      .filter(f => typeof f === 'object' && f.x != null && f.y != null && f.w != null && f.h != null)
      .map(f => ({
        x: Math.max(0, Math.round(f.x)),
        y: Math.max(0, Math.round(f.y)),
        w: Math.max(4, Math.round(f.w)),
        h: Math.max(4, Math.round(f.h))
      }))
      .filter(f => f.x < imageWidth && f.y < imageHeight && f.w > 3 && f.h > 3);

    return Response.json({ frames: validFrames });
  } catch (err) {
    console.error("Detection error:", err);
    return Response.json({ error: err.message, frames: [] }, { status: 500 });
  }
});