import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';
import requireAdminAuth from '../middleware/requireAdminAuth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration on startup
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.warn('⚠️  Cloudinary credentials are NOT fully configured in environment variables');
  logger.warn('   - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ set' : '✗ missing');
  logger.warn('   - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ set' : '✗ missing');
  logger.warn('   - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ set' : '✗ missing');
} else {
  logger.info('✅ Cloudinary configured successfully');
}

// Configure multer with memory storage
const storage = multer.memoryStorage();

// File filter - only allow image MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  logger.info(`[UPLOAD] File received - Original name: ${file.originalname}, MIME type: ${file.mimetype}`);

  if (allowedMimes.includes(file.mimetype)) {
    logger.info(`[UPLOAD] File MIME type accepted: ${file.mimetype}`);
    cb(null, true);
  } else {
    logger.warn(`[UPLOAD] File MIME type rejected: ${file.mimetype}. Allowed types: ${allowedMimes.join(', ')}`);
    cb(new Error('Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP)'));
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
 * POST /upload-image
 * Admin only
 */
router.post('/upload-image', requireAdminAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      logger.warn('[UPLOAD] No file provided in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    const { originalname, size, mimetype, buffer } = req.file;

    logger.info(`[UPLOAD] Admin ${req.admin?.email || req.admin?.id || 'unknown'} uploading image`);
    logger.info(`[UPLOAD]   - Filename: ${originalname}`);
    logger.info(`[UPLOAD]   - Size: ${size} bytes`);
    logger.info(`[UPLOAD]   - MIME type: ${mimetype}`);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'product-images',
          resource_type: 'auto',
          timeout: 60000,
        },
        (error, result) => {
          if (error) {
            logger.error(`[UPLOAD] Cloudinary upload failed: ${error.message}`);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (!result) {
            logger.error('[UPLOAD] Cloudinary returned no result');
            reject(new Error('Cloudinary upload returned no result'));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    const { secure_url, public_id } = result;

    logger.info('[UPLOAD] File uploaded to Cloudinary successfully');
    logger.info(`[UPLOAD]   - Public ID: ${public_id}`);
    logger.info(`[UPLOAD]   - URL: ${secure_url}`);
    logger.info(`[UPLOAD]   - Size: ${size} bytes`);

    res.json({
      success: true,
      url: secure_url,
      public_id,
      size,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
