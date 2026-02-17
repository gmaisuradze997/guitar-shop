import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import type { ServerCart } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapServerCartToLocal(cart: ServerCart): CartItem[] {
  return cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.images?.[0],
    cartItemId: item.id,
    stockCount: item.product.stockCount,
  }));
}

/**
 * Push local (guest) cart items to the server after login.
 * Errors for individual items are silently ignored (e.g. out-of-stock).
 */
export async function mergeLocalCartToServer(items: CartItem[]) {
  const promises = items.map((item) =>
    api
      .post("/cart/items", {
        productId: item.productId,
        quantity: item.quantity,
      })
      .catch(() => {
        /* ignore – item might be out of stock */
      })
  );
  await Promise.allSettled(promises);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  // Local store selectors (actions are referentially stable)
  const items = useCartStore((s) => s.items);
  const addLocal = useCartStore((s) => s.addItem);
  const removeLocal = useCartStore((s) => s.removeItem);
  const updateLocal = useCartStore((s) => s.updateQuantity);
  const clearLocal = useCartStore((s) => s.clearCart);
  const setItems = useCartStore((s) => s.setItems);

  // ── Server cart query (only when authenticated) ────────────────────────────

  const { data: serverCart, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<ServerCart>("/cart");
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  // Hydrate local store from server cart
  const prevCartIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!serverCart) return;
    // Only update when the server response actually changes
    if (prevCartIdRef.current === JSON.stringify(serverCart.items)) return;
    prevCartIdRef.current = JSON.stringify(serverCart.items);
    setItems(mapServerCartToLocal(serverCart));
  }, [serverCart, setItems]);

  // ── Server mutations ───────────────────────────────────────────────────────

  const addMutation = useMutation({
    mutationFn: async (payload: { productId: string; quantity?: number }) => {
      const { data } = await api.post<ServerCart>("/cart/items", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { itemId: string; quantity: number }) => {
      const { data } = await api.patch<ServerCart>(
        `/cart/items/${payload.itemId}`,
        { quantity: payload.quantity }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await api.delete<ServerCart>(`/cart/items/${itemId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<ServerCart>("/cart");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // ── Unified handlers (optimistic local + server sync) ──────────────────────

  function addItem(item: Omit<CartItem, "quantity">) {
    addLocal(item);
    if (isAuthenticated) {
      addMutation.mutate({ productId: item.productId });
    }
  }

  function removeItem(productId: string) {
    const current = useCartStore.getState().items;
    const item = current.find((i) => i.productId === productId);
    removeLocal(productId);
    if (isAuthenticated && item?.cartItemId) {
      removeMutation.mutate(item.cartItemId);
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    const current = useCartStore.getState().items;
    const item = current.find((i) => i.productId === productId);
    updateLocal(productId, quantity);
    if (isAuthenticated && item?.cartItemId) {
      if (quantity <= 0) {
        removeMutation.mutate(item.cartItemId);
      } else {
        updateMutation.mutate({ itemId: item.cartItemId, quantity });
      }
    }
  }

  function clearCart() {
    clearLocal();
    if (isAuthenticated) {
      clearMutation.mutate();
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoading: isAuthenticated && isLoadingCart,
    isSyncing:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
  };
}
