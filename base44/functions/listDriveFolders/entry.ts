import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Search for folders accessible to this app
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType%3D'application%2Fvnd.google-apps.folder'&fields=files(id,name,parents)&pageSize=50`,
      { headers: authHeader }
    );
    const data = await res.json();

    return Response.json({ folders: data.files || [], error: data.error });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});