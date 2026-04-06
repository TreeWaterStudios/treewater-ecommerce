
import apiServerClient from '@/lib/apiServerClient.js';

export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const response = await apiServerClient.fetch('/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, metadata })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to initialize payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Stripe API Error (createPaymentIntent):', error);
    throw error;
  }
};

export default {
  createPaymentIntent
};
