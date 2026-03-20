import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AnimationPreview from "./AnimationPreview";

export default function SettingImageUpload({ label, value, onChange, currentDefault }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

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
        onChange(uploadedUrls[imageFile.name]);
        
        // Store JSON URL for animation loading
        if (jsonFile && uploadedUrls[jsonFile.name]) {
          sessionStorage.setItem(`aseprite_json_${uploadedUrls[imageFile.name]}`, uploadedUrls[jsonFile.name]);
        }
      }
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