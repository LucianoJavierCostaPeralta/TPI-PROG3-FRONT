import { StyleSheet } from 'react-native';
import { Appbar, useTheme, type MD3Theme } from 'react-native-paper';

type AppTopBarProps = {
  onMenuPress: () => void;
  onBellPress?: () => void;
};

export function AppTopBar({ onMenuPress, onBellPress }: AppTopBarProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <Appbar.Header mode="center-aligned" style={styles.header}>
      {/* Appbar.Action ya trae el boton con icono de Paper. */}
      <Appbar.Action icon="menu" iconColor={theme.colors.onPrimary} onPress={onMenuPress} />

      {/* Titulo central de la app. */}
      <Appbar.Content title="ZoneScore" titleStyle={styles.title} />

      <Appbar.Action icon="bell-outline" iconColor={theme.colors.onPrimary} onPress={onBellPress} />
    </Appbar.Header>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      height: 48,
      backgroundColor: theme.colors.primary,
    },
    title: {
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
  });
