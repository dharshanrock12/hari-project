// Local: Vite proxy uses /api | Deployed: set VITE_API_URL to backend URL + /api
const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function register(name, email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function logout() {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Logout failed');
  return data;
}

export async function getItems() {
  const res = await fetch(`${API_URL}/items`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch items');
  return data;
}

export async function createItem(title, description) {
  const res = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create item');
  return data;
}

export async function updateItem(id, title, description) {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ title, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update item');
  return data;
}

export async function deleteItem(id) {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete item');
  return data;
}
