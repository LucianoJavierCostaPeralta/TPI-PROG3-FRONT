import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, Portal, Dialog, Button, IconButton, Surface } from 'react-native-paper';
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
      {/* SECCIÓN CABECERA */}
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
                contentStyle={{ flexDirection: 'row-reverse' }}
                style={styles.dropdownButton}
              >
                {selectedDriverId 
                  ? drivers.find(d => d.id === selectedDriverId)?.nombre 
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
                            <MaterialCommunityIcons name="account-group" size={20} color="#2196F3" />
                          </View>
                          <View style={styles.dialogInfo}>
                            <Text variant="titleSmall" style={styles.dialogName}>Todos los choferes</Text>
                            <Text variant="bodySmall" style={styles.dialogSub}>Visualizar mapa general</Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
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
                          <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
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

      {/* EL MAPA */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          onPress={() => setSelectedMapOrderId(null)}
          initialRegion={MAP_INITIAL_REGION}
        >
          {/* POLILÍNEA DE RUTA (Líneas que siguen calles reales) */}
          {(isChofer || selectedDriverId) && streetCoordinates.length > 1 && (
            <Polyline
              coordinates={streetCoordinates}
              strokeColor="#2196F3"
              strokeWidth={3}
            />
          )}

          {/* MARCADORES DE ENTREGAS */}
          {mapData.map((order, idx) => (
            <Marker
              key={order.id}
              coordinate={{
                latitude: Number(order.latitud),
                longitude: Number(order.longitud)
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

          {/* MARCADORES DE CHOFERES GENERALES (Máximo 3) */}
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

          {/* MARCADOR DEL CHOFER INDIVIDUAL */}
          {(isChofer || selectedDriverId) && mapData.length > 0 && (
            <Marker
              coordinate={driverCoordinate}
              title="Chofer en camino"
              flat
              zIndex={100}
            >
              <MarkerNode isDriver />
            </Marker>
          )}
        </MapView>

        {/* BOTÓN FLOTANTE PARA CENTRAR CÁMARA EN EL CAMIÓN */}
        {(isChofer || selectedDriverId) && mapData.length > 0 && (
          <IconButton
            icon="truck-delivery"
            mode="contained"
            containerColor="#2196F3"
            iconColor="#FFFFFF"
            size={28}
            onPress={centerOnDriver}
            style={styles.fabCenter}
          />
        )}
      </View>

      {/* LEYENDA DEL MAPA */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text variant="bodySmall" style={styles.legendText}>Pendiente</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
          <Text variant="bodySmall" style={styles.legendText}>En camino</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text variant="bodySmall" style={styles.legendText}>Entregada</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196F3', borderRadius: 2 }]} />
          <Text variant="bodySmall" style={styles.legendText}>Chofer</Text>
        </View>
      </View>

      {/* DETALLES E INDICADORES DE RUTA */}
      {/* DETALLES E INDICADORES DE RUTA */}
      {((isChofer || selectedDriverId) || selectedMapOrder) ? (
        <View style={styles.bottomInfoContainer}>
          {(isChofer || selectedDriverId) && (
            <RouteProgress completed={completedOrders.length} total={mapData.length} />
          )}
          {selectedMapOrder && (
            <Surface style={styles.selectedOrderCard} elevation={1}>
              <View style={styles.selectedOrderHeader}>
                <View style={styles.selectedOrderTitleBox}>
                  <MaterialCommunityIcons name="map-marker" size={18} color="#2196F3" />
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
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  driverInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoLabel: {
    color: '#7C7C7C',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  driverName: {
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  vehicleInfo: {
    color: '#7C7C7C',
    fontSize: 12,
  },
  adminHeader: {
    paddingVertical: 4,
  },
  adminTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 13,
    color: '#1C1B1F',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  legendText: {
    color: '#555555',
    fontSize: 12,
  },
  bottomInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 8,
  },
  selectedOrderCard: {
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#1C1B1F',
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
    color: '#475569',
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
    color: '#7C7C7C',
    textAlign: 'center',
    fontSize: 14,
  },
  dropdownContainer: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  dropdownButton: {
    borderRadius: 8,
    borderColor: '#CCCCCC',
  },
  fabCenter: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  dialogTitle: {
    fontWeight: '700',
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
    borderBottomColor: '#E2E8F0',
  },
  dialogInfo: {
    flex: 1,
  },
  dialogName: {
    fontWeight: '600',
    color: '#1C1B1F',
  },
  dialogSub: {
    color: '#7C7C7C',
  },
  avatar: {
    marginRight: 12,
  },
});