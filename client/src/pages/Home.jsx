import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LocalitySelect from '../components/LocalitySelect';

export default function Home() {
  const [locality, setLocality] = useState('');
  const navigate = useNavigate();

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set('locality', locality);
    navigate(`/tailors?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-14 text-white sm:px-10 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(224,122,61,0.45), transparent 40%), radial-gradient(circle at 85% 30%, rgba(255,255,255,0.12), transparent 35%)',
        }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-100/90">
          Mumbai · Local · Trusted
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          Sew<span className="text-saffron">Mumbai</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-white/75 sm:text-lg">
          Book skilled tailors by locality — blouses, alterations, and custom fits near you.
        </p>

        <form
          onSubmit={search}
          className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-soft sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <LocalitySelect value={locality} onChange={setLocality} includeAll />
          </div>
          <button type="submit" className="btn-primary w-full sm:w-auto sm:px-6">
            Find tailors
          </button>
        </form>

        <p className="mt-6 text-sm text-white/70">
          Are you a tailor?{' '}
          <Link to="/become-tailor" className="font-semibold text-saffron-100 underline">
            List your workshop
          </Link>
        </p>

        <div className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/trends/colors"
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
          >
            Color trends
          </Link>
          <Link
            to="/trends/design"
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
          >
            Design trends
          </Link>
        </div>
      </div>
    </section>
  );
}
