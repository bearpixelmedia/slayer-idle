import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { imageUrl, imageWidth, imageHeight } = body;

    console.log("Received request:", imageUrl, imageWidth, imageHeight);

    if (!imageUrl) return Response.json({ error: "Missing imageUrl" }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a pixel art weapon spritesheet image.
The image is ${imageWidth}x${imageHeight} pixels and contains multiple individual weapon sprites (swords, axes, bows, etc.) on a transparent or solid background.

Identify the bounding box of EACH individual weapon sprite in the image.
For EACH distinct weapon item, output its pixel coordinates as: x (left edge), y (top edge), w (width), h (height).

Rules:
- Each separate weapon gets its own entry
- Skip fully transparent/empty areas
- Be as accurate as possible with pixel coordinates
- Sort results top-to-bottom, then left-to-right

Respond with a JSON object like: {"frames": [{"x": 0, "y": 0, "w": 32, "h": 32}, ...]}`,
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
      model: "claude_sonnet_4_6"
    });

    console.log("AI result:", JSON.stringify(result));

    const frames = result?.frames || [];
    return Response.json({ frames });
  } catch (err) {
    console.error("Error:", err.message, err.stack);
    return Response.json({ error: err.message, frames: [] }, { status: 500 });
  }
});