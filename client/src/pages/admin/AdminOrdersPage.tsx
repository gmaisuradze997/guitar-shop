import { useState, Fragment } from "react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdmin";
import type { OrderStatus } from "@/types";

// ── Status config ───────────────────────────────────────────────────────────

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

const allStatuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Expandable order row ────────────────────────────────────────────────────

function OrderRow({
  order,
}: {
  order: {
    id: string;
    status: OrderStatus;
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    createdAt: string;
    user: { id: string; firstName: string; lastName: string; email: string };
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      product?: { id: string; slug: string; images: string[] };
    }>;
    shippingLine1?: string | null;
    shippingCity?: string | null;
    shippingState?: string | null;
    shippingPostal?: string | null;
    shippingCountry?: string | null;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateOrderStatus();

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="whitespace-nowrap px-6 py-4">
          <p className="text-sm font-medium text-gray-900">
            #{order.id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <p className="text-sm font-medium text-gray-900">
            {order.user.firstName} {order.user.lastName}
          </p>
          <p className="text-xs text-gray-500">{order.user.email}</p>
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <span className="text-sm text-gray-600">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <span className="text-sm font-semibold text-gray-900">
            ${order.total.toFixed(2)}
          </span>
        </td>
        <td className="whitespace-nowrap px-6 py-4" onClick={(e) => e.stopPropagation()}>
          <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex items-center gap-1">
              <StatusBadge status={order.status} />
              <ChevronDownIcon className="h-3 w-3 text-gray-400" />
            </MenuButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                {allStatuses.map((s) => (
                  <MenuItem key={s}>
                    {({ focus }) => (
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: order.id, status: s })
                        }
                        disabled={s === order.status}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${s === order.status
                            ? "bg-gray-50 font-medium text-gray-900"
                            : focus
                              ? "bg-gray-50 text-gray-700"
                              : "text-gray-600"
                          }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${statusConfig[s].dot}`}
                        />
                        {statusConfig[s].label}
                        {s === order.status && (
                          <span className="ml-auto text-xs text-gray-400">Current</span>
                        )}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </Menu>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr>
          <td colSpan={5} className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Order Items
                </h4>
                <div className="mt-2 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-white">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-900">{item.name}</p>
                      </div>
                      <span className="text-xs text-gray-500">x{item.quantity}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Summary
                </h4>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Subtotal</dt>
                    <dd className="text-gray-900">${order.subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Shipping</dt>
                    <dd className="text-gray-900">
                      {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Tax</dt>
                    <dd className="text-gray-900">${order.tax.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 font-semibold">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-gray-900">${order.total.toFixed(2)}</dd>
                  </div>
                </dl>

                {order.shippingLine1 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Shipping Address
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.shippingLine1}
                      <br />
                      {order.shippingCity}, {order.shippingState}{" "}
                      {order.shippingPostal}
                      <br />
                      {order.shippingCountry}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useAdminOrders({
    page,
    limit: 20,
    status: statusFilter,
    search,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track all customer orders ({data?.total ?? 0} total)
        </p>
      </div>

      {/* Filters row */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
        </form>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === "all"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            All
          </button>
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === s
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-gray-200" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-900">No orders found</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {search || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Orders will appear here when customers make purchases"}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => <OrderRow key={order.id} order={order} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
