import { useEffect, useMemo, useState } from 'react';
import { type AppWorkspace, ORDER_STATUS } from '../../types/workspace';
import { fetchStreetRoute, type RouteCoordinate } from '../../services/osrm';
import {
  buildMapOrders,
  getActiveDriverName,
  getActiveDriversOnMap,
  getCompletedMapOrders,
  getMapDriverCoordinate,
  getMapSelectedOrder,
  type MapDriverPin,
  type MapOrder,
} from '../../utils/map/mapPanel';

type UseMapPanelParams = {
  workspace: AppWorkspace;
  initialFocusOrderId?: string | null;
};

export function useMapPanel({ workspace, initialFocusOrderId }: UseMapPanelParams) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedMapOrderId, setSelectedMapOrderId] = useState<string | null>(null);
  const [streetCoordinates, setStreetCoordinates] = useState<RouteCoordinate[]>([]);

  const mapData = useMemo<MapOrder[]>(
    () => buildMapOrders(workspace, selectedDriverId),
    [workspace, selectedDriverId]
  );

  const completedOrders = useMemo(() => getCompletedMapOrders(mapData), [mapData]);
  const selectedMapOrder = useMemo(
    () => getMapSelectedOrder(mapData, selectedMapOrderId),
    [mapData, selectedMapOrderId]
  );
  const driverCoordinate = useMemo(() => getMapDriverCoordinate(mapData), [mapData]);
  const activeDriversOnMap = useMemo<MapDriverPin[]>(
    () => getActiveDriversOnMap(workspace, selectedDriverId),
    [workspace, selectedDriverId]
  );
  const activeDriverName = useMemo(
    () => getActiveDriverName(workspace, selectedDriverId),
    [workspace, selectedDriverId]
  );

  const routeCoordinates = useMemo<RouteCoordinate[]>(
    () => mapData.map((order) => ({
      latitude: Number(order.latitud),
      longitude: Number(order.longitud),
    })),
    [mapData]
  );

  useEffect(() => {
    if (initialFocusOrderId) {
      setSelectedMapOrderId(initialFocusOrderId);
      return;
    }

    const activeOrder = mapData.find(
      (order) => order.estado_id === ORDER_STATUS.ACCEPTED || order.estado_id === ORDER_STATUS.ON_THE_WAY
    );

    if (activeOrder) {
      setSelectedMapOrderId(activeOrder.id);
    }
  }, [initialFocusOrderId, mapData]);

  useEffect(() => {
    let active = true;

    if (routeCoordinates.length >= 2) {
      fetchStreetRoute(routeCoordinates).then((points) => {
        if (!active) return;
        setStreetCoordinates(points.length > 0 ? points : routeCoordinates);
      });
    } else {
      setStreetCoordinates([]);
    }

    return () => {
      active = false;
    };
  }, [routeCoordinates]);

  return {
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
    isChofer: workspace.profile.rol === 'chofer',
  };
}
