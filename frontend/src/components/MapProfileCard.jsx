import "./MapProfileCard.css";
import VerifiedCardWrapper from "./VerifiedCardWrapper";
import VerifiedBadge from "./VerifiedBadge";
import ReferRankBadgeMulti from "./ReferRankBadgeMulti";

export default function MapProfileCard({ profile }) {
  const verifiedLinks =
    typeof profile.verified_links_count === "number"
      ? profile.verified_links_count
      : 0;

  const hasVerifiedContent = !!profile.address_verified || verifiedLinks > 0;
  const isVerified = hasVerifiedContent;
  const isFeatured = !!profile.featured;

  const toNum = (v) => (v === null || v === undefined ? 0 : Number(v));

  const hasRank =
    (profile.referral_rank !== null && profile.referral_rank !== undefined) ||
    toNum(profile.rank_alltime) > 0 ||
    toNum(profile.rank_weekly) > 0 ||
    toNum(profile.rank_monthly) > 0 ||
    toNum(profile.rank_daily) > 0;

  const avatarClass =
    "avatar-wrapper " +
    (hasRank
      ? isVerified
        ? "avatar-verified-rank"
        : "avatar-unverified-rank"
      : isVerified
      ? "avatar-verified"
      : "avatar-unverified");

  console.log("MapProfileCard DEBUG:", {
    name: profile.name,
    isVerified,
    hasRank,
    avatarClass,
    referral_rank: profile.referral_rank,
    rank_alltime: profile.rank_alltime,
    rank_weekly: profile.rank_weekly,
    rank_monthly: profile.rank_monthly,
    rank_daily: profile.rank_daily,
  });

  return (
    <VerifiedCardWrapper
        verifiedCount={profile.verified_links_count ?? 0}
        featured={profile.featured}
        className="mb-2"
    >
      <a
        href={profile.profileurl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 no-underline text-white w-full"
      >
      <div className={avatarClass}>

        {profile.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt={profile.name}
            className="avatar-img"
          />
        ) : (
          <span className="avatar-initial">
            {(profile.name || "?").charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="card-right">
        <div className="name-row">
          <span className="name">{profile.name}</span>

          {isVerified && (
            <VerifiedBadge verified={true} compact={true} />
          )}
        </div>

<div className="category">
  {(profile.nearest_city_name || profile.city) && (
    <>
      {`${profile.nearest_city_name ?? profile.city}`}
    </>
  )}

  {profile.rank_alltime > 0 && (
    <>
      {" "}
      <ReferRankBadgeMulti rank={profile.rank_alltime} period="all" />
    </>
  )}
</div>
      </div>
      </a>
    </VerifiedCardWrapper>
  );
}
