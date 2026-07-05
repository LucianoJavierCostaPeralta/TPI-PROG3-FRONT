import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, Menu, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type AppWorkspace, getDeliveryCoordinates, normalizeOrderStatus, fetchStreetRoute } from '../../types/workspace';
import { MarkerNode } from '../atoms';
import { RouteProgress, NextStopCard } from '../molecules';

interface MapPanelProps {
  workspace: AppWorkspace;
}

export function MapPanel({ workspace }: MapPanelProps) {
  const role = workspace.profile.rol;
  const isChofer = role === 'chofer';

  const mapRef = useRef<MapView>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // ID del chofer seleccionado (usado únicamente si el rol es administrador)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Estado para la ruta que sigue las calles reales
  const [streetCoordinates, setStreetCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  // 1. Obtener choferes disponibles
  const drivers = workspace.drivers || [];

  // 2. Filtrar y ordenar los pedidos para la visualización del mapa
  const mapData = useMemo(() => {
    let ordersToDisplay = workspace.orders || [];

    // Si es chofer, solo ve sus pedidos
    if (isChofer) {
      ordersToDisplay = ordersToDisplay.filter(o => o.chofer_id === workspace.profile.id);
    } else if (selectedDriverId) {
      // Si es admin y seleccionó un chofer específico
      ordersToDisplay = ordersToDisplay.filter(o => o.chofer_id === selectedDriverId);
    }

    // Ordenar de forma secuencial por orden_ruta
    const sorted = [...ordersToDisplay].sort(
      (a, b) => (Number(a.orden_ruta) || 0) - (Number(b.orden_ruta) || 0)
    );

    // Enriquecer cada pedido con coordenadas simuladas
    return sorted.map((order, index) => {
      const coords = getDeliveryCoordinates(order, index);
      return {
        ...order,
        latitud: coords.latitude,
        longitud: coords.longitude,
      };
    });
  }, [workspace.orders, workspace.profile.id, isChofer, selectedDriverId]);

  // Coordenadas para la línea de la ruta
  const routeCoordinates = useMemo(() => {
    return mapData.map(o => ({
      latitude: Number(o.latitud),
      longitude: Number(o.longitud),
    }));
  }, [mapData]);

  // Consultar la API de OSRM para trazar las calles reales
  useEffect(() => {
    let active = true;
    if (routeCoordinates.length >= 2) {
      fetchStreetRoute(routeCoordinates).then(points => {
        if (!active) return;
        if (points.length > 0) {
          setStreetCoordinates(points);
        } else {
          // Fallback a líneas rectas por seguridad (sin internet / error API)
          setStreetCoordinates(routeCoordinates);
        }
      });
    } else {
      setStreetCoordinates([]);
    }
    return () => {
      active = false;
    };
  }, [routeCoordinates]);

  // Separar pedidos completados vs pendientes
  const completedOrders = useMemo(() => {
    return mapData.filter(o => normalizeOrderStatus(o.estado) === 'realizado');
  }, [mapData]);

  const pendingOrders = useMemo(() => {
    return mapData.filter(o => normalizeOrderStatus(o.estado) !== 'realizado');
  }, [mapData]);

  // Posición simulada del chofer: cerca de la primera parada pendiente
  const driverCoordinate = useMemo(() => {
    if (pendingOrders.length > 0) {
      const firstPending = pendingOrders[0];
      return {
        latitude: Number(firstPending.latitud) - 0.0018,
        longitude: Number(firstPending.longitud) - 0.0015,
      };
    }
    // Si no hay pendientes, en la última completada
    if (mapData.length > 0) {
      const last = mapData[mapData.length - 1];
      return {
        latitude: Number(last.latitud),
        longitude: Number(last.longitud),
      };
    }
    return { latitude: -27.4511, longitude: -58.9866 };
  }, [mapData, pendingOrders]);

  // Nombre del chofer activo
  const activeDriverName = useMemo(() => {
    if (isChofer) return workspace.profile.nombre;
    if (selectedDriverId) {
      const drv = drivers.find(d => d.id === selectedDriverId);
      return drv ? drv.nombre : 'Chofer seleccionado';
    }
    return null;
  }, [isChofer, selectedDriverId, workspace.profile.nombre, drivers]);

  // Centrar cámara en el chofer
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
            <MaterialCommunityIcons name="chevron-down" size={24} color="#7C7C7C" />
          </View>
        ) : (
          <View style={styles.adminHeader}>
            <Text variant="titleMedium" style={styles.adminTitle}>Seguimiento de Choferes</Text>
            <View style={styles.dropdownContainer}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
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
                }
              >
                <Menu.Item
                  onPress={() => {
                    setSelectedDriverId(null);
                    setMenuVisible(false);
                  }}
                  title="Todos los choferes"
                />
                {drivers.map(d => (
                  <Menu.Item
                    key={d.id}
                    onPress={() => {
                      setSelectedDriverId(d.id);
                      setMenuVisible(false);
                    }}
                    title={d.nombre}
                  />
                ))}
              </Menu>
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
          initialRegion={{
            latitude: -27.4511,
            longitude: -58.9866,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
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
              title={String(order.cliente)}
              description={String(order.direccion_destino || 'Destino')}
              zIndex={1}
            >
              <MarkerNode
                index={idx + 1}
                status={normalizeOrderStatus(order.estado)}
              />
            </Marker>
          ))}

          {/* MARCADOR DEL CHOFER */}
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
        {(isChofer || selectedDriverId) && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2196F3', borderRadius: 2 }]} />
            <Text variant="bodySmall" style={styles.legendText}>Chofer</Text>
          </View>
        )}
      </View>

      {/* DETALLES E INDICADORES DE RUTA */}
      {(isChofer || selectedDriverId) ? (
        <ScrollView style={styles.infoScroll}>
          <RouteProgress completed={completedOrders.length} total={mapData.length} />
          <NextStopCard pendingOrders={pendingOrders} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="map-marker-path" size={48} color="#CCCCCC" />
          <Text style={styles.emptyLabel}>Selecciona un chofer para visualizar su ruta individual</Text>
        </View>
      )}
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
    height: 320,
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
  infoScroll: {
    flex: 1,
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
});