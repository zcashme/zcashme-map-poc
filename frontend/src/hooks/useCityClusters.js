import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useCityClusters() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1) Dummy map rows (fallback)
        const { data: mapRows, error: mapError } = await supabase
          .from("zcasher_map_data")
          .select("zcasher_id, city, country, lat, lon");

        if (mapError) throw mapError;

        const dummyByUserId = new Map();
        for (const r of mapRows || []) dummyByUserId.set(r.zcasher_id, r);

        // 2) Profiles (REAL location metadata)
        const { data: profiles, error: profileError } = await supabase
          .from("zcasher_with_referral_rank")
          .select(`
            id,
            name,
            slug,

            created_at,
            profile_image_url,
            verified_links_count,
            address_verified,
            featured,
            referral_rank,
            rank_alltime,
            rank_weekly,
            rank_monthly,
            rank_daily,
            nearest_city_id,
            nearest_city_name
          `);

        if (profileError) throw profileError;

        // 3) Load all referenced cities (NO FK, manual join)
        const cityIds = Array.from(
          new Set(
            profiles
              .map(p => p.nearest_city_id)
              .filter(id => id != null)
          )
        );

        const { data: cities, error: cityError } = await supabase
          .from("worldcities")
          .select("id, country, lat, lng")
          .in("id", cityIds);

        if (cityError) throw cityError;

        const cityById = new Map();
        for (const c of cities || []) cityById.set(c.id, c);

        // 4) Build clusters
        const clusterMap = new Map();

        for (const p of profiles || []) {
          const dummy = dummyByUserId.get(p.id);
          const city = cityById.get(p.nearest_city_id);

          const hasReal =
            !!city &&
            city.lat != null &&
            city.lng != null &&
            p.nearest_city_name &&
            String(p.nearest_city_name).trim() !== "";

          const hasDummy =
            !!dummy &&
            dummy.lat != null &&
            dummy.lon != null &&
            dummy.city &&
            dummy.country;

          if (!hasReal && !hasDummy) continue;

          const lat = hasReal ? city.lat : dummy.lat;
          const lon = hasReal ? city.lng : dummy.lon;

          const resolvedCity = hasReal ? p.nearest_city_name : dummy.city;
          const resolvedCountry = hasReal ? city.country : dummy.country;

          const key = `${resolvedCity}::${resolvedCountry}`;

          let cluster = clusterMap.get(key);
          if (!cluster) {
            cluster = {
              city: resolvedCity,
              country: resolvedCountry,
              lat,
              lon,
              users: [],
            };
            clusterMap.set(key, cluster);
          }

          cluster.users.push({
            id: p.id,
            name: p.name,

            profileurl: (() => {
              const safeName = p.name.trim().replace(/\s+/g, "_");
              return p.address_verified
                ? `https://zcash.me/${safeName}`
                : `https://zcash.me/${safeName}-${p.id}`;
            })(),

            profile_image_url: p.profile_image_url,
            verified_links_count: p.verified_links_count,
            address_verified: p.address_verified,
            featured: p.featured,
            created_at: p.created_at,
            referral_rank: p.referral_rank,
            rank_alltime: p.rank_alltime,
            rank_weekly: p.rank_weekly,
            rank_monthly: p.rank_monthly,
            rank_daily: p.rank_daily,

            location_is_real: hasReal,
            nearest_city_id: p.nearest_city_id ?? null,
            nearest_city_name: p.nearest_city_name ?? null,
          });
        }

        const clusters = Array.from(clusterMap.values()).map(c => ({
          ...c,
          count: c.users.length,
          has_real_users: c.users.some(u => u.location_is_real),
        }));

        setData(clusters);
        setError(null);
      } catch (err) {
        console.error("Error loading clusters:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
