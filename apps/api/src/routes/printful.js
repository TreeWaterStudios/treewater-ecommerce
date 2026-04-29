import express from 'express';
import * as printfulService from '../services/printfulService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /products
 * Get all products from Printful API with full sync_product and sync_variants structure
 * Returns: Array of products with id, printful_id, name, description, price, sync_product, sync_variants, variant_count
 */

router.get('/products/:id', async (req, res) => {
  const product = await printfulService.getProductById(req.params.id);
  res.json(product);
});

router.get('/products', async (req, res) => {
  logger.info('GET /products - Fetching all products from Printful');
  
  const formattedProducts = await printfulService.getProducts();
  
  // Log first product structure
  if (formattedProducts.length > 0) {
    const firstProduct = formattedProducts[0];
    const firstVariant = firstProduct.sync_variants[0] || {};
    const hasFiles = Array.isArray(firstVariant.files) && firstVariant.files.length > 0;
    const filesCount = hasFiles ? firstVariant.files.length : 0;

    console.log('\n✅ GET /products RESPONSE - First Product:');
    console.log(`   - id: ${firstProduct.id}`);
    console.log(`   - name: ${firstProduct.name}`);
    console.log(`   - has_sync_product: ${!!firstProduct.sync_product}`);
    console.log(`   - sync_product_name: ${firstProduct.sync_product?.name || 'N/A'}`);
    console.log(`   - has_sync_variants: ${firstProduct.sync_variants.length > 0}`);
    console.log(`   - variants_count: ${firstProduct.variant_count}`);
    console.log(`   - first_variant_has_files: ${hasFiles}`);
    console.log(`   - first_variant_files_count: ${filesCount}`);
  }

  console.log(`\n📈 Total formatted products: ${formattedProducts.length}`);
  
  res.json(formattedProducts);
});

export default router;
