import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  Drawer,
  IconButton,
  Modal,
  Portal,
  Text,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';

type AppDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function AppDrawer({ visible, onClose, onSignOut }: AppDrawerProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const router = useRouter();

  const handleOpenSettings = () => {
    onClose();
    router.push('/configuracion');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.drawer}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.brand}>
            ZoneScore
          </Text>
          <IconButton icon="close" size={22} onPress={onClose} />
        </View>

        <Drawer.Section showDivider={false} style={styles.section}>
          <Drawer.Item icon="account-outline" label="Mi Perfil" onPress={onClose} />
          <Drawer.Item icon="cog-outline" label="Configuración" onPress={handleOpenSettings} />
        </Drawer.Section>

        <View style={styles.divider} />

        <Drawer.Section showDivider={false} style={styles.section}>
          <Drawer.Item
            icon="headset"
            label="Contactar Asesor"
            onPress={onClose}
            theme={{ colors: { onSurfaceVariant: theme.colors.primary } }}
          />
        </Drawer.Section>

        <View style={styles.divider} />

        <Drawer.Section showDivider={false} style={styles.section}>
          <Drawer.Item
            icon="logout"
            label="Cerrar sesión"
            onPress={onSignOut}
            theme={{ colors: { onSurfaceVariant: theme.colors.error } }}
          />
        </Drawer.Section>

        <View style={styles.divider} />

        <View style={styles.legalSection}>
          <Text variant="bodySmall" style={styles.legalText}>
            Terminos y Condiciones
          </Text>
          <Text variant="bodySmall" style={styles.legalText}>
            Politica de Privacidad
          </Text>
        </View>
      </Modal>
    </Portal>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    drawer: {
      width: 236,
      height: '100%',
      margin: 0,
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
    },
    header: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 8,
      paddingRight: 4,
    },
    brand: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    section: {
      marginTop: 10,
      marginBottom: 10,
    },
    divider: {
      height: 1,
      marginHorizontal: 16,
      backgroundColor: theme.colors.outline,
    },
    legalSection: {
      paddingTop: 24,
      paddingHorizontal: 16,
      gap: 18,
    },
    legalText: {
      color: theme.colors.onSurfaceVariant,
    },
  });
