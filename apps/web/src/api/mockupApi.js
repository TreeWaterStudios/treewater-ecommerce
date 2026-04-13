const API_BASE = 'https://treewater-ecommerce.onrender.com';

export async function getMockupsForProduct(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}/mockups`, {
    cache: 'no-store',
  });

  const data = await response.json();

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
  const formData = new FormData();
  formData.append('file', file);
  formData.append('label', label);

  try {
    const response = await fetch(`${API_BASE}/products/${productId}/mockups`, {
      method: 'POST',
      body: formData,
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || data.details || `Upload failed with status ${response.status}`);
    }

    return {
      ...data,
      imageUrl: data.imageUrl || data.image || data.url || '',
    };
  } catch (error) {
    const mockups = await getMockupsForProduct(productId);
    const newestMockup = mockups.length ? mockups[mockups.length - 1] : null;

    if (newestMockup?.imageUrl) {
      return newestMockup;
    }

    throw error;
  }
}

export async function uploadMockups(productId, files, labels = []) {
  const uploaded = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadMockup(productId, files[i], labels[i] || '');
    uploaded.push(result);
  }

  return uploaded;
}