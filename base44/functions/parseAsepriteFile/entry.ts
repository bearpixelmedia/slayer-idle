import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const zip = new JSZip();
    await zip.loadAsync(buffer);

    // Find PNG and JSON files in the archive
    let pngData = null;
    let jsonData = null;

    for (const [path, fileObj] of Object.entries(zip.files)) {
      if (path.endsWith('.png') && !pngData) {
        pngData = await fileObj.async('uint8array');
      }
      if (path.endsWith('.json') && !jsonData) {
        jsonData = await fileObj.async('string');
      }
    }

    if (!pngData) {
      return Response.json({ error: 'No PNG image found in .aseprite file' }, { status: 400 });
    }

    if (!jsonData) {
      return Response.json({ error: 'No animation JSON found in .aseprite file' }, { status: 400 });
    }

    // Parse JSON
    let animationData;
    try {
      animationData = JSON.parse(jsonData);
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in .aseprite file' }, { status: 400 });
    }

    // Upload PNG
    const pngFile = new File([pngData], `${file.name.replace(/\..+$/, '')}.png`, { type: 'image/png' });
    const uploadRes = await base44.integrations.Core.UploadFile({ file: pngFile });
    const spriteUrl = uploadRes.file_url;

    return Response.json({
      spriteUrl,
      animationData
    });
  } catch (error) {
    console.error('Aseprite parsing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});