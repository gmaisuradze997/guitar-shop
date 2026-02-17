import { Link, useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const itemCount = useCartStore((state) => state.totalItems());
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleNavSearch(e: React.FormEvent) {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-cream border-b-3 border-ink">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold uppercase tracking-tighter text-ink hover:text-primary-500 transition-colors"
        >
          Guitar
          <span className="bg-primary-500 text-cream px-1 -skew-x-3 inline-block ml-0.5">
            Shop
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/shop" className="brutal-link px-3 py-2 text-sm text-ink">
            Shop
          </Link>
          <Link
            to="/shop?category=pedals"
            className="brutal-link px-3 py-2 text-sm text-ink"
          >
            Pedals
          </Link>
          <Link
            to="/shop?category=accessories"
            className="brutal-link px-3 py-2 text-sm text-ink"
          >
            Accessories
          </Link>
          <Link
            to="/shop?category=strings"
            className="brutal-link px-3 py-2 text-sm text-ink"
          >
            Strings
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleNavSearch} className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="brutal-input w-40 py-1.5 pl-8 pr-3 text-sm sm:w-56"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setNavSearch(""); }}
                className="p-1 text-ink/50 hover:text-ink"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ink hover:text-primary-500 transition-colors"
              title="Search products"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          )}

          {/* Admin link — always visible for admin users */}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-bold uppercase text-cream transition-colors hover:bg-primary-500 sm:flex"
              title="Admin Dashboard"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Admin
            </Link>
          )}

          {/* Wishlist */}
          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="p-2 text-ink hover:text-primary-500 transition-colors"
              title="Wishlist"
            >
              <HeartIcon className="h-5 w-5" />
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-ink hover:text-primary-500 transition-colors"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center border-2 border-ink bg-accent-500 font-mono text-xs font-bold text-ink">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isLoading ? (
            <div className="h-8 w-8 border-2 border-ink bg-cream-dark animate-pulse" />
          ) : isAuthenticated && user ? (
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-2 p-1 text-ink hover:text-primary-500 transition-colors focus:outline-none">
                <UserCircleIcon className="h-7 w-7" />
                <span className="hidden font-display text-sm font-bold uppercase md:inline">
                  {user.firstName}
                </span>
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
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right border-3 border-ink bg-white shadow-[4px_4px_0px_0px_#0A0A0A] focus:outline-none">
                  <div className="border-b-3 border-ink px-4 py-3">
                    <p className="font-display text-sm font-bold text-ink">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate font-mono text-xs text-ink/60">
                      {user.email}
                    </p>
                  </div>

                  {user.role === "admin" && (
                    <div className="border-b-3 border-ink py-1">
                      <MenuItem>
                        {({ focus }) => (
                          <Link
                            to="/admin"
                            className={`${focus ? "bg-primary-500 text-cream" : "text-ink"} flex w-full items-center gap-2 px-4 py-2 font-display text-sm font-semibold uppercase`}
                          >
                            <Cog6ToothIcon className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </MenuItem>
                    </div>
                  )}

                  <div className="py-1">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/orders"
                          className={`${focus ? "bg-accent-500 text-ink" : "text-ink"} flex w-full items-center gap-2 px-4 py-2 font-display text-sm font-semibold uppercase`}
                        >
                          <ClipboardDocumentListIcon className="h-4 w-4" />
                          My Orders
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/wishlist"
                          className={`${focus ? "bg-accent-500 text-ink" : "text-ink"} flex w-full items-center gap-2 px-4 py-2 font-display text-sm font-semibold uppercase`}
                        >
                          <HeartIcon className="h-4 w-4" />
                          My Wishlist
                        </Link>
                      )}
                    </MenuItem>
                  </div>

                  <div className="border-t-3 border-ink py-1">
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => { logout(); navigate("/"); }}
                          className={`${focus ? "bg-primary-500 text-cream" : "text-ink"} flex w-full items-center gap-2 px-4 py-2 font-display text-sm font-semibold uppercase`}
                        >
                          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                          Sign Out
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="brutal-link px-3 py-2 text-sm text-ink"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="brutal-btn bg-primary-500 text-cream px-4 py-2 text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink md:hidden"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t-3 border-ink bg-cream md:hidden">
          <div className="space-y-0 px-4 py-2">
            {[
              { to: "/shop", label: "Shop" },
              { to: "/shop?category=pedals", label: "Pedals" },
              { to: "/shop?category=accessories", label: "Accessories" },
              { to: "/shop?category=strings", label: "Strings" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block border-b-2 border-ink/10 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink hover:text-primary-500"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
