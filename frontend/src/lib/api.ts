import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message[0]?.msg || 'An error occurred';
    return error.message;
  }
  return 'An unexpected error occurred';
};
