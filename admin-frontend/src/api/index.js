const GATEWAY_URL = 'http://localhost:3000';
const ALLOWED_API_HOSTS = ['http://localhost:3000', 'localhost:3000', 'localhost', '127.0.0.1:3000', '127.0.0.1'];

export const apiFetch = async (endpoint, options = {}) => {
  // Sanitizar el endpoint para evitar manipulación de esquema/protocolo (e.g. //evil.com)
  const safeEndpoint = typeof endpoint === 'string' && endpoint.startsWith('/')
    ? endpoint.replace(/^\/+/, '/')
    : `/${endpoint || ''}`;

  const targetUrl = new URL(safeEndpoint, GATEWAY_URL);

  // Validar el origen/host contra la lista permitida para prevenir CSRF/SSRF del lado del cliente
  if (!ALLOWED_API_HOSTS.includes(targetUrl.origin) && !ALLOWED_API_HOSTS.includes(targetUrl.host)) {
    throw new Error('Host de API no válido');
  }

  const token = localStorage.getItem('admin_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(targetUrl.href, {
      ...options,
      headers,
    });
    
    // Attempt to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    
    if (!response.ok) {
      throw new Error((data && data.error) || 'API Request failed');
    }
    
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};
