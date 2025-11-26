import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type {
  Waiter,
  Table,
  Category,
  MenuItem,
  Order,
  CreateOrderData,
  Reservation,
  WaiterStats,
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
      const token = localStorage.getItem('waiter_token');
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
        localStorage.removeItem('waiter_token');
        localStorage.removeItem('waiter');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginWaiter = async (code: string, pin: string): Promise<ApiResponse<{ token: string; waiter: Waiter }>> => {
  const response = await api.post('/waiters/login', { code, pin_code: pin });
  return response.data;
};

export const logoutWaiter = async (): Promise<ApiResponse<null>> => {
  const response = await api.post('/waiters/logout');
  return response.data;
};

// Table endpoints
export const fetchTables = async (waiterId?: string): Promise<ApiResponse<Table[]>> => {
  const params = waiterId ? { waiter_id: waiterId } : {};
  const response = await api.get('/tables', { params });
  return response.data;
};

export const fetchTable = async (tableId: string): Promise<ApiResponse<Table>> => {
  const response = await api.get(`/tables/${tableId}`);
  return response.data;
};

export const updateTableStatus = async (tableId: string, status: Table['status']): Promise<ApiResponse<Table>> => {
  const response = await api.patch(`/tables/${tableId}/status`, { status });
  return response.data;
};

export const occupyTable = async (tableId: string, waiterId: string): Promise<ApiResponse<Table>> => {
  const response = await api.post(`/tables/${tableId}/occupy`, { waiter_id: waiterId });
  return response.data;
};

export const releaseTable = async (tableId: string): Promise<ApiResponse<Table>> => {
  const response = await api.post(`/tables/${tableId}/release`);
  return response.data;
};

// Menu endpoints
export const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await api.get('/menu/categories');
  return response.data;
};

export const fetchProducts = async (params?: { categoryId?: string; status?: string }): Promise<ApiResponse<MenuItem[]>> => {
  const response = await api.get('/menu/items', { params: { ...params, status: params?.status || 'active' } });
  return response.data;
};

export const fetchProduct = async (id: string): Promise<ApiResponse<MenuItem>> => {
  const response = await api.get(`/menu/items/${id}`);
  return response.data;
};

// Order endpoints
export const createOrder = async (orderData: CreateOrderData): Promise<ApiResponse<Order>> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const fetchOrders = async (params?: { waiterId?: string; status?: string }): Promise<ApiResponse<Order[]>> => {
  const response = await api.get('/orders', { params: { waiter_id: params?.waiterId, status: params?.status } });
  return response.data;
};

export const fetchOrder = async (orderId: string): Promise<ApiResponse<Order>> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<ApiResponse<Order>> => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const markItemServed = async (orderId: string, itemId: string): Promise<ApiResponse<Order>> => {
  const response = await api.post(`/orders/${orderId}/items/${itemId}/served`);
  return response.data;
};

// Reservation endpoints
export const fetchReservations = async (date?: string): Promise<ApiResponse<Reservation[]>> => {
  const params = date ? { date } : { date: new Date().toISOString().split('T')[0] };
  const response = await api.get('/reservations', { params });
  return response.data;
};

export const activateReservation = async (reservationId: string): Promise<ApiResponse<Reservation>> => {
  const response = await api.patch(`/reservations/${reservationId}/activate`);
  return response.data;
};

// Stats endpoints
export const fetchWaiterStats = async (waiterId: string, date?: string): Promise<ApiResponse<WaiterStats>> => {
  const params = date ? { date } : { date: new Date().toISOString().split('T')[0] };
  const response = await api.get(`/waiters/${waiterId}/stats`, { params });
  return response.data;
};

export default api;
