import { LOGIN_API_URL } from '../constants';
import { User, DecodedToken } from '../types';

const TOKEN_KEY = 'jwtAuthToken';

export const loginUser = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  // Make a real API call to the backend
  const response = await fetch(LOGIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json(); // Attempt to parse JSON regardless of response.ok

  if (!response.ok) {
    // Assuming the backend sends an error message in a 'message' field or similar
    throw new Error(data.message || `Sunucu Hatası: ${response.status} ${response.statusText}`);
  }

  // Assuming the backend sends { token: "...", user: { id: "...", email: "..." } } on success
  if (!data.token || !data.user || !data.user.email) {
    console.error('Invalid login response from server:', data);
    throw new Error('Sunucudan geçersiz giriş yanıtı alındı.');
  }
  
  setToken(data.token);
  return data as { token: string; user: User };
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const decodedPayload = atob(payloadBase64);
    return JSON.parse(decodedPayload) as DecodedToken;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};