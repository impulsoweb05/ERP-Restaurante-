export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  menu_code: string;
  name: string;
  description?: string;
  price: number;
  delivery_cost: number;
  preparation_time: number;
  category_id: string;
  subcategory_id?: string;
  image_url?: string;
  station: 'grill' | 'fry' | 'oven' | 'bar' | 'salad' | 'other';
  status: 'active' | 'inactive';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  phone: string;
  email?: string;
  addresses: string[];
  total_orders: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer?: Customer;
  waiter_id?: string;
  table_id?: string;
  order_type: 'delivery' | 'dine_in' | 'takeout';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  delivery_address?: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'dataphone';
  subtotal: number;
  delivery_cost: number;
  total: number;
  customer_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Table {
  id: string;
  table_number: string;
  zone: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  current_reservation_id?: string;
}

export interface Reservation {
  id: string;
  reservation_number: string;
  customer_id: string;
  customer?: Customer;
  table_id: string;
  table?: Table;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Waiter {
  id: string;
  waiter_code: string;
  name: string;
  phone?: string;
  is_active: boolean;
  orders_today: number;
  sales_today: number;
  created_at: string;
}

export interface KitchenItem {
  id: string;
  order_id: string;
  order_number: string;
  order_type: 'delivery' | 'dine_in' | 'takeout';
  table_number?: string;
  item_name: string;
  quantity: number;
  station: string;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready';
  preparation_time: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  day_of_week: number;
  day_name: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  note?: string;
}

export interface Notification {
  id: string;
  type: 'email' | 'whatsapp' | 'telegram';
  recipient: string;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  created_at: string;
}

export interface Settings {
  restaurant_name: string;
  logo_url?: string;
  address: string;
  phone: string;
  email: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  payment_methods: {
    cash: boolean;
    card: boolean;
    transfer: boolean;
    dataphone: boolean;
  };
  delivery_zones: {
    name: string;
    cost: number;
    estimated_time: number;
  }[];
  integrations: {
    email: {
      host: string;
      port: number;
      user: string;
      password: string;
    };
    whatsapp: {
      url: string;
      instance: string;
      api_key: string;
    };
    telegram: {
      bot_token: string;
      chat_id: string;
    };
  };
  reservation_config: {
    auto_release_minutes: number;
    min_advance_hours: number;
    max_advance_days: number;
    online_tables: string[];
  };
  vapid_keys?: {
    public_key: string;
    private_key: string;
  };
}

export interface DashboardStats {
  sales_today: number;
  sales_yesterday: number;
  sales_change_percent: number;
  active_orders: number;
  tables_occupied: number;
  tables_total: number;
  new_customers_today: number;
  reservations_today: number;
  pending_reservations: number;
  top_products: {
    id: string;
    name: string;
    image_url?: string;
    units_sold: number;
    revenue: number;
  }[];
  recent_orders: Order[];
  sales_by_hour: {
    hour: string;
    amount: number;
  }[];
  alerts: {
    type: 'urgent' | 'warning' | 'info';
    message: string;
    count?: number;
  }[];
}
