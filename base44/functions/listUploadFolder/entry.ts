import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Get folder_id from SyncState
    const records = await base44.asServiceRole.entities.SyncState.list();
    if (!records.length) return Response.json({ error: 'No SyncState found' }, { status: 404 });
    const folderId = records[0].folder_id;

    // List all files recursively (first level + subfolders)
    async function listFolder(id, path = '') {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,size,webViewLink)&pageSize=100`,
        { headers: authHeader }
      );
      const data = await res.json();
      const items = [];
      for (const f of (data.files || [])) {
        const fullPath = path ? `${path}/${f.name}` : f.name;
        if (f.mimeType === 'application/vnd.google-apps.folder') {
          const children = await listFolder(f.id, fullPath);
          items.push(...children);
        } else {
          items.push({ ...f, path: fullPath });
        }
      }
      return items;
    }

    const files = await listFolder(folderId);
    return Response.json({ files, folder_id: folderId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});