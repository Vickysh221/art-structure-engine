import { useState } from "react";

interface TextInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

export function TextInput({ onSubmit, loading }: TextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text-input" className="block text-xl text-white mb-2">
            输入艺术相关文本
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴关于艺术作品、艺术家、风格等的文本..."
            className="w-full h-48 p-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-white/20 transition"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full py-3 px-6 bg-white text-black rounded-2xl font-medium hover:opacity-90 disabled:bg-white/5 disabled:text-white/30 disabled:border disabled:border-white/10 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在分析文本（可能需要10-30秒）...
            </span>
          ) : (
            "提交抽取"
          )}
        </button>
      </form>
      {loading && (
        <div className="text-center text-sm text-white/60">
          <p>💡 提示：长文本分析需要更长时间，请耐心等待</p>
        </div>
      )}
    </div>
  );
}
