import { StyleSheet, View } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { UserAvatar, EmptyState } from '../atoms';
import { type UserProfile } from '../../screens/HomeScreen';
import { spacing } from '../../styles/theme';

export function AdminsPanel({ admins }: { admins: UserProfile[] }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  if (admins.length === 0) {
    return <EmptyState text="Todavía no hay administradores de empresa usando la app." />;
  }

  return (
    <View style={styles.panel}>
      {admins.map((admin) => (
        <Surface key={admin.id} style={styles.listRow} elevation={1}>
          <UserAvatar name={admin.nombre} style={styles.adminAvatar} />
          <View style={styles.flexContent}>
            <Text variant="titleSmall" style={styles.primaryText}>{admin.nombre}</Text>
            <Text variant="bodySmall" style={styles.mutedText}>{admin.email}</Text>
          </View>
        </Surface>
      ))}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    panel: {
      gap: 14,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    flexContent: {
      flex: 1,
    },
    primaryText: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    mutedText: {
      color: theme.colors.onSurfaceVariant,
    },
    adminAvatar: {
      marginRight: spacing.md,
    },
  });
