import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SettingImageUpload({ label, value, onChange, currentDefault }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      onChange(response.file_url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
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
        const basePath = value.substring(0, value.lastIndexOf('.'));
        const jsonUrl = `${basePath}.json`;
        const response = await fetch(jsonUrl);
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
          setCurrentFrame(0);
        }
      } catch (err) {
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
              animationData ? (
                <canvas
                  ref={(canvas) => {
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    const frames = animationData.frames;
                    const frameKey = Array.isArray(frames) ? currentFrame : Object.keys(frames)[currentFrame];
                    const frame = frames[frameKey];

                    if (frame) {
                      canvas.width = 48;
                      canvas.height = 48;
                      const img = new Image();
                      img.src = value;
                      img.onload = () => {
                        ctx.clearRect(0, 0, 48, 48);
                        ctx.drawImage(
                          img,
                          frame.frame.x, frame.frame.y,
                          frame.frame.w, frame.frame.h,
                          0, 0,
                          frame.frame.w, frame.frame.h
                        );
                      };
                    }
                  }}
                  className="w-full h-full"
                />
              ) : (
                <img src={value} alt="preview" className="w-full h-full object-cover" />
              )
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
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

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