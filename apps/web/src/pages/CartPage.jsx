
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const { subtotal, tax, total } = getCartTotal();

  const handleRemove = (itemId) => {
    console.log(`🛒 CartPage: Removing item ${itemId}`);
    removeFromCart(itemId);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    console.log(`🛒 CartPage: Changing quantity for ${itemId} to ${newQuantity}`);
    updateQuantity(itemId, newQuantity);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Your Cart - TREEWATER STUDIOS</title>
      </Helmet>
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-4xl font-extrabold tracking-tight mb-12">Your Cart</h1>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-muted/20 rounded-3xl border border-border/50"
          >
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any merchandise or beats to your cart yet.
            </p>
            <Button size="lg" onClick={() => navigate('/merchandise')} className="rounded-xl">
              Browse Store
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              {cartItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-2xl border border-border/50 shadow-sm"
                >
                  <div className="w-full sm:w-32 h-32 bg-muted/30 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                    <img 
                      src={item.image || '/placeholder.png'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        {item.selectedOptions && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.selectedOptions.color && `Color: ${item.selectedOptions.color}`}
                            {item.selectedOptions.color && item.selectedOptions.size && ' | '}
                            {item.selectedOptions.size && `Size: ${item.selectedOptions.size}`}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary">${Number(item.price).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border/50 rounded-lg bg-background">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemove(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="lg:col-span-4">
              <div className="bg-card rounded-2xl border border-border/50 p-8 sticky top-24 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full rounded-xl py-6 text-lg font-bold"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure checkout powered by Stripe & PayPal
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
