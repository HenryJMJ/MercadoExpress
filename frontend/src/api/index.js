const GATEWAY_URL = 'http://localhost:3000';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
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
