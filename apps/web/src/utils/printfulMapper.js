
/**
 * Maps Printful sync_variants to a cleaner format for the frontend.
 * Extracts size and color from the variant name.
 */
export const mapVariants = (sync_variants) => {
  console.log('🔄 Mapping variants...', { count: sync_variants?.length || 0 });
  
  if (!sync_variants || !Array.isArray(sync_variants)) {
    console.warn('⚠️ No sync_variants provided to mapVariants');
    return [];
  }

  return sync_variants.map(variant => {
    // Example name: "Unisex Staple T-Shirt | Bella + Canvas 3001 (Black / M)"
    // Or sometimes just "Black / M" depending on the API response level
    let size = '';
    let color = '';
    
    const nameMatch = variant.name?.match(/\(([^)]+)\)/);
    const optionsStr = nameMatch ? nameMatch[1] : variant.name;
    
    if (optionsStr) {
      const parts = optionsStr.split('/').map(p => p.trim());
      if (parts.length >= 2) {
        color = parts[0];
        size = parts[1];
      } else if (parts.length === 1) {
        // Guess if it's a size or color based on common patterns
        const val = parts[0];
        if (['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].includes(val.toUpperCase())) {
          size = val;
        } else {
          color = val;
        }
      }
    }

    return {
      variant_id: variant.id || variant.variant_id,
      name: variant.name,
      size,
      color,
      price: variant.retail_price || variant.price || '0.00',
      image: variant.files?.find(f => f.type === 'preview')?.preview_url || null,
      files: variant.files || [],
      in_stock: variant.is_ignored === false // Printful uses is_ignored for discontinued/out of stock in some contexts
    };
  });
};

/**
 * Extracts and sorts mockup images from variants.
 * Uses ONLY ONE representative variant to avoid duplicate angles.
 */
export const extractMockupImages = (variants) => {
  console.log('🖼️ Extracting mockup images from variants...');
  
  if (!variants || variants.length === 0) {
    console.warn('⚠️ No variants provided to extractMockupImages');
    return { images: [], mainImage: null };
  }

  // 1. Find the first variant that actually has files
  const representativeVariant = variants.find(v => v.files && v.files.length > 0);
  
  if (!representativeVariant) {
    console.log('❌ No variants with files found.');
    return { images: [], mainImage: null };
  }

  console.log(`📌 Using representative variant: ${representativeVariant.name || representativeVariant.variant_id}`);

  // 2. Filter ONLY preview files
  const previewFiles = representativeVariant.files.filter(f => f.type === 'preview');
  console.log(`📸 Found ${previewFiles.length} preview files.`);

  // 3. Sort by view order (front, back, left, right)
  const getSortWeight = (url) => {
    const lowerUrl = (url || '').toLowerCase();
    if (lowerUrl.includes('front')) return 1;
    if (lowerUrl.includes('back')) return 2;
    if (lowerUrl.includes('left')) return 3;
    if (lowerUrl.includes('right')) return 4;
    return 5; // Unknown views go last
  };

  const sortedFiles = [...previewFiles].sort((a, b) => {
    return getSortWeight(a.preview_url) - getSortWeight(b.preview_url);
  });

  // 4. Format into our image object structure
  const images = sortedFiles.map(file => {
    let label = 'View';
    const lowerUrl = (file.preview_url || '').toLowerCase();
    if (lowerUrl.includes('front')) label = 'Front';
    else if (lowerUrl.includes('back')) label = 'Back';
    else if (lowerUrl.includes('left')) label = 'Left';
    else if (lowerUrl.includes('right')) label = 'Right';

    return {
      url: file.preview_url,
      label,
      type: label.toLowerCase()
    };
  }).slice(0, 4); // Limit to 4 images max

  console.log('📊 Sorted mockup images:', images.map(i => i.label));

  const mainImage = images.length > 0 ? images[0].url : null;
  
  if (mainImage) {
    console.log('🎯 Set main image:', mainImage);
  }

  return { images, mainImage };
};

/**
 * Formats a raw Printful product response into a clean frontend object.
 */
export const formatPrintfulProduct = (product) => {
  console.log(`📥 Formatting Printful product: ${product.sync_product?.name || product.name || 'Unknown'}`);
  
  try {
    const sync_product = product.sync_product || product;
    const sync_variants = product.sync_variants || [];

    // Map variants
    const mappedVariants = mapVariants(sync_variants);
    
    // Extract images
    const { images, mainImage } = extractMockupImages(mappedVariants);

    // Extract unique sizes and colors
    const sizes = [...new Set(mappedVariants.map(v => v.size).filter(Boolean))];
    const colors = [...new Set(mappedVariants.map(v => v.color).filter(Boolean))];

    // Get base price from first variant
    const basePrice = mappedVariants.length > 0 ? mappedVariants[0].price : '0.00';

    const formattedProduct = {
      id: sync_product.id,
      printful_id: sync_product.id,
      name: sync_product.name || 'Unnamed Product',
      description: sync_product.description || '',
      price: basePrice,
      images,
      mainImage,
      sizes,
      colors,
      variants: mappedVariants,
      // Keep original data just in case
      sync_product,
      sync_variants
    };

    console.log('✅ Successfully formatted product:', formattedProduct.name);
    return formattedProduct;

  } catch (error) {
    console.error('❌ Error formatting Printful product:', error);
    return null;
  }
};
