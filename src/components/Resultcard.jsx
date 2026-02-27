
export default function ResultCard({ result, foodName }) {
  if (!result) {
    return (
      <div className="mt-6 p-6 bg-white shadow-lg rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-3">Nutrition Analysis</h2>
        <p>No nutrition info found{foodName ? ` for "${foodName}"` : ""}.</p>
      </div>
    );
  }

  let rating = "Healthy";
  if (result.calories > 600) rating = "High Calorie";
  else if (result.calories > 400) rating = "Moderate";

  return (
    <div className="mt-6 p-6 bg-white shadow-lg rounded-xl w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">Nutrition Analysis</h2>
      {result.name && <h3 className="text-lg font-semibold mb-2">{result.name}</h3>}
      <p><strong>Calories:</strong> {result.calories} kcal</p>
      <p><strong>Protein:</strong> {result.protein} g</p>
      <p><strong>Carbs:</strong> {result.carbs} g</p>
      <p><strong>Fat:</strong> {result.fat} g</p>
      <div className="mt-4">
        <p className="font-semibold">Health Rating: {rating}</p>
      </div>
      {result.advice && (
        <p className="mt-3 font-semibold text-green-700">{result.advice}</p>
      )}
    </div>
  );
}



