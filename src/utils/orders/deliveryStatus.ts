import { DELIVERY_BADGE_COLORS } from '../../constants/colors';
import { ORDER_STATUS } from '../../types/workspace';

export type DeliveryBadgeConfig = {
  label: string;
  bg: string;
  text: string;
};

export const onlyDigits = (value: string, maxLength: number) => {
  return value.replace(/\D/g, '').slice(0, maxLength);
};

export function getDeliveryBadgeConfig(id: number | undefined, nameVal: unknown): DeliveryBadgeConfig {
  const name = String(nameVal ?? '').toLowerCase();

  if (id === ORDER_STATUS.CANCELLED || ['7', 'cancelado', 'cancelled'].includes(name)) {
    return {
      label: 'Cancelada',
      bg: DELIVERY_BADGE_COLORS.cancelled.backgroundColor,
      text: DELIVERY_BADGE_COLORS.cancelled.text,
    };
  }

  if (id === 5 || id === 6 || ['5', '6', 'realizado', 'entregado', 'entregada', 'delivered', 'finalizado'].includes(name)) {
    return {
      label: 'Entregada',
      bg: DELIVERY_BADGE_COLORS.delivered.backgroundColor,
      text: DELIVERY_BADGE_COLORS.delivered.text,
    };
  }

  if (id === 4 || ['4', 'en camino', 'en_camino', 'encamino', 'on the way', 'on_the_way'].includes(name)) {
    return {
      label: 'En camino',
      bg: DELIVERY_BADGE_COLORS.onWay.backgroundColor,
      text: DELIVERY_BADGE_COLORS.onWay.text,
    };
  }

  if (id === 3 || ['3', 'aceptado', 'accepted'].includes(name)) {
    return {
      label: 'Asignado',
      bg: DELIVERY_BADGE_COLORS.assigned.backgroundColor,
      text: DELIVERY_BADGE_COLORS.assigned.text,
    };
  }

  if (id === 2 || ['2', 'asignado', 'assigned'].includes(name)) {
    return {
      label: 'Asignado',
      bg: DELIVERY_BADGE_COLORS.assigned.backgroundColor,
      text: DELIVERY_BADGE_COLORS.assigned.text,
    };
  }

  return {
    label: 'Pendiente',
    bg: DELIVERY_BADGE_COLORS.pending.backgroundColor,
    text: DELIVERY_BADGE_COLORS.pending.text,
  };
}
