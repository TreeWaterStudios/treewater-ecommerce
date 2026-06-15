const API_BASE = 'https://treewater-ecommerce.onrender.com';

const cleanProductId = (productId) => {
  const id = String(productId || '').trim();

  if (!id || id === 'undefined' || id === 'null' || id.startsWith('fallback')) {
    throw new Error(`Invalid mockup productId: ${id}`);
  }

  return id;
};

export const getMockupsForProduct = async (productId) => {
  const safeProductId = cleanProductId(productId);

  const response = await fetch(
    `${API_BASE}/products/${encodeURIComponent(safeProductId)}/mockups`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch product mockups');
  }

  return response.json();
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