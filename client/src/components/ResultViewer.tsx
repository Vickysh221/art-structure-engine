import type { ExtractResponse } from "../api";
import { downloadFile, getRelationshipLabel, exportToObsidian } from "../api";
import { useState } from "react";

interface ResultViewerProps {
  result: ExtractResponse;
  originalText: string;
  onReset: () => void;
}

export function ResultViewer({ result, originalText, onReset }: ResultViewerProps) {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const VAULT_PATH = "/Users/vickyshou/Documents/Art Thinking Vault";

  const handleImportToObsidian = async () => {
    setImporting(true);
    setImportStatus(null);
    try {
      const response = await exportToObsidian(
        originalText,
        VAULT_PATH
      );
      setImportStatus(
        `✅ 成功导入！\n笔记: ${response.exported.notePath}\n实体文件: ${response.exported.entities.length} 个`
      );
    } catch (error) {
      setImportStatus(
        `❌ 导入失败: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadAll = () => {
    downloadFile(result.files.note.filename, result.files.note.content);
    result.files.entities.forEach((entity) => {
      downloadFile(entity.filename, entity.content);
    });
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(result.files.note.content);
  };

  const getRelationshipTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      direct: "bg-white/10 border border-white/10",
      indirect: "bg-white/5 border border-white/10",
      "many-to-many": "bg-white/10 border border-white/10",
    };
    return colors[type] || "bg-white/5 border border-white/10";
  };

  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl text-white">抽取结果</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopyNote}
            className="px-4 py-2 border border-white/10 bg-white/5 text-white/80 rounded-2xl hover:bg-white/10 transition text-sm"
          >
            复制笔记
          </button>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 border border-white/10 bg-white/5 text-white/80 rounded-2xl hover:bg-white/10 transition text-sm"
          >
            下载全部
          </button>
          <button
            onClick={handleImportToObsidian}
            disabled={importing}
            className="px-4 py-2 bg-white text-black rounded-2xl font-medium hover:opacity-90 disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed transition text-sm"
          >
            {importing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                导入中...
              </span>
            ) : (
              "导入到 Obsidian"
            )}
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`mb-5 p-4 rounded-2xl border ${importStatus.includes("✅") ? "border-white/10 bg-white/5" : "border-red-500/20 bg-red-500/5"}`}>
          <pre className="text-sm whitespace-pre-wrap text-white/80">{importStatus}</pre>
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <h3 className="text-lg text-white">结构信息</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-white/60">风格</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.styles.map((style, i) => (
                <li key={i} className="text-sm text-white/80">{style}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-white/60">艺术家</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.artists.map((artist, i) => (
                <li key={i} className="text-sm text-white/80">{artist}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-white/60">时期</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.periods.map((period, i) => (
                <li key={i} className="text-sm text-white/80">{period}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-white/60">展馆</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.museums.map((museum, i) => (
                <li key={i} className="text-sm text-white/80">{museum}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {result.extraction.relationships.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h3 className="text-lg text-white">实体关系</h3>
          <div className="space-y-2">
            {result.extraction.relationships.map((rel, i) => (
              <div key={i} className={`p-3 rounded-xl ${getRelationshipTypeColor(rel.type)}`}>
                <div className="flex items-start gap-2">
                  <span className="px-2.5 py-1 text-xs bg-white/10 rounded-full text-white/70 border border-white/10">
                    {getRelationshipLabel(rel.type)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">
                      <span className="text-white">{rel.from.name}</span>
                      <span className="mx-2 text-white/40">→</span>
                      <span className="text-white">{rel.to.name}</span>
                    </p>
                    {rel.description && (
                      <p className="text-xs text-white/50 mt-1">{rel.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg text-white">生成的笔记</h3>
          <button
            onClick={() => downloadFile(result.files.note.filename, result.files.note.content)}
            className="text-sm text-white/60 hover:text-white/80 transition"
          >
            下载
          </button>
        </div>
        <pre className="bg-black/20 p-3 rounded-xl text-sm overflow-auto max-h-96 whitespace-pre-wrap text-white/75">
          {result.files.note.content}
        </pre>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg text-white">生成的实体文件</h3>
        {result.files.entities.map((entity, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-white/60 mr-2">{entity.type}</span>
                <span className="text-sm text-white/80">{entity.filename}</span>
              </div>
              <button
                onClick={() => downloadFile(entity.filename, entity.content)}
                className="text-sm text-white/60 hover:text-white/80 transition"
              >
                下载
              </button>
            </div>
            <pre className="bg-black/20 p-3 rounded-xl text-xs overflow-auto max-h-48 whitespace-pre-wrap text-white/75">
              {entity.content}
            </pre>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 transition hover:bg-white/10"
        >
          返回输入
        </button>
      </div>
    </div>
  );
}
