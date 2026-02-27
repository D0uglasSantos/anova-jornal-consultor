const API_BASE_URL = 'https://api.anovainvestimentos.com.br/api';
const AUTH_TOKEN = 'dec97f43fdd1eb11b29338d2b68c2d09f9bec4a401b07958b3ff95878e32d540';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
