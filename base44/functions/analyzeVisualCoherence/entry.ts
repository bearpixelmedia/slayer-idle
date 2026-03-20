import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'imageUrl required' }, { status: 400 });
    }

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this game screenshot's parallax background system, particularly the tree and foliage layers.

Focus on:
1. **Parallax Layer Alignment**: Do the tree trunks, foliage, and leaves line up properly as they scroll? Are there gaps, overlaps, or misalignments between different tree layers?
2. **Depth Coherence**: Do trees at different parallax speeds look like they're in the same world? Check for:
   - Trees appearing to jump or disconnect as they scroll
   - Leaves/canopies not matching their trunks
   - Scale inconsistencies between foreground and background trees
3. **Seamless Tiling**: When trees repeat, do they connect smoothly? Any visible seams or awkward gaps?
4. **Visual Continuity**: Do the near-ground vegetation and distant treelines feel like part of the same scene or do they feel like separate layers floating?
5. **Horizontal Alignment**: Are horizontal baselines consistent across tree layers, or do some trees appear to "float" above the ground?

Provide your response as:
- Parallax Issues: Specific alignment problems with trees/leaves
- Seamless Tiling Problems: Where do trees fail to connect smoothly?
- Depth Perception Breaks: Where does the illusion of depth fail?
- Layer Disconnection: Which layers feel disconnected from the environment?
- Fixes: Specific changes to layer speeds, positioning, or sizing to improve coherence

Be very specific about which layers need adjustment.`,
      file_urls: [imageUrl],
      model: 'gpt_5'
    });

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});