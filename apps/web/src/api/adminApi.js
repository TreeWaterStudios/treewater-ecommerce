const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://treewater-ecommerce.onrender.com';

export const getAdminToken = () => {
  return localStorage.getItem('adminToken') || '';
};

export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('adminUser') || 'null');
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const adminLogin = async (email, password) => {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Login failed');
  }

  if (data.token) {
    localStorage.setItem('adminToken', data.token);
  }

  if (data.admin) {
    localStorage.setItem('adminUser', JSON.stringify(data.admin));
  }

  return data;
};

export const fetchAdminMe = async () => {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token');
  }

  const response = await fetch(`${API_BASE}/admin/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch admin profile');
  }

  return data;
};
