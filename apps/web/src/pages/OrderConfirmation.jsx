
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/hooks/useCart.jsx';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const orderDetails = location.state?.order || null;

  useEffect(() => {
    // Clear cart upon successful order confirmation
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Order Confirmed - TREEWATER STUDIOS</title>
      </Helmet>
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-card rounded-3xl border border-border/50 p-8 md:p-12 text-center shadow-lg"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>
          
          {orderDetails && (
            <div className="bg-muted/30 rounded-2xl p-6 mb-8 text-left border border-border/50">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Order Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Order Number</p>
                  <p className="font-medium">{orderDetails.orderId || `ORD-${Math.floor(Math.random() * 1000000)}`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-muted-foreground mb-1">Confirmation sent to</p>
                  <p className="font-medium">{orderDetails.email || 'your email address'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link to="/dashboard">View Order History</Link>
            </Button>
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/merchandise">
                Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
