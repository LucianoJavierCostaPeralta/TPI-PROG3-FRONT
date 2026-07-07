import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { AVATAR_COLORS, commonColors } from '../../constants/colors';

type UserAvatarProps = {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageUri?: string | null;
};

export function UserAvatar({ name, size = 40, style, imageUri }: UserAvatarProps) {
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
    if (!name || !name.trim()) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor();
  const textColor = commonColors.white;

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.avatarImage,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style as any,
        ]}
      />
    );
  }

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
  avatarImage: {
    resizeMode: 'cover',
  },
  text: {
    fontWeight: '700',
  },
});
