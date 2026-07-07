import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radii, spacing } from '../../styles/theme';
import type { AppNotification } from '../../types/workspace';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [activeSubTab, setActiveSubTab] = useState<'nuevas' | 'leidas'>('nuevas');

  const unreadNotifications = notifications.filter((n) => !n.leida);
  const readNotifications = notifications.filter((n) => n.leida);
  const displayedList = activeSubTab === 'nuevas' ? unreadNotifications : readNotifications;

  const isToday = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const todayList = displayedList.filter((n) => isToday(n.created_at));
  const yesterdayList = displayedList.filter((n) => !isToday(n.created_at));

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hr`;

    return 'Ayer';
  };

  const getAlertConfig = (tipo: AppNotification['tipo']) => {
    switch (tipo) {
      case 'warning':
        return {
          color: theme.colors.tertiary,
          backgroundColor: theme.colors.tertiaryContainer,
          icon: 'alert-outline' as const,
        };
      case 'error':
        return {
          color: theme.colors.error,
          backgroundColor: theme.colors.errorContainer,
          icon: 'close-circle-outline' as const,
        };
      case 'success':
        return {
          color: theme.colors.secondary,
          backgroundColor: theme.colors.secondaryContainer,
          icon: 'check-circle-outline' as const,
        };
      case 'info':
      default:
        return {
          color: theme.colors.primary,
          backgroundColor: theme.colors.primaryContainer,
          icon: 'information-outline' as const,
        };
    }
  };

  const renderNotificationCard = (notification: AppNotification) => {
    const config = getAlertConfig(notification.tipo);

    return (
      <TouchableOpacity
        key={notification.id}
        activeOpacity={0.8}
        onPress={() => !notification.leida && onMarkAsRead(notification.id)}
      >
        <Surface style={[styles.card, { borderLeftColor: config.color }]} elevation={1}>
          <View style={[styles.iconWrapper, { backgroundColor: config.backgroundColor }]}>
            <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
          </View>
          <View style={styles.contentWrapper}>
            <View style={styles.cardHeader}>
              <Text variant="titleSmall" style={styles.cardTitle}>
                {notification.titulo}
              </Text>
              <Text variant="bodySmall" style={styles.cardTime}>
                {getRelativeTime(notification.created_at)}
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.cardMessage}>
              {notification.mensaje}
            </Text>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Notificaciones
        </Text>
        {unreadNotifications.length > 0 ? (
          <TouchableOpacity onPress={onMarkAllAsRead} activeOpacity={0.7}>
            <Text variant="labelLarge" style={styles.markAllText}>
              Marcar todas leídas
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeSubTab === 'nuevas' && styles.activeTabButton]}
          onPress={() => setActiveSubTab('nuevas')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <Text
              variant="titleMedium"
              style={[styles.tabText, activeSubTab === 'nuevas' && styles.activeTabText]}
            >
              Nuevas
            </Text>
            {unreadNotifications.length > 0 ? (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadNotifications.length}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeSubTab === 'leidas' && styles.activeTabButton]}
          onPress={() => setActiveSubTab('leidas')}
          activeOpacity={0.8}
        >
          <Text
            variant="titleMedium"
            style={[styles.tabText, activeSubTab === 'leidas' && styles.activeTabText]}
          >
            Leídas
          </Text>
        </TouchableOpacity>
      </View>

      {displayedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="bell-off-outline" size={80} color={theme.colors.outline} />
          </View>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No tienes notificaciones
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Te avisaremos cuando haya novedades sobre tus entregas o choferes.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {todayList.length > 0 ? (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionTitle}>
                HOY
              </Text>
              <View style={styles.cardsContainer}>
                {todayList.map(renderNotificationCard)}
              </View>
            </View>
          ) : null}

          {yesterdayList.length > 0 ? (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionTitle}>
                AYER Y ANTERIORES
              </Text>
              <View style={styles.cardsContainer}>
                {yesterdayList.map(renderNotificationCard)}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
    },
    headerTitle: {
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    markAllText: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      marginBottom: 10,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTabButton: {
      borderBottomColor: theme.colors.primary,
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tabText: {
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '800',
    },
    badgeContainer: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: theme.colors.onPrimary,
      fontSize: 11,
      fontWeight: '800',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    section: {
      marginTop: 14,
    },
    sectionTitle: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    cardsContainer: {
      gap: 12,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: radii.md,
      borderLeftWidth: 5,
      padding: 14,
      alignItems: 'flex-start',
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    contentWrapper: {
      flex: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    cardTitle: {
      fontWeight: '800',
      color: theme.colors.onSurface,
      flex: 1,
      marginRight: 8,
    },
    cardTime: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 11,
    },
    cardMessage: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
      lineHeight: 18,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingBottom: 80,
    },
    emptyIconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontWeight: '800',
      color: theme.colors.onSurface,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptySubtitle: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
