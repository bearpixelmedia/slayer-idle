import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { imageUrl, imageWidth, imageHeight } = await req.json();

  if (!imageUrl) return Response.json({ error: "Missing imageUrl" }, { status: 400 });

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are analyzing a pixel art weapon spritesheet image that is ${imageWidth}x${imageHeight} pixels.
    
The image contains multiple individual weapon sprites arranged in a grid on a transparent or checkerboard background.
Your task is to identify the bounding box (x, y, width, height) of each individual weapon sprite.

Each weapon is a distinct item (sword, axe, bow, etc.) separated by transparent gaps.
Do NOT merge multiple weapons into one box. Each weapon gets its own bounding box.
Ignore empty/transparent cells entirely.

Return ONLY a JSON array of objects, sorted top-to-bottom then left-to-right, like:
[{"x": 5, "y": 3, "w": 30, "h": 40}, ...]

Be precise with pixel coordinates. The image dimensions are ${imageWidth}x${imageHeight}.`,
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
            }
          }
        }
      }
    },
    model: "claude_sonnet_4_6"
  });

  return Response.json({ frames: result.frames || [] });
});