import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Map Drive filenames to game settings keys
// e.g. "parallax_ground.png" -> "parallax_ground"
function filenameToSettingKey(filename) {
  // Strip extension
  return filename.replace(/\.[^.]+$/, '');
}

const STORAGE_KEY = 'game_settings_config';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const state = body?.data?._provider_meta?.['x-goog-resource-state'];

    // Acknowledge sync ping
    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load sync state
    const existing = await base44.asServiceRole.entities.SyncState.list();
    let syncRecord = existing.length > 0 ? existing[0] : null;

    if (!syncRecord) {
      // Initialize: get start page token
      const tokenRes = await fetch(
        'https://www.googleapis.com/drive/v3/changes/startPageToken',
        { headers: authHeader }
      );
      const { startPageToken } = await tokenRes.json();
      await base44.asServiceRole.entities.SyncState.create({ page_token: startPageToken });
      return Response.json({ status: 'initialized' });
    }

    const folderId = syncRecord.folder_id;

    // Fetch changes
    const baseUrl = `https://www.googleapis.com/drive/v3/changes?fields=changes(file(id,name,mimeType,webContentLink)),newStartPageToken,nextPageToken&includeItemsFromAllDrives=false`;
    let changesUrl = baseUrl + `&pageToken=${syncRecord.page_token}`;
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
      changesUrl = page.nextPageToken ? baseUrl + `&pageToken=${page.nextPageToken}` : null;
    }

    console.log(`Found ${allChanges.length} changes`);

    // For each changed image file, check if it's in the watched folder
    const imageChanges = allChanges.filter(c =>
      c.file && /^image\//i.test(c.file.mimeType || '')
    );

    if (imageChanges.length > 0 && folderId) {
      // Load current game settings
      const settingsRes = await base44.asServiceRole.entities.SyncState.list(); // just a proxy; we update via entity below
      const updatedSettings = {};

      for (const change of imageChanges) {
        const file = change.file;

        // Verify file is in the watched folder
        const fileMetaRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?fields=id,name,parents,webContentLink`,
          { headers: authHeader }
        );
        if (!fileMetaRes.ok) continue;
        const fileMeta = await fileMetaRes.json();

        if (!fileMeta.parents || !fileMeta.parents.includes(folderId)) continue;

        const settingKey = filenameToSettingKey(fileMeta.name);
        // Build a direct download URL using the file ID
        const directUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        updatedSettings[settingKey] = directUrl;
        console.log(`Updating setting "${settingKey}" -> ${directUrl}`);
      }

      if (Object.keys(updatedSettings).length > 0) {
        // Store updated settings in a DriveAssetUpdates entity so the frontend can pick them up
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
          page_token: newPageToken || syncRecord.page_token,
          folder_id: syncRecord.folder_id,
          folder_name: syncRecord.folder_name,
          pending_updates: JSON.stringify(updatedSettings),
        });
        return Response.json({ status: 'updated', keys: Object.keys(updatedSettings) });
      }
    }

    // Save new page token
    if (newPageToken) {
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        page_token: newPageToken,
        folder_id: syncRecord.folder_id,
        folder_name: syncRecord.folder_name,
      });
    }

    return Response.json({ status: 'ok', changes: allChanges.length });
  } catch (error) {
    console.error('driveAssetSync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});