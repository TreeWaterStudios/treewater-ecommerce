import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { getPocketBaseClient } from '../utils/pocketbaseAuth.js';
import logger from '../utils/logger.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed (JPEG, PNG, GIF, WebP)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/products/:productId/mockups', async (req, res) => {
  try {
    const { productId } = req.params;
    const pb = getPocketBaseClient();
    const mockups = await pb.collection('mockups').getFullList({
      filter: `productId = "${productId}"`,
      sort: 'displayOrder',
    });

    const formattedMockups = mockups.map((mockup) => ({
      id: mockup.id,
      imageUrl: mockup.imageUrl,
      label: mockup.label || null,
      displayOrder: mockup.displayOrder,
    }));

    res.json(formattedMockups);
  } catch (error) {
    logger.error('[MOCKUPS] GET failed:', error);
    res.status(500).json({ error: 'Failed to fetch mockups' });
  }
});

router.post('/products/:productId/mockups', upload.single('file'), async (req, res) => {
  try {
    const { productId } = req.params;
    const { label } = req.body;
    const pb = getPocketBaseClient();

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { buffer } = req.file;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'product-mockups',
          resource_type: 'auto',
          timeout: 60000,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned no result'));
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const { secure_url } = uploadResult;

    const existingMockups = await pb.collection('mockups').getFullList({
      filter: `productId = "${productId}"`,
      sort: '-displayOrder',
    });

    const maxDisplayOrder = existingMockups.length > 0 ? existingMockups[0].displayOrder : 0;
    const newDisplayOrder = maxDisplayOrder + 1;

    const mockupRecord = await pb.collection('mockups').create({
      productId,
      imageUrl: secure_url,
      label: label || null,
      displayOrder: newDisplayOrder,
    });

    res.status(201).json({
      id: mockupRecord.id,
      imageUrl: mockupRecord.imageUrl,
      label: mockupRecord.label || null,
      displayOrder: mockupRecord.displayOrder,
    });
  } catch (error) {
    logger.error('[MOCKUPS] POST failed:', error);
    res.status(500).json({ error: 'Failed to upload mockup' });
  }
});

export default router;
