export const API_URL = "https://zcashme-map-api.trinath-panda-6cd.workers.dev/";

export const MAP_CONFIG = {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxBounds: [
        [-90, -180],
        [90, 180],
    ],
    maxBoundsViscosity: 1.0,
    worldCopyJump: true,
};

export const TILE_URLS = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

export const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
