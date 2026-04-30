import express from 'express';
import * as printfulService from '../services/printfulService.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/products/:id', async (req, res) => {
  const product = await printfulService.getProductById(req.params.id);

  const syncVariants = product?.sync_variants || product?.syncVariants || [];

  const variants = syncVariants.map((v) => {
    const syncVariantId = Number(v.sync_variant_id || v.id);

    return {
      ...v,
      sync_variant_id: syncVariantId,
      id: String(syncVariantId),
      variant_id: String(syncVariantId),
      title: v.name || v.title || '',
      name: v.name || v.title || '',
      size: v.size || '',
      color: v.color || '',
      price: v.retail_price || v.price || '0.00',
      retail_price: v.retail_price || v.price || '0.00',
    };
  });

  res.json({
    ...product,
    sync_variants: variants,
    variants,
  });
});

router.get('/products', async (req, res) => {
  logger.info('GET /products - Fetching all products from Printful');

  const formattedProducts = await printfulService.getProducts();

  console.log(`\n📈 Total formatted products: ${formattedProducts.length}`);

  res.json(formattedProducts);
});

export default router;
