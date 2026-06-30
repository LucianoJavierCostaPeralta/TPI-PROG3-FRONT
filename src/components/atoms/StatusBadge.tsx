import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { radii, statusStyles, typography } from '../../styles/theme';

type StatusBadgeTone = keyof typeof statusStyles;

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function StatusBadge({ label, tone = 'pending', style }: StatusBadgeProps) {
  const token = statusStyles[tone];

  return (
    <Surface style={[styles.badge, { backgroundColor: token.backgroundColor, borderColor: token.borderColor }, style]} elevation={0}>
      <Text style={[styles.label, { color: token.color }]}>{label}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
  },
});
