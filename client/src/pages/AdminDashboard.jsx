import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

/**
 * Admin Approval View — table of unapproved tailors + one-click Approve
 */
export default function AdminDashboard() {
  const [tailors, setTailors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pending');
      const pendingTailors = (data.tailors || []).filter(
        (t) => t.isApproved === false || t.approvalStatus !== 'approved'
      );
      setTailors(pendingTailors);
      setServices(
        (data.services || []).filter(
          (s) => s.isApproved === false || s.approvalStatus !== 'approved'
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approveTailor = async (id) => {
    setError('');
    setMessage('');
    setApprovingId(id);
    try {
      await api.put(`/admin/tailors/${id}/approve`, {
        approved: true,
        isApproved: true,
        approvalStatus: 'approved',
      });
      setTailors((prev) => prev.filter((t) => t._id !== id));
      setMessage('Tailor approved — now searchable on the platform');
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setApprovingId(null);
    }
  };

  const rejectTailor = async (id) => {
    setError('');
    setMessage('');
    setApprovingId(id);
    try {
      await api.put(`/admin/tailors/${id}/approve`, {
        approved: false,
        isApproved: false,
        approvalStatus: 'rejected',
      });
      setTailors((prev) => prev.filter((t) => t._id !== id));
      setMessage('Tailor rejected');
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setApprovingId(null);
    }
  };

  const approveService = async (id, approved) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/services/${id}/approve`, {
        approved,
        isApproved: approved,
        approvalStatus: approved ? 'approved' : 'rejected',
      });
      setServices((prev) => prev.filter((s) => s._id !== id));
      setMessage(approved ? 'Service approved' : 'Service rejected');
    } catch (err) {
      setError(err.message);
      await load();
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
            Admin approval
          </p>
          <h1 className="font-display text-3xl font-bold text-navy">Pending reviews</h1>
          <p className="text-navy/60">
            Approve unapproved tailor profiles so they appear in customer search
          </p>
        </div>
        <button type="button" className="btn-ghost text-sm" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {message}
        </p>
      )}

      <section aria-labelledby="unapproved-tailors-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            id="unapproved-tailors-heading"
            className="font-display text-xl font-semibold text-navy"
          >
            Unapproved tailors
          </h2>
          <span className="rounded-lg bg-sand-200 px-2.5 py-1 text-xs font-semibold text-navy/60">
            {tailors.length} pending
          </span>
        </div>

        {loading && tailors.length === 0 && (
          <div className="card-surface h-40 animate-pulse bg-sand-200/80" />
        )}

        {!loading && tailors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-navy/15 px-4 py-12 text-center">
            <p className="font-display text-lg text-navy/70">All clear</p>
            <p className="mt-1 text-sm text-navy/45">No unapproved tailor profiles right now.</p>
          </div>
        )}

        {tailors.length > 0 && (
          <div className="card-surface overflow-hidden">
            {/* Mobile cards */}
            <ul className="divide-y divide-navy/5 md:hidden">
              {tailors.map((t) => {
                const busy = approvingId === t._id;
                return (
                  <li key={t._id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-navy">{t.user?.name || 'Tailor'}</p>
                        <p className="text-sm text-navy/55">{t.user?.email}</p>
                        <p className="mt-1 text-sm text-saffron-600">{t.locality}</p>
                      </div>
                      <StatusBadge status={t.approvalStatus || 'pending'} />
                    </div>
                    <p className="text-xs text-navy/50">
                      {(t.specialties || []).join(', ') || 'No specialties'}
                    </p>
                    <button
                      type="button"
                      className="btn-primary w-full"
                      disabled={busy}
                      onClick={() => approveTailor(t._id)}
                    >
                      {busy ? 'Approving…' : 'Approve'}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-navy/10 bg-sand-100 text-xs uppercase tracking-wide text-navy/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Tailor
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Locality
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Specialties
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {tailors.map((t) => {
                    const busy = approvingId === t._id;
                    return (
                      <tr key={t._id} className="hover:bg-sand-100/80">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-navy">{t.user?.name || 'Tailor'}</p>
                          <p className="text-xs text-navy/50">{t.user?.email}</p>
                          {t.user?.phone && (
                            <p className="text-xs text-navy/40">{t.user.phone}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy/80">{t.locality}</td>
                        <td className="max-w-xs px-4 py-3 text-navy/65">
                          <span className="line-clamp-2">
                            {(t.specialties || []).join(', ') || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.approvalStatus || 'pending'} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              className="btn-primary px-3 py-2 text-xs"
                              disabled={busy}
                              onClick={() => approveTailor(t._id)}
                            >
                              {busy ? '…' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              className="btn-ghost px-3 py-2 text-xs text-rose-700"
                              disabled={busy}
                              onClick={() => rejectTailor(t._id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="pending-services-heading" className="space-y-3">
        <h2
          id="pending-services-heading"
          className="font-display text-xl font-semibold text-navy"
        >
          Pending services
        </h2>
        {services.length === 0 && !loading && (
          <p className="text-sm text-navy/50">No pending services.</p>
        )}
        <ul className="space-y-3">
          {services.map((s) => (
            <li key={s._id}>
              <article className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="font-semibold text-navy">{s.name}</h3>
                  <p className="text-sm text-navy/60">
                    {s.tailor?.user?.name || 'Tailor'} · {s.category} · ₹{s.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => approveService(s._id, true)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => approveService(s._id, false)}
                  >
                    Reject
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
