import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';

type UserAvatarProps = {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function UserAvatar({ name, size = 40, style }: UserAvatarProps) {
  const theme = useTheme<MD3Theme>();

  // Genera iniciales tipo Google (por ejemplo: "Juan Pérez" -> "JP", "Mario" -> "M")
  const getInitials = (nameStr?: string) => {
    if (!nameStr || !nameStr.trim()) return '?';
    const words = nameStr.trim().split(/\s+/);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Paleta de colores vibrantes y sólidos inspirada en Google
  const getBackgroundColor = () => {
    if (!name || !name.trim()) return '#4285F4'; // Azul de Google por defecto
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const googleColors = [
      '#4285F4', // Google Blue
      '#EA4335', // Google Red
      '#FBBC05', // Google Yellow
      '#34A853', // Google Green
      '#9C27B0', // Purple
      '#009688', // Teal
      '#FF5722', // Deep Orange
      '#673AB7', // Deep Purple
      '#3F51B5', // Indigo
    ];
    return googleColors[Math.abs(hash) % googleColors.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor();
  const textColor = '#FFFFFF'; // Texto blanco para máximo contraste con el fondo sólido

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.4, // Proporción ideal para 1 o 2 letras
            color: textColor,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
