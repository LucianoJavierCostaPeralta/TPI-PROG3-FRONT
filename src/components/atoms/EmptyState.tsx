import { StyleSheet } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { radii } from '../../styles/theme';

export function EmptyState({ text }: { text: string }) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.emptyState} elevation={1}>
      <Text variant="bodyMedium" style={styles.mutedText}>{text}</Text>
    </Surface>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    emptyState: {
      padding: 16,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface,
    },
    mutedText: {
      color: theme.colors.onSurfaceVariant,
    },
  });
