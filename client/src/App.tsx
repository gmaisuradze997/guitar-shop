import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";

// Lazy-loaded page components for route-based code splitting
const HomePage = lazy(() => import("@/pages/HomePage"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/pages/OrderDetailPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Admin pages — separate chunk
const AdminDashboardPage = lazy(
  () => import("@/pages/admin/AdminDashboardPage")
);
const AdminProductsPage = lazy(
  () => import("@/pages/admin/AdminProductsPage")
);
const AdminProductFormPage = lazy(
  () => import("@/pages/admin/AdminProductFormPage")
);
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminCustomersPage = lazy(
  () => import("@/pages/admin/AdminCustomersPage")
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public-facing layout */}
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          {/* Guest-only routes (redirect to home if authenticated) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Cart — accessible to everyone (guest + authenticated) */}
          <Route path="/cart" element={<CartPage />} />

          {/* Order routes — require authentication */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Wishlist — require authentication */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin layout — requires admin role */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route
            path="/admin/products/new"
            element={<AdminProductFormPage />}
          />
          <Route
            path="/admin/products/:id/edit"
            element={<AdminProductFormPage />}
          />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
