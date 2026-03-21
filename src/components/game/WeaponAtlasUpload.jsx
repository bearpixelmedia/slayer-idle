import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

const WEAPON_SLOTS = [
  { id: "weapon_sword", label: "Sword" },
  { id: "weapon_axe", label: "Axe" },
  { id: "weapon_dagger", label: "Dagger" },
  { id: "weapon_hammer", label: "Hammer" },
  { id: "weapon_spear", label: "Spear" },
  { id: "weapon_bow", label: "Bow" },
  { id: "weapon_crossbow", label: "Crossbow" },
  { id: "weapon_staff", label: "Staff" },
  { id: "weapon_wand", label: "Wand" },
  { id: "weapon_fire_sword", label: "Fire Sword" },
  { id: "weapon_soul_blade", label: "Soul Blade" },
  { id: "weapon_chaos_gem", label: "Chaos Gem" },
  { id: "weapon_ancient_rune", label: "Ancient Rune" },
];

function FrameCanvas({ imgSrc, frame, size = 48 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !imgSrc || !frame) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = imgSrc;
    const draw = () => {
      const scale = Math.min(size / frame.frame.w, size / frame.frame.h);
      const sw = frame.frame.w * scale;
      const sh = frame.frame.h * scale;
      ctx.drawImage(img, frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h,
        (size - sw) / 2, (size - sh) / 2, sw, sh);
    };
    if (img.complete) draw();
    else img.onload = draw;
  }, [imgSrc, frame, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, imageRendering: "pixelated" }} />;
}

export default function WeaponAtlasUpload({ settings, onUpdateSetting }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [atlasUrl, setAtlasUrl] = useState(null);
  const [frames, setFrames] = useState([]);
  const [assignments, setAssignments] = useState({});

  // Load existing atlas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("weapon_atlas");
    if (saved) {
      const { url, framesData } = JSON.parse(saved);
      setAtlasUrl(url);
      setFrames(framesData);
    }
    // Load existing assignments from settings
    const initAssignments = {};
    WEAPON_SLOTS.forEach(slot => {
      if (settings[slot.id]) initAssignments[slot.id] = settings[slot.id];
    });
    setAssignments(initAssignments);
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const imgFile = files.find(f => /\.(png|jpg|jpeg)$/i.test(f.name));
    const jsonFile = files.find(f => f.name.endsWith(".json"));

    if (!imgFile) { alert("Please include a PNG image file."); return; }
    if (!jsonFile) { alert("Please include the Aseprite JSON file."); return; }

    setUploading(true);
    try {
      const [imgRes, jsonRes] = await Promise.all([
        base44.integrations.Core.UploadFile({ file: imgFile }),
        base44.integrations.Core.UploadFile({ file: jsonFile }),
      ]);

      const jsonData = await fetch(jsonRes.file_url).then(r => r.json());
      const framesData = Array.isArray(jsonData.frames)
        ? jsonData.frames
        : Object.entries(jsonData.frames).map(([filename, data]) => ({ filename, ...data }));

      setAtlasUrl(imgRes.file_url);
      setFrames(framesData);
      localStorage.setItem("weapon_atlas", JSON.stringify({ url: imgRes.file_url, framesData }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const assignFrame = (frameIndex, slotId) => {
    const key = `atlas_frame::${atlasUrl}::${frameIndex}`;
    const newAssignments = { ...assignments, [slotId]: key };
    setAssignments(newAssignments);
    onUpdateSetting(slotId, key);
  };

  const getAssignedSlot = (frameIndex) => {
    const key = `atlas_frame::${atlasUrl}::${frameIndex}`;
    return WEAPON_SLOTS.find(s => assignments[s.id] === key)?.id || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label>
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span className="gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Spritesheet + JSON"}
            </span>
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*,.json" multiple onChange={handleUpload} className="hidden" />
        </label>
        {atlasUrl && <span className="text-xs text-slate-500">{frames.length} frames loaded</span>}
      </div>

      {frames.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Assign each frame to a weapon slot:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {frames.map((frame, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                  <FrameCanvas imgSrc={atlasUrl} frame={frame} size={48} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 truncate mb-1">Frame {i + 1}</p>
                  <select
                    value={getAssignedSlot(i)}
                    onChange={e => assignFrame(i, e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-1 py-0.5 bg-white"
                  >
                    <option value="">— unassigned —</option>
                    {WEAPON_SLOTS.map(slot => (
                      <option key={slot.id} value={slot.id}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}