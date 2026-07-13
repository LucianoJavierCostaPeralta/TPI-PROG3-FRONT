import { type DeliveryForm, type DriverForm } from '../../types/workspace';
import { DNI_PATTERN, EMAIL_PATTERN, PHONE_PATTERN, isPastDate } from '../validation';

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const validateDriverForm = (driverForm: DriverForm) => {
  if (!driverForm.nombre.trim()) return 'Ingresá el nombre del chofer.';
  if (!/^[\p{L}\s]+$/u.test(driverForm.nombre.trim()) || driverForm.nombre.trim().length < 3) {
    return 'El nombre debe tener al menos 3 letras y no puede contener números.';
  }
  if (!DNI_PATTERN.test(driverForm.documento)) return 'El DNI debe tener exactamente 8 números.';
  if (!isPastDate(driverForm.fechaNacimiento)) return 'Seleccioná una fecha de nacimiento anterior a hoy.';
  if (!EMAIL_PATTERN.test(driverForm.email.trim())) return 'Ingresá un correo válido, por ejemplo example@example.com.';
  if (driverForm.telefono && !PHONE_PATTERN.test(driverForm.telefono)) {
    return 'El teléfono debe contener entre 8 y 15 números.';
  }
  return null;
}

export const validateDeliveryForm = (deliveryForm: DeliveryForm, requireProducts: boolean) => {
  if (!deliveryForm.cliente.trim()) return 'Ingresá el cliente.';
  if (!deliveryForm.destino.trim()) return 'Ingresá el destino.';
  if (!deliveryForm.fecha) return 'Seleccioná la fecha de entrega.';
  if (!DATE_INPUT_PATTERN.test(deliveryForm.fecha)) return 'Seleccioná una fecha válida.';
  if (deliveryForm.cliente.trim().length < 2) return 'El nombre del cliente debe tener al menos 2 caracteres.';
  if (!DNI_PATTERN.test(deliveryForm.clienteDni)) return 'El DNI del cliente debe tener exactamente 8 números.';
  if (deliveryForm.destino.trim().length < 3) return 'El destino debe tener al menos 3 caracteres.';
  if (requireProducts && deliveryForm.productos.trim().length < 2) {
    return 'El producto debe tener al menos 2 caracteres.';
  }
  return null;
};
