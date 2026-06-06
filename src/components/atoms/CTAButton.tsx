import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type CTAButtonVariant = 'primary' | 'secondary';

type CTAButtonProps = {
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
  icon?: string;
  variant?: CTAButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function CTAButton({
  onPress,
  children,
  disabled = false,
  icon,
  variant = 'primary',
  style,
}: CTAButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === 'primary';

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          disabled && (isPrimary ? styles.primaryDisabled : styles.secondaryDisabled),
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          {icon ? ' ' : ''}
          {children}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#1976D2',
    shadowColor: '#1976D2',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  secondaryButton: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  primaryDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryDisabled: {
    borderColor: '#BDBDBD',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  secondaryText: {
    color: '#1976D2',
    fontSize: 15,
  },
  icon: {
    marginRight: 4,
  },
});
