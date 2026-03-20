import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AnimationPreview from "./AnimationPreview";

const HISTORY_KEY = "image_upload_history";

export default function SettingImageUpload({ label, value, onChange, currentDefault }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const addToHistory = (imageUrl, jsonUrl = null) => {
    setHistory(prev => {
      const updated = [
        { imageUrl, jsonUrl, timestamp: Date.now() },
        ...prev.filter(h => h.imageUrl !== imageUrl)
      ].slice(0, 20); // Keep last 20
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = {};

      // Upload files
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls[file.name] = response.file_url;
      }
      
      // Find the image file (spritesheet) and JSON
      const imageFile = Array.from(files).find(f => /\.(png|jpg|jpeg|gif)$/i.test(f.name));
      const jsonFile = Array.from(files).find(f => f.name.endsWith('.json'));
      
      if (imageFile && uploadedUrls[imageFile.name]) {
        const imageUrl = uploadedUrls[imageFile.name];
        onChange(imageUrl);
        
        // Store JSON URL for animation loading
        let jsonUrl = null;
        if (jsonFile && uploadedUrls[jsonFile.name]) {
          jsonUrl = uploadedUrls[jsonFile.name];
          sessionStorage.setItem(`aseprite_json_${imageUrl}`, jsonUrl);
        }
        
        addToHistory(imageUrl, jsonUrl);
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromHistory = (item) => {
    onChange(item.imageUrl);
    if (item.jsonUrl) {
      sessionStorage.setItem(`aseprite_json_${item.imageUrl}`, item.jsonUrl);
    }
    setShowHistory(false);
  };

  const handleClear = () => {
    onChange(null);
    setAnimationData(null);
    setCurrentFrame(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Load and parse Aseprite JSON metadata
  useEffect(() => {
    if (!value) return;

    const loadAsepriteData = async () => {
      try {
        const jsonUrl = sessionStorage.getItem(`aseprite_json_${value}`);
        if (jsonUrl) {
          const response = await fetch(jsonUrl);
          if (response.ok) {
            const data = await response.json();
            setAnimationData(data);
            setCurrentFrame(0);
            return;
          }
        }
        setAnimationData(null);
      } catch (err) {
        console.error('Failed to load animation data:', err);
        setAnimationData(null);
      }
    };

    loadAsepriteData();
  }, [value]);

  // Animation loop
  useEffect(() => {
    if (!animationData) return;

    const frames = animationData.frames;
    const frameCount = Array.isArray(frames) ? frames.length : Object.keys(frames).length;
    
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, animationData.meta?.frameTags?.[0]?.duration || 100);

    return () => clearInterval(interval);
  }, [animationData]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        {/* Preview */}
        <div className="w-12 h-12 rounded-lg border border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden">
          {value ? (
            <AnimationPreview 
              spriteUrl={value} 
              animationData={animationData} 
              currentFrame={currentFrame}
              defaultEmoji={currentDefault}
            />
          ) : (
            <span className="text-lg">{currentDefault}</span>
          )}
        </div>

        {/* Upload button */}
        <label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span className="gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload"}
            </span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.json,.aseprite"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {/* History button */}
        {history.length > 0 && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <History className="w-4 h-4" />
            </Button>

            {/* History dropdown */}
            {showHistory && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto min-w-[120px]">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectFromHistory(item)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs border-b border-slate-100 last:border-b-0 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate">
                      {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clear button */}
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}