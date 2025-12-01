import { useState } from "react";
import "./RightPanel.css";

export default function RightPanel({ city, onClose, isOpen }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Reset category when city changes - Handled by key prop in parent

  const filteredUsers = city?.users.filter(u => {
    if (selectedCategory === "ALL") return true;
    return u.category === selectedCategory;
  }) || [];

  return (
    <aside className={`right-panel ${isOpen ? "open" : ""}`}>

      {/* Header */}
      <div className="panel-header">
        <h2>{city ? city.city : "Click a city"}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-body">
        {!city && (
          <p>Select a marker to view users</p>
        )}

        {city && (
          <>
            <p className="meta">{city.country} • {city.count} users</p>

            {/* Category Sub-filter */}
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
                  <li key={i} className="user-item">
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: "0.8em", color: "#888" }}>{u.category}</div>
                  </li>
                ))
              ) : (
                <li className="no-users">No users found in this category.</li>
              )}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
