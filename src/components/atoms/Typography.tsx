import { StyleSheet, Text, TextProps } from 'react-native';

// Título grande (Heading Large)
export function Title({ children, style }: TextProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

// Subtítulo (Heading Medium)
export function Subtitle({ children, style }: TextProps) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

// Texto corporal grande
export function BodyLarge({ children, style }: TextProps) {
  return <Text style={[styles.bodyLarge, style]}>{children}</Text>;
}

// Texto corporal normal
export function Body({ children, style }: TextProps) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

// Texto pequeño (caption)
export function Caption({ children, style }: TextProps) {
  return <Text style={[styles.caption, style]}>{children}</Text>;
}

// Label para inputs
export function Label({ children, style }: TextProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333333',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999999',
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
