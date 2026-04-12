import 'dotenv/config';
import PocketBase from 'pocketbase';
import logger from './logger.js';

let pb = null;
let isAuthenticated = false;

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelayMs - Initial delay in milliseconds (default: 1000)
 * @returns {Promise<any>} Result of the function
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`🔄 Attempt ${attempt}/${maxRetries}...`);
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        logger.warn(`⚠️  Attempt ${attempt} failed: ${error.message}`);
        logger.info(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        logger.error(`❌ All ${maxRetries} attempts failed`);
      }
    }
  }
  
  throw lastError;
}

/**
 * Validate environment variables
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironmentVariables() {
  const url = process.env.POCKETBASE_URL;
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  const errors = [];
  
  if (!url) {
    errors.push('POCKETBASE_URL');
  }
  if (!email) {
    errors.push('POCKETBASE_ADMIN_EMAIL');
  }
  if (!password) {
    errors.push('POCKETBASE_ADMIN_PASSWORD');
  }

  if (errors.length > 0) {
    throw new Error(
      `PocketBase authentication failed: Missing required environment variables: ${errors.join(', ')}`
    );
  }

  return { url, email, password };
}

/**
 * Test PocketBase server connectivity
 * @param {string} url - PocketBase server URL
 * @returns {Promise<boolean>} True if server is reachable
 */
async function testServerConnectivity(url) {
  try {
    logger.info(`🔍 Testing PocketBase server connectivity at ${url}...`);
    const response = await fetch(`${url}/api/health`, { timeout: 5000 });
    
    if (response.ok) {
      logger.info(`✅ PocketBase server is reachable`);
      return true;
    } else {
      logger.warn(`⚠️  PocketBase server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    logger.warn(`⚠️  PocketBase server connectivity test failed: ${error.message}`);
    return false;
  }
}

/**
 * Authenticate with PocketBase using admin credentials
 * Called once on server startup with retry logic
 * @returns {Promise<void>}
 */
export async function authenticatePocketBase() {
  logger.info('\n========================================');
  logger.info('🔐 POCKETBASE AUTHENTICATION');
  logger.info('========================================\n');

  try {
    // Validate environment variables
    const { url, email, password } = validateEnvironmentVariables();

    logger.info('📋 Environment Variables:');
    logger.info(`   - POCKETBASE_URL: ${url}`);
    logger.info(`   - POCKETBASE_ADMIN_EMAIL: ${email}`);
    logger.info(`   - POCKETBASE_ADMIN_PASSWORD: ${'*'.repeat(password.length)}`);

    // Test server connectivity first
    const isServerReachable = await testServerConnectivity(url);
    if (!isServerReachable) {
      logger.warn('⚠️  PocketBase server may not be responding, but attempting authentication anyway...');
    }

    // Initialize PocketBase client
    logger.info(`\n🔗 Initializing PocketBase client...`);
    pb = new PocketBase(url);
    logger.info(`✅ PocketBase client initialized`);

    // Authenticate with retry logic
    logger.info(`\n🔄 Authenticating with PocketBase (max 3 retries with exponential backoff)...`);
    
    await retryWithBackoff(
      async () => {
        logger.info(`📍 Authenticating as: ${email}`);
        const authData = await pb.admins.authWithPassword(email, password);
        
        if (!authData || !authData.token) {
          throw new Error('Authentication succeeded but no token was returned');
        }
        
        return authData;
      },
      3,
      1000
    );

    // Verify authentication
    if (!pb.authStore.isValid) {
      throw new Error('PocketBase authentication store is not valid after authentication');
    }

    if (!pb.authStore.model) {
      throw new Error('PocketBase authentication model is missing');
    }

    // Log successful authentication
    logger.info(`\n✅ AUTHENTICATION SUCCESSFUL`);
    logger.info(`   - Admin Email: ${pb.authStore.model.email}`);
    logger.info(`   - Token (first 30 chars): ${pb.authStore.token.substring(0, 30)}...`);
    logger.info(`   - Auth Store Valid: ${pb.authStore.isValid}`);
    
    isAuthenticated = true;

    logger.info('\n========================================');
    logger.info('✅ PocketBase is ready to use');
    logger.info('========================================\n');

  } catch (error) {
    logger.error('\n========================================');
    logger.error('❌ POCKETBASE AUTHENTICATION FAILED');
    logger.error('========================================');
    logger.error(`\n📌 Error Details:`);
    logger.error(`   - Message: ${error.message}`);
    logger.error(`   - Code: ${error.code || 'N/A'}`);
    logger.error(`   - Status: ${error.status || 'N/A'}`);
    
    if (error.response) {
      logger.error(`   - Response Status: ${error.response.status}`);
      logger.error(`   - Response Data: ${JSON.stringify(error.response.data || {})}`);
    }
    
    logger.error(`\n🔧 Troubleshooting Steps:`);
    logger.error(`   1. Verify POCKETBASE_URL is correct (should be http://localhost:8090 for dev)`);
    logger.error(`   2. Verify POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are correct`);
    logger.error(`   3. Ensure PocketBase server is running and accessible`);
    logger.error(`   4. Check that admin user exists in PocketBase`);
    logger.error(`   5. Verify network connectivity to PocketBase server`);
    logger.error('\n========================================\n');
    
    throw error;
  }
}

/**
 * Get the authenticated PocketBase client
 * @returns {PocketBase} Authenticated PocketBase instance
 * @throws {Error} If client is not authenticated
 */
export function getPocketBaseClient() {
  if (!pb) {
    throw new Error(
      'PocketBase client is not initialized. Call authenticatePocketBase() on server startup.'
    );
  }

  if (!isAuthenticated || !pb.authStore.isValid) {
    throw new Error(
      'PocketBase client is not authenticated. Call authenticatePocketBase() on server startup.'
    );
  }

  return pb;
}

/**
 * Check if PocketBase is authenticated
 * @returns {boolean} True if authenticated and ready to use
 */
export function isPocketBaseAuthenticated() {
  return isAuthenticated && pb && pb.authStore.isValid;
}

/**
 * Get authentication status for debugging
 * @returns {Object} Status object with authentication details
 */
export function getPocketBaseStatus() {
  return {
    initialized: pb !== null,
    authenticated: isAuthenticated,
    authStoreValid: pb ? pb.authStore.isValid : false,
    hasModel: pb ? !!pb.authStore.model : false,
    email: pb && pb.authStore.model ? pb.authStore.model.email : null,
  };
}

export default pb;
