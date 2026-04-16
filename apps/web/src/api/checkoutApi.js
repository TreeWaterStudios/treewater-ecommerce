const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function createStripeCheckoutSession({ cartItems, customerData, successUrl, cancelUrl }) {
  const response = await fetch(`${API_BASE}/stripe/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cartItems,
      customerData,
      successUrl,
      cancelUrl,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create Stripe checkout session');
  }

  return data;
}

export async function getStripeSession(sessionId) {
  const response = await fetch(`${API_BASE}/stripe/session/${sessionId}`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch Stripe session');
  }

  return data;
}