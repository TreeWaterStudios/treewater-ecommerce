import { getPocketBaseClient } from '../utils/pocketbaseAuth.js';
import logger from '../utils/logger.js';

/**
 * Middleware to validate admin authentication via Bearer token
 * Checks Authorization header, verifies token with PocketBase, and ensures admin is active
 * Attaches admin object to req.admin if validation succeeds
 * Returns 401 for missing/invalid tokens, 403 for inactive admins
 */
export async function requireAdminAuth(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('[AUTH] Missing Authorization header');
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    // Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('[AUTH] Invalid Authorization header format (expected "Bearer <token>")');
      return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    // Extract token
    const token = authHeader.slice(7); // Remove "Bearer " prefix

    if (!token || token.trim() === '') {
      logger.warn('[AUTH] Empty Bearer token');
      return res.status(401).json({ error: 'Empty Bearer token' });
    }

    // Get PocketBase client
    const pb = getPocketBaseClient();

    // Verify token with PocketBase
    logger.info('[AUTH] Verifying admin token with PocketBase...');

    let adminRecord;
    try {
      // Attempt to get the current admin using the token
      // This validates the token and retrieves the admin record
      pb.authStore.save(token, null); // Temporarily set token to verify
      adminRecord = await pb.collection('_admins').authRefresh();
    } catch (error) {
      logger.warn(`[AUTH] Token verification failed: ${error.message}`);
      pb.authStore.clear(); // Clear invalid token
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify admin record exists
    if (!adminRecord || !adminRecord.record) {
      logger.warn('[AUTH] No admin record found for token');
      pb.authStore.clear();
      return res.status(401).json({ error: 'Admin record not found' });
    }

    const admin = adminRecord.record;

    // Check if admin is active (not deleted/disabled)
    // PocketBase admins don't have an explicit "active" field, but we can check if they exist
    if (!admin.id || !admin.email) {
      logger.warn('[AUTH] Admin record is missing required fields');
      pb.authStore.clear();
      return res.status(403).json({ error: 'Admin account is invalid' });
    }

    logger.info(`[AUTH] ✅ Admin authenticated: ${admin.email}`);

    // Attach admin object to request
    req.admin = {
      id: admin.id,
      email: admin.email,
      avatar: admin.avatar || null,
      created: admin.created || null,
      updated: admin.updated || null,
    };

    // Continue to next middleware/route
    next();
  } catch (error) {
    logger.error(`[AUTH] Unexpected error during admin authentication: ${error.message}`);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

export default requireAdminAuth;
