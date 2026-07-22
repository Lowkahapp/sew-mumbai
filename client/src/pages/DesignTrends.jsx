import { Link } from 'react-router-dom';
import { DESIGN_TRENDS, SEASON_LABEL } from '../constants/trends';

const LEVEL_STYLE = {
  Easy: 'bg-emerald-50 text-emerald-800',
  Moderate: 'bg-amber-50 text-amber-800',
  Advanced: 'bg-rose-50 text-rose-800',
};

export default function DesignTrends() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-navy-800 to-navy px-6 py-12 text-white sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-12deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)',
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron-100/90">
            {SEASON_LABEL} · Style guide
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Design trends</h1>
          <p className="mt-3 text-white/75">
            Silhouettes and details Mumbai tailors are stitching most — from statement sleeves to
            wide-leg pants.
          </p>
          <Link
            to="/trends/colors"
            className="btn-secondary mt-6 inline-flex bg-white/10 text-white hover:bg-white/20"
          >
            See color trends →
          </Link>
        </div>
      </header>

      <section aria-labelledby="design-grid-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="design-grid-heading" className="font-display text-2xl font-semibold text-navy">
              What&apos;s in demand
            </h2>
            <p className="mt-1 text-sm text-navy/60">
              Ask your tailor about these cuts when you book.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-navy/50">
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-800">Easy</span>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">Moderate</span>
            <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-800">Advanced</span>
          </div>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {DESIGN_TRENDS.map((trend, index) => (
            <li key={trend.id}>
              <article className="card-surface relative h-full overflow-hidden p-5">
                <span className="absolute right-4 top-4 font-display text-5xl font-bold text-navy/[0.04]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="relative space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[trend.level]}`}
                    >
                      {trend.level}
                    </span>
                    {trend.garments.map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-medium text-navy/60"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-navy">{trend.title}</h3>
                  <p className="font-medium text-navy/80">{trend.summary}</p>
                  <p className="text-sm leading-relaxed text-navy/60">{trend.detail}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-surface space-y-3 p-6">
          <h2 className="font-display text-xl font-semibold text-navy">For customers</h2>
          <p className="text-sm text-navy/65">
            Save your measurements, pick a trend, and attach both when you book. Tailors see your
            notes and sizes on every request.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/measurements" className="btn-secondary">
              My measurements
            </Link>
            <Link to="/tailors" className="btn-primary">
              Book a tailor
            </Link>
          </div>
        </article>
        <article className="card-surface space-y-3 p-6">
          <h2 className="font-display text-xl font-semibold text-navy">For tailors</h2>
          <p className="text-sm text-navy/65">
            Highlight these styles in your portfolio and services — customers search by locality and
            specialty.
          </p>
          <Link to="/become-tailor" className="btn-secondary inline-flex">
            List your workshop
          </Link>
        </article>
      </section>
    </div>
  );
}
