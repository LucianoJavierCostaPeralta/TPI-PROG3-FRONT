import { useCallback, useMemo } from 'react';

const LEGAL_TEXTS = {
  privacidad: `En ZoneScore, nos comprometemos a proteger su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal.

1. Recopilación de Información: Recopilamos información necesaria para la operación del servicio logístico, como nombres de usuario, correos electrónicos, números de teléfono, detalles de vehículos e historial de entregas.
2. Uso de Datos: Los datos recopilados se utilizan exclusivamente para optimizar las rutas de entrega, mantener la seguridad del sistema, registrar auditorías y brindar soporte técnico.
3. Compartición de Información: No vendemos ni compartimos sus datos personales con terceros, excepto cuando sea necesario para cumplir con requerimientos legales o para la prestación del servicio logístico de su empresa.
4. Seguridad: Implementamos medidas técnicas y organizativas para salvaguardar sus datos contra accesos no autorizados, alteración o divulgación.
5. Derechos del Usuario: Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales comunicándose con nuestro equipo de soporte.`,
  terminos: `Bienvenido a ZoneScore. Al acceder y utilizar nuestra aplicación, usted acepta cumplir y estar sujeto a los siguientes Términos y Condiciones de Uso.

1. Uso de la Plataforma: Esta aplicación está diseñada para la gestión logística y de entregas. El uso indebido de los datos, el acceso no autorizado o cualquier acción que interrumpa el servicio está estrictamente prohibido.
2. Cuentas de Usuario: Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Toda actividad realizada bajo su cuenta será de su entera responsabilidad.
3. Propiedad Intelectual: Todo el contenido, marcas, logotipos y software de ZoneScore son propiedad de nuestra empresa y están protegidos por las leyes de propiedad intelectual aplicables.
4. Limitación de Responsabilidad: ZoneScore no se hace responsable por pérdidas indirectas, fallos en la red de comunicación o demoras imprevistas en las entregas.
5. Modificaciones: Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la app implica la aceptación de los nuevos términos.`,
} as const;

export const useStaticData = () => {
  const legalContentByTitle = useMemo(
    () => [
      { match: ['privacidad'], content: LEGAL_TEXTS.privacidad },
      { match: ['terminos', 'términos'], content: LEGAL_TEXTS.terminos },
    ],
    [],
  );

  const getLegalContent = useCallback((titulo: string, contenido?: string) => {
    if (contenido?.trim()) {
      return contenido;
    }

    const normalizedTitle = titulo.toLowerCase();
    const entry = legalContentByTitle.find((item) =>
      item.match.some((pattern) => normalizedTitle.includes(pattern)),
    );

    return entry?.content ?? LEGAL_TEXTS.terminos;
  }, [legalContentByTitle]);

  return {
    getLegalContent,
  };
};
