// HowItWorks.jsx — Landing section shown before any search
import "./HowItWorks.css";

const STEPS = [
  { icon: "🔗", title: "Paste URL", desc: "Copy any YouTube video link and paste it in the search box above." },
  { icon: "⚡", title: "AI Summarizes", desc: "Our Llama 3 AI reads the full transcript and extracts key insights." },
  { icon: "📄", title: "Get Summary", desc: "Receive a structured summary with overview, key points, and conclusion." },
];

const FEATURES = [
  { icon: "🌍", title: "Any Language", desc: "Summarizes videos in Hindi, English, or any other language." },
  { icon: "⚡", title: "Blazing Fast", desc: "Results in 5–15 seconds using Groq's ultra-fast AI inference." },
  { icon: "📥", title: "Export PDF", desc: "Download your summary as a clean, formatted PDF document." },
  { icon: "♾️", title: "Completely Free", desc: "No subscription, no sign-up. Use it as much as you want." },
];

export default function HowItWorks() {
  return (
    <section className="how-section">
      {/* Steps */}
      <div className="section-label">How it works</div>
      <div className="steps-row">
        {STEPS.map((s, i) => (
          <div key={i} className="step-card">
            <div className="step-num">{i + 1}</div>
            <div className="step-icon">{s.icon}</div>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="hw-divider" />

      {/* Features grid */}
      <div className="section-label">Why SUMMARIZER</div>
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
