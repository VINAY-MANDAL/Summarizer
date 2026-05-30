import { useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import SearchBar from "./components/SearchBar.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");

  const handleSummarize = useCallback(async (url) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    setCurrentUrl(url);

    try {
      const response = await fetch(`${API_BASE}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Something went wrong."); return; }
      setSummary(data);
      // Scroll to result smoothly
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not connect to the server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleFeedback = useCallback(async (videoId, rating, comment = "") => {
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, rating, comment }),
      });
    } catch {}
  }, []);

  const hasResult = summary || loading || error;

  return (
    <div className="app-wrapper">
      <Header />

      <main className="main-content">
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-badge">
            <span className="badge-dot" />
            Powered by Llama 3 · Free to Use
          </div>
          <h1 className="hero-title">
            Understand Any<br />
            <span className="hero-highlight">YouTube Video</span><br />
            in Seconds
          </h1>
          <p className="hero-sub">
            Paste a YouTube link and get a clear, structured AI summary instantly —
            no sign-up, no limits, completely free.
          </p>

          {/* ── Search bar inside hero ── */}
          <div className="hero-search">
            <SearchBar onSummarize={handleSummarize} loading={loading} />
          </div>

          {/* Trust indicators */}
          <div className="trust-row">
            <span className="trust-item">✓ No sign-up needed</span>
            <span className="trust-sep">·</span>
            <span className="trust-item">✓ Any language</span>
            <span className="trust-sep">·</span>
            <span className="trust-item">✓ Export as PDF</span>
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="error-box fade-in" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="loading-box fade-in">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <p className="loading-text">Fetching transcript & generating summary…</p>
            <p className="loading-sub">Usually takes 5–15 seconds</p>
          </div>
        )}

        {/* ── Result ── */}
        {summary && !loading && (
          <div id="result">
            <SummaryCard
              summary={summary}
              videoUrl={currentUrl}
              onFeedback={handleFeedback}
              apiBase={API_BASE}
            />
          </div>
        )}

        {/* ── How it works (show only when no result) ── */}
        {!hasResult && <HowItWorks />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
