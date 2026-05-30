import { useState } from "react";
import "./SummaryCard.css";

// Render formatted summary text
function FormatSummary({ text }) {
  const lines = text.split("\n").filter((l) => l.trim());
  return (
    <div className="summary-body">
      {lines.map((line, i) => {
        const t = line.trim();
        if (t.startsWith("## ")) return (
          <h3 key={i} className="s-heading">{t.slice(3)}</h3>
        );
        if (t.startsWith("- ") || t.startsWith("• ")) return (
          <div key={i} className="s-bullet">
            <span className="s-dot" />
            <span dangerouslySetInnerHTML={{ __html: bold(t.slice(2)) }} />
          </div>
        );
        if (/^\d+\./.test(t)) return (
          <div key={i} className="s-numbered">
            <span className="s-num">{t.match(/^(\d+)/)[1]}</span>
            <span dangerouslySetInnerHTML={{ __html: bold(t.replace(/^\d+\.\s*/, "")) }} />
          </div>
        );
        return <p key={i} className="s-para" dangerouslySetInnerHTML={{ __html: bold(t) }} />;
      })}
    </div>
  );
}
const bold = (t) => t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

export default function SummaryCard({ summary, videoUrl, onFeedback, apiBase }) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);

  // ── Copy ──────────────────────────────────────────────────
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summary.summary); }
    catch { const el = Object.assign(document.createElement("textarea"), { value: summary.summary });
      document.body.appendChild(el); el.select(); document.execCommand("copy"); el.remove(); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── PDF — backend generates it (supports all languages) ──
  const handlePDF = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summary.summary, videoUrl, videoId: summary.videoId }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `summary-${summary.videoId}.pdf` });
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Feedback ──────────────────────────────────────────────
  const handleThumb = (rating) => { setFeedbackGiven(rating); setShowComment(true); };
  const submitFeedback = () => {
    onFeedback(summary.videoId, feedbackGiven, comment);
    setShowComment(false); setFeedbackDone(true);
  };

  return (
    <div className="s-card fade-up">
      {/* Header */}
      <div className="s-header">
        <div className="s-header-left">
          <span className="s-label">{summary.cached ? "⚡ Cached" : "✨ AI Summary"}</span>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="s-vid-link">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View Video
          </a>
        </div>

        <div className="s-actions">
          <button className={`s-btn ${copied ? "s-btn--done" : ""}`} onClick={handleCopy}>
            {copied
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
            }
          </button>

          <button className={`s-btn ${pdfLoading ? "s-btn--loading" : ""}`} onClick={handlePDF} disabled={pdfLoading}>
            {pdfLoading
              ? <><span className="mini-spin" />Generating…</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>PDF</>
            }
          </button>
        </div>
      </div>

      {/* Summary body */}
      <div className="s-body">
        <FormatSummary text={summary.summary} />
      </div>

      {/* Feedback */}
      <div className="s-feedback">
        {!feedbackDone ? (
          <>
            <span className="s-fb-label">Was this helpful?</span>
            <button className={`s-thumb ${feedbackGiven === "up" ? "up" : ""}`} onClick={() => handleThumb("up")}>👍</button>
            <button className={`s-thumb ${feedbackGiven === "down" ? "down" : ""}`} onClick={() => handleThumb("down")}>👎</button>
            {showComment && (
              <div className="s-fb-form fade-in">
                <textarea className="s-fb-text" placeholder="Optional comment…" value={comment}
                  onChange={(e) => setComment(e.target.value)} rows={2} maxLength={400} />
                <button className="s-fb-submit" onClick={submitFeedback}>Send</button>
              </div>
            )}
          </>
        ) : (
          <span className="s-fb-done">🙏 Thanks for your feedback!</span>
        )}
      </div>
    </div>
  );
}
