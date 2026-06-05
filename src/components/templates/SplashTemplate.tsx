import { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SplashTemplateProps = {
  onAnimationComplete: () => void;
};

export function SplashTemplate({ onAnimationComplete }: SplashTemplateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in animation para el logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Spin animation continua para el loader
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Navegación automática después de 3 segundos
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, spinAnim, onAnimationComplete]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedSpinStyle = {
    transform: [{ rotate: spinInterpolate }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.logoText}>ZoneScore</Text>
          <Text style={styles.logoSubtitle}>Gestión Inteligente</Text>
        </Animated.View>

        <Animated.View style={[styles.spinnerContainer, animatedSpinStyle]}>
          <View style={styles.spinner} />
        </Animated.View>

        <Text style={styles.loadingText}>Preparando tu experiencia...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  logoSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 8,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRightColor: '#ffffff',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
