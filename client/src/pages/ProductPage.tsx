import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ChevronRightIcon,
  ShoppingCartIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useDeleteReview } from "@/hooks/useReviews";
import { useAuthStore } from "@/stores/authStore";
import ReviewForm from "@/components/ReviewForm";
import WishlistButton from "@/components/WishlistButton";
import SEO from "@/components/SEO";

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
  const idx = Math.abs(hash) % placeholderColors.length;
  return placeholderColors[idx] as string;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id ?? "");
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  const deleteReview = useDeleteReview();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-cream-dark" />
            <div className="h-4 w-4 bg-cream-dark" />
            <div className="h-4 w-20 bg-cream-dark" />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="aspect-square border-3 border-ink/10 bg-cream-dark" />
            <div className="space-y-4">
              <div className="h-4 w-20 bg-cream-dark" />
              <div className="h-8 w-3/4 bg-cream-dark" />
              <div className="h-4 w-24 bg-cream-dark" />
              <div className="h-10 w-32 bg-cream-dark" />
              <div className="h-4 w-full bg-cream-dark" />
              <div className="h-4 w-5/6 bg-cream-dark" />
              <div className="mt-8 h-14 w-full border-3 border-ink/10 bg-cream-dark" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold uppercase text-ink">
          Product Not Found
        </h1>
        <p className="mt-2 font-body text-ink/60">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="brutal-btn flex items-center gap-2 bg-white text-ink px-4 py-2 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go Back
          </button>
          <Link
            to="/shop"
            className="brutal-btn bg-primary-500 text-cream px-4 py-2 text-sm"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = product.images.length > 0;
  const placeholderBg = getPlaceholderColor(product.id);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
        100
      )
      : null;

  const categoryForBreadcrumb = product.category;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SEO
        title={product.name}
        description={product.description?.slice(0, 160) || `Buy ${product.name} at Guitar Shop. Premium quality, fast shipping.`}
        canonical={`https://guitarshop.com/product/${product.id}`}
        ogType="product"
        ogImage={product.images[0]}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 font-mono text-xs uppercase text-ink/50">
        <Link to="/" className="hover:text-primary-500 transition-colors">
          Home
        </Link>
        <ChevronRightIcon className="h-3 w-3 shrink-0" />
        <Link to="/shop" className="hover:text-primary-500 transition-colors">
          Shop
        </Link>
        {categoryForBreadcrumb && (
          <>
            <ChevronRightIcon className="h-3 w-3 shrink-0" />
            <Link
              to={`/shop?category=${categoryForBreadcrumb.slug}`}
              className="hover:text-primary-500 transition-colors"
            >
              {categoryForBreadcrumb.name}
            </Link>
          </>
        )}
        <ChevronRightIcon className="h-3 w-3 shrink-0" />
        <span className="font-bold text-ink truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ─── Image Gallery ─── */}
        <div>
          <div className="relative aspect-square overflow-hidden border-3 border-ink bg-cream-dark shadow-[4px_4px_0px_0px_#0A0A0A]">
            {hasImages ? (
              <img
                src={product.images[selectedImageIdx]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center ${placeholderBg}`}
              >
                <div className="text-center text-white/90">
                  <svg
                    className="mx-auto h-20 w-20 opacity-80"
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
                  <p className="mt-3 font-display text-lg font-bold uppercase">
                    {product.brand}
                  </p>
                  <p className="mt-1 font-mono text-sm opacity-70">
                    No image available
                  </p>
                </div>
              </div>
            )}

            {discount && (
              <span className="brutal-badge absolute left-3 top-3 bg-primary-500 text-cream text-sm px-2 py-0.5">
                -{discount}%
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasImages && product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`h-20 w-20 shrink-0 overflow-hidden border-3 transition-all ${idx === selectedImageIdx
                      ? "border-primary-500 shadow-[3px_3px_0px_0px_#FF5722]"
                      : "border-ink hover:border-ink/60"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Product Details ─── */}
        <div className="flex flex-col">
          {/* Category & Brand */}
          <div className="flex items-center gap-3">
            {categoryForBreadcrumb && (
              <Link
                to={`/shop?category=${categoryForBreadcrumb.slug}`}
                className="brutal-badge bg-cream-dark text-ink hover:bg-accent-500 transition-colors"
              >
                {categoryForBreadcrumb.name}
              </Link>
            )}
            <span className="font-mono text-xs uppercase text-ink/50">
              {product.brand}
            </span>
          </div>

          {/* Name */}
          <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(product.rating)
                        ? "text-primary-500"
                        : "text-ink/15"
                      }`}
                  />
                ))}
              </div>
              <span className="font-mono text-sm text-ink/60">
                {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-4xl font-bold text-ink">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span className="font-mono text-lg text-ink/30 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            {discount && (
              <span className="brutal-badge bg-primary-500 text-cream">
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-6 border-t-3 border-ink pt-6">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-primary-500">
              Description
            </h2>
            <p className="mt-3 font-body text-ink/70 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock */}
          <div className="mt-6">
            {product.inStock ? (
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-accent-700" />
                <span className="font-display text-sm font-bold uppercase text-accent-700">
                  In Stock
                  {product.stockCount <= 10 && product.stockCount > 0 && (
                    <span className="ml-1 text-primary-500">
                      — Only {product.stockCount} left
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <span className="font-display text-sm font-bold uppercase text-primary-500">
                Out of Stock
              </span>
            )}
          </div>

          {/* Add to cart + Wishlist */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`brutal-btn flex flex-1 items-center justify-center gap-2 px-6 py-4 text-base ${addedToCart
                  ? "bg-accent-500 text-ink"
                  : product.inStock
                    ? "bg-primary-500 text-cream"
                    : "cursor-not-allowed bg-cream-dark text-ink/40"
                }`}
            >
              {addedToCart ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="h-5 w-5" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </button>
            <WishlistButton
              productId={product.id}
              className="flex items-center justify-center border-3 border-ink px-4 shadow-[4px_4px_0px_0px_#0A0A0A] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#0A0A0A]"
            />
          </div>

          {/* Perks */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t-3 border-ink pt-8 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <TruckIcon className="h-6 w-6 shrink-0 text-primary-500" />
              <div>
                <p className="font-display text-sm font-bold uppercase text-ink">
                  Free Shipping
                </p>
                <p className="font-mono text-xs text-ink/50">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-6 w-6 shrink-0 text-primary-500" />
              <div>
                <p className="font-display text-sm font-bold uppercase text-ink">
                  Warranty Included
                </p>
                <p className="font-mono text-xs text-ink/50">
                  1-year manufacturer warranty
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Reviews Section ─── */}
      <section className="mt-16 border-t-3 border-ink pt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold uppercase text-ink">
            Customer Reviews
            {product.reviews && product.reviews.length > 0 && (
              <span className="ml-2 font-mono text-ink/40">
                ({product.reviews.length})
              </span>
            )}
          </h2>
          {isAuthenticated &&
            product.reviews &&
            !product.reviews.some((r) => r.userId === user?.id) &&
            !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="brutal-btn bg-primary-500 text-cream px-4 py-2 text-sm"
              >
                Write a Review
              </button>
            )}
        </div>

        {/* Rating summary */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-6 flex items-center gap-4 border-3 border-ink bg-white p-4 shadow-[4px_4px_0px_0px_#0A0A0A]">
            <div className="text-center">
              <p className="font-mono text-4xl font-bold text-ink">
                {product.rating.toFixed(1)}
              </p>
              <div className="mt-1 flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(product.rating)
                        ? "text-primary-500"
                        : "text-ink/15"
                      }`}
                  />
                ))}
              </div>
              <p className="mt-1 font-mono text-xs text-ink/50">
                {product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count =
                  product.reviews?.filter((r) => r.rating === stars).length ?? 0;
                const pct =
                  product.reviews && product.reviews.length > 0
                    ? (count / product.reviews.length) * 100
                    : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-right font-mono text-xs text-ink/50">
                      {stars}
                    </span>
                    <StarIcon className="h-3.5 w-3.5 text-primary-500" />
                    <div className="h-3 flex-1 overflow-hidden border-2 border-ink bg-cream-dark">
                      <div
                        className="h-full bg-primary-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 font-mono text-xs text-ink/40">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review form */}
        {showReviewForm && (
          <div className="mt-6 border-3 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#0A0A0A]">
            <h3 className="mb-4 font-display text-lg font-bold uppercase text-ink">
              Write a Review
            </h3>
            <ReviewForm
              productId={product.id}
              onCancel={() => setShowReviewForm(false)}
              onSuccess={() => setShowReviewForm(false)}
            />
          </div>
        )}

        {/* Not authenticated */}
        {!isAuthenticated && (
          <div className="mt-6 border-3 border-ink border-dashed p-6 text-center">
            <p className="font-body text-sm text-ink/60">
              <Link
                to="/login"
                className="font-display font-bold uppercase text-primary-500 hover:underline"
              >
                Sign in
              </Link>{" "}
              to leave a review
            </p>
          </div>
        )}

        {/* Reviews list */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="mt-6 space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="border-3 border-ink bg-white p-5"
              >
                {editingReview === review.id ? (
                  <ReviewForm
                    productId={product.id}
                    existingReview={review}
                    onCancel={() => setEditingReview(null)}
                    onSuccess={() => setEditingReview(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center border-2 border-ink bg-accent-500 font-mono text-sm font-bold text-ink">
                          {review.user.firstName[0]}
                          {review.user.lastName[0]}
                        </div>
                        <span className="font-display text-sm font-bold uppercase text-ink">
                          {review.user.firstName} {review.user.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating
                                  ? "text-primary-500"
                                  : "text-ink/15"
                                }`}
                            />
                          ))}
                        </div>
                        {user?.id === review.userId && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingReview(review.id)}
                              className="p-1 text-ink/30 transition-colors hover:text-ink"
                              title="Edit review"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteReview.mutate(review.id)}
                              disabled={deleteReview.isPending}
                              className="p-1 text-ink/30 transition-colors hover:text-primary-500"
                              title="Delete review"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {review.title && (
                      <p className="mt-3 font-display font-bold uppercase text-ink">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="mt-2 font-body text-sm text-ink/70">
                        {review.body}
                      </p>
                    )}
                    <p className="mt-3 font-mono text-xs text-ink/30 uppercase">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showReviewForm && (
            <p className="mt-6 font-display text-sm font-semibold uppercase text-ink/40">
              No reviews yet. Be the first to review this product!
            </p>
          )
        )}
      </section>
    </div>
  );
}
