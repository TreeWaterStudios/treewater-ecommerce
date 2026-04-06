
import apiServerClient from '@/lib/apiServerClient.js';

export const fetchProducts = async () => {
  try {
    console.log('Fetching products from: /printful/products');
    const response = await apiServerClient.fetch('/printful/products');
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    // Return the full JSON response so the component can log it and extract the products array
    return json;
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    return { products: [], error: error.message }; // Return safe fallback
  }
};

export const fetchProduct = async (id) => {
  try {
    const response = await apiServerClient.fetch(`/printful/products/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch product details');
    }
    const json = await response.json();
    return json.data || json.product || json;
  } catch (error) {
    console.error(`Printful API Error (fetchProduct ${id}):`, error);
    throw error;
  }
};

export const fetchShippingRates = async (recipient, items) => {
  try {
    const response = await apiServerClient.fetch('/printful/shipping-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, items })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to calculate shipping rates');
    }
    return await response.json();
  } catch (error) {
    console.error('Printful API Error (fetchShippingRates):', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await apiServerClient.fetch('/printful/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create order');
    }
    return await response.json();
  } catch (error) {
    console.error('Printful API Error (createOrder):', error);
    throw error;
  }
};

export default {
  fetchProducts,
  fetchProduct,
  fetchShippingRates,
  createOrder
};
