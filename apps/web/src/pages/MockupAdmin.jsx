
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2, UploadCloud, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const MockupAdmin = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const fileInputRef = useRef(null);

  const initialFormState = {
    productId: '',
    label: '',
    displayOrder: 0,
    file: null
  };
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      console.log('Fetching products from merchandise collection...');
      // Fetch products for the dropdown
      const productsData = await pb.collection('merchandise').getFullList({ 
        sort: '-created', 
        $autoCancel: false 
      });
      
      // Fetch existing mockups
      const mockupsData = await pb.collection('mockups').getFullList({ 
        sort: 'displayOrder', 
        expand: 'productId', 
        $autoCancel: false 
      });
      
      console.log('Fetched products:', productsData);
      setProducts(productsData || []);
      setMockups(mockupsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: error?.message || "Failed to load initial data."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMockups = async () => {
    try {
      const mockupsData = await pb.collection('mockups').getFullList({ 
        sort: 'displayOrder', 
        expand: 'productId', 
        $autoCancel: false 
      });
      setMockups(mockupsData || []);
    } catch (error) {
      console.error("Failed to fetch mockups:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormState(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validate productId is not empty
    if (!formState.productId || formState.productId.trim() === '') {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select a product from the dropdown." });
      return;
    }
    
    // 2. Validate file exists
    const file = formState.file;
    if (!file) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select an image file to upload." });
      return;
    }

    // 3. Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ 
        variant: "destructive", 
        title: "Invalid file type", 
        description: "Please upload a valid image (JPEG, PNG, GIF, WEBP)." 
      });
      return;
    }

    // 4. Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ 
        variant: "destructive", 
        title: "File too large", 
        description: "Image must be less than 20MB." 
      });
      return;
    }

    // 5. Verify the selected product object exists in our fetched list
    const selectedProduct = products.find(p => p.id === formState.productId);
    
    // Debugging logs as requested
    console.log('--- Uploading Mockup via PocketBase Client ---');
    console.log('Selected product object:', selectedProduct);
    console.log('Sending productId (string):', formState.productId);
    
    if (!selectedProduct || !selectedProduct.id) {
      console.error('Validation Error: Selected product is invalid or missing ID.');
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Invalid product selected. Please refresh the page and try again." 
      });
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      
      // Append exact field names matching the schema
      // Ensure productId is a string
      form.append('productId', String(selectedProduct.id));
      form.append('image', file); // Append the actual File object
      
      if (formState.label && formState.label.trim() !== '') {
        form.append('label', formState.label.trim());
      }
      
      // Ensure displayOrder is sent as a number/string representation of a number
      const orderValue = formState.displayOrder !== '' ? String(formState.displayOrder) : '0';
      form.append('displayOrder', orderValue);

      console.log('FormData contents:');
      console.log('- productId:', String(selectedProduct.id));
      console.log('- image:', file.name, '| Size:', file.size, 'bytes', '| Type:', file.type);
      console.log('- label:', formState.label || '(empty)');
      console.log('- displayOrder:', orderValue);
      console.log('----------------------------------------------');

      // Use PocketBase client to create the record
      await pb.collection('mockups').create(form, { $autoCancel: false });

      toast({
        title: "Mockup uploaded successfully",
        description: "The mockup has been added to the product."
      });

      // Refetch ALL mockups to refresh the gallery below
      await fetchMockups();

      // Reset form state and file input
      setFormState(initialFormState);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("PocketBase Upload Error:", error);
      
      // Extract exact error message from PocketBase
      let errorMessage = error?.message || "An error occurred during upload.";
      
      if (error.data && error.data.data) {
        const validationErrors = Object.entries(error.data.data)
          .map(([field, err]) => `${field}: ${err.message}`)
          .join(', ');
        
        if (validationErrors) {
          errorMessage = `Validation failed: ${validationErrors}`;
        }
        console.error("Detailed PocketBase validation errors:", error.data.data);
      }

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mockup?')) return;
    
    try {
      await pb.collection('mockups').delete(id, { $autoCancel: false });
      toast({ title: "Mockup deleted successfully." });
      setMockups(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error?.message || "Failed to delete mockup."
      });
    }
  };

  const handleOrderChange = async (id, newOrder) => {
    const parsedOrder = Number(newOrder);
    if (isNaN(parsedOrder)) return;

    setUpdatingOrder(id);
    try {
      await pb.collection('mockups').update(id, { displayOrder: parsedOrder }, { $autoCancel: false });
      toast({ title: "Order updated successfully." });
      await fetchMockups();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.message || "Failed to update display order."
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Mockup Admin - TREEWATER STUDIOS</title>
      </Helmet>
      
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-foreground">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold neon-text mb-2">Mockup Management</h1>
            <p className="text-muted-foreground">Upload and manage product mockups.</p>
          </div>

          {/* Upload Form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg mb-12">
            <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5" />
              Upload New Mockup
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Select Product <span className="text-destructive">*</span>
                  </label>
                  <select 
                    className="w-full bg-background border border-border text-foreground rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    value={formState.productId}
                    onChange={(e) => setFormState(prev => ({ ...prev, productId: e.target.value }))}
                    disabled={loading || uploading}
                    required
                  >
                    <option value="">-- Select a product --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name || `Product ${product.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Label (Optional)
                  </label>
                  <Input 
                    type="text"
                    placeholder="e.g., Front View, Back View"
                    value={formState.label}
                    onChange={(e) => setFormState(prev => ({ ...prev, label: e.target.value }))}
                    disabled={uploading}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Display Order
                  </label>
                  <Input 
                    type="number"
                    min="0"
                    value={formState.displayOrder}
                    onChange={(e) => setFormState(prev => ({ ...prev, displayOrder: e.target.value }))}
                    disabled={uploading}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Image File <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    type="file"
                    accept="image/jpeg, image/png, image/gif, image/webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="bg-background border-border text-foreground file:text-foreground file:bg-muted file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md cursor-pointer"
                    required
                  />
                  {formState.file && (
                    <p className="text-xs text-green-500 mt-1">Image selected: {formState.file.name}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button 
                  type="submit"
                  disabled={uploading || !formState.productId || !formState.file}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4 mr-2" /> Upload Mockup</>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Existing Mockups List */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Existing Mockups
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : mockups.length === 0 ? (
              <div className="text-center py-12 bg-background/50 rounded-xl border border-dashed border-border/50">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No mockups found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground text-sm">
                      <th className="pb-3 font-medium">Image</th>
                      <th className="pb-3 font-medium">Product</th>
                      <th className="pb-3 font-medium">Label</th>
                      <th className="pb-3 font-medium">Order</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {mockups.map((mockup) => (
                      <tr key={mockup.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3">
                          <div className="w-16 h-16 rounded-lg bg-muted/30 overflow-hidden border border-border/50">
                            {mockup.image && (
                              <img 
                                src={pb.files.getUrl(mockup, mockup.image, { thumb: '100x100' })} 
                                alt={mockup.label || 'Mockup'} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {mockup.expand?.productId?.name || mockup.productId}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{mockup.label || '-'}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <Input
                              type="number"
                              defaultValue={mockup.displayOrder}
                              className="h-8 text-sm bg-background border-border"
                              onBlur={(e) => {
                                if (e.target.value !== String(mockup.displayOrder)) {
                                  handleOrderChange(mockup.id, e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.target.blur();
                                }
                              }}
                              disabled={updatingOrder === mockup.id}
                            />
                            {updatingOrder === mockup.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDelete(mockup.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            title="Delete Mockup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default MockupAdmin;
