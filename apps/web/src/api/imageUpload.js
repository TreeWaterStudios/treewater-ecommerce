/**
 * Uploads an image file to the backend server.
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
const uploadImage = async (file) => {
  console.log('[UPLOAD] 📤 Starting image upload for:', file.name, 'Size:', file.size);
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('[UPLOAD] 📡 Sending POST request to https://api-ecommerce.hostinger.com/upload-image');
    const res = await fetch("/upload-image", {
      method: 'POST',
      body: formData,
    });

    console.log('UPLOAD STATUS:', res.status);

    const data = await res.json();
    console.log('UPLOAD RESPONSE:', data);

    if (!res.ok) {
      throw new Error(data.error || `Upload failed with status ${res.status}`);
    }
    
    if (!data.success || !data.url) {
      throw new Error('Invalid response format from server: missing success or url fields');
    }

    console.log('✅ [UPLOAD] Got URL:', data.url);
    return data.url;
  } catch (error) {
    console.error('[UPLOAD] ❌ Upload error:', error.message || error);
    throw error;
  }
};

export default uploadImage;