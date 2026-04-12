import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { getPocketBaseClient } from '../utils/pocketbaseAuth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize unauthenticated PocketBase client for public access

// Configure multer with memory storage
const storage = multer.memoryStorage();

// File filter - only allow image MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  logger.info(`[MOCKUP UPLOAD] File received - Original name: ${file.originalname}, MIME type: ${file.mimetype}`);

  if (allowedMimes.includes(file.mimetype)) {
    logger.info(`[MOCKUP UPLOAD] File MIME type accepted: ${file.mimetype}`);
    cb(null, true);
  } else {
    logger.warn(
      `[MOCKUP UPLOAD] File MIME type rejected: ${file.mimetype}. Allowed types: ${allowedMimes.join(', ')}`
    );
    cb(new Error(`Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP)`));
  }
};

// Create multer instance with memory storage
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * GET /products/:productId/mockups
 * Fetch all mockups for a product from PocketBase
 * Uses unauthenticated public access - collection rules control visibility
 * Returns: Array of { id, imageUrl, label, displayOrder }
 */
router.get('/products/:productId/mockups', async (req, res) => {
  const { productId } = req.params;
  const pb = getPocketBaseClient();

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Product ID is required and must be a string' });
  }

  logger.info(`GET /products/${productId}/mockups - Fetching mockups from PocketBase`);

  // Fetch all mockups for this product, sorted by displayOrder ascending
  // Using unauthenticated client - collection access rules control visibility
  const mockups = await pb.collection('mockups').getFullList({
    filter: `productId = "${productId}"`,
    sort: 'displayOrder',
  });

  logger.info(`✅ Fetched ${mockups.length} mockups for product ${productId}`);

  // Format response
  const formattedMockups = mockups.map((mockup) => ({
    id: mockup.id,
    imageUrl: mockup.image,
    label: mockup.label || null,
    displayOrder: mockup.displayOrder,
  }));

  res.json(formattedMockups);
});

/**
 * POST /products/:productId/mockups
 * Upload a mockup image and create a record in PocketBase
 * Accepts: multipart/form-data with 'file' field and optional 'label' field
 * Uses unauthenticated public access - collection rules control write permissions
 * Returns: { id, imageUrl, label, displayOrder }
 */
router.post('/products/:productId/mockups', upload.single('file'), async (req, res) => {
  const { productId } = req.params;
  const { label } = req.body;
  const pb = getPocketBaseClient();
  
  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Product ID is required and must be a string' });
  }

  if (!req.file) {
    logger.warn('[MOCKUP UPLOAD] No file provided in request');
    return res.status(400).json({ error: 'No file provided' });
  }

  const { originalname, size, mimetype, buffer } = req.file;

  logger.info(`[MOCKUP UPLOAD] Processing file upload for product ${productId}`);
  logger.info(`[MOCKUP UPLOAD]   - Filename: ${originalname}`);
  logger.info(`[MOCKUP UPLOAD]   - Size: ${size} bytes`);
  logger.info(`[MOCKUP UPLOAD]   - MIME type: ${mimetype}`);

  // Upload to Cloudinary using buffer
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'product-mockups',
        resource_type: 'auto',
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          logger.error(`[MOCKUP UPLOAD] Cloudinary upload failed: ${error.message}`);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (!result) {
          logger.error('[MOCKUP UPLOAD] Cloudinary returned no result');
          reject(new Error('Cloudinary upload returned no result'));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });

  const { secure_url, public_id } = uploadResult;

  logger.info(`[MOCKUP UPLOAD] File uploaded to Cloudinary successfully`);
  logger.info(`[MOCKUP UPLOAD]   - Public ID: ${public_id}`);
  logger.info(`[MOCKUP UPLOAD]   - URL: ${secure_url}`);

  // Fetch max displayOrder for this product using unauthenticated client
  logger.info(`[MOCKUP UPLOAD] Fetching max displayOrder for product ${productId}`);

  const existingMockups = await pb.collection('mockups').getFullList({
    filter: `productId = "${productId}"`,
    sort: '-displayOrder',
    requestKey: null,
  });

  const maxDisplayOrder = existingMockups.length > 0 ? existingMockups[0].displayOrder : 0;
  const newDisplayOrder = maxDisplayOrder + 1;

  logger.info(`[MOCKUP UPLOAD] Max displayOrder: ${maxDisplayOrder}, New displayOrder: ${newDisplayOrder}`);

  // Create record in PocketBase using unauthenticated client
  // Collection rules control write permissions
  logger.info(`[MOCKUP UPLOAD] Creating mockup record in PocketBase`);

  const mockupRecord = await pb.collection('mockups').create({
    productId,
    image: uploadResult.secure_url,
    label: label || `View ${newDisplayOrder}`,
    displayOrder: newDisplayOrder,
  });

  logger.info(`[MOCKUP UPLOAD] ✅ Mockup record created: ${mockupRecord.id}`);

  // Format response
  const response = {
    id: mockupRecord.id,
    imageUrl: mockupRecord.image,
    label: mockupRecord.label || null,
    displayOrder: mockupRecord.displayOrder,
  };

  res.status(201).json(response);
});

export default router;
