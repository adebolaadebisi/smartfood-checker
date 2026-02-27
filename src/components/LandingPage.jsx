// export default function LandingPage({ onStart }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-300 flex flex-col items-center justify-center text-center px-6">
//       <h1 className="text-5xl font-extrabold text-green-800 mb-4">
//         🍏 Welcome to Smart Food Checker
//       </h1>
//       <p className="text-lg text-green-700 mb-8 max-w-xl">
//         Quickly check if your food is healthy or not, get nutritional advice, 
//         and make smarter food choices. Just type the food name and see the results instantly!
//       </p>
//       <button
//         onClick={onStart}
//         className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition duration-300"
//       >
//         Get Started
//       </button>
//       <p className="mt-6 text-green-800 opacity-80">
//         Powered by React + Tailwind CSS
//       </p>
//     </div>
//   );
// }

import { useState, useEffect } from "react";

const foods = ["🥑 Avocado", "🍕 Pizza", "🥦 Broccoli", "🍩 Donut", "🍇 Grapes", "🧁 Cupcake"];

export default function LandingPage({ onStart }) {
  const [foodIndex, setFoodIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFoodIndex((i) => (i + 1) % foods.length);
        setVisible(true);
      }, 400);
    }, 2000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'DM Sans', sans-serif; }

        .landing {
          min-height: 100vh;
          background: #f5f0e8;
          display: grid;
          grid-template-rows: auto 1fr auto;
          overflow: hidden;
          position: relative;
        }

        /* Background blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: #a8d5a2;
          top: -100px; right: -100px;
          animation: drift1 8s ease-in-out infinite alternate;
        }
        .blob-2 {
          width: 350px; height: 350px;
          background: #f7c59f;
          bottom: -80px; left: -60px;
          animation: drift2 10s ease-in-out infinite alternate;
        }
        .blob-3 {
          width: 200px; height: 200px;
          background: #f4e04d;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: drift3 12s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px, 40px) scale(1.1); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px, -30px) scale(1.05); } }
        @keyframes drift3 { from { transform: translate(-50%,-50%) scale(1); } to { transform: translate(-45%,-55%) scale(1.15); } }

        /* Nav */
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
          position: relative;
          z-index: 10;
        }
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #2d5a27;
          letter-spacing: -0.02em;
        }
        .nav-badge {
          background: #2d5a27;
          color: #f5f0e8;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Hero */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px 60px;
          position: relative;
          z-index: 10;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .hero.in {
          opacity: 1;
          transform: translateY(0);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1.5px solid #d4e8d0;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.8rem;
          color: #3a7a32;
          font-weight: 500;
          margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .dot {
          width: 7px; height: 7px;
          background: #5cb85c;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity:1; }
          50% { transform: scale(1.4); opacity:0.7; }
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 8vw, 6.5rem);
          font-weight: 900;
          color: #1a3318;
          line-height: 1.0;
          letter-spacing: -0.03em;
          max-width: 820px;
          margin-bottom: 8px;
        }
        h1 em {
          font-style: italic;
          color: #3a7a32;
        }

        .food-ticker {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 6vw, 5rem);
          font-weight: 700;
          color: #c65d00;
          font-style: italic;
          height: 1.2em;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .food-ticker.hidden {
          opacity: 0;
          transform: translateY(10px);
        }
        .food-ticker.show {
          opacity: 1;
          transform: translateY(0);
        }

        .subtitle {
          font-size: 1.05rem;
          color: #5a6e57;
          max-width: 480px;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 48px;
        }

        .cta-group {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-primary {
          background: #2d5a27;
          color: #f5f0e8;
          border: none;
          padding: 16px 40px;
          border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 4px 20px rgba(45,90,39,0.3);
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-primary:hover {
          background: #1a3318;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(45,90,39,0.4);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-arrow {
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }
        .btn-primary:hover .btn-arrow { transform: translateX(3px); }

        .btn-secondary {
          background: transparent;
          color: #3a7a32;
          border: 1.5px solid #a8c8a4;
          padding: 15px 32px;
          border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          border-color: #3a7a32;
          background: rgba(58,122,50,0.06);
        }

        /* Features strip */
        .features {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 64px;
        }
        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .feature-icon {
          font-size: 1.6rem;
          width: 52px; height: 52px;
          background: #fff;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .feature-label {
          font-size: 0.78rem;
          color: #7a9478;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        /* Footer */
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 0.75rem;
          color: #a0b09c;
          position: relative;
          z-index: 10;
        }

        /* Decorative card */
        .deco-card {
          position: absolute;
          background: #fff;
          border-radius: 20px;
          padding: 16px 20px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          font-size: 0.85rem;
          pointer-events: none;
          z-index: 5;
        }
        .deco-card.left {
          left: 5%; top: 35%;
          animation: floatL 6s ease-in-out infinite;
        }
        .deco-card.right {
          right: 5%; top: 40%;
          animation: floatR 7s ease-in-out infinite;
        }
        @keyframes floatL {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }
        @keyframes floatR {
          0%,100% { transform: translateY(0) rotate(2deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .deco-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #aaa;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .deco-val {
          font-weight: 700;
          color: #1a3318;
          font-size: 1rem;
        }
        .deco-val.good { color: #3a7a32; }
        .deco-val.warn { color: #c65d00; }
        .deco-bar {
          height: 6px;
          background: #eee;
          border-radius: 99px;
          margin-top: 8px;
          overflow: hidden;
          width: 120px;
        }
        .deco-fill {
          height: 100%;
          border-radius: 99px;
        }

        @media (max-width: 768px) {
          .nav { padding: 20px 24px; }
          .deco-card { display: none; }
        }
      `}</style>

      <div className="landing">
        {/* Background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Decorative floating cards */}
        <div className="deco-card left">
          <div className="deco-label">Calories</div>
          <div className="deco-val good">160 kcal</div>
          <div className="deco-bar">
            <div className="deco-fill" style={{ width: "40%", background: "#5cb85c" }} />
          </div>
        </div>
        <div className="deco-card right">
          <div className="deco-label">Sugar</div>
          <div className="deco-val warn">High ⚠️</div>
          <div className="deco-bar">
            <div className="deco-fill" style={{ width: "80%", background: "#e67e22" }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="nav">
          <span className="logo">🌿 MealMirror</span>
          <span className="nav-badge">Free to use</span>
        </nav>

        {/* Hero */}
        <section className={`hero ${mounted ? "in" : ""}`}>
          <div className="tag">
            <span className="dot" />
            AI-Powered Nutrition Analysis
          </div>

          <h1>
            Is your food <em>really</em>
            <br />good for you?
          </h1>

          <div className={`food-ticker ${visible ? "show" : "hidden"}`}>
            {foods[foodIndex]}
          </div>

          <p className="subtitle">
            Type any food and instantly discover its health profile,
            nutritional breakdown, and smarter alternatives — no guesswork needed.
          </p>

          <div className="cta-group">
            <button className="btn-primary" onClick={onStart}>
              Check a food
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary">Learn more</button>
          </div>

          <div className="features">
            {[
              { icon: "⚡", label: "Instant results" },
              { icon: "🔬", label: "Nutrition data" },
              { icon: "💡", label: "Smart tips" },
              { icon: "🔒", label: "Private & free" },
            ].map((f) => (
              <div className="feature-item" key={f.label}>
                <div className="feature-icon">{f.icon}</div>
                <span className="feature-label">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
           MealMirror © 2025
        </footer>
      </div>
    </>
  );
}
