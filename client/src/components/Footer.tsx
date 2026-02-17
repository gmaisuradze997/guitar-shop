import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t-3 border-ink bg-ink text-cream">
      {/* Marquee Banner */}
      <div className="overflow-hidden border-b-3 border-cream/20 bg-primary-500 py-2">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="mx-8 font-mono text-sm font-bold uppercase tracking-widest text-cream">
              FREE SHIPPING ON ORDERS OVER $50 &bull; PREMIUM GUITAR GEAR &bull; SECURE CHECKOUT &bull; 30-DAY RETURNS &bull; EXPERT SUPPORT &bull; HANDPICKED SELECTION &bull;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="font-display text-2xl font-bold uppercase tracking-tighter text-cream"
            >
              Guitar
              <span className="bg-primary-500 text-cream px-1 -skew-x-3 inline-block ml-0.5">
                Shop
              </span>
            </Link>
            <p className="mt-4 font-body text-sm text-cream/60 leading-relaxed">
              Premium guitar pedals, accessories, and everything you need to
              craft your perfect sound.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-accent-500">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { label: "All Products", href: "/shop" },
                { label: "Pedals", href: "/shop?category=pedals" },
                { label: "Accessories", href: "/shop?category=accessories" },
                { label: "Strings", href: "/shop?category=strings" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-cream/60 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-accent-500">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              {["Contact", "Shipping Info", "Returns", "FAQ"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="font-body text-sm text-cream/60 hover:text-primary-500 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-accent-500">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="font-body text-sm text-cream/60 hover:text-primary-500 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t-2 border-cream/10 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-mono text-xs text-cream/40 uppercase">
            &copy; {new Date().getFullYear()} GuitarShop. All rights reserved.
          </p>
          <p className="font-mono text-xs text-cream/40 uppercase">
            Built with raw energy
          </p>
        </div>
      </div>
    </footer>
  );
}
