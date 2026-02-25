export function calculateNutrition(input) {
  const db = {
    rice: { calories: 200, protein: 4, carbs: 45, fat: 0.5 },
    chicken: { calories: 250, protein: 27, carbs: 0, fat: 14 },
    egg: { calories: 70, protein: 6, carbs: 1, fat: 5 },
    bread: { calories: 120, protein: 4, carbs: 22, fat: 1 },
    beans: { calories: 150, protein: 9, carbs: 27, fat: 0.5 },
    yam: { calories: 180, protein: 2, carbs: 40, fat: 0 },
    plantain: { calories: 220, protein: 1, carbs: 58, fat: 0.2 },
    fish: { calories: 200, protein: 22, carbs: 0, fat: 12 },
  };

  const words = input.toLowerCase().split(/\s|,|and/);
  let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let foundFoods = [];
  let found = false;

  words.forEach((word) => {
    word = word.trim();
    if (db[word]) {
      found = true;
      foundFoods.push(word);
      total.calories += db[word].calories;
      total.protein += db[word].protein;
      total.carbs += db[word].carbs;
      total.fat += db[word].fat;
    }
  });

  if (!found) return null;

  // Determine healthiness & advice
  let advice = "";
  let healthy = true;

  if (total.calories > 500) {
    healthy = false;
    advice += "⚠️ High in calories. Eat in moderation. ";
  }
  if (total.protein < 10) {
    healthy = false;
    advice += "💡 Add protein to balance your meal. ";
  }
  if (total.fat > 20) {
    healthy = false;
    advice += "⚠️ High fat content. Consider healthier fats. ";
  }

  if (healthy) advice = "✅ This meal is healthy and balanced!";

  return { ...total, advice, foods: foundFoods };
}