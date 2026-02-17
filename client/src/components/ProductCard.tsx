import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import type { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  pedals: "bg-purple-300 text-ink",
  overdrive: "bg-primary-300 text-ink",
  distortion: "bg-red-300 text-ink",
  fuzz: "bg-pink-300 text-ink",
  delay: "bg-signal-300 text-ink",
  reverb: "bg-cyan-300 text-ink",
  modulation: "bg-teal-300 text-ink",
  compression: "bg-yellow-300 text-ink",
  boost: "bg-amber-300 text-ink",
  looper: "bg-green-300 text-ink",
  tuner: "bg-lime-300 text-ink",
  accessories: "bg-indigo-300 text-ink",
  strings: "bg-emerald-300 text-ink",
  parts: "bg-slate-300 text-ink",
};

const placeholderColors = [
  "bg-purple-400",
  "bg-primary-500",
  "bg-signal-500",
  "bg-emerald-400",
  "bg-pink-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-cyan-400",
];

function getPlaceholderColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return placeholderColors[Math.abs(hash) % placeholderColors.length];
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const categorySlug = product.category?.slug ?? "";
  const badgeColor = categoryColors[categorySlug] ?? "bg-cream-dark text-ink";
  const placeholderBg = getPlaceholderColor(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="brutal-card group flex flex-col overflow-hidden bg-white"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden border-b-3 border-ink bg-cream-dark">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${placeholderBg}`}
          >
            <div className="text-center text-white/90">
              <svg
                className="mx-auto h-12 w-12 opacity-80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
                />
              </svg>
              <p className="mt-2 font-display text-sm font-bold uppercase">{product.brand}</p>
            </div>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton
            productId={product.id}
            size="sm"
            className="border-2 border-ink bg-white p-1 shadow-[2px_2px_0px_0px_#0A0A0A] hover:bg-cream"
          />
        </div>

        {/* Sale badge */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="brutal-badge absolute left-2 top-2 bg-primary-500 text-cream">
            SALE
          </span>
        )}

        {/* Out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="brutal-badge bg-white text-ink px-3 py-1 text-sm">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Quick add */}
        {product.inStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center border-3 border-ink bg-accent-500 text-ink opacity-0 shadow-[2px_2px_0px_0px_#0A0A0A] transition-all duration-150 hover:bg-primary-500 hover:text-cream group-hover:opacity-100"
            title="Add to cart"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category badge */}
        <span className={`brutal-badge mb-2 inline-block w-fit ${badgeColor}`}>
          {product.category?.name ?? "Uncategorized"}
        </span>

        {/* Name */}
        <h3 className="font-display text-sm font-bold uppercase tracking-tight text-ink group-hover:text-primary-500 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Brand */}
        <p className="mt-1 font-mono text-xs text-ink/50 uppercase">{product.brand}</p>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-3.5 w-3.5 ${star <= Math.round(product.rating)
                      ? "text-primary-500"
                      : "text-ink/15"
                    }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-ink/50">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2 pt-3 border-t-2 border-ink/10">
          <span className="font-mono text-xl font-bold text-ink">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="font-mono text-sm text-ink/30 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
