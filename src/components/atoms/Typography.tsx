import { Text, type TextProps } from 'react-native-paper';
import { typography } from '../../styles/theme';

export function Title({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="headlineMedium" style={[typography.headlineMd, style]} {...props}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="titleMedium" style={[typography.bodyLg, style]} {...props}>
      {children}
    </Text>
  );
}

export function BodyLarge({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="bodyLarge" style={[typography.bodyLg, style]} {...props}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="bodyMedium" style={[typography.bodyMd, style]} {...props}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="labelSmall" style={[typography.caption, style]} {...props}>
      {children}
    </Text>
  );
}

export function Label({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="labelMedium" style={[typography.labelMd, style]} {...props}>
      {children}
    </Text>
  );
}
