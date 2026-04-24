const API_BASE = 'https://treewater-ecommerce.onrender.com';

export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

export const getAdminUser = () => {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
};

export const clearAdminSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const adminLogin = async (email, password) => {
  const url = `${API_BASE}/admin/login`;

  console.log('[ADMIN LOGIN URL]', url);

  const response = await fetch(url, {
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

  localStorage.setItem('adminToken', data.token);

  if (data.admin) {
    localStorage.setItem('adminUser', JSON.stringify(data.admin));
  }

  return data;
};
