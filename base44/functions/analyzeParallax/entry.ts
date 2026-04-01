import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'imageUrl required' }, { status: 400 });
    }

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this game screen screenshot and provide a detailed plan to improve the parallax background effect. Look at:

1. Current state of sky, mountains, trees, and foreground elements
2. How well the parallax effect creates depth
3. Areas where the parallax feels disconnected or needs refinement
4. Specific CSS/animation improvements

Provide your response as a structured improvement plan with:
- Current observations (2-3 key issues you see)
- 4-5 specific, actionable improvements to the parallax effect
- For each improvement, include: what to change, why it helps, and rough implementation approach

Focus on making the parallax feel more cinematic and cohesive.`,
      file_urls: [imageUrl],
      model: 'gpt_5'
    });

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});