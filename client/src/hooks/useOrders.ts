import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Order, PaginatedResponse } from "@/types";

// ---------------------------------------------------------------------------
// Order list (paginated, newest first)
// ---------------------------------------------------------------------------

interface UseOrdersParams {
  page?: number;
  limit?: number;
}

export function useOrders(params: UseOrdersParams = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Order>>("/orders", {
        params,
      });
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Single order (by ID)
// ---------------------------------------------------------------------------

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
