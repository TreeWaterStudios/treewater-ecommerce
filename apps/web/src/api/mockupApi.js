const API_BASE = 'https://treewater-ecommerce.onrender.com';

const cleanProductId = (productId) => {
  const id = String(productId || '').trim();

  if (!id || id === 'undefined' || id === 'null' || id.startsWith('fallback')) {
    throw new Error(`Invalid mockup productId: ${id}`);
  }

  return id;
};

export const getMockupsForProduct = async (productId) => {
  const safeProductId = String(productId || '').trim();

  if (
    !safeProductId ||
    safeProductId === 'undefined' ||
    safeProductId === 'null' ||
    safeProductId.startsWith('fallback')
  ) {
    console.error('[MOCKUPS] Blocked bad productId:', safeProductId);
    return [];
  }

  const response = await fetch(
    `https://treewater-ecommerce.onrender.com/products/${encodeURIComponent(safeProductId)}/mockups`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch product mockups');
  }

  const data = await response.json();

  const rawMockups = Array.isArray(data)
    ? data
    : Array.isArray(data?.mockups)
      ? data.mockups
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : [];

  const isolatedMockups = rawMockups.filter((mockup) => {
  const mockupProductId = String(
    mockup?.productId ||
    mockup?.product_id ||
    mockup?.productID ||
    mockup?.printfulProductId ||
    ''
  ).trim();

  // If backend already filtered by /products/:productId/mockups
  // but does not return productId in the JSON, keep the record.
  if (!mockupProductId) {
    console.warn('[MOCKUPS] Missing productId on returned mockup record:', mockup);
    return true;
  }

  return mockupProductId === safeProductId;
});

  console.log('[MOCKUPS] Requested productId:', safeProductId);
  console.log('[MOCKUPS] Raw returned:', rawMockups.length);
  console.log('[MOCKUPS] Isolated returned:', isolatedMockups.length);

  return isolatedMockups;
};

export const uploadMockupForProduct = async (productId, file, label = '') => {
  const safeProductId = cleanProductId(productId);

  const formData = new FormData();
  formData.append('mockup', file);
  formData.append('label', label);

  const token = localStorage.getItem('adminToken');

  const response = await fetch(
    `${API_BASE}/products/${encodeURIComponent(safeProductId)}/mockups`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload product mockup');
  }

  return response.json();
};

export const deleteMockup = async (mockupId) => {
  const token = localStorage.getItem('adminToken');

  const response = await fetch(`${API_BASE}/mockups/${mockupId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete mockup');
  }

  return response.json();
};