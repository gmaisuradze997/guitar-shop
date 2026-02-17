import { Link } from "react-router-dom";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { ShoppingCartIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import SEO from "@/components/SEO";

export default function WishlistPage() {
  const { data: items, isLoading } = useWishlist();
  const toggle = useToggleWishlist();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  function handleAddToCart(item: NonNullable<typeof items>[number]) {
    addItem({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
    });
    setAddedIds((prev) => new Set(prev).add(item.product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.product.id);
        return next;
      });
    }, 2000);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-ink">
          My Wishlist
        </h1>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-4 border-3 border-ink/10 bg-white p-4"
            >
              <div className="h-24 w-24 bg-cream-dark" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 bg-cream-dark" />
                <div className="h-3 w-1/4 bg-cream-dark" />
                <div className="h-5 w-20 bg-cream-dark" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SEO title="My Wishlist" noIndex />
      <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-ink">
        My Wishlist
      </h1>

      {!items || items.length === 0 ? (
        <div className="mt-16 text-center">
          <HeartIcon className="mx-auto h-16 w-16 text-ink/20" />
          <h2 className="mt-4 font-display text-2xl font-bold uppercase text-ink">
            Your Wishlist is Empty
          </h2>
          <p className="mt-2 font-body text-sm text-ink/60">
            Save items you love to your wishlist. They&apos;ll be waiting for
            you here.
          </p>
          <Link
            to="/shop"
            className="brutal-btn mt-6 inline-block bg-primary-500 text-cream px-8 py-3 text-sm"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const added = addedIds.has(product.id);
            return (
              <div
                key={item.id}
                className="brutal-card flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center"
              >
                {/* Product image */}
                <Link
                  to={`/product/${product.id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden border-2 border-ink bg-cream-dark"
                >
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-cream-dark">
                      <span className="font-mono text-xs text-ink/30">No image</span>
                    </div>
                  )}
                </Link>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product.id}`}
                    className="font-display text-sm font-bold uppercase text-ink hover:text-primary-500 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs text-ink/50 uppercase">
                    {product.brand}
                    {product.category && ` / ${product.category.name}`}
                  </p>
                  {product.reviewCount > 0 && (
                    <div className="mt-1 flex items-center gap-1">
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
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-lg font-bold text-ink">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <span className="font-mono text-sm text-ink/30 line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                  </div>
                  {!product.inStock && (
                    <span className="brutal-badge mt-1 inline-block bg-primary-100 text-primary-700">
                      SOLD OUT
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!product.inStock || added}
                    className={`brutal-btn flex items-center gap-2 px-4 py-2 text-sm ${added
                        ? "bg-accent-500 text-ink"
                        : product.inStock
                          ? "bg-primary-500 text-cream"
                          : "cursor-not-allowed bg-cream-dark text-ink/40"
                      }`}
                  >
                    {added ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      toggle.mutate({
                        productId: product.id,
                        isWishlisted: true,
                      })
                    }
                    disabled={toggle.isPending}
                    className="brutal-btn flex items-center gap-1.5 bg-white text-ink px-3 py-2 text-sm hover:bg-primary-500 hover:text-cream"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
