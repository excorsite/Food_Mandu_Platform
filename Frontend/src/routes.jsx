import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import ProtectedRoute from "./components/common/ProtectedRoute";

const Home = lazy(() => import("./pages/buyer/Home"));
const ProductDetails = lazy(() => import("./pages/buyer/ProductDetails"));
const Cart = lazy(() => import("./pages/buyer/Cart"));
const Checkout = lazy(() => import("./pages/buyer/Checkout"));
const MyOrders = lazy(() => import("./pages/buyer/MyOrders"));
const MyProfile = lazy(() => import("./pages/buyer/MyProfile"));
const SellerDashboard = lazy(() => import("./pages/seller/Dashboard"));
const SellerProducts = lazy(() => import("./pages/seller/Products"));
const SellerProductCreate = lazy(() => import("./pages/seller/ProductCreate"));
const SellerOrders = lazy(() => import("./pages/seller/Orders"));
const SellerAnalytics = lazy(() => import("./pages/seller/Analytics"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const KhaltiSuccess = lazy(() => import("./pages/payment/KhaltiSuccess"));
const KhaltiFailed = lazy(() => import("./pages/payment/KhaltiFailed"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">Loading...</div>
);

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "product/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProductDetails />
          </Suspense>
        ),
      },
      {
        path: "cart",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Cart />
          </Suspense>
        ),
      },
      {
        path: "checkout",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "seller",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "products",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="seller">
                  <SellerProducts />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "products/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="seller">
                  <SellerProductCreate />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="seller">
                  <SellerOrders />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "analytics",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="seller">
                  <SellerAnalytics />
                </ProtectedRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "admin",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "products",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="admin">
                  <AdminProducts />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: "orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute requiredRole="admin">
                  <AdminOrders />
                </ProtectedRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "payment/success",
        element: (
          <Suspense fallback={<PageLoader />}>
            <KhaltiSuccess />
          </Suspense>
        ),
      },
      {
        path: "payment/failed",
        element: (
          <Suspense fallback={<PageLoader />}>
            <KhaltiFailed />
          </Suspense>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
