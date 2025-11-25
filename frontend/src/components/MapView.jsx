import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export default function MapView({ clusters, onCitySelect, selectedFilter }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      worldCopyJump={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ClusterLayer
        clusters={clusters}
        onCitySelect={onCitySelect}
        selectedFilter={selectedFilter}
      />
    </MapContainer>
  );
}

function ClusterLayer({ clusters, onCitySelect, selectedFilter }) {
  const map = useMap();

  // Handle view transitions when filter changes
  useEffect(() => {
    if (selectedFilter === "ALL") {
      // Reset to world view
      map.fitBounds([[-90, -180], [90, 180]]);
    } else if (clusters.length === 1) {
      // Fly to specific city
      const city = clusters[0];
      map.flyTo([city.lat, city.lon], 8);
    }
  }, [selectedFilter, clusters, map]);

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
  }, [clusters, onCitySelect]); // Re-run when clusters change

  return null;
}
