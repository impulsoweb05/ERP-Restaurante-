import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type {
  Category,
  Subcategory,
  MenuItem,
  Order,
  CreateOrderData,
  Reservation,
  ReservationData,
  Table,
  Schedule,
  Customer,
  ApiResponse,
} from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('customer');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginCustomer = async (phone: string): Promise<ApiResponse<{ token: string; customer: Customer }>> => {
  const response = await api.post('/auth/login', { phone });
  return response.data;
};

export const registerCustomer = async (data: { phone: string; name?: string; email?: string }): Promise<ApiResponse<{ token: string; customer: Customer }>> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Menu endpoints
export const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await api.get('/menu/categories');
  return response.data;
};

export const fetchSubcategories = async (categoryId: string): Promise<ApiResponse<Subcategory[]>> => {
  const response = await api.get(`/menu/categories/${categoryId}/subcategories`);
  return response.data;
};

export const fetchProducts = async (params?: { subcategoryId?: string; categoryId?: string; status?: string }): Promise<ApiResponse<MenuItem[]>> => {
  const response = await api.get('/menu/items', { params });
  return response.data;
};

export const fetchProduct = async (id: string): Promise<ApiResponse<MenuItem>> => {
  const response = await api.get(`/menu/items/${id}`);
  return response.data;
};

// Schedule endpoints
export const checkSchedule = async (): Promise<ApiResponse<Schedule>> => {
  const response = await api.get('/schedule/check');
  return response.data;
};

// Order endpoints
export const createOrder = async (orderData: CreateOrderData): Promise<ApiResponse<Order>> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const fetchOrders = async (customerId: string): Promise<ApiResponse<Order[]>> => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};

export const fetchOrder = async (orderId: string): Promise<ApiResponse<Order>> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Reservation endpoints
export const fetchAvailableTables = async (date: string, time: string, partySize: number): Promise<ApiResponse<Table[]>> => {
  const response = await api.get('/reservations/available-tables', {
    params: { date, time, party_size: partySize },
  });
  return response.data;
};

export const createReservation = async (data: ReservationData): Promise<ApiResponse<Reservation>> => {
  const response = await api.post('/reservations', data);
  return response.data;
};

export const fetchReservations = async (customerId: string): Promise<ApiResponse<Reservation[]>> => {
  const response = await api.get('/reservations', {
    params: { customer_id: customerId },
  });
  return response.data;
};

export const cancelReservation = async (id: string, reason?: string): Promise<ApiResponse<Reservation>> => {
  const response = await api.put(`/reservations/${id}/cancel`, { reason });
  return response.data;
};

export default api;
