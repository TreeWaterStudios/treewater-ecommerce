
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';

const StripePaymentForm = ({ clientSecret, amount, onPaymentSuccess, onPaymentError, customerName }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: customerName,
          },
        },
      });

      if (error) {
        onPaymentError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      } else {
        onPaymentError('Payment failed or requires additional action.');
      }
    } catch (err) {
      onPaymentError('An unexpected error occurred during payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        },
        iconColor: '#00ffff',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      }
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-background border border-border rounded-xl shadow-sm">
        <CardElement options={cardElementOptions} className="p-2" />
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
        <Lock className="w-4 h-4" />
        <span>Payments are secure and encrypted</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-bold shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
      >
        {isProcessing ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...</>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
