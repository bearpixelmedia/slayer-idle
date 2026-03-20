import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await req.json();
    
    if (!fileUrl) {
      return Response.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Fetch the .aseprite file (ZIP format)
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch file' }, { status: 400 });
    }

    const buffer = await response.arrayBuffer();
    const view = new Uint8Array(buffer);

    // Search for JSON data in the ZIP file
    const jsonMatch = extractJsonFromAseprite(view);
    
    if (!jsonMatch) {
      return Response.json({ 
        error: 'No animation data found in .aseprite file'
      }, { status: 400 });
    }

    const animationData = JSON.parse(jsonMatch);
    
    return Response.json({ 
      success: true,
      frames: animationData.frames || {},
      meta: animationData.meta || {}
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function extractJsonFromAseprite(view) {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(view);
  
  // Look for JSON object with frames property
  const match = text.match(/\{[^{}]*"frames"[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
  return match ? match[0] : null;
}