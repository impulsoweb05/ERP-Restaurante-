// Auth types
export interface Customer {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  addresses?: Address[];
  created_at: string;
}

export interface Address {
  id: string;
  street: string;
  details?: string;
  is_default: boolean;
}

export interface AuthState {
  token: string | null;
  customer: Customer | null;
  isAuthenticated: boolean;
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
  rating?: number;
}

// Cart types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  image?: string;
  delivery_cost: number;
}

export interface CartState {
  items: CartItem[];
}

// Order types
export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

export interface CreateOrderData {
  customer_id: string;
  order_type: 'delivery' | 'dine_in' | 'takeout';
  delivery_address?: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'dataphone';
  items: OrderItem[];
  customer_notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  order_type: 'delivery' | 'dine_in' | 'takeout';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_cost: number;
  total: number;
  delivery_address?: string;
  payment_method: string;
  customer_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// Reservation types
export interface Table {
  id: string;
  number: number;
  zone: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

export interface ReservationData {
  customer_id: string;
  table_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
}

export interface Reservation {
  id: string;
  reservation_number: string;
  customer_id: string;
  table_id: string;
  table?: Table;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  created_at: string;
}

// Schedule types
export interface Schedule {
  isOpen: boolean;
  opening_time?: string;
  closing_time?: string;
  next_opening?: string;
  message?: string;
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
