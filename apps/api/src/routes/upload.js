import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

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
 * POST /upload-image
 * Upload a single image file to Cloudinary
 * Accepts: multipart/form-data with 'file' field
 * Returns: { success: true, url: string, public_id: string, size: number }
 */
router.post('/upload-image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    logger.warn('[UPLOAD] No file provided in request');
    return res.status(400).json({ error: 'No file provided' });
  }

  const { originalname, size, mimetype, buffer } = req.file;

  logger.info(`[UPLOAD] Processing file upload`);
  logger.info(`[UPLOAD]   - Filename: ${originalname}`);
  logger.info(`[UPLOAD]   - Size: ${size} bytes`);
  logger.info(`[UPLOAD]   - MIME type: ${mimetype}`);

  // Upload to Cloudinary using buffer
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'product-images',
      resource_type: 'auto',
      timeout: 60000,
    },
    async (error, result) => {
      if (error) {
        logger.error(`[UPLOAD] Cloudinary upload failed: ${error.message}`);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
      }

      if (!result) {
        logger.error('[UPLOAD] Cloudinary returned no result');
        throw new Error('Cloudinary upload returned no result');
      }

      const { secure_url, public_id } = result;

      logger.info(`[UPLOAD] File uploaded to Cloudinary successfully`);
      logger.info(`[UPLOAD]   - Public ID: ${public_id}`);
      logger.info(`[UPLOAD]   - URL: ${secure_url}`);
      logger.info(`[UPLOAD]   - Size: ${size} bytes`);

      res.json({
        success: true,
        url: secure_url,
        public_id,
        size,
      });
    }
  );

  // Pipe buffer to upload stream
  uploadStream.end(buffer);
});

export default router;
