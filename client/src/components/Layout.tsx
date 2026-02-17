import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Announcement Marquee */}
      <div className="overflow-hidden border-b-3 border-ink bg-ink py-1.5">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 font-mono text-xs font-bold uppercase tracking-widest text-accent-500"
            >
              NEW ARRIVALS EVERY WEEK &bull; FREE SHIPPING $50+ &bull; SECURE PAYMENTS &bull; 30-DAY RETURNS &bull; EXPERT GEAR ADVICE &bull; PREMIUM QUALITY GUARANTEED &bull;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
