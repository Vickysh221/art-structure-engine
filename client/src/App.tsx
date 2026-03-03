import { useState } from "react";
import { TextInput } from "./components/TextInput";
import { ResultViewer } from "./components/ResultViewer";
import { extractText, type ExtractResponse } from "./api";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await extractText(text);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Art Structure Engine</h1>
          <p className="mt-1 text-sm text-gray-600">将艺术文本转换为 Obsidian 笔记结构</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {!result ? (
          <TextInput onSubmit={handleSubmit} loading={loading} />
        ) : (
          <ResultViewer result={result} />
        )}
      </main>
    </div>
  );
}

export default App;
