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
    const { countrySlug, citySlug } = useParams();
    const navigate = useNavigate();
    const { data: clusters, loading } = useCityClusters();

    // Derived State
    const { derivedCity, derivedCountry } = useMemo(() => {
        if (loading) return { derivedCity: null, derivedCountry: "ALL" };

        let dCity = null;
        let dCountry = "ALL";

        // 1. Try to resolve country from countrySlug
        if (countrySlug) {
            // Check if countrySlug is actually a valid country
            // We need a way to check valid countries. 
            // Since we don't have a separate country list, we derive it from clusters.
            const validCountries = new Set(clusters.map(c => toSlug(c.country)));
            const isCountry = validCountries.has(countrySlug);

            if (isCountry) {
                // It is a valid country
                // Find the actual country name (reverse slug)
                const countryObj = clusters.find(c => toSlug(c.country) === countrySlug);
                dCountry = countryObj ? countryObj.country : "ALL";
            } else {
                // It might be a legacy city slug (e.g. /cape-town)
                // Check if it matches a city
                const cityObj = fromSlug(countrySlug, clusters);
                if (cityObj) {
                    dCity = cityObj;
                    dCountry = cityObj.country;
                }
            }
        }

        // 2. If we have a citySlug, try to resolve it
        if (citySlug) {
            const cityObj = fromSlug(citySlug, clusters);
            if (cityObj) {
                // Verify it belongs to the derived country (if we have one)
                if (dCountry !== "ALL" && cityObj.country !== dCountry) {
                    // Mismatch? Maybe handle error or just ignore. 
                    // For now, let's trust the citySlug if it's valid.
                    dCity = cityObj;
                    dCountry = cityObj.country;
                } else {
                    dCity = cityObj;
                    dCountry = cityObj.country;
                }
            }
        }

        return { derivedCity: dCity, derivedCountry: dCountry };
    }, [countrySlug, citySlug, clusters, loading]);

    // If URL has a city, that city dictates the country.
    // If URL has a country, that dictates the country.
    // If URL has neither, we default to "ALL".
    const selectedCountry = derivedCountry;

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
        // If we are deep in a city, go back to country view
        if (selectedCountry !== "ALL") {
            navigate(`/${toSlug(selectedCountry)}`);
        } else {
            navigate("/");
        }
    };

    const handleFilterSelect = (filter) => {
        if (filter === "ALL") {
            // If clearing city, go to country view if country is selected
            if (selectedCountry !== "ALL") {
                navigate(`/${toSlug(selectedCountry)}`);
            } else {
                navigate("/");
            }
        } else {
            // Find the city to get its country
            const cityObj = clusters.find(c => c.city === filter);
            if (cityObj) {
                navigate(`/${toSlug(cityObj.country)}/${toSlug(cityObj.city)}`);
            }
        }
    };

    const handleCountrySelect = (country) => {
        if (country === "ALL") {
            navigate("/");
        } else {
            navigate(`/${toSlug(country)}`);
        }
    };

    const handleMarkerClick = (city) => {
        navigate(`/${toSlug(city.country)}/${toSlug(city.city)}`);
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
