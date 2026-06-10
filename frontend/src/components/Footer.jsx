import "./Footer.css";
export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">
        SUMMARIZER · Built with <a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq</a> + Llama 3 · Free & Open
      </p>
      <p className="footer-text" style={{ marginTop: "0.4rem", fontSize: "0.8rem" }}>
        <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          Terms & Conditions
        </a>
      </p>
    </footer>
  );
}