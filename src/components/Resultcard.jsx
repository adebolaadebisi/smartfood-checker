// src/components/ResultCard.jsx
// export default function ResultCard({ result }) {
//   let rating = "Healthy";
//   if (result.calories > 600) rating = "High Calorie";
//   else if (result.calories > 400) rating = "Moderate";

//   return (
//     <div className="mt-6 p-6 bg-white shadow-lg rounded-xl w-full max-w-md">
//       <h2 className="text-xl font-bold mb-3">Nutrition Analysis</h2>
//       <p><strong>Calories:</strong> {result.calories} kcal</p>
//       <p><strong>Protein:</strong> {result.protein} g</p>
//       <p><strong>Carbs:</strong> {result.carbs} g</p>
//       <p><strong>Fat:</strong> {result.fat} g</p>
//       <div className="mt-4">
//         <p className="font-semibold">Health Rating: {rating}</p>
//       </div>
//     </div>
//   );
// }
export default function ResultCard({ recipe }) {
  return (
    <div className="mt-6 p-6 bg-white shadow-xl rounded-2xl w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">
        Nutrition Info
      </h2>

      {recipe.name && <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>}

      {/* Use placeholders for now */}
      <p className="mb-1">Calories: 200 kcal</p>
      <p className="mb-1">Protein: 10 g</p>
      <p className="mb-1">Carbs: 30 g</p>
      <p className="mb-1">Fat: 5 g</p>

      <p className="mt-3 font-semibold text-green-700">This food is healthy and balanced.</p>
    </div>
  );
}