import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type SecondaryButtonProps = {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
};

export function SecondaryButton({
  onPress,
  children,
  disabled = false,
  style,
  icon,
}: SecondaryButtonProps) {
  const [scale] = useState(new Animated.Value(1));

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
          disabled && styles.buttonDisabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Text style={styles.text}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          {icon ? ' ' : ''}{children}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    borderColor: '#BDBDBD',
    backgroundColor: '#F5F5F5',
  },
  text: {
    color: '#1976D2',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  icon: {
    marginRight: 4,
  },
});
