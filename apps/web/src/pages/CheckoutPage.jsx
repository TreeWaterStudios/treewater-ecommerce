import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { createStripeCheckoutSession, getStripeSession } from '@/api/checkoutApi.js';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });

  const { subtotal, tax } = getCartTotal();
  const shippingCost = 0;
  const finalTotal = subtotal + tax + shippingCost;

  const normalizedCartItems = useMemo(() => {
    return cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      variant_id: item.variant_id || item.variantId,
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: item.image || '',
      selectedOptions: item.selectedOptions || {},
      color: item.selectedOptions?.color || '',
      size: item.selectedOptions?.size || '',
    }));
  }, [cartItems]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const success = params.get('success');
    const canceled = params.get('canceled');

    if (canceled === '1') {
      toast.error('Checkout canceled');
      navigate('/checkout', { replace: true });
      return;
    }

    if (success === '1' && sessionId) {
      let isMounted = true;

      const verifySession = async () => {
        try {
          setVerifying(true);
          const session = await getStripeSession(sessionId);

          if (!isMounted) return;

          if (session.paymentStatus === 'paid') {
            clearCart();
            toast.success('Payment successful! Your order is being processed.');
            navigate('/merchandise', { replace: true });
          } else {
            toast.error('Payment not completed');
            navigate('/checkout', { replace: true });
          }
        } catch (error) {
          if (!isMounted) return;
          toast.error(error.message || 'Could not verify payment');
          navigate('/checkout', { replace: true });
        } finally {
          if (isMounted) setVerifying(false);
        }
      };

      verifySession();

      return () => {
        isMounted = false;
      };
    }
  }, [location.search, clearCart, navigate]);

  useEffect(() => {
    if (!cartItems.length && !new URLSearchParams(location.search).get('success')) {
      navigate('/merchandise');
    }
  }, [cartItems, navigate, location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStripeCheckout = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!normalizedCartItems.length) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/checkout?success=1`;
      const cancelUrl = `${baseUrl}/checkout?canceled=1`;

      const { url } = await createStripeCheckoutSession({
        cartItems: normalizedCartItems,
        customerData: formData,
        successUrl,
        cancelUrl,
      });

      if (!url) {
        throw new Error('Stripe checkout URL missing');
      }

      window.location.href = url;
    } catch (error) {
      console.error('Stripe checkout failed:', error);
      toast.error(error.message || 'Failed to start checkout');
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
                  <form id="checkout-form" onSubmit={handleStripeCheckout} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP</Label>
                        <Input
                          id="zip"
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country Code</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
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
                    {normalizedCartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.selectedOptions?.size && `${item.selectedOptions.size}`}
                            {item.selectedOptions?.size && item.selectedOptions?.color && ' / '}
                            {item.selectedOptions?.color && `${item.selectedOptions.color}`}
                            <span className="ml-2">× {item.quantity}</span>
                          </p>
                        </div>
                        <p className="font-semibold flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
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
                      <span>Calculated by Stripe</span>
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
                    disabled={loading || verifying || normalizedCartItems.length === 0}
                    className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg active:scale-[0.98] transition-all"
                  >
                    {loading || verifying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {verifying ? 'Verifying...' : 'Redirecting...'}
                      </>
                    ) : (
                      'Pay with Stripe'
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