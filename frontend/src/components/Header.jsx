import logo from "../assets/logo.jpg";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="logo-wrap">
            <img src={logo} alt="SUMMARIZER" className="logo-img" />
          </div>
          <div className="brand-text">
            <span className="brand-name">SUMMARIZER</span>
            <span className="brand-tagline">AI Video Summarizer</span>
          </div>
        </div>

        <nav className="header-nav">
          <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="nav-tag">
            Free · Groq AI
          </a>
        </nav>
      </div>
    </header>
  );
}
