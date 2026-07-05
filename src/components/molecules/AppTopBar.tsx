import { StyleSheet, View } from 'react-native';
import { Appbar, useTheme, type MD3Theme, Badge } from 'react-native-paper';

type AppTopBarProps = {
  title: string;
  onMenuPress: () => void;
  onBackPress?: () => void;
  onBellPress?: () => void;
  bellActive?: boolean;
  unreadCount?: number;
};

export function AppTopBar({
  title,
  onMenuPress,
  onBackPress,
  onBellPress,
  bellActive = false,
  unreadCount = 0,
}: AppTopBarProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const iconColor = '#FFFFFF'; // Forzar blanco puro para mantener diseño premium en la barra azul

  return (
    <Appbar.Header mode="center-aligned" elevated={false} style={styles.header} statusBarHeight={0}>
      {onBackPress ? (
        <Appbar.BackAction color={iconColor} onPress={onBackPress} size={24} />
      ) : (
        <Appbar.Action icon="menu" size={24} iconColor={iconColor} onPress={onMenuPress} style={styles.action} />
      )}

      <Appbar.Content title={title} titleStyle={styles.title} />

      <View style={styles.bellWrapper}>
        <Appbar.Action
          icon={bellActive ? "bell" : "bell-outline"}
          size={24}
          iconColor={iconColor}
          onPress={onBellPress}
          style={styles.action}
        />
        {!bellActive && unreadCount > 0 && (
          <Badge
            visible={true}
            size={16}
            style={styles.badge}
          >
            {unreadCount}
          </Badge>
        )}
      </View>
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
    bellWrapper: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: '#EF4444', // Rojo brillante premium
      color: '#FFFFFF',
      fontWeight: '800',
    },
  });
