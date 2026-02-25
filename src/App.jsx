// import Home from "./pages/Home";
// import ChatBot from "./components/chatbot";

// export default function App() {
//   return (
//     <>
//       <Home />
//       <ChatBot />
//     </>
//   );
// }


import { useState } from "react";
import LandingPage from "./components/LandingPage";
import ResultCard from "./components/ResultCard"; // <- use ResultCard

// Full list of foods
const foods = [
  // Breakfast
  {
    name: "Avocado Toast",
    category: "Breakfast",
    ingredients: ["Bread", "Avocado", "Salt", "Pepper"],
    instructions: "Toast bread. Mash avocado on top with salt and pepper.",
  },
  {
    name: "Pancakes",
    category: "Breakfast",
    ingredients: ["Flour", "Milk", "Eggs", "Sugar", "Baking powder"],
    instructions: "Mix ingredients. Cook on skillet until golden.",
  },
  {
    name: "Omelette",
    category: "Breakfast",
    ingredients: ["Eggs", "Onion", "Tomatoes", "Salt", "Pepper"],
    instructions: "Whisk eggs. Fry with onions and tomatoes until cooked.",
  },
  {
    name: "Bread & Egg",
    category: "Breakfast",
    ingredients: ["Bread", "Eggs", "Butter", "Salt", "Pepper"],
    instructions: "Toast bread. Fry or boil eggs. Serve together.",
  },
  {
    name: "Tea",
    category: "Breakfast",
    ingredients: ["Water", "Tea leaves", "Milk", "Sugar"],
    instructions: "Boil water. Add tea leaves. Pour milk and sugar as desired.",
  },
  {
    name: "Coffee",
    category: "Breakfast",
    ingredients: ["Water", "Coffee powder", "Sugar", "Milk"],
    instructions: "Boil water. Add coffee powder. Mix in sugar and milk.",
  },

  // Lunch
  {
    name: "Jollof Rice",
    category: "Lunch",
    ingredients: ["Rice", "Tomato paste", "Onions", "Bell peppers", "Oil", "Spices"],
    instructions: "Cook rice with tomato paste, onions, peppers, and spices.",
  },
  {
    name: "Chicken Salad",
    category: "Lunch",
    ingredients: ["Chicken", "Lettuce", "Tomatoes", "Cucumber", "Olive oil"],
    instructions: "Grill chicken. Chop veggies. Mix all together with olive oil.",
  },
  {
    name: "Ofada Rice & Ayamase",
    category: "Lunch",
    ingredients: ["Ofada rice", "Green pepper sauce", "Palm oil", "Beef", "Spices"],
    instructions: "Cook rice. Prepare sauce with palm oil and green peppers. Serve together.",
  },
  {
    name: "Beans & Dodo",
    category: "Lunch",
    ingredients: ["Black-eyed beans", "Ripe plantains", "Oil", "Onions", "Spices"],
    instructions: "Cook beans. Fry plantains. Serve together.",
  },
  {
    name: "Fried Rice",
    category: "Lunch",
    ingredients: ["Rice", "Vegetables", "Eggs", "Oil", "Spices"],
    instructions: "Cook rice. Stir-fry with vegetables, eggs, and spices.",
  },

  // Dinner
  {
    name: "Amala & Ewedu",
    category: "Dinner",
    ingredients: ["Yam flour", "Ewedu leaves", "Meat", "Spices"],
    instructions: "Prepare amala. Cook ewedu soup and serve with meat.",
  },
  {
    name: "Egusi Soup",
    category: "Dinner",
    ingredients: ["Melon seeds", "Spinach", "Palm oil", "Beef", "Fish", "Spices"],
    instructions: "Grind melon seeds. Cook with palm oil, spinach, meat, and spices.",
  },
  {
    name: "Okra Soup",
    category: "Dinner",
    ingredients: ["Okra", "Palm oil", "Meat", "Fish", "Spices"],
    instructions: "Chop okra. Cook with palm oil, meat, and spices until thick.",
  },
  {
    name: "Egusi & Fufu",
    category: "Dinner",
    ingredients: ["Melon seeds", "Fufu", "Palm oil", "Meat", "Spices"],
    instructions: "Cook egusi soup. Serve with fufu.",
  },
  {
    name: "Pizza",
    category: "Dinner",
    ingredients: ["Pizza base", "Tomato sauce", "Cheese", "Toppings"],
    instructions: "Add toppings to base and bake in oven until golden.",
  },
  {
    name: "Spaghetti",
    category: "Dinner",
    ingredients: ["Spaghetti", "Tomato sauce", "Cheese", "Meat optional"],
    instructions: "Cook spaghetti. Add sauce and cheese. Serve hot.",
  },

  // Snacks
  {
    name: "Fruit Smoothie",
    category: "Snack",
    ingredients: ["Banana", "Strawberries", "Yogurt", "Honey"],
    instructions: "Blend all ingredients until smooth.",
  },
  {
    name: "Shawarma",
    category: "Snack",
    ingredients: ["Flatbread", "Chicken", "Lettuce", "Tomatoes", "Sauce"],
    instructions: "Cook chicken. Assemble in flatbread with veggies and sauce.",
  },
  {
    name: "Fried Plantain",
    category: "Snack",
    ingredients: ["Ripe plantains", "Oil", "Salt"],
    instructions: "Slice plantains. Fry in hot oil until golden. Sprinkle salt.",
  },
  {
    name: "Chin Chin",
    category: "Snack",
    ingredients: ["Flour", "Sugar", "Butter", "Nutmeg", "Eggs"],
    instructions: "Mix ingredients. Fry small pieces in oil until golden.",
  },
  {
    name: "Meat Pie",
    category: "Snack",
    ingredients: ["Flour", "Meat", "Onions", "Oil", "Seasoning"],
    instructions: "Prepare pastry. Fill with cooked meat. Bake until golden.",
  },

  // Drinks
  {
    name: "Smoothie",
    category: "Drink",
    ingredients: ["Fruits", "Yogurt", "Honey"],
    instructions: "Blend ingredients until smooth.",
  },
  {
    name: "Lemonade",
    category: "Drink",
    ingredients: ["Lemon", "Water", "Sugar", "Ice"],
    instructions: "Mix lemon juice, water, and sugar. Serve with ice.",
  },
  {
    name: "Orange Juice",
    category: "Drink",
    ingredients: ["Orange", "Water", "Sugar", "Ice"],
    instructions: "Squeeze oranges. Mix with water and sugar. Serve chilled.",
  },
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [food, setFood] = useState(null);
  const [error, setError] = useState("");

  const checkFood = () => {
    const found = foods.find(
      (f) => f.name.toLowerCase() === foodName.toLowerCase()
    );
    if (found) {
      setFood(found);
      setError("");
    } else {
      setFood(null);
      setError("Sorry, we don't have info on that food yet.");
    }
  };

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-green-800 text-center">
        🥗 Smart Food Checker
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter food name..."
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          onClick={checkFood}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
        >
          Check Food
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {food && <ResultCard recipe={food} />} {/* <- updated to ResultCard */}
    </div>
  );
}