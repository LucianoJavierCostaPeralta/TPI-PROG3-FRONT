import { type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Button, useTheme, type ButtonProps, type MD3Theme } from 'react-native-paper';
import { buttonStyles } from '../../styles/theme';

type CTAButtonVariant = 'primary' | 'secondary';

type CTAButtonProps = Omit<ButtonProps, 'children' | 'mode' | 'style' | 'labelStyle'> & {
  children: ReactNode;
  variant?: CTAButtonVariant;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function CTAButton({
  children,
  disabled = false,
  variant = 'primary',
  style,
  labelStyle,
  ...props
}: CTAButtonProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const isPrimary = variant === 'primary';

  return (
    <Button
      mode={isPrimary ? 'contained' : 'outlined'}
      disabled={disabled}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      labelStyle={[
        styles.label,
        isPrimary ? styles.primaryLabel : styles.secondaryLabel,
        labelStyle,
      ]}
      contentStyle={styles.content}
      {...props}
    >
      {children}
    </Button>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    button: {
      borderRadius: buttonStyles.primary.borderRadius,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.primary,
      borderWidth: buttonStyles.outline.borderWidth,
    },
    content: {
      height: buttonStyles.primary.height,
      paddingHorizontal: buttonStyles.primary.paddingHorizontal,
    },
    label: {
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    primaryLabel: {
      color: theme.colors.onPrimary,
      fontSize: 16,
    },
    secondaryLabel: {
      color: theme.colors.primary,
      fontSize: 15,
    },
  });
