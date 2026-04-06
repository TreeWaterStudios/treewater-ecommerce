import 'dotenv/config';
import axios from 'axios';
import logger from '../utils/logger.js';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

// Validate API key on startup
if (!PRINTFUL_API_KEY) {
  logger.warn('⚠️  PRINTFUL_API_KEY is NOT SET in environment variables');
} else {
  const keyPreview = PRINTFUL_API_KEY.substring(0, 10);
  logger.info(`✅ Printful API initialized - API Key (first 10 chars): ${keyPreview}...`);
}

const axiosInstance = axios.create({
  baseURL: PRINTFUL_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    logger.info(`📍 Printful API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error(`❌ Printful request error: ${error.message}`);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    logger.info(`✅ Printful API Response: ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status || error.code || 'unknown';
    const errorMessage = error.response?.data?.error?.message || error.message;
    const errorData = error.response?.data;
    logger.error(`❌ Printful API Error: ${errorMessage} (Status: ${status})`);
    if (errorData) {
      logger.error(`📋 Printful Error Response: ${JSON.stringify(errorData)}`);
    }
    return Promise.reject(error);
  }
);

/**
 * Format a Printful product for frontend consumption
 * Returns FULL raw Printful structure with sync_product and sync_variants intact
 * @param {Object} printfulProduct - Raw product from Printful API
 * @returns {Object} Formatted product with id, printful_id, name, description, price, sync_product, sync_variants, variant_count
 */
export function formatProductForFrontend(printfulProduct) {
  if (!printfulProduct) {
    return null;
  }

  const printfulId = printfulProduct.id;
  const syncProduct = printfulProduct.sync_product || {};
  const syncVariants = printfulProduct.sync_variants || [];
  const syncProductName = syncProduct.name || printfulProduct.title || 'Unnamed Product';
  const variantCount = syncVariants.length;
  const hasSyncProduct = !!printfulProduct.sync_product;
  const hasSyncVariants = Array.isArray(syncVariants) && syncVariants.length > 0;

  // Log product processing
  console.log(`\n📦 Processing Product:`);
  console.log(`   - printful_id: ${printfulId}`);
  console.log(`   - sync_product_name: ${syncProductName}`);
  console.log(`   - variants_count: ${variantCount}`);
  console.log(`   - has_sync_product: ${hasSyncProduct}`);
  console.log(`   - has_sync_variants: ${hasSyncVariants}`);

  // Get base price from first variant
  let basePrice = 0;
  if (syncVariants.length > 0) {
    basePrice = syncVariants[0].retail_price || syncVariants[0].price || 0;
  }

  return {
    id: `prod_${printfulId}`,
    printful_id: printfulId,
    name: syncProductName,
    description: printfulProduct.description || null,
    price: basePrice,
    sync_product: syncProduct,
    sync_variants: syncVariants,
    variant_count: variantCount,
  };
}

/**
 * Fetch full product details with variants from Printful API
 * @param {number} productId - The product ID to fetch
 * @returns {Promise<Object>} Full product object with sync_variants array
 */
async function fetchProductWithVariants(productId) {
  logger.info(`📥 Fetching full details for product ${productId}...`);
  
  const response = await axiosInstance.get(`/store/products/${productId}`);
  const product = response.data?.result;
  
  if (!product) {
    throw new Error(`No product data returned for ID ${productId}`);
  }
  
  const syncVariantsCount = Array.isArray(product.sync_variants) ? product.sync_variants.length : 0;
  logger.info(`✅ Fetched product ${productId}: ${product.title}, Variants: ${syncVariantsCount}`);
  
  return product;
}

/**
 * Fetch all products from Printful API with bulletproof pagination
 * @returns {Promise<Array>} Array of products with full variant details
 */
async function getAllProducts() {
  logger.info('🔄 Starting getAllProducts() - Fetching all products from Printful');
  
  const apiKeyPreview = PRINTFUL_API_KEY ? PRINTFUL_API_KEY.substring(0, 10) : 'NOT_SET';
  logger.info(`🔑 API Key (first 10 chars): ${apiKeyPreview}...`);
  logger.info(`📍 Endpoint: ${PRINTFUL_API_URL}/store/products`);
  
  const allProducts = [];
  let offset = 0;
  const limit = 100;
  let pageNumber = 1;
  let hasMore = true;

  // Step 1: Fetch paginated product list
  while (hasMore) {
    logger.info(`\n📄 PAGE ${pageNumber} - Fetching with offset=${offset}, limit=${limit}`);
    
    const response = await axiosInstance.get('/store/products', {
      params: { offset, limit }
    });

    const products = response.data?.result || [];
    const paging = response.data?.paging || {};

    logger.info(`✅ Fetched ${products.length} products on page ${pageNumber}`);
    if (products.length > 0) {
      const productNames = products.map(p => p.title).join(', ');
      logger.info(`📦 Product names: ${productNames}`);
    }

    logger.info(`📊 Paging info - Total: ${paging.total}, Offset: ${paging.offset}, Count: ${paging.count}`);

    allProducts.push(...products);

    // Check if this is the last page
    if (products.length < limit) {
      logger.info(`⏹️  Last page detected (received ${products.length} products, less than limit of ${limit})`);
      hasMore = false;
    } else {
      offset += limit;
      pageNumber += 1;
    }
  }

  logger.info(`\n✅ PAGINATION COMPLETE - Total products fetched: ${allProducts.length}`);

  // Step 2: Fetch full details for all products in parallel
  logger.info(`\n🔄 Fetching full details for ${allProducts.length} products in parallel...`);
  const productsWithVariants = await Promise.all(
    allProducts.map(p => fetchProductWithVariants(p.id))
  );
  logger.info(`✅ All product details fetched`);

  return productsWithVariants;
}

/**
 * Main function: Get all products from Printful and format for frontend
 * @returns {Promise<Array>} Array of products in frontend format with full sync_product and sync_variants
 */
export async function getProducts() {
  logger.info('\n========================================');
  logger.info('🔄 STARTING PRINTFUL PRODUCT SYNC');
  logger.info('========================================\n');

  const rawProducts = await getAllProducts();
  
  logger.info('\n🔄 Formatting products for frontend...');
  const formattedProducts = rawProducts
    .map(product => formatProductForFrontend(product))
    .filter(product => product !== null && product.variant_count > 0);

  logger.info(`\n✅ Formatted ${formattedProducts.length} products successfully`);

  // Log first product details
  if (formattedProducts.length > 0) {
    const firstProduct = formattedProducts[0];
    const firstVariant = firstProduct.sync_variants[0] || {};
    const hasFiles = Array.isArray(firstVariant.files) && firstVariant.files.length > 0;
    const filesCount = hasFiles ? firstVariant.files.length : 0;

    console.log('\n📊 FIRST PRODUCT DETAILS:');
    console.log(`   - id: ${firstProduct.id}`);
    console.log(`   - name: ${firstProduct.name}`);
    console.log(`   - has_sync_product: ${!!firstProduct.sync_product}`);
    console.log(`   - sync_product_name: ${firstProduct.sync_product?.name || 'N/A'}`);
    console.log(`   - has_sync_variants: ${firstProduct.sync_variants.length > 0}`);
    console.log(`   - variants_count: ${firstProduct.variant_count}`);
    console.log(`   - first_variant_has_files: ${hasFiles}`);
    console.log(`   - first_variant_files_count: ${filesCount}`);
  }

  console.log(`\n📈 TOTAL FORMATTED PRODUCTS: ${formattedProducts.length}`);

  logger.info('\n========================================');
  logger.info('FINAL PRODUCT ARRAY');
  logger.info('========================================');
  logger.info(JSON.stringify(formattedProducts, null, 2));
  logger.info('========================================\n');

  return formattedProducts;
}

/**
 * Get a single product by ID from Printful API
 * @param {string} productId - The product ID to fetch
 * @returns {Promise<Object>} Clean product object with id, name, thumbnail_url, sync_variants, sync_status
 */
export async function getProductById(productId) {
  const response = await axiosInstance.get(`/store/products/${productId}`);
  const product = response.data?.result;

  if (!product) {
    throw new Error(`No product data returned for ID ${productId}`);
  }

  // Return clean product object
  return {
    id: product.id,
    name: product.title,
    thumbnail_url: product.thumbnail_url || null,
    sync_variants: product.sync_variants || [],
    sync_status: product.sync_status || null,
  };
}

/**
 * Create an order in Printful
 * @param {Object} orderData - Order data including cartItems, customerData, and payment info
 * @returns {Promise<Object>} Created order object from Printful
 */
export async function createOrder(orderData) {
  const { cartItems, customerData, paymentMethod, paymentIntentId, paypalPaymentId } = orderData;

  logger.info(`🔄 Creating Printful order with ${cartItems.length} items`);

  // Build Printful order items
  const items = cartItems.map((item) => ({
    sync_variant_id: item.variant_id,
    quantity: item.quantity,
    retail_price: item.price,
  }));

  // Build Printful order payload
  const orderPayload = {
    recipient: {
      name: `${customerData.firstName} ${customerData.lastName}`,
      address1: customerData.address,
      city: customerData.city,
      state_code: customerData.state,
      zip: customerData.zip,
      country_code: customerData.country,
      email: customerData.email,
      phone: customerData.phone || '',
    },
    items,
    external_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shipping: 'STANDARD',
    production_delay: 0,
    metadata: {
      payment_method: paymentMethod,
      payment_intent_id: paymentIntentId || null,
      paypal_payment_id: paypalPaymentId || null,
    },
  };

  logger.info(`📦 Printful order payload: ${JSON.stringify(orderPayload, null, 2)}`);

  // Create order via Printful API
  const response = await axiosInstance.post('/orders', orderPayload);
  const order = response.data?.result;

  if (!order) {
    throw new Error('No order data returned from Printful API');
  }

  logger.info(`✅ Successfully created Printful order: ${order.id}`);

  return order;
}
