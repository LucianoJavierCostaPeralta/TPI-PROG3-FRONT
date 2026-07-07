import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Surface, Text, useTheme, type MD3Theme } from "react-native-paper";
import { radii, spacing } from "../../styles/theme";

type SectionCardProps = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
};

export function SectionCard({ title, children, style, contentStyle, elevation = 1 }: SectionCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Surface style={[styles.section, style]} elevation={elevation}>
      {title ? <Text variant="titleMedium" style={styles.title}>{title}</Text> : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Surface>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    section: {
      borderRadius: radii.md,
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    title: {
      color: theme.colors.onSurface,
      fontWeight: "700",
      marginBottom: spacing.md,
    },
    content: {
      gap: spacing.sm,
    },
  });
