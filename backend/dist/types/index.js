"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPOS COMPARTIDOS DEL SISTEMA
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayOfWeek = exports.NotificationStatus = exports.NotificationType = exports.KitchenQueueStatus = exports.TableStatus = exports.ReservationStatus = exports.PaymentMethod = exports.OrderItemStatus = exports.OrderStatus = exports.OrderType = void 0;
// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════
var OrderType;
(function (OrderType) {
    OrderType["DELIVERY"] = "delivery";
    OrderType["DINE_IN"] = "dine_in";
    OrderType["TAKEOUT"] = "takeout";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["READY"] = "ready";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderItemStatus;
(function (OrderItemStatus) {
    OrderItemStatus["PENDING"] = "pending";
    OrderItemStatus["PREPARING"] = "preparing";
    OrderItemStatus["READY"] = "ready";
    OrderItemStatus["SERVED"] = "served";
})(OrderItemStatus || (exports.OrderItemStatus = OrderItemStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["TRANSFER"] = "transfer";
    PaymentMethod["TERMINAL"] = "terminal";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "pending";
    ReservationStatus["CONFIRMED"] = "confirmed";
    ReservationStatus["ACTIVE"] = "active";
    ReservationStatus["COMPLETED"] = "completed";
    ReservationStatus["CANCELLED"] = "cancelled";
    ReservationStatus["NO_SHOW"] = "no_show";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "available";
    TableStatus["OCCUPIED"] = "occupied";
    TableStatus["RESERVED"] = "reserved";
    TableStatus["CLEANING"] = "cleaning";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
var KitchenQueueStatus;
(function (KitchenQueueStatus) {
    KitchenQueueStatus["QUEUED"] = "queued";
    KitchenQueueStatus["PREPARING"] = "preparing";
    KitchenQueueStatus["READY"] = "ready";
})(KitchenQueueStatus || (exports.KitchenQueueStatus = KitchenQueueStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "email";
    NotificationType["WHATSAPP"] = "whatsapp";
    NotificationType["TELEGRAM"] = "telegram";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["FAILED"] = "failed";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
//# sourceMappingURL=index.js.map