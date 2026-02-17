import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { mergeLocalCartToServer } from "@/hooks/useCart";
import type { User } from "@/types";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: User;
}

let initPromise: Promise<void> | null = null;

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<AuthResponse>("/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, logout: clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !isLoading) return;
    initialized.current = true;

    if (!initPromise) {
      initPromise = fetchCurrentUser().then((userData) => {
        setUser(userData);
        initPromise = null;
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data.user;
    },
    onSuccess: async (userData) => {
      // Capture guest cart items before switching to authenticated mode
      const localItems = useCartStore.getState().items;

      // Merge guest cart to server (auth cookie is already set by the login response)
      if (localItems.length > 0) {
        await mergeLocalCartToServer(localItems);
      }

      // Now update auth state – this enables the server cart query in useCart
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data.user;
    },
    onSuccess: async (userData) => {
      const localItems = useCartStore.getState().items;

      if (localItems.length > 0) {
        await mergeLocalCartToServer(localItems);
      }

      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      useCartStore.getState().clearCart();
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
