import { StyleSheet } from 'react-native';
import { Appbar, useTheme, type MD3Theme } from 'react-native-paper';

type AppTopBarProps = {
  title: string;
  onMenuPress: () => void;
  onBellPress?: () => void;
};

export function AppTopBar({ title, onMenuPress, onBellPress }: AppTopBarProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const iconColor = theme.dark ? '#FFFFFF' : theme.colors.onPrimary;

  return (
    <Appbar.Header mode="center-aligned" elevated={false} style={styles.header} statusBarHeight={0}>
      <Appbar.Action icon="menu" size={24} iconColor={iconColor} onPress={onMenuPress} style={styles.action} />

      <Appbar.Content title={title} titleStyle={styles.title} />

      <Appbar.Action icon="bell-outline" size={24} iconColor={iconColor} onPress={onBellPress} style={styles.action} />
    </Appbar.Header>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      minHeight: 56,
      height: 56,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primary,
      elevation: 0,
      shadowOpacity: 0,
    },
    action: {
      width: 40,
      height: 40,
      marginHorizontal: 0,
    },
    title: {
      color: theme.dark ? '#FFFFFF' : theme.colors.onPrimary,
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
