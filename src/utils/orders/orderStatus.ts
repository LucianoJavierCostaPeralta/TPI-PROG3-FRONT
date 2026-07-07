import { ORDER_STATUS_COLORS } from '../../constants/colors';
import { type DeliveryOrder, ORDER_STATUS } from '../../types/workspace';

const CANCELLED_STATUSES = ['7', 'cancelado', 'cancelled'];
const COMPLETED_STATUSES = ['realizado', 'entregado', 'finalizado', 'delivered'];
const ASSIGNED_STATUSES = ['2', '3', 'assigned', 'accepted', 'por aceptar', 'aceptado', 'asignado'];
const ON_THE_WAY_STATUSES = ['4', 'on_the_way', 'en camino'];

export const getStatusText = (status: unknown) => String(status ?? '').toLowerCase();

export const isCancelledOrder = (order: DeliveryOrder) =>
  order.estado_id === ORDER_STATUS.CANCELLED || CANCELLED_STATUSES.includes(getStatusText(order.estado));

export const isCompletedOrder = (order: DeliveryOrder) =>
  order.estado_id === ORDER_STATUS.DELIVERED ||
  order.estado_id === ORDER_STATUS.FINISHED ||
  COMPLETED_STATUSES.includes(getStatusText(order.estado));

export const isActiveOrder = (order: DeliveryOrder) =>
  order.estado_id === ORDER_STATUS.ACCEPTED || order.estado_id === ORDER_STATUS.ON_THE_WAY;

export const getDeliveryStatusBadge = (statusId?: number, statusText?: string | null) => {
  const id = statusId ?? ORDER_STATUS.PENDING;
  const text = getStatusText(statusText ?? 'pendiente');

  if (id === ORDER_STATUS.CANCELLED || CANCELLED_STATUSES.includes(text)) {
    return { label: 'Cancelada', ...ORDER_STATUS_COLORS.cancelled, bg: ORDER_STATUS_COLORS.cancelled.backgroundColor };
  }
  if (id === ORDER_STATUS.ASSIGNED || id === ORDER_STATUS.ACCEPTED || ASSIGNED_STATUSES.includes(text)) {
    return { label: 'Asignado', ...ORDER_STATUS_COLORS.assigned, bg: ORDER_STATUS_COLORS.assigned.backgroundColor };
  }
  if (id === ORDER_STATUS.ON_THE_WAY || ON_THE_WAY_STATUSES.includes(text)) {
    return { label: 'En camino', ...ORDER_STATUS_COLORS.onWay, bg: ORDER_STATUS_COLORS.onWay.backgroundColor };
  }
  return { label: 'Pendiente', ...ORDER_STATUS_COLORS.pending, bg: ORDER_STATUS_COLORS.pending.backgroundColor };
};
