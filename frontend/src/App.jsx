import { useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import SearchBar from "./components/SearchBar.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

function TermsScreen({ onAccept }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1.5rem",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        padding: "2.4rem 2.2rem", maxWidth: "460px", width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", textAlign: "center"
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "16px",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.2rem"
        }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h2 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: "1.3rem", color: "#0f172a", marginBottom: "0.6rem"
        }}>Before You Continue</h2>
        <p style={{
          fontSize: "0.9rem", color: "#64748b",
          marginBottom: "1.6rem", lineHeight: 1.7
        }}>
          Please read and accept our Terms & Conditions to use Summarizer AI.
        </p>
        <div
          onClick={() => setChecked(!checked)}
          style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            background: "#f1f5f9", borderRadius: "12px",
            padding: "1rem 1.2rem", marginBottom: "1.4rem",
            textAlign: "left", cursor: "pointer",
            border: checked ? "1.5px solid #2563eb" : "1.5px solid transparent",
            transition: "border 0.2s"
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
            onClick={e => e.stopPropagation()}
            style={{ width: "18px", height: "18px", accentColor: "#2563eb",
              flexShrink: 0, marginTop: "2px", cursor: "pointer" }}
          />
          <label style={{ fontSize: "0.88rem", color: "#475569",
            cursor: "pointer", lineHeight: 1.6 }}>
            I have read and agree to the{" "}
            <a
              href="/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Terms & Conditions
            </a>{" "}
            of Summarizer AI.
          </label>
        </div>
        <button
          onClick={() => { if (checked) onAccept(); }}
          disabled={!checked}
          style={{
            width: "100%", padding: "14px",
            background: checked ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "#e2e8f0",
            color: checked ? "#fff" : "#94a3b8",
            border: "none", borderRadius: "12px",
            fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 700,
            cursor: checked ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: checked ? "0 8px 28px rgba(37,99,235,0.35)" : "none"
          }}
        >
          I Agree — Continue
        </button>
      </div>
    </div>
  );
}

function App() {
  const [termsAccepted, setTermsAccepted] = useState(
    () => sessionStorage.getItem("termsAccepted") === "true"
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [language, setLanguage] = useState("english");

  const handleAcceptTerms = () => {
    sessionStorage.setItem("termsAccepted", "true");
    setTermsAccepted(true);
  };

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
        body: JSON.stringify({ url, language }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Something went wrong."); return; }
      setSummary(data);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not connect to the server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [loading, language]);

  const handleFeedback = useCallback(async (videoId, rating, comment = "") => {
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, rating, comment }),
      });
    } catch {}
  }, []);

  if (!termsAccepted) {
    return <TermsScreen onAccept={handleAcceptTerms} />;
  }

  const hasResult = summary || loading || error;

  return (
    <div className="app-wrapper">
      <Header />

      <main className="main-content">
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

          {/* Language Selector */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", marginBottom: "1.2rem"
          }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
              Summary Language:
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setLanguage("english")}
                style={{
                  padding: "7px 18px", borderRadius: "100px",
                  border: language === "english" ? "none" : "1.5px solid #334155",
                  background: language === "english"
                    ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                    : "transparent",
                  color: language === "english" ? "#fff" : "#94a3b8",
                  fontFamily: "Syne, sans-serif", fontWeight: 700,
                  fontSize: "0.82rem", cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLanguage("hindi")}
                style={{
                  padding: "7px 18px", borderRadius: "100px",
                  border: language === "hindi" ? "none" : "1.5px solid #334155",
                  background: language === "hindi"
                    ? "linear-gradient(135deg, #e8433a, #f07444)"
                    : "transparent",
                  color: language === "hindi" ? "#fff" : "#94a3b8",
                  fontFamily: "Syne, sans-serif", fontWeight: 700,
                  fontSize: "0.82rem", cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                🇮🇳 Hindi
              </button>
            </div>
          </div>

          <div className="hero-search">
            <SearchBar onSummarize={handleSummarize} loading={loading} />
          </div>

          <div className="trust-row">
            <span className="trust-item">✓ No sign-up needed</span>
            <span className="trust-sep">·</span>
            <span className="trust-item">✓ Any language</span>
            <span className="trust-sep">·</span>
            <span className="trust-item">✓ Export as PDF</span>
          </div>
        </section>

        {error && (
          <div className="error-box fade-in" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading-box fade-in">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <p className="loading-text">Fetching transcript & generating summary…</p>
            <p className="loading-sub">Usually takes 5–15 seconds</p>
          </div>
        )}

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

        {!hasResult && <HowItWorks />}
      </main>

      <Footer />
    </div>
  );
}

export default App;