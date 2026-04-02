import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Wand2, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { notifyGameSettingsUpdated } from "@/lib/gameSettings";

const STORAGE_KEY = "game_settings_config";
const GOOGLE_PICKER_API = "https://apis.google.com/js/api.js";

const FOLDER_STRUCTURE = {
  "📁 ClickerQuest Assets/": {
    "📁 parallax/": [
      "parallax_stars.png", "parallax_mountain_far.png", "parallax_mountain_mid.png",
      "parallax_tree_very_far.png", "parallax_tree_mid.png", "parallax_tree_front.png",
      "parallax_ground.png", "parallax_shrub_back.png", "parallax_shrub_front.png",
      "parallax_clouds.png", "parallax_sky.png",
    ],
    "📁 enemies/": [
      "enemy_goblin.png", "enemy_orc.png", "enemy_ogre.png", "enemy_skeleton.png",
      "enemy_vampire.png", "enemy_dragon.png", "enemy_lich.png", "enemy_zombie.png",
      "enemy_ghost.png", "enemy_spider.png",
    ],
    "📁 player/": ["player_sword.png", "player_bow.png"],
    "📁 bosses/": ["boss_shadow_king_icon.png", "boss_storm_giant_icon.png", "boss_void_dragon_icon.png"],
    "📁 ui/": ["music_main.mp3", "music_boss.mp3", "music_title.mp3"],
  },
};

function FolderTree() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        View expected folder structure
      </button>
      {expanded && (
        <div className="p-3 bg-white font-mono text-xs text-slate-600 space-y-1">
          {Object.entries(FOLDER_STRUCTURE).map(([root, subfolders]) => (
            <div key={root}>
              <div className="font-semibold text-slate-800">{root}</div>
              {Object.entries(subfolders).map(([folder, files]) => (
                <div key={folder} className="ml-4">
                  <div className="text-slate-700 mt-1">{folder}</div>
                  {files.map(f => (
                    <div key={f} className="ml-4 text-slate-400">└ {f}</div>
                  ))}
                </div>
              ))}
            </div>
          ))}
          <p className="mt-2 text-[10px] text-slate-400 font-sans">
            Replace any placeholder file with your real asset — it will auto-sync to the game.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DriveAssetSync() {
  const [syncState, setSyncState] = useState(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState(null);

  const loadSyncState = useCallback(async () => {
    try {
      const records = await base44.entities.SyncState.list();
      if (records.length > 0) {
        setSyncState(records[0]);
        if (records[0].pending_updates) {
          setPendingUpdates(JSON.parse(records[0].pending_updates));
        }
      }
    } catch (e) {
      // Silently ignore errors
    }
  }, []);

  const applyPendingUpdates = useCallback(async () => {
    if (!pendingUpdates || !syncState) return;
    setStatus("loading");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...pendingUpdates }));
      notifyGameSettingsUpdated();
      await base44.entities.SyncState.update(syncState.id, {
        page_token: syncState.page_token,
        folder_id: syncState.folder_id,
        folder_name: syncState.folder_name,
        pending_updates: null,
      });
      setPendingUpdates(null);
      setStatus("success");
      setMessage(`Applied ${Object.keys(pendingUpdates).length} asset update(s)`);
      setTimeout(() => setStatus(""), 3000);
    } catch (e) {
      setStatus("error");
      setMessage("Failed to apply updates: " + e.message);
    }
  }, [pendingUpdates, syncState]);

  const prevPendingRef = useRef(null);
  useEffect(() => {
    if (pendingUpdates && pendingUpdates !== prevPendingRef.current) {
      prevPendingRef.current = pendingUpdates;
      applyPendingUpdates();
    }
  }, [pendingUpdates, applyPendingUpdates]);

  // Auto-create folder structure in Drive
  const handleAutoSetup = async () => {
    setStatus("loading");
    setMessage("Creating folder structure in Google Drive…");
    try {
      const res = await base44.functions.invoke("createDriveFolderStructure", {});
      const data = res.data;
      if (!data.success) throw new Error(data.error || "Setup failed");
      setSyncState({ folder_id: data.root_folder_id, folder_name: data.folder_name });
      setStatus("success");
      setMessage(`Created "${data.folder_name}" with ${data.files_created} placeholder files. Replace them in Drive to update the game.`);
      setTimeout(() => setStatus(""), 6000);
      await loadSyncState();
    } catch (e) {
      setStatus("error");
      setMessage("Auto-setup failed: " + e.message);
    }
  };

  // Manual folder picker (existing flow)
  const ensurePickerLoaded = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google?.picker) { resolve(); return; }
      const loadPicker = () => { window.gapi.load("picker", resolve); };
      if (window.gapi) { loadPicker(); return; }
      if (!document.querySelector(`script[src="${GOOGLE_PICKER_API}"]`)) {
        const script = document.createElement("script");
        script.src = GOOGLE_PICKER_API;
        script.async = true;
        script.onload = () => window.gapi ? loadPicker() : reject(new Error("gapi failed to load"));
        script.onerror = () => reject(new Error("Failed to load Google API script"));
        document.body.appendChild(script);
      } else {
        let tries = 0;
        const poll = setInterval(() => {
          if (window.gapi) { clearInterval(poll); loadPicker(); }
          else if (++tries > 40) { clearInterval(poll); reject(new Error("Timed out")); }
        }, 100);
      }
    });
  }, []);

  const openPicker = async () => {
    setStatus("loading");
    setMessage("Loading picker…");
    try {
      const [res] = await Promise.all([
        base44.functions.invoke("getDriveAccessToken", {}),
        ensurePickerLoaded(),
      ]);
      const accessToken = res.data?.accessToken;
      if (!accessToken) throw new Error("Could not retrieve access token");
      setStatus(""); setMessage("");
      const picker = new window.google.picker.PickerBuilder()
        .addView(new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
          .setIncludeFolders(true).setSelectFolderEnabled(true)
          .setMimeTypes("application/vnd.google-apps.folder"))
        .setOAuthToken(accessToken)
        .setCallback(async (data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const folder = data.docs[0];
            setStatus("loading"); setMessage("Setting up sync…");
            const tokenRes = await fetch("https://www.googleapis.com/drive/v3/changes/startPageToken",
              { headers: { Authorization: `Bearer ${accessToken}` } });
            const { startPageToken } = await tokenRes.json();
            const existing = await base44.entities.SyncState.list();
            if (existing.length > 0) {
              await base44.entities.SyncState.update(existing[0].id, { folder_id: folder.id, folder_name: folder.name, page_token: startPageToken, pending_updates: null });
            } else {
              await base44.entities.SyncState.create({ folder_id: folder.id, folder_name: folder.name, page_token: startPageToken });
            }
            setSyncState({ folder_id: folder.id, folder_name: folder.name, page_token: startPageToken });
            setStatus("success"); setMessage(`Watching folder: ${folder.name}`);
            setTimeout(() => setStatus(""), 4000);
          } else { setStatus(""); }
        }).build();
      picker.setVisible(true);
      setStatus("");
    } catch (e) {
      setStatus("error"); setMessage(e.message);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            <span>🗂️</span> Google Drive Asset Sync
          </h4>
          {syncState?.folder_name ? (
            <p className="text-xs text-slate-500 mt-0.5">
              Watching: <span className="font-medium text-slate-700">{syncState.folder_name}</span>
              {" · "}
              <span className="text-slate-400">replace any file in Drive to auto-update the game</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-create the full folder structure in your Google Drive with placeholder files.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          {status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}

          {!syncState?.folder_name ? (
            <Button
              type="button"
              size="sm"
              onClick={handleAutoSetup}
              disabled={status === "loading"}
              className="gap-2 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Auto-Setup Drive
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={openPicker}
              disabled={status === "loading"}
              className="gap-2 text-xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Change Folder
            </Button>
          )}
        </div>
      </div>

      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-600" : "text-slate-600"}`}>
          {message}
        </p>
      )}

      <FolderTree />
    </div>
  );
}