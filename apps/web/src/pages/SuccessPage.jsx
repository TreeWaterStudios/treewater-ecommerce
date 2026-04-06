
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const SuccessPage = () => {
  const navigate = useNavigate();

  // Optional: Redirect to home if accessed directly without a recent order
  // For now, we'll just show the success state.

  return (
    <>
      <Helmet>
        <title>Order Successful - TREEWATER STUDIOS</title>
        <meta name="description" content="Your order has been placed successfully." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow flex items-center justify-center p-4 py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full bg-card border border-border/50 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[50px] pointer-events-none" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight text-foreground">
              Order Confirmed!
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Thank you for your purchase. We've received your order and will begin processing it right away. A confirmation email has been sent to your inbox.
            </p>

            <div className="bg-muted/30 rounded-2xl p-6 mb-8 border border-border/50 text-left">
              <h3 className="font-semibold text-foreground mb-2 flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2 text-primary" /> What happens next?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside pl-6">
                <li>You will receive an email with your order details.</li>
                <li>We will process and manufacture your items.</li>
                <li>You'll get another email with tracking info once shipped.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/merchandise')} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all active:scale-[0.98]"
              >
                Continue Shopping
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="border-border/50 hover:bg-muted py-6 px-8 rounded-xl font-medium"
              >
                Return Home <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SuccessPage;
