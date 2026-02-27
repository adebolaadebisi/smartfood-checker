

import { useState } from "react";


export default function FoodForm({ setResult }) {
  const [food, setFood] = useState("");
  const [loading, setLoading] = useState(false);


  const analyzeFood = async () => {
    if (!food) return;
    setLoading(true);
    try {
      // Call backend API for the food (trim and encode)
      const response = await fetch(`http://localhost:8000/api/food/${encodeURIComponent(food.trim())}`);
      if (!response.ok) {
        setResult(null, food);
      } else {
        const nutrition = await response.json();
        setResult(nutrition, food);
      }
    } catch {
      setResult(null, food);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder="Enter food (e.g., rice, chicken)"
        className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
        value={food}
        onChange={(e) => setFood(e.target.value)}
      />

      <button
        onClick={analyzeFood}
        className={`w-full p-3 rounded-lg text-white transition-all duration-200 ${
          loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Food"}
      </button>
    </div>
  );
}
