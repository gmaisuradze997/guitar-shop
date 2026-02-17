import { Link } from "react-router-dom";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useAdminAnalytics } from "@/hooks/useAdmin";
import type { OrderStatus } from "@/types";

// ── Status badge config ─────────────────────────────────────────────────────

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "Pending", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  processing: { label: "Processing", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  shipped: { label: "Shipped", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  delivered: { label: "Delivered", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="mt-6 h-48 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simple bar chart (pure CSS) ─────────────────────────────────────────────

function MiniBarChart({
  data,
}: {
  data: Array<{ month: string; revenue: number }>;
}) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-400">No sales data yet</p>;
  }

  const maxVal = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height: 180 }}>
      {data.map((d) => {
        const heightPct = (d.revenue / maxVal) * 100;
        const monthLabel = d.month.split("-")[1];
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const label = monthNames[parseInt(monthLabel ?? "0") - 1] ?? monthLabel ?? "";

        return (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full" style={{ height: 150 }}>
              <div
                className="absolute bottom-0 w-full rounded-t bg-accent-500 transition-all duration-300 hover:bg-accent-600"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
                title={`${label}: $${d.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: analytics, isLoading, isError } = useAdminAnalytics();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !analytics) {
    return (
      <div className="flex items-center justify-center p-20">
        <p className="text-red-500">Failed to load analytics. Please try again.</p>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      color: "bg-green-50 text-green-600",
    },
    {
      name: "Total Orders",
      value: analytics.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Total Customers",
      value: analytics.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      color: "bg-purple-50 text-purple-600",
    },
    {
      name: "Total Products",
      value: analytics.totalProducts.toLocaleString(),
      icon: CubeIcon,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your store's performance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-500">{stat.name}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts + Top Products row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Monthly Sales Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Monthly Revenue</h2>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">Last 12 months</p>
          <div className="mt-6">
            <MiniBarChart data={analytics.monthlySales} />
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Top Products</h2>
          <p className="mt-0.5 text-xs text-gray-500">By units sold</p>
          {analytics.topProducts.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No sales yet</p>
          ) : (
            <div className="mt-4 space-y-3">
              {analytics.topProducts.map((product, idx) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                    {idx + 1}
                  </span>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <CubeIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {product.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Distribution + Recent Orders row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Order Status Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Order Status</h2>
          <p className="mt-0.5 text-xs text-gray-500">Distribution of all orders</p>
          <div className="mt-4 space-y-3">
            {(
              ["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]
            ).map((status) => {
              const count = analytics.statusDistribution[status] ?? 0;
              const total = analytics.totalOrders || 1;
              const pct = ((count / total) * 100).toFixed(1);
              const cfg = statusConfig[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24">
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${cfg.dot}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-gray-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
              <p className="mt-0.5 text-xs text-gray-500">Latest 5 orders</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-accent-600 hover:text-accent-700"
            >
              View all
            </Link>
          </div>
          {analytics.recentOrders.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No orders yet</p>
          ) : (
            <div className="mt-4 space-y-2">
              {analytics.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/admin/orders"
                  className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {order.user.firstName} {order.user.lastName} &middot;{" "}
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
