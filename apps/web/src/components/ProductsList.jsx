import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, PackageX, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiServerClient from '@/lib/apiServerClient.js';

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();

  const handleProductClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product?.id) {
      console.log('🔗 Navigating to product:', product.id, product.name);
      navigate(`/product/${product.id}`, { state: { product } });
    }
  }, [product, navigate]);

  if (!product || !product.id) {
    return null;
  }

  const name = product.name || 'Unnamed Product';
  const price = product.base_price || product.variants?.[0]?.price || 0;
  const displayPrice = price > 0 ? `$${Number(price).toFixed(2)}` : 'Contact for price';
  
  // Use the first image from the new backend structure
  const imageUrl = product.images?.[0]?.url || '/placeholder.png';
  const variantCount = product.variants?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <div 
        onClick={handleProductClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleProductClick(e)}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl cursor-pointer"
      >
        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm border-border/50 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
          <div className="relative bg-muted/20 aspect-square overflow-hidden flex items-center justify-center p-6">
            <img
              src={imageUrl}
              alt={product.images?.[0]?.alt || name}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-md"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/placeholder.png';
                e.target.onerror = null;
              }}
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-all duration-300" />
            
            <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-md text-foreground text-sm font-bold px-4 py-2 rounded-full shadow-sm border border-border/50">
              <span>{displayPrice}</span>
            </div>
            {variantCount > 1 && (
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border border-border/50">
                {variantCount} variants
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-balance mb-2">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-grow">
              {product.description?.replace(/<[^>]*>?/gm, '') || 'Premium quality merchandise.'}
            </p>
            <div className="mt-auto pt-4 border-t border-border/50">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(e);
                }} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all duration-200 active:scale-[0.98] rounded-xl py-6"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch('/printful/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products from server');
      }
      
      const data = await response.json();
      // The backend now returns an array of formatted products directly
      const productsArray = Array.isArray(data) ? data : (data.data || []);
      
      setProducts(productsArray);
    } catch (err) {
      console.error(`Error fetching products: ${err.message}`);
      setError(err.message || 'Failed to load merchandise. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) {
    return (
      <div>
        <div className="mb-6 text-muted-foreground font-medium animate-pulse">Loading products...</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card/50 overflow-hidden border-border/50 flex flex-col h-full">
              <Skeleton className="aspect-square w-full bg-muted/40 rounded-none" />
              <div className="p-6 flex flex-col flex-grow space-y-4">
                <Skeleton className="h-7 w-3/4 bg-muted/40" />
                <Skeleton className="h-4 w-full bg-muted/40" />
                <Skeleton className="h-4 w-2/3 bg-muted/40" />
                <div className="mt-auto pt-4 border-t border-border/50">
                  <Skeleton className="h-12 w-full bg-muted/40 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-destructive/5 rounded-3xl border border-destructive/20 max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Connection Error</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={loadProducts} variant="outline" className="border-destructive/20 hover:bg-destructive/10 text-destructive">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-16 bg-card/30 backdrop-blur-sm rounded-3xl border border-border/50 max-w-3xl mx-auto shadow-sm">
        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
          <PackageX className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-4">No merchandise available</h3>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">We're currently updating our store. Check back soon for new drops!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="text-muted-foreground font-medium bg-muted/30 px-4 py-2 rounded-lg border border-border/50 inline-block">
          Total products: <span className="text-foreground font-bold">{products.length}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <ProductCard key={product.id || index} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ProductsList;