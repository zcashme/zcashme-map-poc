import { useState, useMemo } from "react";
import L from "leaflet";
import { useNavigate, useParams } from "react-router-dom";
import MapView from "../components/MapView";
import RightPanel from "../components/RightPanel";
import HeaderBar from "../components/HeaderBar";

import { useCityClusters } from "../hooks/useCityClusters";
import { useMapProfiles } from "../hooks/useMapProfiles";
import { toSlug, fromSlug } from "../utils/slugs";
import { ThemeProvider } from "../context/ThemeContext";

export default function MapPage() {
    const [mapBounds, setMapBounds] = useState(null);
    const { countrySlug, citySlug } = useParams();
    const navigate = useNavigate();
    const { data: clusters, loading } = useCityClusters();
    const { profiles } = useMapProfiles();

    // -----------------------------------------------
    // Derived City + Country (must come BEFORE selectedCountry)
    // -----------------------------------------------
    const { derivedCity, derivedCountry } = useMemo(() => {
        if (loading) return { derivedCity: null, derivedCountry: "ALL" };

        let dCity = null;
        let dCountry = "ALL";

        if (countrySlug) {
            const validCountries = new Set(clusters.map(c => toSlug(c.country)));
            const isCountry = validCountries.has(countrySlug);

            if (isCountry) {
                const countryObj = clusters.find(c => toSlug(c.country) === countrySlug);
                dCountry = countryObj ? countryObj.country : "ALL";
            } else {
                const cityObj = fromSlug(countrySlug, clusters);
                if (cityObj) {
                    dCity = cityObj;
                    dCountry = cityObj.country;
                }
            }
        }

        if (citySlug) {
            const cityObj = fromSlug(citySlug, clusters);
            if (cityObj) {
                if (dCountry !== "ALL" && cityObj.country !== dCountry) {
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

    // -----------------------------------------------
    // selectedCountry MUST be defined BEFORE featured/countryCity memos
    // -----------------------------------------------
    const selectedCountry = derivedCountry;
    // -----------------------------------------------
    // In-view users: all users whose city is inside current map frame (zoom ≥ 3)
    // -----------------------------------------------
    const inViewCity = useMemo(() => {
        if (!mapBounds) return null;
        if (derivedCity) return null;      // city overrides
        if (selectedCountry !== "ALL") return null; // country overrides

        // get all profiles + coordinates
        const usersInFrame = profiles.filter(p => {
            if (!p.lat || !p.lon) return false;
            const latlng = L.latLng(p.lat, p.lon);
            return mapBounds.contains(latlng);
        });

        if (usersInFrame.length === 0) return null;

        return {
            city: "In View",
            country: "Multiple",
            count: usersInFrame.length,
            users: usersInFrame
        };
    }, [mapBounds, profiles, derivedCity, selectedCountry]);

    // -----------------------------------------------
    // Featured users block
    // -----------------------------------------------
    const featuredCity = useMemo(() => {
        const featuredUsers = profiles.filter(p => p.featured);
        if (featuredUsers.length === 0) return null;

        return {
            city: "Featured",
            country: "ALL",
            count: featuredUsers.length,
            users: featuredUsers
        };
    }, [profiles]);



    // -----------------------------------------------
    // Correct: Country-wide list computed AFTER selectedCountry exists
    // -----------------------------------------------
    const countryCity = useMemo(() => {
        if (!profiles || selectedCountry === "ALL") return null;

        const users = profiles.filter(p => p.country === selectedCountry);

        return {
            city: selectedCountry,
            country: selectedCountry,
            count: users.length,
            users
        };
    }, [profiles, selectedCountry]);


    // -----------------------------------------------
    // Selected Filter
    // -----------------------------------------------
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
        // 1. If a CITY is selected → show that city's country
        if (derivedCity) {
            navigate(`/${toSlug(derivedCity.country)}`);
            return;
        }

        // 2. If a COUNTRY is selected → clear to root (inViewCity will take over)
        if (selectedCountry !== "ALL") {
            navigate(`/`);
            return;
        }

        // 3. If no city / no country → stay on "/" and let inViewCity or featured take over
        navigate(`/`);
    };


    const handleFilterSelect = (filter) => {
        if (filter === "ALL") {
            if (selectedCountry !== "ALL") {
                navigate(`/${toSlug(selectedCountry)}`);
            } else {
                navigate("/");
            }
        } else {
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

            {/* FilterBar REMOVED - Moved to RightPanel */}

            <div className={`slide-container ${derivedCity ? "open" : ""}`}>
                <div className="map-box">
                    <MapView
                        clusters={filteredClusters}
                        onCitySelect={handleMarkerClick}
                        selectedFilter={selectedFilter}
                        selectedCountry={selectedCountry}
                        onBoundsChange={setMapBounds}
                    />
                </div>

                <RightPanel
                    key={
                        derivedCity
                            ? derivedCity.city
                            : countryCity
                                ? `country-${selectedCountry}`
                                : "featured"
                    }
                    city={
                        derivedCity
                            ? derivedCity
                            : (selectedCountry !== "ALL" && countryCity)
                                ? countryCity
                                : inViewCity
                                    ? inViewCity
                                    : featuredCity
                    }
                    onClose={closePanel}
                    isOpen={true}

                    /* --- NEW PROPS FOR MIGRATED FILTERS --- */
                    clusters={clusters}
                    selectedFilter={selectedFilter}
                    onFilterSelect={handleFilterSelect}
                    selectedCountry={selectedCountry}
                    onCountrySelect={handleCountrySelect}
                />
            </div>
        </ThemeProvider>
    );
}
