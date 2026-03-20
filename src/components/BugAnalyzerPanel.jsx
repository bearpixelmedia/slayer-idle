import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SEVERITY_COLORS = {
  critical: "bg-red-500/20 border-red-500/50 text-red-400",
  high: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  low: "bg-blue-500/20 border-blue-500/50 text-blue-400",
};

const SEVERITY_ICONS = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵",
};

function BugCard({ bug }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${SEVERITY_COLORS[bug.severity] || SEVERITY_COLORS.low}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{SEVERITY_ICONS[bug.severity]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[9px] font-bold">Line {bug.line}</span>
            <span className="font-pixel text-[7px] uppercase opacity-70">{bug.severity}</span>
          </div>
          <p className="text-sm font-semibold mb-2">{bug.issue}</p>
          <p className="text-[12px] mb-3 opacity-90">{bug.suggestion}</p>
          {bug.fixedCode && (
            <div className="bg-black/30 rounded p-2 text-[11px] font-mono overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">{bug.fixedCode}</pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BugAnalyzerPanel() {
  const [filePath, setFilePath] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!filePath.trim() || !fileContent.trim()) {
      setError("Both file path and content are required");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await base44.functions.invoke('analyzeCodeForBugs', {
        filePath,
        fileContent,
      });
      setAnalysis(response.data);
    } catch (err) {
      setError(err.message || "Failed to analyze code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-pixel text-primary mb-2">🐛 Bug Analyzer</h1>
        <p className="text-muted-foreground">Scan code files for potential bugs and vulnerabilities</p>
      </div>

      {/* Input section */}
      <div className="space-y-4 bg-card/60 border border-border/50 rounded-lg p-4">
        <div>
          <label className="block text-sm font-semibold mb-2">File Path</label>
          <input
            type="text"
            placeholder="e.g., src/components/MyComponent.jsx"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Code Content</label>
          <textarea
            placeholder="Paste your code here..."
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="w-full h-64 px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none font-mono text-[12px]"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Analyze Code
            </>
          )}
        </Button>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results display */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className={`p-4 rounded-lg border ${
              analysis.riskLevel === 'critical' ? 'bg-red-500/10 border-red-500/30' :
              analysis.riskLevel === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
              analysis.riskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {analysis.riskLevel === 'critical' || analysis.riskLevel === 'high' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                )}
                <div>
                  <h3 className="font-pixel text-sm font-bold mb-1">
                    Risk Level: {analysis.riskLevel?.toUpperCase()}
                  </h3>
                  <p className="text-[12px]">{analysis.summary}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Found {analysis.bugs?.length || 0} potential issues
                  </p>
                </div>
              </div>
            </div>

            {/* Bugs list */}
            {Array.isArray(analysis.bugs) && analysis.bugs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-pixel text-sm font-bold">Issues Found</h3>
                {analysis.bugs.map((bug, idx) => (
                  <BugCard key={idx} bug={bug} />
                ))}
              </div>
            )}

            {Array.isArray(analysis.bugs) && analysis.bugs.length === 0 && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">No bugs found! Code looks clean.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}