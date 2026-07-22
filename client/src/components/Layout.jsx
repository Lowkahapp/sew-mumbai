import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-navy/8 px-4 py-6 text-center text-sm text-navy/50">
        SewMumbai — tailor bookings across Mumbai localities
      </footer>
    </div>
  );
}
