import { useMemo } from "react";
import ThemeToggle from "./ThemeToggle";
import "./HeaderBar.css";

/**
 * @typedef {Object} Cluster
 * @property {string} city
 * @property {number} count
 */

/**
 * @param {Object} props
 * @param {Cluster[]} props.clusters
 */
export default function HeaderBar({ clusters = [] }) {
  const top3 = useMemo(() =>
    [...clusters].sort((a, b) => b.count - a.count).slice(0, 3),
    [clusters]
  );

  return (
    <header className="header-bar">
      <div className="leaderboard">
        <h3>Top Cities</h3>

        <ol className="leader-list">
          {top3.map((c, i) => (
            <li key={c.city} title={`${c.city}: ${c.count} users`}>
              <span className="rank">#{i + 1}</span>
              <span className="city">{c.city}</span>
              <span className="count">{c.count}</span>
            </li>
          ))}

          {top3.length === 0 && (
            <li className="empty">No data available</li>
          )}
        </ol>
      </div>

      <div className="header-right">
        <ThemeToggle />
      </div>
    </header>
  );
}
