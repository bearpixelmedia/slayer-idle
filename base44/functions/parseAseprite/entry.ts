import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const asepriteFile = formData.get('file');
    
    if (!asepriteFile) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await asepriteFile.arrayBuffer();
    const view = new Uint8Array(buffer);

    // .aseprite is a ZIP format, extract JSON from it
    // Look for JSON data in the file
    const jsonStart = findJsonInBuffer(view);
    
    if (jsonStart === -1) {
      return Response.json({ 
        error: 'No animation data found in .aseprite file',
        message: 'Make sure the file was exported with JSON data'
      }, { status: 400 });
    }

    const jsonBuffer = view.slice(jsonStart);
    const jsonStr = new TextDecoder().decode(jsonBuffer);
    const jsonMatch = jsonStr.match(/\{[\s\S]*"frames"[\s\S]*\}/);
    
    if (!jsonMatch) {
      return Response.json({ error: 'Could not parse animation data' }, { status: 400 });
    }

    const animationData = JSON.parse(jsonMatch[0]);
    
    return Response.json({ 
      success: true,
      frames: animationData.frames || {},
      meta: animationData.meta || {}
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function findJsonInBuffer(view) {
  const jsonSignature = new TextEncoder().encode('"frames"');
  for (let i = 0; i < view.length - jsonSignature.length; i++) {
    let match = true;
    for (let j = 0; j < jsonSignature.length; j++) {
      if (view[i + j] !== jsonSignature[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      // Go backwards to find the opening brace
      for (let j = i - 1; j >= 0; j--) {
        if (view[j] === 123) { // '{' character code
          return j;
        }
      }
    }
  }
  return -1;
}