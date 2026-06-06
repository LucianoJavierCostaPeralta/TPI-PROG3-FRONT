import { StyleSheet, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { InfoCard } from '../molecules/InfoCard';
import { Title } from '../atoms/Typography';
import { spacing, typography } from '../../styles/theme';

type BenefitsListProps = {
  benefits: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

export function BenefitsList({ benefits }: BenefitsListProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>¿Por qué elegirnos?</Title>
      <View style={styles.benefitsContainer}>
        {benefits.map((benefit) => (
          <InfoCard
            key={benefit.title}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 28,
    },
    title: {
      ...typography.bodyLg,
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: spacing.lg,
    },
    benefitsContainer: {
      gap: spacing.md,
    },
  });
