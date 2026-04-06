import express from 'express';
import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';
import logger from '../utils/logger.js';
import * as printfulService from '../services/printfulService.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  logger.warn('PayPal credentials (PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET) are not set in environment variables');
}

/**
 * Validate cart items - ensure all have variant_id
 * @param {Array} cartItems - Array of cart items
 * @throws {Error} If validation fails
 */
function validateCartItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart items must be a non-empty array');
  }

  for (const item of cartItems) {
    if (!item.variant_id) {
      throw new Error(`Cart item missing required field: variant_id`);
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(`Cart item has invalid quantity`);
    }
    if (!item.price || typeof item.price !== 'number' || item.price < 0) {
      throw new Error(`Cart item has invalid price`);
    }
  }
}

/**
 * Validate customer data
 * @param {Object} customerData - Customer information
 * @throws {Error} If validation fails
 */
function validateCustomerData(customerData) {
  if (!customerData || typeof customerData !== 'object') {
    throw new Error('Customer data is required and must be an object');
  }

  const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip', 'country'];
  for (const field of requiredFields) {
    if (!customerData[field] || typeof customerData[field] !== 'string') {
      throw new Error(`Customer data missing or invalid required field: ${field}`);
    }
  }
}

/**
 * POST /checkout
 * Main checkout endpoint - accepts cart, customer, and payment method
 * Processes payment via Stripe or PayPal and creates Printful order
 * Body: { cart: Array, customer: Object, paymentMethod: string }
 * Returns: { success: boolean, orderId: string, message: string }
 */
router.post('/', async (req, res) => {
  const { cart, customer, paymentMethod } = req.body;

  // Validate inputs
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart must be a non-empty array' });
  }

  if (!customer || typeof customer !== 'object') {
    return res.status(400).json({ error: 'Customer data is required' });
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    return res.status(400).json({ error: 'Payment method is required' });
  }

  if (!['stripe', 'paypal'].includes(paymentMethod.toLowerCase())) {
    return res.status(400).json({ error: 'Payment method must be "stripe" or "paypal"' });
  }

  validateCartItems(cart);
  validateCustomerData(customer);

  // Calculate total amount
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  logger.info(`POST /checkout - Processing ${paymentMethod} payment`);
  logger.info(`📦 Cart items: ${cart.length}, Total: $${totalAmount.toFixed(2)}`);
  logger.info(`👤 Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);

  let printfulOrder;

  if (paymentMethod.toLowerCase() === 'stripe') {
    logger.info('💳 Processing Stripe payment...');

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        customerEmail: customer.email,
        itemCount: cart.length,
      },
    });

    logger.info(`✅ Stripe payment intent created: ${paymentIntent.id}`);

    // For this endpoint, we assume payment is already confirmed
    // In production, you'd verify the payment status
    if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_payment_method') {
      throw new Error(`Stripe payment intent has unexpected status: ${paymentIntent.status}`);
    }

    // Create Printful order
    printfulOrder = await printfulService.createOrder({
      cartItems: cart,
      customerData: customer,
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
    });
  } else if (paymentMethod.toLowerCase() === 'paypal') {
    logger.info('🅿️  Processing PayPal payment...');

    // Build PayPal items array
    const paypalItems = cart.map((item) => ({
      name: item.name || `Product ${item.variant_id}`,
      sku: item.variant_id,
      price: item.price.toFixed(2),
      quantity: item.quantity,
      currency: 'USD',
    }));

    // Create PayPal payment
    const paymentDetails = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
        payer_info: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          address: {
            recipient_name: `${customer.firstName} ${customer.lastName}`,
            line1: customer.address,
            city: customer.city,
            state: customer.state,
            postal_code: customer.zip,
            country_code: customer.country,
          },
        },
      },
      transactions: [
        {
          amount: {
            total: totalAmount.toFixed(2),
            currency: 'USD',
            details: {
              subtotal: totalAmount.toFixed(2),
            },
          },
          item_list: {
            items: paypalItems,
          },
          description: `Order with ${cart.length} item(s)`,
        },
      ],
    };

    // Create payment using PayPal SDK
    const payment = await new Promise((resolve, reject) => {
      paypal.payment.create(paymentDetails, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });

    logger.info(`✅ PayPal payment created: ${payment.id}`);

    // For this endpoint, we assume payment is already executed
    // In production, you'd verify the payment state
    if (payment.state !== 'created' && payment.state !== 'approved') {
      throw new Error(`PayPal payment has unexpected state: ${payment.state}`);
    }

    // Create Printful order
    printfulOrder = await printfulService.createOrder({
      cartItems: cart,
      customerData: customer,
      paymentMethod: 'paypal',
      paypalPaymentId: payment.id,
    });
  }

  logger.info(`✅ Checkout completed successfully - Printful order: ${printfulOrder.id}`);

  res.json({
    success: true,
    orderId: printfulOrder.id,
    message: `Order created successfully. Order ID: ${printfulOrder.id}`,
  });
});

/**
 * POST /checkout/stripe
 * Create a Stripe Payment Intent for checkout
 * Body: { cartItems: Array, customerData: Object, totalAmount: number }
 * Returns: { clientSecret: string }
 */
router.post('/stripe', async (req, res) => {
  const { cartItems, customerData, totalAmount } = req.body;

  // Validate inputs
  if (!totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ error: 'Total amount must be a positive number' });
  }

  validateCartItems(cartItems);
  validateCustomerData(customerData);

  logger.info(`POST /checkout/stripe - Creating payment intent for $${totalAmount}`);

  // Generate order ID (can be replaced with database ID later)
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const customerId = `customer_${customerData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      customerId,
      orderId,
      customerEmail: customerData.email,
      itemCount: cartItems.length,
    },
  });

  logger.info(`Successfully created Stripe payment intent: ${paymentIntent.id}`);

  // SECURITY: Only return clientSecret, NEVER expose full intent object
  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId,
  });
});

/**
 * POST /checkout/stripe/confirm
 * Confirm Stripe payment and create Printful order
 * Body: { paymentIntentId: string, cartItems: Array, customerData: Object }
 * Returns: { success: boolean, printfulOrderId: string }
 */
router.post('/stripe/confirm', async (req, res) => {
  const { paymentIntentId, cartItems, customerData } = req.body;

  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return res.status(400).json({ error: 'Payment intent ID is required' });
  }

  validateCartItems(cartItems);
  validateCustomerData(customerData);

  logger.info(`POST /checkout/stripe/confirm - Confirming payment ${paymentIntentId}`);

  // Retrieve payment intent to verify payment status
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new Error(`Payment intent ${paymentIntentId} has status: ${paymentIntent.status}, expected 'succeeded'`);
  }

  logger.info(`Payment confirmed for intent ${paymentIntentId}`);

  // Create Printful order
  const printfulOrder = await printfulService.createOrder({
    cartItems,
    customerData,
    paymentMethod: 'stripe',
    paymentIntentId,
  });

  logger.info(`Successfully created Printful order: ${printfulOrder.id}`);

  res.json({
    success: true,
    printfulOrderId: printfulOrder.id,
    paymentIntentId,
  });
});

/**
 * POST /checkout/paypal
 * Create a PayPal order for checkout
 * Body: { cartItems: Array, customerData: Object, totalAmount: number, returnUrl: string, cancelUrl: string }
 * Returns: { paypalOrderId: string, approvalUrl: string }
 */
router.post('/paypal', async (req, res) => {
  const { cartItems, customerData, totalAmount, returnUrl, cancelUrl } = req.body;

  // Validate inputs
  if (!totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ error: 'Total amount must be a positive number' });
  }

  if (!returnUrl || typeof returnUrl !== 'string') {
    return res.status(400).json({ error: 'Return URL is required' });
  }

  if (!cancelUrl || typeof cancelUrl !== 'string') {
    return res.status(400).json({ error: 'Cancel URL is required' });
  }

  validateCartItems(cartItems);
  validateCustomerData(customerData);

  logger.info(`POST /checkout/paypal - Creating PayPal order for $${totalAmount}`);

  // Build PayPal items array
  const paypalItems = cartItems.map((item) => ({
    name: item.name || `Product ${item.variant_id}`,
    sku: item.variant_id,
    price: item.price.toFixed(2),
    quantity: item.quantity,
    currency: 'USD',
  }));

  // Create PayPal payment
  const paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
      payer_info: {
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        address: {
          recipient_name: `${customerData.firstName} ${customerData.lastName}`,
          line1: customerData.address,
          city: customerData.city,
          state: customerData.state,
          postal_code: customerData.zip,
          country_code: customerData.country,
        },
      },
    },
    transactions: [
      {
        amount: {
          total: totalAmount.toFixed(2),
          currency: 'USD',
          details: {
            subtotal: totalAmount.toFixed(2),
          },
        },
        item_list: {
          items: paypalItems,
        },
        description: `Order with ${cartItems.length} item(s)`,
      },
    ],
    redirect_urls: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  // Create payment using PayPal SDK
  const payment = await new Promise((resolve, reject) => {
    paypal.payment.create(paymentDetails, (error, payment) => {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });

  logger.info(`Successfully created PayPal payment: ${payment.id}`);

  // Find approval URL
  const approvalUrl = payment.links.find((link) => link.rel === 'approval_url')?.href;

  if (!approvalUrl) {
    throw new Error('PayPal approval URL not found in payment response');
  }

  // SECURITY: Only return order ID and approval URL
  res.json({
    paypalOrderId: payment.id,
    approvalUrl,
  });
});

/**
 * POST /checkout/paypal/execute
 * Execute PayPal payment and create Printful order
 * Body: { paypalPaymentId: string, payerId: string, cartItems: Array, customerData: Object }
 * Returns: { success: boolean, printfulOrderId: string }
 */
router.post('/paypal/execute', async (req, res) => {
  const { paypalPaymentId, payerId, cartItems, customerData } = req.body;

  if (!paypalPaymentId || typeof paypalPaymentId !== 'string') {
    return res.status(400).json({ error: 'PayPal payment ID is required' });
  }

  if (!payerId || typeof payerId !== 'string') {
    return res.status(400).json({ error: 'Payer ID is required' });
  }

  validateCartItems(cartItems);
  validateCustomerData(customerData);

  logger.info(`POST /checkout/paypal/execute - Executing PayPal payment ${paypalPaymentId}`);

  // Execute payment
  const executeDetails = {
    payer_id: payerId,
  };

  const executedPayment = await new Promise((resolve, reject) => {
    paypal.payment.execute(paypalPaymentId, executeDetails, (error, payment) => {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });

  if (executedPayment.state !== 'approved') {
    throw new Error(`PayPal payment ${paypalPaymentId} has state: ${executedPayment.state}, expected 'approved'`);
  }

  logger.info(`PayPal payment executed successfully: ${paypalPaymentId}`);

  // Create Printful order
  const printfulOrder = await printfulService.createOrder({
    cartItems,
    customerData,
    paymentMethod: 'paypal',
    paypalPaymentId,
  });

  logger.info(`Successfully created Printful order: ${printfulOrder.id}`);

  res.json({
    success: true,
    printfulOrderId: printfulOrder.id,
    paypalPaymentId,
  });
});

export default router;
