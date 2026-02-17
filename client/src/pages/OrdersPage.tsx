import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useOrders } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import SEO from "@/components/SEO";

// ── Status badge ────────────────────────────────────────────────────────────

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string }
> = {
  pending: { label: "Pending", bg: "bg-yellow-300" },
  processing: { label: "Processing", bg: "bg-signal-300" },
  shipped: { label: "Shipped", bg: "bg-purple-300" },
  delivered: { label: "Delivered", bg: "bg-accent-500" },
  cancelled: { label: "Cancelled", bg: "bg-primary-300" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`brutal-badge ${cfg.bg} text-ink`}>
      {cfg.label}
    </span>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-cream-dark" />
        <div className="mt-2 h-4 w-64 bg-cream-dark" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-3 border-ink/10 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-cream-dark" />
                  <div className="h-4 w-28 bg-cream-dark" />
                </div>
                <div className="h-7 w-24 bg-cream-dark" />
              </div>
              <div className="mt-4 flex gap-3">
                {[1, 2].map((j) => (
                  <div key={j} className="h-16 w-16 bg-cream-dark" />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-20 bg-cream-dark" />
                <div className="h-5 w-16 bg-cream-dark" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOrders({ page, limit: 10 });

  if (isLoading) return <OrdersSkeleton />;

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="font-display text-lg font-bold uppercase text-primary-500">
          Something went wrong loading your orders. Please try again.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block font-display text-sm font-bold uppercase text-ink hover:text-primary-500"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ── Empty state ─────────────────────────────────────────────────────────

  if (orders.length === 0 && page === 1) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ClipboardDocumentListIcon className="mx-auto h-16 w-16 text-ink/20" />
        <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight text-ink">
          No Orders Yet
        </h1>
        <p className="mt-2 font-body text-ink/60">
          When you place an order, it will appear here.
        </p>
        <Link
          to="/shop"
          className="brutal-btn mt-8 inline-block bg-primary-500 text-cream px-8 py-3 text-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  // ── Order list ──────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SEO title="My Orders" noIndex />
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-ink">
          My Orders
        </h1>
        <p className="mt-1 font-mono text-sm text-ink/50 uppercase">
          Track and manage your order history
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {orders.map((order) => {
          const itemCount = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const displayImages = order.items
            .slice(0, 4)
            .map((item) => ({
              src: item.product?.images?.[0],
              name: item.name,
            }));
          const extraItems = order.items.length - 4;

          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="brutal-card block bg-white p-5"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-ink">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink/50">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Product thumbnails */}
              <div className="mt-4 flex items-center gap-3">
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="h-16 w-16 shrink-0 overflow-hidden border-2 border-ink bg-cream-dark"
                  >
                    {img.src ? (
                      <img
                        src={img.src}
                        alt={img.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-cream-dark">
                        <svg
                          className="h-5 w-5 text-ink/30"
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
                  </div>
                ))}
                {extraItems > 0 && (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-ink bg-cream-dark font-mono text-sm font-bold text-ink/50">
                    +{extraItems}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t-2 border-ink/10 pt-3">
                <p className="font-mono text-sm text-ink/50">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
                <p className="font-mono text-lg font-bold text-ink">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="brutal-btn flex items-center gap-1 bg-white text-ink px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <span className="font-mono text-sm text-ink/50">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="brutal-btn flex items-center gap-1 bg-white text-ink px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
