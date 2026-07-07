import { type AppNotification, type AppWorkspace } from '../../types/workspace';

export function createStatusNotification(
  action: string,
  orderId: string,
  profile: AppWorkspace['profile'],
): AppNotification | null {
  const id = String(Date.now());
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  const isChofer = profile.rol === 'chofer';

  if (action === 'accept') {
    return {
      id,
      titulo: isChofer ? 'Pedido aceptado' : 'Pedido Aceptado',
      mensaje: isChofer
        ? `Aceptaste realizar el pedido #${shortOrderId}.`
        : `El chofer ${profile.nombre} aceptó realizar el pedido #${shortOrderId}.`,
      tipo: 'success',
      leida: false,
      created_at: new Date().toISOString(),
    };
  }

  if (action === 'delivered') {
    return {
      id,
      titulo: isChofer ? 'Entrega finalizada' : 'Entrega Finalizada',
      mensaje: isChofer
        ? `Entregaste el pedido #${shortOrderId} con éxito.`
        : `El chofer ${profile.nombre} finalizó la entrega del pedido #${shortOrderId}.`,
      tipo: 'success',
      leida: false,
      created_at: new Date().toISOString(),
    };
  }

  if (action === 'cancelled') {
    return {
      id,
      titulo: isChofer ? 'Pedido cancelado' : 'Pedido Cancelado',
      mensaje: isChofer
        ? `Cancelaste el pedido #${shortOrderId}.`
        : `El chofer ${profile.nombre} canceló la entrega del pedido #${shortOrderId}.`,
      tipo: 'error',
      leida: false,
      created_at: new Date().toISOString(),
    };
  }

  return null;
}
