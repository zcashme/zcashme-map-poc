import { useState, useEffect, useMemo } from "react";
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

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("ALL");

    // Sync URL with State
    useEffect(() => {
        if (loading) return;

        if (citySlug) {
            const city = fromSlug(citySlug, clusters);
            if (city) {
                setSelectedCity(city);
                setSelectedFilter(city.city);
            } else {
                // Invalid slug, redirect to home
                navigate("/", { replace: true });
            }
        } else {
            setSelectedCity(null);
            setSelectedFilter("ALL");
        }
    }, [citySlug, clusters, loading, navigate]);

    const filteredClusters = useMemo(() => {
        if (selectedFilter === "ALL") return clusters;
        return clusters.filter(c => c.city === selectedFilter);
    }, [clusters, selectedFilter]);

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
            />

            <div className={`slide-container ${selectedCity ? "open" : ""}`}>
                <div className="map-box">
                    <MapView
                        clusters={filteredClusters}
                        onCitySelect={handleMarkerClick}
                        selectedFilter={selectedFilter}
                    />
                </div>

                <RightPanel city={selectedCity} onClose={closePanel} isOpen={!!selectedCity} />
            </div>
        </ThemeProvider>
    );
}
