import { useState } from "react";
import { calculateNutrition } from "../utils/calculateNutrition";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I’m your Food Assistant 🤖. Ask me about any food!" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input) return;

    const userMessage = { from: "user", text: input };

    // Check if input matches a known food
    const lowerInput = input.toLowerCase();
    let botText = "Sorry, I don't have info on that food yet.";

    // For demo, we use the calculateNutrition function
    const nutrition = calculateNutrition(lowerInput); 
    if (nutrition) {
      botText = `${input} has approx. ${nutrition.calories} kcal, ${nutrition.protein}g protein, ${nutrition.carbs}g carbs, ${nutrition.fat}g fat.`;

      // Optional advice based on calories
      if (nutrition.calories > 500) {
        botText += " ⚠️ That's a high-calorie food. Consider eating in moderation.";
      } else if (nutrition.protein < 5) {
        botText += " 💡 Add some protein to balance your meal.";
      } else {
        botText += " ✅ A balanced choice!";
      }
    }

    const botMessage = { from: "bot", text: botText };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-full bg-white shadow-xl rounded-xl p-4 flex flex-col">
      <h3 className="font-bold text-green-700 mb-2">Food ChatBot 🤖</h3>
      <div className="flex-1 overflow-y-auto mb-2 max-h-64 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg ${
              m.from === "bot" ? "bg-green-100 text-green-900 self-start" : "bg-gray-200 self-end"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Ask me something..."
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}