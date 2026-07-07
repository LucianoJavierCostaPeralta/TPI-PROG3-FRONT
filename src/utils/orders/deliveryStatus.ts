import { palette } from '../../styles/theme';
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
      bg: '#FEE2E2',
      text: '#B91C1C',
    };
  }

  if (id === 5 || id === 6 || ['5', '6', 'realizado', 'entregado', 'entregada', 'delivered', 'finalizado'].includes(name)) {
    return {
      label: 'Entregada',
      bg: palette.successLightBg,
      text: palette.successDark,
    };
  }

  if (id === 4 || ['4', 'en camino', 'en_camino', 'encamino', 'on the way', 'on_the_way'].includes(name)) {
    return {
      label: 'En camino',
      bg: palette.infoLightBg,
      text: palette.secondary,
    };
  }

  if (id === 3 || ['3', 'aceptado', 'accepted'].includes(name)) {
    return {
      label: 'Asignado',
      bg: '#E0F2FE',
      text: '#0369A1',
    };
  }

  if (id === 2 || ['2', 'asignado', 'assigned'].includes(name)) {
    return {
      label: 'Asignado',
      bg: '#E0F2FE',
      text: '#0369A1',
    };
  }

  return {
    label: 'Pendiente',
    bg: palette.pendingLightBg,
    text: palette.warning,
  };
}
