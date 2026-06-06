import { Text, type TextProps } from 'react-native-paper';

export function Title({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="headlineMedium" style={[{ fontWeight: '800' }, style]} {...props}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="headlineSmall" style={[{ fontWeight: '800' }, style]} {...props}>
      {children}
    </Text>
  );
}

export function BodyLarge({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="bodyLarge" style={style} {...props}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="bodyMedium" style={style} {...props}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="labelSmall" style={style} {...props}>
      {children}
    </Text>
  );
}

export function Label({ children, style, ...props }: TextProps<never>) {
  return (
    <Text variant="labelMedium" style={style} {...props}>
      {children}
    </Text>
  );
}
