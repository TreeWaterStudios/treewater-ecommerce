import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('[UPLOAD] Created /uploads directory');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp + random string + original extension
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}_${random}${ext}`;
    logger.info(`[UPLOAD] Generated filename: ${filename}`);
    cb(null, filename);
  },
});

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

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Multer error handling middleware
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error(`[UPLOAD] Multer error: ${err.code} - ${err.message}`);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' });
    }
    
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  
  if (err) {
    logger.error(`[UPLOAD] File upload error: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
  
  next();
};

export default upload;
