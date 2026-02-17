import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SEO from "@/components/SEO";

export default function HomePage() {
  const { data, isLoading } = useProducts({ limit: 4 });

  return (
    <div>
      <SEO
        description="Shop premium guitar pedals, accessories, strings, and parts. Free shipping on orders over $50. Expert gear advice and 30-day returns."
        canonical="https://guitarshop.com"
      />
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden border-b-3 border-ink bg-ink noise-overlay">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            {/* Glitch heading */}
            <h1
              className="glitch-text font-display text-5xl font-bold uppercase leading-none tracking-tighter text-cream sm:text-7xl lg:text-8xl"
              data-text="Your Tone, Your Sound"
            >
              Your Tone,
              <br />
              <span className="inline-block bg-primary-500 text-cream px-3 py-1 -skew-x-3 mt-2">
                Your Sound
              </span>
            </h1>

            <p className="mt-8 max-w-lg font-body text-lg leading-relaxed text-cream/70">
              Premium guitar pedals, accessories, and everything you need to
              craft your perfect sound. From boutique effects to everyday
              essentials.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="brutal-btn bg-accent-500 text-ink px-8 py-4 text-base"
              >
                Shop Now
              </Link>
              <Link
                to="/shop?category=pedals"
                className="brutal-btn bg-cream text-ink px-8 py-4 text-base"
              >
                Browse Pedals &rarr;
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute right-8 top-8 hidden lg:block">
            <div className="h-32 w-32 border-4 border-accent-500 rotate-12 opacity-30" />
          </div>
          <div className="absolute right-24 bottom-12 hidden lg:block">
            <div className="h-20 w-20 bg-primary-500 -rotate-6 opacity-20" />
          </div>
          <div className="absolute right-48 top-24 hidden lg:block">
            <div className="h-16 w-16 border-4 border-primary-500 rotate-45 opacity-20" />
          </div>
        </div>
      </section>

      {/* ═══ Scrolling Text Divider ═══ */}
      <div className="overflow-hidden border-b-3 border-ink bg-accent-500 py-3">
        <div className="flex animate-marquee-reverse whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="mx-4 font-display text-lg font-bold uppercase tracking-widest text-ink"
            >
              PEDALS &bull; ACCESSORIES &bull; STRINGS &bull; PARTS &bull; EFFECTS &bull; BOUTIQUE GEAR &bull; TONE MACHINES &bull;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ═══ Categories Section ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, idx) => (
            <Link
              key={category.name}
              to={category.href}
              className="brutal-card stagger-item group overflow-hidden bg-white p-6"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center border-3 border-ink ${category.iconBg}`}
              >
                <span className="text-xl">{category.icon}</span>
              </div>
              <h3 className="font-display text-lg font-bold uppercase text-ink group-hover:text-primary-500 transition-colors">
                {category.name}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/60">
                {category.description}
              </p>
              <span className="mt-4 inline-block font-display text-sm font-bold uppercase text-primary-500">
                Browse &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Featured Products ═══ */}
      <section className="border-y-3 border-ink bg-cream-dark">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
              Featured
            </h2>
            <Link
              to="/shop"
              className="brutal-btn bg-white text-ink px-4 py-2 text-sm"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
              : data?.data.map((product, idx) => (
                <div
                  key={product.id}
                  className="stagger-item"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
          </div>

          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="mt-8 border-3 border-ink border-dashed p-8 text-center">
              <p className="font-display text-lg font-bold uppercase text-ink/50">
                Products coming soon — check back for our latest arrivals.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Why Shop With Us ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Why Shop With Us
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk, idx) => (
            <div
              key={perk.title}
              className="stagger-item border-3 border-ink bg-white p-6 shadow-[4px_4px_0px_0px_#0A0A0A]"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex h-14 w-14 items-center justify-center border-3 border-ink bg-accent-500 text-ink">
                {perk.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold uppercase text-ink">
                {perk.title}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/60 leading-relaxed">
                {perk.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="border-y-3 border-ink bg-primary-500">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tighter text-cream sm:text-5xl">
            Ready to Find Your Sound?
          </h2>
          <p className="mt-4 font-body text-lg text-cream/80">
            Explore our full catalog of premium guitar gear.
          </p>
          <Link
            to="/shop"
            className="brutal-btn mt-8 inline-block bg-ink text-cream px-10 py-4 text-base border-cream"
          >
            Explore the Shop
          </Link>
        </div>
      </section>
    </div>
  );
}

const categories = [
  {
    name: "Effects Pedals",
    description: "Overdrive, delay, reverb, and more",
    href: "/shop?category=pedals",
    icon: "🎸",
    iconBg: "bg-purple-300",
  },
  {
    name: "Accessories",
    description: "Cables, power supplies, pedalboards",
    href: "/shop?category=accessories",
    icon: "🔌",
    iconBg: "bg-signal-300",
  },
  {
    name: "Strings",
    description: "Electric guitar strings by gauge & brand",
    href: "/shop?category=strings",
    icon: "🎵",
    iconBg: "bg-accent-500",
  },
  {
    name: "Parts & Hardware",
    description: "Pickups, knobs, switches, bridges",
    href: "/shop?category=parts",
    icon: "🔧",
    iconBg: "bg-primary-300",
  },
];

const perks = [
  {
    title: "Free Shipping",
    description: "Free shipping on all orders over $50. No hidden fees, no surprises.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.143-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.988-1.08a20.454 20.454 0 0 0-3.024 0c-.566.032-.988.512-.988 1.08v.958m4 0H7.5m9 0h2.25m-12 0H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H7.5Z" />
      </svg>
    ),
  },
  {
    title: "Secure Checkout",
    description: "Industry-standard encryption keeps your payment info safe and sound.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Expert Support",
    description: "Our team of guitar gear experts is here to help you find the right products.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];
