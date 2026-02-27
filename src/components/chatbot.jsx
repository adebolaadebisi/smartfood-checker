import { useState } from "react";
import { apiUrl } from "../config/api";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const recommendationStyles = {
    Okay: "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Eat a little": "bg-amber-100 text-amber-800 border-amber-300",
    Limit: "bg-red-100 text-red-800 border-red-300",
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: err.message || "Chat request failed.", sources: [] },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer, sources: data.sources || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error connecting to server. Please try again.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="w-full max-w-2xl p-3 sm:p-4 bg-green-50 rounded-2xl shadow-lg flex flex-col gap-3">
      <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">Food RAG Chatbot</h2>

      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${msg.role === "user" ? "bg-green-200 self-end" : "bg-white self-start"} max-w-full sm:max-w-[90%]`}
          >
            <p className="whitespace-pre-line break-words">{msg.text}</p>
            {msg.role === "bot" && msg.sources?.length > 1 && (
              <div className="mt-2 text-sm">
                <p className="font-semibold text-green-800">Sources:</p>
                <ul className="list-disc pl-5">
                  {msg.sources.map((source, i) => (
                    <li key={`${source.name}-${i}`}>
                      {source.name} ({source.serving_size}) - {source.calories} kcal
                      {source.recommendation && (
                        <span
                          className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${recommendationStyles[source.recommendation] || "bg-slate-100 text-slate-800 border-slate-300"}`}
                        >
                          {source.recommendation}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <input
          type="text"
          placeholder="Ask a nutrition question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 rounded-lg border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
