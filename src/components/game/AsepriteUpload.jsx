import React, { useState } from "react";
import { Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

export default function AsepriteUpload({ label, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState({ png: null, json: null, aseprite: null });

  const handleFileChange = (e) => {
    const newFiles = { ...files };
    
    Array.from(e.target.files || []).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'png') newFiles.png = file;
      else if (ext === 'json') newFiles.json = file;
      else if (ext === 'aseprite' || ext === 'ase') newFiles.aseprite = file;
    });
    
    setFiles(newFiles);
  };

  const handleUpload = async () => {
    // Validate that at least PNG and JSON are present
    if (!files.png || !files.json) {
      setStatus({ type: 'error', message: 'PNG and JSON files are required' });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const uploadedUrls = {};

      // Upload PNG
      const pngRes = await base44.integrations.Core.UploadFile({ file: files.png });
      uploadedUrls.png = pngRes.file_url;

      // Upload JSON
      const jsonRes = await base44.integrations.Core.UploadFile({ file: files.json });
      uploadedUrls.json = jsonRes.file_url;

      // Upload Aseprite if provided
      if (files.aseprite) {
        const aseRes = await base44.integrations.Core.UploadFile({ file: files.aseprite });
        uploadedUrls.aseprite = aseRes.file_url;
      }

      onUpload(uploadedUrls);
      setStatus({ type: 'success', message: 'Files uploaded successfully!' });
      setFiles({ png: null, json: null, aseprite: null });
    } catch (err) {
      setStatus({ type: 'error', message: `Upload failed: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 border border-slate-200">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-slate-900 mb-2">{label}</h4>
          <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-slate-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Upload Aseprite Files</p>
              <p className="text-xs text-slate-500">PNG, JSON, and .aseprite files</p>
            </div>
            <input
              type="file"
              multiple
              accept=".png,.json,.aseprite,.ase"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* File list */}
        {(files.png || files.json || files.aseprite) && (
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-600">Selected Files:</p>
            {files.png && <p className="text-xs text-slate-700">✓ PNG: {files.png.name}</p>}
            {files.json && <p className="text-xs text-slate-700">✓ JSON: {files.json.name}</p>}
            {files.aseprite && <p className="text-xs text-slate-700">✓ Aseprite: {files.aseprite.name}</p>}
          </div>
        )}

        {/* Status messages */}
        {status && (
          <div className={`flex gap-2 p-3 rounded-lg text-xs ${
            status.type === 'error' 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {status.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!files.png || !files.json || uploading}
          className="w-full"
          size="sm"
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </div>
    </Card>
  );
}