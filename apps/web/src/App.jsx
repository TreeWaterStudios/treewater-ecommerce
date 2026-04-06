
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './hooks/useCart.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import BeatLeasingPage from './pages/BeatLeasingPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import MerchandiseStore from './pages/MerchandiseStore.jsx';
import AdminMerchandiseManager from './pages/AdminMerchandiseManager.jsx';
import MockupAdmin from './pages/MockupAdmin.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PlayStorePage from './pages/PlayStorePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/beat-leasing" element={<BeatLeasingPage />} />
            <Route path="/merchandise" element={<MerchandiseStore />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/checkout-success" element={<SuccessPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/play-store" element={<PlayStorePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/mockup-admin" element={<MockupAdmin />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/merchandise"
              element={
                <ProtectedRoute>
                  <AdminMerchandiseManager />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-8">Page not found</p>
                <a href="/" className="text-primary hover:underline">Return to Home</a>
              </div>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
