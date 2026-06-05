import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Title } from '../atoms/Typography';

type RegisterTemplateProps = {
  title: string;
  children: React.ReactNode;
};

export function RegisterTemplate({ title, children }: RegisterTemplateProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Title style={styles.title}>{title}</Title>
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
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    letterSpacing: -0.5,
  },
});
