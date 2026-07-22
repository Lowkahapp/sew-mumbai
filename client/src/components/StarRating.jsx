export default function StarRating({ value = 0, onChange, size = 'md', readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className={`inline-flex items-center gap-0.5 ${sizeClass}`} role={readOnly ? 'img' : 'group'}>
      {stars.map((star) => {
        const active = star <= Math.round(value);
        if (readOnly) {
          return (
            <span key={star} className={active ? 'text-saffron' : 'text-navy/20'}>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={`${active ? 'text-saffron' : 'text-navy/20'} transition hover:scale-110`}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
