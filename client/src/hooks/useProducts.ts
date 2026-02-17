import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Product,
  Category,
  PaginatedResponse,
  FilterOptions,
  SortOption,
} from "@/types";

// ---------------------------------------------------------------------------
// Product list (with pagination, filters & sorting)
// ---------------------------------------------------------------------------

interface UseProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  inStock?: boolean;
}

export function useProducts(params: UseProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.category) queryParams.category = params.category;
      if (params.brand) queryParams.brand = params.brand;
      if (params.search) queryParams.search = params.search;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
      if (params.sort) queryParams.sort = params.sort;
      if (params.inStock) queryParams.inStock = "true";

      const { data } = await api.get<PaginatedResponse<Product>>("/products", {
        params: queryParams,
      });
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Single product (by ID)
// ---------------------------------------------------------------------------

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Single product (by slug)
// ---------------------------------------------------------------------------

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", "slug", slug],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/slug/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

// ---------------------------------------------------------------------------
// Categories (top-level with children & product counts)
// ---------------------------------------------------------------------------

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/products/categories");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

// ---------------------------------------------------------------------------
// Filter options (all brands + price range)
// ---------------------------------------------------------------------------

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filterOptions"],
    queryFn: async () => {
      const { data } = await api.get<FilterOptions>("/products/filters");
      return data;
    },
    staleTime: 1000 * 60 * 15,
  });
}
