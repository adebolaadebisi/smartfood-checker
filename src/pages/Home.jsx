// import { useState } from "react";
// import FoodForm from "../components/FoodForm";
// import ResultCard from "../components/Resultcard";

// export default function Home() {
//   const [result, setResult] = useState(null);

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
//       <h1 className="text-3xl font-bold mb-6">🍎 Smart Food Nutrition Checker</h1>
      
//       <FoodForm setResult={setResult} />

//       {result && <ResultCard result={result} />}
//     </div>
//   );
// }


import { useState } from "react";
import FoodForm from "../components/FoodForm";
import ResultCard from "../components/Resultcard";

export default function Home() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSetResult = (nutrition, foodName) => {
    setResult(nutrition);
    setHistory([{ food: foodName, nutrition }, ...history]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-green-800 text-center">
        🍎 Smart Food Nutrition Checker
      </h1>

      <FoodForm setResult={handleSetResult} />

      {result && <ResultCard result={result} foodName={result.foodName} />}

      {history.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-green-700">History</h2>
          {history.map((item, idx) => (
            <ResultCard key={idx} result={item.nutrition} foodName={item.food} />
          ))}
        </div>
      )}
    </div>
  );
}