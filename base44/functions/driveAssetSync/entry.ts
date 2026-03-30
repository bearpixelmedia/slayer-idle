import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Strip extension to get the setting key: "parallax_ground.png" -> "parallax_ground"
function filenameToSettingKey(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const state = body?.data?._provider_meta?.['x-goog-resource-state'];

    // Acknowledge the initial sync ping from Google
    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load persisted sync state
    const existing = await base44.asServiceRole.entities.SyncState.list();
    let syncRecord = existing.length > 0 ? existing[0] : null;

    if (!syncRecord || !syncRecord.page_token) {
      const tokenRes = await fetch(
        'https://www.googleapis.com/drive/v3/changes/startPageToken',
        { headers: authHeader }
      );
      const { startPageToken } = await tokenRes.json();
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, { page_token: startPageToken });
      } else {
        await base44.asServiceRole.entities.SyncState.create({ page_token: startPageToken });
      }
      return Response.json({ status: 'initialized' });
    }

    const folderId = syncRecord.folder_id;
    if (!folderId) {
      return Response.json({ status: 'no_folder_configured' });
    }

    // Fetch all pages of changes since last token
    const baseChangesUrl = `https://www.googleapis.com/drive/v3/changes?fields=changes(file(id,name,mimeType)),newStartPageToken,nextPageToken&includeItemsFromAllDrives=false`;
    let changesUrl = baseChangesUrl + `&pageToken=${syncRecord.page_token}`;
    const allChanges = [];
    let newPageToken = null;

    while (changesUrl) {
      const changesRes = await fetch(changesUrl, { headers: authHeader });
      if (!changesRes.ok) {
        console.error('Changes API error:', await changesRes.text());
        return Response.json({ status: 'api_error' });
      }
      const page = await changesRes.json();
      allChanges.push(...(page.changes || []));
      if (page.newStartPageToken) newPageToken = page.newStartPageToken;
      changesUrl = page.nextPageToken ? baseChangesUrl + `&pageToken=${page.nextPageToken}` : null;
    }

    console.log(`Found ${allChanges.length} changes in drive`);

    // Filter to image files only
    const imageChanges = allChanges.filter(c =>
      c.file && /^image\//i.test(c.file.mimeType || '')
    );

    const updatedSettings = {};

    for (const change of imageChanges) {
      const file = change.file;

      // Verify the file is inside the watched folder
      const fileMetaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?fields=id,name,parents,mimeType`,
        { headers: authHeader }
      );
      if (!fileMetaRes.ok) continue;
      const fileMeta = await fileMetaRes.json();

      if (!fileMeta.parents || !fileMeta.parents.includes(folderId)) continue;

      // Download the file content using the access token
      const downloadRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        { headers: authHeader }
      );
      if (!downloadRes.ok) {
        console.error(`Failed to download ${fileMeta.name}:`, await downloadRes.text());
        continue;
      }

      // Re-upload to Base44 storage so the frontend can access it without auth
      const fileBytes = await downloadRes.arrayBuffer();
      const uploadedFile = new File([fileBytes], fileMeta.name, { type: fileMeta.mimeType });
      const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: uploadedFile });
      const hostedUrl = uploadRes.file_url;

      const settingKey = filenameToSettingKey(fileMeta.name);
      updatedSettings[settingKey] = hostedUrl;
      console.log(`Updated setting "${settingKey}" -> ${hostedUrl}`);
    }

    // Save new page token
    if (newPageToken) {
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        page_token: newPageToken,
        folder_id: syncRecord.folder_id,
        folder_name: syncRecord.folder_name,
        pending_updates: Object.keys(updatedSettings).length > 0
          ? JSON.stringify(updatedSettings)
          : syncRecord.pending_updates || null,
      });
    } else if (Object.keys(updatedSettings).length > 0) {
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        page_token: syncRecord.page_token,
        folder_id: syncRecord.folder_id,
        folder_name: syncRecord.folder_name,
        pending_updates: JSON.stringify(updatedSettings),
      });
    }

    return Response.json({
      status: Object.keys(updatedSettings).length > 0 ? 'updated' : 'ok',
      changes: allChanges.length,
      updated_keys: Object.keys(updatedSettings),
    });
  } catch (error) {
    console.error('driveAssetSync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});