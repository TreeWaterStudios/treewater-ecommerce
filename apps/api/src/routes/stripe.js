import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY is not set in environment variables');
}

/**
 * POST /stripe/create-payment-intent
 * Create a Stripe payment intent
 * Body: { amount: number, currency: string, metadata: Object }
 */
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, metadata } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ error: 'Currency is required and must be a string' });
  }

  logger.info(`POST /stripe/create-payment-intent - Creating payment intent for ${amount} ${currency}`);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: metadata || {},
  });

  logger.info(`Successfully created payment intent: ${paymentIntent.id}`);

  // SECURITY: Only return clientSecret and paymentIntentId, NEVER expose the secret key
  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

/**
 * POST /stripe/create-checkout
 * Create a Stripe Checkout Session
 * Body: { amount: number, productName: string, successUrl: string, cancelUrl: string }
 */
router.post('/create-checkout', async (req, res) => {
  const { amount, productName, successUrl, cancelUrl } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  if (!productName || typeof productName !== 'string') {
    return res.status(400).json({ error: 'Product name is required and must be a string' });
  }

  if (!successUrl || typeof successUrl !== 'string') {
    return res.status(400).json({ error: 'Success URL is required and must be a string' });
  }

  if (!cancelUrl || typeof cancelUrl !== 'string') {
    return res.status(400).json({ error: 'Cancel URL is required and must be a string' });
  }

  logger.info(`POST /stripe/create-checkout - Creating checkout session for ${productName} (${amount})`);

  // SECURITY: All Stripe API calls happen server-side with secret key
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  logger.info(`Successfully created checkout session: ${session.id}`);

  // SECURITY: Only return the session URL, NEVER expose the secret key or sensitive session data
  res.json({
    url: session.url,
    sessionId: session.id,
  });
});

/**
 * GET /stripe/session/:sessionId
 * Retrieve and verify a Stripe Checkout Session
 * Returns payment status and customer details
 */
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required and must be a string' });
  }

  logger.info(`GET /stripe/session/${sessionId} - Retrieving session details`);

  // SECURITY: All Stripe API calls happen server-side with secret key
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  logger.info(`Successfully retrieved session: ${session.id}, payment_status: ${session.payment_status}`);

  // SECURITY: Only return safe, non-sensitive session data to frontend
  res.json({
    id: session.id,
    status: session.payment_status, // 'paid', 'unpaid', 'no_payment_required'
    amountTotal: session.amount_total,
    amountSubtotal: session.amount_subtotal,
    currency: session.currency,
    customerEmail: session.customer_details?.email || null,
    customerName: session.customer_details?.name || null,
    mode: session.mode,
  });
});

export default router;