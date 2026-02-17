import { Link } from "react-router-dom";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import SEO from "@/components/SEO";

const FREE_SHIPPING_THRESHOLD = 50;

// ── Loading skeleton ─────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-cream-dark" />
        <div className="mt-2 h-4 w-32 bg-cream-dark" />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4 border-3 border-ink/10 bg-white p-4"
              >
                <div className="h-24 w-24 shrink-0 bg-cream-dark" />
                <div className="flex flex-1 flex-col gap-3">
                  <div className="h-5 w-3/4 bg-cream-dark" />
                  <div className="h-4 w-20 bg-cream-dark" />
                  <div className="mt-auto flex justify-between">
                    <div className="h-8 w-24 bg-cream-dark" />
                    <div className="h-5 w-16 bg-cream-dark" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="border-3 border-ink/10 bg-white p-6 space-y-4">
              <div className="h-6 w-32 bg-cream-dark" />
              <div className="h-4 w-full bg-cream-dark" />
              <div className="h-4 w-full bg-cream-dark" />
              <div className="h-px bg-cream-dark" />
              <div className="h-6 w-full bg-cream-dark" />
              <div className="h-14 w-full bg-cream-dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
    isSyncing,
  } = useCart();

  if (isLoading) {
    return <CartSkeleton />;
  }

  // ── Empty state ──────────────────────────────────────────────────────────

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <SEO title="Cart" description="Your shopping cart is empty." noIndex />
        <ShoppingBagIcon className="mx-auto h-16 w-16 text-ink/20" />
        <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-ink">
          Your Cart is Empty
        </h1>
        <p className="mt-2 font-body text-ink/60">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          to="/shop"
          className="brutal-btn mt-8 inline-block bg-primary-500 text-cream px-8 py-3 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Shipping ─────────────────────────────────────────────────────────────

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 5.99;
  const orderTotal = totalPrice + shippingCost;
  const freeShippingProgress = Math.min(
    (totalPrice / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const amountUntilFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice;

  // ── Cart with items ──────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SEO title="Cart" description={`You have ${totalItems} item(s) in your cart.`} noIndex />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-ink">
            Shopping Cart
          </h1>
          <p className="mt-1 font-mono text-sm text-ink/50 uppercase">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="brutal-btn flex items-center gap-1.5 bg-white text-ink px-3 py-2 text-sm hover:bg-primary-500 hover:text-cream"
        >
          <XMarkIcon className="h-4 w-4" />
          Clear Cart
        </button>
      </div>

      {/* Syncing */}
      {isSyncing && (
        <div className="mt-3 flex items-center gap-2 font-mono text-xs text-ink/40 uppercase">
          <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
          Syncing cart...
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Cart items ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              const atMaxStock =
                item.stockCount != null && item.quantity >= item.stockCount;

              return (
                <div
                  key={item.productId}
                  className="flex gap-4 border-3 border-ink bg-white p-4 shadow-[2px_2px_0px_0px_#0A0A0A]"
                >
                  {/* Product image */}
                  <Link
                    to={`/product/${item.productId}`}
                    className="h-24 w-24 shrink-0 overflow-hidden border-2 border-ink bg-cream-dark sm:h-28 sm:w-28"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-cream-dark">
                        <svg
                          className="h-8 w-8 text-ink/30"
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
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-display text-sm font-bold uppercase text-ink hover:text-primary-500 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 font-mono text-xs text-ink/50">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-4 p-1.5 text-ink/30 transition-colors hover:text-primary-500"
                        title="Remove item"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border-3 border-ink">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-1.5 text-ink transition-colors hover:bg-cream-dark disabled:cursor-not-allowed disabled:text-ink/20"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 border-x-3 border-ink text-center font-mono text-sm font-bold text-ink py-1.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={atMaxStock}
                          className="px-2.5 py-1.5 text-ink transition-colors hover:bg-cream-dark disabled:cursor-not-allowed disabled:text-ink/20"
                          title={
                            atMaxStock ? "Maximum stock reached" : undefined
                          }
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {atMaxStock && (
                        <span className="font-mono text-xs text-primary-500 uppercase">
                          Max stock
                        </span>
                      )}

                      <p className="font-mono text-lg font-bold text-ink">
                        ${lineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-1 font-display text-sm font-bold uppercase text-primary-500 hover:text-primary-700 transition-colors"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {/* ── Order summary ───────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 border-3 border-ink bg-white p-6 shadow-[4px_4px_0px_0px_#0A0A0A]">
            <h2 className="font-display text-lg font-bold uppercase text-ink">
              Order Summary
            </h2>

            {/* Free shipping progress */}
            {amountUntilFreeShipping > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between font-mono text-xs text-ink/50">
                  <span>Free shipping progress</span>
                  <span>
                    ${totalPrice.toFixed(2)} / ${FREE_SHIPPING_THRESHOLD}
                  </span>
                </div>
                <div className="mt-1.5 h-3 w-full overflow-hidden border-2 border-ink bg-cream-dark">
                  <div
                    className="h-full bg-accent-500 transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <p className="mt-1.5 font-mono text-xs text-ink/50">
                  Add{" "}
                  <span className="font-bold text-primary-500">
                    ${amountUntilFreeShipping.toFixed(2)}
                  </span>{" "}
                  more for free shipping
                </p>
              </div>
            )}

            <div className="mt-5 space-y-3">
              <div className="flex justify-between font-body text-sm text-ink/70">
                <span>
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="font-mono">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-ink/70">
                <span>Shipping</span>
                <span
                  className={`font-mono ${shippingCost === 0
                      ? "font-bold text-accent-700"
                      : ""
                    }`}
                >
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t-3 border-ink pt-3">
                <div className="flex justify-between">
                  <span className="font-display text-base font-bold uppercase text-ink">
                    Estimated Total
                  </span>
                  <span className="font-mono text-xl font-bold text-ink">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-ink/30">
                  Tax calculated at checkout
                </p>
              </div>
            </div>

            <button className="brutal-btn mt-6 w-full bg-primary-500 text-cream px-4 py-4 text-base">
              Proceed to Checkout
            </button>

            <Link
              to="/shop"
              className="mt-3 block text-center font-display text-sm font-semibold uppercase text-ink/40 hover:text-ink transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Perks */}
            <div className="mt-6 space-y-3 border-t-3 border-ink pt-5">
              {[
                "Secure checkout with SSL encryption",
                "Free shipping on orders over $50",
                "30-day hassle-free returns",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 font-mono text-xs text-ink/50"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-accent-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
