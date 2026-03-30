import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { ZipReader, BlobReader, BlobWriter } from 'npm:@zip.js/zip.js@2.7.52';

// Maps filename (without extension) to game setting key
// Also supports path-based matching: folder/filename
const FILENAME_TO_KEY = {
  // Parallax
  'parallax_stars': 'parallax_stars',
  'parallax_mountain_far': 'parallax_mountain_far',
  'parallax_mountain_mid': 'parallax_mountain_mid',
  'parallax_tree_very_far': 'parallax_tree_very_far',
  'parallax_tree_mid': 'parallax_tree_mid',
  'parallax_tree_front': 'parallax_tree_front',
  'parallax_ground': 'parallax_ground',
  'parallax_shrub_back': 'parallax_shrub_back',
  'parallax_shrub_front': 'parallax_shrub_front',
  'parallax_clouds': 'parallax_clouds',
  'parallax_sky': 'parallax_sky',
  // Enemies
  'enemy_goblin': 'enemy_goblin',
  'enemy_orc': 'enemy_orc',
  'enemy_ogre': 'enemy_ogre',
  'enemy_skeleton': 'enemy_skeleton',
  'enemy_vampire': 'enemy_vampire',
  'enemy_dragon': 'enemy_dragon',
  'enemy_lich': 'enemy_lich',
  'enemy_zombie': 'enemy_zombie',
  'enemy_ghost': 'enemy_ghost',
  'enemy_spider': 'enemy_spider',
  // Player
  'player_sword': 'player_sword',
  'player_bow': 'player_bow',
  // Bosses
  'boss_shadow_king_icon': 'boss_shadow_king_icon',
  'boss_storm_giant_icon': 'boss_storm_giant_icon',
  'boss_void_dragon_icon': 'boss_void_dragon_icon',
  // Music
  'music_main': 'music_main',
  'music_boss': 'music_boss',
  'music_title': 'music_title',
  // Weapon atlas
  'weapon_atlas': 'weapon_atlas',
};

function getSettingKey(filePath) {
  // Strip leading path components and get filename without extension
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  const nameNoExt = filename.replace(/\.[^.]+$/, '');
  return FILENAME_TO_KEY[nameNoExt] || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const zipFile = formData.get('file');
    if (!zipFile) return Response.json({ error: 'No file provided' }, { status: 400 });

    const zipBlob = new Blob([await zipFile.arrayBuffer()], { type: 'application/zip' });
    const zipReader = new ZipReader(new BlobReader(zipBlob));
    const entries = await zipReader.getEntries();
    await zipReader.close();

    const results = {};
    const skipped = [];
    const errors = [];

    for (const entry of entries) {
      if (entry.directory) continue;
      // Skip hidden/system files
      if (entry.filename.includes('__MACOSX') || entry.filename.includes('.DS_Store')) continue;

      const key = getSettingKey(entry.filename);
      if (!key) {
        skipped.push(entry.filename);
        continue;
      }

      try {
        const blob = await entry.getData(new BlobWriter());
        const mimeType = entry.filename.match(/\.(mp3|wav|ogg|m4a)$/i)
          ? 'audio/mpeg'
          : 'image/png';
        const file = new File([blob], entry.filename.split('/').pop(), { type: mimeType });

        const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file });
        results[key] = uploadRes.file_url;
      } catch (e) {
        errors.push({ file: entry.filename, error: e.message });
      }
    }

    return Response.json({
      success: true,
      mapped: results,
      skipped,
      errors,
      total_entries: entries.filter(e => !e.directory).length,
    });
  } catch (error) {
    console.error('processAssetZip error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});