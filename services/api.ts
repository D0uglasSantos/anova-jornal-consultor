const API_BASE_URL = 'https://api.anovainvestimentos.com.br/api';
const AUTH_TOKEN = 'dec97f43fdd1eb11b29338d2b68c2d09f9bec4a401b07958b3ff95878e32d540';

export class ApiError extends Error {
  status: number;
  statusText: string;
  details: any;

  constructor(message: string, status: number, statusText: string, details: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

const buildApiError = (response: Response, errorData: any): ApiError => {
  const msg = errorData?.detail
    ? (Array.isArray(errorData.detail)
        ? errorData.detail.map((d: any) => d.msg).join(', ')
        : String(errorData.detail))
    : errorData?.message || `Error: ${response.status} ${response.statusText}`;

  return new ApiError(msg, response.status, response.statusText, errorData);
};

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
    throw buildApiError(response, errorData);
  }

  return response.json();
};

/** Envia FormData sem Content-Type (o browser define boundary automaticamente) */
export const apiFormRequest = async (
  endpoint: string,
  formData: FormData,
  options: Omit<RequestInit, 'body'> = {},
) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      ...options.headers,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildApiError(response, errorData);
  }
  return response.json();
};
