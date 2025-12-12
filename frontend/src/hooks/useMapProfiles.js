import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useMapProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("zcasher_with_referral_rank")
        .select(`
          id,
          name,
          category,
          profile_image_url,
          verified_links_count,
          address_verified,
          featured,
          referral_rank,
          rank_alltime,
          rank_weekly,
          rank_monthly,
          rank_daily,
          slug,
          created_at,

          nearest_city_id,
          nearest_city_name,

          zcasher_map_data (
            city,
            country,
            lat,
            lon
          ),

          worldcities:nearest_city_id (
            id,
            city_ascii,
            admin_name,
            country,
            lat,
            lng
          )
        `);

      if (error) {
        console.error("Map profile load error:", error);
        setLoading(false);
        return;
      }

      const profilesWithCoords = (data || [])
        // keep users that have either real city or dummy map row
        .filter((p) => p.worldcities || p.zcasher_map_data)
        .map((p) => {
          const hasReal =
            !!p.worldcities &&
            p.worldcities.lat != null &&
            p.worldcities.lng != null;

          const lat = hasReal
            ? p.worldcities.lat
            : p.zcasher_map_data?.lat;

          const lon = hasReal
            ? p.worldcities.lng
            : p.zcasher_map_data?.lon;

          const city = hasReal
            ? (p.nearest_city_name || p.worldcities.city_ascii || "Unknown")
            : (p.zcasher_map_data?.city || "Unknown");

          const country = hasReal
            ? (p.worldcities.country || "Unknown")
            : (p.zcasher_map_data?.country || "Unknown");

          return {
            id: p.id,
            name: p.name,
            category: p.category || "Unknown",
            profile_image_url: p.profile_image_url,
            verified_links_count: p.verified_links_count,
            address_verified: p.address_verified,
            featured: p.featured,
            profileurl: `https://zcash.me/${p.slug}`,

            // coords used by map
            lat,
            lon,

            // label fields used by panels / filters
            city,
            country,

            // 🔑 ADD THIS (fixes disappearing city in single-market view)
            nearest_city_name: p.nearest_city_name ?? null,

            // flag real vs dummy
            location_is_real: hasReal,

            // ranking / metadata
            created_at: p.created_at,
            referral_rank: p.referral_rank,
            rank_alltime: p.rank_alltime,
            rank_weekly: p.rank_weekly,
            rank_monthly: p.rank_monthly,
            rank_daily: p.rank_daily,
          };
        });

      setProfiles(profilesWithCoords);
      setLoading(false);
    }

    load();
  }, []);

  return { profiles, loading };
}
