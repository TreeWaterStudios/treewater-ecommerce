import { getAdminToken } from '@/api/adminApi.js';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://treewater-ecommerce.onrender.com';

export async function getMockupsForProduct(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}/mockups`, {
    cache: 'no-store',
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch mockups');
  }

  const mockups = Array.isArray(data) ? data : [];

  return mockups.map((m) => ({
    ...m,
    imageUrl: m.imageUrl || m.image || m.url || '',
  }));
}

export async function uploadMockup(productId, file, label = '') {
  const token = getAdminToken();

  if (!token) {
    throw new Error('Admin login required');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('label', label);

  const response = await fetch(`${API_BASE}/products/${productId}/mockups`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.details || `Upload failed with status ${response.status}`);
  }

  return {
    ...data,
    imageUrl: data.imageUrl || data.image || data.url || '',
  };
}

export async function uploadMockups(productId, files, labels = []) {
  const uploaded = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadMockup(productId, files[i], labels[i] || '');
    uploaded.push(result);
  }

  return uploaded;
}