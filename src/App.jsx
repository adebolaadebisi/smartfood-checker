import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import Chatbot from "./components/chatbot";

const RECENT_SEARCHES_KEY = "food_checker_recent_searches";
const AUTH_USERS_KEY = "food_checker_auth_users";
const AUTH_CURRENT_USER_KEY = "food_checker_current_user";

export default function App() {
  const [started, setStarted] = useState(false);
  const [activeTool, setActiveTool] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [foodName, setFoodName] = useState("");
  const [food, setFood] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState("");

  const [compareFood1, setCompareFood1] = useState("");
  const [compareFood2, setCompareFood2] = useState("");
  const [compareGoal, setCompareGoal] = useState("balanced");
  const [compareResult, setCompareResult] = useState(null);
  const [compareError, setCompareError] = useState("");
  const [compareLoading, setCompareLoading] = useState(false);

  const [goalMaxCalories, setGoalMaxCalories] = useState("350");
  const [goalMinProtein, setGoalMinProtein] = useState("0");
  const [goalLimit, setGoalLimit] = useState("6");
  const [recommendationGoal, setRecommendationGoal] = useState("balanced");
  const [goalResults, setGoalResults] = useState([]);
  const [goalLoading, setGoalLoading] = useState(false);
  const [goalError, setGoalError] = useState("");

  const recommendationStyles = {
    Okay: "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Eat a little": "bg-amber-100 text-amber-800 border-amber-300",
    Limit: "bg-red-100 text-red-800 border-red-300",
  };

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(AUTH_USERS_KEY);
      const parsedUsers = savedUsers ? JSON.parse(savedUsers) : [];
      if (Array.isArray(parsedUsers)) setUsers(parsedUsers);

      const savedCurrentUser = localStorage.getItem(AUTH_CURRENT_USER_KEY);
      if (savedCurrentUser) {
        const parsedCurrentUser = JSON.parse(savedCurrentUser);
        if (parsedCurrentUser?.email) {
          setCurrentUser(parsedCurrentUser);
          setActiveTool("dashboard");
        }
      }
    } catch {
      // Ignore malformed local data.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      }
    } catch {
      // Ignore malformed local data.
    }
  }, []);

  const updateRecentSearches = (term) => {
    const normalized = term.trim();
    if (!normalized) return;

    const next = [
      normalized,
      ...recentSearches.filter((s) => s.toLowerCase() !== normalized.toLowerCase()),
    ].slice(0, 6);

    setRecentSearches(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  };

  const resetAuthForm = () => {
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthConfirmPassword("");
    setAuthError("");
  };

  const handleSignup = () => {
    const name = authName.trim();
    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    const confirm = authConfirmPassword.trim();

    if (!name || !email || !password || !confirm) {
      setAuthError("Please fill all fields.");
      return;
    }
    if (password.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (users.some((u) => u.email === email)) {
      setAuthError("This email already has an account. Please log in.");
      return;
    }

    const newUser = { name, email, password };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(nextUsers));

    const safeUser = { name, email };
    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(safeUser));
    setActiveTool("dashboard");
    resetAuthForm();
  };

  const handleLogin = () => {
    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();
    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    const matchedUser = users.find((u) => u.email === email && u.password === password);
    if (!matchedUser) {
      setAuthError("Invalid email or password.");
      return;
    }

    const safeUser = { name: matchedUser.name, email: matchedUser.email };
    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(safeUser));
    setActiveTool("dashboard");
    resetAuthForm();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_CURRENT_USER_KEY);
    setActiveTool("dashboard");
    setStarted(false);
  };

  const checkFood = async (overrideName = "") => {
    const query = (overrideName || foodName).trim();
    if (!query) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/food-search?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Food not found");

      const data = await res.json();
      setFood(data.food);
      setAlternatives(data.alternatives || []);
      setError("");
      updateRecentSearches(data.food?.name || query);
    } catch {
      setFood(null);
      setAlternatives([]);
      setError(`Sorry, we don't have info on "${query}" yet.`);
    }
  };

  const compareFoods = async () => {
    const food1 = compareFood1.trim();
    const food2 = compareFood2.trim();
    if (!food1 || !food2) return;

    setCompareLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/compare?food1=${encodeURIComponent(food1)}&food2=${encodeURIComponent(food2)}&goal=${encodeURIComponent(compareGoal)}`,
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Comparison failed.");
      }

      const data = await res.json();
      setCompareResult(data);
      setCompareError("");
      updateRecentSearches(data.food1?.name || food1);
      updateRecentSearches(data.food2?.name || food2);
    } catch (err) {
      setCompareResult(null);
      setCompareError(err.message || "Could not compare these foods.");
    } finally {
      setCompareLoading(false);
    }
  };

  const applyGoalPreset = (preset) => {
    if (preset === "muscle-gain") {
      setGoalMaxCalories("450");
      setGoalMinProtein("12");
      setGoalLimit("6");
      setRecommendationGoal("muscle-gain");
      return;
    }
    if (preset === "weight-loss") {
      setGoalMaxCalories("250");
      setGoalMinProtein("4");
      setGoalLimit("6");
      setRecommendationGoal("weight-loss");
      return;
    }
    setGoalMaxCalories("350");
    setGoalMinProtein("0");
    setGoalLimit("6");
    setRecommendationGoal("balanced");
  };

  const fetchRecommendations = async () => {
    const params = new URLSearchParams();
    if (goalMaxCalories.trim()) params.set("maxCalories", goalMaxCalories.trim());
    if (goalMinProtein.trim()) params.set("minProtein", goalMinProtein.trim());
    if (goalLimit.trim()) params.set("limit", goalLimit.trim());
    if (recommendationGoal.trim()) params.set("goal", recommendationGoal.trim());

    setGoalLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/recommendations?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Could not fetch recommendations.");
      }
      const data = await res.json();
      setGoalResults(data.foods || []);
      setGoalError("");
    } catch (err) {
      setGoalResults([]);
      setGoalError(err.message || "Could not fetch recommendations.");
    } finally {
      setGoalLoading(false);
    }
  };

  const formatMetricDiff = (value, unit, food1Name, food2Name) => {
    if (value === 0) return `Both foods have the same ${unit}.`;
    const abs = Math.abs(value);
    if (value > 0) return `${food1Name} has ${abs} ${unit} more than ${food2Name}.`;
    return `${food2Name} has ${abs} ${unit} more than ${food1Name}.`;
  };

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 sm:p-6">
          <h1 className="text-2xl font-bold text-green-800 text-center mb-2">MealMirror</h1>
          <p className="text-sm text-slate-600 text-center mb-6">
            {authMode === "login" ? "Login to your account" : "Create your account"}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                authMode === "login"
                  ? "bg-green-600 text-white border-green-700"
                  : "bg-white text-green-800 border-green-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
              }}
              className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                authMode === "signup"
                  ? "bg-green-600 text-white border-green-700"
                  : "bg-white text-green-800 border-green-300"
              }`}
            >
              Signup
            </button>
          </div>

          <div className="space-y-3">
            {authMode === "signup" && (
              <input
                type="text"
                placeholder="Full name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {authMode === "signup" && (
              <input
                type="password"
                placeholder="Confirm password"
                value={authConfirmPassword}
                onChange={(e) => setAuthConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            )}
          </div>

          {authError && <p className="text-red-600 text-sm mt-3">{authError}</p>}

          <button
            onClick={authMode === "login" ? handleLogin : handleSignup}
            className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            {authMode === "login" ? "Login" : "Create Account"}
          </button>
        </div>
      </div>
    );
  }

  const toolCards = [
    { id: "check", title: "Check Food", desc: "Search one food and see nutrition + advice." },
    { id: "compare", title: "Compare Foods", desc: "Pick two foods and see the healthier choice." },
    { id: "recommend", title: "Recommendations", desc: "Get suggested meals by your goal." },
    { id: "chat", title: "Nutrition Chat", desc: "Ask questions in plain language." },
  ];

  return (
    <div className="min-h-screen bg-green-50 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-green-800">MealMirror</h1>
            <p className="text-sm text-slate-600">
              Welcome, {currentUser.name} • {currentUser.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {activeTool === "dashboard" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h2 className="text-xl font-semibold text-green-800 mb-1">Dashboard</h2>
              <p className="text-sm text-slate-600 mb-4">Choose any tool below to continue.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {toolCards.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="text-left border border-green-200 rounded-xl p-4 hover:bg-green-50 hover:border-green-400 transition"
                  >
                    <p className="font-semibold text-slate-900">{tool.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{tool.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5">
              <p className="text-sm text-slate-700">
                Quick summary: {recentSearches.length} recent food search
                {recentSearches.length === 1 ? "" : "es"}.
              </p>
            </div>
          </div>
        )}

        {activeTool !== "dashboard" && (
          <div className="mb-4">
            <button
              onClick={() => setActiveTool("dashboard")}
              className="bg-white border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm hover:bg-green-50"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {activeTool === "check" && (
          <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-800">Check Food</h2>
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter food name..."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full min-w-0 px-4 py-2 rounded-lg border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                onClick={() => checkFood()}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              >
                Check Food
              </button>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {food && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold mb-2">{food.name}</h3>
                <p className="mb-1">Calories: {food.calories} kcal</p>
                <p className="mb-1">Protein: {food.protein} g</p>
                <p className="mb-1">Carbs: {food.carbs} g</p>
                <p className="mb-1">Fat: {food.fat} g</p>
                {food.recommendation && (
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${recommendationStyles[food.recommendation] || "bg-slate-100 text-slate-800 border-slate-300"}`}
                    >
                      Recommendation: {food.recommendation}
                    </span>
                  </div>
                )}
                <p className="mt-3 font-semibold text-green-700">{food.advice}</p>
              </div>
            )}

            {alternatives.length > 0 && (
              <div className="mt-5">
                <p className="font-semibold text-green-800 mb-2">Did you mean:</p>
                <div className="flex flex-wrap gap-2">
                  {alternatives.map((alt) => (
                    <button
                      key={alt.name}
                      onClick={() => {
                        setFoodName(alt.name);
                        checkFood(alt.name);
                      }}
                      className="px-3 py-1.5 rounded-full border border-green-300 bg-white text-green-800 hover:bg-green-100 transition text-sm"
                    >
                      {alt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentSearches.length > 0 && (
              <div className="mt-6">
                <p className="font-semibold text-green-800 mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setFoodName(item);
                        checkFood(item);
                      }}
                      className="px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 transition text-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTool === "compare" && (
          <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-800">Compare Two Foods</h2>
            <div className="flex flex-col gap-3">
              <select
                value={compareGoal}
                onChange={(e) => setCompareGoal(e.target.value)}
                className="px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
              >
                <option value="balanced">Balanced</option>
                <option value="weight-loss">Weight loss</option>
                <option value="muscle-gain">Muscle gain</option>
              </select>
              <input
                type="text"
                placeholder="First food (e.g., Jollof Rice)"
                value={compareFood1}
                onChange={(e) => setCompareFood1(e.target.value)}
                className="px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <input
                type="text"
                placeholder="Second food (e.g., Pizza)"
                value={compareFood2}
                onChange={(e) => setCompareFood2(e.target.value)}
                className="px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                onClick={compareFoods}
                disabled={compareLoading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
              >
                {compareLoading ? "Comparing..." : "Compare"}
              </button>
            </div>

            {compareError && <p className="text-red-600 mt-3">{compareError}</p>}

            {compareResult && (
              <div className="mt-4 text-sm text-slate-800 space-y-1">
                <p>Goal: {compareResult.comparison.goal}</p>
                <p className="font-semibold">Healthier choice: {compareResult.comparison.healthier}</p>
                <p>
                  {formatMetricDiff(
                    compareResult.comparison.caloriesDiff,
                    "kcal",
                    compareResult.food1.name,
                    compareResult.food2.name,
                  )}
                </p>
                <p>
                  {formatMetricDiff(
                    compareResult.comparison.proteinDiff,
                    "g protein",
                    compareResult.food1.name,
                    compareResult.food2.name,
                  )}
                </p>
                <p>
                  {formatMetricDiff(
                    compareResult.comparison.carbsDiff,
                    "g carbs",
                    compareResult.food1.name,
                    compareResult.food2.name,
                  )}
                </p>
                <p>
                  {formatMetricDiff(
                    compareResult.comparison.fatDiff,
                    "g fat",
                    compareResult.food1.name,
                    compareResult.food2.name,
                  )}
                </p>
                <p>
                  Scores: {compareResult.food1.name} ({compareResult.comparison.score1}) vs{" "}
                  {compareResult.food2.name} ({compareResult.comparison.score2})
                </p>
              </div>
            )}
          </div>
        )}

        {activeTool === "recommend" && (
          <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-800">Goal-Based Recommendations</h2>
            <p className="text-sm text-slate-700 mb-3">
              Pick your goal, then set simple limits to control what foods are suggested.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => applyGoalPreset("balanced")}
                className="px-3 py-1.5 rounded-full border border-green-300 bg-green-50 text-green-800 text-sm"
              >
                Balanced
              </button>
              <button
                onClick={() => applyGoalPreset("muscle-gain")}
                className="px-3 py-1.5 rounded-full border border-green-300 bg-green-50 text-green-800 text-sm"
              >
                Muscle Gain
              </button>
              <button
                onClick={() => applyGoalPreset("weight-loss")}
                className="px-3 py-1.5 rounded-full border border-green-300 bg-green-50 text-green-800 text-sm"
              >
                Weight Loss
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-800 mb-1">Goal</label>
              <select
                value={recommendationGoal}
                onChange={(e) => setRecommendationGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
              >
                <option value="balanced">Balanced</option>
                <option value="weight-loss">Weight loss</option>
                <option value="muscle-gain">Muscle gain</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Max calories (kcal)</label>
                <input
                  type="number"
                  value={goalMaxCalories}
                  onChange={(e) => setGoalMaxCalories(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Min protein (g)</label>
                <input
                  type="number"
                  value={goalMinProtein}
                  onChange={(e) => setGoalMinProtein(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">How many results</label>
                <input
                  type="number"
                  value={goalLimit}
                  onChange={(e) => setGoalLimit(e.target.value)}
                  placeholder="e.g. 6"
                  className="w-full px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            <button
              onClick={fetchRecommendations}
              disabled={goalLoading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
            >
              {goalLoading ? "Loading..." : "Get Recommendations"}
            </button>

            {goalError && <p className="text-red-600 mt-3">{goalError}</p>}

            {goalResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {goalResults.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setFoodName(item.name);
                      setActiveTool("check");
                      checkFood(item.name);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-green-400 hover:bg-green-50 transition"
                  >
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-700">
                      {item.calories} kcal - Protein {item.protein}g - Carbs {item.carbs}g - Fat {item.fat}g
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTool === "chat" && (
          <div className="bg-white shadow-xl rounded-2xl p-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-800">Nutrition Chat</h2>
            <Chatbot />
          </div>
        )}
      </div>
    </div>
  );
}
