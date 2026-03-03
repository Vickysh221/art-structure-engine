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

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07080B]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl text-white">Art Structure Engine</h1>
          <p className="text-sm text-white/60 mt-1">将艺术文本转换为 Obsidian 笔记结构</p>
        </header>

        {error && (
          <div className="mb-5 p-4 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-white/80">{error}</p>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          {!result ? (
            <TextInput onSubmit={handleSubmit} loading={loading} />
          ) : (
            <ResultViewer result={result} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
