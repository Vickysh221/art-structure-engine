import type { ExtractResponse } from "../api";
import { downloadFile } from "../api";

interface ResultViewerProps {
  result: ExtractResponse;
}

export function ResultViewer({ result }: ResultViewerProps) {
  const handleDownloadAll = () => {
    downloadFile(result.note.filename, result.note.content);
    result.files.entities.forEach((entity) => {
      downloadFile(entity.filename, entity.content);
    });
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(result.note.content);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">抽取结果</h2>
        <div className="flex gap-3">
          <button
            onClick={handleCopyNote}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            复制笔记
          </button>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            下载全部
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">结构信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">风格</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.styles.map((style, i) => (
                <li key={i} className="text-sm text-gray-800">{style}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">艺术家</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.artists.map((artist, i) => (
                <li key={i} className="text-sm text-gray-800">{artist}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">时期</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.periods.map((period, i) => (
                <li key={i} className="text-sm text-gray-800">{period}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">展馆</p>
            <ul className="mt-1 space-y-1">
              {result.extraction.museums.map((museum, i) => (
                <li key={i} className="text-sm text-gray-800">{museum}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">生成的笔记</h3>
          <button
            onClick={() => downloadFile(result.note.filename, result.note.content)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            下载
          </button>
        </div>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
          {result.note.content}
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">生成的实体文件</h3>
        {result.files.entities.map((entity, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-gray-600 mr-2">{entity.type}</span>
                <span className="text-sm text-gray-800">{entity.filename}</span>
              </div>
              <button
                onClick={() => downloadFile(entity.filename, entity.content)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                下载
              </button>
            </div>
            <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-48 whitespace-pre-wrap">
              {entity.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
