import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { ZipReader, BlobReader, BlobWriter } from 'npm:@zip.js/zip.js@2.7.52';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Get or create a folder for uploads
    let folderId, folderName;
    const records = await base44.asServiceRole.entities.SyncState.list();
    if (records.length && records[0].folder_id) {
      folderId = records[0].folder_id;
      folderName = records[0].folder_name;
    } else {
      // Create a default upload folder
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'ClickerQuest Assets', mimeType: 'application/vnd.google-apps.folder' }),
      });
      const created = await createRes.json();
      folderId = created.id;
      folderName = created.name;
      // Save to SyncState
      const tokenRes = await fetch('https://www.googleapis.com/drive/v3/changes/startPageToken', { headers: authHeader });
      const { startPageToken } = await tokenRes.json();
      if (records.length) {
        await base44.asServiceRole.entities.SyncState.update(records[0].id, { folder_id: folderId, folder_name: folderName, page_token: startPageToken });
      } else {
        await base44.asServiceRole.entities.SyncState.create({ folder_id: folderId, folder_name: folderName, page_token: startPageToken });
      }
    }

    const body = await req.json();
    if (!body.fileData || !body.filename) return Response.json({ error: 'No file provided' }, { status: 400 });

    // Unzip
    const fileBytes = new Uint8Array(body.fileData);
    const zipBlob = new Blob([fileBytes], { type: 'application/zip' });
    const zipReader = new ZipReader(new BlobReader(zipBlob));
    const entries = await zipReader.getEntries();
    await zipReader.close();

    const uploaded = [];
    const errors = [];

    // Cache subfolder IDs we create/find to avoid duplicates
    const subfolderCache = {};

    async function getOrCreateSubfolder(name, parentId) {
      if (subfolderCache[name]) return subfolderCache[name];
      // Check if it already exists
      const q = encodeURIComponent(`'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers: authHeader });
      const data = await res.json();
      if (data.files?.length > 0) {
        subfolderCache[name] = data.files[0].id;
        return data.files[0].id;
      }
      // Create it
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
      });
      const created = await createRes.json();
      subfolderCache[name] = created.id;
      return created.id;
    }

    for (const entry of entries) {
      if (entry.directory) continue;
      if (entry.filename.includes('__MACOSX') || entry.filename.includes('.DS_Store')) continue;

      try {
        const blob = await entry.getData(new BlobWriter());
        const parts = entry.filename.split('/').filter(Boolean);
        const filename = parts[parts.length - 1];

        // Determine parent folder: if file is in a subfolder, create/find it inside the watched folder
        let targetFolderId = folderId;
        if (parts.length > 1) {
          // Use only the immediate parent subfolder (first path component after root)
          const subfolder = parts[0];
          targetFolderId = await getOrCreateSubfolder(subfolder, folderId);
        }

        // Detect MIME type
        const ext = filename.split('.').pop().toLowerCase();
        const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', json: 'application/json' };
        const mimeType = mimeMap[ext] || 'application/octet-stream';

        // Upload to Drive using multipart upload
        const boundary = 'drive_upload_boundary';
        const meta = JSON.stringify({ name: filename, parents: [targetFolderId] });
        const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`;
        const filePart = `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
        const endPart = `\r\n--${boundary}--`;

        const encoder = new TextEncoder();
        const fileBytes = new Uint8Array(await blob.arrayBuffer());
        const p1 = encoder.encode(metaPart);
        const p2 = encoder.encode(filePart);
        const p3 = encoder.encode(endPart);
        const body = new Uint8Array(p1.length + p2.length + fileBytes.length + p3.length);
        body.set(p1, 0);
        body.set(p2, p1.length);
        body.set(fileBytes, p1.length + p2.length);
        body.set(p3, p1.length + p2.length + fileBytes.length);

        const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
          method: 'POST',
          headers: { ...authHeader, 'Content-Type': `multipart/related; boundary=${boundary}` },
          body,
        });
        const uploaded_file = await uploadRes.json();
        uploaded.push({ name: filename, id: uploaded_file.id, path: entry.filename });
      } catch (e) {
        errors.push({ file: entry.filename, error: e.message });
      }
    }

    return Response.json({
      success: true,
      folder: folderName,
      uploaded_count: uploaded.length,
      uploaded,
      errors,
    });
  } catch (error) {
    console.error('processAssetZip error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});