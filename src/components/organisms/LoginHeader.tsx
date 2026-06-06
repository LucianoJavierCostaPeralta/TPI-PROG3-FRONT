import { Pressable, StyleSheet, Text, View } from 'react-native';

type LoginHeaderProps = {
  onForgotPassword: () => void;
};

export function LoginHeader({ onForgotPassword }: LoginHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          El sistema identificará automáticamente si accede como empresa o chofer
        </Text>
      </View>

      <Pressable onPress={onForgotPassword} style={styles.forgotButton}>
        <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  notice: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6b7280',
  },
  noticeText: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  forgotText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '700',
  },
});
