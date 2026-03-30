import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Reference to the progress store (shared with processAssetZip via module closure in real setup)
// For now, we'll use a simple approach
const progressStore = new Map();

// This gets called from processAssetZip
export function setProgress(sessionId, data) {
  progressStore.set(sessionId, { ...data, timestamp: Date.now() });
}

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

    // Check in-memory store
    const stored = progressStore.get(sessionId);
    if (stored) {
      return Response.json({
        progress: stored.progress || [],
        status: stored.status || 'pending'
      });
    }

    // Not found, return empty
    return Response.json({ progress: [], status: 'pending' });
  } catch (error) {
    console.error('getZipUploadProgress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});