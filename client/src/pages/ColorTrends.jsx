import { Link } from 'react-router-dom';
import { COLOR_TRENDS, PALETTE_GROUPS, SEASON_LABEL } from '../constants/trends';

function Swatch({ hex, name, large = false }) {
  return (
    <div className="group flex flex-col items-center gap-2">
      <div
        className={`rounded-2xl border border-navy/10 shadow-soft transition group-hover:scale-105 ${
          large ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-14 w-14'
        }`}
        style={{ backgroundColor: hex }}
        title={name}
      />
      {name && (
        <div className="text-center">
          <p className="text-xs font-medium text-navy">{name}</p>
          <p className="font-mono text-[10px] uppercase text-navy/45">{hex}</p>
        </div>
      )}
    </div>
  );
}

export default function ColorTrends() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-12 text-white sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 80%, rgba(224,122,61,0.5), transparent 45%), radial-gradient(circle at 90% 20%, rgba(200,104,74,0.35), transparent 40%)',
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron-100/90">
            {SEASON_LABEL} · Style guide
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Color trends</h1>
          <p className="mt-3 text-white/75">
            Palette inspiration for blouses, kurtas, and custom pieces — share these with your
            tailor when you book.
          </p>
          <Link to="/trends/design" className="btn-secondary mt-6 inline-flex bg-white/10 text-white hover:bg-white/20">
            See design trends →
          </Link>
        </div>
      </header>

      <section aria-labelledby="palette-groups-heading">
        <h2 id="palette-groups-heading" className="font-display text-2xl font-semibold text-navy">
          Ready-made palettes
        </h2>
        <p className="mt-1 text-sm text-navy/60">Copy a full combo for your next stitching job.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {PALETTE_GROUPS.map((group) => (
            <article key={group.name} className="card-surface p-5">
              <h3 className="font-semibold text-navy">{group.name}</h3>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {group.colors.map((hex) => (
                  <Swatch key={hex} hex={hex} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="color-cards-heading">
        <h2 id="color-cards-heading" className="font-display text-2xl font-semibold text-navy">
          Trending shades
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {COLOR_TRENDS.map((color) => (
            <article
              key={color.id}
              className="card-surface overflow-hidden p-0"
            >
              <div className="flex flex-col sm:flex-row">
                <div
                  className="flex min-h-[120px] w-full items-end p-4 sm:min-h-0 sm:w-36 sm:shrink-0"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="rounded-full bg-black/20 px-2 py-0.5 font-mono text-xs text-white backdrop-blur-sm">
                    {color.hex}
                  </span>
                </div>
                <div className="flex-1 space-y-3 p-5">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-navy">{color.name}</h3>
                    <p className="text-sm text-saffron-600">{color.mood}</p>
                  </div>
                  <p className="text-sm text-navy/70">{color.tip}</p>
                  <p className="text-xs text-navy/50">
                    Pairs with:{' '}
                    <span className="font-medium text-navy/70">{color.pairWith.join(' · ')}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {color.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-sand-200 px-2.5 py-0.5 text-xs font-medium text-navy/65"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-navy/15 bg-sand-100 px-6 py-10 text-center">
        <h2 className="font-display text-xl font-semibold text-navy">Ready to stitch?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy/60">
          Find a tailor near you and mention your preferred colors in the booking notes.
        </p>
        <Link to="/tailors" className="btn-primary mt-5 inline-flex">
          Find tailors
        </Link>
      </section>
    </div>
  );
}
