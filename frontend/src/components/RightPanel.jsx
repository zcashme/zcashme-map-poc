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

  // If city is null, avoid crashes
  const safeCity = city || {
    city: "Loading",
    country: "",
    count: 0,
    users: []
  };

  const filteredUsers = safeCity.users || [];

  // Compute title safely
  const title =
    safeCity.city === "In View"
      ? "Users in View"
      : safeCity.city === "Featured"
      ? "Featured Users"
      : safeCity.city === "Cluster"
      ? "Cluster"
      : safeCity.city || "Click a city";

  // Compute metadata safely
  const meta =
    safeCity.city === "In View"
      ? `${safeCity.count} users in current frame`
      : safeCity.city === "Featured"
      ? `${safeCity.count} featured users`
      : safeCity.city === "Cluster"
      ? `${safeCity.count} users across multiple cities`
      : safeCity.country
      ? `${safeCity.country} • ${safeCity.count} users`
      : "";

  return (
    <aside className={`right-panel ${isOpen ? "open" : ""}`}>

      {/* Header */}
      <div className="panel-header">
        <h2>{title}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-body">
        {!city && (
          <p>Select a marker to view users</p>
        )}

        {city && (
          <>
            <p className="meta">{meta}</p>

            {/* Category filter (UI only) */}
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
