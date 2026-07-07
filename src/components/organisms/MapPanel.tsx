import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, Portal, Dialog, Button, IconButton, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MarkerNode, UserAvatar } from '../atoms';
import { RouteProgress } from '../molecules';
import { useMapPanel } from '../../hooks/map/useMapPanel';
import { MAP_INITIAL_REGION } from '../../utils/map/mapPanel';
import { type AppWorkspace, normalizeOrderStatus } from '../../types/workspace';

interface MapPanelProps {
  workspace: AppWorkspace;
  initialFocusOrderId?: string | null;
}

export function MapPanel({ workspace, initialFocusOrderId }: MapPanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const mapRef = useRef<MapView>(null);
  const {
    activeDriverName,
    activeDriversOnMap,
    completedOrders,
    driverCoordinate,
    mapData,
    menuVisible,
    selectedDriverId,
    selectedMapOrder,
    setMenuVisible,
    setSelectedDriverId,
    setSelectedMapOrderId,
    streetCoordinates,
    isChofer,
  } = useMapPanel({ workspace, initialFocusOrderId });

  const drivers = workspace.drivers || [];

  const centerOnDriver = () => {
    if (mapRef.current && (isChofer || selectedDriverId) && mapData.length > 0) {
      mapRef.current.animateToRegion({
        latitude: driverCoordinate.latitude,
        longitude: driverCoordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {isChofer ? (
          <View style={styles.driverInfoCard}>
            <View>
              <Text variant="labelLarge" style={styles.infoLabel}>CHOFER SELECCIONADO</Text>
              <Text variant="titleMedium" style={styles.driverName}>{activeDriverName}</Text>
              <Text variant="bodySmall" style={styles.vehicleInfo}>Vehículo: ABC123</Text>
            </View>
          </View>
        ) : (
          <View style={styles.adminHeader}>
            <Text variant="titleMedium" style={styles.adminTitle}>Seleccione un chofer</Text>
            <View style={styles.dropdownContainer}>
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                icon="chevron-down"
                contentStyle={styles.dropdownContent}
                style={styles.dropdownButton}
              >
                {selectedDriverId
                  ? drivers.find((d) => d.id === selectedDriverId)?.nombre
                  : 'Todos los choferes'}
              </Button>

              <Portal>
                <Dialog visible={menuVisible} onDismiss={() => setMenuVisible(false)} style={styles.dialog}>
                  <Dialog.Title style={styles.dialogTitle}>Seleccionar Chofer</Dialog.Title>
                  <Dialog.Content style={styles.dialogContent}>
                    <FlatList
                      data={drivers}
                      keyExtractor={(item) => item.id}
                      style={styles.dialogScroll}
                      ListHeaderComponent={
                        <TouchableOpacity
                          style={styles.dialogRow}
                          onPress={() => {
                            setSelectedDriverId(null);
                            setMenuVisible(false);
                          }}
                        >
                          <View style={styles.avatarPlaceholder}>
                            <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.primary} />
                          </View>
                          <View style={styles.dialogInfo}>
                            <Text variant="titleSmall" style={styles.dialogName}>Todos los choferes</Text>
                            <Text variant="bodySmall" style={styles.dialogSub}>Visualizar mapa general</Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.outline} />
                        </TouchableOpacity>
                      }
                      renderItem={({ item: driver }) => (
                        <TouchableOpacity
                          style={styles.dialogRow}
                          onPress={() => {
                            setSelectedDriverId(driver.id);
                            setMenuVisible(false);
                          }}
                        >
                          <UserAvatar name={driver.nombre} size={36} style={styles.avatar} />
                          <View style={styles.dialogInfo}>
                            <Text variant="titleSmall" style={styles.dialogName}>{driver.nombre}</Text>
                            <Text variant="bodySmall" style={styles.dialogSub}>{driver.activo ? 'Activo' : 'Inactivo'}</Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.outline} />
                        </TouchableOpacity>
                      )}
                    />
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button onPress={() => setMenuVisible(false)}>Cancelar</Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </View>
          </View>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          onPress={() => setSelectedMapOrderId(null)}
          initialRegion={MAP_INITIAL_REGION}
        >
          {(isChofer || selectedDriverId) && streetCoordinates.length > 1 ? (
            <Polyline
              coordinates={streetCoordinates}
              strokeColor={theme.colors.primary}
              strokeWidth={3}
            />
          ) : null}

          {mapData.map((order, idx) => (
            <Marker
              key={order.id}
              coordinate={{
                latitude: Number(order.latitud),
                longitude: Number(order.longitud),
              }}
              zIndex={1}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedMapOrderId(order.id);
              }}
            >
              <MarkerNode index={idx + 1} status={normalizeOrderStatus(order.estado)} showIconOnly={!isChofer && !selectedDriverId} />
            </Marker>
          ))}

          {!isChofer && !selectedDriverId && activeDriversOnMap.map((drv) => (
            <Marker
              key={drv.id}
              coordinate={drv.coordinate}
              title={`Chofer: ${drv.nombre}`}
              flat
              zIndex={100}
            >
              <MarkerNode isDriver />
            </Marker>
          ))}

          {(isChofer || selectedDriverId) && mapData.length > 0 ? (
            <Marker
              coordinate={driverCoordinate}
              title="Chofer en camino"
              flat
              zIndex={100}
            >
              <MarkerNode isDriver />
            </Marker>
          ) : null}
        </MapView>

        {(isChofer || selectedDriverId) && mapData.length > 0 ? (
          <IconButton
            icon="truck-delivery"
            mode="contained"
            containerColor={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
            size={28}
            onPress={centerOnDriver}
            style={styles.fabCenter}
          />
        ) : null}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.tertiary }]} />
          <Text variant="bodySmall" style={styles.legendText}>Pendiente</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text variant="bodySmall" style={styles.legendText}>En camino</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
          <Text variant="bodySmall" style={styles.legendText}>Entregada</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotDriver]} />
          <Text variant="bodySmall" style={styles.legendText}>Chofer</Text>
        </View>
      </View>

      {((isChofer || selectedDriverId) || selectedMapOrder) ? (
        <View style={styles.bottomInfoContainer}>
          {(isChofer || selectedDriverId) ? (
            <RouteProgress completed={completedOrders.length} total={mapData.length} />
          ) : null}
          {selectedMapOrder ? (
            <Surface style={styles.selectedOrderCard} elevation={1}>
              <View style={styles.selectedOrderHeader}>
                <View style={styles.selectedOrderTitleBox}>
                  <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
                  <Text variant="titleSmall" style={styles.selectedOrderAddress} numberOfLines={1}>
                    {String(selectedMapOrder.direccion_destino || '')}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={16}
                  style={styles.closeCardBtn}
                  onPress={() => setSelectedMapOrderId(null)}
                />
              </View>
              <View style={styles.selectedOrderBody}>
                <Text variant="bodySmall" style={styles.selectedOrderText}>
                  Cliente: <Text style={styles.boldText}>{String(selectedMapOrder.cliente || '')}</Text>
                </Text>
                <Text variant="bodySmall" style={styles.selectedOrderText}>
                  Producto: {String(selectedMapOrder.producto || '')}
                </Text>
              </View>
            </Surface>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    driverInfoCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    infoLabel: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: 'bold',
      fontSize: 10,
      letterSpacing: 0.5,
    },
    driverName: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    vehicleInfo: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },
    adminHeader: {
      paddingVertical: 4,
    },
    adminTitle: {
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    dropdownContainer: {
      marginTop: 8,
      alignSelf: 'stretch',
    },
    dropdownContent: {
      flexDirection: 'row-reverse',
    },
    dropdownButton: {
      borderRadius: 8,
      borderColor: theme.colors.outline,
    },
    mapContainer: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    legendDotDriver: {
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    legendText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },
    bottomInfoContainer: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingBottom: 8,
    },
    selectedOrderCard: {
      padding: 14,
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    selectedOrderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    selectedOrderTitleBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    selectedOrderAddress: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      flex: 1,
    },
    closeCardBtn: {
      margin: 0,
      padding: 0,
    },
    selectedOrderBody: {
      gap: 2,
      paddingLeft: 22,
    },
    selectedOrderText: {
      color: theme.colors.onSurfaceVariant,
    },
    boldText: {
      fontWeight: '700',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyLabel: {
      marginTop: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      fontSize: 14,
    },
    avatarPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceVariant,
    },
    dialog: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    dialogTitle: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    dialogContent: {
      maxHeight: 300,
    },
    dialogScroll: {
      gap: 8,
    },
    dialogRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    dialogInfo: {
      flex: 1,
    },
    dialogName: {
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    dialogSub: {
      color: theme.colors.onSurfaceVariant,
    },
    avatar: {
      marginRight: 12,
    },
    fabCenter: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      elevation: 4,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
