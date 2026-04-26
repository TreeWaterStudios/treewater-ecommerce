
const API_BASE = 'https://treewater-api.onrender.com';

export const createCheckoutSession = async (cartItems) => {
  try {
    const res = await fetch(`${API_BASE}/checkout/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Checkout failed');
    }

    return data;
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    throw err;
  }
};
