import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Create a simple flat upload folder
    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '_ClickerQuest_Uploads',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    const folder = await res.json();

    if (!folder.id) throw new Error('Failed to create folder: ' + JSON.stringify(folder));

    return Response.json({
      success: true,
      folder_id: folder.id,
      folder_name: folder.name,
      folder_url: folder.webViewLink,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});