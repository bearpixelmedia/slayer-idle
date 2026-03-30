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
      prompt: `Analyze this ${imageWidth}x${imageHeight}px weapon spritesheet. It contains multiple DISTINCT WEAPONS (swords, axes, bows, staffs, wands, shields, etc.), each may have animation frames.

Extract ONE representative frame per WEAPON TYPE (typically the first/idle pose):
- Identify unique weapons, not animation frames
- Group animation frames of same weapon, return only the first one
- For each weapon, provide its bounding box: {x, y, w, h}
- Sort top-to-bottom, left-to-right
- Expected output: ~8-13 frames (one per weapon), NOT 20+ frames

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