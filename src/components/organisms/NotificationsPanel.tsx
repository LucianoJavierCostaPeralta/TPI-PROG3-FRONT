import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, radii, palette } from '../../styles/theme';
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

  // Agrupamiento por hoy y ayer/anteriores
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

  const getAlertColor = (tipo: AppNotification['tipo']) => {
    switch (tipo) {
      case 'warning':
        return palette.warning;
      case 'error':
        return palette.error;
      case 'success':
        return palette.success;
      case 'info':
      default:
        return palette.secondary;
    }
  };

  const getAlertBg = (tipo: AppNotification['tipo']) => {
    switch (tipo) {
      case 'warning':
        return '#FFFBEB'; // amarillo claro
      case 'error':
        return '#FEF2F2'; // rojo claro
      case 'success':
        return '#F0FDF4'; // verde claro
      case 'info':
      default:
        return '#EFF6FF'; // azul claro
    }
  };

  const getAlertIcon = (tipo: AppNotification['tipo']) => {
    switch (tipo) {
      case 'warning':
        return 'alert-outline';
      case 'error':
        return 'close-circle-outline';
      case 'success':
        return 'check-circle-outline';
      case 'info':
      default:
        return 'information-outline';
    }
  };

  const renderNotificationCard = (notification: AppNotification) => {
    const color = getAlertColor(notification.tipo);
    const bg = getAlertBg(notification.tipo);
    const icon = getAlertIcon(notification.tipo);

    return (
      <TouchableOpacity
        key={notification.id}
        activeOpacity={0.8}
        onPress={() => !notification.leida && onMarkAsRead(notification.id)}
      >
        <Surface style={[styles.card, { borderLeftColor: color }]} elevation={1}>
          <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
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
      {/* Header local del panel */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Notificaciones
        </Text>
        {unreadNotifications.length > 0 && (
          <TouchableOpacity onPress={onMarkAllAsRead} activeOpacity={0.7}>
            <Text variant="labelLarge" style={styles.markAllText}>
              Marcar todas leídas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
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
            {unreadNotifications.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadNotifications.length}</Text>
              </View>
            )}
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

      {/* Listado */}
      {displayedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="bell-off-outline" size={80} color="#D1D5DB" />
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
          {todayList.length > 0 && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionTitle}>
                HOY
              </Text>
              <View style={styles.cardsContainer}>
                {todayList.map(renderNotificationCard)}
              </View>
            </View>
          )}

          {yesterdayList.length > 0 && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionTitle}>
                AYER Y ANTERIORES
              </Text>
              <View style={styles.cardsContainer}>
                {yesterdayList.map(renderNotificationCard)}
              </View>
            </View>
          )}
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
      color: palette.secondary,
      fontWeight: '700',
    },
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
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
      borderBottomColor: palette.secondary,
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tabText: {
      fontWeight: '600',
      color: '#6B7280',
    },
    activeTabText: {
      color: palette.secondary,
      fontWeight: '800',
    },
    badgeContainer: {
      backgroundColor: palette.secondary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: '#FFFFFF',
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
      color: '#9CA3AF',
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    cardsContainer: {
      gap: 12,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
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
      color: '#9CA3AF',
      fontSize: 11,
    },
    cardMessage: {
      color: '#4B5563',
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
      backgroundColor: '#F3F4F6',
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
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 20,
    },
  });
