import { useState, useRef, useMemo } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import "./FilterBar.css";

export default function FilterBar({ clusters, selectedFilter, onFilterSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Calculate total users
    const totalUsers = clusters.reduce((acc, c) => acc + c.count, 0);

    // Sort clusters alphabetically
    const sortedClusters = useMemo(() =>
        [...clusters].sort((a, b) => a.city.localeCompare(b.city)),
        [clusters]
    );

    // Filter options based on search term
    const filteredOptions = sortedClusters.filter((c) =>
        c.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const handleSelect = (value) => {
        onFilterSelect(value);
        setIsOpen(false);
        setSearchTerm(""); // Reset search on select
    };

    const selectedLabel = selectedFilter === "ALL"
        ? `ALL (${totalUsers})`
        : `${selectedFilter} (${clusters.find(c => c.city === selectedFilter)?.count || 0})`;

    return (
        <div className="filter-bar-container" ref={dropdownRef}>
            <button
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="trigger-label">{selectedLabel}</span>
                <span className="trigger-icon">▼</span>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <ul className="dropdown-list" role="listbox">
                        <li
                            className={`dropdown-item ${selectedFilter === "ALL" ? "selected" : ""}`}
                            onClick={() => handleSelect("ALL")}
                            role="option"
                            aria-selected={selectedFilter === "ALL"}
                        >
                            ALL ({totalUsers})
                        </li>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((city) => (
                                <li
                                    key={city.city}
                                    className={`dropdown-item ${selectedFilter === city.city ? "selected" : ""}`}
                                    onClick={() => handleSelect(city.city)}
                                    role="option"
                                    aria-selected={selectedFilter === city.city}
                                >
                                    {city.city} ({city.count})
                                </li>
                            ))
                        ) : (
                            <li className="dropdown-empty">No cities found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
