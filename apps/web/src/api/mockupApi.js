const API_BASE = 'https://treewater-ecommerce.onrender.com';

export async function getMockupsForProduct(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}/mockups`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch mockups');
  }

  return data;
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

    return data;
  } catch (error) {
    console.warn('[mockupApi] POST failed, checking whether upload actually succeeded...', error);

    // Safari / preview iframe fallback:
    // Sometimes POST succeeds on backend but fetch still throws "Load failed".
    const mockups = await getMockupsForProduct(productId);

    const newestMockup = Array.isArray(mockups) && mockups.length > 0
      ? mockups[mockups.length - 1]
      : null;

    if (newestMockup?.imageUrl) {
      console.warn('[mockupApi] Upload appears to have succeeded despite fetch failure');
      return newestMockup;
    }

    throw error;
  }
}

export async function uploadMockups(productId, files, labels = []) {
  const uploaded = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadMockup(productId, files[i], labels[i] || '');
      uploaded.push(result);
    } catch (error) {
      console.error(`[mockupApi] Error uploading mockup ${i}:`, error);
      throw error;
    }
  }

  return uploaded;
}