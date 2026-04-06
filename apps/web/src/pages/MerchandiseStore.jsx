import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { getProducts } from '@/api/EcommerceApi.js';

export default function MerchandiseStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[STORE] 🚀 Fetching products...');
    setLoading(true);
    setError(null);
    
    // 1. Test direct API call to bypass wrapper and log raw response
    console.log('[STORE] 🔍 Initiating direct API call test...');
    fetch('https://api-ecommerce.hostinger.com/store/store_01KMCJKPFCA2CXS4AH4CF8QMFE/products')
      .then(res => {
        console.log('[STORE] 🔍 Direct API Call Status:', res.status, 'OK:', res.ok);
        return res.json();
      })
      .then(data => {
        console.log('[STORE] 🔍 Direct API Call Data Keys:', Object.keys(data));
        console.log('[STORE] 🔍 Direct API Call Data (first item):', data.products?.[0] || data[0] || 'No items');
      })
      .catch(err => console.error('[STORE] ❌ Direct API Call Error:', err));

    // 2. Call the official wrapper
    getProducts()
      .then((response) => {
        console.log('[STORE] 📦 Raw Wrapper Response:', response);
        console.log('[STORE] 📦 Response Type:', typeof response);
        console.log('[STORE] 📦 Response Keys:', response ? Object.keys(response) : 'null');

        // Handle multiple response formats safely
        let items = [];
        if (Array.isArray(response)) {
          items = response;
          console.log('[STORE] 📋 Format detected: Direct Array');
        } else if (response?.products && Array.isArray(response.products)) {
          items = response.products;
          console.log('[STORE] 📋 Format detected: Object with .products array');
        } else if (response?.items && Array.isArray(response.items)) {
          items = response.items;
          console.log('[STORE] 📋 Format detected: Object with .items array');
        } else if (response?.data && Array.isArray(response.data)) {
          items = response.data;
          console.log('[STORE] 📋 Format detected: Object with .data array');
        } else {
          console.warn('[STORE] ⚠️ Unknown response format, defaulting to empty array');
        }
        
        console.log('[STORE] 📊 Total products extracted:', items.length);
        
        items.forEach(product => {
          // Handle both 'name' and 'title' depending on the API version
          const productName = product.name || product.title || 'Unnamed Product';
          console.log(`[STORE] 🏷️ Product - ID: ${product.id}, Name: ${productName}, SKU: ${product.sku || 'N/A'}, Status: ${product.status || 'N/A'}`);
        });
        
        setProducts(items);
      })
      .catch((err) => {
        console.error('[STORE] ❌ Error fetching products:', err);
        console.error('[STORE] ❌ Stack trace:', err.stack);
        setError(err.message || 'Failed to load products. Please try again later.');
      })
      .finally(() => {
        console.log('[STORE] ✅ Fetch operation completed');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-gray-100">
      <Helmet>
        <title>Merchandise Store - TREEWATER STUDIOS</title>
        <meta name="description" content="Shop official Treewater Studios merchandise, apparel, and accessories." />
      </Helmet>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Official Merchandise
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Premium quality apparel and accessories. Represent the Treewater movement wherever you go.
            </p>
          </div>
          <Button variant="outline" className="w-full md:w-auto border-white/10 text-white hover:bg-white/5 rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter & Sort
          </Button>
        </div>

        {error ? (
          <div className="text-center py-24 bg-red-950/20 rounded-3xl border border-red-900/50">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Failed to load store</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-square rounded-2xl bg-white/5" />
                <Skeleton className="h-6 w-3/4 bg-white/5 rounded-lg" />
                <Skeleton className="h-5 w-1/4 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => {
              const productName = product.name || product.title || 'Unnamed Product';
              const productPrice = product.price || (product.price_in_cents ? product.price_in_cents / 100 : 0);
              const productImage = product.image || product.thumbnail || '/images/treewater-hoodie-front.jpg';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group flex flex-col h-full"
                >
                  <Link 
                    to={`/product/${product.id}`} 
                    state={{ product }}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4 block"
                  >
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/treewater-hoodie-front.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        View Details
                      </div>
                    </div>
                  </Link>
                  
                  <div className="flex flex-col flex-grow">
                    <Link 
                      to={`/product/${product.id}`}
                      state={{ product }}
                      className="text-lg font-bold text-white hover:text-blue-400 transition-colors line-clamp-2 mb-2"
                    >
                      {productName}
                    </Link>
                    <div className="text-blue-400 font-medium mt-auto flex items-center justify-between">
                      <span>${Number(productPrice).toFixed(2)}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
            <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-400">Check back later for new merchandise drops.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}