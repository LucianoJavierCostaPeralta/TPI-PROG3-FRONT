import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
// importamos la herramienta para evitar que el menu choque con los bordes del sistema
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// definimos el tipo de icono usando el mapa de expo
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
  const insets = useSafeAreaInsets();
  
  // enviamos el espacio inferior disponible a los estilos
  const styles = createStyles(theme, insets.bottom);

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const iconName = isActive && item.activeIcon ? item.activeIcon : item.icon;

        return (
          // el componente pressable maneja el toque de cada boton
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

// agregamos el parametro de margen inferior a la funcion creadora de estilos
const createStyles = (theme: MD3Theme, bottomInset: number) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
      paddingTop: 8,
      // calculamos el margen sumando espacio extra si el celular tiene barra inferior
      paddingBottom: bottomInset > 0 ? bottomInset + 8 : 16,
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