import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, ChevronDown, Link, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AnimationPreview from "./AnimationPreview";

const UPLOADED_FILES_KEY = "setting_uploaded_files";

export default function SettingImageUpload({ label, value, onChange, currentDefault }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // Restore sessionStorage from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UPLOADED_FILES_KEY);
      const uploadedFiles = saved ? JSON.parse(saved) : [];
      uploadedFiles.forEach(f => {
        if (f.jsonUrl) sessionStorage.setItem(`aseprite_json_${f.url}`, f.jsonUrl);
      });
    } catch (err) { /* ignore */ }
  }, []);

  // Load files from localStorage on mount or when opening library
  useEffect(() => {
    if (!showLibrary) return;
    
    const loadFiles = () => {
      setLoadingFiles(true);
      try {
        const saved = localStorage.getItem(UPLOADED_FILES_KEY);
        const uploadedFiles = saved ? JSON.parse(saved) : [];
        // Restore sessionStorage entries for animation data
        uploadedFiles.forEach(f => {
          if (f.jsonUrl) sessionStorage.setItem(`aseprite_json_${f.url}`, f.jsonUrl);
        });
        setFiles(uploadedFiles);
      } catch (err) {
        console.error('Failed to load files:', err);
        setFiles([]);
      } finally {
        setLoadingFiles(false);
      }
    };
    
    loadFiles();
  }, [showLibrary]);

  const saveToLibrary = (fileUrl, fileName, jsonUrl) => {
    const saved = localStorage.getItem(UPLOADED_FILES_KEY);
    const list = saved ? JSON.parse(saved) : [];
    const existing = list.find(f => f.url === fileUrl);
    if (!existing) {
      const entry = { url: fileUrl, name: fileName || fileUrl, jsonUrl: jsonUrl || null };
      const updated = [entry, ...list].slice(0, 50);
      localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(updated));
      setFiles(updated);
      if (jsonUrl) sessionStorage.setItem(`aseprite_json_${fileUrl}`, jsonUrl);
    } else if (jsonUrl && !existing.jsonUrl) {
      existing.jsonUrl = jsonUrl;
      localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(list));
      setFiles([...list]);
      sessionStorage.setItem(`aseprite_json_${fileUrl}`, jsonUrl);
    }
  };

  const handleSelectFile = (fileUrl, fileName) => {
    onChange(fileUrl);
    saveToLibrary(fileUrl, fileName);
    setShowLibrary(false);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    handleSelectFile(urlInput.trim(), urlInput.trim().split('/').pop());
    setUrlInput("");
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
      
      // Check if audio file
      const audioFile = Array.from(files).find(f => /\.(mp3|wav|ogg|m4a)$/i.test(f.name));
      if (audioFile && uploadedUrls[audioFile.name]) {
        const audioUrl = uploadedUrls[audioFile.name];
        onChange(audioUrl);
        saveToLibrary(audioUrl, audioFile.name, null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      // Find the image file (spritesheet) and JSON
      const imageFile = Array.from(files).find(f => /\.(png|jpg|jpeg|gif)$/i.test(f.name));
      const jsonFile = Array.from(files).find(f => f.name.endsWith('.json'));
      
      if (imageFile && uploadedUrls[imageFile.name]) {
        const imageUrl = uploadedUrls[imageFile.name];
        onChange(imageUrl);
        
        const jsonUrl = jsonFile && uploadedUrls[jsonFile.name] ? uploadedUrls[jsonFile.name] : null;
        if (jsonUrl) sessionStorage.setItem(`aseprite_json_${imageUrl}`, jsonUrl);
        saveToLibrary(imageUrl, imageFile.name, jsonUrl);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        // Try sessionStorage first, then fall back to localStorage entries
        let jsonUrl = sessionStorage.getItem(`aseprite_json_${value}`);
        if (!jsonUrl) {
          const saved = localStorage.getItem(UPLOADED_FILES_KEY);
          const list = saved ? JSON.parse(saved) : [];
          const entry = list.find(f => f.url === value);
          if (entry?.jsonUrl) {
            jsonUrl = entry.jsonUrl;
            sessionStorage.setItem(`aseprite_json_${value}`, jsonUrl);
          }
        }
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

  const isAudioFile = value && /\.(mp3|wav|ogg|m4a)$/i.test(value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      
      {/* Audio Player */}
      {isAudioFile && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <audio 
            src={value} 
            controls 
            className="flex-1 h-8"
            style={{ minWidth: 0 }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!isAudioFile && (
        <div className="flex items-center gap-2">
          {/* Preview */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLibrary(!showLibrary)}
              className="w-12 h-12 rounded-lg border border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-colors cursor-pointer relative"
            >
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
              <div className="absolute bottom-0 right-0 bg-slate-400 text-white p-0.5 rounded-tl">
                <ChevronDown className="w-2.5 h-2.5" />
              </div>
            </button>
          
          {showLibrary && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-72">
              <div className="p-2 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {isAudioFile ? 'Audio Library' : 'Sprite Library'}
                </p>
                {/* URL paste input */}
                <div className="flex gap-1">
                  <Input
                    placeholder={isAudioFile ? "Paste audio URL..." : "Paste image URL..."}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="h-6 text-[10px]"
                    onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <button
                    type="button"
                    onClick={handleUrlSubmit}
                    className="px-2 bg-slate-100 hover:bg-slate-200 rounded text-[10px]"
                  >
                    <Link className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Grid of files */}
              <div className="p-2 max-h-56 overflow-y-auto">
                {files.length > 0 ? (
                  isAudioFile ? (
                    <div className="space-y-2">
                      {files.map((file, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectFile(file.url, file.name)}
                          className={`w-full p-2 text-left text-xs rounded-lg border transition-colors ${value === file.url ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400'}`}
                          title={file.name}
                        >
                          <div className="truncate font-medium text-slate-700">{file.name}</div>
                          <div className="text-slate-500 text-[10px]">🎵 Audio file</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      {files.map((file, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectFile(file.url, file.name)}
                          className={`relative group rounded-lg border-2 overflow-hidden bg-slate-100 aspect-square hover:border-blue-400 transition-colors ${value === file.url ? 'border-blue-500' : 'border-slate-200'}`}
                          title={file.name}
                        >
                          <img src={file.url} alt={file.name} className="w-full h-full object-contain p-0.5" />
                          {sessionStorage.getItem(`aseprite_json_${file.url}`) && (
                            <div className="absolute top-0.5 right-0.5 bg-purple-500 rounded-full w-2 h-2" title="Has animation data" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="py-6 text-xs text-slate-400 text-center">
                    No uploads yet — use the Upload button or paste a URL above
                  </div>
                )}
              </div>
            </div>
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
              accept="image/*,.json,.aseprite,.mp3,.wav,.ogg,.m4a"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {/* Clear button */}
          {value && !isAudioFile && (
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
      )}
    </div>
  );
}