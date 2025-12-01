import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useTheme } from "../context/ThemeContext";
import { MAP_CONFIG, TILE_URLS, ATTRIBUTION } from "../config";
import "../utils/leafletSetup"; // Import to execute side effects
import "./MapView.css";

export default function MapView({ clusters, onCitySelect, selectedFilter, selectedCountry }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tileUrl = isDark ? TILE_URLS.dark : TILE_URLS.light;

  return (
    <div className={`map-view-container ${theme}`}>
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxBounds={MAP_CONFIG.maxBounds}
        maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
        worldCopyJump={MAP_CONFIG.worldCopyJump}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution={ATTRIBUTION}
          url={tileUrl}
          noWrap={false} // Allow multiple worlds
        />

        <ClusterLayer
          clusters={clusters}
          onCitySelect={onCitySelect}
          selectedFilter={selectedFilter}
          selectedCountry={selectedCountry}
        />
      </MapContainer>
    </div>
  );
}

function ClusterLayer({ clusters, onCitySelect, selectedFilter, selectedCountry }) {
  const map = useMap();

  // Handle view transitions when filter changes
  useEffect(() => {
    if (selectedFilter === "ALL") {
      if (selectedCountry && selectedCountry !== "ALL") {
        // Zoom to country bounds
        if (clusters.length > 0) {
          const bounds = L.latLngBounds(clusters.map(c => [c.lat, c.lon]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      } else {
        // Reset to world view
        map.fitBounds([[-90, -180], [90, 180]]);
      }
    } else if (clusters.length === 1) {
      // Fly to specific city
      const city = clusters[0];
      map.flyTo([city.lat, city.lon], 8);
    }
  }, [selectedFilter, selectedCountry, clusters, map]);

  useEffect(() => {
    if (!clusters.length) return;

    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    clusters.forEach((c) => {
      const marker = L.marker([c.lat, c.lon]);

      // marker.bindPopup(...) removed to prevent default popup behavior

      marker.on("click", () => {
        // marker.openPopup(); // Disable default popup in favor of Right Panel
        onCitySelect(c);
      });

      markers.addLayer(marker);
    });

    map.addLayer(markers);
    return () => map.removeLayer(markers);
  }, [clusters, onCitySelect, map]); // Re-run when clusters change

  return null;
}
