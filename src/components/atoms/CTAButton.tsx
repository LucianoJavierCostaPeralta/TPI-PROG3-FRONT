import { type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Button, useTheme, type ButtonProps, type MD3Theme } from 'react-native-paper';
import { buttonStyles, typography } from '../../styles/theme';

type CTAButtonVariant = 'primary' | 'secondary' | 'destructive';

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
  compact = false,
  style,
  labelStyle,
  ...props
}: CTAButtonProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme, compact);
  const isPrimary = variant === 'primary';
  const isDestructive = variant === 'destructive';

  return (
    <Button
      mode={isPrimary || isDestructive ? 'contained' : 'outlined'}
      disabled={disabled}
      compact={compact}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : null,
        variant === 'secondary' ? styles.secondaryButton : null,
        isDestructive ? styles.destructiveButton : null,
        disabled ? styles.disabledButton : null,
        style,
      ]}
      labelStyle={[
        styles.label,
        isPrimary ? styles.primaryLabel : null,
        variant === 'secondary' ? styles.secondaryLabel : null,
        isDestructive ? styles.destructiveLabel : null,
        disabled ? styles.disabledLabel : null,
        labelStyle,
      ]}
      contentStyle={styles.content}
      {...props}
    >
      {children}
    </Button>
  );
}

const createStyles = (theme: MD3Theme, compact: boolean) =>
  StyleSheet.create({
    button: {
      borderRadius: buttonStyles.primary.borderRadius,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderWidth: buttonStyles.outline.borderWidth,
    },
    destructiveButton: {
      backgroundColor: theme.colors.error,
    },
    disabledButton: {
      backgroundColor: theme.colors.surfaceDisabled,
      borderColor: theme.colors.surfaceDisabled,
    },
    content: {
      height: compact ? buttonStyles.small.height : buttonStyles.primary.height,
      paddingHorizontal: compact ? buttonStyles.small.paddingHorizontal : buttonStyles.primary.paddingHorizontal,
    },
    label: {
      ...typography.labelMd,
    },
    primaryLabel: {
      color: theme.colors.onPrimary,
    },
    secondaryLabel: {
      color: theme.colors.primary,
    },
    destructiveLabel: {
      color: theme.colors.onError,
    },
    disabledLabel: {
      color: theme.colors.onSurfaceDisabled,
    },
  });
