import React, { useState } from 'react';
import { MatikaData } from '../types/matika';
import exactTableJson from '../../public/duka_matika_full.json';
import { Copy, Check, Download, Upload, RotateCcw, AlertTriangle, Code2 } from 'lucide-react';

interface JsonViewerProps {
  data: MatikaData;
  onUpdateData: (newData: MatikaData) => void;
  onResetData: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, onUpdateData, onResetData }) => {
  const [activeFormat, setActiveFormat] = useState<'exact_table' | 'hierarchical'>('exact_table');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeContentString = activeFormat === 'exact_table' 
    ? JSON.stringify(exactTableJson, null, 2)
    : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFormat === 'exact_table' ? JSON.stringify(exactTableJson, null, 2) : jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = activeFormat === 'exact_table' ? JSON.stringify(exactTableJson, null, 2) : JSON.stringify(data, null, 2);
    const fileName = activeFormat === 'exact_table' ? 'duka_matika_table.json' : 'duka_matika_full.json';
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.gocchakas || !Array.isArray(parsed.gocchakas)) {
        throw new Error('Invalid JSON format: must contain a "gocchakas" array.');
      }
      onUpdateData(parsed);
      setErrorMessage(null);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Malformed JSON');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.gocchakas || !Array.isArray(parsed.gocchakas)) {
          throw new Error('Uploaded JSON must contain a "gocchakas" array.');
        }
        setJsonText(content);
        onUpdateData(parsed);
        setErrorMessage(null);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse uploaded JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-4">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-800" />
            <h2 className="text-lg font-bold font-serif text-slate-900 tracking-tight">
              Mātikā JSON Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            This application renders dynamically from this JSON file. You can inspect, copy, edit, or upload your own.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setJsonText(JSON.stringify(data, null, 2));
                setIsEditing(true);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
            >
              Edit JSON
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyJson}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Save & Apply
              </button>
            </div>
          )}

          <label className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => {
              onResetData();
              setJsonText(JSON.stringify(data, null, 2));
              setIsEditing(false);
              setErrorMessage(null);
            }}
            title="Reset to default Hetu Gocchaka dataset"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md border border-slate-200 bg-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Format Selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg w-fit text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveFormat('exact_table');
            setIsEditing(false);
          }}
          className={`px-3 py-1.5 font-medium rounded-md transition-all cursor-pointer ${
            activeFormat === 'exact_table'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Exact Table Format (Duka / Pada / Dabbattha)
        </button>
        <button
          type="button"
          onClick={() => setActiveFormat('hierarchical')}
          className={`px-3 py-1.5 font-medium rounded-md transition-all cursor-pointer ${
            activeFormat === 'hierarchical'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Full Study Model (Hierarchical & Analysis)
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>Error:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* JSON Display / Editor */}
      <div className="bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
          <span>{activeFormat === 'exact_table' ? 'public/duka_matika_full.json' : 'src/data/duka_matika.json'}</span>
          <span>{activeFormat === 'exact_table' ? '15 Table Rows' : `${data.gocchakas.length} Gocchaka(s) loaded`}</span>
        </div>

        {isEditing && activeFormat === 'hierarchical' ? (
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-[500px] p-4 font-mono text-xs text-emerald-300 bg-slate-950 border-none outline-hidden resize-y leading-relaxed"
            spellCheck={false}
          />
        ) : (
          <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[550px] leading-relaxed select-all">
            <code>{activeContentString}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
