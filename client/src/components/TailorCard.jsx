import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function TailorCard({ tailor }) {
  const name = tailor.user?.name || 'Tailor';
  return (
    <Link
      to={`/tailors/${tailor._id}`}
      className="card-surface group block overflow-hidden transition hover:-translate-y-0.5 hover:border-saffron/30"
    >
      <div className="h-28 bg-gradient-to-br from-navy via-navy-700 to-saffron/80" />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-navy group-hover:text-saffron-600">
            {name}
          </h3>
          <span className="rounded-lg bg-sand-200 px-2 py-0.5 text-xs font-medium text-navy/70">
            {tailor.locality}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-navy/65">{tailor.bio || 'Custom stitching & alterations'}</p>
        <div className="flex flex-wrap gap-1.5">
          {(tailor.specialties || []).slice(0, 3).map((s) => (
            <span key={s} className="rounded-md bg-navy/5 px-2 py-0.5 text-xs text-navy/70">
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 text-sm">
          <div className="flex items-center gap-1.5">
            <StarRating value={tailor.averageRating || 0} readOnly size="sm" />
            <span className="text-navy/50">({tailor.reviewCount || 0})</span>
          </div>
          <span className="font-semibold text-navy">
            from ₹{tailor.startingPrice || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
