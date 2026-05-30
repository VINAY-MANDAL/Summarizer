// ============================================================
// components/SearchBar.jsx
// YouTube URL input with submit button and paste helper
// ============================================================

import { useState, useRef } from "react";
import "./SearchBar.css";

// Simple YouTube URL validation
function isValidYouTubeUrl(url) {
  return /youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts/.test(url);
}

export default function SearchBar({ onSummarize, loading }) {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  const isValid = isValidYouTubeUrl(url);
  const showError = touched && url.length > 0 && !isValid;

  const handleSubmit = () => {
    if (loading || !isValid) return;
    onSummarize(url.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setTouched(true);
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="search-section">
      <div className={`search-bar ${showError ? "has-error" : ""} ${loading ? "is-loading" : ""}`}>
        {/* YouTube icon */}
        <div className="search-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>

        <input
          ref={inputRef}
          type="url"
          className="search-input"
          placeholder="Paste a YouTube URL here…"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setTouched(true); }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Paste button */}
        {!url && (
          <button className="paste-btn" onClick={handlePaste} title="Paste from clipboard" type="button">
            📋 Paste
          </button>
        )}

        {/* Clear button */}
        {url && !loading && (
          <button className="clear-btn" onClick={() => { setUrl(""); setTouched(false); }} type="button" title="Clear">
            ✕
          </button>
        )}
      </div>

      {/* Validation message */}
      {showError && (
        <p className="input-hint error">Please enter a valid YouTube URL (youtube.com or youtu.be)</p>
      )}

      {/* Summarize button */}
      <button
        className={`summarize-btn ${loading ? "loading" : ""} ${isValid && !loading ? "ready" : ""}`}
        onClick={handleSubmit}
        disabled={loading || !isValid}
        type="button"
      >
        {loading ? (
          <>
            <span className="btn-spinner" />
            Summarizing…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Summarize Video
          </>
        )}
      </button>

      {/* Example URLs for quick testing */}
      <div className="example-urls">
        <span className="example-label">Try an example:</span>
        <button
          className="example-btn"
          onClick={() => setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
          type="button"
        >
          YouTube Video
        </button>
      </div>
    </div>
  );
}
