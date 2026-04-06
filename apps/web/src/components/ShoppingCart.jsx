
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const { total } = getCartTotal();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleRemove = (itemId) => {
    console.log(`🛒 ShoppingCart: Removing item ${itemId}`);
    removeFromCart(itemId);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    console.log(`🛒 ShoppingCart: Changing quantity for ${itemId} to ${newQuantity}`);
    updateQuantity(itemId, newQuantity);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl flex flex-col border-l border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold tracking-tight">Shopping Cart</h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCartIcon size={32} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-foreground">Your cart is empty</p>
                  <p className="text-sm mt-1">Looks like you haven't added anything yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/merchandise');
                    }}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-muted/20 border border-border/50 p-3 rounded-xl transition-colors hover:bg-muted/30">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      {item.selectedOptions && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.selectedOptions.color && `Color: ${item.selectedOptions.color}`}
                          {item.selectedOptions.color && item.selectedOptions.size && ' | '}
                          {item.selectedOptions.size && `Size: ${item.selectedOptions.size}`}
                        </p>
                      )}
                      <p className="text-sm font-bold text-primary mt-1">
                        ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center border border-border/50 rounded-lg bg-background">
                        <Button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} size="icon" variant="ghost" className="h-7 w-7 rounded-l-lg rounded-r-none hover:bg-muted">-</Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} size="icon" variant="ghost" className="h-7 w-7 rounded-r-lg rounded-l-none hover:bg-muted">+</Button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)} 
                        className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium text-muted-foreground">Estimated Total</span>
                  <span className="text-3xl font-bold text-foreground">${total.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all active:scale-[0.98]"
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;
