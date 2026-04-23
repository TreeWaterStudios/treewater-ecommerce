import apiServerClient from '@/lib/apiServerClient.js';

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
  const response = await apiServerClient.fetch('/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('adminToken', data.token);
    if (data.user) {
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    }
  }
  return data;
};

export const fetchAdminMe = async () => {
  const token = getAdminToken();
  if (!token) throw new Error('No admin token');

  const response = await apiServerClient.fetch('/admin/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin profile');
  }

  return await response.json();
};
