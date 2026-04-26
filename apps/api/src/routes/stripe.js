import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';
import * as printfulService from '../services/printfulService.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  logger.warn('STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

function chunkString(value, size = 450) {
  if (!value) return [];
  const chunks = [];
  for (let i = 0; i < value.length; i += size) {
    chunks.push(value.slice(i, i + size));
  }
  return chunks;
}

function buildMetadata(cartItems = [], customerData = {}) {
  const compactCart = cartItems.map((item) => ({
  id: item.id || null,

  sync_variant_id:
    item.sync_variant_id ||
    item.syncVariantId ||
    item.variant_id ||
    item.variantId ||
    null,

  variant_id: item.variant_id || item.variantId || null,

  quantity: Number(item.quantity || 1),
  price: Number(item.price || 0),
  name: item.name || 'Product',
  color: item.selectedOptions?.color || item.color || '',
  size: item.selectedOptions?.size || item.size || '',
  image: item.image || '',
}));

  const compactCustomer = {
    firstName: customerData.firstName || '',
    lastName: customerData.lastName || '',
    email: customerData.email || '',
    address: customerData.address || '',
    city: customerData.city || '',
    state: customerData.state || '',
    zip: customerData.zip || '',
    country: customerData.country || 'US',
    phone: customerData.phone || '',
  };

  const cartJson = JSON.stringify(compactCart);
  const customerJson = JSON.stringify(compactCustomer);

  const cartChunks = chunkString(cartJson);
  const customerChunks = chunkString(customerJson);

  const metadata = {
    cart_chunk_count: String(cartChunks.length),
    customer_chunk_count: String(customerChunks.length),
  };

  cartChunks.forEach((chunk, index) => {
    metadata[`cart_${index + 1}`] = chunk;
  });

  customerChunks.forEach((chunk, index) => {
    metadata[`customer_${index + 1}`] = chunk;
  });

  return metadata;
}

function readChunkedMetadata(metadata = {}, prefix) {
  const count = Number(metadata[`${prefix}_chunk_count`] || 0);
  if (!count) return '';

  let value = '';
  for (let i = 1; i <= count; i += 1) {
    value += metadata[`${prefix}_${i}`] || '';
  }
  return value;
}

function parseMetadataPayload(metadata = {}) {
  const cartJson = readChunkedMetadata(metadata, 'cart');
  const customerJson = readChunkedMetadata(metadata, 'customer');

  return {
    cartItems: cartJson ? JSON.parse(cartJson) : [],
    customerData: customerJson ? JSON.parse(customerJson) : null,
  };
}

function validateCheckoutInput(cartItems, customerData, successUrl, cancelUrl) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('cartItems must be a non-empty array');
  }

  for (const item of cartItems) {
    if (!item.variant_id && !item.variantId) {
      throw new Error('Each cart item must include variant_id or variantId');
    }
    if (!item.quantity || Number(item.quantity) <= 0) {
      throw new Error('Each cart item must include a valid quantity');
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error('Each cart item must include a valid price');
    }
  }

  if (!customerData || typeof customerData !== 'object') {
    throw new Error('customerData is required');
  }

  const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip', 'country'];
  for (const field of requiredFields) {
    if (!customerData[field] || typeof customerData[field] !== 'string') {
      throw new Error(`Missing required customer field: ${field}`);
    }
  }

  if (!successUrl || typeof successUrl !== 'string') {
    throw new Error('successUrl is required');
  }

  if (!cancelUrl || typeof cancelUrl !== 'string') {
    throw new Error('cancelUrl is required');
  }
}

/**
 * POST /stripe/create-checkout
 * Body: { cartItems, customerData, successUrl, cancelUrl }
 */
router.post('/create-checkout', async (req, res, next) => {
  try {
    const { cartItems, customerData, successUrl, cancelUrl } = req.body;

    validateCheckoutInput(cartItems, customerData, successUrl, cancelUrl);

    const metadata = buildMetadata(cartItems, customerData);

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || 'TreeWater Product',
          images:
            item.image && item.image.startsWith('https://')
              ? [item.image]
              : [],
          metadata: {
            variant_id: String(item.variant_id || item.variantId),
            color: item.selectedOptions?.color || item.color || '',
            size: item.selectedOptions?.size || item.size || '',
          },
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerData.email,
      billing_address_collection: 'required',
      metadata,
    });

    logger.info(`Stripe Checkout Session created: ${session.id}`);

    res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /stripe/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      id: session.id,
      status: session.payment_status,
      customerEmail: session.customer_details?.email || session.customer_email || null,
      customerName: session.customer_details?.name || null,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /stripe/webhook
 */
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error(`Stripe webhook signature verification failed: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      logger.info(`Stripe webhook checkout.session.completed received: ${session.id}`);

      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      const { cartItems, customerData } = parseMetadataPayload(fullSession.metadata || {});

      if (!cartItems.length) {
        throw new Error(`No cartItems found in Stripe metadata for session ${session.id}`);
      }

      if (!customerData) {
        throw new Error(`No customerData found in Stripe metadata for session ${session.id}`);
      }

      await printfulService.createOrder({
        cartItems,
        customerData,
        paymentMethod: 'stripe',
        paymentIntentId: fullSession.payment_intent,
        checkoutSessionId: fullSession.id,
      });

      logger.info(`Printful order created from Stripe session: ${fullSession.id}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Stripe webhook processing failed: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

export default router;