const styles = {
  requested: 'bg-amber-50 text-amber-800 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  completed: 'bg-navy/5 text-navy border-navy/15',
  cancelled: 'bg-stone-100 text-stone-600 border-stone-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[key] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}
