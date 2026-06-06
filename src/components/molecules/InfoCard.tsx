import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { cardStyles, spacing, typography } from '../../styles/theme';

type InfoCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function InfoCard({ icon, title, description }: InfoCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    card: {
      ...cardStyles.elevated,
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.outline,
      alignItems: 'flex-start',
      gap: spacing.md,
      shadowColor: theme.colors.onSurface,
    },
    icon: {
      fontSize: 28,
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    title: {
      ...typography.bodyMd,
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    description: {
      ...typography.labelSm,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '400',
    },
  });
