import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// All asset keys grouped by subfolder
const ASSET_STRUCTURE = {
  parallax: [
    'parallax_stars',
    'parallax_mountain_far',
    'parallax_mountain_mid',
    'parallax_tree_very_far',
    'parallax_tree_mid',
    'parallax_tree_front',
    'parallax_ground',
    'parallax_shrub_back',
    'parallax_shrub_front',
    'parallax_clouds',
    'parallax_sky',
  ],
  enemies: [
    'enemy_goblin',
    'enemy_orc',
    'enemy_ogre',
    'enemy_skeleton',
    'enemy_vampire',
    'enemy_dragon',
    'enemy_lich',
    'enemy_zombie',
    'enemy_ghost',
    'enemy_spider',
  ],
  player: [
    'player_sword',
    'player_bow',
  ],
  bosses: [
    'boss_shadow_king_icon',
    'boss_storm_giant_icon',
    'boss_void_dragon_icon',
  ],
  ui: [
    'music_main',
    'music_boss',
    'music_title',
  ],
};

// Create a 1x1 transparent PNG as placeholder
function makePlaceholderPng() {
  // Minimal valid 1x1 transparent PNG (base64)
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function createFolder(name, parentId, authHeader) {
  const meta = { name, mimeType: 'application/vnd.google-apps.folder', parents: parentId ? [parentId] : [] };
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  });
  const data = await res.json();
  return data.id;
}

async function createPlaceholderFile(name, parentId, authHeader) {
  const pngBytes = makePlaceholderPng();
  const boundary = 'boundary_placeholder';
  const meta = JSON.stringify({ name: `${name}.png`, parents: [parentId] });

  const parts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`,
    `--${boundary}\r\nContent-Type: image/png\r\n\r\n`,
  ];

  const encoder = new TextEncoder();
  const part1 = encoder.encode(parts[0]);
  const part2 = encoder.encode(parts[1]);
  const ending = encoder.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(part1.length + part2.length + pngBytes.length + ending.length);
  body.set(part1, 0);
  body.set(part2, part1.length);
  body.set(pngBytes, part1.length + part2.length);
  body.set(ending, part1.length + part2.length + pngBytes.length);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // 1. Create root folder
    const rootId = await createFolder('ClickerQuest Assets', null, authHeader);

    // 2. Create each subfolder and placeholder files inside
    const createdFiles = {};
    for (const [subfolder, keys] of Object.entries(ASSET_STRUCTURE)) {
      const subId = await createFolder(subfolder, rootId, authHeader);
      for (const key of keys) {
        const file = await createPlaceholderFile(key, subId, authHeader);
        createdFiles[key] = file.webViewLink || file.id;
      }
    }

    // 3. Save root folder to SyncState
    const tokenRes = await fetch(
      'https://www.googleapis.com/drive/v3/changes/startPageToken',
      { headers: authHeader }
    );
    const { startPageToken } = await tokenRes.json();

    const existing = await base44.asServiceRole.entities.SyncState.list();
    if (existing.length > 0) {
      await base44.asServiceRole.entities.SyncState.update(existing[0].id, {
        folder_id: rootId,
        folder_name: 'ClickerQuest Assets',
        page_token: startPageToken,
        pending_updates: null,
      });
    } else {
      await base44.asServiceRole.entities.SyncState.create({
        folder_id: rootId,
        folder_name: 'ClickerQuest Assets',
        page_token: startPageToken,
      });
    }

    return Response.json({
      success: true,
      root_folder_id: rootId,
      folder_name: 'ClickerQuest Assets',
      files_created: Object.keys(createdFiles).length,
      structure: ASSET_STRUCTURE,
    });
  } catch (error) {
    console.error('createDriveFolderStructure error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});