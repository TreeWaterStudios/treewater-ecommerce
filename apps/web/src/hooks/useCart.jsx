
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

const CART_STORAGE_KEY = 'treewater-cart';

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      console.log('🛒 Cart loaded from storage:', parsedCart);
      return parsedCart;
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      console.log('🛒 Saving cart to storage. Current contents:', cartItems);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems]);

  const addToCart = useCallback((item) => {
    if (!item || !item.id) {
      console.error('Invalid item passed to addToCart', item);
      toast.error('Failed to add item to cart');
      return;
    }

    console.log('🛒 Adding to cart:', item);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        console.log(`🛒 Updating existing item in cart (ID: ${item.id}). Old qty: ${existingItem.quantity}, Adding: ${item.quantity || 1}`);
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      
      console.log(`🛒 Adding new item to cart (ID: ${item.id})`);
      return [...prevItems, { ...item, quantity: item.quantity || 1 }];
    });
    
    toast.success('Added to Cart', {
      description: `${item.quantity || 1} x ${item.name} added.`,
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    console.log(`🛒 Removing item from cart (ID: ${itemId})`);
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log(`🛒 Item removed. New cart length: ${newItems.length}`);
      return newItems;
    });
    toast.success('Item removed from cart');
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) return;
    console.log(`🛒 Updating quantity for item (ID: ${itemId}) to ${quantity}`);
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    console.log('🛒 Clearing entire cart');
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // Mock 8% tax
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
