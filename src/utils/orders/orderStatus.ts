import { palette } from '../../styles/theme';
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
    return { label: 'Cancelada', color: '#B91C1C', bg: '#FEE2E2', dotColor: '#B91C1C' };
  }
  if (id === ORDER_STATUS.ASSIGNED || id === ORDER_STATUS.ACCEPTED || ASSIGNED_STATUSES.includes(text)) {
    return { label: 'Asignado', color: '#0369A1', bg: '#E0F2FE', dotColor: '#0369A1' };
  }
  if (id === ORDER_STATUS.ON_THE_WAY || ON_THE_WAY_STATUSES.includes(text)) {
    return { label: 'En camino', color: '#15803D', bg: '#DCFCE7', dotColor: '#15803D' };
  }
  return { label: 'Pendiente', color: palette.neutral600, bg: palette.neutral200, dotColor: palette.neutral600 };
};
