import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useTheme, type MD3Theme } from "react-native-paper";
import { palette, spacing } from "../../styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoZoneScore from "../../../assets/logo-zonescore.svg";
type SplashTemplateProps = {
  onAnimationComplete: () => void;
};

export function SplashTemplate({ onAnimationComplete }: SplashTemplateProps) {
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
    outputRange: ["0deg", "360deg"],
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
          <View style={styles.brandRow}>
            <LogoZoneScore width={50} height={50} />
            <Text style={styles.logoText}>ZoneScore</Text>
          </View>

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

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      alignItems: "center",
      justifyContent: "center",
    },
    logoContainer: {
      marginBottom: 60,
      alignItems: "center",
    },
    logoText: {
      color: theme.colors.onPrimary,
      fontSize: 48,
      fontWeight: "900",
      letterSpacing: 2,
      textAlign: "center",
    },
    logoSubtitle: {
      color: palette.whiteAlpha80,
      fontSize: 14,
      fontWeight: "500",
      letterSpacing: 1,
      marginTop: spacing.sm,
    },
    spinnerContainer: {
      width: 80,
      height: 80,
      marginBottom: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    spinner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 4,
      borderColor: palette.whiteAlpha30,
      borderTopColor: theme.colors.onPrimary,
      borderRightColor: theme.colors.onPrimary,
    },
    loadingText: {
      color: palette.whiteAlpha90,
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: 0.5,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
  });
