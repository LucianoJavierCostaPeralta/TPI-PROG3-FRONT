import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppIcon } from '../components/atoms/AppIcon';
import { HomeTemplate } from '../components/templates/HomeTemplate';
import type { TabKey } from '../components/organisms/BottomTabBar';
import {
  useAppTheme,
  useThemePreference,
  type ThemePreference,
} from '../hooks/useAppTheme';

const screenContent: Record<
  TabKey,
  {
    headerLabel: string;
    title: string;
    subtitle: string;
  }
> = {
  home: {
    headerLabel: 'Inicio',
    title: 'Pantalla de inicio',
    subtitle: 'Base limpia para empezar a construir el flujo principal.',
  },
  profile: {
    headerLabel: 'Perfil',
    title: 'Pantalla de perfil',
    subtitle: 'Acá podés mostrar datos del usuario, cuenta y preferencias.',
  },
  settings: {
    headerLabel: 'Config',
    title: 'Pantalla de configuración',
    subtitle: 'Este espacio queda listo para ajustes, permisos y opciones.',
  },
};

export function HomeScreen() {
  const theme = useAppTheme();
  const { preference, setPreference } = useThemePreference();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [settingsRoute, setSettingsRoute] = useState<'root' | 'general' | 'theme'>('root');
  const currentScreen = screenContent[activeTab];

  useEffect(() => {
    if (activeTab !== 'settings') {
      setSettingsRoute('root');
    }
  }, [activeTab]);

  const headerLabel =
    activeTab === 'settings'
      ? settingsRoute === 'root'
        ? 'Config'
        : settingsRoute === 'general'
          ? 'General'
          : 'Tema'
      : currentScreen.headerLabel;

  const settingsContent =
    activeTab === 'settings' ? (
      <View style={styles.settingsLayout}>
        {settingsRoute === 'root' ? (
          <View style={styles.settingsList}>
            <Pressable
              onPress={() => setSettingsRoute('general')}
              style={styles.settingsRow}
            >
              <View>
                <Text style={styles.settingsRowTitle}>General</Text>
                <Text style={styles.settingsRowValue}>
                  Apariencia y preferencias visuales
                </Text>
              </View>
              <AppIcon name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.settingsList}>
            <Pressable
              onPress={() => setSettingsRoute('root')}
              style={styles.backRow}
            >
              <AppIcon name="chevron-back" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>

            {settingsRoute === 'general' ? (
              <Pressable
                onPress={() => setSettingsRoute('theme')}
                style={styles.settingsRow}
              >
                <View>
                  <Text style={styles.settingsRowTitle}>Tema</Text>
                  <Text style={styles.settingsRowValue}>
                    {themeOptions.find((option) => option.value === preference)?.label}
                  </Text>
                </View>
                <AppIcon name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ) : (
              themeOptions.map((option, index) => {
                const selected = option.value === preference;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setPreference(option.value)}
                    style={[
                      styles.settingsRow,
                      index > 0 && styles.settingsRowDivider,
                    ]}
                  >
                    <View>
                      <Text style={styles.settingsRowTitle}>{option.label}</Text>
                      <Text style={styles.settingsRowValue}>
                        {selected ? 'Seleccionado' : 'Tocar para aplicar'}
                      </Text>
                    </View>
                    {selected ? (
                      <AppIcon name="checkmark" size={20} color={theme.colors.textPrimary} />
                    ) : (
                      <AppIcon name="chevron-forward" size={18} color={theme.colors.textMuted} />
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </View>
    ) : null;

  return (
    <HomeTemplate
      headerLabel={headerLabel}
      activeTab={activeTab}
      onTabPress={setActiveTab}
      content={
        activeTab === 'settings' ? (
          settingsContent
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>{currentScreen.title}</Text>
            <Text style={styles.subtitle}>{currentScreen.subtitle}</Text>
          </View>
        )
      }
    />
  );
}

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: theme.typography.h2.fontSize,
      lineHeight: theme.typography.h2.lineHeight,
      fontWeight: theme.typography.h2.fontWeight,
      color: theme.colors.textPrimary,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.body.fontSize,
      lineHeight: theme.typography.body.lineHeight,
      fontWeight: theme.typography.body.fontWeight,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    settingsLayout: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    settingsList: {
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      overflow: 'hidden',
    },
    settingsRow: {
      minHeight: 72,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingsRowDivider: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    settingsRowTitle: {
      fontSize: theme.typography.h6.fontSize,
      lineHeight: theme.typography.h6.lineHeight,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    settingsRowValue: {
      fontSize: theme.typography.bodySmall.fontSize,
      lineHeight: theme.typography.bodySmall.lineHeight,
      fontWeight: theme.typography.bodySmall.fontWeight,
      color: theme.colors.textSecondary,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backText: {
      fontSize: theme.typography.body.fontSize,
      lineHeight: theme.typography.body.lineHeight,
      fontWeight: theme.typography.body.fontWeight,
      color: theme.colors.textSecondary,
    },
  });
