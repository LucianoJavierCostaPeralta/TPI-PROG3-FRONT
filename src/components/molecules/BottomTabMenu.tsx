import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';

// Usamos los nombres reales disponibles en MaterialCommunityIcons.
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type BottomTabMenuItem<T extends string> = {
  key: T;
  label: string;
  icon: IconName;
  activeIcon?: IconName;
};

type BottomTabMenuProps<T extends string> = {
  items: Array<BottomTabMenuItem<T>>;
  activeKey: T;
  onChange: (key: T) => void;
};

export function BottomTabMenu<T extends string>({
  items,
  activeKey,
  onChange,
}: BottomTabMenuProps<T>) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const iconName = isActive && item.activeIcon ? item.activeIcon : item.icon;

        return (
          // Cada Pressable representa una opcion del menu inferior.
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={styles.item}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="labelSmall"
              style={[styles.label, isActive && styles.activeLabel]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    item: {
      flex: 1,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      borderRadius: 8,
    },
    label: {
      color: theme.colors.onSurfaceVariant,
    },
    activeLabel: {
      color: theme.colors.primary,
    },
  });
