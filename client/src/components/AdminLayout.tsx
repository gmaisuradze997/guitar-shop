import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { Transition } from "@headlessui/react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: ChartBarIcon, end: true },
  { name: "Products", href: "/admin/products", icon: CubeIcon, end: false },
  { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon, end: false },
  { name: "Customers", href: "/admin/customers", icon: UsersIcon, end: false },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <Link to="/admin" className="text-lg font-bold tracking-tight text-gray-900">
          Guitar<span className="text-accent-500">Shop</span>
          <span className="ml-2 rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-600">
            Admin
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 lg:hidden">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? "bg-accent-50 text-accent-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 shrink-0 ${isActive
                      ? "text-accent-600"
                      : "text-gray-400 group-hover:text-gray-600"
                    }`}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 p-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <HomeIcon className="h-5 w-5 text-gray-400" />
          Back to Store
        </Link>
        <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      <Transition show={mobileSidebarOpen} as={Fragment}>
        <div className="fixed inset-0 z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-gray-600 hover:text-gray-900"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold tracking-tight text-gray-900">
            Guitar<span className="text-accent-500">Shop</span>
            <span className="ml-2 rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-600">
              Admin
            </span>
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
