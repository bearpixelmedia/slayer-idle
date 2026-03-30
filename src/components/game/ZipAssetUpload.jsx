import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Loader2, FileArchive } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ZipAssetUpload() {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState(null);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      setStatus("error");
      setMessage("Please select a .zip file.");
      return;
    }

    setStatus("loading");
    setMessage(`Processing ${file.name}…`);
    setDetails(null);
    setSteps([]);
    setProgress(0);

    try {
      // Step 1: Convert file to base64
      setSteps(s => [...s, { name: "Reading ZIP file", status: "in-progress" }]);
      setProgress(20);
      
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = fileData.split(',')[1];
      setSteps(s => s.map((step, i) => i === s.length - 1 ? { ...step, status: "done" } : step));
      setProgress(40);

      // Step 2: Send to backend
      setSteps(s => [...s, { name: "Unzipping & uploading to Drive", status: "in-progress" }]);
      setProgress(50);

      const res = await base44.functions.invoke("processAssetZip", {
        filename: file.name,
        fileData: base64Data
      });
      const data = res.data;

      if (!data.success) throw new Error(data.error || "Processing failed");

      setSteps(s => s.map((step, i) => i === s.length - 1 ? { ...step, status: "done" } : step));
      setProgress(100);
      
      setStatus("success");
      setMessage(`✓ Uploaded ${data.uploaded_count} file(s) to "${data.folder}"`);
      setDetails({ uploaded: data.uploaded, errors: data.errors });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setSteps(s => s.map((step, i) => i === s.length - 1 ? { ...step, status: "error" } : step));
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
        <div className={`space-y-2 rounded-lg p-3 ${
          status === "success" ? "bg-green-50 text-green-700" :
          status === "error" ? "bg-red-50 text-red-700" :
          "bg-slate-50 text-slate-600"
        }`}>
          <div className="flex items-start gap-2 text-xs">
            {status === "success" && <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
            {status === "error" && <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
            {status === "loading" && <Loader2 className="w-3.5 h-3.5 mt-0.5 animate-spin flex-shrink-0" />}
            <div className="flex-1">
              <p className="font-medium">{message}</p>
            </div>
          </div>

          {/* Progress bar */}
          {status === "loading" && (
            <div className="space-y-2">
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-violet-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Steps */}
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    {step.status === "done" && <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />}
                    {step.status === "in-progress" && <Loader2 className="w-3 h-3 animate-spin text-violet-500 flex-shrink-0" />}
                    {step.status === "error" && <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />}
                    <span className="text-slate-600">{step.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {details && (
            <div className="space-y-1 text-[10px]">
              {details.uploaded?.length > 0 && (
                <div className="max-h-20 overflow-y-auto">
                  <p className="font-semibold mb-1">Uploaded files:</p>
                  {details.uploaded.map((f, i) => (
                    <p key={i} className="text-slate-700 truncate ml-4">• {f.name}</p>
                  ))}
                </div>
              )}
              {details.errors?.length > 0 && (
                <div className="max-h-20 overflow-y-auto">
                  <p className="font-semibold text-red-600 mb-1">Errors:</p>
                  {details.errors.map((e, i) => (
                    <p key={i} className="text-red-600 truncate ml-4">• {e.file}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}