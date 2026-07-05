import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme, Surface } from 'react-native-paper';
import { ScreenLayout } from '../components/templates/ScreenLayout';
import { spacing, radii } from '../styles/theme';

type LegalScreenProps = {
  titulo: string;
  contenido?: string;
  onBack: () => void;
};

const TERMINOS_TEXT = `Bienvenido a ZoneScore. Al acceder y utilizar nuestra aplicación, usted acepta cumplir y estar sujeto a los siguientes Términos y Condiciones de Uso.

1. Uso de la Plataforma: Esta aplicación está diseñada para la gestión logística y de entregas. El uso indebido de los datos, el acceso no autorizado o cualquier acción que interrumpa el servicio está estrictamente prohibido.
2. Cuentas de Usuario: Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Toda actividad realizada bajo su cuenta será de su entera responsabilidad.
3. Propiedad Intelectual: Todo el contenido, marcas, logotipos y software de ZoneScore son propiedad de nuestra empresa y están protegidos por las leyes de propiedad intelectual aplicables.
4. Limitación de Responsabilidad: ZoneScore no se hace responsable por pérdidas indirectas, fallos en la red de comunicación o demoras imprevistas en las entregas.
5. Modificaciones: Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la app implica la aceptación de los nuevos términos.`;

const PRIVACIDAD_TEXT = `En ZoneScore, nos comprometemos a proteger su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal.

1. Recopilación de Información: Recopilamos información necesaria para la operación del servicio logístico, como nombres de usuario, correos electrónicos, números de teléfono, detalles de vehículos e historial de entregas.
2. Uso de Datos: Los datos recopilados se utilizan exclusivamente para optimizar las rutas de entrega, mantener la seguridad del sistema, registrar auditorías y brindar soporte técnico.
3. Compartición de Información: No vendemos ni compartimos sus datos personales con terceros, excepto cuando sea necesario para cumplir con requerimientos legales o para la prestación del servicio logístico de su empresa.
4. Seguridad: Implementamos medidas técnicas y organizativas para salvaguardar sus datos contra accesos no autorizados, alteración o divulgación.
5. Derechos del Usuario: Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales comunicándose con nuestro equipo de soporte.`;

export function LegalScreen({ titulo, contenido, onBack }: LegalScreenProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const textContent = contenido || (titulo.toLowerCase().includes('privacidad') ? PRIVACIDAD_TEXT : TERMINOS_TEXT);

  return (
    <ScreenLayout
      title={titulo}
      subtitle="Información legal"
      onBack={onBack}
      scrollable={true}
    >
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {titulo}
        </Text>
        <View style={styles.divider} />
        <Text variant="bodyMedium" style={styles.text}>
          {textContent}
        </Text>
      </Surface>
    </ScreenLayout>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    card: {
      padding: spacing.lg,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
    },
    cardTitle: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginBottom: spacing.md,
    },
    text: {
      color: theme.colors.onSurfaceVariant,
      lineHeight: 22,
      textAlign: 'justify',
    },
  });
