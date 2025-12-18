import { useState, useEffect, useRef } from "react";
import "./RightPanel.css";
import MapProfileCard from "./MapProfileCard";
import { getFlagForCountry } from "../utils/countryFlags";

export default function RightPanel({ city, onClose, isOpen }) {

  const [filterText, setFilterText] = useState("");

  // mobile bottom-sheet state
  const [panelState, setPanelState] = useState("collapsed"); // collapsed | expanded
  const bodyRef = useRef(null);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Reset panel when city changes
  useEffect(() => {
    if (isMobile) setPanelState("collapsed");
    setFilterText("");
  }, [city, isMobile]);

  // Auto-collapse when scrolled to top
  useEffect(() => {
    if (!isMobile || !bodyRef.current) return;

    const el = bodyRef.current;

    const onScroll = () => {
      if (el.scrollTop === 0 && panelState === "expanded") {
        setPanelState("collapsed");
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile, panelState]);

  if (!city) return null;

  // -------------------------------
  // TITLES
  // -------------------------------
  let title = "";
  let meta = "";

  const rawUsers = city.users || [];
  const count = city.count || rawUsers.length;

  if (city.city === "In View") {
    title = "Users in View";
    meta = `${count} users in current frame`;
  } else if (city.city === "Featured") {
    title = "Featured Users";
    meta = `${count} featured users`;
  } else if (city.city === "Cluster") {
    title = "Cluster";
    meta = `${count} users across multiple cities`;
  } else if (city.city === city.country) {
    const uniqueCities = new Set(rawUsers.map(u => u.city)).size;
    title = `${getFlagForCountry(city.country)} ${city.country}`;
    meta = `${uniqueCities} cities • ${count} users`;
  } else {
    title = `${getFlagForCountry(city.country)} ${city.city}, ${city.country}`;
    meta = `${count} users`;
  }

  // -------------------------------
  // FILTERING (featured always pinned)
  // -------------------------------
  const matchesFilter = (u) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q)
    );
  };

  const featuredUsers = rawUsers.filter(
    u => u.featured && matchesFilter(u)
  );

  const regularUsers = rawUsers.filter(
    u => !u.featured && matchesFilter(u)
  );

  const filteredUsers = [...featuredUsers, ...regularUsers];

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <aside
      className={`right-panel ${isOpen ? "open" : ""} ${isMobile ? `mobile ${panelState}` : ""
        }`}
    >
      <div className="panel-header">
        <div className="header-left">
          <h2>{title}</h2>
          {isMobile && <p className="meta">{meta}</p>}
        </div>

        <div className="header-actions">
          {isMobile && (
            panelState === "collapsed" ? (
              <button
                className="panel-toggle"
                onClick={() => setPanelState("expanded")}
                aria-label="Expand panel"
              >
                ▲
              </button>
            ) : (
              <button
                className="panel-toggle"
                onClick={() => setPanelState("collapsed")}
                aria-label="Collapse panel"
              >
                ▼
              </button>
            )
          )}

          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="panel-body" ref={bodyRef}>
        {!isMobile && <p className="meta">{meta}</p>}



        <div
          className="users-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <h3 style={{ marginRight: "auto" }}>
            Users ({filteredUsers.length})
          </h3>

          <input
            type="text"
            placeholder="Filter users…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="user-filter-input"
          />
        </div>


        <ul className="user-list">
          {filteredUsers.map((u, i) => (
            <li key={i} className="user-item">
              <MapProfileCard profile={u} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
