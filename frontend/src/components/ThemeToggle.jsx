export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className={`theme-toggle-pro ${theme}`}
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <span className="icon sun">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414m0 12.728l-1.414 1.414m15.556-15.556l-1.414 1.414M12 7a5 5 0 100 10 5 5 0 000-10z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className="icon moon">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className="thumb"></span>
    </button>
  );
}
