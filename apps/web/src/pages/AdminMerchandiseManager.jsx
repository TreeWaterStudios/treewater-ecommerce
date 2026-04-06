
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, Plus, Trash2, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import SyncButton from '@/components/SyncButton.jsx';

const AdminMerchandiseManager = () => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [syncedProducts, setSyncedProducts] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingSynced, setLoadingSynced] = useState(true);
  const [customNames, setCustomNames] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const { toast } = useToast();

  const fetchAvailableProducts = async () => {
    try {
      setLoadingAvailable(true);
      const response = await apiServerClient.fetch('/printful/products');
      if (!response.ok) throw new Error('Failed to fetch Printful products');
      const data = await response.json();
      setAvailableProducts(data || []);
    } catch (error) {
      console.error('Error fetching available products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load products from Printful.",
      });
    } finally {
      setLoadingAvailable(false);
    }
  };

  const fetchSyncedProducts = async () => {
    try {
      setLoadingSynced(true);
      const records = await pb.collection('merchandise_sync').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setSyncedProducts(records);
    } catch (error) {
      console.error('Error fetching synced products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load synced products from database.",
      });
    } finally {
      setLoadingSynced(false);
    }
  };

  useEffect(() => {
    fetchAvailableProducts();
    fetchSyncedProducts();
  }, []);

  const handleCustomNameChange = (id, value) => {
    setCustomNames(prev => ({ ...prev, [id]: value }));
  };

  const handleAddProduct = async (product) => {
    try {
      setProcessingId(product.id);
      
      // Check if already synced
      const alreadySynced = syncedProducts.some(p => p.printfulProductId === String(product.id));
      if (alreadySynced) {
        toast({
          title: "Already Synced",
          description: "This product is already in your store.",
        });
        return;
      }

      const displayName = customNames[product.id] || product.name;
      
      await pb.collection('merchandise_sync').create({
        printfulProductId: String(product.id),
        printfulProductName: product.name,
        displayName: displayName,
        isActive: true,
        productData: {
          description: product.description,
          image: product.image_url || product.image,
          variants: product.variants
        }
      }, { $autoCancel: false });

      toast({
        title: "Product Added",
        description: `${displayName} has been added to the store.`,
      });
      
      // Clear custom name input and refresh synced list
      setCustomNames(prev => ({ ...prev, [product.id]: '' }));
      fetchSyncedProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product to store.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (record) => {
    try {
      setProcessingId(record.id);
      await pb.collection('merchandise_sync').update(record.id, {
        isActive: !record.isActive
      }, { $autoCancel: false });
      
      toast({
        title: record.isActive ? "Product Deactivated" : "Product Activated",
        description: `${record.displayName} is now ${record.isActive ? 'hidden from' : 'visible in'} the store.`,
      });
      
      fetchSyncedProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product status.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from the store?')) return;
    
    try {
      setProcessingId(id);
      await pb.collection('merchandise_sync').delete(id, { $autoCancel: false });
      
      toast({
        title: "Product Removed",
        description: "The product has been removed from your store.",
      });
      
      fetchSyncedProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove product.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to get image for synced products
  const getProductImage = (printfulId) => {
    const product = availableProducts.find(p => String(p.id) === String(printfulId));
    return product?.image_url || product?.image;
  };

  return (
    <>
      <Helmet>
        <title>Merchandise Admin - TREEWATER STUDIOS</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Header />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Merchandise Manager</h1>
              <p className="text-muted-foreground mt-2">Select which Printful products appear in your store.</p>
            </div>
            <div className="flex items-center gap-3">
              <SyncButton onSyncComplete={() => { fetchAvailableProducts(); fetchSyncedProducts(); }} />
              <Button onClick={() => { fetchAvailableProducts(); fetchSyncedProducts(); }} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Available Printful Products */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/50 border border-border rounded-2xl overflow-hidden flex flex-col h-[700px]"
            >
              <div className="p-6 border-b border-border bg-card/80">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  Available on Printful
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                    {availableProducts.length}
                  </span>
                </h2>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loadingAvailable ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : availableProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No products found on Printful.</p>
                ) : (
                  availableProducts.map(product => {
                    const isSynced = syncedProducts.some(p => p.printfulProductId === String(product.id));
                    const imageUrl = product.image_url || product.image;
                    
                    return (
                      <div key={product.id} className={`p-4 rounded-xl border transition-colors ${isSynced ? 'bg-primary/5 border-primary/20' : 'bg-background/50 border-border hover:border-primary/50'}`}>
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-white truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">${Number(product.price || 0).toFixed(2)}</p>
                            
                            {!isSynced ? (
                              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                <Input 
                                  placeholder="Custom display name (optional)" 
                                  value={customNames[product.id] || ''}
                                  onChange={(e) => handleCustomNameChange(product.id, e.target.value)}
                                  className="h-9 text-sm bg-background"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddProduct(product)}
                                  disabled={processingId === product.id}
                                  className="shrink-0"
                                >
                                  {processingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                                  Add
                                </Button>
                              </div>
                            ) : (
                              <div className="mt-3 flex items-center text-sm text-primary font-medium">
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Added to Store
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Right Column: Synced Products */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/50 border border-border rounded-2xl overflow-hidden flex flex-col h-[700px]"
            >
              <div className="p-6 border-b border-border bg-card/80">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  Store Inventory
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                    {syncedProducts.length}
                  </span>
                </h2>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loadingSynced ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : syncedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No products added</h3>
                    <p className="text-muted-foreground">Select products from the left to add them to your store.</p>
                  </div>
                ) : (
                  syncedProducts.map(record => {
                    const imageUrl = getProductImage(record.printfulProductId) || record.productData?.image;
                    
                    return (
                      <div key={record.id} className={`p-4 rounded-xl border transition-colors ${record.isActive ? 'bg-background/80 border-border' : 'bg-muted/30 border-border/50 opacity-75'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {imageUrl ? (
                              <img src={imageUrl} alt={record.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-white truncate">{record.displayName}</h3>
                            <p className="text-xs text-muted-foreground truncate">Original: {record.printfulProductName}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex flex-col items-center gap-1">
                              <Switch 
                                checked={record.isActive}
                                onCheckedChange={() => handleToggleActive(record)}
                                disabled={processingId === record.id}
                              />
                              <span className="text-[10px] text-muted-foreground">{record.isActive ? 'Active' : 'Hidden'}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(record.id)}
                              disabled={processingId === record.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminMerchandiseManager;
