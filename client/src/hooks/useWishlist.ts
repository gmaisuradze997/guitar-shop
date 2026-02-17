import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { WishlistItem } from "@/types";

// ---------------------------------------------------------------------------
// Wishlist list
// ---------------------------------------------------------------------------

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get<WishlistItem[]>("/wishlist");
      return data;
    },
    enabled: isAuthenticated,
  });
}

// ---------------------------------------------------------------------------
// Check if a single product is wishlisted
// ---------------------------------------------------------------------------

export function useIsWishlisted(productId: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["wishlist", "check", productId],
    queryFn: async () => {
      const { data } = await api.get<{ inWishlist: boolean }>(
        `/wishlist/check/${productId}`
      );
      return data.inWishlist;
    },
    enabled: isAuthenticated && !!productId,
  });
}

// ---------------------------------------------------------------------------
// Toggle wishlist (add / remove)
// ---------------------------------------------------------------------------

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      isWishlisted,
    }: {
      productId: string;
      isWishlisted: boolean;
    }) => {
      if (isWishlisted) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post("/wishlist", { productId });
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({
        queryKey: ["wishlist", "check", variables.productId],
      });
    },
  });
}
