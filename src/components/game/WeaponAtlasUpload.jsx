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

  // Projection / histogram method — finds empty rows & columns to cut between sprites
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

    // Build row and column opacity counts
    const rowCount = new Int32Array(height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > ALPHA) rowCount[y]++;
      }
    }

    // Find horizontal bands (groups of non-empty rows)
    const rowBands = [];
    let inBand = false, bandStart = 0;
    for (let y = 0; y <= height; y++) {
      const empty = y === height || rowCount[y] === 0;
      if (!inBand && !empty) { inBand = true; bandStart = y; }
      else if (inBand && empty) { inBand = false; rowBands.push([bandStart, y - 1]); }
    }

    // For each band, find column groups within that band
    const detected = [];
    for (const [y0, y1] of rowBands) {
      const bandColCount = new Int32Array(width);
      for (let y = y0; y <= y1; y++) {
        for (let x = 0; x < width; x++) {
          if (data[(y * width + x) * 4 + 3] > ALPHA) bandColCount[x]++;
        }
      }

      let inCol = false, colStart = 0;
      for (let x = 0; x <= width; x++) {
        const empty = x === width || bandColCount[x] === 0;
        if (!inCol && !empty) { inCol = true; colStart = x; }
        else if (inCol && empty) {
          inCol = false;
          const fw = x - colStart;
          const fh = y1 - y0 + 1;
          if (fw > 3 && fh > 3) {
            detected.push({ frame: { x: colStart, y: y0, w: fw, h: fh } });
          }
        }
      }
    }

    if (!detected.length) {
      alert("No sprites detected. The image may have no transparent gaps — try Grid Slice instead.");
      return;
    }

    setFrames(detected);
    setAssignments({});
    WEAPON_SLOTS.forEach(slot => onUpdateSetting(slot.id, null));
    localStorage.setItem("weapon_atlas", JSON.stringify({ url: atlasUrl, framesData: detected, imageSize: rawImageSize }));
  };

  // Given pixel data and a seed bounding box, expand it to tightly fit all connected non-transparent pixels
  const expandBox = (data, width, height, seed, alpha = 10) => {
    let { x, y, w, h } = seed;
    x = Math.max(0, Math.min(x, width - 1));
    y = Math.max(0, Math.min(y, height - 1));
    w = Math.min(w, width - x);
    h = Math.min(h, height - y);
    
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      iterations++;
      changed = false;
      // Expand each edge outward if there's any non-transparent pixel just outside
      if (y > 0) {
        for (let i = Math.max(0, x); i < Math.min(width, x + w); i++) {
          const idx = ((y - 1) * width + i) * 4 + 3;
          if (idx >= 0 && idx < data.length && data[idx] > alpha) {
            y--; h++; changed = true; break;
          }
        }
      }
      if (y + h < height) {
        for (let i = Math.max(0, x); i < Math.min(width, x + w); i++) {
          const idx = ((y + h) * width + i) * 4 + 3;
          if (idx >= 0 && idx < data.length && data[idx] > alpha) {
            h++; changed = true; break;
          }
        }
      }
      if (x > 0) {
        for (let i = Math.max(0, y); i < Math.min(height, y + h); i++) {
          const idx = (i * width + (x - 1)) * 4 + 3;
          if (idx >= 0 && idx < data.length && data[idx] > alpha) {
            x--; w++; changed = true; break;
          }
        }
      }
      if (x + w < width) {
        for (let i = Math.max(0, y); i < Math.min(height, y + h); i++) {
          const idx = (i * width + (x + w)) * 4 + 3;
          if (idx >= 0 && idx < data.length && data[idx] > alpha) {
            w++; changed = true; break;
          }
        }
      }
    }
    return { x: Math.max(0, x), y: Math.max(0, y), w: Math.min(Math.max(4, w), width - x), h: Math.min(Math.max(4, h), height - y) };
  };

  const aiDetect = async () => {
    if (!atlasUrl || !rawImageSize) return;
    setAiDetecting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing a ${rawImageSize.w}x${rawImageSize.h}px pixel art weapon spritesheet. It contains multiple weapon sprites (swords, axes, bows, wands, staffs, etc.) arranged in rows/columns with transparent gaps between them.

For EVERY visible weapon, output its bounding box as {x, y, w, h}.
- x, y = top-left corner (0-indexed)
- w, h = pixel width and height of the sprite
- Sort results: top-to-bottom, left-to-right
- Be precise: one box per weapon
- If you see a grid, count the rows and columns carefully and output every cell

Return only: {"frames": [{...}, {...}, ...]}`,
        file_urls: [atlasUrl],
        response_json_schema: {
          type: "object",
          properties: {
            frames: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                  w: { type: "number" },
                  h: { type: "number" }
                }
              }
            }
          }
        },
        model: "gpt_5"
      });

      // Extract frames from result (handle various response structures)
      let rawFrames = [];
      if (result?.frames) rawFrames = result.frames;
      else if (result?.data?.frames) rawFrames = result.data.frames;
      else if (Array.isArray(result)) rawFrames = result;
      else if (typeof result === 'object') rawFrames = Object.values(result).find(v => Array.isArray(v)) || [];

      if (!rawFrames || rawFrames.length === 0) {
        // Try backend detection as fallback
        try {
          const backendResult = await base44.functions.invoke('detectWeaponFramesV2', {
            imageUrl: atlasUrl,
            imageWidth: rawImageSize.w,
            imageHeight: rawImageSize.h
          });
          rawFrames = backendResult.data?.frames || [];
          if (!rawFrames.length) {
            alert("AI couldn't detect any frames. Try Smart Detect or Grid Slice instead.");
            return;
          }
        } catch (e) {
          alert("AI couldn't detect any frames. Try Smart Detect or Grid Slice instead.");
          return;
        }
      }

      // Expand bounding boxes to tight pixel bounds
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = atlasUrl;
      await new Promise(res => { img.onload = res; img.onerror = res; });
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext("2d");
      ctx.drawImage(img, 0, 0);
      let pixelData;
      try {
        pixelData = ctx.getImageData(0, 0, offscreen.width, offscreen.height).data;
      } catch (e) {
        pixelData = null;
      }

      const detected = rawFrames.map(f => {
        const seed = {
          x: Math.max(0, Math.round(f.x || 0)),
          y: Math.max(0, Math.round(f.y || 0)),
          w: Math.max(4, Math.round(f.w || f.width || 32)),
          h: Math.max(4, Math.round(f.h || f.height || 32))
        };
        const tight = pixelData ? expandBox(pixelData, offscreen.width, offscreen.height, seed) : seed;
        return { frame: tight };
      }).filter(d => d.frame.w > 3 && d.frame.h > 3);

      console.log(`AI Detect: Extracted ${rawFrames.length} raw frames, after validation: ${detected.length} frames`);

      if (detected.length === 0) {
        alert("No valid frames after processing. Try Smart Detect or Grid Slice instead.");
        return;
      }

      console.log("AI Detect: Setting frames", detected);
      setFrames(detected);
      setAssignments({});
      WEAPON_SLOTS.forEach(slot => onUpdateSetting(slot.id, null));
      localStorage.setItem("weapon_atlas", JSON.stringify({ url: atlasUrl, framesData: detected, imageSize: rawImageSize }));
      console.log("AI Detect: Complete - frames displayed");
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

        {atlasUrl && <span className={`text-xs ${frames.length > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>{frames.length} frames • {rawImageSize?.w}×{rawImageSize?.h}px</span>}
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