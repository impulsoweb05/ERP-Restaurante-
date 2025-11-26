// Kitchen Station types
export type KitchenStation = 
  | 'parrilla'
  | 'fritos'
  | 'horno'
  | 'bar'
  | 'ensaladas'
  | 'postres'
  | 'general';

// Kitchen Queue Item status
export type KitchenItemStatus = 'pending' | 'preparing' | 'ready';

// Order type
export type OrderType = 'delivery' | 'dine_in' | 'takeout';

// Kitchen Queue Item
export interface KitchenQueueItem {
  id: string;
  order_id: string;
  order_number: string;
  order_type: OrderType;
  table_number?: number;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  special_instructions?: string;
  station: KitchenStation;
  status: KitchenItemStatus;
  priority: number;
  preparation_time: number; // in minutes
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// Grouped order for display
export interface GroupedOrder {
  order_id: string;
  order_number: string;
  order_type: OrderType;
  table_number?: number;
  items: KitchenQueueItem[];
  created_at: string;
  elapsed_time: number; // in seconds
  is_urgent: boolean;
}

// Kitchen Stats
export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
  total_today: number;
  average_time: number; // in minutes
}

// Station info
export interface StationInfo {
  id: KitchenStation;
  name: string;
  icon: string;
  color: string;
}

// Auth types
export interface KitchenUser {
  id: string;
  code: string;
  name: string;
  station?: KitchenStation;
}

export interface AuthState {
  token: string | null;
  user: KitchenUser | null;
  isAuthenticated: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// WebSocket event types
export interface WSEvent {
  type: string;
  data: Record<string, unknown>;
}

// Sound settings
export interface SoundSettings {
  enabled: boolean;
  volume: number;
  newOrderSound: boolean;
  urgentSound: boolean;
}
