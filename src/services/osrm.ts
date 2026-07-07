import axios from 'axios';

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export async function fetchStreetRoute(coordinates: RouteCoordinate[]) {
  if (coordinates.length < 2) return [];

  const coordsQuery = coordinates.map((c) => String(c.longitude) + ',' + String(c.latitude)).join(';');
  const url = 'https://router.project-osrm.org/route/v1/driving/' + coordsQuery + '?overview=full&geometries=geojson';

  try {
    const { data } = await axios.get(url, { timeout: 8000 });

    if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
      const routePoints = data.routes[0].geometry.coordinates;
      return routePoints.map(([lng, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      }));
    }
  } catch (error) {
    console.error('Error al obtener la ruta de calles de OSRM:', error);
  }

  return [];
}
