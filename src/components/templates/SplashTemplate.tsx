import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { spacing, dimensions, radii } from '../../styles/theme';
import LogoZoneScore from '../../assets/logo-zonescore.svg';

type SplashTemplateProps = {
  onAnimationComplete: () => void;
};

export function SplashTemplate({ onAnimationComplete }: SplashTemplateProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();

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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <StatusBar style="light" backgroundColor={theme.colors.primary} translucent />

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
                    outputRange: [dimensions.splash.logoOffsetY, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <LogoZoneScore width={dimensions.icon.sm} height={dimensions.icon.sm} />
            <Text style={styles.logoText}>ZoneScore</Text>
          </View>

          <Text style={styles.logoSubtitle}>Gestión Inteligente</Text>
        </Animated.View>

        <Animated.View style={[styles.spinnerContainer, animatedSpinStyle]}>
          <View style={styles.spinner} />
        </Animated.View>

        <Text style={styles.loadingText}>Preparando tu experiencia...</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      marginBottom: dimensions.splash.logoBottomMargin,
      alignItems: 'center',
    },
    logoText: {
      color: theme.colors.onPrimary,
      fontSize: dimensions.splash.logoTextSize,
      fontWeight: '900',
      letterSpacing: 2,
      textAlign: 'center',
    },
    logoSubtitle: {
      color: theme.colors.onPrimary,
      opacity: 0.8,
      fontSize: dimensions.splash.logoSubtitleSize,
      fontWeight: '500',
      letterSpacing: 1,
      marginTop: spacing.sm,
    },
    spinnerContainer: {
      width: dimensions.spinner.container,
      height: dimensions.spinner.container,
      marginBottom: dimensions.splash.spinnerBottomMargin,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      width: dimensions.spinner.inner,
      height: dimensions.spinner.inner,
      borderRadius: dimensions.spinner.inner / 2,
      borderWidth: 4,
      borderColor: theme.colors.onPrimary + '4D',
      borderTopColor: theme.colors.onPrimary,
      borderRightColor: theme.colors.onPrimary,
    },
    loadingText: {
      color: theme.colors.onPrimary,
      opacity: 0.9,
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: dimensions.splash.brandRowGap,
    },
  });
