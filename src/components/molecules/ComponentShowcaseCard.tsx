import { StyleSheet, View } from 'react-native';
import { Chip, Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';

type ComponentShowcaseCardProps = {
  title: string;
  description: string;
  components: string[];
  children: React.ReactNode;
};

export function ComponentShowcaseCard({
  title,
  description,
  components,
  children,
}: ComponentShowcaseCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.header}>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      </View>

      <View style={styles.preview}>{children}</View>

      <View style={styles.chips}>
        {components.map((component) => (
          <Chip key={component} compact mode="outlined">
            {component}
          </Chip>
        ))}
      </View>
    </Surface>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    card: {
      gap: 14,
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    header: {
      gap: 4,
    },
    description: {
      color: theme.colors.onSurfaceVariant,
    },
    preview: {
      gap: 10,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
  });
