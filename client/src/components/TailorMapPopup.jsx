import { Link } from 'react-router-dom';
import StarRating from './StarRating';

function tailorName(t) {
  return t.businessName || t.shopName || t.user?.name || 'Tailor';
}

export default function TailorMapPopup({ tailor }) {
  const name = tailorName(tailor);
  const rating = tailor.averageRating ?? 0;
  const tags = (tailor.specialties || []).slice(0, 3);

  return (
    <div className="tailor-map-popup-card">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400/90">
        {tailor.neighborhood || tailor.locality || 'Mumbai'}
      </p>
      <h3 className="mt-1 font-display text-base font-bold leading-tight text-white">{name}</h3>

      {tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span key={tag} className="tailor-map-popup-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-2">
        <StarRating value={rating} readOnly size="sm" />
        <span className="text-sm font-semibold text-white/90">
          {rating > 0 ? rating.toFixed(1) : 'New tailor'}
        </span>
        {tailor.reviewCount ? (
          <span className="text-xs text-white/45">({tailor.reviewCount} reviews)</span>
        ) : null}
      </div>

      <Link to={`/tailors/${tailor._id}`} className="tailor-map-popup-btn">
        View Profile
      </Link>
    </div>
  );
}
