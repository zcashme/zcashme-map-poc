import { useState, useEffect } from "react";
import "./RightPanel.css";
import MapProfileCard from "./MapProfileCard";
import { supabase } from "../supabase";

export default function RightPanel({ city, onClose, isOpen }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // TEMP: verify Supabase connection from Maps frontend
  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase
        .from("zcasher_with_referral_rank")
        .select("id, name")
        .limit(5);

      console.log("Supabase test:", data, error);
    }

    testSupabase();
  }, []);

  // Always show all users passed into the panel
  const filteredUsers = city?.users || [];

  return (
    <aside className={`right-panel ${isOpen ? "open" : ""}`}>

      {/* Header */}
      <div className="panel-header">
        <h2>
          {city.city === "In View"
            ? "Users in View"
            : city.city === "Featured"
              ? "Featured Users"
              : city.city === "Cluster"
                ? "Cluster"
                : city.city}
        </h2>

        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-body">
        {!city && (
          <p>Select a marker to view users</p>
        )}

        {city && (
          <>
            <p className="meta">
              {city.city === "In View"
                ? `${city.count} users in current frame`
                : city.city === "Featured"
                  ? `${city.count} featured users`
                  : city.city === "Cluster"
                    ? `${city.count} users across multiple cities`
                    : `${city.country} • ${city.count} users`}
            </p>

            {/* Category Sub-filter (UI only, no filtering logic) */}
            <div className="category-filter">
              {["ALL", "Business", "Personal", "Organization"].map(cat => (
                <button
                  key={cat}
                  className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <h3>Users ({filteredUsers.length})</h3>

            <ul className="user-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, i) => (
                  <li key={i} className="user-item" style={{ listStyle: "none" }}>
                    <MapProfileCard profile={u} />
                  </li>
                ))
              ) : (
                <li className="no-users">No users found.</li>
              )}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
