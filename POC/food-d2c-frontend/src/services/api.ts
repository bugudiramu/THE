import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
};

// Subscription services
export const subscriptionAPI = {
  getMySubscriptions: () =>
    api.get('/subscriptions/my'),
  createSubscription: (data: any) =>
    api.post('/subscriptions', data),
  cancelSubscription: (id: string) =>
    api.put(`/subscriptions/${id}/cancel`),
  pauseSubscription: (id: string) =>
    api.put(`/subscriptions/${id}/pause`),
  resumeSubscription: (id: string) =>
    api.put(`/subscriptions/${id}/resume`),
};

// Payment services
export const paymentAPI = {
  createOrder: (amount: number) =>
    api.post('/payments/create-order', { amount }),
  verifyPayment: (data: any) =>
    api.post('/payments/verify-payment', data),
  createSubscriptionPlan: (data: any) =>
    api.post('/payments/create-subscription-plan', data),
  createSubscription: (planId: string, userId: string) =>
    api.post('/payments/create-subscription', { planId, userId }),
};

export default api;
