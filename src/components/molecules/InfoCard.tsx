import { StyleSheet, Text, View } from 'react-native';

type InfoCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function InfoCard({ icon, title, description }: InfoCardProps) {
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
  },
});
