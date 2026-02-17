import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  TruckIcon,
  CubeIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useOrder } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";

// ── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { label: string; bg: string }> = {
  pending: { label: "Pending", bg: "bg-yellow-300" },
  processing: { label: "Processing", bg: "bg-signal-300" },
  shipped: { label: "Shipped", bg: "bg-purple-300" },
  delivered: { label: "Delivered", bg: "bg-accent-500" },
  cancelled: { label: "Cancelled", bg: "bg-primary-300" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`brutal-badge ${cfg.bg} text-ink text-sm px-3 py-1`}>
      {cfg.label}
    </span>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

const timelineSteps: { status: OrderStatus; label: string; icon: typeof ClockIcon }[] = [
  { status: "pending", label: "Order Placed", icon: ClockIcon },
  { status: "processing", label: "Processing", icon: CubeIcon },
  { status: "shipped", label: "Shipped", icon: TruckIcon },
  { status: "delivered", label: "Delivered", icon: CheckCircleIcon },
];

const statusOrder: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

function getStepState(
  stepStatus: OrderStatus,
  currentStatus: OrderStatus
): "completed" | "current" | "upcoming" {
  if (currentStatus === "cancelled") {
    return stepStatus === "pending" ? "current" : "upcoming";
  }
  const stepIdx = statusOrder.indexOf(stepStatus);
  const currentIdx = statusOrder.indexOf(currentStatus);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const isCancelled = status === "cancelled";

  return (
    <div className="border-3 border-ink bg-white p-6 shadow-[4px_4px_0px_0px_#0A0A0A]">
      <h2 className="font-display text-lg font-bold uppercase text-ink">
        Order Status
      </h2>

      {isCancelled && (
        <div className="mt-4 flex items-center gap-3 border-3 border-primary-500 bg-primary-50 px-4 py-3">
          <XCircleIcon className="h-6 w-6 shrink-0 text-primary-500" />
          <div>
            <p className="font-display text-sm font-bold uppercase text-primary-700">
              Order Cancelled
            </p>
            <p className="font-mono text-xs text-primary-600">
              This order has been cancelled.
            </p>
          </div>
        </div>
      )}

      <div className="relative mt-6">
        <div className="absolute left-4 top-0 h-full w-0.5 bg-ink/10" />

        <div className="space-y-6">
          {timelineSteps.map((step) => {
            const state = getStepState(step.status, status);
            const Icon = step.icon;

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink ${state === "completed"
                      ? "bg-accent-500 text-ink"
                      : state === "current"
                        ? isCancelled
                          ? "bg-primary-100 text-primary-500"
                          : "bg-primary-500 text-cream"
                        : "bg-cream-dark text-ink/30"
                    }`}
                >
                  {state === "completed" ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <div className="pt-1">
                  <p
                    className={`font-display text-sm font-bold uppercase ${state === "completed"
                        ? "text-accent-700"
                        : state === "current"
                          ? isCancelled
                            ? "text-primary-700"
                            : "text-ink"
                          : "text-ink/30"
                      }`}
                  >
                    {step.label}
                  </p>
                  {state === "current" && !isCancelled && (
                    <p className="mt-0.5 font-mono text-xs text-ink/50">
                      Current status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-5 w-24 bg-cream-dark" />
        <div className="mt-6 h-8 w-72 bg-cream-dark" />
        <div className="mt-2 h-4 w-48 bg-cream-dark" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-4 border-3 border-ink/10 bg-white p-4"
              >
                <div className="h-20 w-20 shrink-0 bg-cream-dark" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-5 w-3/4 bg-cream-dark" />
                  <div className="h-4 w-20 bg-cream-dark" />
                  <div className="mt-auto h-4 w-16 bg-cream-dark" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="border-3 border-ink/10 bg-white p-6 space-y-3">
              <div className="h-6 w-32 bg-cream-dark" />
              <div className="h-32 w-full bg-cream-dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id ?? "");

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold uppercase text-ink">
          Order Not Found
        </h1>
        <p className="mt-2 font-body text-ink/60">
          We couldn&apos;t find this order. It may not exist or you may not have
          permission to view it.
        </p>
        <Link
          to="/orders"
          className="brutal-btn mt-6 inline-block bg-primary-500 text-cream px-6 py-3 text-sm"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasShippingAddress = order.shippingLine1 && order.shippingCity;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-1.5 font-display text-sm font-bold uppercase text-ink/50 hover:text-primary-500 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Orders
      </button>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 font-mono text-sm text-ink/50">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold uppercase text-ink">
            Items ({itemCount})
          </h2>

          {order.items.map((item) => {
            const lineTotal = item.price * item.quantity;
            const imageSrc = item.product?.images?.[0];
            const productLink = item.product?.slug
              ? `/product/${item.product.id}`
              : null;

            return (
              <div
                key={item.id}
                className="flex gap-4 border-3 border-ink bg-white p-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden border-2 border-ink bg-cream-dark sm:h-24 sm:w-24">
                  {productLink ? (
                    <Link to={productLink}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ProductPlaceholder />
                      )}
                    </Link>
                  ) : imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ProductPlaceholder />
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    {productLink ? (
                      <Link
                        to={productLink}
                        className="font-display text-sm font-bold uppercase text-ink hover:text-primary-500 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="font-display text-sm font-bold uppercase text-ink">
                        {item.name}
                      </p>
                    )}
                    <p className="mt-0.5 font-mono text-xs text-ink/50">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-base font-bold text-ink">
                    ${lineTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Order totals */}
          <div className="border-3 border-ink bg-white p-5">
            <h3 className="font-display text-sm font-bold uppercase text-ink">
              Order Summary
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between font-body text-sm text-ink/70">
                <span>Subtotal</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-ink/70">
                <span>Shipping</span>
                <span
                  className={`font-mono ${order.shipping === 0
                      ? "font-bold text-accent-700"
                      : ""
                    }`}
                >
                  {order.shipping === 0
                    ? "FREE"
                    : `$${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-body text-sm text-ink/70">
                <span>Tax</span>
                <span className="font-mono">${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t-3 border-ink pt-2">
                <div className="flex justify-between">
                  <span className="font-display text-base font-bold uppercase text-ink">
                    Total
                  </span>
                  <span className="font-mono text-xl font-bold text-ink">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status + Shipping */}
        <div className="lg:col-span-1 space-y-6">
          <OrderTimeline status={order.status} />

          {hasShippingAddress && (
            <div className="border-3 border-ink bg-white p-6 shadow-[4px_4px_0px_0px_#0A0A0A]">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-primary-500" />
                <h2 className="font-display text-lg font-bold uppercase text-ink">
                  Shipping
                </h2>
              </div>
              <address className="mt-3 font-mono text-sm not-italic leading-relaxed text-ink/60">
                {order.shippingLine1}
                {order.shippingLine2 && (
                  <>
                    <br />
                    {order.shippingLine2}
                  </>
                )}
                <br />
                {order.shippingCity}, {order.shippingState}{" "}
                {order.shippingPostal}
                <br />
                {order.shippingCountry}
              </address>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/orders"
              className="brutal-btn block w-full bg-white text-ink px-4 py-3 text-center text-sm"
            >
              View All Orders
            </Link>
            <Link
              to="/shop"
              className="brutal-btn block w-full bg-primary-500 text-cream px-4 py-3 text-center text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-cream-dark">
      <svg
        className="h-6 w-6 text-ink/30"
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
  );
}
