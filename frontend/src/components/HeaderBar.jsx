import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./HeaderBar.css";

export default function HeaderBar() {
  return (
    <header className="header-bar">
      <div className="branding">
        <Link to="/" className="brand-link">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="brand-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="brand-text">Maps.Zcash.Me</span>
        </Link>
      </div>

      <div className="header-right">
        <ThemeToggle />
      </div>
    </header>
  );
}
