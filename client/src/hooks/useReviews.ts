import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Review } from "@/types";

interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}

interface UpdateReviewData {
  rating?: number;
  title?: string;
  body?: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await api.post<Review>("/reviews", data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: UpdateReviewData;
    }) => {
      const response = await api.patch<Review>(`/reviews/${reviewId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
