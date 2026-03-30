import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Loader2, FileArchive } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ZipAssetUpload() {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      setStatus("error");
      setMessage("Please select a .zip file.");
      return;
    }

    setStatus("loading");
    setMessage(`Uploading and extracting ${file.name}…`);
    setDetails(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Extract base64 from data URL
      const base64Data = fileData.split(',')[1];

      const res = await base44.functions.invoke("processAssetZip", {
        filename: file.name,
        fileData: base64Data
      });
      const data = res.data;

      if (!data.success) throw new Error(data.error || "Processing failed");

      setStatus("success");
      setMessage(`Uploaded ${data.uploaded_count} file(s) to Drive folder "${data.folder}"`);
      setDetails({ uploaded: data.uploaded, errors: data.errors });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setMessage("Failed: " + err.message);
    }
  };

  return (
    <div className="space-y-3 p-4 border-2 border-dashed border-violet-300 rounded-lg bg-violet-50">
      <div className="flex items-center gap-3">
        <FileArchive className="w-5 h-5 text-violet-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">Upload Asset ZIP → Google Drive</p>
          <p className="text-xs text-slate-500">
            ZIP is extracted and all files are uploaded directly into your watched Drive folder, preserving subfolder structure.
          </p>
        </div>
        <label>
          <Button
            type="button"
            size="sm"
            disabled={status === "loading"}
            className="bg-violet-600 hover:bg-violet-700 text-white border-0 gap-2 cursor-pointer"
            asChild
          >
            <span>
              {status === "loading" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <><Upload className="w-4 h-4" /> Choose ZIP</>
              )}
            </span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {message && (
        <div className={`flex items-start gap-2 text-xs rounded-lg p-2 ${
          status === "success" ? "bg-green-50 text-green-700" :
          status === "error" ? "bg-red-50 text-red-700" :
          "bg-slate-50 text-slate-600"
        }`}>
          {status === "success" && <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
          {status === "error" && <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
          {status === "loading" && <Loader2 className="w-3.5 h-3.5 mt-0.5 animate-spin flex-shrink-0" />}
          <div className="space-y-1">
            <p>{message}</p>
            {details?.uploaded?.length > 0 && (
              <p className="text-green-600 font-mono text-[10px]">
                {details.uploaded.map(f => f.name).join(", ")}
              </p>
            )}
            {details?.errors?.length > 0 && (
              <p className="text-red-500">Errors: {details.errors.map(e => e.file).join(", ")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}