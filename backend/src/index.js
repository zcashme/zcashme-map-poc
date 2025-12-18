import Papa from "papaparse";

/**
 * Cloudflare Worker to fetch and parse CSV data for the map.
 * @module Backend
 */
export default {
  /**
   * Handle incoming requests.
   * @param {Request} request
   * @param {Object} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const file = await env.ASSETS.fetch("http://assets/zks_users_with_cities.csv");

      if (!file.ok) {
        throw new Error(`Failed to fetch CSV: ${file.statusText}`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const csvText = new TextDecoder().decode(arrayBuffer);

      // FIX BOM (important)
      const cleanedCsv = csvText.replace(/^\uFEFF/, "");

      const rows = Papa.parse(cleanedCsv, { header: true }).data;

      const clusters = {};

      rows.forEach(row => {
        if (!row.city || !row.lat || !row.lon) return;

        const city = row.city;

        if (!clusters[city]) {
          clusters[city] = {
            city: row.city,
            country: row.country,
            lat: Number(row.lat),
            lon: Number(row.lon),
            users: [],
            count: 0
          };
        }

        // Add username with profile and category
        if (row.name) {
          clusters[city].users.push({
            name: row.name,
            profileurl: row.profileurl || ""
          });
        }
        clusters[city].count = clusters[city].users.length;
      });

      return new Response(JSON.stringify(Object.values(clusters)), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      console.error("Backend Error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
