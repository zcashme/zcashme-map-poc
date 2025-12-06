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
      zcasher_map_data (
        city,
        country,
        lat,
        lon
      )
  `);


console.log("RAW SUPABASE DATA:", data);

      if (error) {
        console.error("Map profile load error:", error);
        setLoading(false);
        return;
      }

      const profilesWithCoords = data
        .filter((p) => p.zcasher_map_data)
        .map((p) => {
          const m = p.zcasher_map_data;
  return {
    id: p.id,
    name: p.name,
    category: p.category || "Unknown Failure",
    profile_image_url: p.profile_image_url,
    verified_links_count: p.verified_links_count,
    address_verified: p.address_verified,
    featured: p.featured,
    profileurl: `https://zcash.me/${p.slug}`,

    lat: m.lat,
    lon: m.lon,

    // ✅ ADD THESE FIELDS
    city: m.city,
    country: m.country,

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
