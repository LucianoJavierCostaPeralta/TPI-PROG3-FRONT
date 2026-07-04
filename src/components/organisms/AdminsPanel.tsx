import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { UserAvatar, EmptyState } from '../atoms';
import { type UserProfile } from '../../types/workspace';
import { spacing } from '../../styles/theme';

export function AdminsPanel({
  admins,
  refreshing,
  onRefresh,
}: {
  admins: UserProfile[];
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <FlatList
      data={admins}
      keyExtractor={(item) => item.id}
      renderItem={({ item: admin }) => (
        <Surface style={styles.listRow} elevation={1}>
          <UserAvatar name={admin.nombre} style={styles.adminAvatar} />
          <View style={styles.flexContent}>
            <Text variant="titleSmall" style={styles.primaryText}>{admin.nombre}</Text>
            <Text variant="bodySmall" style={styles.mutedText}>{admin.email}</Text>
          </View>
        </Surface>
      )}
      ListEmptyComponent={<EmptyState text="Todavía no hay administradores de empresa usando la app." />}
      contentContainerStyle={styles.scrollContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    scrollContent: {
      padding: 16,
      paddingBottom: 96,
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
