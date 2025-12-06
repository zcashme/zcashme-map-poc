import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useTheme } from "../context/ThemeContext";
import { MAP_CONFIG, TILE_URLS, ATTRIBUTION } from "../config";
import "../utils/leafletSetup"; 
import "./MapView.css";

export default function MapView({ clusters, onCitySelect, selectedFilter, selectedCountry, onBoundsChange }) {
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
        <TileLayer attribution={ATTRIBUTION} url={tileUrl} noWrap={false} />

        <ClusterLayer
          clusters={clusters}
          onCitySelect={onCitySelect}
          selectedFilter={selectedFilter}
          selectedCountry={selectedCountry}
          onBoundsChange={onBoundsChange}
        />
      </MapContainer>
    </div>
  );
}

function ClusterLayer({ clusters, onCitySelect, selectedFilter, selectedCountry, onBoundsChange }) {
  const map = useMap();

  // ---------------------------
  // Handle filter / highlight transitions
  // ---------------------------
  useEffect(() => {
    if (selectedFilter === "ALL") {
      if (selectedCountry && selectedCountry !== "ALL") {
        if (clusters.length > 0) {
          const bounds = L.latLngBounds(clusters.map(c => [c.lat, c.lon]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      } else {
        map.fitBounds([[-90, -180], [90, 180]]);
      }
    } else if (clusters.length === 1) {
      const city = clusters[0];
      map.flyTo([city.lat, city.lon], 8);
    }
  }, [selectedFilter, selectedCountry, clusters, map]);

  // ---------------------------
  // Send map bounds to parent (zoom >= 3)
  // ---------------------------
  useEffect(() => {
    const handle = () => {
      const zoom = map.getZoom();
      if (zoom < 3) return;
      const bounds = map.getBounds();
      onBoundsChange?.(bounds);
    };

    map.on("moveend", handle);
    return () => map.off("moveend", handle);
  }, [map, onBoundsChange]);

  // ---------------------------
  // Marker + Cluster rendering
  // ---------------------------
  useEffect(() => {
    if (!clusters.length) return;

    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    // Add markers with cityData attached
    clusters.forEach((c) => {
      const marker = L.marker([c.lat, c.lon], { cityData: c });
      markers.addLayer(marker);
    });

    // SINGLE MARKER CLICK
    markers.on("click", (e) => {
      if (typeof e.layer.getAllChildMarkers === "function") return; 
      const data = e.layer.options.cityData;
      if (data) onCitySelect(data);
    });

    // CLUSTER CLICK
    markers.on("clusterclick", (e) => {
      const children = e.layer.getAllChildMarkers();
      const cities = children.map(m => m.options.cityData);

      const combined = {
        city: "Cluster",
        country: "Multiple",
        users: cities.flatMap(c => c.users),
        count: cities.reduce((sum, c) => sum + c.count, 0),
      };

      onCitySelect(combined);
    });

    map.addLayer(markers);
    return () => map.removeLayer(markers);
  }, [clusters, onCitySelect, map]);

  return null;
}
