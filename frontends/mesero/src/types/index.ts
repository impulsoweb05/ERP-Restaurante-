// Waiter types
export interface Waiter {
  id: string;
  code: string;
  name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface WaiterAuthState {
  token: string | null;
  waiter: Waiter | null;
  isAuthenticated: boolean;
}

// Table types
export interface Table {
  id: string;
  number: number;
  name?: string;
  zone: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  current_reservation_id?: string;
}

// Menu types
export interface Category {
  id: string;
  name: string;
  image?: string;
  display_order: number;
  is_active: boolean;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  image?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  menu_code: string;
  name: string;
  description?: string;
  price: number;
  delivery_cost: number;
  preparation_time: number;
  image?: string;
  category_id: string;
  subcategory_id?: string;
  station: string;
  status: 'active' | 'inactive';
}

// Order types
export interface OrderItem {
  id?: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface CreateOrderData {
  waiter_id: string;
  table_id: string;
  order_type: 'dine_in';
  items: Omit<OrderItem, 'id' | 'status'>[];
  customer_notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  waiter_id?: string;
  table_id?: string;
  order_type: 'delivery' | 'dine_in' | 'takeout';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_cost: number;
  total: number;
  delivery_address?: string;
  payment_method?: string;
  customer_notes?: string;
  items: OrderItem[];
  table?: Table;
  created_at: string;
  updated_at: string;
}

// Reservation types
export interface Reservation {
  id: string;
  reservation_number: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  table_id: string;
  table?: Table;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  auto_release_at?: string;
  created_at: string;
}

// Stats types
export interface WaiterStats {
  sales_today: number;
  orders_count: number;
  tables_served: number;
  tips_total: number;
  orders_by_hour: { hour: string; count: number; amount: number }[];
  recent_orders: Order[];
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
