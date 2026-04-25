import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Minus, Plus, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart.jsx';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { getProduct } from '@/api/EcommerceApi.js';
import { getMockupsForProduct } from '@/api/mockupApi.js';
import { getAdminToken } from '@/api/adminApi.js';

const fallbackImages = [
  '/images/treewater-hoodie-front.jpg',
  '/images/treewater-hoodie-back.jpg'
];

const MAX_IMAGES = 3;
const SIZE_ORDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

function extractSize(value = '') {
  const match = String(value).toUpperCase().match(/\b(2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL)\b/);
  return match ? match[1] : '';
}

function normalizeVariants(product) {
  const rawVariants =
    product?.variants ||
    product?.sync_variants ||
    product?.data?.variants ||
    product?.data?.sync_variants ||
    [];

  if (!Array.isArray(rawVariants)) return [];

  return rawVariants.map((variant, index) => {
    const name = variant?.name || variant?.title || '';
    const color =
      variant?.color ||
      variant?.color_name ||
      variant?.options?.color ||
      variant?.values?.color ||
      '';

    const size =
      variant?.size ||
      variant?.options?.size ||
      variant?.values?.size ||
      extractSize(name);

    const rawPrice =
      variant?.retail_price ??
      variant?.price ??
      variant?.priceRetail ??
      variant?.retailPrice ??
      variant?.price_in_cents ??
      variant?.retail_price_in_cents ??
      0;

    const price =
      Number(rawPrice) > 0
        ? Number(rawPrice) > 999
          ? Number(rawPrice) / 100
          : Number(rawPrice)
        : 0;

    return {
      ...variant,
      variant_id:
        variant?.variant_id ||
        variant?.id ||
        variant?.sync_variant_id ||
        `variant-${index}`,
      color: String(color || '').trim(),
      size: String(size || '').toUpperCase().trim(),
      price,
      in_stock: variant?.in_stock
    };
  });
}

function getProductBasePrice(product, normalizedVariants, fallbackProduct = null) {
  const directPrice = Number(
    product?.price ??
    product?.retail_price ??
    product?.priceRetail ??
    product?.retailPrice ??
    fallbackProduct?.price ??
    fallbackProduct?.retail_price ??
    fallbackProduct?.priceRetail ??
    fallbackProduct?.retailPrice ??
    0
  );

  if (directPrice > 0) return directPrice;

  const firstVariantPrice = normalizedVariants.find(v => Number(v.price) > 0)?.price;
  return Number(firstVariantPrice || 0);
}

export default function ProductDetailPage() {
  const isAdmin = !!getAdminToken();
  const params = useParams();
  const productId = params.productId || params.id;

  const location = useLocation();
  const stateProduct = location.state?.product || null;

  const { addToCart } = useCart();

  const [product, setProduct] = useState(stateProduct);
  const [loading, setLoading] = useState(!location.state?.product);
  const [notFound, setNotFound] = useState(false);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!product?.id) return;

    const loadMockups = async () => {
      try {
        const mockups = await getMockupsForProduct(product.id);
        const urls = mockups.map((m) => m.imageUrl || m.image).filter(Boolean);

        if (urls.length > 0) {
          setImages(urls);
          setMainImage(urls[0]);
        } else {
          setImages([]);
          setMainImage(null);
        }
      } catch (error) {
        console.error('[MOCKUPS] Failed to load mockups:', error);
        setImages([]);
        setMainImage(null);
      }
    };

    loadMockups();
  }, [product?.id]);

  useEffect(() => {
    if (!product && productId) {
      setLoading(true);
      setNotFound(false);
      
      getProduct(productId)
        .then((data) => {
          if (data) {
            setProduct((prev) => ({
              ...(prev || {}),
              ...(data || {})
            }));
          } else {
            setNotFound(true);
            setProduct(null);
          }
        })
        .catch((err) => {
          console.error('❌ [ProductDetailPage] Error fetching product:', err);
          setNotFound(true);
          setProduct(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [productId, product]);

  const handleFileSelect = async (e) => {
    if (!isAdmin) return;
    
    const files = Array.from(e.target.files || []);
    if (!files.length || !product?.id) return;

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      toast.error('Invalid file type');
      return;
    }

    try {
      const labels = imageFiles.map((_, i) => `View ${images.length + i + 1}`);
      const formData = new FormData();
      formData.append('productId', product.id);
      imageFiles.forEach((file) => formData.append('images', file));
      labels.forEach((label) => formData.append('labels', label));

      const token = getAdminToken();

if (!token) {
  throw new Error('No admin token found');
}

      const res = await fetch('https://treewater-ecommerce.onrender.com/upload-image', {
      method: 'POST',
      headers: {
      Authorization: `Bearer ${token}`,
      },
      body: formData,
  });

      if (!res.ok) throw new Error('Upload failed');

      const mockups = await getMockupsForProduct(product.id);
      const urls = mockups.map((m) => m.imageUrl || m.image).filter(Boolean);

      setImages(urls);
      setMainImage(urls[0] || null);

      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('UPLOAD FAILED:', err);
      toast.error('Upload failed', { description: err.message || 'Could not upload image.' });
    }

    e.target.value = '';
  };

  const normalizedVariants = useMemo(() => normalizeVariants(product), [product]);

  const { availableColors, availableSizes } = useMemo(() => {
    if (!normalizedVariants.length) {
      return { availableColors: [], availableSizes: [] };
    }

    const colors = [...new Set(normalizedVariants.map(v => v.color).filter(Boolean))];

    const sizes = [...new Set(normalizedVariants.map(v => v.size).filter(Boolean))]
      .sort((a, b) => {
        const aIndex = SIZE_ORDER.indexOf(a);
        const bIndex = SIZE_ORDER.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

    return { availableColors: colors, availableSizes: sizes };
  }, [normalizedVariants]);

  useEffect(() => {
    if (!selectedColor && availableColors.length === 1) {
      setSelectedColor(availableColors[0]);
    }

    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableColors, availableSizes, selectedColor, selectedSize]);

  const findVariant = (color, size) => {
    if (!normalizedVariants.length) return null;

    return (
      normalizedVariants.find(v =>
        (color ? v.color === color : true) &&
        (size ? v.size === size : true)
      ) ||
      normalizedVariants.find(v => (size ? v.size === size : true)) ||
      normalizedVariants[0] ||
      null
    );
  };

  const selectedVariant = useMemo(() => {
    return findVariant(selectedColor, selectedSize);
  }, [selectedColor, selectedSize, normalizedVariants]);

  const isSelectionComplete = useMemo(() => {
    const needsColor = availableColors.length > 0;
    const needsSize = availableSizes.length > 0;

    if (needsColor && !selectedColor) return false;
    if (needsSize && !selectedSize) return false;

    return !!selectedVariant;
  }, [availableColors, availableSizes, selectedColor, selectedSize, selectedVariant]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => {
      const newQ = prev + amount;
      if (newQ < 1) return 1;
      if (newQ > 99) return 99;
      return newQ;
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const finalPrice =
      Number(selectedVariant?.price || 0) > 0
        ? Number(selectedVariant.price)
        : getProductBasePrice(product, normalizedVariants, stateProduct);

    const cartItem = {
      id: `${product.id}-${selectedVariant.variant_id}`,
      productId: product.id,
      variantId: selectedVariant.variant_id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: mainImage || images[0] || fallbackImages[0],
      selectedOptions: {
        color: selectedVariant.color || selectedColor || '',
        size: selectedVariant.size || selectedSize || ''
      }
    };

    addToCart(cartItem);

    toast.success('Added to cart', {
      description: `${quantity}x ${product.name} (${selectedVariant.size || ''} ${selectedVariant.color || ''})`
    });

    setQuantity(1);
  };

  const handleDragEnter = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!isAdmin) return;

    if (!product?.id) return;

    let files = [];

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      files = Array.from(e.dataTransfer.items)
        .map((item) => (item.kind === 'file' ? item.getAsFile() : null))
        .filter(Boolean);
    } else {
      files = Array.from(e.dataTransfer.files);
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      toast.error('No valid image files found');
      return;
    }

    try {
      const labels = imageFiles.map((_, i) => `View ${images.length + i + 1}`);
      const formData = new FormData();
      formData.append('productId', product.id);
      imageFiles.forEach((file) => formData.append('images', file));
      labels.forEach((label) => formData.append('labels', label));

    const token = getAdminToken();

      if (!token) {
      throw new Error('No admin token found');
      }

      const res = await fetch('https://treewater-ecommerce.onrender.com/upload-image', {
      method: 'POST',
      headers: {
      Authorization: `Bearer ${token}`,
      },
      body: formData,
  });
      if (!res.ok) throw new Error('Upload failed');

      const mockups = await getMockupsForProduct(product.id);
      const urls = mockups.map((m) => m.imageUrl || m.image).filter(Boolean);

      setImages(urls);
      setMainImage(urls[0] || null);

      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('UPLOAD FAILED:', err);
      toast.error('Upload failed', { description: err.message || 'Could not upload image.' });
    }

    if (e.dataTransfer.items) {
      e.dataTransfer.items.clear();
    }
  };

  if (notFound) {
    return (
      <div className="product-detail p-8 max-w-6xl mx-auto flex flex-col min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <PackageX className="w-20 h-20 text-white/20 mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Product Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md text-lg">
            The product you're looking for doesn't exist or has been removed from our store.
          </p>
          <Link to="/merchandise">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium px-8">
              Back to Store
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="product-detail p-8 max-w-6xl mx-auto flex flex-col min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="mb-8">
            <Skeleton className="h-6 w-48 bg-white/10 rounded-md" />
          </div>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <Skeleton className="aspect-square rounded-3xl bg-white/10" />
            <div className="flex flex-col gap-6 pt-4">
              <Skeleton className="h-12 w-3/4 bg-white/10 rounded-lg" />
              <Skeleton className="h-8 w-1/4 bg-white/10 rounded-lg" />
              <Skeleton className="h-24 w-full bg-white/10 rounded-lg mt-4" />
              <div className="mt-8 space-y-4">
                <Skeleton className="h-6 w-16 bg-white/10 rounded-md" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-20 bg-white/10 rounded-xl" />
                  <Skeleton className="h-10 w-20 bg-white/10 rounded-xl" />
                  <Skeleton className="h-10 w-20 bg-white/10 rounded-xl" />
                </div>
              </div>
              <Skeleton className="h-16 w-full bg-white/10 rounded-xl mt-auto" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayPrice =
    Number(selectedVariant?.price || 0) > 0
      ? Number(selectedVariant.price)
      : getProductBasePrice(product, normalizedVariants, stateProduct);

  return (
    <div className="product-detail p-8 max-w-6xl mx-auto flex flex-col min-h-screen bg-[#0a0a0a]">
      <Helmet>
        <title>{`${product.name} - TREEWATER STUDIOS`}</title>
        <meta name="description" content={product.description || `Buy ${product.name}`} />
      </Helmet>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link to="/merchandise" className="inline-flex items-center text-white hover:text-blue-400 transition-colors mb-8 font-medium drop-shadow-md">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Merchandise
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            {isAdmin && (
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            )}

            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 aspect-square flex items-center justify-center p-8 backdrop-blur-sm"
            >
              <AnimatePresence mode="wait">
                {mainImage ? (
                  <div 
                    className={`image-drop-zone w-full h-full flex items-center justify-center ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    title={isAdmin ? "Drag and drop images here to add custom views" : undefined}
                  >
                    <motion.img
                      key={mainImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={mainImage || fallbackImages[0]}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-2xl"
                      style={{ pointerEvents: 'none' }}
                      onError={(e) => {
                        e.target.src = fallbackImages[0];
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className={`image-drop-zone absolute inset-0 flex items-center justify-center text-white/50 ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="animate-pulse">Loading image... {isAdmin && '(Drop images here)'}</div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {isAdmin && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => document.getElementById('product-image-upload')?.click()}
                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border-none"
                >
                  Upload Images
                </Button>
              </div>
            )}
            
            {images && images.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(imgUrl || fallbackImages[0])}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all group bg-black/40 ${
                        mainImage === imgUrl ? 'border-blue-400 ring-2 ring-blue-300' : 'border-white/10 hover:border-blue-400/80'
                      }`}
                    >
                      <img 
                        src={imgUrl || fallbackImages[0]} 
                        alt={`View ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = fallbackImages[0];
                          e.target.onerror = null;
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-white/50 text-sm py-4 text-center border border-white/10 rounded-xl bg-white/5">
                No product images available
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg" style={{ letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
            
            <div className="text-3xl font-bold text-blue-400 mb-6 drop-shadow-md">
              ${Number(displayPrice).toFixed(2)}
            </div>

            <div className="prose prose-neutral dark:prose-invert text-gray-300 text-lg mb-8 leading-relaxed drop-shadow-md">
              <p>{product.description?.replace(/<[^>]*>?/gm, '') || 'Premium quality merchandise from Treewater Studios.'}</p>
            </div>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider drop-shadow-md">Color</h3>
                  <span className="text-sm font-medium text-white drop-shadow-md">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(color => (
                    <Button
                      key={color}
                      variant="outline"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-xl transition-all border-2 ${
                        selectedColor === color 
                          ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                          : 'bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider drop-shadow-md">Size</h3>
                  <span className="text-sm font-medium text-white drop-shadow-md">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => {
                    const isAvailable = !selectedColor || findVariant(selectedColor, size);
                    
                    return (
                      <Button
                        key={size}
                        variant="outline"
                        onClick={() => setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`rounded-xl transition-all min-w-[3rem] border-2 ${
                          selectedSize === size 
                            ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                            : 'bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-white mb-3 uppercase tracking-wider drop-shadow-md">Quantity</h3>
              <div className="flex items-center border border-white/20 rounded-xl w-fit bg-white/5 backdrop-blur-sm">
                <Button 
                  onClick={() => handleQuantityChange(-1)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-l-xl rounded-r-none text-white hover:bg-white/10 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <input 
                  type="number" 
                  min="1" 
                  max="99" 
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuantity(Math.min(Math.max(1, val), 99));
                  }}
                  className="w-16 h-12 text-center font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-white"
                />
                <Button 
                  onClick={() => handleQuantityChange(1)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-r-xl rounded-l-none text-white hover:bg-white/10 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Action */}
            <div className="mt-auto pt-8 border-t border-white/10">
              <Button 
                onClick={handleAddToCart} 
                disabled={!isSelectionComplete}
                size="lg" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-7 text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border-none"
              >
                <ShoppingCart className="mr-2 h-6 w-6" /> 
                {!isSelectionComplete ? 'Select options to add' : 'Add to Cart'}
              </Button>
              
              {selectedVariant && selectedVariant.in_stock === false && (
                <p className="text-red-400 text-sm text-center mt-3 font-medium drop-shadow-md">
                  Currently out of stock
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}