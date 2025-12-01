import { useState, useRef, useMemo } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import "./FilterBar.css";

function Dropdown({ label, options, selectedValue, onSelect, placeholder = "Search..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (value) => {
        onSelect(value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="dropdown-wrapper" ref={dropdownRef}>
            <button
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="trigger-label">{label}</span>
                <span className="trigger-icon">▼</span>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <ul className="dropdown-list" role="listbox">
                        <li
                            className={`dropdown-item ${selectedValue === "ALL" ? "selected" : ""}`}
                            onClick={() => handleSelect("ALL")}
                            role="option"
                            aria-selected={selectedValue === "ALL"}
                        >
                            ALL
                        </li>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt.value}
                                    className={`dropdown-item ${selectedValue === opt.value ? "selected" : ""}`}
                                    onClick={() => handleSelect(opt.value)}
                                    role="option"
                                    aria-selected={selectedValue === opt.value}
                                >
                                    {opt.label} ({opt.count})
                                </li>
                            ))
                        ) : (
                            <li className="dropdown-empty">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function FilterBar({ clusters, selectedFilter, onFilterSelect, selectedCountry, onCountrySelect }) {
    // Calculate total users
    const totalUsers = clusters.reduce((acc, c) => acc + c.count, 0);

    // Extract unique countries
    const countryOptions = useMemo(() => {
        const countryMap = new Map();
        clusters.forEach(c => {
            if (c.country) {
                const current = countryMap.get(c.country) || 0;
                countryMap.set(c.country, current + c.count);
            }
        });
        return Array.from(countryMap.entries())
            .map(([country, count]) => ({ label: country, value: country, count }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [clusters]);

    // Filter cities based on selected country
    const cityOptions = useMemo(() => {
        let filtered = clusters;
        if (selectedCountry && selectedCountry !== "ALL") {
            filtered = clusters.filter(c => c.country === selectedCountry);
        }
        return filtered
            .sort((a, b) => a.city.localeCompare(b.city))
            .map(c => ({ label: c.city, value: c.city, count: c.count }));
    }, [clusters, selectedCountry]);

    const countryLabel = selectedCountry === "ALL" || !selectedCountry
        ? `All Countries (${totalUsers})` // Total users might be misleading if we sum all countries, but it's basically global total
        : `${selectedCountry} (${countryOptions.find(c => c.value === selectedCountry)?.count || 0})`;

    const cityLabel = selectedFilter === "ALL"
        ? `All Cities`
        : `${selectedFilter} (${clusters.find(c => c.city === selectedFilter)?.count || 0})`;

    return (
        <div className="filter-bar-container">
            <Dropdown
                label={countryLabel}
                options={countryOptions}
                selectedValue={selectedCountry || "ALL"}
                onSelect={onCountrySelect}
                placeholder="Search country..."
            />
            <Dropdown
                label={cityLabel}
                options={cityOptions}
                selectedValue={selectedFilter}
                onSelect={onFilterSelect}
                placeholder="Search city..."
            />
        </div>
    );
}
