import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import AsepriteParser from 'npm:aseprite-parser@1.0.0';

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
    const parser = new AsepriteParser(Buffer.from(buffer));
    const ase = parser.parse();

    if (!ase || !ase.frames || ase.frames.length === 0) {
      return Response.json({ error: 'Failed to parse .aseprite file' }, { status: 400 });
    }

    // Extract sprite image as PNG
    const canvas = ase.toCanvas();
    const pngBuffer = await new Promise((resolve, reject) => {
      canvas.toBuffer((err, buf) => {
        if (err) reject(err);
        else resolve(buf);
      });
    });

    // Upload PNG to file storage
    const pngFile = new File([pngBuffer], `${file.name.replace(/\..+$/, '')}.png`, { type: 'image/png' });
    const uploadRes = await base44.integrations.Core.UploadFile({ file: pngFile });
    const spriteUrl = uploadRes.file_url;

    // Convert Aseprite data to Aseprite JSON format
    const animationData = {
      meta: {
        app: 'Aseprite Parser',
        version: '1.0',
        image: spriteUrl,
        size: { w: canvas.width, h: canvas.height },
        scale: '1',
        frameTags: ase.frameTags?.map(tag => ({
          name: tag.name,
          from: tag.fromFrame,
          to: tag.toFrame,
          direction: tag.animDirection,
          duration: 100
        })) || []
      },
      frames: {}
    };

    // Map frames
    ase.frames.forEach((frame, idx) => {
      const frameName = `${idx}`;
      animationData.frames[frameName] = {
        frame: {
          x: frame.left,
          y: frame.top,
          w: frame.width,
          h: frame.height
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height },
        sourceSize: { w: frame.width, h: frame.height },
        duration: frame.duration || 100
      };
    });

    return Response.json({
      spriteUrl,
      animationData
    });
  } catch (error) {
    console.error('Aseprite parsing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});