import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FOLDER_ID = '1O8PLxrC4yJoH0oLgjoP6ynCcOK30_M0q';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,size,webViewLink,thumbnailLink,webContentLink)&pageSize=100`,
      { headers: authHeader }
    );
    const data = await res.json();

    return Response.json({ files: data.files || [], error: data.error });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});