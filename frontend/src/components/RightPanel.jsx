import { useState, useEffect } from "react";
import "./RightPanel.css";
import MapProfileCard from "./MapProfileCard";
import { supabase } from "../supabase";
import { getFlagForCountry } from "../utils/countryFlags";

export default function RightPanel({ city, onClose, isOpen }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");

  // TEMP test
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("zcasher_with_referral_rank")
        .select("id, name")
        .limit(5);
      console.log("Supabase test:", data, error);
    }
    test();
  }, []);

  // -------------------------------
  // NULL SAFE
  // -------------------------------
  if (!city) {
    return (
      <aside className={`right-panel ${isOpen ? "open" : ""}`}>
        <div className="panel-header">
          <h2>Click a city</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="panel-body">
          <p>Select a marker to view users</p>
        </div>
      </aside>
    );
  }

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
  }
  else if (city.city === "Featured") {
    title = "Featured Users";
    meta = `${count} featured users`;
  }
  else if (city.city === "Cluster") {
    title = "Cluster";
    meta = `${count} users across multiple cities`;
  }
  else if (city.city === city.country) {
    const uniqueCities = new Set(rawUsers.map(u => u.city)).size;
    title = `${getFlagForCountry(city.country)} ${city.country}`;
    meta = `${uniqueCities} cities • ${count} users`;
  }
  else {
    title = `${getFlagForCountry(city.country)} ${city.city}, ${city.country}`;
    meta = `${count} users`;
  }

  // -------------------------------
  // SORTING + FEATURED PINNING
  // -------------------------------

  // Always separate featured + regular
  const featuredUsers = rawUsers.filter(u => u.featured);
  const regularUsers = rawUsers.filter(u => !u.featured);

  // Sort regular users ONLY
  const sortedRegular = [...regularUsers].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "joined") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    return 0;
  });

  // Final ordering: featured then sorted regular
  const sortedUsers = [...featuredUsers, ...sortedRegular];

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <aside className={`right-panel ${isOpen ? "open" : ""}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-body">
        <p className="meta">{meta}</p>

        <div className="category-filter">
          {["ALL", "Business", "Personal", "Organization"].map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Users header + sorting */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3>Users ({sortedUsers.length})</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "4px 6px", fontSize: "0.9rem", borderRadius: "4px" }}
          >
            <option value="name">Sort: Name</option>
            <option value="joined">Sort: Joined</option>
          </select>
        </div>

        <ul className="user-list">
          {sortedUsers.length > 0 ? (
            sortedUsers.map((u, i) => (
              <li key={i} className="user-item" style={{ listStyle: "none" }}>
                <MapProfileCard profile={u} />
              </li>
            ))
          ) : (
            <li className="no-users">No users found.</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
