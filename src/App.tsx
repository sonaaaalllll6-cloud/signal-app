import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAutoRecalculate } from "@/hooks/useAutoRecalculate";
import { ScrollToTop } from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import AuthCallback from "@/pages/auth/AuthCallback";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Newsletters from "@/pages/Newsletters";
import NewsletterDetail from "@/pages/NewsletterDetail";
import Watchlist from "@/pages/Watchlist";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminNewsletters from "@/pages/admin/AdminNewsletters";
import AdminSlots from "@/pages/admin/AdminSlots";
// SeedPage import removed — seed data was already run, route removed for security
import AdvertisePage from "@/pages/AdvertisePage";
import NotFound from "@/pages/NotFound";

// Lazy-load AdminAnalytics (heavy charts) — Section 8A
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — Section 8C
    },
  },
});

function AppRoutes() {
  useAutoRecalculate();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/newsletters" element={<Newsletters />} />
        <Route path="/newsletters/:slug" element={<NewsletterDetail />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/account/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="newsletters" element={<AdminNewsletters />} />
          <Route path="slots" element={<AdminSlots />} />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<div className="p-8 animate-pulse text-muted-foreground">Loading analytics…</div>}>
                <AdminAnalytics />
              </Suspense>
            }
          />
        </Route>
        {/* /seed-data route removed for security — seed data was already run */}
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
