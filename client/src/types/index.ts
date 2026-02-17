// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  category: Category;
  brand: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = "pedals" | "accessories" | "strings" | "parts";

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// User & Auth
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    slug: string;
    images: string[];
    inStock?: boolean;
  };
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ---------------------------------------------------------------------------
// Cart (server-side)
// ---------------------------------------------------------------------------

export interface ServerCart {
  id: string;
  userId: string;
  items: ServerCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ServerCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Filter Options (for shop sidebar)
// ---------------------------------------------------------------------------

export interface FilterOptions {
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "rating";

// ---------------------------------------------------------------------------
// API Response
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Admin — Analytics
// ---------------------------------------------------------------------------

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  statusDistribution: Record<string, number>;
  recentOrders: AdminRecentOrder[];
  topProducts: AdminTopProduct[];
  monthlySales: AdminMonthlySales[];
}

export interface AdminRecentOrder {
  id: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AdminTopProduct {
  productId: string;
  totalSold: number;
  name: string;
  image: string | null;
  price: number;
}

export interface AdminMonthlySales {
  month: string;
  revenue: number;
  orders: number;
}

// ---------------------------------------------------------------------------
// Admin — Order (with user info)
// ---------------------------------------------------------------------------

export interface AdminOrder extends Order {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ---------------------------------------------------------------------------
// Admin — Customer
// ---------------------------------------------------------------------------

export interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
  };
  totalSpent: number;
}

// ---------------------------------------------------------------------------
// Admin — Product Form
// ---------------------------------------------------------------------------

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  brand: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
}
