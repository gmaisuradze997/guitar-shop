import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Product,
  AdminAnalytics,
  AdminOrder,
  AdminCustomer,
  PaginatedResponse,
  ProductFormData,
  OrderStatus,
} from "@/types";

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const { data } = await api.get<AdminAnalytics>("/admin/analytics");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ---------------------------------------------------------------------------
// Products — List
// ---------------------------------------------------------------------------

interface UseAdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export function useAdminProducts(params: UseAdminProductsParams = {}) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>(
        "/admin/products",
        { params }
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Products — Create
// ---------------------------------------------------------------------------

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data } = await api.post<Product>("/admin/products", productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Products — Update
// ---------------------------------------------------------------------------

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...productData
    }: Partial<ProductFormData> & { id: string }) => {
      const { data } = await api.put<Product>(
        `/admin/products/${id}`,
        productData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Products — Delete
// ---------------------------------------------------------------------------

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Orders — List
// ---------------------------------------------------------------------------

interface UseAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function useAdminOrders(params: UseAdminOrdersParams = {}) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminOrder>>(
        "/admin/orders",
        { params }
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Orders — Update Status
// ---------------------------------------------------------------------------

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }) => {
      const { data } = await api.patch<AdminOrder>(
        `/admin/orders/${id}/status`,
        { status }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Customers — List
// ---------------------------------------------------------------------------

interface UseAdminCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useAdminCustomers(params: UseAdminCustomersParams = {}) {
  return useQuery({
    queryKey: ["admin", "customers", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminCustomer>>(
        "/admin/customers",
        { params }
      );
      return data;
    },
  });
}
