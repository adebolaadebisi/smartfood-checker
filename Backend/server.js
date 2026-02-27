const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

let foods = [];
const csvCandidatePaths = [
  path.join(__dirname, "data/foods.csv"),
  path.join(__dirname, "data/nigerian_foods_calories.csv"),
];
const csvFilePath = csvCandidatePaths.find((p) => fs.existsSync(p)) || csvCandidatePaths[0];

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstValue(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      return value;
    }
  }
  return "";
}

function toNumberOrZero(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function tokenize(text = "") {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stripStopWords(tokens) {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "in",
    "of",
    "on",
    "to",
    "for",
    "with",
    "and",
    "or",
    "me",
    "about",
    "tell",
    "show",
    "give",
    "what",
    "which",
    "how",
    "many",
    "much",
    "calories",
    "protein",
    "carbs",
    "fat",
    "nutrition",
    "value",
    "values",
    "food",
  ]);
  return tokens.filter((t) => !stopWords.has(t));
}

function getCharacterTrigrams(text) {
  const compact = normalize(text).replace(/\s+/g, "");
  if (compact.length < 3) return new Set([compact]);
  const grams = new Set();
  for (let i = 0; i < compact.length - 2; i += 1) {
    grams.add(compact.slice(i, i + 3));
  }
  return grams;
}

function trigramSimilarity(a, b) {
  const aSet = getCharacterTrigrams(a);
  const bSet = getCharacterTrigrams(b);
  let intersection = 0;
  for (const gram of aSet) {
    if (bSet.has(gram)) intersection += 1;
  }
  const denom = aSet.size + bSet.size;
  return denom ? (2 * intersection) / denom : 0;
}

function editDistance(a, b) {
  const s = normalize(a);
  const t = normalize(b);
  const rows = s.length + 1;
  const cols = t.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[s.length][t.length];
}

function editSimilarity(a, b) {
  const aNorm = normalize(a);
  const bNorm = normalize(b);
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (!maxLen) return 1;
  return 1 - editDistance(aNorm, bNorm) / maxLen;
}

function buildAliases(foodName) {
  const normalized = normalize(foodName);
  const aliases = new Set([normalized]);

  const noParen = normalized.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (noParen) aliases.add(noParen);

  const insideParenMatches = [...foodName.matchAll(/\(([^)]*)\)/g)].map((m) => normalize(m[1]));
  insideParenMatches.forEach((m) => {
    if (m) aliases.add(m);
  });

  return Array.from(aliases);
}

function findExactFood(query) {
  const queryNorm = normalize(query);
  if (!queryNorm) return null;

  for (const food of foods) {
    const aliases = buildAliases(food.name);
    if (aliases.some((alias) => alias === queryNorm)) {
      return food;
    }
  }

  return null;
}

function createFoodDocument(food) {
  return `${food.name}. Serving size: ${food.serving_size}. Calories: ${food.calories} kcal. Protein: ${food.protein} g. Carbs: ${food.carbs} g. Fat: ${food.fat} g. Recommendation: ${food.recommendation}. Advice: ${food.advice}`;
}

function detectRequestedMetrics(query) {
  const q = normalize(query);
  const metrics = [];
  if (/\bcalorie|calories|kcal\b/.test(q)) metrics.push("calories");
  if (/\bprotein|proteins\b/.test(q)) metrics.push("protein");
  if (/\bcarb|carbs|carbohydrate|carbohydrates\b/.test(q)) metrics.push("carbs");
  if (/\bfat|fats|lipid|lipids\b/.test(q)) metrics.push("fat");
  return metrics;
}

function isComparisonQuery(query) {
  const q = normalize(query);
  return /\bcompare|comparison|vs|versus|difference|better|between\b/.test(q);
}

function hasAnyKeyword(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function assessFood(food) {
  const name = normalize(food.name);
  const calories = Number(food.calories) || 0;
  const fat = Number(food.fat) || 0;
  const carbs = Number(food.carbs) || 0;

  const alcoholKeywords = [
    "beer",
    "stout",
    "wine",
    "vodka",
    "whisky",
    "whiskey",
    "gin",
    "bitters",
    "schnapps",
    "champagne",
    "prosecco",
    "baileys",
    "smirnoff",
    "palm wine",
    "burukutu",
    "pito",
    "alomo",
    "orijin",
  ];

  const processedHighRiskKeywords = [
    "pizza",
    "burger",
    "shawarma",
    "fried chicken",
    "plantain chips",
    "chin chin",
    "puff puff",
    "meat pie",
    "sausage roll",
    "egg roll",
    "scotch egg",
  ];

  if (hasAnyKeyword(name, alcoholKeywords)) {
    return {
      recommendation: "Limit",
      advice: "Alcohol is best limited. Keep intake low and avoid frequent use.",
    };
  }

  if (hasAnyKeyword(name, processedHighRiskKeywords)) {
    return {
      recommendation: "Limit",
      advice: "This is typically ultra-processed or fried. Keep portions small and occasional.",
    };
  }

  if (calories > 380 || fat > 18 || (fat > 14 && carbs > 35)) {
    return {
      recommendation: "Limit",
      advice: "This is relatively high in calories or fat per serving. Keep portions small and avoid frequent intake.",
    };
  }

  if (calories > 220 || carbs > 40 || fat > 8) {
    return {
      recommendation: "Eat a little",
      advice: "This can fit your diet, but portion size matters. Pair it with vegetables or lean protein.",
    };
  }

  return {
    recommendation: "Okay",
    advice: "This is generally okay for regular meals when portion size is reasonable.",
  };
}

function formatFoodForMetrics(food, metrics) {
  if (!metrics.length) {
    return `${food.name}: ${food.calories} kcal, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat (serving: ${food.serving_size}). Recommendation: ${food.recommendation}.`;
  }

  const parts = [];
  if (metrics.includes("calories")) parts.push(`${food.calories} kcal`);
  if (metrics.includes("protein")) parts.push(`${food.protein}g protein`);
  if (metrics.includes("carbs")) parts.push(`${food.carbs}g carbs`);
  if (metrics.includes("fat")) parts.push(`${food.fat}g fat`);
  return `${food.name}: ${parts.join(", ")} (serving: ${food.serving_size}). Recommendation: ${food.recommendation}.`;
}

function scoreFood(query, food) {
  const queryText = normalize(query);
  const queryTokens = stripStopWords(tokenize(queryText));
  const aliases = buildAliases(food.name);

  let score = 0;

  for (const alias of aliases) {
    if (alias === queryText) score = Math.max(score, 100);
    if (alias.includes(queryText) || queryText.includes(alias)) {
      score = Math.max(score, 80);
    }

    const aliasTokens = new Set(stripStopWords(tokenize(alias)));
    let tokenHits = 0;
    for (const token of queryTokens) {
      if (aliasTokens.has(token)) tokenHits += 1;
    }
    if (queryTokens.length) {
      const tokenRatio = tokenHits / queryTokens.length;
      score = Math.max(score, 40 * tokenRatio);
    }

    const tri = trigramSimilarity(queryText, alias);
    score = Math.max(score, 35 * tri);

    const ed = editSimilarity(queryText, alias);
    score = Math.max(score, 25 * ed);
  }

  return score;
}

function retrieveTopFoods(query, k = 4) {
  if (!query || !foods.length) return [];

  return foods
    .map((food) => ({ food, score: scoreFood(query, food) }))
    .filter((item) => item.score > 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function findBestFoodMatch(query) {
  const exact = findExactFood(query);
  if (exact) return exact;
  const matches = retrieveTopFoods(query, 1);
  return matches.length ? matches[0].food : null;
}

function normalizeGoal(goal = "") {
  const g = normalize(goal);
  if (g === "weight loss" || g === "weightloss" || g === "weight-loss") return "weight-loss";
  if (g === "muscle gain" || g === "musclegain" || g === "muscle-gain") return "muscle-gain";
  return "balanced";
}

function calculateFoodHealthScore(food, goal = "balanced") {
  const calories = Number(food.calories) || 0;
  const protein = Number(food.protein) || 0;
  const carbs = Number(food.carbs) || 0;
  const fat = Number(food.fat) || 0;
  const goalMode = normalizeGoal(goal);

  // Lightweight heuristic score on a 0-100 scale.
  let score = 70;

  if (goalMode === "weight-loss") {
    score += Math.min(protein * 1.8, 22);
    score -= Math.max(0, calories - 180) * 0.16;
    score -= Math.max(0, fat - 8) * 1.8;
    score -= Math.max(0, carbs - 30) * 0.55;
  } else if (goalMode === "muscle-gain") {
    score += Math.min(protein * 2.2, 30);
    score -= Math.max(0, calories - 420) * 0.04;
    score -= Math.max(0, fat - 18) * 0.9;
    score -= Math.max(0, carbs - 70) * 0.2;
  } else {
    score += Math.min(protein * 1.6, 20);
    score -= Math.max(0, calories - 250) * 0.08;
    score -= Math.max(0, fat - 10) * 1.4;
    score -= Math.max(0, carbs - 45) * 0.35;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreFoodForCaloriesOnly(food) {
  const calories = Number(food.calories) || 0;
  const category = normalize(food.category || "");

  // Prefer practical meal ranges around a moderate calorie target.
  let score = 100 - Math.abs(calories - 300) * 0.4;

  if (/\brice\b/.test(category)) score += 14;
  if (/\bbeans|legumes\b/.test(category)) score += 12;
  if (/\byam|tubers|plantain|corn\b/.test(category)) score += 10;
  if (/\bswallows|fufu\b/.test(category)) score += 9;
  if (/\bsoups|stews\b/.test(category)) score += 1;
  if (/\bfast food\b/.test(category)) score -= 6;
  if (/\bsnacks|pastries|cakes|desserts\b/.test(category)) score -= 4;

  return score;
}

function getMealGroup(categoryText = "") {
  const category = normalize(categoryText);
  if (/\brice\b/.test(category)) return "rice";
  if (/\bbeans|legumes\b/.test(category)) return "beans";
  if (/\byam|tubers|plantain|corn\b/.test(category)) return "tubers";
  if (/\bswallows|fufu\b/.test(category)) return "swallows";
  if (/\bsoups|stews\b/.test(category)) return "soups";
  return "other";
}

function diversifyCalorieOnlyRecommendations(items, limit) {
  const selected = [];
  const chosenNames = new Set();

  const addFirstFromGroup = (group) => {
    const hit = items.find((item) => !chosenNames.has(item.name) && getMealGroup(item.category) === group);
    if (!hit) return;
    selected.push(hit);
    chosenNames.add(hit.name);
  };

  // Seed with relatable staple meal groups first.
  ["rice", "beans", "tubers", "swallows"].forEach(addFirstFromGroup);

  const maxSoups = Math.max(1, Math.floor(limit / 3));
  let soupsCount = selected.filter((item) => getMealGroup(item.category) === "soups").length;

  for (const item of items) {
    if (selected.length >= limit) break;
    if (chosenNames.has(item.name)) continue;

    const group = getMealGroup(item.category);
    if (group === "soups" && soupsCount >= maxSoups) continue;

    selected.push(item);
    chosenNames.add(item.name);
    if (group === "soups") soupsCount += 1;
  }

  return selected.slice(0, limit);
}

async function generateRagAnswer(query, retrieved) {
  const context = retrieved
    .map((item, index) => `[Source ${index + 1}] ${createFoodDocument(item.food)}`)
    .join("\n");
  const prompt =
    "You are a nutrition assistant. Use only the provided sources. If unsure, say you are unsure. Keep responses concise and practical. Answer only what the user asked. If they asked for one metric (e.g., protein), return that metric only. If they asked for a comparison, compare directly. Always include a practical recommendation label for each food: Okay, Eat a little, or Limit.\n\n" +
    `Question: ${query}\n\nRetrieved sources:\n${context}`;

  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
  try {
    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        stream: false,
      }),
    });

    if (ollamaResponse.ok) {
      const ollamaJson = await ollamaResponse.json();
      const text = ollamaJson?.response?.trim();
      if (text) return text;
    }
  } catch (error) {
    // If Ollama is not running, continue to Gemini/fallback.
  }

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  if (hasGeminiKey) {
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are a nutrition assistant. Use only the provided sources. If unsure, say you are unsure. Keep responses concise and practical.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Question: ${query}\n\nRetrieved sources:\n${context}`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${errText}`);
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n").trim();
    if (text) return text;
  }

  const metrics = detectRequestedMetrics(query);
  const compare = isComparisonQuery(query);
  const foodsToReturn = compare ? retrieved.map((item) => item.food) : [retrieved[0].food];
  return foodsToReturn.map((food) => formatFoodForMetrics(food, metrics)).join("\n");
}

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    const name = getFirstValue(row, ["Food Item", "food_name", "Food Name", "food"]);
    if (!name) return;

    const food = {
      name,
      category: getFirstValue(row, ["category", "Category"]),
      serving_size: getFirstValue(row, ["Serving Size", "serving_size", "serving"]),
      calories: toNumberOrZero(getFirstValue(row, ["Calories (kcal)", "calories_kcal", "calories", "kcal"])),
      carbs: toNumberOrZero(getFirstValue(row, ["Carbs (g)", "carbs_g", "carbs", "carbohydrates_g"])),
      protein: toNumberOrZero(getFirstValue(row, ["Protein (g)", "protein_g", "protein"])),
      fat: toNumberOrZero(getFirstValue(row, ["Fat (g)", "fat_g", "fat"])),
    };
    const assessment = assessFood(food);
    foods.push({
      ...food,
      recommendation: assessment.recommendation,
      advice: assessment.advice,
    });
  })
  .on("end", () => {
    console.log("CSV file successfully loaded:", foods.length, "foods");
  });

app.get("/api/food/:name", (req, res) => {
  const name = normalize(req.params.name);
  const food = foods.find((f) => normalize(f.name) === name);

  if (food) {
    return res.json(food);
  }

  return res.status(404).json({
    message: `Sorry, we don't have info on "${req.params.name}" yet.`,
  });
});

app.get("/api/foods", (req, res) => {
  res.json(foods.map((f) => f.name));
});

app.get("/api/recommendations", (req, res) => {
  const maxCalories = Number(req.query.maxCalories);
  const minProtein = Number(req.query.minProtein);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const goal = normalizeGoal(typeof req.query.goal === "string" ? req.query.goal : "");
  const includeBeverages = normalize(typeof req.query.includeBeverages === "string" ? req.query.includeBeverages : "") === "true";
  const proteinDataAvailable = foods.some((food) => (Number(food.protein) || 0) > 0);
  const beverageCategoryPattern = /\b(drinks?|beverages?|sodas?|carbonated|malt|beer|alcohol)\b/i;

  const candidates = foods
    .filter((food) => {
      if (!Number.isNaN(maxCalories) && food.calories > maxCalories) return false;
      // If the loaded dataset does not include protein values, ignore minProtein filtering.
      if (proteinDataAvailable && !Number.isNaN(minProtein) && food.protein < minProtein) return false;
      return true;
    });

  const mealOnly = includeBeverages
    ? candidates
    : candidates.filter((food) => !beverageCategoryPattern.test(food.category || ""));

  const pool = mealOnly.length ? mealOnly : candidates;

  const ranked = proteinDataAvailable
    ? pool.sort((a, b) => calculateFoodHealthScore(b, goal) - calculateFoodHealthScore(a, goal))
    : pool.sort((a, b) => scoreFoodForCaloriesOnly(b) - scoreFoodForCaloriesOnly(a));

  const filtered = proteinDataAvailable
    ? ranked.slice(0, limit)
    : diversifyCalorieOnlyRecommendations(ranked, limit);

  return res.json({
    count: filtered.length,
    goal,
    includeBeverages,
    dataAvailability: {
      protein: proteinDataAvailable,
    },
    foods: filtered,
  });
});

app.get("/api/food-search", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query) {
    return res.status(400).json({ message: "Query parameter q is required." });
  }

  const exact = findExactFood(query);
  if (exact) {
    return res.json({
      food: exact,
      alternatives: [],
    });
  }

  const matches = retrieveTopFoods(query, 3);
  if (!matches.length) {
    return res.status(404).json({
      message: `Sorry, we don't have info on "${query}" yet.`,
    });
  }

  return res.json({
    food: matches[0].food,
    alternatives: matches.slice(1).map((item) => item.food),
  });
});

app.get("/api/compare", (req, res) => {
  const food1Name = typeof req.query.food1 === "string" ? req.query.food1.trim() : "";
  const food2Name = typeof req.query.food2 === "string" ? req.query.food2.trim() : "";
  const goal = normalizeGoal(typeof req.query.goal === "string" ? req.query.goal : "");

  if (!food1Name || !food2Name) {
    return res.status(400).json({ message: "food1 and food2 are required query parameters." });
  }

  const food1 = findBestFoodMatch(food1Name);
  const food2 = findBestFoodMatch(food2Name);

  if (!food1 || !food2) {
    return res.status(404).json({
      message: "Could not find one or both foods to compare.",
    });
  }

  const score1 = calculateFoodHealthScore(food1, goal);
  const score2 = calculateFoodHealthScore(food2, goal);
  const scoreDelta = score1 - score2;

  let healthier = "Tie";
  if (scoreDelta > 0) healthier = food1.name;
  if (scoreDelta < 0) healthier = food2.name;

  return res.json({
    food1,
    food2,
    comparison: {
      goal,
      caloriesDiff: food1.calories - food2.calories,
      proteinDiff: food1.protein - food2.protein,
      carbsDiff: food1.carbs - food2.carbs,
      fatDiff: food1.fat - food2.fat,
      score1,
      score2,
      healthier,
    },
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
    if (!query) {
      return res.status(400).json({ message: "Query is required." });
    }

    const retrieved = retrieveTopFoods(query, 4);
    if (!retrieved.length) {
      return res.json({
        answer: "I could not find a relevant food in the current dataset. Try a more specific food name.",
        sources: [],
      });
    }

    const answer = await generateRagAnswer(query, retrieved);
    const compare = isComparisonQuery(query);
    const sources = compare
      ? retrieved.slice(0, 4).map((item) => item.food)
      : [retrieved[0].food];

    return res.json({
      answer,
      sources,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error.message);
    return res.status(500).json({
      message: "Failed to process chat request.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Food Checker API is running on port 8000");
});

app.get("/docs", (req, res) => {
  let html = "<h1>Smart Food Checker API Docs</h1>";
  html += "<p>GET /api/food/:name -> Get nutrition info for a food</p>";
  html += "<p>GET /api/food-search?q=... -> Tolerant food lookup</p>";
  html += "<p>GET /api/compare?food1=...&food2=... -> Compare two foods</p>";
  html += "<p>GET /api/recommendations?maxCalories=...&minProtein=...&limit=... -> Filtered food suggestions</p>";
  html += "<p>GET /api/foods -> Get all food names</p>";
  html += "<p>POST /api/chat -> RAG-style nutrition chat</p>";
  html += "<ul>";
  foods.forEach((food) => {
    html += `<li><a href="/api/food/${encodeURIComponent(food.name)}">${food.name}</a></li>`;
  });
  html += "</ul>";
  res.send(html);
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
