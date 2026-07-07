import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { radii, spacing } from '../../styles/theme';

type AccionesRapidasProps = {
  verMapa: () => void;
  crearChofer: () => void;
  crearEntrega: () => void;
};

type ActionItem = {
  key: 'entrega' | 'chofer' | 'mapa';
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};

export function AccionesRapidas({ verMapa, crearChofer, crearEntrega }: AccionesRapidasProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const actions: ActionItem[] = [
    { key: 'entrega', label: 'Nueva entrega', icon: 'truck-fast-outline', onPress: crearEntrega },
    { key: 'chofer', label: 'Agregar chofer', icon: 'account-plus-outline', onPress: crearChofer },
    { key: 'mapa', label: 'Ver mapa', icon: 'map-marker-outline', onPress: verMapa },
  ];

  return (
    <Surface style={styles.container} elevation={1}>
      <Text style={styles.title}>Acciones rápidas</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable key={action.key} style={styles.card} onPress={action.onPress}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={action.icon} size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </Surface>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      borderRadius: radii.lg,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      gap: spacing.md,
    },
    title: {
      color: theme.colors.onPrimary,
      fontFamily: 'Inter-Medium',
      fontSize: 15,
      fontWeight: '500',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    card: {
      width: '48%',
      minWidth: 140,
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: theme.colors.onPrimary,
      fontFamily: 'Inter-Medium',
      fontSize: 13,
      fontWeight: '500',
    },
  });
