import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Snackbar,
  Text,
  useTheme,
  type MD3Theme,
} from 'react-native-paper';
import { LeafletMap } from '../components/organisms/LeafletMap';
import { supabase } from '../lib/supabase';

const initialRegion = {
  latitude: -27.4518,
  longitude: -58.9862,
};

const mockOrders = [
  {
    id: 'PR-1024',
    customer: 'Logística Norte',
    eta: '14:20',
    details: 'Entrega exprés de repuestos',
  },
  {
    id: 'PR-1058',
    customer: 'Distribuidora Central',
    eta: '15:00',
    details: 'Pedidos urgentes de almacén',
  },
  {
    id: 'PR-1103',
    customer: 'Comercial Oeste',
    eta: '15:45',
    details: 'Retiro de mercadería de 2 pallets',
  },
];

type Destination = {
  id?: number;
  provider_name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  duration?: number;
};

export function AdminMapScreen() {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  const [selectedDestination, setSelectedDestination] = useState<{ latitude: number; longitude: number }>();
  const [address, setAddress] = useState('');
  const [distanceText, setDistanceText] = useState('');
  const [durationText, setDurationText] = useState('');
  const [distanceValue, setDistanceValue] = useState<number | null>(null);
  const [durationValue, setDurationValue] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  });

  const selectedOrders = useMemo(() => {
    if (!selectedDestination) return [];
    return mockOrders.map((order, index) => ({
      ...order,
      eta: `~${14 + index}:0${index * 2}`,
    }));
  }, [selectedDestination]);

  useEffect(() => {
    fetchCurrentLocation();
    loadSavedDestinations();
  }, []);

  useEffect(() => {
    if (!selectedDestination) {
      setAddress('');
      setDistanceText('');
      setDurationText('');
      return;
    }

    fetchDestinationDetails(selectedDestination);
  }, [selectedDestination]);

  const fetchCurrentLocation = async () => {
    try {
      if (navigator?.geolocation?.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoadingLocation(false);
          },
          () => {
            setLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
        );
      } else {
        setLoadingLocation(false);
      }
    } catch (error) {
      console.warn('No se pudo obtener ubicación actual', error);
      setLoadingLocation(false);
    }
  };

  const loadSavedDestinations = async () => {
    setLoadingSaved(true);
    const { data, error } = await supabase
      .from('provider_destinations')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('loaded provider destinations:', { data, error });

    if (error) {
      setSaveError('No se pudieron cargar los destinos guardados.');
    } else {
      setSavedDestinations((data as Destination[]) || []);
    }
    setLoadingSaved(false);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      const json = await response.json();
      return json.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (error) {
      console.warn('Reverse geocoding failed', error);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const fetchOsrmRoute = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=false`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.code === 'Ok' && json.routes?.length) {
        return {
          distance: json.routes[0].distance,
          duration: json.routes[0].duration,
        };
      }

      console.warn('OSRM response error', json);
      return { distance: null, duration: null };
    } catch (error) {
      console.warn('OSRM fetch failed', error);
      return { distance: null, duration: null };
    }
  };

  const fetchDestinationDetails = async (destination: { latitude: number; longitude: number }) => {
    setLoadingDetails(true);
    setSaveError('');

    try {
      const resolvedAddress = await reverseGeocode(destination.latitude, destination.longitude);
      setAddress(resolvedAddress);

      const route = await fetchOsrmRoute(currentLocation, destination);
      if (route.distance !== null && route.duration !== null) {
        setDistanceValue(route.distance);
        setDurationValue(route.duration);
        setDistanceText(`${Math.round(route.distance)} m`);
        setDurationText(`${Math.round(route.duration)} seg`);
      } else {
        setDistanceValue(null);
        setDurationValue(null);
        setDistanceText('No disponible');
        setDurationText('No disponible');
      }
    } catch (error) {
      console.warn('Error fetching destination details', error);
      setAddress(`${destination.latitude.toFixed(5)}, ${destination.longitude.toFixed(5)}`);
      setDistanceText('No disponible');
      setDurationText('No disponible');
      setDistanceValue(null);
      setDurationValue(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMapPress = (coordinate: { latitude: number; longitude: number }) => {
    setSelectedDestination(coordinate);
    setToastOpen(false);
    setSaveError('');
  };

  const handleSaveDestination = async () => {
    if (!selectedDestination) return;

    setSaving(true);
    setSaveError('');

    const payload = {
      provider_name: 'Proveedor X',
      address: address || `${selectedDestination.latitude.toFixed(5)}, ${selectedDestination.longitude.toFixed(5)}`,
      latitude: selectedDestination.latitude,
      longitude: selectedDestination.longitude,
      distance: distanceValue ?? 0,
      duration: durationValue ?? 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('provider_destinations').insert([payload]);
    console.log('saveProviderDestination:', { payload, data, error });

    if (error) {
      setSaveError('No se pudo guardar el destino. Intentá nuevamente.');
      setSaving(false);
      return;
    }

    setToastMessage('Destino guardado ✅');
    setToastOpen(true);
    setSaving(false);
    loadSavedDestinations();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={styles.title}>
            Mapa de proveedores
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Toca el mapa para marcar un destino y guardarlo en Supabase.
          </Text>
        </View>
        <IconButton icon="filter-variant" iconColor={theme.colors.primary} onPress={() => undefined} size={28} />
      </View>

      <Card style={styles.mapCard} elevation={4}>
        <LeafletMap
          initialLat={initialRegion.latitude}
          initialLng={initialRegion.longitude}
          selectedLat={selectedDestination?.latitude}
          selectedLng={selectedDestination?.longitude}
          onMapPress={handleMapPress}
        />
      </Card>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.detailCard} elevation={3}>
          <Card.Title
            title="Destino seleccionado"
            subtitle={selectedDestination ? 'Revisa los datos antes de guardar.' : 'Toca el mapa para seleccionar un destino.'}
          />
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              Dirección
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {selectedDestination ? (loadingDetails ? 'Cargando...' : address || 'Dirección no disponible') : 'Sin destino seleccionado'}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text variant="labelLarge" style={styles.infoLabel}>
                  Distancia
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {selectedDestination ? (loadingDetails ? '...' : distanceText || 'No disponible') : '-'}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text variant="labelLarge" style={styles.infoLabel}>
                  Tiempo
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {selectedDestination ? (loadingDetails ? '...' : durationText || 'No disponible') : '-'}
                </Text>
              </View>
            </View>

            <Text variant="labelLarge" style={styles.label}>
              Pedidos próximos
            </Text>
            {selectedDestination ? (
              selectedOrders.map((order) => (
                <View key={order.id} style={styles.orderRow}>
                  <View>
                    <Text variant="bodyMedium" style={styles.orderTitle}>
                      {order.customer}
                    </Text>
                    <Text variant="bodySmall" style={styles.orderSubtitle}>
                      {order.details}
                    </Text>
                  </View>
                  <Text variant="labelLarge" style={styles.orderEta}>
                    {order.eta}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="bodySmall" style={styles.helpText}>
                Elige un destino en el mapa para ver pedidos ficticios.
              </Text>
            )}

            {saveError ? <Text variant="bodySmall" style={styles.errorText}>{saveError}</Text> : null}
          </Card.Content>
          <Card.Actions style={styles.actionRow}>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              onPress={handleSaveDestination}
              disabled={!selectedDestination || saving}
              loading={saving}
              style={styles.saveButton}
            >
              Guardar destino
            </Button>
          </Card.Actions>
        </Card>

        <View style={styles.savedHeader}>
          <Text variant="titleMedium">Destinos guardados</Text>
          <Text variant="bodySmall" style={styles.savedSubtext}>
            {loadingSaved ? 'Cargando...' : `${savedDestinations.length} guardados`}
          </Text>
        </View>

        {savedDestinations.length === 0 ? (
          <Card style={styles.savedCard} elevation={2}>
            <Card.Content>
              <Text variant="bodyMedium">No hay destinos guardados aún.</Text>
            </Card.Content>
          </Card>
        ) : (
          savedDestinations.map((destination, index) => (
            <Card key={`${destination.address}-${index}`} style={styles.savedCard} elevation={2}>
              <Card.Title
                title={destination.provider_name}
                subtitle={destination.address}
                left={(props) => <Avatar.Icon {...props} icon="map-marker" />}
              />
              <Card.Content>
                <View style={styles.savedInfoRow}>
                  <Text variant="bodySmall">Lat: {destination.latitude.toFixed(5)}</Text>
                  <Text variant="bodySmall">Lng: {destination.longitude.toFixed(5)}</Text>
                </View>
                <View style={styles.savedInfoRow}>
                  <Text variant="bodySmall">Distancia: {destination.distance ? `${Math.round(destination.distance)} m` : 'N/D'}</Text>
                  <Text variant="bodySmall">Tiempo: {destination.duration ? `${Math.round(destination.duration)} seg` : 'N/D'}</Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Snackbar visible={toastOpen} onDismiss={() => setToastOpen(false)} duration={3000}>
        {toastMessage}
      </Snackbar>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontWeight: '700',
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      maxWidth: '80%',
    },
    mapCard: {
      marginHorizontal: 16,
      height: 400,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    map: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
      paddingBottom: 24,
    },
    detailCard: {
      borderRadius: 22,
      overflow: 'hidden',
    },
    label: {
      marginTop: 16,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    value: {
      marginTop: 6,
      color: theme.colors.onSurface,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    infoBox: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      padding: 12,
    },
    infoLabel: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    orderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    orderTitle: {
      fontWeight: '600',
    },
    orderSubtitle: {
      color: theme.colors.onSurfaceVariant,
    },
    orderEta: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    helpText: {
      marginTop: 12,
      color: theme.colors.onSurfaceVariant,
    },
    actionRow: {
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    saveButton: {
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: 12,
    },
    savedHeader: {
      paddingHorizontal: 4,
      marginTop: 8,
    },
    savedSubtext: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    savedCard: {
      borderRadius: 20,
      marginTop: 10,
    },
    savedInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    mapErrorOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      padding: 16,
    },
    mapErrorText: {
      color: theme.colors.onSurface,
      textAlign: 'center',
      fontWeight: '700',
    },
  });
