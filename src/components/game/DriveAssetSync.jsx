import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { FolderOpen, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { notifyGameSettingsUpdated } from "@/lib/gameSettings";

const STORAGE_KEY = "game_settings_config";
const GOOGLE_PICKER_API = "https://apis.google.com/js/api.js";

export default function DriveAssetSync() {
  const [syncState, setSyncState] = useState(null);
  const [status, setStatus] = useState(""); // "", "loading", "success", "error"
  const [message, setMessage] = useState("");
  const [pickerReady, setPickerReady] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(null);

  // Load sync state from entity
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
      console.error("Failed to load sync state", e);
    }
  }, []);

  useEffect(() => {
    loadSyncState();
    // Poll every 10s for pending updates from webhook
    const interval = setInterval(loadSyncState, 10000);
    return () => clearInterval(interval);
  }, [loadSyncState]);

  // Apply pending updates to game settings
  const applyPendingUpdates = useCallback(async () => {
    if (!pendingUpdates || !syncState) return;
    setStatus("loading");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? JSON.parse(saved) : {};
      const merged = { ...current, ...pendingUpdates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      notifyGameSettingsUpdated();

      // Clear pending updates from entity
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

  // Only auto-apply when pendingUpdates becomes non-null from a poll
  const prevPendingRef = useRef(null);
  useEffect(() => {
    if (pendingUpdates && pendingUpdates !== prevPendingRef.current) {
      prevPendingRef.current = pendingUpdates;
      applyPendingUpdates();
    }
  }, [pendingUpdates, applyPendingUpdates]);

  // Ensure Google Picker is loaded — returns a promise that resolves when ready
  const ensurePickerLoaded = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google?.picker) { resolve(); return; }

      const loadPicker = () => {
        window.gapi.load("picker", () => {
          setPickerReady(true);
          resolve();
        });
      };

      if (window.gapi) { loadPicker(); return; }

      if (!document.querySelector(`script[src="${GOOGLE_PICKER_API}"]`)) {
        const script = document.createElement("script");
        script.src = GOOGLE_PICKER_API;
        script.async = true;
        script.onload = () => { if (window.gapi) loadPicker(); else reject(new Error("gapi failed to load")); };
        script.onerror = () => reject(new Error("Failed to load Google API script"));
        document.body.appendChild(script);
      } else {
        // Script tag exists, poll for gapi
        let tries = 0;
        const poll = setInterval(() => {
          if (window.gapi) { clearInterval(poll); loadPicker(); }
          else if (++tries > 40) { clearInterval(poll); reject(new Error("Timed out waiting for gapi")); }
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

      setStatus("");
      setMessage("");

      const picker = new window.google.picker.PickerBuilder()
        .addView(new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true)
          .setMimeTypes("application/vnd.google-apps.folder"))
        .setOAuthToken(accessToken)
        .setCallback(async (data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const folder = data.docs[0];
            await saveFolderAndInitSync(folder.id, folder.name, accessToken);
          } else {
            setStatus("");
          }
        })
        .build();
      picker.setVisible(true);
      setStatus("");
    } catch (e) {
      setStatus("error");
      setMessage(e.message);
    }
  };

  const saveFolderAndInitSync = async (folderId, folderName, accessToken) => {
    setStatus("loading");
    setMessage("Setting up sync…");
    try {
      const existing = await base44.entities.SyncState.list();

      // Get start page token from Drive
      const tokenRes = await fetch(
        "https://www.googleapis.com/drive/v3/changes/startPageToken",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const { startPageToken } = await tokenRes.json();

      if (existing.length > 0) {
        await base44.entities.SyncState.update(existing[0].id, {
          folder_id: folderId,
          folder_name: folderName,
          page_token: startPageToken,
          pending_updates: null,
        });
      } else {
        await base44.entities.SyncState.create({
          folder_id: folderId,
          folder_name: folderName,
          page_token: startPageToken,
        });
      }

      setSyncState({ folder_id: folderId, folder_name: folderName, page_token: startPageToken });
      setStatus("success");
      setMessage(`Watching folder: ${folderName}`);
      setTimeout(() => setStatus(""), 4000);
    } catch (e) {
      setStatus("error");
      setMessage("Setup failed: " + e.message);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            <span>🗂️</span> Google Drive Asset Sync
          </h4>
          {syncState?.folder_name ? (
            <p className="text-xs text-slate-500 mt-0.5">
              Watching: <span className="font-medium text-slate-700">{syncState.folder_name}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">No folder selected — pick one to start syncing</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          {status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openPicker}
            disabled={status === "loading"}
            className="gap-2 text-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            {syncState?.folder_name ? "Change Folder" : "Select Folder"}
          </Button>
        </div>
      </div>

      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-600" : "text-slate-600"}`}>
          {message}
        </p>
      )}

      {syncState?.folder_name && (
        <p className="text-xs text-slate-400">
          Asset files in this folder are auto-applied when changed in Drive. File names should match parallax setting keys (e.g. <code className="bg-slate-200 px-1 rounded">parallax_ground.png</code>).
        </p>
      )}
    </div>
  );
}