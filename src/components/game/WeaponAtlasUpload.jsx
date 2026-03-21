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
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(2);
  const [rawImageSize, setRawImageSize] = useState(null);
  const [aiDetecting, setAiDetecting] = useState(false);

  // Load existing atlas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("weapon_atlas");
    if (saved) {
      const { url, framesData, imageSize } = JSON.parse(saved);
      setAtlasUrl(url);
      setFrames(framesData);
      if (imageSize) setRawImageSize(imageSize);
    }
    const initAssignments = {};
    WEAPON_SLOTS.forEach(slot => {
      if (settings[slot.id]) initAssignments[slot.id] = settings[slot.id];
    });
    setAssignments(initAssignments);
  }, []);

  const sliceGrid = (url, imgW, imgH, c, r) => {
    const fw = Math.floor(imgW / c);
    const fh = Math.floor(imgH / r);
    const sliced = [];
    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        sliced.push({ frame: { x: col * fw, y: row * fh, w: fw, h: fh } });
      }
    }
    return sliced;
  };

  const applyGrid = () => {
    if (!rawImageSize) return;
    const sliced = sliceGrid(atlasUrl, rawImageSize.w, rawImageSize.h, cols, rows);
    setFrames(sliced);
    localStorage.setItem("weapon_atlas", JSON.stringify({ url: atlasUrl, framesData: sliced, imageSize: rawImageSize }));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const imgFile = files.find(f => /\.(png|jpg|jpeg)$/i.test(f.name));
    if (!imgFile) { alert("Please include a PNG image file."); return; }

    setUploading(true);
    try {
      const imgRes = await base44.integrations.Core.UploadFile({ file: imgFile });
      const url = imgRes.file_url;

      // Get image dimensions
      const img = new Image();
      img.src = url;
      await new Promise(res => { img.onload = res; });
      const imageSize = { w: img.naturalWidth, h: img.naturalHeight };
      setRawImageSize(imageSize);
      setAtlasUrl(url);

      // Clear old assignments
      const cleared = {};
      setAssignments(cleared);
      WEAPON_SLOTS.forEach(slot => onUpdateSetting(slot.id, null));

      // Auto-slice with current grid settings
      const sliced = sliceGrid(url, imageSize.w, imageSize.h, cols, rows);
      setFrames(sliced);
      localStorage.setItem("weapon_atlas", JSON.stringify({ url, framesData: sliced, imageSize }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const smartSlice = async () => {
    if (!atlasUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = atlasUrl;
    await new Promise(res => { img.onload = res; img.onerror = res; });

    const offscreen = document.createElement("canvas");
    offscreen.width = img.naturalWidth;
    offscreen.height = img.naturalHeight;
    const ctx = offscreen.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    } catch (e) {
      alert("CORS error — please re-upload the image using the Upload button.");
      return;
    }

    const { data, width, height } = imageData;
    const ALPHA = 10;
    const visited = new Uint8Array(width * height);
    const blobs = [];

    // Connected component labeling (8-connectivity, iterative DFS)
    for (let sy = 0; sy < height; sy++) {
      for (let sx = 0; sx < width; sx++) {
        const si = sy * width + sx;
        if (visited[si] || data[si * 4 + 3] <= ALPHA) continue;

        const stack = [[sx, sy]];
        visited[si] = 1;
        let x0 = sx, x1 = sx, y0 = sy, y1 = sy;

        while (stack.length) {
          const [cx, cy] = stack.pop();
          if (cx < x0) x0 = cx; if (cx > x1) x1 = cx;
          if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = cx + dx, ny = cy + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              const ni = ny * width + nx;
              if (!visited[ni] && data[ni * 4 + 3] > ALPHA) {
                visited[ni] = 1;
                stack.push([nx, ny]);
              }
            }
          }
        }

        if (x1 - x0 > 3 && y1 - y0 > 3) {
          blobs.push([x0, y0, x1, y1]);
        }
      }
    }

    // Merge blobs that are close together (same weapon with disconnected parts)
    const MARGIN = 2;
    const used = new Array(blobs.length).fill(false);
    const merged = [];

    for (let i = 0; i < blobs.length; i++) {
      if (used[i]) continue;
      let [x0, y0, x1, y1] = blobs[i];
      used[i] = true;
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < blobs.length; j++) {
          if (used[j]) continue;
          const [bx0, by0, bx1, by1] = blobs[j];
          if (bx0 <= x1 + MARGIN && bx1 >= x0 - MARGIN && by0 <= y1 + MARGIN && by1 >= y0 - MARGIN) {
            x0 = Math.min(x0, bx0); y0 = Math.min(y0, by0);
            x1 = Math.max(x1, bx1); y1 = Math.max(y1, by1);
            used[j] = true;
            changed = true;
          }
        }
      }
      merged.push({ frame: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } });
    }

    // Sort top-to-bottom, left-to-right
    const avgH = merged.reduce((s, b) => s + b.frame.h, 0) / (merged.length || 1);
    merged.sort((a, b) => {
      const ar = Math.round(a.frame.y / avgH);
      const br = Math.round(b.frame.y / avgH);
      return ar !== br ? ar - br : a.frame.x - b.frame.x;
    });

    setFrames(merged);
    setAssignments({});
    WEAPON_SLOTS.forEach(slot => onUpdateSetting(slot.id, null));
    localStorage.setItem("weapon_atlas", JSON.stringify({ url: atlasUrl, framesData: merged, imageSize: rawImageSize }));
  };

  const aiDetect = async () => {
    if (!atlasUrl || !rawImageSize) return;
    setAiDetecting(true);
    try {
      const res = await base44.functions.invoke("detectWeaponFrames", {
        imageUrl: atlasUrl,
        imageWidth: rawImageSize.w,
        imageHeight: rawImageSize.h,
      });
      const detected = (res.data.frames || []).map(f => ({ frame: f }));
      if (!detected.length) { alert("AI couldn't detect any frames. Try Smart Detect instead."); return; }
      setFrames(detected);
      setAssignments({});
      WEAPON_SLOTS.forEach(slot => onUpdateSetting(slot.id, null));
      localStorage.setItem("weapon_atlas", JSON.stringify({ url: atlasUrl, framesData: detected, imageSize: rawImageSize }));
    } catch (err) {
      alert("AI detection failed: " + err.message);
    } finally {
      setAiDetecting(false);
    }
  };

  const autoAssign = async () => {
    if (!atlasUrl || !frames.length) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = atlasUrl;
    await new Promise(res => { img.onload = res; img.onerror = res; });

    const offscreen = document.createElement("canvas");
    const ctx = offscreen.getContext("2d");
    const newAssignments = { ...assignments };
    let slotIdx = 0;

    for (let i = 0; i < frames.length; i++) {
      if (slotIdx >= WEAPON_SLOTS.length) break;
      const { x, y, w, h } = frames[i].frame;
      offscreen.width = w;
      offscreen.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      // Check if any pixel has alpha > 10
      let hasContent = false;
      for (let p = 3; p < data.length; p += 4) {
        if (data[p] > 10) { hasContent = true; break; }
      }
      if (hasContent) {
        const slot = WEAPON_SLOTS[slotIdx];
        const key = `atlas_frame::${atlasUrl}::${i}`;
        newAssignments[slot.id] = key;
        onUpdateSetting(slot.id, key);
        slotIdx++;
      }
    }
    setAssignments(newAssignments);
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
      <div className="flex flex-wrap items-center gap-3">
        <label>
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span className="gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Spritesheet"}
            </span>
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Cols:</span>
          <input type="number" min={1} max={20} value={cols} onChange={e => setCols(Number(e.target.value))}
            className="w-12 border border-slate-300 rounded px-1 py-0.5 text-xs" />
          <span>Rows:</span>
          <input type="number" min={1} max={20} value={rows} onChange={e => setRows(Number(e.target.value))}
            className="w-12 border border-slate-300 rounded px-1 py-0.5 text-xs" />
          {atlasUrl && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={applyGrid} className="text-xs h-6 px-2">
                Re-slice
              </Button>
              <Button type="button" size="sm" onClick={smartSlice} className="text-xs h-6 px-2 bg-violet-600 hover:bg-violet-700 text-white border-0">
                🔍 Smart Detect
              </Button>
              <Button type="button" size="sm" onClick={aiDetect} disabled={aiDetecting} className="text-xs h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                {aiDetecting ? "⏳ Detecting..." : "🤖 AI Detect"}
              </Button>
            </>
          )}
        </div>

        {atlasUrl && <span className="text-xs text-slate-400">{frames.length} frames • {rawImageSize?.w}×{rawImageSize?.h}px</span>}
      </div>

      {frames.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Assign each frame to a weapon slot:</p>
            <Button type="button" size="sm" variant="outline" onClick={autoAssign} className="text-xs h-6 px-2">
              ✨ Auto-Assign (skip transparent)
            </Button>
          </div>
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