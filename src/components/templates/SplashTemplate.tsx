import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // nuevo: respeta safe area en splash
import { palette, spacing, dimensions, radii } from "../../styles/theme";
import LogoZoneScore from "../../assets/logo-zonescore.svg";

type SplashTemplateProps = {
  onAnimationComplete: () => void;
};

export function SplashTemplate({ onAnimationComplete }: SplashTemplateProps) {
  const insets = useSafeAreaInsets();
  const styles = createStyles();

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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* nuevo: padding seguro superior e inferior para evitar recortes en notch y gesture bar */}

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

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.primaryBlue,
      justifyContent: "center",
      alignItems: "center",
    },

    content: {
      alignItems: "center",
      justifyContent: "center",
    },

    logoContainer: {
      marginBottom: dimensions.splash.logoBottomMargin,
      alignItems: "center",
    },

    logoText: {
      color: palette.white,
      fontSize: dimensions.splash.logoTextSize,
      fontWeight: "900",
      letterSpacing: 2,
      textAlign: "center",
    },

    logoSubtitle: {
      color: palette.whiteAlpha80,
      fontSize: dimensions.splash.logoSubtitleSize,
      fontWeight: "500",
      letterSpacing: 1,
      marginTop: spacing.sm,
    },

    spinnerContainer: {
      width: dimensions.spinner.container,
      height: dimensions.spinner.container,
      marginBottom: dimensions.splash.spinnerBottomMargin,
      alignItems: "center",
      justifyContent: "center",
    },

    spinner: {
      width: dimensions.spinner.inner,
      height: dimensions.spinner.inner,
      borderRadius: dimensions.spinner.inner / 2,
      borderWidth: 4,
      borderColor: palette.whiteAlpha30,
      borderTopColor: palette.white,
      borderRightColor: palette.white,
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
      gap: dimensions.splash.brandRowGap,
    },
  });