import { useSearchParams } from "react-router-dom";
import {
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useProducts, useCategories, useFilterOptions } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SEO from "@/components/SEO";
import type { SortOption } from "@/types";

const PRODUCTS_PER_PAGE = 12;

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
  "name-desc": "Name: Z → A",
  rating: "Top Rated",
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );
  const [sortOpen, setSortOpen] = useState(false);

  const [localMinPrice, setLocalMinPrice] = useState(
    searchParams.get("minPrice") ?? ""
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    searchParams.get("maxPrice") ?? ""
  );

  const debouncedSearch = useDebounce(searchInput, 400);

  const currentCategory = searchParams.get("category") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const currentBrand = searchParams.get("brand") ?? "";
  const currentSort = (searchParams.get("sort") as SortOption) || "newest";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: filterOptions } = useFilterOptions();
  const {
    data: productsData,
    isLoading: productsLoading,
    isError,
  } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    category: currentCategory || undefined,
    search: currentSearch || undefined,
    brand: currentBrand || undefined,
    sort: currentSort,
    inStock: currentInStock || undefined,
    minPrice: currentMinPrice ? parseFloat(currentMinPrice) : undefined,
    maxPrice: currentMaxPrice ? parseFloat(currentMaxPrice) : undefined,
  });

  const brands = filterOptions?.brands ?? [];
  const priceRange = filterOptions?.priceRange;

  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setLocalMinPrice(searchParams.get("minPrice") ?? "");
    setLocalMaxPrice(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) {
      updateParams({ search: debouncedSearch.trim() || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (!sortOpen) return;
    const handleClick = () => setSortOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [sortOpen]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "") {
          next.delete(key);
        } else {
          next.set(key, val);
        }
      }
      if (!("page" in updates)) {
        next.delete("page");
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput.trim() || null });
  }

  function handlePriceApply() {
    updateParams({
      minPrice: localMinPrice || null,
      maxPrice: localMaxPrice || null,
    });
  }

  function handlePriceKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handlePriceApply();
    }
  }

  function clearAllFilters() {
    setSearchInput("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchParams({});
  }

  const hasActiveFilters = !!(
    currentCategory ||
    currentSearch ||
    currentBrand ||
    currentInStock ||
    currentMinPrice ||
    currentMaxPrice
  );

  const activeFilterCount = [
    currentCategory,
    currentSearch,
    currentBrand,
    currentInStock ? "true" : "",
    currentMinPrice,
    currentMaxPrice,
  ].filter(Boolean).length;

  const flatCategories = useMemo(() => {
    if (!categoriesData) return [];
    const result: Array<{
      slug: string;
      name: string;
      count: number;
      isChild: boolean;
    }> = [];
    for (const cat of categoriesData) {
      result.push({
        slug: cat.slug,
        name: cat.name,
        count: cat._count?.products ?? 0,
        isChild: false,
      });
      if (cat.children) {
        for (const child of cat.children) {
          result.push({
            slug: child.slug,
            name: child.name,
            count: child._count?.products ?? 0,
            isChild: true,
          });
        }
      }
    }
    return result;
  }, [categoriesData]);

  const activeCategoryName =
    flatCategories.find((c) => c.slug === currentCategory)?.name ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SEO
        title="Shop"
        description="Browse our full catalog of guitar pedals, accessories, strings, and parts. Filter by category, brand, and price."
        canonical="https://guitarshop.com/shop"
      />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-ink">
            {activeCategoryName || "Shop"}
          </h1>
          {productsData && (
            <p className="mt-1 font-mono text-sm text-ink/50 uppercase">
              {productsData.total}{" "}
              {productsData.total === 1 ? "product" : "products"}
              {currentSearch && (
                <>
                  {" "}for &quot;
                  <span className="font-bold text-primary-500">{currentSearch}</span>
                  &quot;
                </>
              )}
            </p>
          )}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex w-full max-w-sm items-center"
        >
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 h-4 w-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="brutal-input w-full py-2 pl-9 pr-4 text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ search: null });
              }}
              className="absolute right-3 text-ink/40 hover:text-ink"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="brutal-btn flex items-center gap-2 bg-white text-ink px-3 py-2 text-sm lg:hidden"
        >
          <FunnelIcon className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center border-2 border-ink bg-accent-500 font-mono text-xs font-bold text-ink">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <div className="relative ml-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSortOpen(!sortOpen);
            }}
            className="brutal-btn flex items-center gap-2 bg-white text-ink px-3 py-2 text-sm"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sort:</span>{" "}
            {SORT_LABELS[currentSort]}
            <ChevronDownIcon className="h-4 w-4" />
          </button>

          {sortOpen && (
            <div className="absolute right-0 z-20 mt-1 w-52 border-3 border-ink bg-white shadow-[4px_4px_0px_0px_#0A0A0A]">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      updateParams({
                        sort: value === "newest" ? null : value,
                      });
                      setSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-display text-sm font-semibold uppercase transition-colors ${currentSort === value
                        ? "bg-accent-500 text-ink"
                        : "text-ink hover:bg-cream"
                      }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {currentCategory && (
            <FilterChip
              label={`Category: ${activeCategoryName}`}
              onRemove={() => updateParams({ category: null })}
            />
          )}
          {currentBrand && (
            <FilterChip
              label={`Brand: ${currentBrand}`}
              onRemove={() => updateParams({ brand: null })}
            />
          )}
          {currentSearch && (
            <FilterChip
              label={`Search: ${currentSearch}`}
              onRemove={() => {
                setSearchInput("");
                updateParams({ search: null });
              }}
            />
          )}
          {(currentMinPrice || currentMaxPrice) && (
            <FilterChip
              label={`Price: ${currentMinPrice ? `$${currentMinPrice}` : "$0"} – ${currentMaxPrice ? `$${currentMaxPrice}` : "Any"}`}
              onRemove={() => {
                setLocalMinPrice("");
                setLocalMaxPrice("");
                updateParams({ minPrice: null, maxPrice: null });
              }}
            />
          )}
          {currentInStock && (
            <FilterChip
              label="In Stock Only"
              onRemove={() => updateParams({ inStock: null })}
            />
          )}
          <button
            onClick={clearAllFilters}
            className="font-display text-sm font-bold uppercase text-primary-500 hover:text-primary-700"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            categories={flatCategories}
            categoriesLoading={categoriesLoading}
            activeCategory={currentCategory}
            activeBrand={currentBrand}
            brands={brands}
            priceRange={priceRange}
            localMinPrice={localMinPrice}
            localMaxPrice={localMaxPrice}
            onLocalMinPriceChange={setLocalMinPrice}
            onLocalMaxPriceChange={setLocalMaxPrice}
            onPriceApply={handlePriceApply}
            onPriceKeyDown={handlePriceKeyDown}
            inStock={currentInStock}
            onCategoryChange={(slug) =>
              updateParams({ category: slug || null })
            }
            onBrandChange={(brand) => updateParams({ brand: brand || null })}
            onInStockChange={(checked) =>
              updateParams({ inStock: checked ? "true" : null })
            }
          />
        </aside>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-ink/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto border-l-3 border-ink bg-cream px-4 py-6 shadow-[-8px_0px_0px_0px_#0A0A0A]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase text-ink">
                  Filters
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="-mr-2 p-2 text-ink hover:text-primary-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-4">
                <FilterSidebar
                  categories={flatCategories}
                  categoriesLoading={categoriesLoading}
                  activeCategory={currentCategory}
                  activeBrand={currentBrand}
                  brands={brands}
                  priceRange={priceRange}
                  localMinPrice={localMinPrice}
                  localMaxPrice={localMaxPrice}
                  onLocalMinPriceChange={setLocalMinPrice}
                  onLocalMaxPriceChange={setLocalMaxPrice}
                  onPriceApply={() => {
                    handlePriceApply();
                    setMobileFiltersOpen(false);
                  }}
                  onPriceKeyDown={handlePriceKeyDown}
                  inStock={currentInStock}
                  onCategoryChange={(slug) => {
                    updateParams({ category: slug || null });
                    setMobileFiltersOpen(false);
                  }}
                  onBrandChange={(brand) => {
                    updateParams({ brand: brand || null });
                    setMobileFiltersOpen(false);
                  }}
                  onInStockChange={(checked) => {
                    updateParams({ inStock: checked ? "true" : null });
                    setMobileFiltersOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {isError ? (
            <div className="flex flex-col items-center justify-center border-3 border-ink border-dashed p-20 text-center">
              <p className="font-display text-lg font-bold uppercase text-ink">
                Something Went Wrong
              </p>
              <p className="mt-2 font-body text-sm text-ink/60">
                We couldn&apos;t load the products. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="brutal-btn mt-4 bg-primary-500 text-cream px-4 py-2 text-sm"
              >
                Retry
              </button>
            </div>
          ) : productsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productsData && productsData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {productsData.data.map((product, idx) => (
                  <div
                    key={product.id}
                    className="stagger-item"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {productsData.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={productsData.totalPages}
                  onPageChange={(page) =>
                    updateParams({ page: page === 1 ? null : String(page) })
                  }
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center border-3 border-ink border-dashed p-20 text-center">
              <svg
                className="h-16 w-16 text-ink/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
              <p className="mt-4 font-display text-lg font-bold uppercase text-ink">
                No Products Found
              </p>
              <p className="mt-2 font-body text-sm text-ink/50">
                Try adjusting your filters or search terms.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="brutal-btn mt-4 bg-primary-500 text-cream px-4 py-2 text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Sub-components
// ==========================================================================

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 border-2 border-ink bg-white px-3 py-1 font-mono text-xs font-bold uppercase text-ink">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 hover:text-primary-500"
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------

interface FilterSidebarProps {
  categories: Array<{
    slug: string;
    name: string;
    count: number;
    isChild: boolean;
  }>;
  categoriesLoading: boolean;
  activeCategory: string;
  activeBrand: string;
  brands: string[];
  priceRange?: { min: number; max: number };
  localMinPrice: string;
  localMaxPrice: string;
  onLocalMinPriceChange: (value: string) => void;
  onLocalMaxPriceChange: (value: string) => void;
  onPriceApply: () => void;
  onPriceKeyDown: (e: React.KeyboardEvent) => void;
  inStock: boolean;
  onCategoryChange: (slug: string) => void;
  onBrandChange: (brand: string) => void;
  onInStockChange: (checked: boolean) => void;
}

function FilterSidebar({
  categories,
  categoriesLoading,
  activeCategory,
  activeBrand,
  brands,
  priceRange,
  localMinPrice,
  localMaxPrice,
  onLocalMinPriceChange,
  onLocalMaxPriceChange,
  onPriceApply,
  onPriceKeyDown,
  inStock,
  onCategoryChange,
  onBrandChange,
  onInStockChange,
}: FilterSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <FilterSection title="Categories">
        {categoriesLoading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-32 bg-cream-dark animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ul className="mt-3 space-y-0.5">
            <li>
              <button
                onClick={() => onCategoryChange("")}
                className={`w-full px-3 py-1.5 text-left font-display text-sm font-semibold uppercase transition-colors ${!activeCategory
                    ? "bg-ink text-cream"
                    : "text-ink hover:bg-cream-dark"
                  }`}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`w-full px-3 py-1.5 text-left font-display text-sm font-semibold uppercase transition-colors ${cat.isChild ? "pl-6" : ""
                    } ${activeCategory === cat.slug
                      ? "bg-ink text-cream"
                      : "text-ink hover:bg-cream-dark"
                    }`}
                >
                  {cat.name}
                  {cat.count > 0 && (
                    <span className="ml-2 font-mono text-xs opacity-50">
                      ({cat.count})
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/40">
                $
              </span>
              <input
                type="number"
                placeholder={priceRange ? String(Math.floor(priceRange.min)) : "Min"}
                value={localMinPrice}
                onChange={(e) => onLocalMinPriceChange(e.target.value)}
                onKeyDown={onPriceKeyDown}
                min={0}
                className="brutal-input w-full py-1.5 pl-6 pr-2 font-mono text-sm"
              />
            </div>
            <span className="font-mono text-ink/40">–</span>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/40">
                $
              </span>
              <input
                type="number"
                placeholder={priceRange ? String(Math.ceil(priceRange.max)) : "Max"}
                value={localMaxPrice}
                onChange={(e) => onLocalMaxPriceChange(e.target.value)}
                onKeyDown={onPriceKeyDown}
                min={0}
                className="brutal-input w-full py-1.5 pl-6 pr-2 font-mono text-sm"
              />
            </div>
          </div>
          {priceRange && (
            <p className="font-mono text-xs text-ink/40">
              Range: ${Math.floor(priceRange.min)} – ${Math.ceil(priceRange.max)}
            </p>
          )}
          <button
            onClick={onPriceApply}
            className="brutal-btn w-full bg-cream-dark text-ink px-3 py-1.5 text-sm"
          >
            Apply Price
          </button>
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <ul className="mt-3 max-h-60 space-y-0.5 overflow-y-auto">
            <li>
              <button
                onClick={() => onBrandChange("")}
                className={`w-full px-3 py-1.5 text-left font-display text-sm font-semibold uppercase transition-colors ${!activeBrand
                    ? "bg-ink text-cream"
                    : "text-ink hover:bg-cream-dark"
                  }`}
              >
                All Brands
              </button>
            </li>
            {brands.map((brand) => (
              <li key={brand}>
                <button
                  onClick={() => onBrandChange(brand)}
                  className={`w-full px-3 py-1.5 text-left font-display text-sm font-semibold uppercase transition-colors ${activeBrand === brand
                      ? "bg-ink text-cream"
                      : "text-ink hover:bg-cream-dark"
                    }`}
                >
                  {brand}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="mt-3 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-5 w-5 border-3 border-ink bg-white text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
          />
          <span className="font-display text-sm font-semibold uppercase text-ink">
            In Stock Only
          </span>
        </label>
      </FilterSection>
    </div>
  );
}

// ---------------------------------------------------------------------------

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-xs font-bold uppercase tracking-widest text-primary-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const result: Array<number | "..."> = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) result.push(i);
      if (currentPage < totalPages - 2) result.push("...");
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="brutal-btn bg-white text-ink p-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 font-mono text-ink/40">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`brutal-btn min-w-9 px-3 py-2 font-mono text-sm ${page === currentPage
                ? "bg-ink text-cream"
                : "bg-white text-ink"
              }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="brutal-btn bg-white text-ink p-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
}
