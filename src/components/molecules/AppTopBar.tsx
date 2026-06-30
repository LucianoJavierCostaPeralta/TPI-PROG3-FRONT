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
    <Appbar.Header mode="center-aligned" elevated={false} style={styles.header}>
      {/* Appbar.Action ya trae el boton con icono de Paper. */}
      <Appbar.Action icon="menu" size={30} iconColor={theme.colors.onPrimary} onPress={onMenuPress} style={styles.action} />

      {/* Titulo central de la app. */}
      <Appbar.Content title="ZoneScore" titleStyle={styles.title} />

      <Appbar.Action icon="bell-outline" size={28} iconColor={theme.colors.onPrimary} onPress={onBellPress} style={styles.action} />
    </Appbar.Header>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      minHeight: 72,
      paddingHorizontal: 24,
      paddingVertical: 14,
      backgroundColor: theme.colors.primary,
      elevation: 0,
      shadowOpacity: 0,
    },
    action: {
      width: 44,
      height: 44,
      marginHorizontal: 0,
    },
    title: {
      color: theme.colors.onPrimary,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
      letterSpacing: 0,
    },
  });
