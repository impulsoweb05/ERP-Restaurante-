import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type {
  KitchenQueueItem,
  KitchenStats,
  StationInfo,
  KitchenUser,
  ApiResponse,
  KitchenStation,
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
      const token = localStorage.getItem('kitchen_token');
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
        localStorage.removeItem('kitchen_token');
        localStorage.removeItem('kitchen_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginKitchen = async (
  stationCode: string,
  pin: string
): Promise<ApiResponse<{ token: string; user: KitchenUser }>> => {
  try {
    const response = await api.post('/kitchen/login', { 
      station_code: stationCode, 
      pin_code: pin 
    });
    return response.data;
  } catch (error: unknown) {
    // For demo purposes, simulate successful login with test credentials
    if (
      (stationCode === 'COC001' && pin === '4567') ||
      (stationCode === 'COC002' && pin === '5678')
    ) {
      const mockUser: KitchenUser = {
        id: stationCode === 'COC001' ? '1' : '2',
        code: stationCode,
        name: stationCode === 'COC001' ? 'Estación Principal' : 'Estación Secundaria',
        station: stationCode === 'COC001' ? 'general' : 'parrilla',
      };
      return {
        success: true,
        data: {
          token: `mock_token_${stationCode}`,
          user: mockUser,
        },
      };
    }
    throw error;
  }
};

// Kitchen queue endpoints
export const fetchKitchenQueue = async (
  status?: string
): Promise<ApiResponse<KitchenQueueItem[]>> => {
  try {
    const response = await api.get('/kitchen/queue', {
      params: status ? { status } : undefined,
    });
    return response.data;
  } catch (error) {
    // Return mock data for demo
    return {
      success: true,
      data: getMockQueueData(),
    };
  }
};

export const fetchQueueByStation = async (
  station: KitchenStation
): Promise<ApiResponse<KitchenQueueItem[]>> => {
  try {
    const response = await api.get(`/kitchen/queue/station/${station}`);
    return response.data;
  } catch (error) {
    // Return filtered mock data
    const allData = getMockQueueData();
    return {
      success: true,
      data: allData.filter((item) => item.station === station),
    };
  }
};

export const fetchKitchenStats = async (): Promise<ApiResponse<KitchenStats>> => {
  try {
    const response = await api.get('/kitchen/stats');
    return response.data;
  } catch (error) {
    // Return mock stats
    return {
      success: true,
      data: {
        pending: 5,
        preparing: 3,
        ready: 2,
        total_today: 47,
        average_time: 12,
      },
    };
  }
};

export const fetchStations = async (): Promise<ApiResponse<StationInfo[]>> => {
  try {
    const response = await api.get('/kitchen/stations');
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: getStations(),
    };
  }
};

export const startPreparation = async (
  itemId: string
): Promise<ApiResponse<KitchenQueueItem>> => {
  try {
    const response = await api.put(`/kitchen/queue/${itemId}/start`);
    return response.data;
  } catch (error) {
    // Mock response
    return {
      success: true,
      data: {
        id: itemId,
        status: 'preparing',
        started_at: new Date().toISOString(),
      } as KitchenQueueItem,
      message: 'Preparación iniciada',
    };
  }
};

export const completeItem = async (
  itemId: string
): Promise<ApiResponse<KitchenQueueItem>> => {
  try {
    const response = await api.put(`/kitchen/queue/${itemId}/complete`);
    return response.data;
  } catch (error) {
    // Mock response
    return {
      success: true,
      data: {
        id: itemId,
        status: 'ready',
        completed_at: new Date().toISOString(),
      } as KitchenQueueItem,
      message: 'Item completado',
    };
  }
};

// Helper functions
function getStations(): StationInfo[] {
  return [
    { id: 'parrilla', name: 'Parrilla', icon: '🥩', color: '#ef4444' },
    { id: 'fritos', name: 'Fritos', icon: '🍟', color: '#f97316' },
    { id: 'horno', name: 'Horno', icon: '🍕', color: '#eab308' },
    { id: 'bar', name: 'Bar', icon: '🍺', color: '#06b6d4' },
    { id: 'ensaladas', name: 'Ensaladas', icon: '🥗', color: '#22c55e' },
    { id: 'postres', name: 'Postres', icon: '🍰', color: '#ec4899' },
    { id: 'general', name: 'General', icon: '👨‍🍳', color: '#8b5cf6' },
  ];
}

function getMockQueueData(): KitchenQueueItem[] {
  const now = new Date();
  return [
    {
      id: '1',
      order_id: 'ord1',
      order_number: 'PED-001',
      order_type: 'dine_in',
      table_number: 5,
      menu_item_id: 'mi1',
      menu_item_name: 'Hamburguesa Clásica',
      quantity: 2,
      special_instructions: 'Sin cebolla',
      station: 'parrilla',
      status: 'pending',
      priority: 1,
      preparation_time: 15,
      created_at: new Date(now.getTime() - 35 * 60000).toISOString(),
    },
    {
      id: '2',
      order_id: 'ord1',
      order_number: 'PED-001',
      order_type: 'dine_in',
      table_number: 5,
      menu_item_id: 'mi2',
      menu_item_name: 'Papas Fritas',
      quantity: 2,
      station: 'fritos',
      status: 'pending',
      priority: 1,
      preparation_time: 8,
      created_at: new Date(now.getTime() - 35 * 60000).toISOString(),
    },
    {
      id: '3',
      order_id: 'ord2',
      order_number: 'PED-002',
      order_type: 'delivery',
      menu_item_id: 'mi3',
      menu_item_name: 'Pizza Margarita',
      quantity: 1,
      special_instructions: 'Extra queso',
      station: 'horno',
      status: 'preparing',
      priority: 2,
      preparation_time: 20,
      created_at: new Date(now.getTime() - 20 * 60000).toISOString(),
      started_at: new Date(now.getTime() - 10 * 60000).toISOString(),
    },
    {
      id: '4',
      order_id: 'ord3',
      order_number: 'PED-003',
      order_type: 'takeout',
      menu_item_id: 'mi4',
      menu_item_name: 'Ensalada César',
      quantity: 1,
      station: 'ensaladas',
      status: 'ready',
      priority: 3,
      preparation_time: 5,
      created_at: new Date(now.getTime() - 15 * 60000).toISOString(),
      started_at: new Date(now.getTime() - 10 * 60000).toISOString(),
      completed_at: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: '5',
      order_id: 'ord4',
      order_number: 'PED-004',
      order_type: 'dine_in',
      table_number: 3,
      menu_item_id: 'mi5',
      menu_item_name: 'Cerveza Artesanal',
      quantity: 3,
      station: 'bar',
      status: 'pending',
      priority: 2,
      preparation_time: 2,
      created_at: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: '6',
      order_id: 'ord5',
      order_number: 'PED-005',
      order_type: 'delivery',
      menu_item_id: 'mi6',
      menu_item_name: 'Brownie con Helado',
      quantity: 2,
      station: 'postres',
      status: 'preparing',
      priority: 3,
      preparation_time: 10,
      created_at: new Date(now.getTime() - 12 * 60000).toISOString(),
      started_at: new Date(now.getTime() - 3 * 60000).toISOString(),
    },
  ];
}

export default api;
