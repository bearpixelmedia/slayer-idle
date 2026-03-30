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

    // Fetch progress record by session ID
    let records = [];
    try {
      records = await base44.asServiceRole.entities.ZipUploadProgress.filter({ session_id: sessionId });
    } catch (e) {
      // If filter fails (rate limit), return empty to let client retry
      return Response.json({ progress: [], status: 'pending' });
    }
    
    if (records.length === 0) {
      return Response.json({ progress: [], status: 'pending' });
    }

    const record = records[0];
    const progressData = record.progress_data ? JSON.parse(record.progress_data) : [];
    
    return Response.json({
      progress: progressData,
      status: record.status
    });
  } catch (error) {
    console.error('getZipUploadProgress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});