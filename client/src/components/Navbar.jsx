import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-saffron' : 'text-navy/70 hover:text-navy'}`;

export default function Navbar() {
  const { user, logout } = useAuth();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'tailor'
        ? '/tailor'
        : '/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-navy/8 bg-sand-100/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-navy sm:text-2xl">
          Sew<span className="text-saffron">Mumbai</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <NavLink to="/tailors" className={linkClass}>
            Find Tailors
          </NavLink>
          {user && (
            <NavLink to={dashboardPath} className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-navy/60 sm:inline">
                {user.name}
              </span>
              <button type="button" onClick={logout} className="btn-ghost px-3 py-2">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="btn-primary px-3 py-2">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
