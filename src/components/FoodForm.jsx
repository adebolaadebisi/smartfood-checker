// import { useState } from "react";
// import { calculateNutrition } from "../utils/calculateNutrition";

// export default function FoodForm({ setResult }) {
//   const [food, setFood] = useState("");

//   const analyzeFood = () => {
//     if (!food) return;
//     const nutrition = calculateNutrition(food);
//     setResult(nutrition);
//   };

//   return (
//     <div className="w-full max-w-md">
//       <input
//         type="text"
//         placeholder="Enter food (e.g., rice chicken)"
//         className="w-full p-3 border rounded-lg mb-3"
//         value={food}
//         onChange={(e) => setFood(e.target.value)}
//       />
//       <button
//         onClick={analyzeFood}
//         className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
//       >
//         Analyze Food
//       </button>
//     </div>
//   );
// }

import { useState } from "react";
import { calculateNutrition } from "../utils/calculateNutrition";

export default function FoodForm({ setResult }) {
  const [food, setFood] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeFood = () => {
    if (!food) return;
    setLoading(true);

    setTimeout(() => {
      const nutrition = calculateNutrition(food);
      setResult(nutrition, food);
      setLoading(false);
    }, 500);
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