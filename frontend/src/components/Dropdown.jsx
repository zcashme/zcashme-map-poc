import { useState, useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import "./Dropdown.css";
import { getFlagForCountry } from "../utils/countryFlags";

export default function Dropdown({ label, options, selectedValue, onSelect, placeholder = "Search...", isCountry }) {
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
                <span className="trigger-label">
                    {isCountry && selectedValue !== "ALL"
                        ? `${getFlagForCountry(selectedValue)} ${label}`
                        : label}
                </span>
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
                                    {isCountry
                                        ? `${getFlagForCountry(opt.value)} ${opt.label} (${opt.count})`
                                        : `${opt.label} (${opt.count})`}
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
