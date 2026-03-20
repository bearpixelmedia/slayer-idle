import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'imageUrl required' }, { status: 400 });
    }

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this game screenshot and identify what looks out of place or unrealistic for a normal setting in the human world.

Look for:
1. Objects, colors, or UI elements that don't fit a natural or grounded fantasy world
2. Visual inconsistencies (scale issues, mismatched art styles, anachronistic elements)
3. Elements that feel "too game-like" or break immersion
4. Lighting/color palette issues that don't match the scene
5. Physics or perspective that feels wrong

Provide your response as:
- Overview: General coherence assessment
- Out of Place Elements: List each element with WHY it doesn't fit
- Visual Inconsistencies: Describe any art style or scale mismatches
- Immersion Breakers: What pulls you out of the world?
- Recommendations: Simple changes to improve realism/coherence

Be specific and visual in your feedback.`,
      file_urls: [imageUrl],
      model: 'gpt_5'
    });

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});