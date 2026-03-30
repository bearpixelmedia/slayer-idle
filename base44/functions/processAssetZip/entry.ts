import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { ZipReader, BlobReader, BlobWriter } from 'npm:@zip.js/zip.js@2.7.52';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    if (!body.fileData || !body.filename) return Response.json({ error: 'No file provided' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Stream progress updates to frontend
    const progressQueue = [];
    const sendProgress = (item) => progressQueue.push(item);

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

    const uploaded = [];
    const errors = [];
    const progress = [];

    // Decode base64
    const binaryString = atob(body.fileData);
    const fileBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      fileBytes[i] = binaryString.charCodeAt(i);
    }
    const zipBlob = new Blob([fileBytes], { type: 'application/zip' });
    const zipReader = new ZipReader(new BlobReader(zipBlob));
    progress.push({ type: 'unzip', message: 'Reading ZIP entries...' });
    const entries = await zipReader.getEntries();
    progress.push({ type: 'unzip', message: `Found ${entries.length} total entries (filtering non-files)...` });
    await zipReader.close();

    // Calculate total files to process
    const totalFiles = entries.filter(e => !e.directory && !e.filename.includes('__MACOSX') && !e.filename.includes('.DS_Store')).length;
    progress.push({ type: 'unzip', message: `Total files to upload: ${totalFiles}` });

    // Cache subfolder IDs we create/find to avoid duplicates
    const subfolderCache = {};
    const createdFolders = new Set();

    async function getOrCreateSubfolder(name, parentId) {
      const cacheKey = `${parentId}/${name}`;
      if (subfolderCache[cacheKey]) return subfolderCache[cacheKey];
      // Check if it already exists
      const q = encodeURIComponent(`'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers: authHeader });
      const data = await res.json();
      if (data.files?.length > 0) {
        subfolderCache[cacheKey] = data.files[0].id;
        return data.files[0].id;
      }
      // Create it
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
      });
      const created = await createRes.json();
      subfolderCache[cacheKey] = created.id;
      if (!createdFolders.has(name)) {
        createdFolders.add(name);
        progress.push({ type: 'folder', name, message: `Created folder: ${name}` });
      }
      return created.id;
    }

    // Process uploads sequentially to avoid folder creation race conditions
    let processedCount = 0;
    
    for (let idx = 0; idx < entries.length; idx++) {
      const entry = entries[idx];
      if (entry.directory || entry.filename.includes('__MACOSX') || entry.filename.includes('.DS_Store')) continue;
      
      processedCount++;
      progress.push({ type: 'processing', file: entry.filename, current: processedCount, total: totalFiles });
      
      try {
        const blob = await entry.getData(new BlobWriter());
        const parts = entry.filename.split('/').filter(Boolean);
        const filename = parts[parts.length - 1];

        // Create nested folder hierarchy
        let targetFolderId = folderId;
        if (parts.length > 1) {
          let currentParentId = folderId;
          for (let j = 0; j < parts.length - 1; j++) {
            currentParentId = await getOrCreateSubfolder(parts[j], currentParentId);
          }
          targetFolderId = currentParentId;
        }

        const ext = filename.split('.').pop().toLowerCase();
        const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', json: 'application/json' };
        const mimeType = mimeMap[ext] || 'application/octet-stream';

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
        const uploadBody = new Uint8Array(p1.length + p2.length + fileBytes.length + p3.length);
        uploadBody.set(p1, 0);
        uploadBody.set(p2, p1.length);
        uploadBody.set(fileBytes, p1.length + p2.length);
        uploadBody.set(p3, p1.length + p2.length + fileBytes.length);

        const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
          method: 'POST',
          headers: { ...authHeader, 'Content-Type': `multipart/related; boundary=${boundary}` },
          body: uploadBody,
        });
        const uploaded_file = await uploadRes.json();
        uploaded.push({ name: filename, id: uploaded_file.id, path: entry.filename });
        progress.push({ type: 'uploaded', file: filename, current: processedCount, total: totalFiles });
      } catch (e) {
        errors.push({ file: entry.filename, error: e.message });
        progress.push({ type: 'error', file: entry.filename, error: e.message });
      }
    }

    return Response.json({
      success: true,
      folder: folderName,
      uploaded_count: uploaded.length,
      uploaded,
      errors,
      progress,
    });
  } catch (error) {
    console.error('processAssetZip error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});