import axios from 'axios';
import { useAuthStore } from '@/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Dashboard
export const fetchDashboard = () => api.get('/admin/dashboard');

// Categories
export const fetchCategories = () => api.get('/admin/menu/categories');
export const createCategory = (data: FormData) => api.post('/admin/menu/categories', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateCategory = (id: string, data: FormData) => api.patch(`/admin/menu/categories/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteCategory = (id: string) => api.delete(`/admin/menu/categories/${id}`);

// Subcategories
export const fetchSubcategories = (categoryId?: string) => 
  api.get('/admin/menu/subcategories', { params: { category_id: categoryId } });
export const createSubcategory = (data: FormData) => api.post('/admin/menu/subcategories', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateSubcategory = (id: string, data: FormData) => api.patch(`/admin/menu/subcategories/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteSubcategory = (id: string) => api.delete(`/admin/menu/subcategories/${id}`);

// Products
export const fetchProducts = (params?: Record<string, string | number>) => 
  api.get('/admin/menu/items', { params });
export const createProduct = (data: FormData) => api.post('/admin/menu/items', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProduct = (id: string, data: FormData) => api.patch(`/admin/menu/items/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProduct = (id: string) => api.delete(`/admin/menu/items/${id}`);
export const bulkUpdateProducts = (ids: string[], action: string) => 
  api.patch('/admin/menu/items/bulk', { ids, action });

// Orders
export const fetchOrders = (params?: Record<string, string | number>) => 
  api.get('/admin/orders', { params });
export const fetchOrder = (id: string) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id: string, status: string) => 
  api.patch(`/admin/orders/${id}/status`, { status });
export const cancelOrder = (id: string, reason: string) => 
  api.patch(`/admin/orders/${id}/cancel`, { reason });

// Tables
export const fetchTables = () => api.get('/admin/tables');
export const createTable = (data: object) => api.post('/admin/tables', data);
export const updateTable = (id: string, data: object) => api.patch(`/admin/tables/${id}`, data);
export const deleteTable = (id: string) => api.delete(`/admin/tables/${id}`);
export const releaseTable = (id: string) => api.patch(`/admin/tables/${id}/release`);

// Reservations
export const fetchReservations = (params?: Record<string, string>) => 
  api.get('/admin/reservations', { params });
export const createReservation = (data: object) => api.post('/admin/reservations', data);
export const updateReservation = (id: string, data: object) => api.patch(`/admin/reservations/${id}`, data);
export const confirmReservation = (id: string) => api.patch(`/admin/reservations/${id}/confirm`);
export const cancelReservation = (id: string, reason: string) => 
  api.patch(`/admin/reservations/${id}/cancel`, { reason });

// Customers
export const fetchCustomers = (params?: Record<string, string | number>) => 
  api.get('/admin/customers', { params });
export const fetchCustomer = (id: string) => api.get(`/admin/customers/${id}`);
export const updateCustomer = (id: string, data: object) => api.patch(`/admin/customers/${id}`, data);

// Staff/Waiters
export const fetchWaiters = () => api.get('/admin/waiters');
export const createWaiter = (data: object) => api.post('/admin/waiters', data);
export const updateWaiter = (id: string, data: object) => api.patch(`/admin/waiters/${id}`, data);
export const deleteWaiter = (id: string) => api.delete(`/admin/waiters/${id}`);
export const changeWaiterPin = (id: string, pin: string) => api.patch(`/admin/waiters/${id}/pin`, { pin });

// Kitchen
export const fetchKitchenQueue = (station?: string) => 
  api.get('/admin/kitchen/queue', { params: { station } });

// Schedules
export const fetchSchedules = () => api.get('/admin/schedules');
export const updateSchedules = (schedules: object[]) => api.patch('/admin/schedules/bulk', { schedules });

// Notifications
export const fetchNotifications = (params?: Record<string, string>) => 
  api.get('/admin/notifications', { params });
export const resendNotification = (id: string) => api.post(`/admin/notifications/${id}/resend`);

// Settings
export const fetchSettings = () => api.get('/admin/settings');
export const updateSettings = (section: string, data: object) => 
  api.patch(`/admin/settings/${section}`, data);
export const testIntegration = (service: string) => api.post(`/admin/settings/test/${service}`);
export const generateVapidKeys = () => api.post('/admin/settings/generate-vapid');
