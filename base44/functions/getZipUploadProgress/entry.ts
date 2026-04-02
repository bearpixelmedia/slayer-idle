import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    
    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query for progress record by session_id without rate-limiting filter
    try {
      const records = await base44.asServiceRole.entities.ZipUploadProgress.filter({ session_id: sessionId });
      if (records.length > 0) {
        const progressData = records[0].progress_data ? JSON.parse(records[0].progress_data) : [];
        return Response.json({
          progress: progressData,
          status: records[0].status || 'processing'
        });
      }
    } catch (err) {
      // Silently handle filter errors; return empty on rate limit or other issues
      console.warn(`Progress lookup for ${sessionId} failed:`, err.message);
    }

    return Response.json({ progress: [], status: 'pending' });
  } catch (error) {
    console.error('getZipUploadProgress error:', error);
    // Return empty array instead of 500 to let polling continue gracefully
    return Response.json({ progress: [], status: 'pending' });
  }
});