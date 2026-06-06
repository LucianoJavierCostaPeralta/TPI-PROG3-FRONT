import { StyleSheet, View } from 'react-native';
import { InfoCard } from '../molecules/InfoCard';
import { Title } from '../atoms/Typography';

type BenefitsListProps = {
  benefits: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

export function BenefitsList({ benefits }: BenefitsListProps) {
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsContainer: {
    gap: 12,
  },
});
