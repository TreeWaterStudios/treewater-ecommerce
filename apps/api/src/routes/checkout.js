import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Compatibility route:
 * POST /checkout/stripe/create-session
 * Body: { cartItems, customerData, successUrl, cancelUrl }
 */
router.post('/stripe/create-session', async (req, res, next) => {
  try {
    const { cartItems, customerData, successUrl, cancelUrl } = req.body;

    if (!Array.isArray(cartItems) || !cartItems.length) {
      return res.status(400).json({ error: 'cartItems must be a non-empty array' });
    }

    if (!customerData?.email) {
      return res.status(400).json({ error: 'customerData.email is required' });
    }

    const metadata = {};
    const cartJson = JSON.stringify(
      cartItems.map((item) => ({
        id: item.id || null,
        variant_id: item.variant_id || item.variantId || null,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        name: item.name || 'Product',
        color: item.selectedOptions?.color || item.color || '',
        size: item.selectedOptions?.size || item.size || '',
        image: item.image || '',
      }))
    );

    const customerJson = JSON.stringify({
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      email: customerData.email || '',
      address: customerData.address || '',
      city: customerData.city || '',
      state: customerData.state || '',
      zip: customerData.zip || '',
      country: customerData.country || 'US',
      phone: customerData.phone || '',
    });

    metadata.cart_chunk_count = '1';
    metadata.customer_chunk_count = '1';
    metadata.cart_1 = cartJson;
    metadata.customer_1 = customerJson;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || 'TreeWater Product',
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity || 1),
      })),
      customer_email: customerData.email,
      billing_address_collection: 'required',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    logger.info(`Compatibility checkout session created: ${session.id}`);

    res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;