import { isPastDate, isValidEmail, onlyDigits } from '../validation';

export type EditProfileFormFields = {
  nombre_completo: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
};

export type EditProfileFormErrors = {
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
};

export const initialEditProfileForm: EditProfileFormFields = {
  nombre_completo: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
};

export function parseProfileDate(value: string) {
  if (!value) return new Date(1990, 0, 1);
  const date = new Date(value + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? new Date(1990, 0, 1) : date;
}

export function formatProfileDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function formatProfileDateForDisplay(value: string) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return day + '/' + month + '/' + year;
  }
  return value;
}

export function getRoleLabel(roleName?: string) {
  if (!roleName) return 'Usuario';
  const lower = roleName.toLowerCase();
  if (lower === 'chofer') return 'Chofer';
  if (lower === 'administrador') return 'Administrador';
  if (lower === 'asesor') return 'Asesor';
  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
}

export function validateEditProfileForm(form: EditProfileFormFields, isChofer: boolean) {
  const errors: EditProfileFormErrors = {};

  if (!form.nombre_completo.trim()) {
    errors.nombre_completo = 'El nombre completo es requerido.';
  } else if (form.nombre_completo.trim().length < 3) {
    errors.nombre_completo = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es requerido.';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Ingresá un correo electrónico válido.';
  }

  if (form.telefono && !/^\d{8,15}$/.test(onlyDigits(form.telefono))) {
    errors.telefono = 'El teléfono debe tener entre 8 y 15 dígitos.';
  }

  if (isChofer && form.fecha_nacimiento && !isPastDate(form.fecha_nacimiento)) {
    errors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior al día actual.';
  }

  return errors;
}
