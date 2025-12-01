import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MapView from "../components/MapView";
import RightPanel from "../components/RightPanel";
import HeaderBar from "../components/HeaderBar";
import FilterBar from "../components/FilterBar";
import { useCityClusters } from "../hooks/useCityClusters";
import { toSlug, fromSlug } from "../utils/slugs";
import { ThemeProvider } from "../context/ThemeContext";

export default function MapPage() {
    const { citySlug } = useParams();
    const navigate = useNavigate();
    const { data: clusters, loading } = useCityClusters();

    const [manualCountry, setManualCountry] = useState("ALL");

    // Derived State
    const derivedCity = useMemo(() => {
        if (!citySlug || loading) return null;
        return fromSlug(citySlug, clusters);
    }, [citySlug, clusters, loading]);

    // If URL has a city, that city dictates the country.
    // If URL has no city, we use the manual country filter.
    const selectedCountry = derivedCity ? derivedCity.country : manualCountry;

    // Selected Filter (City) is derivedCity's name or "ALL"
    const selectedFilter = derivedCity ? derivedCity.city : "ALL";

    const filteredClusters = useMemo(() => {
        if (selectedFilter !== "ALL") {
            return clusters.filter(c => c.city === selectedFilter);
        }
        if (selectedCountry !== "ALL") {
            return clusters.filter(c => c.country === selectedCountry);
        }
        return clusters;
    }, [clusters, selectedFilter, selectedCountry]);

    const closePanel = () => {
        navigate("/");
    };

    const handleFilterSelect = (filter) => {
        if (filter === "ALL") {
            navigate("/");
        } else {
            navigate(`/${toSlug(filter)}`);
        }
    };

    const handleCountrySelect = (country) => {
        setManualCountry(country);
        navigate("/");
    };

    const handleMarkerClick = (city) => {
        navigate(`/${toSlug(city.city)}`);
    };

    return (
        <ThemeProvider>
            <HeaderBar clusters={clusters} />

            <FilterBar
                clusters={clusters}
                selectedFilter={selectedFilter}
                onFilterSelect={handleFilterSelect}
                selectedCountry={selectedCountry}
                onCountrySelect={handleCountrySelect}
            />

            <div className={`slide-container ${derivedCity ? "open" : ""}`}>
                <div className="map-box">
                    <MapView
                        clusters={filteredClusters}
                        onCitySelect={handleMarkerClick}
                        selectedFilter={selectedFilter}
                        selectedCountry={selectedCountry}
                    />
                </div>

                <RightPanel
                    key={derivedCity ? derivedCity.city : "empty"}
                    city={derivedCity}
                    onClose={closePanel}
                    isOpen={!!derivedCity}
                />
            </div>
        </ThemeProvider>
    );
}
