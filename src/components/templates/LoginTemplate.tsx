import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Title, Subtitle } from '../atoms/Typography';

type LoginTemplateProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function LoginTemplate({
  title,
  subtitle,
  children,
}: LoginTemplateProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Title style={styles.title}>{title}</Title>
          <Subtitle style={styles.subtitle}>{subtitle}</Subtitle>
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    lineHeight: 22,
  },
});
