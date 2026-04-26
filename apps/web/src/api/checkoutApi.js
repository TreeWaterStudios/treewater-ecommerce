const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://treewater-api.onrender.com';

export async function createStripeCheckoutSession({
  cartItems,
  customerData,
  successUrl,
  cancelUrl,
}) {
  const response = await fetch(`${API_BASE}/checkout/create-checkout-session`, {
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
  const response = await fetch(`${API_BASE}/checkout/session/${sessionId}`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch Stripe session');
  }

  return data;
}