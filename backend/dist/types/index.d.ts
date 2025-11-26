/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPOS COMPARTIDOS DEL SISTEMA
 * ═══════════════════════════════════════════════════════════════════════════
 */
export declare enum OrderType {
    DELIVERY = "delivery",
    DINE_IN = "dine_in",
    TAKEOUT = "takeout"
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum OrderItemStatus {
    PENDING = "pending",
    PREPARING = "preparing",
    READY = "ready",
    SERVED = "served"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    TRANSFER = "transfer",
    TERMINAL = "terminal"
}
export declare enum ReservationStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export declare enum TableStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    RESERVED = "reserved",
    CLEANING = "cleaning"
}
export declare enum KitchenQueueStatus {
    QUEUED = "queued",
    PREPARING = "preparing",
    READY = "ready"
}
export declare enum NotificationType {
    EMAIL = "email",
    WHATSAPP = "whatsapp",
    TELEGRAM = "telegram"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed"
}
export declare enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}
export interface Customer {
    id: string;
    customer_code: string;
    full_name: string;
    phone: string;
    email?: string;
    address_1: string;
    address_2?: string;
    address_3?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface MenuCategory {
    id: string;
    name: string;
    image_url?: string;
    display_order?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface MenuSubcategory {
    id: string;
    category_id: string;
    name: string;
    image_url?: string;
    display_order?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface MenuItem {
    id: string;
    menu_code: string;
    category_id: string;
    subcategory_id: string;
    name: string;
    description?: string;
    price: number;
    delivery_cost: number;
    status: 'active' | 'inactive';
    image_url?: string;
    preparation_time?: number;
    station?: string;
    created_at: string;
    updated_at: string;
}
export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    waiter_id?: string;
    table_id?: string;
    reservation_id?: string;
    order_type: OrderType;
    status: OrderStatus;
    payment_method?: PaymentMethod;
    subtotal: number;
    delivery_cost: number;
    total: number;
    delivery_address?: string;
    customer_notes?: string;
    created_at: string;
    confirmed_at?: string;
    completed_at?: string;
    updated_at: string;
}
export interface OrderItem {
    id: string;
    order_id: string;
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    item_delivery_cost: number;
    subtotal: number;
    special_instructions?: string;
    status: OrderItemStatus;
    created_at: string;
}
export interface KitchenQueue {
    id: string;
    order_item_id: string;
    priority: number;
    status: KitchenQueueStatus;
    assigned_station?: string;
    started_at?: string;
    completed_at?: string;
    estimated_time?: number;
    created_at: string;
}
export interface Waiter {
    id: string;
    waiter_code: string;
    full_name: string;
    phone: string;
    pin_code: string;
    is_active: boolean;
    current_orders: number;
    created_at: string;
    updated_at: string;
}
export interface Table {
    id: string;
    table_number: string;
    capacity: number;
    zone: string;
    status: TableStatus;
    current_order_id?: string;
    current_reservation_id?: string;
    created_at: string;
    updated_at: string;
}
export interface Reservation {
    id: string;
    reservation_number: string;
    customer_id: string;
    table_id: string;
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    status: ReservationStatus;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    special_requests?: string;
    created_at: string;
    confirmed_at?: string;
    activated_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    auto_released_at?: string;
    updated_at: string;
}
export interface Session {
    id: string;
    session_id: string;
    customer_id?: string;
    phone?: string;
    current_level: number;
    is_open: boolean;
    is_registered: boolean;
    cart: CartItem[];
    selected_category?: string;
    selected_subcategory?: string;
    temp_menu_item?: string;
    checkout_data?: Record<string, any>;
    reservation_data?: Record<string, any>;
    created_at: string;
    updated_at: string;
    expires_at: string;
}
export interface CartItem {
    menu_item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    item_delivery_cost: number;
    subtotal: number;
}
export interface Schedule {
    id: string;
    day_of_week: DayOfWeek;
    opening_time: string;
    closing_time: string;
    is_open: boolean;
    special_note?: string;
    created_at: string;
    updated_at: string;
}
export interface Notification {
    id: string;
    order_id?: string;
    reservation_id?: string;
    notification_type: NotificationType;
    recipient: string;
    status: NotificationStatus;
    content?: Record<string, any>;
    sent_at?: string;
    error_message?: string;
    created_at: string;
}
export interface AuthRequest {
    phone?: string;
    pin_code?: string;
    email?: string;
    password?: string;
}
export interface AuthResponse {
    token: string;
    customer?: Customer;
    waiter?: Waiter;
    expires_in: string;
}
export interface CreateOrderRequest {
    customer_id: string;
    order_type: OrderType;
    order_items: CreateOrderItemRequest[];
    payment_method: PaymentMethod;
    delivery_address?: string;
    customer_notes?: string;
    table_id?: string;
    reservation_id?: string;
    waiter_id?: string;
}
export interface CreateOrderItemRequest {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
}
export interface CreateReservationRequest {
    customer_id: string;
    table_id: string;
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    special_requests?: string;
}
export interface WebSocketMessage {
    type: string;
    data: Record<string, any>;
    timestamp: string;
}
export interface WebSocketEvent {
    event: string;
    data: Record<string, any>;
}
export interface ApiError {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
}
export interface JWTPayload {
    id: string;
    type: 'customer' | 'waiter' | 'admin';
    role: 'customer' | 'waiter' | 'admin';
    phone?: string;
    waiter_code?: string;
    iat?: number;
    exp?: number;
}
export interface RequestWithUser extends Express.Request {
    user?: JWTPayload;
    sessionId?: string;
}
//# sourceMappingURL=index.d.ts.map