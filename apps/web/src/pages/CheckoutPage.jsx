
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart.jsx';
import { Loader2 } from 'lucide-react';
import { createOrder } from '@/api/printfulApi.js';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    shippingAddress: '',
    city: '',
    state: '',
    zip: ''
  });

  const { subtotal, tax } = getCartTotal();
  const shippingCost = 0; // Free shipping for local mock
  const finalTotal = subtotal + tax + shippingCost;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/merchandise');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.email || !formData.shippingAddress || !formData.city || !formData.state || !formData.zip) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        recipient: {
          name: formData.customerName,
          address1: formData.shippingAddress,
          city: formData.city,
          state_code: formData.state,
          country_code: 'US', // Defaulting to US for this implementation
          zip: formData.zip,
          email: formData.email
        },
        items: cartItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity
        }))
      };

      await createOrder(orderData);

      toast.success(`Order placed successfully! Confirmation sent to ${formData.email}`);
      clearCart();
      
      setTimeout(() => {
        navigate('/success');
      }, 2000);

    } catch (error) {
      console.error('Order failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout - TREEWATER STUDIOS</title>
        <meta name="description" content="Complete your purchase" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <h1 className="text-3xl font-bold mb-8 tracking-tight">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-card border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        placeholder="John Doe"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="bg-background text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-background text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress">Street Address</Label>
                      <Input
                        id="shippingAddress"
                        name="shippingAddress"
                        placeholder="123 Main St"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        className="bg-background text-foreground"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="New York"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="bg-background text-foreground"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                          id="state"
                          name="state"
                          placeholder="NY"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="bg-background text-foreground"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        placeholder="10001"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="bg-background text-foreground"
                        required
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-card border-border/50 shadow-sm sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.size && `${item.size}`}
                            {item.size && item.color && ' / '}
                            {item.color && `${item.color}`}
                            <span className="ml-2">× {item.quantity}</span>
                          </p>
                        </div>
                        <p className="font-semibold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    form="checkout-form"
                    disabled={loading || cartItems.length === 0}
                    className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg active:scale-[0.98] transition-all"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
