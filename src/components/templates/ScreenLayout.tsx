import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Appbar, useTheme, type MD3Theme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../styles/theme';

type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onBellPress?: () => void;
  children: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  disabledBack?: boolean;
};

export function ScreenLayout({
  title,
  subtitle,
  onBack,
  onBellPress,
  children,
  scrollable = true,
  contentContainerStyle,
  footer,
  disabledBack = false,
}: ScreenLayoutProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const iconColor = theme.dark ? '#FFFFFF' : theme.colors.onPrimary;

  const handleDefaultBellPress = () => {
    // Manejo por defecto de las notificaciones
    console.log('Notificaciones presionadas');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.layout}>
        {/* Header estandarizado con minHeight 56 */}
        <Appbar.Header mode="center-aligned" elevated={false} style={styles.header} statusBarHeight={0}>
          <Appbar.BackAction color={iconColor} onPress={onBack} disabled={disabledBack} size={24} />
          
          <Appbar.Content
            title={title}
            subtitle={subtitle}
            titleStyle={styles.title}
            subtitleStyle={styles.subtitle}
          />
          
          <Appbar.Action
            icon="bell-outline"
            size={24}
            iconColor={iconColor}
            onPress={onBellPress || handleDefaultBellPress}
          />
        </Appbar.Header>

        {/* Contenido principal de la pantalla */}
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fixedContent, contentContainerStyle]}>
            {children}
          </View>
        )}

        {/* Footer estático opcional en la parte inferior */}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    layout: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      minHeight: 56,
      height: 56,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primary,
      elevation: 0,
      shadowOpacity: 0,
    },
    title: {
      color: theme.dark ? '#FFFFFF' : theme.colors.onPrimary,
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    subtitle: {
      color: theme.dark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.85)',
      fontSize: 12,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    fixedContent: {
      flex: 1,
      padding: spacing.lg,
    },
    footer: {
      padding: spacing.lg,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderColor: theme.colors.outline,
    },
  });
