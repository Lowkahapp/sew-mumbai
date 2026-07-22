/** Visual "Verified Artisan" trust badge — shown when admin confirms credentials. */
export default function VerifiedArtisanBadge({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'gap-1 px-2 py-0.5 text-[10px]',
    md: 'gap-1.5 px-2.5 py-1 text-xs',
    lg: 'gap-2 px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800 ${sizes[size]} ${className}`}
      title="Verified by SewMumbai — shop license, identity, or portfolio reviewed"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={size === 'lg' ? 'h-4 w-4' : size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      Verified Artisan
    </span>
  );
}
