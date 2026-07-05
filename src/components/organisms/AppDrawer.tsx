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

  const handleOpenProfile = () => {
    onClose();
    router.push('/perfil');
  };

  const handleOpenSettings = () => {
    onClose();
    router.push('/configuracion');
  };

  const handleOpenLegal = (titulo: string) => {
    onClose();
    router.push({
      pathname: '/legal',
      params: { titulo },
    });
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
          <Drawer.Item icon="account-outline" label="Mi Perfil" onPress={handleOpenProfile} />
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
          <Drawer.Item
            icon="file-document-outline"
            label="Términos y Condiciones"
            onPress={() => handleOpenLegal('Términos y Condiciones')}
            theme={{
              fonts: {
                labelLarge: {
                  fontSize: 13,
                  fontWeight: '500',
                },
              },
              colors: {
                onSurfaceVariant: theme.colors.secondary,
              },
            } as any}
            style={styles.legalItem}
          />
          <Drawer.Item
            icon="shield-check-outline"
            label="Política de Privacidad"
            onPress={() => handleOpenLegal('Política de Privacidad')}
            theme={{
              fonts: {
                labelLarge: {
                  fontSize: 13,
                  fontWeight: '500',
                },
              },
              colors: {
                onSurfaceVariant: theme.colors.secondary,
              },
            } as any}
            style={styles.legalItem}
          />
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
      marginTop: 8,
      marginBottom: 8,
    },
    legalItem: {
      height: 40,
      justifyContent: 'center',
    },
  });
