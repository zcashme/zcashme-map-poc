import { useState, useEffect } from "react";
import MapView from "./components/MapView";
import RightPanel from "./components/RightPanel";
import HeaderBar from "./components/HeaderBar";

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  });

  const closePanel = () => setSelectedCity(null);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  // Apply theme on initial load and listen for system changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <HeaderBar
        clusters={clusters}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className={`slide-container ${selectedCity ? "open" : ""}`}>
        <div className="map-box">
          <MapView
            onCitySelect={setSelectedCity}
            onDataLoaded={setClusters}
          />
        </div>

        <RightPanel city={selectedCity} onClose={closePanel} />
      </div>
    </>
  );
}
